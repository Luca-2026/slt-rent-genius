/**
 * Sendet nach Zahlungseingang die Auftragsbestätigung zu einem angenommenen
 * Angebot (Miet- oder Verkaufsanfrage). Erst mit Zugang dieser Bestätigung
 * kommt der Auftrag verbindlich zustande.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { generateOfferPdf } from "../_shared/offer-pdf.ts";
import { normalizeImageUrl, resolveImagesByName } from "../_shared/product-images.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const LOCATION_CONTACTS: Record<string, { name: string; email: string; phone: string }> = {
  krefeld: { name: "Krefeld", email: "krefeld@slt-rental.de", phone: "02151 417 99 04" },
  bonn: { name: "Bonn", email: "bonn@slt-rental.de", phone: "0228 504 660 61" },
  muelheim: { name: "Mülheim an der Ruhr", email: "muelheim@slt-rental.de", phone: "02151 417 99 04" },
};
function locKey(raw: unknown): string {
  const v = String(raw ?? "").toLowerCase();
  if (v.includes("bonn")) return "bonn";
  if (v.includes("mülheim") || v.includes("muelheim") || v.includes("mulheim")) return "muelheim";
  return "krefeld";
}
const esc = (s: unknown) =>
  s === null || s === undefined ? "" : String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
const money = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n || 0);
const fmtDate = (raw: unknown) => {
  const v = typeof raw === "string" ? raw.slice(0, 10) : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return "";
  const [y, m, d] = v.split("-");
  return `${d}.${m}.${y}`;
};

/** Spiegel von src/lib/orderConfirmation.ts (dort mit Tests). */
const toCents = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 0;
};
const INVOICE_TERMS = new Set(["net_7", "net_14", "net_30"]);
function evaluateOrderPayment(input: { gross: unknown; deposit?: unknown; payments: { amount: unknown }[]; paymentTerms?: unknown }) {
  const grossCents = toCents(input.gross);
  const depositCents = toCents(input.deposit);
  const requiredCents = grossCents + depositCents;
  const paidCents = input.payments.reduce((s: number, p) => s + toCents(p?.amount), 0);
  const openCents = Math.max(0, requiredCents - paidCents);
  const overpaidCents = Math.max(0, paidCents - requiredCents);
  const paysOnInvoice = INVOICE_TERMS.has(String(input.paymentTerms ?? ""));
  const state = grossCents <= 0 ? "no_total" : paidCents <= 0 ? "none" : openCents > 0 ? "partial" : "full";
  let blockReason: string | null = null;
  if (state === "no_total") blockReason = "Zu diesem Angebot ist keine Angebotssumme gespeichert.";
  else if (state === "none" && !paysOnInvoice)
    blockReason = "Es ist noch kein Zahlungseingang erfasst. Die Auftragsbestätigung kann erst nach Zahlungseingang versendet werden.";
  return {
    state, grossCents, depositCents, requiredCents, paidCents, openCents, overpaidCents, paysOnInvoice,
    canSend: blockReason === null,
    needsAcknowledgement: state === "partial" || (state === "none" && paysOnInvoice),
    blockReason,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });
    const { data: u } = await service.auth.getUser(auth.replace("Bearer ", ""));
    const user = u?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { data: isStaff } = await service.rpc("is_staff_member", { _user_id: user.id });
    if (!isStaff) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => null);
    const inquiryType = body?.inquiry_type;
    const inquiryId = body?.inquiry_id;
    if (inquiryType !== "rental" && inquiryType !== "sales") return json({ error: "inquiry_type ungültig" }, 400);
    if (typeof inquiryId !== "string" || inquiryId.length < 10) return json({ error: "inquiry_id fehlt" }, 400);
    const note = typeof body?.note === "string" ? body.note.trim().slice(0, 800) : "";
    const senderName = typeof body?.sender_name === "string" ? body.sender_name.trim().slice(0, 120) : "";
    const attachPdf = body?.attach_pdf === true;

    const table = inquiryType === "rental" ? "rental_inquiries" : "sales_inquiries";
    const { data: inq } = await service.from(table).select("*").eq("id", inquiryId).maybeSingle();
    if (!inq) return json({ error: "Anfrage nicht gefunden" }, 404);
    if (inq.status !== "accepted") return json({ error: "Nur angenommene Angebote können bestätigt werden." }, 400);
    if (!inq.offer_number) return json({ error: "Zu dieser Anfrage gibt es kein Angebot." }, 400);
    if (!inq.customer_email) return json({ error: "Keine Kunden-E-Mail hinterlegt." }, 400);

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) return json({ error: "E-Mail-Versand nicht konfiguriert" }, 500);

    const payload = (inq.offer_payload ?? {}) as Record<string, any>;
    const items: any[] = Array.isArray(payload.items) ? payload.items : [];
    const payments: any[] = (Array.isArray(inq.payments) ? inq.payments : []).filter((p) => toCents(p?.amount) > 0);
    const ev = evaluateOrderPayment({
      gross: inq.offer_total_gross ?? payload?.totals?.grossAmount,
      deposit: payload?.deposit,
      payments,
      paymentTerms: payload?.payment_terms,
    });

    // Server rechnet selbst – Anzeige im Portal darf nicht veraltet sein.
    if (
      Number(body?.expected_paid_cents) !== ev.paidCents ||
      Number(body?.expected_required_cents) !== ev.requiredCents
    ) {
      return json({ error: "Die Zahlungen oder die Angebotssumme wurden inzwischen geändert. Bitte die Anfrage neu laden und erneut prüfen." }, 409);
    }
    if (!ev.canSend) return json({ error: ev.blockReason }, 400);
    if (ev.needsAcknowledgement && body?.acknowledge_open !== true) {
      return json({ error: "Offener Betrag muss vor dem Versand ausdrücklich bestätigt werden." }, 400);
    }

    const gross = ev.grossCents / 100;
    const deposit = ev.depositCents / 100;
    const required = ev.requiredCents / 100;
    const paid = ev.paidCents / 100;
    const open = ev.openCents / 100;

    const customerName = inquiryType === "rental"
      ? inq.customer_name || ""
      : [inq.first_name, inq.last_name].filter(Boolean).join(" ");
    const loc = LOCATION_CONTACTS[locKey(inq.location)];
    const period = inquiryType === "rental" && inq.start_date
      ? `${fmtDate(inq.start_date)}${inq.start_time ? `, ${String(inq.start_time).slice(0, 5)} Uhr` : ""}${inq.end_date ? ` bis ${fmtDate(inq.end_date)}${inq.end_time ? `, ${String(inq.end_time).slice(0, 5)} Uhr` : ""}` : ""}`
      : "";

    const rows = items.map((i) => {
      const qty = Number(i.quantity) || 1;
      const range = i.rental_start ? ` (${fmtDate(i.rental_start)}${i.rental_end ? ` – ${fmtDate(i.rental_end)}` : ""})` : "";
      return `<tr><td style="padding:6px 0;border-bottom:1px solid #e2e8f0;">${esc(i.product_name)}${esc(range)}</td><td style="padding:6px 0;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;">${qty} ×</td></tr>`;
    }).join("");

    const dueWhen = inquiryType === "rental" ? "spätestens vor Mietbeginn" : "spätestens vor Übergabe";
    const ref = `Verwendungszweck: ${esc(inq.offer_number)}`;
    let intro: string;
    let statusLine: string;
    if (ev.state === "full") {
      intro = `vielen Dank – Ihre Zahlung ist vollständig bei uns eingegangen.`;
      statusLine = `<p style="margin:4px 0;"><strong>Der Betrag ist vollständig beglichen.</strong></p>`;
    } else if (ev.state === "partial") {
      intro = `vielen Dank – Ihre Teilzahlung über ${money(paid)} ist bei uns eingegangen.`;
      statusLine = ev.paysOnInvoice
        ? `<p style="margin:4px 0;">Offener Restbetrag: <strong>${money(open)}</strong> – fällig gemäß den vereinbarten Zahlungsbedingungen.</p>`
        : `<p style="margin:4px 0;">Offener Restbetrag: <strong>${money(open)}</strong> – bitte ${dueWhen} überweisen (${ref}).</p>`;
    } else {
      intro = `vielen Dank für Ihren Auftrag.`;
      statusLine = `<p style="margin:4px 0;">Zahlung: <strong>${money(required)}</strong> – fällig gemäß den vereinbarten Zahlungsbedingungen nach Rechnungsstellung. Bisher ist noch keine Zahlung eingegangen.</p>`;
    }
    const paymentList = payments.length
      ? `<p style="margin:4px 0;">Eingegangene Zahlungen: <strong>${money(paid)}</strong></p><ul style="margin:4px 0 4px 18px;padding:0;">${payments.map((p) => `<li>${p?.date ? `${esc(fmtDate(p.date))}: ` : ""}${money(toCents(p.amount) / 100)}</li>`).join("")}</ul>`
      : "";
    const overLine = ev.overpaidCents > 0
      ? `<p style="margin:4px 0;">Sie haben ${money(ev.overpaidCents / 100)} mehr überwiesen als vereinbart. Wir melden uns dazu bei Ihnen.</p>`
      : "";

    const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:16px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
<div style="max-width:600px;margin:0 auto;">
  <h2 style="color:#00507d;margin:0 0 16px;">Auftragsbestätigung zu Angebot ${esc(inq.offer_number)}</h2>
  <p>Hallo ${esc(customerName)},</p>
  <p>${intro} Hiermit bestätigen wir Ihnen verbindlich den Auftrag auf Grundlage unseres Angebots <strong>${esc(inq.offer_number)}</strong>.</p>
  ${period ? `<p><strong>Mietzeitraum:</strong> ${esc(period)}<br><strong>Standort:</strong> ${esc(loc.name)}</p>` : ""}
  ${rows ? `<table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0;">${rows}</table>` : ""}
  <div style="background:#f1f5f9;border-radius:6px;padding:12px 16px;margin:16px 0;">
    <p style="margin:4px 0;">Auftragssumme brutto: <strong>${money(gross)}</strong></p>
    ${deposit > 0 ? `<p style="margin:4px 0;">Kaution: <strong>${money(deposit)}</strong> (wird nach ordnungsgemäßer Rückgabe erstattet)</p><p style="margin:4px 0;">Gesamt zu zahlen: <strong>${money(required)}</strong></p>` : ""}
    ${paymentList}
    ${statusLine}
    ${overLine}
  </div>
  ${note ? `<p style="white-space:pre-wrap;border-left:4px solid #00507d;padding:8px 16px;">${esc(note)}</p>` : ""}
  <div style="background:#fff7ed;border-left:4px solid #ff8e02;padding:12px 16px;margin:20px 0;border-radius:4px;font-size:14px;">
    <strong>Verbindliche Auftragsannahme:</strong> Mit dieser Auftragsbestätigung haben wir Ihren Auftrag angenommen – die Miete ist damit verbindlich vereinbart. Diese Auftragsbestätigung dient Ihnen als Nachweis der Auftragsannahme. Es gelten unsere Allgemeinen Geschäftsbedingungen.
  </div>
  <p>Bei Fragen erreichen Sie uns am Standort ${esc(loc.name)} unter Tel. ${esc(loc.phone)} oder <a href="mailto:${esc(loc.email)}" style="color:#00507d;">${esc(loc.email)}</a>.</p>
  <p style="margin-top:24px;">Freundliche Grüße<br>${senderName ? `${esc(senderName)}<br>` : ""}Ihr SLT Rental Team – Standort ${esc(loc.name)}</p>
</div></body></html>`;

    // ── Optional: Auftragsbestätigung als PDF (gleiches Layout wie Angebot/Rechnung) ──
    const confirmationNumber = String(inq.offer_number).replace(/^ANG-/, "AB-");
    let pdfAttachment: { filename: string; content: string } | null = null;
    let fileUrl: string | null = null;
    if (attachPdf) {
      const isBusiness = inq.customer_kind === "business";
      const companyName = inq.company_name || "";
      const street = inquiryType === "rental" ? inq.customer_street : (inq.billing_street || inq.delivery_street);
      const zip = inquiryType === "rental" ? inq.customer_postal_code : (inq.billing_postal_code || inq.delivery_postal_code);
      const city = inquiryType === "rental" ? inq.customer_city : (inq.billing_city || inq.delivery_city);
      const sameName = companyName && companyName.trim() === customerName.trim();
      const profile = {
        id: "",
        company_name: companyName || customerName || "Kunde",
        legal_form: null,
        contact_first_name: sameName ? "" : customerName,
        contact_last_name: "",
        street: street || "", house_number: "", postal_code: zip || "", city: city || "",
        country: "Deutschland",
        tax_id: inq.vat_id || null,
        show_tax_id: isBusiness && Boolean(inq.vat_id),
        contact_email: inq.customer_email,
        contact_phone: inq.customer_phone || null,
        credit_limit: 0,
        payment_due_days: 14,
      };
      const pdfItems = items.map((i) => ({
        product_name: i.product_name,
        description: i.description,
        quantity: Number(i.quantity) || 0,
        unit: i.unit,
        unit_price: Number(i.unit_price) || 0,
        discount_percent: Number(i.discount_percent) || 0,
        total_price: Math.round((Number(i.quantity) || 0) * (Number(i.unit_price) || 0) * (1 - (Number(i.discount_percent) || 0) / 100) * 100) / 100,
        rental_start: i.rental_start,
        rental_end: i.rental_end,
        image_url: normalizeImageUrl(i.image_url) as string | null,
      }));
      const missing = pdfItems.filter((i) => !i.image_url).map((i) => i.product_name);
      if (missing.length) {
        try {
          const resolved = await resolveImagesByName(service, missing);
          for (const it of pdfItems) if (!it.image_url) it.image_url = resolved.get((it.product_name || "").trim().toLowerCase()) || null;
        } catch (e) { console.error("Bildauflösung fehlgeschlagen:", e); }
      }
      const num = (v: unknown) => Number(v) || 0;
      const servicesWithPrices: any[] = items.flatMap((item, idx) =>
        (Array.isArray(item.addons) ? item.addons : [])
          .filter((a: any) => num(a?.amount) > 0)
          .map((a: any, ai: number) => ({
            id: `${idx}-${a.key || ai}`,
            name: a.note ? `${a.label} (${a.note})` : a.label,
            pricePercent: null,
            amount: num(a.amount),
            allocations: [{ itemIndex: idx, amount: num(a.amount) }],
          })),
      );
      if (num(payload.setup_cost) > 0) servicesWithPrices.push({ id: "setup", name: "Aufbau / Montage vor Ort", pricePercent: null, amount: num(payload.setup_cost), allocations: [] });
      if (num(payload.dismantle_cost) > 0) servicesWithPrices.push({ id: "dismantle", name: "Abbau / Demontage vor Ort", pricePercent: null, amount: num(payload.dismantle_cost), allocations: [] });
      const totals = payload.totals ?? {};
      const deliveryAddress = payload.delivery_requested ? payload.delivery_address : undefined;
      const today = new Date();
      const pdfBytes = await generateOfferPdf({
        documentType: "order_confirmation",
        offerNumber: confirmationNumber,
        offerDate: today.toISOString().slice(0, 10),
        validUntil: "",
        profile,
        items: pdfItems,
        deliveryCost: num(payload.delivery_cost_delivery) + num(payload.delivery_cost_return),
        deliveryCostDelivery: num(payload.delivery_cost_delivery),
        deliveryCostReturn: num(payload.delivery_cost_return),
        servicesSurcharge: servicesWithPrices.reduce((s, x) => s + x.amount, 0),
        servicesWithPrices,
        netAmount: num(totals.netAmount),
        vatRate: num(totals.vatRate) || 19,
        vatAmount: num(totals.vatAmount),
        grossAmount: gross,
        isReverseCharge: false,
        notes: note || null,
        validDays: 0,
        deposit,
        staffName: senderName || "SLT Rental",
        issuingLocation: locKey(inq.location),
        deliveryAddress,
        paymentTerms: payload.payment_terms,
        paymentTermsCustom: payload.payment_terms_custom || undefined,
        sourceOfferNumber: inq.offer_number,
        sourceOfferDate: typeof inq.offer_sent_at === "string" ? inq.offer_sent_at.slice(0, 10) : undefined,
        servicePeriodStart: inquiryType === "rental" && inq.start_date ? `${inq.start_date}${inq.start_time ? " " + String(inq.start_time).slice(0, 5) : ""}` : undefined,
        servicePeriodEnd: inquiryType === "rental" && inq.end_date ? `${inq.end_date}${inq.end_time ? " " + String(inq.end_time).slice(0, 5) : ""}` : undefined,
        payments: payments.map((p) => ({ date: p?.date, amount: toCents(p?.amount) / 100, label: p?.label, reference: p?.reference })),
      });
      const safeName = String(profile.company_name)
        .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue").replace(/ß/g, "ss")
        .replace(/[^a-zA-Z0-9_\- ]/g, "_").replace(/\s+/g, "_");
      const fileName = `Auftragsbestaetigung_SLTRental_${confirmationNumber}_${safeName}.pdf`;
      const filePath = `inquiry-order-confirmations/${inquiryType}/${inquiryId}/${fileName}`;
      const { error: upErr } = await service.storage.from("b2b-invoices")
        .upload(filePath, pdfBytes, { contentType: "application/pdf", upsert: true });
      if (upErr) {
        console.error("Upload error:", upErr.message);
        return json({ error: "PDF der Auftragsbestätigung konnte nicht gespeichert werden." }, 500);
      }
      const { data: signed } = await service.storage.from("b2b-invoices").createSignedUrl(filePath, 60 * 60 * 24 * 365);
      fileUrl = signed?.signedUrl || null;
      pdfAttachment = { filename: fileName, content: encodeBase64(pdfBytes) };
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
        to: [inq.customer_email],
        cc: Array.from(new Set([loc.email, inq.location_email].filter((e) => e && e !== inq.customer_email))),
        reply_to: loc.email,
        subject: `Auftragsbestätigung zu Ihrem Angebot ${inq.offer_number}`,
        html: pdfAttachment
          ? html.replace("</h2>", `</h2><p style="color:#6b7280;font-size:13px;margin-top:-8px;">Die Auftragsbestätigung ${esc(confirmationNumber)} finden Sie zusätzlich als PDF im Anhang.</p>`)
          : html,
        ...(pdfAttachment ? { attachments: [pdfAttachment] } : {}),
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      console.error("Resend error", res.status, t);
      return json({ error: "E-Mail-Versand fehlgeschlagen", status: res.status, details: t }, 502);
    }

    const now = new Date();
    const line = `[${now.toLocaleString("de-DE")}] Auftragsbestätigung zu ${inq.offer_number} versendet${senderName ? ` von ${senderName}` : ""}`;
    await service.from(table).update({
      order_confirmed_at: now.toISOString(),
      order_confirmed_by_name: senderName || null,
      ...(fileUrl ? { order_confirmation_number: confirmationNumber, order_confirmation_file_url: fileUrl } : {}),
      internal_notes: [inq.internal_notes, line].filter(Boolean).join("\n"),
    }).eq("id", inquiryId);

    return json({ success: true, file_url: fileUrl });
  } catch (err) {
    console.error("send-order-confirmation error", err);
    return json({ error: err instanceof Error ? err.message : "Unbekannter Fehler" }, 500);
  }
});
