import { Layout } from "@/components/layout";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect } from "react";

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

// Category mapping with Rentware tags
const categories = [
  {
    id: "bagger-radlader",
    title: "Bagger & Radlader",
    description: "Minibagger, Radlader und Erdbaumaschinen für jedes Bauvorhaben.",
    image: iconBagger,
    rentwareTag: "Bagger, Radlader",
  },
  {
    id: "verdichtung",
    title: "Verdichtung",
    description: "Rüttelplatten, Stampfer und Walzen für professionelle Bodenverdichtung.",
    image: iconVerdichtung,
    rentwareTag: "Verdichtung",
  },
  {
    id: "anhaenger",
    title: "Anhänger",
    description: "Pkw-Anhänger, Kipper, Maschinentransporter und Transportanhänger.",
    image: iconAnhaenger,
    rentwareTag: "Anhänger",
  },
  {
    id: "hebebuehnen",
    title: "Hebebühnen & Arbeitsbühnen",
    description: "Scherenbühnen, Teleskopbühnen und Gelenkbühnen für Höhenarbeiten.",
    image: iconHebebuehne,
    rentwareTag: "Hebebühne, Arbeitsbühne",
  },
  {
    id: "buehnen-podeste",
    title: "Bühnen & Podeste",
    description: "Event-Bühnen, Podeste und Laufstege für Veranstaltungen.",
    image: iconBuehne,
    rentwareTag: "Bühne, Podest",
  },
  {
    id: "moebel-zelte",
    title: "Möbel & Zelte",
    description: "Partyzelte, Bierzeltgarnituren, Stehtische und Event-Mobiliar.",
    image: iconMoebelZelte,
    rentwareTag: "Möbel, Zelte",
  },
  {
    id: "geschirr",
    title: "Geschirr",
    description: "Teller, Schalen, Gläser und Tassen für Ihre Veranstaltung.",
    image: iconGeschirr,
    rentwareTag: "Geschirr",
  },
  {
    id: "besteck",
    title: "Besteck",
    description: "Messer, Gabeln und Löffel für Events und Feiern.",
    image: iconBesteck,
    rentwareTag: "Besteck",
  },
  {
    id: "huepfburgen",
    title: "Hüpfburgen",
    description: "Aufblasbare Hüpfburgen und Spiele für Kinderveranstaltungen.",
    image: iconHuepfburg,
    rentwareTag: "Hüpfburg",
  },
  {
    id: "spezialeffekte",
    title: "Spezialeffekte",
    description: "Nebelmaschinen, Seifenblasen, Funkeneffekte und Fotobooth.",
    image: iconSpezialeffekte,
    rentwareTag: "Spezialeffekte",
  },
  {
    id: "led-spots",
    title: "LED Spots & Effektlicht",
    description: "Moving Heads, PAR-Scheinwerfer und Bühnenlicht für Events.",
    image: iconLedSpots,
    rentwareTag: "LED, Effektlicht",
  },
  {
    id: "beleuchtung",
    title: "Beleuchtung & Flutlicht",
    description: "Baustellenstrahler, Flutlichtmasten und mobile Beleuchtung.",
    image: iconBeleuchtung,
    rentwareTag: "Beleuchtung, Flutlicht",
  },
  {
    id: "stromerzeuger",
    title: "Stromerzeuger",
    description: "Aggregate und Notstromgeräte für Baustelle und Event.",
    image: iconAggregat,
    rentwareTag: "Stromerzeuger, Aggregat",
  },
  {
    id: "heizung-klima",
    title: "Heizung & Klima",
    description: "Heizlüfter, Heizpilze und Klimageräte für jede Situation.",
    image: iconHeizung,
    rentwareTag: "Heizung, Klima",
  },
  {
    id: "kabel-leitungen",
    title: "Kabel & Leitungen",
    description: "Verlängerungskabel, Kabelbrücken und Stromverteiler.",
    image: iconKabel,
    rentwareTag: "Kabel, Leitungen",
  },
  {
    id: "absperrung-sicherheit",
    title: "Absperrung & Sicherheit",
    description: "Absperrgitter, Bauzäune, Warnbaken und Sicherheitsequipment.",
    image: iconAbsperrgitter,
    rentwareTag: "Absperrung, Sicherheit",
  },
];

// Rentware locations string
const RENTWARE_LOCATIONS = "01929004-e24f-7cc0-83f0-0f3d3431395e, 01953e5f-614f-743d-8eb9-1a0e865da81d, 01961b40-d0ae-7851-b5ef-141eb74b5c2d, 0197324e-b97d-77ce-b915-79f392ad1408, 612aa84f-f7f5-4fe7-7e35-713f4bce48e5, 95e16e54-04d2-496a-6002-41e0289b53a3";

// Rentware Search Widget Component
function RentwareSearch({ tag }: { tag?: string }) {
  useEffect(() => {
    // Force re-render of custom element when tag changes
    const container = document.getElementById('rentware-search-container');
    if (container) {
      container.innerHTML = '';
      const searchElement = document.createElement('rtr-search');
      searchElement.setAttribute('view', 'cards');
      searchElement.setAttribute('show-location', 'on');
      searchElement.setAttribute('load-behaviour', 'extended');
      searchElement.setAttribute('locations', RENTWARE_LOCATIONS);
      if (tag) {
        searchElement.setAttribute('show-only-tags', tag);
      }
      container.appendChild(searchElement);
    }
  }, [tag]);

  return <div id="rentware-search-container" className="min-h-[400px]" />;
}

export default function Products() {
  const { category } = useParams<{ category?: string }>();
  const selectedCategory = categories.find(c => c.id === category);

  // If a category is selected, show the category detail view with Rentware
  if (selectedCategory) {
    return (
      <Layout>
        {/* Category Header */}
        <section className="bg-primary py-8 lg:py-12">
          <div className="section-container">
            <Link 
              to="/produkte" 
              className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zur Übersicht
            </Link>
            
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-background rounded-xl p-3 flex items-center justify-center">
                <img 
                  src={selectedCategory.image} 
                  alt={selectedCategory.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-primary-foreground">
                  {selectedCategory.title}
                </h1>
                <p className="text-primary-foreground/80 mt-1">
                  {selectedCategory.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Rentware Products */}
        <section className="py-8 lg:py-12">
          <div className="section-container">
            <RentwareSearch tag={selectedCategory.rentwareTag} />
          </div>
        </section>

        {/* Other Categories */}
        <section className="py-8 lg:py-12 bg-surface-light">
          <div className="section-container">
            <h2 className="text-xl font-bold text-headline mb-6">Weitere Kategorien</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories
                .filter(c => c.id !== selectedCategory.id)
                .slice(0, 8)
                .map((cat) => (
                  <Link key={cat.id} to={`/produkte/${cat.id}`}>
                    <Card className="h-full hover:shadow-md transition-shadow group">
                      <div className="aspect-square bg-muted flex items-center justify-center p-4">
                        <img 
                          src={cat.image} 
                          alt={cat.title}
                          className="w-3/4 h-3/4 object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium text-sm text-headline text-center">{cat.title}</h3>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // Main products overview
  return (
    <Layout>
      {/* Hero with Rentware Search */}
      <section className="bg-primary py-12 lg:py-16">
        <div className="section-container">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Unsere Mietprodukte
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mb-6">
            Über 800 Produkte in 16 Kategorien – von Baumaschinen bis Event-Equipment. 
            Alles online buchbar mit transparenten Preisen.
          </p>
        </div>
      </section>

      {/* Rentware Full Search */}
      <section className="py-8 lg:py-12 bg-surface-light">
        <div className="section-container">
          <h2 className="text-2xl font-bold text-headline mb-6">Produkte suchen & buchen</h2>
          <RentwareSearch />
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 lg:py-16">
        <div className="section-container">
          <h2 className="text-2xl font-bold text-headline mb-8">Kategorien</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/produkte/${cat.id}`}>
                <Card className="category-card h-full group">
                  <div className="aspect-square bg-muted relative overflow-hidden flex items-center justify-center p-4">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-headline">{cat.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
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

      {/* Weekend Tarif Info */}
      <section className="py-12 lg:py-16 bg-surface-light">
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
