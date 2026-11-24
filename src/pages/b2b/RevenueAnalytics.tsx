import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Download, ChevronLeft, ChevronRight, Filter, RefreshCw, FileText, ArrowUpRight, MapPin, Loader2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { useAuth } from "@/hooks/useAuth";
import { useRevenueReport, fetchRevenueReport } from "@/hooks/useRevenueReport";
import { useToast } from "@/hooks/use-toast";
import { openStorageDocument } from "@/lib/openStorageDocument";
import { invokeWithAuth } from "@/lib/invokeWithAuth";
import { categoryDisplayName } from "@/data/categoryModel";
import { SEGMENT_FILTER_OPTIONS, parseSegmentFilter } from "@/lib/customerSegment";
import { cn } from "@/lib/utils";
import { csvCell } from "@/lib/csvCell";
import { berlinDay, revenueRange, shiftRevenuePeriod, REVENUE_PERIODS, REVENUE_STAGES, revenueBranch, revenueLocationLabel, revenueMoney, revenueEntryCsv, type RevenuePeriod, type RevenueBusiness, type RevenueStage, type RevenueEntry, type RevenueBucket } from "@/lib/revenueReport";

const dateLabel = (s: string) => new Date(`${s}T12:00:00Z`).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" });
const catLabel = (s: string) => categoryDisplayName(s) || s;
const statusLabel: Record<string, string> = { accepted: "Angenommen", done: "Erledigt", offer_sent: "Angebot gesendet", open: "Offen", paid: "Bezahlt", cancelled: "Storniert", overdue: "Überfällig", rejected: "Abgelehnt", in_progress: "In Bearbeitung", sent: "Versendet" };
const kindLabel = (s: string) => ({ invoice: "Rechnung", credit_note: "Gutschrift", installment: "Abschlag", final: "Schlussrechnung", supplement: "Nachberechnung" }[s] || (s.startsWith("Versand ") ? "Angebotsversand" : s));
function saveCsv(csv: string, name: string) {
  const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = `${name}.csv`; a.click(); URL.revokeObjectURL(url);
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="min-w-0 space-y-1"><span className="block text-xs font-medium text-muted-foreground">{label}</span>{children}</div>;
}
export default function RevenueAnalytics() {
  const { user } = useAuth();
  const { isAdmin: adminRole, isSuperAdmin, canViewRevenue, staffProfile, loading: accessLoading } = useStaffAccess();
  const isAdmin = adminRole || isSuperAdmin;
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const today = berlinDay();
  const preset = params.get("zeitraum") ?? "month";
  const period = (REVENUE_PERIODS.some(p => p.value === preset) ? preset : preset === "last_month" ? "month" : "year") as RevenuePeriod;
  const anchor = params.get("datum") ?? (preset === "last_month" ? shiftRevenuePeriod("month", today, -1) : today);
  const range = period === "custom" ? { from: params.get("von") || today, to: params.get("bis") || today } : revenueRange(period, anchor, today);
  const business = (params.get("bereich") === "verkauf" ? "sales" : params.get("bereich") === "miete" ? "rental" : "all") as RevenueBusiness;
  const stage = (REVENUE_STAGES.some(s => s.value === params.get("stufe")) ? params.get("stufe") : "invoiced") as RevenueStage;
  // A hostile URL is still forwarded to the server and rejected, not silently honoured.
  const location = params.get("standort") || (isAdmin ? "all" : revenueBranch(staffProfile?.location) || "all");
  const category = params.get("kategorie") || "all";
  const segment = parseSegmentFilter(params.get("kunden"));
  const offset = Math.max(0, Number(params.get("seite") || 0)) * 100;
  const query = { ...range, business, stage, location, category, segment, offset };
  const validRange = /^\d{4}-\d{2}-\d{2}$/.test(range.from) && /^\d{4}-\d{2}-\d{2}$/.test(range.to) && range.from <= range.to;
  const report = useRevenueReport(query, !accessLoading && canViewRevenue && validRange, user?.id);
  const [exporting, setExporting] = useState(false);
  const [opening, setOpening] = useState<string | null>(null);
  const data = report.data;
  const set = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params); next.delete("seite");
    Object.entries(changes).forEach(([k, v]) => { if (!v || v === "all") next.delete(k); else next.set(k, v); });
    setParams(next, { replace: true });
  };
  const exportEntries = async () => {
    setExporting(true);
    try {
      const rows: RevenueEntry[] = [];
      for (let page = 0; ; page += 100) {
        const result = await fetchRevenueReport({ ...query, offset: page });
        rows.push(...result.entries);
        if (rows.length >= result.total_count || !result.entries.length) break;
      }
      saveCsv(revenueEntryCsv(rows), `auswertung-${stage}-${business}-${range.from}-${range.to}`);
    } catch (e) { toast({ title: "Export nicht erstellt", description: e instanceof Error ? e.message : "Bitte erneut versuchen.", variant: "destructive" }); }
    finally { setExporting(false); }
  };
  const openPdf = async (entry: RevenueEntry) => {
    setOpening(entry.id);
    const tab = window.open("about:blank", "_blank"); if (tab) tab.opener = null;
    try {
      const { data: document, error } = await supabase.rpc("get_revenue_document", { p_event_id: entry.id });
      if (error || !document || typeof document !== "object" || Array.isArray(document) || typeof document.url !== "string") throw new Error(error?.message || "Beleg nicht vorhanden");
      if (entry.source_table === "inquiry_invoices" && entry.event_kind !== "credit_note" && entry.status !== "cancelled") {
        const { data: pdf, error: pdfError } = await invokeWithAuth<{ pdf_base64: string }>("send-inquiry-invoice", { invoice_pdf_id: entry.source_id });
        if (pdfError || !pdf?.pdf_base64) throw new Error("Rechnungs-PDF konnte nicht geladen werden.");
        const url = URL.createObjectURL(new Blob([Uint8Array.from(atob(pdf.pdf_base64), c => c.charCodeAt(0))], { type: "application/pdf" }));
        if (tab) tab.location.href = url; else window.open(url, "_blank", "noopener,noreferrer");
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else {
        const marker = "/b2b-invoices/"; const at = document.url.indexOf(marker);
        const path = decodeURIComponent((at >= 0 ? document.url.slice(at + marker.length) : document.url).split("?")[0]);
        const { data: signed, error: signingError } = await supabase.storage.from("b2b-invoices").createSignedUrl(path, 600);
        if (signingError || !signed?.signedUrl) throw new Error("Beleg konnte nicht geöffnet werden.");
        if (tab) tab.location.href = signed.signedUrl; else await openStorageDocument(document.url, "b2b-invoices");
      }
    } catch (e) { tab?.close(); toast({ title: "Beleg nicht geöffnet", description: e instanceof Error ? e.message : "Bitte erneut versuchen.", variant: "destructive" }); }
    finally { setOpening(null); }
  };
  if (!accessLoading && !canViewRevenue) return <B2BPortalLayout title="Umsatzauswertung"><p role="alert" className="text-muted-foreground">Keine Berechtigung zur Umsatzauswertung.</p></B2BPortalLayout>;
  return <B2BPortalLayout title="Umsatzauswertung" subtitle="Angebote · Aufträge · Fakturierter Umsatz">
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col items-start gap-3 border-b border-border pb-4">
        <div className="w-full min-w-0 sm:w-[280px]">
          <Field label="Standort">
            {isAdmin ? <Select value={location} onValueChange={v => set({ standort: v })}><SelectTrigger aria-label="Auswertungsstandort" className="h-10 w-full text-left text-sm [&>span]:flex-1 [&>span]:text-left"><MapPin className="mr-2 h-4 w-4 shrink-0 text-primary" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Alle Standorte</SelectItem><SelectItem value="bonn">Bonn</SelectItem><SelectItem value="krefeld">Krefeld</SelectItem><SelectItem value="muelheim">Mülheim an der Ruhr</SelectItem><SelectItem value="unassigned">Nicht zugeordnet / prüfen</SelectItem></SelectContent></Select> : <span className="flex min-h-10 items-center gap-2 text-sm font-semibold break-words"><MapPin className="h-4 w-4 shrink-0 text-primary" />{revenueLocationLabel(data?.scope.location ?? revenueBranch(staffProfile?.location))}</span>}
          </Field>
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Geschäftsart">
          {([["all", "Gesamt"], ["rental", "Miete"], ["sales", "Verkauf"]] as const).map(([v, l]) => <Button key={v} size="sm" variant={business === v ? "default" : "outline"} aria-pressed={business === v} onClick={() => set({ bereich: v === "sales" ? "verkauf" : v === "rental" ? "miete" : null, kategorie: null })}>{l}</Button>)}
        </div>
      </div>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-end [&>div]:w-full sm:[&>div]:w-auto">
        <Field label="Zeitraum"><Select value={period} onValueChange={v => set({ zeitraum: v, datum: today, von: range.from, bis: range.to })}><SelectTrigger className="w-full sm:w-[170px]" aria-label="Zeitraum"><SelectValue /></SelectTrigger><SelectContent>{REVENUE_PERIODS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent></Select></Field>
        {period !== "custom" ? <div className="flex items-center gap-2 flex-wrap min-w-0">
          <Button size="icon" variant="outline" aria-label="Vorheriger Zeitraum" title="Vorheriger Zeitraum" onClick={() => set({ datum: shiftRevenuePeriod(period, anchor, -1) })}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-xs sm:text-sm font-medium tabular-nums">{dateLabel(range.from)}{range.from !== range.to && ` – ${dateLabel(range.to)}`}</span>
          <Button size="icon" variant="outline" aria-label="Nächster Zeitraum" title="Nächster Zeitraum" disabled={anchor >= today} onClick={() => set({ datum: shiftRevenuePeriod(period, anchor, 1) })}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => set({ datum: today })}>Aktuell</Button>
        </div> : <div className="grid grid-cols-2 gap-2 max-w-full"><Field label="Von"><Input type="date" aria-label="Von" value={range.from} onChange={e => set({ von: e.target.value })} /></Field><Field label="Bis"><Input type="date" aria-label="Bis" value={range.to} onChange={e => set({ bis: e.target.value })} /></Field></div>}
      </div>
      <Collapsible className="border-b border-border pb-3">
        <CollapsibleTrigger asChild><Button variant="ghost" size="sm" className="gap-2"><Filter className="h-4 w-4" />Weitere Filter{category !== "all" || segment !== "all" ? " · aktiv" : ""}</Button></CollapsibleTrigger>
        <CollapsibleContent className="grid gap-3 sm:grid-cols-2 pt-3">
          <Field label="Kundengruppe"><Select value={segment} onValueChange={v => set({ kunden: v })}><SelectTrigger aria-label="Kundengruppe"><SelectValue /></SelectTrigger><SelectContent>{SEGMENT_FILTER_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Kategorie"><Select value={category} onValueChange={v => set({ kategorie: v })}><SelectTrigger aria-label="Kategorie"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Alle Kategorien</SelectItem>{[...new Set([...(data?.categories ?? []), ...(category !== "all" ? [category] : [])])].map(c => <SelectItem key={c} value={c}>{catLabel(c)}</SelectItem>)}</SelectContent></Select></Field>
        </CollapsibleContent>
      </Collapsible>
      {!validRange ? <p role="alert" className="text-destructive">Bitte einen gültigen Zeitraum wählen; Ende nicht vor Beginn.</p> : report.isError ? <div role="alert" className="space-y-2"><p className="text-destructive">{report.error.message}</p><Button variant="outline" onClick={() => void report.refetch()}><RefreshCw className="h-4 w-4 mr-2" />Erneut laden</Button></div> : !data ? <p role="status" className="text-muted-foreground">Auswertung wird geladen …</p> : <>
        <div className="grid gap-3 md:grid-cols-3" aria-label="Auswertungskennzahlen">
          {REVENUE_STAGES.map(s => { const metric = data.summary[s.value]; return <Button key={s.value} variant="outline" onClick={() => set({ stufe: s.value })} aria-pressed={stage === s.value} className={cn("h-auto min-h-[142px] w-full min-w-0 whitespace-normal items-start flex-col gap-2 p-4 text-left", stage === s.value && "border-primary bg-primary/5")}>
            <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
            <span className="text-xl font-bold tabular-nums break-all text-foreground">{metric.unknown && metric.count === metric.unknown ? "Nicht belegt" : revenueMoney(metric.net)}{metric.unknown > 0 && metric.count !== metric.unknown ? "*" : ""}</span>
            <span className="text-xs text-muted-foreground">{metric.count} Belege / Änderungen{metric.unknown > 0 ? ` · ${metric.unknown} ohne eindeutigen Betrag` : ""}</span>
            {business === "all" && <span className="grid w-full grid-cols-2 gap-2 border-t border-border pt-2 text-xs"><span>Miete<span className="block font-semibold tabular-nums">{revenueMoney(metric.rental)}</span></span><span>Verkauf<span className="block font-semibold tabular-nums">{revenueMoney(metric.sales)}</span></span></span>}
          </Button>; })}
        </div>
        {data.warnings > 0 && <p role="note" className="border-l-4 border-accent bg-accent/5 px-3 py-2 text-sm text-foreground">{data.warnings} Nachweise mit fehlender historischer Zuordnung oder unvollständigen Beträgen. Die Summen enthalten nur eindeutig belegte Werte.</p>}
        <section aria-label="Zeitverlauf" className="min-w-0 border-b border-border pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3"><h2 className="text-base font-semibold">{REVENUE_STAGES.find(s => s.value === stage)?.label} · netto</h2><div className="flex gap-4 text-xs"><span className="flex gap-1.5 items-center"><span className="h-2.5 w-2.5 bg-primary" />Miete</span><span className="flex gap-1.5 items-center"><span className="h-2.5 w-2.5 bg-accent" />Verkauf</span></div></div>
          {data.trend.length ? <ChartContainer config={{ rental: { label: "Miete", color: "hsl(var(--primary))" }, sales: { label: "Verkauf", color: "hsl(var(--accent))" } }} className="h-[260px] w-full aspect-auto">
            <BarChart data={data.trend} accessibilityLayer margin={{ left: 0, right: 8, top: 8, bottom: 0 }}><CartesianGrid vertical={false} /><XAxis dataKey="day" tickLine={false} axisLine={false} minTickGap={40} tickFormatter={v => dateLabel(v).slice(0, 5)} /><YAxis tickLine={false} axisLine={false} width={62} tickFormatter={v => Number(v).toLocaleString("de-DE", { notation: "compact" })} /><ReferenceLine y={0} stroke="hsl(var(--border))" /><ChartTooltip content={<ChartTooltipContent labelFormatter={v => dateLabel(String(v))} formatter={(v, name) => <span className="flex w-full justify-between gap-4"><span>{name === "rental" ? "Miete" : "Verkauf"}</span><strong>{revenueMoney(Number(v))}</strong></span>} />} /><Bar dataKey="rental" fill="var(--color-rental)" maxBarSize={28} isAnimationActive={false} /><Bar dataKey="sales" fill="var(--color-sales)" maxBarSize={28} isAnimationActive={false} /></BarChart>
          </ChartContainer> : <p className="py-8 text-center text-muted-foreground">Keine Belege in dieser Auswahl.</p>}
        </section>
        <section aria-label="Belegliste" className="min-w-0">
          <header className="flex flex-wrap justify-between items-center gap-3 mb-3"><h2 className="font-semibold">Belege & Änderungen <span className="text-sm font-normal text-muted-foreground">({data.total_count})</span></h2><Button variant="outline" size="sm" disabled={exporting || !data.total_count} onClick={() => void exportEntries()}>{exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}CSV</Button></header>
          <ul className="divide-y divide-border border-y border-border">
            {data.entries.map(e => <li key={e.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,110px)] gap-2 py-3 sm:grid-cols-[100px_minmax(0,1fr)_auto]">
              <span className="text-xs tabular-nums text-muted-foreground col-span-2 sm:col-span-1">{e.event_date ? dateLabel(e.event_date) : "Datum nicht belegt"}</span>
              <div className="min-w-0"><p className="text-sm font-semibold break-words">{e.document_number || "Ohne Dokumentnummer"}{e.order_code && <span className="ml-2 font-mono text-primary">#{e.order_code}</span>}</p><p className="text-sm break-words">{e.customer_name || "Kunde nicht hinterlegt"}</p><p className="text-xs text-muted-foreground break-words">{e.business === "sales" ? "Verkauf" : "Miete"} · {kindLabel(e.event_kind)}{e.status && ` · ${statusLabel[e.status] || e.status}`}{isAdmin && ` · ${revenueLocationLabel(e.location)}`}</p>{e.warning && <p className="mt-1 text-xs text-destructive break-words">{e.warning}</p>}</div>
              <div className="min-w-0 text-right"><p className={cn("text-sm font-semibold tabular-nums break-words", (e.net_amount ?? 0) < 0 && "text-destructive")}>{e.net_amount == null ? "Nicht belegt" : revenueMoney(e.net_amount)}</p><div className="mt-2 flex justify-end gap-1">
                {!e.event_kind.startsWith("Änderung") && e.event_kind !== "Auftragsstorno" && <Button variant="ghost" size="icon" className="h-8 w-8" title="PDF öffnen" aria-label={`PDF ${e.document_number || "Beleg"} öffnen`} disabled={opening !== null} onClick={() => void openPdf(e)}>{opening === e.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}</Button>}
                {e.source_table === "rental_inquiries" && <Button asChild variant="ghost" size="icon" className="h-8 w-8"><Link title="Mietvorgang öffnen" aria-label={`Mietvorgang ${e.order_code || ""} öffnen`} to={`/b2b/mietvorgaenge/${e.source_id}`}><ArrowUpRight className="h-4 w-4" /></Link></Button>}
                {e.source_table === "sales_inquiries" && <Button asChild variant="ghost" size="icon" className="h-8 w-8"><Link title="Verkaufsvorgang öffnen" aria-label={`Verkaufsvorgang ${e.order_code || ""} öffnen`} to={`/b2b/verkaufsanfragen?anfrage=${e.source_id}`}><ArrowUpRight className="h-4 w-4" /></Link></Button>}
              </div></div>
            </li>)}
          </ul>
          {!data.entries.length && <p className="py-5 text-sm text-muted-foreground">Keine passenden Belege.</p>}
          {data.total_count > 100 && <div className="flex items-center justify-between gap-2 mt-3"><Button variant="outline" size="sm" disabled={!offset} onClick={() => { const next = new URLSearchParams(params); next.set("seite", String(offset / 100 - 1)); setParams(next); }}><ChevronLeft className="h-4 w-4" />Zurück</Button><span className="text-xs text-muted-foreground">{offset + 1}–{Math.min(offset + 100, data.total_count)} / {data.total_count}</span><Button variant="outline" size="sm" disabled={offset + 100 >= data.total_count} onClick={() => { const next = new URLSearchParams(params); next.set("seite", String(offset / 100 + 1)); setParams(next); }}>Weiter<ChevronRight className="h-4 w-4" /></Button></div>}
        </section>
        <div className="grid gap-5 lg:grid-cols-2 [&>*]:min-w-0">
          {isAdmin && <Buckets title="Nach Standort" rows={data.by_location} label={revenueLocationLabel} onSelect={k => set({ standort: location === k ? null : k })} />}
          <Buckets title="Nach Kategorie" rows={data.by_category} label={catLabel} onSelect={k => set({ kategorie: category === k ? null : k })} />
          <Buckets title="Nach Artikel" rows={data.by_article} className="lg:col-span-2" />
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">Nur hier gespeicherte Belege · netto · Berliner Kalenderzeit. Kautionen und Entwürfe zählen nicht. Angebots- und Auftragsvolumen sind kein zusätzlicher fakturierter Umsatz. Überarbeitungen zählen als Wertänderung; Gutschriften mindern am Belegdatum. Nicht erfasste externe Umsätze, Deckungsbeiträge und Bonusberechnungen sind nicht enthalten.</p>
      </>}
    </div>
  </B2BPortalLayout>;
}
function Buckets({ title, rows, label, onSelect, className }: { title: string; rows: RevenueBucket[]; label?: (s: string) => string; onSelect?: (key: string) => void; className?: string }) {
  const [all, setAll] = useState(false);
  const csv = () => saveCsv([["Bezeichnung", "Kategorie", "Netto (EUR)", "Belege / Änderungen"].join(";"), ...rows.map(r => [label?.(r.key) || r.label, r.category ? catLabel(r.category) : "", r.revenue.toFixed(2).replace(".", ","), String(r.count)].map(csvCell).join(";"))].join("\n"), `auswertung-${title}`);
  return <section className={cn("border-t border-border pt-3", className)}><header className="flex justify-between gap-3 mb-2"><h2 className="font-semibold text-sm">{title}</h2><Button variant="ghost" size="sm" disabled={!rows.length} onClick={csv}><Download className="h-4 w-4 mr-1" />CSV</Button></header><ul className="divide-y divide-border">{(all ? rows : rows.slice(0, 10)).map(r => <li key={r.key}>{onSelect ? <Button variant="ghost" onClick={() => onSelect(r.key)} className="h-auto w-full justify-between gap-3 py-2 whitespace-normal text-left"><span className="min-w-0 break-words text-xs">{label?.(r.key) || r.label}</span><span className="shrink-0 tabular-nums text-xs font-semibold">{revenueMoney(r.revenue)}</span></Button> : <div className="flex justify-between gap-3 py-2 text-xs"><span className="min-w-0 break-words">{r.label}{r.category && <span className="block text-muted-foreground">{catLabel(r.category)}</span>}</span><span className="shrink-0 font-semibold tabular-nums">{revenueMoney(r.revenue)}</span></div>}</li>)}</ul>{rows.length > 10 && <Button variant="ghost" size="sm" onClick={() => setAll(v => !v)}>{all ? "Weniger" : `Alle ${rows.length} anzeigen`}</Button>}{!rows.length && <p className="text-sm text-muted-foreground">Keine Werte.</p>}</section>;
}
