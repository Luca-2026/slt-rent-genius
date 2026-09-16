/**
 * Erstellt und versendet eine Rechnungskorrektur (Gutschrift) zu einer bereits
 * gestellten Rechnung aus einer Miet- oder Verkaufsanfrage.
 *
 * Fachlicher Hintergrund (§ 14 UStG / GoBD):
 * - Eine versendete Rechnung darf nicht geändert oder gelöscht werden. Eine
 *   Stornierung erfolgt über ein eigenes Korrekturdokument mit eigener,
 *   fortlaufender Nummer (GS-JJJJ-MM-0001).
 * - Das Dokument muss alle Pflichtangaben einer Rechnung enthalten und zusätzlich
 *   eindeutig auf die korrigierte Rechnung (Nummer und Datum) verweisen.
 * - Vollständige Stornierung setzt die Ursprungsrechnung auf "storniert",
 *   Teilgutschriften mindern den offenen Betrag.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { generateOfferPdf } from "../_shared/offer-pdf.ts";
import { SLT_COMPANY } from "../_shared/offer-company.ts";
import { normalizeImageUrl } from "../_shared/product-images.ts";
import { LOCATION_CONTACTS, VAT_RATE, resolveLocationKey } from "../_shared/inquiry-offer-math.ts";

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

const escapeHtml = (input: unknown): string =>
  input === null || input === undefined
    ? ""
    : String(input)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

const money = (n: number) =>
  new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " €";

const isoDate = (d: Date) => d.toISOString().slice(0, 10);
const dateDE = (d: string | null) => (d ? new Date(d).toLocaleDateString("de-DE") : "");
const round2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

interface CreditLine {
  product_name: string;
  description: string | null;
  quantity: number;
  unit: string | null;
  unit_price: number;
  total_price: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const service = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: userData, error: userErr } = await service.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userData?.user;
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const { data: isStaff } = await service.rpc("is_staff_member", { _user_id: user.id });
    if (!isStaff) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return json({ error: "Ungültige Anfrage" }, 400);

    const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
    const invoiceId = str(body.invoice_id, 60);
    if (!invoiceId) return json({ error: "invoice_id fehlt" }, 400);
    const mode = body.mode === "partial" ? "partial" : "full";
    const reason = str(body.reason, 300);
    if (!reason) return json({ error: "Bitte einen Grund für die Rechnungskorrektur angeben" }, 400);

    // ── Ursprungsrechnung laden ──
    const { data: invoice } = await service
      .from("inquiry_invoices")
      .select("*")
      .eq("id", invoiceId)
      .maybeSingle();
    if (!invoice) return json({ error: "Rechnung nicht gefunden" }, 404);
    if (invoice.invoice_kind === "credit_note") {
      return json({ error: "Zu einer Gutschrift kann keine weitere Gutschrift erstellt werden" }, 400);
    }
    if (invoice.status === "draft") {
      return json({ error: "Diese Rechnung wurde noch nicht versendet" }, 400);
    }

    const grossInvoice = round2(invoice.gross_amount);
    const alreadyCredited = round2(invoice.credited_amount);
    const creditable = round2(grossInvoice - alreadyCredited);
    if (creditable <= 0.009) {
      return json({ error: "Diese Rechnung ist bereits vollständig gutgeschrieben" }, 400);
    }

    // ── Positionen der Gutschrift bestimmen ──
    let lines: CreditLine[] = [];
    let grossCredit = 0;

    if (mode === "full") {
      const { data: items } = await service
        .from("inquiry_invoice_items")
        .select("position, product_name, description, quantity, unit, unit_price, discount_percent, total_price, image_url")
        .eq("invoice_id", invoiceId)
        .order("position", { ascending: true });
      lines = (items ?? []).map((i: Record<string, unknown>) => ({
        product_name: String(i.product_name ?? "Position"),
        description: (i.description as string) ?? null,
        quantity: Number(i.quantity) || 1,
        unit: (i.unit as string) ?? null,
        unit_price: round2(i.unit_price as number),
        total_price: round2(i.total_price as number),
      }));
      if (!lines.length) {
        lines = [{
          product_name: `Stornierung Rechnung ${invoice.invoice_number}`,
          description: null,
          quantity: 1,
          unit: "Pauschale",
          unit_price: round2(creditable / (1 + VAT_RATE / 100)),
          total_price: round2(creditable / (1 + VAT_RATE / 100)),
        }];
      }
      grossCredit = creditable;
    } else {
      const rawLines = Array.isArray(body.items) ? body.items.slice(0, 40) : [];
      lines = rawLines
        .map((entry: unknown) => {
          const l = (entry ?? {}) as Record<string, unknown>;
          const quantity = Math.abs(Number(l.quantity) || 1);
          const unitPrice = Math.abs(round2(l.unit_price as number));
          return {
            product_name: str(l.product_name, 160) || "Gutschriftposition",
            description: str(l.description, 400) || null,
            quantity,
            unit: str(l.unit, 40) || null,
            unit_price: unitPrice,
            total_price: round2(quantity * unitPrice),
          };
        })
        .filter((l) => l.total_price > 0);
      if (!lines.length) return json({ error: "Bitte mindestens eine Gutschriftposition angeben" }, 400);

      const netCredit = round2(lines.reduce((s, l) => s + l.total_price, 0));
      grossCredit = round2(netCredit * (1 + VAT_RATE / 100));
      if (grossCredit - creditable > 0.01) {
        return json(
          { error: `Die Gutschrift (${money(grossCredit)}) übersteigt den noch offenen Rechnungsbetrag von ${money(creditable)}.` },
          400,
        );
      }
    }

    const netAmount = mode === "full"
      ? round2(invoice.net_amount) - round2(alreadyCredited / (1 + VAT_RATE / 100))
      : round2(lines.reduce((s, l) => s + l.total_price, 0));
    const netFinal = round2(mode === "full" ? round2(grossCredit / (1 + VAT_RATE / 100)) : netAmount);
    const vatAmount = round2(grossCredit - netFinal);

    // ── Doppelklick-Schutz ──
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const { data: recent } = await service
      .from("inquiry_invoices")
      .select("id, invoice_number, file_url, gross_amount")
      .eq("parent_invoice_id", invoiceId)
      .eq("invoice_kind", "credit_note")
      .gte("created_at", twoMinutesAgo)
      .order("created_at", { ascending: false })
      .limit(1);
    const dup = recent?.[0];
    if (dup && Math.abs(Number(dup.gross_amount) - grossCredit) < 0.01) {
      return json({
        success: true,
        duplicate_suppressed: true,
        invoice_number: dup.invoice_number,
        file_url: dup.file_url,
        email_sent: true,
      });
    }

    const locationKey = resolveLocationKey(invoice.location);
    const loc = LOCATION_CONTACTS[locationKey];

    // ── Gutschriftnummer ziehen ──
    const { data: numberData, error: numErr } = await service.rpc("generate_inquiry_credit_note_number");
    if (numErr || !numberData) {
      console.error("Nummernkreis fehlgeschlagen:", numErr?.message);
      return json({ error: "Gutschriftnummer konnte nicht erzeugt werden" }, 500);
    }
    const creditNumber = String(numberData);
    const creditDate = new Date();

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

    const profile = {
      id: "",
      company_name: invoice.company_name || invoice.customer_name || "Kunde",
      legal_form: null,
      contact_first_name: invoice.company_name ? "" : (invoice.customer_name || ""),
      contact_last_name: "",
      street: invoice.customer_street || "",
      house_number: "",
      postal_code: invoice.customer_postal_code || "",
      city: invoice.customer_city || "",
      country: "Deutschland",
      tax_id: invoice.vat_id || null,
      show_tax_id: Boolean(invoice.vat_id),
      contact_email: invoice.customer_email,
      contact_phone: invoice.customer_phone || null,
      credit_limit: 0,
      payment_due_days: invoice.payment_due_days || 14,
    };

    const pdfBytes = await generateOfferPdf({
      documentType: "credit_note",
      offerNumber: creditNumber,
      offerDate: isoDate(creditDate),
      validUntil: isoDate(creditDate),
      parentInvoiceNumber: invoice.invoice_number ?? undefined,
      parentInvoiceDate: invoice.invoice_date ?? undefined,
      creditReason: reason,
      creditIsPartial: mode === "partial",
      creditAlreadyPaid: round2(invoice.paid_amount),
      servicePeriodStart: invoice.service_period_start ?? undefined,
      servicePeriodEnd: invoice.service_period_end ?? undefined,
      sourceOfferNumber: invoice.offer_number ?? undefined,
      profile,
      items: lines.map((l) => ({
        product_name: l.product_name,
        description: l.description,
        quantity: l.quantity,
        unit: l.unit,
        unit_price: l.unit_price,
        discount_percent: 0,
        total_price: l.total_price,
        rental_start: null,
        rental_end: null,
        image_url: normalizeImageUrl(null) as string | null,
      })),
      deliveryCost: 0,
      deliveryCostDelivery: 0,
      deliveryCostReturn: 0,
      servicesSurcharge: 0,
      servicesWithPrices: [],
      netAmount: netFinal,
      vatRate: VAT_RATE,
      vatAmount,
      grossAmount: grossCredit,
      isReverseCharge: false,
      notes: null,
      validDays: 0,
      deposit: 0,
      additionalServices: [],
      staffName,
      issuingLocation: locationKey,
    });

    const safeName = (profile.company_name || "Kunde")
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
      .replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue").replace(/ß/g, "ss")
      .replace(/[^a-zA-Z0-9_\- ]/g, "_").replace(/\s+/g, "_");
    const fileName = `Rechnungskorrektur_SLTRental_${creditNumber}_${safeName}.pdf`;
    const filePath = `inquiry-invoices/${invoice.inquiry_type}/${invoice.rental_inquiry_id || invoice.sales_inquiry_id || invoice.id}/${fileName}`;

    const { error: uploadError } = await service.storage
      .from("b2b-invoices")
      .upload(filePath, pdfBytes, { contentType: "application/pdf", upsert: true });
    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      return json({ error: "Gutschrift-PDF konnte nicht gespeichert werden" }, 500);
    }
    const { data: signed } = await service.storage
      .from("b2b-invoices")
      .createSignedUrl(filePath, 60 * 60 * 24 * 365);
    const fileUrl = signed?.signedUrl || "";

    // ── E-Mail an den Kunden ──
    const amountPaidInvoice = round2(invoice.paid_amount);
    const refundText = amountPaidInvoice > 0
      ? `Den Betrag von <strong>${money(grossCredit)}</strong> erstatten wir Ihnen auf das uns bekannte Konto zurück. Sie müssen nichts weiter veranlassen.`
      : `Der Betrag von <strong>${money(grossCredit)}</strong> wird mit der Rechnung ${escapeHtml(invoice.invoice_number ?? "")} verrechnet.` +
        (mode === "partial"
          ? ` Bitte überweisen Sie nur noch den verbleibenden Betrag von <strong>${money(Math.max(0, round2(creditable - grossCredit)))}</strong>.`
          : " Die Rechnung ist damit vollständig ausgeglichen – eine Zahlung ist nicht mehr erforderlich.");

    const rowsHtml = lines
      .map(
        (l) => `<div style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-size:14px;">
        <strong>${escapeHtml(l.product_name)}</strong>${l.description ? `<div style="color:#6b7280;font-size:12px;">${escapeHtml(l.description)}</div>` : ""}
        <div style="color:#6b7280;font-size:13px;">${l.quantity}${l.unit ? ` ${escapeHtml(l.unit)}` : ""} × ${money(l.unit_price)}
        <strong style="float:right;color:#1a1a1a;">− ${money(l.total_price)}</strong></div>
      </div>`,
      )
      .join("");

    const emailHtml = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:16px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
<div style="max-width:600px;margin:0 auto;">
  <h2 style="color:#00507d;margin:0 0 16px;">${mode === "partial" ? "Teilgutschrift" : "Rechnungskorrektur"} ${escapeHtml(creditNumber)}</h2>
  <p>Hallo${invoice.customer_name ? ` ${escapeHtml(invoice.customer_name)}` : ""},</p>
  <p>anbei erhalten Sie unsere Rechnungskorrektur zu Rechnung <strong>${escapeHtml(invoice.invoice_number ?? "")}</strong>${invoice.invoice_date ? ` vom ${escapeHtml(dateDE(invoice.invoice_date))}` : ""}.</p>
  <p style="font-size:14px;"><strong>Grund:</strong> ${escapeHtml(reason)}</p>
  <div style="margin:16px 0;border-top:2px solid #00507d;">${rowsHtml}</div>
  <p style="font-size:15px;"><strong>Gutschriftbetrag brutto: − ${money(grossCredit)}</strong><br>
  <span style="color:#6b7280;font-size:13px;">Netto ${money(netFinal)} zzgl. ${VAT_RATE}% MwSt. (${money(vatAmount)})</span></p>
  <div style="background:#f0fdf4;border-left:4px solid #0b7a42;padding:12px 16px;margin:20px 0;border-radius:4px;font-size:14px;">${refundText}</div>
  <p>Bei Fragen zur Korrektur melden Sie sich gerne jederzeit bei uns.</p>
  <p style="margin-top:24px;">Herzliche Grüße<br>${escapeHtml(staffName)}<br>Ihr SLT Rental Team – Standort ${escapeHtml(loc.name)}<br>
  Tel. ${escapeHtml(loc.phone)} · <a href="mailto:${escapeHtml(loc.email)}" style="color:#00507d;">${escapeHtml(loc.email)}</a></p>
  <p style="color:#6b7280;font-size:11px;">${escapeHtml(SLT_COMPANY.name)}</p>
</div></body></html>`;

    let emailSent = false;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
            to: [invoice.customer_email],
            cc: Array.from(new Set([loc.email, invoice.location_email].filter((e) => e && e !== invoice.customer_email))),
            reply_to: loc.email,
            subject: `Rechnungskorrektur ${creditNumber} zu Rechnung ${invoice.invoice_number}`,
            html: emailHtml,
            attachments: [{ filename: fileName, content: encodeBase64(pdfBytes) }],
          }),
        });
        if (res.ok) emailSent = true;
        else console.error("Resend error:", res.status, await res.text());
      } catch (err) {
        console.error("Resend exception:", err);
      }
    }

    // ── Gutschrift speichern (Entwurf → Positionen → finalisieren) ──
    const { data: inserted, error: insErr } = await service
      .from("inquiry_invoices")
      .insert({
        invoice_number: creditNumber,
        invoice_kind: "credit_note",
        parent_invoice_id: invoice.id,
        offer_number: invoice.offer_number,
        inquiry_type: invoice.inquiry_type,
        rental_inquiry_id: invoice.rental_inquiry_id,
        sales_inquiry_id: invoice.sales_inquiry_id,
        crm_customer_id: invoice.crm_customer_id,
        location: locationKey,
        location_email: loc.email,
        customer_kind: invoice.customer_kind,
        company_name: invoice.company_name,
        customer_name: invoice.customer_name,
        customer_email: invoice.customer_email,
        customer_phone: invoice.customer_phone,
        vat_id: invoice.vat_id,
        customer_street: invoice.customer_street,
        customer_postal_code: invoice.customer_postal_code,
        customer_city: invoice.customer_city,
        service_period_start: invoice.service_period_start,
        service_period_end: invoice.service_period_end,
        invoice_date: isoDate(creditDate),
        due_date: isoDate(creditDate),
        payment_terms: invoice.payment_terms,
        payment_due_days: 0,
        net_amount: -netFinal,
        vat_rate: VAT_RATE,
        vat_amount: -vatAmount,
        gross_amount: -grossCredit,
        credit_reason: reason,
        notes: null,
        status: "draft",
        file_url: fileUrl,
        file_name: fileName,
        file_path: filePath,
        email_sent: emailSent,
        email_sent_at: emailSent ? new Date().toISOString() : null,
        created_by: user.id,
        created_by_name: staffName,
      })
      .select("id")
      .single();

    if (insErr || !inserted) {
      console.error("Gutschrift konnte nicht gespeichert werden:", insErr?.message);
      return json({ error: "Gutschrift konnte nicht gespeichert werden" }, 500);
    }

    const itemRows = lines.map((l, index) => ({
      invoice_id: inserted.id,
      position: index + 1,
      product_name: l.product_name,
      description: l.description,
      quantity: l.quantity,
      unit: l.unit,
      unit_price: -l.unit_price,
      discount_percent: 0,
      total_price: -l.total_price,
      addons: [],
    }));
    const { error: itemErr } = await service.from("inquiry_invoice_items").insert(itemRows);
    if (itemErr) {
      console.error("Gutschriftpositionen konnten nicht gespeichert werden:", itemErr.message);
      return json({ error: "Gutschriftpositionen konnten nicht gespeichert werden" }, 500);
    }

    const { error: finalErr } = await service
      .from("inquiry_invoices")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", inserted.id);
    if (finalErr) {
      console.error("Gutschrift konnte nicht finalisiert werden:", finalErr.message);
      return json({ error: "Gutschrift konnte nicht finalisiert werden" }, 500);
    }

    // ── Ursprungsrechnung fortschreiben ──
    const newCredited = round2(alreadyCredited + grossCredit);
    const fullyCredited = newCredited >= grossInvoice - 0.009;
    const patch: Record<string, unknown> = { credited_amount: newCredited, credit_reason: reason };
    if (fullyCredited && invoice.status !== "cancelled") {
      patch.status = "cancelled";
      patch.cancelled_at = new Date().toISOString();
    }
    const { error: parentErr } = await service.from("inquiry_invoices").update(patch).eq("id", invoice.id);
    if (parentErr) console.error("Ursprungsrechnung konnte nicht aktualisiert werden:", parentErr.message);

    return json({
      success: true,
      credit_note_id: inserted.id,
      invoice_number: creditNumber,
      file_url: fileUrl,
      gross_amount: grossCredit,
      fully_credited: fullyCredited,
      email_sent: emailSent,
    });
  } catch (err) {
    console.error("send-inquiry-credit-note error:", err);
    return json({ error: "Unerwarteter Fehler" }, 500);
  }
});
