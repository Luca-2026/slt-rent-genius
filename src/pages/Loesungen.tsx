import { Layout } from "@/components/layout";
import { SEO, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shovel, Trees, Hammer, PartyPopper, Truck, Home, Building2, Sparkles } from "lucide-react";
import { AnimatedSection } from "@/components/ui/animated-section";
import { useTranslation } from "react-i18next";

// GaLaBau solution images
import imgGalabauStubbenfraese1 from "@/assets/solutions/galabau/stubbenfraese-1.jpg";
import imgGalabauStubbenfraese2 from "@/assets/solutions/galabau/stubbenfraese-2.jpg";
import imgGalabauErdbohrer from "@/assets/solutions/galabau/erdbohrer-einsatz.jpg";

// Event solution images
import imgEventZelt from "@/assets/solutions/events/stretch-zelt-outdoor.jpg";
import imgEventGartenfest from "@/assets/solutions/events/gartenfest-slt.jpg";
import imgEventIndoorPA from "@/assets/solutions/events/indoor-pa-setup.jpg";
import imgEventIBCLed from "@/assets/solutions/events/ibc-led-deko.jpg";
import imgEventTraversen from "@/assets/solutions/events/traversen-lager.jpg";
import imgEventGlaeser from "@/assets/solutions/events/glaeser-slt-kisten.jpg";
import imgEventBlumenDeko from "@/assets/solutions/events/blumen-deko-event.jpg";
import imgEventBuehne from "@/assets/solutions/events/buehne-beleuchtung.jpg";

// Tiefbau solution images
import imgTiefbauBobcat from "@/assets/solutions/tiefbau/bobcat-garten.jpg";
import imgTiefbauWackerBaustelle from "@/assets/solutions/tiefbau/wacker-neuson-baustelle.jpg";
import imgTiefbauWackerGarten from "@/assets/solutions/tiefbau/wacker-neuson-garten.jpg";
import imgTiefbauKramer from "@/assets/solutions/tiefbau/kramer-radlader.jpg";
import imgTiefbauKompressor from "@/assets/solutions/tiefbau/doosan-kompressor.jpg";
import imgTiefbauDrucklufthammer from "@/assets/solutions/tiefbau/drucklufthammer.jpg";

// Transport solution images
import imgTransportPlanen from "@/assets/solutions/transport/planenanhaenger-3500.jpg";

// Hochbau solution images
import imgHochbauRollgeruest from "@/assets/solutions/hochbau/rollgeruest-indoor.jpg";
import imgHochbauGeruestLager from "@/assets/solutions/hochbau/geruest-lager.jpg";
import imgHochbauRollgeruestHoch from "@/assets/solutions/hochbau/rollgeruest-hoch.jpg";
import imgHochbauMastbuehne from "@/assets/solutions/hochbau/mastbuehne-zoomlion.jpg";
import imgHochbauScherenbuehneKlein from "@/assets/solutions/hochbau/scherenbuehne-klein.jpg";
import imgHochbauScherenbuehneOutdoor from "@/assets/solutions/hochbau/scherenbuehne-outdoor.jpg";
import imgHochbauScherenbuehneSteuerung from "@/assets/solutions/hochbau/scherenbuehne-steuerung.jpg";
import imgHochbauScherenbuehneGross from "@/assets/solutions/hochbau/scherenbuehne-gross.jpg";
import imgHochbauGelenkbuehne from "@/assets/solutions/hochbau/gelenkbuehne-zoomlion.jpg";

// Handwerk solution images
import imgHandwerkErdbohrer from "@/assets/solutions/handwerk/erdbohrer-baustelle.jpg";
import imgHandwerkBohrhammer from "@/assets/solutions/handwerk/bohrhammer-geruest.jpg";
import imgHandwerkAkkubohrer from "@/assets/solutions/handwerk/akkubohrer-installation.jpg";
import imgHandwerkBosch from "@/assets/solutions/handwerk/bosch-bohrhammer.jpg";

// Kindergeburtstage solution images
import imgKinderClown from "@/assets/solutions/kinder/huepfburg-clown.webp";
import imgKinderBalloon from "@/assets/solutions/kinder/huepfburg-balloon.jpg";
import imgKinderKirmes from "@/assets/solutions/kinder/huepfburg-kirmes.jpg";
import imgKinderWasser1 from "@/assets/solutions/kinder/wasserrutsche-1.jpg";
import imgKinderWasser2 from "@/assets/solutions/kinder/wasserrutsche-2.jpg";

// Private Projekte images (reuse existing product images)
import imgPrivateLaubgitter from "@/assets/products/anhaenger/kasten-laubgitter-1300.jpg";
import imgPrivateHaecksler from "@/assets/products/haecksler-ls95-1.jpeg";
import imgPrivateWerkzeug from "@/assets/products/werkzeuge/bohrhammer-gbh18v-26f.jpg";

export interface Solution {
  id: string;
  image: string;
  images?: string[];
  imageCategories?: string[];
  icon: React.ElementType;
  categories: string[];
  color: string;
}

export const solutionData: Solution[] = [{
  id: "garten-landschaftsbau",
  image: imgGalabauStubbenfraese1,
  images: [imgGalabauStubbenfraese1, imgGalabauStubbenfraese2, imgGalabauErdbohrer],
  imageCategories: ["gartenpflege", "gartenpflege", "gartenpflege"],
  icon: Trees,
  categories: ["erdbewegung", "gartenpflege", "anhaenger", "verdichtung"],
  color: "from-green-500/20 to-green-600/10"
}, {
  id: "tiefbau-erdbewegung",
  image: imgTiefbauWackerBaustelle,
  images: [imgTiefbauWackerBaustelle, imgTiefbauWackerGarten, imgTiefbauBobcat, imgTiefbauKramer, imgTiefbauKompressor, imgTiefbauDrucklufthammer],
  imageCategories: ["erdbewegung", "erdbewegung", "erdbewegung", "erdbewegung", "erdbewegung", "erdbewegung"],
  icon: Shovel,
  categories: ["erdbewegung", "verdichtung", "absperrtechnik", "anhaenger"],
  color: "from-amber-500/20 to-amber-600/10"
}, {
  id: "hochbau-renovierung",
  image: imgHochbauScherenbuehneOutdoor,
  images: [imgHochbauScherenbuehneOutdoor, imgHochbauScherenbuehneGross, imgHochbauMastbuehne, imgHochbauGelenkbuehne, imgHochbauScherenbuehneKlein, imgHochbauScherenbuehneSteuerung, imgHochbauRollgeruest, imgHochbauRollgeruestHoch, imgHochbauGeruestLager],
  imageCategories: ["arbeitsbuehnen", "arbeitsbuehnen", "arbeitsbuehnen", "arbeitsbuehnen", "arbeitsbuehnen", "arbeitsbuehnen", "leitern-gerueste", "leitern-gerueste", "leitern-gerueste"],
  icon: Building2,
  categories: ["werkzeuge", "arbeitsbuehnen", "leitern-gerueste", "heizung-trocknung"],
  color: "from-blue-500/20 to-blue-600/10"
}, {
  id: "events-veranstaltungen",
  image: imgEventZelt,
  images: [imgEventZelt, imgEventGartenfest, imgEventIndoorPA, imgEventIBCLed, imgEventTraversen, imgEventGlaeser, imgEventBlumenDeko, imgEventBuehne],
  imageCategories: ["moebel-zelte", "moebel-zelte", "beschallung", "beleuchtung", "beschallung", "geschirr-glaeser-besteck", "moebel-zelte", "beleuchtung"],
  icon: PartyPopper,
  categories: ["beschallung", "beleuchtung", "moebel-zelte", "geschirr-glaeser-besteck"],
  color: "from-purple-500/20 to-purple-600/10"
}, {
  id: "umzug-transport",
  image: imgTransportPlanen,
  images: [imgTransportPlanen],
  imageCategories: ["anhaenger"],
  icon: Truck,
  categories: ["anhaenger"],
  color: "from-orange-500/20 to-orange-600/10"
}, {
  id: "handwerk-gewerbe",
  image: imgHandwerkBohrhammer,
  images: [imgHandwerkBohrhammer, imgHandwerkBosch, imgHandwerkAkkubohrer, imgHandwerkErdbohrer],
  imageCategories: ["werkzeuge", "werkzeuge", "werkzeuge", "werkzeuge"],
  icon: Hammer,
  categories: ["werkzeuge", "leitern-gerueste", "kabel-stromverteiler", "aggregate"],
  color: "from-red-500/20 to-red-600/10"
}, {
  id: "private-projekte",
  image: "/placeholder.svg",
  icon: Home,
  categories: ["gartenpflege", "werkzeuge", "anhaenger", "verdichtung"],
  color: "from-teal-500/20 to-teal-600/10"
}, {
  id: "kindergeburtstage",
  image: imgKinderClown,
  images: [imgKinderClown, imgKinderKirmes, imgKinderBalloon, imgKinderWasser1, imgKinderWasser2],
  imageCategories: ["huepfburgen", "huepfburgen", "huepfburgen", "huepfburgen", "huepfburgen"],
  icon: Sparkles,
  categories: ["huepfburgen", "spezialeffekte", "beschallung"],
  color: "from-pink-500/20 to-pink-600/10"
}];

// Legacy export for backward compatibility
export const solutions = solutionData;

function SolutionCard({ solution }: { solution: Solution }) {
  const { t } = useTranslation();
  const Icon = solution.icon;
  const title = t(`solutions.items.${solution.id}.title`);
  const subtitle = t(`solutions.items.${solution.id}.subtitle`);
  const description = t(`solutions.items.${solution.id}.description`);
  const highlights = t(`solutions.items.${solution.id}.highlights`, { returnObjects: true }) as string[];

  return (
    <Link to={`/loesungen/${solution.id}`}>
      <Card className="h-full group hover:shadow-lg transition-all duration-300 overflow-hidden border-2 hover:border-primary/20">
        <div className={`aspect-[16/10] bg-gradient-to-br ${solution.color} relative overflow-hidden`}>
          <img src={solution.image} alt={title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Icon className="w-10 h-10 text-primary" />
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-headline mb-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">{subtitle}</p>
          
          <p className="text-body-text text-sm mb-4 line-clamp-3">
            {description}
          </p>
          
          <div className="space-y-1.5 mb-4">
            {Array.isArray(highlights) && highlights.slice(0, 3).map((highlight, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="text-muted-foreground">{highlight}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center text-primary font-medium text-sm group-hover:text-accent transition-colors">
            {t("solutions.learnMore")} <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Loesungen() {
  const { t } = useTranslation();

  return (
    <Layout>
      <SEO
        title="Lösungen – Equipment für jede Branche | SLT Rental"
        description="Maßgeschneiderte Mietlösungen für Tiefbau, Hochbau, GaLaBau, Events, Handwerk, Transport und mehr. Equipment für Profis und Privat."
        canonical="/loesungen"
        keywords="Baumaschinen Lösungen, Tiefbau Equipment, Event-Technik mieten, GaLaBau Geräte"
        jsonLd={SLT_BREADCRUMB_JSONLD([{ name: "Home", url: "/" }, { name: "Lösungen", url: "/loesungen" }])}
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary to-primary-800 py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-cover bg-center bg-[url('/lovable-uploads/0908574b-d901-4874-9c4a-e3fc1984cf10.jpg')]" />
        <div className="section-container relative z-10">
          <AnimatedSection animation="fade-in-up">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20">
              {t("solutions.heroBadge")}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 max-w-3xl">
              {t("solutions.heroTitle").split("<accent>").map((part, i) => {
                if (i === 0) return part;
                const [accent, rest] = part.split("</accent>");
                return <span key={i}><span className="text-accent">{accent}</span>{rest}</span>;
              })}
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mb-8">
              {t("solutions.heroDesc")}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-12 lg:py-20">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up" className="mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-4">
              {t("solutions.findSolution")}
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              {t("solutions.findSolutionDesc")}
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {solutionData.map((solution, index) => (
              <AnimatedSection key={solution.id} animation="fade-in-up" delay={index * 0.05}>
                <SolutionCard solution={solution} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-16 bg-surface-light">
        <div className="section-container">
          <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl p-8 lg:p-12 text-center">
            <AnimatedSection animation="fade-in-up">
              <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-4">
                {t("solutions.specialProject")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                {t("solutions.specialProjectDesc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/kontakt">
                  <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    {t("solutions.requestConsultation")}
                  </Button>
                </Link>
                <Link to="/standorte">
                  <Button size="lg" variant="outline">
                    {t("solutions.findLocations")}
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </Layout>
  );
}
