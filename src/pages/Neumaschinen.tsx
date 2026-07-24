import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import zoomlionLogo from "@/assets/logos/zoomlion-sm.webp";
import temaredLogo from "@/assets/logos/temared-sm.webp";
import baumaxLogo from "@/assets/logos/baumax-sm.webp";
import iconBagger from "@/assets/icons/category-bagger.png";
import iconHebebuehne from "@/assets/icons/category-hebebuehne.png";
import iconVerdichtung from "@/assets/icons/category-verdichtung.png";
import iconAnhaenger from "@/assets/icons/category-anhaenger.png";
import iconWerkzeug from "@/assets/icons/werkzeug.png";
import iconKabel from "@/assets/icons/category-kabel.png";
import { Layout } from "@/components/layout";
import { SEO, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Trophy, Wrench, Truck, MessageSquare, RefreshCw, Package,
  ArrowRight, Phone, Shield, Clock, Handshake, Loader2,
  ExternalLink, ChevronDown, Tag, Search, X, SlidersHorizontal,
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
  Hercu: [
    "Erdrakete Ø 45 mm (kompakt)",
    "Erdrakete Ø 55 mm (Standard)",
    "Erdrakete Ø 55 mm (Turbo, lang)",
    "Erdrakete Ø 65 mm (Turbo, groß)",
    "Sonstige Hercu-Erdrakete",
    "Zubehör (Schlauch, Öl, Nebelöler)",
  ],
};

const brandIcons = {
  zoomlion: [iconBagger, iconBagger, iconBagger, iconHebebuehne, iconHebebuehne],
  baumax: [iconVerdichtung, iconVerdichtung, iconVerdichtung, iconBagger, iconWerkzeug, iconWerkzeug],
  temared: [iconAnhaenger, iconAnhaenger, iconAnhaenger, iconAnhaenger, iconAnhaenger, iconAnhaenger, iconAnhaenger],
  slt: [iconKabel, iconKabel, iconKabel, iconKabel, iconKabel, iconKabel, iconWerkzeug],
};

const brandLogos = { zoomlion: zoomlionLogo, baumax: baumaxLogo, temared: temaredLogo };
const brandWebsites = {
  zoomlion: "https://www.zoomlion-nrw.de",
  baumax: "https://www.baumax-baumaschinen.de",
  temared: "https://temared.com/de",
};
const brandNames = { zoomlion: "ZOOMLION", baumax: "BAUMAX", temared: "TEMARED", slt: "Hercu" };
// Marken-Logo-Strip zeigt nur externe Partner. Hercu-Erdraketen werden im Marken-Abschnitt separat dargestellt (Direktimport, Vertrieb & Service über SLT Rental in NRW).
const externalBrandKeys = ["zoomlion", "baumax", "temared"] as const;
const brandKeys = ["zoomlion", "baumax", "temared", "slt"] as const;

const uspIcons = [Trophy, Wrench, Truck, MessageSquare, RefreshCw, Package];
const uspKeys = ["dealer", "service", "delivery", "consulting", "rentToBuy", "spareParts"];

const jsonLdAutoDealer = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  name: "SLT Rental – Fachhändler für Baumaschinen & Anhänger",
  url: "https://www.slt-rental.de/verkauf/neumaschinen",
  description: "Autorisierter Fachhändler und Servicestützpunkt für Zoomlion, BAUMAX Baumaschinen und Temared in Nordrhein-Westfalen.",
  telephone: "+49 2151 4179904",
  email: "kaufanfrage@slt-rental.de",
  image: "https://www.slt-rental.de/og-image.jpg",
  priceRange: "€€€",
  brand: [
    { "@type": "Brand", name: "Zoomlion", url: "https://www.zoomlion-nrw.de" },
    { "@type": "Brand", name: "BAUMAX Baumaschinen", url: "https://www.baumax-baumaschinen.de" },
    { "@type": "Brand", name: "Temared", url: "https://temared.com/de" },
    { "@type": "Brand", name: "Hercu", url: "https://www.slt-rental.de/verkauf/neumaschinen" },
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
      { "@type": "OfferCatalog", name: "Hercu-Erdraketen", description: "Pneumatische Bodendurchschlagsgeräte (Erdraketen) von Hercu Pneumatic – SLT Rental ist autorisierter Vertriebs- und Servicepartner in NRW" },
    ],
  },
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Product", name: "Zoomlion Minibagger", category: "Baumaschinen" } },
    { "@type": "Offer", itemOffered: { "@type": "Product", name: "BAUMAX Rüttelplatten", category: "Verdichtungstechnik" } },
    { "@type": "Offer", itemOffered: { "@type": "Product", name: "Temared PKW-Anhänger", category: "Anhänger" } },
    { "@type": "Offer", itemOffered: { "@type": "Product", name: "Hercu-Erdraketen", brand: "Hercu", category: "Erdrakete / Bodendurchschlagsgerät" } },
  ],
};

const brandDbNames: Record<string, string> = {
  zoomlion: "Zoomlion",
  baumax: "BAUMAX",
  temared: "Temared",
  slt: "Hercu",
};

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

function formatPriceGross(price: number | null, onRequest: boolean, onRequestLabel = "Preis auf Anfrage") {
  if (onRequest || !price) return onRequestLabel;
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(price);
}

function BrandNewMachines({ brandKey }: { brandKey: string }) {
  const { t } = useTranslation();
  const { data: machines } = useQuery({
    queryKey: ["verkauf-new-machines", brandKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("new_machines")
        .select("id, slug, brand, model, name, short_description, price_gross, compare_at_price, price_on_request, article_number, images")
        .eq("is_active", true)
        .eq("brand", brandDbNames[brandKey] || brandKey)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  if (!machines || machines.length === 0) return null;

  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(n);

  return (
    <div className="mt-2 pt-6 border-t border-border">
      <h3 className="text-lg font-bold text-foreground mb-4">{t("sales.new.brandNewMachinesHeading")}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {machines.map((m: any) => {
          const img = Array.isArray(m.images) && m.images.length > 0 ? m.images[0] : null;
          return (
            <Link
              key={m.id}
              to={`/verkauf/neumaschinen/${m.slug}`}
              className="group flex gap-4 p-4 rounded-lg border border-border hover:border-primary hover:shadow-md transition-all bg-background"
            >
              <div className="w-20 h-20 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                {img ? (
                  <img src={img} alt={m.name} className="w-full h-full object-contain" loading="lazy" />
                ) : (
                  <Package className="h-8 w-8 text-muted-foreground/40" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {m.name}
                </p>
                {m.short_description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{m.short_description}</p>
                )}
                <div className="flex items-center justify-between gap-2 mt-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-primary">
                      {m.price_on_request || !m.price_gross ? t("sales.new.priceOnRequest") : `${fmt(Number(m.price_gross))} ${t("sales.new.gross")}`}
                    </span>
                    {!m.price_on_request && m.price_gross && m.compare_at_price && Number(m.compare_at_price) > Number(m.price_gross) && (
                      <span className="text-[11px] text-muted-foreground line-through">
                        {t("sales.new.rrp")} {fmt(Number(m.compare_at_price))}
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-primary group-hover:translate-x-0.5 transition-transform">
                    {t("sales.new.details")} <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Neumaschinen() {
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
  const [selectedAnrede, setSelectedAnrede] = useState("");
  const [selectedLand, setSelectedLand] = useState("Deutschland");
  const [selectedSource, setSelectedSource] = useState("");
  const [addonAnhaengerkupplung, setAddonAnhaengerkupplung] = useState(false);

  // Filter state for the machine grid – init aus URL-Query (?category=…&brand=…&diameter=…)
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState(searchParams.get("brand") || "all");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [diameter, setDiameter] = useState(searchParams.get("diameter") || "all"); // Erdrakete: Bohrdurchmesser
  const [sort, setSort] = useState<SortKey>("featured");

  // Wenn Query-Params im Link enthalten sind, direkt zum Katalog-Bereich scrollen
  useEffect(() => {
    if (searchParams.get("category") || searchParams.get("brand") || searchParams.get("diameter")) {
      requestAnimationFrame(() => {
        document.getElementById("angebote")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // URL synchron zu Filtern halten (damit Links teilbar bleiben)
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    const setOrDelete = (key: string, val: string) => {
      if (val && val !== "all") next.set(key, val);
      else next.delete(key);
    };
    setOrDelete("category", category);
    setOrDelete("brand", brand);
    setOrDelete("diameter", diameter);
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, brand, diameter]);

  const { data: machines, isLoading } = useQuery({
    queryKey: ["new-machines-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("new_machines")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const brands = useMemo(() => {
    const set = new Set<string>();
    (machines || []).forEach((m: any) => m.brand && set.add(m.brand));
    return Array.from(set).sort();
  }, [machines]);

  // Kategorie-Reihenfolge für die Anzeige (Wunsch: erst Baumaschinen, dann Erdraketen zum Schluss)
  const categoryOrder = [
    "Minidumper",
    "Raddumper",
    "Rüttelplatten",
    "Stampfer",
    "Steinsägen",
    "Fugenschneider",
    "Zubehör Minidumper",
    "Elektrobagger",
    "Radlader",
    "Teleskoplader",
    "Scherenbühne",
    "Gelenkteleskopsteiger",
    "Anhänger",
    "Erdrakete",
    "Eventboden",
  ];
  const categoryRank = (c: string | null | undefined) => {
    if (!c) return 999;
    const idx = categoryOrder.indexOf(c);
    return idx === -1 ? 500 : idx;
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    (machines || []).forEach((m: any) => m.category && set.add(m.category));
    return Array.from(set).sort((a, b) => categoryRank(a) - categoryRank(b));
  }, [machines]);

  // Bohrdurchmesser aus den technischen Daten der Erdraketen ableiten (z.B. "55 mm" -> "55")
  const parseDiameter = (m: any): string | null => {
    const raw = m?.specifications?.Durchmesser;
    if (!raw || typeof raw !== "string") return null;
    const match = raw.match(/(\d+)\s*mm/);
    return match ? match[1] : null;
  };

  const availableDiameters = useMemo(() => {
    const set = new Set<string>();
    (machines || []).forEach((m: any) => {
      if (m.category === "Erdrakete") {
        const d = parseDiameter(m);
        if (d) set.add(d);
      }
    });
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [machines]);

  // Zeigt Ø-Filter nur, wenn der Kunde bereits auf Erdraketen filtert (Kategorie oder Marke Hercu)
  const showDiameterFilter =
    category === "Erdrakete" || brand === "Hercu" || category === "all";

  const filtered = useMemo(() => {
    let list = [...(machines || [])];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((m: any) =>
        [m.name, m.model, m.brand, m.short_description, m.article_number, m.category]
          .filter(Boolean)
          .some((v: string) => v.toLowerCase().includes(q))
      );
    }
    if (brand !== "all") list = list.filter((m: any) => m.brand === brand);
    if (category !== "all") list = list.filter((m: any) => m.category === category);
    if (diameter !== "all") {
      list = list.filter((m: any) => m.category === "Erdrakete" && parseDiameter(m) === diameter);
    }

    switch (sort) {
      case "price-asc":
        list.sort((a: any, b: any) => (Number(a.price_gross) || Infinity) - (Number(b.price_gross) || Infinity));
        break;
      case "price-desc":
        list.sort((a: any, b: any) => (Number(b.price_gross) || -Infinity) - (Number(a.price_gross) || -Infinity));
        break;
      case "name":
        list.sort((a: any, b: any) => (a.name || "").localeCompare(b.name || "", "de"));
        break;
      case "featured":
      default:
        // Standard: nach Produktkategorie gruppiert (Dumper → … → Erdraketen), innerhalb featured + sort_order
        list.sort((a: any, b: any) => {
          const catDiff = categoryRank(a.category) - categoryRank(b.category);
          if (catDiff !== 0) return catDiff;
          if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
          return (a.sort_order ?? 0) - (b.sort_order ?? 0);
        });
    }
    return list;
  }, [machines, search, brand, category, diameter, sort]);

  const hasActiveFilters =
    search || brand !== "all" || category !== "all" || diameter !== "all" || sort !== "featured";
  const resetFilters = () => {
    setSearch("");
    setBrand("all");
    setCategory("all");
    setDiameter("all");
    setSort("featured");
  };

  const isBaumaxDumper =
    selectedMarke === "BAUMAX Baumaschinen" &&
    selectedKategorie === "Minidumper / Raddumper (elektrisch)";

  useEffect(() => {
    if (!isBaumaxDumper && addonAnhaengerkupplung) setAddonAnhaengerkupplung(false);
  }, [isBaumaxDumper, addonAnhaengerkupplung]);

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
          addons: isBaumaxDumper && addonAnhaengerkupplung ? ["Anhängerkupplung"] : [],
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
        title="Neue Baumaschinen und Zubehör kaufen | SLT Rental"
        description="Neue Baumaschinen, Anhänger, Erdraketen und Zubehör kaufen in NRW: Minidumper, Rüttelplatten, Stampfer, Steinsägen, Fugenschneider, PKW-Anhänger und Hercu-Erdraketen (Bodendurchschlagsgeräte) vom autorisierten Fachhändler mit Garantie, Service und Lieferung."
        canonical="/verkauf/neumaschinen"
        keywords="Neumaschinen kaufen NRW, Baumaschinen kaufen, Rüttelplatte kaufen, Vibrationsstampfer kaufen, Minidumper kaufen, Steinsäge kaufen, Fugenschneider kaufen, Erdrakete kaufen, Hercu Erdrakete kaufen, Bodendurchschlagsgerät kaufen, Anhänger kaufen NRW, Baumaschinen Fachhändler Nordrhein-Westfalen, Scherenbühne kaufen, Zubehör Baumaschinen"
        ogType="website"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": "https://www.slt-rental.de/verkauf/neumaschinen#webpage",
            url: "https://www.slt-rental.de/verkauf/neumaschinen",
            name: "Neue Baumaschinen und Zubehör kaufen | SLT Rental",
            description: "Neue Baumaschinen, Anhänger, Erdraketen und Zubehör kaufen in NRW – vom Fachhändler mit Garantie, Service und Lieferung.",
            inLanguage: "de-DE",
            isPartOf: { "@type": "WebSite", name: "SLT Rental", url: "https://www.slt-rental.de" },
            about: { "@type": "Thing", name: "Baumaschinen und Zubehör zum Kauf" },
          },
          jsonLdAutoDealer,
          jsonLdFaq,
          SLT_BREADCRUMB_JSONLD([
            { name: "Home", url: "/" },
            { name: "Neumaschinen kaufen", url: "/verkauf/neumaschinen" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "@id": "https://www.slt-rental.de/verkauf/neumaschinen#machines",
            name: "Neumaschinen bei SLT Rental",
            itemListElement: (machines || []).map((m: any, i: number) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Product",
                name: m.name,
                url: `https://www.slt-rental.de/verkauf/neumaschinen/${m.slug}`,
                brand: m.brand ? { "@type": "Brand", name: m.brand } : undefined,
                category: m.category || undefined,
                offers: m.price_gross && !m.price_on_request
                  ? {
                      "@type": "Offer",
                      price: String(m.price_gross),
                      priceCurrency: "EUR",
                      availability: "https://schema.org/InStock",
                      url: `https://www.slt-rental.de/verkauf/neumaschinen/${m.slug}`,
                      priceValidUntil: new Date(new Date().getFullYear(), 11, 31).toISOString().split("T")[0],
                      ...(m.compare_at_price && Number(m.compare_at_price) > Number(m.price_gross)
                        ? {
                            priceSpecification: [
                              {
                                "@type": "UnitPriceSpecification",
                                price: Number(m.price_gross).toFixed(2),
                                priceCurrency: "EUR",
                                valueAddedTaxIncluded: true,
                              },
                              {
                                "@type": "UnitPriceSpecification",
                                priceType: "https://schema.org/ListPrice",
                                price: Number(m.compare_at_price).toFixed(2),
                                priceCurrency: "EUR",
                                valueAddedTaxIncluded: true,
                              },
                            ],
                          }
                        : {}),
                    }
                  : undefined,
              },
            })),
          },
        ]}
      />

      {/* Hero */}
      <section className="bg-primary py-16 lg:py-20">
        <div className="section-container">
          <AnimatedSection>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
              {t("sales.new.pageTitle")}
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-3xl mb-8">
              {t("sales.new.pageSubtitle")}
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <a href="#angebote">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  {t("sales.new.ctaShowAll")} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <Link to="/verkauf/gebrauchtmaschinen">
                <Button size="lg" variant="secondary" className="gap-2">
                  <Tag className="mr-2 h-5 w-5" /> {t("sales.new.ctaToUsed")}
                </Button>
              </Link>
              <a href="#kaufanfrage">
                <Button size="lg" variant="outline" className="gap-2 bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  {t("sales.new.ctaSubmitInquiry")}
                </Button>
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {externalBrandKeys.map((key) => (
                <a key={key} href={brandWebsites[key]} target="_blank" rel="noopener noreferrer" className="bg-white hover:bg-white/90 transition-colors rounded-lg px-4 py-2 flex items-center">
                  <img src={brandLogos[key]} alt={brandNames[key]} className="h-7 w-auto" />
                </a>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Filter bar */}
      <section id="angebote" className="bg-background border-b border-border sticky top-0 z-20 shadow-sm">
        <div className="section-container py-4">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("sales.new.searchPlaceholder")}
                className="pl-9"
                aria-label={t("sales.new.searchAria")}
              />
            </div>
            <div className={`grid grid-cols-2 sm:grid-cols-${showDiameterFilter && availableDiameters.length > 0 ? 4 : 3} gap-2 lg:flex lg:gap-2`}>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger className="lg:w-[140px]" aria-label={t("sales.new.brandAria")}>
                  <SelectValue placeholder={t("sales.new.brandLabel")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("sales.new.allBrands")}</SelectItem>
                  {brands.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="lg:w-[180px]" aria-label={t("sales.new.categoryAria")}>
                  <SelectValue placeholder={t("sales.new.categoryLabel")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("sales.new.allCategories")}</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showDiameterFilter && availableDiameters.length > 0 && (
                <Select value={diameter} onValueChange={setDiameter}>
                  <SelectTrigger className="lg:w-[170px]" aria-label={t("sales.new.diameterAria")}>
                    <SelectValue placeholder={t("sales.new.diameterPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("sales.new.allDiameters")}</SelectItem>
                    {availableDiameters.map((d) => (
                      <SelectItem key={d} value={d}>{t("sales.new.diameterOption", { d })}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="lg:w-[180px]" aria-label={t("sales.new.sortAria")}>
                  <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
                  <SelectValue placeholder={t("sales.new.sortLabel")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">{t("sales.new.sortFeatured")}</SelectItem>
                  <SelectItem value="price-asc">{t("sales.new.sortPriceAsc")}</SelectItem>
                  <SelectItem value="price-desc">{t("sales.new.sortPriceDesc")}</SelectItem>
                  <SelectItem value="name">{t("sales.new.sortName")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1 self-start lg:self-auto">
                <X className="h-3.5 w-3.5" /> {t("sales.new.reset")}
              </Button>
            )}
          </div>
          {!isLoading && (
            <p className="text-xs text-muted-foreground mt-3">
              {filtered.length} {t("sales.new.articles")}
              {hasActiveFilters && machines && ` ${t("sales.new.articlesOf", { total: machines.length })}`}
            </p>
          )}
        </div>
      </section>

      {/* Machine grid */}
      <section className="section-container py-10 md:py-14">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-12">{t("sales.new.loading")}</p>
        ) : !machines || machines.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">{t("sales.new.emptyAll")}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Search className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">{t("sales.new.emptyFiltered")}</p>
            <Button onClick={resetFilters} variant="outline">{t("sales.new.resetFilters")}</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((m: any) => {
              const img = Array.isArray(m.images) && m.images.length > 0 ? m.images[0] : null;
              return (
                <Link key={m.id} to={`/verkauf/neumaschinen/${m.slug}`} className="group flex">
                  <Card className="h-full w-full flex flex-col hover:shadow-lg hover:border-primary/40 transition-all overflow-hidden">
                    <div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
                      {img ? (
                        <img
                          src={img}
                          alt={m.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <Package className="h-16 w-16 text-muted-foreground/30" />
                      )}
                    </div>
                    <CardContent className="p-5 flex flex-col flex-1">
                      <div className="flex flex-wrap gap-2 mb-2 min-h-[28px]">
                        <Badge variant="outline">{m.brand}</Badge>
                        {m.category && (
                          <Badge variant="secondary" className="font-normal">{m.category}</Badge>
                        )}
                        {m.is_featured && (
                          <Badge className="bg-accent text-accent-foreground">{t("sales.new.badgeTop")}</Badge>
                        )}
                      </div>
                      <h2 className="font-bold text-headline text-lg leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-3 min-h-[4.5rem]">
                        {m.name}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[2.5rem]">
                        {m.short_description || ""}
                      </p>
                      <div className="mt-auto flex items-baseline justify-between gap-2 pt-3 border-t border-border min-h-[6.25rem]">
                        <div>
                          <p className="text-xs text-muted-foreground">{t("sales.new.priceLabel")}</p>
                          <p className="text-lg font-bold text-primary">
                            {formatPriceGross(m.price_gross ? Number(m.price_gross) : null, m.price_on_request, t("sales.new.priceOnRequest"))}
                          </p>
                          {!m.price_on_request && m.price_gross && m.compare_at_price && Number(m.compare_at_price) > Number(m.price_gross) && (
                            <p className="text-xs text-muted-foreground line-through">
                              {t("sales.new.rrp")} {formatPriceGross(Number(m.compare_at_price), false, t("sales.new.priceOnRequest"))}
                            </p>
                          )}
                          {!m.price_on_request && m.price_gross && (
                            <p className="text-xs text-muted-foreground">brutto inkl. MwSt.</p>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                          Details <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* USPs */}
      <section className="py-16 lg:py-20 bg-muted/20">
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
            const logo = (brandLogos as Record<string, string>)[key];
            const externalUrl = (brandWebsites as Record<string, string>)[key];
            return (
              <AnimatedSection key={key} delay={i * 100}>
                <div className="bg-background rounded-2xl border border-border overflow-hidden">
                  <div className="bg-primary p-6 lg:p-8 flex items-center gap-4">
                    {logo ? (
                      <div className="bg-white rounded-lg p-1.5">
                        <img src={logo} alt={brandNames[key]} className="h-8 lg:h-10 w-auto max-w-[180px] object-contain" />
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg px-4 py-2">
                        <span className="text-primary font-bold text-lg lg:text-xl tracking-wide">{brandNames[key]}</span>
                      </div>
                    )}
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

                    <BrandNewMachines brandKey={key} />

                    <div className="flex flex-wrap gap-3 pt-4">
                      <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={scrollToForm}>
                        {t("verkauf.brands.inquiryBtn")}
                      </Button>
                      {externalUrl && (
                        <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="gap-2">
                            {logo && <img src={logo} alt={brandNames[key]} className="h-4 w-auto" />}
                            {t(`verkauf.brands.${key}.websiteLabel`)} <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
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
                        <SelectItem value="Hercu">Hercu (Erdraketen &amp; Zubehör)</SelectItem>
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

                  {isBaumaxDumper && (
                    <div className="rounded-lg border border-accent/40 bg-accent/5 p-4">
                      <p className="font-semibold text-foreground text-sm mb-2">Optionales Zubehör</p>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                          checked={addonAnhaengerkupplung}
                          onCheckedChange={(v) => setAddonAnhaengerkupplung(v === true)}
                          className="mt-0.5"
                        />
                        <span className="text-sm text-foreground">
                          <strong>Anhängerkupplung</strong> für den Raddumper hinzufügen{" "}
                          <span className="text-primary font-bold">99 € brutto</span>
                          {" "}<span className="text-muted-foreground line-through">119 €</span>{" "}
                          <Link
                            to="/verkauf/neumaschinen/baumax-anhaengerkupplung-kde550"
                            className="text-primary underline underline-offset-2 hover:text-primary/80"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Details ansehen
                          </Link>
                        </span>
                      </label>
                      <p className="text-xs text-muted-foreground mt-2 ml-7">
                        Sofort lieferbar · Lieferung 1–2 Werktage · Sonderpreis bis 30.06.2026
                      </p>
                    </div>
                  )}
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
