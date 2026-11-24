import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { useRevenueReport } from "@/hooks/useRevenueReport";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { berlinDay, revenueBranch, revenueLocationLabel, revenueMoney, revenueRange, type RevenuePeriod } from "@/lib/revenueReport";

export function RevenueHomeSummary({ now }: { now: Date }) {
  const { user } = useAuth();
  const { isAdmin: adminRole, isSuperAdmin, canViewRevenue, staffProfile, loading } = useStaffAccess();
  const isAdmin = adminRole || isSuperAdmin;
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const location = selectedLocation ?? revenueBranch(staffProfile?.location) ?? "all";
  const today = berlinDay(now);
  const year = revenueRange("year", today, today);
  const week = revenueRange("week", today, today);
  const report = useRevenueReport({ from: week.from < year.from ? week.from : year.from, to: today, location, stage: "invoiced" }, !loading && canViewRevenue, user?.id);
  const periods: { value: RevenuePeriod; label: string }[] = [{ value: "day", label: "Heute" }, { value: "week", label: "Woche" }, { value: "month", label: "Monat" }, { value: "quarter", label: "Quartal" }, { value: "year", label: "Jahr" }];
  return <section aria-label="Standortumsatz" className="px-4 py-3">
    <div className="flex flex-col items-start gap-2 mb-2"><h3 className="text-xs font-semibold text-muted-foreground">Fakturierter Umsatz · netto</h3>
      {isAdmin ? <Select value={location} onValueChange={setSelectedLocation}><SelectTrigger className="w-full h-10 text-xs text-left" aria-label="Umsatzstandort"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bonn">Bonn</SelectItem><SelectItem value="krefeld">Krefeld</SelectItem><SelectItem value="muelheim">Mülheim an der Ruhr</SelectItem><SelectItem value="all">Alle Standorte</SelectItem></SelectContent></Select> : <span className="text-xs text-foreground break-words">{revenueLocationLabel(report.data?.scope.location ?? revenueBranch(staffProfile?.location))}</span>}
    </div>
    {report.isError ? <p role="alert" className="text-sm text-destructive">Umsatz konnte nicht geladen werden.</p> : !report.data ? <p role="status" className="text-sm text-muted-foreground">Umsatz wird geladen …</p> : <>
      <div className="grid grid-cols-1 divide-y divide-border">
        {periods.map(period => {
          const range = revenueRange(period.value, today, today);
          const total = report.data?.trend.filter(t => t.day >= range.from && t.day <= range.to).reduce((sum, t) => sum + t.net, 0) ?? 0;
          return <Link key={period.value} className="flex flex-wrap items-baseline justify-between gap-2 py-2 hover:text-primary" to={`/b2b/auswertungen?zeitraum=${period.value}&standort=${location}&stufe=invoiced`}><span className="text-xs text-muted-foreground">{period.label}</span><strong className="text-base tabular-nums break-all">{revenueMoney(total)}</strong></Link>;
        })}
      </div>
      {report.data.warnings > 0 && <p className="mt-2 text-xs text-muted-foreground">Nur eindeutig zugeordnete Belege; {report.data.warnings} Nachweise prüfen.</p>}
    </>}
  </section>;
}