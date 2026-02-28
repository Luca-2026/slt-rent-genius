import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, Receipt, Package, TrendingUp, Clock, Euro, AlertTriangle } from "lucide-react";

interface StatsProps {
  totalCustomers: number;
  pendingCustomers: number;
  totalReservations: number;
  pendingReservations: number;
  totalInvoices: number;
  openInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
}

export function AdminStatsOverview({
  totalCustomers,
  pendingCustomers,
  totalReservations,
  pendingReservations,
  totalInvoices,
  openInvoices,
  overdueInvoices,
  totalRevenue,
}: StatsProps) {
  const formatCurrency = (n: number) =>
    n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  const stats = [
    {
      label: "Kunden",
      value: totalCustomers,
      sub: pendingCustomers > 0 ? `${pendingCustomers} ausstehend` : "Alle aktiv",
      icon: Users,
      accent: pendingCustomers > 0,
    },
    {
      label: "Offene Anfragen",
      value: pendingReservations,
      sub: `${totalReservations} gesamt`,
      icon: Clock,
      accent: pendingReservations > 0,
    },
    {
      label: "Rechnungen",
      value: totalInvoices,
      sub: overdueInvoices > 0
        ? `${overdueInvoices} überfällig`
        : `${openInvoices} offen`,
      icon: Receipt,
      accent: overdueInvoices > 0,
    },
    {
      label: "Umsatz (brutto)",
      value: formatCurrency(totalRevenue),
      sub: "Bezahlte Rechnungen",
      icon: Euro,
      accent: false,
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
                  <p className={`text-[10px] sm:text-xs ${stat.accent ? "text-accent font-medium" : "text-muted-foreground"}`}>
                    {stat.sub}
                  </p>
                </div>
                <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${stat.accent ? "bg-accent/10" : "bg-primary/10"}`}>
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.accent ? "text-accent" : "text-primary"}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
