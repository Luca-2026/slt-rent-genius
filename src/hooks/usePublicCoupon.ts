import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePublicCoupon(code: string, email: string, slugs: string[], revision = "") {
  const key = JSON.stringify([code.trim().toUpperCase(), email.trim().toLowerCase(), [...slugs].sort(), revision]);
  const [result, setResult] = useState<{ key: string; valid: boolean; message: string; eligibleSlugs: string[]; discountPercent: number } | null>(null);
  useEffect(() => {
    if (!code.trim() || !/^[a-f0-9]{20}$/i.test(code.trim()) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || !slugs.length) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const { data, error } = await supabase.functions.invoke("check-public-coupon", { body: { code: code.trim(), email: email.trim(), slugs } });
      if (!cancelled) setResult({ key, valid: !error && data?.valid === true, message: error ? "Prüfung nicht möglich. Bitte erneut versuchen oder Code entfernen." : data?.message ?? "Gutschein nicht anwendbar.", eligibleSlugs: data?.eligible_slugs ?? [], discountPercent: Number(data?.discount_percent ?? 0) });
    }, 500);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [key]);
  if (!code.trim()) return { valid: true, checking: false, message: "", eligibleSlugs: [], discountPercent: 0 };
  if (!/^[a-f0-9]{20}$/i.test(code.trim())) return { valid: false, checking: false, message: "Bitte den vollständigen 20-stelligen Gutscheincode eingeben.", eligibleSlugs: [], discountPercent: 0 };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return { valid: false, checking: false, message: "Bitte E-Mail zur Gutscheinzuordnung eingeben.", eligibleSlugs: [], discountPercent: 0 };
  if (!slugs.length) return { valid: false, checking: false, message: "Bitte einen Mietartikel auswählen.", eligibleSlugs: [], discountPercent: 0 };
  if (result?.key !== key) return { valid: false, checking: true, message: "Gutschein wird geprüft …", eligibleSlugs: [], discountPercent: 0 };
  return { ...result, checking: false };
}