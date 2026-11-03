import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { signSetupAddressKey, type SignSetupAddress } from "@/lib/signCartPackage";

export function useSignSetupQuote(location: string, enabled: boolean, address: SignSetupAddress) {
  const key = signSetupAddressKey(location, address);
  const [quote, setQuote] = useState<{ key: string; cents: number | null; km: number | null; loading: boolean; error: string }>({ key: "", cents: null, km: null, loading: false, error: "" });
  useEffect(() => {
    if (!enabled || !key) return;
    let active = true;
    setQuote({ key, cents: null, km: null, loading: true, error: "" });
    const timer = setTimeout(async () => {
      const { data, error } = await supabase.functions.invoke("sign-booking", { body: { action: "setup-quote", location, street: address.zoneStreet, postalCode: address.zonePostalCode, city: address.zoneCity } });
      let message = data?.error ?? "";
      if (error) { try { message = (await error.context?.json())?.error ?? error.message; } catch { message = "Aufstellpreis konnte nicht geprüft werden. Bitte erneut versuchen."; } }
      const valid = !error && !message && Number.isSafeInteger(data?.grossCents) && data.grossCents > 0 && Number.isFinite(data?.distanceKm) && data.distanceKm >= 0;
      if (active) setQuote({ key, cents: valid ? data.grossCents : null, km: valid ? data.distanceKm : null, loading: false, error: valid ? "" : message || "Aufstellpreis konnte nicht geprüft werden." });
    }, 800);
    return () => { active = false; clearTimeout(timer); };
  }, [enabled, key]);
  return enabled && key && quote.key === key ? quote : { key, cents: null, km: null, loading: !!enabled && !!key, error: "" };
}