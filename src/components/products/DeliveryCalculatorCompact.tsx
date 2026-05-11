import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, Calculator, ArrowRight, Info, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  tariffs,
  categoryConfigs,
  calculatePrice,
  type TariffKey,
} from "@/data/lieferkosten";

interface DeliveryCalculatorCompactProps {
  productCategoryId?: string;
  showAllCategories?: boolean;
  className?: string;
  categoryDisplayName?: string;
  productName?: string;
}

// Override tariff based on product name (Erdbewegung XE27/2,7t etc → Tarif C)
function getProductTariffOverride(productName?: string): TariffKey | null {
  if (!productName) return null;
  const lower = productName.toLowerCase();
  if (/xe27|2[.,]7\s*t|3[.,]?\s*t|e35|e50|e55|3500|5000|radlader|knicklader|kramer|12m|14m/i.test(lower)) {
    return "C";
  }
  return null;
}

// Fallback mapping for unknown product category IDs
const FALLBACK_CATEGORY = "werkzeuge";

export function DeliveryCalculatorCompact({
  productCategoryId,
  showAllCategories = false,
  className = "",
  categoryDisplayName,
  productName,
}: DeliveryCalculatorCompactProps) {
  const { t } = useTranslation();

  // Determine initial category key
  const initialCategoryKey = (() => {
    if (productCategoryId && categoryConfigs[productCategoryId]) return productCategoryId;
    return FALLBACK_CATEGORY;
  })();

  const [categoryKey, setCategoryKey] = useState<string>(initialCategoryKey);
  const config = categoryConfigs[categoryKey];

  // Initial subtype: spezifisches Subtype-Matching anhand Produktname, sonst Tarif-Override, sonst default
  const initialSubtype: string | null = (() => {
    if (!config.subtypes || config.subtypes.length === 0) return null;
    const lower = (productName ?? "").toLowerCase();
    // Spezifisches Matching pro Subtype-Key
    if (lower) {
      if (/xe27|2[.,]7\s*t|3\s*t|e35/i.test(lower)) {
        const m = config.subtypes.find((s) => s.key === "3t-bagger");
        if (m) return m.key;
      }
      if (/2\s*t|e20/i.test(lower)) {
        const m = config.subtypes.find((s) => s.key === "2t-bagger");
        if (m) return m.key;
      }
      if (/radlader|knicklader|kramer/i.test(lower)) {
        const m = config.subtypes.find((s) => s.key === "radlader");
        if (m) return m.key;
      }
      if (/dumper/i.test(lower)) {
        const m = config.subtypes.find((s) => s.key === "dumper");
        if (m) return m.key;
      }
      // Arbeitsbühnen — Reihenfolge wichtig (spezifischer zuerst)
      if (/niftylift|hr\s*12|gelenk(teleskop)?/i.test(lower)) {
        const m = config.subtypes.find((s) => s.key === "12m-gelenk");
        if (m) return m.key;
      }
      if (/teleskop(mast)?|11[.,]?2\s*m/i.test(lower)) {
        const m = config.subtypes.find((s) => s.key === "11m-teleskop");
        if (m) return m.key;
      }
      // 8m Scherenbühne (leicht, Tarif B) — nur exakt "8 m … scheren"
      if (/(^|[^0-9])8[.,]?\d?\s*m[^a-z0-9]*scher|scher[^0-9]*8[.,]?\d?\s*m/i.test(lower)) {
        const m = config.subtypes.find((s) => s.key === "8m-scheren");
        if (m) return m.key;
      }
      // Alle anderen Scherenbühnen (z.B. 10m, 11,8m, 12m) → 12m-Scheren-Tarif (C)
      if (/scher/i.test(lower)) {
        const m = config.subtypes.find((s) => s.key === "12m-scheren");
        if (m) return m.key;
      }
      if (/anh[aä]nger.*(arbeits)?b[uü]hne|18\s*m/i.test(lower)) {
        const m = config.subtypes.find((s) => s.key === "18m-anhaenger");
        if (m) return m.key;
      }
    }
    const override = getProductTariffOverride(productName);
    if (override) {
      const match = config.subtypes.find((s) => s.tarif === override);
      if (match) return match.key;
    }
    return config.defaultSubtype ?? config.subtypes[0].key;
  })();

  const [subtypeKey, setSubtypeKey] = useState<string | null>(initialSubtype);
  const [distance, setDistance] = useState(20);
  const [includeReturn, setIncludeReturn] = useState(false);
  const [twoMachines, setTwoMachines] = useState(false);

  const activeSubtype = config.subtypes?.find((s) => s.key === subtypeKey) ?? null;
  const activeTarif: TariffKey = activeSubtype?.tarif ?? (config.defaultTarif as TariffKey ?? "A");
  const tariff = tariffs[activeTarif];

  const result = useMemo(
    () =>
      calculatePrice({
        tarif: activeTarif,
        km: distance,
        twoMachines,
        rueckweg: includeReturn,
      }),
    [activeTarif, distance, twoMachines, includeReturn]
  );

  const handleCategoryChange = (value: string) => {
    setCategoryKey(value);
    const cfg = categoryConfigs[value];
    setSubtypeKey(cfg.defaultSubtype ?? cfg.subtypes?.[0]?.key ?? null);
    setTwoMachines(false);
  };

  const showCategoryDropdown = showAllCategories;
  const showSubtypeSwitch = (config.subtypes?.length ?? 0) > 1;

  const allCategoryEntries = Object.entries(categoryConfigs);

  return (
    <Card className={`bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Truck className="h-5 w-5 text-primary" />
          {categoryDisplayName ? t("rental.deliveryTitle", { category: categoryDisplayName }) : t("rental.deliveryCosts")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showCategoryDropdown && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("rental.deviceCategory")}</Label>
            <div className="relative">
              <select
                value={categoryKey}
                onChange={(event) => handleCategoryChange(event.target.value)}
                className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {allCategoryEntries.map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        )}

        {showSubtypeSwitch && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Gerätetyp</Label>
            <div className="relative">
              <select
                value={subtypeKey ?? ""}
                onChange={(event) => setSubtypeKey(event.target.value)}
                className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {config.subtypes!.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground flex items-start gap-1">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{t("rental.deliveryHint")}</span>
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {t("rental.distance")}
            </Label>
            <span className="font-semibold text-primary">{distance} km</span>
          </div>
          <Slider
            value={[distance]}
            onValueChange={(v) => setDistance(v[0])}
            min={5}
            max={50}
            step={5}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between py-2 border-t border-border">
          <Label htmlFor="return-trip-compact" className="text-sm cursor-pointer">
            {t("rental.roundTrip")}
          </Label>
          <Switch
            id="return-trip-compact"
            checked={includeReturn}
            onCheckedChange={setIncludeReturn}
          />
        </div>

        {tariff.multiplier2Maschinen > 1 && (
          <div className="flex items-center justify-between py-2 border-t border-border">
            <div>
              <Label htmlFor="two-machines-compact" className="text-sm cursor-pointer">
                {t("rental.twoMachines")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("rental.surcharge")}: ×{tariff.multiplier2Maschinen}
              </p>
            </div>
            <Switch
              id="two-machines-compact"
              checked={twoMachines}
              onCheckedChange={setTwoMachines}
            />
          </div>
        )}

        <div className="bg-background rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {includeReturn ? t("rental.roundTripLabel") : t("rental.oneWayLabel")}
              </p>
              <p className="text-2xl font-bold text-headline">
                {result.total.toFixed(0)} €
                <span className="text-sm font-normal text-muted-foreground ml-1">{t("rental.gross")}</span>
              </p>
            </div>
            <Calculator className="h-8 w-8 text-accent" />
          </div>
          {twoMachines && tariff.multiplier2Maschinen > 1 && (
            <p className="text-xs text-accent mt-1">
              {t("rental.inclSurchargeTwoMachines")}
            </p>
          )}
        </div>

        <div className="pt-3 mt-3 border-t border-border">
          <Link to="/lieferung">
            <Button variant="outline" className="w-full text-sm">
              {t("rental.detailedCalculator")}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
