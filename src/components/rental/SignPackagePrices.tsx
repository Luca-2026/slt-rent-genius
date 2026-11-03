import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
export function SignPackagePrices({ kind }: { kind: "standard" | "sorglos" }) {
  const [cents, setCents] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    supabase.functions.invoke("sign-booking", { body: { action: "config" } }).then(({ data }) => {
      const value = data?.config?.[kind === "standard" ? "standardGrossCents" : "sorglosGrossCents"];
      if (active && Number.isInteger(value) && value > 0) setCents(value);
    });
    return () => { active = false; };
  }, [kind]);
  return <>{cents === null ? "Preis derzeit nicht verfügbar" : `${kind === "standard" ? "Standard-Set" : "Sorglos-Paket"}: ${new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100)} je Set für 1–10 Miettage`}</>;
}