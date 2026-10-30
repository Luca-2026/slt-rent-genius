import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, ChevronRight } from "lucide-react";
import { crmCustomerLabel, type CrmCustomer } from "@/hooks/useCrmCustomers";
import { inquiryStatusLabel } from "@/lib/inquiryStatus";
import { countsAsRevenue } from "@/lib/dashboardMetrics";
import { CustomerCreditSummary } from "./CustomerCreditSummary";

type Inq = { id: string; table: "rental" | "sales"; created_at: string; status: string; offer_number: string | null; offer_sent_at: string | null; offer_total_gross: number | null; order_code?: string | null };
type Inv = { id: string; invoice_number: string | null; invoice_date: string | null; invoice_kind: string | null; status: string; net_amount: number | null; gross_amount: number | null };

const euro = (n: number) => n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
const day = (d: string | null) => (d ? new Date(d).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" }) : "—");

interface Props {
  customer: CrmCustomer | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onEdit: (c: CrmCustomer) => void;
  /** Umsatz nur für Admins (Rollenrecht Umsatzauswertung). */
  showRevenue: boolean;
}

/** Kundenübersicht aus der Kundenkartei: Anfragen, Angebote, Rechnungen, Umsatz – für alle Kunden, nicht nur B2B-Portal. */
export function CustomerOverviewDialog({ customer, open, onOpenChange, onEdit, showRevenue }: Props) {
  const [inqs, setInqs] = useState<Inq[]>([]);
  const [invs, setInvs] = useState<Inv[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || !customer) return;
    let active = true;
    setLoading(true); setError(false);
    (async () => {
      const cols = "id, created_at, status, offer_number, offer_sent_at, offer_total_gross, order_code";
      const [r, s, i] = await Promise.all([
        supabase.from("rental_inquiries").select(cols).eq("crm_customer_id", customer.id).order("created_at", { ascending: false }),
        supabase.from("sales_inquiries").select("id, created_at, status, offer_number, offer_sent_at, offer_total_gross").eq("crm_customer_id", customer.id).order("created_at", { ascending: false }),
        supabase.from("inquiry_invoices").select("id, invoice_number, invoice_date, invoice_kind, status, net_amount, gross_amount").eq("crm_customer_id", customer.id).order("invoice_date", { ascending: false }),
      ]);
      if (!active) return;
      if (r.error || s.error || i.error) { setError(true); setLoading(false); return; }
      setInqs([
        ...((r.data ?? []) as Omit<Inq, "table">[]).map((x) => ({ ...x, table: "rental" as const })),
        ...((s.data ?? []) as Omit<Inq, "table">[]).map((x) => ({ ...x, table: "sales" as const })),
      ].sort((a, b) => b.created_at.localeCompare(a.created_at)));
      setInvs((i.data ?? []) as Inv[]);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [open, customer]);

  if (!customer) return null;
  const offers = inqs.filter((q) => q.offer_number);
  const revenue = invs.filter((v) => countsAsRevenue(v, false)).reduce((s, v) => s + (Number(v.net_amount) || 0), 0);
  const link = (q: Inq) => (q.table === "rental" ? `/b2b/mietanfragen/${q.id}` : `/b2b/verkaufsanfragen?anfrage=${q.id}`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="break-words pr-6">{crmCustomerLabel(customer)}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-wrap items-start justify-between gap-3 text-sm text-muted-foreground">
          <div className="min-w-0 space-y-0.5 break-words">
            {customer.company_name && (customer.first_name || customer.last_name) && <div>{[customer.first_name, customer.last_name].filter(Boolean).join(" ")}</div>}
            {customer.email && <div className="break-all">{customer.email}</div>}
            {customer.phone && <div>{customer.phone}</div>}
            {(customer.street || customer.city) && <div>{[customer.street, [customer.postal_code, customer.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}</div>}
          </div>
          <Button size="sm" variant="outline" onClick={() => onEdit(customer)}><Pencil className="h-3.5 w-3.5 mr-1" /> Bearbeiten</Button>
        </div>

        <CustomerCreditSummary key={customer.id} customer={customer} />

        {error ? <p role="alert" className="text-sm text-destructive">Kundendaten konnten nicht geladen werden.</p> : loading ? <p className="text-sm text-muted-foreground">Wird geladen …</p> : (
          <div className="space-y-5">
            <div className={`grid gap-3 ${showRevenue ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
              <Kpi label="Anfragen" value={String(inqs.length)} />
              <Kpi label="Angebote" value={String(offers.length)} />
              <Kpi label="Rechnungen" value={String(invs.filter((v) => v.status !== "draft").length)} />
              {showRevenue && <Kpi label="Umsatz netto" value={euro(revenue)} />}
            </div>

            <section>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Angebote und Anfragen</h3>
              {inqs.length === 0 ? <p className="text-sm text-muted-foreground">Noch keine Anfragen.</p> : (
                <ul className="divide-y divide-border rounded-md border border-border">
                  {inqs.map((q) => (
                    <li key={q.table + q.id}>
                      <Link to={link(q)} onClick={() => onOpenChange(false)} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5 text-sm hover:bg-muted">
                        <div className="min-w-[14rem] flex-1">
                          <div className="break-words font-medium text-foreground">
                            {q.offer_number || "Anfrage ohne Angebot"}{q.order_code ? ` · #${q.order_code}` : ""}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {q.table === "rental" ? "Miete" : "Verkauf"} · angefragt {day(q.created_at)}{q.offer_sent_at ? ` · Angebot ${day(q.offer_sent_at)}` : ""}
                          </div>
                        </div>
                        {q.offer_total_gross != null && q.offer_number && <span className="shrink-0 text-sm text-foreground">{euro(Number(q.offer_total_gross))}</span>}
                        <Badge variant="outline" className="shrink-0">{inquiryStatusLabel(q.status)}</Badge>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {invs.length > 0 && (
              <section>
                <h3 className="mb-2 text-sm font-semibold text-foreground">Rechnungen und Gutschriften</h3>
                <ul className="divide-y divide-border rounded-md border border-border">
                  {invs.map((v) => (
                    <li key={v.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                      <div className="min-w-0 flex-1">
                        <div className="break-words font-medium text-foreground">{v.invoice_number || "Entwurf"}</div>
                        <div className="text-xs text-muted-foreground">{day(v.invoice_date)} · {v.invoice_kind === "credit_note" ? "Gutschrift" : ({ open: "offen", paid: "bezahlt", overdue: "überfällig", cancelled: "storniert", draft: "Entwurf" } as Record<string, string>)[v.status] ?? v.status}</div>
                      </div>
                      <span className="shrink-0 text-foreground">{euro(Number(v.gross_amount) || 0)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}
