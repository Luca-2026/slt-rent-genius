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
    competitor: "HKL Baumaschinen",
    competitorShort: "HKL",
    h1: "SLT Rental und HKL im Vergleich",
    title: "SLT Rental vs. HKL: Maschinenvermietung in NRW im Vergleich",
    description:
      "Sachlicher Vergleich von SLT Rental und HKL: Standorte in NRW, Online-Buchung, Tiefpreisgarantie, Lieferung und Gerätekategorien.",
    intro: [
      "Wer in Nordrhein-Westfalen Baumaschinen, Anhänger oder Eventtechnik mieten möchte, stößt häufig auf zwei Anbieter: SLT Rental als regionalen Mietpark mit drei Standorten und HKL Baumaschinen als bundesweit aktiven Vermieter mit dichtem Filialnetz.",
      "Diese Seite vergleicht beide Anbieter sachlich anhand objektiver, nachprüfbarer Kriterien. Ziel ist es, die Auswahl zu erleichtern, nicht den Wettbewerb herabzusetzen.",
    ],
    rows: [
      { feature: "Standorte in NRW", slt: "3 Standorte: Krefeld, Bonn, Mülheim an der Ruhr", competitor: "Mehrere Niederlassungen bundesweit, auch in NRW" },
      { feature: "Online-Buchung 24/7", slt: "Ja, inklusive Anhänger-Selbstbedienung rund um die Uhr", competitor: "Online-Anfrage möglich, Abwicklung primär über Niederlassung" },
      { feature: "Tiefpreisgarantie", slt: "Ja, wir unterbieten vergleichbare Angebote der Region", competitor: "Keine veröffentlichte Tiefpreisgarantie bekannt" },
      { feature: "Lieferung im Umkreis", slt: "Eigene Lieferung, kalkulierbare Kilometerpauschale", competitor: "Lieferung über Niederlassung verfügbar" },
      { feature: "Gerätekategorien", slt: "Baumaschinen, Anhänger, Arbeitsbühnen, Stromaggregate, Event-Equipment", competitor: "Schwerpunkt Baumaschinen und Baugeräte" },
      { feature: "Zielgruppe", slt: "B2B und B2C, Bauunternehmen, Handwerk, GaLaBau, Privatkunden, Veranstalter", competitor: "Primär gewerbliche Kunden aus dem Bau" },
      { feature: "Persönlicher Ansprechpartner", slt: "Feste Standortteams in Krefeld und Bonn", competitor: "Niederlassungspersonal je Standort" },
    ],
    faqs: [
      {
        question: "Was unterscheidet SLT Rental von HKL?",
        answer:
          "SLT Rental ist ein regionaler Mietpark in Nordrhein-Westfalen mit drei Standorten in Krefeld, Bonn und Mülheim an der Ruhr und einem breiten Sortiment, das neben Baumaschinen auch Anhänger, Stromaggregate und Event-Equipment umfasst. HKL ist ein bundesweit aktiver Vermieter mit Schwerpunkt Baumaschinen und einem dichten Filialnetz.",
      },
      {
        question: "Kann ich bei SLT Rental auch als Privatkunde mieten?",
        answer:
          "Ja. SLT Rental vermietet an Privatkunden (B2C) und an Unternehmen (B2B). Anhänger sind 24/7 online buchbar, Baumaschinen und Eventtechnik werden über Anfrage oder den Mietkatalog reserviert.",
      },
      {
        question: "Gibt es bei SLT Rental eine Tiefpreisgarantie?",
        answer:
          "Ja. Finden Sie ein vergleichbares Mietangebot in der Region günstiger, unterbietet SLT Rental den Preis. Details stehen auf der Seite Tiefpreisgarantie.",
      },
      {
        question: "An welchen Standorten ist SLT Rental in NRW vertreten?",
        answer:
          "SLT Rental ist mit drei Standorten in Nordrhein-Westfalen vertreten: Krefeld (Hauptsitz), Bonn und Mülheim an der Ruhr. Lieferung in den Umkreis ist über alle Standorte möglich.",
      },
    ],
  },
  "slt-vs-boels": {
    slug: "slt-vs-boels",
    competitor: "Boels Rental",
    competitorShort: "Boels",
    h1: "SLT Rental und Boels im Vergleich",
    title: "SLT Rental vs. Boels: Maschinenvermietung in NRW im Vergleich",
    description:
      "Sachlicher Vergleich von SLT Rental und Boels Rental: Standorte in NRW, Online-Buchung, Tiefpreisgarantie, Lieferung und Gerätekategorien.",
    intro: [
      "Boels Rental ist ein international tätiger Vermieter aus den Niederlanden mit einem dichten Standortnetz auch in Nordrhein-Westfalen. SLT Rental konzentriert sich als regionaler Mietpark auf drei Standorte in NRW und ein breites Sortiment für Bau, Veranstaltung und Privatkunden.",
      "Diese Seite stellt beide Anbieter anhand objektiver Kriterien gegenüber, ohne Mitbewerber abzuwerten.",
    ],
    rows: [
      { feature: "Standorte in NRW", slt: "3 Standorte: Krefeld, Bonn, Mülheim an der Ruhr", competitor: "Zahlreiche Niederlassungen, international und in NRW" },
      { feature: "Online-Buchung 24/7", slt: "Ja, inklusive Anhänger-Selbstbedienung rund um die Uhr", competitor: "Online-Buchung möglich, Filialabwicklung üblich" },
      { feature: "Tiefpreisgarantie", slt: "Ja, wir unterbieten vergleichbare Angebote der Region", competitor: "Keine veröffentlichte Tiefpreisgarantie bekannt" },
      { feature: "Lieferung im Umkreis", slt: "Eigene Lieferung, kalkulierbare Kilometerpauschale", competitor: "Lieferung über die jeweilige Niederlassung" },
      { feature: "Gerätekategorien", slt: "Baumaschinen, Anhänger, Arbeitsbühnen, Stromaggregate, Event-Equipment", competitor: "Breites Sortiment, Schwerpunkt Bau und Industrie" },
      { feature: "Zielgruppe", slt: "B2B und B2C, Bau, Handwerk, GaLaBau, Privatkunden, Veranstalter", competitor: "Primär gewerbliche Kunden" },
      { feature: "Persönlicher Ansprechpartner", slt: "Feste Standortteams in Krefeld und Bonn", competitor: "Filialteam je Standort" },
    ],
    faqs: [
      {
        question: "Was unterscheidet SLT Rental von Boels?",
        answer:
          "SLT Rental ist ein regional verwurzelter Mietpark in NRW mit drei Standorten in Krefeld, Bonn und Mülheim an der Ruhr. Boels Rental ist international aufgestellt und betreibt ein dichtes Netz an Niederlassungen. SLT bietet zusätzlich Event-Equipment und 24/7-Anhängerbuchung an.",
      },
      {
        question: "Kann ich bei SLT Rental auch kurzfristig mieten?",
        answer:
          "Ja. Über die Online-Buchung sind Anhänger 24/7 verfügbar, viele Baumaschinen und Geräte können kurzfristig nach Verfügbarkeit reserviert werden. Telefonische Beratung läuft über die Standortteams.",
      },
      {
        question: "Welche Gerätekategorien bietet SLT Rental?",
        answer:
          "Baumaschinen (zum Beispiel Minibagger), Anhänger, Arbeitsbühnen, Stromaggregate und Event-Equipment. Das vollständige Sortiment finden Sie im Mietkatalog je Standort.",
      },
      {
        question: "Liefert SLT Rental zur Baustelle?",
        answer:
          "Ja. Die Lieferkosten werden anhand einer Kilometerpauschale kalkuliert. Auf der Seite Lieferung steht ein Rechner für eine erste Preisindikation.",
      },
    ],
  },
  "slt-vs-beyer": {
    slug: "slt-vs-beyer",
    competitor: "Beyer-Mietservice",
    competitorShort: "Beyer",
    h1: "SLT Rental und Beyer-Mietservice im Vergleich",
    title: "SLT Rental vs. Beyer: Maschinenvermietung in NRW im Vergleich",
    description:
      "Sachlicher Vergleich von SLT Rental und Beyer-Mietservice: Standorte in NRW, Online-Buchung, Tiefpreisgarantie, Lieferung und Gerätekategorien.",
    intro: [
      "Beyer-Mietservice gehört zu den bekannten Vermietern für Bau- und Industriegeräte mit Standorten unter anderem in Nordrhein-Westfalen. SLT Rental ist ein regionaler Mietpark mit drei Standorten in NRW und einem auf Bau, Event und Privatkunden ausgerichteten Sortiment.",
      "Der folgende Vergleich beschränkt sich auf objektive, nachprüfbare Kriterien.",
    ],
    rows: [
      { feature: "Standorte in NRW", slt: "3 Standorte: Krefeld, Bonn, Mülheim an der Ruhr", competitor: "Mehrere Standorte in NRW und angrenzenden Regionen" },
      { feature: "Online-Buchung 24/7", slt: "Ja, inklusive Anhänger-Selbstbedienung rund um die Uhr", competitor: "Online-Anfrage, Buchung primär über Niederlassung" },
      { feature: "Tiefpreisgarantie", slt: "Ja, wir unterbieten vergleichbare Angebote der Region", competitor: "Keine veröffentlichte Tiefpreisgarantie bekannt" },
      { feature: "Lieferung im Umkreis", slt: "Eigene Lieferung, kalkulierbare Kilometerpauschale", competitor: "Lieferung über die Niederlassung verfügbar" },
      { feature: "Gerätekategorien", slt: "Baumaschinen, Anhänger, Arbeitsbühnen, Stromaggregate, Event-Equipment", competitor: "Bau- und Industriegeräte" },
      { feature: "Zielgruppe", slt: "B2B und B2C, Bau, Handwerk, GaLaBau, Privatkunden, Veranstalter", competitor: "Primär gewerbliche Kunden" },
      { feature: "Persönlicher Ansprechpartner", slt: "Feste Standortteams in Krefeld und Bonn", competitor: "Niederlassungspersonal je Standort" },
    ],
    faqs: [
      {
        question: "Was unterscheidet SLT Rental von Beyer-Mietservice?",
        answer:
          "SLT Rental ist ein regional aufgestellter Mietpark mit drei Standorten in NRW (Krefeld, Bonn, Mülheim an der Ruhr) und einem Sortiment, das neben Baumaschinen auch Anhänger, Stromaggregate und Event-Equipment umfasst. Beyer-Mietservice fokussiert sich auf Bau- und Industriegeräte und ist an mehreren Standorten in NRW vertreten.",
      },
      {
        question: "Bietet SLT Rental auch Event-Equipment an?",
        answer:
          "Ja. Zum SLT-Sortiment gehören Zelte, Bestuhlung, Stromaggregate und weitere Eventtechnik. Diese Geräte sind über den Mietkatalog der Standorte verfügbar.",
      },
      {
        question: "Wie schnell kann ich Geräte bei SLT Rental bekommen?",
        answer:
          "Anhänger sind 24/7 online buchbar. Für Baumaschinen und Aggregate hängt die Verfügbarkeit vom Standort und Zeitraum ab. Eine Verfügbarkeitsprüfung läuft direkt im Mietkatalog oder telefonisch über die Standortteams.",
      },
      {
        question: "Gibt es eine Tiefpreisgarantie bei SLT Rental?",
        answer:
          "Ja. Sollten Sie ein vergleichbares Angebot in der Region günstiger finden, unterbietet SLT Rental den Preis. Bedingungen stehen auf der Seite Tiefpreisgarantie.",
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
                      <th className="text-left p-3 md:p-4 font-semibold">SLT Rental</th>
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
                <Link to="/mieten">Mietkatalog ansehen</Link>
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
                    <Link to={`/vergleich/${v.slug}`} className="underline hover:text-primary-foreground">
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
