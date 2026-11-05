import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { saveRentalInquiry, rentalInquiryLink, serviceClient } from "../_shared/inquiry-store.ts";
import { previewPublicCoupon } from "../_shared/public-coupon.ts";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
import { publicRentalQuote, FREE_CANCELLATION_OPTION } from "../_shared/public-rental-quote.ts";
import { cartDeliveryQuote, type CartDeliveryQuote } from "../_shared/delivery-tariffs.ts";
import { routeDistance } from "../_shared/route-distance.ts";
import { operationalEmailRecipient } from "../_shared/test-email-routing.ts";
import { z } from "npm:zod@3";
import { validPublicRentalPeriod } from "../_shared/public-rental-period.ts";
import { publicRequestAllowed } from "../_shared/public-request-limit.ts";
import { publicLocationContacts } from "../_shared/public-location-contact.ts";
import { bankDiscountLive, publicInquiryBankDiscount } from "../_shared/payment-incentive-rollout.ts";
import { BANK_DISCOUNT_TERMS } from "../_shared/bank-transfer-discount.ts";

const cartLineSchema = z.object({ id: z.string().min(1).max(100), product_slug: z.string().min(1).max(200), product_name: z.string().min(1).max(200), location: z.enum(["krefeld", "bonn", "muelheim"]), quantity: z.number().int().min(1).max(9999), start_date: z.string(), end_date: z.string(), start_time: z.string(), end_time: z.string(), selected_addons: z.array(z.string().max(60)).max(10), use_saturday: z.boolean(), use_sunday: z.boolean() }).refine(validPublicRentalPeriod);
const cartSchema = z.object({
  cartRequestId: z.string().uuid(), cartExpiresAt: z.number().finite(), bankDiscountShown: z.boolean().optional(), items: z.array(cartLineSchema).min(1).max(30),
  name: z.string().trim().min(2).max(200), email: z.string().trim().email().max(180).transform(value => value.toLowerCase()),
  phone: z.string().trim().max(50).refine(value => value.replace(/\D/g, "").length >= 6),
  street: z.string().trim().min(1).max(200), postalCode: z.string().trim().min(1).max(20), city: z.string().trim().min(1).max(100),
  customerKind: z.enum(["private", "business"]), message: z.string().max(4000).optional(), couponCode: z.string().max(20).optional(),
  deliveryRequested: z.boolean(), deliveryStreet: z.string().max(200).optional(), deliveryPostalCode: z.string().max(20).optional(), deliveryCity: z.string().max(100).optional(),
}).refine(value => !value.deliveryRequested || !!(value.deliveryStreet?.trim() && value.deliveryPostalCode?.trim() && value.deliveryCity?.trim()));


const SLT_LOGO = "https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png";
const COMPANY_NAME = "SLT Technology Group GmbH & Co. KG";

function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Ungültige Anfrage" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    let body = await req.json();
    const isCart = body && Object.prototype.hasOwnProperty.call(body, "cartRequestId");
    if (isCart) {
      const parsed = cartSchema.safeParse(body);
      if (!parsed.success) return new Response(JSON.stringify({ error: "Bitte vollständige Kontaktdaten und gültige Artikelzeiträume angeben." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      body = parsed.data;
      if (new Set(body.items.map((item: { id: string }) => item.id)).size !== body.items.length) return new Response(JSON.stringify({ error: "Doppelte Positionen" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const first = body.items[0];
      const location = publicLocationContacts[first.location];
      body = { ...body, productName: first.product_name, locationName: location.name, locationEmail: location.email, locationPhone: location.phone, locationAddress: location.address, startDate: first.start_date, startTime: first.start_time, endDate: first.end_date, endTime: first.end_time, useSaturday: first.use_saturday, useSunday: first.use_sunday };
    }
    let {
      productName,
      locationName,
      locationEmail,
      locationPhone,
      locationAddress,
      name,
      email,
      phone,
      street,
      postalCode,
      city,
      startDate,
      startTime,
      endDate,
      endTime,
      message,
      deliveryRequested,
      deliveryStreet,
      deliveryPostalCode,
      deliveryCity,
      setupServiceRequested,
      customerKind,
      attachments,
      items,
      useSaturday,
      useSunday,
      priceEstimate,
      couponCode,
      cartRequestId,
      cartExpiresAt,
    } = body;

    const requestedCode = typeof couponCode === "string" ? couponCode.trim().toUpperCase() : "";
    if ((couponCode != null && typeof couponCode !== "string") || (requestedCode && !/^[A-F0-9]{20}$/.test(requestedCode))) {
      return new Response(JSON.stringify({ error: "Ungültiger Gutscheincode" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // W2: Rückgabedatum darf nicht vor dem Abholdatum liegen.
    if (startDate && endDate && String(endDate) < String(startDate)) {
      return new Response(
        JSON.stringify({ error: "Das Rückgabedatum darf nicht vor dem Abholdatum liegen." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Gebündelte Artikel (max. 30), Menge 1–9999. Hauptartikel steht an erster Stelle.
    const requestedItems =
      (Array.isArray(items) ? items : [])
        .slice(0, 30)
        .map((it: any) => ({
          product_name: String(it?.product_name ?? "").trim().slice(0, 200),
          product_slug: it?.product_slug ? String(it.product_slug).slice(0, 200) : null,
          quantity: Math.min(9999, Math.max(1, Math.round(Number(it?.quantity) || 1))),
          set_size: Number.isFinite(Number(it?.set_size)) && Number(it.set_size) > 1 ? Math.round(Number(it.set_size)) : null,
          selected_addons: (Array.isArray(it?.selected_addons) ? it.selected_addons : [])
            .slice(0, 10)
            .map((k: unknown) => String(k).slice(0, 60)),
          ...(cartRequestId ? { id: String(it?.id ?? "").slice(0, 100), location: String(it?.location ?? ""), start_date: String(it?.start_date ?? ""), end_date: String(it?.end_date ?? ""), start_time: String(it?.start_time ?? ""), end_time: String(it?.end_time ?? ""), use_saturday: it?.use_saturday === true, use_sunday: it?.use_sunday === true } : {}),
        }))
        .filter((it) => it.product_name);

    // Gewählte Zusatzoptionen gegen das CMS validieren: nur gepflegte addon_options-Keys
    // des jeweiligen Artikels werden übernommen, inkl. Pflicht-Standardstufe.
    const slugs = [...new Set(requestedItems.map((it) => it.product_slug).filter((s): s is string => !!s))];
    const addonLabelsBySlug = new Map<string, Map<string, string>>();
    const db = serviceClient();
    const inquiryDiscount = db && cartRequestId ? publicInquiryBankDiscount(await bankDiscountLive(db), requestedItems.map(item => ({ product_slug: item.product_slug ?? "" }))) : null;
    if (cartRequestId && body.bankDiscountShown === true && !inquiryDiscount) {
      return new Response(JSON.stringify({ error: "Die Rabattbedingungen wurden geändert. Bitte lade den Warenkorb neu und prüfe die aktuellen Bedingungen vor dem Absenden." }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    let quoteLines: unknown[] = [];
    let deliveryQuote: (CartDeliveryQuote & { distance_km?: number | null }) | null = null;
    if (cartRequestId) {
      if (!db || !/^[a-f0-9-]{36}$/i.test(String(cartRequestId)) || !Number.isFinite(cartExpiresAt) || cartExpiresAt <= Date.now() || cartExpiresAt > Date.now() + 900000 || !requestedItems.length) return new Response(JSON.stringify({ error: "Warenkorb abgelaufen oder ungültig" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (requestedItems.some((item: any) => !["krefeld", "bonn", "muelheim"].includes(item.location) || !/^\d{4}-\d{2}-\d{2}$/.test(item.start_date) || !/^\d{4}-\d{2}-\d{2}$/.test(item.end_date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.start_time) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.end_time) || `${item.end_date}T${item.end_time}` <= `${item.start_date}T${item.start_time}`)) return new Response(JSON.stringify({ error: "Ungültige Positionszeiträume" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const { data: existing } = await db.from("rental_inquiries").select("id,order_code").contains("raw_payload", { cart_request_id: cartRequestId }).eq("customer_email", email).maybeSingle();
      if (existing) return new Response(JSON.stringify({ success: true, order_code: existing.order_code }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (!await publicRequestAllowed(db, req, "public-cart-submit", email, 10)) return new Response(JSON.stringify({ error: "Zu viele Anfragen. Bitte später erneut versuchen." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      quoteLines = await publicRentalQuote(db, requestedItems);
      for (const item of requestedItems) {
        const quote = (quoteLines as { id: string; product_name: string }[]).find(line => line.id === item.id);
        if (quote) item.product_name = quote.product_name;
      }
      productName = requestedItems[0].product_name;
      if (deliveryRequested) {
        // Entfernung serverseitig neu ermitteln; Tarif des teuersten Artikels gilt für den ganzen Warenkorb.
        const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
        const route = apiKey && requestedItems[0]?.location ? await routeDistance(apiKey, requestedItems[0].location, { address: `${deliveryStreet}, ${deliveryPostalCode} ${deliveryCity}, Germany` }).catch(() => null) : null;
        const lines = (quoteLines as { category: string; product_name: string; id: string }[]).map(line => ({ category: line.category, product_name: line.product_name, quantity: requestedItems.find((item: any) => item.id === line.id)?.quantity ?? 1 }));
        deliveryQuote = route ? { ...cartDeliveryQuote(lines, route.roundedKm), distance_km: Math.round(route.distanceKm * 10) / 10 } : { status: "on_request", reason: "distance", product_name: null, km: 0, distance_km: null };
      }
    }
    if (requestedCode) {
      if (!db) return new Response(JSON.stringify({ error: "Gutscheinprüfung derzeit nicht möglich" }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const preview = await previewPublicCoupon(db, requestedCode, String(email ?? ""), slugs);
      if (!preview.valid) return new Response(JSON.stringify({ error: preview.message }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (slugs.length && db) {
      const { data: prows } = await db
        .from("b2b_managed_products")
        .select("slug, addon_options")
        .in("slug", slugs);
      for (const row of prows ?? []) {
        const opts = Array.isArray(row.addon_options) ? row.addon_options : [];
        const labels = new Map<string, string>();
        for (const o of opts) {
          const key = String(o?.key ?? "");
          const label = String(o?.label ?? "").trim();
          if (key && label) labels.set(key, label);
        }
        labels.set(FREE_CANCELLATION_OPTION.key, FREE_CANCELLATION_OPTION.label);
        addonLabelsBySlug.set(String(row.slug), labels);
      }
    }
    for (const it of requestedItems) {
      const allowed = it.product_slug ? addonLabelsBySlug.get(it.product_slug) : undefined;
      it.selected_addons = allowed ? it.selected_addons.filter((k: string) => allowed.has(k)) : [];
    }
    const addonText = (it: { product_slug: string | null; selected_addons: string[] }) => {
      const labels = it.product_slug ? addonLabelsBySlug.get(it.product_slug) : undefined;
      if (!labels || !it.selected_addons.length) return "";
      return it.selected_addons.map((k) => labels.get(k)).filter(Boolean).join(", ");
    };
    const qtyText = (it: { quantity: number; set_size: number | null }) =>
      it.set_size ? `${it.quantity} ${it.quantity === 1 ? "Set" : "Sets"} (= ${it.quantity * it.set_size} Stück)` : `${it.quantity} Stück`;
    const itemsTableHtml = requestedItems.length
      ? `<table style="width:100%;border-collapse:collapse;margin:8px 0 16px;font-size:14px;">
          <tr><th style="text-align:left;padding:6px 4px;border-bottom:2px solid #e5e7eb;color:#6b7280;">Artikel</th><th style="text-align:right;padding:6px 4px;border-bottom:2px solid #e5e7eb;color:#6b7280;">Menge</th></tr>
          ${requestedItems.map((it) => {
            const addons = addonText(it);
            const period = cartRequestId ? `<br><span>${escapeHtml(it.location ? publicLocationContacts[it.location]?.name : "")} · ${escapeHtml(it.start_date)} ${escapeHtml(it.start_time)} – ${escapeHtml(it.end_date)} ${escapeHtml(it.end_time)}</span>` : "";
            return `<tr><td style="padding:6px 4px;border-bottom:1px solid #f3f4f6;">${escapeHtml(it.product_name)}${period}${addons ? `<br><span style="color:#6b7280;font-size:12px;">Zusatzoptionen: ${escapeHtml(addons)}</span>` : ""}</td><td style="padding:6px 4px;border-bottom:1px solid #f3f4f6;text-align:right;white-space:nowrap;">${escapeHtml(qtyText(it))}</td></tr>`;
          }).join("")}
        </table>`
      : "";

    // Pflichtfelder: Name, E-Mail und Telefonnummer müssen vorhanden sein.
    const missing: string[] = [];
    if (!String(name ?? "").trim()) missing.push("name");
    if (!/.+@.+\..+/.test(String(email ?? "").trim())) missing.push("email");
    // Telefon: mindestens 6 Ziffern, damit keine Fantasieeingaben durchgehen.
    const phoneDigits = String(phone ?? "").replace(/\D/g, "");
    if (phoneDigits.length < 6) missing.push("phone");
    if (missing.length > 0) {
      return new Response(
        JSON.stringify({ error: `Pflichtfelder fehlen oder sind ungültig: ${missing.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Validate attachments: max 3, max 5MB each, images only
    const safeAttachments: { filename: string; content: string }[] = [];
    if (Array.isArray(attachments)) {
      for (const att of attachments.slice(0, 3)) {
        if (!att?.filename || !att?.content) continue;
        // base64 size ≈ content.length * 0.75
        const approxBytes = Math.floor((att.content as string).length * 0.75);
        if (approxBytes > 5 * 1024 * 1024) continue;
        safeAttachments.push({
          filename: String(att.filename).slice(0, 120),
          content: att.content,
        });
      }
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    // Persist the inquiry so it can be worked on inside the B2B portal.
    const inquiryId = await saveRentalInquiry({
      source: "product_booking",
      location: locationName ?? null,
      location_email: locationEmail ?? null,
      product_name: requestedItems[0]?.product_name ?? productName ?? null,
      quantity: requestedItems[0]?.quantity ?? null,
      requested_items: requestedItems,
      start_date: startDate ?? null,
      start_time: startTime ?? null,
      end_date: endDate ?? null,
      end_time: endTime ?? null,
      delivery_requested: !!deliveryRequested,
      delivery_street: deliveryStreet ?? null,
      delivery_postal_code: deliveryPostalCode ?? null,
      delivery_city: deliveryCity ?? null,
      setup_service_requested: !!setupServiceRequested,
      customer_name: name ?? null,
      customer_email: email ?? null,
      customer_phone: phone ?? null,
      customer_street: street ?? null,
      customer_postal_code: postalCode ?? null,
      customer_city: city ?? null,
      customer_kind: customerKind === "business" ? "business" : "private",
      use_saturday: useSaturday === true,
      use_sunday: useSunday === true,
      message: message ?? null,
      raw_payload: { ...(inquiryDiscount ? { bank_transfer_discount: inquiryDiscount } : {}), ...(requestedCode ? { requested_coupon_code: requestedCode } : {}), ...(cartRequestId ? { cart_request_id: cartRequestId, quote_lines: quoteLines, ...(deliveryQuote ? { delivery_quote: deliveryQuote } : {}) } : {}) },
      attachments: safeAttachments.map((a) => ({ filename: a.filename })),
      ...(cartRequestId ? { email_sent: false } : {}),
    });
    const portalLink = rentalInquiryLink(inquiryId);
    if (cartRequestId && !inquiryId) {
      const { data: duplicate } = db ? await db.from("rental_inquiries").select("order_code").contains("raw_payload", { cart_request_id: cartRequestId }).eq("customer_email", email).maybeSingle() : { data: null };
      return new Response(JSON.stringify(duplicate ? { success: true, order_code: duplicate.order_code } : { error: "Anfrage konnte nicht gespeichert werden. Bitte erneut versuchen." }), { status: duplicate ? 200 : 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { data: storedInquiry } = inquiryId && db ? await db.from("rental_inquiries").select("order_code").eq("id", inquiryId).maybeSingle() : { data: null };

    const dateRange = cartRequestId && requestedItems.length > 1 ? "Je Artikel unten angegeben" : startDate
      ? `${startDate}${endDate ? ` bis ${endDate}` : ""}`
      : "Kein Datum angegeben";

    const timeRange = (startTime || endTime)
      ? `${startTime ? `Abholung: ${startTime} Uhr` : ""}${startTime && endTime ? " · " : ""}${endTime ? `Rückgabe: ${endTime} Uhr` : ""}`
      : null;

    const customerAddress = (street || postalCode || city)
      ? `${street || ""}${street ? ", " : ""}${postalCode || ""} ${city || ""}`.trim()
      : null;

    const e = {
      productName: escapeHtml(productName),
      locationName: escapeHtml(locationName),
      name: escapeHtml(name),
      email: escapeHtml(email),
      phone: escapeHtml(phone || "nicht angegeben"),
      message: escapeHtml(message),
      customerAddress: escapeHtml(customerAddress),
      dateRange: escapeHtml(dateRange),
      timeRange: escapeHtml(timeRange),
      deliveryStreet: escapeHtml(deliveryStreet),
      deliveryPostalCode: escapeHtml(deliveryPostalCode),
      deliveryCity: escapeHtml(deliveryCity),
      locEmail: escapeHtml(["krefeld@slt-rental.de", "bonn@slt-rental.de", "muelheim@slt-rental.de", "mieten@slt-rental.de", "info@slt-rental.de"].includes(String(locationEmail ?? "").trim().toLowerCase()) ? String(locationEmail).trim().toLowerCase() : "mieten@slt-rental.de"),
      locPhone: escapeHtml(locationPhone || "02151 417 99 04"),
      locAddress: escapeHtml(locationAddress || "Anrather Straße 291, 47807 Krefeld"),
    };

    const deliveryHtml = deliveryRequested
      ? `
      <tr><td style="padding: 4px 0; color: #6b7280;">Lieferung:</td><td style="padding: 4px 0; font-weight: 500; color: #16a34a;">✓ Ja, gewünscht</td></tr>
      <tr><td style="padding: 4px 0; color: #6b7280;">Lieferadresse:</td><td style="padding: 4px 0;">${e.deliveryStreet}<br>${e.deliveryPostalCode} ${e.deliveryCity}</td></tr>${deliveryQuote ? `<tr><td style="padding: 4px 0; color: #6b7280;">Lieferkosten:</td><td style="padding: 4px 0; font-weight: 600;">${deliveryQuote.status === "priced" ? `${deliveryQuote.net.toFixed(2).replace(".", ",")} € netto (${deliveryQuote.brutto.toFixed(2).replace(".", ",")} € brutto) – Lieferung + Abholung, Tarif ${deliveryQuote.tarif} nach ${escapeHtml(deliveryQuote.product_name)}, ${deliveryQuote.distance_km ?? deliveryQuote.km} km (Stufe bis ${deliveryQuote.band} km)${deliveryQuote.two_machines ? ", Aufschlag 2 Maschinen" : ""}` : deliveryQuote.status === "on_request" ? (deliveryQuote.reason === "tieflader" ? `Auf Anfrage – Tieflader nötig (${escapeHtml(deliveryQuote.product_name ?? "")})` : "Auf Anfrage – Entfernung über 50 km oder nicht ermittelbar") : "–"}</td></tr>` : ""}`
      : `<tr><td style="padding: 4px 0; color: #6b7280;">Lieferung:</td><td style="padding: 4px 0;">Selbstabholung</td></tr>`;

    const setupServiceHtml = setupServiceRequested
      ? `<tr><td style="padding: 4px 0; color: #6b7280;">Betreuung / Auf- & Abbau:</td><td style="padding: 4px 0; font-weight: 500; color: #16a34a;">✓ Ja, gewünscht</td></tr>`
      : '';

    const weekendDays = [useSaturday === true ? "Samstag" : null, useSunday === true ? "Sonntag" : null].filter(Boolean).join(" und ");
    const weekendHtml = weekendDays
      ? `<tr><td style="padding: 4px 0; color: #6b7280;">Wochenende:</td><td style="padding: 4px 0;">${escapeHtml(weekendDays)} als Nutzungstag gewünscht</td></tr>`
      : '';
    const estimateHtml = priceEstimate
      ? `<tr><td style="padding: 4px 0; color: #6b7280;">Preisschätzung:</td><td style="padding: 4px 0;">${escapeHtml(String(priceEstimate).slice(0, 300))} (unverbindlich)</td></tr>`
      : '';

    // Raw values still needed for non-HTML contexts (mail headers, telephone link)
    const ALLOWED_LOC_EMAILS = ["krefeld@slt-rental.de", "bonn@slt-rental.de", "muelheim@slt-rental.de", "mieten@slt-rental.de", "info@slt-rental.de"];
    const locEmail = ALLOWED_LOC_EMAILS.includes(String(locationEmail ?? "").trim().toLowerCase())
      ? String(locationEmail).trim().toLowerCase()
      : "mieten@slt-rental.de";
    const locPhone = locationPhone || "02151 417 99 04";

    const footerHtml = `
    <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 12px; line-height: 1.6;">
      ${COMPANY_NAME}<br>
      Standort ${e.locationName}: ${e.locAddress}<br>
      Tel: ${e.locPhone} · E-Mail: <a href="mailto:${e.locEmail}" style="color: #f97316;">${e.locEmail}</a><br>
      <a href="https://www.slt-rental.de" style="color: #f97316;">www.slt-rental.de</a>
    </p>`;

    // ── Internal notification email ──
    const internalHtml = `
<div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
  <div style="background: #ffffff; padding: 20px; text-align: center; border-bottom: 3px solid #f97316;">
    <img src="${SLT_LOGO}" alt="SLT Rental" style="height: 50px; max-width: 200px;" />
  </div>
  <div style="padding: 24px;">
    <h2 style="color: #1a1a1a; margin-top: 0;">Neue Mietanfrage</h2>
    <p style="margin: 0 0 12px;"><a href="${portalLink}" style="display:inline-block;background:#ff8e02;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:6px;font-weight:bold;">Im B2B-Portal bearbeiten</a></p>
    <p style="color:#6b7280;font-size:12px;margin:0 0 12px;">Bitte die Anfrage im Portal übernehmen, damit klar ist, wer sie bearbeitet.</p>
    <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
      <strong style="color: #ea580c;">${requestedItems.length > 1 ? `${requestedItems.length} Artikel` : "Artikel:"}</strong> ${requestedItems.length > 1 ? "" : e.productName}<br>
      <strong style="color: #ea580c;">Standort:</strong> ${e.locationName}
    </div>
    ${itemsTableHtml}
    <h3 style="color: #374151;">Kontaktdaten</h3>
    ${inquiryDiscount ? `<p>${escapeHtml(BANK_DISCOUNT_TERMS)}</p>` : ""}
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 4px 0; color: #6b7280; width: 100px;">Name:</td><td style="padding: 4px 0; font-weight: 500;">${e.name}</td></tr>
      <tr><td style="padding: 4px 0; color: #6b7280;">E-Mail:</td><td style="padding: 4px 0;"><a href="mailto:${e.email}" style="color: #f97316;">${e.email}</a></td></tr>
      <tr><td style="padding: 4px 0; color: #6b7280;">Telefon:</td><td style="padding: 4px 0;">${e.phone}</td></tr>
      <tr><td style="padding: 4px 0; color: #6b7280;">Kundenart:</td><td style="padding: 4px 0;">${customerKind === "business" ? "Geschäftskunde (B2B)" : "Privatkunde (B2C)"}</td></tr>
      ${customerAddress ? `<tr><td style="padding: 4px 0; color: #6b7280;">Adresse:</td><td style="padding: 4px 0;">${e.customerAddress}</td></tr>` : ""}
      <tr><td style="padding: 4px 0; color: #6b7280;">Zeitraum:</td><td style="padding: 4px 0;">${e.dateRange}</td></tr>
      ${timeRange ? `<tr><td style="padding: 4px 0; color: #6b7280;">Uhrzeiten:</td><td style="padding: 4px 0;">${e.timeRange}</td></tr>` : ""}
      ${deliveryHtml}
      ${setupServiceHtml}
      ${weekendHtml}
      ${estimateHtml}
    </table>
    ${message ? `<h3 style="color: #374151;">Nachricht</h3><p style="color: #374151; white-space: pre-wrap; background: #f9fafb; padding: 12px; border-radius: 6px;">${e.message}</p>` : ""}
    ${safeAttachments.length ? `<p style="color: #374151; margin-top: 16px;"><strong>📎 ${safeAttachments.length} Bild(er) vom Aufstellort</strong> sind dieser E-Mail als Anhang beigefügt.</p>` : ""}
    ${footerHtml}
  </div>
</div>`.trim();

    // ── Customer confirmation email ──
    const confirmationHtml = `
<div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
  <div style="background: #ffffff; padding: 20px; text-align: center; border-bottom: 3px solid #f97316;">
    <img src="${SLT_LOGO}" alt="SLT Rental" style="height: 50px; max-width: 200px;" />
  </div>
  <div style="padding: 24px;">
    <h2 style="color: #1a1a1a; margin-top: 0;">Vielen Dank für Ihre Anfrage!</h2>
    <p style="color: #374151; line-height: 1.6;">
      Hallo ${e.name},<br><br>
      wir haben Ihre Mietanfrage erhalten und werden uns schnellstmöglich bei Ihnen melden – in der Regel innerhalb eines Werktages.
    </p>
    <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
      <strong style="color: #ea580c;">${requestedItems.length > 1 ? "Ihre Artikel:" : "Artikel:"}</strong> ${requestedItems.length > 1 ? "" : e.productName}<br>
      <strong style="color: #ea580c;">Standort:</strong> ${e.locationName}<br>
      <strong style="color: #ea580c;">Zeitraum:</strong> ${e.dateRange}
      ${timeRange ? `<br><strong style="color: #ea580c;">Uhrzeiten:</strong> ${e.timeRange}` : ""}
      ${deliveryRequested ? `<br><strong style="color: #ea580c;">Lieferung an:</strong> ${e.deliveryStreet}, ${e.deliveryPostalCode} ${e.deliveryCity}` : ""}
      ${setupServiceRequested ? `<br><strong style="color: #ea580c;">Betreuung / Auf- & Abbau:</strong> Gewünscht` : ""}
    </div>
    ${itemsTableHtml}
    <p style="color: #374151; line-height: 1.6;">
      ${inquiryDiscount ? `${escapeHtml(BANK_DISCOUNT_TERMS)}<br><br>` : ""}
      Falls Sie in der Zwischenzeit Fragen haben, erreichen Sie uns unter <a href="tel:${escapeHtml(locPhone.replace(/\s/g, ''))}" style="color: #f97316;">${e.locPhone}</a> oder per E-Mail an <a href="mailto:${e.locEmail}" style="color: #f97316;">${e.locEmail}</a>.
    </p>
    <p style="color: #374151;">
      Mit freundlichen Grüßen,<br>
      <strong>Ihr SLT Rental Team – Standort ${e.locationName}</strong>
    </p>
    ${footerHtml}
  </div>
</div>`.trim();

    if (RESEND_API_KEY) {
      // Send internal notification
      const res1 = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
          ...(cartRequestId ? { "Idempotency-Key": `public-cart-${cartRequestId}-internal` } : {}),
        },
        body: JSON.stringify({
          from: "Anfragen <anfragen@slt-rental.de>",
          to: [operationalEmailRecipient(String(email), locEmail)],
          reply_to: email,
          subject: `Mietanfrage: ${productName}${requestedItems.length > 1 ? ` + ${requestedItems.length - 1} weitere` : ""} – ${locationName}`,
          html: internalHtml,
          ...(safeAttachments.length ? { attachments: safeAttachments } : {}),
        }),
      });
      if (!res1.ok) console.error("Resend internal error:", await res1.text());

      // Send customer confirmation
      const res2 = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
          ...(cartRequestId ? { "Idempotency-Key": `public-cart-${cartRequestId}-customer` } : {}),
        },
        body: JSON.stringify({
          from: "SLT Rental <anfragen@slt-rental.de>",
          to: [email],
          subject: `Ihre Mietanfrage: ${productName} – Bestätigung`,
          html: confirmationHtml,
        }),
      });
      if (!res2.ok) console.error("Resend confirmation error:", await res2.text());
      if (cartRequestId && inquiryId && db) await db.from("rental_inquiries").update({ email_sent: res1.ok && res2.ok }).eq("id", inquiryId);
    } else {
      console.log("=== INQUIRY (no RESEND_API_KEY) ===");
      console.log("Inquiry received (email not sent)", { locationName });
    }

    return new Response(
      JSON.stringify({ success: true, order_code: storedInquiry?.order_code ?? null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err) {
    console.error("send-inquiry-email error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
