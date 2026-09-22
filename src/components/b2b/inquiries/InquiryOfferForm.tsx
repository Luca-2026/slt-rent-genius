import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import { AlertTriangle, CheckCircle2, Info, Plus, Send, Trash2 } from "lucide-react";
import {
  badgeText,
  evaluateLine,
  fetchAvailability,
  toIsoDate,
  type InventoryIssue,
  type InventoryResult,
} from "@/lib/inventoryAvailability";
import { InventoryWarningDialog } from "./InventoryWarningDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildOfferTotals, formatEuro, isValidOfferTotal, lineTotal, type OfferLine } from "./offerMath";
import { ADDON_PRESETS, parseAddonOptions, suggestAddonAmount, type AddonOption } from "@/lib/offerAddons";
import {
  InquiryProductCombobox,
  findCatalogProductByName,
  pickCatalogImage,
} from "./InquiryProductCombobox";
import { SalesProductCombobox } from "./SalesProductCombobox";
import { SALES_ADDON_PRESETS, isSalesAddonNegative } from "@/lib/salesAddons";
import { loadSalesCatalog } from "@/hooks/useSalesCatalog";
import { OFFER_UNITS, unitLabel, type OfferUnit } from "@/lib/offerUnits";
import { resolveCatalogPrice } from "@/lib/catalogPricing";
import {
  clearInquiryDraft,
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

const PAYMENT_OPTIONS: Record<"business" | "private", { value: string; label: string }[]> = {
  business: [
    { value: "net_14", label: "Rechnung – 14 Tage netto" },
    { value: "net_7", label: "Rechnung – 7 Tage netto" },
    { value: "net_30", label: "Rechnung – 30 Tage netto" },
    { value: "vorkasse", label: "Vorkasse per Banküberweisung" },
    { value: "custom", label: "Individuelle Zahlungsbedingungen …" },
  ],
  private: [
    { value: "anzahlung_30", label: "30 % Anzahlung binnen 48 Std. (Zahlungslink)" },
    { value: "rentpair_vorkasse", label: "Vorkasse komplett über Zahlungslink" },
    { value: "vorkasse", label: "Vorkasse per Banküberweisung" },
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
  defaultItems: (OfferLine & { custom_period?: boolean })[];
  /** Vom Kunden im Anfrageformular angegebene Lieferadresse (im Portal änderbar). */
  defaultDelivery?: OfferDeliveryAddress;
  /** Privat- oder Geschäftskunde – steuert die Zahlungsbedingungen. */
  customerKind?: "business" | "private";
  staffName: string;
  disabled?: boolean;
  onSent?: () => void;
  /** "offer" (Standard) erzeugt ein Angebot, "invoice" eine Rechnung bzw. einen Nachtrag. */
  mode?: "offer" | "invoice";
  invoiceKind?: "invoice" | "supplement";
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
    deposit?: number;
  };
  /** Bereits geleistete Zahlungen (z. B. Vorkasse auf das Angebot) – nur Rechnungen. */
  defaultPayments?: OfferPayment[];
  /** Mietzeitraum der Anfrage (YYYY-MM-DD) – Basis für die Bestandsprüfung. */
  rentalPeriod?: { start?: string | null; end?: string | null };
  /** Verknüpfte B2B-Reservierung – Quelle für offene Schäden/Zusatzkosten aus dem Rücknahmeprotokoll. */
  reservationId?: string | null;
}

/** Offene Position aus einem Rücknahmeprotokoll, die noch nicht abgerechnet wurde. */
interface PendingProtocolCharge {
  id: string;
  source: "damage" | "extra_charge";
  label: string;
  description?: string;
  /** Bruttobetrag laut Protokoll */
  gross: number;
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
}: Props) {
  const isInvoice = mode === "invoice";
  const isSupplement = isInvoice && invoiceKind === "supplement";
  const { toast } = useToast();

  // Zwischengespeicherter Entwurf (Tabwechsel / Reload) – einmalig beim Mount gelesen.
  const draftKey = inquiryDraftKey(mode, inquiryType, inquiryId);
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
  const [deposit, setDeposit] = useState(draft?.deposit ?? defaultCosts?.deposit ?? 0);
  const [validDays, setValidDays] = useState(draft?.validDays ?? 14);
  /** Bereits erhaltene (Teil-)Zahlungen – werden auf der Rechnung abgezogen. */
  const [payments, setPayments] = useState<OfferPayment[]>(
    (draft?.payments as OfferPayment[]) ?? defaultPayments ?? [],
  );
  /** Leistungszeitraum der Rechnung (nur im Rechnungsmodus sichtbar). */
  const [servicePeriodStart, setServicePeriodStart] = useState(
    draft?.servicePeriodStart ?? defaultServicePeriod?.start ?? "",
  );
  const [servicePeriodEnd, setServicePeriodEnd] = useState(
    draft?.servicePeriodEnd ?? defaultServicePeriod?.end ?? "",
  );

  const defaultTerms = () =>
    isInvoice ? (customerKind === "business" ? "net_14" : "vorkasse") : customerKind === "business" ? "net_14" : "anzahlung_30";
  const [paymentTerms, setPaymentTerms] = useState<string>(draft?.paymentTerms ?? defaultTerms());
  /** Freitext für „Individuelle Zahlungsbedingungen“ (nur Geschäftskunden). */
  const [paymentTermsCustom, setPaymentTermsCustom] = useState<string>(draft?.paymentTermsCustom ?? "");
  const sendLock = useRef(false);
  /** Entwurfs-Werte dürfen von den „Standardwerte setzen“-Effekten nicht überschrieben werden. */
  const skipDefaults = useRef(!!draft);

  useEffect(() => {
    if (skipDefaults.current) return;
    setPaymentTerms(defaultTerms());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerKind, isInvoice]);
  const [notes, setNotes] = useState<string>(draft?.notes ?? "");
  const [sending, setSending] = useState(false);

  // Bei Wechsel der Anfrage die Lieferadresse aus dem Anfrageformular übernehmen.
  useEffect(() => {
    if (skipDefaults.current) {
      skipDefaults.current = false;
      return;
    }
    setDelivery(defaultDelivery ?? emptyDelivery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquiryId, defaultDelivery?.requested, defaultDelivery?.street, defaultDelivery?.postal_code, defaultDelivery?.city]);

  /** Entwurf laufend sichern (leicht verzögert, damit Tippen nicht bremst). */
  useEffect(() => {
    if (disabled) return;
    const timer = window.setTimeout(() => {
      writeInquiryDraft(draftKey, {
        items,
        delivery,
        deliveryCostDelivery,
        deliveryCostReturn,
        setupCost,
        dismantleCost,
        deposit,
        validDays,
        payments,
        servicePeriodStart,
        servicePeriodEnd,
        paymentTerms,
        paymentTermsCustom,
        notes,
      });
    }, 400);
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
    deposit,
    validDays,
    payments,
    servicePeriodStart,
    servicePeriodEnd,
    paymentTerms,
    paymentTermsCustom,
    notes,
  ]);

  /** Entwurf verwerfen und Formular auf die Ausgangswerte zurücksetzen. */
  const discardDraft = () => {
    clearInquiryDraft(draftKey);
    draftRef.current = null;
    setDraftRestored(false);
    setItems(defaultItems.length ? defaultItems : [emptyLine()]);
    setDelivery(defaultDelivery ?? emptyDelivery);
    setDeliveryCostDelivery(defaultCosts?.delivery_cost_delivery ?? 0);
    setDeliveryCostReturn(defaultCosts?.delivery_cost_return ?? 0);
    setSetupCost(defaultCosts?.setup_cost ?? 0);
    setDismantleCost(defaultCosts?.dismantle_cost ?? 0);
    setDeposit(defaultCosts?.deposit ?? 0);
    setValidDays(14);
    setPayments(defaultPayments ?? []);
    setServicePeriodStart(defaultServicePeriod?.start ?? "");
    setServicePeriodEnd(defaultServicePeriod?.end ?? "");
    setPaymentTerms(defaultTerms());
    setPaymentTermsCustom("");
    setNotes("");
  };

  /** Positionen inkl. übernommenem Zeitraum – Basis für Summen, Anzeige und Versand. */
  const effectiveItems = useMemo(
    () => items.map((item, i) => applyInheritedPeriod(item, i, items[0])),
    [items],
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

  const totals = useMemo(
    () => buildOfferTotals(effectiveItems, deliveryCostDelivery + deliveryCostReturn + setupCost + dismantleCost),
    [effectiveItems, deliveryCostDelivery, deliveryCostReturn, setupCost, dismantleCost],
  );

  /** Summe der erfassten Teilzahlungen und daraus der offene Restbetrag. */
  const amountPaid = useMemo(
    () => Math.round(payments.reduce((s, p) => s + (Number(p.amount) || 0), 0) * 100) / 100,
    [payments],
  );
  const balanceDue = Math.round((totals.grossAmount - amountPaid) * 100) / 100;


  const patchItem = (index: number, patch: Partial<FormLine>) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  // Vorbelegte Positionen automatisch mit Bild (und ggf. Preis) aus dem CMS anreichern.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const salesCatalog = inquiryType === "sales" ? await loadSalesCatalog() : [];
      const enriched = await Promise.all(
        items.map(async (item) => {
          if (item.available_addons || !item.product_name.trim()) return item;
          if (inquiryType === "sales") {
            const hit = salesCatalog.find(
              (c) => c.name.toLowerCase() === item.product_name.trim().toLowerCase(),
            );
            if (!hit) return { ...item, available_addons: [] };
            const salesPrice = hit.net_price ?? undefined;
            const useSalesCms = item.unit_price <= 0 && salesPrice !== undefined;
            return {
              ...item,
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
          return {
            ...item,
            image_url: item.image_url ?? image,
            unit_price: useCms ? resolved!.price : item.unit_price,
            price_source: useCms ? ("cms" as const) : item.price_source,
            unit: item.unit ?? resolved?.unit ?? "kalendertage",
            duration: item.duration && item.duration > 0 ? item.duration : 1,
            product_slug: item.product_slug ?? match.slug,
            available_addons: parseAddonOptions(match.addon_options),
          };
        }),
      );
      if (!cancelled && enriched.some((item, i) => item !== items[i])) setItems(enriched);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquiryId]);

  const send = async () => {
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
    // Zusätzlicher Klick-Lock: State-Updates greifen erst im nächsten Render,
    // ein sehr schneller Doppelklick würde sonst zwei Requests auslösen.
    if (sendLock.current) return;
    sendLock.current = true;
    setSending(true);
    const { data, error } = await supabase.functions.invoke(
      isInvoice ? "send-inquiry-invoice" : "send-inquiry-offer",
      {
      body: {
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
        location,
        items: effectiveItems.map(({ available_addons: _unused, price_source: _src, custom_period: _cp, ...rest }) => {
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
            rental_end: rest.rental_end ?? checkEnd ?? undefined,
            quantity: articles * duration,
            unit: unitLabel(articles * duration, unit),
            addons: (rest.addons ?? []).filter((a) => Number(a.amount) !== 0),
          };
        }),
        payment_terms: paymentTerms,
        payment_terms_custom: paymentTerms === "custom" ? paymentTermsCustom.trim() : null,
        delivery_cost_delivery: deliveryCostDelivery,
        delivery_cost_return: deliveryCostReturn,
        setup_cost: setupCost,
        dismantle_cost: dismantleCost,
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
        notes,
        staff_name: staffName,
      },
    },
    );

    setSending(false);
    sendLock.current = false;

    const docLabel = isSupplement ? "Nachtrag" : isInvoice ? "Rechnung" : "Angebot";
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
    // Entwurf ist abgearbeitet – Zwischenspeicher leeren.
    clearInquiryDraft(draftKey);
    draftRef.current = null;
    setDraftRestored(false);
    onSent?.();
  };

  return (
    <div className="space-y-4">
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
      <div className="space-y-3">
        {items.map((item, index) => {
          const eff = effectiveItems[index] ?? item;
          const inherited = index > 0 && !item.custom_period;
          /** Pauschalposition: fester Preis, keine Mietdauer-Multiplikation. */
          const isFlatRate = (eff.unit ?? "kalendertage") === "pauschal";
          return (
          <div key={index} className="rounded-lg border border-border p-3 space-y-2">
            <div className="flex gap-2 items-start">
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
                    patchItem(index, {
                      product_name: freeText,
                      image_url: product ? pickCatalogImage(product.images) : undefined,
                      ...resolvePricePatch(item, resolved),
                      product_slug: product?.slug,
                      available_addons: product ? parseAddonOptions(product.addon_options) : [],
                      addons: [],
                    });
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
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => patchItem(index, { quantity: Number(e.target.value) || 0 })}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label className="text-xs">Menge (Dauer)</Label>
                <Input
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
                    patchItem(index, {
                      unit: v as OfferUnit,
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
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) =>
                    patchItem(index, { unit_price: Number(e.target.value) || 0, price_source: "manual" })
                  }
                  disabled={disabled}
                />
                {item.price_source === "cms" ? (
                  <p className="mt-1 text-[11px] text-muted-foreground">Preis aus CMS – anpassbar</p>
                ) : null}

              </div>
              <div>
                <Label className="text-xs">Rabatt %</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={item.discount_percent}
                  onChange={(e) => patchItem(index, { discount_percent: Number(e.target.value) || 0 })}
                  disabled={disabled}
                />
              </div>
              <div className="flex items-end text-sm font-semibold">
                {formatEuro(lineTotal(eff))}
              </div>
            </div>

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
            {(() => {
              const options = addonOptionsFor(item, inquiryType === "sales");
              return (
              <div className="rounded-md bg-muted/50 p-2 space-y-2">
                <div className="flex gap-2">
                <Select
                  value=""
                  disabled={disabled}
                  onValueChange={(key) => {
                    const option = options.find((o) => o.key === key);
                    if (!option) return;
                    if ((item.addons ?? []).some((a) => a.key === option.key)) return;
                    patchItem(index, {
                      addons: [
                        ...(item.addons ?? []),
                        {
                          key: option.key,
                          label: option.label,
                          amount: isSalesAddonNegative(option.key)
                            ? -Math.abs(suggestAddonAmount(option, item))
                            : suggestAddonAmount(option, item),
                          note: option.deductible ? `Selbstbehalt ${option.deductible} €` : option.note,
                        },
                      ],
                    });
                  }}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Zusatzoption hinzufügen …" />
                  </SelectTrigger>
                  <SelectContent>
                    {options
                      .filter((o) => !(item.addons ?? []).some((a) => a.key === o.key))
                      .map((o) => (
                        <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0"
                  disabled={disabled}
                  onClick={() =>
                    patchItem(index, {
                      addons: [
                        ...(item.addons ?? []),
                        { key: `custom-${Date.now()}`, label: "", amount: 0 },
                      ],
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" /> Freie Option
                </Button>
                </div>

                {(item.addons ?? []).map((addon, ai) => (
                  <div key={addon.key} className="flex items-end gap-2">
                    <div className="min-w-0 flex-1 space-y-1">
                      {addon.key.startsWith("custom") ? (
                        <Input
                          value={addon.label}
                          placeholder="Bezeichnung der Zusatzoption"
                          disabled={disabled}
                          onChange={(e) =>
                            patchItem(index, {
                              addons: (item.addons ?? []).map((a, j) =>
                                j === ai ? { ...a, label: e.target.value } : a,
                              ),
                            })
                          }
                        />
                      ) : (
                        <Label className="text-xs break-words">
                          {addon.label}
                          {addon.note ? <span className="block text-muted-foreground font-normal">{addon.note}</span> : null}
                        </Label>
                      )}
                      <Input

                        type="number"
                        step="0.01"
                        value={addon.amount}
                        onChange={(e) =>
                          patchItem(index, {
                            addons: (item.addons ?? []).map((a, j) =>
                              j === ai ? { ...a, amount: Number(e.target.value) || 0 } : a,
                            ),
                          })
                        }
                        disabled={disabled}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Zusatzoption entfernen"
                      disabled={disabled}
                      onClick={() =>
                        patchItem(index, { addons: (item.addons ?? []).filter((_, j) => j !== ai) })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              );
            })()}
          </div>
          );
        })}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setItems((prev) => [...prev, emptyLine()])
          }
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-1" /> Position hinzufügen
        </Button>
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



      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <div>
          <Label className="text-xs">Lieferkosten</Label>
          <Input type="number" min={0} step="0.01" value={deliveryCostDelivery}
            onChange={(e) => setDeliveryCostDelivery(Number(e.target.value) || 0)} disabled={disabled} />
        </div>
        <div>
          <Label className="text-xs">Abholkosten</Label>
          <Input type="number" min={0} step="0.01" value={deliveryCostReturn}
            onChange={(e) => setDeliveryCostReturn(Number(e.target.value) || 0)} disabled={disabled} />
        </div>
        <div>
          <Label className="text-xs">Aufbau</Label>
          <Input type="number" min={0} step="0.01" value={setupCost}
            onChange={(e) => setSetupCost(Number(e.target.value) || 0)} disabled={disabled} />
        </div>
        <div>
          <Label className="text-xs">Abbau</Label>
          <Input type="number" min={0} step="0.01" value={dismantleCost}
            onChange={(e) => setDismantleCost(Number(e.target.value) || 0)} disabled={disabled} />
        </div>
        <div>
          <Label className="text-xs">Kaution</Label>
          <Input type="number" min={0} step="0.01" value={deposit}
            onChange={(e) => setDeposit(Number(e.target.value) || 0)} disabled={disabled} />
        </div>
        {!isInvoice && (
          <div>
            <Label className="text-xs">Gültig (Tage)</Label>
            <Input type="number" min={1} max={180} value={validDays}
              onChange={(e) => setValidDays(Number(e.target.value) || 14)} disabled={disabled} />
          </div>
        )}
      </div>

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


      <div className="rounded-lg border border-border p-3 space-y-2">
        <Label className="text-xs">
          Zahlungsbedingungen ({customerKind === "business" ? "Geschäftskunde" : "Privatkunde"})
        </Label>
        <Select value={paymentTerms} onValueChange={setPaymentTerms} disabled={disabled}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {(isInvoice ? INVOICE_PAYMENT_OPTIONS : PAYMENT_OPTIONS[customerKind]).map((o) => (
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
            ? "Der Kunde erhält nach Annahme eine Buchungsbestätigung mit Zahlungslink; mindestens 30 % Anzahlung innerhalb von 48 Stunden, sonst wird die Reservierung freigegeben."
            : paymentTerms === "rentpair_vorkasse"
              ? "Vollständige Vorkasse über den Zahlungslink in der Buchungsbestätigung (48 Stunden)."
              : paymentTerms === "vorkasse"
                ? "Vorkasse per Banküberweisung – Bankdaten stehen im Angebots-PDF, Frist ist die Angebotsgültigkeit."
                : "Rechnungszahlung nach Mietende innerhalb der gewählten Frist; es gilt die Angebotsgültigkeit."}
        </p>
      </div>

      <div>
        <Label className="text-xs">Hinweis für den Kunden (optional)</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} disabled={disabled} />
      </div>

      {isInvoice && (
        <div className="rounded-lg border border-border p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
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
            <div key={index} className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
              <div>
                <Label className="text-[11px]">Datum</Label>
                <Input
                  type="date"
                  value={p.date}
                  disabled={disabled}
                  onChange={(e) =>
                    setPayments((prev) => prev.map((x, i) => (i === index ? { ...x, date: e.target.value } : x)))
                  }
                />
              </div>
              <div>
                <Label className="text-[11px]">Betrag brutto (€)</Label>
                <Input
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
              <div className="flex gap-2 items-end">
                <div className="flex-1">
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

      <Button onClick={send} disabled={disabled || sending || checking} className="w-full">
        <Send className="h-4 w-4 mr-2" />
        {isInvoice
          ? sending
            ? `${isSupplement ? "Nachtrag" : "Rechnung"} wird gesendet …`
            : `${isSupplement ? "Nachtrag" : "Rechnung"} per E-Mail senden`
          : sending
            ? "Angebot wird gesendet …"
            : "Angebot per E-Mail senden"}
      </Button>
      <p className="text-xs text-muted-foreground">
        {isInvoice
          ? "Die Rechnungsnummer wird beim Versand vergeben. Danach ist die Rechnung unveränderlich und kann nur noch storniert werden."
          : "Der Kunde wird in der E-Mail gebeten, die Annahme per Antwort an das Standort-Postfach zu bestätigen. Danach den Job manuell in Rentware anlegen."}
      </p>
    </div>
  );
}
