import { useState, useEffect, useRef } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { NewMachineInquiryModal } from "@/components/new-machines/NewMachineInquiryModal";
import {
  ArrowLeft, ArrowRight, Phone, MapPin, Shield, Wrench, Truck, CheckCircle2,
  Package, Mail, Clock,
} from "lucide-react";

const locationLabels: Record<string, string> = {
  krefeld: "Krefeld",
  bonn: "Bonn",
  muelheim: "Mülheim an der Ruhr",
};

function formatPriceGross(price: number | null, onRequest: boolean) {
  if (onRequest || !price) return "Preis auf Anfrage";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(price);
}

function AutoplayVideoSection({
  url,
  title,
  caption,
  poster,
  ariaLabel,
}: {
  url: string;
  title: string;
  caption?: string;
  poster?: string;
  ariaLabel: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const hasStartedRef = useRef(false);

  // Lazy-load: attach src only when the section is close to the viewport.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Autoplay when the video itself is >=40% visible; pause when it leaves.
  useEffect(() => {
    if (!shouldLoad) return;
    const video = videoRef.current;
    if (!video) return;
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            if (!hasStartedRef.current) {
              hasStartedRef.current = true;
              const p = video.play();
              if (p && typeof p.catch === "function") p.catch(() => {});
            }
          } else if (!entry.isIntersecting) {
            if (!video.paused) video.pause();
          }
        });
      },
      { threshold: [0, 0.4, 0.75] }
    );
    io.observe(video);
    return () => io.disconnect();
  }, [shouldLoad]);

  return (
    <section className="section-container py-8 md:py-12 border-t border-border">
      <div ref={containerRef} className="max-w-2xl mx-auto md:mx-0">
        <h2 className="text-xl md:text-2xl font-bold text-headline mb-2">{title}</h2>
        {caption && (
          <p className="text-sm text-muted-foreground mb-4 max-w-xl">{caption}</p>
        )}
        <div className="relative w-full overflow-hidden rounded-lg bg-muted border border-border" style={{ aspectRatio: "16 / 9" }}>
          {shouldLoad ? (
            <video
              ref={videoRef}
              src={url}
              poster={poster || undefined}
              controls
              muted
              playsInline
              {...({ "webkit-playsinline": "true" } as Record<string, string>)}
              preload="metadata"
              aria-label={ariaLabel}
              className="absolute inset-0 w-full h-full object-contain bg-black"
            >
              Dein Browser unterstützt kein HTML5-Video.
            </video>
          ) : (
            poster ? (
              <img
                src={poster}
                alt={ariaLabel}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-contain bg-black"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-xs text-white/60">
                Video wird geladen, sobald es sichtbar wird…
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

export default function NeumaschineDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [activeImage, setActiveImage] = useState(0);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);

  const { data: machine, isLoading } = useQuery({
    queryKey: ["new-machine", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("new_machines")
        .select("*")
        .eq("slug", slug!)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="section-container py-20 text-center text-muted-foreground">
          Lade Maschine…
        </div>
      </Layout>
    );
  }

  if (!machine) {
    return <Navigate to="/verkauf/neumaschinen" replace />;
  }

  const priceGross = machine.price_gross ? Number(machine.price_gross) : null;
  const vatRate = machine.vat_rate ? Number(machine.vat_rate) : 19;
  const priceNet = priceGross ? priceGross / (1 + vatRate / 100) : null;
  const compareAtPrice = (machine as any).compare_at_price ? Number((machine as any).compare_at_price) : null;
  const hasDiscount = !!(priceGross && compareAtPrice && compareAtPrice > priceGross);
  const discountPercent = hasDiscount ? Math.round((1 - (priceGross as number) / (compareAtPrice as number)) * 100) : 0;

  const content: any = (machine as any).content || {};
  const specs: Record<string, string> = (machine.specifications as any) || {};
  const images: string[] = Array.isArray(machine.images) ? machine.images : [];
  const highlights: string[] = Array.isArray(content.highlights) ? content.highlights : [];
  const suitableFor: string[] = Array.isArray(content.suitableFor) ? content.suitableFor : [];
  const whyItems: { title: string; desc: string }[] = Array.isArray(content.whyItems) ? content.whyItems : [];
  const options: { name: string; price: string; note?: string; href?: string }[] = Array.isArray(content.options) ? content.options : [];
  const seoKeywords: string[] = Array.isArray(content.seoKeywords) ? content.seoKeywords : [];
  const imageAlts: string[] = Array.isArray(content.imageAlts) ? content.imageAlts : [];
  const altFor = (idx: number) => imageAlts[idx] || `${machine.brand} ${machine.model} – Bild ${idx + 1}`;
  const showroomLocs: string[] = Array.isArray(machine.showroom_locations) ? machine.showroom_locations : [];
  const showroomNames = showroomLocs.map((l) => locationLabels[l] || l).join(" oder ");
  const demoLocs: string[] = Array.isArray((content as any).demoLocations) ? (content as any).demoLocations : [];
  const demoNames = demoLocs.map((l) => locationLabels[l] || l).join(" und ");

  const title = (content as any).seoTitle || `${machine.brand} ${machine.model} kaufen | Neumaschine – SLT Rental`;
  const description = (content as any).seoDescription || machine.short_description ||
    `${machine.brand} ${machine.model} – Neumaschine bei SLT Rental. ${priceGross ? formatPriceGross(priceGross, false) + " brutto." : "Preis auf Anfrage."}`;

  const BASE_URL = "https://www.slt-rental.de";
  const canonicalPath = `/verkauf/neumaschinen/${slug}`;
  const absoluteImages = images
    .map((img) => (img?.startsWith("http") ? img : img ? `${BASE_URL}${img.startsWith("/") ? "" : "/"}${img}` : null))
    .filter(Boolean) as string[];

  const sellerNode = {
    "@type": "Organization",
    name: "SLT Rental",
    legalName: "SLT Technology Group GmbH & Co. KG",
    url: BASE_URL,
    telephone: "+49 2151 4179904",
    email: "kaufanfrage@slt-rental.de",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Anrather Straße 291",
      addressLocality: "Krefeld",
      postalCode: "47807",
      addressRegion: "NRW",
      addressCountry: "DE",
    },
  };

  // Parse shipping cost (EUR) from content.shipping if a number is present
  const shippingText: string = (content as any)?.shipping || "";
  const shippingMatch = shippingText.match(/(\d+(?:[.,]\d+)?)\s*€/);
  const shippingRate = shippingMatch ? parseFloat(shippingMatch[1].replace(",", ".")) : null;

  const shippingDetailsNode = shippingRate !== null
    ? {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: shippingRate.toFixed(2), currency: "EUR" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "DE" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
        },
      }
    : undefined;

  const returnPolicyNode = {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "DE",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 14,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnShippingFees",
  };

  const offerNode: Record<string, unknown> | undefined = priceGross
    ? {
        "@type": "Offer",
        url: `${BASE_URL}${canonicalPath}`,
        priceCurrency: "EUR",
        price: priceGross.toFixed(2),
        priceSpecification: hasDiscount
          ? [
              {
                "@type": "UnitPriceSpecification",
                price: priceGross.toFixed(2),
                priceCurrency: "EUR",
                valueAddedTaxIncluded: true,
              },
              {
                "@type": "UnitPriceSpecification",
                priceType: "https://schema.org/ListPrice",
                price: (compareAtPrice as number).toFixed(2),
                priceCurrency: "EUR",
                valueAddedTaxIncluded: true,
              },
            ]
          : {
              "@type": "UnitPriceSpecification",
              price: priceGross.toFixed(2),
              priceCurrency: "EUR",
              valueAddedTaxIncluded: true,
            },
        priceValidUntil: machine.slug === "baumax-anhaengerkupplung-kde550"
          ? "2026-06-30"
          : `${new Date().getFullYear() + 1}-12-31`,
        itemCondition: "https://schema.org/NewCondition",
        availability: "https://schema.org/InStock",
        seller: sellerNode,
        businessFunction: "https://schema.org/Sell",
        eligibleRegion: { "@type": "Country", name: "DE" },
        ...(shippingDetailsNode ? { shippingDetails: shippingDetailsNode } : {}),
        hasMerchantReturnPolicy: returnPolicyNode,
      }
    : undefined;

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${machine.brand} ${machine.model}`,
    description: machine.description || description,
    sku: machine.article_number || machine.id,
    ...(machine.article_number ? { mpn: machine.article_number } : {}),
    ...(machine.gtin ? { gtin13: machine.gtin } : {}),
    brand: { "@type": "Brand", name: machine.brand },
    category: machine.category,
    ...(absoluteImages.length > 0 ? { image: absoluteImages } : {}),
    itemCondition: "https://schema.org/NewCondition",
    ...(offerNode ? { offers: offerNode } : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Start", item: `${BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Verkauf", item: `${BASE_URL}/verkauf` },
      { "@type": "ListItem", position: 3, name: "Neumaschinen", item: `${BASE_URL}/verkauf/neumaschinen` },
      { "@type": "ListItem", position: 4, name: `${machine.brand} ${machine.model}`, item: `${BASE_URL}${canonicalPath}` },
    ],
  };

  const youtubeId: string | undefined = (content as any).youtubeId;
  const videoJsonLd = youtubeId
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: `${machine.brand} ${machine.model} – Produktvideo`,
        description: machine.short_description || description,
        thumbnailUrl: `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`,
        uploadDate: machine.created_at,
        embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
        contentUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
      }
    : null;

  const faqList: { q: string; a: string }[] = Array.isArray((content as any).faq) ? (content as any).faq : [];
  const faqJsonLd = faqList.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqList.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  } : null;

  const jsonLdArray = [productJsonLd, breadcrumbJsonLd];
  if (videoJsonLd) jsonLdArray.push(videoJsonLd);
  if (faqJsonLd) jsonLdArray.push(faqJsonLd);


  const priceLabel = priceGross ? `${formatPriceGross(priceGross, false)} brutto` : "Preis auf Anfrage";

  return (
    <Layout>
      <SEO
        title={title}
        description={description}
        keywords={seoKeywords.length > 0 ? seoKeywords.join(", ") : undefined}
        canonical={canonicalPath}
        ogImage={absoluteImages[0]}
        ogType="product"
        jsonLd={jsonLdArray}
      />

      <div className="bg-muted/30 border-b border-border">
        <div className="section-container py-3 text-sm text-muted-foreground">
          <Link to="/verkauf/neumaschinen" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
            <ArrowLeft className="h-3 w-3" />
            Zurück zu allen Neumaschinen
          </Link>
        </div>
      </div>

      <section className="section-container py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden mb-3 flex items-center justify-center">
              {images.length > 0 ? (
                <img
                  src={images[activeImage]}
                  alt={altFor(activeImage)}
                  className="w-full h-full object-contain"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  width={1600}
                  height={1200}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <Package className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square rounded overflow-hidden border-2 transition-all ${
                      idx === activeImage ? "border-primary" : "border-transparent hover:border-primary/40"
                    }`}
                    aria-label={`Bild ${idx + 1} anzeigen: ${altFor(idx)}`}
                  >
                    <img
                      src={img}
                      alt={altFor(idx)}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline">Neumaschine</Badge>
              <Badge variant="outline">{machine.brand}</Badge>
              {machine.is_featured && (
                <Badge className="bg-accent text-accent-foreground">Top-Angebot</Badge>
              )}
            </div>

            <p className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-1">
              {machine.brand} · {machine.category}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-headline mb-3 leading-tight">
              {machine.name}
            </h1>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground mb-6">
              {machine.gtin && <span>GTIN {machine.gtin}</span>}
              {showroomNames && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Besichtigung in {showroomNames}
                </span>
              )}
            </div>

            {demoNames && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-accent/40 bg-accent/10 p-3">
                <CheckCircle2 className="h-5 w-5 text-accent-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-semibold text-headline">Vorführmodell verfügbar in {demoNames}.</span>{" "}
                  <span className="text-foreground/80">Komm vorbei, schau Dir die Maschine an und teste sie direkt vor Ort – Termin am besten kurz vorab telefonisch abstimmen.</span>
                </div>
              </div>
            )}

            <Card className="mb-6 border-primary/20">
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Preis</p>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-3xl font-bold text-primary">
                    {formatPriceGross(priceGross, machine.price_on_request)}
                  </span>
                  {priceGross && (
                    <span className="text-sm text-muted-foreground">brutto inkl. {vatRate} % MwSt.</span>
                  )}
                </div>
                {hasDiscount && (
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground line-through">
                      UVP {formatPriceGross(compareAtPrice, false)}
                    </span>
                    <Badge className="bg-accent text-accent-foreground">−{discountPercent}% Sonderangebot</Badge>
                  </div>
                )}
                {priceNet && (
                  <p className="text-sm text-muted-foreground mt-1">
                    entspricht {formatPriceGross(priceNet, false)} netto
                  </p>
                )}
                {machine.slug === "baumax-anhaengerkupplung-kde550" && priceGross && (
                  <div className="mt-3 p-3 rounded-lg bg-accent/10 border border-accent/30">
                    <p className="text-sm font-semibold text-foreground">
                      Sofort lieferbar · Lieferung innerhalb von 1–2 Werktagen
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Sonderangebotspreis nur gültig bis 30.06.2026 – danach regulär {formatPriceGross(compareAtPrice || 119, false)} brutto.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Versand: 9,90 € · Besichtigung in Krefeld oder Bonn
                    </p>
                  </div>
                )}
                {content.leadTime ? (
                  <p className="text-xs text-muted-foreground mt-3 inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {content.leadTime}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-3 inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Lieferbar innerhalb von 2–3 Werktagen
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Konfigurations-Auswahl (Solo / mit Grundausstattung) – für SLT-Erdraketen */}
            {machine.brand === "SLT" && options.length > 0 && (
              <Card className="mb-6 border-accent/30 bg-accent/5">
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Konfiguration wählen</p>
                  <div className="space-y-2">
                    {options.map((opt) => (
                      <label
                        key={opt.name}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedConfig === opt.name ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 bg-background"
                        }`}
                      >
                        <input
                          type="radio"
                          name="hercu-config"
                          value={opt.name}
                          checked={selectedConfig === opt.name}
                          onChange={() => setSelectedConfig(opt.name)}
                          className="mt-1 accent-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2 flex-wrap">
                            <span className="font-semibold text-foreground text-sm">{opt.name}</span>
                            <span className="text-sm font-bold text-primary">{opt.price}</span>
                          </div>
                          {opt.note && <p className="text-xs text-muted-foreground mt-1 leading-snug">{opt.note}</p>}
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-3">
                    Deine Auswahl übernehmen wir automatisch in das Anfrageformular.
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Button size="lg" className="w-full sm:flex-1" onClick={() => setInquiryOpen(true)}>
                Anfrage senden <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                <a href="tel:021514179904" className="inline-flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4" /> 02151 417 99 04
                </a>
              </Button>
            </div>


            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { icon: Shield, text: "Hersteller-Garantie" },
                { icon: Wrench, text: "Service vor Ort" },
                { icon: Truck, text: content.shipping || "Lieferung möglich" },
                { icon: Mail, text: "Persönliche Beratung" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-muted-foreground">
                  <item.icon className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Accessory teaser: Anhängerkupplung für KDe550 / KDe550p */}
      {(slug === "baumax-kde550-raddumper-elektrisch" || slug === "baumax-kde550p-raddumper-elektrisch") && (
        <section className="section-container py-8 md:py-10 border-t border-border">
          <Card className="overflow-hidden border-accent/40 bg-accent/5">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_auto] gap-4 md:gap-6 items-center p-5">
              <Link to="/verkauf/neumaschinen/baumax-anhaengerkupplung-kde550" className="block">
                <div className="aspect-square bg-white rounded-lg overflow-hidden border border-border">
                  <img
                    src="/product-images/anhaengerkupplung-kde550-1.png"
                    alt="Anhängerkupplung für BAUMAX KDe550 / KDe550p"
                    className="w-full h-full object-contain"
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              </Link>
              <div>
                <Badge className="bg-accent text-accent-foreground mb-2">Passendes Zubehör</Badge>
                <Link to="/verkauf/neumaschinen/baumax-anhaengerkupplung-kde550" className="block hover:text-primary transition-colors">
                  <h3 className="text-xl font-bold text-headline mb-1">
                    Anhängerkupplung für BAUMAX Raddumper KDe550 / KDe550p
                  </h3>
                </Link>
                <p className="text-sm text-foreground/80 mb-2">
                  Passgenaues, baugleiches Zubehör mit 50-mm-Kugelkopf nach DIN – werkzeuglose Montage über die werkseitige Steckaufnahme.
                </p>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl font-bold text-primary">99 € brutto</span>
                  <span className="text-sm text-muted-foreground line-through">119 €</span>
                  <Badge className="bg-accent text-accent-foreground">Sonderpreis bis 30.06.2026</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Sofort lieferbar · Lieferung 1–2 Werktage
                </p>
              </div>
              <div className="flex flex-col gap-2 md:items-end">
                <Button asChild>
                  <Link to="/verkauf/neumaschinen/baumax-anhaengerkupplung-kde550">
                    Details ansehen <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => setInquiryOpen(true)}>
                  In Anfrage hinzufügen
                </Button>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Description */}
      {machine.description && (
        <section className="section-container py-8 md:py-12 border-t border-border">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-headline mb-4">Beschreibung</h2>
            <div className="prose prose-neutral max-w-none text-foreground/90 leading-relaxed whitespace-pre-line">
              {machine.description}
            </div>
          </div>
        </section>
      )}

      {/* Warum bei SLT Rental kaufen – für alle BAUMAX Maschinen */}
      {machine.brand?.toLowerCase() === "baumax" && (
        <section className="section-container py-10 md:py-14 border-t border-border">
          <div className="max-w-5xl">
            <Badge className="bg-accent text-accent-foreground mb-3">Autorisierter BAUMAX Fachhändler in NRW</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-headline mb-3">
              Warum den {machine.brand} {machine.model} bei SLT Rental kaufen?
            </h2>

            <p className="text-foreground/80 mb-8 max-w-3xl">
              Wir sind autorisierter BAUMAX Fachhändler mit eigenem Standort in Krefeld und Bonn. Statt anonymem Online-Kauf bekommst Du bei uns persönliche Beratung, Vorführung vor Ort und Service-Werkstatt in NRW – aus einer Hand.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                { icon: MapPin, title: "Vor Ort anschauen & testen", text: "Maschine vor dem Kauf in Krefeld oder Bonn live erleben, Probefahrt inklusive. Kein Blindkauf wie im reinen Online-Shop." },
                { icon: Wrench, title: "Eigene Service-Werkstatt in NRW", text: "Wartung, Reparatur, Ersatzteile und Garantieabwicklung übernehmen wir direkt – kein Versand der Maschine quer durch Deutschland." },
                { icon: Shield, title: "Fachhändler-Beratung", text: "Echte Beratung von erfahrenen Mietprofis: Wir kennen Einsatzgrenzen, passende Zubehöre und die Praxis auf der Baustelle." },
                { icon: Truck, title: "Lieferung NRW-weit", text: "Lieferung mit eigenem Fuhrpark in NRW inklusive Einweisung beim Kunden – keine Spedition, kein Palettenchaos." },
                { icon: Package, title: "Probemiete & Anrechnung", text: "Unsicher beim Modell? Erst mieten, dann kaufen – die Mietkosten rechnen wir auf Wunsch beim Kauf an." },
                { icon: CheckCircle2, title: "Original BAUMAX Ersatzteile", text: "Direkter Draht zum Hersteller, schnelle Ersatzteilversorgung und Wartung nach Herstellervorgaben." },
              ].map((b, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-lg border border-border bg-card">
                  <b.icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-headline mb-1">{b.title}</div>
                    <p className="text-sm text-foreground/80">{b.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="font-semibold text-headline mb-1">Mehr zum Hersteller</div>
                <p className="text-sm text-foreground/80">
                  Technische Hintergründe und das komplette Sortiment findest Du direkt beim Hersteller BAUMAX.
                </p>
              </div>
              <Button asChild variant="outline">
                <a href="https://www.baumax.de" target="_blank" rel="noopener noreferrer">
                  Zur BAUMAX Herstellerseite <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Product video (YouTube) */}
      {youtubeId && (
        <section className="section-container py-8 md:py-12 border-t border-border">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-headline mb-4">Produktvideo</h2>
            <div className="relative w-full overflow-hidden rounded-lg bg-muted" style={{ aspectRatio: "16 / 9" }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                title={`${machine.brand} ${machine.model} – Produktvideo`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          </div>
        </section>
      )}

      {/* Product video (self-hosted MP4, e.g. Hercu Animation) */}
      {(content as any).productVideoUrl && (
        <AutoplayVideoSection
          url={(content as any).productVideoUrl}
          title={(content as any).productVideoTitle || "So funktioniert die Erdrakete"}
          caption={(content as any).productVideoCaption}
          poster={(content as any).productVideoPoster}
          ariaLabel={`${machine.brand} ${machine.model} – Funktionsprinzip Animation`}
        />
      )}

      {/* Highlights */}
      {highlights.length > 0 && (
        <section className="section-container py-8 md:py-12 border-t border-border">
          <h2 className="text-2xl font-bold text-headline mb-6">Highlights & Vorteile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {highlights.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/90">{item}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Specifications */}
      {Object.keys(specs).length > 0 && (
        <section className="section-container py-8 md:py-12 border-t border-border">
          <h2 className="text-2xl font-bold text-headline mb-6">Technische Daten</h2>
          <div className="max-w-3xl">
            <dl className="divide-y divide-border border border-border rounded-lg overflow-hidden">
              {Object.entries(specs).map(([key, val]) => (
                <div key={key} className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr] gap-1 sm:gap-4 px-4 py-3 even:bg-muted/30">
                  <dt className="text-sm font-medium text-muted-foreground">{key}</dt>
                  <dd className="text-sm text-foreground/90">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* Options */}
      {options.length > 0 && (
        <section className="section-container py-8 md:py-12 border-t border-border">
          <h2 className="text-2xl font-bold text-headline mb-6">Optionales Zubehör</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            {options.map((opt, idx) => (
              <Card key={idx} className="p-5">
                {opt.href ? (
                  <Link to={opt.href} className="font-semibold text-headline mb-1 block hover:text-primary transition-colors inline-flex items-center gap-1">
                    {opt.name} <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <p className="font-semibold text-headline mb-1">{opt.name}</p>
                )}
                <p className="text-primary font-bold">{opt.price}</p>
                {opt.note && <p className="text-sm text-muted-foreground mt-1">{opt.note}</p>}
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Suitable for */}
      {suitableFor.length > 0 && (
        <section className="bg-muted/30 py-10 md:py-14">
          <div className="section-container">
            <h2 className="text-2xl font-bold text-headline mb-6">Einsatzgebiete</h2>
            <div className="flex flex-wrap gap-2">
              {suitableFor.map((item, idx) => (
                <Badge key={idx} variant="secondary" className="text-sm px-3 py-1.5">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why us */}
      {whyItems.length > 0 && (
        <section className="section-container py-8 md:py-12 border-t border-border">
          {content.whyTitle && (
            <h2 className="text-2xl font-bold text-headline mb-6">{content.whyTitle}</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
            {whyItems.map((it, idx) => (
              <Card key={idx} className="p-4">
                <p className="font-semibold text-headline text-sm mb-1">{it.title}</p>
                <p className="text-sm text-muted-foreground">{it.desc}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Dealer info */}
      {content.dealerInfo && (
        <section className="section-container py-8 md:py-12 border-t border-border">
          <Card className="p-6 border-primary/30 bg-primary/5">
            <div className="flex items-start gap-3">
              <Wrench className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-headline mb-2">Autorisierter Vertriebs- & Servicepartner</h3>
                <p className="text-foreground/90 leading-relaxed mb-3">{content.dealerInfo.text}</p>
                {content.dealerInfo.linkUrl && (
                  <a
                    href={content.dealerInfo.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-medium underline underline-offset-2"
                  >
                    {content.dealerInfo.linkText || content.dealerInfo.linkUrl}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* FAQ */}
      {faqList.length > 0 && (
        <section className="section-container py-10 md:py-14 border-t border-border">
          <div className="max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-headline mb-6">
              Häufige Fragen zur {machine.brand} {machine.model}
            </h2>
            <div className="space-y-3">
              {faqList.map((f, idx) => (
                <details key={idx} className="group rounded-lg border border-border bg-card p-4 open:bg-muted/40">
                  <summary className="cursor-pointer font-semibold text-headline text-sm md:text-base list-none flex items-start justify-between gap-3">
                    <span>{f.q}</span>
                    <span className="text-primary text-xl leading-none group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="text-sm text-foreground/80 mt-3 leading-relaxed whitespace-pre-line">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Manufacturer info (Hercu / Original-Hersteller hinter Whitelabel) */}
      {(content as any).manufacturer && (
        <section className="section-container py-8 md:py-12 border-t border-border">
          <Card className="p-6 border-border bg-muted/30 max-w-4xl">
            <div className="flex items-start gap-3">
              <Package className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Original-Hersteller</p>
                <h3 className="text-lg font-bold text-headline mb-2">
                  {(content as any).manufacturer.name}
                </h3>
                <p className="text-foreground/90 leading-relaxed mb-3 whitespace-pre-line">
                  {(content as any).manufacturer.text}
                </p>
                {(content as any).manufacturer.linkUrl && (
                  <a
                    href={(content as any).manufacturer.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-medium underline underline-offset-2"
                  >
                    {(content as any).manufacturer.linkText || "Zur Herstellerseite"}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* CTA bottom */}
      <section className="bg-primary py-12">
        <div className="section-container text-center">
          <h2 className="text-2xl font-bold text-primary-foreground mb-3">
            Interesse am {machine.brand} {machine.model}?
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
            Wir beraten Dich persönlich – einfach Kaufanfrage stellen oder direkt anrufen.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setInquiryOpen(true)}>
              <Mail className="mr-2 h-5 w-5" /> Kaufanfrage senden
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <a href="tel:021514179904">
                <Phone className="mr-2 h-5 w-5" /> 02151 417 99 04
              </a>
            </Button>
          </div>
        </div>
      </section>


      <NewMachineInquiryModal
        open={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        machine={{
          brand: machine.brand,
          model: machine.model,
          name: machine.name,
          slug: slug!,
          category: machine.category,
          priceLabel,
          image: images[0] || absoluteImages[0] || null,
          configOptions: options.length > 0 ? options.map((o) => ({ name: o.name, price: o.price, note: o.note })) : undefined,
          initialConfig: selectedConfig || undefined,
        }}
      />

    </Layout>
  );
}
