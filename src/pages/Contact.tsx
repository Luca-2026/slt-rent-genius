import { Layout } from "@/components/layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import { AnimatedSection } from "@/components/ui/animated-section";
import { locationData } from "@/data/locationData";

const contactInfo = [
  {
    icon: Phone,
    title: "Telefon",
    primary: "02151 417 990 4",
    secondary: "Mo-Fr: 7:30-18:00 Uhr",
    href: "tel:+49021514179904",
  },
  {
    icon: Mail,
    title: "E-Mail",
    primary: "mieten@slt-rental.de",
    secondary: "Antwort innerhalb 24h",
    href: "mailto:mieten@slt-rental.de",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    primary: "02151 417 990 4",
    secondary: "Schnelle Anfragen",
    href: "https://wa.me/49021514179904",
  },
];

export default function Contact() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-12 lg:py-16">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
              Kontakt
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl">
              Hast du Fragen zu unseren Produkten, zur Buchung oder brauchst eine persönliche Beratung? 
              Wir sind für dich da – per Telefon, E-Mail oder WhatsApp.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-12 lg:py-16">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {contactInfo.map((info, index) => (
              <AnimatedSection key={info.title} animation="scale-in" delay={index * 120}>
                <a href={info.href} target="_blank" rel="noopener noreferrer">
                  <Card className="h-full hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                        <info.icon className="h-7 w-7 text-accent group-hover:text-accent-foreground transition-colors" />
                      </div>
                      <h3 className="font-semibold text-headline mb-1">{info.title}</h3>
                      <p className="text-primary font-medium">{info.primary}</p>
                      <p className="text-sm text-muted-foreground">{info.secondary}</p>
                    </CardContent>
                  </Card>
                </a>
              </AnimatedSection>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <AnimatedSection animation="slide-in-left" delay={0}>
              <div>
                <h2 className="text-2xl font-bold text-headline mb-6">Schreib uns eine Nachricht</h2>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-headline mb-1.5">
                        Vorname *
                      </label>
                      <Input placeholder="Max" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-headline mb-1.5">
                        Nachname *
                      </label>
                      <Input placeholder="Mustermann" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-headline mb-1.5">
                      E-Mail *
                    </label>
                    <Input type="email" placeholder="max@beispiel.de" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-headline mb-1.5">
                      Telefon (optional)
                    </label>
                    <Input type="tel" placeholder="0151 123 456 78" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-headline mb-1.5">
                      Betreff *
                    </label>
                    <Input placeholder="Anfrage zu Minibagger" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-headline mb-1.5">
                      Nachricht *
                    </label>
                    <Textarea 
                      placeholder="Deine Nachricht an uns..." 
                      rows={5} 
                      required 
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <input type="checkbox" id="privacy" className="mt-1" required />
                    <label htmlFor="privacy" className="text-sm text-muted-foreground">
                      Ich habe die <Link to="/datenschutz" className="text-primary hover:underline">Datenschutzerklärung</Link> gelesen 
                      und stimme der Verarbeitung meiner Daten zu. *
                    </label>
                  </div>
                  <Button type="submit" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                    <Send className="h-4 w-4 mr-2" />
                    Nachricht senden
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-4">
                  * Pflichtfelder. Wir antworten in der Regel innerhalb von 24 Stunden.
                </p>
              </div>
            </AnimatedSection>

            {/* Locations Overview */}
            <AnimatedSection animation="slide-in-right" delay={200}>
              <div>
                <h2 className="text-2xl font-bold text-headline mb-6">Unsere Standorte</h2>
                <div className="space-y-4">
                  {locationData.map((loc) => (
                    <Card key={loc.id} className="hover:shadow-md transition-all duration-300">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-headline mb-2">
                          {loc.name} {loc.subtitle === "Hauptsitz" && "(Hauptsitz)"}
                        </h3>
                        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-1">
                          <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                          <span>{loc.address}, {loc.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm mb-1">
                          <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                          <a href={`tel:${loc.phone.replace(/\s/g, "")}`} className="text-primary hover:text-accent">
                            {loc.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                          <a href={`mailto:${loc.email}`} className="text-primary hover:text-accent">
                            {loc.email}
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <AnimatedSection animation="fade-in-up" delay={400}>
                  <div className="mt-6 p-4 bg-surface-light rounded-xl">
                    <div className="flex items-center gap-2 text-headline font-medium mb-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Öffnungszeiten
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Montag - Freitag: 7:30 - 18:00 Uhr<br />
                      Samstag: 8:00 - 14:30 Uhr*<br />
                      Sonntag: geschlossen
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      *Samstags nur mit vorheriger Buchung.
                    </p>
                  </div>
                </AnimatedSection>

                <div className="mt-6">
                  <Link to="/standorte">
                    <Button variant="outline" className="w-full">
                      Alle Standorte anzeigen
                    </Button>
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* B2B Teaser */}
      <section className="py-12 lg:py-16 bg-primary">
        <div className="section-container text-center">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-2xl lg:text-3xl font-bold text-primary-foreground mb-4">
              Du bist Geschäftskunde?
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-6">
              Registriere dich im B2B-Portal und profitiere von Rahmenverträgen, 
              vereinfachter Abrechnung und persönlicher Betreuung.
            </p>
            <Link to="/b2b">
              <Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                Zum B2B-Portal
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
