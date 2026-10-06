import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, MapPin, Tags, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { categoryDisplayName } from "@/data/categoryModel";
import { formatEuro, isoDay } from "@/lib/dashboardMetrics";
import { SEGMENT_FILTER_OPTIONS, parseSegmentFilter, segmentOf } from "@/lib/customerSegment";
import {
  analyze, buildCategoryIndex, toCsv, UNKNOWN_LOCATION,
  type AnalyticsInvoice, type Bucket, type Business,
} from "@/lib/revenueAnalytics";

const LOCATION_LABEL: Record<string, string> = { krefeld: "Krefeld", bonn: "Bonn", muelheim: "Mülheim an der Ruhr", [UNKNOWN_LOCATION]: UNKNOWN_LOCATION };
const locLabel = (k: string) => LOCATION_LABEL[k] ?? k;
const catLabel = (k: string) => { const d = categoryDisplayName(k); return d && d !== k ? d : k; };

type Preset = "month" | "last_month" | "quarter" | "year" | "last_year" | "all" | "custom";
const PRESETS: { value: Preset; label: string }[] = [
  { value: "month", label: "Dieser Monat" },
  { value: "last_month", label: "Letzter Monat" },
  { value: "quarter", label: "Dieses Quartal" },
  { value: "year", label: "Dieses Jahr" },
  { value: "last_year", label: "Letztes Jahr" },
  { value: "all", label: "Gesamter Zeitraum" },
  { value: "custom", label: "Eigener Zeitraum" },
];

function presetRange(p: Preset, now = new Date()): [string | null, string | null] {
  const y = now.getFullYear(), m = now.getMonth();
  const d = (yy: number, mm: number, dd: number) => isoDay(new Date(yy, mm, dd));
  switch (p) {
    case "month": return [d(y, m, 1), d(y, m + 1, 0)];
    case "last_month": return [d(y, m - 1, 1), d(y, m, 0)];
    case "quarter": { const q = Math.floor(m / 3) * 3; return [d(y, q, 1), d(y, q + 3, 0)]; }
    case "year": return [d(y, 0, 1), d(y, 11, 31)];
    case "last_year": return [d(y - 1, 0, 1), d(y - 1, 11, 31)];
    default: return [null, null];
  }
}

const n = (v: unknown) => Number(v) || 0;

export default function RevenueAnalytics() {
  const { isAdmin, loading: accessLoading } = useStaffAccess();
  const [params, setParams] = useSearchParams();
  const business = (params.get("bereich") === "verkauf" ? "sales" : "rental") as Business;
  const preset = (params.get("zeitraum") as Preset) || "year";
  const location = params.get("standort") || "all";
  const segment = parseSegmentFilter(params.get("kunden"));
  const category = params.get("kategorie") || "all";
  const [customFrom, setCustomFrom] = useState(params.get("von") ?? "");
  const [customTo, setCustomTo] = useState(params.get("bis") ?? "");

  const [invoices, setInvoices] = useState<AnalyticsInvoice[]>([]);
  const [catIndexes, setCatIndexes] = useState<{ rental: Map<string, string>; sales: Map<string, string> }>({ rental: new Map(), sales: new Map() });
  const catIndex = catIndexes[business];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v === null || v === "all" || v === "") next.delete(k); else next.set(k, v);
    if (k === "bereich") next.delete("kategorie");
    setParams(next, { replace: true });
  };

  useEffect(() => {
    if (accessLoading || !isAdmin) return;
    (async () => {
      const [inq, inqItems, portal, portalItems, products, sales, newM, usedM] = await Promise.all([
        supabase.from("inquiry_invoices").select("id,inquiry_type,invoice_kind,status,invoice_date,net_amount,location,customer_kind,sales_inquiry_id,delivery_cost_delivery,delivery_cost_return,setup_cost,dismantle_cost,return_location_cost"),
        supabase.from("inquiry_invoice_items").select("invoice_id,product_name,total_price"),
        supabase.from("b2b_invoices").select("id,invoice_kind,status,invoice_date,net_amount,reservation_id,b2b_profile_id,delivery_cost,source_offer_id"),
        supabase.from("b2b_invoice_items").select("invoice_id,product_name,total_price"),
        supabase.from("b2b_managed_products").select("name,category"),
        supabase.from("sales_inquiries").select("id,product_category"),
        supabase.from("new_machines").select("name,category"),
        supabase.from("used_machines").select("model,category"),
      ]);
      const firstErr = [inq, inqItems, portal, portalItems, products].find((r) => r.error)?.error;
      if (firstErr) { setError(firstErr.message); setLoading(false); return; }

      const portalRows = (portal.data ?? []) as { id: string; invoice_kind: string | null; status: string; invoice_date: string | null; net_amount: number | null; reservation_id: string | null; b2b_profile_id: string | null; delivery_cost: number | null; source_offer_id: string | null }[];
      const resIds = portalRows.map((r) => r.reservation_id).filter(Boolean) as string[];
      const profIds = portalRows.map((r) => r.b2b_profile_id).filter(Boolean) as string[];
      const offerIds = portalRows.map((r) => r.source_offer_id).filter(Boolean) as string[];
      const [res, prof, offerItems] = await Promise.all([
        resIds.length ? supabase.from("b2b_reservations").select("id,location,product_name").in("id", resIds) : Promise.resolve({ data: [] }),
        profIds.length ? supabase.from("b2b_profiles").select("id,assigned_location").in("id", profIds) : Promise.resolve({ data: [] }),
        offerIds.length ? supabase.from("b2b_offer_items").select("offer_id,product_name,total_price").in("offer_id", offerIds) : Promise.resolve({ data: [] }),
      ]);
      const offerItemMap = new Map<string, { product_name: string | null; total_price: number | null }[]>();
      ((offerItems.data ?? []) as { offer_id: string; product_name: string | null; total_price: number | null }[]).forEach((o) => offerItemMap.set(o.offer_id, [...(offerItemMap.get(o.offer_id) ?? []), o]));
      const resRows = (res.data ?? []) as { id: string; location: string | null; product_name: string | null }[];
      const resLoc = new Map(resRows.map((r) => [r.id, r.location]));
      const resProduct = new Map(resRows.map((r) => [r.id, r.product_name]));
      const profLoc = new Map(((prof.data ?? []) as { id: string; assigned_location: string | null }[]).map((r) => [r.id, r.assigned_location]));
      const salesCat = new Map(((sales.data ?? []) as { id: string; product_category: string | null }[]).map((r) => [r.id, r.product_category]));

      const group = <T extends { invoice_id: string }>(rows: T[]) => {
        const m = new Map<string, T[]>();
        rows.forEach((r) => m.set(r.invoice_id, [...(m.get(r.invoice_id) ?? []), r]));
        return m;
      };
      const iItems = group((inqItems.data ?? []) as { invoice_id: string; product_name: string | null; total_price: number | null }[]);
      const pItems = group((portalItems.data ?? []) as { invoice_id: string; product_name: string | null; total_price: number | null }[]);

      const list: AnalyticsInvoice[] = [
        ...((inq.data ?? []) as { id: string; inquiry_type: string | null; invoice_kind: string | null; status: string; invoice_date: string | null; net_amount: number | null; location: string | null; customer_kind: string | null; sales_inquiry_id: string | null; delivery_cost_delivery: number | null; delivery_cost_return: number | null; setup_cost: number | null; dismantle_cost: number | null; return_location_cost: number | null }[]).map((r) => ({
          id: r.id, source: "inquiry" as const,
          business: (r.inquiry_type === "sales" ? "sales" : "rental") as Business,
          invoice_kind: r.invoice_kind, status: r.status, invoice_date: r.invoice_date, net_amount: n(r.net_amount),
          location: r.location, segment: segmentOf({ customer_kind: r.customer_kind }),
          fallbackCategory: r.sales_inquiry_id ? salesCat.get(r.sales_inquiry_id) ?? null : null,
          serviceAmount: n(r.delivery_cost_delivery) + n(r.delivery_cost_return) + n(r.setup_cost) + n(r.dismantle_cost) + n(r.return_location_cost),
          items: iItems.get(r.id) ?? [],
        })),
        ...portalRows.map((r) => ({
          id: r.id, source: "portal" as const, business: "rental" as Business, invoice_kind: r.invoice_kind,
          status: r.status, invoice_date: r.invoice_date, net_amount: n(r.net_amount),
          location: (r.reservation_id && resLoc.get(r.reservation_id)) || (r.b2b_profile_id && profLoc.get(r.b2b_profile_id)) || null,
          segment: "portal" as const,
          // ohne eigene Positionen: Positionen aus dem zugrunde liegenden Angebot
          items: pItems.get(r.id) ?? (r.source_offer_id ? offerItemMap.get(r.source_offer_id) ?? [] : []),
          serviceAmount: n(r.delivery_cost),
          fallbackArticle: r.reservation_id ? resProduct.get(r.reservation_id) ?? null : null,
        })),
      ];
      setInvoices(list);
      setCatIndexes({ rental: buildCategoryIndex((products.data ?? []) as { name: string | null; category: string | null }[]), sales: buildCategoryIndex([
        ...((newM.data ?? []) as { name: string | null; category: string | null }[]),
        ...((usedM.data ?? []) as { model: string | null; category: string | null }[]).map((u) => ({ name: u.model, category: u.category })),
      ]) });
      setLoading(false);
    })();
  }, [accessLoading, isAdmin]);

  const [from, to] = preset === "custom" ? [params.get("von") || null, params.get("bis") || null] : presetRange(preset);
  const filter = { business, from, to, location, segment, category };
  const result = useMemo(() => analyze(invoices, catIndex, filter), [invoices, catIndex, business, from, to, location, segment, category]); // eslint-disable-line react-hooks/exhaustive-deps
  // Optionen ohne eigenen Filter ermitteln, damit man immer zurückwechseln kann
  const allCats = useMemo(() => analyze(invoices, catIndex, { ...filter, category: "all" }).byCategory.map((c) => c.key), [invoices, catIndex, business, from, to, location, segment]); // eslint-disable-line react-hooks/exhaustive-deps
  const locations = useMemo(() => {
    const s = new Set(["krefeld", "bonn", "muelheim"]);
    invoices.forEach((i) => s.add(i.location || UNKNOWN_LOCATION));
    return [...s];
  }, [invoices]);

  const download = (name: string, rows: Bucket[], withCat: boolean, labelFn?: (k: string) => string) => {
    const csv = toCsv(rows.map((r) => ({ ...r, label: labelFn ? labelFn(r.key) : r.label, category: r.category ? catLabel(r.category) : r.category })), result.total, withCat);
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `umsatz-${business === "sales" ? "verkauf" : "vermietung"}-${name}-${from ?? "alle"}_${to ?? "alle"}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (!accessLoading && !isAdmin) {
    return <B2BPortalLayout title="Umsatzauswertung"><p className="text-muted-foreground">Nur für Admins.</p></B2BPortalLayout>;
  }

  const periodText = from || to ? `${from ? new Date(from).toLocaleDateString("de-DE") : "…"} – ${to ? new Date(to).toLocaleDateString("de-DE") : "…"}` : "Gesamter Zeitraum";

  return (
    <B2BPortalLayout title="Umsatzauswertung" subtitle="Fakturierter Umsatz netto nach Standort, Kategorie und Artikel">
      <div className="space-y-5">
        {/* Bereich */}
        <div className="inline-flex rounded-lg border border-border bg-card p-1" role="tablist">
          {([["rental", "Vermietung"], ["sales", "Verkauf"]] as const).map(([v, l]) => (
            <button key={v} role="tab" aria-selected={business === v} onClick={() => set("bereich", v === "sales" ? "verkauf" : null)}
              className={cn("rounded-md px-4 py-1.5 text-sm font-medium transition-colors", business === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {l}
            </button>
          ))}
        </div>

        {/* Filter */}
        <div className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
          <FilterField label="Zeitraum">
            <Select value={preset} onValueChange={(v) => set("zeitraum", v === "year" ? null : v)}>
              <SelectTrigger aria-label="Zeitraum"><SelectValue /></SelectTrigger>
              <SelectContent>{PRESETS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
            </Select>
          </FilterField>
          <FilterField label="Standort">
            <Select value={location} onValueChange={(v) => set("standort", v)}>
              <SelectTrigger aria-label="Standort"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Standorte</SelectItem>
                {locations.map((l) => <SelectItem key={l} value={l}>{locLabel(l)}</SelectItem>)}
              </SelectContent>
            </Select>
          </FilterField>
          <FilterField label="Kundengruppe">
            <Select value={segment} onValueChange={(v) => set("kunden", v)}>
              <SelectTrigger aria-label="Kundengruppe"><SelectValue /></SelectTrigger>
              <SelectContent>{SEGMENT_FILTER_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </FilterField>
          <FilterField label="Kategorie">
            <Select value={category} onValueChange={(v) => set("kategorie", v)}>
              <SelectTrigger aria-label="Kategorie"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {[...new Set([...allCats, ...(category !== "all" ? [category] : [])])].map((c) => <SelectItem key={c} value={c}>{catLabel(c)}</SelectItem>)}
              </SelectContent>
            </Select>
          </FilterField>
          {preset === "custom" && (
            <div className="grid grid-cols-2 gap-3 sm:col-span-2 lg:col-span-4 lg:max-w-md">
              <FilterField label="Von"><Input type="date" value={customFrom} onChange={(e) => { setCustomFrom(e.target.value); set("von", e.target.value); }} /></FilterField>
              <FilterField label="Bis"><Input type="date" value={customTo} onChange={(e) => { setCustomTo(e.target.value); set("bis", e.target.value); }} /></FilterField>
            </div>
          )}
        </div>

        {loading ? <p className="text-muted-foreground">Wird geladen …</p> : error ? <p className="text-destructive">Fehler beim Laden: {error}</p> : (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="Umsatz netto" value={formatEuro(result.total)} strong />
              <Stat label="Rechnungen" value={String(result.invoiceCount)} />
              <Stat label="Ø je Rechnung" value={formatEuro(result.invoiceCount ? result.total / result.invoiceCount : 0)} />
              <Stat label="Zeitraum" value={periodText} small />
            </div>

            {result.invoiceCount === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                Für diese Auswahl gibt es keine Rechnungen{business === "sales" ? " aus Verkäufen" : ""}.
              </p>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2 [&>*]:min-w-0">
                <BucketTable title="Umsatz nach Standort" icon={MapPin} rows={result.byLocation} total={result.total} labelFn={locLabel}
                  onRow={(k) => set("standort", location === k ? null : k)} activeKey={location}
                  onCsv={() => download("standorte", result.byLocation, false, locLabel)} />
                <BucketTable title="Umsatz nach Kategorie" icon={Tags} rows={result.byCategory} total={result.total} labelFn={catLabel}
                  onRow={(k) => set("kategorie", category === k ? null : k)} activeKey={category}
                  onCsv={() => download("kategorien", result.byCategory, false, catLabel)} />
                <BucketTable className="lg:col-span-2" title="Umsatz nach Artikel" icon={Package} rows={result.byArticle} total={result.total} showCategory
                  onCsv={() => download("artikel", result.byArticle, true)} />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Grundlage: geschriebene Rechnungen nach Rechnungsdatum, netto. Stornierte Rechnungen und ihre Gutschriften heben sich auf, Entwürfe und Kautionen zählen nicht.
              Liefer-, Aufbau- und Abbaukosten stehen unter „Lieferung & Service“, Versicherungen unter „Versicherung & Zusatzoptionen“. Beträge ohne passende Rechnungsposition stehen unter „Nicht aufgeschlüsselt“. Die Summen aller Tabellen ergeben immer den Gesamtumsatz. Ein Klick auf einen Standort oder eine Kategorie filtert die Ansicht.
            </p>
          </>
        )}
      </div>
    </B2BPortalLayout>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1"><span className="text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}

function Stat({ label, value, strong, small }: { label: string; value: string; strong?: boolean; small?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-bold tabular-nums", small ? "text-sm" : "text-xl", strong ? "text-primary" : "text-foreground")}>{value}</p>
    </div>
  );
}

function BucketTable({ title, icon: Icon, rows, total, labelFn, onRow, activeKey, onCsv, showCategory, className }: {
  title: string; icon: LucideIcon; rows: Bucket[]; total: number; labelFn?: (k: string) => string;
  onRow?: (k: string) => void; activeKey?: string; onCsv: () => void; showCategory?: boolean; className?: string;
}) {
  const [all, setAll] = useState(false);
  const shown = all ? rows : rows.slice(0, 15);
  const max = Math.max(...rows.map((r) => Math.abs(r.revenue)), 1);
  return (
    <section className={cn("rounded-xl border border-border bg-card", className)}>
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-primary" aria-hidden="true" />{title}<span className="text-xs font-normal text-muted-foreground">({rows.length})</span></h2>
        <Button variant="ghost" size="sm" onClick={onCsv}><Download className="mr-1 h-4 w-4" />CSV</Button>
      </header>
      <ul className="divide-y divide-border">
        {shown.map((r) => {
          const share = total ? (r.revenue / total) * 100 : 0;
          const inner = (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">{labelFn ? labelFn(r.key) : r.label}</span>
                  <span className="block text-xs text-muted-foreground">{showCategory && r.category ? `${catLabel(r.category)} · ` : ""}{r.count} {r.count === 1 ? "Rechnung" : "Rechnungen"}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className={cn("block text-sm font-semibold tabular-nums", r.revenue < 0 ? "text-destructive" : "text-foreground")}>{formatEuro(r.revenue)}</span>
                  <span className="block text-xs tabular-nums text-muted-foreground">{share.toFixed(1).replace(".", ",")} %</span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, (r.revenue / max) * 100)}%` }} />
              </div>
            </>
          );
          return (
            <li key={r.key}>
              {onRow ? (
                <button type="button" onClick={() => onRow(r.key)} className={cn("block w-full px-4 py-2.5 text-left hover:bg-muted", activeKey === r.key && "bg-muted")}>{inner}</button>
              ) : <div className="px-4 py-2.5">{inner}</div>}
            </li>
          );
        })}
      </ul>
      {rows.length > 15 && (
        <button type="button" onClick={() => setAll(!all)} className="w-full border-t border-border px-4 py-2 text-sm font-medium text-primary hover:bg-muted">
          {all ? "Weniger anzeigen" : `Alle ${rows.length} anzeigen`}
        </button>
      )}
    </section>
  );
}
