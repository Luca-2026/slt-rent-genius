import { codedSubject } from "../_shared/order-code.ts";
/**
 * Sends a priced offer for a public rental or sales inquiry that is being
 * processed inside the B2B portal.
 *
 * - Caller must be an admin or an active staff member (verified via JWT).
 * - PDF is created with the shared offer PDF generator (same layout as B2B offers).
 * - The customer is asked to confirm acceptance by replying to the location mailbox;
 *   the job is then created manually in Rentware.
 */
import { OPEN_ENDED_NOTE, monthlyNetFromOffer } from "../_shared/installments.ts";
import { allowsCustomerPaymentTerms } from "../_shared/customer-payment-terms.ts";
import {
  ensurePaymentLink,
  isStripeConfigured,
  isStripeTestMode,
  planPaymentAmounts,
  shouldOfferPaymentLink,
  toCents,
} from "../_shared/stripe-pay.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { generateOfferPdf } from "../_shared/offer-pdf.ts";
import { byForm, normalizeAddressForm, salutationLine, type AddressForm } from "../_shared/salutation.ts";
import { defaultTermsText, printableTerms } from "../_shared/offer-terms.ts";
import { computeRentalLinePrice, resolveProductPrices, type PricingUnit } from "../_shared/rental-pricing.ts";
import { addonExplanation } from "../_shared/inquiry-offer-math.ts";
import { normalizeImageUrl, resolveImagesByName } from "../_shared/product-images.ts";
import {
  LOCATION_CONTACTS,
  assertPositiveTotal,
  buildOfferTotals,
  normalizeInquiryOfferItems,
  normalizeExtraFields,
  normalizeOfferGroups,
  orderItemsByGroups,
  resolveLocationKey,
  resolveReturnLocation,
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
    // Paket 3b: Gruppen, Zusatzfelder, Auftragsart (fehlen bei alten Angeboten → entfallen).
    const offerGroups = normalizeOfferGroups(body.groups);
    items = orderItemsByGroups(offerGroups, items);
    const extraFields = normalizeExtraFields(body.extra_fields);
    const orderType = body.order_type === "delivery" ? "delivery" : body.order_type === "pickup" ? "pickup" : undefined;

    // Paket 2: Plausibilitätsprüfung der Einzelpreise gegen die Staffel (nur Warnung, kein Abbruch).
    if (inquiryType === "rental") {
      try {
        const dayOpts = { use_saturday: body.use_saturday === true, use_sunday: body.use_sunday === true };
        for (const [idx, it] of items.entries()) {
          if (it.price_manual || it.price_basis === "customer" || !it.product_slug || !it.rental_start || !it.rental_end) continue;
          const { data: prod } = await service
            .from("b2b_managed_products")
            .select("id,pricing_scheme,prices_same_all_locations,price_per_day,price_from_1_rd,price_from_3_rd,price_from_10_rd,price_from_20_rd,price_weekend_num,price_base_1_3_cd,surcharge_per_cd_from_4,surcharge_per_cd_from_8")
            .eq("slug", it.product_slug)
            .limit(1)
            .maybeSingle();
          if (!prod) continue;
          let rows: Array<Record<string, unknown> & { location: string }> = [];
          if (prod.prices_same_all_locations === false) {
            const { data: loc } = await service.from("b2b_managed_product_location_prices").select("*").eq("managed_product_id", prod.id);
            rows = (loc ?? []) as typeof rows;
          }
          const unit = it.price_basis === "weekend" ? null : ((it.unit_code ?? null) as PricingUnit | null);
          const expected = computeRentalLinePrice({
            prices: resolveProductPrices(prod, body.location ?? null, rows),
            scheme: prod.pricing_scheme,
            start: { date: it.rental_start, time: it.rental_start_time },
            end: { date: it.rental_end, time: it.rental_end_time },
            unit,
            opts: dayOpts,
          });
          if (expected.kind !== "duration_only" && Math.abs(expected.unit_price - it.unit_price) > 0.01) {
            console.warn(`Preisprüfung Position ${idx + 1} (${it.product_slug}): gesendet ${it.unit_price}, berechnet ${expected.unit_price} (${expected.label})`);
          }
        }
      } catch (e) {
        console.warn("Preisprüfung übersprungen:", (e as Error).message);
      }
    }

    const table = inquiryType === "rental" ? "rental_inquiries" : "sales_inquiries";
    const { data: inquiry, error: inqErr } = await service
      .from(table)
      .select("*")
      .eq("id", inquiryId)
      .maybeSingle();
    if (inqErr || !inquiry) return json({ error: "Anfrage nicht gefunden" }, 404);
    if (!allowsCustomerPaymentTerms(inquiry.customer_kind, body.payment_terms)) {
      return json({ error: "Privatkunden zahlen nicht auf Rechnung. Bitte Vorkasse oder Anzahlung wählen." }, 400);
    }

    // Überarbeitung eines bereits versendeten Angebots: muss sich auf die
    // aktuell gültige Fassung beziehen (verhindert Doppelversand/veraltete Stände).
    const reviseOf: string | null = typeof body.revise_of === "string" && body.revise_of.trim()
      ? body.revise_of.trim()
      : null;
    const isRevision = Boolean(reviseOf && reviseOf === inquiry.offer_number);

    // Doppelklick-/Retry-Schutz: wurde in den letzten 2 Minuten bereits ein
    // Angebot zu dieser Anfrage versendet, wird kein zweites erzeugt/gemailt.
    // Eine bewusste Überarbeitung der aktuellen Fassung ist davon ausgenommen.
    const lastSentAt = inquiry.offer_sent_at ? Date.parse(inquiry.offer_sent_at) : 0;
    if (!isRevision && lastSentAt && Date.now() - lastSentAt < 2 * 60 * 1000) {
      console.log("Duplicate send suppressed for inquiry", inquiryId);
      return json({
        success: true,
        duplicate_suppressed: true,
        offer_number: inquiry.offer_number,
        file_url: inquiry.offer_file_url,
        email_sent: true,
      });
    }

    const customerEmail: string | null = inquiry.customer_email;
    if (!customerEmail) return json({ error: "Anfrage hat keine E-Mail-Adresse" }, 400);

    const deliveryCostDelivery = Number(body.delivery_cost_delivery) || 0;
    const deliveryCostReturn = Number(body.delivery_cost_return) || 0;
    // Pauschalen für Auf-/Abbau (Montage & Demontage vor Ort)
    const setupCost = Math.max(0, Number(body.setup_cost) || 0);
    const dismantleCost = Math.max(0, Number(body.dismantle_cost) || 0);
    // Rückgabe an anderem Standort (One-Way) mit optionalem Netto-Aufpreis
    const returnLoc = inquiryType === "rental"
      ? resolveReturnLocation(body.return_location, body.location || inquiry.location, body.return_location_cost)
      : null;
    const returnLocationCost = returnLoc?.cost ?? 0;
    const deposit = Number(body.deposit) || 0;
    const validDays = Number(body.valid_days) > 0 ? Math.min(Number(body.valid_days), 180) : 14;
    const notes: string | null = typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : null;

    // ── Zahlungsbedingungen ──
    const ALLOWED_PAYMENT_TERMS = ["net_7", "net_14", "net_30", "vorkasse", "anzahlung_30", "rentpair_vorkasse", "custom"];
    const requestedTerms = typeof body.payment_terms === "string" ? body.payment_terms : "";
    // Individuelle Zahlungsbedingungen (Freitext, i. d. R. Geschäftskunden)
    const paymentTermsCustom = typeof body.payment_terms_custom === "string"
      ? body.payment_terms_custom.trim().slice(0, 600)
      : "";

    // ── Lieferadresse: aus dem Portal übergeben (Vorbelegung stammt aus dem
    //    öffentlichen Anfrageformular) – Fallback auf die gespeicherten Felder.
    const str = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, 200) : "");
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



    const totals = buildOfferTotals(
      items,
      deliveryCostDelivery + deliveryCostReturn + setupCost + dismantleCost + returnLocationCost,
    );
    try {
      assertPositiveTotal(totals.netAmount);
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : "Ungültige Angebotssumme" }, 400);
    }

    const isPreview = body.preview === true;
    const locationKey = resolveLocationKey(body.location || inquiry.location);
    const loc = LOCATION_CONTACTS[locationKey];

    // Überarbeitungen behalten die Stammnummer und erhalten eine Fassungsnummer
    // (ANG-M-2026-10-0001 → ANG-M-2026-10-0001-2 → -3 …); der Nummernkreis bleibt je Geschäftsart getrennt.
    const prevPayload = (inquiry.offer_payload ?? {}) as Record<string, unknown>;
    let offerNumber: string;
    let baseOfferNumber: string;
    let version = 1;
    let supersedes: { offer_number: string; sent_at: string | null } | null = null;
    if (isRevision) {
      baseOfferNumber = typeof prevPayload.base_offer_number === "string"
        ? prevPayload.base_offer_number
        : String(inquiry.offer_number);
      version = (Number(prevPayload.version) || 1) + 1;
      offerNumber = `${baseOfferNumber}-${version}`;
      supersedes = { offer_number: String(inquiry.offer_number), sent_at: inquiry.offer_sent_at ?? null };
    } else if (isPreview) {
      // Vorschau: keine Nummer verbrauchen (Nummernkreis bleibt lückenlos).
      offerNumber = "ENTWURF";
      baseOfferNumber = offerNumber;
    } else {
      if (reviseOf) {
        return json({ error: "Das Angebot wurde inzwischen geändert. Bitte die Anfrage neu laden." }, 409);
      }
      const { data: numberData, error: numErr } = await service.rpc("generate_offer_number_for", {
        _series: inquiryType === "sales" ? "V" : "M",
      });
      if (numErr || !numberData) {
        console.error("Nummernkreis fehlgeschlagen:", numErr?.message);
        return json({ error: "Angebotsnummer konnte nicht erzeugt werden" }, 500);
      }
      offerNumber = String(numberData);
      baseOfferNumber = offerNumber;
    }
    const supersedesText = supersedes
      ? `Dieses Angebot ersetzt unser Angebot ${supersedes.offer_number}${
          supersedes.sent_at ? ` vom ${new Date(supersedes.sent_at).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" })}` : ""
        }.`
      : null;
    // Unbefristete Monatsmiete: Preise gelten pro Monat, kein Enddatum, monatliche Abschläge.
    const openEnded = inquiryType === "rental" && body.open_ended === true;
    const pickupName = LOCATION_CONTACTS[resolveLocationKey(body.location || inquiry.location)].name;
    const returnLocationText = returnLoc
      ? `Abholung am Standort ${pickupName}, Rückgabe abweichend am Standort ${returnLoc.name}${returnLoc.cost > 0 ? " (Aufpreis siehe Position „Rückgabe an anderem Standort“)" : " (ohne Aufpreis)"}.`
      : null;
    const pdfNotes = [supersedesText, returnLocationText, openEnded ? OPEN_ENDED_NOTE : null, notes].filter(Boolean).join("\n\n") || null;

    const customerName = inquiryType === "rental"
      ? (inquiry.customer_name || "")
      : [inquiry.first_name, inquiry.last_name].filter(Boolean).join(" ");

    const companyName: string | null = inquiry.company_name || null;
    const isBusiness = inquiry.customer_kind === "business";

    let paymentTerms = ALLOWED_PAYMENT_TERMS.includes(requestedTerms)
      ? requestedTerms
      : (isBusiness ? "net_14" : "anzahlung_30");
    // Ohne Freitext ist "custom" nicht darstellbar – dann Standardkondition.
    if (paymentTerms === "custom" && !paymentTermsCustom) {
      paymentTerms = isBusiness ? "net_14" : "anzahlung_30";
    }
    const paymentDueDays = paymentTerms === "net_7" ? 7 : paymentTerms === "net_30" ? 30 : 14;

    const profile = {
      id: "",
      company_name: companyName || customerName || "Kunde",
      legal_form: null,
      // Kontaktzeile nur, wenn sie sich vom Firmennamen unterscheidet
      contact_first_name:
        companyName && companyName.trim() === (customerName || "").trim()
          ? ""
          : inquiryType === "rental"
            ? customerName
            : (inquiry.first_name || ""),
      contact_last_name:
        companyName && companyName.trim() === (customerName || "").trim()
          ? ""
          : inquiryType === "rental"
            ? ""
            : (inquiry.last_name || ""),
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

    // ── Paket 4 (nur Mietanfragen): Anrede-Form, Anrede, Angebotsbedingungen ──
    const isRentalOffer = inquiryType === "rental";
    let addressForm: AddressForm = "sie";
    let termsRaw: string | null = null;
    let termsPrint = "";
    if (isRentalOffer) {
      addressForm = normalizeAddressForm(inquiry.address_form);
      if (inquiry.crm_customer_id) {
        const { data: crm } = await service.from("crm_customers").select("address_form").eq("id", inquiry.crm_customer_id).maybeSingle();
        if (crm?.address_form) addressForm = normalizeAddressForm(crm.address_form);
      }
      termsRaw = typeof body.terms_text === "string" && body.terms_text.trim() ? body.terms_text.trim().slice(0, 4000) : null;
      let termsText = termsRaw;
      if (termsText === null) {
        const { data: tb } = await service.from("text_blocks").select("text_business,text_private").eq("key", "offer_terms").maybeSingle();
        termsText = defaultTermsText(tb, inquiry.customer_kind);
      }
      const slugs = Array.from(new Set(items.map((i) => i.product_slug).filter(Boolean))) as string[];
      let hasBau = false;
      if (slugs.length) {
        const { data: bau } = await service.from("b2b_managed_products").select("slug").in("slug", slugs).eq("pricing_scheme", "bau").limit(1);
        hasBau = (bau ?? []).length > 0;
      }
      termsPrint = printableTerms(termsText, hasBau);
    }
    const F = (du: string, sie: string) => byForm(addressForm, du, sie);
    const greeting = isRentalOffer
      ? salutationLine({ address_form: addressForm, salutation: inquiry.customer_salutation, name: customerName })
      : `Hallo ${customerName || ""},`;

    // ── Produktbilder: explizit übergeben oder per Artikelname aus dem CMS ──
    const pdfItems = items.map((i) => ({
      // Paket 3b: Name nur für dieses Angebot geändert → im PDF der Override.
      product_name: i.name_override || i.product_name,
      description: i.description_override || i.description,
      group_id: i.group_id,
      articles: i.articles,
      quantity_unit: i.quantity_unit,
      duration: i.duration,
      unit_code: i.unit_code,
      price_basis: i.price_basis,
      quantity: i.quantity,
      unit: i.unit,
      unit_price: i.unit_price,
      discount_percent: i.discount_percent,
      total_price: Math.round(i.quantity * i.unit_price * (1 - (i.discount_percent || 0) / 100) * 100) / 100,
      rental_start: i.rental_start,
      rental_end: i.rental_end,
      image_url: normalizeImageUrl(i.image_url) as string | null,
    }));
    // ── Zusatzoptionen (Versicherungen etc.) als zugeordnete Zusatzposten ──
    const servicesWithPrices: Array<{ id: string; name: string; description?: string; pricePercent: number | null; amount: number; allocations: { itemIndex: number; amount: number }[]; optional?: boolean; perDay?: number; days?: number }> = items.flatMap((item, idx) =>
      (item.addons ?? [])
        .filter((a) => a.amount > 0 && !a.optional)
        .map((a, ai) => ({
          id: `${idx}-${a.key || ai}`,
          name: a.note ? `${a.label} (${a.note})` : a.label,
          description: (addonExplanation(a, item) || undefined) as string | undefined,
          pricePercent: null,
          amount: a.amount,
          days: a.basis === "full_period" && Number(a.days) > 0 ? Number(a.days) : undefined,
          allocations: [{ itemIndex: idx, amount: a.amount }],
        })),
    );
    // Paket 3b: optionale Versicherungsstufen – eigene Zeile, Betrag 0 in allen Summen.
    items.forEach((item, idx) => {
      for (const a of item.addons ?? []) {
        if (!a.optional) continue;
        servicesWithPrices.push({
          id: `${idx}-${a.key}`,
          name: a.label,
          pricePercent: null,
          amount: 0,
          optional: true,
          perDay: a.per_day ?? a.rate ?? 0,
          allocations: [{ itemIndex: idx, amount: 0 }],
        });
      }
    });
    // Auf-/Abbau werden als eigene Pauschalpositionen im PDF ausgewiesen.
    if (setupCost > 0) {
      servicesWithPrices.push({
        id: "setup",
        name: "Aufbau / Montage vor Ort",
        description: undefined,
        pricePercent: null,
        amount: setupCost,
        allocations: [],
      });
    }
    if (dismantleCost > 0) {
      servicesWithPrices.push({
        id: "dismantle",
        name: "Abbau / Demontage vor Ort",
        description: undefined,
        pricePercent: null,
        amount: dismantleCost,
        allocations: [],
      });
    }
    if (returnLoc && returnLoc.cost > 0) {
      servicesWithPrices.push({
        id: "return-location",
        name: `Rückgabe an anderem Standort (${returnLoc.name})`,
        description: undefined,
        pricePercent: null,
        amount: returnLoc.cost,
        allocations: [],
      });
    }
    const servicesSurcharge = servicesWithPrices.reduce((sum, s) => sum + s.amount, 0);

    // Bilder über den Stammnamen auflösen (nicht über einen Override nur für dieses Angebot).
    const missingImages = pdfItems.flatMap((p, k) => (p.image_url ? [] : [items[k].product_name]));
    if (missingImages.length) {
      try {
        const resolved = await resolveImagesByName(service, missingImages);
        pdfItems.forEach((item, k) => {
          if (item.image_url) return;
          item.image_url = resolved.get((items[k].product_name || "").trim().toLowerCase()) || null;
        });
      } catch (err) {
        console.error("Bildauflösung fehlgeschlagen:", err);
      }
    }

    const today = new Date();
    const validUntil = new Date(today.getTime() + validDays * 86400000);
    const fmt = (d: Date) => d.toLocaleDateString("de-DE");

    // Ansprechpartner: übergebener Name → Name aus dem Mitarbeiterprofil → Fallback
    let staffName = String(body.staff_name || "").trim().slice(0, 120);
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
      orderCode: (inquiry as { order_code?: string | null }).order_code ?? null,
      offerNumber,
      offerDate: fmt(today),
      validUntil: fmt(validUntil),
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
      notes: pdfNotes,
      validDays,
      deposit,
      additionalServices: [],
      staffName,
      extraFields,
      issuingLocation: locationKey,
      deliveryAddress: deliveryRequested ? deliveryAddress : undefined,
      paymentTerms,
      paymentTermsCustom: paymentTerms === "custom" ? paymentTermsCustom : undefined,
      inquiryOffer: isRentalOffer
        ? {
            addressForm,
            salutation: greeting,
            customerData: {
              contact: companyName ? (customerName || undefined) : undefined,
              phone: inquiry.customer_phone || undefined,
              mobile: inquiry.customer_mobile || undefined,
              email: customerEmail,
            },
            orderType,
            groups: offerGroups?.map((g) => ({ id: g.id, name: g.name })),
            termsText: termsPrint || undefined,
          }
        : undefined,

    });

    // PDF-Vorschau: nichts speichern, nichts senden, keinen Status ändern.
    if (isPreview) {
      let bin = "";
      const bytes = new Uint8Array(pdfBytes);
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      return json({ preview: true, pdf_base64: btoa(bin), offer_number: offerNumber });
    }

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

    // ── passende AGB als zweiter Anhang (B2C für Privat-, B2B für Geschäftskunden) ──
    const customerKind = inquiry.customer_kind === "business" ? "business" : "private";
    const agbPath = customerKind === "business" ? "legal/agb-b2b.pdf" : "legal/agb-b2c.pdf";
    const agbFileName = customerKind === "business"
      ? "AGB_SLT-Rental_Geschaeftskunden.pdf"
      : "AGB_SLT-Rental_Privatkunden.pdf";
    let agbBytes: Uint8Array | null = null;
    try {
      const { data: agbFile, error: agbErr } = await service.storage.from("brand-assets").download(agbPath);
      if (agbErr || !agbFile) throw agbErr ?? new Error("AGB nicht gefunden");
      agbBytes = new Uint8Array(await agbFile.arrayBuffer());
    } catch (err) {
      console.error("AGB-Anhang konnte nicht geladen werden:", agbPath, err);
    }

    // ── Online-Zahlungslink (Stripe) für Vorkasse-Angebote ──
    // Im Stripe-Testmodus erhält nur die Testadresse einen Link – nie echte Kunden.
    let paymentLinkUrl: string | null = null;
    let paymentLinkAmount = 0;
    try {
      if (isStripeConfigured()) {
        const paidCents = (Array.isArray(inquiry.payments) ? inquiry.payments : []).reduce(
          (sum: number, p: { amount?: unknown }) => sum + toCents(p?.amount),
          0,
        );
        const plan = planPaymentAmounts({ gross: totals.grossAmount, deposit, paidCents });
        if (shouldOfferPaymentLink({ paymentTerms, customerEmail, testMode: isStripeTestMode(), openCents: plan.openCents })) {
          const link = await ensurePaymentLink(service, {
            table: table as "rental_inquiries" | "sales_inquiries",
            inquiryId: inquiry.id,
            customerEmail,
            offerNumber,
            plan,
            createdBy: user.id,
          });
          if (link) {
            paymentLinkUrl = link.url;
            paymentLinkAmount = plan.openCents / 100;
          }
        }
      }
    } catch (e) {
      console.error("Zahlungslink konnte nicht erstellt werden:", (e as Error).message);
    }

    // ── Online-Annahme: unratbarer Link je Angebotsfassung; ältere Fassungen werden ungültig ──
    let acceptUrl = "";
    try {
      await service.from("offer_acceptance_links").update({ status: "void" }).eq("inquiry_id", inquiry.id).eq("status", "active");
      const raw = crypto.getRandomValues(new Uint8Array(24));
      const token = btoa(String.fromCharCode(...raw)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      const { error: accErr } = await service.from("offer_acceptance_links").insert({
        token,
        inquiry_table: table,
        inquiry_id: inquiry.id,
        offer_number: offerNumber,
        gross_amount: totals.grossAmount,
        valid_until: validUntil.toISOString().slice(0, 10),
        customer_email: customerEmail,
        created_by: user.id,
      });
      if (!accErr) acceptUrl = `https://www.slt-rental.de/angebot/${token}`;
      else console.error("Annahmelink konnte nicht erstellt werden:", accErr.message);
    } catch (e) {
      console.error("Annahmelink fehlgeschlagen:", (e as Error).message);
    }

    // ── E-Mail an den Kunden ──
    const resendKey = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;

    const pctFmt = (n: number) => (Number.isInteger(n) ? String(n) : String(n).replace(".", ","));
    let discountSum = 0;
    const groupName = new Map((offerGroups ?? []).map((g) => [g.id, g.name]));
    let lastGroupId: string | null = null;
    const rowsHtml = items.map((i) => {
      let groupHtml = "";
      if (groupName.size) {
        const gid = i.group_id && groupName.has(i.group_id) ? i.group_id : "";
        if (gid !== lastGroupId) {
          lastGroupId = gid;
          groupHtml = `<div style="padding:12px 0 2px;color:#00507d;font-weight:bold;font-size:13px;">${escapeHtml(gid ? groupName.get(gid) : "Positionen")}</div>`;
        }
      }
      const pct = Number(i.discount_percent) || 0;
      const gross = Math.round(i.quantity * i.unit_price * 100) / 100;
      const savings = Math.round(gross * (pct / 100) * 100) / 100;
      const net = Math.round((gross - savings) * 100) / 100;
      discountSum += savings;
      const discountHtml = pct > 0
        ? `<br><span style="color:#ff8e02;font-size:12px;font-weight:bold;">Listenpreis ${money(gross)} – Rabatt ${pctFmt(pct)} % = − ${money(savings)}</span>`
        : "";
      const desc = i.description_override || i.description;
      return `${groupHtml}
      <div style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
        <div style="font-weight:bold;font-size:14px;">${escapeHtml(i.name_override || i.product_name)}</div>
        ${desc ? `<div style="color:#6b7280;font-size:12px;margin-top:2px;">${escapeHtml(desc)}</div>` : ""}
        ${(i.addons ?? []).filter((a) => a.amount > 0 && !a.optional).map((a) => `<div style="color:#6b7280;font-size:12px;margin-top:2px;">&#8627; ${escapeHtml(a.label)}${a.note ? ` (${escapeHtml(a.note)})` : ""} – ${money(a.amount)}${addonExplanation(a, i) ? `<br><span style="font-size:11px;">${escapeHtml(addonExplanation(a, i))}</span>` : ""}</div>`).join("")}
        ${(i.addons ?? []).filter((a) => a.optional).map((a) => `<div style="color:#6b7280;font-size:12px;margin-top:2px;padding-left:12px;">Optional: ${escapeHtml(a.label)} – ${money(a.per_day ?? a.rate ?? 0)} je KT (nicht in der Summe enthalten)</div>`).join("")}
        ${discountHtml ? `<div style="margin-top:2px;">${discountHtml.replace(/^<br>/, "")}</div>` : ""}
        <table style="width:100%;border-collapse:collapse;margin-top:6px;font-size:13px;"><tr>
          <td style="color:#6b7280;padding:0;">${i.quantity}${i.unit ? ` ${escapeHtml(i.unit)}` : ""} &times; ${money(i.unit_price)}</td>
          <td style="text-align:right;padding:0;"><strong>${money(net)}</strong></td>
        </tr></table>
      </div>`;
    }).join("");


    // ── Transportkosten & Kaution als eigene Zeilen ──
    const extraRow = (label: string, value: string) => `
      <div style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;"><tr>
          <td style="padding:0;">${label}</td>
          <td style="text-align:right;padding:0;"><strong>${value}</strong></td>
        </tr></table>
      </div>`;

    const transportRowsHtml =
      (deliveryCostDelivery > 0 ? extraRow("Transportkosten Anlieferung", money(deliveryCostDelivery)) : "") +
      (deliveryCostReturn > 0 ? extraRow("Transportkosten Abholung/Rückholung", money(deliveryCostReturn)) : "") +
      (setupCost > 0 ? extraRow("Aufbau / Montage vor Ort", money(setupCost)) : "") +
      (dismantleCost > 0 ? extraRow("Abbau / Demontage vor Ort", money(dismantleCost)) : "") +
      (returnLoc && returnLoc.cost > 0 ? extraRow(`Rückgabe an anderem Standort (${escapeHtml(returnLoc.name)})`, money(returnLoc.cost)) : "");
    const transportTotal = deliveryCostDelivery + deliveryCostReturn;

    // ── Zahlungshinweis für die E-Mail ──
    const depositText = deposit > 0
      ? ` Zusätzlich ist die <strong>Kaution in Höhe von ${money(deposit)}</strong> mit zu überweisen; sie wird nach ordnungsgemäßer Rückgabe vollständig erstattet.`
      : "";
    const PAYMENT_EMAIL: Record<string, string> = {
      net_7: "Zahlung innerhalb von 7 Tagen nach Rechnungsstellung (netto)." + depositText,
      net_14: "Zahlung innerhalb von 14 Tagen nach Rechnungsstellung (netto)." + depositText,
      net_30: "Zahlung innerhalb von 30 Tagen nach Rechnungsstellung (netto)." + depositText,
      vorkasse:
        "<strong>Vorkasse komplett.</strong> Der Gesamtbetrag ist vor Mietbeginn zu leisten. " + F("Du wählst selbst: ", "Sie wählen selbst: ") +
        "per <strong>Banküberweisung</strong> (Bankdaten im Angebots-PDF, Verwendungszweck: Angebotsnummer) oder " +
        "<strong>online</strong> über " + F("deinen", "Ihren") + " persönlichen Zahlungslink." + depositText,
      anzahlung_30:
        "<strong>30 % Anzahlung.</strong> Mindestens 30 % der Bruttomiete sind als Anzahlung zu leisten, der Restbetrag " +
        "ist vor Mietbeginn fällig. " + F("Du wählst", "Sie wählen") + " selbst: per <strong>Banküberweisung</strong> (Bankdaten im Angebots-PDF, " +
        "Verwendungszweck: Angebotsnummer) oder <strong>online</strong> über " + F("deinen", "Ihren") + " persönlichen Zahlungslink – dort " +
        F("kannst du", "können Sie") + " auch direkt den Gesamtbetrag zahlen." + depositText,
      rentpair_vorkasse:
        "<strong>Vorkasse komplett.</strong> Der Gesamtbetrag ist vor Mietbeginn zu leisten – per Banküberweisung " +
        "(Verwendungszweck: Angebotsnummer) oder online über " + F("deinen", "Ihren") + " persönlichen Zahlungslink." + depositText,
    };
    const paymentEmailText = paymentTerms === "custom"
      ? escapeHtml(paymentTermsCustom).replace(/\n/g, "<br>") + depositText
      : (PAYMENT_EMAIL[paymentTerms] ?? PAYMENT_EMAIL.net_14);

    const emailHtml = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:16px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
<div style="max-width:600px;margin:0 auto;">
  <h2 style="color:#00507d;margin:0 0 16px;">${F("Dein", "Ihr")} Angebot ${escapeHtml(offerNumber)}</h2>
  <p>${escapeHtml(greeting)}</p>
  <p>${F("vielen Dank für deine Anfrage. Anbei erhältst du unser Angebot als PDF.", "vielen Dank für Ihre Anfrage. Anbei erhalten Sie unser Angebot als PDF.")}</p>
  ${pdfNotes ? `<p style="white-space:pre-wrap;">${escapeHtml(pdfNotes)}</p>` : ""}
  <div style="margin:16px 0;border-top:2px solid #00507d;">
    ${rowsHtml}
    ${transportRowsHtml}
  </div>
  ${discountSum > 0 ? `<p style="background:#fff7ed;border-left:4px solid #ff8e02;padding:10px 14px;margin:16px 0;border-radius:4px;font-size:14px;"><strong style="color:#ff8e02;">${F("Dein", "Ihr")} Rabattvorteil: − ${money(discountSum)}</strong><br><span style="color:#6b7280;font-size:13px;">Der Rabatt ist in den oben genannten Positionspreisen bereits abgezogen.</span></p>` : ""}
  <p style="font-size:15px;"><strong>Gesamtsumme brutto: ${money(totals.grossAmount)}</strong><br>
  <span style="color:#6b7280;font-size:13px;">Netto ${money(totals.netAmount)}${transportTotal > 0 ? ` (inkl. Transportkosten ${money(transportTotal)})` : ""} zzgl. ${totals.vatRate}% MwSt. (${money(totals.vatAmount)})</span>${deposit > 0 ? `<br><span style="color:#6b7280;font-size:13px;">zzgl. Kaution ${money(deposit)} (wird nach Rückgabe erstattet) – Gesamtüberweisung inkl. Kaution: ${money(totals.grossAmount + deposit)}</span>` : ""}</p>

  ${returnLoc ? `<p style="font-size:14px;"><strong>Rückgabe:</strong> Abholung am Standort ${escapeHtml(pickupName)}, Rückgabe am Standort ${escapeHtml(returnLoc.name)}${returnLoc.cost > 0 ? ` (Aufpreis ${money(returnLoc.cost)} netto)` : " (ohne Aufpreis)"}.</p>` : ""}
  ${deliveryRequested && (deliveryAddress.street || deliveryAddress.city) ? `<p style="font-size:14px;"><strong>Lieferadresse:</strong><br>${escapeHtml(deliveryAddress.street)}<br>${escapeHtml([deliveryAddress.postal_code, deliveryAddress.city].filter(Boolean).join(" "))}</p>` : ""}


  <div style="background:#fff7ed;border-left:4px solid #ff8e02;padding:12px 16px;margin:20px 0;border-radius:4px;">
    <strong>${F("So nimmst du das Angebot an:", "So nehmen Sie das Angebot an:")}</strong><br>
    ${acceptUrl ? `${F("Klick auf den Button und unterschreib digital", "Klicken Sie auf den Button und unterschreiben Sie digital")} – mit der Maus oder dem Finger auf dem Smartphone.
    <p style="margin:12px 0 8px;"><a href="${escapeHtml(acceptUrl)}" style="display:inline-block;background:#ff8e02;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:4px;">Angebot online annehmen</a></p>
    <span style="color:#6b7280;font-size:12px;">Mit der Annahme ${F("bestätigst du", "bestätigen Sie")} unsere ${customerKind === "business" ? "AGB für Unternehmer" : "AGB für Verbraucher"} und ${F("nimmst", "nehmen")} das Angebot ${escapeHtml(offerNumber)} rechtsverbindlich an.</span><br>
    <span style="color:#6b7280;font-size:12px;">Alternativ ${F("kannst du", "können Sie")} die Annahme auch per E-Mail an <a href="mailto:${escapeHtml(loc.email)}" style="color:#00507d;">${escapeHtml(loc.email)}</a> bestätigen.</span>` : `${F("Bitte bestätige uns", "Bitte bestätigen Sie uns")} die Annahme kurz per E-Mail an
    <a href="mailto:${escapeHtml(loc.email)}" style="color:#00507d;">${escapeHtml(loc.email)}</a>.`}${["net_7", "net_14", "net_30"].includes(paymentTerms) ? "" : `<br><span style="font-size:13px;">${F("Bitte leiste danach die Zahlung", "Bitte leisten Sie danach die Zahlung")} gemäß den unten stehenden Zahlungsbedingungen.</span>`}
  </div>
  ${paymentLinkUrl ? `<div style="background:#eef4f9;border-left:4px solid #00507d;padding:12px 16px;margin:20px 0;border-radius:4px;">
    <strong>Bequem online bezahlen:</strong><br>
    ${paymentTerms === "anzahlung_30" ? `${F("Über deinen persönlichen Zahlungslink zahlst du", "Über Ihren persönlichen Zahlungslink zahlen Sie")} wahlweise die <strong>30 % Anzahlung</strong> oder direkt den Gesamtbetrag von <strong>${money(paymentLinkAmount)}</strong>` : `${F("Über deinen persönlichen Zahlungslink kannst du", "Über Ihren persönlichen Zahlungslink können Sie")} den Betrag von <strong>${money(paymentLinkAmount)}</strong>`}${deposit > 0 ? ` (inkl. Kaution ${money(deposit)}, wird nach Rückgabe erstattet)` : ""} direkt online begleichen. Der Link gilt nur für dieses Angebot.
    <p style="margin:12px 0 0;"><a href="${escapeHtml(paymentLinkUrl)}" style="display:inline-block;background:#ff8e02;color:#ffffff;text-decoration:none;font-weight:bold;padding:10px 18px;border-radius:4px;">Zahlungsart wählen &amp; bezahlen</a></p>
    <span style="color:#6b7280;font-size:12px;">Alternativ ist die Banküberweisung gemäß den Zahlungsbedingungen weiterhin möglich.</span>
  </div>` : ""}
  <div style="background:#eef4f9;border-left:4px solid #00507d;padding:12px 16px;margin:20px 0;border-radius:4px;">
    <strong>${F("Wann ist dein Auftrag verbindlich?", "Wann ist Ihr Auftrag verbindlich?")}</strong><br>
    ${["net_7", "net_14", "net_30"].includes(paymentTerms) ? F("Nach deiner Annahme erhältst du unsere Auftragsbestätigung.", "Nach Ihrer Annahme erhalten Sie unsere Auftragsbestätigung.") : F("Sobald deine Zahlung bei uns eingegangen ist, erhältst du unsere Auftragsbestätigung.", "Sobald Ihre Zahlung bei uns eingegangen ist, erhalten Sie unsere Auftragsbestätigung.")}
    ${F("Erst mit der Auftragsbestätigung wird die Miete verbindlich und dein Auftrag gilt als angenommen. Maßgeblich ist allein die Auftragsbestätigung – sie dient dir als Nachweis, dass wir deinen Auftrag angenommen haben.", "Erst mit der Auftragsbestätigung wird die Miete verbindlich und Ihr Auftrag gilt als angenommen. Maßgeblich ist allein die Auftragsbestätigung – sie dient Ihnen als Nachweis, dass wir Ihren Auftrag angenommen haben.")}
  </div>
  <div style="background:#f1f5f9;border-left:4px solid #00507d;padding:12px 16px;margin:20px 0;border-radius:4px;">
    <strong>Zahlungsbedingungen:</strong><br>${paymentEmailText}
  </div>
  <p style="color:#6b7280;font-size:13px;">Dieses Angebot ist gültig bis ${escapeHtml(fmt(validUntil))}.</p>
  ${agbBytes ? `<p style="color:#6b7280;font-size:13px;">Es gelten unsere beigefügten ${customerKind === "business" ? "AGB für Unternehmer" : "AGB für Verbraucher"}.</p>` : ""}
  <p style="margin-top:24px;">${F("Viele Grüße<br>Dein", "Freundliche Grüße<br>Ihr")} SLT Rental Team – Standort ${escapeHtml(loc.name)}<br>
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
            // Standort-Postfach immer in Kopie (inkl. abweichender Anfrage-Mailbox)
            cc: Array.from(
              new Set(
                [loc.email, str(inquiry.location_email)]
                  .filter((e) => e && e !== customerEmail),
              ),
            ),
            reply_to: loc.email,
            subject: await codedSubject(service, `${isRevision ? F("Dein überarbeitetes Angebot", "Ihr überarbeitetes Angebot") : F("Dein Angebot", "Ihr Angebot")} von SLT Rental – ${offerNumber}`, { table, id: inquiry.id }),
            html: emailHtml,
            attachments: [
              { filename: fileName, content: encodeBase64(pdfBytes) },
              ...(agbBytes ? [{ filename: agbFileName, content: encodeBase64(agbBytes) }] : []),
            ],
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
        // im Portal geänderte Lieferadresse zurückschreiben
        delivery_street: deliveryRequested ? deliveryAddress.street || null : null,
        delivery_postal_code: deliveryRequested ? deliveryAddress.postal_code || null : null,
        delivery_city: deliveryRequested ? deliveryAddress.city || null : null,
        ...(inquiryType === "rental" ? { delivery_requested: deliveryRequested } : {}),
        // Snapshot des Angebots – Grundlage für die spätere Rechnung (inkl. Zusatzoptionen)
        offer_payload: {
          offer_number: offerNumber,
          base_offer_number: baseOfferNumber,
          version,
          supersedes,
          delivery_requested: deliveryRequested,
          delivery_address: deliveryAddress,
          created_at: new Date().toISOString(),
          items,
          delivery_cost_delivery: deliveryCostDelivery,
          delivery_cost_return: deliveryCostReturn,
          setup_cost: setupCost,
          dismantle_cost: dismantleCost,
          return_location: returnLoc?.key ?? null,
          return_location_cost: returnLocationCost,
          deposit,
          payment_terms: paymentTerms,
          payment_terms_custom: paymentTermsCustom || null,
          valid_days: validDays,
          notes,
          totals,
          open_ended: openEnded,
          use_saturday: body.use_saturday === true,
          use_sunday: body.use_sunday === true,
          ...(offerGroups ? { groups: offerGroups } : {}),
          ...(extraFields ? { extra_fields: extraFields } : {}),
          ...(orderType ? { order_type: orderType } : {}),
          ...(isRentalOffer ? { terms_text: termsRaw, address_form: addressForm } : {}),
        },
        ...(inquiryType === "rental"
          ? {
              installment_open_ended: openEnded,
              ...(openEnded ? { installment_amount_net: monthlyNetFromOffer(items as unknown as Array<Record<string, unknown>>) || null } : {}),
            }
          : {}),

      })

      .eq("id", inquiry.id);
    if (updErr) console.error("Status-Update fehlgeschlagen:", updErr.message);

    // Verknüpfte Telefonate gelten als erledigt, sobald das Angebot gesendet wurde
    if (!updErr && inquiryType === "rental") {
      const { error: callErr } = await service
        .from("phone_calls")
        .update({ status: "done" })
        .eq("rental_inquiry_id", inquiry.id)
        .neq("status", "done");
      if (callErr) console.error("Anruf-Status-Update fehlgeschlagen:", callErr.message);
    }

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
