import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, CalendarX, AlertTriangle, Inbox, ListTodo, TrendingUp, Wallet, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { visibleGroups, itemHref } from "@/components/b2b/StaffNav";
import {
  formatEuro, isoDay, pipeline, receivables, revenueSummary,
  type InquiryInvoiceRow, type PortalInvoiceRow,
} from "@/lib/dashboardMetrics";
import { isOpenInquiry, isUnprocessedInquiry } from "@/lib/inquiryStatus";

interface InquiryRow {
  id: string;
  status: string;
  assigned_to: string | null;
  offer_total_gross: number | null;
  order_confirmed_at: string | null;
  start_date: string | null;
  end_date: string | null;
  customer_name: string | null;
  company_name: string | null;
  product_name: string | null;
  location: string | null;
}
interface TodoRow { id: string; title: string; due_date: string | null; status: string; location: string | null }

const LOCATION_LABEL: Record<string, string> = { krefeld: "Krefeld", bonn: "Bonn", muelheim: "Mülheim an der Ruhr" };

function Kpi({ label, value, hint, to }: { label: string; value: string; hint?: string; to?: string }) {
  const body = (
    <Card className="h-full transition-colors hover:border-primary">
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
  return to ? <Link to={to} className="block h-full">{body}</Link> : body;
}

function TodayList({ title, icon: Icon, rows, empty }: { title: string; icon: typeof Inbox; rows: InquiryRow[]; empty: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base"><Icon className="h-4 w-4 text-primary" /> {title} <span className="text-muted-foreground font-normal">({rows.length})</span></CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {rows.length === 0 ? <p className="text-sm text-muted-foreground">{empty}</p> : rows.map((r) => (
          <Link key={r.id} to={`/b2b/mietanfragen?status=all&anfrage=${r.id}`} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
            <span className="min-w-0 truncate"><strong>{r.company_name || r.customer_name}</strong> · {r.product_name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{LOCATION_LABEL[r.location ?? ""] ?? r.location}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

export default function StaffHome() {
  const { isStaff, isAdmin, canViewInventory, displayName, loading: accessLoading } = useStaffAccess();
  const [openSales, setOpenSales] = useState(0);
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [todos, setTodos] = useState<TodoRow[]>([]);
  const [invoices, setInvoices] = useState<InquiryInvoiceRow[]>([]);
  const [portalInvoices, setPortalInvoices] = useState<PortalInvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accessLoading || !isStaff) return;
    (async () => {
      const [inq, td, inv, pinv, sales] = await Promise.all([
        supabase.from("rental_inquiries").select("id,status,assigned_to,offer_total_gross,order_confirmed_at,start_date,end_date,customer_name,company_name,product_name,location"),
        supabase.from("staff_todo_lists").select("id,title,due_date,status,location").neq("status", "done"),
        isAdmin ? supabase.from("inquiry_invoices").select("invoice_kind,status,invoice_date,net_amount,gross_amount,paid_amount,credited_amount,due_date") : Promise.resolve({ data: [] }),
        isAdmin ? supabase.from("b2b_invoices").select("status,invoice_date,net_amount,gross_amount,due_date") : Promise.resolve({ data: [] }),
        supabase.from("sales_inquiries").select("status"),
      ]);
      setOpenSales(((sales.data as { status: string }[] | null) ?? []).filter((r) => isOpenInquiry(r.status)).length);
      setInquiries((inq.data as InquiryRow[] | null) ?? []);
      setTodos((td.data as TodoRow[] | null) ?? []);
      setInvoices((inv.data as InquiryInvoiceRow[] | null) ?? []);
      setPortalInvoices((pinv.data as PortalInvoiceRow[] | null) ?? []);
      setLoading(false);
    })();
  }, [accessLoading, isStaff, isAdmin]);

  const now = useMemo(() => new Date(), []);
  const today = isoDay(now);
  const rev = useMemo(() => revenueSummary(invoices, portalInvoices, now), [invoices, portalInvoices, now]);
  const rec = useMemo(() => receivables(invoices, portalInvoices, now), [invoices, portalInvoices, now]);
  const pipe = useMemo(() => pipeline(inquiries), [inquiries]);

  const active = inquiries.filter((r) => r.status === "accepted" || r.status === "done");
  const pickups = active.filter((r) => r.status === "accepted" && r.start_date?.slice(0, 10) === today);
  const returns = active.filter((r) => r.end_date?.slice(0, 10) === today);
  const running = inquiries.filter((r) => r.status === "accepted" && r.order_confirmed_at).length;
  const awaitingConfirmation = inquiries.filter((r) => r.status === "accepted" && !r.order_confirmed_at).length;
  const unprocessed = inquiries.filter(isUnprocessedInquiry).length;
  const dueTodos = todos.filter((t) => t.due_date && t.due_date.slice(0, 10) <= today);

  const monthName = now.toLocaleDateString("de-DE", { month: "long" });
  const greeting = now.getHours() < 11 ? "Guten Morgen" : now.getHours() < 18 ? "Hallo" : "Guten Abend";

  if (!accessLoading && !isStaff) {
    return <B2BPortalLayout title="Startseite"><p className="text-muted-foreground">Kein Zugriff auf diesen Bereich.</p></B2BPortalLayout>;
  }

  return (
    <B2BPortalLayout
      title={`${greeting}${displayName ? `, ${displayName.split(" ")[0]}` : ""}`}
      subtitle={now.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
    >
      {loading ? <p className="text-muted-foreground">Wird geladen …</p> : (
        <div className="space-y-8">
          {isAdmin && (
            <section aria-labelledby="umsatz">
              <h2 id="umsatz" className="mb-3 flex items-center gap-2 text-lg font-semibold"><TrendingUp className="h-5 w-5 text-primary" /> Umsatz (fakturiert, netto)</h2>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Kpi label="Heute" value={formatEuro(rev.day)} to="/b2b/anfrage-rechnungen" />
                <Kpi label="Diese Woche" value={formatEuro(rev.week)} hint="ab Montag" to="/b2b/anfrage-rechnungen" />
                <Kpi label={`Monat ${monthName}`} value={formatEuro(rev.month)} to="/b2b/anfrage-rechnungen" />
                <Kpi label={`Jahr ${now.getFullYear()}`} value={formatEuro(rev.year)} to="/b2b/anfrage-rechnungen" />
              </div>
              <h2 className="mb-3 mt-6 flex items-center gap-2 text-lg font-semibold"><Wallet className="h-5 w-5 text-primary" /> Pipeline & offene Posten (brutto)</h2>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Kpi label="Angebote offen" value={formatEuro(pipe.offered)} hint={`${pipe.offeredCount} gesendete Angebote`} to="/b2b/mietanfragen?status=offer_sent" />
                <Kpi label="Beauftragt, nicht abgerechnet" value={formatEuro(pipe.accepted)} hint={`${pipe.acceptedCount} angenommene Aufträge`} to="/b2b/mietanfragen?status=running" />
                <Kpi label="Offene Forderungen" value={formatEuro(rec.open)} hint="Rechnungen minus Zahlungen" to="/b2b/anfrage-rechnungen" />
                <Kpi label="Davon überfällig" value={formatEuro(rec.overdue)} hint={`${rec.overdueCount} Rechnungen`} to="/b2b/anfrage-rechnungen" />
              </div>
            </section>
          )}

          <section aria-labelledby="heute">
            <h2 id="heute" className="mb-3 flex items-center gap-2 text-lg font-semibold"><CalendarCheck className="h-5 w-5 text-primary" /> Heute wichtig</h2>
            <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Kpi label="Offene Mietanfragen" value={String(unprocessed)} hint="noch nicht übernommen" to="/b2b/mietanfragen" />
              <Kpi label="Auftragsbestätigung offen" value={String(awaitingConfirmation)} hint="angenommen, Zahlung prüfen" to="/b2b/mietanfragen?status=accepted" />
              <Kpi label="Laufende Mietvorgänge" value={String(running)} to="/b2b/mietanfragen?status=running" />
              <Kpi label="Offene Verkaufsanfragen" value={String(openSales)} to="/b2b/verkaufsanfragen" />
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              <TodayList title="Übergaben heute" icon={CalendarCheck} rows={pickups} empty="Keine Übergaben heute." />
              <TodayList title="Rückgaben heute" icon={CalendarX} rows={returns} empty="Keine Rückgaben heute." />
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base"><ListTodo className="h-4 w-4 text-primary" /> Fällige Aufgaben <span className="text-muted-foreground font-normal">({dueTodos.length})</span></CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {dueTodos.length === 0 ? <p className="text-sm text-muted-foreground">Keine fälligen Aufgaben.</p> : dueTodos.map((t) => (
                    <Link key={t.id} to="/b2b/aufgaben" className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                      <span className="min-w-0 truncate">{t.title}</span>
                      {t.due_date!.slice(0, 10) < today && <span className="flex shrink-0 items-center gap-1 text-xs text-destructive"><AlertTriangle className="h-3 w-3" /> überfällig</span>}
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
            {isAdmin && rec.overdueCount > 0 && (
              <Link to="/b2b/anfrage-rechnungen" className="mt-3 flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                <Receipt className="h-4 w-4" /> {rec.overdueCount} überfällige Rechnungen über {formatEuro(rec.overdue)} – jetzt prüfen <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            )}
          </section>

          <section aria-labelledby="funktionen">
            <h2 id="funktionen" className="mb-3 text-lg font-semibold">Alle Funktionen</h2>
            <div className="space-y-5">
              {visibleGroups(isAdmin, canViewInventory).map((g) => (
                <div key={g.label}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    {g.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link key={itemHref(item)} to={itemHref(item)} className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm font-medium transition-colors hover:border-primary hover:bg-muted">
                          <Icon className="h-4 w-4 shrink-0 text-primary" /> <span className="min-w-0 truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </B2BPortalLayout>
  );
}
