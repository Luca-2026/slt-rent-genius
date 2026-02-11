import { Layout } from "@/components/layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/ui/animated-section";
import { 
  Calendar, 
  Search, 
  ShoppingCart, 
  Mail, 
  Truck,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

const steps = [
  {
    number: "1",
    icon: Calendar,
    title: "Zeitraum & Standort wählen",
    description: "Wähle zuerst deinen bevorzugten Standort (Krefeld, Bonn oder Mülheim) und den gewünschten Mietzeitraum aus. Der Kalender zeigt dir die Verfügbarkeit in Echtzeit.",
    tips: ["Weekend-Konditionen: Fr-Mo zu Sonderpreisen", "Mindestmietzeit wird automatisch berechnet"],
  },
  {
    number: "2",
    icon: Search,
    title: "Gerät auswählen",
    description: "Durchsuche unseren Katalog nach dem passenden Equipment. Nutze die Filter für Kategorie, Arbeitshöhe, Gewichtsklasse und mehr.",
    tips: ["Detailseiten mit allen Spezifikationen", "Ähnliche Produkte als Alternative"],
  },
  {
    number: "3",
    icon: ShoppingCart,
    title: "In den Warenkorb & buchen",
    description: "Lege dein Wunschprodukt in den Warenkorb, prüfe den Mietpreis und schließe die Buchung ab. Du erhältst sofort eine Buchungsbestätigung.",
    tips: ["Transparente Preise ohne versteckte Kosten", "Mehrere Produkte kombinierbar"],
  },
  {
    number: "4",
    icon: Mail,
    title: "Bestätigung erhalten",
    description: "Nach der Buchung erhältst du eine E-Mail mit allen Details: Buchungsnummer, Abholadresse, Öffnungszeiten und Checkliste für die Abholung.",
    tips: ["Buchung jederzeit einsehbar", "Änderungen per Telefon oder E-Mail möglich (kostenpflichtig)"],
  },
  {
    number: "5",
    icon: Truck,
    title: "Abholen oder liefern lassen",
    description: "Hole dein Equipment am gewählten Standort ab oder lass es dir direkt auf die Baustelle liefern. Bei der Rückgabe prüfen wir gemeinsam den Zustand.",
    tips: ["Lieferung gegen Aufpreis", "Einweisung vor Ort möglich"],
  },
];

const requirements = [
  {
    icon: CreditCard,
    title: "Kaution",
    description: "Je nach Produkt ist eine Kaution fällig, die bei Rückgabe erstattet wird. Die Höhe wird bei der Buchung angezeigt.",
  },
  {
    icon: FileText,
    title: "Ausweis & Führerschein",
    description: "Bitte bring einen gültigen Personalausweis mit. Für bestimmte Fahrzeuge und Anhänger wird ein Führerschein benötigt.",
  },
  {
    icon: AlertCircle,
    title: "Für Unternehmen",
    description: "Gewerbetreibende registrieren sich im B2B-Portal und profitieren von Rahmenverträgen und vereinfachter Abrechnung.",
  },
];

export default function HowItWorks() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary to-slt-blue-hover py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 border-4 border-primary-foreground rounded-full" />
          <div className="absolute bottom-10 left-10 w-40 h-40 border-4 border-accent rounded-full" />
        </div>
        <div className="section-container relative">
          <AnimatedSection>
            <span className="inline-block bg-accent/20 text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-4 backdrop-blur-sm border border-accent/30">
              Einfach & unkompliziert
            </span>
            <h1 className="text-3xl lg:text-5xl font-bold text-primary-foreground mb-4">
              So funktioniert's
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl text-lg">
              In 5 einfachen Schritten zu deinem Mietgerät – online buchen, vor Ort abholen 
              oder direkt liefern lassen.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <div className="space-y-16">
            {steps.map((step, index) => (
              <AnimatedSection key={step.number} delay={index * 100} animation="fade-in-up">
                <div className="relative">
                  <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Step Number & Icon */}
                    <div className="flex items-center gap-6 lg:w-56 shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-accent to-cta-orange-hover text-accent-foreground rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg">
                        {step.number}
                      </div>
                      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center hidden lg:flex">
                        <step.icon className="h-7 w-7 text-primary" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-gradient-to-br from-surface-light to-background rounded-2xl p-6 lg:p-8 border border-border">
                      <h2 className="text-xl lg:text-2xl font-bold text-headline mb-3">
                        {step.title}
                      </h2>
                      <p className="text-muted-foreground mb-5 max-w-2xl">
                        {step.description}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {step.tips.map((tip) => (
                          <span
                            key={tip}
                            className="inline-flex items-center gap-2 bg-background px-4 py-2 rounded-full text-sm text-body border border-border hover:border-accent/50 transition-colors"
                          >
                            <CheckCircle2 className="h-4 w-4 text-accent" />
                            {tip}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute left-8 top-24 w-0.5 h-20 bg-gradient-to-b from-accent to-transparent" />
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Weekend Tarif */}
      <section className="py-12 lg:py-16 bg-surface-light">
        <div className="section-container">
          <div className="bg-gradient-to-r from-accent to-cta-orange-hover rounded-2xl p-8 lg:p-12 text-accent-foreground">
            <div className="max-w-2xl">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                🎉 Weekend-Tarif: Mehr mieten, weniger zahlen!
              </h2>
              <p className="text-accent-foreground/90 mb-6">
                Bei vielen Produkten gilt unser beliebter Weekend-Tarif: <br />
                <strong>Freitag ab 12:00 Uhr abholen, Montag bis 8:00 Uhr zurückgeben – zu besonderen Konditionen!</strong>
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Gilt für die meisten Baumaschinen & Anhänger</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Automatisch berechnet bei Online-Buchung</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Ideal für Wochenendprojekte</span>
                </li>
              </ul>
              <Link to="/produkte">
                <Button className="bg-white text-accent hover:bg-white/90">
                  Jetzt Produkte entdecken
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 lg:py-20">
        <div className="section-container">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-4">
              Was du für die Abholung brauchst
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {requirements.map((req, index) => (
              <AnimatedSection key={req.title} delay={index * 100} animation="scale-in">
                <Card className="h-full border-2 border-transparent hover:border-primary/20 hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center mb-5 group-hover:from-primary group-hover:to-primary/80 transition-all duration-300">
                      <req.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="font-bold text-headline text-lg mb-3">{req.title}</h3>
                    <p className="text-muted-foreground">{req.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-16 lg:py-20 bg-surface-light">
        <div className="section-container text-center">
          <AnimatedSection>
            <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-4">
              Noch Fragen?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              In unseren FAQ findest du Antworten auf die häufigsten Fragen rund um Miete, 
              Buchung, Lieferung und Abrechnung.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/faq">
                <Button variant="outline" size="lg" className="group border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground">
                  Zu den FAQ <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/kontakt">
                <Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover" size="lg">
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
