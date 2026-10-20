import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BellRing, CheckCircle2, ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { hasRentalEnded, rentalCloseoutTasks, isAwaitingOfferConfirmation } from "@/lib/dashboardMetrics";
import { isPaymentOverdue, paymentDeadline } from "../../../../supabase/functions/_shared/payment-followup";

import { effectiveEnd } from "@/lib/calendarEntries";
import { Button } from "@/components/ui/button";

type Row = {
  ended: boolean;
  end: string | null;
  tasks: string[];
  inquiryId: string;
  table: string;
  offer: string;
  acceptedAt: string | null;
  signer: string | null;
  customer: string;
  state: "paid" | "partial" | "checkout" | "open" | "invoice";
  paid: number;
  open: number;
  overdue: boolean;
  deadline: string | null;
};

const euro = (n: number) => n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
const LABEL: Record<Row["state"], string> = {
  paid: "Bezahlt",
  partial: "Teilweise bezahlt",
  checkout: "Zahlung begonnen, nicht abgeschlossen",
  open: "Zahlung offen",
  invoice: "Zahlung auf Rechnung",
};
const INVOICE_TERMS = new Set(["net_7", "net_14", "net_30"]);

/** All accepted inquiries awaiting confirmation, including manual acceptance. */
export function AcceptedOffersPayments() {
  const [rows, setRows] = useState<Row[]>([]);
  const seen = useRef<Map<string, Row["state"]> | null>(null);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const now = new Date();
      const cols = "end_date, end_time, id, status, customer_kind, offer_number, offer_sent_at, payments, offer_total_gross, offer_payload, order_confirmed_at, payment_followup_sent_at, customer_name, company_name";
      const [rent, sale] = await Promise.all([
        supabase.from("rental_inquiries").select(cols).in("status", ["accepted", "done"]),
        supabase.from("sales_inquiries").select("id, status, customer_kind, offer_number, offer_sent_at, payments, offer_total_gross, offer_payload, order_confirmed_at, payment_followup_sent_at, first_name, last_name, company_name").eq("status", "accepted").is("order_confirmed_at", null),
      ]);
      if (rent.error || sale.error) { if (active) setError(true); return; }
      const list = [
        ...(rent.data ?? []).map((i) => ({ ...i, table: "rental_inquiries" })),
        ...(sale.data ?? []).map((i) => ({ ...i, table: "sales_inquiries" })),
      ].filter((i) => isAwaitingOfferConfirmation(i, now) || (i.table === "rental_inquiries" && hasRentalEnded(i, now)));
      if (!list.length) { if (active) { setRows([]); setError(false); } return; }
      const ids = list.map((i) => i.id);
      const [acc, links, delivery, returns, invoices] = await Promise.all([
        supabase.from("offer_acceptance_links").select("inquiry_id, offer_number, accepted_at, signer_name").eq("status", "accepted").in("inquiry_id", ids).order("accepted_at", { ascending: false }),
        supabase.from("offer_payment_links").select("inquiry_id, offer_number, status, stripe_session_id").in("inquiry_id", ids),
        supabase.from("b2b_delivery_notes").select("rental_inquiry_id,status").in("rental_inquiry_id", ids),
        supabase.from("b2b_return_protocols").select("rental_inquiry_id,status").in("rental_inquiry_id", ids),
        supabase.from("inquiry_invoices").select("rental_inquiry_id,status,invoice_kind").in("rental_inquiry_id", ids),
      ]);
      if (acc.error || links.error || delivery.error || returns.error || invoices.error) { if (active) setError(true); return; }
      const out: Row[] = [];
      for (const i of list) {
        const ended = i.table === "rental_inquiries" && hasRentalEnded(i, now);
        const tasks = ended ? rentalCloseoutTasks({
          deliverySigned: (delivery.data ?? []).some((p) => p.rental_inquiry_id === i.id && p.status === "signed"),
          returnSigned: (returns.data ?? []).some((p) => p.rental_inquiry_id === i.id && p.status === "signed"),
          invoiced: (invoices.data ?? []).some((p) => p.rental_inquiry_id === i.id && !["draft", "cancelled"].includes(p.status) && ["invoice", "final"].includes(p.invoice_kind ?? "invoice")),
        }) : [];
        if (ended && !tasks.length) continue;
        const a = acc.data?.find((a) => a.inquiry_id === i.id && a.offer_number === i.offer_number);
        const payload = (i.offer_payload ?? {}) as { deposit?: unknown; payment_terms?: string };
        const total = (Number(i.offer_total_gross) || 0) + (Number(payload.deposit) || 0);
        let paid = 0;
        for (const p of Array.isArray(i.payments) ? i.payments : []) {
          if (p && typeof p === "object" && !Array.isArray(p)) paid += Number(p.amount) || 0;
        }
        const open = Math.max(0, Math.round((total - paid) * 100) / 100);
        const link = (links.data ?? []).find((l) => l.inquiry_id === i.id && l.offer_number === i.offer_number);
        const state: Row["state"] = open <= 0 ? "paid"
          : i.customer_kind === "business" && INVOICE_TERMS.has(payload.payment_terms ?? "") ? "invoice"
          : paid > 0 ? "partial"
          : link?.stripe_session_id ? "checkout" : "open";
        out.push({
          inquiryId: i.id, table: i.table, offer: i.offer_number ?? "", acceptedAt: a?.accepted_at ?? null,
          signer: a?.signer_name ?? null, customer: i.company_name || ("customer_name" in i ? i.customer_name : [i.first_name, i.last_name].filter(Boolean).join(" ")) || "",
          state, paid, open, ended, tasks, end: "end_date" in i ? effectiveEnd(i) : null,
          overdue: isPaymentOverdue({ status: i.status, order_confirmed_at: i.order_confirmed_at, payment_followup_sent_at: i.payment_followup_sent_at, payment_terms: payload.payment_terms ?? "vorkasse", gross: i.offer_total_gross, deposit: payload.deposit, paid_cents: Math.round(paid * 100) }, new Date()),
          deadline: paymentDeadline(i.payment_followup_sent_at)?.toISOString() ?? null,
        });
      }
      out.sort((a, b) => (b.acceptedAt ?? list.find((i) => i.id === b.inquiryId)?.offer_sent_at ?? "").localeCompare(a.acceptedAt ?? list.find((i) => i.id === a.inquiryId)?.offer_sent_at ?? ""));
      if (!active) return;
      // Pop-up only for changes after the first load: new acceptance, or payment now complete.
      if (seen.current) {
        for (const r of out) {
          const prev = seen.current.get(r.inquiryId);
          if (!prev) toast.info(`Angebot angenommen: ${r.customer} (${r.offer})`, { duration: 15000 });
          if (r.state === "paid" && prev !== "paid")
            toast.success(r.ended ? `${r.customer}: bezahlt – Mietende erreicht, Abschluss prüfen.` : `${r.customer}: angenommen und bezahlt – Auftragsbestätigung senden und Mietauftrag anlegen.`, { duration: 30000 });
        }
      }
      seen.current = new Map(out.map((r) => [r.inquiryId, r.state]));
      setRows(out); setError(false);
    };
    load();
    const ch = supabase
      .channel("accepted-offers-home")
      .on("postgres_changes", { event: "*", schema: "public", table: "offer_acceptance_links" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "rental_inquiries" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "sales_inquiries" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "offer_payment_links" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "b2b_delivery_notes" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "b2b_return_protocols" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "inquiry_invoices" }, load)
      .subscribe();
    const timer = window.setInterval(load, 60_000);
    return () => { active = false; window.clearInterval(timer); supabase.removeChannel(ch); };
  }, []);

  if (error) return <p role="alert" className="text-sm text-destructive">Angenommene Angebote konnten nicht aktualisiert werden. Bitte lade die Seite erneut.</p>;
  if (!rows.length) return null;
  const PREVIEW = 2;
  const pending = rows.filter((r) => !r.ended);
  const closeout = rows.filter((r) => r.ended);
  const visible = expanded ? pending : pending.slice(0, PREVIEW);
  const hidden = pending.length - PREVIEW;
  const ready = pending.filter((r) => r.state === "paid");
  return (
    <div className="space-y-3">
    {closeout.length > 0 && (
      <section className="rounded-lg border-2 border-accent bg-card" aria-label="Mietende – Abschluss offen">
        <h2 className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">Mietende – Abschluss offen · {closeout.length}</h2>
        <ul className="divide-y divide-border">
          {closeout.map((r) => (
            <li key={r.inquiryId}>
              <Link to={`/b2b/mietanfragen/${r.inquiryId}`} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted">
                <div className="min-w-0 flex-1 space-y-1">
                  <strong className="block break-words text-foreground">{r.customer} · {r.offer}</strong>
                  <span className="block text-xs text-muted-foreground">Mietende {r.end?.split("-").reverse().join(".")} · {LABEL[r.state]}{r.state === "paid" ? ` · ${euro(r.paid)}` : ""}</span>
                  {r.tasks.map((task) => <span key={task} className="block break-words text-xs font-medium text-foreground">{task}</span>)}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    )}
    {ready.length > 0 && (
      <section role="alert" className="rounded-xl border-2 border-accent bg-accent/10 p-4" aria-label="Auftragsbestätigung fällig">
        <div className="flex items-start gap-2">
          <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-accent animate-pulse" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-foreground">
              {ready.length === 1 ? "1 Auftrag" : `${ready.length} Aufträge`} angenommen und vollständig bezahlt
            </h2>
            <p className="text-sm text-muted-foreground">Jetzt Auftragsbestätigung senden und Mietauftrag anlegen.</p>
          </div>
        </div>
        <ul className="mt-3 space-y-2">
          {ready.map((r) => (
            <li key={"ready" + r.inquiryId}>
              <Link
                to={r.table === "sales_inquiries" ? `/b2b/verkaufsanfragen?anfrage=${r.inquiryId}` : `/b2b/mietanfragen/${r.inquiryId}`}
                className="flex items-center gap-2 rounded-md bg-card px-3 py-2 text-sm hover:bg-muted"
              >
                <span className="min-w-0 flex-1 break-words"><strong className="text-foreground">{r.customer}</strong> · {r.offer} · {euro(r.paid)}</span>
                <span className="shrink-0 font-medium text-primary">Bestätigen</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    )}
    {pending.length > 0 && <section className="rounded-xl border-2 border-primary bg-card" aria-label="Angenommene Angebote">
      <header className="flex items-center gap-2 border-b border-border px-4 py-3">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <h2 className="min-w-0 flex-1 text-sm font-semibold text-foreground">Angenommene Angebote · Zahlungseingang</h2>
        <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{pending.length}</span>
      </header>
      <ul className="divide-y divide-border">
        {visible.map((r) => (
          <li key={r.inquiryId + r.offer}>
            <Link
              to={r.table === "sales_inquiries" ? `/b2b/verkaufsanfragen?anfrage=${r.inquiryId}` : `/b2b/mietanfragen/${r.inquiryId}`}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-sm hover:bg-muted"
            >
              <div className="min-w-0 space-y-1.5">
                <strong className="block break-words font-medium text-foreground">{r.customer}</strong>
                <span className="block break-words text-xs text-muted-foreground">{r.offer} · {r.acceptedAt ? `online angenommen ${new Date(r.acceptedAt).toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "short", timeStyle: "short" })}${r.signer ? ` von ${r.signer}` : ""}` : "Im Portal als angenommen erfasst"}</span>
              <span className={cn(
                "inline-block max-w-full whitespace-normal break-words rounded-md px-2 py-1 text-xs font-medium",
                r.state === "paid" ? "bg-primary text-primary-foreground"
                  : r.state === "invoice" ? "bg-muted text-foreground"
                  : "bg-accent/15 text-foreground",
              )}>
                <span className="block">{LABEL[r.state]}</span>
                {r.overdue && <span className="block font-semibold text-destructive">Zahlung überfällig – Frist abgelaufen</span>}
                {!r.overdue && r.deadline && r.state !== "paid" && <span className="block">Zahlungsfrist bis {new Date(r.deadline).toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "short", timeStyle: "short" })}</span>}
                {r.state === "paid" ? <span className="block">{euro(r.paid)}</span> : r.state !== "invoice" ? <span className="block">Offen: {euro(r.open)}</span> : null}
              </span>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <Button variant="ghost"
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex w-full items-center justify-center gap-1.5 border-t border-border px-4 py-2.5 text-sm font-medium text-primary hover:bg-muted"
        >
          {expanded ? <>Weniger anzeigen <ChevronUp className="h-4 w-4" aria-hidden="true" /></> : <>Alle {pending.length} anzeigen (+{hidden} weitere) <ChevronDown className="h-4 w-4" aria-hidden="true" /></>}
        </Button>
      )}
    </section>}
    </div>
  );
}
