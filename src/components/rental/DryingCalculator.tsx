import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calculator, Wind, Droplets, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCustomerType } from "@/hooks/useCustomerType";
import { formatEuro, priceFor, vatNote } from "@/lib/priceDisplay";
import { resolveProductPrices, tierPriceBau, type LocationPriceRow } from "@/lib/pricing/rentalPricing";
import { calculateDrying, DRYER_LARGE_SLUG, DRYER_SMALL_SLUG, FAN_TIME_REDUCTION } from "@/lib/dryingCalculator";

const COLS = "id,slug,name,pricing_scheme,prices_same_all_locations,price_per_day,price_from_1_rd,price_from_3_rd,price_from_10_rd,price_from_20_rd,price_weekend_num,price_base_1_3_cd,surcharge_per_cd_from_4,surcharge_per_cd_from_8,price_from_1_week,price_from_2_weeks,price_from_3_weeks,price_from_4_weeks,price_short_1_3_rd";
const num = (v: string) => parseFloat(v.replace(",", ".")) || 0;

export function DryingCalculator({ locationId }: { locationId: string }) {
  const { type } = useCustomerType();
  const [l, setL] = useState(""); const [w, setW] = useState(""); const [h, setH] = useState("2,5");
  const [water, setWater] = useState(false); const [fans, setFans] = useState(true);
  const result = useMemo(() => calculateDrying({ length: num(l), width: num(w), height: num(h), standingWater: water, withFans: fans }), [l, w, h, water, fans]);

  const { data } = useQuery({
    queryKey: ["drying-calc-prices", locationId],
    queryFn: async () => {
      const { data: products } = await supabase.from("b2b_managed_products").select(COLS).in("slug", [DRYER_SMALL_SLUG, DRYER_LARGE_SLUG]);
      const ids = (products ?? []).map((p: { id: string }) => p.id);
      const { data: rows } = ids.length ? await supabase.from("b2b_managed_product_location_prices").select("*").in("managed_product_id", ids) : { data: [] };
      return { products: (products ?? []) as any[], rows: (rows ?? []) as LocationPriceRow[] };
    },
    staleTime: 300000,
  });

  const dryer = data?.products.find((p) => p.slug === result?.dryer.slug);
  const price = useMemo(() => {
    if (!result || !dryer) return null;
    const prices = resolveProductPrices(dryer, locationId, data?.rows);
    const lo = tierPriceBau(prices, result.days.min); const hi = tierPriceBau(prices, result.days.max);
    if (!lo || !hi) return null;
    return { min: lo.rate * result.days.min * result.dryer.qty, max: hi.rate * result.days.max * result.dryer.qty };
  }, [result, dryer, data, locationId]);

  const field = (id: string, label: string, v: string, set: (s: string) => void) => (
    <div className="space-y-1.5 min-w-0">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} inputMode="decimal" value={v} onChange={(e) => set(e.target.value)} placeholder="z. B. 5" />
    </div>
  );

  return (
    <section className="bg-card rounded-xl border border-border p-4 sm:p-5" aria-labelledby="drying-calc">
      <h2 id="drying-calc" className="text-base sm:text-lg font-semibold text-headline mb-1 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-primary flex-shrink-0" /> Bautrockner-Rechner
      </h2>
      <p className="text-sm text-muted-foreground mb-4">Richtwerte für Gerätebedarf, Mietdauer und Mietpreis – Raumtrocknung.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {field("dc-l", "Raumlänge (m)", l, setL)}
        {field("dc-w", "Raumbreite (m)", w, setW)}
        {field("dc-h", "Raumhöhe (m)", h, setH)}
      </div>
      <div className="mt-4 space-y-3">
        <label className="flex items-center justify-between gap-3 text-sm"><span>Stehendes Wasser vorhanden</span><Switch checked={water} onCheckedChange={setWater} /></label>
        <label className="flex items-center justify-between gap-3 text-sm"><span className="font-medium">Zusätzliche Lüfter zur Luftumwälzung (empfohlen)</span><Switch checked={fans} onCheckedChange={setFans} /></label>
      </div>

      {result && (
        <div className="mt-5 rounded-lg bg-primary text-primary-foreground p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><div className="opacity-80">Fläche</div><div className="font-semibold">{result.area.toLocaleString("de-DE")} m²</div></div>
            <div><div className="opacity-80">Volumen</div><div className="font-semibold">{result.volume.toLocaleString("de-DE")} m³</div></div>
          </div>
          <ul className="space-y-1.5 text-sm">
            <li className="flex gap-2"><Droplets className="h-4 w-4 mt-0.5 flex-shrink-0" /><span><strong>{result.dryer.qty} ×</strong> {dryer?.name ?? (result.dryer.slug === DRYER_SMALL_SLUG ? "Bautrockner 20L/Tag" : "Bautrockner 50L/Tag")}</span></li>
            {result.fans > 0 && <li className="flex gap-2"><Wind className="h-4 w-4 mt-0.5 flex-shrink-0" /><span><strong>{result.fans} ×</strong> Lüfter zur Luftumwälzung</span></li>}
          </ul>
          <div>
            <div className="opacity-80 text-sm">Voraussichtliche Mietdauer</div>
            <div className="text-xl font-bold">ca. {result.days.min} bis {result.days.max} Tage</div>
            {fans && <div className="text-xs opacity-80">ohne Lüfter ca. {result.daysWithoutFans.min} bis {result.daysWithoutFans.max} Tage</div>}
          </div>
          <div>
            <div className="opacity-80 text-sm">Mietpreis Bautrockner (Richtwert{fans ? ", ohne Lüfter" : ""})</div>
            <div className="text-lg font-bold">{price ? `${formatEuro(priceFor(price.min, type))} – ${formatEuro(priceFor(price.max, type))}` : "Preis auf Anfrage"}</div>
            {price && <div className="text-xs opacity-80">{vatNote(type)}, nach unseren Staffelpreisen</div>}
          </div>
        </div>
      )}
      {!fans && result && (
        <p className="mt-3 text-sm flex gap-2 text-headline"><Wind className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />Tipp: Mit zusätzlichen Lüftern verkürzt sich die Trocknungszeit um ca. {Math.round(FAN_TIME_REDUCTION * 100)} %.</p>
      )}
      <p className="mt-3 text-xs text-muted-foreground flex gap-2"><Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />Die tatsächliche Dauer hängt von Schadensumfang, Durchfeuchtung der Bauteile und Messwerten ab. Estrich- oder Deckentrocknung auf Anfrage.</p>
    </section>
  );
}
