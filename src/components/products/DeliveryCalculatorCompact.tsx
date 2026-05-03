import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, MapPin, ArrowRight, Info, AlertTriangle } from "lucide-react";
import { calculatePrice, formatEuro } from "@/lib/lieferkosten/calculate";
import { KATEGORIE_MAPPING, type ProduktKategorie } from "@/data/lieferkosten/mapping";
import type { TarifKey } from "@/data/lieferkosten/tarife";

interface DeliveryCalculatorCompactProps {
  productCategoryId?: string;
  showAllCategories?: boolean;
  className?: string;
  categoryDisplayName?: string;
  productName?: string;
}

const KATEGORIEN = Object.keys(KATEGORIE_MAPPING) as ProduktKategorie[];

// Erkennen, ob Erdbewegungs-Produkt eher 2t/3t (Tarif D) ist
function detectTariffFromProductName(productName: string | undefined, kategorie: ProduktKategorie): TarifKey | null {
  if (!productName) return null;
  const lower = productName.toLowerCase();
  if (kategorie === "erdbewegung") {
    if (/3[.,]?\s*t|3500|e35|e50|e55|xe35|xe50/.test(lower)) return "D";
    if (/2[.,]?\s*t|xe20|xe27|2[.,]7|radlader|knicklader|kramer/.test(lower)) return "D";
    return "C";
  }
  if (kategorie === "arbeitsbuehnen") {
    if (/12\s*m|14\s*m|16\s*m|hubsteiger/.test(lower)) return "D";
    return "C";
  }
  return null;
}

function isTieflader(productName?: string): boolean {
  if (!productName) return false;
  // Wortgrenze davor: "5t"/"7t" nur als eigenständige Größe, nicht als Teil von "2,7t" o.ä.
  return /tieflader|ab\s*3[.,]5\s*t|(?:^|[^\d.,])(?:5|7)\s*t\b/.test(productName.toLowerCase());
}

export function DeliveryCalculatorCompact({
  productCategoryId,
  showAllCategories = false,
  className = "",
  categoryDisplayName,
  productName,
}: DeliveryCalculatorCompactProps) {
  // Initiale Kategorie + Tarif bestimmen
  const initialKategorie: ProduktKategorie =
    (productCategoryId && (KATEGORIE_MAPPING as any)[productCategoryId]
      ? (productCategoryId as ProduktKategorie)
      : "werkzeuge");

  const [kategorie, setKategorie] = useState<ProduktKategorie>(initialKategorie);
  const mapping = KATEGORIE_MAPPING[kategorie];

  const initialTarif: TarifKey =
    mapping.default_tarif === "NONE"
      ? "A"
      : (detectTariffFromProductName(productName, kategorie) ??
          (mapping.default_tarif as TarifKey));

  const [tarif, setTarif] = useState<TarifKey>(initialTarif);
  const [km, setKm] = useState(20);
  const [liefermodus, setLiefermodus] = useState<"hin-rueck" | "einzel">("einzel");

  // Kategorie-spezifische Spezialfälle
  const isAnhaenger = kategorie === "anhaenger";
  const tieflader = isTieflader(productName);
  const showTarifSwitch = !!mapping.ui_switch_tarife && mapping.ui_switch_tarife.length > 0;

  const result = useMemo(
    () =>
      calculatePrice({
        kategorie,
        tarif,
        km,
        liefermodus,
      }),
    [kategorie, tarif, km, liefermodus]
  );

  // Sonderfall: Anhänger – Selbstabholung
  if (isAnhaenger) {
    return (
      <Card className={`bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-5 w-5 text-primary" />
            Lieferkosten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 text-sm">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p>
              <strong>Selbstabholung Lager Krefeld.</strong> Anhänger werden zur Abholung bereitgestellt – keine Lieferung.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sonderfall: Tieflader-Maschine
  if (tieflader) {
    return (
      <Card className={`bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-5 w-5 text-primary" />
            Lieferkosten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
            <p>Tieflader-Anlieferung – <strong>Preis auf Anfrage</strong>.</p>
          </div>
          <Link to="/kontakt">
            <Button className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover">
              Anfrage stellen
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Truck className="h-5 w-5 text-primary" />
          {categoryDisplayName ? `Lieferung – ${categoryDisplayName}` : "Lieferkosten berechnen"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Kategorie-Dropdown nur auf "alle"-Seite */}
        {showAllCategories && (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Kategorie</Label>
            <Select
              value={kategorie}
              onValueChange={(v) => {
                const k = v as ProduktKategorie;
                setKategorie(k);
                const m = KATEGORIE_MAPPING[k];
                setTarif(m.default_tarif === "NONE" ? "A" : (m.default_tarif as TarifKey));
              }}
            >
              <SelectTrigger className="w-full bg-background h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background z-50 max-h-72">
                {KATEGORIEN.filter((k) => KATEGORIE_MAPPING[k].default_tarif !== "NONE").map((k) => (
                  <SelectItem key={k} value={k}>
                    {KATEGORIE_MAPPING[k].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Tarif-Switch (Erdbewegung / Arbeitsbühnen) */}
        {showTarifSwitch && (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {kategorie === "erdbewegung" ? "Maschinengröße" : "Bühnentyp"}
            </Label>
            <Select value={tarif} onValueChange={(v) => setTarif(v as TarifKey)}>
              <SelectTrigger className="w-full bg-background h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {mapping.ui_switch_tarife!.map((t) => (
                  <SelectItem key={t} value={t}>
                    {kategorie === "erdbewegung"
                      ? t === "C" ? "1t Bagger / Dumper" : "2–3t Bagger / Radlader"
                      : t === "C" ? "8m Anhängerarbeitsbühne" : "12m+ Scherenbühne"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Distanz */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Entfernung
            </Label>
            <span className="font-semibold text-primary">{km} km</span>
          </div>
          <Slider value={[km]} onValueChange={(v) => setKm(v[0])} min={5} max={50} step={5} />
        </div>

        {/* Liefermodus */}
        <div className="flex items-center justify-between py-1.5 border-t border-border">
          <Label htmlFor="rt-compact" className="text-sm cursor-pointer">
            Anlieferung &amp; Abholung
          </Label>
          <Switch
            id="rt-compact"
            checked={liefermodus === "hin-rueck"}
            onCheckedChange={(c) => setLiefermodus(c ? "hin-rueck" : "einzel")}
          />
        </div>

        {/* Preis */}
        <div className="bg-background rounded-lg p-3 border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Richtpreis</p>
          <p className="text-2xl font-bold text-headline">
            {formatEuro(result.total)}
            <span className="text-xs font-normal text-muted-foreground ml-1">brutto</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Be-/Entladen inkl. · Wartezeit extra · Richtwert
          </p>
        </div>

        {/* CTA zur Vollseite */}
        <Link
          to={`/lieferung?kategorie=${kategorie}&tarif=${tarif}&km=${km}&modus=${liefermodus}`}
          className="block"
        >
          <Button variant="outline" className="w-full text-sm h-9">
            Detaillierte Berechnung
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
