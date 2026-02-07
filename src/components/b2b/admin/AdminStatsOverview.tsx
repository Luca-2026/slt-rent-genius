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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="relative overflow-hidden">
            <CardContent className="p-4 lg:p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-xl lg:text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className={`text-xs ${stat.accent ? "text-accent font-medium" : "text-muted-foreground"}`}>
                    {stat.sub}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${stat.accent ? "bg-accent/10" : "bg-primary/10"}`}>
                  <Icon className={`h-5 w-5 ${stat.accent ? "text-accent" : "text-primary"}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
