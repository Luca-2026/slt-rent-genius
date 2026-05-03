import { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { SEO, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Truck, Calculator, Info, MapPin, Package, Clock, Zap, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatedSection } from "@/components/ui/animated-section";
import {
  tariffs,
  categoryConfigs,
  calculatePrice,
  type TariffKey,
} from "@/data/lieferkosten";

const categoryEntries = Object.entries(categoryConfigs);

export default function Lieferung() {
  const [categoryKey, setCategoryKey] = useState<string>("erdbewegung");
  const [subtypeKey, setSubtypeKey] = useState<string | null>(
    categoryConfigs["erdbewegung"].defaultSubtype ?? null
  );
  const [distance, setDistance] = useState(20);
  const [twoMachines, setTwoMachines] = useState(false);
  const [includeReturn, setIncludeReturn] = useState(false);
  const [express, setExpress] = useState(false);
  const [wochenende, setWochenende] = useState(false);
  // Gerüst
  const [arbeitshoehe, setArbeitshoehe] = useState(4.4);
  const [aufbauService, setAufbauService] = useState(false);
  // Möbel
  const [moebelAnzahl, setMoebelAnzahl] = useState(0);
  const [moebelAufbauService, setMoebelAufbauService] = useState(false);
  const [moebelAufbauStueck, setMoebelAufbauStueck] = useState(0);
  const [moebelAufbauZelte, setMoebelAufbauZelte] = useState(0);

  const config = categoryConfigs[categoryKey];
  const activeSubtype = config.subtypes?.find((s) => s.key === subtypeKey) ?? null;
  const activeTarif: TariffKey = activeSubtype?.tarif ?? (config.defaultTarif as TariffKey);
  const tariff = tariffs[activeTarif];
  const isGeruest = config.scope === "geruest";
  const isMoebel = config.scope === "moebel";

  const result = useMemo(
    () =>
      calculatePrice({
        tarif: activeTarif,
        km: distance,
        twoMachines,
        rueckweg: includeReturn,
        express,
        wochenende,
        arbeitshoeheMeter: isGeruest ? arbeitshoehe : undefined,
        aufbauService: isGeruest ? aufbauService : false,
        moebelAnzahl: isMoebel ? moebelAnzahl : 0,
        moebelAufbauService: isMoebel ? moebelAufbauService : false,
        moebelAufbauStueck: isMoebel ? moebelAufbauStueck : 0,
        moebelAufbauZelte: isMoebel ? moebelAufbauZelte : 0,
      }),
    [activeTarif, distance, twoMachines, includeReturn, express, wochenende, isGeruest, arbeitshoehe, aufbauService, isMoebel, moebelAnzahl, moebelAufbauService, moebelAufbauStueck, moebelAufbauZelte]
  );

  const handleCategoryChange = (value: string) => {
    setCategoryKey(value);
    const cfg = categoryConfigs[value];
    setSubtypeKey(cfg.defaultSubtype ?? null);
    setTwoMachines(false);
  };

  return (
    <Layout>
      <SEO
        title="Lieferung & Abholung – Preise & Infos | SLT Rental"
        description="Lieferkosten transparent berechnen: SLT Rental liefert in ganz NRW – Niederrhein, Ruhrgebiet, Rheinland & Raum Bonn. Jetzt online kalkulieren."
        canonical="/lieferung"
        keywords="Baumaschinen Lieferung, Minibagger Transport, Equipment Abholung NRW"
        jsonLd={SLT_BREADCRUMB_JSONLD([{ name: "Home", url: "/" }, { name: "Lieferung", url: "/lieferung" }])}
      />
      <section className="bg-primary py-12 lg:py-16">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="h-8 w-8 text-accent" />
              <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground">
                Lieferkosten-Kalkulator
              </h1>
            </div>
            <p className="text-primary-foreground/80 max-w-2xl">
              Berechne schnell und einfach die Lieferkosten für dein Equipment.
              Wir liefern direkt auf deine Baustelle – zuverlässig und pünktlich.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <AnimatedSection animation="fade-in-up">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package className="h-5 w-5 text-primary" />
                      1. Produktkategorie wählen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <select
                      value={categoryKey}
                      onChange={(event) => handleCategoryChange(event.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      aria-label="Produktkategorie wählen"
                    >
                      {categoryEntries.map(([key, cfg]) => (
                        <option key={key} value={key}>
                          {cfg.label}
                        </option>
                      ))}
                    </select>

                    {config.subtypes && config.subtypes.length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <Label className="text-sm font-medium">Gerätetyp</Label>
                        <select
                          value={subtypeKey ?? ""}
                          onChange={(event) => setSubtypeKey(event.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          aria-label="Gerätetyp wählen"
                        >
                          {config.subtypes.map((s) => (
                            <option key={s.key} value={s.key}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {config.hinweis && (
                      <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                        <Info className="h-3.5 w-3.5 inline mr-1" />
                        {config.hinweis}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </AnimatedSection>

              <AnimatedSection animation="fade-in-up" delay={100}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MapPin className="h-5 w-5 text-primary" />
                      2. Entfernung zum Standort
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Entfernung (einfache Strecke)</span>
                      <span className="text-2xl font-bold text-primary">{distance} km</span>
                    </div>
                    <Slider
                      value={[distance]}
                      onValueChange={(v) => setDistance(v[0])}
                      min={5}
                      max={50}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5 km</span>
                      <span>50 km</span>
                    </div>
                    <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                      <Info className="h-3.5 w-3.5 inline mr-1" />
                      Die Entfernung wird vom nächsten Standort (Krefeld, Bonn oder Mülheim an der Ruhr) berechnet.
                    </p>
                  </CardContent>
                </Card>
              </AnimatedSection>

              <AnimatedSection animation="fade-in-up" delay={200}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calculator className="h-5 w-5 text-primary" />
                      3. Optionen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="return" className="text-sm font-medium">Anlieferung & Abholung</Label>
                        <p className="text-xs text-muted-foreground">Hin- und Rückweg (×2)</p>
                      </div>
                      <Switch id="return" checked={includeReturn} onCheckedChange={setIncludeReturn} />
                    </div>

                    {tariff.multiplier2Maschinen > 1 && (
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <Label htmlFor="two-machines" className="text-sm font-medium">2 Maschinen</Label>
                          <p className="text-xs text-muted-foreground">Aufschlag: ×{tariff.multiplier2Maschinen}</p>
                        </div>
                        <Switch id="two-machines" checked={twoMachines} onCheckedChange={setTwoMachines} />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <Label htmlFor="express" className="text-sm font-medium flex items-center gap-1">
                          <Zap className="h-4 w-4" /> Express-Lieferung
                        </Label>
                        <p className="text-xs text-muted-foreground">Innerhalb 4 h, +50,00 € pauschal</p>
                      </div>
                      <Switch id="express" checked={express} onCheckedChange={setExpress} />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <Label htmlFor="wochenende" className="text-sm font-medium flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" /> Wochenende / Feiertag
                        </Label>
                        <p className="text-xs text-muted-foreground">Sa/So/Feiertag NRW (×1,25)</p>
                      </div>
                      <Switch id="wochenende" checked={wochenende} onCheckedChange={setWochenende} />
                    </div>

                    {isGeruest && (
                      <div className="pt-3 border-t space-y-3">
                        <p className="text-sm font-semibold">Gerüst-Optionen</p>
                        <div className="space-y-2">
                          <Label className="text-sm">Arbeitshöhe: <strong>{arbeitshoehe.toFixed(1)} m</strong></Label>
                          <Slider
                            value={[arbeitshoehe]}
                            onValueChange={(v) => setArbeitshoehe(v[0])}
                            min={4.4}
                            max={14}
                            step={0.5}
                          />
                          <p className="text-xs text-muted-foreground">
                            Über 4,4 m: +8,00 € pro zusätzlichem Meter
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="aufbau" className="text-sm font-medium">Aufbau-Service vor Ort</Label>
                            <p className="text-xs text-muted-foreground">75,00 € Basis + 15,00 €/m</p>
                          </div>
                          <Switch id="aufbau" checked={aufbauService} onCheckedChange={setAufbauService} />
                        </div>
                      </div>
                    )}

                    {isMoebel && (
                      <div className="pt-3 border-t space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="moebel" className="text-sm font-medium">Anzahl Möbelstücke</Label>
                          <Input
                            id="moebel"
                            type="number"
                            min={0}
                            value={moebelAnzahl}
                            onChange={(e) => setMoebelAnzahl(Math.max(0, parseInt(e.target.value) || 0))}
                          />
                          <p className="text-xs text-muted-foreground">Ab 5 Stück: +2,00 € je Stück</p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div>
                            <Label htmlFor="moebel-aufbau" className="text-sm font-medium">Aufbau-Service vor Ort</Label>
                            <p className="text-xs text-muted-foreground">75,00 € Basis + 10,00 €/Garnitur, 75,00 €/Zelt</p>
                          </div>
                          <Switch id="moebel-aufbau" checked={moebelAufbauService} onCheckedChange={setMoebelAufbauService} />
                        </div>
                        {moebelAufbauService && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor="moebel-aufbau-stueck" className="text-xs">Bierzeltgarnituren / Stehtische</Label>
                              <Input
                                id="moebel-aufbau-stueck"
                                type="number"
                                min={0}
                                value={moebelAufbauStueck}
                                onChange={(e) => setMoebelAufbauStueck(Math.max(0, parseInt(e.target.value) || 0))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="moebel-aufbau-zelte" className="text-xs">Zelte</Label>
                              <Input
                                id="moebel-aufbau-zelte"
                                type="number"
                                min={0}
                                value={moebelAufbauZelte}
                                onChange={(e) => setMoebelAufbauZelte(Math.max(0, parseInt(e.target.value) || 0))}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>

            <div className="lg:col-span-1">
              <AnimatedSection animation="scale-in" delay={300}>
                <Card className="sticky top-32 border-2 border-primary">
                  <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
                    <CardTitle className="text-lg text-primary-foreground">Deine Lieferkosten</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="text-center">
                      <p className="text-4xl lg:text-5xl font-bold text-primary">
                        {result.total.toFixed(2).replace(".", ",")} €
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">inkl. MwSt.</p>
                    </div>

                    <div className="border-t pt-4 space-y-2 text-sm">
                      {(activeSubtype || config.label) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Auswahl:</span>
                          <span className="font-medium text-right">{activeSubtype?.label ?? config.label}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Entfernung:</span>
                        <span className="font-medium">bis {result.distanceUsed} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Basispreis:</span>
                        <span className="font-medium">{result.basis.toFixed(2).replace(".", ",")} €</span>
                      </div>
                      {twoMachines && tariff.multiplier2Maschinen > 1 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">2 Maschinen:</span>
                          <span className="font-medium text-accent">×{tariff.multiplier2Maschinen}</span>
                        </div>
                      )}
                      {includeReturn && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Hin + Rückweg:</span>
                          <span className="font-medium">×2</span>
                        </div>
                      )}
                      {result.geruestHoehenAufschlag > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Höhen-Aufschlag:</span>
                          <span className="font-medium">+{result.geruestHoehenAufschlag.toFixed(2).replace(".", ",")} €</span>
                        </div>
                      )}
                      {result.geruestAufbau > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Aufbau-Service:</span>
                          <span className="font-medium">+{result.geruestAufbau.toFixed(2).replace(".", ",")} €</span>
                        </div>
                      )}
                      {result.moebelAufschlag > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Möbel-Aufschlag:</span>
                          <span className="font-medium">+{result.moebelAufschlag.toFixed(2).replace(".", ",")} €</span>
                        </div>
                      )}
                      {result.moebelAufbau > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Aufbau-Service Möbel:</span>
                          <span className="font-medium">+{result.moebelAufbau.toFixed(2).replace(".", ",")} €</span>
                        </div>
                      )}
                      {express && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Express:</span>
                          <span className="font-medium">+50,00 €</span>
                        </div>
                      )}
                      {wochenende && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Wochenende:</span>
                          <span className="font-medium text-accent">×1,25</span>
                        </div>
                      )}
                    </div>

                    <Link to="/kontakt" className="block">
                      <Button className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                        Lieferung anfragen
                      </Button>
                    </Link>

                    <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground text-center space-y-1">
                      <p className="font-medium">ℹ️ Dieser Rechner dient nur zur Orientierung.</p>
                      <p>Wähle im Buchungsprozess „Lieferung gewünscht" – wir fügen die Lieferkosten anschließend deinem Auftrag hinzu.</p>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-muted">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-2xl font-bold text-headline mb-8 text-center">Gut zu wissen</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Truck, title: "Lieferung bis Bordsteinkante", text: "Die Lieferung erfolgt bis zur Bordsteinkante. Zusätzliche Leistungen wie Kranentladung sind nach Absprache möglich." },
              { icon: Clock, title: "Wartezeiten", text: "Standard-Übergabezeit 15 Minuten inklusive. Darüber hinaus berechnen wir 15,00 € je angefangene 15 Minuten." },
              { icon: MapPin, title: "3 Standorte in NRW", text: "Wir liefern von Krefeld, Bonn oder Mülheim an der Ruhr – je nachdem, welcher Standort deiner Baustelle am nächsten ist." },
            ].map((item, index) => (
              <AnimatedSection key={item.title} animation="fade-in-up" delay={index * 120}>
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

      <section className="py-12 lg:py-16">
        <div className="section-container text-center">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-2xl font-bold text-headline mb-4">Fragen zur Lieferung?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Unser Team berät dich gerne zu Lieferoptionen, Sondertransporten oder individuellen Anforderungen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/kontakt">
                <Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                  Kontakt aufnehmen
                </Button>
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
