import { Link } from "react-router-dom";
import {
  ChevronRight,
  Image as ImageIcon,
  Users,
  Bath,
  Flame,
  Check,
  MapPin,
  Clock,
  Euro,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CampingInquiryForm } from "@/components/camping/CampingInquiryForm";
import {
  CARAONE_PRODUCT,
  CARAONE_FAQS,
  buildCaraOneProductSchemas,
} from "@/data/camping-content";

const LOCATIONS = [
  { id: "krefeld", name: "Krefeld" },
  { id: "bonn", name: "Bonn" },
  { id: "muelheim", name: "Mülheim an der Ruhr" },
];

const SUBJECT = `Mietanfrage: ${CARAONE_PRODUCT.name}`;

export default function WeinsbergCaraOne480QDK() {
  return (
    <Layout>
      <SEO
        title={CARAONE_PRODUCT.title}
        description={CARAONE_PRODUCT.description}
        canonical={CARAONE_PRODUCT.path}
        ogType="product"
        jsonLd={buildCaraOneProductSchemas()}
      />

      <div className="section-container py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
          <ol className="flex items-center flex-wrap gap-1">
            <li>
              <Link to="/" className="hover:text-primary">
                Start
              </Link>
            </li>
            <li><ChevronRight className="h-3 w-3 inline" /></li>
            <li>
              <Link to="/camping" className="hover:text-primary">
                Camping
              </Link>
            </li>
            <li><ChevronRight className="h-3 w-3 inline" /></li>
            <li className="text-foreground font-medium">{CARAONE_PRODUCT.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-12">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image gallery placeholders – Patricia uploads later */}
            <div>
              <div className="aspect-[16/10] bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                <ImageIcon className="h-16 w-16 opacity-30" />
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-muted rounded flex items-center justify-center"
                  >
                    <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                ))}
              </div>
            </div>

            {/* Title */}
            <header>
              <Badge className="mb-3 bg-accent text-accent-foreground">Auf Anfrage</Badge>
              <h1 className="text-3xl lg:text-4xl font-bold text-headline leading-tight">
                {CARAONE_PRODUCT.h1}
              </h1>
              <div className="prose max-w-none mt-4 space-y-3 text-foreground/90">
                {CARAONE_PRODUCT.intro.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </header>

            {/* Auf einen Blick */}
            <section>
              <h2 className="text-2xl font-bold text-headline mb-4">Auf einen Blick</h2>
              <ul className="space-y-2">
                {[
                  "Bis zu 5 Schlafplätze (Querbett vorn, Etagenbett hinten, Mittelsitzgruppe als Doppelbett umbaubar)",
                  "Vollwertige Nasszelle mit Dusche, Warmwasser und Thetford-Cassetten-WC",
                  "3-Flammen-Gaskochfeld, Spüle, Kühlschrank mit Eisfach",
                  "Truma-Heizung, 230-V-Anschluss, Außensteckdose",
                  "Antischlingerkupplung (AKS), Mover für einfaches Rangieren",
                  "Aufbaulänge ca. 5,28 m, Gesamtlänge ca. 7,06 m, Breite 2,30 m",
                  "Zulässiges Gesamtgewicht 1.500 kg – fahrbar mit Führerscheinklasse B96 oder BE",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Inklusive */}
            <section>
              <h2 className="text-2xl font-bold text-headline mb-4">
                Was im Mietpreis enthalten ist
              </h2>
              <ul className="space-y-2">
                {[
                  "Voll ausgestattete Küche (Töpfe, Geschirr, Besteck für 4 Personen)",
                  "1× 11-kg-Gasflasche (gefüllt)",
                  "Anschlusskabel für Strom, Wasserschlauch, Adapter",
                  "Spiegelverlängerung für das Zugfahrzeug",
                  "Ausführliche Einweisung vor Ort",
                  "Vollkasko mit 1.500 € Selbstbeteiligung",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Konditionen */}
            <section>
              <h2 className="text-2xl font-bold text-headline mb-4">Konditionen</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ConditionCard icon={<Euro className="h-5 w-5" />} label="Tagesmiete" value="ab 50 € / Tag" />
                <ConditionCard icon={<Euro className="h-5 w-5" />} label="Endreinigung" value="149 € (verpflichtend)" />
                <ConditionCard icon={<Clock className="h-5 w-5" />} label="Mindestmietdauer" value="5 Tage" />
                <ConditionCard icon={<Euro className="h-5 w-5" />} label="Kaution" value="800 € (SEPA-Vorab)" />
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Vorzelt, Sat-Anlage, Campingmöbel und Fahrradträger optional zubuchbar.
              </p>
            </section>

            {/* Standorte */}
            <section>
              <h2 className="text-2xl font-bold text-headline mb-4">
                Standorte für Abholung &amp; Rückgabe
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {LOCATIONS.map((loc) => (
                  <div key={loc.id} className="rounded-lg border border-border bg-card p-4">
                    <MapPin className="h-5 w-5 text-primary mb-2" />
                    <p className="font-semibold text-foreground">SLT Rental {loc.name}</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      Auf Anfrage
                    </Badge>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Verfügbarkeit aktuell <strong>auf Anfrage</strong> – wir melden uns
                innerhalb von 24 Stunden mit einem konkreten Angebot.
              </p>
            </section>
          </div>

          {/* Sidebar – sticky inquiry form */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
                <p className="text-3xl font-bold text-primary">
                  {CARAONE_PRODUCT.pricePerDay}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  + {CARAONE_PRODUCT.cleaningFee} · Mind. {CARAONE_PRODUCT.minRentalDuration}
                </p>
                <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> 5 Personen
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="h-3.5 w-3.5" /> Dusche/WC
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5" /> Heizung
                  </span>
                </div>
              </div>
              <CampingInquiryForm productName={CARAONE_PRODUCT.name} subjectPrefill={SUBJECT} />
            </div>
          </aside>
        </div>

        {/* FAQ */}
        <section className="max-w-3xl">
          <h2 className="text-2xl font-bold text-headline mb-6">Häufige Fragen</h2>
          <Accordion type="single" collapsible className="w-full">
            {CARAONE_FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`q${i}`}>
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-foreground/85">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </Layout>
  );
}

function ConditionCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 flex items-center gap-3">
      <div className="text-primary">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold text-foreground text-sm">{value}</p>
      </div>
    </div>
  );
}
