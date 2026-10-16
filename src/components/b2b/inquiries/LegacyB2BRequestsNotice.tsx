import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { Info } from "lucide-react";

/**
 * Ältere B2B-Portal-Anfragen (vor der automatischen Übernahme in die
 * Mietanfragen) haben keine verknüpfte Mietanfrage. Damit nichts verloren
 * geht, weisen wir Admins auf offene Altfälle hin.
 */
export function LegacyB2BRequestsNotice() {
  const { isAdmin } = useStaffAccess();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;
    let alive = true;
    supabase
      .from("b2b_reservations")
      .select("id", { count: "exact", head: true })
      .is("inquiry_id", null)
      .in("status", ["pending", "offer_sent"])
      .then(({ count: c }) => { if (alive) setCount(c ?? 0); });
    return () => { alive = false; };
  }, [isAdmin]);

  if (!isAdmin || count === 0) return null;
  return (
    <div role="note" className="mb-4 flex gap-3 rounded-md border border-accent/40 bg-accent/5 p-3 text-sm">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      <p>
        {count} ältere B2B-Portal-{count === 1 ? "Anfrage" : "Anfragen"} aus dem bisherigen System {count === 1 ? "ist" : "sind"} noch offen und nicht in dieser Liste.{" "}
        <Link to="/b2b/admin" className="font-semibold text-primary underline underline-offset-4">Altfälle öffnen</Link>
      </p>
    </div>
  );
}
