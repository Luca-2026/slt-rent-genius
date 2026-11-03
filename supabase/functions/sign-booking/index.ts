import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { ensurePaymentLink, isStripeConfigured, newToken, planPaymentAmounts } from "../_shared/stripe-pay.ts";
import { SLT_COMPANY } from "../_shared/company.ts";
import { validCalendarDate, validPublicRentalPeriod } from "../_shared/public-rental-period.ts";
import { validSignPermit } from "../_shared/sign-permit.ts";
import { routeDistance } from "../_shared/route-distance.ts";
import { signSetupGrossCents } from "../_shared/sign-direct-booking.ts";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });
const text = (max: number) => z.string().trim().min(1).max(max);
const booking = z.object({
  requestId: z.string().uuid(), cartExpiresAt: z.number().finite(), location: z.enum(["krefeld", "bonn"]), package: z.enum(["standard", "sorglos"]), quantity: z.number().int().min(1).max(10),
  start_date: z.string().refine(validCalendarDate), end_date: z.string().refine(validCalendarDate), start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  name: text(200), email: z.string().trim().email().max(180).transform(v => v.toLowerCase()), phone: text(50).refine(v => v.replace(/\D/g, "").length >= 6), street: text(200), postalCode: text(20), city: text(100), customerKind: z.enum(["private", "business"]),
  termsAccepted: z.literal(true), municipalFeesAccepted: z.boolean(), pickupConfirmed: z.boolean(),
  zoneStreet: z.string().trim().max(200), zonePostalCode: z.string().trim().max(20), zoneCity: z.string().trim().max(100), message: z.string().max(4000), permitToken: z.string().regex(/^[A-Za-z0-9_-]{20,64}$/).nullable(),
}).refine(v => v.package === "standard" ? v.pickupConfirmed : v.municipalFeesAccepted && v.zoneStreet.length > 3 && v.zonePostalCode.length > 3 && v.zoneCity.length > 1);

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Ungültige Anfrage" }, 405);
  try {
    const url = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return json({ error: "Buchung derzeit nicht verfügbar" }, 503);
    const service = createClient(url, key);
    const raw = await req.json();
    if (raw.action === "info") {
      const parsed = z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{20,64}$/) }).safeParse(raw);
      if (!parsed.success) return json({ error: "Ungültige Buchung" }, 400);
      const { data: b } = await service.from("sign_bookings").select("*").eq("token", parsed.data.token).maybeSingle();
      if (!b) return json({ error: "Buchung nicht gefunden" }, 404);
      const { data: inquiry } = await service.from("rental_inquiries").select("order_code,offer_number").eq("id", b.inquiry_id).single();
      const expired = b.status === "reserved" && Date.parse(b.expires_at) <= Date.now();
      const { data: link } = await service.from("offer_payment_links").select("token").eq("inquiry_id", b.inquiry_id).eq("inquiry_table", "rental_inquiries").eq("status", "active").maybeSingle();
      return json({ status: expired ? "expired" : b.status, order_code: inquiry?.order_code, expires_at: b.expires_at, amount_cents: b.total_cents, payment_url: !expired && link ? `https://www.slt-rental.de/zahlung/${link.token}` : null, bank: { holder: SLT_COMPANY.name, iban: SLT_COMPANY.iban, bic: SLT_COMPANY.bic, reference: `Auftrag ${inquiry?.order_code ?? ""}` } });
    }
    const { data: allowed, error: rateError } = await service.rpc("check_public_rate_limit", { _bucket: "sign-booking", _client_key: req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown", _max_hits: 30, _window_seconds: 3600 });
    if (rateError || !allowed) return json({ error: "Bitte später erneut versuchen" }, 429);
    if (raw.action === "config") {
      const { data: p } = await service.from("b2b_managed_products").select("direct_booking_config").eq("slug", "halteverbotsschilder-set").eq("is_published", true).maybeSingle();
      const { data: signs, error: signsError } = await service.from("b2b_managed_products").select("slug,name,images,available_locations").eq("is_published", true).eq("category", "absperrtechnik").or("slug.ilike.%zusatz%,slug.like.vz-1000-%").order("name");
      if (signsError) throw signsError;
      return json({ config: p?.direct_booking_config ?? null, additionalSigns: signs ?? [] });
    }
    if (raw.action === "availability") {
      const parsed = z.object({ location: z.enum(["bonn", "krefeld"]), from: z.string().refine(validCalendarDate), to: z.string().refine(validCalendarDate) }).safeParse(raw);
      if (!parsed.success) return json({ error: "Ungültiger Zeitraum" }, 400);
      const { data, error } = await service.rpc("sign_calendar_availability", { _location: parsed.data.location, _from: parsed.data.from, _to: parsed.data.to });
      if (error) return json({ error: "Belegung konnte nicht geladen werden" }, 400);
      return json({ days: data });
    }
    if (raw.action === "setup-quote") {
      const parsed = z.object({ location: z.enum(["bonn", "krefeld"]), street: text(200), postalCode: z.string().regex(/^\d{5}$/), city: text(100) }).safeParse(raw);
      if (!parsed.success) return json({ error: "Bitte vollständige Aufstelladresse angeben" }, 400);
      const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
      const distance = apiKey ? await routeDistance(apiKey, parsed.data.location, { address: `${parsed.data.street}, ${parsed.data.postalCode} ${parsed.data.city}, Deutschland` }) : null;
      if (!distance) return json({ error: "Aufstelladresse konnte nicht geprüft werden" }, 503);
      const { data: p } = await service.from("b2b_managed_products").select("direct_booking_config").eq("slug", "halteverbotsschilder-set").eq("is_published", true).single();
      const cents = p?.direct_booking_config ? signSetupGrossCents(p.direct_booking_config, distance.distanceKm) : null;
      if (cents == null) return json({ error: "Aufstellpreis derzeit nicht verfügbar" }, 503);
      return json({ grossCents: cents, distanceKm: distance.distanceKm });
    }
    if (raw.action === "upload") {
      const parsed = z.object({ filename: text(120), contentType: z.enum(["application/pdf", "image/jpeg", "image/png"]), size: z.number().int().min(1).max(5 * 1024 * 1024) }).safeParse(raw);
      if (!parsed.success) return json({ error: "Bitte PDF, JPG oder PNG bis 5 MB auswählen" }, 400);
      const token = newToken(), extension = parsed.data.contentType === "application/pdf" ? "pdf" : parsed.data.contentType === "image/png" ? "png" : "jpg";
      const path = `${crypto.randomUUID()}/genehmigung.${extension}`;
      const { error } = await service.from("sign_permit_uploads").insert({ token, file_path: path, filename: parsed.data.filename, content_type: parsed.data.contentType });
      if (error) throw error;
      const { data, error: uploadError } = await service.storage.from("sign-permits").createSignedUploadUrl(path);
      if (uploadError || !data) throw uploadError;
      return json({ token, path, uploadToken: data.token });
    }
    if (raw.action === "upload-complete") {
      const parsed = z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{20,64}$/) }).safeParse(raw);
      if (!parsed.success) return json({ error: "Ungültiger Upload" }, 400);
      const { data: upload } = await service.from("sign_permit_uploads").select("file_path,content_type").eq("token", parsed.data.token).is("booking_id", null).gt("created_at", new Date(Date.now() - 7200000).toISOString()).maybeSingle();
      if (!upload) return json({ error: "Upload abgelaufen oder bereits zugeordnet" }, 400);
      const { data: file, error } = await service.storage.from("sign-permits").download(upload.file_path);
      if (error || !file || !validSignPermit(new Uint8Array(await file.arrayBuffer()), upload.content_type)) return json({ error: "Genehmigung nicht vollständig hochgeladen oder ungültiger Dateityp" }, 400);
      return json({ verified: true });
    }
    if (raw.action !== "reserve") return json({ error: "Ungültige Aktion" }, 400);
    const parsed = booking.safeParse(raw);
    if (!parsed.success) return json({ error: "Bitte Kontaktdaten, Zeitraum und Bedingungen vollständig angeben" }, 400);
    const { requestId, cartExpiresAt, permitToken, ...body } = parsed.data;
    if (body.package === "standard" && !validPublicRentalPeriod(body)) return json({ error: "Abholung und Rückgabe müssen innerhalb der Öffnungszeiten liegen" }, 400);
    // Retry may read back an existing reservation even after the original cart deadline.
    const { data: existing } = await service.from("sign_bookings").select("id,snapshot").eq("request_id", requestId).maybeSingle();
    if (!existing && (cartExpiresAt <= Date.now() || cartExpiresAt > Date.now() + 900000)) return json({ error: "Warenkorb abgelaufen" }, 409);
    if (!isStripeConfigured()) return json({ error: "Online-Zahlung derzeit nicht verfügbar" }, 503);
    if (permitToken) {
      const { data: upload } = await service.from("sign_permit_uploads").select("file_path,content_type,booking_id").eq("token", permitToken).maybeSingle();
      if (!upload) return json({ error: "Genehmigung nicht gefunden" }, 400);
      if (upload.booking_id && upload.booking_id !== existing?.id) return json({ error: "Genehmigung bereits einem anderen Auftrag zugeordnet" }, 409);
      const { data: file, error } = await service.storage.from("sign-permits").download(upload.file_path);
      if (error || !file || file.size > 5 * 1024 * 1024) return json({ error: "Genehmigung nicht vollständig hochgeladen" }, 400);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const valid = validSignPermit(bytes, upload.content_type);
      if (!valid) return json({ error: "Datei entspricht nicht dem gewählten Dateityp" }, 400);
    }
    let trustedBody: Record<string, unknown> = body;
    if (body.package === "sorglos") {
      if (existing?.snapshot?.request?.verifiedDistanceKm != null) trustedBody = { ...body, verifiedDistanceKm: existing.snapshot.request.verifiedDistanceKm };
      else {
        const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
        const distance = apiKey ? await routeDistance(apiKey, body.location, { address: `${body.zoneStreet}, ${body.zonePostalCode} ${body.zoneCity}, Deutschland` }) : null;
        if (!distance) return json({ error: "Aufstelladresse konnte nicht geprüft werden. Bitte Adresse kontrollieren." }, 503);
        trustedBody = { ...body, verifiedDistanceKm: distance.distanceKm };
      }
    }
    const { data: reserved, error } = await service.rpc("reserve_sign_booking", { _request: requestId, _token: newToken(), _body: trustedBody, _permit_token: permitToken });
    if (error) return json({ error: error.message }, error.code === "42501" ? 403 : 409);
    const { data: inquiry } = await service.from("rental_inquiries").select("customer_email,offer_number,offer_total_gross,offer_payload").eq("id", reserved.inquiry_id).single();
    const { data: link } = await service.from("offer_payment_links").select("token").eq("inquiry_id", reserved.inquiry_id).eq("inquiry_table", "rental_inquiries").eq("status", "active").maybeSingle();
    if (!link && reserved.status === "reserved" && inquiry) {
      const created = await ensurePaymentLink(service, { table: "rental_inquiries", inquiryId: reserved.inquiry_id, customerEmail: inquiry.customer_email, offerNumber: inquiry.offer_number, plan: planPaymentAmounts({ gross: inquiry.offer_total_gross, deposit: inquiry.offer_payload.deposit }) });
      if (!created) return json({ error: "Reservierung gespeichert, Zahlungslink noch nicht verfügbar. Bitte denselben Vorgang erneut versuchen." }, 503);
    }
    return json({ token: reserved.token });
  } catch (error) {
    console.error("sign-booking:", error instanceof Error ? error.message : "failed");
    return json({ error: "Buchung konnte nicht abgeschlossen werden. Bitte erneut versuchen." }, 503);
  }
});