import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { TEMPLATES } from '../_shared/transactional-email-templates/registry.ts'
import { z } from 'npm:zod@3.25.76'
import { resolveAddressForm } from '../_shared/salutation.ts'
import { returnReminderContent } from '../_shared/return-reminder-content.ts'
import { sendReturnReminder, ReminderSendError } from '../_shared/return-reminder-resend.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables')
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  // Parse request body
  let templateName: string
  let recipientEmail: string
  let messageId: string
  let templateData: Record<string, any> = {}
  let reminder: Record<string, any> | undefined
  let replyTo: string | undefined
  const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  try {
    const body = await req.json()
    const parsed = z.object({ inquiryId: z.string().uuid(), action: z.enum(['status','preview','send']), stage: z.union([z.literal(1),z.literal(2)]).optional(), expectedEmail: z.string().email().max(255).optional(), noResponseConfirmed: z.boolean().optional() }).strict().safeParse(body)
    if (!parsed.success) return json({ error: 'Ungültige Erinnerungsanfrage' }, 400)
    const authorization = req.headers.get('Authorization') ?? ''
    const client = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: authorization } } })
    const { data: { user }, error: authError } = await client.auth.getUser(authorization.replace(/^Bearer\s+/i, ''))
    if (authError || !user) return json({ error: 'Bitte erneut anmelden' }, 401)
    const svc = createClient(supabaseUrl, supabaseServiceKey)
    const { data: inquiry, error: readError } = await svc.from('rental_inquiries').select('*').eq('id', parsed.data.inquiryId).single()
    if (readError || !inquiry) return json({ error: 'Auftrag nicht gefunden' }, 404)
    const { data: permitted, error: permissionError } = await svc.rpc('can_send_rental_return_reminder', { _actor: user.id, _location: inquiry.location })
    if (permissionError || !permitted) return json({ error: 'Keine Berechtigung für Rückgabeerinnerungen an diesem Standort' }, 403)
    const { data: history, error: historyError } = await svc.from('rental_return_reminders').select('*').eq('rental_inquiry_id', inquiry.id).order('stage')
    if (historyError) return json({ error: 'Versandverlauf konnte nicht geladen werden' }, 500)
    const deliveries = []
    for (const h of history ?? []) {
      const { data: log, error: logError } = await svc.from('email_send_log').select('status,created_at').eq('message_id', h.message_id).order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (logError) return json({ error: 'Versandstatus konnte nicht geprüft werden' }, 500)
      deliveries.push({ ...h, status: log?.status ?? h.status, sent_at: log?.status === 'sent' ? log.created_at : null })
    }
    if (parsed.data.action === 'status') return json({ deliveries, recipientEmail: inquiry.customer_email })
    const { stage, expectedEmail, noResponseConfirmed } = parsed.data
    if (!stage || !expectedEmail) return json({ error: 'Stufe und Kundenadresse fehlen' }, 400)
    if (expectedEmail.trim().toLowerCase() !== String(inquiry.customer_email).trim().toLowerCase()) return json({ error: 'Kundenadresse geändert. Bitte neu laden' }, 409)
    const form = await resolveAddressForm(svc, inquiry)
    const content = returnReminderContent(stage, inquiry.customer_name ?? '', form)
    templateData = { stage, ...content, orderCode: inquiry.order_code, productName: inquiry.product_name, endDate: inquiry.end_date, replyTo: inquiry.location_email }
    if (parsed.data.action === 'preview') return json({ ...content, recipientEmail: inquiry.customer_email, orderCode: inquiry.order_code })
    const { data: claim, error: claimError } = await client.rpc('claim_rental_return_reminder', { _inquiry: inquiry.id, _stage: stage, _expected_email: expectedEmail, _no_response: noResponseConfirmed ?? false })
    if (claimError || !claim?.delivery) return json({ error: claimError?.message ?? 'Versand konnte nicht vorbereitet werden' }, 409)
    reminder = claim.delivery
    if (claim.already_queued) return json({ success: true, alreadyQueued: true, sent: reminder?.status === 'sent' })
    const snapshot = reminder?.customer_snapshot ?? {}
    templateData = { stage, ...returnReminderContent(stage, snapshot.name ?? '', form), orderCode: snapshot.order_code, productName: snapshot.product_name, endDate: new Date(`${snapshot.end_date}T12:00:00Z`).toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' }), replyTo: reminder?.reply_to }
    templateName = 'rental-return-reminder'
    recipientEmail = reminder?.recipient_email
    replyTo = reminder?.reply_to
    messageId = reminder?.message_id
  } catch {
    return new Response(
      JSON.stringify({ error: 'Die Erinnerung konnte nicht vorbereitet werden' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  if (!templateName) {
    return new Response(
      JSON.stringify({ error: 'templateName is required' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  // 1. Look up template from registry (early — needed to resolve recipient)
  const template = TEMPLATES[templateName]

  if (!template) {
    console.error('Template not found in registry', { templateName })
    return new Response(
      JSON.stringify({
        error: `Template '${templateName}' not found. Available: ${Object.keys(TEMPLATES).join(', ')}`,
      }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  // Resolve effective recipient: template-level `to` takes precedence over
  // the caller-provided recipientEmail. This allows notification templates
  // to always send to a fixed address (e.g., site owner from env var).
  const effectiveRecipient = template.to || recipientEmail

  if (!effectiveRecipient) {
    return new Response(
      JSON.stringify({
        error: 'recipientEmail is required (unless the template defines a fixed recipient)',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  // Create Supabase client with service role (bypasses RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // 4. Render React Email template to HTML and plain text
  const html = await renderAsync(
    React.createElement(template.component, templateData)
  )
  const plainText = await renderAsync(
    React.createElement(template.component, templateData),
    { plainText: true }
  )

  // Resolve subject — supports static string or dynamic function
  const resolvedSubject =
    typeof template.subject === 'function'
      ? template.subject(templateData)
      : template.subject

  // This endpoint is exclusively for manual return reminders. Existing mail settings stay untouched.
  const key = Deno.env.get('RESEND_API_KEY')
  if (!key) return json({ error: 'Resend-Versand ist nicht konfiguriert' }, 503)
  const log = async (status: string, error_message?: string, metadata?: Record<string, unknown>) => {
    const { error } = await supabase.from('email_send_log').insert({ message_id: messageId, template_name: templateName, recipient_email: effectiveRecipient, status, error_message, metadata: { provider: 'resend', ...metadata } })
    if (error) throw new Error('Versandbeleg konnte nicht gespeichert werden')
  }
  // Never bypass an existing recipient suppression.
  const { data: suppressed, error: suppressionError } = await supabase.from('suppressed_emails').select('id').eq('email', effectiveRecipient.toLowerCase()).limit(1).maybeSingle()
  if (suppressionError) return json({ error: 'Empfängersperre konnte nicht geprüft werden' }, 503)
  if (suppressed) {
    await log('suppressed')
    await supabase.from('rental_return_reminders').update({ status: 'suppressed' }).eq('id', reminder?.id)
    return json({ success: false, reason: 'email_suppressed' })
  }
  if (!reminder?.id || !replyTo) return json({ error: 'Erinnerungsbeleg unvollständig' }, 500)
  // Set queued before dispatch: uncertain delivery remains blocked, never blindly resent.
  const { error: pendingError } = await supabase.from('rental_return_reminders').update({ status: 'queued', queued_at: new Date().toISOString() }).eq('id', reminder.id)
  if (pendingError) return json({ error: 'Versand konnte nicht sicher vorbereitet werden' }, 500)
  try {
    await log('pending')
    const providerId = await sendReturnReminder(key, {
      deliveryId: reminder.id,
      from: `SLT Rental <noreply@${Deno.env.get('RESEND_DOMAIN') || 'slt-rental.de'}>`,
      recipient: effectiveRecipient, replyTo, subject: resolvedSubject, html, text: plainText,
    })
    await log('sent', undefined, { provider_id: providerId, reply_to: replyTo })
    const { error: savedError } = await supabase.from('rental_return_reminders').update({ status: 'sent' }).eq('id', reminder.id)
    if (savedError) return json({ error: 'Versendet, aber Verlauf nicht aktualisiert. Bitte Status prüfen; nicht erneut senden.' }, 500)
    return json({ success: true, sent: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Versand nicht bestätigt'
    console.error('Return reminder send not confirmed:', message)
    if (error instanceof ReminderSendError && !error.uncertain) {
      await log('failed', message)
      await supabase.from('rental_return_reminders').update({ status: 'failed' }).eq('id', reminder.id)
    }
    // Transport failures or receipt-write failures keep the pending claim locked.
    return json({ error: message, status: error instanceof ReminderSendError ? error.status : 500 }, error instanceof ReminderSendError ? error.status : 500)
  }
})
