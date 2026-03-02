import { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Truck, Calculator, Info, MapPin, Package, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatedSection } from "@/components/ui/animated-section";

// Preistabelle basierend auf der PDF
const deliveryPrices = {
  "1t-bagger": {
    name: "1t Bagger, Dumper & 8m Scherenbühne",
    multiplier: 1.5, // für 2 Baumaschinen
    distances: [
      { km: 15, brutto: 70 },
      { km: 20, brutto: 90 },
      { km: 25, brutto: 99 },
      { km: 30, brutto: 115 },
      { km: 35, brutto: 130 },
      { km: 50, brutto: 155 },
    ],
  },
  "2t-bagger": {
    name: "2t Bagger, Radlader & Anhängerarbeitsbühne",
    multiplier: 1.5,
    distances: [
      { km: 15, brutto: 80 },
      { km: 20, brutto: 99 },
      { km: 25, brutto: 115 },
      { km: 30, brutto: 130 },
      { km: 35, brutto: 155 },
      { km: 50, brutto: 180 },
    ],
  },
  "3t-bagger": {
    name: "3t Bagger & 12m Scherenbühne",
    multiplier: 1.7,
    distances: [
      { km: 15, brutto: 90 },
      { km: 20, brutto: 109 },
      { km: 25, brutto: 125 },
      { km: 30, brutto: 139 },
      { km: 35, brutto: 150 },
      { km: 50, brutto: 165 },
    ],
  },
  "geruest": {
    name: "Gerüst bis 4,4m Arbeitshöhe",
    multiplier: 1,
    aufschlagProMeter: 5,
    aufbauBasis: 40,
    aufbauProMeter: 15,
    distances: [
      { km: 10, brutto: 45 },
      { km: 15, brutto: 55 },
      { km: 20, brutto: 65 },
      { km: 25, brutto: 75 },
      { km: 30, brutto: 90 },
      { km: 35, brutto: 115 },
      { km: 50, brutto: 150 },
    ],
  },
  "event": {
    name: "Heizung, Trocknung, Möbel, Zelte, Event-Equipment",
    multiplier: 1,
    moebelAufschlag: 2, // ab 5 Stück je Stück
    distances: [
      { km: 10, brutto: 25 },
      { km: 15, brutto: 30 },
      { km: 20, brutto: 40 },
      { km: 25, brutto: 70 },
      { km: 30, brutto: 85 },
      { km: 35, brutto: 110 },
      { km: 50, brutto: 140 },
    ],
  },
};

type CategoryKey = keyof typeof deliveryPrices;

export default function Lieferung() {
  const [category, setCategory] = useState<CategoryKey>("1t-bagger");
  const [distance, setDistance] = useState(20);
  const [twoMachines, setTwoMachines] = useState(false);
  const [includeReturn, setIncludeReturn] = useState(true);

  const selectedCategory = deliveryPrices[category];

  // Preis berechnen
  const calculatedPrice = useMemo(() => {
    const distances = selectedCategory.distances;
    
    // Finde passende Entfernungsstufe (nächsthöhere)
    let priceEntry = distances[distances.length - 1];
    for (const entry of distances) {
      if (distance <= entry.km) {
        priceEntry = entry;
        break;
      }
    }

    let basePrice = priceEntry.brutto;
    
    // Aufschlag für 2 Baumaschinen
    if (twoMachines && selectedCategory.multiplier > 1) {
      basePrice = basePrice * selectedCategory.multiplier;
    }

    // Hin- und Rückfahrt
    const totalPrice = includeReturn ? basePrice * 2 : basePrice;

    return {
      oneWay: basePrice,
      total: totalPrice,
      distanceUsed: priceEntry.km,
    };
  }, [category, distance, twoMachines, includeReturn, selectedCategory]);

  return (
    <Layout>
      {/* Hero */}
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

      {/* Calculator */}
      <section className="py-12 lg:py-16">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Configuration */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatedSection animation="fade-in-up" delay={0}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package className="h-5 w-5 text-primary" />
                      1. Gerätekategorie wählen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={category}
                      onValueChange={(value) => setCategory(value as CategoryKey)}
                      className="space-y-3"
                    >
                      {Object.entries(deliveryPrices).map(([key, cat]) => (
                        <div key={key} className="flex items-center space-x-3">
                          <RadioGroupItem value={key} id={key} />
                          <Label htmlFor={key} className="cursor-pointer text-sm">
                            {cat.name}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
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
                      onValueChange={(value) => setDistance(value[0])}
                      min={5}
                      max={60}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5 km</span>
                      <span>60 km</span>
                    </div>
                    <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                      <Info className="h-3.5 w-3.5 inline mr-1" />
                      Die Entfernung wird von unserem nächsten Standort (Krefeld, Bonn oder Mülheim) berechnet.
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
                        <Label htmlFor="return" className="text-sm font-medium">
                          Hin- und Rückfahrt
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Lieferung + Abholung nach Mietende
                        </p>
                      </div>
                      <Switch
                        id="return"
                        checked={includeReturn}
                        onCheckedChange={setIncludeReturn}
                      />
                    </div>

                    {(category === "1t-bagger" || category === "2t-bagger" || category === "3t-bagger") && (
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <Label htmlFor="two-machines" className="text-sm font-medium">
                            2 Baumaschinen
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Aufschlag: ×{selectedCategory.multiplier}
                          </p>
                        </div>
                        <Switch
                          id="two-machines"
                          checked={twoMachines}
                          onCheckedChange={setTwoMachines}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>

            {/* Result */}
            <div className="lg:col-span-1">
              <AnimatedSection animation="scale-in" delay={300}>
                <Card className="sticky top-32 border-2 border-primary">
                  <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
                    <CardTitle className="text-lg">Deine Lieferkosten</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="text-center">
                      <p className="text-4xl lg:text-5xl font-bold text-primary">
                        {calculatedPrice.total.toFixed(2).replace(".", ",")} €
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        inkl. MwSt.
                      </p>
                    </div>

                    <div className="border-t pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kategorie:</span>
                        <span className="font-medium text-right max-w-[180px]">{selectedCategory.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Entfernung:</span>
                        <span className="font-medium">bis {calculatedPrice.distanceUsed} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fahrt:</span>
                        <span className="font-medium">{includeReturn ? "Hin + Rück" : "Nur Hinfahrt"}</span>
                      </div>
                      {twoMachines && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">2 Maschinen:</span>
                          <span className="font-medium text-accent">×{selectedCategory.multiplier}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-muted-foreground">Einzelfahrt:</span>
                        <span className="font-medium">{calculatedPrice.oneWay.toFixed(2).replace(".", ",")} €</span>
                      </div>
                    </div>

                    <Link to="/kontakt" className="block">
                      <Button className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                        Lieferung anfragen
                      </Button>
                    </Link>

                    <p className="text-xs text-muted-foreground text-center">
                      Unverbindliche Preisberechnung
                    </p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 lg:py-16 bg-muted">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-2xl font-bold text-headline mb-8 text-center">
              Gut zu wissen
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Truck, title: "Lieferung bis Bordsteinkante", text: "Die Lieferung erfolgt bis zur Bordsteinkante. Zusätzliche Leistungen wie Kranentladung sind nach Absprache möglich." },
              { icon: Clock, title: "Wartezeiten", text: "Wartezeiten, die nicht durch uns verursacht werden, berechnen wir mit 20,00 € je angefangene 15 Minuten." },
              { icon: MapPin, title: "3 Standorte in NRW", text: "Wir liefern von Krefeld, Bonn oder Mülheim – je nachdem, welcher Standort deiner Baustelle am nächsten ist." },
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

      {/* CTA */}
      <section className="py-12 lg:py-16">
        <div className="section-container text-center">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-2xl font-bold text-headline mb-4">
              Fragen zur Lieferung?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Unser Team berät dich gerne zu Lieferoptionen, Sondertransporten 
              oder individuellen Anforderungen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/kontakt">
                <Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                  Kontakt aufnehmen
                </Button>
              </Link>
              <Link to="/produkte">
                <Button variant="outline">
                  Produkte entdecken
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
