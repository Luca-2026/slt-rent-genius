import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { TEMPLATES } from '../_shared/transactional-email-templates/registry.ts'
import { z } from 'npm:zod@3.25.76'
import { resolveAddressForm } from '../_shared/salutation.ts'
import { returnReminderContent } from '../_shared/return-reminder-content.ts'

// Configuration baked in at scaffold time — do NOT change these manually.
// To update, re-run the email domain setup flow.
const SITE_NAME = "SLT Rental"
// SENDER_DOMAIN is the verified sender FQDN: a delegated subdomain (e.g., "notify.example.com"), or, on a
// domain registered through Lovable, the domain itself or a name under it (e.g., "example.com", "app.example.com").
// It MUST match the sender verified in Lovable's email setup.
// The email API looks up this exact domain; a mismatch causes "No email domain record found".
const SENDER_DOMAIN = "notify.slt-rental.de"
// FROM_DOMAIN is the domain shown in the From: header (e.g., "example.com").
// When display_from_root is enabled, this can be the root domain for cleaner branding,
// even though actual sending uses the subdomain above.
const FROM_DOMAIN = "slt-rental.de"

function redactEmail(email: string | null | undefined): string {
  if (!email) return '***'
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return '***'
  return `${localPart[0]}***@${domain}`
}

// Generate a cryptographically random 32-byte hex token
function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Auth note: this function uses verify_jwt = true in config.toml, so Supabase's
// gateway validates the caller's JWT (anon or service_role) before the request
// reaches this code. No in-function auth check is needed.

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
  let idempotencyKey: string
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
    if (claim.already_queued) return json({ success: true, alreadyQueued: true })
    const snapshot = reminder?.customer_snapshot ?? {}
    templateData = { stage, ...returnReminderContent(stage, snapshot.name ?? '', form), orderCode: snapshot.order_code, productName: snapshot.product_name, endDate: new Date(`${snapshot.end_date}T12:00:00Z`).toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' }), replyTo: reminder?.reply_to }
    templateName = 'rental-return-reminder'
    recipientEmail = reminder?.recipient_email
    replyTo = reminder?.reply_to
    messageId = reminder?.message_id
    idempotencyKey = `rental-return-${reminder?.id}`
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

  // 2. Check suppression list (fail-closed: if we can't verify, don't send)
  const { data: suppressed, error: suppressionError } = await supabase
    .from('suppressed_emails')
    .select('id')
    .eq('email', effectiveRecipient.toLowerCase())
    .maybeSingle()

  if (suppressionError) {
    console.error('Suppression check failed — refusing to send', {
      code: suppressionError.code,
      message: suppressionError.message,
      recipient_redacted: redactEmail(effectiveRecipient),
    })
    return new Response(
      JSON.stringify({ error: 'Failed to verify suppression status' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  if (suppressed) {
    // Log the suppressed attempt
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: 'suppressed',
    })

    console.log('Email suppressed', { templateName, recipient_redacted: redactEmail(effectiveRecipient) })
    return new Response(
      JSON.stringify({ success: false, reason: 'email_suppressed' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  // 3. Get or create unsubscribe token (one token per email address)
  const normalizedEmail = effectiveRecipient.toLowerCase()
  let unsubscribeToken: string

  // Check for existing token for this email
  const { data: existingToken, error: tokenLookupError } = await supabase
    .from('email_unsubscribe_tokens')
    .select('token, used_at')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (tokenLookupError) {
    console.error('Token lookup failed', {
      code: tokenLookupError.code,
      message: tokenLookupError.message,
      email_redacted: redactEmail(normalizedEmail),
    })
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: 'failed',
      error_message: 'Failed to look up unsubscribe token',
    })
    return new Response(
      JSON.stringify({ error: 'Failed to prepare email' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  if (existingToken && !existingToken.used_at) {
    // Reuse existing unused token
    unsubscribeToken = existingToken.token
  } else if (!existingToken) {
    // Create new token — upsert handles concurrent inserts gracefully
    unsubscribeToken = generateToken()
    const { error: tokenError } = await supabase
      .from('email_unsubscribe_tokens')
      .upsert(
        { token: unsubscribeToken, email: normalizedEmail },
        { onConflict: 'email', ignoreDuplicates: true }
      )

    if (tokenError) {
      console.error('Failed to create unsubscribe token', {
        code: tokenError.code,
        message: tokenError.message,
      })
      await supabase.from('email_send_log').insert({
        message_id: messageId,
        template_name: templateName,
        recipient_email: effectiveRecipient,
        status: 'failed',
        error_message: 'Failed to create unsubscribe token',
      })
      return new Response(
        JSON.stringify({ error: 'Failed to prepare email' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // If another request raced us, our upsert was silently ignored.
    // Re-read to get the actual stored token.
    const { data: storedToken, error: reReadError } = await supabase
      .from('email_unsubscribe_tokens')
      .select('token')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (reReadError || !storedToken) {
      console.error('Failed to read back unsubscribe token after upsert', {
        code: reReadError?.code,
        message: reReadError?.message,
        email_redacted: redactEmail(normalizedEmail),
      })
      await supabase.from('email_send_log').insert({
        message_id: messageId,
        template_name: templateName,
        recipient_email: effectiveRecipient,
        status: 'failed',
        error_message: 'Failed to confirm unsubscribe token storage',
      })
      return new Response(
        JSON.stringify({ error: 'Failed to prepare email' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
    unsubscribeToken = storedToken.token
  } else {
    // Token exists but is already used — email should have been caught by suppression check above.
    // This is a safety fallback; log and skip sending.
    console.warn('Unsubscribe token already used but email not suppressed', {
      email_redacted: redactEmail(normalizedEmail),
    })
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: 'suppressed',
      error_message:
        'Unsubscribe token used but email missing from suppressed list',
    })
    return new Response(
      JSON.stringify({ success: false, reason: 'email_suppressed' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

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

  // 5. Enqueue the pre-rendered email for async processing by the dispatcher.
  // The dispatcher (process-email-queue) handles sending, retries, and rate-limit backoff.

  // Log pending BEFORE enqueue so we have a record even if enqueue crashes
  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: effectiveRecipient,
    status: 'pending',
  })

  const { error: enqueueError } = await supabase.rpc('enqueue_email', {
    queue_name: 'transactional_emails',
    payload: {
      message_id: messageId,
      to: effectiveRecipient,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      reply_to: replyTo,
      subject: resolvedSubject,
      html,
      text: plainText,
      purpose: 'transactional',
      label: templateName,
      idempotency_key: idempotencyKey,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  })

  if (enqueueError) {
    console.error('Failed to enqueue email', {
      code: enqueueError.code,
      message: enqueueError.message,
      templateName,
      recipient_redacted: redactEmail(effectiveRecipient),
    })

    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: 'failed',
      error_message: 'Failed to enqueue email',
    })

    return new Response(JSON.stringify({ error: 'Failed to enqueue email' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  console.log('Transactional email enqueued', { templateName, recipient_redacted: redactEmail(effectiveRecipient) })
  if (reminder) {
    const { error: saveError } = await supabase.from('rental_return_reminders').update({ status: 'queued', queued_at: new Date().toISOString() }).eq('id', reminder.id)
    if (saveError) return json({ error: 'Versand vorbereitet, aber Verlauf nicht aktualisiert. Bitte neu laden; nicht erneut senden.' }, 500)
  }

  return new Response(
    JSON.stringify({ success: true, queued: true }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
})
