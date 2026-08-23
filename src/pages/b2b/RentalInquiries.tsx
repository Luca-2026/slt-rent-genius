import { useMemo, useState } from "react";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { useRentalInquiries } from "@/hooks/useInquiries";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { InquiryStatusBadge } from "@/components/b2b/inquiries/InquiryStatusBadge";
import { InquiryDetailPanel } from "@/components/b2b/inquiries/InquiryDetailPanel";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { isOpenInquiry } from "@/lib/inquiryStatus";
import type { RentalInquiry } from "@/components/b2b/inquiries/types";
import { getLocationDisplayName } from "@/utils/plzLocationMapping";
import { NewRentalInquiryDialog } from "@/components/b2b/inquiries/NewRentalInquiryDialog";
import { Building2, Plus } from "lucide-react";

const SOURCE_LABELS: Record<string, string> = {
  b2b_portal: "B2B-Portal (Firmenkunde)",
  manual: "Manuell angelegt",
  website: "Website",
};

const fmtDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("de-DE") : "—";

/** Datum inkl. Uhrzeit – wir rechnen zeitgenau, nicht nur tageweise. */
const fmtDateTime = (date: string | null, time: string | null) => {
  const d = fmtDate(date);
  if (d === "—") return "—";
  return time ? `${d}, ${time.slice(0, 5)} Uhr` : d;
};

export default function RentalInquiries() {
  const { isStaff, loading: accessLoading } = useStaffAccess();
  const { rows, loading, reload } = useRentalInquiries();
  const [search, setSearch] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (onlyOpen && !isOpenInquiry(r.status)) return false;
      if (!q) return true;
      return [r.product_name, r.customer_name, r.customer_email, r.company_name, r.location, r.customer_city]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [rows, search, onlyOpen]);

  const selected = rows.find((r) => r.id === selectedId) ?? null;

  if (!accessLoading && !isStaff) {
    return (
      <B2BPortalLayout title="Mietanfragen">
        <p className="text-muted-foreground">Kein Zugriff auf diesen Bereich.</p>
      </B2BPortalLayout>
    );
  }

  return (
    <B2BPortalLayout title="Mietanfragen" subtitle="Anfragen zu Artikeln „auf Anfrage“">
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suche nach Artikel, Kunde, Standort …"
          className="sm:max-w-sm"
        />
        <Button variant={onlyOpen ? "default" : "outline"} onClick={() => setOnlyOpen((v) => !v)}>
          {onlyOpen ? "Nur offene" : "Alle Anfragen"}
        </Button>
        <Button className="sm:ml-auto" onClick={() => setNewOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Anfrage manuell anlegen
        </Button>
      </div>

      <NewRentalInquiryDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreated={reload}
      />

      {loading ? (
        <p className="text-muted-foreground">Wird geladen …</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">Keine Anfragen gefunden.</p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((r) => (
            <Card
              key={r.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedId(r.id)}
            >
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="font-semibold break-words min-w-0">{r.product_name || "Mietanfrage"}</span>
                    <InquiryStatusBadge status={r.status} />
                    <InquirySourceBadges inquiry={r} />
                  </div>
                  <p className="text-sm text-muted-foreground break-words">
                    {r.company_name ? `${r.company_name} · ` : ""}
                    {r.customer_name || r.customer_email || "—"}
                    {r.location && ` · ${getLocationDisplayName(r.location)}`}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground sm:text-right shrink-0">
                  <div>{fmtDateTime(r.start_date, r.start_time)} – {fmtDateTime(r.end_date, r.end_time)}</div>
                  <div>{r.assigned_name ? `→ ${r.assigned_name}` : "offen"}</div>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selected?.product_name || "Mietanfrage"}</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-4">
              <InquiryDetailPanel
                table="rental_inquiries"
                inquiryType="rental"
                inquiry={selected}
                onChanged={reload}
                onDeleted={() => setSelectedId(null)}
                defaultItems={[
                  {
                    product_name: selected.product_name || "Mietartikel",
                    description: [
                      fmtDateTime(selected.start_date, selected.start_time),
                      fmtDateTime(selected.end_date, selected.end_time),
                    ]
                      .filter((v) => v !== "—")
                      .join(" – "),
                    quantity: selected.quantity && selected.quantity > 0 ? selected.quantity : 1,
                    unit_price: 0,
                    discount_percent: 0,
                  },
                ]}
                defaultDelivery={{
                  requested: Boolean(
                    selected.delivery_requested ||
                      selected.delivery_street ||
                      selected.delivery_city,
                  ),
                  street: selected.delivery_street ?? "",
                  postal_code: selected.delivery_postal_code ?? "",
                  city: selected.delivery_city ?? "",
                }}

                details={<RentalDetails inquiry={selected} />}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </B2BPortalLayout>
  );
}

/** Kennzeichnet Firmenkunden bzw. Anfragen aus dem B2B-Portal. */
function InquirySourceBadges({ inquiry }: { inquiry: RentalInquiry }) {
  const isPortal = inquiry.source === "b2b_portal";
  const isBusiness = inquiry.customer_kind === "business" || isPortal;
  return (
    <>
      {isBusiness && (
        <Badge variant="outline" className="gap-1">
          <Building2 className="h-3 w-3" /> Firmenkunde
        </Badge>
      )}
      {isPortal && <Badge variant="secondary">B2B-Portal</Badge>}
    </>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-36 shrink-0 text-muted-foreground">{label}</span>
      <span className="font-medium break-words">{value}</span>
    </div>
  );
}

function RentalDetails({ inquiry }: { inquiry: RentalInquiry }) {
  return (
    <div className="space-y-1 rounded-lg border border-border p-3">
      <Row label="Eingegangen" value={new Date(inquiry.created_at).toLocaleString("de-DE")} />
      <Row label="Standort" value={inquiry.location ? getLocationDisplayName(inquiry.location) : null} />
      <Row label="Artikel" value={inquiry.product_name} />
      <Row label="Menge" value={inquiry.quantity ? String(inquiry.quantity) : null} />
      <Row
        label="Zeitraum"
        value={`${fmtDate(inquiry.start_date)}${inquiry.start_time ? ` ${inquiry.start_time}` : ""} – ${fmtDate(inquiry.end_date)}${inquiry.end_time ? ` ${inquiry.end_time}` : ""}`}
      />
      <Row label="Quelle" value={SOURCE_LABELS[inquiry.source] ?? inquiry.source} />
      <Row label="Firma" value={inquiry.company_name} />
      <Row label="USt-IdNr." value={inquiry.vat_id} />
      <Row label="Kunde" value={inquiry.customer_name} />
      <Row label="E-Mail" value={inquiry.customer_email} />
      <Row label="Telefon" value={inquiry.customer_phone} />
      <Row
        label="Adresse"
        value={[inquiry.customer_street, [inquiry.customer_postal_code, inquiry.customer_city].filter(Boolean).join(" ")]
          .filter(Boolean)
          .join(", ") || null}
      />
      <Row
        label="Lieferung"
        value={
          inquiry.delivery_requested
            ? [inquiry.delivery_street, [inquiry.delivery_postal_code, inquiry.delivery_city].filter(Boolean).join(" ")]
                .filter(Boolean)
                .join(", ") || "gewünscht"
            : "Selbstabholung"
        }
      />
      <Row label="Aufbauservice" value={inquiry.setup_service_requested ? "gewünscht" : null} />
      <Row label="Nachricht" value={inquiry.message} />
    </div>
  );
}
