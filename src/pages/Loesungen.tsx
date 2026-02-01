import { Layout } from "@/components/layout";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shovel, Trees, Hammer, PartyPopper, Truck, Home, Building2, Sparkles } from "lucide-react";
import { AnimatedSection } from "@/components/ui/animated-section";

// Event solution images
import imgEventZelt from "@/assets/solutions/events/stretch-zelt-outdoor.jpg";
import imgEventGartenfest from "@/assets/solutions/events/gartenfest-slt.jpg";
import imgEventIndoorPA from "@/assets/solutions/events/indoor-pa-setup.jpg";
import imgEventIBCLed from "@/assets/solutions/events/ibc-led-deko.jpg";
import imgEventTraversen from "@/assets/solutions/events/traversen-lager.jpg";
import imgEventGlaeser from "@/assets/solutions/events/glaeser-slt-kisten.jpg";

interface Solution {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  images?: string[];
  icon: React.ElementType;
  categories: string[];
  highlights: string[];
  color: string;
}

const solutions: Solution[] = [
  {
    id: "garten-landschaftsbau",
    title: "Garten- & Landschaftsbau",
    subtitle: "Vom Privatgarten bis zur Parkanlage",
    description: "Komplette Ausstattung für GaLaBau-Betriebe und ambitionierte Hobbygärtner. Von der Baumstumpffräse bis zum Minibagger – alles für die professionelle Gartengestaltung.",
    image: "/placeholder.svg",
    icon: Trees,
    categories: ["erdbewegung", "gartenpflege", "anhaenger", "verdichtung"],
    highlights: [
      "Minibagger 1t - 2,7t (Diesel)",
      "Baumstumpffräse & Häcksler",
      "Rüttelplatten & Stampfer",
      "Anhänger für Grünschnitt & Material",
    ],
    color: "from-green-500/20 to-green-600/10",
  },
  {
    id: "tiefbau-erdbewegung",
    title: "Tiefbau & Erdbewegung",
    subtitle: "Kanalbau, Hausanschlüsse, Erdarbeiten",
    description: "Professionelle Baumaschinen für anspruchsvolle Tiefbauprojekte. Mit unseren Minibaggern, Dumpern und dem passenden Zubehör meisterst du jede Erdarbeit.",
    image: "/placeholder.svg",
    icon: Shovel,
    categories: ["erdbewegung", "verdichtung", "absperrtechnik", "anhaenger"],
    highlights: [
      "Minibagger 1t - 2,7t mit Anbaugeräten",
      "Elektro-Dumper für leisen Materialtransport",
      "Grabenräumlöffel & Tieflöffel",
      "Baumaschinenanhänger 1,8t - 3,5t",
      "Verkehrssicherung & Absperrung",
    ],
    color: "from-amber-500/20 to-amber-600/10",
  },
  {
    id: "hochbau-renovierung",
    title: "Hochbau & Renovierung",
    subtitle: "Neubau, Sanierung, Ausbau",
    description: "Vom Rohbau bis zum Feinschliff: Werkzeuge, Arbeitsbühnen und Gerüste für jede Bauphase. Unsere Profi-Geräte machen auch anspruchsvolle Projekte zum Kinderspiel.",
    image: "/placeholder.svg",
    icon: Building2,
    categories: ["werkzeuge", "arbeitsbuehnen", "leitern-gerueste", "heizung-trocknung"],
    highlights: [
      "Scherenbühnen bis 12m Höhe",
      "Rollgerüste bis 11m",
      "Abbruchhammer & Bohrhammer",
      "Bautrockner für die Trocknung",
    ],
    color: "from-blue-500/20 to-blue-600/10",
  },
  {
    id: "events-veranstaltungen",
    title: "Events & Veranstaltungen",
    subtitle: "Firmenfeiern, Hochzeiten, Festivals",
    description: "Alles für unvergessliche Events: Von der Beschallung über Beleuchtung bis zu Zelten und Möbeln. Wir statten Veranstaltungen jeder Größe professionell aus.",
    image: imgEventZelt,
    images: [imgEventZelt, imgEventGartenfest, imgEventIndoorPA, imgEventIBCLed, imgEventTraversen, imgEventGlaeser],
    icon: PartyPopper,
    categories: ["beschallung", "beleuchtung", "moebel-zelte", "geschirr-glaeser-besteck"],
    highlights: [
      "PA-Systeme & Soundboks",
      "LED-Beleuchtung & Moving Heads",
      "Partyzelte 3x3m bis 6x12m",
      "Geschirr, Gläser & Besteck",
    ],
    color: "from-purple-500/20 to-purple-600/10",
  },
  {
    id: "umzug-transport",
    title: "Umzug & Transport",
    subtitle: "Privat- und Firmenumzüge",
    description: "Unsere 24/7 Anhängermiete macht Umzüge flexibel und günstig. Per SMS-Code abholbereit – auch nachts und am Wochenende. Für jeden Transport der passende Anhänger.",
    image: "/placeholder.svg",
    icon: Truck,
    categories: ["anhaenger"],
    highlights: [
      "Planenanhänger S bis XXL",
      "Kofferanhänger abschließbar",
      "24/7 Self-Service-Miete",
      "Weekend-Tarif: 3 Tage zahlen, 1 Tag Preis",
    ],
    color: "from-orange-500/20 to-orange-600/10",
  },
  {
    id: "handwerk-gewerbe",
    title: "Handwerk & Gewerbe",
    subtitle: "Elektriker, Maler, Installateure",
    description: "Spezialwerkzeuge und Equipment für Handwerksbetriebe. Von der Mauerschlitzfräse bis zum Akku-Werkzeug – professionelle Geräte für professionelle Arbeit.",
    image: "/placeholder.svg",
    icon: Hammer,
    categories: ["werkzeuge", "leitern-gerueste", "kabel-stromverteiler", "aggregate"],
    highlights: [
      "Mauerschlitzfräse & Diamantbohrer",
      "Bosch Profi-Akkugeräte",
      "Stromerzeuger 2,8 - 100 kVA",
      "Rollgerüste & Leitern",
    ],
    color: "from-red-500/20 to-red-600/10",
  },
  {
    id: "private-projekte",
    title: "Private Projekte",
    subtitle: "Heimwerken, Garten, Renovierung",
    description: "Du hast ein Projekt? Wir haben das Equipment. Ob Terrassenbau, Gartenumgestaltung oder Renovierung – mit unseren Mietgeräten wird dein Projekt zum Erfolg.",
    image: "/placeholder.svg",
    icon: Home,
    categories: ["gartenpflege", "werkzeuge", "anhaenger", "verdichtung"],
    highlights: [
      "Vertikutierer & Häcksler",
      "Rüttelplatten für Pflasterarbeiten",
      "Anhänger für Grünschnitt",
      "Elektrowerkzeuge für Renovierung",
    ],
    color: "from-teal-500/20 to-teal-600/10",
  },
  {
    id: "kindergeburtstage",
    title: "Kindergeburtstage & Feste",
    subtitle: "Hüpfburgen, Spiele, Unterhaltung",
    description: "Mach den Kindergeburtstag zum unvergesslichen Erlebnis! Unsere Hüpfburgen, Spezialeffekte und Sound-Systeme bringen Kinderaugen zum Leuchten.",
    image: "/placeholder.svg",
    icon: Sparkles,
    categories: ["huepfburgen", "spezialeffekte", "beschallung"],
    highlights: [
      "Hüpfburgen 2,8m bis 6m",
      "Hüpfburg mit Wasserrutsche",
      "Nebelmaschine & Seifenblasen",
      "Mobile Soundboks-Lautsprecher",
    ],
    color: "from-pink-500/20 to-pink-600/10",
  },
];

function SolutionCard({ solution }: { solution: Solution }) {
  const Icon = solution.icon;
  
  return (
    <Link to={`/loesungen/${solution.id}`}>
      <Card className="h-full group hover:shadow-lg transition-all duration-300 overflow-hidden border-2 hover:border-primary/20">
        {/* Image */}
        <div className={`aspect-[16/10] bg-gradient-to-br ${solution.color} relative overflow-hidden`}>
          <img 
            src={solution.image} 
            alt={solution.title}
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Icon className="w-10 h-10 text-primary" />
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          {/* Title */}
          <h3 className="text-xl font-bold text-headline mb-1 group-hover:text-primary transition-colors">
            {solution.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">{solution.subtitle}</p>
          
          {/* Description */}
          <p className="text-body-text text-sm mb-4 line-clamp-3">
            {solution.description}
          </p>
          
          {/* Highlights */}
          <div className="space-y-1.5 mb-4">
            {solution.highlights.slice(0, 3).map((highlight, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="text-muted-foreground">{highlight}</span>
              </div>
            ))}
          </div>
          
          {/* CTA */}
          <div className="flex items-center text-primary font-medium text-sm group-hover:text-accent transition-colors">
            Mehr erfahren <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Loesungen() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary to-primary-800 py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5 bg-cover bg-center" />
        <div className="section-container relative z-10">
          <AnimatedSection animation="fade-in-up">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20">
              Lösungen für jedes Gewerk
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 max-w-3xl">
              Das richtige Equipment für <span className="text-accent">dein Projekt</span>
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mb-8">
              Egal ob Profi-Handwerker oder Hobby-Heimwerker – entdecke, welche Mietgeräte 
              perfekt zu deinem Vorhaben passen. Lass dich inspirieren!
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-12 lg:py-20">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up" className="mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-4">
              Finde die passende Lösung
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Wähle dein Gewerk oder Projekt und entdecke, welches Equipment wir für dich bereithalten.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {solutions.map((solution, index) => (
              <AnimatedSection
                key={solution.id}
                animation="fade-in-up"
                delay={index * 0.05}
              >
                <SolutionCard solution={solution} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-16 bg-surface-light">
        <div className="section-container">
          <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl p-8 lg:p-12 text-center">
            <AnimatedSection animation="fade-in-up">
              <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-4">
                Du hast ein spezielles Projekt?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                Wir beraten dich gerne persönlich und stellen dir das perfekte Equipment-Paket zusammen. 
                Ob Großbaustelle oder Privatprojekt – wir finden die optimale Lösung.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/kontakt">
                  <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Beratung anfragen
                  </Button>
                </Link>
                <Link to="/standorte">
                  <Button size="lg" variant="outline">
                    Standorte finden
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </Layout>
  );
}

// Export solutions data for use in detail pages
export { solutions };
export type { Solution };
