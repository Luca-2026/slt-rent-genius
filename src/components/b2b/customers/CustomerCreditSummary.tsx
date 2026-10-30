import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { useCreditAssessments } from "@/hooks/useCreditAssessments";
import { canManageCreditChecks, creditEuro } from "@/lib/creditAssessment";
import type { CrmCustomer } from "@/hooks/useCrmCustomers";
import { Button } from "@/components/ui/button";

export function CustomerCreditSummary({ customer }: { customer: CrmCustomer }) {
  const access = useStaffAccess();
  const allowed = canManageCreditChecks(access.isAdmin, access.isBranchManager, Boolean(access.staffProfile));
  const { rows, loading, error } = useCreditAssessments(allowed, customer.id);
  const [limit, setLimit] = useState<number | null>(null);
  const [limitError, setLimitError] = useState(false);
  useEffect(() => {
    let active = true;
    setLimit(null); setLimitError(false);
    if (customer.b2b_profile_id) {
      supabase.from("b2b_profiles").select("credit_limit").eq("id", customer.b2b_profile_id).single().then(({ data, error: err }) => {
        if (active) { setLimitError(Boolean(err)); setLimit(data ? Number(data.credit_limit) : null); }
      });
    }
    return () => { active = false; };
  }, [customer.id, customer.b2b_profile_id]);
  const latest = rows[0];
  if (!customer.b2b_profile_id && (!allowed || (!loading && !error && !latest))) return null;
  return <section className="border-y border-border py-4 space-y-3" aria-label="Kreditübersicht">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-sm font-semibold">Kreditübersicht</h3>
      {allowed && <Button size="sm" variant="outline" asChild><Link to={`/b2b/bonitaetspruefung?kunde=${customer.id}`}>Bonitätsprüfung</Link></Button>}
    </div>
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
      <div><dt className="text-muted-foreground">Von SLT vergebenes Kreditlimit</dt><dd className="font-semibold">{customer.b2b_profile_id ? limitError ? "Nicht geladen" : limit === null ? "Wird geladen …" : creditEuro(limit) : "Kein B2B-Portal-Kreditlimit"}</dd></div>
      {allowed && <div><dt className="text-muted-foreground">CreditSafe-Kreditlinienempfehlung</dt><dd className="font-semibold">{loading ? "Wird geladen …" : error ? "Nicht geladen" : latest?.recommended_limit != null ? creditEuro(Number(latest.recommended_limit)) : "Noch keine Empfehlung hinterlegt"}</dd></div>}
    </dl>
    {allowed && latest && <div className="text-sm space-y-1"><p>Rating: <strong>{latest.rating || "Nicht angegeben"}</strong> · geprüft {new Date(latest.checked_at).toLocaleDateString("de-DE")}</p><p className="text-muted-foreground">{latest.source === "manual_creditsafe" ? "Manuell aus CreditSafe dokumentiert" : "CreditSafe-Abruf"}</p></div>}
  </section>;
}