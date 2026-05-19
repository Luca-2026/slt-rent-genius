import { Layout } from "@/components/layout";
import { SEO, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
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
import { useMemo, useState } from "react";

type FAQItem = { q: string; a: string };
type FAQCategory = { id: string; title: string; questions: FAQItem[] };

const faqCategories: FAQCategory[] = [
  {
    id: "sortiment-tarife",
    title: "Sortiment, Mietzeit & Tarife",
    questions: [
      {
        q: "Welche Produkte kann ich bei euch mieten?",
        a: "Wir bieten über 1.700 Produkte in 22 Kategorien – von Baumaschinen (Minibagger, Radlader, Dumper, Verdichtung), Anhängern (Pkw-, Kipper-, Baumaschinen- und Plattform-Anhänger) und Arbeitsbühnen über Stromaggregate, Heizung & Trocknung, Beleuchtung und Beschallung bis hin zu Zelten, Bühnen, Geschirr, Möbeln und Eventtechnik.",
      },
      {
        q: "Wie lange kann ich Equipment mieten?",
        a: "Du kannst bei uns stundenweise mieten – ab einer Stunde, in vielen Fällen sogar ab einer halben Stunde. Daneben gibt es Tages-, Wochenend-, Wochen- und Monatstarife. Langzeitmieten sind jederzeit möglich und in der Regel günstiger pro Tag.",
      },
      {
        q: "Was ist der Wochenend-Tarif?",
        a: "Beim Wochenend-Tarif holst du das Gerät Freitag ab 16:00 Uhr ab und bringst es Montag bis 09:30 Uhr zurück – berechnet wird nur ein Miettag.",
      },
      {
        q: "Gibt es ein „langes Wochenende“?",
        a: "Ja. Beim langen Wochenende holst du das Gerät bereits Freitag ab 06:00 Uhr ab und gibst es Montag bis 09:30 Uhr zurück. Ideal, wenn du den Freitag noch voll nutzen willst.",
      },
      {
        q: "Wie funktioniert die Preisberechnung?",
        a: "Die Preise sind je Produkt und Mietdauer im Online-Buchungssystem hinterlegt. Sobald du Standort und Zeitraum auswählst, siehst du den verbindlichen Preis inkl. MwSt. Mengenrabatte und Sonderkonditionen werden automatisch berücksichtigt.",
      },
    ],
  },
  {
    id: "buchung-zahlung",
    title: "Buchung, Zahlung & Reservierung",
    questions: [
      {
        q: "Wie buche ich online?",
        a: "Wähle dein Produkt aus, klicke auf „Jetzt mieten“, lege Standort und Zeitraum fest und schließe die Buchung im Online-System ab. Du erhältst direkt eine Bestätigung per E-Mail.",
      },
      {
        q: "Welche Zahlungsmethoden gibt es?",
        a: "Online bezahlst du bequem per PayPal oder per Kreditkarte (über Stripe). Vor Ort im Ladengeschäft ist zusätzlich Barzahlung möglich – allerdings ohne vorherige Reservierung.",
      },
      {
        q: "Wie funktioniert eine verbindliche Reservierung?",
        a: "Verbindlich reservieren kannst du ausschließlich online mit einer Anzahlung von 30 % des Mietpreises. Erst dann ist das Gerät für deinen Zeitraum fest blockiert.",
      },
      {
        q: "Kann ich auch ohne Reservierung vorbeikommen?",
        a: "Ja, du kannst spontan im Ladengeschäft vorbeikommen und bar bezahlen. Bitte beachte: Ohne Online-Reservierung können wir keine Verfügbarkeit garantieren.",
      },
      {
        q: "Kann ich meine Buchung stornieren oder ändern?",
        a: "Änderungen und Stornierungen sind möglich – kontaktiere uns dazu telefonisch oder per E-Mail. Je nach Vorlauf und Produkt können Gebühren gemäß unseren AGB anfallen.",
      },
    ],
  },
  {
    id: "abholung-lieferung",
    title: "Abholung, Lieferung & Rückgabe",
    questions: [
      {
        q: "Wo kann ich das Equipment abholen?",
        a: "An unseren drei Standorten in Krefeld (Anrather Straße 291, Hauptsitz), Bonn (Drachenburgstraße 8) und Mülheim an der Ruhr (Ruhrorter Str. 122).",
      },
      {
        q: "Welche Öffnungszeiten haben die Standorte?",
        a: "Krefeld: Mo–Fr 08:00–18:00 Uhr, Sa 10:00–14:30 Uhr (samstags früher nach vorheriger Buchung möglich), So geschlossen. Bonn: Mo–Fr 07:00–18:00 Uhr, Sa 08:00–17:30 Uhr, So geschlossen. Mülheim an der Ruhr: Online-Buchung 24/7, Abholung nach Vereinbarung.",
      },
      {
        q: "Bietet ihr Lieferung an?",
        a: "Ja. Wir liefern standardmäßig im Umkreis von bis zu 50 km um unsere Standorte. Weitere Entfernungen sind auf Anfrage möglich. Die Lieferpreise starten ab 50 € (Tarif A, Sprinter solo, bis 5 km).",
      },
      {
        q: "Wie werden die Lieferkosten berechnet?",
        a: "Die Lieferkosten richten sich nach Entfernung und Tarif (A: Sprinter solo, B: Sprinter mit Pkw-Anhänger für Baumaschinen unter 2 t, C: Sprinter mit Baumaschinenanhänger für Baumaschinen unter 3,5 t). Den exakten Preis siehst du im Lieferkosten-Rechner auf der jeweiligen Produktseite.",
      },
      {
        q: "Was brauche ich bei der Abholung?",
        a: "Bring einen gültigen Personalausweis mit. Für Anhänger und Fahrzeuge zusätzlich den passenden Führerschein. Die Kaution kann bar im Ladengeschäft oder online hinterlegt werden.",
      },
      {
        q: "Was passiert bei verspäteter Rückgabe?",
        a: "Bitte informiere uns rechtzeitig telefonisch. Bei ungeplanter Verspätung berechnen wir die zusätzliche Mietzeit nach dem regulären Tarif.",
      },
    ],
  },
  {
    id: "kaution-voraussetzungen",
    title: "Kaution, Führerschein & Voraussetzungen",
    questions: [
      {
        q: "Muss ich eine Kaution hinterlegen?",
        a: "Ja, je nach Produkt ist eine Kaution fällig. Die genaue Höhe wird dir bereits im Buchungsprozess angezeigt. Die Kaution kannst du bar im Ladengeschäft oder online hinterlegen und erhältst sie bei ordnungsgemäßer Rückgabe vollständig zurück.",
      },
      {
        q: "Brauche ich einen Führerschein?",
        a: "Für Anhänger und Fahrzeuge benötigst du die jeweils passende Führerscheinklasse (z. B. BE für größere Anhängergespanne). Für Arbeitsbühnen empfehlen wir eine Einweisung. Hinweise zu den Voraussetzungen findest du auf der jeweiligen Produktseite.",
      },
      {
        q: "Ab welchem Alter kann ich mieten?",
        a: "Du musst volljährig sein (mind. 18 Jahre) und einen gültigen Personalausweis vorlegen. Bei führerscheinpflichtigen Mietobjekten zusätzlich den passenden Führerschein.",
      },
    ],
  },
  {
    id: "anhaenger-24-7",
    title: "Anhänger 24/7 & kontaktlose Abholung",
    questions: [
      {
        q: "Was ist die 24/7-Anhängermiete?",
        a: "An ausgewählten Anhängern an unseren Standorten kannst du rund um die Uhr selbstständig mieten – auch nachts, am Wochenende und an Feiertagen. Die Freigabe erfolgt per SMS-Code an deinem gebuchten Anhänger.",
      },
      {
        q: "Wie funktioniert der SMS-Code?",
        a: "Wenige Minuten nach der Online-Buchung erhältst du eine SMS mit deinem persönlichen Code. Spätestens 15 Minuten vor Beginn deiner Buchungszeit ist der Code aktiv. Damit öffnest du das Bügelschloss am Anhänger.",
      },
      {
        q: "Wie öffne ich das Bügelschloss?",
        a: "Code am Schloss eingeben und bestätigen. Nach einem kurzen Signalton kräftig am Bügel ziehen – das Schloss öffnet sich. Zum Abschließen den Bügel wieder eindrücken und einrasten lassen; ein langer Piepton bestätigt die Verriegelung.",
      },
      {
        q: "Sind Spanngurte / Ladungssicherung dabei?",
        a: "Spanngurte und weiteres Ladungssicherungsmaterial sind nicht automatisch dabei, können aber bequem im Buchungsprozess optional zugebucht werden.",
      },
      {
        q: "Wann bekomme ich meine Rechnung?",
        a: "Nach Rückgabe wird der Anhänger auf ordnungsgemäßen Zustand geprüft. Spätestens 48 Stunden nach Rückgabe erhältst du die Rückgabebestätigung und die Rechnung per E-Mail.",
      },
    ],
  },
  {
    id: "b2b",
    title: "Geschäftskunden (B2B)",
    questions: [
      {
        q: "Welche Vorteile habe ich als B2B-Kunde?",
        a: "Als Geschäftskunde profitierst du von individuellen Konditionen, persönlichem Ansprechpartner, Sammelanfragen für Großprojekte, digitalen Übergabe- und Rückgabeprotokollen sowie – nach erfolgreicher Bonitätsprüfung – der Möglichkeit zur Rechnungszahlung.",
      },
      {
        q: "Wie zahle ich als Geschäftskunde?",
        a: "Die erste Miete ist als Geschäftskunde grundsätzlich in Vorkasse zu leisten. Nach Registrierung und positiver Bonitätsprüfung schalten wir dir die Zahlung auf Rechnung mit individuellem Zahlungsziel frei.",
      },
      {
        q: "Wie registriere ich mich als B2B-Kunde?",
        a: "Über das B2B-Portal das Registrierungsformular ausfüllen und Gewerbeanmeldung bzw. Handelsregisterauszug hochladen. Wir prüfen deine Angaben und schalten dein Konto in der Regel innerhalb von 1–2 Werktagen frei.",
      },
      {
        q: "Kann ich Projekt- oder Sammelanfragen stellen?",
        a: "Ja. Im B2B-Dashboard kannst du mehrere Geräte gesammelt für ein Projekt anfragen. Du erhältst innerhalb kurzer Zeit ein individuelles Angebot mit deinen Konditionen.",
      },
    ],
  },
];

export default function FAQ() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqCategories;
    return faqCategories
      .map((cat) => ({
        ...cat,
        questions: cat.questions.filter(
          (item) =>
            item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.questions.length > 0);
  }, [query]);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqCategories.flatMap((cat) =>
      cat.questions.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    ),
  };

  return (
    <Layout>
      <SEO
        title="FAQ – Häufige Fragen zur Miete | SLT Rental"
        description="Antworten zu Mietzeit, Wochenendtarif, Buchung, Zahlung, Kaution, Lieferung und 24/7-Anhängermiete bei SLT Rental in Krefeld, Bonn und Mülheim."
        canonical="/faq"
        keywords="FAQ Baumaschinen mieten, Wochenendtarif, Kaution, Lieferung, 24/7 Anhänger"
        jsonLd={[
          SLT_BREADCRUMB_JSONLD([
            { name: "Home", url: "/" },
            { name: "FAQ", url: "/faq" },
          ]),
          faqJsonLd,
        ]}
      />
      {/* Hero */}
      <section className="bg-primary py-12 lg:py-16">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
              Häufige Fragen
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl mb-6">
              Alle Antworten rund um Miete, Buchung, Zahlung, Lieferung und unsere
              24/7-Anhängermiete – kompakt und ohne Umwege.
            </p>
          </AnimatedSection>
          <AnimatedSection animation="fade-in-up" delay={200}>
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="In den FAQs suchen…"
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
            {filtered.length === 0 && (
              <p className="text-muted-foreground text-center">
                Keine Treffer für „{query}“. Bitte einen anderen Begriff probieren
                oder uns direkt kontaktieren.
              </p>
            )}
            {filtered.map((category, catIndex) => (
              <AnimatedSection
                key={category.id}
                animation="fade-in-up"
                delay={catIndex * 100}
              >
                <div className="mb-10">
                  <h2 className="text-xl font-bold text-headline mb-4 pb-2 border-b border-border">
                    {category.title}
                  </h2>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((item, index) => (
                      <AccordionItem
                        key={index}
                        value={`${category.id}-${index}`}
                        className="border rounded-lg px-4"
                      >
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
              Noch Fragen offen?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Unser Team hilft dir gerne persönlich weiter – telefonisch oder per
              Kontaktformular.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/kontakt">
                <Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                  Kontakt aufnehmen
                </Button>
              </Link>
              <a href="tel:+4921514179904">
                <Button variant="outline">Jetzt anrufen</Button>
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
