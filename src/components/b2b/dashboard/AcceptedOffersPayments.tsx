import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { isAwaitingOfferConfirmation } from "@/lib/dashboardMetrics";

type Row = {
  inquiryId: string;
  table: string;
  offer: string;
  acceptedAt: string | null;
  signer: string | null;
  customer: string;
  state: "paid" | "partial" | "checkout" | "open" | "invoice";
  paid: number;
  open: number;
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
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const cols = "id, status, offer_number, offer_sent_at, payments, offer_total_gross, offer_payload, order_confirmed_at, customer_name, company_name";
      const [rent, sale] = await Promise.all([
        supabase.from("rental_inquiries").select(cols).eq("status", "accepted").is("order_confirmed_at", null),
        supabase.from("sales_inquiries").select("id, status, offer_number, offer_sent_at, payments, offer_total_gross, offer_payload, order_confirmed_at, first_name, last_name, company_name").eq("status", "accepted").is("order_confirmed_at", null),
      ]);
      if (rent.error || sale.error) { if (active) setError(true); return; }
      const list = [
        ...(rent.data ?? []).map((i) => ({ ...i, table: "rental_inquiries" })),
        ...(sale.data ?? []).map((i) => ({ ...i, table: "sales_inquiries" })),
      ].filter(isAwaitingOfferConfirmation);
      if (!list.length) { if (active) { setRows([]); setError(false); } return; }
      const ids = list.map((i) => i.id);
      const [acc, links] = await Promise.all([
        supabase.from("offer_acceptance_links").select("inquiry_id, offer_number, accepted_at, signer_name").eq("status", "accepted").in("inquiry_id", ids).order("accepted_at", { ascending: false }),
        supabase.from("offer_payment_links").select("inquiry_id, offer_number, status, stripe_session_id").in("inquiry_id", ids),
      ]);
      if (acc.error || links.error) { if (active) setError(true); return; }
      const out: Row[] = [];
      for (const i of list) {
        const a = acc.data?.find((a) => a.inquiry_id === i.id && a.offer_number === i.offer_number);
        const payload = (i.offer_payload ?? {}) as { deposit?: unknown; payment_terms?: string };
        const total = (Number(i.offer_total_gross) || 0) + (Number(payload.deposit) || 0);
        const paid = (Array.isArray(i.payments) ? i.payments : []).reduce((s: number, p: any) => s + (Number(p?.amount) || 0), 0);
        const open = Math.max(0, Math.round((total - paid) * 100) / 100);
        const link = (links.data ?? []).find((l) => l.inquiry_id === i.id && l.offer_number === i.offer_number);
        const state: Row["state"] = open <= 0 ? "paid"
          : INVOICE_TERMS.has(payload.payment_terms ?? "") ? "invoice"
          : paid > 0 ? "partial"
          : link?.stripe_session_id ? "checkout" : "open";
        out.push({
          inquiryId: i.id, table: i.table, offer: i.offer_number ?? "", acceptedAt: a?.accepted_at ?? null,
          signer: a?.signer_name ?? null, customer: i.company_name || ("customer_name" in i ? i.customer_name : [i.first_name, i.last_name].filter(Boolean).join(" ")) || "",
          state, paid, open,
        });
      }
      out.sort((a, b) => (b.acceptedAt ?? list.find((i) => i.id === b.inquiryId)?.offer_sent_at ?? "").localeCompare(a.acceptedAt ?? list.find((i) => i.id === a.inquiryId)?.offer_sent_at ?? ""));
      if (active) { setRows(out); setError(false); }
    };
    load();
    const ch = supabase
      .channel("accepted-offers-home")
      .on("postgres_changes", { event: "*", schema: "public", table: "offer_acceptance_links" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "rental_inquiries" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "sales_inquiries" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "offer_payment_links" }, load)
      .subscribe();
    return () => { active = false; supabase.removeChannel(ch); };
  }, []);

  if (error) return <p role="alert" className="text-sm text-destructive">Angenommene Angebote konnten nicht aktualisiert werden. Bitte lade die Seite erneut.</p>;
  if (!rows.length) return null;
  return (
    <section className="rounded-xl border-2 border-primary bg-card" aria-label="Angenommene Angebote">
      <header className="flex items-center gap-2 border-b border-border px-4 py-3">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <h2 className="min-w-0 flex-1 text-sm font-semibold text-foreground">Angenommene Angebote · Zahlungseingang</h2>
        <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{rows.length}</span>
      </header>
      <ul className="divide-y divide-border">
        {rows.map((r) => (
          <li key={r.inquiryId + r.offer}>
            <Link
              to={r.table === "sales_inquiries" ? `/b2b/verkaufsanfragen?anfrage=${r.inquiryId}` : `/b2b/mietanfragen?status=all&anfrage=${r.inquiryId}`}
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
                {r.state === "paid" ? <span className="block">{euro(r.paid)}</span> : r.state !== "invoice" ? <span className="block">Offen: {euro(r.open)}</span> : null}
              </span>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
