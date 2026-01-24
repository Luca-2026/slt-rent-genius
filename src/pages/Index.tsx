import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/ui/animated-section";
import { CountUpBadge } from "@/components/ui/count-up-badge";
import { HeroSearch } from "@/components/home/HeroSearch";
import { 
  Search, 
  Truck, 
  CheckCircle2,
  ArrowRight,
  MapPin,
  Clock,
  Phone,
  Calendar,
  ShoppingCart,
  CreditCard,
  Package
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
    icon: Calendar,
    title: "Zeitraum wählen",
    description: "Wähle deinen Standort und Mietzeitraum.",
  },
  {
    number: "2",
    icon: Search,
    title: "Gerät finden",
    description: "Durchsuche unseren Katalog nach Equipment.",
  },
  {
    number: "3",
    icon: ShoppingCart,
    title: "Online buchen",
    description: "Schließe die Buchung einfach online ab.",
  },
  {
    number: "4",
    icon: CreditCard,
    title: "Bezahlen",
    description: "Zahle sicher per Karte oder vor Ort.",
  },
  {
    number: "5",
    icon: Package,
    title: "Abholen",
    description: "Hole ab oder lass liefern.",
  },
];

const trustItems = [
  { value: 3500, label: "zufriedene Kunden", prefix: "+", isCounter: true },
  { value: 800, label: "Mietprodukte", prefix: "+", isCounter: true },
  { value: 3, label: "Standorte in NRW", prefix: "", isCounter: true },
  { value: 2016, label: "dein Partner", prefix: "seit ", isCounter: false },
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

            {/* Interactive Search with Location Selection */}
            <HeroSearch />
          </div>
        </div>

      </section>

      {/* Trust Badges with CountUp */}
      <section className="py-10 bg-background border-b border-border">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustItems.map((item, index) => (
              <AnimatedSection key={item.label} delay={index * 100} animation="fade-in-up">
                {item.isCounter ? (
                  <CountUpBadge
                    value={item.value}
                    label={item.label}
                    prefix={item.prefix}
                  />
                ) : (
                  <div className="text-center">
                    <span className="block text-3xl lg:text-4xl font-bold text-primary tabular-nums">
                      {item.prefix}{item.value}
                    </span>
                    <span className="text-sm text-muted-foreground mt-1 block">{item.label}</span>
                  </div>
                )}
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 lg:py-20">
        <div className="section-container">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-3">
              Unsere Produktkategorien
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Von Baumaschinen über Anhänger bis hin zu Event-Equipment – 
              finde das passende Mietgerät für dein Projekt.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <AnimatedSection key={category.id} delay={index * 50} animation="scale-in">
                <Link to={`/produkte/${category.id}`}>
                  <Card className="h-full group hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-accent/20">
                    <div className="aspect-square bg-gradient-to-br from-muted to-surface-light relative overflow-hidden rounded-t-lg flex items-center justify-center p-4">
                      <img
                        src={category.image}
                        alt={category.title}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-4 bg-gradient-to-b from-transparent to-muted/30">
                      <h3 className="font-semibold text-headline mb-1 text-sm group-hover:text-primary transition-colors">{category.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{category.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="text-center mt-10" delay={300}>
            <Link to="/produkte">
              <Button variant="outline" size="lg" className="group border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground">
                Alle Produkte ansehen
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* How it Works - Redesigned */}
      <section className="py-20 lg:py-28 bg-surface-light overflow-hidden">
        <div className="section-container">
          <AnimatedSection className="text-center mb-14">
            <span className="inline-block bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-accent/20">
              In 5 Schritten zum Mietgerät
            </span>
            <h2 className="text-2xl lg:text-4xl font-bold text-headline mb-3">
              So einfach funktioniert's
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Online buchen, vor Ort abholen oder liefern lassen.
            </p>
          </AnimatedSection>

          {/* Steps Timeline */}
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 rounded-full" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative">
              {steps.map((step, index) => (
                <AnimatedSection key={step.number} delay={index * 100} animation="fade-in-up">
                  <div className="relative group">
                    {/* Step Card */}
                    <div className="bg-card rounded-2xl p-6 h-full border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      {/* Icon Circle */}
                      <div className="w-14 h-14 bg-primary text-primary-foreground rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 group-hover:bg-accent transition-all duration-300">
                        <step.icon className="h-6 w-6" />
                      </div>
                      
                      {/* Step Number */}
                      <span className="text-xs font-bold text-accent uppercase tracking-wider mb-2 block">
                        Schritt {step.number}
                      </span>
                      
                      <h3 className="font-bold text-headline mb-2 text-lg">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    
                    {/* Arrow */}
                    {index < steps.length - 1 && (
                      <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 h-5 w-5 text-accent -translate-y-1/2 z-10" />
                    )}
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>

          <AnimatedSection className="text-center mt-12" delay={500}>
            <Link to="/so-funktionierts">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group">
                Mehr erfahren
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Locations */}
      <section className="py-16 lg:py-20 bg-surface-light">
        <div className="section-container">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-3">
              Unsere Standorte
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              3 Standorte in NRW – immer in deiner Nähe. 
              Persönliche Beratung und schnelle Abholung garantiert.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locations.map((location, index) => (
              <AnimatedSection key={location.id} delay={index * 100} animation="slide-in-left">
                <Link to={`/standorte/${location.id}`}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 group border-2 border-transparent hover:border-primary/20 overflow-hidden">
                    <CardContent className="p-6 relative">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-6 -mt-6 group-hover:bg-primary/10 transition-colors" />
                      <div className="flex items-start justify-between mb-4 relative">
                        <div>
                          <h3 className="font-bold text-lg text-headline group-hover:text-primary transition-colors">{location.name}</h3>
                          <span className="text-sm text-accent font-medium">{location.subtitle}</span>
                        </div>
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          <MapPin className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <p className="font-medium">{location.address}</p>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-accent" />
                          <span>{location.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-accent" />
                          <span>{location.hours}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="text-center mt-10" delay={300}>
            <Link to="/standorte">
              <Button variant="outline" className="group border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground">
                Alle Standorte anzeigen
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-card border-y border-border relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-40 h-40 border border-border rounded-full opacity-50" />
          <div className="absolute bottom-10 right-10 w-60 h-60 border border-border rounded-full opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-accent/20 rounded-full opacity-30" />
        </div>
        
        <div className="section-container text-center relative">
          <AnimatedSection>
            <h2 className="text-3xl lg:text-4xl font-bold text-headline mb-4">
              Bereit für dein nächstes Projekt?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-10 text-lg">
              Ob Privatperson oder Unternehmen – bei uns findest du das passende Equipment. 
              Jetzt online buchen oder persönlich beraten lassen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/produkte">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  Jetzt Equipment mieten
                </Button>
              </Link>
              <Link to="/b2b">
                <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-10 py-6 text-lg transition-all duration-300 hover:-translate-y-1">
                  B2B-Konditionen anfragen
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: CheckCircle2, title: "Faire Preise", text: "Transparente Tagessätze inkl. Weekend-Tarifen" },
              { icon: Truck, title: "Lieferung möglich", text: "Bequem direkt auf deine Baustelle" },
              { icon: Clock, title: "Flexible Mietzeiten", text: "Von einem Tag bis mehrere Wochen" },
              { icon: Phone, title: "Persönliche Beratung", text: "Kompetente Ansprechpartner vor Ort" },
            ].map((benefit, index) => (
              <AnimatedSection key={benefit.title} delay={index * 100} animation="fade-in-up">
                <div className="flex items-start gap-4 group">
                  <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl flex items-center justify-center shrink-0 group-hover:from-accent group-hover:to-accent/80 transition-all duration-300">
                    <benefit.icon className="h-7 w-7 text-accent group-hover:text-accent-foreground transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-headline mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.text}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
