import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/ui/animated-section";
import {
  Wrench,
  MapPin,
  Phone,
  CheckCircle2,
  Truck,
  Shield,
  Clock,
  Mail,
  Package,
  ArrowRight,
} from "lucide-react";
import { locationData } from "@/data/locationData";

const BASE_URL = "https://www.slt-rental.de";
const PAGE_PATH = "/service/baumax-reparatur-nrw";

const SERVICED_MODELS = [
  "BAUMAX KDE550 Raddumper",
  "BAUMAX KDE550P Raddumper",
  "BAUMAX RMD800P Minidumper",
  "BAUMAX VP1644 Rüttelplatte",
  "BAUMAX HVP3050 Rüttelplatte",
  "BAUMAX GS72-XH Vibrationsstampfer",
];

const SERVICES = [
  {
    icon: Wrench,
    title: "Wartung & Inspektion",
    text: "Regelmäßige Wartung nach Herstellervorgaben, Ölwechsel, Filterwechsel, UVV-Prüfung – damit Deine BAUMAX-Maschine langfristig zuverlässig läuft.",
  },
  {
    icon: Shield,
    title: "Reparatur & Diagnose",
    text: "Fehlerdiagnose und Reparatur in unserer eigenen Werkstatt: Motor, Hydraulik, Elektrik, Fahrwerk. Direkter Draht zu BAUMAX bei kniffligen Fällen.",
  },
  {
    icon: Package,
    title: "Original BAUMAX Ersatzteile",
    text: "Schnelle Versorgung mit Original-Ersatzteilen über unseren direkten Bezug beim Hersteller – keine No-Name-Komponenten.",
  },
  {
    icon: CheckCircle2,
    title: "Garantieabwicklung",
    text: "Wir übernehmen für Dich die komplette Garantieabwicklung mit BAUMAX – ohne Telefonate, Versand oder Papierkram auf Deiner Seite.",
  },
  {
    icon: Truck,
    title: "Hol- und Bringservice",
    text: "Du hast keine Zeit oder keinen passenden Transport? Wir holen Deine BAUMAX-Maschine in NRW ab und bringen sie nach Service oder Reparatur zurück.",
  },
  {
    icon: Clock,
    title: "Schnelle Durchlaufzeiten",
    text: "Eigene Werkstatt, eingespieltes Team, Ersatzteile auf Lager – wir halten die Standzeiten so kurz wie möglich.",
  },
];

const FAQ = [
  {
    q: "Repariert SLT Rental auch BAUMAX-Maschinen, die nicht bei euch gekauft wurden?",
    a: "Ja. Wir warten und reparieren BAUMAX-Maschinen unabhängig davon, wo sie ursprünglich gekauft wurden. Bring uns Deine Maschine an einen unserer Standorte in Krefeld oder Bonn oder nutze unseren Hol- und Bringservice in NRW.",
  },
  {
    q: "Welche BAUMAX-Modelle könnt ihr warten und reparieren?",
    a: "Wir betreuen das aktuelle BAUMAX-Sortiment, das wir auch im Verkauf führen: Raddumper KDE550 und KDE550P, Minidumper RMD800P, Rüttelplatten VP1644 und HVP3050 sowie den Vibrationsstampfer GS72-XH. Andere Modelle prüfen wir auf Anfrage.",
  },
  {
    q: "Wo befindet sich der BAUMAX Reparatur- und Servicebetrieb in NRW?",
    a: "Service und Reparatur laufen in Krefeld (Anrather Straße 291, 47807 Krefeld-Fichtenhain) sowie in Bonn (Drachenburgstraße 8, 53179 Bonn). Beide Standorte verfügen über eine eigene Werkstatt.",
  },
  {
    q: "Wie schnell bekomme ich einen Werkstatt-Termin?",
    a: "In der Regel innerhalb weniger Werktage. Bei reinen Verschleißteilen oder Standard-Inspektionen oft kurzfristiger. Rufe uns am besten direkt unter 02151 417 99 04 (Krefeld) oder 0228 504 660 61 (Bonn) an.",
  },
  {
    q: "Bekomme ich auch nur Ersatzteile ohne Werkstattauftrag?",
    a: "Ja. Über unseren direkten Draht zum Hersteller bestellen wir auch einzelne Original-BAUMAX-Ersatzteile für Dich – einfach per E-Mail oder Telefon mit Modell- und Seriennummer anfragen.",
  },
  {
    q: "Übernehmt ihr die Garantieabwicklung mit BAUMAX?",
    a: "Ja. Als Fachhändler wickeln wir Garantiefälle direkt mit dem Hersteller ab. Du musst Dich um nichts kümmern – wir prüfen den Fall, reichen ihn ein und führen die Reparatur durch.",
  },
  {
    q: "Was kostet eine Inspektion meiner BAUMAX-Maschine?",
    a: "Die Kosten hängen von Modell und Umfang ab. Wir geben Dir nach einer kurzen Sichtung einen verbindlichen Kostenvoranschlag, bevor wir mit der Arbeit beginnen – keine versteckten Posten.",
  },
];

const LOCATIONS_FOR_SERVICE = locationData.filter((l) => l.id === "krefeld" || l.id === "bonn");

export default function BaumaxService() {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Start", item: `${BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Service", item: `${BASE_URL}${PAGE_PATH}` },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Reparatur und Wartung BAUMAX-Baumaschinen",
    name: "BAUMAX Reparatur und Servicebetrieb NRW",
    description:
      "Reparatur, Wartung, Inspektion und Ersatzteilservice für BAUMAX-Baumaschinen (Raddumper, Minidumper, Rüttelplatten, Stampfer) in Nordrhein-Westfalen.",
    areaServed: [
      { "@type": "AdministrativeArea", name: "Nordrhein-Westfalen" },
      { "@type": "City", name: "Krefeld" },
      { "@type": "City", name: "Bonn" },
      { "@type": "City", name: "Düsseldorf" },
      { "@type": "City", name: "Köln" },
      { "@type": "City", name: "Mülheim an der Ruhr" },
    ],
    provider: LOCATIONS_FOR_SERVICE.map((loc) => ({
      "@type": "LocalBusiness",
      name: `SLT Rental ${loc.name} – BAUMAX Servicebetrieb`,
      telephone: loc.phone,
      email: loc.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: loc.address,
        addressLocality: loc.city,
        addressCountry: "DE",
      },
      url: `${BASE_URL}/standorte/${loc.id}`,
    })),
    brand: { "@type": "Brand", name: "BAUMAX" },
    url: `${BASE_URL}${PAGE_PATH}`,
  };

  return (
    <Layout>
      <SEO
        title="BAUMAX Reparatur & Servicebetrieb NRW – Krefeld & Bonn"
        description="Autorisierter BAUMAX Fachhändler in NRW: Reparatur, Wartung, Inspektion und Original-Ersatzteile für Raddumper, Minidumper, Rüttelplatten und Stampfer in Krefeld und Bonn."
        canonical={PAGE_PATH}
        keywords="BAUMAX Reparatur, BAUMAX Service, BAUMAX Werkstatt NRW, BAUMAX Servicebetrieb, BAUMAX Ersatzteile, BAUMAX Fachhändler Krefeld, BAUMAX Fachhändler Bonn, Raddumper Reparatur, Minidumper Reparatur"
        jsonLd={[breadcrumb, faqSchema, serviceSchema]}
      />

      {/* Hero */}
      <section className="bg-primary py-10 md:py-14">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <p className="text-primary-foreground/70 text-xs md:text-sm uppercase tracking-wide mb-2">
              Servicebetrieb · Fachhändler · Werkstatt in NRW
            </p>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground mb-3 md:mb-4">
              BAUMAX Reparatur &amp; Servicebetrieb in NRW
            </h1>
            <p className="text-primary-foreground/85 max-w-3xl text-sm md:text-base leading-relaxed">
              SLT Rental ist autorisierter BAUMAX Fachhändler mit eigener Werkstatt in Krefeld und Bonn.
              Wir warten, reparieren und versorgen Deine BAUMAX-Baumaschine mit Original-Ersatzteilen –
              für Raddumper, Minidumper, Rüttelplatten und Vibrationsstampfer.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" variant="secondary">
                <a href="tel:+4921514179904">
                  <Phone className="h-4 w-4 mr-2" /> Krefeld: 02151 417 99 04
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <a href="tel:+4922850466061">
                  <Phone className="h-4 w-4 mr-2" /> Bonn: 0228 504 660 61
                </a>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Intro */}
      <section className="py-8 md:py-12 bg-background">
        <div className="section-container max-w-4xl">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-xl md:text-2xl font-bold text-headline mb-4">
              Dein BAUMAX Servicepartner für Nordrhein-Westfalen
            </h2>
            <p className="text-sm md:text-base text-body leading-relaxed mb-3">
              Eine BAUMAX-Maschine ist nur so gut wie ihr Service. Genau hier kommen wir ins Spiel: Als
              autorisierter Fachhändler betreiben wir zwei voll ausgestattete Werkstätten in Nordrhein-Westfalen –
              am Hauptstandort Krefeld und am Standort Bonn. Unser Werkstatt-Team kennt jede Schraube an Raddumper
              KDE550, KDE550P, Minidumper RMD800P, den Rüttelplatten VP1644 und HVP3050 sowie am Vibrationsstampfer GS72-XH.
            </p>
            <p className="text-sm md:text-base text-body leading-relaxed">
              Vom kurzen Boxenstopp für die Wartung bis zur kompletten Generalüberholung: Wir halten Deine Maschinen
              einsatzbereit – schnell, transparent und ohne Versand quer durch Deutschland. Auf Wunsch holen wir
              die Maschine bei Dir ab und liefern sie nach getaner Arbeit wieder aus.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-10 md:py-14 bg-surface-light/30 border-y border-border">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-xl md:text-2xl font-bold text-headline mb-6 md:mb-8 text-center">
              Was wir für Deine BAUMAX-Maschine machen
            </h2>
          </AnimatedSection>
          <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <AnimatedSection key={i} animation="fade-in-up">
                <Card className="h-full">
                  <CardContent className="p-5 md:p-6">
                    <s.icon className="h-7 w-7 text-primary mb-3" />
                    <h3 className="text-base md:text-lg font-bold text-headline mb-2">{s.title}</h3>
                    <p className="text-sm text-body leading-relaxed">{s.text}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Serviced models */}
      <section className="py-8 md:py-12 bg-background">
        <div className="section-container max-w-4xl">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-xl md:text-2xl font-bold text-headline mb-4">
              Welche BAUMAX-Modelle wir betreuen
            </h2>
            <p className="text-sm md:text-base text-body leading-relaxed mb-4">
              Wir warten und reparieren das komplette aktuelle BAUMAX-Sortiment, das wir auch im Verkauf führen.
              Andere Modelle prüfen wir gern auf Anfrage.
            </p>
            <ul className="grid sm:grid-cols-2 gap-2">
              {SERVICED_MODELS.map((m) => (
                <li key={m} className="flex items-start gap-2 text-sm text-body">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> {m}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mt-4">
              Du suchst eine BAUMAX-Maschine zum Kauf?{" "}
              <Link to="/verkauf/neumaschinen/" className="text-primary hover:underline">
                Hier geht es zum Neumaschinen-Sortiment
              </Link>
              .
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Locations */}
      <section className="py-10 md:py-14 bg-surface-light/30 border-y border-border">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-xl md:text-2xl font-bold text-headline mb-6 md:mb-8 text-center">
              Unsere BAUMAX Servicestandorte
            </h2>
          </AnimatedSection>
          <div className="grid gap-4 md:gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {LOCATIONS_FOR_SERVICE.map((loc) => (
              <AnimatedSection key={loc.id} animation="fade-in-up">
                <Card className="h-full">
                  <CardContent className="p-5 md:p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-bold text-headline">
                        SLT Rental {loc.name} – BAUMAX Servicebetrieb
                      </h3>
                    </div>
                    <p className="text-sm text-body mb-1">{loc.address}</p>
                    <p className="text-sm text-body mb-3">{loc.city}</p>
                    <div className="space-y-1 text-sm mb-4">
                      <a href={`tel:${loc.phone.replace(/\s+/g, "")}`} className="flex items-center gap-2 text-primary hover:underline">
                        <Phone className="h-4 w-4" /> {loc.phone}
                      </a>
                      <a href={`mailto:${loc.email}`} className="flex items-center gap-2 text-primary hover:underline">
                        <Mail className="h-4 w-4" /> {loc.email}
                      </a>
                    </div>
                    <div className="text-xs text-muted-foreground mb-4">
                      {loc.hours.map((h) => (
                        <div key={h.day}>
                          <span className="font-medium">{h.day}:</span> {h.time}
                        </div>
                      ))}
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/standorte/${loc.id}/`}>
                        Zum Standort {loc.name} <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 md:py-14 bg-background">
        <div className="section-container max-w-4xl">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-xl md:text-2xl font-bold text-headline mb-6">
              Häufige Fragen zum BAUMAX Reparatur- und Servicebetrieb
            </h2>
          </AnimatedSection>
          <div className="space-y-4">
            {FAQ.map((f, i) => (
              <AnimatedSection key={i} animation="fade-in-up">
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-base md:text-lg font-semibold text-headline mb-2">{f.q}</h3>
                    <p className="text-sm text-body leading-relaxed">{f.a}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 md:py-14 bg-primary">
        <div className="section-container max-w-4xl text-center">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary-foreground mb-4">
              BAUMAX-Maschine reparieren oder warten lassen?
            </h2>
            <p className="text-primary-foreground/85 mb-6 max-w-2xl mx-auto text-sm md:text-base">
              Ruf uns an oder schreib uns – wir vereinbaren kurzfristig einen Werkstatt-Termin und kümmern uns auf Wunsch auch um Abholung und Lieferung in NRW.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link to="/kontakt">
                  <Mail className="h-4 w-4 mr-2" /> Service-Anfrage senden
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <a href="tel:+4921514179904">
                  <Phone className="h-4 w-4 mr-2" /> Werkstatt Krefeld anrufen
                </a>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
