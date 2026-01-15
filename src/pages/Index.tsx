import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Truck, 
  CheckCircle2,
  ArrowRight,
  MapPin,
  Clock,
  Phone
} from "lucide-react";

// Category Icons
import iconBagger from "@/assets/icons/category-bagger.png";
import iconAnhaenger from "@/assets/icons/category-anhaenger.png";
import iconHebebuehne from "@/assets/icons/category-hebebuehne.png";
import iconMoebelZelte from "@/assets/icons/category-moebel-zelte.png";
import iconHuepfburg from "@/assets/icons/category-huepfburg.png";
import iconHeizung from "@/assets/icons/category-heizung.png";

const categories = [
  {
    id: "bagger-radlader",
    title: "Bagger & Radlader",
    description: "Minibagger, Radlader & Erdbaumaschinen",
    image: iconBagger,
  },
  {
    id: "anhaenger",
    title: "Anhänger",
    description: "Pkw-Anhänger, Kipper, Transportanhänger",
    image: iconAnhaenger,
  },
  {
    id: "hebebuehnen",
    title: "Arbeitsbühnen",
    description: "Scherenbühnen, Teleskopbühnen, Gelenkbühnen",
    image: iconHebebuehne,
  },
  {
    id: "moebel-zelte",
    title: "Event-Equipment",
    description: "Zelte, Möbel, Bühnen & Technik",
    image: iconMoebelZelte,
  },
  {
    id: "huepfburgen",
    title: "Hüpfburgen",
    description: "Aufblasbare Attraktionen für Events",
    image: iconHuepfburg,
  },
  {
    id: "heizung-klima",
    title: "Heizung & Klima",
    description: "Heizlüfter, Heizpilze, Klimageräte",
    image: iconHeizung,
  },
];

const steps = [
  {
    number: "1",
    title: "Zeitraum & Standort wählen",
    description: "Wähle deinen Mietstandort und den gewünschten Zeitraum aus.",
  },
  {
    number: "2",
    title: "Gerät auswählen",
    description: "Finde das passende Equipment in unserem Katalog.",
  },
  {
    number: "3",
    title: "Verfügbarkeit prüfen",
    description: "Prüfe die Verfügbarkeit in Echtzeit.",
  },
  {
    number: "4",
    title: "Buchen & Bezahlen",
    description: "Schließe die Buchung online ab.",
  },
  {
    number: "5",
    title: "Abholen oder liefern lassen",
    description: "Hole dein Equipment ab oder lass es dir liefern.",
  },
];

const trustItems = [
  { value: "+3.500", label: "zufriedene Kunden" },
  { value: "+800", label: "Mietprodukte" },
  { value: "3", label: "Standorte in NRW" },
  { value: "seit 2016", label: "dein Partner" },
];

const locations = [
  {
    id: "krefeld",
    name: "Krefeld",
    subtitle: "Hauptsitz",
    address: "Anrather Straße 291, 47807 Krefeld-Fichtenhain",
    phone: "02151 417 990 4",
    email: "krefeld@slt-rental.de",
    hours: "24/7 für Sie erreichbar",
  },
  {
    id: "bonn",
    name: "Bonn",
    subtitle: "Filiale",
    address: "Drachenburgstraße 8, 53179 Bonn",
    phone: "0228 50466061",
    email: "bonn@slt-rental.de",
    hours: "24/7 für Sie erreichbar",
  },
  {
    id: "muelheim",
    name: "Mülheim an der Ruhr",
    subtitle: "Filiale",
    address: "Ruhrorter Str. 100, 45478 Mülheim an der Ruhr",
    phone: "02151 417 99 04",
    email: "krefeld@slt-rental.de",
    hours: "24/7 für Sie erreichbar",
  },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-primary py-16 lg:py-24">
        <div className="section-container">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 leading-tight">
              Baumaschinen & Equipment mieten – 
              <span className="text-accent"> einfach, schnell, zuverlässig</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl">
              Über 800 Mietprodukte an 3 Standorten in NRW. Von Bagger bis Anhänger – 
              alles online buchbar mit Weekend-Tarifen.
            </p>

            {/* Search Box */}
            <div className="bg-background rounded-xl p-4 shadow-xl max-w-2xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Was möchtest du mieten? z.B. Minibagger, Anhänger..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-3">
                  Suchen
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs text-muted-foreground">Beliebte Suchen:</span>
                <Link to="/produkte/minibagger" className="text-xs text-primary hover:text-accent">Minibagger</Link>
                <Link to="/produkte/anhaenger" className="text-xs text-primary hover:text-accent">Pkw-Anhänger</Link>
                <Link to="/produkte/arbeitsbuehnen" className="text-xs text-primary hover:text-accent">Scherenbühne</Link>
                <Link to="/produkte/bautrockner" className="text-xs text-primary hover:text-accent">Bautrockner</Link>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Trust Badges */}
      <section className="py-8 bg-muted border-b border-border">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustItems.map((item) => (
              <div key={item.label} className="text-center">
                <span className="block text-2xl lg:text-3xl font-bold text-primary">{item.value}</span>
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 lg:py-20">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-3">
              Unsere Produktkategorien
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Von Baumaschinen über Anhänger bis hin zu Event-Equipment – 
              finde das passende Mietgerät für dein Projekt.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link key={category.id} to={`/produkte/${category.id}`}>
                <Card className="h-full group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                  <div className="aspect-square bg-muted relative overflow-hidden rounded-t-lg flex items-center justify-center p-3">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-headline mb-1 text-sm">{category.title}</h3>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/produkte">
              <Button variant="outline" size="lg" className="group">
                Alle Produkte ansehen
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 lg:py-20 bg-muted">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-3">
              So einfach funktioniert's
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              In 5 einfachen Schritten zu deinem Mietgerät – 
              online buchen, vor Ort abholen oder liefern lassen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="bg-background rounded-xl p-6 h-full border border-border">
                  <div className="w-10 h-10 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold text-lg mb-4">
                    {step.number}
                  </div>
                  <h3 className="font-semibold text-headline mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 h-6 w-6 text-muted-foreground -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/so-funktionierts">
              <Button variant="link" className="text-primary">
                Mehr erfahren <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-16 lg:py-20">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-3">
              Unsere Standorte
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              3 Standorte in NRW – immer in deiner Nähe. 
              Persönliche Beratung und schnelle Abholung garantiert.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locations.map((location) => (
              <Link key={location.id} to={`/standorte/${location.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-headline">{location.name}</h3>
                        <span className="text-sm text-accent font-medium">{location.subtitle}</span>
                      </div>
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>{location.address}</p>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{location.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{location.hours}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/standorte">
              <Button variant="outline">
                Alle Standorte anzeigen
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-primary">
        <div className="section-container text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-primary-foreground mb-4">
            Bereit für dein nächstes Projekt?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Ob Privatperson oder Unternehmen – bei uns findest du das passende Equipment. 
            Jetzt online buchen oder persönlich beraten lassen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/produkte">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-3">
                Jetzt Equipment mieten
              </Button>
            </Link>
            <Link to="/b2b">
              <Button className="bg-white text-primary hover:bg-white/90 px-8 py-3">
                B2B-Konditionen anfragen
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-20 bg-muted">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: CheckCircle2, title: "Faire Preise", text: "Transparente Tagessätze inkl. Weekend-Tarifen" },
              { icon: Truck, title: "Lieferung möglich", text: "Bequem direkt auf deine Baustelle" },
              { icon: Clock, title: "Flexible Mietzeiten", text: "Von einem Tag bis mehrere Wochen" },
              { icon: Phone, title: "Persönliche Beratung", text: "Kompetente Ansprechpartner vor Ort" },
            ].map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                  <benefit.icon className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-headline mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
