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
import { CalculatorRecommendations, ToolsLink, useCalculatorPrices } from "./CalculatorRecommendations";
import { findInCache, getManagedProductsCacheStatus, useManagedProductsVersion } from "@/data/managedProductsCache";
import { calculateDrying, DRYER_LARGE_SLUG, DRYER_SMALL_SLUG, FAN_TIME_REDUCTION, FAN_SLUG } from "@/lib/dryingCalculator";

const COLS = "id,slug,name,pricing_scheme,prices_same_all_locations,price_per_day,price_from_1_rd,price_from_3_rd,price_from_10_rd,price_from_20_rd,price_weekend_num,price_base_1_3_cd,surcharge_per_cd_from_4,surcharge_per_cd_from_8,price_from_1_week,price_from_2_weeks,price_from_3_weeks,price_from_4_weeks,price_short_1_3_rd";
const num = (v: string) => parseFloat(v.replace(",", ".")) || 0;

export function DryingCalculator({ locationId, showToolsLink = true }: { locationId: string; showToolsLink?: boolean }) {
  const { type } = useCustomerType();
  const [l, setL] = useState(""); const [w, setW] = useState(""); const [h, setH] = useState("2,5");
  const [water, setWater] = useState(false); const [fans, setFans] = useState(true);
  const result = useMemo(() => calculateDrying({ length: num(l), width: num(w), height: num(h), standingWater: water, withFans: fans }), [l, w, h, water, fans]);

  useManagedProductsVersion();
  const query = useCalculatorPrices([DRYER_SMALL_SLUG, DRYER_LARGE_SLUG, FAN_SLUG]);
  const data = getManagedProductsCacheStatus() === "loaded" && !query.isError ? query.data : undefined;

  const dryer = data?.products.find((p) => p.slug === result?.dryer.slug && findInCache(p.slug)?.locationIds.includes(locationId));
  const price = useMemo(() => {
    if (!result || !dryer) return null;
    const prices = resolveProductPrices(dryer, locationId, data?.rows);
    const lo = tierPriceBau(prices, result.days.min); const hi = tierPriceBau(prices, result.days.max);
    if (!lo || !hi) return null;
    return { min: lo.rate * result.days.min * result.dryer.qty, max: hi.rate * result.days.max * result.dryer.qty };
  }, [result, dryer, data, locationId]);
  const fan = data?.products.find((p) => p.slug === FAN_SLUG && findInCache(p.slug)?.locationIds.includes(locationId));
  const fanPrice = useMemo(() => {
    if (!result || !fan || result.fans === 0) return null;
    const prices = resolveProductPrices(fan, locationId, data?.rows);
    const lo = tierPriceBau(prices, result.days.min); const hi = tierPriceBau(prices, result.days.max);
    if (!lo || !hi) return null;
    return { min: lo.rate * result.days.min * result.fans, max: hi.rate * result.days.max * result.fans };
  }, [result, fan, data, locationId]);

  const field = (id: string, label: string, v: string, set: (s: string) => void) => (
    <div className="space-y-1.5 min-w-0">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} inputMode="decimal" value={v} onChange={(e) => set(e.target.value)} onFocus={(e) => e.currentTarget.select()} placeholder="z. B. 5" />
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
            {result.fans > 0 && <li className="flex gap-2"><Wind className="h-4 w-4 mt-0.5 flex-shrink-0" /><span><strong>{result.fans} ×</strong> {fan?.name ?? "Turbolüfter"} zur Luftumwälzung</span></li>}
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
            {result.fans > 0 && <div className="mt-2 text-sm">Mietpreis {fan?.name ?? "Turbolüfter"}: <strong>{fanPrice ? `${formatEuro(priceFor(fanPrice.min, type))} – ${formatEuro(priceFor(fanPrice.max, type))}` : "auf Anfrage"}</strong></div>}
          </div>
        </div>
      )}
      {result && <CalculatorRecommendations locationId={locationId} days={result.days.max} showPrices={false} lines={[{ slug: result.dryer.slug, qty: result.dryer.qty }, ...(result.fans > 0 ? [{ slug: FAN_SLUG, qty: result.fans }] : [])]} fallbackNames={{ [FAN_SLUG]: "Turbolüfter" }} />}
      {!fans && result && (
        <p className="mt-3 text-sm flex gap-2 text-headline"><Wind className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />Tipp: Mit zusätzlichen Lüftern verkürzt sich die Trocknungszeit um ca. {Math.round(FAN_TIME_REDUCTION * 100)} %.</p>
      )}
      <p className="mt-3 text-xs text-muted-foreground flex gap-2"><Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />Die tatsächliche Dauer hängt von Schadensumfang, Durchfeuchtung der Bauteile und Messwerten ab. Estrich- oder Deckentrocknung auf Anfrage.</p>
      {showToolsLink && <ToolsLink />}
    </section>
  );
}
