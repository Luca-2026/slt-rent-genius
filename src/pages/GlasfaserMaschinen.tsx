import { Layout } from "@/components/layout";
import { SEO, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/ui/animated-section";
import { LocationSelectDialog } from "@/components/solutions/LocationSelectDialog";
import { useState } from "react";
import {
  Cable,
  Wrench,
  Truck,
  Shield,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Percent,
} from "lucide-react";
import glasfaserHero from "@/assets/glasfaser-baumaschinen-nrw.jpg";

const BASE_URL = "https://www.slt-rental.de";
const PAGE_PATH = "/glasfaserausbau-maschinen-mieten";
const OG_IMAGE = `${BASE_URL}/og/glasfaser-baumaschinen-nrw.jpg`;

// Maschinenpakete – jeweils mit Ziel-Kategorie (Standortauswahl-Dialog davor).
// Kategorie-IDs müssen mit src/data/rentalData.ts übereinstimmen:
//   erdbewegung | verdichtung | absperrtechnik | aggregate
const MACHINE_PACKAGES: Array<{
  title: string;
  desc: string;
  category: "erdbewegung" | "verdichtung" | "absperrtechnik" | "aggregate";
  bullets: string[];
}> = [
  {
    title: "Minibagger mieten (1–3 t) für Glasfaser-Hausanschluss",
    desc: "Wendige Kettenbagger für Hausanschluss-Gräben, Verteilerkästen und Trassen in beengten Lagen.",
    category: "erdbewegung",
    bullets: ["Tieflöffel & Grabenlöffel", "Gummikette – schonend für Gehwege", "Auf 3,5 t Anhänger transportierbar"],
  },
  {
    title: "Radlader & Hoflader mieten",
    desc: "Für Bodenaushub, Verfüllmaterial und Materialhandling an der Glasfaser-Baustelle.",
    category: "erdbewegung",
    bullets: ["Schaufel, Palettengabel", "Diesel oder elektrisch", "Knicklenkung für enge Trassen"],
  },
  {
    title: "Rüttelplatte & Stampfer mieten für Grabenverdichtung",
    desc: "Verdichtung von Grabenverfüllung über Tiefbausand bis zur Tragschicht – reversierbar oder vorwärts.",
    category: "verdichtung",
    bullets: ["50–500 kg Klasse", "Reversierbar für Grabensohle", "Vibrationsstampfer für enge Gräben"],
  },
  {
    title: "Fugenschneider mieten für Asphaltschnitt",
    desc: "Sauberer Asphaltschnitt für die Wiederherstellung der Decke nach dem Glasfasergraben.",
    category: "verdichtung",
    bullets: ["Bis 200 mm Schnitttiefe", "Benzin & Elektro-Start", "Inkl. Diamantscheibe auf Wunsch"],
  },
  {
    title: "Absperrung & Verkehrssicherung mieten",
    desc: "Bauzäune, Warnzäune, Leitkegel, Warnleuchten und Halteverbotsschilder – alles aus einer Hand.",
    category: "absperrtechnik",
    bullets: ["Bauzaun mobil", "Halteverbotsschilder mit Genehmigung", "Leitkegel, Warnbaken, Blitzleuchten"],
  },
  {
    title: "Stromerzeuger mieten für Glasfaser-Baustellen",
    desc: "Baustrom, Stromerzeuger und Verteilung für Werkzeug, Beleuchtung und Spleißcontainer.",
    category: "aggregate",
    bullets: ["3–60 kVA Aggregate", "Baustromverteiler & CEE-Kabel", "Baustromanschluss zum Festpreis"],
  },
];

const ADVANTAGES = [
  {
    icon: Percent,
    title: "Sonderkonditionen für Glasfasertrupps",
    text: "Wochen- und Monatspakete mit deutlich reduzierten Tagessätzen – kalkulierbar für Trassen-Lose und Rahmenverträge.",
  },
  {
    icon: Truck,
    title: "Lieferung in ganz NRW",
    text: "Von Krefeld, Bonn und Mülheim an der Ruhr liefern wir Baumaschinen und Absperrmaterial direkt auf Deine Baustelle – auch kurzfristig.",
  },
  {
    icon: Clock,
    title: "Kurzfristige Verfügbarkeit",
    text: "Fester Maschinenpool für Tiefbau- und Glasfaserprojekte. Tausch bei Ausfall innerhalb von 24 h, damit der Trupp nicht steht.",
  },
  {
    icon: Shield,
    title: "Tiefpreisgarantie",
    text: "10 % günstiger als jeder vergleichbare Vermieter in NRW – schriftlich garantiert. Faire Konditionen ohne versteckte Gebühren.",
  },
  {
    icon: Wrench,
    title: "Eigene Werkstatt – kein Stillstand",
    text: "Service und Reparatur direkt an unseren Standorten. BAUMAX-Servicebetrieb mit Original-Ersatzteilen.",
  },
  {
    icon: Cable,
    title: "Auf Glasfaser-Tiefbau abgestimmt",
    text: "Maschinen, Verdichter und Absperrung passgenau für Hausanschluss, Microtrenching und FTTH-Trassen – inkl. Beratung.",
  },
];

const FAQ = [
  {
    q: "Welche Maschinen brauche ich typischerweise für den Glasfaserausbau?",
    a: "Für den klassischen FTTH-Hausanschluss benötigst Du in der Regel einen Minibagger (1–3 t), eine Rüttelplatte oder einen Stampfer für die Grabenverfüllung, einen Fugenschneider für den Asphaltschnitt sowie Absperrmaterial (Bauzaun, Leitkegel, Warnleuchten, Halteverbotsschilder). Wir stellen Dir das passende Paket nach Trassenmeter und Bodenklasse zusammen.",
  },
  {
    q: "Was kostet die Miete von Glasfaser-Baumaschinen?",
    a: "Die Miete richtet sich nach Maschine, Mietdauer und Standort. Tagespreise starten z. B. bei Rüttelplatten ab ~35 €/Tag, Minibagger ab ~140 €/Tag. Für Glasfaser-Trupps berechnen wir gestaffelte Wochen- und Monatspakete mit Sonderkonditionen – auf Anfrage erhältst Du ein verbindliches Angebot. Tagesaktuelle Preise zeigt Dir die jeweilige Standort-Kategorieseite.",
  },
  {
    q: "Gibt es Sonderkonditionen für Glasfaser-Tiefbaufirmen und Generalunternehmer?",
    a: "Ja. Für Glasfaser-Trupps, Tiefbauunternehmen und Generalunternehmer bieten wir gestaffelte Wochen- und Monatspakete mit deutlich reduzierten Tagessätzen. Bei Rahmenverträgen oder festen Trupp-Größen kalkulieren wir individuell – sprich uns einfach an.",
  },
  {
    q: "Liefert SLT Rental die Maschinen auf die Baustelle?",
    a: "Ja. Von unseren Standorten Krefeld, Bonn und Mülheim an der Ruhr liefern wir in ganz Nordrhein-Westfalen. Lieferung und Abholung können wir auf Wunsch direkt mit der Baustellenfreigabe koordinieren.",
  },
  {
    q: "Was passiert bei einem Maschinenausfall auf der Baustelle?",
    a: "Wir tauschen ausgefallene Maschinen in der Regel innerhalb von 24 Stunden gegen ein gleichwertiges Gerät – damit Dein Trupp nicht stillsteht. Reparaturen laufen in unseren eigenen Werkstätten in Krefeld und Bonn.",
  },
  {
    q: "Übernehmt Ihr auch die Halteverbotszone bzw. die verkehrsrechtliche Anordnung?",
    a: "Ja. Wir stellen nicht nur die Schilder und Absperrungen, sondern übernehmen auf Wunsch auch den Antrag auf verkehrsrechtliche Anordnung und das Aufstellen der Halteverbotszone – inkl. fristgerechter Aufstellung.",
  },
  {
    q: "Welche Bezahlmodelle gibt es für Glasfaser-Projekte?",
    a: "Für gewerbliche Kunden bieten wir Rechnungskauf mit Zahlungsziel, Sammelrechnungen für mehrere Trupps und – nach Bonitätsprüfung – ein dediziertes Kreditlimit über unser B2B-Portal. So bleibt die Abwicklung schlank und projektbezogen.",
  },
];

export default function GlasfaserMaschinen() {
  const canonical = `${BASE_URL}${PAGE_PATH}`;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetCategory, setTargetCategory] = useState<string | undefined>(undefined);

  const openCategoryDialog = (categoryId: string) => {
    setTargetCategory(categoryId);
    setDialogOpen(true);
  };

  const jsonLd = [
    SLT_BREADCRUMB_JSONLD([
      { name: "Start", url: "/" },
      { name: "Glasfaserausbau – Maschinen mieten", url: PAGE_PATH },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Baumaschinen für den Glasfaserausbau mieten",
      serviceType: "Baumaschinenvermietung Glasfaserausbau",
      provider: {
        "@type": "Organization",
        name: "SLT Rental",
        url: BASE_URL,
      },
      areaServed: [
        { "@type": "State", name: "Nordrhein-Westfalen" },
        { "@type": "City", name: "Krefeld" },
        { "@type": "City", name: "Bonn" },
        { "@type": "City", name: "Mülheim an der Ruhr" },
      ],
      audience: {
        "@type": "BusinessAudience",
        audienceType: "Glasfaser-Tiefbauunternehmen, FTTH-Generalunternehmer, Telekommunikations-Bauunternehmen",
      },
      description:
        "Minibagger, Radlader, Rüttelplatten, Stampfer, Fugenschneider und Verkehrssicherung für den Glasfaserausbau in NRW – mit Sonderkonditionen für Glasfaser-Trupps.",
      url: canonical,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <Layout>
      <SEO
        title="Baumaschinen für den Glasfaserausbau in NRW mieten | SLT Rental"
        description="Minibagger, Rüttelplatte, Stampfer, Fugenschneider & Verkehrssicherung für den Glasfaserausbau in NRW mieten. Sonderkonditionen für Glasfaser-Trupps – Lieferung in Krefeld, Bonn und Mülheim an der Ruhr."
        canonical={PAGE_PATH}
        keywords="Baumaschinen Glasfaserausbau mieten, Minibagger mieten NRW, Rüttelplatte mieten NRW, Stampfer mieten, Fugenschneider mieten, Bauzaun mieten Glasfaser, Halteverbotsschilder Glasfaserausbau, Maschinenpaket Glasfaser-Trupp, FTTH Hausanschluss Maschinen, Microtrenching Maschinen mieten"
        ogImage={OG_IMAGE}
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <section className="bg-primary py-10 md:py-14 lg:py-20">
        <div className="section-container grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <AnimatedSection animation="fade-in-up">
            <p className="text-primary-foreground/70 text-xs md:text-sm uppercase tracking-wide mb-2">
              Maschinenpakete für den Glasfaserausbau
            </p>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 max-w-4xl">
              Baumaschinen für den Glasfaserausbau in NRW mieten
            </h1>
            <p className="text-primary-foreground/85 max-w-3xl text-sm md:text-base lg:text-lg leading-relaxed mb-6">
              Minibagger, Radlader, Rüttelplatten, Stampfer, Fugenschneider und das komplette Absperrmaterial – aus einer Hand, kurzfristig verfügbar, mit gestaffelten Wochen- und Monatspaketen für Glasfaser-Trupps und Tiefbau-Generalunternehmer in <strong>Krefeld, Bonn und Mülheim an der Ruhr</strong>.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/kontakt">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                  Maschinenpaket anfragen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="tel:+4921519955780">
                <Button size="lg" variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground hover:text-primary">
                  <Phone className="mr-2 h-4 w-4" />
                  02151 9955780
                </Button>
              </a>
            </div>
          </AnimatedSection>
          <AnimatedSection animation="fade-in-up" delay={120}>
            <img
              src={glasfaserHero}
              alt="Minibagger mieten für den Glasfaserausbau – Baustelle mit Kabeltrommel und Absperrung in NRW"
              width={1920}
              height={1024}
              className="w-full h-auto rounded-xl shadow-2xl object-cover aspect-[16/9]"
            />
          </AnimatedSection>
        </div>
      </section>

      {/* Intro */}
      <section className="py-10 md:py-14 bg-background">
        <div className="section-container max-w-4xl">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-xl md:text-2xl font-bold text-headline mb-4">
              Spezialisiert auf den Glasfaserausbau – von Hausanschluss bis Trassen-Los
            </h2>
            <p className="text-sm md:text-base text-body leading-relaxed mb-3">
              Beim Glasfaserausbau zählt jede Schicht: Trupps brauchen die richtige Maschine zur richtigen Zeit, einsatzbereit und ohne Leerlauf. SLT Rental hat den Mietpark, die Lagertiefe und die Reaktionsgeschwindigkeit darauf ausgelegt – mit Standorten in <strong>Krefeld, Bonn und Mülheim an der Ruhr</strong> bedienen wir Glasfaserprojekte in ganz Nordrhein-Westfalen.
            </p>
            <p className="text-sm md:text-base text-body leading-relaxed">
              Ob <strong>FTTH-Hausanschluss</strong>, <strong>Microtrenching</strong> oder klassischer Tiefbaugraben: Du bekommst die passenden Maschinen, Verdichter, Asphaltschnitt-Werkzeuge und das vollständige Absperr- und Verkehrssicherungs-Material aus einer Hand – zu Konditionen, die für Glasfaser-Trupps kalkuliert sind.
            </p>
            <h3 className="text-lg md:text-xl font-bold text-headline mt-8 mb-2">
              Minibagger mieten in NRW – das Arbeitspferd jedes Glasfaser-Trupps
            </h3>
            <p className="text-sm md:text-base text-body leading-relaxed">
              Für FTTH-Hausanschlüsse und schmale Trassen sind Minibagger der Klasse <strong>1–3 t</strong> ideal: wendig, mit Gummiketten gehwegschonend und auf einem 3,5 t-Anhänger transportierbar. Bei SLT Rental stehen u. a. Bobcat E10z, XCMG XE20E und XE27E sowie der Bobcat E35z für etwas größere Schächte bereit – an allen drei NRW-Standorten.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Machine Packages */}
      <section className="py-10 md:py-14 bg-surface-light/30 border-y border-border">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-xl md:text-2xl font-bold text-headline mb-2">
              Maschinen & Pakete für Glasfaser-Trupps in NRW
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-8 max-w-2xl">
              Direkt zu den passenden Kategorien – nach Klick wählst Du Deinen Standort (Krefeld, Bonn oder Mülheim) und siehst die verfügbaren Geräte.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {MACHINE_PACKAGES.map((pkg, i) => (
              <AnimatedSection key={pkg.title} animation="fade-in-up" delay={i * 60}>
                <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-2 hover:border-primary/40">
                  <CardContent className="p-5 md:p-6 flex flex-col h-full">
                    <h3 className="font-bold text-headline text-base md:text-lg mb-2">{pkg.title}</h3>
                    <p className="text-sm text-body mb-4">{pkg.desc}</p>
                    <ul className="space-y-1.5 mb-5 flex-1">
                      {pkg.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-body">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="outline"
                      className="w-full group mt-auto"
                      onClick={() => openCategoryDialog(pkg.category)}
                    >
                      Zur Kategorie
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-10 md:py-14 bg-background">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-xl md:text-2xl font-bold text-headline mb-8">
              Warum Glasfaser-Trupps in NRW bei SLT Rental mieten
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {ADVANTAGES.map((a, i) => (
              <AnimatedSection key={a.title} animation="fade-in-up" delay={i * 50}>
                <div className="flex gap-4 p-5 rounded-xl border border-border bg-card h-full">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <a.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-headline mb-1">{a.title}</h3>
                    <p className="text-sm text-body">{a.text}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Standorte */}
      <section className="py-10 md:py-14 bg-surface-light/30 border-y border-border">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-xl md:text-2xl font-bold text-headline mb-2">
              Drei Standorte – ganz NRW im Versorgungsradius
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-8 max-w-2xl">
              Krefeld, Bonn und Mülheim an der Ruhr – kurze Anfahrtswege zur Baustelle, schnelle Ersatzteilversorgung, eigene Werkstatt.
            </p>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { name: "Krefeld", region: "Niederrhein, linker Niederrhein, Düsseldorf-Nord" },
              { name: "Bonn", region: "Bonn, Rhein-Sieg-Kreis, Köln-Süd, Region Ahr" },
              { name: "Mülheim an der Ruhr", region: "Ruhrgebiet, Essen, Duisburg, Oberhausen" },
            ].map((s) => (
              <Card key={s.name} className="border-2">
                <CardContent className="p-5 flex gap-3 items-start">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-headline">{s.name}</h3>
                    <p className="text-sm text-muted-foreground">{s.region}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 md:py-14 bg-background">
        <div className="section-container max-w-4xl">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-xl md:text-2xl font-bold text-headline mb-8">
              Häufige Fragen aus Glasfaser-Projekten
            </h2>
          </AnimatedSection>
          <div className="space-y-4">
            {FAQ.map((f, i) => (
              <AnimatedSection key={f.q} animation="fade-in-up" delay={i * 40}>
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-headline mb-2">{f.q}</h3>
                    <p className="text-sm text-body">{f.a}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 bg-primary">
        <div className="section-container max-w-4xl text-center">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              Maschinenpaket für Dein Glasfaserprojekt anfragen
            </h2>
            <p className="text-primary-foreground/85 mb-6 max-w-2xl mx-auto">
              Sag uns Trassenmeter, Bodenklasse und Truppgröße – wir schicken Dir innerhalb eines Werktages ein passendes Maschinenpaket mit Sonderkonditionen.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/kontakt">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                  <Mail className="mr-2 h-4 w-4" />
                  Jetzt Angebot anfordern
                </Button>
              </Link>
              <a href="tel:+4921519955780">
                <Button size="lg" variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground hover:text-primary">
                  <Phone className="mr-2 h-4 w-4" />
                  02151 9955780
                </Button>
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <LocationSelectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        targetCategoryId={targetCategory}
        title="Standort für Deine Glasfaser-Baustelle wählen"
        description="Wähle den nächstgelegenen Standort – wir zeigen Dir die verfügbaren Maschinen dieser Kategorie."
      />
    </Layout>
  );
}
