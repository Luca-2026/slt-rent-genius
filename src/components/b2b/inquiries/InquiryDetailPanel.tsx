import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ExternalLink, Receipt, Trash2, UserCheck, UserMinus } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { isSuperAdminEmail } from "@/lib/superAdmins";
import { INQUIRY_STATUSES, canTransition, type InquiryStatus } from "@/lib/inquiryStatus";
import { InquiryStatusBadge } from "./InquiryStatusBadge";
import { InquiryOfferForm, type OfferDeliveryAddress } from "./InquiryOfferForm";
import { useInquiryActions } from "./useInquiryActions";
import { InquiryCustomerCard, type CustomerKind } from "./InquiryCustomerCard";
import { RejectInquiryDialog } from "./RejectInquiryDialog";
import { InquiryPaymentsCard, parseInquiryPayments } from "./InquiryPaymentsCard";
import type { OfferLine } from "./offerMath";
import { formatEuro } from "./offerMath";
import { useAuth } from "@/hooks/useAuth";

import type { OfferUnit } from "@/lib/offerUnits";

/** Einheitenbezeichnung aus dem Angebots-Snapshot zurück auf den Schlüssel mappen. */
const UNIT_BY_LABEL: Record<string, OfferUnit> = {
  "stück": "stueck",
  arbeitstag: "arbeitstage",
  arbeitstage: "arbeitstage",
  kalendertag: "kalendertage",
  kalendertage: "kalendertage",
  woche: "wochen",
  wochen: "wochen",
  monat: "monate",
  monate: "monate",
};

/** Angebots-Snapshot in Formular-Positionen übersetzen (inkl. Zusatzoptionen). */
function offerPayloadToLines(payload: unknown): { items: OfferLine[]; costs?: Record<string, number> } | null {
  const p = payload as
    | {
        items?: Array<Record<string, unknown>>;
        delivery_cost_delivery?: number;
        delivery_cost_return?: number;
        setup_cost?: number;
        dismantle_cost?: number;
        deposit?: number;
      }
    | null
    | undefined;
  if (!p || !Array.isArray(p.items) || p.items.length === 0) return null;
  const items: OfferLine[] = p.items.map((raw) => ({
    product_name: String(raw.product_name ?? ""),
    description: typeof raw.description === "string" ? raw.description : "",
    quantity: Number(raw.quantity) || 1,
    duration: 1,
    unit: UNIT_BY_LABEL[String(raw.unit ?? "").trim().toLowerCase()] ?? "stueck",
    unit_price: Number(raw.unit_price) || 0,
    discount_percent: Number(raw.discount_percent) || 0,
    rental_start: typeof raw.rental_start === "string" ? raw.rental_start : undefined,
    rental_end: typeof raw.rental_end === "string" ? raw.rental_end : undefined,
    image_url: typeof raw.image_url === "string" ? raw.image_url : undefined,
    addons: Array.isArray(raw.addons)
      ? (raw.addons as Array<Record<string, unknown>>).map((a) => ({
          key: String(a.key ?? "addon"),
          label: String(a.label ?? "Zusatzoption"),
          amount: Number(a.amount) || 0,
          note: typeof a.note === "string" ? a.note : undefined,
        }))
      : undefined,
  }));
  return {
    items,
    costs: {
      delivery_cost_delivery: Number(p.delivery_cost_delivery) || 0,
      delivery_cost_return: Number(p.delivery_cost_return) || 0,
      setup_cost: Number(p.setup_cost) || 0,
      dismantle_cost: Number(p.dismantle_cost) || 0,
      deposit: Number(p.deposit) || 0,
    },
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
}

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
  };
  defaultItems: OfferLine[];
  /** Lieferadresse aus dem öffentlichen Anfrageformular (im Angebot änderbar). */
  defaultDelivery?: OfferDeliveryAddress;
  details: ReactNode;
  onChanged: () => void;
  /** Wird nach dem endgültigen Löschen aufgerufen (nur Super-Admins). */
  onDeleted?: () => void;
}


export function InquiryDetailPanel({ table, inquiryType, inquiry, defaultItems, defaultDelivery, details, onChanged, onDeleted }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const canDelete = isSuperAdminEmail(user?.email);
  const [deleting, setDeleting] = useState(false);

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
    () => parseInquiryPayments((inquiry as { payments?: unknown }).payments),
    [inquiry],
  );


  /** Angebot oder Rechnung – steuert das Formular unten. */
  const [docMode, setDocMode] = useState<"offer" | "invoice">("offer");
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const docSectionRef = useRef<HTMLDivElement | null>(null);

  // Nach dem Wechsel der Dokumentart zum Formular springen, damit der Klick sichtbar wirkt.
  useEffect(() => {
    docSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [docMode]);

  const loadInvoices = useCallback(async () => {
    const column = inquiryType === "rental" ? "rental_inquiry_id" : "sales_inquiry_id";
    const { data } = await supabase
      .from("inquiry_invoices")
      .select("id, invoice_number, invoice_kind, invoice_date, gross_amount, status, file_url, offer_number")
      .eq(column, inquiry.id)
      .order("created_at", { ascending: false });
    setInvoices((data ?? []) as InvoiceRow[]);
  }, [inquiry.id, inquiryType]);

  useEffect(() => {
    setDocMode("offer");
    loadInvoices();
  }, [inquiry.id, loadInvoices]);

  const mine = inquiry.assigned_to === user?.id;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
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
              <Button size="sm" variant="destructive" className="sm:ml-auto" disabled={busy || deleting}>
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
          } else {
            const parts = values.name.trim().split(/\s+/);
            patch.first_name = parts.slice(0, -1).join(" ") || parts[0] || null;
            patch.last_name = parts.length > 1 ? parts[parts.length - 1] : null;
          }
          return await update(inquiry.id, patch);
        }}
      />

      {details}

      <Separator />

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

      <Separator />

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

      {invoices.length > 0 && (
        <div className="rounded-lg border border-border p-3 text-sm space-y-2">
          <div className="font-semibold">Rechnungen zu dieser Anfrage</div>
          {invoices.map((inv) => (
            <div key={inv.id} className="flex flex-wrap items-center gap-2">
              <span className="font-medium">Rechnung {inv.invoice_number}</span>
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

      <div ref={docSectionRef}>
        <div className="flex flex-wrap gap-2 mb-3">
          <Button size="sm" variant={docMode === "offer" ? "default" : "outline"} onClick={() => setDocMode("offer")}>
            {inquiry.offer_number ? "Neues Angebot" : "Angebot erstellen"}
          </Button>
          <Button size="sm" variant={docMode === "invoice" ? "default" : "outline"} onClick={() => setDocMode("invoice")}>
            <Receipt className="h-3.5 w-3.5 mr-1" /> Rechnung erstellen
          </Button>
        </div>
        <div className="mb-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="font-semibold text-sm">
            {docMode === "offer" ? "Angebot erstellen" : "Rechnung erstellen"}
          </div>
          <p className="text-xs text-muted-foreground">
            {docMode === "offer"
              ? "Positionen prüfen und das Angebot per E-Mail senden."
              : "Endabrechnung: Positionen und Leistungszeitraum an die tatsächliche Miete anpassen (z. B. Verlängerung). Bereits erfasste Zahlungen werden abgezogen, die Rechnungsnummer wird beim Versand vergeben."}
          </p>
        </div>
        <InquiryOfferForm
          key={docMode}
          inquiryType={inquiryType}
          inquiryId={inquiry.id}
          location={inquiry.location}
          defaultItems={docMode === "invoice" && offerSnapshot ? offerSnapshot.items : defaultItems}
          defaultCosts={docMode === "invoice" ? offerSnapshot?.costs : undefined}
          defaultPayments={docMode === "invoice" ? inquiryPayments : undefined}
          defaultDelivery={defaultDelivery}

          customerKind={inquiry.customer_kind === "business" ? "business" : "private"}
          mode={docMode === "offer" ? "offer" : "invoice"}
          staffName={actorName}
          disabled={busy}
          onSent={() => {
            loadInvoices();
            onChanged();
          }}
        />
      </div>
    </div>
  );
}
