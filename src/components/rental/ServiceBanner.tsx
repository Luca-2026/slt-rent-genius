import { ExternalLink, Construction, ShieldCheck, Truck } from "lucide-react";

interface ServiceBannerProps {
  categoryId?: string;
}

interface ServiceInfo {
  icon: React.ElementType;
  title: string;
  description: string;
  externalLink?: string;
  externalLabel?: string;
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
    title: "Auf- & Abbau inklusive",
    description: "Wir liefern nicht nur – wir übernehmen auch den kompletten Auf- und Abbau Ihrer Zelte, Möbel und Event-Ausstattung.",
    colorClass: "bg-accent/5 border-accent/20 hover:bg-accent/10",
    iconBgClass: "bg-accent/10",
  },
  beschallung: {
    icon: Construction,
    title: "Lieferung, Auf- & Abbau",
    description: "Unsere Techniker liefern Ihre Beschallungstechnik an, bauen auf, testen und bauen nach dem Event wieder ab.",
    colorClass: "bg-accent/5 border-accent/20 hover:bg-accent/10",
    iconBgClass: "bg-accent/10",
  },
  beleuchtung: {
    icon: Construction,
    title: "Lieferung, Auf- & Abbau",
    description: "Professionelle Installation und Abbau Ihrer Beleuchtungstechnik durch unser erfahrenes Team.",
    colorClass: "bg-accent/5 border-accent/20 hover:bg-accent/10",
    iconBgClass: "bg-accent/10",
  },
  huepfburgen: {
    icon: Truck,
    title: "Anlieferung & Aufbau",
    description: "Wir liefern Ihre Hüpfburg direkt zum Veranstaltungsort, bauen sie auf und holen sie nach dem Event wieder ab.",
    colorClass: "bg-accent/5 border-accent/20 hover:bg-accent/10",
    iconBgClass: "bg-accent/10",
  },
};

export function ServiceBanner({ categoryId }: ServiceBannerProps) {
  if (!categoryId || !categoryServices[categoryId]) return null;

  const service = categoryServices[categoryId];
  const Icon = service.icon;

  const content = (
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
        </div>
      </div>
    </div>
  );

  return content;
}
