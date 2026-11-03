import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { displayPrice } from "@/lib/priceDisplay";
import { useCustomerType } from "@/hooks/useCustomerType";
import type { SignBookingConfiguration, SignPackage } from "../../../supabase/functions/_shared/sign-direct-booking";

export function useSignBookingConfig(enabled = true) {
  return useQuery<SignBookingConfiguration | null>({ queryKey: ["sign-booking-config"], enabled, staleTime: 60000, queryFn: async () => {
    const { data, error } = await supabase.functions.invoke("sign-booking", { body: { action: "config" } });
    if (error) throw error;
    return data?.config ?? null;
  } });
}

export function SignPackageSelection({ value, onChange }: { value: SignPackage | null; onChange: (pkg: SignPackage) => void }) {
  const { data: config } = useSignBookingConfig();
  const { type } = useCustomerType();
  return <section className="space-y-3" aria-label="Paket wählen">
    <h3 className="font-semibold">Welche Leistung möchtest du buchen?</h3>
    <RadioGroup value={value ?? ""} onValueChange={next => { if (next === "standard" || next === "sorglos") onChange(next); }} aria-label="Schilderpaket">
      {(["standard", "sorglos"] as const).map(pkg => {
        const cents = pkg === "standard" ? config?.standardGrossCents : config?.sorglosGrossCents;
        return <label key={pkg} className={`flex items-start gap-3 border-b py-4 ${value === pkg ? "border-primary" : "border-border"}`}>
          <RadioGroupItem value={pkg} className="mt-1 shrink-0" />
          <span className="min-w-0 flex-1 space-y-2">
            <strong className="block">{pkg === "standard" ? "Nur Schildermiete · Selbstabholung" : "Rundum-Sorglos-Paket"}</strong>
            <span className="block text-sm text-muted-foreground">{pkg === "standard" ? "Schilder und Füße selbst abholen, aufstellen und zurückgeben. Genehmigung und Protokollierung organisierst du selbst. Keine Beratung oder Unterstützung bei Genehmigungsfragen enthalten." : "Genehmigungsantrag, Aufstellung, Aufstellprotokoll und Abbau durch uns. Städtische Genehmigungsgebühren werden zusätzlich separat abgerechnet."}</span>
            <span className="block font-bold text-primary">{cents != null ? displayPrice(cents / 119, type) : "Preis derzeit nicht verfügbar"}{pkg === "sorglos" && <span className="text-sm font-normal"> (bis {config?.sorglosRadiusKm ?? "–"} km)</span>}</span>
            <span className="block text-xs text-muted-foreground">Je Set für 1–{config?.maxRentalDays ?? "–"} Tage · {type === "private" ? "inkl. 19 % USt." : "netto zzgl. 19 % USt."}{pkg === "sorglos" && config?.sorglosOuterGrossCents != null ? ` · Darüber ${displayPrice(config.sorglosOuterGrossCents / 119, type)}` : ""}</span>
          </span>
        </label>;
      })}
    </RadioGroup>
  </section>;
}