import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageCircle, Phone } from "lucide-react";

const b2bFaqCategories = [
  {
    id: "portal",
    title: "B2B-Portal & Konto",
    questions: [
      {
        q: "Wie registriere ich mich als Geschäftskunde?",
        a: "Klicken Sie auf der Login-Seite auf 'Jetzt als Geschäftskunde registrieren'. Nach Eingabe Ihrer Firmendaten wird Ihr Antrag geprüft. Sobald Ihr Konto freigeschaltet ist, erhalten Sie eine Bestätigungs-E-Mail und können sich im Portal anmelden.",
      },
      {
        q: "Was bedeutet der Status 'ausstehend' bei meinem Konto?",
        a: "Nach der Registrierung befindet sich Ihr Konto im Status 'ausstehend'. Unser Team prüft Ihre Angaben und schaltet das Konto in der Regel innerhalb von 1–2 Werktagen frei. Sie werden per E-Mail informiert.",
      },
      {
        q: "Wie kann ich meine Firmendaten ändern?",
        a: "Navigieren Sie zu 'Firmendaten' in der Portalnavigation. Dort können Sie Ihre Adresse, Ansprechpartner und Rechnungsdaten aktualisieren. Änderungen werden nach einer kurzen Prüfung übernommen.",
      },
      {
        q: "Kann ich mehrere berechtigte Personen für unser Konto hinterlegen?",
        a: "Ja, unter 'Firmendaten' können Sie berechtigte Personen mit Namen, E-Mail und maximalem Mietwert hinterlegen. Diese Personen sind dann autorisiert, Mietgeräte in Ihrem Namen abzuholen.",
      },
    ],
  },
  {
    id: "anfragen",
    title: "Anfragen & Angebote",
    questions: [
      {
        q: "Wie stelle ich eine Mietanfrage?",
        a: "Über 'Produkte & Anfragen' wählen Sie die gewünschten Geräte aus, legen Standort, Zeitraum und Menge fest und senden eine Einzelanfrage oder Sammelanfrage ab. Sie erhalten innerhalb von 1 Stunde ein individuelles Angebot.",
      },
      {
        q: "Was ist eine Sammelanfrage?",
        a: "Wenn Sie mehrere Geräte für ein Projekt benötigen, können Sie diese gesammelt anfragen. Alle Positionen werden in einem gemeinsamen Angebot zusammengefasst, was die Übersicht und Abwicklung vereinfacht.",
      },
      {
        q: "Wie bestätige ich ein Angebot?",
        a: "Unter 'Angebote' sehen Sie alle erhaltenen Angebote. Klicken Sie auf 'Annehmen', um ein Angebot verbindlich zu bestätigen. Das PDF des Angebots können Sie jederzeit herunterladen.",
      },
      {
        q: "Wie lange ist ein Angebot gültig?",
        a: "Die Gültigkeitsdauer ist auf jedem Angebot vermerkt. In der Regel sind Angebote 14 Tage gültig. Nach Ablauf können Sie jederzeit eine neue Anfrage stellen.",
      },
      {
        q: "Erhalte ich individuelle Preise?",
        a: "Ja, als B2B-Kunde können für Ihr Konto individuelle Kategorierabatte und Produktpreise hinterlegt werden. Diese werden automatisch bei der Angebotserstellung berücksichtigt.",
      },
    ],
  },
  {
    id: "mietvorgaenge",
    title: "Mietvorgänge & Übergabe",
    questions: [
      {
        q: "Wie sehe ich meine aktiven Mietvorgänge?",
        a: "Unter 'Mietvorgänge' finden Sie eine Übersicht aller Ihrer Anfragen, aktiven Mieten und abgeschlossenen Vorgänge – inklusive Status, Zeitraum und Standort.",
      },
      {
        q: "Was ist ein Übergabeprotokoll?",
        a: "Bei der Übergabe der Mietgeräte wird ein digitales Übergabeprotokoll erstellt, das den Zustand der Geräte dokumentiert. Sie finden dieses unter 'Übergabeprotokolle' und können es als PDF herunterladen.",
      },
      {
        q: "Wie melde ich ein Gerät zur Rückgabe an?",
        a: "Unter 'Mietvorgänge' finden Sie bei aktiven Mieten den Button 'Gerät freimelden'. Damit informieren Sie unser Team, dass das Gerät zur Abholung bereitsteht oder zurückgebracht wird.",
      },
      {
        q: "Was passiert bei einer Mietverlängerung?",
        a: "Kontaktieren Sie unser Team oder stellen Sie eine neue Anfrage über das Portal. Verlängerungen werden zum vereinbarten Tagessatz berechnet und zum bestehenden Mietvorgang hinzugefügt.",
      },
    ],
  },
  {
    id: "rechnungen",
    title: "Rechnungen & Zahlung",
    questions: [
      {
        q: "Wann erhalte ich meine Rechnung?",
        a: "Die Rechnung wird nach Beendigung des Mietvorgangs erstellt und Ihnen per E-Mail zugestellt. Sie finden alle Rechnungen unter 'Rechnungen' im Portal.",
      },
      {
        q: "Welche Zahlungsfristen gelten?",
        a: "Das Zahlungsziel wird individuell für Ihr Konto festgelegt (in der Regel 14 Tage). Sie finden das Fälligkeitsdatum auf jeder Rechnung.",
      },
      {
        q: "Was ist mein Kreditlimit?",
        a: "Ihr Kreditlimit bestimmt den maximalen offenen Rechnungsbetrag. Sie sehen Ihr aktuelles Limit und die Auslastung im Dashboard. Eine Erhöhung können Sie über den entsprechenden Button beantragen.",
      },
      {
        q: "Kann ich eine Proforma-Rechnung (Vorkasse) erhalten?",
        a: "Ja, für Neukunden oder auf Wunsch können Proforma-Rechnungen erstellt werden, die vor der Geräteübergabe bezahlt werden. Sprechen Sie uns hierzu an.",
      },
      {
        q: "Wo finde ich meine Rechnungs-PDFs?",
        a: "Alle Rechnungen mit PDF-Download finden Sie unter 'Rechnungen' in der Portalnavigation. Sie können diese dort jederzeit herunterladen.",
      },
    ],
  },
  {
    id: "rueckgabe",
    title: "Rückgabe & Schäden",
    questions: [
      {
        q: "Was passiert bei der Rückgabe?",
        a: "Bei der Rückgabe wird ein digitales Rückgabeprotokoll erstellt, das den Zustand der Geräte dokumentiert. Dieses finden Sie unter 'Rückgabeprotokolle'.",
      },
      {
        q: "Was passiert bei Beschädigungen?",
        a: "Schäden werden im Rückgabeprotokoll dokumentiert. Je nach Schadensumfang und vereinbarter Haftungsreduzierung (MBV) werden die Kosten entsprechend berechnet.",
      },
      {
        q: "Muss ich Baumaschinen betankt zurückgeben?",
        a: "Kraftstoffkanister werden leer übergeben. Baumaschinen sollten idealerweise betankt zurückgegeben werden. Bei Rückgabe mit leerem Tank berechnen wir eine pauschale Betankungsgebühr (Diesel: 2,90 €/l, Benzin: 2,95 €/l).",
      },
    ],
  },
  {
    id: "dokumente",
    title: "Dokumente & Downloads",
    questions: [
      {
        q: "Wo finde ich die Allgemeinen Mietbedingungen?",
        a: "Die aktuellen AGB können Sie als PDF im Dashboard unter 'Downloads' herunterladen. Sie gelten für alle Mietverhältnisse mit SLT.",
      },
      {
        q: "Wie erhalte ich Kopien meiner Dokumente?",
        a: "Alle Angebote, Übergabeprotokolle, Rückgabeprotokolle und Rechnungen sind dauerhaft in Ihrem Portal verfügbar und können als PDF heruntergeladen werden.",
      },
    ],
  },
];

function B2BFAQ() {
  return (
    <B2BPortalLayout title="Häufige Fragen (FAQ)" subtitle="Antworten rund um das B2B-Portal und Ihre Mietvorgänge">
      <div className="max-w-3xl mx-auto space-y-8">
        {b2bFaqCategories.map((category) => (
          <div key={category.id}>
            <h2 className="text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
              {category.title}
            </h2>
            <Accordion type="single" collapsible className="space-y-2">
              {category.questions.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`${category.id}-${index}`}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="text-left text-foreground hover:text-primary py-4 text-sm">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4 text-sm">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}

        {/* CTA */}
        <Card>
          <CardContent className="py-8 text-center">
            <MessageCircle className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-2">Noch Fragen?</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Unser B2B-Team steht Ihnen persönlich zur Verfügung – telefonisch oder über das Kontaktformular.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/kontakt">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/80">
                  Kontakt aufnehmen
                </Button>
              </Link>
              <a href="tel:+4921514179904">
                <Button variant="outline">
                  <Phone className="h-4 w-4 mr-1.5" />
                  Anrufen
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </B2BPortalLayout>
  );
}

export default B2BFAQ;
