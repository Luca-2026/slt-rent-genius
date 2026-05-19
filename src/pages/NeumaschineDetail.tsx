import { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, ArrowRight, Phone, MapPin, Shield, Wrench, Truck, CheckCircle2,
  Package, Tag, Mail, Clock,
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

export default function NeumaschineDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [activeImage, setActiveImage] = useState(0);

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

  const title = `${machine.brand} ${machine.model} kaufen | Neumaschine – SLT Rental`;
  const description = machine.short_description ||
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
          handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 5, unitCode: "DAY" },
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
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: priceGross.toFixed(2),
          priceCurrency: "EUR",
          valueAddedTaxIncluded: true,
        },
        priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
        itemCondition: "https://schema.org/NewCondition",
        availability: "https://schema.org/PreOrder",
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

  const inquiryHref = `/verkauf#kaufanfrage`;

  return (
    <Layout>
      <SEO
        title={title}
        description={description}
        keywords={seoKeywords.length > 0 ? seoKeywords.join(", ") : undefined}
        canonical={canonicalPath}
        ogImage={absoluteImages[0]}
        ogType="product"
        jsonLd={[productJsonLd, breadcrumbJsonLd]}
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
          <div>
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
              {machine.article_number && (
                <span className="inline-flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" /> Art.-Nr. {machine.article_number}
                </span>
              )}
              {machine.gtin && <span>GTIN {machine.gtin}</span>}
              {showroomNames && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Besichtigung in {showroomNames}
                </span>
              )}
            </div>

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
                {priceNet && (
                  <p className="text-sm text-muted-foreground mt-1">
                    entspricht {formatPriceGross(priceNet, false)} netto
                  </p>
                )}
                {machine.slug === "baumax-anhaengerkupplung-kde550" && priceGross && (
                  <div className="mt-3 p-3 rounded-lg bg-accent/10 border border-accent/30">
                    <p className="text-sm font-semibold text-accent-foreground">
                      10 % Vorbestellerrabatt: {formatPriceGross(priceGross * 0.9, false)} brutto
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Gültig bei Vorbestellung mit 30 % Anzahlung
                    </p>
                  </div>
                )}
                {content.leadTime && (
                  <p className="text-xs text-muted-foreground mt-3 inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {content.leadTime}
                  </p>
                )}
                {machine.slug === "baumax-anhaengerkupplung-kde550" && !content.leadTime && (
                  <p className="text-xs text-muted-foreground mt-3 inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Lieferbar Ende Juni 2026
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Button size="lg" className="w-full sm:flex-1" asChild>
                <Link to={inquiryHref}>
                  Anfrage senden <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
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
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
              <Link to={inquiryHref}>
                <Mail className="mr-2 h-5 w-5" /> Kaufanfrage senden
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <a href="tel:021514179904">
                <Phone className="mr-2 h-5 w-5" /> 02151 417 99 04
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
