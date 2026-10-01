import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEGMENT_FILTER_OPTIONS, matchesSegment, parseSegmentFilter, segmentOf, type SegmentFilter } from "@/lib/customerSegment";
import { LegacyB2BRequestsNotice } from "@/components/b2b/inquiries/LegacyB2BRequestsNotice";
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
import { INQUIRY_LIST_FILTERS, isReturnOverdue, isRunningRental, isUpcomingRental, matchesInquiryListFilter, parseInquiryListFilter, todayIso } from "@/lib/inquiryStatus";
import { useRentalProtocolStatus } from "@/hooks/useRentalProtocolStatus";
import { RentalProtocolSection } from "@/components/b2b/protocols/RentalProtocolSection";
import { requestedItemsOf, type RentalInquiry } from "@/components/b2b/inquiries/types";
import { quantityLabel } from "@/lib/setSize";
import { getLocationDisplayName } from "@/utils/plzLocationMapping";
import { NewRentalInquiryDialog } from "@/components/b2b/inquiries/NewRentalInquiryDialog";
import { AiInquiryImportDialog } from "@/components/b2b/inquiries/AiInquiryImportDialog";
import { Wand2 } from "lucide-react";
import { Building2, Plus } from "lucide-react";

const SOURCE_LABELS: Record<string, string> = {
  b2b_portal: "B2B-Portal (Firmenkunde)",
  manual: "Manuell angelegt",
  website: "Website",
  ai_import: "E-Mail/Telefon (KI-Import)",
};

const fmtDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("de-DE") : "—";

/** Datum inkl. Uhrzeit – wir rechnen zeitgenau, nicht nur tageweise. */
const fmtDateTime = (date: string | null, time: string | null) => {
  const d = fmtDate(date);
  if (d === "—") return "—";
  return time ? `${d}, ${time.slice(0, 5)} Uhr` : d;
};

/** Mietdauer in Kalendertagen (mindestens 1 Tag). */
const rentalDays = (start: string | null, end: string | null) => {
  if (!start || !end) return 1;
  const diff = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
  return diff > 0 ? diff : 1;
};

export default function RentalInquiries() {
  const { isStaff, loading: accessLoading } = useStaffAccess();
  const { rows, loading, reload } = useRentalInquiries();
  const protocols = useRentalProtocolStatus();
  const today = todayIso();
  const withProtocol = (r: RentalInquiry) => ({ ...r, handed_over: !!protocols.byInquiry.get(r.id)?.delivery });
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(() => new URLSearchParams(window.location.search).get("anfrage"));
  const [newOpen, setNewOpen] = useState(false);
  const [aiPrefill] = useState<string | null>(() => {
    try { const v = sessionStorage.getItem("slt-ai-import-prefill"); sessionStorage.removeItem("slt-ai-import-prefill"); return v; } catch { return null; }
  });
  const [aiOpen, setAiOpen] = useState(!!aiPrefill);
  const [searchParams, setSearchParams] = useSearchParams();
  const segment = parseSegmentFilter(searchParams.get("kunden"));
  const locationFilter = searchParams.get("standort") ?? "all";
  const statusFilter = parseInquiryListFilter(searchParams.get("status"));
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    // „all“ (Standort, Kundengruppe, Bearbeitungsstand) ist der Standard und steht nicht in der Adresse.
    if (value === "all") next.delete(key); else next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (!matchesInquiryListFilter(withProtocol(r), statusFilter, today)) return false;
      if (!matchesSegment(segmentOf(r), segment)) return false;
      if (locationFilter !== "all" && r.location !== locationFilter) return false;
      if (!q) return true;
      return [r.product_name, r.customer_name, r.customer_email, r.company_name, r.location, r.customer_city]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [rows, search, statusFilter, segment, locationFilter, protocols.byInquiry]);

  const selected = rows.find((r) => r.id === selectedId) ?? null;

  if (!accessLoading && !isStaff) {
    return (
      <B2BPortalLayout title="Mietanfragen">
        <p className="text-muted-foreground">Kein Zugriff auf diesen Bereich.</p>
      </B2BPortalLayout>
    );
  }

  return (
    <B2BPortalLayout title="Mietanfragen" subtitle="Alle Mietanfragen – Privat-, Geschäfts- und B2B-Portalkunden">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 mb-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suche nach Artikel, Kunde, Standort …"
          className="sm:w-72"
        />
        <Select value={segment} onValueChange={(v) => setParam("kunden", v as SegmentFilter)}>
          <SelectTrigger className="sm:w-48" aria-label="Kundengruppe"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SEGMENT_FILTER_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={locationFilter} onValueChange={(v) => setParam("standort", v)}>
          <SelectTrigger className="sm:w-48" aria-label="Standort"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Standorte</SelectItem>
            <SelectItem value="krefeld">Krefeld</SelectItem>
            <SelectItem value="bonn">Bonn</SelectItem>
            <SelectItem value="muelheim">Mülheim an der Ruhr</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setParam("status", v)}>
          <SelectTrigger className="sm:w-56" aria-label="Bearbeitungsstand"><SelectValue /></SelectTrigger>
          <SelectContent>
            {INQUIRY_LIST_FILTERS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" className="sm:ml-auto" onClick={() => setAiOpen(true)}>
          <Wand2 className="h-4 w-4 mr-1" /> Aus Text erstellen (KI)
        </Button>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Anfrage manuell anlegen
        </Button>
      </div>

      {(segment === "all" || segment === "business") && <LegacyB2BRequestsNotice />}

      <p className="mb-3 text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? "Anfrage" : "Anfragen"}</p>

      <AiInquiryImportDialog
        open={aiOpen}
        initialText={aiPrefill ?? undefined}
        onOpenChange={setAiOpen}
        onConfirm={async (r) => {
          const lines = r.lines.filter((l) => l.product_name.trim());
          const message = [
            r.notes.trim(),
            r.open_questions.length ? `Offene Fragen:\n- ${r.open_questions.join("\n- ")}` : "",
            `Originaltext (KI-Import):\n${r.source_text.trim()}`,
          ].filter(Boolean).join("\n\n");
          const { data: auth } = await supabase.auth.getUser();
          const { data, error } = await supabase
            .from("rental_inquiries")
            .insert({
              source: "ai_import",
              location: r.location,
              product_name: lines[0].product_name.trim(),
              quantity: lines[0].quantity > 0 ? lines[0].quantity : 1,
              requested_items: lines.map((l) => ({
                product_name: l.product_name.trim(),
                product_slug: l.product_slug,
                quantity: l.quantity > 0 ? l.quantity : 1,
                unit_price: l.unit_price && l.unit_price > 0 ? l.unit_price : null,
              })),
              start_date: r.start_date,
              end_date: r.end_date || null,
              customer_kind: r.customer_kind || "private",
              company_name: r.company_name.trim() || null,
              customer_name: r.customer_name.trim() || r.company_name.trim(),
              customer_email: r.customer_email.trim(),
              customer_phone: r.customer_phone.trim() || null,
              customer_street: r.customer_street.trim() || null,
              customer_postal_code: r.customer_postal_code.trim() || null,
              customer_city: r.customer_city.trim() || null,
              delivery_requested: Boolean(r.delivery),
              delivery_street: r.delivery ? r.delivery_street.trim() || null : null,
              delivery_postal_code: r.delivery ? r.delivery_postal_code.trim() || null : null,
              delivery_city: r.delivery ? r.delivery_city.trim() || null : null,
              message,
              status: "in_progress",
              assigned_to: auth.user?.id ?? null,
              assigned_at: new Date().toISOString(),
              crm_customer_id: r.crm_customer_id,
            } as never)
            .select("id")
            .maybeSingle();
          if (error) throw error;
          toast.success("Mietanfrage angelegt – Angebot jetzt bearbeiten.");
          await reload();
          const id = (data as { id?: string } | null)?.id;
          if (id) setSelectedId(id);
        }}
      />

      <NewRentalInquiryDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreated={async (id) => {
          await reload();
          // Direkt in die Angebotserstellung springen – identisch zu eingegangenen Anfragen.
          if (id) setSelectedId(id);
        }}
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
                    <RentalPhaseBadge inquiry={withProtocol(r)} returned={!!protocols.byInquiry.get(r.id)?.ret} today={today} />
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
                defaultItems={(requestedItemsOf(selected).length
                  ? requestedItemsOf(selected)
                  : [{ product_name: "Mietartikel", quantity: 1 }]
                ).map((it, idx) => ({
                  product_name: it.product_name,
                  product_slug: it.product_slug ?? undefined,
                  description: [
                    idx === 0
                      ? [fmtDateTime(selected.start_date, selected.start_time), fmtDateTime(selected.end_date, selected.end_time)]
                          .filter((v) => v !== "—")
                          .join(" – ")
                      : "",
                    it.set_size ? `${it.quantity} × ${it.set_size}er Set = ${it.quantity * it.set_size} Stück` : "",
                  ].filter(Boolean).join(" · "),
                  quantity: it.quantity,
                  duration: rentalDays(selected.start_date, selected.end_date),
                  unit: "kalendertage",
                  unit_price: it.unit_price ?? 0,
                  discount_percent: 0,
                }))}
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
              <RentalProtocolSection
                inquiry={selected}
                state={protocols.byInquiry.get(selected.id) ?? { delivery: null, ret: null }}
                onChanged={() => { void protocols.reload(); void reload(); }}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </B2BPortalLayout>
  );
}

/** Mietphase eines bestätigten Auftrags: bevorstehend, laufend, überfällig, zurück. */
function RentalPhaseBadge({ inquiry, returned, today }: { inquiry: RentalInquiry & { handed_over: boolean }; returned: boolean; today: string }) {
  if (returned && inquiry.status === "accepted") return <Badge variant="secondary">Zurückgegeben – Rechnung offen</Badge>;
  if (isReturnOverdue(inquiry, today) && !returned) return <Badge variant="destructive">Rückgabe überfällig</Badge>;
  if (isRunningRental(inquiry, today)) return <Badge className="bg-primary text-primary-foreground">{inquiry.handed_over ? "Läuft – übergeben" : "Läuft – Übergabe offen"}</Badge>;
  if (isUpcomingRental(inquiry, today)) return <Badge variant="outline">Mietbeginn steht bevor</Badge>;
  return null;
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
      {!isBusiness && <Badge variant="outline">Privat</Badge>}
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
      {(() => {
        const list = requestedItemsOf(inquiry);
        if (list.length <= 1) {
          return (
            <>
              <Row label="Artikel" value={inquiry.product_name} />
              <Row label="Menge" value={list[0] ? quantityLabel(list[0].quantity, list[0].set_size ?? null) : null} />
            </>
          );
        }
        return (
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
        );
      })()}
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
