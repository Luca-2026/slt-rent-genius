import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/ui/animated-section";
import {
  ClipboardList,
  ShieldCheck,
  Construction,
  Truck,
  Wrench,
  ArrowRight,
  ExternalLink,
  Phone,
  Mail,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const sections = [
  { id: "planung", label: "Planung & Koordination" },
  { id: "verkehrssicherung", label: "Verkehrssicherung" },
  { id: "aufbau", label: "Auf- & Abbau" },
  { id: "lieferung", label: "Anlieferung & Abholung" },
  { id: "werkstatt", label: "Werkstatt & Reparatur" },
];

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0.1 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

export default function Dienstleistungen() {
  const { t } = useTranslation();
  const activeSection = useActiveSection(sections.map((s) => s.id));

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 140;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <Layout>
      <SEO
        title="Dienstleistungen – Planung, Lieferung, Auf- & Abbau | SLT Rental"
        description="SLT Rental bietet mehr als Vermietung: Planung & Koordination, Verkehrssicherung, Auf- & Abbau, Lieferung in ganz NRW und Werkstatt & Reparatur. Alles aus einer Hand."
        canonical="https://www.slt-rental.de/dienstleistungen"
      />

      {/* Hero */}
      <section className="bg-primary py-16 lg:py-24">
        <div className="section-container text-center">
          <AnimatedSection>
            <h1 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight text-white">
              Unsere Dienstleistungen –<br className="hidden sm:block" />
              mehr als nur Vermietung
            </h1>
            <p className="text-lg lg:text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Von der Planung bis zum Abbau: Wir übernehmen den kompletten
              Service drumherum – damit Sie sich auf Ihr Projekt konzentrieren können.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/mieten">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  {t("nav.rentNow")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/kontakt">
                <Button size="lg" className="bg-transparent border-2 border-white/60 !text-white hover:bg-white/10">
                  Kontakt aufnehmen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Sticky jump nav */}
      <div className="sticky top-[72px] z-30 bg-background border-b border-border shadow-sm">
        <div className="section-container">
          <nav className="flex gap-1 overflow-x-auto scrollbar-hide py-2 -mx-2 px-2">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
                  activeSection === s.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Section 1 — Planung */}
      <ServiceSection
        id="planung"
        icon={ClipboardList}
        title="Planung & Koordination"
        text="Wir übernehmen die komplette Projektplanung – von der Bedarfsermittlung bis zur Abstimmung mit Behörden und Bauämtern."
        items={[
          "Bedarfsermittlung und Geräteauswahl",
          "Aufmaß und Mengenplanung",
          "Abstimmung mit Bauämtern und Behörden",
          "Erstellung von Aufstellplänen",
          "Zeitplanung und Koordination der Liefertermine",
        ]}
        cta={{ label: "Jetzt Planung anfragen", to: "/kontakt" }}
      />

      {/* Section 2 — Verkehrssicherung */}
      <ServiceSection
        id="verkehrssicherung"
        icon={ShieldCheck}
        title="Verkehrssicherung"
        text="Absperrplanung, Halteverbotszonen einrichten, Antragsformulare und komplette Koordination mit Straßenverkehrsbehörden – alles aus einer Hand über unser Partnerunternehmen slt-infra.de."
        items={[
          "Planung von Verkehrssicherungskonzepten",
          "Beantragung von Halteverbotszonen",
          "Lieferung und Aufstellung von Absperrtechnik",
          "Koordination mit Straßenverkehrsbehörden",
          "Abnahme und Rückbau",
        ]}
        hint="Unsere Verkehrssicherungsleistungen werden über slt-infra.de abgewickelt."
        cta={{
          label: "Zu slt-infra.de",
          href: "https://www.slt-infra.de",
          external: true,
        }}
        alt
      />

      {/* Section 3 — Auf- & Abbau */}
      <ServiceSection
        id="aufbau"
        icon={Construction}
        title="Auf- & Abbau"
        text="Professioneller Auf- und Abbau von Zelten, Bühnen, Möbeln, Absperrtechnik und mehr – damit Sie sich auf Ihr Event oder Projekt konzentrieren können."
        items={[
          "Aufbau und Abbau von Mietzelten und Pagodenzelten",
          "Bühnenaufbau und -abbau",
          "Möblierung und Bestuhlung",
          "Montage und Demontage von Absperrtechnik",
          "Entsorgung und Abtransport nach dem Event",
        ]}
        cta={{ label: "Aufbauservice anfragen", to: "/kontakt" }}
      />

      {/* Section 4 — Lieferung */}
      <ServiceSection
        id="lieferung"
        icon={Truck}
        title="Anlieferung & Abholung"
        text="Flexible Lieferung direkt auf Ihre Baustelle oder zu Ihrem Veranstaltungsort – in ganz NRW. Wir koordinieren Lieferzeitfenster und kümmern uns um die sichere Übergabe und spätere Abholung."
        items={[
          "Lieferung an Baustellen, Veranstaltungsorte und Privatadressen",
          "Feste Lieferfenster nach Absprache",
          "Sichere Aufstellung und Übergabe vor Ort",
          "Abholung nach Ende der Mietdauer",
          "Lieferung in alle Regionen NRW (Krefeld, Bonn, Mülheim und Umgebung)",
        ]}
        cta={{ label: "Lieferkosten berechnen", to: "/lieferung" }}
        secondaryCta={{ label: "Jetzt mieten", to: "/mieten" }}
        alt
      />

      {/* Section 5 — Werkstatt */}
      <ServiceSection
        id="werkstatt"
        icon={Wrench}
        title="Werkstatt & Reparatur"
        text="Unsere eigene Werkstatt übernimmt Wartung und Reparatur an Anhängern, Baumaschinen und Aggregaten – auch für Geräte, die nicht bei uns gemietet wurden."
        items={[
          "Wartung und Inspektion von Baumaschinen",
          "Reparatur von Anhängern (Achsen, Beleuchtung, Plane)",
          "Service an Aggregaten und Stromversorgungsgeräten",
          "HU-Vorbereitung für Anhänger",
          "Annahme von Fremdgeräten nach Terminvereinbarung",
        ]}
        cta={{ label: "Werkstatttermin anfragen", to: "/kontakt" }}
      />

      {/* Contact CTA */}
      <section className="py-16 lg:py-20 bg-primary">
        <div className="section-container text-center">
          <AnimatedSection>
            <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-white">
              Haben Sie Fragen zu unseren Dienstleistungen?
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8 text-lg">
              Unser Team berät Sie gerne – persönlich, schnell und ohne Umwege.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a
                href="mailto:info@slt-rental.de"
                className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors"
              >
                <Mail className="h-5 w-5" />
                info@slt-rental.de
              </a>
              <span className="hidden sm:block text-white/40">|</span>
              <a
                href="tel:+492151417990"
                className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors"
              >
                <Phone className="h-5 w-5" />
                02151 417 99 04
              </a>
            </div>
            <Link to="/kontakt">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Jetzt Kontakt aufnehmen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}

/* ── Reusable section component ── */

interface ServiceSectionProps {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  items: string[];
  hint?: string;
  cta: { label: string; to?: string; href?: string; external?: boolean };
  secondaryCta?: { label: string; to: string };
  alt?: boolean;
}

function ServiceSection({
  id,
  icon: Icon,
  title,
  text,
  items,
  hint,
  cta,
  secondaryCta,
  alt,
}: ServiceSectionProps) {
  return (
    <section
      id={id}
      className={`py-16 lg:py-20 ${alt ? "bg-surface-light" : "bg-background"}`}
    >
      <div className="section-container">
        <AnimatedSection>
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-headline">
                {title}
              </h2>
            </div>

            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              {text}
            </p>

            <ul className="space-y-2 mb-8">
              {items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {hint && (
              <div className="bg-muted rounded-lg p-4 mb-8 text-sm text-muted-foreground border border-border">
                {hint}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {cta.external ? (
                <a
                  href={cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {cta.label}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              ) : (
                <Link to={cta.to!}>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {cta.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
              {secondaryCta && (
                <Link to={secondaryCta.to}>
                  <Button variant="outline">
                    {secondaryCta.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
