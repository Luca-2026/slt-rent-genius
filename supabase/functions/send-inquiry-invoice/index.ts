/**
 * Erstellt und versendet eine Rechnung (oder einen Nachtrag) zu einer Miet-
 * oder Verkaufsanfrage aus dem internen Portal.
 *
 * - Aufrufer muss Admin oder aktiver Mitarbeiter sein (JWT-Prüfung).
 * - Das PDF entsteht mit dem gemeinsamen Angebots-/Rechnungsgenerator,
 *   damit Layout und Aufbau identisch zum Angebot sind.
 * - Rechnungsnummern kommen aus der Datenbank: RE-JJJJ-MM-0001.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { generateOfferPdf } from "../_shared/offer-pdf.ts";
import { SLT_COMPANY } from "../_shared/offer-company.ts";

import { normalizeImageUrl, resolveImagesByName } from "../_shared/product-images.ts";
import {
  LOCATION_CONTACTS,
  assertPositiveTotal,
  buildOfferTotals,
  normalizeInquiryOfferItems,
  resolveLocationKey,
  type InquiryOfferItem,
} from "../_shared/inquiry-offer-math.ts";

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

const fmtDE = (d: Date) => d.toLocaleDateString("de-DE");
const isoDate = (d: Date) => d.toISOString().slice(0, 10);

const PAYMENT_DAYS: Record<string, number> = {
  vorkasse: 0,
  net_7: 7,
  net_14: 14,
  net_30: 30,
};
const ALLOWED_PAYMENT_TERMS = ["net_7", "net_14", "net_30", "vorkasse", "custom"];

interface RecordedPayment {
  date: string;
  amount: number;
  label: string;
  reference: string;
}

const PAYMENT_EMAIL: Record<string, string> = {
  vorkasse: "Der Rechnungsbetrag ist sofort ohne Abzug zur Zahlung fällig.",
  net_7: "Bitte begleichen Sie den Rechnungsbetrag innerhalb von 7 Tagen ohne Abzug.",
  net_14: "Bitte begleichen Sie den Rechnungsbetrag innerhalb von 14 Tagen ohne Abzug.",
  net_30: "Bitte begleichen Sie den Rechnungsbetrag innerhalb von 30 Tagen ohne Abzug.",
};

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

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

    // ── Erneut versenden: bestehende Rechnung unverändert nochmals mailen ──
    if (typeof body.resend_invoice_id === "string") {
      const { data: inv } = await service
        .from("inquiry_invoices")
        .select("*")
        .eq("id", body.resend_invoice_id)
        .maybeSingle();
      if (!inv) return json({ error: "Rechnung nicht gefunden" }, 404);
      if (!inv.file_path) return json({ error: "Zu dieser Rechnung existiert kein PDF" }, 400);

      const { data: file } = await service.storage.from("b2b-invoices").download(inv.file_path);
      if (!file) return json({ error: "Rechnungs-PDF konnte nicht geladen werden" }, 500);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const loc = LOCATION_CONTACTS[resolveLocationKey(inv.location)];

      if (!resendKey) return json({ error: "E-Mail-Versand ist nicht konfiguriert" }, 500);
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
          to: [inv.customer_email],
          cc: [loc.email].filter((e) => e && e !== inv.customer_email),
          reply_to: loc.email,
          subject: `Ihre Rechnung von SLT Rental – ${inv.invoice_number}`,
          html:
            `<p>Hallo ${escapeHtml(inv.customer_name || "")},</p>` +
            `<p>anbei erhalten Sie erneut unsere Rechnung ${escapeHtml(inv.invoice_number)} über ${money(Number(inv.gross_amount))} brutto.</p>` +
            (Number(inv.paid_amount) > 0
              ? `<p>Bereits erhalten: ${money(Number(inv.paid_amount))} – offener Restbetrag: <strong>${money(Math.max(0, Number(inv.gross_amount) - Number(inv.paid_amount)))}</strong>.</p>`
              : "") +

            `<p>Freundliche Grüße<br>Ihr SLT Rental Team – Standort ${escapeHtml(loc.name)}</p>`,
          attachments: [{ filename: inv.file_name || `${inv.invoice_number}.pdf`, content: encodeBase64(bytes) }],
        }),
      });
      if (!res.ok) {
        console.error("Resend error:", res.status, await res.text());
        return json({ error: "E-Mail konnte nicht gesendet werden" }, 500);
      }
      await service
        .from("inquiry_invoices")
        .update({ email_sent: true, email_sent_at: new Date().toISOString() })
        .eq("id", inv.id);
      return json({ success: true, invoice_number: inv.invoice_number, email_sent: true });
    }

    const inquiryType = body.inquiry_type;
    const inquiryId = body.inquiry_id;
    if (inquiryType !== "rental" && inquiryType !== "sales") {
      return json({ error: "inquiry_type muss 'rental' oder 'sales' sein" }, 400);
    }
    if (typeof inquiryId !== "string" || inquiryId.length < 10) {
      return json({ error: "inquiry_id fehlt" }, 400);
    }

    const invoiceKind = body.invoice_kind === "supplement" ? "supplement" : "invoice";
    const parentInvoiceId = typeof body.parent_invoice_id === "string" ? body.parent_invoice_id : null;
    if (invoiceKind === "supplement" && !parentInvoiceId) {
      return json({ error: "Für einen Nachtrag wird die Ursprungsrechnung benötigt" }, 400);
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

    const deliveryCostDelivery = Math.max(0, Number(body.delivery_cost_delivery) || 0);
    const deliveryCostReturn = Math.max(0, Number(body.delivery_cost_return) || 0);
    const setupCost = Math.max(0, Number(body.setup_cost) || 0);
    const dismantleCost = Math.max(0, Number(body.dismantle_cost) || 0);
    const deposit = Math.max(0, Number(body.deposit) || 0);
    const notes: string | null = typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : null;

    const totals = buildOfferTotals(
      items,
      deliveryCostDelivery + deliveryCostReturn + setupCost + dismantleCost,
    );
    try {
      assertPositiveTotal(totals.netAmount);
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : "Ungültige Rechnungssumme" }, 400);
    }

    // ── Doppelklick-/Retry-Schutz ──
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const dupColumn = inquiryType === "rental" ? "rental_inquiry_id" : "sales_inquiry_id";
    const { data: recent } = await service
      .from("inquiry_invoices")
      .select("id, invoice_number, file_url, gross_amount")
      .eq(dupColumn, inquiryId)
      .eq("invoice_kind", invoiceKind)
      .gte("created_at", twoMinutesAgo)
      .order("created_at", { ascending: false })
      .limit(1);
    const duplicate = recent?.[0];
    if (duplicate && Math.abs(Number(duplicate.gross_amount) - totals.grossAmount) < 0.01) {
      console.log("Duplicate invoice suppressed for inquiry", inquiryId);
      return json({
        success: true,
        duplicate_suppressed: true,
        invoice_number: duplicate.invoice_number,
        file_url: duplicate.file_url,
        email_sent: true,
      });
    }

    let parentInvoiceNumber: string | null = null;
    if (parentInvoiceId) {
      const { data: parent } = await service
        .from("inquiry_invoices")
        .select("invoice_number")
        .eq("id", parentInvoiceId)
        .maybeSingle();
      parentInvoiceNumber = parent?.invoice_number ?? null;
    }

    const locationKey = resolveLocationKey(body.location || inquiry.location);
    const loc = LOCATION_CONTACTS[locationKey];

    // Angebotsnummer der Anfrage übernehmen, damit Vorkasse-Zahlungen zum
    // Angebot zugeordnet werden können (Steuerberater).
    const sourceOfferNumber: string | null =
      typeof inquiry.offer_number === "string" && inquiry.offer_number.trim()
        ? inquiry.offer_number.trim()
        : null;

    const customerName = inquiryType === "rental"
      ? (inquiry.customer_name || "")
      : [inquiry.first_name, inquiry.last_name].filter(Boolean).join(" ");
    const companyName: string | null = inquiry.company_name || null;
    const isBusiness = inquiry.customer_kind === "business";

    const requestedTerms = typeof body.payment_terms === "string" ? body.payment_terms : "";
    const paymentTermsCustom = str(body.payment_terms_custom, 600);
    let paymentTerms = ALLOWED_PAYMENT_TERMS.includes(requestedTerms)
      ? requestedTerms
      : (isBusiness ? "net_14" : "vorkasse");
    if (paymentTerms === "custom" && !paymentTermsCustom) paymentTerms = isBusiness ? "net_14" : "vorkasse";
    const paymentDueDays = PAYMENT_DAYS[paymentTerms] ?? 14;

    const invoiceDate = new Date();
    const dueDate = new Date(invoiceDate.getTime() + paymentDueDays * 86400000);

    const servicePeriodStart = str(body.service_period_start, 10) || null;
    const servicePeriodEnd = str(body.service_period_end, 10) || null;

    // ── Bereits geleistete (Teil-)Zahlungen, z. B. Vorkasse auf das Angebot ──
    const rawPayments = Array.isArray(body.payments) ? body.payments.slice(0, 20) : [];
    const payments: RecordedPayment[] = rawPayments
      .map((entry: unknown) => {
        const p = (entry ?? {}) as Record<string, unknown>;
        const amount = Math.round((Number(p.amount) || 0) * 100) / 100;
        return {
          date: str(p.date, 10) || isoDate(new Date()),
          amount,
          label: str(p.label, 80) || "Zahlungseingang",
          reference: str(p.reference, 80) || "",
        };
      })
      .filter((p: RecordedPayment) => p.amount > 0);
    const amountPaid = Math.round(payments.reduce((s: number, p: RecordedPayment) => s + p.amount, 0) * 100) / 100;


    const addrIn = body.delivery_address && typeof body.delivery_address === "object"
      ? body.delivery_address as Record<string, unknown>
      : null;
    const deliveryAddress = {
      street: addrIn ? str(addrIn.street) : str(inquiry.delivery_street),
      postal_code: addrIn ? str(addrIn.postal_code) : str(inquiry.delivery_postal_code),
      city: addrIn ? str(addrIn.city) : str(inquiry.delivery_city),
    };
    const deliveryRequested = body.delivery_requested === false
      ? false
      : Boolean(deliveryAddress.street || deliveryAddress.city);

    // ── Rechnungsnummer erst jetzt ziehen ──
    const { data: numberData, error: numErr } = await service.rpc("generate_inquiry_invoice_number");
    if (numErr || !numberData) {
      console.error("Nummernkreis fehlgeschlagen:", numErr?.message);
      return json({ error: "Rechnungsnummer konnte nicht erzeugt werden" }, 500);
    }
    const invoiceNumber = String(numberData);

    const profile = {
      id: "",
      company_name: companyName || customerName || "Kunde",
      legal_form: null,
      contact_first_name:
        companyName && companyName.trim() === (customerName || "").trim()
          ? ""
          : inquiryType === "rental" ? customerName : (inquiry.first_name || ""),
      contact_last_name:
        companyName && companyName.trim() === (customerName || "").trim()
          ? ""
          : inquiryType === "rental" ? "" : (inquiry.last_name || ""),
      street: inquiryType === "rental" ? (inquiry.customer_street || "") : (inquiry.billing_street || inquiry.delivery_street || ""),
      house_number: "",
      postal_code: inquiryType === "rental" ? (inquiry.customer_postal_code || "") : (inquiry.billing_postal_code || inquiry.delivery_postal_code || ""),
      city: inquiryType === "rental" ? (inquiry.customer_city || "") : (inquiry.billing_city || inquiry.delivery_city || ""),
      country: "Deutschland",
      tax_id: inquiry.vat_id || null,
      show_tax_id: isBusiness && Boolean(inquiry.vat_id),
      contact_email: customerEmail,
      contact_phone: inquiry.customer_phone || null,
      credit_limit: 0,
      payment_due_days: paymentDueDays,
    };

    const pdfItems = items.map((i) => ({
      product_name: i.product_name,
      description: i.description,
      quantity: i.quantity,
      unit: i.unit,
      unit_price: i.unit_price,
      discount_percent: i.discount_percent,
      total_price: Math.round(i.quantity * i.unit_price * (1 - (i.discount_percent || 0) / 100) * 100) / 100,
      rental_start: i.rental_start,
      rental_end: i.rental_end,
      image_url: normalizeImageUrl(i.image_url) as string | null,
    }));

    const servicesWithPrices = items.flatMap((item, idx) =>
      (item.addons ?? [])
        .filter((a) => a.amount > 0)
        .map((a, ai) => ({
          id: `${idx}-${a.key || ai}`,
          name: a.note ? `${a.label} (${a.note})` : a.label,
          description: undefined as string | undefined,
          pricePercent: null,
          amount: a.amount,
          allocations: [{ itemIndex: idx, amount: a.amount }],
        })),
    );
    if (setupCost > 0) {
      servicesWithPrices.push({ id: "setup", name: "Aufbau / Montage vor Ort", description: undefined, pricePercent: null, amount: setupCost, allocations: [] });
    }
    if (dismantleCost > 0) {
      servicesWithPrices.push({ id: "dismantle", name: "Abbau / Demontage vor Ort", description: undefined, pricePercent: null, amount: dismantleCost, allocations: [] });
    }
    const servicesSurcharge = servicesWithPrices.reduce((sum, s) => sum + s.amount, 0);

    const missingImages = pdfItems.filter((i) => !i.image_url).map((i) => i.product_name);
    if (missingImages.length) {
      try {
        const resolved = await resolveImagesByName(service, missingImages);
        for (const item of pdfItems) {
          if (item.image_url) continue;
          item.image_url = resolved.get((item.product_name || "").trim().toLowerCase()) || null;
        }
      } catch (err) {
        console.error("Bildauflösung fehlgeschlagen:", err);
      }
    }

    let staffName = str(body.staff_name, 120);
    if (!staffName) {
      const { data: sp } = await service
        .from("staff_profiles")
        .select("first_name, last_name")
        .eq("user_id", user.id)
        .maybeSingle();
      staffName = [sp?.first_name, sp?.last_name].filter(Boolean).join(" ").trim();
    }
    if (!staffName) staffName = "SLT Rental";

    const pdfBytes = await generateOfferPdf({
      documentType: invoiceKind === "supplement" ? "supplement" : "invoice",
      offerNumber: invoiceNumber,
      offerDate: isoDate(invoiceDate),
      validUntil: isoDate(dueDate),
      dueDate: isoDate(dueDate),
      servicePeriodStart: servicePeriodStart ?? undefined,
      servicePeriodEnd: servicePeriodEnd ?? undefined,
      parentInvoiceNumber: parentInvoiceNumber ?? undefined,
      sourceOfferNumber: sourceOfferNumber ?? undefined,
      profile,
      items: pdfItems,
      deliveryCost: deliveryCostDelivery + deliveryCostReturn,
      deliveryCostDelivery,
      deliveryCostReturn,
      servicesSurcharge,
      servicesWithPrices,
      netAmount: totals.netAmount,
      vatRate: totals.vatRate,
      vatAmount: totals.vatAmount,
      grossAmount: totals.grossAmount,
      isReverseCharge: false,
      notes,
      validDays: paymentDueDays,
      deposit,
      additionalServices: [],
      staffName,
      issuingLocation: locationKey,
      deliveryAddress: deliveryRequested ? deliveryAddress : undefined,
      paymentTerms,
      paymentTermsCustom: paymentTerms === "custom" ? paymentTermsCustom : undefined,
      payments,

    });

    const safeName = (profile.company_name || "Kunde")
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
      .replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue").replace(/ß/g, "ss")
      .replace(/[^a-zA-Z0-9_\- ]/g, "_").replace(/\s+/g, "_");
    const fileName = `${invoiceKind === "supplement" ? "Nachtragsrechnung" : "Rechnung"}_SLTRental_${invoiceNumber}_${safeName}.pdf`;
    const filePath = `inquiry-invoices/${inquiryType}/${inquiry.id}/${fileName}`;

    const { error: uploadError } = await service.storage
      .from("b2b-invoices")
      .upload(filePath, pdfBytes, { contentType: "application/pdf", upsert: true });
    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      return json({ error: "Rechnungs-PDF konnte nicht gespeichert werden" }, 500);
    }
    const { data: signed } = await service.storage
      .from("b2b-invoices")
      .createSignedUrl(filePath, 60 * 60 * 24 * 365);
    const fileUrl = signed?.signedUrl || "";

    // ── E-Mail an den Kunden (persönlich formuliert, mit Bankdaten und Restbetrag) ──
    const balanceDue = Math.round((totals.grossAmount - amountPaid) * 100) / 100;
    const fullyPaid = balanceDue <= 0.009;

    const rowsHtml = items.map((i) => {
      const pct = Number(i.discount_percent) || 0;
      const gross = Math.round(i.quantity * i.unit_price * 100) / 100;
      const savings = Math.round(gross * (pct / 100) * 100) / 100;
      const net = Math.round((gross - savings) * 100) / 100;
      const addonsHtml = (i.addons ?? [])
        .filter((a) => Number(a.amount) !== 0)
        .map(
          (a) =>
            `<div style="color:#6b7280;font-size:12px;margin-top:2px;">&#8627; ${escapeHtml(a.label)}${a.note ? ` (${escapeHtml(a.note)})` : ""} – ${money(Number(a.amount))}</div>`,
        )
        .join("");
      return `
      <div style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
        <div style="font-weight:bold;font-size:14px;">${escapeHtml(i.product_name)}</div>
        ${i.description ? `<div style="color:#6b7280;font-size:12px;margin-top:2px;">${escapeHtml(i.description)}</div>` : ""}
        ${addonsHtml}
        <table style="width:100%;border-collapse:collapse;margin-top:6px;font-size:13px;"><tr>
          <td style="color:#6b7280;padding:0;">${i.quantity}${i.unit ? ` ${escapeHtml(i.unit)}` : ""} &times; ${money(i.unit_price)}</td>
          <td style="text-align:right;padding:0;"><strong>${money(net)}</strong></td>
        </tr></table>
      </div>`;
    }).join("");

    const paymentsHtml = payments
      .map(
        (p: RecordedPayment) =>
          `<div style="font-size:13px;color:#6b7280;">${escapeHtml(p.label)} vom ${escapeHtml(new Date(p.date).toLocaleDateString("de-DE"))}${p.reference ? ` (${escapeHtml(p.reference)})` : ""}: − ${money(p.amount)}</div>`,
      )
      .join("");

    const paymentEmailText = paymentTerms === "custom"
      ? escapeHtml(paymentTermsCustom).replace(/\n/g, "<br>")
      : (PAYMENT_EMAIL[paymentTerms] ?? PAYMENT_EMAIL.net_14);

    const headline = invoiceKind === "supplement"
      ? `Ihre Nachtragsrechnung ${invoiceNumber}`
      : `Ihre Rechnung ${invoiceNumber}`;

    const greetingName = (customerName || "").trim();
    const intro = invoiceKind === "supplement"
      ? `vielen Dank, dass Sie die Miete bei uns verlängert haben. Anbei erhalten Sie den Nachtrag${parentInvoiceNumber ? ` zur Rechnung ${escapeHtml(parentInvoiceNumber)}` : ""} mit den zusätzlichen Leistungen.`
      : "herzlichen Dank für Ihren Auftrag und das Vertrauen in SLT Rental – es hat uns gefreut, Sie mit unserer Technik zu unterstützen. Anbei finden Sie Ihre Rechnung als PDF.";

    const bankBlock = `
    <div style="background:#f1f5f9;border-left:4px solid #00507d;padding:12px 16px;margin:20px 0;border-radius:4px;font-size:14px;">
      ${fullyPaid
        ? `<strong>Nichts mehr zu tun:</strong><br>Ihre Zahlung${payments.length > 1 ? "en" : ""} über ${money(amountPaid)} ${payments.length > 1 ? "haben" : "hat"} den Rechnungsbetrag vollständig ausgeglichen. Vielen Dank!`
        : `<strong>Offener Betrag: ${money(balanceDue)}</strong><br>${paymentEmailText}<br>
      Fällig am <strong>${escapeHtml(fmtDE(dueDate))}</strong><br><br>
      <strong>Unsere Bankverbindung</strong><br>
      Kontoinhaber: ${escapeHtml(SLT_COMPANY.name)}<br>
      Bank: ${escapeHtml(SLT_COMPANY.bankName)}<br>
      IBAN: <strong>${escapeHtml(SLT_COMPANY.iban)}</strong><br>
      BIC: ${escapeHtml(SLT_COMPANY.bic)}<br>
      Verwendungszweck: <strong>${escapeHtml(invoiceNumber)}</strong>`}
      ${sourceOfferNumber ? `<br><span style="color:#6b7280;font-size:13px;">Diese Rechnung gehört zu unserem Angebot ${escapeHtml(sourceOfferNumber)}.</span>` : ""}
    </div>`;

    const emailHtml = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:16px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
<div style="max-width:600px;margin:0 auto;">
  <h2 style="color:#00507d;margin:0 0 16px;">${escapeHtml(headline)}</h2>
  <p>Hallo${greetingName ? ` ${escapeHtml(greetingName)}` : ""},</p>
  <p>${intro}</p>
  ${servicePeriodStart ? `<p style="font-size:14px;"><strong>Leistungszeitraum:</strong> ${escapeHtml(new Date(servicePeriodStart).toLocaleDateString("de-DE"))}${servicePeriodEnd ? ` – ${escapeHtml(new Date(servicePeriodEnd).toLocaleDateString("de-DE"))}` : ""}</p>` : ""}
  <div style="margin:16px 0;border-top:2px solid #00507d;">
    ${rowsHtml}
    ${deliveryCostDelivery > 0 ? `<div style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-size:14px;">Transportkosten Anlieferung <strong style="float:right;">${money(deliveryCostDelivery)}</strong></div>` : ""}
    ${deliveryCostReturn > 0 ? `<div style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-size:14px;">Transportkosten Abholung <strong style="float:right;">${money(deliveryCostReturn)}</strong></div>` : ""}
    ${setupCost > 0 ? `<div style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-size:14px;">Aufbau / Montage <strong style="float:right;">${money(setupCost)}</strong></div>` : ""}
    ${dismantleCost > 0 ? `<div style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-size:14px;">Abbau / Demontage <strong style="float:right;">${money(dismantleCost)}</strong></div>` : ""}
  </div>
  <p style="font-size:15px;"><strong>Rechnungsbetrag brutto: ${money(totals.grossAmount)}</strong><br>
  <span style="color:#6b7280;font-size:13px;">Netto ${money(totals.netAmount)} zzgl. ${totals.vatRate}% MwSt. (${money(totals.vatAmount)})</span></p>
  ${amountPaid > 0 ? `<div style="margin:12px 0;padding:10px 14px;background:#f8fafc;border-radius:4px;">
    <div style="font-size:14px;font-weight:bold;">Bereits erhaltene Zahlungen: − ${money(amountPaid)}</div>
    ${paymentsHtml}
    <div style="margin-top:6px;font-size:15px;font-weight:bold;color:${fullyPaid ? "#0b7a42" : "#b45309"};">
      ${fullyPaid ? "Rechnung vollständig ausgeglichen" : `Noch zu zahlen: ${money(balanceDue)}`}
    </div>
  </div>` : ""}
  ${bankBlock}
  ${notes ? `<p style="white-space:pre-wrap;">${escapeHtml(notes)}</p>` : ""}
  <p>Wenn Sie Fragen zur Rechnung haben oder wieder Technik benötigen, melden Sie sich einfach – wir sind gerne für Sie da.</p>
  <p style="margin-top:24px;">Herzliche Grüße<br>${escapeHtml(staffName)}<br>Ihr SLT Rental Team – Standort ${escapeHtml(loc.name)}<br>
  Tel. ${escapeHtml(loc.phone)} · <a href="mailto:${escapeHtml(loc.email)}" style="color:#00507d;">${escapeHtml(loc.email)}</a></p>
</div></body></html>`;


    let emailSent = false;

    // ── Rechnung speichern (direkt finalisiert) ──
    const { data: inserted, error: insErr } = await service
      .from("inquiry_invoices")
      .insert({
        invoice_number: invoiceNumber,
        invoice_kind: invoiceKind,
        parent_invoice_id: parentInvoiceId,
        offer_number: sourceOfferNumber,
        inquiry_type: inquiryType,
        rental_inquiry_id: inquiryType === "rental" ? inquiry.id : null,
        sales_inquiry_id: inquiryType === "sales" ? inquiry.id : null,
        crm_customer_id: inquiry.crm_customer_id ?? null,
        location: locationKey,
        location_email: loc.email,
        customer_kind: isBusiness ? "business" : "private",
        company_name: companyName,
        customer_name: customerName || null,
        customer_email: customerEmail,
        customer_phone: inquiry.customer_phone ?? null,
        vat_id: inquiry.vat_id ?? null,
        customer_street: profile.street || null,
        customer_postal_code: profile.postal_code || null,
        customer_city: profile.city || null,
        delivery_requested: deliveryRequested,
        delivery_street: deliveryRequested ? deliveryAddress.street || null : null,
        delivery_postal_code: deliveryRequested ? deliveryAddress.postal_code || null : null,
        delivery_city: deliveryRequested ? deliveryAddress.city || null : null,
        service_period_start: servicePeriodStart,
        service_period_end: servicePeriodEnd,
        invoice_date: isoDate(invoiceDate),
        due_date: isoDate(dueDate),
        payment_terms: paymentTerms,
        payment_terms_custom: paymentTerms === "custom" ? paymentTermsCustom : null,
        payment_due_days: paymentDueDays,
        net_amount: totals.netAmount,
        vat_rate: totals.vatRate,
        vat_amount: totals.vatAmount,
        gross_amount: totals.grossAmount,
        delivery_cost_delivery: deliveryCostDelivery,
        delivery_cost_return: deliveryCostReturn,
        setup_cost: setupCost,
        dismantle_cost: dismantleCost,
        deposit,
        notes,
        paid_amount: amountPaid,
        payments,

        // Zuerst als Entwurf anlegen, damit die Positionen noch gespeichert werden dürfen
        // (GoBD-Trigger sperrt Positionen finalisierter Rechnungen). Direkt danach finalisieren.
        status: "draft",
        file_url: fileUrl,
        file_name: fileName,
        file_path: filePath,
        email_sent: false,
        email_sent_at: null,
        created_by: user.id,
        created_by_name: staffName,
      })
      .select("id")
      .single();

    if (insErr || !inserted) {
      console.error("Rechnung konnte nicht gespeichert werden:", insErr?.message);
      return json({ error: "Rechnung konnte nicht gespeichert werden" }, 500);
    }

    const itemRows = items.map((i, index) => ({
      invoice_id: inserted.id,
      position: index + 1,
      product_name: i.product_name,
      description: i.description ?? null,
      quantity: i.quantity,
      unit: i.unit ?? null,
      unit_price: i.unit_price,
      discount_percent: i.discount_percent,
      total_price: Math.round(i.quantity * i.unit_price * (1 - (i.discount_percent || 0) / 100) * 100) / 100,
      rental_start: i.rental_start ?? null,
      rental_end: i.rental_end ?? null,
      addons: i.addons ?? [],
      image_url: pdfItems[index]?.image_url ?? null,
    }));
    const { error: itemErr } = await service.from("inquiry_invoice_items").insert(itemRows);
    if (itemErr) {
      console.error("Positionen konnten nicht gespeichert werden:", itemErr.message);
      return json({ error: "Rechnungspositionen konnten nicht gespeichert werden" }, 500);
    }

    // Erst jetzt finalisieren – ab hier sind Rechnung und Positionen unveränderlich.
    const { error: finalErr } = await service
      .from("inquiry_invoices")
      .update(
        fullyPaid
          ? { status: "paid", paid_at: new Date().toISOString() }
          : { status: "open" },
      )
      .eq("id", inserted.id);
    if (finalErr) {

      console.error("Rechnung konnte nicht finalisiert werden:", finalErr.message);
      return json({ error: "Rechnung konnte nicht finalisiert werden" }, 500);
    }

    // Erst nach vollständig gespeicherten und finalisierten Positionen versenden.
    if (resendKey) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
            to: [customerEmail],
            cc: Array.from(new Set([loc.email, str(inquiry.location_email)].filter((e) => e && e !== customerEmail))),
            reply_to: loc.email,
            subject: `${invoiceKind === "supplement" ? "Nachtragsrechnung" : "Rechnung"} von SLT Rental – ${invoiceNumber}`,
            html: emailHtml,
            attachments: [{ filename: fileName, content: encodeBase64(pdfBytes) }],
          }),
        });
        if (res.ok) {
          emailSent = true;
          await service.from("inquiry_invoices").update({ email_sent: true, email_sent_at: new Date().toISOString() }).eq("id", inserted.id);
        } else {
          console.error("Resend error:", res.status, await res.text());
        }
      } catch (err) {
        console.error("Resend exception:", err);
      }
    } else {
      console.log("RESEND_API_KEY fehlt – Rechnung wurde nur erzeugt, nicht versendet");
    }


    return json({
      success: true,
      invoice_id: inserted.id,
      invoice_number: invoiceNumber,
      file_url: fileUrl,
      gross_amount: totals.grossAmount,
      email_sent: emailSent,
    });
  } catch (err) {
    console.error("send-inquiry-invoice error:", err);
    return json({ error: "Unerwarteter Fehler" }, 500);
  }
});
