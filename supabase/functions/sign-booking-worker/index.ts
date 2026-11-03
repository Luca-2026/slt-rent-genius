import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { isCronCall, staffUserId } from "../_shared/cronAuth.ts";
import { generateOfferPdf } from "../_shared/offer-pdf.ts";
import { byForm, resolveAddressForm, salutationLine } from "../_shared/salutation.ts";
import { SLT_COMPANY } from "../_shared/company.ts";
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const esc = (value: unknown) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Invalid method" }, 405);
  const url = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return json({ error: "Unavailable" }, 503);
  const service = createClient(url, key);
  if (!await isCronCall(req, service) && !await staffUserId(req, service)) return json({ error: "Unauthorized" }, 403);
  try {
    const { error: expiryError } = await service.rpc("expire_sign_bookings");
    if (expiryError) throw expiryError;
    const { data: bookings, error } = await service.from("sign_bookings").select("*").eq("status", "paid").is("confirmation_sent_at", null).limit(20);
    if (error) throw error;
    let sent = 0;
    for (const b of bookings ?? []) {
      const { data: inq } = await service.from("rental_inquiries").select("*").eq("id", b.inquiry_id).single();
      if (!inq) continue;
      // No production mail until explicit rollout, even for previously created rows.
      const { data: product } = await service.from("b2b_managed_products").select("direct_booking_config,images").eq("slug", "halteverbotsschilder-set").single();
      if (!product?.direct_booking_config?.live_enabled && inq.customer_email?.toLowerCase() !== "luca@sandhoff.org") continue;
      const payload = b.snapshot.offer_payload, totals = payload.totals;
      const profile = { id: "", company_name: inq.company_name || inq.customer_name, legal_form: null, contact_first_name: inq.customer_name, contact_last_name: "", street: inq.customer_street, house_number: "", postal_code: inq.customer_postal_code, city: inq.customer_city, country: "Deutschland", contact_email: inq.customer_email, contact_phone: inq.customer_phone, credit_limit: 0, payment_due_days: 0 };
      const bytes = await generateOfferPdf({ documentType: "order_confirmation", offerNumber: inq.offer_number.replace(/^ANG-/, "AB-"), offerDate: b.confirmed_at.slice(0, 10), validUntil: "", profile,
        items: payload.items.map((item: any) => ({ ...item, total_price: totals.netAmount, rental_start: b.start_date, rental_end: b.end_date, image_url: product?.images?.[0] })),
        deliveryCost: 0, deliveryCostDelivery: 0, deliveryCostReturn: 0, servicesSurcharge: 0, servicesWithPrices: [], netAmount: totals.netAmount, vatRate: 19, vatAmount: totals.vatAmount, grossAmount: b.gross_cents / 100,
        isReverseCharge: false, notes: b.package === "sorglos" ? `${b.permit_mode === "existing" ? "Genehmigung bereits vorhanden: Aufstellung, Protokollierung und Abbau." : "Genehmigung durch SLT."} Städtische Gebühren werden anschließend transparent nach tatsächlichem Gebührenbescheid separat abgerechnet.` : null, validDays: 0, deposit: b.deposit_cents / 100, staffName: "SLT Rental", issuingLocation: b.location, orderCode: inq.order_code, sourceOfferNumber: inq.offer_number, servicePeriodStart: b.start_date, servicePeriodEnd: b.end_date, paymentTerms: "vorkasse", payments: inq.payments,
      });
      const path = `inquiry-order-confirmations/rental/${inq.id}/AB-${inq.order_code}.pdf`;
      const { error: upError } = await service.storage.from("b2b-invoices").upload(path, bytes, { contentType: "application/pdf", upsert: true });
      if (upError) throw upError;
      const { data: signed } = await service.storage.from("b2b-invoices").createSignedUrl(path, 365 * 86400);
      if (!signed?.signedUrl) throw new Error("Confirmation URL missing");
      const resend = Deno.env.get("RESEND_API_KEY");
      if (!resend) throw new Error("Email not configured");
      const form = await resolveAddressForm(service, inq);
      const encoded = btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(""));
      const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${resend}`, "Content-Type": "application/json", "Idempotency-Key": `sign-confirm-${b.id}` }, body: JSON.stringify({
        from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`, to: [inq.customer_email], reply_to: `${b.location}@slt-rental.de`, subject: `Auftragsbestätigung #${inq.order_code} – Halteverbotsschilder`,
        html: `<p>${esc(salutationLine({ address_form: form, name: inq.customer_name }))}</p><p>${byForm(form, "Deine", "Ihre")} Zahlung ist vollständig eingegangen. ${byForm(form, "Deine", "Ihre")} Buchung <strong>#${esc(inq.order_code)}</strong> über ${b.quantity} Sets ist bestätigt.</p><p>Standort: ${b.location === "bonn" ? "Bonn" : "Krefeld"}<br>Mietzeit: ${esc(b.start_date)} bis ${esc(b.end_date)}</p>${b.package === "sorglos" ? "<p>Städtische Gebühren werden zusätzlich separat abgerechnet.</p>" : ""}<p>Die Auftragsbestätigung ist als PDF beigefügt.</p><p>Freundliche Grüße<br>${esc(SLT_COMPANY.brand)}</p>`, attachments: [{ filename: `Auftragsbestaetigung_${inq.order_code}.pdf`, content: encoded }],
      }) });
      if (!response.ok) throw new Error(`Confirmation email failed (${response.status})`);
      const { error: finishError } = await service.rpc("finish_sign_confirmation", { _id: b.id, _path: path, _url: signed.signedUrl });
      if (finishError) throw finishError;
      sent++;
    }
    const { error: drainError } = await service.rpc("drain_sign_booking_processor");
    if (drainError) throw drainError;
    return json({ sent });
  } catch (error) { console.error("sign-booking-worker:", error instanceof Error ? error.message : "failed"); return json({ error: "Processing failed" }, 500); }
});