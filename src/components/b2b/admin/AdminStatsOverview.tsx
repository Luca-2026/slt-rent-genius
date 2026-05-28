/**
 * Phase B2 — Admin dashboard KPI overview.
 *
 * 4 tiles tuned to the metrics admins actually act on:
 *  1. Umsatz (laufender Monat)      — sum of paid invoices with invoice_date in current month
 *  2. Offene Forderungen           — sum of gross_amount for invoices in (open, overdue)
 *  3. Pipeline                      — confirmed reservations with end_date >= today
 *  4. Neue Registrierungen (30 T.) — new b2b_profiles in the last 30 days; sub-text highlights pending count
 *
 * Pure presentational — parent (AdminDashboard) computes & passes the numbers.
 */
import { Card, CardContent } from "@/components/ui/card";
import { Users, Receipt, Package, Euro } from "lucide-react";

interface StatsProps {
  revenueThisMonth: number;
  openReceivables: number;
  openInvoicesCount: number;
  overdueInvoicesCount: number;
  pipelineRentals: number;
  pendingReservations: number;
  newRegistrationsLast30Days: number;
  pendingCustomers: number;
}

export function AdminStatsOverview({
  revenueThisMonth,
  openReceivables,
  openInvoicesCount,
  overdueInvoicesCount,
  pipelineRentals,
  pendingReservations,
  newRegistrationsLast30Days,
  pendingCustomers,
}: StatsProps) {
  const formatCurrency = (n: number) =>
    n.toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

  const stats = [
    {
      label: "Umsatz Monat",
      value: formatCurrency(revenueThisMonth),
      sub: "Bezahlte Rechnungen (laufender Monat)",
      icon: Euro,
      accent: false,
    },
    {
      label: "Offene Forderungen",
      value: formatCurrency(openReceivables),
      sub:
        overdueInvoicesCount > 0
          ? `${overdueInvoicesCount} überfällig · ${openInvoicesCount} offen`
          : `${openInvoicesCount} offene Rechnungen`,
      icon: Receipt,
      accent: overdueInvoicesCount > 0,
    },
    {
      label: "Mieten in Pipeline",
      value: pipelineRentals,
      sub:
        pendingReservations > 0
          ? `${pendingReservations} unbearbeitete Anfragen`
          : "Alle Anfragen bearbeitet",
      icon: Package,
      accent: pendingReservations > 0,
    },
    {
      label: "Neue Registrierungen",
      value: newRegistrationsLast30Days,
      sub:
        pendingCustomers > 0
          ? `${pendingCustomers} ausstehend · 30 Tage`
          : "Letzte 30 Tage · alle freigeschaltet",
      icon: Users,
      accent: pendingCustomers > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="relative overflow-hidden">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5 sm:space-y-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
                    {stat.label}
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p
                    className={`text-[10px] sm:text-xs ${
                      stat.accent ? "text-accent font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {stat.sub}
                  </p>
                </div>
                <div
                  className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                    stat.accent ? "bg-accent/10" : "bg-primary/10"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 sm:h-5 sm:w-5 ${
                      stat.accent ? "text-accent" : "text-primary"
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
