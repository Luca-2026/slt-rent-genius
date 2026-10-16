import { CLEANING_UNIT_GROSS, CLEANING_UNIT_MINUTES, cleaningChargeGross, cleaningSuggested, depositSettlementNote, settleDeposit } from "@/lib/returnCharges";
import { invokeWithAuth } from "@/lib/invokeWithAuth";
import { needsOfferDepositWarning } from "@/lib/offerDeposit";
import { OfferDepositWarning } from "@/components/b2b/OfferDepositWarning";
import { safeCustomerPaymentTerms } from "@/lib/customerPaymentTerms";
import { isStripePayment, shortPaymentReference } from "@/lib/paymentPresentation";
import { PdfPagesPreview } from "@/components/b2b/PdfPagesPreview";
import { applyCategoryDiscount, loadCategoryDiscounts, loadInquiryProfileId, type DiscountMap } from "@/lib/customerDiscounts";
import { NumberInput } from "@/components/ui/number-input";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, Eye, GripVertical, Info, Loader2, Plus, Send, Trash2 } from "lucide-react";
import { moveItem } from "@/components/b2b/admin/SortableRows";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  LOCATION_LABELS,
  badgeText,
  evaluateLine,
  fetchAvailability,
  normalizeLocation,
  toIsoDate,
  type InventoryIssue,
  type InventoryResult,
} from "@/lib/inventoryAvailability";
import { InventoryWarningDialog } from "./InventoryWarningDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildOfferTotals, formatEuro, isValidOfferTotal, lineTotal, type OfferLine } from "./offerMath";
import { ADDON_PRESETS, parseAddonOptions, type AddonOption } from "@/lib/offerAddons";
import { AddonSection, recalcAddons } from "./OfferAddonSection";
import {
  InquiryProductCombobox,
  findCatalogProductByName,
  pickCatalogImage,
} from "./InquiryProductCombobox";
import { SalesProductCombobox } from "./SalesProductCombobox";
import { SALES_ADDON_PRESETS } from "@/lib/salesAddons";
import { loadSalesCatalog, loadSalesCosts, type SalesCatalogItem, type SalesCostRow } from "@/hooks/useSalesCatalog";
import { checkSalesPrice, findSalesArticle, minimumPrice } from "@/lib/salesPricing";
import { OFFER_UNITS, unitAbbreviation, unitLabel, type OfferUnit } from "@/lib/offerUnits";
import {
  WEEKEND_SUFFIX,
  computeRentalLinePrice,
  rentalBlockCount,
  resolveProductPrices,
  type LocationPriceRow,
  type ManagedPrices,
  type PricedProduct,
  type RentalDayOptions,
} from "@/lib/pricing/rentalPricing";
import { resolveCatalogPrice } from "@/lib/catalogPricing";
import {
  clearInquiryDraft,
  deleteServerDraft,
  fetchServerDraft,
  saveServerDraft,
  type ServerInquiryDraft,
  inquiryDraftKey,
  readInquiryDraft,
  writeInquiryDraft,
} from "./offerDraftStorage";

/** Angebotsposition inkl. der im CMS erlaubten Zusatzoptionen (nur lokal). */
type FormLine = OfferLine & {
  /** CMS-Slug des Artikels – Basis für die Bestandsprüfung. */
  product_slug?: string;
  available_addons?: AddonOption[];
  /** Woher der Einzelpreis stammt: aus dem CMS vorbelegt oder manuell überschrieben. */
  price_source?: "cms" | "manual";
  /** true = eigener Zeitraum, sonst wird der Zeitraum der ersten Position übernommen. */
  custom_period?: boolean;
  /** true = Rabatt automatisch aus den Kundenrabatten vorbelegt. */
  discount_auto?: boolean;
  /** Paket 2: CMS-Staffelpreise dieser Position (nur lokal). */
  pricing?: LinePricing;
  /** Einheit von Hand gewählt – sonst defaultUnit des Preisschemas. */
  unit_manual?: boolean;
  /** Anzeige der verwendeten Staffel, z. B. "ab 3 Miettagen". */
  tier_label?: string;
};

/**
 * Zeitraum-Übernahme: Positionen ohne eigenen Zeitraum erben Dauer, Einheit und
 * Zeitraumtext der ersten Position, damit nichts kopiert werden muss.
 */
function applyInheritedPeriod(item: FormLine, index: number, base: FormLine | undefined): FormLine {
  if (index === 0 || item.custom_period || !base) return item;
  return {
    ...item,
    duration: base.duration,
    unit: base.unit,
    description: item.description?.trim() ? item.description : base.description,
  };
}

/**
 * Auswahlliste der Zusatzoptionen einer Position: die im CMS gepflegten Optionen
 * plus die Standard-Presets (Versicherungen etc.), damit auch bei Artikeln ohne
 * CMS-Pflege immer Zusatzoptionen angeboten werden.
 */
function addonOptionsFor(item: FormLine, isSales = false): AddonOption[] {
  const fromCms = item.available_addons ?? [];
  const source = isSales
    ? SALES_ADDON_PRESETS
    : ADDON_PRESETS.filter((p) => p.key !== "custom");
  const presets: AddonOption[] = source.map((p) => ({
    key: p.key,
    label: p.label,
    price_type: p.price_type,
    price: p.price,
    deductible: (p as { deductible?: number | null }).deductible ?? null,
  }));
  const merged = [...fromCms];
  for (const p of presets) if (!merged.some((o) => o.key === p.key)) merged.push(p);
  return merged;
}

/**
 * Preis-Vorbelegung beim Artikelwechsel: CMS-Preis übernehmen, sofern hinterlegt
 * und der Preis nicht manuell überschrieben wurde. Ohne CMS-Preis bleibt das Feld
 * leer (bzw. der manuell gesetzte Preis erhalten).
 */
function resolvePricePatch(
  item: FormLine,
  resolved: { price: number; unit?: OfferUnit } | undefined,
): Partial<FormLine> {
  if (item.price_source === "manual" && item.unit_price > 0) return {};
  if (resolved) {
    return {
      unit_price: resolved.price,
      price_source: "cms",
      unit: item.unit ?? resolved.unit ?? "kalendertage",
      duration: item.duration && item.duration > 0 ? item.duration : 1,
    };
  }
  return { unit_price: 0, price_source: undefined };
}


function emptyLine(): FormLine {
  return {
    product_name: "",
    description: "",
    quantity: 1,
    duration: 1,
    unit: "kalendertage",
    unit_price: 0,
    discount_percent: 0,
  };
}

// ---------------------------------------------------------------- Paket 2: Staffelpreise

/** CMS-Preisdaten einer Position (nur lokal, wird nicht gesendet). */
interface LinePricing {
  scheme: string | null;
  prices: ManagedPrices;
  /** Artikelname ohne Wochenendtarif-Zusatz */
  base_name: string;
  /** kundenspezifischer Einzelpreis (b2b_customer_prices) – ersetzt den Staffelsatz ganz */
  customer_price?: number | null;
}

interface CustomerPriceRow {
  product_id: string | null;
  product_name: string;
  unit_price: number;
}

const PRICE_COLUMNS =
  "id,pricing_scheme,prices_same_all_locations,price_per_day,price_from_1_rd,price_from_3_rd,price_from_10_rd,price_from_20_rd,price_weekend_num,price_base_1_3_cd,surcharge_per_cd_from_4,surcharge_per_cd_from_8";

async function loadRentalPricing(
  slug: string | null | undefined,
  location: string | null,
): Promise<{ id: string; scheme: string | null; prices: ManagedPrices } | null> {
  if (!slug) return null;
  const { data } = await supabase.from("b2b_managed_products").select(PRICE_COLUMNS).eq("slug", slug).limit(1).maybeSingle();
  const product = data as (PricedProduct & { id: string }) | null;
  if (!product) return null;
  let rows: LocationPriceRow[] = [];
  if (product.prices_same_all_locations === false) {
    const { data: loc } = await supabase
      .from("b2b_managed_product_location_prices")
      .select("*")
      .eq("managed_product_id", product.id);
    rows = (loc ?? []) as LocationPriceRow[];
  }
  return { id: product.id, scheme: product.pricing_scheme ?? null, prices: resolveProductPrices(product, location, rows) };
}

/**
 * Dauer und Einzelpreis einer Position aus Zeitraum + Staffel neu setzen.
 * Reihenfolge: Staffelsatz → Kundenpreis ersetzt ihn ganz ODER Kategorierabatt (discount_percent) darauf.
 * Positionen mit price_manual bleiben unverändert.
 */
function applyRentalPricing(item: FormLine, dayOpts: RentalDayOptions): FormLine {
  const p = item.pricing;
  if (!p || item.price_manual || !item.rental_start || !item.rental_end) return item;
  const r = computeRentalLinePrice({
    prices: p.prices,
    scheme: p.scheme,
    start: { date: item.rental_start, time: item.rental_start_time },
    end: { date: item.rental_end, time: item.rental_end_time },
    unit: item.unit_manual ? ((item.unit ?? null) as OfferUnit | null) : null,
    opts: dayOpts,
  });
  const base: FormLine = { ...item, custom_period: true, product_name: p.base_name };
  if (r.kind === "weekend") {
    return { ...base, product_name: p.base_name + WEEKEND_SUFFIX, unit: "pauschal", duration: 1, unit_price: r.unit_price, price_source: "cms", price_basis: "weekend", tier_label: r.label };
  }
  if (r.kind === "duration_only") return { ...base, unit: r.unit, duration: r.duration, price_basis: undefined, tier_label: undefined };
  if (p.customer_price && p.customer_price > 0) {
    return {
      ...base,
      unit: r.unit,
      duration: r.duration,
      unit_price: p.customer_price,
      price_source: "cms",
      price_basis: "customer",
      tier_label: "Kundenpreis",
      // Nie beides: ein automatisch vorbelegter Kategorierabatt entfällt beim Kundenpreis.
      ...(item.discount_auto ? { discount_percent: 0, discount_auto: false } : {}),
    };
  }
  return { ...base, unit: r.unit, duration: r.duration, unit_price: r.unit_price, price_source: "cms", price_basis: "tier", tier_label: r.label };
}

const PAYMENT_OPTIONS: Record<"business" | "private", { value: string; label: string }[]> = {
  business: [
    { value: "net_14", label: "Rechnung – 14 Tage netto" },
    { value: "net_7", label: "Rechnung – 7 Tage netto" },
    { value: "net_30", label: "Rechnung – 30 Tage netto" },
    { value: "anzahlung_30", label: "30 % Anzahlung – Überweisung oder online" },
    { value: "vorkasse", label: "Vorkasse komplett – Überweisung oder online" },
    { value: "custom", label: "Individuelle Zahlungsbedingungen …" },
  ],
  private: [
    { value: "anzahlung_30", label: "30 % Anzahlung – Überweisung oder online" },
    { value: "vorkasse", label: "Vorkasse komplett – Überweisung oder online" },
  ],
};

/** Zahlungsziele für Rechnungen – Zahlungslink-Varianten gelten nur für Angebote. */
const INVOICE_PAYMENT_OPTIONS = [
  { value: "net_14", label: "Zahlbar innerhalb von 14 Tagen" },
  { value: "net_7", label: "Zahlbar innerhalb von 7 Tagen" },
  { value: "net_30", label: "Zahlbar innerhalb von 30 Tagen" },
  { value: "vorkasse", label: "Sofort fällig ohne Abzug" },
  { value: "custom", label: "Individuelle Zahlungsbedingungen …" },
];

export interface OfferDeliveryAddress {
  requested: boolean;
  street: string;
  postal_code: string;
  city: string;
}

interface Props {
  inquiryType: "rental" | "sales";
  inquiryId: string;
  location: string | null;
  defaultItems: (OfferLine & { custom_period?: boolean; product_slug?: string })[];
  /** Vom Kunden im Anfrageformular angegebene Lieferadresse (im Portal änderbar). */
  defaultDelivery?: OfferDeliveryAddress;
  /** Privat- oder Geschäftskunde – steuert die Zahlungsbedingungen. */
  customerKind?: "business" | "private";
  staffName: string;
  disabled?: boolean;
  onSent?: () => void;
  /** "offer" (Standard) erzeugt ein Angebot, "invoice" eine Rechnung bzw. einen Nachtrag. */
  mode?: "offer" | "invoice";
  invoiceKind?: "invoice" | "supplement" | "final";
  parentInvoiceId?: string | null;
  parentInvoiceNumber?: string | null;
  /** Vorbelegter Leistungszeitraum (YYYY-MM-DD). */
  defaultServicePeriod?: { start?: string | null; end?: string | null };
  /** Vorbelegte Nebenkosten (z. B. aus dem angenommenen Angebot). */
  defaultCosts?: {
    delivery_cost_delivery?: number;
    delivery_cost_return?: number;
    setup_cost?: number;
    dismantle_cost?: number;
    /** Abweichender Rückgabestandort (One-Way) und Netto-Aufpreis. */
    return_location?: string | null;
    return_location_cost?: number;
    deposit?: number;
  };
  /** Bereits geleistete Zahlungen (z. B. Vorkasse auf das Angebot) – nur Rechnungen. */
  defaultPayments?: OfferPayment[];
  /** Mietzeitraum der Anfrage (YYYY-MM-DD) – Basis für die Bestandsprüfung. */
  rentalPeriod?: { start?: string | null; end?: string | null };
  /** Verknüpfte B2B-Reservierung – Quelle für offene Schäden/Zusatzkosten aus dem Rücknahmeprotokoll. */
  reservationId?: string | null;
  /** Angebotsnummer der Fassung, die überarbeitet wird (nur Angebotsmodus). */
  reviseOf?: string | null;
  /** Vorbelegung aus dem überarbeiteten Angebot. */
  defaultMeta?: {
    payment_terms?: string | null;
    payment_terms_custom?: string | null;
    valid_days?: number | null;
    notes?: string | null;
    open_ended?: boolean | null;
  };
  /** Vollseite: Aktionsleiste oben angeheftet statt am Formularende (nur Anordnung). */
  stickyActions?: boolean;
  /** Zusätzliche Elemente links in der angehefteten Aktionsleiste (z. B. Status). */
  stickyActionsLead?: ReactNode;
}

/** Offene Position aus einem Rücknahmeprotokoll, die noch nicht abgerechnet wurde. */
interface PendingProtocolCharge {
  id: string;
  source: "damage" | "extra_charge" | "suggestion";
  label: string;
  description?: string;
  /** Bruttobetrag laut Protokoll */
  gross: number;
  /** Nur Reinigungsvorschlag: Anzahl 15-Minuten-Einheiten (anpassbar). */
  cleaningUnits?: number;
}

/** Erfasste (Teil-)Zahlung, die auf der Rechnung abgezogen wird. */
export interface OfferPayment {
  date: string;
  amount: number;
  label: string;
  reference?: string;
}


export function InquiryOfferForm({
  inquiryType,
  inquiryId,
  location,
  defaultItems,
  defaultDelivery,
  customerKind = "private",
  staffName,
  disabled,
  onSent,
  mode = "offer",
  invoiceKind = "invoice",
  parentInvoiceId = null,
  parentInvoiceNumber = null,
  defaultServicePeriod,
  defaultCosts,
  defaultPayments,
  rentalPeriod,
  reservationId = null,
  reviseOf = null,
  defaultMeta,
  stickyActions = false,
  stickyActionsLead,
}: Props) {
  const isInvoice = mode === "invoice";
  const isSupplement = isInvoice && invoiceKind === "supplement";
  const { toast } = useToast();

  // Zwischengespeicherter Entwurf (Tabwechsel / Reload) – einmalig beim Mount gelesen.
  const draftKey = inquiryDraftKey(reviseOf && !isInvoice ? `revise-${reviseOf}` : mode, inquiryType, inquiryId);
  const draftRef = useRef(readInquiryDraft<Record<string, any>>(draftKey));
  const draft = draftRef.current;
  const [draftRestored, setDraftRestored] = useState(!!draft);

  const [items, setItems] = useState<FormLine[]>(
    Array.isArray(draft?.items) && draft!.items.length
      ? (draft!.items as FormLine[])
      : defaultItems.length
        ? defaultItems
        : [emptyLine()],
  );
  const emptyDelivery: OfferDeliveryAddress = { requested: false, street: "", postal_code: "", city: "" };
  const [delivery, setDelivery] = useState<OfferDeliveryAddress>(
    (draft?.delivery as OfferDeliveryAddress) ?? defaultDelivery ?? emptyDelivery,
  );
  const [deliveryCostDelivery, setDeliveryCostDelivery] = useState(
    draft?.deliveryCostDelivery ?? defaultCosts?.delivery_cost_delivery ?? 0,
  );
  const [deliveryCostReturn, setDeliveryCostReturn] = useState(
    draft?.deliveryCostReturn ?? defaultCosts?.delivery_cost_return ?? 0,
  );
  /** Pauschalen für Auf- und Abbau (Montage/Demontage vor Ort). */
  const [setupCost, setSetupCost] = useState(draft?.setupCost ?? defaultCosts?.setup_cost ?? 0);
  const [dismantleCost, setDismantleCost] = useState(draft?.dismantleCost ?? defaultCosts?.dismantle_cost ?? 0);
  /** Rückgabe an anderem Standort als die Abholung ("" = gleicher Standort) inkl. Netto-Aufpreis. */
  const [returnLocation, setReturnLocation] = useState<string>(draft?.returnLocation ?? defaultCosts?.return_location ?? "");
  const [returnLocationCost, setReturnLocationCost] = useState<number>(draft?.returnLocationCost ?? defaultCosts?.return_location_cost ?? 0);
  const [deposit, setDeposit] = useState(draft?.deposit ?? defaultCosts?.deposit ?? 0);
  const [depositAcknowledged, setDepositAcknowledged] = useState(false);
  const depositWarning = needsOfferDepositWarning(deposit, !isInvoice && inquiryType === "rental");
  useEffect(() => { setDepositAcknowledged(false); }, [deposit, inquiryId]);
  const [validDays, setValidDays] = useState(draft?.validDays ?? defaultMeta?.valid_days ?? 14);
  /** Unbefristete Monatsmiete: Mietpositionen gelten pro Monat, kein Enddatum (nur Mietangebote). */
  const canOpenEnded = !isInvoice && inquiryType === "rental";
  const [openEnded, setOpenEnded] = useState<boolean>(canOpenEnded && !!(draft?.openEnded ?? defaultMeta?.open_ended));
  /** Paket 2: Staffel-/Dauerrechnung nur im Mietangebot (Rechnungen übernehmen die Angebotswerte). */
  const pricingActive = inquiryType === "rental" && !isInvoice;
  /** Einsatz am Samstag/Sonntag (Bau ab 5 Miettagen) – im offer_payload als use_saturday/use_sunday. */
  const [useSaturday, setUseSaturday] = useState<boolean>(!!(draft?.useSaturday ?? (defaultMeta as { use_saturday?: boolean } | undefined)?.use_saturday));
  const [useSunday, setUseSunday] = useState<boolean>(!!(draft?.useSunday ?? (defaultMeta as { use_sunday?: boolean } | undefined)?.use_sunday));
  const dayOpts: RentalDayOptions = { use_saturday: useSaturday, use_sunday: useSunday };
  /** Bereits erhaltene (Teil-)Zahlungen – werden auf der Rechnung abgezogen. */
  const [payments, setPayments] = useState<OfferPayment[]>(
    [...((draft?.payments as OfferPayment[]) ?? defaultPayments ?? []).filter((p) => !isStripePayment(p)),
      ...(defaultPayments ?? []).filter(isStripePayment)],
  );
  /** Leistungszeitraum der Rechnung (nur im Rechnungsmodus sichtbar). */
  const [servicePeriodStart, setServicePeriodStart] = useState(
    draft?.servicePeriodStart ?? defaultServicePeriod?.start ?? "",
  );
  const [servicePeriodEnd, setServicePeriodEnd] = useState(
    draft?.servicePeriodEnd ?? defaultServicePeriod?.end ?? "",
  );

  // Standard immer Vorkasse (auch Geschäftskunden), damit nie versehentlich „auf Rechnung“ rausgeht.
  const defaultTerms = () =>
    isInvoice || customerKind === "business" ? "vorkasse" : "anzahlung_30";
  const [paymentTerms, setPaymentTerms] = useState<string>(() => {
    const t = draft?.paymentTerms ?? defaultMeta?.payment_terms ?? defaultTerms();
    // Alte Variante „Vorkasse über Zahlungslink“ ist jetzt Teil von „Vorkasse komplett“.
    return safeCustomerPaymentTerms(customerKind, t, isInvoice);
  });
  /** Freitext für „Individuelle Zahlungsbedingungen“ (nur Geschäftskunden). */
  const [paymentTermsCustom, setPaymentTermsCustom] = useState<string>(draft?.paymentTermsCustom ?? defaultMeta?.payment_terms_custom ?? "");
  const sendLock = useRef(false);
  /** Entwurfs-Werte dürfen von den „Standardwerte setzen“-Effekten nicht überschrieben werden. */
  const skipDefaults = useRef(!!draft || !!defaultMeta?.payment_terms);

  useEffect(() => {
    if (customerKind === "private") {
      setPaymentTerms((terms) => safeCustomerPaymentTerms(customerKind, terms, isInvoice));
      return;
    }
    if (skipDefaults.current) return;
    setPaymentTerms(defaultTerms());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerKind, isInvoice]);
  const [notes, setNotes] = useState<string>(draft?.notes ?? defaultMeta?.notes ?? "");
  const [sending, setSending] = useState(false);

  /** Offene Schäden/Zusatzkosten aus dem Rücknahmeprotokoll dieser Anfrage. */
  const [pendingCharges, setPendingCharges] = useState<PendingProtocolCharge[]>([]);
  /** Bereits in die Rechnung übernommene Protokollposten (werden nach Versand als abgerechnet markiert). */
  const takenChargesRef = useRef<PendingProtocolCharge[]>([]);
  const [takenCharges, setTakenCharges] = useState<PendingProtocolCharge[]>([]);
  const [protocolNumbers, setProtocolNumbers] = useState<string[]>([]);

  useEffect(() => {
    const byInquiry = inquiryType === "rental" && !!inquiryId;
    if (!isInvoice || (!reservationId && !byInquiry)) {
      setPendingCharges([]);
      return;
    }
    let active = true;
    (async () => {
      let q = supabase.from("b2b_return_protocols").select("id, return_protocol_number, protocol_data, extra_charges_total");
      q = reservationId && byInquiry
        ? q.or(`reservation_id.eq.${reservationId},rental_inquiry_id.eq.${inquiryId}`)
        : reservationId ? q.eq("reservation_id", reservationId) : q.eq("rental_inquiry_id", inquiryId);
      const { data: protocols } = await q;
      const ids = (protocols ?? []).map((p) => p.id);
      if (active) setProtocolNumbers((protocols ?? []).map((p) => p.return_protocol_number).filter(Boolean));
      if (!ids.length) {
        if (active) setPendingCharges([]);
        return;
      }
      const [{ data: damages }, { data: charges }] = await Promise.all([
        supabase
          .from("b2b_protocol_damages")
          .select("id, item_name, category, description, amount")
          .in("return_protocol_id", ids)
          .eq("billed", false),
        supabase
          .from("b2b_return_extra_charges")
          .select("id, label, quantity, unit_price, notes")
          .in("return_protocol_id", ids)
          .eq("billed", false),
      ]);
      if (!active) return;
      const list: PendingProtocolCharge[] = [
        ...(damages ?? [])
          .filter((d) => Number(d.amount) > 0)
          .map((d) => ({
            id: d.id,
            source: "damage" as const,
            label: `Schadensersatz${d.item_name ? ` – ${d.item_name}` : ""}`,
            description: [d.category, d.description].filter(Boolean).join(": "),
            gross: Number(d.amount),
          })),
        ...(charges ?? []).map((c) => ({
          id: c.id,
          source: "extra_charge" as const,
          label: c.label,
          description: c.notes || undefined,
          gross: Math.round(Number(c.quantity) * Number(c.unit_price) * 100) / 100,
        })),
      ];
      // Ältere Protokolle ohne erfasste Zusatzkosten: Reinigung aus der Sauberkeit vorschlagen.
      for (const p of protocols ?? []) {
        const rating = Number((p.protocol_data as { cleanliness_rating?: unknown } | null)?.cleanliness_rating) || 0;
        const hasCharges = (charges ?? []).length > 0 || Number(p.extra_charges_total) > 0;
        if (!hasCharges && cleaningSuggested(rating)) {
          list.push({
            id: `suggest-clean-${p.id}`, source: "suggestion",
            label: "Reinigung (Mehraufwand laut AGB)",
            description: `Rückgabeprotokoll ${p.return_protocol_number}: Sauberkeit ${rating}/5 · 40,00 € netto je 15 Min`,
            gross: cleaningChargeGross(1),
            cleaningUnits: 1,
          });
        }
      }
      const takenIds = new Set(takenChargesRef.current.map((t) => t.id));
      setPendingCharges(list.filter((c) => !takenIds.has(c.id)));
    })();
    return () => { active = false; };
  }, [isInvoice, reservationId, inquiryId, inquiryType]);

  /** Protokollposten als Rechnungsposition übernehmen (Brutto → Netto). */
  const takeProtocolCharge = (charge: PendingProtocolCharge) => {
    takenChargesRef.current = [...takenChargesRef.current, charge];
    setTakenCharges(takenChargesRef.current);
    setPendingCharges((prev) => prev.filter((c) => c.id !== charge.id));
    setItems((prev) => [
      ...prev,
      {
        product_name: charge.label,
        description: charge.description ?? "",
        quantity: 1,
        duration: 1,
        unit: "pauschal",
        unit_price: Math.round((charge.gross / 1.19) * 100) / 100,
        discount_percent: 0,
      } as FormLine,
    ]);
  };

  // Bei Wechsel der Anfrage die Lieferadresse aus dem Anfrageformular übernehmen.
  useEffect(() => {
    if (skipDefaults.current) {
      skipDefaults.current = false;
      return;
    }
    setDelivery(defaultDelivery ?? emptyDelivery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquiryId, defaultDelivery?.requested, defaultDelivery?.street, defaultDelivery?.postal_code, defaultDelivery?.city]);

  /** Erster Autosave-Lauf beim Öffnen schreibt nicht auf den Server (nur echte Änderungen). */
  const dirtyRef = useRef(false);
  const [remoteDraft, setRemoteDraft] = useState<ServerInquiryDraft | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);

  const applyDraftData = (d: Record<string, any>) => {
    if (Array.isArray(d.items) && d.items.length) setItems(d.items as FormLine[]);
    if (d.delivery) setDelivery(d.delivery as OfferDeliveryAddress);
    setDeliveryCostDelivery(d.deliveryCostDelivery ?? 0);
    setDeliveryCostReturn(d.deliveryCostReturn ?? 0);
    setSetupCost(d.setupCost ?? 0);
    setDismantleCost(d.dismantleCost ?? 0);
    setReturnLocation(d.returnLocation ?? "");
    setReturnLocationCost(d.returnLocationCost ?? 0);
    setDeposit(d.deposit ?? 0);
    setValidDays(d.validDays ?? 14);
    setPayments(((d.payments as OfferPayment[]) ?? []).filter((p) => !isStripePayment(p)));
    setServicePeriodStart(d.servicePeriodStart ?? "");
    setServicePeriodEnd(d.servicePeriodEnd ?? "");
    if (d.paymentTerms) setPaymentTerms(safeCustomerPaymentTerms(customerKind, d.paymentTerms, isInvoice));
    setPaymentTermsCustom(d.paymentTermsCustom ?? "");
    setNotes(d.notes ?? "");
    setOpenEnded(canOpenEnded && !!d.openEnded);
    setUseSaturday(!!d.useSaturday);
    setUseSunday(!!d.useSunday);
  };

  /** Beim Öffnen prüfen, ob auf dem Server ein Entwurf (ggf. von Kollegen) liegt. */
  useEffect(() => {
    if (disabled) return;
    let cancelled = false;
    (async () => {
      const [{ data: u }, remote] = await Promise.all([supabase.auth.getUser(), fetchServerDraft(draftKey)]);
      if (cancelled) return;
      const uid = u.user?.id ?? null;
      setMyUserId(uid);
      if (!remote) return;
      const localAt = draftRef.current?.savedAt ?? 0;
      const remoteAt = new Date(remote.updatedAt).getTime();
      if (remote.updatedBy === uid && localAt >= remoteAt) return;
      if (remote.updatedBy === uid) {
        applyDraftData(remote.data);
        setDraftRestored(true);
        return;
      }
      setRemoteDraft(remote);
      // Ohne eigenen lokalen Stand: Kollegen-Entwurf direkt laden, damit nichts doppelt erfasst wird.
      if (!draftRef.current) {
        applyDraftData(remote.data);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey, disabled]);

  /** Entwurf laufend sichern (leicht verzögert, damit Tippen nicht bremst). */
  useEffect(() => {
    if (disabled) return;
    const timer = window.setTimeout(() => {
      const snapshot = {
        items,
        delivery,
        deliveryCostDelivery,
        deliveryCostReturn,
        setupCost,
        dismantleCost,
        returnLocation,
        returnLocationCost,
        deposit,
        validDays,
        payments,
        servicePeriodStart,
        servicePeriodEnd,
        paymentTerms,
        paymentTermsCustom,
        notes,
        openEnded,
        useSaturday,
        useSunday,
      };
      writeInquiryDraft(draftKey, snapshot);
      if (dirtyRef.current) {
        void saveServerDraft(draftKey, inquiryType, inquiryId, snapshot);
      }
      dirtyRef.current = true;
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [
    draftKey,
    disabled,
    items,
    delivery,
    deliveryCostDelivery,
    deliveryCostReturn,
    setupCost,
    dismantleCost,
    returnLocation,
    returnLocationCost,
    deposit,
    validDays,
    payments,
    servicePeriodStart,
    servicePeriodEnd,
    paymentTerms,
    paymentTermsCustom,
    notes,
    openEnded,
    useSaturday,
    useSunday,
  ]);

  /** Entwurf verwerfen und Formular auf die Ausgangswerte zurücksetzen. */
  const discardDraft = () => {
    clearInquiryDraft(draftKey);
    void deleteServerDraft(draftKey);
    dirtyRef.current = false;
    setRemoteDraft(null);
    draftRef.current = null;
    setDraftRestored(false);
    setItems(defaultItems.length ? defaultItems : [emptyLine()]);
    setDelivery(defaultDelivery ?? emptyDelivery);
    setDeliveryCostDelivery(defaultCosts?.delivery_cost_delivery ?? 0);
    setDeliveryCostReturn(defaultCosts?.delivery_cost_return ?? 0);
    setSetupCost(defaultCosts?.setup_cost ?? 0);
    setDismantleCost(defaultCosts?.dismantle_cost ?? 0);
    setReturnLocation(defaultCosts?.return_location ?? "");
    setReturnLocationCost(defaultCosts?.return_location_cost ?? 0);
    setDeposit(defaultCosts?.deposit ?? 0);
    setValidDays(defaultMeta?.valid_days ?? 14);
    setPayments(defaultPayments ?? []);
    setServicePeriodStart(defaultServicePeriod?.start ?? "");
    setServicePeriodEnd(defaultServicePeriod?.end ?? "");
    setPaymentTerms(safeCustomerPaymentTerms(customerKind, defaultMeta?.payment_terms ?? defaultTerms(), isInvoice));
    setPaymentTermsCustom(defaultMeta?.payment_terms_custom ?? "");
    setNotes(defaultMeta?.notes ?? "");
    setOpenEnded(canOpenEnded && !!defaultMeta?.open_ended);
    setUseSaturday(false);
    setUseSunday(false);
  };

  /** Positionen inkl. übernommenem Zeitraum – Basis für Summen, Anzeige und Versand. */
  const effectiveItems = useMemo(
    () =>
      items.map((item, i) => {
        const inherited = applyInheritedPeriod(item, i, items[0]);
        const unit = inherited.unit ?? "kalendertage";
        // Unbefristet: zeitabhängige Positionen werden als Preis pro Monat geführt.
        const monthly = openEnded && unit !== "pauschal" && unit !== "stueck"
          ? { ...inherited, unit: "monate" as OfferUnit, duration: 1, rental_end: undefined }
          : inherited;
        return recalcAddons(monthly);
      }),
    [items, openEnded],
  );

  // ----------------------------------------------------------------
  // Bestandsprüfung je Position (nur Mietgeschäft, nur mit Zeitraum)
  // ----------------------------------------------------------------
  /** Für die Prüfung maßgeblicher Zeitraum: Leistungszeitraum schlägt Anfragezeitraum. */
  const checkStart = toIsoDate(
    (isInvoice ? servicePeriodStart : "") || rentalPeriod?.start || servicePeriodStart || "",
  );
  const checkEnd =
    toIsoDate((isInvoice ? servicePeriodEnd : "") || rentalPeriod?.end || servicePeriodEnd || "") || checkStart;

  const [availability, setAvailability] = useState<Record<number, InventoryResult | null>>({});
  const [checking, setChecking] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const inventoryAckRef = useRef(false);

  /** Prüfsteckbrief: ändert sich nur, wenn Artikel, Menge oder Zeitraum wechseln. */
  const checkSignature = useMemo(
    () =>
      JSON.stringify(
        items.map((i) => [i.product_slug ?? "", i.product_name.trim().toLowerCase(), i.quantity]),
      ) + `|${location ?? ""}|${checkStart ?? ""}|${checkEnd ?? ""}`,
    [items, location, checkStart, checkEnd],
  );

  useEffect(() => {
    if (inquiryType !== "rental" || !checkStart) {
      setAvailability({});
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setChecking(true);
      const next: Record<number, InventoryResult | null> = {};
      await Promise.all(
        items.map(async (item, index) => {
          const name = item.product_name.trim();
          if (!name) return;
          let slug = item.product_slug;
          if (!slug) {
            const match = await findCatalogProductByName(name);
            slug = match?.slug;
          }
          if (!slug) {
            // Freitext-Position ohne CMS-Artikel: Bestand ist nicht prüfbar.
            next[index] = { stock: null, stockSource: "none", booked: 0, conflicts: [] };
            return;
          }
          try {
            next[index] = await fetchAvailability({
              slug,
              location,
              start: checkStart,
              end: checkEnd,
              excludeInquiryId: inquiryId,
            });
          } catch {
            next[index] = null;
          }
        }),
      );
      if (!cancelled) {
        setAvailability(next);
        setChecking(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkSignature, inquiryType, inquiryId]);

  /** Alle offenen Bestandsprobleme – Grundlage für den Bestätigungsdialog. */
  const inventoryIssues = useMemo<InventoryIssue[]>(() => {
    if (inquiryType !== "rental") return [];
    const list: InventoryIssue[] = [];
    items.forEach((item, index) => {
      const result = availability[index];
      if (!result || !item.product_name.trim()) return;
      const issue = evaluateLine(item.product_name.trim(), item.quantity || 1, location, result);
      if (issue) list.push(issue);
    });
    return list;
  }, [items, availability, location, inquiryType]);

  // Ändert sich etwas an der Lage, muss erneut bestätigt werden.
  useEffect(() => {
    inventoryAckRef.current = false;
  }, [checkSignature]);

  /** Nur gültig, wenn abweichend vom Abholstandort (bei Standortwechsel fällt sie ggf. weg). */
  const activeReturnLocation =
    inquiryType === "rental" && returnLocation && returnLocation !== normalizeLocation(location) ? returnLocation : "";
  const activeReturnCost = activeReturnLocation ? Math.max(0, Number(returnLocationCost) || 0) : 0;

  const totals = useMemo(
    () => buildOfferTotals(effectiveItems, deliveryCostDelivery + deliveryCostReturn + setupCost + dismantleCost + activeReturnCost),
    [effectiveItems, deliveryCostDelivery, deliveryCostReturn, setupCost, dismantleCost, activeReturnCost],
  );

  /** Summe der erfassten Teilzahlungen und daraus der offene Restbetrag. */
  const amountPaid = useMemo(
    () => Math.round(payments.reduce((s, p) => s + (Number(p.amount) || 0), 0) * 100) / 100,
    [payments],
  );
  const balanceDue = Math.round((totals.grossAmount - amountPaid) * 100) / 100;
  /** Zusatzkosten aus dem Rücknahmeprotokoll immer mit gezahlter Kaution verrechnen. */
  const takenChargesGross = Math.round(takenCharges.reduce((s, c) => s + c.gross, 0) * 100) / 100;
  const settlement = settleDeposit({
    deposit: Math.max(deposit || 0, Number(defaultCosts?.deposit) || 0),
    amountPaid, grossWithoutCharges: totals.grossAmount - takenChargesGross, chargesGross: takenChargesGross,
  });
  const settlementNote = isInvoice && takenChargesGross > 0 ? depositSettlementNote(settlement, takenChargesGross, protocolNumbers) : "";


  const patchItem = (index: number, patch: Partial<FormLine>) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  /** Wie patchItem, rechnet danach Dauer/Staffelpreis neu (ohne Handpreis-Marker). */
  const patchPriced = (index: number, patch: Partial<FormLine>) =>
    setItems((prev) =>
      prev.map((item, i) => (i === index ? (pricingActive ? applyRentalPricing({ ...item, ...patch }, dayOpts) : { ...item, ...patch }) : item)),
    );
  const changeDayOpts = (next: RentalDayOptions) => {
    setUseSaturday(!!next.use_saturday);
    setUseSunday(!!next.use_sunday);
    setItems((prev) => prev.map((item) => applyRentalPricing(item, next)));
  };
  const showDayBoxes =
    pricingActive &&
    items.some(
      (i) =>
        i.pricing?.scheme === "bau" &&
        (i.unit ?? "") === "miettage" &&
        rentalBlockCount({ date: i.rental_start, time: i.rental_start_time }, { date: i.rental_end, time: i.rental_end_time }) >= 5,
    );

  // Verkauf: Katalog + interne Einkaufspreise für Soll-/Mindestpreis-Hinweise.
  const [salesCatalogList, setSalesCatalogList] = useState<SalesCatalogItem[]>([]);
  const [salesCosts, setSalesCosts] = useState<Map<string, SalesCostRow>>(new Map());
  useEffect(() => {
    if (inquiryType !== "sales") return;
    let cancelled = false;
    Promise.all([loadSalesCatalog(), loadSalesCosts()]).then(([cat, costs]) => {
      if (cancelled) return;
      setSalesCatalogList(cat);
      setSalesCosts(costs);
    });
    return () => {
      cancelled = true;
    };
  }, [inquiryType]);
  const salesPriceRefFor = (item: FormLine) => {
    const hit = findSalesArticle(salesCatalogList, { slug: item.product_slug, name: item.product_name });
    if (!hit) return null;
    const cost = salesCosts.get(`${hit.kind}:${hit.id}`);
    return {
      target: hit.net_price,
      minimum: minimumPrice(cost?.purchase_price_net, cost?.overhead_percent),
    };
  };

  // Kundenrabatte (Portal-Kategorierabatte) nur für neue Mietangebote vorbelegen –
  // überarbeitete Angebote und Rechnungen übernehmen die Werte der Vorlage.
  const discountsRef = useRef<Promise<DiscountMap> | null>(null);
  const autoDiscounts = inquiryType === "rental" && mode === "offer" && !reviseOf;
  const ensureDiscounts = (): Promise<DiscountMap> => {
    if (!autoDiscounts) return Promise.resolve({});
    if (!discountsRef.current) {
      discountsRef.current = loadInquiryProfileId(inquiryId)
        .then(loadCategoryDiscounts)
        .catch(() => ({}));
    }
    return discountsRef.current;
  };
  const withCustomerDiscount = (item: FormLine, category: string | undefined | null, discounts: DiscountMap): Partial<FormLine> => {
    const next = applyCategoryDiscount(item, category, discounts);
    return next === item ? {} : { discount_percent: next.discount_percent, discount_auto: true };
  };

  // Paket 2: kundenspezifische Preise (b2b_customer_prices) ersetzen den Staffelsatz ganz.
  const customerPricesRef = useRef<Promise<CustomerPriceRow[]> | null>(null);
  const ensureCustomerPrices = (): Promise<CustomerPriceRow[]> => {
    if (!pricingActive || reviseOf) return Promise.resolve([]);
    if (!customerPricesRef.current) {
      customerPricesRef.current = loadInquiryProfileId(inquiryId)
        .then(async (profileId) => {
          if (!profileId) return [];
          const { data } = await supabase
            .from("b2b_customer_prices")
            .select("product_id, product_name, unit_price")
            .eq("b2b_profile_id", profileId);
          return (data ?? []) as CustomerPriceRow[];
        })
        .catch(() => []);
    }
    return customerPricesRef.current;
  };
  const buildLinePricing = async (slug: string | null | undefined, name: string): Promise<LinePricing | null> => {
    const loaded = await loadRentalPricing(slug, location);
    if (!loaded) return null;
    const baseName = name.endsWith(WEEKEND_SUFFIX) ? name.slice(0, -WEEKEND_SUFFIX.length) : name;
    const cps = await ensureCustomerPrices();
    const hit = cps.find((c) => (c.product_id && c.product_id === loaded.id) || c.product_name.trim().toLowerCase() === baseName.trim().toLowerCase());
    return { scheme: loaded.scheme, prices: loaded.prices, base_name: baseName, customer_price: hit ? Number(hit.unit_price) : null };
  };

  const [recalculating, setRecalculating] = useState(false);
  /** „Preise neu berechnen“: alle Positionen ohne Handpreis-Marker neu nach Staffel/Wochenendtarif. */
  const recalcAllPrices = async () => {
    setRecalculating(true);
    try {
      const withPricing = await Promise.all(
        items.map(async (item) => {
          if (item.price_manual || !item.product_name.trim()) return item;
          const pricing = item.pricing ?? (await buildLinePricing(item.product_slug, item.product_name));
          return pricing ? { ...item, pricing } : item;
        }),
      );
      setItems(withPricing.map((it) => applyRentalPricing(it, dayOpts)));
    } finally {
      setRecalculating(false);
    }
  };

  // Vorbelegte Positionen automatisch mit Bild (und ggf. Preis) aus dem CMS anreichern.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const salesCatalog = inquiryType === "sales" ? await loadSalesCatalog() : [];
      const discounts = await ensureDiscounts();
      const enriched = await Promise.all(
        items.map(async (item) => {
          if (item.available_addons || !item.product_name.trim()) return item;
          if (inquiryType === "sales") {
            const hit = findSalesArticle(salesCatalog, {
              slug: item.product_slug,
              articleNumber: item.description?.split(" · ")[0] ?? null,
              name: item.product_name,
            });
            if (!hit) return { ...item, available_addons: [] };
            const salesPrice = hit.net_price ?? undefined;
            const useSalesCms = item.unit_price <= 0 && salesPrice !== undefined;
            return {
              ...item,
              product_slug: item.product_slug ?? hit.slug,
              image_url: item.image_url ?? hit.image ?? undefined,
              unit_price: useSalesCms ? salesPrice! : item.unit_price,
              price_source: useSalesCms ? ("cms" as const) : item.price_source,
              unit: item.unit ?? "stueck",
              duration: item.duration && item.duration > 0 ? item.duration : 1,
              available_addons: [],
            };
          }
          const match = await findCatalogProductByName(item.product_name);
          if (!match) return item;
          const image = pickCatalogImage(match.images);
          const resolved = await resolveCatalogPrice(match);
          const useCms = item.unit_price <= 0 && resolved !== undefined;
          const pricing = pricingActive ? await buildLinePricing(item.product_slug ?? match.slug, item.product_name) : null;
          const next: FormLine = {
            ...item,
            image_url: item.image_url ?? image,
            unit_price: useCms ? resolved!.price : item.unit_price,
            price_source: useCms ? ("cms" as const) : item.price_source,
            unit: item.unit ?? resolved?.unit ?? "kalendertage",
            duration: item.duration && item.duration > 0 ? item.duration : 1,
            product_slug: item.product_slug ?? match.slug,
            available_addons: parseAddonOptions(match.addon_options),
            ...withCustomerDiscount(item, match.category, discounts),
            pricing: pricing ?? undefined,
          };
          // Paket 2: nur neue Positionen (noch ohne Preis) automatisch nach Staffel rechnen;
          // gespeicherte Preise bestehender Angebote bleiben bis „Preise neu berechnen“ stehen.
          return item.unit_price <= 0 ? applyRentalPricing(next, dayOpts) : next;
        }),
      );
      if (!cancelled && enriched.some((item, i) => item !== items[i])) setItems(enriched);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquiryId]);

  const buildBody = () => ({
        ...(isInvoice
          ? {
              invoice_kind: invoiceKind,
              parent_invoice_id: parentInvoiceId,
              service_period_start: servicePeriodStart || null,
              service_period_end: servicePeriodEnd || null,
              payments: payments
                .filter((p) => Number(p.amount) > 0)
                .map((p) => ({
                  date: p.date,
                  amount: Number(p.amount),
                  label: p.label?.trim() || "Zahlungseingang",
                  reference: p.reference?.trim() || "",
                })),
            }
          : {}),

        inquiry_type: inquiryType,
        inquiry_id: inquiryId,
        ...(!isInvoice && reviseOf ? { revise_of: reviseOf } : {}),
        location,
        items: effectiveItems.map(({ available_addons: _unused, price_source: _src, custom_period: _cp, pricing: _pr, unit_manual: _um, tier_label: _tl, ...rest }) => {
          const unit = (rest.unit ?? "kalendertage") as OfferUnit;
          // Pauschalpositionen haben keine Dauer – der Preis gilt für den
          // gesamten Auftrag, unabhängig von der Mietzeit.
          const duration = unit === "pauschal" ? 1 : rest.duration && rest.duration > 0 ? rest.duration : 1;
          const articles = rest.quantity || 1;
          // Die PDF-Zeile zeigt Menge × Einheit; mehrere Artikel werden in der
          // Beschreibung ausgewiesen, damit die Summe nachvollziehbar bleibt.
          const description =
            articles > 1 && unit !== "pauschal"
              ? [rest.description, `${articles} Artikel × ${duration} ${unitLabel(duration, unit)}`]
                  .filter(Boolean)
                  .join(" · ")
              : rest.description;
          return {
            ...rest,
            description,
            // Für die spätere Bestandsprüfung: echte Stückzahl und Zeitraum
            // getrennt mitschreiben (quantity ist Artikel × Dauer).
            articles,
            rental_start: rest.rental_start ?? checkStart ?? undefined,
            rental_end: openEnded ? undefined : rest.rental_end ?? checkEnd ?? undefined,
            quantity: articles * duration,
            unit: unitLabel(articles * duration, unit),
            unit_code: unit,
            addons: (rest.addons ?? []).filter((a) => Number(a.amount) !== 0),
          };
        }),
        payment_terms: safeCustomerPaymentTerms(customerKind, paymentTerms, isInvoice),
        payment_terms_custom: customerKind === "business" && paymentTerms === "custom" ? paymentTermsCustom.trim() : null,
        delivery_cost_delivery: deliveryCostDelivery,
        delivery_cost_return: deliveryCostReturn,
        setup_cost: setupCost,
        dismantle_cost: dismantleCost,
        return_location: activeReturnLocation || null,
        return_location_cost: activeReturnCost,
        delivery_requested: delivery.requested,
        delivery_address: delivery.requested
          ? {
              street: delivery.street.trim(),
              postal_code: delivery.postal_code.trim(),
              city: delivery.city.trim(),
            }
          : null,
        deposit,
        valid_days: validDays,
        ...(canOpenEnded ? { open_ended: openEnded } : {}),
        ...(pricingActive ? { use_saturday: useSaturday, use_sunday: useSunday } : {}),
        notes: [notes.trim(), settlementNote].filter(Boolean).join("\n\n"),
        staff_name: staffName,
      });

  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const reorder = (from: number, to: number) => setItems((prev) => moveItem(prev, from, to));
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewedKey, setPreviewedKey] = useState<string | null>(null);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const preview = async () => {
    if (items.some((i) => !i.product_name.trim() || i.quantity <= 0 || i.unit_price < 0)) {
      toast({ title: "Bitte alle Positionen ausfüllen", description: "Bezeichnung, Menge und Preis werden für die Vorschau benötigt.", variant: "destructive" });
      return;
    }
    if (!isValidOfferTotal(totals.netAmount)) {
      toast({ title: "Angebotssumme ungültig", description: "Die Summe muss größer als 0 € sein.", variant: "destructive" });
      return;
    }
    setPreviewing(true);
    const previewBody = buildBody();
    const { data, error } = await invokeWithAuth("send-inquiry-offer", { ...previewBody, preview: true });
    setPreviewing(false);
    const b64 = (data as any)?.pdf_base64 as string | undefined;
    if (error || !b64) {
      toast({ title: "Vorschau nicht möglich", description: (data as any)?.error ?? error?.message ?? "Unbekannter Fehler", variant: "destructive" });
      return;
    }
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(new Blob([bytes], { type: "application/pdf" })));
    setPreviewedKey(JSON.stringify(previewBody));
  };
  // Versand erst nach Vorschau des aktuellen Stands (jede Änderung verlangt eine neue Vorschau).
  const previewOk = isInvoice || previewedKey === JSON.stringify(buildBody());

  const send = async () => {
    if (!isInvoice && previewedKey !== JSON.stringify(buildBody())) return;
    const invalid = items.some((i) => !i.product_name.trim() || i.quantity <= 0 || i.unit_price < 0);
    if (invalid) {
      toast({ title: "Bitte alle Positionen ausfüllen", description: "Bezeichnung, Menge und Preis werden benötigt.", variant: "destructive" });
      return;
    }
    if (delivery.requested && !delivery.street.trim() && !delivery.city.trim()) {
      toast({
        title: "Lieferadresse fehlt",
        description: "Bitte Straße und Ort der Lieferadresse ergänzen oder „Lieferung“ deaktivieren.",
        variant: "destructive",
      });
      return;
    }
    if (paymentTerms === "custom" && paymentTermsCustom.trim().length < 5) {
      toast({
        title: "Zahlungsbedingungen fehlen",
        description: "Bitte die individuellen Zahlungsbedingungen ausformulieren.",
        variant: "destructive",
      });
      return;
    }
    if (!isValidOfferTotal(totals.netAmount)) {
      toast({
        title: "Angebotssumme ungültig",
        description: "Die Summe muss größer als 0 € sein – bitte Abzüge (z. B. Inzahlungnahme) prüfen.",
        variant: "destructive",
      });
      return;
    }
    // Bestandsprüfung: nicht ausreichende oder ungepflegte Mengen müssen
    // bewusst bestätigt werden – der Versand bleibt danach möglich.
    if (inventoryIssues.length > 0 && !inventoryAckRef.current) {
      setWarningOpen(true);
      return;
    }
    if (depositWarning && !depositAcknowledged) {
      toast({ title: "Keine Kaution hinterlegt", description: "Bitte Kaution ergänzen oder im Kautionshinweis bewusst bestätigen, dass das Angebot ohne Kaution versendet werden soll.", variant: "destructive" });
      return;
    }
    // Zusätzlicher Klick-Lock verhindert doppelte Requests.
    if (sendLock.current) return;
    sendLock.current = true;
    setSending(true);
    const { data, error } = await invokeWithAuth(
      isInvoice ? "send-inquiry-invoice" : "send-inquiry-offer",
      buildBody(),
    );

    setSending(false);
    sendLock.current = false;

    const docLabel = isSupplement ? "Nachtrag" : invoiceKind === "final" && isInvoice ? "Schlussrechnung" : isInvoice ? "Rechnung" : "Angebot";
    if (error || (data as any)?.error) {
      toast({
        title: `${docLabel} konnte nicht gesendet werden`,
        description: (data as any)?.error ?? error?.message ?? "Unbekannter Fehler",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: `${docLabel} gesendet`,
      description: `${(data as any)?.invoice_number ?? (data as any)?.offer_number} · ${formatEuro(totals.grossAmount)} brutto`,
    });
    // Übernommene Protokollposten als abgerechnet markieren.
    if (isInvoice && takenChargesRef.current.length) {
      const damageIds = takenChargesRef.current.filter((c) => c.source === "damage").map((c) => c.id);
      const chargeIds = takenChargesRef.current.filter((c) => c.source === "extra_charge").map((c) => c.id);
      if (damageIds.length) {
        await supabase.from("b2b_protocol_damages").update({ billed: true }).in("id", damageIds);
      }
      if (chargeIds.length) {
        await supabase.from("b2b_return_extra_charges").update({ billed: true }).in("id", chargeIds);
      }
      takenChargesRef.current = [];
    }
    // Entwurf ist abgearbeitet – Zwischenspeicher leeren.
    clearInquiryDraft(draftKey);
    void deleteServerDraft(draftKey);
    draftRef.current = null;
    setDraftRestored(false);
    onSent?.();
  };

  // Aktionen (Vorschau, Senden) – in der Vollseite oben angeheftet, sonst wie bisher am Ende.
  const previewButton = !isInvoice && (
    <Button type="button" variant="outline" onClick={preview} disabled={disabled || previewing || sending} className={stickyActions ? "" : "w-full"}>
      {previewing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
      {previewing ? "Vorschau wird erstellt …" : "PDF-Vorschau anzeigen"}
    </Button>
  );
  const sendButton = (
    <Button onClick={send} disabled={disabled || sending || checking || !previewOk} className={stickyActions ? "" : "w-full"}>
      <Send className="h-4 w-4 mr-2" />
      {isInvoice
        ? sending
          ? `${isSupplement ? "Nachtrag" : "Rechnung"} wird gesendet …`
          : `${isSupplement ? "Nachtrag" : "Rechnung"} per E-Mail senden`
        : sending
          ? "Angebot wird gesendet …"
          : "Angebot per E-Mail senden"}
    </Button>
  );
  const previewHint = !previewOk && <p className="text-xs text-muted-foreground">Vor dem Senden bitte die PDF-Vorschau des aktuellen Stands ansehen.</p>;
  const actionText = (
    <p className="text-xs text-muted-foreground">
      {isInvoice
        ? "Die Rechnungsnummer wird beim Versand vergeben. Danach ist die Rechnung unveränderlich und kann nur noch storniert werden."
        : "Der Kunde kann das Angebot über den Button in der E-Mail online annehmen und unterschreiben – ihr bekommt dann einen Hinweis hier in der Anfrage. Danach den Job manuell in Rentware anlegen."}
    </p>
  );
  const actionBar = stickyActions ? (
    <div className="sticky top-28 lg:top-32 z-20 -mx-1 rounded-lg border border-border bg-background/95 p-2 shadow-sm backdrop-blur" data-testid="offer-action-bar">
      <div className="flex flex-wrap items-center gap-2">
        {stickyActionsLead}
        <div className="ml-auto flex flex-wrap gap-2">{previewButton}{sendButton}</div>
      </div>
      {previewHint && <div className="mt-1 text-right">{previewHint}</div>}
    </div>
  ) : (
    <>
      {previewButton}
    </>
  );
  const actionHint = stickyActions ? actionText : (
    <>
      {previewHint}
      {sendButton}
      {actionText}
    </>
  );

  return (
    <div className="space-y-4">
      {stickyActions && actionBar}
      {remoteDraft && !disabled && remoteDraft.updatedBy !== myUserId && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm">
          <span>
            <span className="font-medium">Entwurf von {remoteDraft.updatedByName ?? "einem Kollegen"}</span>
            {` (zuletzt ${new Date(remoteDraft.updatedAt).toLocaleString("de-DE")})`}
            {draftRef.current ? " – du hast zusätzlich einen eigenen Stand auf diesem Gerät geöffnet." : " wurde geladen. Änderungen speichern den gemeinsamen Entwurf."}
          </span>
          {draftRef.current && (
            <Button type="button" variant="outline" size="sm" onClick={() => { applyDraftData(remoteDraft.data); dirtyRef.current = true; }}>
              Entwurf des Kollegen laden
            </Button>
          )}
        </div>
      )}
      {draftRestored && !disabled && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/50 p-3 text-sm">
          <span>
            Nicht gesendeter Entwurf wiederhergestellt
            {draft?.savedAt ? ` (${new Date(draft.savedAt).toLocaleString("de-DE")})` : ""}.
          </span>
          <Button type="button" variant="outline" size="sm" onClick={discardDraft}>
            Entwurf verwerfen
          </Button>
        </div>
      )}
      {canOpenEnded && (
        <label className="flex items-start gap-2 rounded-lg border border-border p-3 text-sm cursor-pointer">
          <Checkbox checked={openEnded} disabled={disabled} onCheckedChange={(v) => setOpenEnded(v === true)} className="mt-0.5" />
          <span>
            <span className="font-medium">Unbefristete Monatsmiete</span>
            <span className="block text-xs text-muted-foreground">
              Mietpositionen gelten als Preis pro Monat, ohne Enddatum. Das Angebot weist den Monatsbetrag aus und
              enthält den Hinweis auf monatliche Abschlagsrechnungen und eine Schlussrechnung nach Rückgabe.
            </span>
          </span>
        </label>
      )}
      {showDayBoxes && (
        <div className="flex flex-wrap gap-4 rounded-lg border border-border p-3 text-sm" data-testid="weekend-use">
          <span className="w-full text-xs text-muted-foreground">Bau-Artikel ab 5 Miettagen: Samstag und Sonntag zählen nur bei Einsatz.</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={useSaturday} disabled={disabled} onCheckedChange={(v) => changeDayOpts({ ...dayOpts, use_saturday: v === true })} />
            Einsatz Samstag
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={useSunday} disabled={disabled} onCheckedChange={(v) => changeDayOpts({ ...dayOpts, use_sunday: v === true })} />
            Einsatz Sonntag
          </label>
        </div>
      )}
      <div className="space-y-3">
        {items.map((item, index) => {
          const eff = effectiveItems[index] ?? item;
          const inherited = index > 0 && !item.custom_period;
          /** Pauschalposition: fester Preis, keine Mietdauer-Multiplikation. */
          const isFlatRate = (eff.unit ?? "kalendertage") === "pauschal";
          return (
          <div
            key={index}
            data-testid="offer-position"
            onDragOver={(e) => { if (dragIdx === null) return; e.preventDefault(); if (overIdx !== index) setOverIdx(index); }}
            onDrop={(e) => { e.preventDefault(); if (dragIdx !== null) reorder(dragIdx, index); setDragIdx(null); setOverIdx(null); }}
            onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
            className={`rounded-lg border border-border p-3 space-y-2 transition-colors ${dragIdx === index ? "opacity-40" : ""} ${overIdx === index && dragIdx !== null && dragIdx !== index ? "ring-2 ring-primary/50" : ""}`}
          >
            <div className="flex gap-2 items-start">
              {!isInvoice && (
                <div className="flex shrink-0 flex-col items-center">
                  <button
                    type="button"
                    draggable={!disabled}
                    disabled={disabled}
                    aria-label={`Position ${index + 1} verschieben`}
                    title="Ziehen zum Verschieben"
                    className="hidden md:block cursor-grab active:cursor-grabbing rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-40"
                    onDragStart={(e) => {
                      setDragIdx(index);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", String(index));
                      const card = (e.currentTarget as HTMLElement).closest('[data-testid="offer-position"]');
                      if (card) e.dataTransfer.setDragImage(card as Element, 16, 16);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" && index > 0) { e.preventDefault(); reorder(index, index - 1); }
                      if (e.key === "ArrowDown" && index < items.length - 1) { e.preventDefault(); reorder(index, index + 1); }
                    }}
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-semibold text-muted-foreground">{index + 1}</span>
                  <button type="button" aria-label={`Position ${index + 1} nach oben`} disabled={disabled || index === 0} onClick={() => reorder(index, index - 1)} className="rounded p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label={`Position ${index + 1} nach unten`} disabled={disabled || index === items.length - 1} onClick={() => reorder(index, index + 1)} className="rounded p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              )}
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt=""
                  loading="lazy"
                  className="h-10 w-10 rounded object-cover border border-border shrink-0"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                {inquiryType === "sales" ? (
                <SalesProductCombobox
                  value={item.product_name}
                  disabled={disabled}
                  onSelect={(product, freeText) => {
                    const netPrice = product?.net_price ?? undefined;
                    patchItem(index, {
                      product_name: freeText,
                      product_slug: product?.slug,
                      image_url: product?.image ?? undefined,
                      ...resolvePricePatch(
                        item,
                        netPrice !== undefined ? { price: netPrice, unit: "stueck" } : undefined,
                      ),
                      available_addons: [],
                      addons: [],
                    });
                  }}
                />
                ) : (
                <InquiryProductCombobox
                  value={item.product_name}
                  location={location}
                  disabled={disabled}
                  onSelect={async (product, freeText) => {
                    const resolved = product ? await resolveCatalogPrice(product) : undefined;
                    const discounts = await ensureDiscounts();
                    const base = item.discount_auto ? { ...item, discount_percent: 0, discount_auto: false } : item;
                    const pricing = pricingActive && product ? await buildLinePricing(product.slug, freeText) : null;
                    const next: FormLine = {
                      ...item,
                      discount_percent: base.discount_percent,
                      discount_auto: base.discount_auto,
                      ...withCustomerDiscount(base, product?.category, discounts),
                      product_name: freeText,
                      image_url: product ? pickCatalogImage(product.images) : undefined,
                      ...resolvePricePatch(item, resolved),
                      product_slug: product?.slug,
                      available_addons: product ? parseAddonOptions(product.addon_options) : [],
                      addons: [],
                      pricing: pricing ?? undefined,
                      unit_manual: false,
                      price_basis: undefined,
                      tier_label: undefined,
                      rental_start: item.rental_start ?? items[0]?.rental_start ?? rentalPeriod?.start ?? undefined,
                      rental_end: item.rental_end ?? items[0]?.rental_end ?? rentalPeriod?.end ?? undefined,
                      rental_start_time: item.rental_start_time ?? items[0]?.rental_start_time,
                      rental_end_time: item.rental_end_time ?? items[0]?.rental_end_time,
                    };
                    setItems((prev) => prev.map((it, i) => (i === index ? applyRentalPricing(next, dayOpts) : it)));
                  }}
                />
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                disabled={disabled || items.length === 1}
                aria-label="Position entfernen"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              value={inherited ? (eff.description ?? "") : (item.description ?? "")}
              onChange={(e) => patchItem(index, { description: e.target.value })}
              placeholder="Beschreibung / Zeitraum (optional)"
              disabled={disabled || inherited}
            />
            {pricingActive && !openEnded && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" data-testid="position-period">
                <div>
                  <Label className="text-xs">Mietbeginn</Label>
                  <Input type="date" value={item.rental_start ?? ""} disabled={disabled}
                    onChange={(e) => patchPriced(index, { rental_start: e.target.value || undefined, custom_period: true })} />
                </div>
                <div>
                  <Label className="text-xs">Uhrzeit</Label>
                  <Input type="time" value={item.rental_start_time ?? ""} placeholder="08:00" disabled={disabled}
                    onChange={(e) => patchPriced(index, { rental_start_time: e.target.value || undefined, custom_period: true })} />
                </div>
                <div>
                  <Label className="text-xs">Mietende</Label>
                  <Input type="date" value={item.rental_end ?? ""} disabled={disabled}
                    onChange={(e) => patchPriced(index, { rental_end: e.target.value || undefined, custom_period: true })} />
                </div>
                <div>
                  <Label className="text-xs">Uhrzeit</Label>
                  <Input type="time" value={item.rental_end_time ?? ""} placeholder="17:00" disabled={disabled}
                    onChange={(e) => patchPriced(index, { rental_end_time: e.target.value || undefined, custom_period: true })} />
                </div>
              </div>
            )}
            {index > 0 && (
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <Checkbox
                  checked={!!item.custom_period}
                  disabled={disabled}
                  onCheckedChange={(v) =>
                    patchItem(index, {
                      custom_period: v === true,
                      ...(v === true
                        ? {
                            duration: eff.duration,
                            unit: eff.unit,
                            description: eff.description,
                          }
                        : {}),
                    })
                  }
                />
                <span>
                  Abweichender Zeitraum
                  {inherited ? (
                    <span className="ml-1 text-muted-foreground">
                      (aktuell wie Position 1: {eff.duration ?? 1}{" "}
                      {unitLabel(eff.duration ?? 1, (eff.unit ?? "kalendertage") as OfferUnit)})
                    </span>
                  ) : null}
                </span>
              </label>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">Menge (Artikel)</Label>
                <NumberInput
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => patchItem(index, { quantity: Number(e.target.value) || 0 })}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label className="text-xs">Menge (Dauer)</Label>
                <NumberInput
                  type="number"
                  min={1}
                  value={isFlatRate ? 1 : eff.duration ?? 1}
                  onChange={(e) => patchItem(index, { duration: Number(e.target.value) || 0 })}
                  disabled={disabled || inherited || isFlatRate}
                />
              </div>
              <div>
                <Label className="text-xs">Einheit</Label>
                <Select
                  value={eff.unit ?? "kalendertage"}
                  disabled={disabled || inherited}
                  onValueChange={(v) =>
                    patchPriced(index, {
                      unit: v as OfferUnit,
                      unit_manual: true,
                      // Pauschalpreis gilt für den gesamten Auftrag – Dauer entfällt.
                      ...(v === "pauschal" ? { duration: 1 } : {}),
                    })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OFFER_UNITS.map((u) => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {isFlatRate ? (
                    <>Pauschal – unabhängig von der Mietdauer</>
                  ) : (
                    <>
                      {item.quantity || 0} × {eff.duration ?? 1}{" "}
                      {unitLabel(eff.duration ?? 1, (eff.unit ?? "kalendertage") as OfferUnit)}
                    </>
                  )}
                </p>
              </div>
              <div>
                <Label className="text-xs">{isFlatRate ? "Pauschalpreis netto" : "Einzelpreis netto"}</Label>
                <NumberInput
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) =>
                    patchItem(index, { unit_price: Number(e.target.value) || 0, price_source: "manual", price_manual: true })
                  }
                  disabled={disabled}
                />
                {item.price_manual && pricingActive ? (
                  <p className="mt-1 text-[11px] text-muted-foreground">Von Hand geändert – wird nicht neu berechnet</p>
                ) : item.price_source === "cms" ? (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {inquiryType === "sales"
                      ? "Preis aus CMS (netto) – anpassbar"
                      : `Aus CMS: ${formatEuro(item.unit_price)} netto${item.tier_label ? ` (${item.tier_label})` : ""} – anpassbar`}
                  </p>
                ) : null}

              </div>
              <div>
                <Label className="text-xs">Rabatt %</Label>
                <NumberInput
                  type="number"
                  min={0}
                  max={100}
                  value={item.discount_percent}
                  onChange={(e) => patchItem(index, { discount_percent: Number(e.target.value) || 0, discount_auto: false })}
                  disabled={disabled}
                />
              </div>
              <div className="flex items-end text-sm font-semibold">
                {formatEuro(lineTotal(eff))}
              </div>
            </div>

            {/* Interner Preisrahmen (nur Mitarbeiter, erscheint nicht im Angebot) */}
            {inquiryType === "sales" && item.product_name.trim() ? (
              (() => {
                const ref = salesPriceRefFor(item);
                if (!ref) return null;
                const c = checkSalesPrice({
                  unitPrice: item.unit_price,
                  discountPercent: item.discount_percent,
                  quantity: item.quantity,
                  minimum: ref.minimum,
                  target: ref.target,
                });
                return (
                  <div
                    className={`rounded-md border px-2 py-1.5 text-xs ${
                      c.belowMinimum ? "border-destructive bg-destructive/10 text-destructive" : "border-border bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                      <span>Intern – nicht im Angebot:</span>
                      <span>Soll-VK {ref.target != null ? formatEuro(ref.target) : "–"}</span>
                      <span>Mindestpreis {ref.minimum != null ? formatEuro(ref.minimum) : "kein EK gepflegt"}</span>
                      {c.marginTotal != null ? (
                        <span className="font-semibold">
                          Bonusbasis (über Mindestpreis): {formatEuro(c.marginTotal)}
                        </span>
                      ) : null}
                    </div>
                    {c.belowMinimum ? (
                      <p className="mt-1 font-semibold">
                        Achtung: Preis liegt {formatEuro(Math.abs(c.marginPerUnit ?? 0))} je Stück unter dem Mindestpreis.
                      </p>
                    ) : null}
                  </div>
                );
              })()
            ) : null}


            {/* Bestandslage am Standort im gewählten Zeitraum */}
            {inquiryType === "rental" && item.product_name.trim() && availability[index] ? (
              (() => {
                const result = availability[index]!;
                const issue = evaluateLine(item.product_name.trim(), item.quantity || 1, location, result);
                const tone =
                  issue?.severity === "over"
                    ? "text-destructive"
                    : issue?.severity === "unknown"
                      ? "text-amber-600"
                      : "text-muted-foreground";
                const Icon = issue ? (issue.severity === "over" ? AlertTriangle : Info) : CheckCircle2;
                return (
                  <p className={`flex items-start gap-1.5 text-[11px] ${tone}`}>
                    <Icon className="h-3.5 w-3.5 shrink-0 mt-px" />
                    <span className="min-w-0 break-words">
                      {badgeText(result, item.quantity || 1, location)}
                      {checkStart ? (
                        <span className="text-muted-foreground">
                          {" "}
                          ({new Date(checkStart).toLocaleDateString("de-DE")}
                          {checkEnd && checkEnd !== checkStart
                            ? ` – ${new Date(checkEnd).toLocaleDateString("de-DE")}`
                            : ""}
                          )
                        </span>
                      ) : null}
                    </span>
                  </p>
                );
              })()
            ) : inquiryType === "rental" && item.product_name.trim() && !checkStart ? (
              <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <Info className="h-3.5 w-3.5 shrink-0 mt-px" />
                <span>Ohne Mietzeitraum ist keine Bestandsprüfung möglich.</span>
              </p>
            ) : null}

            {/* Zusatzoptionen dieser Position (CMS-Optionen + Standardauswahl + Freifeld) */}
            <AddonSection
              item={eff}
              options={addonOptionsFor(item, inquiryType === "sales")}
              isSales={inquiryType === "sales"}
              disabled={disabled}
              periodStart={eff.rental_start ?? checkStart ?? undefined}
              periodEnd={eff.rental_end ?? checkEnd ?? undefined}
              onChange={(addons) => patchItem(index, { addons })}
            />
          </div>
          );
        })}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setItems((prev) => [...prev, {
                ...emptyLine(),
                rental_start: prev[0]?.rental_start ?? rentalPeriod?.start ?? undefined,
                rental_end: prev[0]?.rental_end ?? rentalPeriod?.end ?? undefined,
                rental_start_time: prev[0]?.rental_start_time,
                rental_end_time: prev[0]?.rental_end_time,
              }])
            }
            disabled={disabled}
          >
            <Plus className="h-4 w-4 mr-1" /> Position hinzufügen
          </Button>
          {pricingActive && (
            <Button type="button" variant="outline" size="sm" onClick={() => void recalcAllPrices()} disabled={disabled || recalculating}>
              {recalculating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Preise neu berechnen
            </Button>
          )}
        </div>
        {(() => {
          const used = Array.from(new Set(effectiveItems.map((i) => (i.unit ?? "kalendertage") as OfferUnit)));
          if (!used.length) return null;
          return (
            <p className="text-[11px] text-muted-foreground" data-testid="unit-legend">
              {used.map((u) => `${unitAbbreviation(u)} = ${unitLabel(2, u)}`).join(" · ")}
              {used.includes("miettage") ? " · 1 Miettag = 24 Std. gem. AGB" : ""}
            </p>
          );
        })()}
      </div>

      <div className="rounded-lg border border-border p-3 space-y-3">
        <label className="flex items-start gap-2 text-sm font-medium cursor-pointer">
          <Checkbox
            checked={delivery.requested}
            onCheckedChange={(v) => setDelivery({ ...delivery, requested: v === true })}
            disabled={disabled}
            className="mt-0.5"
          />
          <span>
            Lieferadresse im {isInvoice ? "Rechnungsdokument" : "Angebot"} ausweisen
            {defaultDelivery?.requested ? (
              <span className="block text-xs font-normal text-muted-foreground">
                Vom Kunden im Anfrageformular angegeben – hier änderbar.
              </span>
            ) : null}
          </span>
        </label>
        {delivery.requested && (
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-xs">Straße und Hausnummer</Label>
              <Input
                value={delivery.street}
                onChange={(e) => setDelivery({ ...delivery, street: e.target.value })}
                placeholder="Baustelle Nord 4"
                disabled={disabled}
              />
            </div>
            <div>
              <Label className="text-xs">PLZ</Label>
              <Input
                value={delivery.postal_code}
                onChange={(e) => setDelivery({ ...delivery, postal_code: e.target.value })}
                inputMode="numeric"
                disabled={disabled}
              />
            </div>
            <div>
              <Label className="text-xs">Ort</Label>
              <Input
                value={delivery.city}
                onChange={(e) => setDelivery({ ...delivery, city: e.target.value })}
                disabled={disabled}
              />
            </div>
          </div>
        )}
      </div>



      {inquiryType === "rental" && (
        <div className="rounded-lg border border-border p-3 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Rückgabe</Label>
              <Select
                value={activeReturnLocation || "same"}
                onValueChange={(v) => setReturnLocation(v === "same" ? "" : v)}
                disabled={disabled}
              >
                <SelectTrigger aria-label="Rückgabestandort"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="same">Am Abholstandort ({LOCATION_LABELS[normalizeLocation(location) ?? ""] ?? location ?? "–"})</SelectItem>
                  {(["krefeld", "bonn", "muelheim"] as const)
                    .filter((k) => k !== normalizeLocation(location))
                    .map((k) => (
                      <SelectItem key={k} value={k}>Rückgabe in {LOCATION_LABELS[k]}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {activeReturnLocation && (
              <div>
                <Label className="text-xs">Aufpreis Rückgabe (netto, €)</Label>
                <NumberInput type="number" min={0} step="0.01" value={returnLocationCost}
                  onChange={(e) => setReturnLocationCost(Number(e.target.value) || 0)} disabled={disabled} />
              </div>
            )}
          </div>
          {activeReturnLocation && (
            <p className="text-xs text-muted-foreground">
              Abholung {LOCATION_LABELS[normalizeLocation(location) ?? ""] ?? location}, Rückgabe {LOCATION_LABELS[activeReturnLocation]}.
              Der Aufpreis erscheint als eigene Position im Dokument (0 € = ohne Aufpreis, nur Hinweis).
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <div>
          <Label className="text-xs">Lieferkosten</Label>
          <NumberInput type="number" min={0} step="0.01" value={deliveryCostDelivery}
            onChange={(e) => setDeliveryCostDelivery(Number(e.target.value) || 0)} disabled={disabled} />
        </div>
        <div>
          <Label className="text-xs">Abholkosten</Label>
          <NumberInput type="number" min={0} step="0.01" value={deliveryCostReturn}
            onChange={(e) => setDeliveryCostReturn(Number(e.target.value) || 0)} disabled={disabled} />
        </div>
        <div>
          <Label className="text-xs">Aufbau</Label>
          <NumberInput type="number" min={0} step="0.01" value={setupCost}
            onChange={(e) => setSetupCost(Number(e.target.value) || 0)} disabled={disabled} />
        </div>
        <div>
          <Label className="text-xs">Abbau</Label>
          <NumberInput type="number" min={0} step="0.01" value={dismantleCost}
            onChange={(e) => setDismantleCost(Number(e.target.value) || 0)} disabled={disabled} />
        </div>
        <div>
          <Label className="text-xs">Kaution</Label>
          <NumberInput type="number" min={0} step="0.01" value={deposit}
            onChange={(e) => setDeposit(Number(e.target.value) || 0)} disabled={disabled} />
        </div>
        {!isInvoice && (
          <div>
            <Label className="text-xs">Gültig (Tage)</Label>
            <NumberInput type="number" min={1} max={180} value={validDays}
              onChange={(e) => setValidDays(Number(e.target.value) || 14)} disabled={disabled} />
          </div>
        )}
      </div>

      {depositWarning && (
        <OfferDepositWarning acknowledged={depositAcknowledged} onAcknowledge={setDepositAcknowledged} disabled={disabled} />
      )}

      {isInvoice && (
        <div className="rounded-lg border border-border p-3 space-y-2">
          <Label className="text-xs">Leistungszeitraum (erscheint auf der Rechnung)</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              type="date"
              value={servicePeriodStart}
              onChange={(e) => setServicePeriodStart(e.target.value)}
              disabled={disabled}
            />
            <Input
              type="date"
              value={servicePeriodEnd}
              onChange={(e) => setServicePeriodEnd(e.target.value)}
              disabled={disabled}
            />
          </div>
          {isSupplement && parentInvoiceNumber ? (
            <p className="text-xs text-muted-foreground">
              Nachtrag zu Rechnung {parentInvoiceNumber} – nur die zusätzlichen Leistungen erfassen.
            </p>
          ) : null}
        </div>
      )}

      {isInvoice && pendingCharges.length > 0 && (
        <div className="rounded-lg border border-accent/40 bg-accent/5 p-3 space-y-2">
          <Label className="text-xs">Offene Posten aus dem Rücknahmeprotokoll</Label>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Beträge sind im Protokoll brutto erfasst und werden als Nettoposition übernommen.
            </p>
            {pendingCharges.length > 1 && (
              <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => pendingCharges.forEach(takeProtocolCharge)}>
                Alle übernehmen
              </Button>
            )}
          </div>
          {pendingCharges.map((charge) => (
            <div
              key={charge.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background p-2 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium">{charge.label}</p>
                {charge.description && (
                  <p className="text-xs text-muted-foreground">{charge.description}</p>
                )}
                {charge.cleaningUnits !== undefined && (
                  <div className="mt-1 flex items-center gap-2">
                    <Label className="text-xs">Einheiten à {CLEANING_UNIT_MINUTES} Min</Label>
                    <Input
                      type="number" inputMode="numeric" min={1} step={1} className="h-9 w-20 text-sm"
                      value={charge.cleaningUnits || ""} disabled={disabled}
                      onChange={(e) => {
                        const units = Math.max(0, Math.floor(Number(e.target.value) || 0));
                        setPendingCharges((prev) => prev.map((c) => c.id === charge.id
                          ? { ...c, cleaningUnits: units, gross: cleaningChargeGross(units),
                              label: "Reinigung (Mehraufwand laut AGB)",
                              description: `${units} × ${CLEANING_UNIT_MINUTES} Min (${units * CLEANING_UNIT_MINUTES} Min) × ${formatEuro(CLEANING_UNIT_GROSS)}` }
                          : c));
                      }}
                    />
                    <span className="text-xs text-muted-foreground">= {charge.cleaningUnits * CLEANING_UNIT_MINUTES} Min</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{formatEuro(charge.gross)}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={disabled || charge.gross <= 0}
                  onClick={() => takeProtocolCharge(charge)}
                >
                  Übernehmen
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}


      {isInvoice && takenChargesGross > 0 && (
        <div className="rounded-lg border border-border p-3 space-y-1 text-sm">
          <Label className="text-xs">Verrechnung mit der Kaution</Label>
          <div className="flex justify-between gap-2"><span>Zusatzkosten brutto</span><span>{formatEuro(takenChargesGross)}</span></div>
          <div className="flex justify-between gap-2"><span>Gezahlte Kaution</span><span>{formatEuro(settlement.depositHeld)}</span></div>
          {settlement.offset > 0 ? (
            <>
              <div className="flex justify-between gap-2"><span>Verrechnet</span><span>− {formatEuro(settlement.offset)}</span></div>
              <div className="flex justify-between gap-2 font-semibold"><span>Kaution zurück an Kunden</span><span>{formatEuro(settlement.refund)}</span></div>
              <p className="text-xs text-muted-foreground break-words">Erscheint als Hinweis auf der Rechnung: „{settlementNote}“</p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Keine gezahlte Kaution erkannt – die Zusatzkosten werden als offener Betrag ausgewiesen. Ist die Kaution eingegangen, bitte unter „Bereits erhaltene Zahlungen“ erfassen.</p>
          )}
        </div>
      )}

      <div className="rounded-lg border border-border p-3 space-y-2">
        <Label className="text-xs">
          Zahlungsbedingungen ({customerKind === "business" ? "Geschäftskunde" : "Privatkunde"})
        </Label>
        <Select value={paymentTerms} onValueChange={setPaymentTerms} disabled={disabled}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {(isInvoice ? INVOICE_PAYMENT_OPTIONS.filter((o) => customerKind === "business" || o.value === "vorkasse") : PAYMENT_OPTIONS[customerKind]).map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {paymentTerms === "custom" && (
          <Textarea
            value={paymentTermsCustom}
            onChange={(e) => setPaymentTermsCustom(e.target.value)}
            rows={3}
            maxLength={600}
            disabled={disabled}
            placeholder="z. B. 50 % Anzahlung bei Auftragserteilung, Rest 30 Tage netto nach Rechnungsstellung."
          />
        )}
        <p className="text-xs text-muted-foreground">
          {paymentTerms === "custom"
            ? "Dieser Text erscheint wortgleich im Angebots-PDF und in der E-Mail an den Kunden."
            : paymentTerms === "anzahlung_30"
            ? "Kunde zahlt mindestens 30 % der Bruttomiete vorab, Rest inkl. Kaution vor Mietbeginn. Er wählt selbst: Überweisung oder online über den Zahlungslink in der Angebotsmail."
            : paymentTerms === "vorkasse" || paymentTerms === "rentpair_vorkasse"
                ? "Vorkasse komplett vor Mietbeginn. Der Kunde wählt selbst: Überweisung oder online über den Zahlungslink in der Angebotsmail."
                : "Rechnungszahlung nach Mietende innerhalb der gewählten Frist; es gilt die Angebotsgültigkeit."}
        </p>
      </div>

      <div>
        <Label className="text-xs">Hinweis für den Kunden (optional)</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} disabled={disabled} />
      </div>

      {isInvoice && (
        <div className="rounded-lg border border-border p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label className="text-xs">Bereits erhaltene Zahlungen (z. B. Vorkasse auf das Angebot)</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() =>
                setPayments((prev) => [
                  ...prev,
                  {
                    date: new Date().toISOString().slice(0, 10),
                    amount: 0,
                    label: "Zahlungseingang",
                    reference: "",
                  },
                ])
              }
            >
              <Plus className="h-4 w-4 mr-1" /> Zahlung
            </Button>
          </div>
          {payments.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Keine Zahlung erfasst – der volle Rechnungsbetrag wird als offen ausgewiesen.
            </p>
          )}
          {payments.map((p, index) => (
            isStripePayment(p) ? (
              <div key={index} className="min-w-0 border-b border-border pb-3 space-y-1 text-sm">
                <div className="flex flex-wrap justify-between gap-2"><span className="font-medium">Online-Zahlung (Stripe)</span><strong>{formatEuro(p.amount)}</strong></div>
                <p className="text-xs text-muted-foreground">{p.date} · Bestätigt</p>
                <p className="break-all text-xs text-muted-foreground" title={p.reference}>{shortPaymentReference(p.reference)}</p>
              </div>
            ) : <div key={index} className="grid min-w-0 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 items-end">
              <div className="min-w-0">
                <Label className="text-[11px]">Datum</Label>
                <Input
                  type="date"
                  className="min-w-0 w-full max-w-full"
                  value={p.date}
                  disabled={disabled}
                  onChange={(e) =>
                    setPayments((prev) => prev.map((x, i) => (i === index ? { ...x, date: e.target.value } : x)))
                  }
                />
              </div>
              <div>
                <Label className="text-[11px]">Betrag brutto (€)</Label>
                <NumberInput
                  type="number"
                  step="0.01"
                  min="0"
                  value={p.amount || ""}
                  disabled={disabled}
                  onChange={(e) =>
                    setPayments((prev) =>
                      prev.map((x, i) => (i === index ? { ...x, amount: Number(e.target.value) || 0 } : x)),
                    )
                  }
                />
              </div>
              <div>
                <Label className="text-[11px]">Bezeichnung</Label>
                <Input
                  value={p.label}
                  placeholder="Vorkasse Angebot"
                  disabled={disabled}
                  onChange={(e) =>
                    setPayments((prev) => prev.map((x, i) => (i === index ? { ...x, label: e.target.value } : x)))
                  }
                />
              </div>
              <div className="flex min-w-0 gap-2 items-end">
                <div className="flex-1 min-w-0">
                  <Label className="text-[11px]">Verwendungszweck</Label>
                  <Input
                    value={p.reference ?? ""}
                    placeholder="ANG-2026-…"
                    disabled={disabled}
                    onChange={(e) =>
                      setPayments((prev) =>
                        prev.map((x, i) => (i === index ? { ...x, reference: e.target.value } : x)),
                      )
                    }
                  />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={disabled}
                  onClick={() => setPayments((prev) => prev.filter((_, i) => i !== index))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
        <div className="flex justify-between"><span>Mietartikel</span><span>{formatEuro(totals.itemsNet)}</span></div>
        {totals.addonsNet > 0 && (
          <div className="flex justify-between"><span>Zusatzoptionen</span><span>{formatEuro(totals.addonsNet)}</span></div>
        )}
        <div className="flex justify-between"><span>Netto</span><span>{formatEuro(totals.netAmount)}</span></div>
        <div className="flex justify-between"><span>MwSt. {totals.vatRate}%</span><span>{formatEuro(totals.vatAmount)}</span></div>
        <div className="flex justify-between font-bold text-base"><span>Brutto</span><span>{formatEuro(totals.grossAmount)}</span></div>
        {isInvoice && amountPaid > 0 && (
          <>
            <div className="flex justify-between text-muted-foreground">
              <span>Bereits gezahlt</span><span>− {formatEuro(amountPaid)}</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>{balanceDue <= 0 ? "Vollständig bezahlt" : "Noch zu zahlen"}</span>
              <span>{formatEuro(Math.max(0, balanceDue))}</span>
            </div>
          </>
        )}
      </div>



      {inquiryType === "rental" && inventoryIssues.length > 0 && (
        <div
          className={
            "rounded-lg border p-3 text-sm " +
            (inventoryIssues.some((i) => i.severity === "over")
              ? "border-destructive/40 bg-destructive/5"
              : "border-amber-500/40 bg-amber-500/5")
          }
        >
          <div className="flex items-start gap-2">
            <AlertTriangle
              className={
                "h-4 w-4 shrink-0 mt-0.5 " +
                (inventoryIssues.some((i) => i.severity === "over") ? "text-destructive" : "text-amber-600")
              }
            />
            <div className="min-w-0 space-y-1">
              <p className="font-medium">
                {inventoryIssues.some((i) => i.severity === "over")
                  ? "Bestand reicht im Zeitraum nicht aus"
                  : "Bestand nicht gepflegt"}
              </p>
              {inventoryIssues.map((issue, i) => (
                <p key={i} className="text-xs break-words text-muted-foreground">
                  {issue.message}
                </p>
              ))}
              <p className="text-xs text-muted-foreground">
                Der Versand ist weiterhin möglich – er muss nur einmal bestätigt werden.
              </p>
            </div>
          </div>
        </div>
      )}

      <InventoryWarningDialog
        open={warningOpen}
        onOpenChange={setWarningOpen}
        issues={inventoryIssues}
        documentLabel={isInvoice ? "Rechnung" : "Angebot"}
        onConfirm={() => {
          inventoryAckRef.current = true;
          setWarningOpen(false);
          void send();
        }}
      />

      {!stickyActions && actionBar}
      <Dialog open={!!previewUrl} onOpenChange={(o) => { if (!o) setPreviewUrl(null); }}>
        <DialogContent className="max-w-4xl w-[calc(100vw-1rem)] h-[90vh] flex flex-col gap-3 p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle>PDF-Vorschau</DialogTitle>
            <DialogDescription>So sieht das Angebot für den Kunden aus. Die Angebotsnummer wird erst beim Senden vergeben – nichts wurde verschickt.</DialogDescription>
          </DialogHeader>
          {previewUrl && <PdfPagesPreview url={previewUrl} className="min-h-0 flex-1 w-full overflow-y-auto rounded border border-border bg-muted p-3" />}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {previewUrl && (
              <Button variant="outline" asChild>
                <a href={previewUrl} target="_blank" rel="noopener noreferrer">In neuem Tab öffnen</a>
              </Button>
            )}
            <Button variant="outline" onClick={() => setPreviewUrl(null)}>Zurück zum Bearbeiten</Button>
            <Button onClick={() => { setPreviewUrl(null); void send(); }} disabled={disabled || sending || checking}>
              <Send className="h-4 w-4 mr-2" />Angebot jetzt senden
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {!stickyActions && actionHint}
    </div>
  );
}
