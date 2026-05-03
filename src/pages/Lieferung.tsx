import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon, Truck, Calculator, Info, MapPin, Package, Clock, AlertTriangle, ChevronDown, CheckCircle2 } from "lucide-react";
import { Layout } from "@/components/layout";
import { SEO, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AnimatedSection } from "@/components/ui/animated-section";
import { cn } from "@/lib/utils";
import { calculatePrice, formatEuro } from "@/lib/lieferkosten/calculate";
import { isWeekendOrHolidayNRW } from "@/lib/lieferkosten/feiertage-nrw";
import { KATEGORIE_MAPPING, type ProduktKategorie } from "@/data/lieferkosten/mapping";
import type { TarifKey } from "@/data/lieferkosten/tarife";
import type { LiefermodusType } from "@/lib/lieferkosten/types";

const KATEGORIEN = (Object.keys(KATEGORIE_MAPPING) as ProduktKategorie[]).filter(
  (k) => KATEGORIE_MAPPING[k].default_tarif !== "NONE"
);

export default function Lieferung() {
  const [searchParams] = useSearchParams();

  // URL-Parameter
  const initialKategorie = (searchParams.get("kategorie") as ProduktKategorie) || "werkzeuge";
  const initialKm = Number(searchParams.get("km")) || 20;
  const initialModus = (searchParams.get("modus") as LiefermodusType) || "einzel";
  const initialTarifFromUrl = searchParams.get("tarif") as TarifKey | null;

  const [kategorie, setKategorie] = useState<ProduktKategorie>(
    KATEGORIE_MAPPING[initialKategorie] && KATEGORIE_MAPPING[initialKategorie].default_tarif !== "NONE"
      ? initialKategorie
      : "werkzeuge"
  );
  const mapping = KATEGORIE_MAPPING[kategorie];

  const [tarif, setTarif] = useState<TarifKey>(
    initialTarifFromUrl ?? (mapping.default_tarif === "NONE" ? "A" : (mapping.default_tarif as TarifKey))
  );
  const [km, setKm] = useState(Math.min(50, Math.max(5, initialKm)));
  const [liefermodus, setLiefermodus] = useState<LiefermodusType>(initialModus);
  const [zweiMaschinen, setZweiMaschinen] = useState(false);
  const [moebelStueck, setMoebelStueck] = useState(0);
  const [geruestHoehe, setGeruestHoehe] = useState(4.4);
  const [aufbauService, setAufbauService] = useState(false);
  const [express, setExpress] = useState(false);
  const [lieferdatum, setLieferdatum] = useState<Date | undefined>(undefined);
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  // Wenn Kategorie wechselt: Tarif-Default zurücksetzen
  useEffect(() => {
    if (mapping.default_tarif !== "NONE") {
      setTarif(mapping.default_tarif as TarifKey);
    }
    setZweiMaschinen(false);
    setMoebelStueck(0);
    setAufbauService(false);
  }, [kategorie]); // eslint-disable-line react-hooks/exhaustive-deps

  const showTarifSwitch = !!mapping.ui_switch_tarife && mapping.ui_switch_tarife.length > 0;
  const showZweiMaschinen = tarif === "C" || tarif === "D";
  const showMoebel = kategorie === "moebel-zelte";
  const showGeruest = kategorie === "leitern-gerueste";

  const result = useMemo(
    () =>
      calculatePrice({
        kategorie,
        tarif,
        km,
        liefermodus,
        zweiMaschinen,
        moebelStueck,
        geruestArbeitshoehe: geruestHoehe,
        geruestAufbauService: aufbauService,
        express,
        lieferdatum,
      }),
    [kategorie, tarif, km, liefermodus, zweiMaschinen, moebelStueck, geruestHoehe, aufbauService, express, lieferdatum]
  );

  const isWeekend = lieferdatum ? isWeekendOrHolidayNRW(lieferdatum) : false;

  return (
    <Layout>
      <SEO
        title="Lieferkosten berechnen – Transparenter Preis | SLT Rental"
        description="Lieferkosten transparent kalkulieren: alle Kategorien, Hin- & Rückweg, Express, Wochenend-Zuschlag. Direkt vom SLT-Lager in NRW."
        canonical="/lieferung"
        keywords="Lieferkosten Baumaschinen, Mietgeräte Lieferung NRW, Lieferung berechnen"
        jsonLd={SLT_BREADCRUMB_JSONLD([{ name: "Home", url: "/" }, { name: "Lieferung", url: "/lieferung" }])}
      />

      {/* Hero */}
      <section className="bg-primary py-12 lg:py-16">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="h-8 w-8 text-accent" />
              <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground">Lieferkosten-Kalkulator</h1>
            </div>
            <p className="text-primary-foreground/80 max-w-2xl">
              Berechne deine Lieferkosten transparent und realistisch – inkl. aller relevanten Optionen.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-primary-foreground/90">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Direktlieferung vom SLT-Lager</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Transparenter Preis ohne versteckte Zuschläge</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Be-/Entladen und Geräteeinweisung inklusive</span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-12 lg:py-16">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Eingaben */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatedSection animation="fade-in-up">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package className="h-5 w-5 text-primary" />
                      1. Produkt-Kategorie
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={kategorie} onValueChange={(v) => setKategorie(v as ProduktKategorie)}>
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50 max-h-80">
                        {KATEGORIEN.map((k) => (
                          <SelectItem key={k} value={k}>
                            {KATEGORIE_MAPPING[k].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {mapping.hinweis && (
                      <p className="text-xs text-muted-foreground">
                        <Info className="h-3.5 w-3.5 inline mr-1" />
                        {mapping.hinweis}
                      </p>
                    )}

                    {showTarifSwitch && (
                      <div className="space-y-2 pt-2 border-t">
                        <Label className="text-sm font-medium">
                          {kategorie === "erdbewegung" ? "Maschinengröße" : "Bühnentyp"}
                        </Label>
                        <RadioGroup value={tarif} onValueChange={(v) => setTarif(v as TarifKey)} className="space-y-2">
                          {mapping.ui_switch_tarife!.map((t) => (
                            <div key={t} className="flex items-center space-x-2">
                              <RadioGroupItem value={t} id={`tarif-${t}`} />
                              <Label htmlFor={`tarif-${t}`} className="text-sm cursor-pointer">
                                {kategorie === "erdbewegung"
                                  ? t === "C" ? "1t Bagger / Dumper" : "2–3t Bagger / Radlader"
                                  : t === "C" ? "8m Anhängerarbeitsbühne" : "12m+ Scherenbühne / Hubsteiger"}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                        <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                          <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />
                          Maschinen ab 3,5 t Eigengewicht werden per Tieflader angeliefert. Preis auf Anfrage.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AnimatedSection>

              <AnimatedSection animation="fade-in-up" delay={100}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MapPin className="h-5 w-5 text-primary" />
                      2. Entfernung &amp; Liefermodus
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Entfernung (einfache Strecke)</span>
                      <span className="text-2xl font-bold text-primary">{km} km</span>
                    </div>
                    <Slider value={[km]} onValueChange={(v) => setKm(v[0])} min={5} max={50} step={5} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5 km</span>
                      <span>50 km</span>
                    </div>

                    <div className="pt-3 border-t space-y-2">
                      <Label className="text-sm font-medium">Liefermodus</Label>
                      <RadioGroup value={liefermodus} onValueChange={(v) => setLiefermodus(v as LiefermodusType)} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="einzel" id="m-e" />
                          <Label htmlFor="m-e" className="text-sm cursor-pointer">Nur Anlieferung (Einzelstrecke)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="hin-rueck" id="m-hr" />
                          <Label htmlFor="m-hr" className="text-sm cursor-pointer">Anlieferung &amp; Abholung</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="selbstabholung" id="m-s" />
                          <Label htmlFor="m-s" className="text-sm cursor-pointer">Selbstabholung Lager Krefeld (0 €)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>

              {/* Optionen */}
              {liefermodus !== "selbstabholung" && (
                <AnimatedSection animation="fade-in-up" delay={200}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Calculator className="h-5 w-5 text-primary" />
                        3. Optionen &amp; Aufschläge
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {showZweiMaschinen && (
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="zwei" className="text-sm font-medium">2 Maschinen</Label>
                            <p className="text-xs text-muted-foreground">Aufschlag je nach Tarif</p>
                          </div>
                          <Switch id="zwei" checked={zweiMaschinen} onCheckedChange={setZweiMaschinen} />
                        </div>
                      )}

                      {showMoebel && (
                        <div className="space-y-2 pt-2 border-t">
                          <Label className="text-sm font-medium">Möbel-Stückzahl</Label>
                          <Input
                            type="number"
                            min={0}
                            value={moebelStueck}
                            onChange={(e) => setMoebelStueck(Math.max(0, Number(e.target.value) || 0))}
                            className="bg-background"
                          />
                          <p className="text-xs text-muted-foreground">Aufschlag von 2 € je Stück über 5 Stück</p>
                        </div>
                      )}

                      {showGeruest && (
                        <div className="space-y-3 pt-2 border-t">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Arbeitshöhe</Label>
                              <span className="text-sm font-semibold text-primary">{geruestHoehe.toFixed(1)} m</span>
                            </div>
                            <Slider value={[geruestHoehe]} onValueChange={(v) => setGeruestHoehe(v[0])} min={4.4} max={12} step={0.2} />
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <div>
                              <Label htmlFor="aufbau" className="text-sm font-medium">Aufbau-Service vor Ort</Label>
                              <p className="text-xs text-muted-foreground">75 € Basis + 15 € pro Meter</p>
                            </div>
                            <Switch id="aufbau" checked={aufbauService} onCheckedChange={setAufbauService} />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <Label htmlFor="express" className="text-sm font-medium">Express-Lieferung</Label>
                          <p className="text-xs text-muted-foreground">Innerhalb 4 h, +50 € pauschal</p>
                        </div>
                        <Switch id="express" checked={express} onCheckedChange={setExpress} />
                      </div>

                      <div className="space-y-2 pt-2 border-t">
                        <Label className="text-sm font-medium">Lieferdatum (optional)</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn("w-full justify-start text-left font-normal bg-background", !lieferdatum && "text-muted-foreground")}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {lieferdatum ? format(lieferdatum, "PPP", { locale: de }) : "Datum wählen"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                            <Calendar
                              mode="single"
                              selected={lieferdatum}
                              onSelect={setLieferdatum}
                              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        {isWeekend && (
                          <p className="text-xs text-accent">
                            <Info className="h-3.5 w-3.5 inline mr-1" />
                            Sa/So/Feiertag – Wochenend-Zuschlag ×1,25 wird angewendet.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              )}

              {/* Standard-Übergabe Block */}
              <AnimatedSection animation="fade-in-up" delay={300}>
                <Card>
                  <Collapsible>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="flex flex-row items-center justify-between hover:bg-muted/30 transition-colors">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Clock className="h-5 w-5 text-primary" />
                          Was ist im Lieferpreis enthalten?
                        </CardTitle>
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p>
                          Anlieferung an Bordsteinkante, Be-/Entladen durch SLT-Mitarbeiter, kurze Geräteeinweisung – <strong>bis 15 Minuten Standard-Übergabezeit beim Kunden inklusive</strong>.
                        </p>
                        <p>
                          <strong>Wartezeit darüber hinaus:</strong> 15 € pro angefangene 15 Minuten.
                        </p>
                        <p>
                          <strong>Nicht enthalten:</strong> Kraneinsatz, Innenraum-Transport, Aufbau/Abbau (außer Gerüst-Aufbauservice optional buchbar).
                        </p>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              </AnimatedSection>
            </div>

            {/* Ergebnis */}
            <div className="lg:col-span-1">
              <AnimatedSection animation="scale-in" delay={300}>
                <Card className="sticky top-32 border-2 border-primary">
                  <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
                    <CardTitle className="text-lg text-primary-foreground">Deine Lieferkosten</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {result.outOfRange ? (
                      <div className="space-y-3 text-center">
                        <AlertTriangle className="h-10 w-10 text-accent mx-auto" />
                        <p className="text-sm">{result.hinweis}</p>
                        <Link to="/kontakt">
                          <Button className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                            Anfrage stellen
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="text-center">
                          <p className="text-4xl lg:text-5xl font-bold text-primary">
                            {formatEuro(result.total)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">inkl. MwSt.</p>
                        </div>

                        <Collapsible open={breakdownOpen} onOpenChange={setBreakdownOpen}>
                          <CollapsibleTrigger className="w-full text-sm text-primary hover:underline flex items-center justify-center gap-1">
                            Preisaufschlüsselung
                            <ChevronDown className={cn("h-4 w-4 transition-transform", breakdownOpen && "rotate-180")} />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pt-3">
                            <div className="space-y-1.5 text-xs border rounded-lg p-3 bg-muted/30">
                              {result.breakdown.map((line, i) => (
                                <div key={i} className="flex justify-between gap-2">
                                  <span className="text-muted-foreground">{line.label}</span>
                                  <span className="font-medium tabular-nums">
                                    {line.isMultiplier ? formatEuro(line.laufendeSumme) : `${line.betrag >= 0 ? "+" : ""}${formatEuro(line.betrag)}`}
                                  </span>
                                </div>
                              ))}
                              <div className="flex justify-between pt-2 mt-2 border-t font-bold text-sm">
                                <span>Gesamt brutto</span>
                                <span className="tabular-nums">{formatEuro(result.total)}</span>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                          <Info className="h-3.5 w-3.5 inline mr-1" />
                          <strong>Richtwert.</strong> Der endgültige Preis ergibt sich nach individueller Anfrage anhand exakter Distanz, Verfügbarkeit und Lieferzeitpunkt.
                        </div>

                        <Link to="/kontakt" className="block">
                          <Button className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                            Lieferung verbindlich anfragen
                          </Button>
                        </Link>
                      </>
                    )}
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* Liefergebiet & Hinweise */}
      <section className="py-12 lg:py-16 bg-muted">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-2xl font-bold text-headline mb-8 text-center">Gut zu wissen</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Truck, title: "Lieferung bis Bordsteinkante", text: "Be-/Entladen durch unsere Mitarbeiter inklusive. Kraneinsatz oder Innenraum-Transport nach Absprache." },
              { icon: Clock, title: "Wartezeiten", text: "15 Minuten Standard-Übergabe inkl. Darüber hinaus 15 € pro angefangene 15 Minuten." },
              { icon: MapPin, title: "Liefergebiet NRW", text: "Wir liefern aus Krefeld, Bonn oder Mülheim an der Ruhr. Außerhalb PLZ 4xxxx/5xxxx auf Anfrage." },
            ].map((item, i) => (
              <AnimatedSection key={item.title} animation="fade-in-up" delay={i * 120}>
                <Card className="hover:shadow-md transition-all duration-300 h-full">
                  <CardContent className="pt-6 h-full flex flex-col">
                    <item.icon className="h-8 w-8 text-primary mb-3 shrink-0" />
                    <h3 className="font-semibold text-headline mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 lg:py-16">
        <div className="section-container text-center">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-2xl font-bold text-headline mb-4">Fragen zur Lieferung?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Unser Team berät dich gerne zu Lieferoptionen, Sondertransporten oder individuellen Anforderungen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/kontakt">
                <Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">Kontakt aufnehmen</Button>
              </Link>
              <Link to="/produkte">
                <Button variant="outline">Produkte entdecken</Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
