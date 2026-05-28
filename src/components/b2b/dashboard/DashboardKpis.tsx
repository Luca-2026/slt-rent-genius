/**
 * Phase B1 — Customer dashboard KPI tiles + "Nächste Schritte" list.
 *
 * Pure read-only widget: fetches counts/sums via RLS-scoped Supabase queries.
 * Mounted at the top of the customer dashboard for at-a-glance overview.
 *
 * Data sources (all already protected by existing RLS):
 * - Aktive Mieten     → b2b_reservations  status=confirmed AND today ∈ [start_date, end_date]
 * - Anstehende Rückg. → b2b_reservations  status=confirmed AND end_date in next 7 days
 * - Offene Rechnungen → b2b_invoices      status ∈ (open, overdue)   → sum(gross_amount)
 * - Freies Kreditlim. → b2b_profiles      credit_limit - used_credit (from prop)
 *
 * "Nächste Schritte" surfaces the most urgent customer actions:
 *  - Angebote zu prüfen          (b2b_offers.status = sent)
 *  - Lieferschein zu unterschr.  (b2b_delivery_notes.status = pending_customer_signature)
 *  - Rückgabe zu unterschr.      (b2b_return_protocols.status = pending_customer_signature)
 *  - Überfällige Rechnungen      (b2b_invoices.status = overdue)
 */
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Package,
  Receipt,
  Wallet,
  Undo2,
  FileText,
  ClipboardCheck,
  AlertCircle,
  ArrowRight,
  Send,
} from "lucide-react";

interface DashboardKpisProps {
  profileId: string;
  creditLimit: number;
  usedCredit: number;
}

interface Kpis {
  activeRentals: number;
  upcomingReturns: number;
  openInvoicesAmount: number;
  openInvoicesCount: number;
  pendingOffers: number;
  pendingDeliveryNotes: number;
  pendingReturnProtocols: number;
  overdueInvoices: number;
}

const EMPTY: Kpis = {
  activeRentals: 0,
  upcomingReturns: 0,
  openInvoicesAmount: 0,
  openInvoicesCount: 0,
  pendingOffers: 0,
  pendingDeliveryNotes: 0,
  pendingReturnProtocols: 0,
  overdueInvoices: 0,
};

function formatEuro(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function DashboardKpis({ profileId, creditLimit, usedCredit }: DashboardKpisProps) {
  const [kpis, setKpis] = useState<Kpis>(EMPTY);
  const [loading, setLoading] = useState(true);

  const fetchKpis = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    const today = toIsoDate(new Date());
    const in7days = toIsoDate(new Date(Date.now() + 7 * 86_400_000));

    const [
      activeRes,
      upcomingRes,
      openInvRes,
      overdueInvRes,
      offersRes,
      dnRes,
      rpRes,
    ] = await Promise.all([
      supabase
        .from("b2b_reservations")
        .select("id", { count: "exact", head: true })
        .eq("b2b_profile_id", profileId)
        .eq("status", "confirmed")
        .lte("start_date", today)
        .gte("end_date", today),
      supabase
        .from("b2b_reservations")
        .select("id", { count: "exact", head: true })
        .eq("b2b_profile_id", profileId)
        .eq("status", "confirmed")
        .gte("end_date", today)
        .lte("end_date", in7days),
      supabase
        .from("b2b_invoices")
        .select("gross_amount", { count: "exact" })
        .eq("b2b_profile_id", profileId)
        .in("status", ["open", "overdue"]),
      supabase
        .from("b2b_invoices")
        .select("id", { count: "exact", head: true })
        .eq("b2b_profile_id", profileId)
        .eq("status", "overdue"),
      supabase
        .from("b2b_offers")
        .select("id", { count: "exact", head: true })
        .eq("b2b_profile_id", profileId)
        .eq("status", "sent"),
      supabase
        .from("b2b_delivery_notes")
        .select("id", { count: "exact", head: true })
        .eq("b2b_profile_id", profileId)
        .eq("status", "pending_customer_signature"),
      supabase
        .from("b2b_return_protocols")
        .select("id", { count: "exact", head: true })
        .eq("b2b_profile_id", profileId)
        .eq("status", "pending_customer_signature"),
    ]);

    const openInvoicesAmount =
      openInvRes.data?.reduce((sum, row: { gross_amount: number | null }) => sum + (row.gross_amount ?? 0), 0) ?? 0;

    setKpis({
      activeRentals: activeRes.count ?? 0,
      upcomingReturns: upcomingRes.count ?? 0,
      openInvoicesAmount,
      openInvoicesCount: openInvRes.count ?? 0,
      overdueInvoices: overdueInvRes.count ?? 0,
      pendingOffers: offersRes.count ?? 0,
      pendingDeliveryNotes: dnRes.count ?? 0,
      pendingReturnProtocols: rpRes.count ?? 0,
    });
    setLoading(false);
  }, [profileId]);

  useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);

  const freeCredit = Math.max(creditLimit - usedCredit, 0);

  const tiles = [
    {
      key: "active",
      label: "Aktive Mieten",
      value: kpis.activeRentals.toString(),
      icon: Package,
      to: "/b2b/mietvorgaenge?status=confirmed",
      accent: "text-primary",
      bg: "bg-primary/10",
    },
    {
      key: "returns",
      label: "Rückgaben in 7 Tagen",
      value: kpis.upcomingReturns.toString(),
      icon: Undo2,
      to: "/b2b/mietvorgaenge?status=confirmed",
      accent: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      key: "invoices",
      label: "Offene Rechnungen",
      value: formatEuro(kpis.openInvoicesAmount),
      sub:
        kpis.openInvoicesCount > 0
          ? `${kpis.openInvoicesCount} ${kpis.openInvoicesCount === 1 ? "Rechnung" : "Rechnungen"}`
          : "Keine offen",
      icon: Receipt,
      to: "/b2b/rechnungen",
      accent: kpis.overdueInvoices > 0 ? "text-destructive" : "text-accent",
      bg: kpis.overdueInvoices > 0 ? "bg-destructive/10" : "bg-accent/10",
    },
    {
      key: "credit",
      label: "Freies Kreditlimit",
      value: creditLimit > 0 ? formatEuro(freeCredit) : "—",
      sub:
        creditLimit > 0
          ? `${formatEuro(usedCredit)} von ${formatEuro(creditLimit)} genutzt`
          : "Kein Limit hinterlegt",
      icon: Wallet,
      to: undefined,
      accent: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  const nextSteps: Array<{
    key: string;
    icon: typeof FileText;
    label: string;
    to: string;
    variant?: "destructive";
  }> = [];

  if (kpis.pendingOffers > 0) {
    nextSteps.push({
      key: "offers",
      icon: Send,
      label: `${kpis.pendingOffers} ${kpis.pendingOffers === 1 ? "Angebot prüfen" : "Angebote prüfen"}`,
      to: "/b2b/angebote",
    });
  }
  if (kpis.pendingDeliveryNotes > 0) {
    nextSteps.push({
      key: "dn",
      icon: ClipboardCheck,
      label: `${kpis.pendingDeliveryNotes} ${
        kpis.pendingDeliveryNotes === 1 ? "Übergabeprotokoll" : "Übergabeprotokolle"
      } unterschreiben`,
      to: "/b2b/uebergabeprotokolle",
    });
  }
  if (kpis.pendingReturnProtocols > 0) {
    nextSteps.push({
      key: "rp",
      icon: Undo2,
      label: `${kpis.pendingReturnProtocols} ${
        kpis.pendingReturnProtocols === 1 ? "Rückgabeprotokoll" : "Rückgabeprotokolle"
      } unterschreiben`,
      to: "/b2b/rueckgabeprotokolle",
    });
  }
  if (kpis.overdueInvoices > 0) {
    nextSteps.push({
      key: "overdue",
      icon: AlertCircle,
      label: `${kpis.overdueInvoices} ${
        kpis.overdueInvoices === 1 ? "überfällige Rechnung" : "überfällige Rechnungen"
      } begleichen`,
      to: "/b2b/rechnungen",
      variant: "destructive",
    });
  }

  return (
    <div className="mb-8 space-y-4">
      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          const inner = (
            <Card
              className={`h-full ${tile.to ? "hover:shadow-md transition-shadow cursor-pointer" : ""}`}
            >
              <CardContent className="p-4 lg:p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tile.bg}`}>
                    <Icon className={`h-4 w-4 ${tile.accent}`} />
                  </div>
                  {tile.to && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-medium leading-tight mb-1">
                  {tile.label}
                </p>
                <p className={`text-xl lg:text-2xl font-bold ${tile.accent} leading-none`}>
                  {loading ? "…" : tile.value}
                </p>
                {tile.sub && (
                  <p className="text-xs text-muted-foreground mt-1 leading-tight">{tile.sub}</p>
                )}
              </CardContent>
            </Card>
          );
          return tile.to ? (
            <Link key={tile.key} to={tile.to} className="block h-full">
              {inner}
            </Link>
          ) : (
            <div key={tile.key} className="h-full">
              {inner}
            </div>
          );
        })}
      </div>

      {/* Nächste Schritte */}
      {!loading && nextSteps.length > 0 && (
        <Card>
          <CardContent className="p-4 lg:p-5">
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-accent" />
              Nächste Schritte
            </h2>
            <ul className="space-y-2">
              {nextSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <li key={step.key}>
                    <Link
                      to={step.to}
                      className={`flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40 ${
                        step.variant === "destructive"
                          ? "border-destructive/30 bg-destructive/5"
                          : "border-border"
                      }`}
                    >
                      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            step.variant === "destructive" ? "text-destructive" : "text-primary"
                          }`}
                        />
                        {step.label}
                      </span>
                      <Button
                        size="sm"
                        variant={step.variant === "destructive" ? "destructive" : "outline"}
                        className="shrink-0"
                        asChild
                      >
                        <span>
                          Öffnen
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </Button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
