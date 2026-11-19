/** Same pending deposit source as the rental list; never executes payouts. */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Wallet, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDepositRefundDues } from "@/hooks/useDepositRefundDues";
import { filterByDayLocation, type DayLocationFilter } from "@/lib/dayLocationFilter";

export function DepositSettlementsDue({ location }: { location: DayLocationFilter }) {
  const { rows, dues, loading, error } = useDepositRefundDues();
  const [expanded, setExpanded] = useState(false);
  const visible = filterByDayLocation(rows.filter(r => dues.has(r.id)), location)
    .sort((a, b) => (dues.get(a.id)?.since ?? "").localeCompare(dues.get(b.id)?.since ?? ""));
  const href = `/b2b/mietvorgaenge?status=deposit_refund${location !== "all" ? `&standort=${location}` : ""}`;
  return (
    <section aria-label="Kaution zu erstatten" className="rounded-lg border border-border bg-card text-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3"><h2 className="flex items-center gap-2 font-semibold"><Wallet className="h-4 w-4 text-primary" />Kaution zu erstatten{!loading && !error && ` (${visible.length})`}</h2><Link to={href} className="text-xs font-medium text-primary hover:underline">Mietvorgänge filtern</Link></header>
      {loading ? <p className="p-4 text-muted-foreground">Wird geladen …</p> : error ? <p role="alert" className="p-4 text-destructive">Kautionsstände konnten nicht vollständig geladen werden. Bitte die Seite erneut laden.</p> : !visible.length ? <p className="p-4 text-muted-foreground">Keine offenen Kautionserstattungen.</p> : <ul className="divide-y divide-border">
        {(expanded ? visible : visible.slice(0, 5)).map((r) => (
          <li key={r.id}>
            <Link to={`/b2b/mietvorgaenge/${r.id}`} className="flex items-start gap-3 px-4 py-3 hover:bg-muted">
              <span className="min-w-0 flex-1"><strong className="block break-words">{r.company_name || r.customer_name || "—"}{r.order_code ? ` · #${r.order_code}` : ""}</strong><span className="block break-words text-xs text-muted-foreground">{r.product_name}</span><span className="block text-xs text-muted-foreground">{dues.get(r.id)?.stage === "processing" ? "Erstattung in Bearbeitung" : dues.get(r.id)?.stage === "settlement" ? "Abrechnung offen · voraussichtlicher Rest" : "Abgerechnet · Auszahlung offen"}</span></span>
              <strong className="shrink-0 tabular-nums">{dues.get(r.id)?.amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</strong><ChevronRight className="h-4 w-4 shrink-0 text-primary" />
            </Link>
          </li>
        ))}
      </ul>}
      {visible.length > 5 && <Button variant="ghost" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} className="min-h-11 w-full border-t border-border">{expanded ? "Weniger anzeigen" : `Alle ${visible.length} anzeigen`}{expanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}</Button>}
    </section>
  );
}
