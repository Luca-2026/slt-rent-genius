import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
export function SignPackagePrices({ kind }: { kind: "standard" | "sorglos" }) {
  const [cents, setCents] = useState<number | null>(null);
  const [outer, setOuter] = useState<number | null>(null);
  const [radius, setRadius] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    supabase.functions.invoke("sign-booking", { body: { action: "config" } }).then(({ data }) => {
      const value = data?.config?.[kind === "standard" ? "standardGrossCents" : "sorglosGrossCents"];
      if (active && Number.isInteger(value) && value > 0) { setCents(value); setOuter(data?.config?.sorglosOuterGrossCents ?? null); setRadius(data?.config?.sorglosRadiusKm ?? null); }
    });
    return () => { active = false; };
  }, [kind]);
  const money = (value: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value / 100);
  return <>{cents === null ? "Preis derzeit nicht verfügbar" : kind === "standard" ? `Standard-Set: ${money(cents)} brutto je Set für 1–10 Tage` : `Premium-Festpreis: ${money(cents)} brutto bis ${radius ?? "–"} km ab Vermietstandort${outer == null ? "" : `, darüber ${money(outer)} brutto`} je Set für 1–10 Tage`}{cents != null && ` · Ab Tag 11 täglich ${money(cents / 10)} brutto zusätzlich je Set${kind === "sorglos" && outer != null ? ` (außerhalb ${radius} km: ${money(outer / 10)})` : ""}.`}</>;
}