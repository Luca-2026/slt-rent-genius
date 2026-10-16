import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { RENTAL_LIST_STATE_KEY, fmtDateTime } from "./RentalInquiryDetail";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEGMENT_FILTER_OPTIONS, matchesSegment, parseSegmentFilter, segmentOf, type SegmentFilter } from "@/lib/customerSegment";
import { LegacyB2BRequestsNotice } from "@/components/b2b/inquiries/LegacyB2BRequestsNotice";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { useRentalInquiries } from "@/hooks/useInquiries";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { useAuth } from "@/hooks/useAuth";
import { InquiryStatusBadge } from "@/components/b2b/inquiries/InquiryStatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { INQUIRY_LIST_FILTERS, isReturnOverdue, isRunningRental, isUpcomingRental, matchesInquiryListFilter, parseInquiryListFilter, DEFAULT_INQUIRY_LIST_FILTER, isMyPendingInquiry, todayIso } from "@/lib/inquiryStatus";
import { useRentalProtocolStatus } from "@/hooks/useRentalProtocolStatus";
import { type RentalInquiry } from "@/components/b2b/inquiries/types";
import { getLocationDisplayName } from "@/utils/plzLocationMapping";
import { NewRentalInquiryDialog } from "@/components/b2b/inquiries/NewRentalInquiryDialog";
import { AiInquiryImportDialog } from "@/components/b2b/inquiries/AiInquiryImportDialog";
import { createInquiryFromImport } from "@/lib/createInquiryFromImport";
import { Wand2 } from "lucide-react";
import { Building2, Plus, UserCheck } from "lucide-react";

export default function RentalInquiries() {
  const { isStaff, loading: accessLoading } = useStaffAccess();
  const { user } = useAuth();
  const { rows, loading, reload } = useRentalInquiries();
  const location = useLocation();
  const protocols = useRentalProtocolStatus();
  const today = todayIso();
  const withProtocol = (r: RentalInquiry) => ({ ...r, handed_over: !!protocols.byInquiry.get(r.id)?.delivery });
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const openInquiry = (id: string) => {
    try { sessionStorage.setItem(RENTAL_LIST_STATE_KEY, JSON.stringify({ search: location.search, query: search, scrollY: window.scrollY })); } catch { /* ignorieren */ }
    navigate(`/b2b/mietanfragen/${id}`);
  };
  const [newOpen, setNewOpen] = useState(false);
  const [aiPrefill] = useState<string | null>(() => {
    try { return sessionStorage.getItem("slt-ai-import-prefill"); } catch { return null; }
  });
  useEffect(() => { try { sessionStorage.removeItem("slt-ai-import-prefill"); } catch { /* ignore */ } }, []);
  const [aiOpen, setAiOpen] = useState(!!aiPrefill);
  const [searchParams, setSearchParams] = useSearchParams();
  const segment = parseSegmentFilter(searchParams.get("kunden"));
  const locationFilter = searchParams.get("standort") ?? "all";
  const statusFilter = parseInquiryListFilter(searchParams.get("status"));
  const mineOnly = searchParams.get("meine") === "1";
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    // Wer den Bearbeitungsstand wählt, verlässt die Ansicht „Meine Anfragen“.
    if (key === "status") next.delete("meine");
    // Standardwerte stehen nicht in der Adresse: „all“ bei Standort/Kundengruppe, „Offen“ beim Bearbeitungsstand.
    const isDefault = key === "status" ? value === DEFAULT_INQUIRY_LIST_FILTER : value === "all";
    if (isDefault) next.delete(key); else next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (mineOnly) {
        if (!isMyPendingInquiry(r, user?.id)) return false;
      } else if (!matchesInquiryListFilter(withProtocol(r), statusFilter, today)) return false;
      if (!matchesSegment(segmentOf(r), segment)) return false;
      if (locationFilter !== "all" && r.location !== locationFilter) return false;
      if (!q) return true;
      return [r.product_name, r.customer_name, r.customer_email, r.company_name, r.location, r.customer_city]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [rows, search, statusFilter, segment, locationFilter, protocols.byInquiry, mineOnly, user?.id]);
  const myPendingCount = useMemo(() => rows.filter((r) => isMyPendingInquiry(r, user?.id)).length, [rows, user?.id]);
  const toggleMine = () => {
    const next = new URLSearchParams(searchParams);
    if (mineOnly) next.delete("meine"); else next.set("meine", "1");
    setSearchParams(next, { replace: true });
  };

  // Alte Links (?anfrage=<id>) auf die Vollseite umleiten.
  const legacyId = searchParams.get("anfrage");
  useEffect(() => {
    if (legacyId) navigate(`/b2b/mietanfragen/${legacyId}`, { replace: true });
  }, [legacyId, navigate]);

  // Zurück aus der Detailseite: Filter (Adresse), Suche und Scrollposition wiederherstellen.
  const restoreRef = useRef<{ search: string; query: string; scrollY: number } | null>(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(RENTAL_LIST_STATE_KEY);
      if (!raw || legacyId) return;
      sessionStorage.removeItem(RENTAL_LIST_STATE_KEY);
      const saved = JSON.parse(raw);
      restoreRef.current = saved;
      if (saved.query) setSearch(saved.query);
      if (!location.search && saved.search) navigate({ search: saved.search }, { replace: true });
    } catch { /* ignorieren */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (loading || !restoreRef.current) return;
    const y = restoreRef.current.scrollY;
    restoreRef.current = null;
    requestAnimationFrame(() => window.scrollTo(0, y));
  }, [loading]);

  if (!accessLoading && !isStaff) {
    return (
      <B2BPortalLayout title="Mietanfragen">
        <p className="text-muted-foreground">Kein Zugriff auf diesen Bereich.</p>
      </B2BPortalLayout>
    );
  }

  return (
    <B2BPortalLayout title="Mietanfragen" subtitle="Alle Mietanfragen – Privat- und Geschäftskunden">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 mb-4">
        <Button
          variant={mineOnly ? "default" : "outline"}
          onClick={toggleMine}
          aria-pressed={mineOnly}
          title="Von mir übernommene Anfragen und Angebote, die noch nicht versendet sind"
        >
          <UserCheck className="h-4 w-4 mr-1.5" /> Meine Anfragen
          <Badge variant={mineOnly ? "secondary" : "outline"} className="ml-2 px-1.5">{myPendingCount}</Badge>
        </Button>
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
        <Select value={mineOnly ? "" : statusFilter} onValueChange={(v) => setParam("status", v)}>
          <SelectTrigger className="sm:w-56" aria-label="Bearbeitungsstand"><SelectValue placeholder="Bearbeitungsstand" /></SelectTrigger>
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
          const id = await createInquiryFromImport(r);
          toast.success("Mietanfrage angelegt – Angebot jetzt bearbeiten.");
          await reload();
          if (id) openInquiry(id);
        }}
      />

      <NewRentalInquiryDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreated={async (id) => {
          await reload();
          // Direkt in die Angebotserstellung springen – identisch zu eingegangenen Anfragen.
          if (id) openInquiry(id);
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
              onClick={() => openInquiry(r.id)}
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
      {isPortal && <Badge variant="secondary">Kundenportal</Badge>}
      {!isBusiness && <Badge variant="outline">Privat</Badge>}
    </>
  );
}
