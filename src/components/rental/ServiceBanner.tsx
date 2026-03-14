import { ExternalLink, Construction, ShieldCheck, Truck, Headphones, Lightbulb, Sparkles, Zap, Wrench } from "lucide-react";

interface ServiceBannerProps {
  categoryId?: string;
  locationId?: string;
}

interface ServiceInfo {
  icon: React.ElementType;
  title: string;
  description: string;
  externalLink?: string;
  externalLabel?: string;
  emailLink?: string;
  colorClass: string;
  iconBgClass: string;
}

const categoryServices: Record<string, ServiceInfo> = {
  absperrtechnik: {
    icon: ShieldCheck,
    title: "Komplette Verkehrssicherung aus einer Hand",
    description: "Wir übernehmen die gesamte Absperrplanung, richten Halteverbotszonen ein, stellen Antragsformulare bereit und koordinieren mit Straßenverkehrsbehörden & Bauämtern.",
    externalLink: "https://www.slt-infra.de",
    externalLabel: "Mehr auf slt-infra.de",
    colorClass: "bg-primary/5 border-primary/20 hover:bg-primary/10",
    iconBgClass: "bg-primary/10",
  },
  "moebel-zelte": {
    icon: Construction,
    title: "Auf- & Abbau auf Wunsch",
    description: "Optional übernehmen wir den kompletten Auf- und Abbau Ihrer Zelte, Möbel und Event-Ausstattung – sprechen Sie uns einfach an.",
    colorClass: "bg-accent/5 border-accent/20 hover:bg-accent/10",
    iconBgClass: "bg-accent/10",
  },
  beschallung: {
    icon: Headphones,
    title: "Kompletter Beschallungsservice",
    description: "Lieferung, Auf- & Abbau sowie technische Betreuung durch unsere erfahrenen Tontechniker während Ihrer Veranstaltung.",
    colorClass: "bg-accent/5 border-accent/20 hover:bg-accent/10",
    iconBgClass: "bg-accent/10",
  },
  beleuchtung: {
    icon: Lightbulb,
    title: "Kompletter Beleuchtungsservice",
    description: "Lieferung, Auf- & Abbau sowie technische Betreuung durch unsere Lichttechniker – von der Planung bis zur Durchführung.",
    colorClass: "bg-accent/5 border-accent/20 hover:bg-accent/10",
    iconBgClass: "bg-accent/10",
  },
  buehne: {
    icon: Construction,
    title: "Bühne: Auf- & Abbau inklusive",
    description: "Professioneller Aufbau, Sicherheitsprüfung und Abbau Ihrer Bühnenelemente durch unser geschultes Team.",
    colorClass: "bg-accent/5 border-accent/20 hover:bg-accent/10",
    iconBgClass: "bg-accent/10",
  },
  "traversen-rigging": {
    icon: Construction,
    title: "Traversen: Montage & Demontage",
    description: "Fachgerechte Montage, Lastberechnung und Demontage Ihrer Traversenkonstruktionen durch zertifizierte Rigger.",
    colorClass: "bg-accent/5 border-accent/20 hover:bg-accent/10",
    iconBgClass: "bg-accent/10",
  },
  spezialeffekte: {
    icon: Sparkles,
    title: "Effekte: Aufbau & Betreuung",
    description: "Installation, Einrichtung und technische Betreuung Ihrer Spezialeffekte – Nebel, Funken, Seifenblasen und mehr.",
    colorClass: "bg-accent/5 border-accent/20 hover:bg-accent/10",
    iconBgClass: "bg-accent/10",
  },
  "kabel-stromverteiler": {
    icon: Zap,
    title: "Stromversorgung: Planung & Installation",
    description: "Wir planen und installieren die komplette Stromversorgung für Ihre Veranstaltung oder Baustelle.",
    colorClass: "bg-primary/5 border-primary/20 hover:bg-primary/10",
    iconBgClass: "bg-primary/10",
  },
  aggregate: {
    icon: Zap,
    title: "Aggregate: Lieferung & Inbetriebnahme",
    description: "Wir liefern, installieren und nehmen Ihre Stromerzeuger in Betrieb – inkl. Einweisung und Abholung.",
    colorClass: "bg-primary/5 border-primary/20 hover:bg-primary/10",
    iconBgClass: "bg-primary/10",
  },
  huepfburgen: {
    icon: Truck,
    title: "Anlieferung & Aufbau",
    description: "Wir liefern Ihre Hüpfburg direkt zum Veranstaltungsort, bauen sie auf und holen sie nach dem Event wieder ab.",
    colorClass: "bg-accent/5 border-accent/20 hover:bg-accent/10",
    iconBgClass: "bg-accent/10",
  },
  "geschirr-glaeser-besteck": {
    icon: Truck,
    title: "Lieferung & Abholung",
    description: "Wir liefern Geschirr, Gläser und Besteck sauber und gezählt an – und holen alles nach der Veranstaltung wieder ab.",
    colorClass: "bg-accent/5 border-accent/20 hover:bg-accent/10",
    iconBgClass: "bg-accent/10",
  },
};

// Workshop service for Krefeld & Bonn
const workshopServices: Record<string, ServiceInfo> = {
  anhaenger: {
    icon: Wrench,
    title: "Eigene Werkstatt: Anhänger-Service",
    description: "Wir warten und reparieren auch Fremdgeräte – Anhänger aller Hersteller. Kontaktieren Sie uns für einen Werkstatttermin.",
    colorClass: "bg-primary/5 border-primary/20 hover:bg-primary/10",
    iconBgClass: "bg-primary/10",
    emailLink: "service@slt-rental.de",
  },
  erdbewegung: {
    icon: Wrench,
    title: "Eigene Werkstatt: Baumaschinen-Service",
    description: "Wir warten und reparieren auch Fremdgeräte – Minibagger, Radlader und Baumaschinen aller Hersteller.",
    colorClass: "bg-primary/5 border-primary/20 hover:bg-primary/10",
    iconBgClass: "bg-primary/10",
    emailLink: "service@slt-rental.de",
  },
  verdichtung: {
    icon: Wrench,
    title: "Eigene Werkstatt: Verdichtungstechnik-Service",
    description: "Wir warten und reparieren auch Fremdgeräte – Rüttelplatten, Stampfer und Verdichtungstechnik aller Hersteller.",
    colorClass: "bg-primary/5 border-primary/20 hover:bg-primary/10",
    iconBgClass: "bg-primary/10",
    emailLink: "service@slt-rental.de",
  },
  arbeitsbuehnen: {
    icon: Wrench,
    title: "Eigene Werkstatt: Arbeitsbühnen-Service",
    description: "Wir warten und reparieren auch Fremdgeräte – Scheren- und Gelenkbühnen aller Hersteller.",
    colorClass: "bg-primary/5 border-primary/20 hover:bg-primary/10",
    iconBgClass: "bg-primary/10",
    emailLink: "service@slt-rental.de",
  },
  aggregate: {
    icon: Wrench,
    title: "Eigene Werkstatt: Aggregat-Service",
    description: "Wir warten und reparieren auch Fremdgeräte – Stromerzeuger und Aggregate aller Hersteller.",
    colorClass: "bg-primary/5 border-primary/20 hover:bg-primary/10",
    iconBgClass: "bg-primary/10",
    emailLink: "service@slt-rental.de",
  },
};

const workshopCategories = ["anhaenger", "erdbewegung", "verdichtung", "arbeitsbuehnen", "aggregate"];
const workshopLocations = ["krefeld", "bonn"];

function ServiceBannerItem({ service }: { service: ServiceInfo }) {
  const Icon = service.icon;
  return (
    <div className={`border rounded-xl p-4 transition-colors group ${service.colorClass}`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${service.iconBgClass}`}>
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm">
            {service.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {service.description}
          </p>
          {service.externalLink && (
            <a
              href={service.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-accent font-medium mt-1.5 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {service.externalLabel}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {service.emailLink && (
            <a
              href={`mailto:${service.emailLink}`}
              className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-1.5 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {service.emailLink}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function ServiceBanner({ categoryId, locationId }: ServiceBannerProps) {
  if (!categoryId) return null;

  const service = categoryServices[categoryId];
  const showWorkshop = workshopCategories.includes(categoryId) && workshopLocations.includes(locationId || "");

  if (!service && !showWorkshop) return null;

  return (
    <div className="space-y-3">
      {service && <ServiceBannerItem service={service} />}
      {showWorkshop && workshopServices[categoryId] && <ServiceBannerItem service={workshopServices[categoryId]} />}
    </div>
  );
}
