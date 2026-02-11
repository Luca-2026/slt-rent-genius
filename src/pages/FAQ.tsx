import { Layout } from "@/components/layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, MessageCircle } from "lucide-react";
import { AnimatedSection } from "@/components/ui/animated-section";

const faqCategories = [
  {
    id: "miete",
    title: "Mietartikel & Equipment",
    questions: [
      {
        q: "Welche Produkte kann ich bei euch mieten?",
        a: "Wir bieten über 800 Produkte in 5 Kategorien: Baumaschinen (Bagger, Radlader, Verdichter), Anhänger (Pkw-, Kipper-, Transportanhänger), Arbeitsbühnen (Scheren-, Teleskop-, Mastbühnen), Event-Equipment (Zelte, Bühnen, Technik) und Trocknung/Heizung (Bautrockner, Heizgeräte, Lüfter).",
      },
      {
        q: "Wie lange kann ich Equipment mieten?",
        a: "Die Mindestmietzeit variiert je nach Produkt – in der Regel ab 1 Tag. Langzeitmieten über mehrere Wochen oder Monate sind möglich und oft günstiger. Frag uns gerne nach Sonderkonditionen.",
      },
      {
        q: "Was ist der Weekend-Tarif?",
        a: "Bei vielen Produkten gilt: Freitag ab 12:00 Uhr abholen, Montag bis 8:00 Uhr zurückbringen – und du zahlst nur einen Miettag! Der Weekend-Tarif wird automatisch berechnet.",
      },
      {
        q: "Brauche ich spezielle Führerscheine oder Nachweise?",
        a: "Für bestimmte Fahrzeuge und Anhänger ist ein entsprechender Führerschein erforderlich. Bei Arbeitsbühnen empfehlen wir eine Einweisung. Details findest du auf der jeweiligen Produktseite.",
      },
    ],
  },
  {
    id: "buchung",
    title: "Buchung & Bezahlung",
    questions: [
      {
        q: "Wie buche ich online?",
        a: "Wähle dein Produkt aus, prüfe die Verfügbarkeit für deinen Wunschzeitraum und lege es in den Warenkorb. Nach der Buchung erhältst du eine Bestätigungs-E-Mail mit allen Details.",
      },
      {
        q: "Welche Zahlungsmethoden gibt es?",
        a: "Privatkunden zahlen bei Abholung (EC-Karte, Kreditkarte, Bar). B2B-Kunden erhalten nach Registrierung die Möglichkeit zur Rechnungszahlung.",
      },
      {
        q: "Muss ich eine Kaution hinterlegen?",
        a: "Ja, je nach Produkt ist eine Kaution fällig. Die Höhe wird bei der Buchung angezeigt. Die Kaution wird bei ordnungsgemäßer Rückgabe erstattet.",
      },
      {
        q: "Kann ich meine Buchung stornieren oder ändern?",
        a: "Ja, kontaktiere uns telefonisch oder per E-Mail. Bei kurzfristigen Stornierungen können je nach Produkt Gebühren anfallen. Details findest du in unseren AGB.",
      },
    ],
  },
  {
    id: "abholung",
    title: "Abholung & Lieferung",
    questions: [
      {
        q: "Wo kann ich das Equipment abholen?",
        a: "An unseren 3 Standorten: Krefeld (Hauptsitz), Bonn und Mülheim an der Ruhr. Öffnungszeiten: Mo-Fr 7:00-17:00 Uhr.",
      },
      {
        q: "Bietet ihr Lieferung an?",
        a: "Ja! Wir liefern in ganz NRW. Die Kosten richten sich nach Entfernung und Equipment. Lieferpreise ab 49€ (bis 25km).",
      },
      {
        q: "Was brauche ich bei der Abholung?",
        a: "Bitte bring einen gültigen Personalausweis mit. Bei Fahrzeugen/Anhängern den entsprechenden Führerschein. Die Kaution kann per EC-Karte oder bar hinterlegt werden.",
      },
      {
        q: "Was passiert bei verspäteter Rückgabe?",
        a: "Bitte informiere uns rechtzeitig! Bei ungeplanter Verspätung fallen zusätzliche Mietkosten an. Kontaktiere uns telefonisch, wenn du länger brauchst.",
      },
    ],
  },
  {
    id: "b2b",
    title: "B2B & Geschäftskunden",
    questions: [
      {
        q: "Welche Vorteile habe ich als B2B-Kunde?",
        a: "Nach der Registrierung profitierst du von Rahmenverträgen, Rechnungszahlung, persönlichem Ansprechpartner, vereinfachter Buchung und Sonderkonditionen für Großprojekte.",
      },
      {
        q: "Wie registriere ich mich als B2B-Kunde?",
        a: "Fülle das Registrierungsformular im B2B-Portal aus und lade deine Gewerbeanmeldung oder Handelsregisterauszug hoch. Wir prüfen deine Angaben und schalten dich innerhalb von 1-2 Werktagen frei.",
      },
      {
        q: "Kann ich eine Projektanfrage stellen?",
        a: "Ja! Im B2B-Dashboard kannst du Projektanfragen für größere Vorhaben stellen. Wir erstellen dir ein individuelles Angebot.",
      },
    ],
  },
];

export default function FAQ() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-12 lg:py-16">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
              Häufig gestellte Fragen
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl mb-6">
              Hier findest du Antworten auf die häufigsten Fragen rund um Miete, 
              Buchung, Lieferung und mehr.
            </p>
          </AnimatedSection>
          
          <AnimatedSection animation="fade-in-up" delay={200}>
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Frage suchen..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-background text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 lg:py-20">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            {faqCategories.map((category, catIndex) => (
              <AnimatedSection key={category.id} animation="fade-in-up" delay={catIndex * 100}>
                <div className="mb-10">
                  <h2 className="text-xl font-bold text-headline mb-4 pb-2 border-b border-border">
                    {category.title}
                  </h2>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((item, index) => (
                      <AccordionItem key={index} value={`${category.id}-${index}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="text-left text-headline hover:text-primary py-4">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Still Questions */}
      <section className="py-12 lg:py-16 bg-surface-light">
        <div className="section-container text-center">
          <AnimatedSection animation="scale-in">
            <MessageCircle className="h-12 w-12 text-accent mx-auto mb-4" />
            <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-4">
              Deine Frage war nicht dabei?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Kein Problem! Unser Team hilft dir gerne weiter – 
              per Telefon, E-Mail oder WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/kontakt">
                <Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                  Kontakt aufnehmen
                </Button>
              </Link>
              <a href="tel:+4921519328953">
                <Button variant="outline">
                  02151 / 932 89 53 anrufen
                </Button>
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
