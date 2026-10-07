import { isRunningRental, isReturnOverdue } from "@/lib/inquiryStatus";
import { useRentalProtocolStatus } from "@/hooks/useRentalProtocolStatus";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CalendarCheck, CalendarX, AlertTriangle, Inbox, ListTodo, TrendingUp, Receipt, FileCheck2, Package, ShoppingCart, ChevronRight, LayoutGrid } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { cn } from "@/lib/utils";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { visibleGroups, itemHref } from "@/components/b2b/StaffNav";
import {
  formatEuro, isoDay, pipeline, receivables, revenueSummary,
  type InquiryInvoiceRow, type PortalInvoiceRow,
} from "@/lib/dashboardMetrics";
import { isOpenInquiry, isUnprocessedInquiry } from "@/lib/inquiryStatus";
import { needsAction, type PortalProfileLite } from "@/lib/customerActions";
import { UserCheck } from "lucide-react";
import { AdminGlobalSearch, type AdminSearchHit } from "@/components/b2b/admin/AdminGlobalSearch";
import { isInstallmentDue } from "@/lib/installments";
import { MaintenanceDueWidget } from "@/components/b2b/admin/MaintenanceDueWidget";
import { usePhoneCalls, isUrgentCall } from "@/hooks/usePhoneCalls";
import { PRIORITY_LABEL } from "@/lib/callPriority";
import { AcceptedOffersPayments } from "@/components/b2b/dashboard/AcceptedOffersPayments";

type ProfileRow = PortalProfileLite & { id: string; company_name: string; credit_limit: number };

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

/** Einheitlicher Rahmen für alle Bereiche der Startseite. */
function Panel({ title, icon: Icon, action, children, className }: { title: string; icon: LucideIcon; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-border bg-card", className)}>
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground"><Icon className="h-4 w-4 text-primary" aria-hidden="true" />{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

/** Kompakte Kennzahl mit Handlungsbedarf. */
function ActionStat({ label, value, to, icon: Icon, highlight }: { label: string; value: number; to: string; icon: LucideIcon; highlight?: boolean }) {
  return (
    <Link to={to} className={cn(
      "group flex min-w-0 items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-primary sm:p-4",
      highlight && value > 0 ? "border-accent" : "border-border",
    )}>
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", highlight && value > 0 ? "bg-accent text-accent-foreground" : "bg-muted text-primary")}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-2xl font-bold leading-none text-foreground">{value}</span>
        <span className="mt-1 block break-words text-xs leading-tight text-muted-foreground">{label}</span>
      </span>
    </Link>
  );
}

function MoneyRow({ label, value, hint, to, tone }: { label: string; value: string; hint?: string; to: string; tone?: "danger" }) {
  return (
    <Link to={to} className="flex items-baseline justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-muted">
      <span className="min-w-0">
        <span className="block text-sm text-foreground">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
      <span className={cn("shrink-0 text-base font-semibold tabular-nums", tone === "danger" ? "text-destructive" : "text-foreground")}>{value}</span>
    </Link>
  );
}

function DayList({ title, icon: Icon, rows, empty }: { title: string; icon: LucideIcon; rows: InquiryRow[]; empty: string }) {
  return (
    <div className="px-4 py-3">
      <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />{title}<span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[11px] text-foreground">{rows.length}</span>
      </p>
      {rows.length === 0 ? <p className="py-1 text-sm text-muted-foreground">{empty}</p> : (
        <ul className="-mx-2">
          {rows.map((r) => (
            <li key={r.id}>
              <Link to={`/b2b/mietanfragen?status=all&anfrage=${r.id}`} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                <span className="min-w-0 flex-1 truncate"><strong className="font-medium">{r.company_name || r.customer_name}</strong><span className="text-muted-foreground"> · {r.product_name}</span></span>
                <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">{LOCATION_LABEL[r.location ?? ""] ?? r.location}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function daysBetween(fromIso: string, toIso: string) {
  const a = new Date(`${fromIso}T00:00:00`).getTime();
  const b = new Date(`${toIso}T00:00:00`).getTime();
  return Math.max(1, Math.round((b - a) / 86400000));
}

/** Überfällige Rückgaben: Mietende vorbei, noch kein Rückgabeprotokoll. Visuell hervorgehoben. */
function OverdueReturns({ rows, today }: { rows: InquiryRow[]; today: string }) {
  if (!rows.length) return null;
  return (
    <div className="border-l-4 border-destructive bg-destructive/5 px-4 py-3" role="alert">
      <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-destructive">
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />Überfällige Rückgaben
        <span className="ml-auto rounded-full bg-destructive px-2 py-0.5 text-[11px] text-destructive-foreground">{rows.length}</span>
      </p>
      <p className="mb-2 text-xs text-foreground">Mietende überschritten – bitte Rückgabe klären und ein Rückgabeprotokoll erstellen.</p>
      <ul className="-mx-2">
        {rows.map((r) => {
          const days = daysBetween(r.end_date!.slice(0, 10), today);
          return (
            <li key={r.id}>
              <Link to={`/b2b/mietanfragen?status=all&anfrage=${r.id}`} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-destructive/10">
                <span className="min-w-0 flex-1 truncate"><strong className="font-medium">{r.company_name || r.customer_name}</strong><span className="text-muted-foreground"> · {r.product_name}</span></span>
                <span className="shrink-0 rounded-full bg-destructive px-2 py-0.5 text-[11px] font-medium text-destructive-foreground">{days} {days === 1 ? "Tag" : "Tage"} überfällig</span>
                <span className="hidden shrink-0 text-xs text-muted-foreground md:inline">Protokoll fehlt</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function StaffHome() {
  const { isStaff, isAdmin, canViewInventory, displayName, loading: accessLoading } = useStaffAccess();
  const [openSales, setOpenSales] = useState(0);
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [todos, setTodos] = useState<TodoRow[]>([]);
  const [invoices, setInvoices] = useState<InquiryInvoiceRow[]>([]);
  const [portalInvoices, setPortalInvoices] = useState<PortalInvoiceRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const protocols = useRentalProtocolStatus();
  const navigate = useNavigate();
  const [searchCustomers, setSearchCustomers] = useState<{ id: string; company_name: string; contact_first_name?: string; contact_last_name?: string; contact_email?: string; tax_id?: string | null; city?: string | null; b2b_profile_id: string | null }[]>([]);
  const [searchInvoices, setSearchInvoices] = useState<{ id: string; invoice_number: string; customer_company?: string | null; status: string }[]>([]);

  useEffect(() => {
    if (accessLoading || !isStaff) return;
    (async () => {
      const [crm, inv] = await Promise.all([
        supabase.from("crm_customers").select("id,company_name,first_name,last_name,email,vat_id,city,b2b_profile_id").order("created_at", { ascending: false }).limit(2000),
        isAdmin ? supabase.from("inquiry_invoices").select("id,invoice_number,company_name,customer_name,status").order("created_at", { ascending: false }).limit(2000) : Promise.resolve({ data: [] }),
      ]);
      setSearchCustomers(((crm.data ?? []) as any[]).map((c) => ({
        id: c.id, company_name: c.company_name || `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || c.email || "Kunde",
        contact_first_name: c.first_name ?? undefined, contact_last_name: c.last_name ?? undefined,
        contact_email: c.email ?? undefined, tax_id: c.vat_id, city: c.city, b2b_profile_id: c.b2b_profile_id,
      })));
      setSearchInvoices(((inv.data ?? []) as any[]).map((i) => ({
        id: i.id, invoice_number: i.invoice_number, customer_company: i.company_name || i.customer_name, status: i.status,
      })));
    })();
  }, [accessLoading, isStaff, isAdmin]);

  const onSearchSelect = (hit: AdminSearchHit) => {
    if (hit.type === "customer") {
      navigate(`/b2b/kundendaten?kunde=${encodeURIComponent(hit.id)}&aktion=bearbeiten`);
    } else if (hit.type === "invoice") navigate("/b2b/anfrage-rechnungen");
    else if (hit.type === "reservation") navigate(`/b2b/mietanfragen?status=all&anfrage=${hit.id}`);
  };

  useEffect(() => {
    if (accessLoading || !isStaff) return;
    (async () => {
      const [inq, td, inv, pinv, sales, prof] = await Promise.all([
        supabase.from("rental_inquiries").select("id,status,assigned_to,offer_total_gross,order_confirmed_at,start_date,end_date,customer_name,company_name,product_name,location"),
        supabase.from("staff_todo_lists").select("id,title,due_date,status,location").neq("status", "done"),
        isAdmin ? supabase.from("inquiry_invoices").select("invoice_kind,status,invoice_date,net_amount,gross_amount,paid_amount,credited_amount,due_date") : Promise.resolve({ data: [] }),
        isAdmin ? supabase.from("b2b_invoices").select("invoice_kind,status,invoice_date,net_amount,gross_amount,due_date") : Promise.resolve({ data: [] }),
        supabase.from("sales_inquiries").select("status"),
        supabase.from("b2b_profiles").select("id,company_name,status,credit_limit,credit_limit_requested_at,deletion_requested_at,created_at").order("created_at", { ascending: false }),
      ]);
      setProfiles((prof.data as ProfileRow[] | null) ?? []);
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
  const overdueReturns = inquiries
    .filter((r) => {
      const st = protocols.byInquiry.get(r.id);
      return !st?.ret && isReturnOverdue({ ...r, handed_over: !!st?.delivery }, today);
    })
    .sort((a, b) => (a.end_date ?? "").localeCompare(b.end_date ?? ""));
  const running = inquiries.filter((r) => isRunningRental({ ...r, handed_over: protocols.byInquiry.has(r.id) && !!protocols.byInquiry.get(r.id)?.delivery }, today)).length;
  const awaitingConfirmation = inquiries.filter((r) => r.status === "accepted" && !r.order_confirmed_at).length;
  const unprocessed = inquiries.filter(isUnprocessedInquiry).length;
  const customerRequests = profiles.flatMap((p) => ([
    needsAction(p, "freigabe") && { p, kind: "freigabe", label: "Freischaltung durchführen" },
    needsAction(p, "kreditlimit") && { p, kind: "kreditlimit", label: "Kreditlimit angefragt" },
    needsAction(p, "loeschung") && { p, kind: "loeschung", label: "Löschung beantragt" },
  ].filter(Boolean) as { p: ProfileRow; kind: string; label: string }[]));
  const dueTodos = todos.filter((t) => t.due_date && t.due_date.slice(0, 10) <= today);

  const monthName = now.toLocaleDateString("de-DE", { month: "long" });
  const firstName = displayName && !displayName.includes("@") ? displayName.split(" ")[0] : "";
  const greeting = now.getHours() < 11 ? "Guten Morgen" : now.getHours() < 18 ? "Hallo" : "Guten Abend";

  if (!accessLoading && !isStaff) {
    return <B2BPortalLayout title="Startseite"><p className="text-muted-foreground">Kein Zugriff auf diesen Bereich.</p></B2BPortalLayout>;
  }

  const groups = visibleGroups(isAdmin, canViewInventory);

  return (
    <B2BPortalLayout
      title={`${greeting}${firstName ? `, ${firstName}` : ""}`}
      subtitle={now.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
    >
      {loading ? <p className="text-muted-foreground">Wird geladen …</p> : (
        <div className="space-y-5">
          <AdminGlobalSearch
            customers={searchCustomers}
            invoices={searchInvoices}
            offers={[]}
            reservations={inquiries.map((r) => ({ id: r.id, product_name: `${r.company_name || r.customer_name || ""} · ${r.product_name ?? ""}`, status: r.status }))}
            onSelect={onSearchSelect}
          />
          {/* 1. Handlungsbedarf */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <ActionStat label="Neue Mietanfragen" value={unprocessed} to="/b2b/mietanfragen" icon={Inbox} highlight />
            <ActionStat label="Bestätigung offen" value={awaitingConfirmation} to="/b2b/mietanfragen?status=accepted" icon={FileCheck2} highlight />
            <ActionStat label="Laufende Mieten" value={running} to="/b2b/mietanfragen?status=running" icon={Package} />
            <ActionStat label="Verkaufsanfragen" value={openSales} to="/b2b/verkaufsanfragen" icon={ShoppingCart} />
          </div>

          <AcceptedOffersPayments />

          <UrgentCalls />

          {customerRequests.length > 0 && (
            <section className="rounded-xl border-2 border-accent bg-card" aria-label="Offene Kundenanfragen">
              <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <UserCheck className="h-4 w-4 text-accent" aria-hidden="true" />Offene Kundenanfragen
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">{customerRequests.length}</span>
                </h2>
                <Link to="/b2b/kundendaten?handlung=alle" className="text-xs font-medium text-primary hover:underline">Alle anzeigen</Link>
              </header>
              <ul className="divide-y divide-border">
                {customerRequests.slice(0, 8).map(({ p, kind, label }) => (
                  <li key={p.id + kind}>
                    <Link to={isAdmin ? `/b2b/kundendaten?handlung=alle&profil=${p.id}` : `/b2b/kundendaten?handlung=${kind}`} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted">
                      <span className="min-w-0 flex-1 truncate font-medium text-foreground">{p.company_name}</span>
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs", kind === "loeschung" ? "bg-destructive/10 text-destructive" : "bg-accent/15 text-foreground")}>{label}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {isAdmin && rec.overdueCount > 0 && (
            <Link to="/b2b/anfrage-rechnungen" className="flex items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <Receipt className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1">{rec.overdueCount} überfällige Rechnungen · {formatEuro(rec.overdue)}</span>
              <span className="hidden font-medium sm:inline">Prüfen</span><ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          )}

          {/* 2. Heute + Finanzen */}
          <div className={cn("grid gap-5 [&>*]:min-w-0", isAdmin && "lg:grid-cols-5")}>
            <Panel title="Heute" icon={CalendarCheck} className={cn(isAdmin && "lg:col-span-3")}>
              <div className="divide-y divide-border">
                <DayList title="Übergaben" icon={CalendarCheck} rows={pickups} empty="Keine Übergaben geplant." />
                <OverdueReturns rows={overdueReturns} today={today} />
                <DayList title="Rückgaben" icon={CalendarX} rows={returns} empty="Keine Rückgaben geplant." />
                <div className="px-4 py-3">
                  <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <ListTodo className="h-3.5 w-3.5" aria-hidden="true" />Fällige Aufgaben<span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[11px] text-foreground">{dueTodos.length}</span>
                  </p>
                  {dueTodos.length === 0 ? <p className="py-1 text-sm text-muted-foreground">Keine fälligen Aufgaben.</p> : (
                    <ul className="-mx-2">
                      {dueTodos.map((t) => (
                        <li key={t.id}>
                          <Link to="/b2b/aufgaben" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                            <span className="min-w-0 flex-1 truncate">{t.title}</span>
                            {t.due_date!.slice(0, 10) < today && <span className="flex shrink-0 items-center gap-1 text-xs text-destructive"><AlertTriangle className="h-3 w-3" aria-hidden="true" />überfällig</span>}
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Panel>

            {isAdmin && (
              <Panel title="Finanzen" icon={TrendingUp} className="lg:col-span-2">
                <p className="px-4 pt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Umsatz fakturiert · netto</p>
                <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4 lg:grid-cols-2 m-4 mt-2 overflow-hidden rounded-lg border border-border">
                  {[
                    ["Heute", rev.day], ["Woche", rev.week], [monthName, rev.month], [String(now.getFullYear()), rev.year],
                  ].map(([l, v]) => (
                    <Link key={String(l)} to="/b2b/anfrage-rechnungen" className="bg-card px-3 py-2.5 hover:bg-muted">
                      <span className="block text-xs capitalize text-muted-foreground">{l}</span>
                      <span className="block text-lg font-bold tabular-nums text-foreground">{formatEuro(Number(v))}</span>
                    </Link>
                  ))}
                </div>
                <p className="border-t border-border px-4 pt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Pipeline & Forderungen · brutto</p>
                <div className="py-1">
                  <MoneyRow label="Angebote offen" hint={`${pipe.offeredCount} gesendet`} value={formatEuro(pipe.offered)} to="/b2b/mietanfragen?status=offer_sent" />
                  <MoneyRow label="Beauftragt, nicht abgerechnet" hint={`${pipe.acceptedCount} Aufträge`} value={formatEuro(pipe.accepted)} to="/b2b/mietanfragen?status=accepted" />
                  <MoneyRow label="Offene Forderungen" value={formatEuro(rec.open)} to="/b2b/anfrage-rechnungen" />
                  <MoneyRow label="davon überfällig" hint={`${rec.overdueCount} Rechnungen`} value={formatEuro(rec.overdue)} to="/b2b/anfrage-rechnungen" tone={rec.overdue > 0 ? "danger" : undefined} />
                </div>
              </Panel>
            )}
          </div>

          <DueInstallments today={today} />

          {canViewInventory && <MaintenanceDueWidget />}

          {/* 3. Alle Funktionen */}
          <Panel title="Alle Funktionen" icon={LayoutGrid}>
            <div className="grid gap-x-6 gap-y-4 p-4 sm:grid-cols-2 lg:grid-cols-5">
              {groups.map((g) => (
                <div key={g.label}>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{g.label}</p>
                  <ul className="-mx-2">
                    {g.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={itemHref(item)}>
                          <Link to={itemHref(item)} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted">
                            <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /><span className="min-w-0 truncate">{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </B2BPortalLayout>
  );
}

/** Fällige Abschlagsrechnungen aus Miet- und Verkaufsaufträgen. */
function DueInstallments({ today }: { today: string }) {
  const [rows, setRows] = useState<{ id: string; kind: "rental" | "sales"; name: string; offer: string | null; due: string; amount: number | null }[]>([]);
  useEffect(() => {
    (async () => {
      const cols = "id,status,offer_number,company_name,installment_enabled,installment_next_due,installment_amount_net";
      const [r, s] = await Promise.all([
        supabase.from("rental_inquiries").select(`${cols},customer_name`).eq("installment_enabled", true).lte("installment_next_due", today),
        supabase.from("sales_inquiries").select(`${cols},first_name,last_name`).eq("installment_enabled", true).lte("installment_next_due", today),
      ]);
      const map = (kind: "rental" | "sales") => (x: any) => ({
        id: x.id, kind, offer: x.offer_number, due: x.installment_next_due, amount: x.installment_amount_net,
        name: x.company_name || x.customer_name || [x.first_name, x.last_name].filter(Boolean).join(" ") || "Kunde",
        ok: isInstallmentDue(x, today),
      });
      setRows([...(r.data ?? []).map(map("rental")), ...(s.data ?? []).map(map("sales"))].filter((x) => x.ok).sort((a, b) => a.due.localeCompare(b.due)));
    })();
  }, [today]);
  if (!rows.length) return null;
  return (
    <section className="rounded-xl border-2 border-accent/60 bg-card" aria-label="Fällige Abschlagsrechnungen">
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Fällige Abschlagsrechnungen <span className="ml-1 rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">{rows.length}</span></h2>
      </header>
      <ul className="divide-y divide-border">
        {rows.map((r) => (
          <li key={r.id}>
            <Link to={`/b2b/${r.kind === "rental" ? "mietanfragen" : "verkaufsanfragen"}?status=all&anfrage=${r.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm hover:bg-muted">
              <span className="min-w-0"><span className="font-medium">{r.name}</span> <span className="text-muted-foreground">· {r.kind === "rental" ? "Miete" : "Verkauf"} · Angebot {r.offer ?? "—"}</span></span>
              <span className="text-muted-foreground">fällig seit {new Date(r.due).toLocaleDateString("de-DE")}{r.amount ? ` · ${formatEuro(Number(r.amount))} netto` : ""}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function UrgentCalls() {
  const { rows } = usePhoneCalls();
  const urgent = rows.filter(isUrgentCall);
  if (!urgent.length) return null;
  return (
    <section className="rounded-xl border-2 border-destructive/60 bg-card" aria-label="Dringende Anrufe">
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Anrufe mit Handlungsbedarf <span className="ml-1 rounded-full bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">{urgent.length}</span></h2>
        <Link to="/b2b/anrufe" className="text-xs font-medium text-primary hover:underline">Alle anzeigen</Link>
      </header>
      <ul className="divide-y divide-border">
        {urgent.slice(0, 6).map((c) => (
          <li key={c.id}>
            <Link to="/b2b/anrufe" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted">
              <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold", c.priority === "sofort" ? "bg-destructive text-destructive-foreground" : "bg-accent text-accent-foreground")}>{c.priority ? PRIORITY_LABEL[c.priority] : ""}</span>
              <span className="min-w-0 flex-1 truncate text-foreground">{[c.company_name, c.customer_name].filter(Boolean).join(" · ") || c.caller_phone || "Unbekannt"}: {c.summary ?? ""}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
