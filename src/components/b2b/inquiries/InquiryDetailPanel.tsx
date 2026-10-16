import { DepositSettlementCard } from "./DepositSettlementCard";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ExternalLink, FileCheck2, FilePlus2, Pencil, Receipt, Trash2, UserCheck, UserMinus, Wallet } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { INQUIRY_STATUSES, canTransition, type InquiryStatus } from "@/lib/inquiryStatus";
import { InquiryStatusBadge } from "./InquiryStatusBadge";
import { OrderCodeBadge } from "./OrderCodeBadge";
import { InquiryLocationSection } from "./InquiryLocationSection";
import { requestedItemsOf } from "./types";
import { inquiryDraftKey, listServerDraftsForInquiry, readInquiryDraft } from "./offerDraftStorage";
import { InquiryOfferForm, type OfferDeliveryAddress } from "./InquiryOfferForm";
import { OfferAcceptanceNotice } from "./OfferAcceptanceNotice";
import { useInquiryActions } from "./useInquiryActions";
import { InquiryCustomerCard, type CustomerKind } from "./InquiryCustomerCard";
import { DesktopOnly, MobileCollapsible } from "./ResponsiveSlot";
import { RejectInquiryDialog } from "./RejectInquiryDialog";
import { OrderConfirmationCard } from "./OrderConfirmationCard";
import { InquiryPaymentsCard, parseInquiryPayments } from "./InquiryPaymentsCard";
import { StripePaymentCard } from "./StripePaymentCard";
import type { OfferLine } from "./offerMath";
import { formatEuro, parseGroups, cleanExtraFields, type OfferGroup, type OfferExtraFields, type OrderType, type QuantityUnit } from "./offerMath";
import { useAuth } from "@/hooks/useAuth";
import { InstallmentCard } from "./InstallmentCard";

import type { OfferUnit } from "@/lib/offerUnits";

/** Einheitenbezeichnung aus dem Angebots-Snapshot zurück auf den Schlüssel mappen. */
const UNIT_BY_LABEL: Record<string, OfferUnit> = {
  "stück": "stueck",
  pauschal: "pauschal",
  arbeitstag: "arbeitstage",
  arbeitstage: "arbeitstage",
  kalendertag: "kalendertage",
  kalendertage: "kalendertage",
  woche: "wochen",
  wochen: "wochen",
  monat: "monate",
  monate: "monate",
};

/**
 * Im Angebots-Snapshot steht `quantity` bereits als Artikel × Dauer und die Dauer
 * nur noch als Text ("3 Artikel × 5 Kalendertage") in der Beschreibung.
 * Daraus Artikelzahl, Dauer und Einheit zurückgewinnen, damit die Rechnung
 * dieselben Positionstexte zeigt wie das Angebot.
 */
const PERIOD_SUFFIX = /\s*(\d+)\s*Artikel\s*[×x]\s*(\d+)\s*([A-Za-zÄÖÜäöüß]+)\s*$/;

function splitQuantity(
  description: string,
  quantity: number,
  unitLabelText: string,
): { quantity: number; duration: number; unit: OfferUnit; description: string } {
  const fallbackUnit = UNIT_BY_LABEL[unitLabelText.trim().toLowerCase()] ?? "stueck";
  const match = description.match(PERIOD_SUFFIX);
  if (match) {
    const articles = Number(match[1]) || 1;
    const duration = Number(match[2]) || 1;
    const unit = UNIT_BY_LABEL[match[3].trim().toLowerCase()] ?? fallbackUnit;
    return {
      quantity: articles,
      duration,
      unit,
      description: description.replace(PERIOD_SUFFIX, "").trim(),
    };
  }
  // Ohne Suffix enthielt das Angebot genau einen Artikel; `quantity` ist dann
  // bei Zeiteinheiten die Mietdauer (z. B. 5 Kalendertage), nicht die Stückzahl.
  // Pauschalpositionen haben immer Dauer 1 – dort ist `quantity` die Stückzahl.
  const qty = quantity || 1;
  if (fallbackUnit !== "stueck" && fallbackUnit !== "pauschal") {
    return { quantity: 1, duration: qty, unit: fallbackUnit, description };
  }
  return { quantity: qty, duration: 1, unit: fallbackUnit, description };
}

/** Angebots-Snapshot in Formular-Positionen übersetzen (inkl. Zusatzoptionen). */
export function offerPayloadToLines(payload: unknown): {
  items: (OfferLine & { custom_period?: boolean })[];
  costs?: {
    delivery_cost_delivery: number;
    delivery_cost_return: number;
    setup_cost: number;
    dismantle_cost: number;
    return_location: string | null;
    return_location_cost: number;
    deposit: number;
  };
  meta: {
    payment_terms: string | null; payment_terms_custom: string | null; valid_days: number | null; notes: string | null; open_ended: boolean;
    /** Paket 3b – fehlen bei alten Angeboten. */
    groups?: OfferGroup[]; extra_fields?: OfferExtraFields; order_type?: OrderType; terms_text?: string;
  };
  delivery: OfferDeliveryAddress | null;
} | null {
  const p = payload as
    | {
        items?: Array<Record<string, unknown>>;
        delivery_cost_delivery?: number;
        delivery_cost_return?: number;
        setup_cost?: number;
        dismantle_cost?: number;
        return_location?: string | null;
        return_location_cost?: number;
        deposit?: number;
        payment_terms?: string;
        payment_terms_custom?: string | null;
        valid_days?: number;
        notes?: string | null;
        open_ended?: boolean;
        groups?: unknown;
        extra_fields?: unknown;
        order_type?: unknown; terms_text?: unknown;
        delivery_requested?: boolean;
        delivery_address?: { street?: string; postal_code?: string; city?: string };
      }
    | null
    | undefined;
  if (!p || !Array.isArray(p.items) || p.items.length === 0) return null;
  const items: (OfferLine & { custom_period?: boolean })[] = p.items.map((raw) => {
    const legacy = splitQuantity(
      typeof raw.description === "string" ? raw.description : "",
      Number(raw.quantity) || 1,
      String(raw.unit ?? ""),
    );
    // Neuere Angebote speichern Stückzahl (articles), Dauer und Einheitencode getrennt –
    // dann diese direkt nehmen, sonst würde quantity (= Stück × Dauer) als Stückzahl gelesen.
    const articles = Number(raw.articles);
    const dur = Number(raw.duration);
    const split = articles > 0 && dur > 0 && typeof raw.unit_code === "string" && raw.unit_code
      ? { ...legacy, quantity: articles, duration: dur, unit: raw.unit_code as typeof legacy.unit }
      : legacy;
    return ({
    product_name: String(raw.product_name ?? ""),
    description: split.description,
    quantity: split.quantity,
    duration: split.duration,
    unit: split.unit,
    // Jede Position behält ihre eigene Einheit/Dauer aus dem Angebot.
    custom_period: true,
    unit_price: Number(raw.unit_price) || 0,
    discount_percent: Number(raw.discount_percent) || 0,
    rental_start: typeof raw.rental_start === "string" ? raw.rental_start : undefined,
    rental_end: typeof raw.rental_end === "string" ? raw.rental_end : undefined,
    ...(typeof raw.rental_start_time === "string" ? { rental_start_time: raw.rental_start_time } : {}),
    ...(typeof raw.rental_end_time === "string" ? { rental_end_time: raw.rental_end_time } : {}),
    ...(typeof raw.product_slug === "string" ? { product_slug: raw.product_slug } : {}),
    image_url: typeof raw.image_url === "string" ? raw.image_url : undefined,
    // Paket 3b (fehlen bei alten Angeboten)
    ...(typeof raw.group_id === "string" ? { group_id: raw.group_id } : {}),
    ...(raw.quantity_unit === "m2" || raw.quantity_unit === "lfm" ? { quantity_unit: raw.quantity_unit as QuantityUnit } : {}),
    ...(typeof raw.name_override === "string" && raw.name_override ? { name_override: raw.name_override } : {}),
    ...(typeof raw.description_override === "string" && raw.description_override ? { description_override: raw.description_override } : {}),
    addons: Array.isArray(raw.addons)
      ? (raw.addons as Array<Record<string, unknown>>).map((a) => ({
          key: String(a.key ?? "addon"),
          label: String(a.label ?? "Zusatzoption"),
          amount: Number(a.amount) || 0,
          note: typeof a.note === "string" ? a.note : undefined,
          ...(typeof a.price_type === "string" && typeof a.basis === "string"
            ? {
                price_type: a.price_type as "flat" | "per_unit" | "percent",
                basis: a.basis as "line" | "full_period" | "once",
                rate: Number(a.rate) || 0,
                days: a.days != null ? Number(a.days) : null,
                period_start: typeof a.period_start === "string" ? a.period_start : null,
                period_end: typeof a.period_end === "string" ? a.period_end : null,
                // Übernommene Beträge bleiben exakt wie im Angebot.
                manual: a.manual === true,
                ...(a.days_manual === true ? { days_manual: true } : {}),
                ...(typeof a.days_reason === "string" ? { days_reason: a.days_reason } : {}),
                ...(a.optional === true
                  ? {
                      optional: true,
                      per_day: Number(a.per_day) || Number(a.rate) || 0,
                      ...(typeof a.of_key === "string" ? { of_key: a.of_key } : {}),
                      ...(Number(a.surcharge_percent) > 0 ? { surcharge_percent: Number(a.surcharge_percent) } : {}),
                    }
                  : {}),
              }
            : {}),
        }))
      : undefined,
    });
  });
  return {
    items,
    costs: {
      delivery_cost_delivery: Number(p.delivery_cost_delivery) || 0,
      delivery_cost_return: Number(p.delivery_cost_return) || 0,
      setup_cost: Number(p.setup_cost) || 0,
      dismantle_cost: Number(p.dismantle_cost) || 0,
      return_location: typeof p.return_location === "string" ? p.return_location : null,
      return_location_cost: Number(p.return_location_cost) || 0,
      deposit: Number(p.deposit) || 0,
    },
    meta: {
      payment_terms: typeof p.payment_terms === "string" ? p.payment_terms : null,
      payment_terms_custom: typeof p.payment_terms_custom === "string" ? p.payment_terms_custom : null,
      valid_days: Number(p.valid_days) > 0 ? Number(p.valid_days) : null,
      notes: typeof p.notes === "string" ? p.notes : null,
      open_ended: p.open_ended === true,
      ...(parseGroups(p.groups).length ? { groups: parseGroups(p.groups) } : {}),
      ...(cleanExtraFields(p.extra_fields) ? { extra_fields: cleanExtraFields(p.extra_fields) } : {}),
      ...(p.order_type === "delivery" || p.order_type === "pickup" ? { order_type: p.order_type as OrderType } : {}),
      ...(typeof p.terms_text === "string" && p.terms_text.trim() ? { terms_text: p.terms_text } : {}),
    },
    delivery:
      typeof p.delivery_requested === "boolean"
        ? {
            requested: p.delivery_requested,
            street: p.delivery_address?.street ?? "",
            postal_code: p.delivery_address?.postal_code ?? "",
            city: p.delivery_address?.city ?? "",
          }
        : null,
  };
}

/** Kurzform einer Rechnung für die Übersicht im Anfragen-Detail. */

interface InvoiceRow {
  id: string;
  invoice_number: string | null;
  offer_number?: string | null;
  invoice_kind: string;
  invoice_date: string | null;
  gross_amount: number | null;
  status: string;
  file_url: string | null;
  net_amount: number | null;
  vat_amount: number | null;
  credited_amount: number | null;
  installment_number: number | null;
}

const KIND_LABEL: Record<string, string> = {
  invoice: "Rechnung",
  supplement: "Nachtrag",
  credit_note: "Gutschrift",
  installment: "Abschlagsrechnung",
  final: "Schlussrechnung",
};

interface Props {
  table: "rental_inquiries" | "sales_inquiries";
  inquiryType: "rental" | "sales";
  inquiry: {
    id: string;
    status: string;
    location: string | null;
    assigned_to: string | null;
    assigned_name: string | null;
    internal_notes: string | null;
    offer_number: string | null;
    /** Snapshot des versendeten Angebots – Grundlage für die Rechnung. */
    offer_payload?: unknown;
    order_code?: string | null;

    offer_file_url: string | null;
    offer_total_gross: number | null;
    offer_sent_at: string | null;
    customer_kind?: string | null;
    customer_email?: string | null;
    customer_phone?: string | null;
    customer_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    company_name?: string | null;
    vat_id?: string | null;
    customer_street?: string | null;
    customer_postal_code?: string | null;
    customer_city?: string | null;
    billing_street?: string | null;
    billing_postal_code?: string | null;
    billing_city?: string | null;
    /** Mietzeitraum der Anfrage – Basis für die Bestandsprüfung im Angebot. */
    start_date?: string | null;
    end_date?: string | null;
    /** Mietanfragen: angefragte Positionen (für die Standort-Verfügbarkeitsprüfung). */
    requested_items?: unknown;
    /** Mietanfragen: verknüpfte B2B-Reservierung (wird beim Standortwechsel mitgezogen). */
    b2b_reservation_id?: string | null;
  };
  defaultItems: (OfferLine & { product_slug?: string })[];
  /** Lieferadresse aus dem öffentlichen Anfrageformular (im Angebot änderbar). */
  defaultDelivery?: OfferDeliveryAddress;
  details: ReactNode;
  onChanged: () => void;
  /** Wird nach dem endgültigen Löschen aufgerufen (nur Super-Admins). */
  onDeleted?: () => void;
  /** "page" = Vollseite mit zwei Spalten (Mietanfragen), Standard = gestapelt (Sheet/Verkauf). */
  layout?: "stacked" | "page";
  /** Vollseite: eingeklappte Kundenanfrage für schmale Bildschirme. */
  mobileDetails?: ReactNode;
  /** Vollseite: Protokollbereich als Karte in der linken Spalte. */
  protocolSection?: ReactNode;
}


type DocMode = "offer" | "revise" | "invoice" | "final" | "order" | "deposit";
const DOC_MODE_PREFIX = "slt.inquiry-doc-mode.v1:";

function rememberDocMode(inquiryId: string, mode: DocMode) {
  try {
    window.sessionStorage.setItem(DOC_MODE_PREFIX + inquiryId, mode);
  } catch {
    /* ignorieren */
  }
}

/**
 * Startansicht des Dokumentformulars: Gibt es einen angefangenen Entwurf zur Überarbeitung,
 * öffnet sich dieser wieder – sonst die zuletzt gewählte Ansicht dieser Sitzung.
 */
function initialDocMode(inquiryType: string, inquiryId: string, offerNumber: string | null | undefined, hasSnapshot: boolean): DocMode {
  try {
    if (offerNumber && hasSnapshot && readInquiryDraft(inquiryDraftKey(`revise-${offerNumber}`, inquiryType, inquiryId))) {
      return "revise";
    }
    const saved = window.sessionStorage.getItem(DOC_MODE_PREFIX + inquiryId);
    if (saved === "revise") return offerNumber && hasSnapshot ? "revise" : "offer";
    if (saved === "invoice" || saved === "final" || saved === "offer") return saved as DocMode;
  } catch {
    /* ignorieren */
  }
  // Mit versendetem Angebot startet die Ansicht beim Auftrag (Überarbeiten), nicht bei einem leeren Neuangebot.
  return offerNumber && hasSnapshot ? "revise" : "offer";
}

export function InquiryDetailPanel({ table, inquiryType, inquiry, defaultItems, defaultDelivery, details, onChanged, onDeleted, layout = "stacked", mobileDetails, protocolSection }: Props) {
  const { user, isAdmin } = useAuth();
  const { isBranchManager } = useStaffAccess();
  const { toast } = useToast();
  const canDelete = isAdmin;
  const [deleting, setDeleting] = useState(false);
  // Paket 4: Anrede-Form der verknüpften Kundenakte (Quelle der Wahrheit, sonst die Anfrage)
  const [crmAddressForm, setCrmAddressForm] = useState<string | null>(null);
  const crmCustomerId = (inquiry as { crm_customer_id?: string | null }).crm_customer_id ?? null;
  useEffect(() => {
    setCrmAddressForm(null);
    if (!crmCustomerId) return;
    let alive = true;
    supabase.from("crm_customers").select("address_form").eq("id", crmCustomerId).maybeSingle()
      .then(({ data }) => { if (alive && data?.address_form) setCrmAddressForm(data.address_form); });
    return () => { alive = false; };
  }, [crmCustomerId]);
  const [serverDrafts, setServerDrafts] = useState<{ draft_key: string; updated_by_name: string | null; updated_at: string }[]>([]);
  useEffect(() => {
    let off = false;
    listServerDraftsForInquiry(inquiry.id).then((d) => !off && setServerDrafts(d));
    return () => { off = true; };
    // Nach Versand/Statuswechsel neu laden, damit gelöschte Entwürfe nicht weiter angezeigt werden.
  }, [inquiry.id, inquiry.status, inquiry.offer_number]);

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from(table).delete().eq("id", inquiry.id);
    setDeleting(false);
    if (error) {
      toast({
        title: "Löschen nicht möglich",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Anfrage gelöscht" });
    onDeleted?.();
    onChanged();
  };

  const { busy, actorName, claim, release, setStatus, saveNotes, update } = useInquiryActions(table, onChanged);
  const [notes, setNotes] = useState(inquiry.internal_notes ?? "");

  useEffect(() => setNotes(inquiry.internal_notes ?? ""), [inquiry.id, inquiry.internal_notes]);

  /** Positionen und Nebenkosten aus dem versendeten Angebot (inkl. Zusatzoptionen). */
  const offerSnapshot = useMemo(() => offerPayloadToLines(inquiry.offer_payload), [inquiry.offer_payload]);

  /** Bereits erfasste Zahlungen zur Anfrage (z. B. Vorkasse auf das Angebot). */
  const inquiryPayments = useMemo(
    () =>
      parseInquiryPayments((inquiry as { payments?: unknown }).payments).map((p) => ({
        date: p.date ?? new Date().toISOString().slice(0, 10),
        amount: p.amount,
        label: p.label ?? "Zahlungseingang",
        reference: p.reference,
      })),
    [inquiry],
  );


  /** Angebot oder Rechnung – steuert das Formular unten. */
  const [docMode, setDocModeState] = useState<DocMode>(() =>
    initialDocMode(inquiryType, inquiry.id, inquiry.offer_number, !!offerSnapshot),
  );
  const setDocMode = useCallback(
    (mode: DocMode) => {
      setDocModeState(mode);
      rememberDocMode(inquiry.id, mode);
    },
    [inquiry.id],
  );
  const lastInquiryId = useRef(inquiry.id);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const docSectionRef = useRef<HTMLDivElement | null>(null);

  // Angefragte Artikel der Mietanfrage – Grundlage der Verfügbarkeitsprüfung beim Standortwechsel.
  const rentalRequestedItems = useMemo(
    () => (inquiryType === "rental" ? requestedItemsOf(inquiry as unknown as Parameters<typeof requestedItemsOf>[0]) : []),
    [inquiryType, inquiry],
  );

  // Nach dem Wechsel der Dokumentart zum Formular springen, damit der Klick sichtbar wirkt.
  const docModeMounted = useRef(false);
  useEffect(() => {
    // Nicht beim ersten Anzeigen springen – nur bei einem echten Wechsel.
    if (!docModeMounted.current) { docModeMounted.current = true; return; }
    docSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [docMode]);

  const loadInvoices = useCallback(async () => {
    const column = inquiryType === "rental" ? "rental_inquiry_id" : "sales_inquiry_id";
    const { data } = await supabase
      .from("inquiry_invoices")
      .select("id, invoice_number, invoice_kind, invoice_date, gross_amount, net_amount, vat_amount, credited_amount, installment_number, status, file_url, offer_number")
      .eq(column, inquiry.id)
      .order("created_at", { ascending: false });
    setInvoices((data ?? []) as InvoiceRow[]);
  }, [inquiry.id, inquiryType]);

  useEffect(() => {
    // Nur beim Wechsel auf eine andere Anfrage zurücksetzen – nicht beim Neuladen derselben,
    // sonst springt eine angefangene Überarbeitung zurück auf das leere Neu-Angebot.
    if (lastInquiryId.current !== inquiry.id) {
      lastInquiryId.current = inquiry.id;
      setDocModeState(initialDocMode(inquiryType, inquiry.id, inquiry.offer_number, !!offerSnapshot));
    }
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquiry.id, loadInvoices]);

  const mine = inquiry.assigned_to === user?.id;

  const draftsEl = (
    <>
      {serverDrafts.map((d) => {
        const kind = d.draft_key.includes(":invoice:") ? "Rechnung" : d.draft_key.includes(":revise-") ? "Angebotsüberarbeitung" : "Angebot";
        return (
          <div key={d.draft_key} className="rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm">
            <span className="font-medium">Offener Entwurf ({kind})</span> von {d.updated_by_name ?? "einem Kollegen"}, zuletzt{" "}
            {new Date(d.updated_at).toLocaleString("de-DE")}. Bitte im Dokumentbereich weiterbearbeiten statt neu anzufangen.
          </div>
        );
      })}
    </>
  );
  const headerEl = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <OrderCodeBadge code={inquiry.order_code} />
        <InquiryStatusBadge status={inquiry.status} />
        {inquiry.assigned_name ? (
          <span className="text-sm text-muted-foreground">
            Bearbeitet von <strong>{inquiry.assigned_name}</strong>
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Noch niemand zugewiesen</span>
        )}
        {mine ? (
          <Button size="sm" variant="outline" onClick={() => release(inquiry.id)} disabled={busy}>
            <UserMinus className="h-3.5 w-3.5 mr-1" /> Freigeben
          </Button>
        ) : (
          <Button size="sm" onClick={() => claim(inquiry.id, inquiry.status)} disabled={busy}>
            <UserCheck className="h-3.5 w-3.5 mr-1" /> Übernehmen
          </Button>
        )}
        <Select
          value=""
          onValueChange={(value) => setStatus(inquiry.id, inquiry.status, value as InquiryStatus)}
        >
          <SelectTrigger className="w-[190px] h-9">
            <SelectValue placeholder="Status ändern" />
          </SelectTrigger>
          <SelectContent>
            {INQUIRY_STATUSES.filter((s) => canTransition(inquiry.status, s)).map((s) => (
              <SelectItem key={s} value={s}>
                {s === "in_progress" ? "In Bearbeitung" :
                  s === "offer_sent" ? "Angebot gesendet" :
                  s === "accepted" ? "Angenommen" :
                  s === "rejected" ? "Abgelehnt" :
                  s === "done" ? "Erledigt" : "Neu"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {inquiry.status !== "rejected" && (
          <RejectInquiryDialog
            inquiryType={inquiryType}
            inquiryId={inquiry.id}
            customerEmail={inquiry.customer_email ?? null}
            location={(inquiry as any).location ?? null}
            disabled={busy}
            onDone={onChanged}
          />
        )}
        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-9 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={busy || deleting}>
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Löschen
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Anfrage endgültig löschen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Die Anfrage wird unwiderruflich entfernt. Bereits erstellte Angebots-PDFs bleiben im
                  Speicher erhalten. Diese Aktion ist nur für Super-Admins möglich.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Endgültig löschen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </>
  );
  const customerEl = (
    <>
      <InquiryCustomerCard
        inquiryType={inquiryType}
        customerKind={inquiry.customer_kind ?? null}
        customerName={
          inquiryType === "rental"
            ? inquiry.customer_name ?? ""
            : [inquiry.first_name, inquiry.last_name].filter(Boolean).join(" ")
        }
        customerEmail={inquiry.customer_email ?? null}
        customerPhone={inquiry.customer_phone ?? null}
        companyName={inquiry.company_name ?? null}
        vatId={inquiry.vat_id ?? null}
        street={(inquiryType === "rental" ? inquiry.customer_street : inquiry.billing_street) ?? null}
        postalCode={(inquiryType === "rental" ? inquiry.customer_postal_code : inquiry.billing_postal_code) ?? null}
        city={(inquiryType === "rental" ? inquiry.customer_city : inquiry.billing_city) ?? null}
        salutation={inquiryType === "rental" ? ((inquiry as { customer_salutation?: string | null }).customer_salutation ?? null) : undefined}
        mobile={inquiryType === "rental" ? ((inquiry as { customer_mobile?: string | null }).customer_mobile ?? null) : undefined}
        addressForm={inquiryType === "rental" ? (crmAddressForm ?? (inquiry as { address_form?: string }).address_form ?? "du") : undefined}
        busy={busy}
        onSave={async (values) => {
          const patch: Record<string, unknown> = {
            customer_kind: values.customer_kind as CustomerKind,
            customer_email: values.email.trim() || null,
            customer_phone: values.phone.trim() || null,
            company_name: values.customer_kind === "business" ? values.company_name.trim() || null : null,
            vat_id: values.customer_kind === "business" ? values.vat_id.trim() || null : null,
          };
          if (inquiryType === "rental") {
            patch.customer_street = values.street.trim() || null;
            patch.customer_postal_code = values.postal_code.trim() || null;
            patch.customer_city = values.city.trim() || null;
          } else {
            patch.billing_street = values.street.trim() || null;
            patch.billing_postal_code = values.postal_code.trim() || null;
            patch.billing_city = values.city.trim() || null;
          }
          if (inquiryType === "rental") {
            patch.customer_name = values.name.trim() || null;
            // Paket 3b: Anrede (Ausgabe folgt in Paket 4)
            patch.customer_salutation = values.salutation === "herr" || values.salutation === "frau" ? values.salutation : null;
            patch.customer_mobile = values.mobile.trim() || null;
            patch.address_form = values.address_form;
            // Anrede-Form gehört zum Kunden: an der Kundenakte speichern, wenn verknüpft
            const crmId = (inquiry as { crm_customer_id?: string | null }).crm_customer_id;
            if (crmId) {
              const { error: crmErr } = await supabase.from("crm_customers").update({ address_form: values.address_form }).eq("id", crmId);
              if (crmErr) return false;
              setCrmAddressForm(values.address_form);
            }
          } else {
            const parts = values.name.trim().split(/\s+/);
            patch.first_name = parts.slice(0, -1).join(" ") || parts[0] || null;
            patch.last_name = parts.length > 1 ? parts[parts.length - 1] : null;
          }
          return await update(inquiry.id, patch);
        }}
      />
    </>
  );
  const locationEl = (
    <>
      {/* Standort der Mietanfrage – nachträglich änderbar, inkl. Verfügbarkeitsprüfung am Zielstandort. */}
      {inquiryType === "rental" && (
        <InquiryLocationSection
          inquiryId={inquiry.id}
          location={inquiry.location}
          startDate={inquiry.start_date ?? null}
          endDate={inquiry.end_date ?? null}
          items={rentalRequestedItems}
          reservationId={inquiry.b2b_reservation_id ?? null}
          offerSent={!!inquiry.offer_sent_at}
          customerEmail={inquiry.customer_email ?? null}
          disabled={busy}
          onChanged={onChanged}
          onReviseSuggested={inquiry.offer_number ? () => {
            setDocMode("revise");
            toast({
              title: "Neue Angebotsfassung senden",
              description: "Das versendete Angebot bleibt unverändert – bitte dem Kunden eine neue Fassung mit dem neuen Standort senden.",
            });
          } : undefined}
        />
      )}
    </>
  );
  const notesEl = (
    <>
      <div>
        <Label className="text-xs">Interne Notizen</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        <Button
          size="sm"
          variant="outline"
          className="mt-2"
          onClick={() => saveNotes(inquiry.id, notes)}
          disabled={busy || notes === (inquiry.internal_notes ?? "")}
        >
          Notiz speichern
        </Button>
      </div>
    </>
  );
  const offerEl = (
    <>
      {inquiry.offer_number && (
        <div className="rounded-lg border border-border p-3 text-sm space-y-1">
          <div className="font-semibold">Angebot {inquiry.offer_number}</div>
          <div className="text-muted-foreground">
            {inquiry.offer_sent_at ? new Date(inquiry.offer_sent_at).toLocaleString("de-DE") : "—"}
            {inquiry.offer_total_gross != null && ` · ${formatEuro(Number(inquiry.offer_total_gross))} brutto`}
          </div>
          {inquiry.offer_file_url && (
            <a
              href={inquiry.offer_file_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary underline"
            >
              PDF öffnen <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      )}
    </>
  );
  const paymentsEl = (
    <>
      <InquiryPaymentsCard
        table={table}
        inquiryId={inquiry.id}
        payments={(inquiry as { payments?: unknown }).payments}
        offerTotalGross={inquiry.offer_total_gross}
        deposit={Number((inquiry.offer_payload as { deposit?: unknown } | null)?.deposit) || 0}
        offerNumber={inquiry.offer_number}
        customerEmail={(inquiry as { customer_email?: string | null }).customer_email ?? null}
        lastReminderAt={(inquiry as { payment_reminder_manual_at?: string | null }).payment_reminder_manual_at ?? null}
        disabled={busy}
        onChanged={onChanged}
      />
    </>
  );
  const stripeEl = (
    <>
      <StripePaymentCard
        table={table}
        inquiryId={inquiry.id}
        offerNumber={inquiry.offer_number}
        onChanged={onChanged}
      />
    </>
  );
  const orderEl = (
    <>
      <OrderConfirmationCard
        inquiryType={inquiryType}
        inquiry={inquiry as Record<string, any>}
        senderName={actorName}
        onDone={onChanged}
      />
    </>
  );
  const installmentEl = (
    <>
      <InstallmentCard
        key={`${inquiry.id}:${(inquiry as any).installment_next_due ?? ""}:${(inquiry as any).installment_enabled ? 1 : 0}`}
        table={table}
        inquiryType={inquiryType}
        inquiry={inquiry as Record<string, any>}
        invoices={invoices}
        staffName={actorName}
        onChanged={() => {
          loadInvoices();
          onChanged();
        }}
        onFinalInvoice={() => setDocMode("final")}
      />
    </>
  );
  const invoicesEl = (
    <>
      {invoices.length > 0 && (
        <div className="rounded-lg border border-border p-3 text-sm space-y-2">
          <div className="font-semibold">Rechnungen zu dieser Anfrage</div>
          {invoices.map((inv) => (
            <div key={inv.id} className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{KIND_LABEL[inv.invoice_kind] ?? "Rechnung"} {inv.invoice_number}</span>
              <span className="text-muted-foreground">
                {inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString("de-DE") : "—"}
                {inv.gross_amount != null && ` · ${formatEuro(Number(inv.gross_amount))} brutto`}
                {inv.offer_number && ` · zu Angebot ${inv.offer_number}`}
              </span>
              <InquiryStatusBadge status={inv.status} />
              {inv.file_url && (
                <a
                  href={inv.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary underline"
                >
                  PDF öffnen <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
  const docEl = (
    <>
      <div ref={docSectionRef}>
        <div className="mb-4 space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {([
            { mode: "offer", label: inquiry.offer_number ? "Neues Angebot" : "Angebot erstellen", icon: FilePlus2, show: true },
            { mode: "revise", label: "Angebot überarbeiten", icon: Pencil, show: !!(offerSnapshot && inquiry.offer_number) },
            { mode: "invoice", label: "Rechnung erstellen", icon: Receipt, show: true },
            { mode: "order", label: "Auftragsbestätigung", icon: FileCheck2, show: layout === "page" && inquiry.status === "accepted" && !!inquiry.offer_number },
            { mode: "deposit", label: "Kaution abrechnen", icon: Wallet, show: inquiryType === "rental" && !!inquiry.offer_number },
          ] as { mode: DocMode; label: string; icon: typeof Pencil; show: boolean }[])
            .filter((b) => b.show)
            .map(({ mode, label, icon: Icon }) => (
              <Button
                key={mode}
                size="sm"
                variant={docMode === mode || (mode === "invoice" && docMode === "final") ? "default" : "outline"}
                className="h-9 w-full justify-start"
                onClick={() => setDocMode(mode)}
              >
                <Icon className="h-4 w-4 mr-2 shrink-0" />
                <span className="truncate">{label}</span>
              </Button>
            ))}
        </div>
        <div>
          <div className="font-semibold text-sm">
            {docMode === "offer" ? "Angebot erstellen" : docMode === "revise" ? `Angebot ${inquiry.offer_number} überarbeiten` : docMode === "final" ? "Schlussrechnung erstellen" : docMode === "order" ? "Auftragsbestätigung erstellen" : docMode === "deposit" ? "Kautionsabrechnung" : "Rechnung erstellen"}
          </div>
          <p className="text-xs text-muted-foreground">
            {docMode === "revise"
              ? "Alle Angaben aus dem zuletzt versendeten Angebot sind übernommen. Anpassen und als neue Fassung senden – sie erhält die Stammnummer mit Fassungszusatz und den Hinweis, welches Angebot sie ersetzt."
              : docMode === "final"
              ? "Gesamtabrechnung des Auftrags: Positionen und Leistungszeitraum an die tatsächliche Miete anpassen. Alle nicht stornierten Abschlagsrechnungen werden beim Versand automatisch mit Netto, USt. und Brutto abgezogen."
              : docMode === "offer"
              ? "Positionen prüfen und das Angebot per E-Mail senden."
              : docMode === "deposit"
              ? "Zahlung zählt zuerst auf die Miete. Kosten aus dem Rückgabeprotokoll werden mit der Kaution verrechnet – der Rest geht an den Kunden zurück."
              : docMode === "order"
              ? "Zahlungseingänge prüfen, ggf. Verfügbarkeit klären und die Auftragsbestätigung per E-Mail senden – der Auftrag kommt damit verbindlich zustande."
              : "Endabrechnung: Positionen und Leistungszeitraum an die tatsächliche Miete anpassen (z. B. Verlängerung). Bereits erfasste Zahlungen werden abgezogen, die Rechnungsnummer wird beim Versand vergeben."}
          </p>
        </div>
        </div>
        {docMode === "order" ? (
          orderEl
        ) : docMode === "deposit" ? (
          <DepositSettlementCard
            inquiry={inquiry as Record<string, any>}
            staffName={actorName}
            canMarkStripePayout={isAdmin || isBranchManager}
            onDone={() => { loadInvoices(); onChanged(); }}
          />
        ) : (
        <InquiryOfferForm
          key={`${inquiry.id}:${docMode}:${docMode === "revise" ? inquiry.offer_number : ""}`}
          inquiryType={inquiryType}
          inquiryId={inquiry.id}
          location={inquiry.location}
          // Bestehender Auftrag: immer mit den zuletzt angebotenen Positionen/Beträgen starten, nie bei 0 €.
          defaultItems={offerSnapshot?.items?.length ? offerSnapshot.items : defaultItems}
          defaultCosts={offerSnapshot?.costs}
          reviseOf={docMode === "revise" ? inquiry.offer_number : null}
          defaultMeta={docMode === "revise" ? offerSnapshot?.meta : undefined}
          defaultPayments={docMode === "invoice" || docMode === "final" ? inquiryPayments : undefined}
          defaultDelivery={offerSnapshot?.delivery ?? defaultDelivery}
          rentalPeriod={{ start: inquiry.start_date ?? null, end: inquiry.end_date ?? null }}
          reservationId={(inquiry as any).b2b_reservation_id ?? null}

          customerKind={inquiry.customer_kind === "business" ? "business" : "private"}
          mode={docMode === "invoice" || docMode === "final" ? "invoice" : "offer"}
          invoiceKind={docMode === "final" ? "final" : "invoice"}
          staffName={actorName}
          disabled={busy}
          stickyActions={layout === "page"}
          onSent={() => {
            loadInvoices();
            onChanged();
          }}
        />
        )}
      </div>
    </>
  );

  if (layout === "page") {
    return (
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-3 lg:items-start">
        {/* Unter 1024 px: Kundenanfrage eingeklappt ganz oben. */}
        {mobileDetails && <div className="lg:hidden">{mobileDetails}</div>}
        <MobileCollapsible title="Kundendaten & Standort">
          {customerEl}
          {locationEl}
        </MobileCollapsible>
        <aside className="order-last space-y-5 lg:order-none lg:col-span-1 lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-1">
          <DesktopOnly>
            {customerEl}
            {locationEl}
          </DesktopOnly>
          <div className="hidden lg:block">{details}</div>
          <OfferAcceptanceNotice inquiryId={inquiry.id} />
          {paymentsEl}
          {stripeEl}
          {installmentEl}
          {protocolSection}
          {offerEl}
          {invoicesEl}
          {notesEl}
        </aside>
        <section className="min-w-0 space-y-5 lg:col-span-2">
          {headerEl}
          {draftsEl}
          {docEl}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <OfferAcceptanceNotice inquiryId={inquiry.id} />
      {draftsEl}
      {headerEl}
      {customerEl}
      {locationEl}
      {details}
      <Separator />
      {notesEl}
      <Separator />
      {offerEl}
      {paymentsEl}
      {stripeEl}
      {orderEl}
      {installmentEl}
      {invoicesEl}
      {docEl}
    </div>
  );
}
