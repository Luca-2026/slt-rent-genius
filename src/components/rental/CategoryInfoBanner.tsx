import { 
  Wrench, 
  Zap, 
  Battery, 
  Gauge, 
  Ruler, 
  Thermometer, 
  Lightbulb, 
  Music, 
  Tent, 
  UtensilsCrossed, 
  Castle, 
  Construction, 
  Sparkles,
  Cable,
  Box,
  Radio,
  Leaf,
  TreeDeciduous,
  CheckCircle2
} from "lucide-react";
import { ReactNode } from "react";

interface InfoItem {
  icon: ReactNode;
  title: string;
  subtitle: string;
}

interface CategoryInfoBannerProps {
  categoryId: string;
}

const categoryInfoConfig: Record<string, { description?: string; items: InfoItem[]; highlight?: { icon: ReactNode; title: string; text: string } }> = {
  "werkzeuge": {
    description: "Professionelle Akku- und Elektrowerkzeuge von Bosch, Eibenstock und Einhell für Bau, Renovierung und Handwerk. Alle Akkuwerkzeuge inkl. Akku und Ladegerät.",
    items: [
      { icon: <Wrench className="h-5 w-5 text-accent" />, title: "Markenqualität", subtitle: "Bosch Professional & mehr" },
      { icon: <Battery className="h-5 w-5 text-accent" />, title: "Inkl. Akku & Ladegerät", subtitle: "Sofort einsatzbereit" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, title: "Geprüft & gewartet", subtitle: "Top Zustand garantiert" },
    ],
  },
  "gartenpflege": {
    description: "Gartengeräte für Profis und Heimwerker. Von der Kettensäge bis zum Erdbohrer – alles für Ihren Garten.",
    items: [
      { icon: <TreeDeciduous className="h-5 w-5 text-accent" />, title: "Schneiden & Pflegen", subtitle: "Kettensägen, Heckenscheren" },
      { icon: <Leaf className="h-5 w-5 text-accent" />, title: "Bodenbearbeitung", subtitle: "Erdbohrer, Fräsen, Hacken" },
      { icon: <Zap className="h-5 w-5 text-accent" />, title: "Akku & Benzin", subtitle: "Verschiedene Antriebe" },
    ],
  },
  "aggregate": {
    description: "Zuverlässige Stromversorgung für Baustelle, Event oder Notfall. Von kleinen Akkupacks bis zu leistungsstarken Industrieaggregaten.",
    items: [
      { icon: <Zap className="h-5 w-5 text-accent" />, title: "2,8 bis 100 kVA", subtitle: "Für jeden Bedarf" },
      { icon: <Battery className="h-5 w-5 text-accent" />, title: "Akkupacks", subtitle: "Tragbar & leise" },
      { icon: <Gauge className="h-5 w-5 text-accent" />, title: "Kompressoren", subtitle: "Druckluft vor Ort" },
    ],
  },
  "arbeitsbuehnen": {
    description: "Sichere Höhenarbeit mit unseren elektrischen Arbeitsbühnen. Alle Bühnen werden eingewiesen und sind für Innen- und Außeneinsatz geeignet.",
    items: [
      { icon: <Ruler className="h-5 w-5 text-accent" />, title: "8m bis 12m+", subtitle: "Verschiedene Arbeitshöhen" },
      { icon: <Zap className="h-5 w-5 text-accent" />, title: "Elektrisch", subtitle: "Emissionsfrei & leise" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, title: "Einweisung inkl.", subtitle: "Sichere Bedienung" },
    ],
    highlight: {
      icon: <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />,
      title: "Zoomlion Fachhändler",
      text: "Als offizieller Zoomlion-Fachhändler bieten wir erstklassige Arbeitsbühnen mit vollem Service.",
    },
  },
  "verdichtung": {
    description: "Professionelle Bodenverdichtung mit Stampfern und Rüttelplatten für Pflasterarbeiten, Gräben und Fundamentvorbereitung.",
    items: [
      { icon: <Gauge className="h-5 w-5 text-accent" />, title: "70 bis 250 kg", subtitle: "Verschiedene Gewichtsklassen" },
      { icon: <Wrench className="h-5 w-5 text-accent" />, title: "Stampfer & Platten", subtitle: "Für jeden Einsatz" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, title: "Sofort einsatzbereit", subtitle: "Betankt & geprüft" },
    ],
  },
  "heizung-trocknung": {
    description: "Heizgeräte und Bautrockner für Rohbau, Renovierung und Events. Effiziente Lösungen für Wärme und Entfeuchtung.",
    items: [
      { icon: <Thermometer className="h-5 w-5 text-accent" />, title: "Heizgeräte", subtitle: "Elektro & Gas" },
      { icon: <Gauge className="h-5 w-5 text-accent" />, title: "Bautrockner", subtitle: "Schnelle Entfeuchtung" },
      { icon: <Zap className="h-5 w-5 text-accent" />, title: "Ventilatoren", subtitle: "Luftzirkulation" },
    ],
  },
  "leitern-gerueste": {
    description: "Sichere Leitern und Rollgerüste für Arbeiten in der Höhe. TÜV-geprüft und regelmäßig gewartet.",
    items: [
      { icon: <Ruler className="h-5 w-5 text-accent" />, title: "Verschiedene Höhen", subtitle: "Bis 12m Arbeitshöhe" },
      { icon: <Construction className="h-5 w-5 text-accent" />, title: "Rollgerüste", subtitle: "Fahrbar & stabil" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, title: "TÜV-geprüft", subtitle: "Maximale Sicherheit" },
    ],
  },
  "beleuchtung": {
    description: "Professionelle Beleuchtung für Events, Baustellen und Veranstaltungen. Von LED-Fluter bis Bühnenlicht.",
    items: [
      { icon: <Lightbulb className="h-5 w-5 text-accent" />, title: "LED-Technik", subtitle: "Energieeffizient" },
      { icon: <Sparkles className="h-5 w-5 text-accent" />, title: "Bühnenlicht", subtitle: "Moving Heads, PAR" },
      { icon: <Zap className="h-5 w-5 text-accent" />, title: "Akku & Strom", subtitle: "Flexible Lösungen" },
    ],
  },
  "beschallung": {
    description: "PA-Systeme und Beschallungstechnik für Events, Konferenzen und Feiern. Komplett-Anlagen oder Einzelkomponenten.",
    items: [
      { icon: <Music className="h-5 w-5 text-accent" />, title: "PA-Systeme", subtitle: "Komplett-Anlagen" },
      { icon: <Radio className="h-5 w-5 text-accent" />, title: "Funkmikrofone", subtitle: "Kabellose Freiheit" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, title: "Aufbau-Service", subtitle: "Auf Wunsch verfügbar" },
    ],
  },
  "moebel-zelte": {
    description: "Event-Mobiliar und Zelte für Ihre Veranstaltung. Bierzeltgarnituren, Stehtische, Partyzelte und Lounge-Möbel.",
    items: [
      { icon: <Tent className="h-5 w-5 text-accent" />, title: "Partyzelte", subtitle: "Verschiedene Größen" },
      { icon: <Box className="h-5 w-5 text-accent" />, title: "Tische & Stühle", subtitle: "Für jeden Anlass" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, title: "Sauber & gepflegt", subtitle: "Event-ready" },
    ],
  },
  "geschirr-glaeser-besteck": {
    description: "Geschirr, Gläser und Besteck für Ihre Veranstaltung. Hochwertig, gespült und transportfertig in Kisten verpackt.",
    items: [
      { icon: <UtensilsCrossed className="h-5 w-5 text-accent" />, title: "Komplette Sets", subtitle: "Geschirr, Besteck, Gläser" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, title: "Gespült geliefert", subtitle: "Sofort einsatzbereit" },
      { icon: <Box className="h-5 w-5 text-accent" />, title: "In Kisten verpackt", subtitle: "Einfacher Transport" },
    ],
  },
  "huepfburgen": {
    description: "Aufblasbare Hüpfburgen und Spiele für Kinderfeste, Firmenevents und Veranstaltungen. Spaß für Groß und Klein!",
    items: [
      { icon: <Castle className="h-5 w-5 text-accent" />, title: "Verschiedene Modelle", subtitle: "Für jedes Alter" },
      { icon: <Gauge className="h-5 w-5 text-accent" />, title: "Inkl. Gebläse", subtitle: "Komplett-Set" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, title: "TÜV-geprüft", subtitle: "Maximale Sicherheit" },
    ],
  },
  "absperrtechnik": {
    description: "Absperrgitter, Bauzäune und Warnbaken für Veranstaltungen und Baustellen. Sicherheit und Ordnung garantiert.",
    items: [
      { icon: <Construction className="h-5 w-5 text-accent" />, title: "Absperrgitter", subtitle: "Für Events" },
      { icon: <Gauge className="h-5 w-5 text-accent" />, title: "Bauzäune", subtitle: "Baustellensicherung" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, title: "Lieferung möglich", subtitle: "Bis vor Ort" },
    ],
  },
  "spezialeffekte": {
    description: "Beeindruckende Spezialeffekte für unvergessliche Events. Nebel, Seifenblasen, Funken und mehr.",
    items: [
      { icon: <Sparkles className="h-5 w-5 text-accent" />, title: "Nebelmaschinen", subtitle: "Atmosphäre schaffen" },
      { icon: <Zap className="h-5 w-5 text-accent" />, title: "Kalte Funken", subtitle: "Sichere Pyrotechnik" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, title: "Einweisung inkl.", subtitle: "Sichere Bedienung" },
    ],
  },
  "kabel-stromverteiler": {
    description: "Verlängerungskabel, Stromverteiler und Kabelbrücken für die sichere Stromversorgung Ihrer Veranstaltung.",
    items: [
      { icon: <Cable className="h-5 w-5 text-accent" />, title: "Kabel", subtitle: "Verschiedene Längen" },
      { icon: <Zap className="h-5 w-5 text-accent" />, title: "Verteiler", subtitle: "CEE & Schuko" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, title: "Geprüft", subtitle: "Sicherheit zuerst" },
    ],
  },
  "buehne": {
    description: "Bühnenelemente und Podeste für professionelle Auftritte. Nivtec-Systeme für flexible Bühnengestaltung.",
    items: [
      { icon: <Box className="h-5 w-5 text-accent" />, title: "Nivtec-System", subtitle: "Modulare Bühne" },
      { icon: <Ruler className="h-5 w-5 text-accent" />, title: "Verschiedene Höhen", subtitle: "20cm bis 100cm" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, title: "Aufbau-Service", subtitle: "Auf Wunsch verfügbar" },
    ],
  },
  "traversen-rigging": {
    description: "Traversen und Rigging-Equipment für professionelle Bühnenkonstruktionen. Milos-Traversen in Schwarz.",
    items: [
      { icon: <Construction className="h-5 w-5 text-accent" />, title: "Milos Traversen", subtitle: "Hochwertig & stabil" },
      { icon: <Ruler className="h-5 w-5 text-accent" />, title: "Verschiedene Längen", subtitle: "0,5m bis 3m" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, title: "Schwarz eloxiert", subtitle: "Dezent & elegant" },
    ],
  },
  "kommunikation": {
    description: "Funkgeräte für Events, Baustellen und Veranstaltungen. Zuverlässige Kommunikation für Ihr Team.",
    items: [
      { icon: <Radio className="h-5 w-5 text-accent" />, title: "UHF-Funkgeräte", subtitle: "Große Reichweite" },
      { icon: <Battery className="h-5 w-5 text-accent" />, title: "Inkl. Akkus", subtitle: "Sofort einsatzbereit" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, title: "Mehrere Sets", subtitle: "Für große Teams" },
    ],
  },
};

export function CategoryInfoBanner({ categoryId }: CategoryInfoBannerProps) {
  const config = categoryInfoConfig[categoryId];
  
  if (!config) return null;

  return (
    <section className="bg-accent/10 border-y border-accent/20">
      <div className="section-container py-6">
        {/* Description */}
        {config.description && (
          <p className="text-foreground mb-6">
            {config.description}
          </p>
        )}
        
        {/* Info Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {config.items.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                {item.icon}
              </div>
              <div>
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Highlight Section */}
        {config.highlight && (
          <div className="mt-6 pt-6 border-t border-accent/20">
            <div className="flex items-start gap-4 bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                {config.highlight.icon}
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">{config.highlight.title}</p>
                <p className="text-sm text-muted-foreground">
                  {config.highlight.text}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
