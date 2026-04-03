import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import zoomlionLogo from "@/assets/logos/zoomlion.png";
import temaredLogo from "@/assets/logos/temared.webp";
import baumaxLogo from "@/assets/logos/baumax.png";
import iconBagger from "@/assets/icons/category-bagger.png";
import iconHebebuehne from "@/assets/icons/category-hebebuehne.png";
import iconVerdichtung from "@/assets/icons/category-verdichtung.png";
import iconAnhaenger from "@/assets/icons/category-anhaenger.png";
import iconWerkzeug from "@/assets/icons/werkzeug.png";
import { Layout } from "@/components/layout";
import { SEO, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Wrench,
  Truck,
  MessageSquare,
  RefreshCw,
  Package,
  ArrowRight,
  Mail,
  Phone,
  CheckCircle2,
  Shield,
  Clock,
  Handshake,
  Loader2,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const kategorienByMarke: Record<string, string[]> = {
  Zoomlion: [
    "Elektrobagger / Minibagger",
    "Radlader",
    "Teleskoplader",
    "Scherenbühne (Zoomlion Access)",
    "Gelenkteleskopsteiger",
    "Sonstiges Zoomlion-Produkt",
  ],
  "BAUMAX Baumaschinen": [
    "Rüttelplatte (VP-Serie – vorwärtslaufend)",
    "Rüttelplatte (HVP-Serie – hydraulisch reversierbar)",
    "Rüttelplatte (RVP-Serie – mechanisch reversierbar)",
    "Vibrationsstampfer",
    "Minidumper / Raddumper (elektrisch)",
    "Steinsäge / Trennschleifer",
    "Betonrüttler",
    "Fugenschneider",
    "Benzin-Abbruchhammer",
    "Sonstiges BAUMAX-Produkt",
  ],
  Temared: [
    "Kastenanhänger (750 kg – 3.500 kg)",
    "Planenanhänger (S / M / L / XL / XXL)",
    "Kofferanhänger",
    "Autotransportanhänger",
    "Baumaschinenanhänger (1.800 kg – 3.500 kg)",
    "Kippanhänger / Rückwärtskipper",
    "Motorradanhänger (2-fach / 3-fach)",
    "Pferdeanhänger",
    "Sonstiger Temared-Anhänger",
  ],
};

const brands = [
  {
    id: "zoomlion",
    name: "ZOOMLION",
    tagline: "Elektrobagger · Radlader · Teleskoplader · Arbeitsbühnen",
    h2: "Zoomlion – Offizieller Händler & Servicestützpunkt in NRW",
    intro: "Zoomlion Heavy Industry Science & Technology Co., Ltd. ist einer der weltweit führenden Hersteller von Baumaschinen und Arbeitsbühnen mit über 715 Modellen in 15 Produktkategorien. SLT Rental ist autorisierter Zoomlion-Fachhändler und zertifizierter Servicestützpunkt für Nordrhein-Westfalen.",
    detail: "Wir bieten die Zoomlion-Produktlinie für Erdbewegung und Arbeitsbühnen – von kompakten Elektro-Minibaggern für beengte Innenstadtbaustellen bis hin zu leistungsstarken Radladern und Teleskopladern für Bau, Industrie und Logistik.",
    h3: "Produktkategorien Zoomlion bei SLT Rental",
    products: [
      { icon: iconBagger, text: "Minibagger & Bagger: 2 t bis 50 t, für Erdbewegung, Abbruch und Tiefbau" },
      { icon: iconBagger, text: "Radlader: Kompaktradlader 1,5 t bis 5 t für Bau, Recycling und Landwirtschaft" },
      { icon: iconBagger, text: "Teleskoplader: Reichweiten bis 18 m, für Bau, Industrie und Veranstaltungslogistik" },
      { icon: iconHebebuehne, text: "Scherenbühnen (Zoomlion Access): Elektrisch & Diesel, 8–32 m Arbeitshöhe" },
      { icon: iconHebebuehne, text: "Gelenkteleskopsteiger: Bis 28 m Arbeitshöhe, für Außen- und Innenbereich" },
    ],
    website: "https://www.zoomlion-nrw.de",
    websiteLabel: "Zur Zoomlion NRW Website",
    ctaText: "Kaufanfrage Zoomlion",
    ctaDesc: "Wünschen Sie eine persönliche Beratung oder ein Angebot für ein Zoomlion-Produkt?",
  },
  {
    id: "baumax",
    name: "BAUMAX",
    tagline: "Rüttelplatten · Dumper · Stampfer · Steinsägen · Betonrüttler",
    h2: "BAUMAX Baumaschinen – Fachhändler & Servicestützpunkt in NRW",
    intro: "BAUMAX Baumaschinen steht für deutsche Entwicklung, robuste Fertigung und nachhaltige Ersatzteilversorgung. Alle BAUMAX-Maschinen werden in Deutschland endgefertigt, getestet und eingestellt. Als autorisierter Fachhändler und Servicestützpunkt bieten wir das komplette BAUMAX-Sortiment mit persönlicher Beratung und schnellem Werksdienst.",
    detail: "",
    h3: "BAUMAX Produktkategorien bei SLT Rental",
    products: [
      { icon: iconVerdichtung, text: "Vorwärtslaufende Rüttelplatten (VP-Serie): 70–170 kg, für Pflaster & Wege" },
      { icon: iconVerdichtung, text: "Reversierbare Rüttelplatten (HVP/RVP-Serie): Hydraulisch & mechanisch, für Profi-Verdichtung" },
      { icon: iconVerdichtung, text: "Vibrationsstampfer (GS-Serie): Mit Honda-Motor, für Gräben & enge Flächen" },
      { icon: iconBagger, text: "Minidumper & Raddumper: Elektrisch (RDe550, KDe550) & Diesel, bis 650 kg Nutzlast" },
      { icon: iconWerkzeug, text: "Steinsägen & Trennschleifer: SST-Serie, für Beton, Naturstein und Fliesen" },
      { icon: iconWerkzeug, text: "Betonrüttler & Fugenschneider: Für Tiefbau und Betonarbeiten" },
    ],
    website: "https://www.baumax-baumaschinen.de",
    websiteLabel: "Zur offiziellen BAUMAX-Website",
    ctaText: "Kaufanfrage BAUMAX",
    ctaDesc: "Benötigen Sie eine Rüttelplatte, einen Dumper oder Zubehör von BAUMAX?",
  },
  {
    id: "temared",
    name: "TEMARED",
    tagline: "Kastenanhänger · Planenanhänger · Autotransporter · Baumaschinenanhänger",
    h2: "Temared Anhänger kaufen – Autorisierter Händler in NRW",
    intro: "Temared ist Europas Marktführer für PKW-Anhänger bis 750 kg und einer der größten Anhängerhersteller mit zulässigen Gesamtgewichten bis 3.500 kg. Mit über 200 Modellen in 46 Ländern bietet Temared für jeden Transportbedarf die richtige Lösung. SLT Rental ist autorisierter Temared-Fachhändler für Nordrhein-Westfalen – mit Ausstellungsmodellen, Probefahrt und Zulassungsservice.",
    detail: "",
    h3: "Temared Anhänger-Kategorien bei SLT Rental",
    products: [
      { icon: iconAnhaenger, text: "PKW-Kastenanhänger: 750 kg – 3.500 kg, mit & ohne Laubgitter" },
      { icon: iconAnhaenger, text: "Planenanhänger: S, M, L, XL, XXL – für trockenen Transport" },
      { icon: iconAnhaenger, text: "Kofferanhänger: 750 kg – 2.000 kg, abschließbar" },
      { icon: iconAnhaenger, text: "Autotransportanhänger: 1.500 kg – 2.700 kg, mit Auffahrrampen" },
      { icon: iconAnhaenger, text: "Baumaschinenanhänger: 1.800 kg – 3.500 kg, für Bagger & Kompaktmaschinen" },
      { icon: iconAnhaenger, text: "Motorrad- & Quadanhänger: 750 kg, 2- und 3-fach-Belegung" },
      { icon: iconAnhaenger, text: "Kippanhänger: 1.500 kg – 2.700 kg, rückwärtskippend" },
    ],
    website: "https://temared.com/de",
    websiteLabel: "Zur offiziellen Temared-Website",
    ctaText: "Kaufanfrage Temared",
    ctaDesc: "Wünschen Sie ein Angebot für einen Temared-Anhänger? Wir konfigurieren mit Ihnen.",
  },
];

const usps = [
  { icon: Trophy, title: "Autorisierter Fachhändler", desc: "Direkt vom zertifizierten Händler kaufen – mit Herstellergarantie und offiziellem Servicenetz." },
  { icon: Wrench, title: "Service & Wartung vor Ort", desc: "Als Servicestützpunkt übernehmen wir Wartung, Reparatur und Ersatzteilversorgung für alle Marken." },
  { icon: Truck, title: "Lieferung in ganz NRW", desc: "Wir liefern Ihre Neumaschine direkt zur Baustelle, zum Betrieb oder nach Hause – zuverlässig und termingerecht." },
  { icon: MessageSquare, title: "Persönliche Beratung", desc: "Kein Callcenter – Sie sprechen direkt mit unseren Maschinenexperten an den Standorten Bonn und Krefeld." },
  { icon: RefreshCw, title: "Erst mieten, dann kaufen", desc: "Testen Sie die Maschine im Mietbetrieb und rechnen Sie die Mietkosten auf den Kaufpreis an – fragen Sie uns." },
  { icon: Package, title: "Ersatzteile ab Lager", desc: "Wir führen Originalersatzteile aller Marken auf Lager und liefern bundesweit innerhalb von 1–2 Arbeitstagen." },
];

const faqs = [
  {
    q: "Wo finde ich einen Zoomlion Händler in NRW?",
    a: "SLT Rental in Bonn und Krefeld ist autorisierter Zoomlion-Fachhändler und Servicestützpunkt für Nordrhein-Westfalen. Wir führen Bagger, Radlader, Teleskoplader und Arbeitsbühnen der Zoomlion-Linie und bieten persönliche Beratung, Vorführung und Werksdienst.",
  },
  {
    q: "Wo kann ich BAUMAX Baumaschinen kaufen?",
    a: "SLT Rental ist autorisierter BAUMAX-Fachhändler in NRW. Wir führen das komplette BAUMAX-Sortiment: Rüttelplatten (VP, HVP, RVP-Serie), Vibrationsstampfer, Minidumper, Steinsägen und Betonrüttler – mit Ersatzteilservice und Kundendienst vor Ort.",
  },
  {
    q: "Kann ich Temared Anhänger in Bonn oder Krefeld kaufen?",
    a: "Ja – SLT Rental ist autorisierter Temared-Fachhändler in NRW mit Ausstellungsmodellen in Bonn und Krefeld. Wir führen das komplette Temared-Sortiment von 750 kg bis 3.500 kg und übernehmen Zulassung, Lieferung und Service.",
  },
  {
    q: "Bietet SLT Rental auch Service und Reparatur für gekaufte Maschinen an?",
    a: "Ja – als zertifizierter Servicestützpunkt für Zoomlion, BAUMAX und Temared übernehmen wir Wartung, Inspektion, Reparatur und Ersatzteilversorgung für alle bei uns verkauften Maschinen und Anhänger.",
  },
];

const jsonLdAutoDealer = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  name: "SLT Rental – Fachhändler für Baumaschinen & Anhänger",
  url: "https://www.slt-rental.de/verkauf",
  description: "Autorisierter Fachhändler und Servicestützpunkt für Zoomlion, BAUMAX Baumaschinen und Temared in Nordrhein-Westfalen.",
  brand: [
    { "@type": "Brand", name: "Zoomlion", url: "https://www.zoomlion-nrw.de" },
    { "@type": "Brand", name: "BAUMAX Baumaschinen", url: "https://www.baumax-baumaschinen.de" },
    { "@type": "Brand", name: "Temared", url: "https://temared.com/de" },
  ],
  address: [
    { "@type": "PostalAddress", streetAddress: "Drachenburgstraße 8", addressLocality: "Bonn", addressRegion: "NRW", postalCode: "53179", addressCountry: "DE" },
    { "@type": "PostalAddress", streetAddress: "Anrather Straße 291", addressLocality: "Krefeld", addressRegion: "NRW", postalCode: "47807", addressCountry: "DE" },
  ],
  areaServed: { "@type": "State", name: "Nordrhein-Westfalen" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Baumaschinen & Anhänger zum Kauf",
    itemListElement: [
      { "@type": "OfferCatalog", name: "Zoomlion Baumaschinen", description: "Elektrobagger, Radlader, Teleskoplader, Scherenbühnen" },
      { "@type": "OfferCatalog", name: "BAUMAX Baumaschinen", description: "Rüttelplatten, Dumper, Stampfer, Steinsägen" },
      { "@type": "OfferCatalog", name: "Temared Anhänger", description: "PKW-Anhänger, Baumaschinenanhänger, Autotransporter" },
    ],
  },
};

const jsonLdFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function Verkauf() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMarke, setSelectedMarke] = useState("");
  const [selectedKategorie, setSelectedKategorie] = useState("");
  const [lieferOption, setLieferOption] = useState("");
  const [kundentyp, setKundentyp] = useState("");
  const [rechnungGleich, setRechnungGleich] = useState(true);
  const [datenschutz, setDatenschutz] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [selectedAnrede, setSelectedAnrede] = useState("");
  const [selectedLand, setSelectedLand] = useState("Deutschland");
  const [selectedSource, setSelectedSource] = useState("");

  useEffect(() => {
    const handleScroll = () => setShowSticky(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle anchor scroll from hash
  useEffect(() => {
    if (window.location.hash === "#kaufanfrage") {
      setTimeout(() => {
        document.getElementById("kaufanfrage")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!datenschutz) {
      toast({ title: "Datenschutz", description: "Bitte stimmen Sie der Datenschutzerklärung zu.", variant: "destructive" });
      return;
    }
    if (!selectedMarke || !selectedKategorie) {
      toast({ title: "Pflichtfelder", description: "Bitte wählen Sie Marke und Produktkategorie.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      const { error } = await supabase.functions.invoke("send-purchase-inquiry", {
        body: {
          marke: selectedMarke,
          produktkategorie: selectedKategorie,
          modell: fd.get("modell"),
          anzahl: fd.get("anzahl"),
          anforderungen: fd.get("anforderungen"),
          lieferOption,
          strasse: fd.get("lieferStrasse"),
          plz: fd.get("lieferPlz"),
          ort: fd.get("lieferOrt"),
          lieferhinweis: fd.get("lieferhinweis"),
          kundentyp,
          firmenname: fd.get("firmenname"),
          ustIdNr: fd.get("ustIdNr"),
          anrede: selectedAnrede,
          titel: fd.get("titel"),
          vorname: fd.get("vorname"),
          nachname: fd.get("nachname"),
          email: fd.get("email"),
          telefon: fd.get("telefon"),
          wunschtermin: fd.get("wunschtermin"),
          rechnungGleich,
          rechnungFirma: fd.get("rechnungFirma"),
          rechnungStrasse: fd.get("rechnungStrasse"),
          rechnungPlz: fd.get("rechnungPlz"),
          rechnungOrt: fd.get("rechnungOrt"),
          rechnungLand: selectedLand,
          nachricht: fd.get("nachricht"),
          wieGefunden: selectedSource,
        },
      });
      if (error) throw error;
      navigate("/verkauf/danke");
    } catch (err) {
      console.error("Purchase inquiry error:", err);
      toast({ title: "Fehler", description: "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById("kaufanfrage")?.scrollIntoView({ behavior: "smooth" });
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <Layout>
      <SEO
        title="Baumaschinen kaufen NRW – Zoomlion, BAUMAX & Temared Händler | SLT Rental"
        description="Autorisierter Fachhändler für Zoomlion, BAUMAX Baumaschinen & Temared in NRW. Bagger, Radlader, Rüttelplatten, Dumper & Anhänger kaufen. Servicestützpunkt in Bonn & Krefeld."
        canonical="/verkauf"
        keywords="Zoomlion Händler NRW, BAUMAX Baumaschinen Fachhändler, Temared Anhänger kaufen NRW, Bagger kaufen NRW, Rüttelplatte kaufen, Dumper kaufen, Anhänger kaufen Bonn, Baumaschinen kaufen Krefeld"
        ogType="website"
        jsonLd={[
          jsonLdAutoDealer,
          jsonLdFaq,
          SLT_BREADCRUMB_JSONLD([
            { name: "Home", url: "/" },
            { name: "Verkauf", url: "/verkauf" },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="bg-primary py-16 lg:py-24">
        <div className="section-container">
          <AnimatedSection>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
              Baumaschinen & Anhänger kaufen in NRW – SLT Rental
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-3xl mb-8">
              Autorisierter Fachhändler und Servicestützpunkt für Zoomlion, BAUMAX Baumaschinen und Temared in Nordrhein-Westfalen. Kaufen, beraten lassen, direkt abholen oder liefern lassen – alles aus einer Hand.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={scrollToForm}>
                <Mail className="mr-2 h-5 w-5" /> Jetzt Kaufanfrage stellen
              </Button>
              <a href="#marken">
                <Button size="lg" variant="secondary" className="gap-2">
                  Unsere Marken entdecken <ChevronDown className="h-4 w-4" />
                </Button>
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a href="https://www.zoomlion-nrw.de" target="_blank" rel="noopener noreferrer" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors rounded-full px-4 py-2 flex items-center gap-2">
                <img src={zoomlionLogo} alt="Zoomlion" className="h-5 w-auto" />
              </a>
              <a href="https://www.baumax-baumaschinen.de" target="_blank" rel="noopener noreferrer" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors rounded-full px-4 py-2 flex items-center gap-2">
                <img src={baumaxLogo} alt="BAUMAX" className="h-5 w-auto" />
              </a>
              <a href="https://temared.com/de" target="_blank" rel="noopener noreferrer" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors rounded-full px-4 py-2 flex items-center gap-2">
                <img src={temaredLogo} alt="Temared" className="h-5 w-auto" />
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* USPs */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="section-container">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">Warum bei SLT Rental kaufen?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Sechs gute Gründe, Ihre nächste Maschine oder Ihren nächsten Anhänger bei uns zu kaufen.</p>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {usps.map((usp, i) => (
              <AnimatedSection key={usp.title} delay={i * 80} animation="fade-in-up">
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <usp.icon className="h-10 w-10 text-accent mb-4" />
                    <h3 className="font-bold text-foreground mb-2">{usp.title}</h3>
                    <p className="text-sm text-muted-foreground">{usp.desc}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Sections */}
      <section id="marken" className="py-16 lg:py-20 bg-muted/30">
        <div className="section-container space-y-16">
          {brands.map((brand, i) => (
            <AnimatedSection key={brand.id} delay={i * 100}>
              <div className="bg-background rounded-2xl border border-border overflow-hidden">
                {/* Brand Header */}
                <div className="bg-primary p-6 lg:p-8">
                  <span className="text-2xl lg:text-3xl font-bold text-primary-foreground">{brand.name}</span>
                  <p className="text-primary-foreground/70 mt-1">{brand.tagline}</p>
                </div>

                <div className="p-6 lg:p-8 space-y-6">
                  <h2 className="text-xl lg:text-2xl font-bold text-foreground">{brand.h2}</h2>
                  <p className="text-muted-foreground leading-relaxed">{brand.intro}</p>
                  {brand.detail && <p className="text-muted-foreground leading-relaxed">{brand.detail}</p>}

                  <h3 className="text-lg font-bold text-foreground">{brand.h3}</h3>
                  <ul className="space-y-2">
                    {brand.products.map((p) => (
                      <li key={p} className="text-sm text-muted-foreground">{p}</li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-3 pt-4">
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={scrollToForm}>
                      Kaufanfrage stellen
                    </Button>
                    <a href={brand.website} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="gap-2">
                        <img
                          src={brand.id === "zoomlion" ? zoomlionLogo : brand.id === "baumax" ? baumaxLogo : temaredLogo}
                          alt={brand.name}
                          className="h-4 w-auto"
                        />
                        {brand.websiteLabel} <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Brand-specific CTA */}
                <div className="bg-accent/5 border-t border-border p-6 lg:p-8">
                  <h3 className="font-bold text-foreground mb-1">{brand.ctaText}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{brand.ctaDesc}</p>
                  <Button size="sm" onClick={scrollToForm}>Jetzt Anfrage stellen <ArrowRight className="ml-1 h-4 w-4" /></Button>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="section-container max-w-3xl">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">Häufig gestellte Fragen zum Kauf</h2>
          </AnimatedSection>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-lg px-4">
                <AccordionTrigger className="text-left font-semibold text-foreground">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Purchase Inquiry Form */}
      <section id="kaufanfrage" className="py-16 lg:py-20 bg-muted/30">
        <div className="section-container max-w-3xl">
          <AnimatedSection>
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
                📩 Kaufanfrage stellen – wir antworten innerhalb von 24 Stunden
              </h2>
              <p className="text-muted-foreground">
                Füllen Sie das Formular aus. Wir prüfen Ihre Anfrage und senden Ihnen ein unverbindliches Angebot zu – persönlich, transparent, ohne versteckte Kosten.
              </p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
              {/* 1. Produktauswahl */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-foreground text-lg">1. Produktauswahl</h3>

                  <div>
                    <Label>Marke *</Label>
                    <Select value={selectedMarke} onValueChange={(v) => { setSelectedMarke(v); setSelectedKategorie(""); }}>
                      <SelectTrigger><SelectValue placeholder="Bitte wählen" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Zoomlion">Zoomlion</SelectItem>
                        <SelectItem value="BAUMAX Baumaschinen">BAUMAX Baumaschinen</SelectItem>
                        <SelectItem value="Temared">Temared</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Produktkategorie *</Label>
                    <Select value={selectedKategorie} onValueChange={setSelectedKategorie} disabled={!selectedMarke}>
                      <SelectTrigger><SelectValue placeholder={selectedMarke ? "Bitte wählen" : "Bitte zuerst Marke wählen"} /></SelectTrigger>
                      <SelectContent>
                        {(kategorienByMarke[selectedMarke] || []).map((k) => (
                          <SelectItem key={k} value={k}>{k}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Gewünschtes Modell / Spezifikation</Label>
                    <Input name="modell" placeholder="z. B. ZE25E Elektrobagger" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Anzahl *</Label>
                      <Input name="anzahl" type="number" min={1} defaultValue={1} required />
                    </div>
                  </div>

                  <div>
                    <Label>Besondere Anforderungen / Zubehör</Label>
                    <Textarea name="anforderungen" rows={3} placeholder="z. B. mit Schnellwechsler, Löffel 30 cm …" />
                  </div>
                </CardContent>
              </Card>

              {/* 2. Lieferung */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-foreground text-lg">2. Lieferung oder Selbstabholung</h3>

                  <div className="space-y-2">
                    {[
                      { val: "Lieferung gewünscht", label: "🚚 Lieferung an meine Adresse" },
                      { val: "Selbstabholung Bonn", label: "📍 Selbstabholung – Standort Bonn" },
                      { val: "Selbstabholung Krefeld", label: "📍 Selbstabholung – Standort Krefeld" },
                    ].map((opt) => (
                      <label key={opt.val} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${lieferOption === opt.val ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                        <input type="radio" name="lieferOption" value={opt.val} checked={lieferOption === opt.val} onChange={() => setLieferOption(opt.val)} className="accent-primary" />
                        <span className="text-sm text-foreground">{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  {lieferOption === "Lieferung gewünscht" && (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Straße & Hausnummer *</Label>
                          <Input name="lieferStrasse" required />
                        </div>
                        <div>
                          <Label>PLZ *</Label>
                          <Input name="lieferPlz" required maxLength={5} />
                        </div>
                      </div>
                      <div>
                        <Label>Ort *</Label>
                        <Input name="lieferOrt" required />
                      </div>
                      <div>
                        <Label>Lieferhinweis</Label>
                        <Textarea name="lieferhinweis" rows={2} placeholder="z. B. Zufahrt über Hoftor, Ansprechpartner Herr Müller" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 3. Kontaktdaten */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-foreground text-lg">3. Ihre Kontaktdaten</h3>

                  <div className="space-y-2">
                    {[
                      { val: "Gewerblicher Kunde", label: "🏢 Gewerblicher Kunde / Unternehmen" },
                      { val: "Privatkunde", label: "👤 Privatkunde" },
                    ].map((opt) => (
                      <label key={opt.val} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${kundentyp === opt.val ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                        <input type="radio" name="kundentyp" value={opt.val} checked={kundentyp === opt.val} onChange={() => setKundentyp(opt.val)} className="accent-primary" />
                        <span className="text-sm text-foreground">{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  {kundentyp === "Gewerblicher Kunde" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Firmenname *</Label>
                        <Input name="firmenname" required />
                      </div>
                      <div>
                        <Label>USt-IdNr. / Steuernummer</Label>
                        <Input name="ustIdNr" />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Anrede *</Label>
                      <Select value={selectedAnrede} onValueChange={setSelectedAnrede}>
                        <SelectTrigger><SelectValue placeholder="Bitte wählen" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Herr">Herr</SelectItem>
                          <SelectItem value="Frau">Frau</SelectItem>
                          <SelectItem value="Divers">Divers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Titel (optional)</Label>
                      <Input name="titel" placeholder="z. B. Dr., Prof." />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Vorname *</Label>
                      <Input name="vorname" required />
                    </div>
                    <div>
                      <Label>Nachname *</Label>
                      <Input name="nachname" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>E-Mail-Adresse *</Label>
                      <Input name="email" type="email" required />
                    </div>
                    <div>
                      <Label>Telefon / Mobil *</Label>
                      <Input name="telefon" type="tel" required />
                    </div>
                  </div>

                  <div>
                    <Label>Gewünschter Liefer-/Abholtermin</Label>
                    <Input name="wunschtermin" type="date" min={minDate} />
                  </div>
                </CardContent>
              </Card>

              {/* 4. Rechnungsadresse */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-foreground text-lg">4. Rechnungsadresse</h3>

                  <div className="flex items-center gap-2">
                    <Checkbox id="rechnungGleich" checked={rechnungGleich} onCheckedChange={(v) => setRechnungGleich(!!v)} />
                    <Label htmlFor="rechnungGleich" className="cursor-pointer">Rechnungsadresse ist identisch mit der Lieferadresse</Label>
                  </div>

                  {!rechnungGleich && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <Label>Firma / Name *</Label>
                        <Input name="rechnungFirma" required />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Straße & Hausnummer *</Label>
                          <Input name="rechnungStrasse" required />
                        </div>
                        <div>
                          <Label>PLZ *</Label>
                          <Input name="rechnungPlz" required />
                        </div>
                      </div>
                      <div>
                        <Label>Ort *</Label>
                        <Input name="rechnungOrt" required />
                      </div>
                      <div>
                        <Label>Land</Label>
                        <Select value={selectedLand} onValueChange={setSelectedLand}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["Deutschland", "Österreich", "Schweiz", "Niederlande", "Belgien", "Luxemburg"].map((l) => (
                              <SelectItem key={l} value={l}>{l}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 5. Nachricht & Einwilligung */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-foreground text-lg">5. Nachricht & Einwilligung</h3>

                  <div>
                    <Label>Ihre Nachricht / weitere Informationen</Label>
                    <Textarea name="nachricht" rows={4} />
                  </div>

                  <div>
                    <Label>Wie haben Sie uns gefunden?</Label>
                    <Select value={selectedSource} onValueChange={setSelectedSource}>
                      <SelectTrigger><SelectValue placeholder="– optional –" /></SelectTrigger>
                      <SelectContent>
                        {["Google-Suche", "Weiterempfehlung", "Ich bin bereits Stammkunde", "Messe / Veranstaltung", "Social Media", "Sonstiges"].map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox id="datenschutz" checked={datenschutz} onCheckedChange={(v) => setDatenschutz(!!v)} className="mt-1" />
                    <Label htmlFor="datenschutz" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                      Ich habe die{" "}
                      <Link to="/datenschutz" className="text-primary underline" target="_blank">Datenschutzerklärung</Link>{" "}
                      gelesen und bin damit einverstanden, dass meine Daten zur Bearbeitung dieser Kaufanfrage gespeichert und verwendet werden. *
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Trust + Submit */}
              <div className="space-y-4">
                <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Shield className="h-4 w-4" /> SSL-gesichert</span>
                  <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> Rückruf möglich</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Antwort in 24 h</span>
                  <span className="flex items-center gap-1"><Handshake className="h-4 w-4" /> Unverbindlich</span>
                </div>

                <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-6 text-lg" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Wird gesendet…</> : <>📩 Kaufanfrage absenden</>}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  * Pflichtfelder. Ihre Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet und nicht an Dritte weitergegeben. Wir antworten innerhalb von 24 Stunden (Mo–Fr).
                </p>
              </div>
            </form>
          </AnimatedSection>
        </div>
      </section>

      {/* Sticky CTA */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${showSticky ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-2xl rounded-full px-6" onClick={scrollToForm}>
          📩 Kaufanfrage stellen
        </Button>
      </div>
    </Layout>
  );
}
