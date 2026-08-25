import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Clock } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { Button } from "@/components/ui/button";
import { currentPeriod, isReminderWindow, periodRangeLabel } from "@/lib/payrollPeriod";

interface Props {
  /** Wenn gesetzt, wird statt eines Links direkt der Zeiten-Tab geöffnet. */
  onOpenTimeTracking?: () => void;
  className?: string;
}

/**
 * Prominenter Hinweis ab dem 19. eines Monats, solange der eigene Stundenzettel
 * für den laufenden Abrechnungszeitraum (21.–20.) noch nicht bestätigt wurde.
 */
export function TimesheetReminderBanner({ onOpenTimeTracking, className }: Props) {
  const { user } = useAuth();
  const { isStaff } = useStaffAccess();
  const [pending, setPending] = useState(false);

  const period = currentPeriod();
  const showWindow = isReminderWindow();

  useEffect(() => {
    let active = true;
    if (!user?.id || !isStaff || !showWindow) {
      setPending(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("staff_timesheets")
        .select("status")
        .eq("user_id", user.id)
        .eq("year", period.year)
        .eq("month", period.month)
        .maybeSingle();
      if (active) setPending(data?.status !== "submitted" && data?.status !== "approved");
    })();
    return () => {
      active = false;
    };
  }, [user?.id, isStaff, showWindow, period.year, period.month]);

  if (!pending || !showWindow) return null;

  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border-2 border-accent bg-accent/10 p-4 sm:flex-row sm:items-center sm:justify-between ${className ?? ""}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
        <div className="text-sm">
          <p className="font-semibold">Stundenzettel noch offen</p>
          <p className="text-muted-foreground">
            Bitte trage deine Zeiten für den Abrechnungszeitraum {periodRangeLabel(period)} ein und bestätige ihn. Am
            20. wird die Lohnabrechnung erstellt – danach ist der Zeitraum gesperrt.
          </p>
        </div>
      </div>
      {onOpenTimeTracking ? (
        <Button size="sm" onClick={onOpenTimeTracking} className="shrink-0">
          <Clock className="mr-2 h-4 w-4" /> Stunden eintragen
        </Button>
      ) : (
        <Button size="sm" asChild className="shrink-0">
          <Link to="/b2b/aufgaben/?tab=zeiten">
            <Clock className="mr-2 h-4 w-4" /> Stunden eintragen
          </Link>
        </Button>
      )}
    </div>
  );
}
