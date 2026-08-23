/**
 * Sends a priced offer for a public rental or sales inquiry that is being
 * processed inside the B2B portal.
 *
 * - Caller must be an admin or an active staff member (verified via JWT).
 * - PDF is created with the shared offer PDF generator (same layout as B2B offers).
 * - The customer is asked to confirm acceptance by replying to the location mailbox;
 *   the job is then created manually in Rentware.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { generateOfferPdf } from "../_shared/offer-pdf.ts";
import {
  LOCATION_CONTACTS,
  buildOfferTotals,
  normalizeInquiryOfferItems,
  resolveLocationKey,
  type InquiryOfferItem,
} from "./offer-math.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const money = (n: number) =>
  new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " €";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const token = authHeader.replace("Bearer ", "");
    const service = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: userData, error: userErr } = await service.auth.getUser(token);
    const user = userData?.user;
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const { data: isStaff } = await service.rpc("is_staff_member", { _user_id: user.id });
    if (!isStaff) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return json({ error: "Ungültige Anfrage" }, 400);

    const inquiryType = body.inquiry_type;
    const inquiryId = body.inquiry_id;
    if (inquiryType !== "rental" && inquiryType !== "sales") {
      return json({ error: "inquiry_type muss 'rental' oder 'sales' sein" }, 400);
    }
    if (typeof inquiryId !== "string" || inquiryId.length < 10) {
      return json({ error: "inquiry_id fehlt" }, 400);
    }

    let items: InquiryOfferItem[];
    try {
      items = normalizeInquiryOfferItems(body.items);
    } catch (e) {
      return json({ error: (e as Error).message }, 400);
    }

    const table = inquiryType === "rental" ? "rental_inquiries" : "sales_inquiries";
    const { data: inquiry, error: inqErr } = await service
      .from(table)
      .select("*")
      .eq("id", inquiryId)
      .maybeSingle();
    if (inqErr || !inquiry) return json({ error: "Anfrage nicht gefunden" }, 404);

    const customerEmail: string | null = inquiry.customer_email;
    if (!customerEmail) return json({ error: "Anfrage hat keine E-Mail-Adresse" }, 400);

    const deliveryCostDelivery = Number(body.delivery_cost_delivery) || 0;
    const deliveryCostReturn = Number(body.delivery_cost_return) || 0;
    const deposit = Number(body.deposit) || 0;
    const validDays = Number(body.valid_days) > 0 ? Math.min(Number(body.valid_days), 180) : 14;
    const notes: string | null = typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : null;

    const totals = buildOfferTotals(items, deliveryCostDelivery + deliveryCostReturn);

    const locationKey = resolveLocationKey(body.location || inquiry.location);
    const loc = LOCATION_CONTACTS[locationKey];

    const { data: numberData, error: numErr } = await service.rpc("generate_inquiry_offer_number");
    if (numErr || !numberData) {
      console.error("Nummernkreis fehlgeschlagen:", numErr?.message);
      return json({ error: "Angebotsnummer konnte nicht erzeugt werden" }, 500);
    }
    const offerNumber = String(numberData);

    const customerName = inquiryType === "rental"
      ? (inquiry.customer_name || "")
      : [inquiry.first_name, inquiry.last_name].filter(Boolean).join(" ");

    const profile = {
      id: inquiry.id,
      company_name: inquiry.company_name || customerName || "Kunde",
      legal_form: null,
      contact_first_name: inquiryType === "rental" ? customerName : (inquiry.first_name || ""),
      contact_last_name: inquiryType === "rental" ? "" : (inquiry.last_name || ""),
      street: inquiryType === "rental" ? (inquiry.customer_street || "") : (inquiry.billing_street || inquiry.delivery_street || ""),
      house_number: "",
      postal_code: inquiryType === "rental" ? (inquiry.customer_postal_code || "") : (inquiry.billing_postal_code || inquiry.delivery_postal_code || ""),
      city: inquiryType === "rental" ? (inquiry.customer_city || "") : (inquiry.billing_city || inquiry.delivery_city || ""),
      country: "Deutschland",
      tax_id: inquiry.vat_id || null,
      credit_limit: 0,
      payment_due_days: 14,
    };

    const today = new Date();
    const validUntil = new Date(today.getTime() + validDays * 86400000);
    const fmt = (d: Date) => d.toLocaleDateString("de-DE");

    const staffName = String(body.staff_name || "").slice(0, 120) || (user.email ?? "SLT Rental");

    const pdfBytes = await generateOfferPdf({
      offerNumber,
      offerDate: fmt(today),
      validUntil: fmt(validUntil),
      profile,
      items: items.map((i) => ({
        product_name: i.product_name,
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unit_price,
        discount_percent: i.discount_percent,
        rental_start: i.rental_start,
        rental_end: i.rental_end,
      })),
      deliveryCost: deliveryCostDelivery + deliveryCostReturn,
      deliveryCostDelivery,
      deliveryCostReturn,
      servicesSurcharge: 0,
      servicesWithPrices: [],
      netAmount: totals.netAmount,
      vatRate: totals.vatRate,
      vatAmount: totals.vatAmount,
      grossAmount: totals.grossAmount,
      isReverseCharge: false,
      notes,
      validDays,
      deposit,
      additionalServices: [],
      staffName,
      issuingLocation: locationKey,
    });

    const safeName = (profile.company_name || "Kunde")
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
      .replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue").replace(/ß/g, "ss")
      .replace(/[^a-zA-Z0-9_\- ]/g, "_").replace(/\s+/g, "_");
    const fileName = `Angebot_SLTRental_${offerNumber}_${safeName}.pdf`;
    const filePath = `inquiry-offers/${inquiryType}/${inquiry.id}/${fileName}`;

    const { error: uploadError } = await service.storage
      .from("b2b-invoices")
      .upload(filePath, pdfBytes, { contentType: "application/pdf", upsert: true });
    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      return json({ error: "Angebots-PDF konnte nicht gespeichert werden" }, 500);
    }

    const { data: signed } = await service.storage
      .from("b2b-invoices")
      .createSignedUrl(filePath, 60 * 60 * 24 * 365);
    const fileUrl = signed?.signedUrl || "";

    // ── E-Mail an den Kunden ──
    const resendKey = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;

    const rowsHtml = items.map((i) => `
      <tr>
        <td style="padding:6px 0;border-bottom:1px solid #e5e7eb;">${escapeHtml(i.product_name)}${i.description ? `<br><span style="color:#6b7280;font-size:12px;">${escapeHtml(i.description)}</span>` : ""}</td>
        <td style="padding:6px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${i.quantity}</td>
        <td style="padding:6px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${money(i.unit_price)}</td>
      </tr>`).join("");

    const emailHtml = `<!doctype html><html><body style="margin:0;padding:24px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
<div style="max-width:600px;margin:0 auto;">
  <h2 style="color:#00507d;margin:0 0 16px;">Ihr Angebot ${escapeHtml(offerNumber)}</h2>
  <p>Hallo ${escapeHtml(customerName || "")},</p>
  <p>vielen Dank für Ihre Anfrage. Anbei erhalten Sie unser Angebot als PDF.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
    <tr><th align="left" style="border-bottom:2px solid #00507d;padding-bottom:6px;">Position</th><th align="right" style="border-bottom:2px solid #00507d;">Menge</th><th align="right" style="border-bottom:2px solid #00507d;">Einzelpreis</th></tr>
    ${rowsHtml}
  </table>
  <p style="font-size:15px;"><strong>Gesamtsumme brutto: ${money(totals.grossAmount)}</strong><br>
  <span style="color:#6b7280;font-size:13px;">Netto ${money(totals.netAmount)} zzgl. ${totals.vatRate}% MwSt. (${money(totals.vatAmount)})</span></p>
  <div style="background:#fff7ed;border-left:4px solid #ff8e02;padding:12px 16px;margin:20px 0;border-radius:4px;">
    <strong>So nehmen Sie das Angebot an:</strong><br>
    Bitte bestätigen Sie uns die Annahme kurz per E-Mail an
    <a href="mailto:${escapeHtml(loc.email)}" style="color:#00507d;">${escapeHtml(loc.email)}</a>.
    Wir reservieren die Artikel anschließend verbindlich für Sie und melden uns mit allen Details zur Abholung bzw. Lieferung.
  </div>
  <p style="color:#6b7280;font-size:13px;">Dieses Angebot ist gültig bis ${escapeHtml(fmt(validUntil))}.</p>
  ${notes ? `<p style="white-space:pre-wrap;">${escapeHtml(notes)}</p>` : ""}
  <p style="margin-top:24px;">Freundliche Grüße<br>Ihr SLT Rental Team – Standort ${escapeHtml(loc.name)}<br>
  Tel. ${escapeHtml(loc.phone)} · <a href="mailto:${escapeHtml(loc.email)}" style="color:#00507d;">${escapeHtml(loc.email)}</a></p>
</div></body></html>`;

    if (resendKey) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
            to: [customerEmail],
            cc: [loc.email],
            reply_to: loc.email,
            subject: `Ihr Angebot von SLT Rental – ${offerNumber}`,
            html: emailHtml,
            attachments: [{ filename: fileName, content: encodeBase64(pdfBytes) }],
          }),
        });
        if (res.ok) emailSent = true;
        else console.error("Resend error:", res.status, await res.text());
      } catch (err) {
        console.error("Resend exception:", err);
      }
    } else {
      console.log("RESEND_API_KEY fehlt – Angebot wurde nur erzeugt, nicht versendet");
    }

    const { error: updErr } = await service
      .from(table)
      .update({
        status: "offer_sent",
        offer_number: offerNumber,
        offer_file_url: fileUrl,
        offer_total_gross: totals.grossAmount,
        offer_sent_at: new Date().toISOString(),
      })
      .eq("id", inquiry.id);
    if (updErr) console.error("Status-Update fehlgeschlagen:", updErr.message);

    return json({
      success: true,
      offer_number: offerNumber,
      file_url: fileUrl,
      email_sent: emailSent,
      totals,
    });
  } catch (err) {
    console.error("send-inquiry-offer error:", err);
    return json({ error: "Interner Fehler" }, 500);
  }
});
