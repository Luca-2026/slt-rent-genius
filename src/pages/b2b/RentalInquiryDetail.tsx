import { formatRentalMoment, rentalPeriodOf } from "@/lib/rentalPeriod";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { useRentalInquiries } from "@/hooks/useInquiries";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { useRentalProtocolStatus } from "@/hooks/useRentalProtocolStatus";
import { InquiryDetailPanel } from "@/components/b2b/inquiries/InquiryDetailPanel";
import { RentalProtocolSection } from "@/components/b2b/protocols/RentalProtocolSection";
import { requestedItemsOf, type RentalInquiry } from "@/components/b2b/inquiries/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { quantityLabel } from "@/lib/setSize";
import { getLocationDisplayName } from "@/utils/plzLocationMapping";
import { rentalDuration } from "@/lib/pricing/rentalPricing";

export const RENTAL_LIST_STATE_KEY = "slt.rental-inquiries.list.v1";

const SOURCE_LABELS: Record<string, string> = {
  b2b_portal: "Kundenportal",
  manual: "Manuell angelegt",
  website: "Website",
  ai_import: "E-Mail/Telefon (KI-Import)",
  fonio: "Telefon (Fonio)",
  renty_chat: "Website-Chat (Renty)",
  product_booking: "Website (Artikelseite)",
};

/** Telefon-/KI-/manuelle Anfragen: fehlende Angaben bedeuten „nicht erfragt“, nicht „Selbstabholung“. */
const UNSTRUCTURED_SOURCES = new Set(["fonio", "ai_import", "manual"]);

const fmtDate = (value: string | null) => (value ? new Date(value).toLocaleDateString("de-DE") : "—");

/** Datum inkl. Uhrzeit – wir rechnen zeitgenau, nicht nur tageweise. */
export const fmtDateTime = (date: string | null, time: string | null) => formatRentalMoment(date, time);

export default function RentalInquiryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isStaff, loading: accessLoading } = useStaffAccess();
  const { rows, loading, reload } = useRentalInquiries();
  const protocols = useRentalProtocolStatus();
  const selected = rows.find((r) => r.id === id) ?? null;

  const backLink = (
    <Link to="/b2b/mietanfragen" className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
      <ArrowLeft className="h-4 w-4" /> Zurück zur Liste
    </Link>
  );

  if (!accessLoading && !isStaff) {
    return (
      <B2BPortalLayout title="Mietanfrage">
        <p className="text-muted-foreground">Kein Zugriff auf diesen Bereich.</p>
      </B2BPortalLayout>
    );
  }

  return (
    <B2BPortalLayout title={selected?.product_name || "Mietanfrage"}>
      {backLink}
      {loading && !selected ? (
        <p className="text-muted-foreground">Wird geladen …</p>
      ) : !selected ? (
        <p className="text-muted-foreground">Anfrage nicht gefunden.</p>
      ) : (
        <InquiryDetailPanel
          key={selected.id}
          layout="page"
          table="rental_inquiries"
          inquiryType="rental"
          inquiry={selected}
          onChanged={reload}
          onDeleted={() => navigate("/b2b/mietanfragen")}
          defaultItems={rentalDefaultItems(selected)}
          defaultDelivery={{
            requested: Boolean(selected.delivery_requested || selected.delivery_street || selected.delivery_city),
            street: selected.delivery_street ?? "",
            postal_code: selected.delivery_postal_code ?? "",
            city: selected.delivery_city ?? "",
          }}
          details={<CustomerRequestBlock inquiry={selected} defaultOpen />}
          mobileDetails={<CustomerRequestBlock inquiry={selected} defaultOpen={false} />}
          protocolSection={
            <RentalProtocolSection
              inquiry={selected}
              state={protocols.byInquiry.get(selected.id) ?? { delivery: null, ret: null }}
              onChanged={() => { void protocols.reload(); void reload(); }}
            />
          }
        />
      )}
    </B2BPortalLayout>
  );
}

/** Angebotspositionen aus der Anfrage vorbelegen (unverändert aus der bisherigen Listenansicht). */
function rentalDefaultItems(selected: RentalInquiry) {
  return (requestedItemsOf(selected).length ? requestedItemsOf(selected) : [{ product_name: "Mietartikel", quantity: 1 } as ReturnType<typeof requestedItemsOf>[number]]).map((it, idx) => ({
    product_name: it.product_name,
    product_slug: it.product_slug ?? undefined,
    description: [
      idx === 0
        ? [fmtDateTime(selected.start_date, selected.start_time), fmtDateTime(selected.end_date, selected.end_time)].filter((v) => v !== "—").join(" – ")
        : "",
      it.set_size ? `${it.quantity} × ${it.set_size}er Set = ${it.quantity * it.set_size} Stück` : "",
    ].filter(Boolean).join(" · "),
    quantity: it.quantity,
    duration: rentalDuration(
      { date: selected.start_date, time: selected.start_time },
      { date: selected.end_date, time: selected.end_time },
      "kalendertage",
    ),
    // Einheit bewusst offen: das Angebotsformular setzt sie nach Preisschema des CMS-Artikels (Bau = Miettage).
    unit: undefined,
    rental_start: selected.start_date ?? undefined,
    rental_end: selected.end_date ?? undefined,
    rental_start_time: selected.start_time?.slice(0, 5) ?? undefined,
    rental_end_time: selected.end_time?.slice(0, 5) ?? undefined,
    unit_price: it.unit_price ?? 0,
    discount_percent: 0,
    requested_addon_keys: it.selected_addons ?? [],
  }));
}

/** „Anfrage des Kunden“ – einklappbar; zeigt bei allen Quellen nur die vorhandenen Angaben. */
function CustomerRequestBlock({ inquiry, defaultOpen }: { inquiry: RentalInquiry; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg border border-border">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 p-3 text-left text-sm font-semibold">
        Anfrage des Kunden
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3">
        <RentalDetails inquiry={inquiry} />
      </CollapsibleContent>
    </Collapsible>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <span className="font-medium break-words">{value}</span>
    </div>
  );
}

function RentalDetails({ inquiry }: { inquiry: RentalInquiry }) {
  const list = requestedItemsOf(inquiry);
  const { start, end } = rentalPeriodOf(inquiry);
  const period = start === "—" && end === "—" ? null : `${start} – ${end}`;
  const deliveryAddress = [inquiry.delivery_street, [inquiry.delivery_postal_code, inquiry.delivery_city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return (
    <div className="space-y-1">
      <Row label="Eingegangen" value={new Date(inquiry.created_at).toLocaleString("de-DE")} />
      <Row label="Quelle" value={SOURCE_LABELS[inquiry.source] ?? inquiry.source} />
      <Row label="Standort" value={inquiry.location ? getLocationDisplayName(inquiry.location) : null} />
      {list.length <= 1 ? (
        <>
          <Row label="Artikel" value={inquiry.product_name} />
          <Row label="Menge" value={list[0] ? quantityLabel(list[0].quantity, list[0].set_size ?? null) : null} />
        </>
      ) : (
        <div className="py-1">
          <p className="text-xs text-muted-foreground mb-1">Artikel ({list.length})</p>
          <ul className="divide-y divide-border rounded-md border border-border text-sm">
            {list.map((it, i) => (
              <li key={i} className="flex items-start justify-between gap-3 px-2 py-1.5">
                <span className="min-w-0 break-words">{it.product_name}</span>
                <span className="shrink-0 font-medium text-right">{quantityLabel(it.quantity, it.set_size ?? null)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Row label="Zeitraum" value={period} />
      <Row
        label="Wochenende"
        value={
          inquiry.use_saturday || inquiry.use_sunday
            ? `${[inquiry.use_saturday ? "Samstag" : null, inquiry.use_sunday ? "Sonntag" : null].filter(Boolean).join(" und ")} als Nutzungstag gewünscht`
            : null
        }
      />
      <Row
        label="Lieferung"
        value={inquiry.delivery_requested ? deliveryAddress || "gewünscht" : deliveryAddress || (UNSTRUCTURED_SOURCES.has(inquiry.source) ? null : "Selbstabholung")}
      />
      <Row label="Aufbauservice" value={inquiry.setup_service_requested ? "gewünscht" : null} />
      <Row label="Nachricht" value={inquiry.message} />
    </div>
  );
}
