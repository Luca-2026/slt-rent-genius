import { useParams, Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/ui/animated-section";
import { 
  MapPin, 
  Phone, 
  ArrowRight, 
  Truck, 
  Clock, 
  CheckCircle2,
  Package,
  Calendar
} from "lucide-react";
import { getAreaBySlug, type LocalArea } from "@/data/localSeoData";
import { getLocationInfoById } from "@/data/locationData";

// Popular rental categories for SEO
const rentalCategories = [
  { id: "anhaenger", name: "Anhänger", description: "Planen-, Koffer- und Baumaschinenanhänger" },
  { id: "erdbewegung", name: "Erdbewegung", description: "Minibagger, Radlader, Dumper" },
  { id: "werkzeuge", name: "Werkzeuge", description: "Bohrhammer, Trennschleifer, Akku-Werkzeuge" },
  { id: "gartenpflege", name: "Gartenpflege", description: "Erdbohrer, Häcksler, Vertikutierer" },
];

const benefits = [
  { icon: Truck, title: "Lieferung möglich", text: "Direkt auf Ihre Baustelle" },
  { icon: Clock, title: "Flexible Mietzeiten", text: "Ab 1 Tag bis mehrere Wochen" },
  { icon: CheckCircle2, title: "Faire Preise", text: "Inkl. Weekend-Tarifen" },
  { icon: Package, title: "Große Auswahl", text: "Über 800 Mietprodukte" },
];

export default function LocalAreaPage() {
  const { areaSlug } = useParams<{ areaSlug: string }>();
  
  const area = areaSlug ? getAreaBySlug(areaSlug) : undefined;
  
  if (!area) {
    return <Navigate to="/standorte" replace />;
  }

  const location = getLocationInfoById(area.locationId);

  // Generate SEO-optimized title and meta
  const pageTitle = `Baumaschinen & Anhänger mieten in ${area.name} | SLT Rental`;
  const metaDescription = area.description;

  return (
    <Layout>
      {/* SEO Meta */}
      <title>{pageTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={area.keywords.join(", ")} />

      {/* Hero Section */}
      <section className="bg-primary py-12 lg:py-20">
        <div className="section-container">
          <AnimatedSection>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-primary-foreground/60 mb-6">
              <Link to="/" className="hover:text-accent transition-colors">Home</Link>
              <span>/</span>
              <Link to="/standorte" className="hover:text-accent transition-colors">Standorte</Link>
              <span>/</span>
              <span className="text-primary-foreground">{area.name}</span>
            </nav>

            <h1 className="text-3xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Baumaschinen & Anhänger mieten in {area.name}
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-3xl mb-6">
              {area.description}
            </p>

            {location && (
              <div className="flex flex-wrap items-center gap-4 text-primary-foreground/80">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent" />
                  <span>Nächster Standort: <strong className="text-primary-foreground">{location.name}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-accent" />
                  <span>Nur <strong className="text-primary-foreground">{area.distance} km</strong> entfernt</span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 mt-8">
              <Link to={`/mieten/${area.locationId}`}>
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Calendar className="h-5 w-5 mr-2" />
                  Jetzt Equipment mieten
                </Button>
              </Link>
              <Link to="/kontakt">
                <Button size="lg" variant="outline" className="border-primary text-primary bg-primary-foreground hover:border-accent hover:bg-primary-foreground hover:text-primary">
                  <Phone className="h-5 w-5 mr-2" />
                  Beratung anfragen
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-10 bg-surface-light border-b border-border">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <AnimatedSection key={benefit.title} delay={index * 100} animation="fade-in-up">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    <benefit.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-headline text-sm">{benefit.title}</h3>
                    <p className="text-xs text-muted-foreground">{benefit.text}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Rental Categories */}
      <section className="py-16 lg:py-20">
        <div className="section-container">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-3">
              Mietkategorien für {area.name}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Entdecken Sie unser umfangreiches Sortiment an Mietgeräten – verfügbar zur Abholung in {location?.name || "unserer Filiale"} 
              oder mit Lieferung nach {area.name}.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {rentalCategories.map((category, index) => (
              <AnimatedSection key={category.id} delay={index * 100} animation="fade-in-up">
                <Link to={`/mieten/${area.locationId}/${category.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group border-2 border-transparent hover:border-primary/20">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-headline text-lg mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {category.description}
                      </p>
                      <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:text-accent transition-colors">
                        Produkte ansehen
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="text-center mt-10" delay={400}>
            <Link to={`/mieten/${area.locationId}`}>
              <Button variant="outline" size="lg" className="group">
                Alle Kategorien ansehen
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Location Info Card */}
      {location && (
        <section className="py-16 lg:py-20 bg-surface-light">
          <div className="section-container">
            <div className="max-w-3xl mx-auto">
              <AnimatedSection>
                <Card className="overflow-hidden">
                  <CardContent className="p-8">
                    <h2 className="text-xl font-bold text-headline mb-6">
                      Ihr SLT Standort für {area.name}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-headline mb-3">SLT Rental {location.name}</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                            <span>{location.address}, {location.city}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-primary shrink-0" />
                            <a href={`tel:${location.phone.replace(/\s/g, "")}`} className="hover:text-primary transition-colors">
                              {location.phone}
                            </a>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-headline mb-3">Öffnungszeiten</h3>
                        <div className="space-y-1 text-sm">
                          {location.hours.map((h, idx) => (
                            <div key={idx} className="flex justify-between text-muted-foreground">
                              <span>{h.day}</span>
                              <span className="font-medium">{h.time}</span>
                            </div>
                          ))}
                        </div>
                        {location.hoursNote && (
                          <p className="text-xs text-muted-foreground mt-2">{location.hoursNote}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border">
                      <Link to={`/mieten/${location.id}`}>
                        <Button className="bg-primary hover:bg-primary/90">
                          Produkte ansehen
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <a href={location.mapUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">
                          <MapPin className="mr-2 h-4 w-4" />
                          Route planen
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </section>
      )}

      {/* SEO Content */}
      <section className="py-16 lg:py-20">
        <div className="section-container">
          <div className="max-w-3xl mx-auto prose prose-sm">
            <AnimatedSection>
              <h2 className="text-xl font-bold text-headline mb-4">
                Baumaschinen und Anhänger mieten in {area.name} – SLT Rental
              </h2>
              <p className="text-muted-foreground mb-4">
                Sie suchen professionelle Mietgeräte in {area.name}? Bei SLT Rental finden Sie eine große Auswahl an 
                Baumaschinen, Anhängern und Werkzeugen zur Miete. Unser Standort in {location?.name || "Ihrer Nähe"} ist nur {area.distance} km 
                von {area.name} entfernt und bietet Ihnen flexible Mietoptionen zu fairen Preisen.
              </p>
              <p className="text-muted-foreground mb-4">
                Ob Minibagger für den Gartenbau, Planenanhänger für den Umzug oder Akkuwerkzeuge für die Renovierung – 
                wir haben das passende Equipment für Ihr Projekt. Alle Geräte werden regelmäßig gewartet und sind sofort einsatzbereit.
              </p>
              <p className="text-muted-foreground">
                Neben der Selbstabholung bieten wir auch einen Lieferservice nach {area.name} und Umgebung an. 
                Kontaktieren Sie uns für ein individuelles Angebot oder buchen Sie direkt online.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-primary">
        <div className="section-container text-center">
          <AnimatedSection>
            <h2 className="text-2xl lg:text-3xl font-bold text-primary-foreground mb-4">
              Bereit für Ihr Projekt in {area.name}?
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Mieten Sie jetzt Equipment bei SLT Rental – günstig, flexibel und zuverlässig.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to={`/mieten/${area.locationId}`}>
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Jetzt Equipment mieten
                </Button>
              </Link>
              <Link to="/kontakt">
                <Button size="lg" variant="outline" className="border-primary text-primary bg-primary-foreground hover:border-accent hover:bg-primary-foreground hover:text-primary">
                  Kontakt aufnehmen
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
