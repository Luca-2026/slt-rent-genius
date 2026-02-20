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
import { useTranslation } from "react-i18next";

interface InfoItem {
  icon: ReactNode;
  titleKey: string;
  subtitleKey: string;
}

interface CategoryInfoBannerProps {
  categoryId: string;
}

const categoryInfoConfig: Record<string, {
  descriptionKey?: string;
  items: InfoItem[];
  highlight?: { icon: ReactNode; titleKey: string; textKey: string; link?: string; linkLabelKey?: string }
}> = {
  "werkzeuge": {
    descriptionKey: "infoBanner.werkzeuge.desc",
    items: [
      { icon: <Wrench className="h-5 w-5 text-accent" />, titleKey: "infoBanner.werkzeuge.item1", subtitleKey: "infoBanner.werkzeuge.item1sub" },
      { icon: <Battery className="h-5 w-5 text-accent" />, titleKey: "infoBanner.werkzeuge.item2", subtitleKey: "infoBanner.werkzeuge.item2sub" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, titleKey: "infoBanner.werkzeuge.item3", subtitleKey: "infoBanner.werkzeuge.item3sub" },
    ],
  },
  "gartenpflege": {
    descriptionKey: "infoBanner.gartenpflege.desc",
    items: [
      { icon: <TreeDeciduous className="h-5 w-5 text-accent" />, titleKey: "infoBanner.gartenpflege.item1", subtitleKey: "infoBanner.gartenpflege.item1sub" },
      { icon: <Leaf className="h-5 w-5 text-accent" />, titleKey: "infoBanner.gartenpflege.item2", subtitleKey: "infoBanner.gartenpflege.item2sub" },
      { icon: <Zap className="h-5 w-5 text-accent" />, titleKey: "infoBanner.gartenpflege.item3", subtitleKey: "infoBanner.gartenpflege.item3sub" },
    ],
  },
  "aggregate": {
    descriptionKey: "infoBanner.aggregate.desc",
    items: [
      { icon: <Zap className="h-5 w-5 text-accent" />, titleKey: "infoBanner.aggregate.item1", subtitleKey: "infoBanner.aggregate.item1sub" },
      { icon: <Battery className="h-5 w-5 text-accent" />, titleKey: "infoBanner.aggregate.item2", subtitleKey: "infoBanner.aggregate.item2sub" },
      { icon: <Gauge className="h-5 w-5 text-accent" />, titleKey: "infoBanner.aggregate.item3", subtitleKey: "infoBanner.aggregate.item3sub" },
    ],
  },
  "arbeitsbuehnen": {
    descriptionKey: "infoBanner.arbeitsbuehnen.desc",
    items: [
      { icon: <Ruler className="h-5 w-5 text-accent" />, titleKey: "infoBanner.arbeitsbuehnen.item1", subtitleKey: "infoBanner.arbeitsbuehnen.item1sub" },
      { icon: <Zap className="h-5 w-5 text-accent" />, titleKey: "infoBanner.arbeitsbuehnen.item2", subtitleKey: "infoBanner.arbeitsbuehnen.item2sub" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, titleKey: "infoBanner.arbeitsbuehnen.item3", subtitleKey: "infoBanner.arbeitsbuehnen.item3sub" },
    ],
    highlight: {
      icon: <Zap className="h-6 w-6 text-primary" />,
      titleKey: "infoBanner.arbeitsbuehnen.highlightTitle",
      textKey: "infoBanner.arbeitsbuehnen.highlightText",
    },
  },
  "verdichtung": {
    descriptionKey: "infoBanner.verdichtung.desc",
    items: [
      { icon: <Gauge className="h-5 w-5 text-accent" />, titleKey: "infoBanner.verdichtung.item1", subtitleKey: "infoBanner.verdichtung.item1sub" },
      { icon: <Wrench className="h-5 w-5 text-accent" />, titleKey: "infoBanner.verdichtung.item2", subtitleKey: "infoBanner.verdichtung.item2sub" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, titleKey: "infoBanner.verdichtung.item3", subtitleKey: "infoBanner.verdichtung.item3sub" },
    ],
  },
  "heizung-trocknung": {
    descriptionKey: "infoBanner.heizung.desc",
    items: [
      { icon: <Thermometer className="h-5 w-5 text-accent" />, titleKey: "infoBanner.heizung.item1", subtitleKey: "infoBanner.heizung.item1sub" },
      { icon: <Gauge className="h-5 w-5 text-accent" />, titleKey: "infoBanner.heizung.item2", subtitleKey: "infoBanner.heizung.item2sub" },
      { icon: <Zap className="h-5 w-5 text-accent" />, titleKey: "infoBanner.heizung.item3", subtitleKey: "infoBanner.heizung.item3sub" },
    ],
  },
  "leitern-gerueste": {
    descriptionKey: "infoBanner.leitern.desc",
    items: [
      { icon: <Ruler className="h-5 w-5 text-accent" />, titleKey: "infoBanner.leitern.item1", subtitleKey: "infoBanner.leitern.item1sub" },
      { icon: <Construction className="h-5 w-5 text-accent" />, titleKey: "infoBanner.leitern.item2", subtitleKey: "infoBanner.leitern.item2sub" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, titleKey: "infoBanner.leitern.item3", subtitleKey: "infoBanner.leitern.item3sub" },
    ],
  },
  "beleuchtung": {
    descriptionKey: "infoBanner.beleuchtung.desc",
    items: [
      { icon: <Lightbulb className="h-5 w-5 text-accent" />, titleKey: "infoBanner.beleuchtung.item1", subtitleKey: "infoBanner.beleuchtung.item1sub" },
      { icon: <Sparkles className="h-5 w-5 text-accent" />, titleKey: "infoBanner.beleuchtung.item2", subtitleKey: "infoBanner.beleuchtung.item2sub" },
      { icon: <Zap className="h-5 w-5 text-accent" />, titleKey: "infoBanner.beleuchtung.item3", subtitleKey: "infoBanner.beleuchtung.item3sub" },
    ],
  },
  "beschallung": {
    descriptionKey: "infoBanner.beschallung.desc",
    items: [
      { icon: <Music className="h-5 w-5 text-accent" />, titleKey: "infoBanner.beschallung.item1", subtitleKey: "infoBanner.beschallung.item1sub" },
      { icon: <Radio className="h-5 w-5 text-accent" />, titleKey: "infoBanner.beschallung.item2", subtitleKey: "infoBanner.beschallung.item2sub" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, titleKey: "infoBanner.beschallung.item3", subtitleKey: "infoBanner.beschallung.item3sub" },
    ],
  },
  "moebel-zelte": {
    descriptionKey: "infoBanner.moebelZelte.desc",
    items: [
      { icon: <Tent className="h-5 w-5 text-accent" />, titleKey: "infoBanner.moebelZelte.item1", subtitleKey: "infoBanner.moebelZelte.item1sub" },
      { icon: <Box className="h-5 w-5 text-accent" />, titleKey: "infoBanner.moebelZelte.item2", subtitleKey: "infoBanner.moebelZelte.item2sub" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, titleKey: "infoBanner.moebelZelte.item3", subtitleKey: "infoBanner.moebelZelte.item3sub" },
    ],
  },
  "geschirr-glaeser-besteck": {
    descriptionKey: "infoBanner.geschirr.desc",
    items: [
      { icon: <UtensilsCrossed className="h-5 w-5 text-accent" />, titleKey: "infoBanner.geschirr.item1", subtitleKey: "infoBanner.geschirr.item1sub" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, titleKey: "infoBanner.geschirr.item2", subtitleKey: "infoBanner.geschirr.item2sub" },
      { icon: <Box className="h-5 w-5 text-accent" />, titleKey: "infoBanner.geschirr.item3", subtitleKey: "infoBanner.geschirr.item3sub" },
    ],
  },
  "huepfburgen": {
    descriptionKey: "infoBanner.huepfburgen.desc",
    items: [
      { icon: <Castle className="h-5 w-5 text-accent" />, titleKey: "infoBanner.huepfburgen.item1", subtitleKey: "infoBanner.huepfburgen.item1sub" },
      { icon: <Gauge className="h-5 w-5 text-accent" />, titleKey: "infoBanner.huepfburgen.item2", subtitleKey: "infoBanner.huepfburgen.item2sub" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, titleKey: "infoBanner.huepfburgen.item3", subtitleKey: "infoBanner.huepfburgen.item3sub" },
    ],
  },
  "absperrtechnik": {
    descriptionKey: "infoBanner.absperrtechnik.desc",
    items: [
      { icon: <Construction className="h-5 w-5 text-accent" />, titleKey: "infoBanner.absperrtechnik.item1", subtitleKey: "infoBanner.absperrtechnik.item1sub" },
      { icon: <Gauge className="h-5 w-5 text-accent" />, titleKey: "infoBanner.absperrtechnik.item2", subtitleKey: "infoBanner.absperrtechnik.item2sub" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, titleKey: "infoBanner.absperrtechnik.item3", subtitleKey: "infoBanner.absperrtechnik.item3sub" },
    ],
    highlight: {
      icon: <CheckCircle2 className="h-6 w-6 text-accent" />,
      titleKey: "infoBanner.absperrtechnik.highlightTitle",
      textKey: "infoBanner.absperrtechnik.highlightText",
      link: "https://www.slt-infra.de",
      linkLabelKey: "infoBanner.absperrtechnik.highlightLink",
    },
  },
  "spezialeffekte": {
    descriptionKey: "infoBanner.spezialeffekte.desc",
    items: [
      { icon: <Sparkles className="h-5 w-5 text-accent" />, titleKey: "infoBanner.spezialeffekte.item1", subtitleKey: "infoBanner.spezialeffekte.item1sub" },
      { icon: <Zap className="h-5 w-5 text-accent" />, titleKey: "infoBanner.spezialeffekte.item2", subtitleKey: "infoBanner.spezialeffekte.item2sub" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, titleKey: "infoBanner.spezialeffekte.item3", subtitleKey: "infoBanner.spezialeffekte.item3sub" },
    ],
  },
  "kabel-stromverteiler": {
    descriptionKey: "infoBanner.kabel.desc",
    items: [
      { icon: <Cable className="h-5 w-5 text-accent" />, titleKey: "infoBanner.kabel.item1", subtitleKey: "infoBanner.kabel.item1sub" },
      { icon: <Zap className="h-5 w-5 text-accent" />, titleKey: "infoBanner.kabel.item2", subtitleKey: "infoBanner.kabel.item2sub" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, titleKey: "infoBanner.kabel.item3", subtitleKey: "infoBanner.kabel.item3sub" },
    ],
  },
  "buehne": {
    descriptionKey: "infoBanner.buehne.desc",
    items: [
      { icon: <Box className="h-5 w-5 text-accent" />, titleKey: "infoBanner.buehne.item1", subtitleKey: "infoBanner.buehne.item1sub" },
      { icon: <Ruler className="h-5 w-5 text-accent" />, titleKey: "infoBanner.buehne.item2", subtitleKey: "infoBanner.buehne.item2sub" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, titleKey: "infoBanner.buehne.item3", subtitleKey: "infoBanner.buehne.item3sub" },
    ],
  },
  "traversen-rigging": {
    descriptionKey: "infoBanner.traversen.desc",
    items: [
      { icon: <Construction className="h-5 w-5 text-accent" />, titleKey: "infoBanner.traversen.item1", subtitleKey: "infoBanner.traversen.item1sub" },
      { icon: <Ruler className="h-5 w-5 text-accent" />, titleKey: "infoBanner.traversen.item2", subtitleKey: "infoBanner.traversen.item2sub" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, titleKey: "infoBanner.traversen.item3", subtitleKey: "infoBanner.traversen.item3sub" },
    ],
  },
  "kommunikation": {
    descriptionKey: "infoBanner.kommunikation.desc",
    items: [
      { icon: <Radio className="h-5 w-5 text-accent" />, titleKey: "infoBanner.kommunikation.item1", subtitleKey: "infoBanner.kommunikation.item1sub" },
      { icon: <Battery className="h-5 w-5 text-accent" />, titleKey: "infoBanner.kommunikation.item2", subtitleKey: "infoBanner.kommunikation.item2sub" },
      { icon: <CheckCircle2 className="h-5 w-5 text-accent" />, titleKey: "infoBanner.kommunikation.item3", subtitleKey: "infoBanner.kommunikation.item3sub" },
    ],
  },
};

export function CategoryInfoBanner({ categoryId }: CategoryInfoBannerProps) {
  const { t } = useTranslation();
  const config = categoryInfoConfig[categoryId];
  
  if (!config) return null;

  return (
    <section className="bg-accent/10 border-y border-accent/20">
      <div className="section-container py-6">
        {/* Description */}
        {config.descriptionKey && (
          <p className="text-foreground mb-6">
            {t(config.descriptionKey)}
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
                <p className="font-semibold text-foreground">{t(item.titleKey)}</p>
                <p className="text-sm text-muted-foreground">{t(item.subtitleKey)}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Highlight Section */}
        {config.highlight && (
          <div className="mt-6 pt-6 border-t border-accent/20">
            <div className="flex items-start gap-4 bg-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                {config.highlight.icon}
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">{t(config.highlight.titleKey)}</p>
                <p className="text-sm text-muted-foreground">
                  {t(config.highlight.textKey)}
                  {config.highlight.link && (
                    <> <a href={config.highlight.link} target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">
                      {config.highlight.linkLabelKey ? t(config.highlight.linkLabelKey) : config.highlight.link}
                    </a></>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
