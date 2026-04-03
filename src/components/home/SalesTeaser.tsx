import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/ui/animated-section";
import { ArrowRight, CheckCircle2, Truck, Phone, Wrench } from "lucide-react";

const brandCards = [
  {
    name: "ZOOMLION",
    h3: "Zoomlion – Bagger, Arbeitsbühnen, Radlader & Teleskoplader",
    desc: "Als autorisierter Zoomlion-Fachhändler und Servicestützpunkt in NRW bieten wir das komplette Programm: Elektro-Minibagger, Radlader, Teleskoplader sowie Scherenbühnen und Gelenksteiger der Zoomlion Access-Linie.",
    highlights: [
      "⚡ Elektro-Bagger & Minibagger (0,8 t – 8 t)",
      "🚜 Radlader (1,5 t – 5 t)",
      "🏗️ Teleskoplader (Reichweite bis 18 m)",
      "🦺 Scherenbühnen & Gelenkteleskopsteiger (8–32 m)",
    ],
  },
  {
    name: "BAUMAX",
    h3: "BAUMAX Baumaschinen – Rüttelplatten, Dumper, Stampfer & mehr",
    desc: "BAUMAX steht für „Baumaschinen für maximale Leistung" – deutsche Entwicklung, robuste Konstruktion, nachhaltige Ersatzteilversorgung.",
    highlights: [
      "🔨 Rüttelplatten VP, HVP & RVP-Serie",
      "🚛 Minidumper & Raddumper (elektrisch & benzin)",
      "💪 Vibrationsstampfer",
      "🪨 Steinsägen & Benzin-Trennschleifer",
    ],
  },
  {
    name: "TEMARED",
    h3: "Temared – Anhänger kaufen in NRW (750 kg bis 3.500 kg)",
    desc: "Temared ist Europas führender Hersteller für PKW-Anhänger bis 3.500 kg. Als autorisierter Temared-Fachhändler bieten wir über 200 Modelle.",
    highlights: [
      "📦 Kastenanhänger & Planenanhänger (750 kg – 3.500 kg)",
      "🚗 Autotransportanhänger & Tieflader",
      "🏗️ Baumaschinenanhänger bis 3.500 kg",
      "🏍️ Motorrad- & Quadanhänger",
    ],
  },
];

const trustBadges = [
  { icon: CheckCircle2, label: "Autorisierter Fachhändler" },
  { icon: Wrench, label: "Zertifizierter Servicestützpunkt" },
  { icon: Truck, label: "Lieferung in ganz NRW" },
  { icon: Phone, label: "Persönliche Beratung" },
];

export function SalesTeaser() {
  return (
    <section className="py-16 lg:py-20 bg-muted/30 border-y border-border">
      <div className="section-container">
        <AnimatedSection className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-accent/10 text-accent border border-accent/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            ✦ Offizieller Fachhändler & Servicestützpunkt
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
            Baumaschinen kaufen in NRW – Ihr Fachhändler für Zoomlion, BAUMAX & Temared
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Neben unserem umfangreichen Mietpark sind wir autorisierter Fachhändler und zertifizierter Servicestützpunkt für drei führende Hersteller. Ob Bagger, Arbeitsbühne, Rüttelplatte oder Anhänger – wir beraten Sie persönlich und liefern direkt zu Ihnen in NRW.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {brandCards.map((brand, i) => (
            <AnimatedSection key={brand.name} delay={i * 100} animation="fade-in-up">
              <Card className="h-full hover:shadow-lg transition-shadow border-2 hover:border-primary/30">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-center mb-4">
                    <span className="text-lg font-bold">{brand.name}</span>
                  </div>
                  <h3 className="font-bold text-foreground mb-2 text-sm">{brand.h3}</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">{brand.desc}</p>
                  <ul className="space-y-1 mb-4">
                    {brand.highlights.map((h) => (
                      <li key={h} className="text-xs text-muted-foreground">{h}</li>
                    ))}
                  </ul>
                  <Link to="/verkauf#kaufanfrage">
                    <Button variant="outline" size="sm" className="w-full">
                      Kaufanfrage stellen <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {trustBadges.map((badge) => (
            <span key={badge.label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <badge.icon className="h-4 w-4 text-accent" /> {badge.label}
            </span>
          ))}
        </div>

        <div className="text-center">
          <Link to="/verkauf">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Alle Kaufangebote ansehen <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
