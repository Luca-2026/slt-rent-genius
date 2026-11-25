import { Link, useParams, useSearchParams, Navigate } from "react-router-dom";
import { Calculator, Zap, ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import { DryingCalculator } from "@/components/rental/DryingCalculator";
import { PowerCalculator } from "@/components/rental/PowerCalculator";
import { locations } from "@/data/rentalData";
import { LOCATION_LABELS } from "@/lib/inventoryAvailability";
import { TOOLS_INDEX_SEO, TOOL_SEO } from "@/data/toolsSeo";

const TOOLS = {
  "bautrockner-rechner": { title: "Bautrockner-Rechner", icon: Calculator, text: "Gerätebedarf, Trocknungsdauer und Mietpreis für die Raumtrocknung als Richtwert.", seo: "Bautrockner-Rechner – Geräte & Mietdauer berechnen | SLT Rental", desc: "Berechne kostenlos, wie viele Bautrockner und Lüfter du brauchst und wie lange die Trocknung ungefähr dauert – mit Mietpreis-Richtwert." },
  "baustromrechner": { title: "Baustromrechner", icon: Zap, text: "Leistungsbedarf, Baustromverteiler, CEE-Kabel und Aggregat für deine Baustelle als Richtwert.", seo: "Baustromrechner – Verteiler, Kabel & Aggregat | SLT Rental", desc: "Berechne den Strombedarf deiner Baustelle und finde passende Baustromverteiler, CEE-Kabel und Stromaggregate zur Miete." },
} as const;
type Slug = keyof typeof TOOLS;

function LocationPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Standort">
      {locations.map((l) => (
        <button key={l.id} role="radio" aria-checked={value === l.id} onClick={() => onChange(l.id)} className={`rounded-md border px-3 py-2 text-sm font-medium ${value === l.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"}`}>{LOCATION_LABELS[l.id] ?? l.name}</button>
      ))}
    </div>
  );
}

export function ToolsIndex() {
  return (
    <Layout>
      <SEO title={TOOLS_INDEX_SEO.title} description={TOOLS_INDEX_SEO.description} canonical="/tools" />
      <section className="section-container py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold text-headline mb-2">{TOOLS_INDEX_SEO.h1}</h1>
        <p className="text-muted-foreground mb-6 max-w-2xl">{TOOLS_INDEX_SEO.intro}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(TOOLS) as Slug[]).map((s) => { const t = TOOLS[s]; const Icon = t.icon; return (
            <Link key={s} to={`/tools/${s}`} className="group rounded-xl border border-border bg-card p-5 hover:border-primary">
              <Icon className="h-6 w-6 text-primary mb-2" />
              <h2 className="text-lg font-semibold text-headline">{t.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t.text}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">Zum Rechner <ArrowRight className="h-4 w-4" /></span>
            </Link>); })}
        </div>
      </section>
    </Layout>
  );
}

export function ToolDetail() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  if (!slug || !(slug in TOOLS)) return <Navigate to="/tools" replace />;
  const tool = TOOLS[slug as Slug];
  const seo = TOOL_SEO[slug as Slug];
  const loc = locations.some((l) => l.id === params.get("standort")) ? params.get("standort")! : locations[0].id;
  return (
    <Layout>
      <SEO title={seo.title} description={seo.description} canonical={`/tools/${slug}`} jsonLd={[
        { "@context": "https://schema.org", "@type": "WebApplication", name: seo.h1, url: `https://www.slt-rental.de/tools/${slug}/`, applicationCategory: "UtilitiesApplication", operatingSystem: "Web", inLanguage: "de-DE", isAccessibleForFree: true, provider: { "@id": "https://www.slt-rental.de/#organization" } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Rechner & Tools", item: "https://www.slt-rental.de/tools/" },
          { "@type": "ListItem", position: 2, name: tool.title, item: `https://www.slt-rental.de/tools/${slug}/` },
        ] },
      ]} />
      <section className="section-container py-8 md:py-12 max-w-3xl">
        <Link to="/tools" className="text-sm text-primary hover:underline">← Alle Rechner & Tools</Link>
        <h1 className="text-2xl md:text-3xl font-bold text-headline mt-2 mb-2">{seo.h1}</h1>
        <p className="text-muted-foreground mb-4">{seo.intro}</p>
        <p className="text-sm font-medium mb-2">Standort für Geräte und Preise</p>
        <LocationPicker value={loc} onChange={(v) => setParams({ standort: v }, { replace: true })} />
        <div className="mt-5">
          {slug === "bautrockner-rechner" ? <DryingCalculator key={loc} locationId={loc} showToolsLink={false} /> : <PowerCalculator key={loc} locationId={loc} showToolsLink={false} />}
        </div>
        <div className="mt-10 space-y-6">
          {seo.sections.map((x) => (
            <div key={x.h2}>
              <h2 className="text-lg md:text-xl font-semibold text-headline mb-1">{x.h2}</h2>
              <p className="text-muted-foreground">{x.text}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
