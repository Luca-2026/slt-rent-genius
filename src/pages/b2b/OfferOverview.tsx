import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { InquiryStatusBadge } from "@/components/b2b/inquiries/InquiryStatusBadge";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { inquiryStatusLabel } from "@/lib/inquiryStatus";
import { getLocationDisplayName } from "@/utils/plzLocationMapping";

const STORAGE_KEY = "offerOverview.filters";

interface Row {
  id: string;
  offer_number: string;
  company_name: string | null;
  customer_name: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  offer_total_gross: number | null;
  status: string;
  offer_sent_at: string | null;
  offer_accepted_at: string | null;
  created_at: string;
  offer_payload: { created_at?: string; valid_days?: number; valid_until?: string } | null;
}

interface Filters {
  status: string;
  location: string;
  from: string;
  to: string;
  q: string;
  sort: "created_desc" | "created_asc" | "number_desc" | "total_desc";
}
const DEFAULTS: Filters = { status: "all", location: "all", from: "", to: "", q: "", sort: "created_desc" };

const fmtDate = (d: string | null | undefined) => (d ? new Date(d.length === 10 ? `${d}T12:00:00` : d).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" }) : "–");
const eur = (n: number | null) => (n == null ? "–" : n.toLocaleString("de-DE", { style: "currency", currency: "EUR" }));
const createdOf = (r: Row) => r.offer_payload?.created_at ?? r.created_at;
const validUntil = (r: Row): string | null => {
  const p = r.offer_payload;
  if (p?.valid_until) return p.valid_until;
  if (p?.valid_days) {
    const d = new Date(createdOf(r));
    d.setDate(d.getDate() + Number(p.valid_days));
    return d.toISOString();
  }
  return null;
};

export default function OfferOverview() {
  const { isStaff, loading: accessLoading } = useStaffAccess();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState<Filters>(() => {
    try { return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") ?? {}) }; } catch { return DEFAULTS; }
  });
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(f)); } catch { /* ignorieren */ } }, [f]);
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!isStaff) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("rental_inquiries")
        .select("id,offer_number,company_name,customer_name,location,start_date,end_date,offer_total_gross,status,offer_sent_at,offer_accepted_at,created_at,offer_payload")
        .not("offer_number", "is", null)
        .order("created_at", { ascending: false })
        .limit(2000);
      setRows((data as unknown as Row[]) ?? []);
      setLoading(false);
    })();
  }, [isStaff]);

  const statuses = useMemo(() => [...new Set(rows.map((r) => r.status))].sort(), [rows]);
  // Standorte liegen teils groß-, teils kleingeschrieben vor – für den Filter vereinheitlichen.
  const normLoc = (v?: string | null) => (v ?? "").trim().toLowerCase().replace(/ü/g, "ue").replace(/\s+an der ruhr$/, "");
  const locations = useMemo(() => [...new Set(rows.map((r) => normLoc(r.location)).filter(Boolean))].sort(), [rows]);

  const list = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    const out = rows.filter((r) => {
      if (f.status !== "all" && r.status !== f.status) return false;
      if (f.location !== "all" && normLoc(r.location) !== f.location) return false;
      // Zeitraum: Mietzeitraum überschneidet den gewählten Bereich.
      if (f.from && (r.end_date ?? r.start_date ?? "") < f.from) return false;
      if (f.to && (r.start_date ?? "") > f.to) return false;
      if (q && ![r.offer_number, r.company_name, r.customer_name].some((v) => v?.toLowerCase().includes(q))) return false;
      return true;
    });
    const by: Record<Filters["sort"], (a: Row, b: Row) => number> = {
      created_desc: (a, b) => createdOf(b).localeCompare(createdOf(a)),
      created_asc: (a, b) => createdOf(a).localeCompare(createdOf(b)),
      number_desc: (a, b) => b.offer_number.localeCompare(a.offer_number, "de", { numeric: true }),
      total_desc: (a, b) => (b.offer_total_gross ?? 0) - (a.offer_total_gross ?? 0),
    };
    return out.sort(by[f.sort]);
  }, [rows, f]);

  if (!accessLoading && !isStaff) {
    return <B2BPortalLayout title="Angebote (alle)"><p className="text-muted-foreground">Kein Zugriff auf diesen Bereich.</p></B2BPortalLayout>;
  }

  const filtersActive = JSON.stringify({ ...f, sort: DEFAULTS.sort }) !== JSON.stringify({ ...DEFAULTS });

  return (
    <B2BPortalLayout title="Angebote (alle)" subtitle="Alle Angebote aus Mietanfragen – Privat- und Geschäftskunden">
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <Input className="lg:col-span-2" placeholder="Suche nach Nummer oder Kunde" value={f.q} onChange={(e) => set("q", e.target.value)} aria-label="Suche" />
        <Select value={f.status} onValueChange={(v) => set("status", v)}>
          <SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {statuses.map((s) => <SelectItem key={s} value={s}>{inquiryStatusLabel(s)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={f.location} onValueChange={(v) => set("location", v)}>
          <SelectTrigger aria-label="Standort"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Standorte</SelectItem>
            {locations.map((l) => <SelectItem key={l} value={l}>{getLocationDisplayName(l)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" value={f.from} onChange={(e) => set("from", e.target.value)} aria-label="Mietzeitraum von" />
        <Input type="date" value={f.to} onChange={(e) => set("to", e.target.value)} aria-label="Mietzeitraum bis" />
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground">{list.length} {list.length === 1 ? "Angebot" : "Angebote"}</p>
        <Select value={f.sort} onValueChange={(v) => set("sort", v as Filters["sort"])}>
          <SelectTrigger className="h-8 w-auto" aria-label="Sortierung"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="created_desc">Neueste zuerst</SelectItem>
            <SelectItem value="created_asc">Älteste zuerst</SelectItem>
            <SelectItem value="number_desc">Nach Angebotsnummer</SelectItem>
            <SelectItem value="total_desc">Nach Summe</SelectItem>
          </SelectContent>
        </Select>
        {filtersActive && <Button size="sm" variant="ghost" onClick={() => setF({ ...DEFAULTS, sort: f.sort })}>Filter zurücksetzen</Button>}
      </div>

      {loading ? <p className="text-muted-foreground">Lädt …</p> : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Angebot</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead className="hidden xl:table-cell">Standort</TableHead>
                <TableHead>Mietzeitraum</TableHead>
                <TableHead className="text-right">Summe brutto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden xl:table-cell">Erstellt</TableHead>
                <TableHead className="hidden 2xl:table-cell">Gültig bis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((r) => (
                <TableRow key={r.id} className="cursor-pointer" onClick={() => navigate(`/b2b/mietanfragen/${r.id}`)}
                  tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") navigate(`/b2b/mietanfragen/${r.id}`); }}>
                  <TableCell className="font-medium whitespace-nowrap">{r.offer_number}</TableCell>
                  <TableCell className="max-w-[14rem]">{r.company_name || r.customer_name || "–"}</TableCell>
                  <TableCell className="hidden whitespace-nowrap xl:table-cell">{r.location ? getLocationDisplayName(r.location) : "–"}</TableCell>
                  <TableCell><span className="whitespace-nowrap">{fmtDate(r.start_date)} –</span> <span className="whitespace-nowrap">{fmtDate(r.end_date)}</span></TableCell>
                  <TableCell className="text-right whitespace-nowrap">{eur(r.offer_total_gross)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 whitespace-nowrap">
                      <InquiryStatusBadge status={r.status} />
                      {r.offer_sent_at && r.status !== "offer_sent" && <Badge variant="outline">gesendet</Badge>}
                      {r.offer_accepted_at && r.status !== "accepted" && <Badge variant="secondary">angenommen</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap xl:table-cell">{fmtDate(createdOf(r))}</TableCell>
                  <TableCell className="hidden whitespace-nowrap 2xl:table-cell">{fmtDate(validUntil(r))}</TableCell>
                </TableRow>
              ))}
              {list.length === 0 && (
                <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">Keine Angebote für diese Filter.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </B2BPortalLayout>
  );
}
