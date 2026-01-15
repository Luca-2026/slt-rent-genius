import { Layout } from "@/components/layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    tips: ["Weekend-Tarif beachten: Fr-Mo = 1 Tag", "Mindestmietzeit beachten"],
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
    tips: ["Buchung jederzeit einsehbar", "Änderungen per Telefon möglich"],
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
      <section className="bg-primary py-12 lg:py-16">
        <div className="section-container">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            So funktioniert's
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl">
            In 5 einfachen Schritten zu deinem Mietgerät – online buchen, vor Ort abholen 
            oder direkt liefern lassen. Unkompliziert und schnell.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-12 lg:py-20">
        <div className="section-container">
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  {/* Step Number & Icon */}
                  <div className="flex items-center gap-4 lg:w-48 shrink-0">
                    <div className="w-14 h-14 bg-accent text-accent-foreground rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">
                      {step.number}
                    </div>
                    <step.icon className="h-8 w-8 text-primary hidden lg:block" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h2 className="text-xl lg:text-2xl font-bold text-headline mb-3">
                      {step.title}
                    </h2>
                    <p className="text-muted-foreground mb-4 max-w-2xl">
                      {step.description}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {step.tips.map((tip) => (
                        <span
                          key={tip}
                          className="inline-flex items-center gap-1.5 bg-surface-light px-3 py-1.5 rounded-full text-sm text-body"
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
                  <div className="hidden lg:block absolute left-7 top-20 w-0.5 h-16 bg-border" />
                )}
              </div>
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
                <strong>Freitag ab 12:00 Uhr abholen, Montag bis 8:00 Uhr zurückgeben – nur 1 Miettag zahlen!</strong>
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
      <section className="py-12 lg:py-16">
        <div className="section-container">
          <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-8 text-center">
            Was du für die Abholung brauchst
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {requirements.map((req) => (
              <Card key={req.title} className="h-full">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <req.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-headline mb-2">{req.title}</h3>
                  <p className="text-sm text-muted-foreground">{req.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-12 lg:py-16 bg-surface-light">
        <div className="section-container text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-4">
            Noch Fragen?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            In unseren FAQ findest du Antworten auf die häufigsten Fragen rund um Miete, 
            Buchung, Lieferung und Abrechnung.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/faq">
              <Button variant="outline" size="lg">
                Zu den FAQ <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/kontakt">
              <Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover" size="lg">
                Kontakt aufnehmen
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
