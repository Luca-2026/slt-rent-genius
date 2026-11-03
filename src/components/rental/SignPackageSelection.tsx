import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { displayPrice } from "@/lib/priceDisplay";
import { useCustomerType } from "@/hooks/useCustomerType";
import type { SignBookingConfiguration, SignPackage } from "../../../supabase/functions/_shared/sign-direct-booking";
import { DeliveryAddressFields } from "./DeliveryAddressFields";
import type { SignSetupAddress } from "@/lib/signCartPackage";
import { LOCATION_ORIGINS } from "../../../supabase/functions/_shared/route-distance";
import { SignRentalTariff } from "./SignRentalTariff";

export function useSignBookingConfig(enabled = true) {
  return useQuery<SignBookingConfiguration | null>({ queryKey: ["sign-booking-config"], enabled, staleTime: 60000, queryFn: async () => {
    const { data, error } = await supabase.functions.invoke("sign-booking", { body: { action: "config" } });
    if (error) throw error;
    return data?.config ?? null;
  } });
}

export function SignPackageSelection({ value, onChange, location, address, onAddressChange, quote }: { value: SignPackage | null; onChange: (pkg: SignPackage) => void; location: string; address: SignSetupAddress; onAddressChange: (next: Partial<SignSetupAddress>) => void; quote: { cents: number | null; km: number | null; loading: boolean; error: string } }) {
  // Older mounted callers can briefly lack newly added props during preview updates.
  const safeAddress = { zoneStreet: address?.zoneStreet ?? "", zonePostalCode: address?.zonePostalCode ?? "", zoneCity: address?.zoneCity ?? "" };
  const safeQuote = quote ?? { cents: null, km: null, loading: false, error: "" };
  const { data: config } = useSignBookingConfig();
  const { type } = useCustomerType();
  return <section className="space-y-3" aria-label="Paket wählen">
    <h3 className="font-semibold">Welche Leistung möchtest du buchen?</h3>
    <RadioGroup value={value ?? ""} onValueChange={next => { if (next === "standard" || next === "sorglos") onChange(next); }} aria-label="Schilderpaket">
      {(["standard", "sorglos"] as const).map(pkg => {
        const cents = pkg === "standard" ? config?.standardGrossCents : value === "sorglos" && safeQuote.cents != null ? safeQuote.cents : config?.sorglosGrossCents;
        return <label key={pkg} className={`flex items-start gap-3 border-b py-4 ${value === pkg ? "border-primary" : "border-border"}`}>
          <RadioGroupItem value={pkg} className="mt-1 shrink-0" />
          <span className="min-w-0 flex-1 space-y-2">
            <strong className="block">{pkg === "standard" ? "Nur Schildermiete · Selbstabholung" : "Rundum-Sorglos-Paket"}</strong>
            <span className="block text-sm text-muted-foreground">{pkg === "standard" ? "Schilder und Füße selbst abholen, aufstellen und zurückgeben. Genehmigung und Protokollierung organisierst du selbst. Keine Beratung oder Unterstützung bei Genehmigungsfragen enthalten." : "Genehmigungsantrag, Aufstellung, Aufstellprotokoll und Abbau durch uns. Städtische Genehmigungsgebühren werden zusätzlich separat abgerechnet."}</span>
            <span className="block font-bold text-primary">{cents != null ? displayPrice(cents / 119, type) : "Preis derzeit nicht verfügbar"}{pkg === "sorglos" && <span className="text-sm font-normal">{value === "sorglos" && safeQuote.cents != null ? " (für deine Aufstelladresse)" : ` (bis ${config?.sorglosRadiusKm ?? "–"} km)`}</span>}</span>
            <span className="block text-xs text-muted-foreground">Je Set für 1–10 Tage · {type === "private" ? "inkl. 19 % USt." : "netto zzgl. 19 % USt."}{pkg === "sorglos" && config?.sorglosOuterGrossCents != null ? ` · Darüber ${displayPrice(config.sorglosOuterGrossCents / 119, type)}` : ""}</span>
            <span className="block text-xs text-muted-foreground">{pkg === "standard" && config?.standardRentalTiers ? <SignRentalTariff tiers={config.standardRentalTiers} customerType={type} /> : <>Ab Tag 11 je weiterem Tag {cents != null ? displayPrice(cents / 1190, type) : "ein Zehntel des Paketpreises"} je Set.</>}</span>
          </span>
        </label>;
      })}
    </RadioGroup>
    {value === "sorglos" && <div className="space-y-3 border-b border-border pb-4">
      <h4 className="font-semibold">Aufstelladresse der Halteverbotszone</h4>
      <p className="text-xs text-muted-foreground">Abfahrt: {LOCATION_ORIGINS[location]?.replace(", Germany", "")}</p>
      <DeliveryAddressFields zone prefix="sign-zone" value={{ deliveryStreet: safeAddress.zoneStreet, deliveryPostalCode: safeAddress.zonePostalCode, deliveryCity: safeAddress.zoneCity }} onChange={next => onAddressChange?.({ ...(next.deliveryStreet !== undefined ? { zoneStreet: next.deliveryStreet } : {}), ...(next.deliveryPostalCode !== undefined ? { zonePostalCode: next.deliveryPostalCode } : {}), ...(next.deliveryCity !== undefined ? { zoneCity: next.deliveryCity } : {}) })} />
      <p role={safeQuote.error ? "alert" : "status"} className={`text-sm ${safeQuote.error ? "text-destructive" : "text-primary"}`}>{safeQuote.loading ? "Google Maps berechnet Fahrstrecke und Paketpreis …" : safeQuote.error || (safeQuote.cents != null ? `Paketpreis je Set: ${displayPrice(safeQuote.cents / 119, type)} · ${safeQuote.km?.toLocaleString("de-DE", { maximumFractionDigits: 1 })} km Fahrstrecke` : "Bitte vollständige Aufstelladresse für den Paketpreis angeben.")}</p>
    </div>}
  </section>;
}