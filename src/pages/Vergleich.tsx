import { useMemo } from "react";
import { Layout } from "@/components/layout";
import { SEO, SLT_BREADCRUMB_JSONLD, SLT_FAQ_JSONLD } from "@/components/SEO";
import { Link, useParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnimatedSection } from "@/components/ui/animated-section";
import { ArrowLeft, CheckCircle2, Phone } from "lucide-react";
import sltLogo from "@/assets/slt-logo-sm.webp";

type ComparisonRow = {
  feature: string;
  slt: string;
  competitor: string;
};

type Vergleich = {
  slug: string;
  competitor: string;
  competitorShort: string;
  h1: string;
  title: string;
  description: string;
  intro: string[];
  rows: ComparisonRow[];
  faqs: { question: string; answer: string }[];
};

// Tonalität: §6 UWG-konform. Nur objektive, allgemein bekannte Aussagen
// über Wettbewerber, keine Abwertung. SLT-Stärken werden hervorgehoben.
const VERGLEICHE: Record<string, Vergleich> = {
  "slt-vs-hkl": {
    slug: "slt-vs-hkl",
    competitor: "HKL",
    competitorShort: "HKL",
    h1: "SLT Rental oder HKL: Der Vergleich für Mietgeräte in NRW",
    title: "SLT Rental oder HKL: Der Vergleich für Mietgeräte in NRW",
    description:
      "SLT Rental und HKL im Vergleich: Regionaler Mietpark in NRW mit Online-Buchung und Tiefpreisgarantie gegenüber bundesweitem Großvermieter.",
    intro: [
      "SLT Rental und HKL sind beide in NRW als Vermieter aktiv, verfolgen aber unterschiedliche Ansätze. HKL ist ein bundesweiter Großvermieter mit über 180 Centern. SLT Rental ist der regionale Spezialist mit drei Standorten in Krefeld, Bonn und Mülheim an der Ruhr, mit persönlicher Betreuung, Online-Buchung und Tiefpreisgarantie. Wer Baumaschinen, Anhänger, Arbeitsbühnen oder Event-Equipment in NRW mieten möchte, findet bei SLT kurze Wege und faire Konditionen.",
    ],
    rows: [
      { feature: "Gegründet / Hauptsitz", slt: "SLT Technology Group GmbH & Co. KG, Hauptsitz Krefeld", competitor: "1970, Hauptsitz Hamburg" },
      { feature: "Ausrichtung", slt: "Regionaler Mietpark mit Fokus NRW", competitor: "Bundesweiter Großvermieter und Händler" },
      { feature: "Standorte in NRW", slt: "Krefeld, Bonn, Mülheim an der Ruhr", competitor: "u.a. Krefeld, Dortmund, Langenfeld, Arbeitsbühnencenter Köln/Bonn" },
      { feature: "Gerätekategorien", slt: "Baumaschinen, Anhänger, Arbeitsbühnen, Event-Equipment", competitor: "Baumaschinen, Baugeräte, Raumsysteme, Arbeitsbühnen und Teleskopmaschinen, Strom, Fahrzeuge" },
      { feature: "Online-Buchung", slt: "Ja, online buchbar", competitor: "Ja, Online-Miete und Baushop" },
      { feature: "Tiefpreisgarantie", slt: "Ja (10 % Rabatt auf den Nettopreis bei nachweislich günstigerem identischem Angebot)", competitor: "Keine ausgewiesen" },
      { feature: "Lieferung", slt: "Lieferung im Umkreis der Standorte", competitor: "Transportservice, Lieferung" },
      { feature: "Zielgruppe", slt: "Gewerbe und Privatkunden (B2B und B2C)", competitor: "Vorwiegend gewerblich (Bau, Handwerk, Industrie, Kommunen)" },
    ],
    faqs: [
      {
        question: "Worin unterscheidet sich SLT Rental von HKL?",
        answer:
          "HKL ist ein bundesweiter Großvermieter. SLT Rental ist regional auf NRW fokussiert, mit drei Standorten, Anhängern und Event-Equipment im Programm, Online-Buchung und Tiefpreisgarantie.",
      },
      {
        question: "Kann ich bei SLT Rental online buchen?",
        answer: "Ja, das Sortiment ist direkt online buchbar.",
      },
      {
        question: "Bietet SLT Rental eine Tiefpreisgarantie?",
        answer:
          "Ja. Bei einem nachweislich günstigeren identischen Angebot erhalten Sie 10 % Rabatt auf den Nettopreis.",
      },
    ],
  },
  "slt-vs-boels": {
    slug: "slt-vs-boels",
    competitor: "Boels",
    competitorShort: "Boels",
    h1: "SLT Rental oder Boels: Mietgeräte in NRW im Vergleich",
    title: "SLT Rental oder Boels: Mietgeräte in NRW im Vergleich",
    description:
      "SLT Rental und Boels im Vergleich: Regionaler NRW-Mietpark mit Tiefpreisgarantie versus internationaler Großvermieter.",
    intro: [
      "Boels ist ein international tätiger Großvermieter mit rund 200 Niederlassungen in Deutschland. SLT Rental konzentriert sich bewusst auf NRW, mit drei Standorten in Krefeld, Bonn und Mülheim an der Ruhr. Beide bieten ein breites Sortiment inklusive Event-Equipment. Der Unterschied liegt in der regionalen Nähe, der persönlichen Betreuung und der Tiefpreisgarantie von SLT.",
    ],
    rows: [
      { feature: "Gegründet / Hauptsitz", slt: "SLT Technology Group GmbH & Co. KG, Hauptsitz Krefeld", competitor: "1977 (Niederlande), seit 1992 in Deutschland, deutscher Sitz Feldkirchen" },
      { feature: "Ausrichtung", slt: "Regionaler Mietpark mit Fokus NRW", competitor: "International tätiger Großvermieter (One-Stop-Shop)" },
      { feature: "Standorte in NRW", slt: "Krefeld, Bonn, Mülheim an der Ruhr", competitor: "u.a. Krefeld (Teil eines bundesweiten Filialnetzes)" },
      { feature: "Gerätekategorien", slt: "Baumaschinen, Anhänger, Arbeitsbühnen, Event-Equipment", competitor: "Baumaschinen, Werkzeug, Arbeitsbühnen, Container, Catering- und Event-Equipment, mobile Küchen" },
      { feature: "Online-Buchung", slt: "Ja, online buchbar", competitor: "Ja, Online-Vermietung über boels.com" },
      { feature: "Tiefpreisgarantie", slt: "Ja (10 % Rabatt auf den Nettopreis bei nachweislich günstigerem identischem Angebot)", competitor: "Keine ausgewiesen" },
      { feature: "Lieferung", slt: "Lieferung im Umkreis der Standorte", competitor: "Eigener Transportservice" },
      { feature: "Zielgruppe", slt: "Gewerbe und Privatkunden (B2B und B2C)", competitor: "Privatkunden bis große Baufirmen und Facility Management (B2B und B2C)" },
    ],
    faqs: [
      {
        question: "Was ist der Unterschied zwischen SLT Rental und Boels?",
        answer:
          "Boels ist international aufgestellt mit rund 200 Niederlassungen in Deutschland. SLT Rental ist der regionale NRW-Spezialist mit drei Standorten, persönlicher Betreuung und Tiefpreisgarantie.",
      },
      {
        question: "Vermietet SLT Rental auch Event-Equipment?",
        answer: "Ja. Neben Baumaschinen, Anhängern und Arbeitsbühnen gehört auch Event-Equipment zum Sortiment.",
      },
      {
        question: "Liefert SLT Rental die Mietgeräte?",
        answer: "Ja, im Umkreis der Standorte Krefeld, Bonn und Mülheim an der Ruhr.",
      },
    ],
  },
  "slt-vs-beyer": {
    slug: "slt-vs-beyer",
    competitor: "BEYER-Mietservice",
    competitorShort: "BEYER-Mietservice",
    h1: "SLT Rental oder BEYER-Mietservice: Der Vergleich in NRW",
    title: "SLT Rental oder BEYER-Mietservice: Der Vergleich in NRW",
    description:
      "SLT Rental und BEYER-Mietservice im Vergleich: Regionaler NRW-Mietpark mit Anhängern, Event-Equipment und Tiefpreisgarantie.",
    intro: [
      "BEYER-Mietservice ist ein überregionaler Vermieter mit Schwerpunkt auf Arbeitsbühnen und Erdbewegungstechnik. SLT Rental deckt in NRW zusätzlich Anhänger und Event-Equipment ab und bietet Online-Buchung sowie Tiefpreisgarantie. Mit drei Standorten in Krefeld, Bonn und Mülheim an der Ruhr ist SLT nah an Projekten am Niederrhein, im Ruhrgebiet und im Raum Bonn.",
    ],
    rows: [
      { feature: "Gegründet / Hauptsitz", slt: "SLT Technology Group GmbH & Co. KG, Hauptsitz Krefeld", competitor: "1994, Hauptsitz Roth-Heckenhof (Westerwald)" },
      { feature: "Ausrichtung", slt: "Regionaler Mietpark mit Fokus NRW", competitor: "Überregionaler Vermieter, Schwerpunkt Höhenzugangs- und Erdbewegungstechnik" },
      { feature: "Standorte in NRW", slt: "Krefeld, Bonn, Mülheim an der Ruhr", competitor: "Pulheim, Hürth, Lünen, Freudenberg" },
      { feature: "Gerätekategorien", slt: "Baumaschinen, Anhänger, Arbeitsbühnen, Event-Equipment", competitor: "Arbeitsbühnen, Baumaschinen, Teleskoplader, Gabelstapler, Minikrane, Baugeräte" },
      { feature: "Online-Buchung", slt: "Ja, online buchbar", competitor: "Mietanfrage online und über BEYER-App" },
      { feature: "Tiefpreisgarantie", slt: "Ja (10 % Rabatt auf den Nettopreis bei nachweislich günstigerem identischem Angebot)", competitor: "Keine ausgewiesen" },
      { feature: "Lieferung", slt: "Lieferung im Umkreis der Standorte", competitor: "Eigene LKW- und Tiefladerflotte, europaweit" },
      { feature: "Zielgruppe", slt: "Gewerbe und Privatkunden (B2B und B2C)", competitor: "Vorwiegend gewerblich (Industrie, Handwerk, Messebau, Garten- und Landschaftsbau, Kommunen), Selbstabholer auch privat" },
    ],
    faqs: [
      {
        question: "Worin unterscheidet sich SLT Rental von BEYER-Mietservice?",
        answer:
          "BEYER hat seinen Schwerpunkt bei Arbeitsbühnen und Erdbewegung. SLT Rental bietet zusätzlich Anhänger und Event-Equipment, Online-Buchung und Tiefpreisgarantie, an drei NRW-Standorten.",
      },
      {
        question: "Wo hat SLT Rental Standorte?",
        answer: "In Krefeld, Bonn und Mülheim an der Ruhr.",
      },
      {
        question: "Bietet SLT Rental eine Tiefpreisgarantie?",
        answer:
          "Ja. Bei einem nachweislich günstigeren identischen Angebot gibt es 10 % Rabatt auf den Nettopreis.",
      },
    ],
  },
};

export default function Vergleich() {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? VERGLEICHE[slug] : undefined;

  const jsonLd = useMemo(() => {
    if (!data) return undefined;
    return [
      SLT_BREADCRUMB_JSONLD([
        { name: "Start", url: "/" },
        { name: "Vergleich", url: "/vergleich" },
        { name: data.competitorShort, url: `/vergleich/${data.slug}` },
      ]),
      SLT_FAQ_JSONLD(data.faqs),
    ];
  }, [data]);

  if (!data) return <Navigate to="/" replace />;

  return (
    <Layout>
      <SEO
        title={data.title}
        description={data.description}
        canonical={`/vergleich/${data.slug}`}
        keywords={`SLT Rental, ${data.competitor}, Vergleich, Baumaschinen mieten NRW, ${data.competitorShort} Alternative`}
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <section className="bg-primary py-8 md:py-10 lg:py-16">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <Link
              to="/vergleich/"
              className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground text-xs md:text-sm mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zur Vergleichsübersicht
            </Link>
            <p className="text-primary-foreground/70 text-xs md:text-sm uppercase tracking-wide mb-2">
              Anbietervergleich
            </p>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground mb-3 md:mb-4">
              {data.h1}
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl text-sm md:text-base">
              Sachlicher Anbietervergleich nach objektiven Kriterien. SLT Rental ist ein regionaler Mietpark in Nordrhein-Westfalen.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Intro */}
      <section className="py-8 md:py-12 bg-background">
        <div className="section-container max-w-4xl">
          <AnimatedSection animation="fade-in-up">
            {data.intro.map((p, i) => (
              <p key={i} className="text-sm md:text-base text-body leading-relaxed mb-4">
                {p}
              </p>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* Vergleichstabelle */}
      <section className="py-8 md:py-12 bg-surface-light/30 border-y border-border">
        <div className="section-container max-w-5xl">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-headline mb-6">
              Vergleichstabelle: SLT Rental und {data.competitorShort}
            </h2>
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm md:text-base">
                  <thead className="bg-primary text-primary-foreground">
                    <tr>
                      <th className="text-left p-3 md:p-4 font-semibold">Kriterium</th>
                      <th className="text-left p-3 md:p-4 font-semibold">
                        <span className="inline-flex items-center">
                          <img
                            src={sltLogo}
                            alt="SLT Rental"
                            className="h-10 md:h-14 w-auto bg-white rounded px-2 py-1"
                            loading="lazy"
                          />
                        </span>
                      </th>
                      <th className="text-left p-3 md:p-4 font-semibold">{data.competitorShort}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((row, i) => (
                      <tr
                        key={i}
                        className={i % 2 === 0 ? "bg-background" : "bg-surface-light/40"}
                      >
                        <td className="p-3 md:p-4 font-medium text-headline align-top">
                          {row.feature}
                        </td>
                        <td className="p-3 md:p-4 text-body align-top">
                          <span className="inline-flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                            <span>{row.slt}</span>
                          </span>
                        </td>
                        <td className="p-3 md:p-4 text-body align-top">{row.competitor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
            <p className="text-xs text-muted-foreground mt-3">
              Hinweis: Aussagen zum Wettbewerber basieren auf allgemein verfügbaren Informationen. Stand: laufend gepflegt. Quelle für SLT-Werte: eigene Website.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 md:py-14 bg-background">
        <div className="section-container max-w-3xl">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-headline mb-6">
              Häufige Fragen zum Vergleich SLT Rental und {data.competitorShort}
            </h2>
            <Accordion type="single" collapsible className="space-y-2">
              {data.faqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="border border-border rounded-md px-4 bg-background"
                >
                  <AccordionTrigger className="text-left text-headline hover:text-primary py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 md:py-14 bg-primary">
        <div className="section-container max-w-4xl text-center">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary-foreground mb-4">
              SLT Rental kennenlernen
            </h2>
            <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto text-sm md:text-base">
              Drei Standorte in Nordrhein-Westfalen, breites Mietsortiment und persönliche Ansprechpartner vor Ort.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link to="/mieten/">Mietkatalog ansehen</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link to="/kontakt">
                  <Phone className="h-4 w-4 mr-2" />
                  Kontakt aufnehmen
                </Link>
              </Button>
            </div>
            <div className="mt-6 text-primary-foreground/70 text-xs md:text-sm">
              Weitere Vergleiche:{" "}
              {Object.values(VERGLEICHE)
                .filter((v) => v.slug !== data.slug)
                .map((v, i, arr) => (
                  <span key={v.slug}>
                    <Link to={`/vergleich/${v.slug}/`} className="underline hover:text-primary-foreground">
                      SLT vs. {v.competitorShort}
                    </Link>
                    {i < arr.length - 1 ? " · " : ""}
                  </span>
                ))}
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}

export const VERGLEICH_SLUGS = Object.keys(VERGLEICHE);
