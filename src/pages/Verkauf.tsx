import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  Trophy, Wrench, Truck, MessageSquare, RefreshCw, Package,
  ArrowRight, Mail, Phone, Shield, Clock, Handshake, Loader2,
  ExternalLink, ChevronDown,
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
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

const brandIcons = {
  zoomlion: [iconBagger, iconBagger, iconBagger, iconHebebuehne, iconHebebuehne],
  baumax: [iconVerdichtung, iconVerdichtung, iconVerdichtung, iconBagger, iconWerkzeug, iconWerkzeug],
  temared: [iconAnhaenger, iconAnhaenger, iconAnhaenger, iconAnhaenger, iconAnhaenger, iconAnhaenger, iconAnhaenger],
};

const brandLogos = { zoomlion: zoomlionLogo, baumax: baumaxLogo, temared: temaredLogo };
const brandWebsites = {
  zoomlion: "https://www.zoomlion-nrw.de",
  baumax: "https://www.baumax-baumaschinen.de",
  temared: "https://temared.com/de",
};
const brandNames = { zoomlion: "ZOOMLION", baumax: "BAUMAX", temared: "TEMARED" };
const brandKeys = ["zoomlion", "baumax", "temared"] as const;

const uspIcons = [Trophy, Wrench, Truck, MessageSquare, RefreshCw, Package];
const uspKeys = ["dealer", "service", "delivery", "consulting", "rentToBuy", "spareParts"];

const jsonLdAutoDealer = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  name: "SLT Rental – Fachhändler für Baumaschinen & Anhänger",
  url: "https://www.slt-rental.de/verkauf",
  description: "Autorisierter Fachhändler und Servicestützpunkt für Zoomlion, BAUMAX Baumaschinen und Temared in Nordrhein-Westfalen.",
  telephone: "+49 2151 4179904",
  email: "kaufanfrage@slt-rental.de",
  image: "https://www.slt-rental.de/og-image.jpg",
  priceRange: "€€€",
  brand: [
    { "@type": "Brand", name: "Zoomlion", url: "https://www.zoomlion-nrw.de" },
    { "@type": "Brand", name: "BAUMAX Baumaschinen", url: "https://www.baumax-baumaschinen.de" },
    { "@type": "Brand", name: "Temared", url: "https://temared.com/de" },
  ],
  address: [
    { "@type": "PostalAddress", streetAddress: "Drachenburgstraße 8", addressLocality: "Bonn", addressRegion: "NRW", postalCode: "53179", addressCountry: "DE" },
    { "@type": "PostalAddress", streetAddress: "Anrather Straße 291", addressLocality: "Krefeld", addressRegion: "NRW", postalCode: "47807", addressCountry: "DE" },
  ],
  geo: [
    { "@type": "GeoCoordinates", latitude: 50.6879, longitude: 7.1534 },
    { "@type": "GeoCoordinates", latitude: 51.3388, longitude: 6.5853 },
  ],
  areaServed: { "@type": "State", name: "Nordrhein-Westfalen" },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "07:30", closes: "18:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "08:00", closes: "14:30" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Baumaschinen & Anhänger zum Kauf",
    itemListElement: [
      { "@type": "OfferCatalog", name: "Zoomlion Baumaschinen", description: "Minibagger, Radlader, Teleskoplader, Scherenbühnen, Gelenkteleskopsteiger" },
      { "@type": "OfferCatalog", name: "BAUMAX Baumaschinen", description: "Rüttelplatten, Vibrationsstampfer, Minidumper, Steinsägen, Betonrüttler" },
      { "@type": "OfferCatalog", name: "Temared Anhänger", description: "Kastenanhänger, Planenanhänger, Autotransportanhänger, Baumaschinenanhänger" },
    ],
  },
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Product", name: "Zoomlion Minibagger", category: "Baumaschinen" } },
    { "@type": "Offer", itemOffered: { "@type": "Product", name: "BAUMAX Rüttelplatten", category: "Verdichtungstechnik" } },
    { "@type": "Offer", itemOffered: { "@type": "Product", name: "Temared PKW-Anhänger", category: "Anhänger" } },
  ],
};

export default function Verkauf() {
  const { t } = useTranslation();
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

  const faqItems = t("verkauf.faq.items", { returnObjects: true }) as Array<{ q: string; a: string }>;
  const howFoundOptions = t("verkauf.form.howFoundOptions", { returnObjects: true }) as string[];

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: (Array.isArray(faqItems) ? faqItems : []).map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  useEffect(() => {
    const handleScroll = () => setShowSticky(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (window.location.hash === "#kaufanfrage") {
      setTimeout(() => {
        const el = document.getElementById("kaufanfrage");
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 120;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 300);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!datenschutz) {
      toast({ title: "Error", description: t("verkauf.form.errorPrivacy"), variant: "destructive" });
      return;
    }
    if (!selectedMarke || !selectedKategorie) {
      toast({ title: "Error", description: t("verkauf.form.errorRequired"), variant: "destructive" });
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
      toast({ title: "Error", description: t("verkauf.form.errorSend"), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    const el = document.getElementById("kaufanfrage");
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const deliveryOptions = [
    { val: "Lieferung gewünscht", label: t("verkauf.form.deliveryToAddress") },
    { val: "Selbstabholung Bonn", label: t("verkauf.form.pickupBonn") },
    { val: "Selbstabholung Krefeld", label: t("verkauf.form.pickupKrefeld") },
  ];

  const customerTypes = [
    { val: "Gewerblicher Kunde", label: t("verkauf.form.businessCustomer") },
    { val: "Privatkunde", label: t("verkauf.form.privateCustomer") },
  ];

  const countries = ["Deutschland", "Österreich", "Schweiz", "Niederlande", "Belgien", "Luxemburg"];

  return (
    <Layout>
      <SEO
        title={t("verkauf.seo.title")}
        description="Baumaschinen kaufen in NRW: Zoomlion, BAUMAX & Temared – autorisierter Fachhändler. Neumaschinen & Gebrauchtmaschinen. Beratung & Lieferung NRW-weit."
        canonical="/verkauf"
        keywords="Baumaschinen kaufen NRW, Zoomlion Händler NRW, Zoomlion Bagger kaufen, BAUMAX Rüttelplatte kaufen, Temared Anhänger kaufen, Minibagger kaufen Bonn, Radlader kaufen Krefeld, Anhänger kaufen NRW, Baumaschinen Fachhändler Nordrhein-Westfalen, Scherenbühne kaufen"
        ogType="website"
        jsonLd={[
          jsonLdAutoDealer,
          jsonLdFaq,
          SLT_BREADCRUMB_JSONLD([
            { name: "Home", url: "/" },
            { name: t("verkauf.hero.title"), url: "/verkauf" },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="bg-primary py-16 lg:py-24">
        <div className="section-container">
          <AnimatedSection>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
              {t("verkauf.hero.title")}
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-3xl mb-8">
              {t("verkauf.hero.subtitle")}
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={scrollToForm}>
                <Mail className="mr-2 h-5 w-5" /> {t("verkauf.hero.ctaInquiry")}
              </Button>
              <a href="#marken">
                <Button size="lg" variant="secondary" className="gap-2">
                  {t("verkauf.hero.ctaBrands")} <ChevronDown className="h-4 w-4" />
                </Button>
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {brandKeys.map((key) => (
                <a key={key} href={brandWebsites[key]} target="_blank" rel="noopener noreferrer" className="bg-white hover:bg-white/90 transition-colors rounded-lg px-4 py-2 flex items-center">
                  <img src={brandLogos[key]} alt={brandNames[key]} className="h-7 w-auto" />
                </a>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* USPs */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="section-container">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">{t("verkauf.usps.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("verkauf.usps.subtitle")}</p>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {uspKeys.map((key, i) => {
              const Icon = uspIcons[i];
              return (
                <AnimatedSection key={key} delay={i * 80} animation="fade-in-up">
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <Icon className="h-10 w-10 text-accent mb-4" />
                      <h3 className="font-bold text-foreground mb-2">{t(`verkauf.usps.${key}.title`)}</h3>
                      <p className="text-sm text-muted-foreground">{t(`verkauf.usps.${key}.desc`)}</p>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Brand Sections */}
      <section id="marken" className="py-16 lg:py-20 bg-muted/30">
        <div className="section-container space-y-16">
          {brandKeys.map((key, i) => {
            const products = t(`verkauf.products.${key}`, { returnObjects: true }) as string[];
            const icons = brandIcons[key];
            return (
              <AnimatedSection key={key} delay={i * 100}>
                <div className="bg-background rounded-2xl border border-border overflow-hidden">
                  <div className="bg-primary p-6 lg:p-8 flex items-center gap-4">
                    <div className="bg-white rounded-lg p-1.5">
                      <img src={brandLogos[key]} alt={brandNames[key]} className="h-8 lg:h-10 w-auto max-w-[180px] object-contain" />
                    </div>
                    <p className="text-primary-foreground/70">{t(`verkauf.brands.${key}.tagline`)}</p>
                  </div>

                  <div className="p-6 lg:p-8 space-y-6">
                    <h2 className="text-xl lg:text-2xl font-bold text-foreground">{t(`verkauf.brands.${key}.h2`)}</h2>
                    <p className="text-muted-foreground leading-relaxed">{t(`verkauf.brands.${key}.intro`)}</p>
                    {key === "zoomlion" && <p className="text-muted-foreground leading-relaxed">{t(`verkauf.brands.${key}.detail`)}</p>}

                    <h3 className="text-lg font-bold text-foreground">{t(`verkauf.brands.${key}.h3`)}</h3>
                    <ul className="space-y-3">
                      {(Array.isArray(products) ? products : []).map((text, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm text-muted-foreground">
                          <img src={icons[idx] || icons[0]} alt="" className="h-8 w-8 object-contain shrink-0" />
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-3 pt-4">
                      <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={scrollToForm}>
                        {t("verkauf.brands.inquiryBtn")}
                      </Button>
                      <a href={brandWebsites[key]} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="gap-2">
                          <img src={brandLogos[key]} alt={brandNames[key]} className="h-4 w-auto" />
                          {t(`verkauf.brands.${key}.websiteLabel`)} <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </div>

                  <div className="bg-accent/5 border-t border-border p-6 lg:p-8">
                    <h3 className="font-bold text-foreground mb-1">{t(`verkauf.brands.${key}.ctaText`)}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t(`verkauf.brands.${key}.ctaDesc`)}</p>
                    <Button size="sm" onClick={scrollToForm}>{t("verkauf.brands.submitInquiry")} <ArrowRight className="ml-1 h-4 w-4" /></Button>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="section-container max-w-3xl">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">{t("verkauf.faq.title")}</h2>
          </AnimatedSection>
          <Accordion type="single" collapsible className="space-y-3">
            {(Array.isArray(faqItems) ? faqItems : []).map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-lg px-4">
                <AccordionTrigger className="text-left font-semibold text-foreground">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {/* Hidden but crawlable FAQ content for prerendering / SEO */}
          <div className="sr-only" aria-hidden="true">
            {(Array.isArray(faqItems) ? faqItems : []).map((faq, i) => (
              <div key={`seo-faq-${i}`}>
                <h3>{faq.q}</h3>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Purchase Inquiry Form */}
      <section id="kaufanfrage" className="py-16 lg:py-20 bg-muted/30">
        <div className="section-container max-w-3xl">
          <AnimatedSection>
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
                {t("verkauf.form.title")}
              </h2>
              <p className="text-muted-foreground">
                {t("verkauf.form.subtitle")}
              </p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
              {/* 1. Product Selection */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-foreground text-lg">{t("verkauf.form.step1")}</h3>

                  <div>
                    <Label>{t("verkauf.form.brand")} *</Label>
                    <Select value={selectedMarke} onValueChange={(v) => { setSelectedMarke(v); setSelectedKategorie(""); }}>
                      <SelectTrigger><SelectValue placeholder={t("verkauf.form.pleaseSelect")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Zoomlion">Zoomlion</SelectItem>
                        <SelectItem value="BAUMAX Baumaschinen">BAUMAX Baumaschinen</SelectItem>
                        <SelectItem value="Temared">Temared</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t("verkauf.form.category")} *</Label>
                    <Select value={selectedKategorie} onValueChange={setSelectedKategorie} disabled={!selectedMarke}>
                      <SelectTrigger><SelectValue placeholder={selectedMarke ? t("verkauf.form.pleaseSelect") : t("verkauf.form.selectBrandFirst")} /></SelectTrigger>
                      <SelectContent>
                        {(kategorienByMarke[selectedMarke] || []).map((k) => (
                          <SelectItem key={k} value={k}>{k}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t("verkauf.form.model")}</Label>
                    <Input name="modell" placeholder={t("verkauf.form.modelPlaceholder")} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t("verkauf.form.quantity")} *</Label>
                      <Input name="anzahl" type="number" min={1} defaultValue={1} required />
                    </div>
                  </div>

                  <div>
                    <Label>{t("verkauf.form.requirements")}</Label>
                    <Textarea name="anforderungen" rows={3} placeholder={t("verkauf.form.requirementsPlaceholder")} />
                  </div>
                </CardContent>
              </Card>

              {/* 2. Delivery */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-foreground text-lg">{t("verkauf.form.step2")}</h3>

                  <div className="space-y-2">
                    {deliveryOptions.map((opt) => (
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
                          <Label>{t("verkauf.form.streetAndNumber")} *</Label>
                          <Input name="lieferStrasse" required />
                        </div>
                        <div>
                          <Label>{t("verkauf.form.postalCode")} *</Label>
                          <Input name="lieferPlz" required maxLength={5} />
                        </div>
                      </div>
                      <div>
                        <Label>{t("verkauf.form.city")} *</Label>
                        <Input name="lieferOrt" required />
                      </div>
                      <div>
                        <Label>{t("verkauf.form.deliveryNote")}</Label>
                        <Textarea name="lieferhinweis" rows={2} placeholder={t("verkauf.form.deliveryNotePlaceholder")} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 3. Contact Details */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-foreground text-lg">{t("verkauf.form.step3")}</h3>

                  <div className="space-y-2">
                    {customerTypes.map((opt) => (
                      <label key={opt.val} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${kundentyp === opt.val ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                        <input type="radio" name="kundentyp" value={opt.val} checked={kundentyp === opt.val} onChange={() => setKundentyp(opt.val)} className="accent-primary" />
                        <span className="text-sm text-foreground">{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  {kundentyp === "Gewerblicher Kunde" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>{t("verkauf.form.companyName")} *</Label>
                        <Input name="firmenname" required />
                      </div>
                      <div>
                        <Label>{t("verkauf.form.vatId")}</Label>
                        <Input name="ustIdNr" />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t("verkauf.form.salutation")} *</Label>
                      <Select value={selectedAnrede} onValueChange={setSelectedAnrede}>
                        <SelectTrigger><SelectValue placeholder={t("verkauf.form.pleaseSelect")} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Herr">{t("verkauf.form.mr")}</SelectItem>
                          <SelectItem value="Frau">{t("verkauf.form.mrs")}</SelectItem>
                          <SelectItem value="Divers">{t("verkauf.form.diverse")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{t("verkauf.form.titleOptional")}</Label>
                      <Input name="titel" placeholder={t("verkauf.form.titlePlaceholder")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>{t("verkauf.form.firstName")} *</Label>
                      <Input name="vorname" required />
                    </div>
                    <div>
                      <Label>{t("verkauf.form.lastName")} *</Label>
                      <Input name="nachname" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>{t("verkauf.form.email")} *</Label>
                      <Input name="email" type="email" required />
                    </div>
                    <div>
                      <Label>{t("verkauf.form.phone")} *</Label>
                      <Input name="telefon" type="tel" required />
                    </div>
                  </div>

                  <div>
                    <Label>{t("verkauf.form.preferredDate")}</Label>
                    <Input name="wunschtermin" type="date" min={minDate} />
                  </div>
                </CardContent>
              </Card>

              {/* 4. Billing Address */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-foreground text-lg">{t("verkauf.form.step4")}</h3>

                  <div className="flex items-center gap-2">
                    <Checkbox id="rechnungGleich" checked={rechnungGleich} onCheckedChange={(v) => setRechnungGleich(!!v)} />
                    <Label htmlFor="rechnungGleich" className="cursor-pointer">{t("verkauf.form.billingAddressSame")}</Label>
                  </div>

                  {!rechnungGleich && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <Label>{t("verkauf.form.companyOrName")} *</Label>
                        <Input name="rechnungFirma" required />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>{t("verkauf.form.streetAndNumber")} *</Label>
                          <Input name="rechnungStrasse" required />
                        </div>
                        <div>
                          <Label>{t("verkauf.form.postalCode")} *</Label>
                          <Input name="rechnungPlz" required />
                        </div>
                      </div>
                      <div>
                        <Label>{t("verkauf.form.city")} *</Label>
                        <Input name="rechnungOrt" required />
                      </div>
                      <div>
                        <Label>{t("verkauf.form.country")}</Label>
                        <Select value={selectedLand} onValueChange={setSelectedLand}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {countries.map((l) => (
                              <SelectItem key={l} value={l}>{l}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 5. Message & Consent */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-foreground text-lg">{t("verkauf.form.step5")}</h3>

                  <div>
                    <Label>{t("verkauf.form.message")}</Label>
                    <Textarea name="nachricht" rows={4} />
                  </div>

                  <div>
                    <Label>{t("verkauf.form.howFound")}</Label>
                    <Select value={selectedSource} onValueChange={setSelectedSource}>
                      <SelectTrigger><SelectValue placeholder={t("verkauf.form.howFoundOptional")} /></SelectTrigger>
                      <SelectContent>
                        {(Array.isArray(howFoundOptions) ? howFoundOptions : []).map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox id="datenschutz" checked={datenschutz} onCheckedChange={(v) => setDatenschutz(!!v)} className="mt-1" />
                    <Label htmlFor="datenschutz" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                      {t("verkauf.form.privacyConsent").split("<link>")[0]}
                      <Link to="/datenschutz" className="text-primary underline" target="_blank">
                        {t("verkauf.form.privacyConsent").match(/<link>(.*?)<\/link>/)?.[1] || "Datenschutzerklärung"}
                      </Link>
                      {t("verkauf.form.privacyConsent").split("</link>")[1]} *
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Trust + Submit */}
              <div className="space-y-4">
                <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Shield className="h-4 w-4" /> {t("verkauf.form.sslSecured")}</span>
                  <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {t("verkauf.form.callbackPossible")}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {t("verkauf.form.responseTime")}</span>
                  <span className="flex items-center gap-1"><Handshake className="h-4 w-4" /> {t("verkauf.form.nonBinding")}</span>
                </div>

                <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-6 text-lg" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("verkauf.form.submitting")}</> : <>{t("verkauf.form.submitButton")}</>}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  {t("verkauf.form.requiredNote")}
                </p>
              </div>
            </form>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
