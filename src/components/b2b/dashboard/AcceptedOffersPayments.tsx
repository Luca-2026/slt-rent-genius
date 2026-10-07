import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type Row = {
  inquiryId: string;
  table: string;
  offer: string;
  acceptedAt: string;
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

/** Angenommene Angebote (letzte 30 Tage, noch ohne Auftragsbestätigung) mit Zahlungsstatus. */
export function AcceptedOffersPayments() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const { data: acc } = await supabase
        .from("offer_acceptance_links")
        .select("inquiry_id, inquiry_table, offer_number, accepted_at, signer_name")
        .eq("status", "accepted")
        .gte("accepted_at", since)
        .order("accepted_at", { ascending: false });
      const list = acc ?? [];
      if (!list.length) { if (active) setRows([]); return; }
      const ids = list.map((a) => a.inquiry_id);
      const cols = "id, payments, offer_total_gross, offer_payload, order_confirmed_at, customer_name, company_name";
      const [rent, sale, links] = await Promise.all([
        supabase.from("rental_inquiries").select(cols).in("id", ids),
        supabase.from("sales_inquiries").select("id, payments, offer_total_gross, offer_payload, order_confirmed_at, first_name, last_name, company_name").in("id", ids),
        supabase.from("offer_payment_links").select("inquiry_id, offer_number, status, stripe_session_id").in("inquiry_id", ids),
      ]);
      const inq = new Map<string, any>();
      for (const r of [...(rent.data ?? []), ...(sale.data ?? [])] as any[]) inq.set(r.id, r);
      const out: Row[] = [];
      for (const a of list) {
        const i = inq.get(a.inquiry_id);
        if (!i || i.order_confirmed_at) continue;
        const payload = (i.offer_payload ?? {}) as { deposit?: unknown; payment_terms?: string };
        const total = (Number(i.offer_total_gross) || 0) + (Number(payload.deposit) || 0);
        const paid = (Array.isArray(i.payments) ? i.payments : []).reduce((s: number, p: any) => s + (Number(p?.amount) || 0), 0);
        const open = Math.max(0, Math.round((total - paid) * 100) / 100);
        const link = (links.data ?? []).find((l) => l.inquiry_id === a.inquiry_id && l.offer_number === a.offer_number);
        const state: Row["state"] = open <= 0 ? "paid"
          : INVOICE_TERMS.has(payload.payment_terms ?? "") ? "invoice"
          : paid > 0 ? "partial"
          : link?.stripe_session_id ? "checkout" : "open";
        out.push({
          inquiryId: a.inquiry_id, table: a.inquiry_table, offer: a.offer_number, acceptedAt: a.accepted_at!,
          signer: a.signer_name, customer: i.company_name || i.customer_name || [i.first_name, i.last_name].filter(Boolean).join(" "),
          state, paid, open,
        });
      }
      if (active) setRows(out);
    };
    load();
    const ch = supabase
      .channel("accepted-offers-home")
      .on("postgres_changes", { event: "*", schema: "public", table: "offer_acceptance_links" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "rental_inquiries" }, load)
      .subscribe();
    return () => { active = false; supabase.removeChannel(ch); };
  }, []);

  if (!rows.length) return null;
  return (
    <section className="rounded-xl border-2 border-primary bg-card" aria-label="Angenommene Angebote">
      <header className="flex items-center gap-2 border-b border-border px-4 py-3">
        <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-foreground">Angenommene Angebote · Zahlungseingang</h2>
        <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{rows.length}</span>
      </header>
      <ul className="divide-y divide-border">
        {rows.map((r) => (
          <li key={r.inquiryId + r.offer}>
            <Link
              to={r.table === "sales_inquiries" ? `/b2b/verkaufsanfragen?anfrage=${r.inquiryId}` : `/b2b/mietanfragen?status=all&anfrage=${r.inquiryId}`}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm hover:bg-muted"
            >
              <span className="min-w-0 flex-1 truncate">
                <strong className="font-medium text-foreground">{r.customer}</strong>
                <span className="text-muted-foreground"> · {r.offer} · angenommen {new Date(r.acceptedAt).toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "short", timeStyle: "short" })}{r.signer ? ` von ${r.signer}` : ""}</span>
              </span>
              <span className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                r.state === "paid" ? "bg-primary text-primary-foreground"
                  : r.state === "invoice" ? "bg-muted text-foreground"
                  : "bg-accent/15 text-foreground",
              )}>
                {LABEL[r.state]}{r.state === "paid" ? ` · ${euro(r.paid)}` : r.state !== "invoice" ? ` · offen ${euro(r.open)}` : ""}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
