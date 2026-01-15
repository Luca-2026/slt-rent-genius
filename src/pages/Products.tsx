import { Layout } from "@/components/layout";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Filter,
  Search,
  ArrowRight
} from "lucide-react";

// Category Icons
import iconBagger from "@/assets/icons/category-bagger.png";
import iconVerdichtung from "@/assets/icons/category-verdichtung.png";
import iconBuehne from "@/assets/icons/category-buehne.png";
import iconMoebelZelte from "@/assets/icons/category-moebel-zelte.png";
import iconGeschirr from "@/assets/icons/category-geschirr-neu.png";
import iconBesteck from "@/assets/icons/category-besteck.png";
import iconHuepfburg from "@/assets/icons/category-huepfburg.png";
import iconSpezialeffekte from "@/assets/icons/category-spezialeffekte.png";
import iconAbsperrgitter from "@/assets/icons/category-absperrgitter.png";
import iconAggregat from "@/assets/icons/category-aggregat.png";
import iconBeleuchtung from "@/assets/icons/category-beleuchtung.png";
import iconAnhaenger from "@/assets/icons/category-anhaenger.png";
import iconHeizung from "@/assets/icons/category-heizung.png";
import iconKabel from "@/assets/icons/category-kabel.png";
import iconHebebuehne from "@/assets/icons/category-hebebuehne.png";
import iconLedSpots from "@/assets/icons/category-ledspots.png";

const categories = [
  {
    id: "bagger-radlader",
    title: "Bagger & Radlader",
    description: "Minibagger, Radlader und Erdbaumaschinen für jedes Bauvorhaben.",
    image: iconBagger,
  },
  {
    id: "verdichtung",
    title: "Verdichtung",
    description: "Rüttelplatten, Stampfer und Walzen für professionelle Bodenverdichtung.",
    image: iconVerdichtung,
  },
  {
    id: "anhaenger",
    title: "Anhänger",
    description: "Pkw-Anhänger, Kipper, Maschinentransporter und Transportanhänger.",
    image: iconAnhaenger,
  },
  {
    id: "hebebuehnen",
    title: "Hebebühnen & Arbeitsbühnen",
    description: "Scherenbühnen, Teleskopbühnen und Gelenkbühnen für Höhenarbeiten.",
    image: iconHebebuehne,
  },
  {
    id: "buehnen-podeste",
    title: "Bühnen & Podeste",
    description: "Event-Bühnen, Podeste und Laufstege für Veranstaltungen.",
    image: iconBuehne,
  },
  {
    id: "moebel-zelte",
    title: "Möbel & Zelte",
    description: "Partyzelte, Bierzeltgarnituren, Stehtische und Event-Mobiliar.",
    image: iconMoebelZelte,
  },
  {
    id: "geschirr",
    title: "Geschirr",
    description: "Teller, Schalen, Gläser und Tassen für Ihre Veranstaltung.",
    image: iconGeschirr,
  },
  {
    id: "besteck",
    title: "Besteck",
    description: "Messer, Gabeln und Löffel für Events und Feiern.",
    image: iconBesteck,
  },
  {
    id: "huepfburgen",
    title: "Hüpfburgen",
    description: "Aufblasbare Hüpfburgen und Spiele für Kinderveranstaltungen.",
    image: iconHuepfburg,
  },
  {
    id: "spezialeffekte",
    title: "Spezialeffekte",
    description: "Nebelmaschinen, Seifenblasen, Funkeneffekte und Fotobooth.",
    image: iconSpezialeffekte,
  },
  {
    id: "led-spots",
    title: "LED Spots & Effektlicht",
    description: "Moving Heads, PAR-Scheinwerfer und Bühnenlicht für Events.",
    image: iconLedSpots,
  },
  {
    id: "beleuchtung",
    title: "Beleuchtung & Flutlicht",
    description: "Baustellenstrahler, Flutlichtmasten und mobile Beleuchtung.",
    image: iconBeleuchtung,
  },
  {
    id: "stromerzeuger",
    title: "Stromerzeuger",
    description: "Aggregate und Notstromgeräte für Baustelle und Event.",
    image: iconAggregat,
  },
  {
    id: "heizung-klima",
    title: "Heizung & Klima",
    description: "Heizlüfter, Heizpilze und Klimageräte für jede Situation.",
    image: iconHeizung,
  },
  {
    id: "kabel-leitungen",
    title: "Kabel & Leitungen",
    description: "Verlängerungskabel, Kabelbrücken und Stromverteiler.",
    image: iconKabel,
  },
  {
    id: "absperrung-sicherheit",
    title: "Absperrung & Sicherheit",
    description: "Absperrgitter, Bauzäune, Warnbaken und Sicherheitsequipment.",
    image: iconAbsperrgitter,
  },
];

const featuredProducts = [
  { id: "1", name: "Minibagger 1,5t", category: "Bagger & Radlader", price: "ab 120€/Tag", image: "/placeholder.svg" },
  { id: "2", name: "Rüttelplatte 90kg", category: "Verdichtung", price: "ab 45€/Tag", image: "/placeholder.svg" },
  { id: "3", name: "Partyzelt 6x12m", category: "Möbel & Zelte", price: "ab 150€/Tag", image: "/placeholder.svg" },
  { id: "4", name: "Hüpfburg Burg", category: "Hüpfburgen", price: "ab 120€/Tag", image: "/placeholder.svg" },
  { id: "5", name: "Nebelmaschine Pro", category: "Spezialeffekte", price: "ab 35€/Tag", image: "/placeholder.svg" },
  { id: "6", name: "Absperrgitter 10er Set", category: "Absperrung", price: "ab 25€/Tag", image: "/placeholder.svg" },
];

export default function Products() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-12 lg:py-16">
        <div className="section-container">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Unsere Mietprodukte
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mb-6">
            Über 800 Produkte in 5 Kategorien – von Baumaschinen bis Event-Equipment. 
            Alles online buchbar mit transparenten Preisen.
          </p>
          
          {/* Search */}
          <div className="bg-background rounded-xl p-4 max-w-2xl">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Produkt suchen..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 lg:py-16">
        <div className="section-container">
          <h2 className="text-2xl font-bold text-headline mb-8">Kategorien</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link key={category.id} to={`/produkte/${category.id}`}>
                <Card className="category-card h-full group">
                  <div className="aspect-[16/9] bg-muted relative overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="font-bold text-lg text-white">{category.title}</span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                    <Button variant="link" className="p-0 mt-2 text-primary group-hover:text-accent">
                      Kategorie ansehen <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 lg:py-16 bg-surface-light">
        <div className="section-container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-headline">Beliebte Produkte</h2>
            <Button variant="outline" size="sm">
              Alle anzeigen
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} to={`/produkte/detail/${product.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow group">
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden rounded-t-lg">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Rentware Widget Placeholder */}
                    <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-2 py-1 rounded text-xs font-medium">
                      Verfügbar
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <span className="text-xs text-muted-foreground">{product.category}</span>
                    <h3 className="font-semibold text-headline mt-1">{product.name}</h3>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-primary font-bold">{product.price}</span>
                      <Button size="sm" className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                        Mieten
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Rentware Info */}
          <div className="mt-12 p-6 bg-background rounded-xl border border-border">
            <p className="text-center text-muted-foreground">
              <strong className="text-headline">Hinweis:</strong> Die Produktverfügbarkeit und Buchung wird über Rentware gesteuert. 
              Die Widgets werden hier nach Integration angezeigt.
            </p>
          </div>
        </div>
      </section>

      {/* Weekend Tarif Info */}
      <section className="py-12 lg:py-16">
        <div className="section-container">
          <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl p-8 lg:p-12">
            <div className="max-w-2xl">
              <span className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium mb-4">
                💰 Spare mit unserem Weekend-Tarif
              </span>
              <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-4">
                Freitag leihen, Montag zurückgeben – nur 1 Tag zahlen!
              </h2>
              <p className="text-muted-foreground mb-6">
                Bei vielen Produkten gilt unser beliebter Weekend-Tarif: Du holst Freitagmittag ab 
                und bringst das Gerät Montag früh zurück – bezahlt wird nur ein Miettag.
              </p>
              <Link to="/so-funktionierts">
                <Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                  Mehr zum Weekend-Tarif
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
