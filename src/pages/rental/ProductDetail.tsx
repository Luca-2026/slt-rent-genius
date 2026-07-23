import { Navigate, useParams, Link, useNavigate } from "react-router-dom";
import { categoryContent as seoCategoryContent } from "@/components/rental/ProductSEOContent";
import { getProductSEO } from "@/data/productSEOData";
import { useMemo, useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { SEO, SLT_LOCATION_JSONLD } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslatedProduct, useTranslatedProducts, useTranslatedCategory } from "@/hooks/useTranslatedProduct";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { ArrowLeft, ChevronLeft, ChevronRight, Package, MapPin, Phone, Mail, CheckCircle, Clock, Smartphone, Lock, Key, Play, Info, FileDown, ShieldCheck, ExternalLink, Car, HardHat, Sparkles, Truck } from "lucide-react";
import {
  getLocationById,
  getCategoryById,
  getProductById,
  getProductsForLocationCategory,
  getAllProductsForLocation,
  getCompatibleAccessories,
  type Product,
} from "@/data/rentalData";
import { useManagedProductsVersion } from "@/data/managedProductsCache";
import { ProductBookingDialog } from "@/components/rental/ProductBookingDialog";
import { AnhaengersteckerAnleitung } from "@/components/rental/AnhaengersteckerAnleitung";
import { BaumaschinenanhaengerBundleHint } from "@/components/rental/BaumaschinenanhaengerBundleHint";
import { DeliveryCalculatorCompact } from "@/components/products/DeliveryCalculatorCompact";
import { PurchaseInquiryBanner } from "@/components/rental/PurchaseInquiryBanner";
import { SalesPagesBanner } from "@/components/rental/SalesPagesBanner";
import { ServiceBanner } from "@/components/rental/ServiceBanner";
import { StandortVerfuegbarkeit } from "@/components/rental/StandortVerfuegbarkeit";
import { LocalCategoryContentBlock } from "@/components/rental/LocalCategoryContentBlock";
import { ProductSEOContent } from "@/components/rental/ProductSEOContent";
import { HalteverbotsSeoSection } from "@/components/rental/HalteverbotsSeoSection";
import { getProductAvailability } from "@/lib/productAvailability";
import { getLocalCategoryContent } from "@/data/localCategoryContent";
import { moebelProductInfo, getMoebelInfoKey } from "@/data/moebelProductInfo";
import { useTranslation } from "react-i18next";
import { REAL_LOCATION_REVIEWS } from "@/data/realGoogleReviews";

const LEGACY_PRODUCT_ID_REDIRECTS: Record<string, string> = {
  "bonn-stampfer-gs72": "/mieten/bonn/verdichtung/stampfer-gs72-xh/",
  "bonn-ruettelplatte-vp16": "/mieten/bonn/verdichtung/ruettelplatte-vp16-44/",
  "bonn-ruettelplatte-vp25": "/mieten/bonn/verdichtung/ruettelplatte-vp25-50/",
  "bonn-ruettelplatte-hvp30": "/mieten/bonn/verdichtung/ruettelplatte-hvp30-50/",
  "bonn-ruettelplatte-hvp38": "/mieten/bonn/verdichtung/ruettelplatte-hvp38-60/",
  "bonn-ruettelplatte-hvp50": "/mieten/bonn/verdichtung/ruettelplatte-hvp50-60/",
  "bonn-grabenwalze-bmp8500": "/mieten/bonn/verdichtung/grabenwalze-bmp8500/",
};

export default function ProductDetail() {
  const { t } = useTranslation();
  const { locationId, categoryId, productId } = useParams<{
    locationId: string;
    categoryId: string;
    productId: string;
  }>();
  const navigate = useNavigate();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const cmsVersion = useManagedProductsVersion();


  const location = useMemo(() => getLocationById(locationId || ""), [locationId]);
  const rawCategory = useMemo(() => getCategoryById(categoryId || ""), [categoryId]);
  const category = useTranslatedCategory(rawCategory) || rawCategory;
  const rawProduct = useMemo(() => {
    // Prefer a location-specific variant first — it carries the real local
    // Rentware code (e.g. Bonn event items), even if it lives in a different
    // category than the canonical/global product.
    if (location) {
      const allLocationProducts = getAllProductsForLocation(location.id);
      const localVariant = allLocationProducts.find((p) => p.id === `${location.id}-${productId}`);
      if (localVariant) return localVariant;
    }
    if (location && categoryId) {
      const locationProducts = getProductsForLocationCategory(location.id, categoryId);
      const found = locationProducts.find((p) => p.id === productId);
      if (found) return found;
      const localVariant = locationProducts.find((p) => p.id === `${location.id}-${productId}`);
      if (localVariant) return localVariant;
    }
    if (location) {
      const allLocationProducts = getAllProductsForLocation(location.id);
      const found = allLocationProducts.find((p) => p.id === productId);
      if (found) return found;
    }
    return getProductById(productId || "");
  }, [productId, location, categoryId, cmsVersion]);
  const product = useTranslatedProduct(rawProduct);

  const rawRelatedProducts = useMemo(() => {
    if (!location || !categoryId || !rawProduct) return [];
    const allProducts = getProductsForLocationCategory(location.id, categoryId);
    const candidates = allProducts.filter((p) => p.id !== rawProduct.id && !p.compatibleMachines);

    // Detect equipment subtype from category field or name keywords so a Dumper page shows other Dumpers,
    // a Bagger page shows other Bagger, etc.
    const TYPE_KEYWORDS: Array<{ key: string; re: RegExp }> = [
      { key: "dumper", re: /dumper/i },
      { key: "bagger", re: /bagger|minibagger/i },
      { key: "radlader", re: /radlader/i },
      { key: "scherenbuehne", re: /scherenarbeitsb|scherenb/i },
      { key: "gelenkteleskop", re: /gelenkteleskop/i },
      { key: "mastbuehne", re: /mastb|mastarbeitsb/i },
      { key: "anhaengerbuehne", re: /anh(ä|ae)ngerb|anh(ä|ae)nger.?arbeitsb/i },
      { key: "ruettelplatte", re: /r(ü|ue)ttelplatte|vibrationsplatte/i },
      { key: "stampfer", re: /stampfer/i },
      { key: "walze", re: /walze/i },
      { key: "kompressor", re: /kompressor/i },
      { key: "erdrakete", re: /erdrakete/i },
      { key: "fahrmatten", re: /fahrmatte|bodenschutz/i },
      { key: "loeffel", re: /l(ö|oe)ffel|schaufel/i },
    ];
    const detect = (p: { category?: string; name?: string; modelName?: string }): string | undefined => {
      if (p.category) return p.category;
      const hay = `${p.name ?? ""} ${p.modelName ?? ""}`;
      return TYPE_KEYWORDS.find((t) => t.re.test(hay))?.key;
    };
    const ownType = detect(rawProduct);
    if (!ownType) return candidates.slice(0, 4);
    const sameType = candidates.filter((p) => detect(p) === ownType);
    const others = candidates.filter((p) => detect(p) !== ownType);
    return [...sameType, ...others].slice(0, 4);
  }, [location, categoryId, rawProduct]);
  const relatedProducts = useTranslatedProducts(rawRelatedProducts);

  // Get compatible accessories for excavators / earthmoving machines
  const rawAccessories = useMemo(() => {
    if (!location || !rawProduct || categoryId !== "erdbewegung") return [];
    return getCompatibleAccessories(rawProduct.id, location.id);
  }, [location, rawProduct, categoryId]);
  const accessories = useTranslatedProducts(rawAccessories);

  const images = useMemo(() => {
    if (!product) return [];
    return product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];
  }, [product]);

  // Get product-specific SEO data from Excel, then let CMS overrides (seoFaqs, seoMetaDescription) win
  const productSEO = useMemo(() => {
    if (!product) return undefined;
    const base = getProductSEO(product.id, location?.id);
    const cmsFaqs = product.seoFaqs?.length
      ? product.seoFaqs.map((f) => ({ q: f.question, a: f.answer }))
      : null;
    if (!cmsFaqs && !product.seoMetaDescription) return base;
    return {
      ...(base ?? {}),
      ...(cmsFaqs ? { faqs: cmsFaqs } : {}),
      ...(product.seoMetaDescription ? { metaDescription: product.seoMetaDescription } : {}),
    } as typeof base;
  }, [product, location]);


  const displaySpecifications = useMemo(() => {
    if (!product?.specifications || !location) return product?.specifications;

    const isHalteverbot = product.id === "halteverbotsschilder-set" || product.id === "bonn-halteverbotsschilder-set";
    if (!isHalteverbot) return product.specifications;

    return {
      ...product.specifications,
      Hinweis: `Genehmigungs-Kopie an ${location.email} senden`,
    };
  }, [product, location]);

  // Suggested products for 404 fallback (must be at top level for hooks rules)
  const notFoundSuggestions = useMemo(() => {
    if (product) return []; // only needed when product not found
    if (!locationId || !categoryId) return [];
    const loc = getLocationById(locationId);
    if (!loc) return [];
    return getProductsForLocationCategory(loc.id, categoryId).slice(0, 6);
  }, [locationId, categoryId, product]);

  // Helper: replace multi-location strings in Excel SEO data with current location only
  const localizeText = useMemo(() => {
    if (!location) return (text: string) => text;
    const name = location.name;
    const locationEmail = location.email;
    return (text: string): string => {
      let result = text
        .replace(/Genehmigungs-Kopie an die jeweilige Standort-E-Mail senden \(krefeld@\/bonn@\/muelheim@slt-rental\.de\)/gi, `Genehmigungs-Kopie an ${locationEmail} senden`)
        .replace(/Genehmigungs-Kopie an mieten@slt-rental\.de/gi, `Genehmigungs-Kopie an ${locationEmail}`)
        .replace(/Genehmigungs-Kopie an (?:krefeld|bonn|muelheim)@slt-rental\.de/gi, `Genehmigungs-Kopie an ${locationEmail}`)
        .replace(/an mieten@slt-rental\.de gesendet/gi, `an ${locationEmail} gesendet`)
        .replace(/an (?:krefeld|bonn|muelheim)@slt-rental\.de gesendet/gi, `an ${locationEmail} gesendet`)
        // First replace multi-location combinations
        .replace(/Bonn\s*[&,]\s*Krefeld\s*[&,]\s*Mülheim(?:\s*an\s*der\s*Ruhr)?/gi, name)
        .replace(/Krefeld\s*[&,]\s*Bonn\s*[&,]\s*Mülheim(?:\s*an\s*der\s*Ruhr)?/gi, name)
        .replace(/Mülheim(?:\s*an\s*der\s*Ruhr)?\s*[&,]\s*Bonn\s*[&,]\s*Krefeld/gi, name)
        .replace(/Bonn\s*[&,]\s*Krefeld/gi, name)
        .replace(/Krefeld\s*[&,]\s*Bonn/gi, name)
        .replace(/Bonn\s*[&,]\s*Mülheim(?:\s*an\s*der\s*Ruhr)?/gi, name)
        .replace(/Krefeld\s*[&,]\s*Mülheim(?:\s*an\s*der\s*Ruhr)?/gi, name)
        .replace(/Mülheim(?:\s*an\s*der\s*Ruhr)?\s*[&,]\s*Krefeld/gi, name)
        .replace(/Mülheim(?:\s*an\s*der\s*Ruhr)?\s*[&,]\s*Bonn/gi, name);
      // Then replace standalone location names (but only as whole words)
      if (name !== "Krefeld") result = result.replace(/\bKrefeld\b/g, name);
      if (name !== "Bonn") result = result.replace(/\bBonn\b/g, name);
      if (name !== "Mülheim" && name !== "Mülheim an der Ruhr") {
        result = result.replace(/\bMülheim(?:\s*an\s*der\s*Ruhr)?\b/g, name);
      }
      return result;
    };
  }, [location]);

  useEffect(() => {
    if (product && location && category) {

      // City name mapping for SEO
      const cityNameMap: Record<string, string> = {
        krefeld: "Krefeld",
        bonn: "Bonn",
        muelheim: "Mülheim an der Ruhr",
      };
      const cityName = cityNameMap[location.id] || location.name;

      // SEO: Title - "{name} mieten in {Stadtname} | SLT Rental"
      const genericName = product.name;
      const titleBase = `${genericName} mieten in ${cityName}`;
      let seoTitle: string;
      if (titleBase.length + ' | SLT Rental'.length <= 60) {
        seoTitle = `${titleBase} | SLT Rental`;
      } else {
        seoTitle = titleBase;
      }
      document.title = seoTitle;

      // SEO: Meta description - CMS override wins, else generated
      const modelInfo = product.modelName ? ` ${product.modelName}` : '';
      let descText: string;
      if (product.seoMetaDescription && product.seoMetaDescription.trim()) {
        descText = product.seoMetaDescription.trim();
      } else if (product.description) {
        const localizedDesc = localizeText(product.description);
        const descSnippet = localizedDesc.length > 80 
          ? localizedDesc.substring(0, 80).replace(/\s+\S*$/, '') 
          : localizedDesc;
        const candidate = `${genericName} mieten in ${cityName} bei SLT Rental.${modelInfo ? ` ${descSnippet}` : ` ${descSnippet}`}. Tiefpreisgarantie, flexible Mietzeiten, Lieferung möglich.`;
        descText = candidate.length <= 155 ? candidate : candidate.substring(0, 152) + "...";
      } else {
        const candidate = `${genericName} mieten in ${cityName} bei SLT Rental.${modelInfo} Tiefpreisgarantie, flexible Mietzeiten, Lieferung möglich.`;
        descText = candidate.length <= 155 ? candidate : candidate.substring(0, 152) + "...";
      }

      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", descText);
      } else {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        metaDescription.setAttribute("content", descText);
        document.head.appendChild(metaDescription);
      }

      // (Etappe 5b.2) primaryKeywords/<meta name="keywords"> entfernt – von Google ignoriert.

      // SEO: Canonical URL
      const canonicalUrl = `https://www.slt-rental.de/mieten/${location.id}/${categoryId}/${product.id}/`;
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (canonicalLink) {
        canonicalLink.href = canonicalUrl;
      } else {
        canonicalLink = document.createElement("link");
        canonicalLink.rel = "canonical";
        canonicalLink.href = canonicalUrl;
        document.head.appendChild(canonicalLink);
      }

      // SEO: Open Graph tags
      const ogTags: Record<string, string> = {
        "og:title": seoTitle,
        "og:description": descText,
        "og:type": "product",
        "og:url": canonicalUrl,
        "og:site_name": "SLT Rental",
      };
      if (images.length > 0) {
        const imgUrl = images[0].startsWith("http") ? images[0] : `https://www.slt-rental.de${images[0].startsWith("/") ? "" : "/"}${images[0]}`;
        ogTags["og:image"] = imgUrl;
      }
      const createdOgTags: HTMLMetaElement[] = [];
      for (const [prop, content] of Object.entries(ogTags)) {
        let tag = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement;
        if (!tag) {
          tag = document.createElement("meta");
          tag.setAttribute("property", prop);
          document.head.appendChild(tag);
          createdOgTags.push(tag);
        }
        tag.setAttribute("content", content);
      }

      const jsonLd: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.modelName ? `${product.name} ${product.modelName}` : product.name,
        "description": localizeText(product.description || ""),
        "image": images.length > 0 ? (images[0].startsWith("http") ? images[0] : `https://www.slt-rental.de${images[0].startsWith("/") ? "" : "/"}${images[0]}`) : undefined,
        "url": canonicalUrl,
        "category": category.title,
        "sku": product.id,
        ...((() => {
          // Monthly offer (e.g. Winterdienst-Set) — has priority because it's a concrete price
          if (product.pricePerMonth) {
            const numeric = parseFloat(product.pricePerMonth.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));
            if (!isFinite(numeric) || numeric <= 0) return {};
            const validUntil = new Date();
            validUntil.setFullYear(validUntil.getFullYear() + 1);
            const availability = getProductAvailability(product, location.id, { categoryId });
            return {
              offers: {
                "@type": "Offer",
                "availability": availability.schemaAvailability,
                "url": canonicalUrl,
                "priceCurrency": "EUR",
                "price": numeric.toFixed(2),
                "priceValidUntil": validUntil.toISOString().slice(0, 10),
                "seller": { "@id": `https://www.slt-rental.de/mieten/${location.id}#localbusiness` },
                "areaServed": { "@type": "City", "name": location.name },
                "eligibleQuantity": product.minRentalMonths
                  ? {
                      "@type": "QuantitativeValue",
                      "value": product.minRentalMonths,
                      "unitCode": "MON",
                    }
                  : undefined,
                "priceSpecification": {
                  "@type": "UnitPriceSpecification",
                  "price": numeric.toFixed(2),
                  "priceCurrency": "EUR",
                  "unitCode": "MON",
                  "referenceQuantity": {
                    "@type": "QuantitativeValue",
                    "value": 1,
                    "unitCode": "MON",
                  },
                  "valueAddedTaxIncluded": true,
                },
              },
            };
          }
          if (typeof productSEO?.dailyPriceFrom === "number") {
            const priceFrom = productSEO.dailyPriceFrom as number;
            const validUntil = new Date();
            validUntil.setFullYear(validUntil.getFullYear() + 1);
            const availability = getProductAvailability(product, location.id, { categoryId });
            return {
              offers: {
                "@type": "Offer",
                "availability": availability.schemaAvailability,
                ...(availability.deliveryLeadTime
                  ? {
                      "deliveryLeadTime": {
                        "@type": "QuantitativeValue",
                        "value": 24,
                        "unitCode": "HUR",
                      },
                    }
                  : {}),
                "url": canonicalUrl,
                "priceCurrency": "EUR",
                "price": priceFrom.toFixed(2),
                "priceValidUntil": validUntil.toISOString().slice(0, 10),
                "seller": { "@id": `https://www.slt-rental.de/mieten/${location.id}#localbusiness` },
                "areaServed": { "@type": "City", "name": location.name },
                "priceSpecification": {
                  "@type": "UnitPriceSpecification",
                  "price": priceFrom.toFixed(2),
                  "priceCurrency": "EUR",
                  "unitCode": "DAY",
                  "referenceQuantity": {
                    "@type": "QuantitativeValue",
                    "value": 1,
                    "unitCode": "DAY",
                  },
                },
              },
            };
          }
          return {};
        })()),

      };
      // Add brand + model if modelName exists
      if (product.modelName) {
        const specs = product.specifications || {};
        // Skip generic prefixes like "Special-Set:" when deriving the brand
        const cleanedModel = product.modelName.replace(/^(Special-Set|Set|Paket|Bundle)\s*[:\-–]\s*/i, "");
        const brand = specs["Hersteller"] || specs["Marke"] || cleanedModel.split(" ")[0] || "SLT Rental";
        jsonLd["brand"] = { "@type": "Brand", "name": brand };
        jsonLd["model"] = cleanedModel;
      } else {
        jsonLd["brand"] = { "@type": "Brand", "name": "SLT Rental" };
      }

      // AggregateRating + Review from real Google Reviews snapshot per location
      const locRating = REAL_LOCATION_REVIEWS[locationId];
      if (locRating) {
        jsonLd["aggregateRating"] = {
          "@type": "AggregateRating",
          "ratingValue": locRating.ratingValue,
          "reviewCount": locRating.reviewCount,
          "bestRating": "5",
          "worstRating": "1",
        };
        if (locRating.reviews?.length) {
          jsonLd["review"] = locRating.reviews.map((r) => ({
            "@type": "Review",
            "author": { "@type": "Person", "name": r.author },
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": String(r.rating),
              "bestRating": "5",
              "worstRating": "1",
            },
            "reviewBody": r.text,
            "datePublished": r.datePublished,
          }));
        }
      }

      const jsonLdArray: Record<string, unknown>[] = [jsonLd];

      // LocalBusiness JSON-LD for the active location (links Product → verified GBP via sameAs)
      const localBusiness = { ...SLT_LOCATION_JSONLD(location.id) } as Record<string, unknown>;
      if (locRating) {
        localBusiness["aggregateRating"] = {
          "@type": "AggregateRating",
          "ratingValue": locRating.ratingValue,
          "reviewCount": locRating.reviewCount,
          "bestRating": "5",
          "worstRating": "1",
        };
      }
      jsonLdArray.push(localBusiness);

      // Also expose duplicate types removal for LocalBusiness below
      // (kept here so dupTypes list stays in one place)

      // FAQ JSON-LD: CMS-FAQs gewinnen, sonst produktspezifische, sonst kategoriebasierte
      const cmsFaqs = product.seoFaqs?.length
        ? product.seoFaqs.map((f) => ({ q: f.question, a: f.answer }))
        : null;
      const productFaqs = cmsFaqs ?? productSEO?.faqs;
      const categoryFaqs = categoryId ? seoCategoryContent[categoryId]?.faqs : null;
      const localContent = getLocalCategoryContent(locationId, categoryId);
      const localFaqs = localContent?.faqs ?? [];
      const baseFaqs = productFaqs?.length ? productFaqs : (categoryFaqs ?? []);
      const faqItems = [...baseFaqs, ...localFaqs];

      if (faqItems.length) {
        jsonLdArray.push({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqItems.map(f => ({
            "@type": "Question",
            "name": localizeText(f.q),
            "acceptedAnswer": { "@type": "Answer", "text": localizeText(f.a) },
          })),
        });
      }

      // Breadcrumb JSON-LD
      jsonLdArray.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Startseite", "item": "https://www.slt-rental.de/" },
          { "@type": "ListItem", "position": 2, "name": `Mieten ${location.name}`, "item": `https://www.slt-rental.de/mieten/${location.id}/` },
          { "@type": "ListItem", "position": 3, "name": category.title, "item": `https://www.slt-rental.de/mieten/${location.id}/${categoryId}/` },
          { "@type": "ListItem", "position": 4, "name": product.name, "item": canonicalUrl },
        ],
      });

      // Remove any prerendered duplicates of the same JSON-LD types so Google
      // doesn't see two FAQPage / Product / BreadcrumbList entries on the page.
      const dupTypes = ['"FAQPage"', '"Product"', '"BreadcrumbList"', '"LocalBusiness"'];
      document.head
        .querySelectorAll('script[type="application/ld+json"]:not([data-product-jsonld])')
        .forEach((el) => {
          const txt = el.textContent || "";
          if (dupTypes.some((t) => txt.includes(t))) el.remove();
        });

      let scriptTag = document.querySelector('script[data-product-jsonld]') as HTMLScriptElement;
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.type = "application/ld+json";
        scriptTag.setAttribute("data-product-jsonld", "true");
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLdArray);

      return () => {
        document.title = "SLT Rental";
        scriptTag?.remove();
        canonicalLink?.remove();
        document.querySelector('meta[name="keywords"]')?.remove();
        createdOgTags.forEach(t => t.remove());
      };
    }
  }, [product, location, category, categoryId, images, productSEO]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (images.length <= 1) return;
      if (e.key === "ArrowLeft") setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      else if (e.key === "ArrowRight") setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length]);

  if (!product && productId && LEGACY_PRODUCT_ID_REDIRECTS[productId]) {
    return <Navigate to={LEGACY_PRODUCT_ID_REDIRECTS[productId]} replace />;
  }

  if (!location || !category || !product) {
    // Derive category/location info from URL params for navigation links
    const categoryBackLink = locationId && categoryId ? `/mieten/${locationId}/${categoryId}` : locationId ? `/mieten/${locationId}` : "/mieten";
    const locationBackLink = locationId ? `/mieten/${locationId}` : "/mieten";
    const cityNameMap: Record<string, string> = { krefeld: "Krefeld", bonn: "Bonn", muelheim: "Mülheim an der Ruhr" };
    const cityName = locationId ? (cityNameMap[locationId] || locationId) : "";

    const suggestedProducts = notFoundSuggestions;

    return (
      <Layout>
        <SEO
          title="Produkt nicht gefunden | SLT Rental"
          description="Dieses Produkt ist aktuell nicht verfügbar. Schauen Sie sich unsere aktuellen Mietartikel in Ihrer Region an."
          noIndex={true}
        />
        <div className="section-container py-20">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-headline mb-4">Produkt nicht gefunden</h1>
            <p className="text-muted-foreground mb-6">
              Dieses Produkt ist aktuell nicht verfügbar oder wurde umbenannt. 
              Schauen Sie sich unsere aktuellen Mietartikel{cityName ? ` in ${cityName}` : ""} an.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {categoryId && locationId && (
                <Button asChild>
                  <Link to={categoryBackLink}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Zurück zur Kategorie
                  </Link>
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link to={locationBackLink}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Standort-Übersicht
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/mieten">Alle Standorte</Link>
              </Button>
            </div>
          </div>

          {/* Suggested products from same category */}
          {suggestedProducts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-headline mb-4">Vielleicht interessant für Sie:</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {suggestedProducts.map((p) => (
                  <Link
                    key={p.id}
                    to={`/mieten/${locationId}/${categoryId}/${p.id}`}
                    className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    {p.image && (
                      <img src={p.image} alt={p.name} className="w-full h-32 object-contain mb-2" loading="lazy" />
                    )}
                    <p className="text-sm font-medium text-headline line-clamp-2">{p.name}</p>
                    {p.pricePerDay && <p className="text-xs text-primary mt-1">{p.pricePerDay}</p>}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  const handlePrevImage = () => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const handleNextImage = () => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  const videoUrls = product.videoUrls && product.videoUrls.length > 0
    ? product.videoUrls
    : product.videoUrl ? [product.videoUrl] : [];

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b border-border">
        <div className="section-container py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/mieten">{t("nav.locations")}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/mieten/${location.id}`}>{location.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/mieten/${location.id}/${category.id}`}>{category.title}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-[180px] truncate">{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-6 md:py-8 lg:py-10">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

            {/* ── LEFT / MAIN COLUMN ── */}
            <div className="md:col-span-2 space-y-5">

              {/* Image Gallery */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="relative bg-muted aspect-[4/3] md:aspect-[16/10]">
                  {images.length > 0 ? (
                    <>
                      <img
                        src={images[currentImageIndex]}
                        alt={`${product.name} – ${currentImageIndex === 0 ? 'Produktbild' : `Ansicht ${currentImageIndex + 1}`} | SLT Rental ${location.name}`}
                        className="w-full h-full object-contain"
                      />
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevImage}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background rounded-full p-2 shadow-md transition-all"
                            aria-label={t("rental.previousImage")}
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={handleNextImage}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background rounded-full p-2 shadow-md transition-all"
                            aria-label={t("rental.nextImage")}
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                          <Badge className="absolute top-3 left-3 bg-background/90 text-foreground text-xs">
                            {currentImageIndex + 1} / {images.length}
                          </Badge>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-20 w-20 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="px-4 py-3 bg-muted/30 border-t border-border">
                    <div className="flex gap-2 overflow-x-auto">
                      {images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all ${
                            index === currentImageIndex
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-transparent hover:border-muted-foreground/30"
                          }`}
                        >
                          <img src={img} alt={`${product.name} – Vorschau ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── MOBILE ONLY: Booking Card inline ── */}
              <div className="md:hidden">
                <MobileBookingCard
                  product={product}
                  location={location}
                  categoryId={categoryId}
                  onBook={() => setShowBookingDialog(true)}
                  dailyPriceFrom={productSEO?.dailyPriceFrom}
                  t={t}
                />
              </div>

              {/* Product Name + Description */}
              <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-headline leading-tight">
                    {product.name} mieten in {location.name}
                  </h1>
                  {product.modelName && (
                    <p className="text-sm text-muted-foreground font-medium mt-1">Modell: {product.modelName}</p>
                  )}
                  {product.pricePerMonth && (
                    <div className="mt-2">
                      <div className="inline-flex items-baseline gap-1 rounded-lg bg-accent/10 px-3 py-1.5 border border-accent/30">
                        <span className="text-xl font-bold text-accent">{product.pricePerMonth}<span className="text-accent">*</span></span>
                        <span className="text-sm font-medium text-accent/90">/ Monat</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 ml-1">
                        Inkl. 19 % USt.{product.minRentalMonths ? ` · Mindestbuchungszeit ${product.minRentalMonths} Monate` : ""} · zzgl. Maschinenbruchversicherung
                      </p>
                      <p className="text-[11px] leading-snug text-muted-foreground mt-1 ml-1">
                        *Unverbindlicher Ab-Preis. Tatsächlicher Preis abhängig von Standort, Mietdauer, Saison und Auslastung – tagesaktuell im Buchungsprozess.
                      </p>
                    </div>
                  )}
                  {typeof productSEO?.dailyPriceFrom === "number" && !getMoebelInfoKey(product.id) && !product.pricePerMonth && (
                    <div className="mt-2">
                      <div className="inline-flex items-baseline gap-1 rounded-lg bg-accent/10 px-3 py-1.5 border border-accent/30">
                        <span className="text-xl font-bold text-accent">ab {Number.isInteger(productSEO.dailyPriceFrom) ? productSEO.dailyPriceFrom : productSEO.dailyPriceFrom.toFixed(2).replace(".", ",")} €<span className="text-accent">*</span></span>
                        <span className="text-sm font-medium text-accent/90">/ Tag</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 ml-1">Brutto inkl. 19 % USt.</p>
                      <p className="text-[11px] leading-snug text-muted-foreground mt-1 ml-1">
                        *Unverbindlicher Ab-Preis, gerechnet auf Monatsmiete. Tatsächlicher Preis abhängig von Standort, Mietdauer, Saison und Auslastung – tagesaktuell im Buchungsprozess.
                      </p>
                    </div>
                  )}
                  {(() => {
                    const moebelKey = getMoebelInfoKey(product.id);
                    const locKey = location.id as "krefeld" | "bonn" | "muelheim";
                    const info = moebelKey ? moebelProductInfo[moebelKey]?.[locKey] : null;
                    if (!info) return null;
                    return (
                      <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                        <p className="text-sm font-semibold text-headline">
                          Mietpreis: <span className="text-primary">{info.priceHint.perDay}</span>
                          <span className="text-muted-foreground font-normal"> · </span>
                          <span className="text-primary">{info.priceHint.perWeekend}</span>
                        </p>
                        {info.priceHint.note && (
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{info.priceHint.note}</p>
                        )}
                      </div>
                    );
                  })()}
                  {product.description && (() => {
                    const isWeinsberg = product.id === "weinsberg-caraone-480-qdk";
                    const cityNameMap: Record<string, string> = { krefeld: "Krefeld", bonn: "Bonn", muelheim: "Mülheim an der Ruhr" };
                    const cityName = cityNameMap[location.id] || location.name;
                    const desc = isWeinsberg
                      ? product.description.replace(
                          /Auf Anfrage in Krefeld,\s*Bonn und Mülheim an der Ruhr\./,
                          `Jetzt zum besten Preis in ${cityName} mieten – einfach auf „Jetzt mieten" klicken und die Anfrage ausfüllen.`
                        )
                      : product.description;
                    return (
                      <p className="text-base text-muted-foreground mt-2 leading-relaxed whitespace-pre-line">
                        {desc}
                      </p>
                    );
                  })()}
                  {(() => {
                    // Halteverbotsschilder: Preisinfo, Sorglos-Paket & Self-Service-Antragslinks
                    const isHalteverbot =
                      product.id === "halteverbotsschilder-set" ||
                      product.id === "bonn-halteverbotsschilder-set";
                    if (!isHalteverbot) return null;
                    const antragsLinks: Record<string, string> = {
                      bonn: "https://formulare.bonn.de/metaform/Form-Solutions/?2&releaseUserId=05314000-0001-0014&releaseID=586b68b7c2dceeaee3717387&releaseOrganizationID=05314000-0001&assistant=KFAS_33_006&storable=false&fileUrl=https%253A%252F%252Fformulare.bonn.de%252Fmetaform%252FForm-Solutions%252Fsid%252Fassistant%252F586b68b7c2dceeaee3717387%253Fconsent_type%253DNONE&oID=05314000-0001&consent_type=NONE&kdnr=05314000-0001",
                      krefeld: "https://formulare.krzn.de/metaform/Form-Solutions/?2&releaseUserId=05114000-0001-0024&releaseID=6214193c4d06d113b46c0f45&releaseOrganizationID=05114000-0001&assistant=KFAS_122814KR&storable=true&consentComplete=true&fileUrl=https%253A%252F%252Fformulare.krzn.de%252Fmetaform%252FForm-Solutions%252Fsid%252Fassistant%252F6214193c4d06d113b46c0f45%253FconsentComplete%253Dtrue&oID=05114000-0001&kdnr=05114000-0001",
                      muelheim: "https://service.wirtschaft.nrw/antrag/sondernutzungstr/",
                    };
                    const link = antragsLinks[location.id];
                    const cityNameMap: Record<string, string> = { krefeld: "Krefeld", bonn: "Bonn", muelheim: "Mülheim an der Ruhr" };
                    const cityName = cityNameMap[location.id] || location.name;
                    return (
                      <div className="mt-4 space-y-3">
                        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-1">Preis: ab 39 € für 1–10 Tage Mietzeit</p>
                            <p className="text-[11px] text-muted-foreground mb-1">Brutto inkl. 19% USt.</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Selbstabholer ab Standort Bonn, Krefeld oder Mülheim an der Ruhr.
                            </p>
                          </div>
                          <div className="border-t border-border pt-3">
                            <div className="flex items-start gap-2">
                              <Sparkles className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-foreground mb-1">
                                  Premium-Festpreis 199 € – Sorglos-Paket
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  Inkl. Aufstellung & Antrag bei der Stadt.* Exkl. Gebühren der Stadt je nach Aufstellzeit.
                                </p>
                                <p className="text-[11px] text-muted-foreground/80 mt-1">
                                  *Sorglos-Paket: Wir kümmern uns um Genehmigung, Aufstellung und Abbau.
                                </p>
                              </div>
                            </div>
                          </div>
                          {link && (
                            <div className="border-t border-border pt-3">
                              <p className="text-xs text-muted-foreground mb-2">
                                Du möchtest die Genehmigung selbst beantragen? Direkt zum Online-Antrag der Stadt {cityName}:
                              </p>
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Halteverbot in {cityName} beantragen (Self-Service)
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                  {(() => {
                    const moebelKey = getMoebelInfoKey(product.id);
                    const locKey = location.id as "krefeld" | "bonn" | "muelheim";
                    const info = moebelKey ? moebelProductInfo[moebelKey]?.[locKey] : null;
                    if (!info) return null;
                    return (
                      <div className="mt-3 space-y-2">
                        {info.seoParagraphs.map((p, i) => (
                          <p key={i} className="text-sm text-muted-foreground leading-relaxed">{p}</p>
                        ))}
                      </div>
                    );
                  })()}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {product.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Features */}
                {product.features && product.features.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <h2 className="text-base font-semibold text-headline mb-3">{t("rental.featuresTitle")}</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-foreground leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Detailed Description */}
                {product.detailedDescription && (() => {
                  const isWeinsberg = product.id === "weinsberg-caraone-480-qdk";
                  const cityNameMap: Record<string, string> = { krefeld: "Krefeld", bonn: "Bonn", muelheim: "Mülheim an der Ruhr" };
                  const cityName = cityNameMap[location.id] || location.name;
                  const detailed = isWeinsberg
                    ? product.detailedDescription.replace(/zum Mieten in NRW\?/, `zum Mieten in ${cityName}?`)
                    : product.detailedDescription;
                  return (
                    <div className="border-t border-border pt-4">
                      <h2 className="text-base font-semibold text-headline mb-2 flex items-center gap-2">
                        <Info className="h-4 w-4 text-primary flex-shrink-0" />
                        {t("rental.descriptionTitle")}
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {detailed}
                      </p>
                    </div>
                  );
                })()}

                {/* Bundle-Hinweis: Baumaschinenanhänger für Selbstabholer (Arbeitsbühnen/Erdbewegung) */}
                {(categoryId === "arbeitsbuehnen" || categoryId === "erdbewegung") && location && (
                  <div className="border-t border-border pt-4">
                    <BaumaschinenanhaengerBundleHint locationId={location.id} variant="compact" />
                  </div>
                )}
              </div>

              {/* Technical Specifications */}
              {displaySpecifications && Object.keys(displaySpecifications).length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h2 className="text-base font-semibold text-headline mb-4">{t("rental.technicalData")}</h2>
                  <div className="divide-y divide-border rounded-lg overflow-hidden border border-border">
                    {Object.entries(displaySpecifications).map(([key, value], i) => (
                      <div
                        key={key}
                        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 gap-1 ${
                          i % 2 === 0 ? "bg-muted/30" : "bg-background"
                        }`}
                      >
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {key}
                        </span>
                        <span className="text-sm font-medium text-foreground sm:text-right max-w-[60%]">
                          {value as string}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rental Notes (e.g. operating hours, fuel costs) */}
              {product.rentalNotes && product.rentalNotes.length > 0 && (
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-5">
                  <h2 className="text-base font-semibold text-headline mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4 text-accent flex-shrink-0" />
                    Mietkonditionen
                  </h2>
                  <ul className="space-y-2">
                    {product.rentalNotes.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {categoryId === "geschirr-glaeser-besteck" && product.id !== "spuelmaschine-frontlader" && product.id !== "bonn-spuelmaschine-gastro" && (() => {
                const spuelmaschine = rawRelatedProducts.find(p => 
                  p.id === "spuelmaschine-frontlader" || p.id === "bonn-spuelmaschine-gastro"
                ) || (location ? getProductsForLocationCategory(location.id, categoryId).find(p => 
                  p.id === "spuelmaschine-frontlader" || p.id === "bonn-spuelmaschine-gastro"
                ) : null);
                if (!spuelmaschine) return null;
                const spuelmaschineLink = `/mieten/${location!.id}/${categoryId}/${spuelmaschine.id}`;
                return (
                  <Link to={spuelmaschineLink} className="block">
                    <div className="flex items-center gap-4 bg-accent/10 border border-accent/30 rounded-xl p-4 hover:bg-accent/15 transition-colors group">
                      {spuelmaschine.image && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-background flex-shrink-0 border border-border">
                          <img src={spuelmaschine.image} alt={spuelmaschine.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="h-4 w-4 text-accent flex-shrink-0" />
                          <span className="text-xs font-semibold text-accent uppercase tracking-wide">Empfehlung</span>
                        </div>
                        <p className="font-semibold text-foreground group-hover:text-accent transition-colors">{spuelmaschine.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">Professionell reinigen statt Reinigungspauschale zahlen – ideal bei großen Mengen an Geschirr, Gläsern & Besteck.</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 group-hover:text-accent transition-colors" />
                    </div>
                  </Link>
                );
              })()}

              {/* Ratgeber-Hinweis für Geschirr-Kategorie */}
              {categoryId === "geschirr-glaeser-besteck" && (
                <Link to="/ratgeber/geschirr-mieten-hochzeit-mengen-checkliste" className="block">
                  <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4 hover:bg-primary/10 transition-colors group">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Info className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">Tipp aus unserem Ratgeber</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Mengen-Checkliste für 50, 100 und 150 Gäste – inkl. Glasbruch, Reinigung und Spülmaschine.
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-1.5 group-hover:underline">
                        → Zum Ratgeber: Geschirr mieten für die Hochzeit
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Videos */}
              {videoUrls.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                  {videoUrls.map((url, idx) => (
                    <div key={url}>
                      <h2 className="text-base font-semibold text-headline mb-3 flex items-center gap-2">
                        <Play className="h-4 w-4 text-primary flex-shrink-0" />
                        {videoUrls.length > 1 ? `${t("rental.productVideo")} ${idx + 1}` : t("rental.productVideo")}
                      </h2>
                      <div className="aspect-video rounded-lg overflow-hidden border border-border">
                        <iframe
                          src={url
                            .replace("https://youtu.be/", "https://www.youtube.com/embed/")
                            .replace("watch?v=", "embed/")
                            .replace("/shorts/", "/embed/")}
                          title={`${product.name} Video ${idx + 1}`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      {idx < videoUrls.length - 1 && <div className="border-t border-border pt-4" />}
                    </div>
                  ))}
                </div>
              )}

              {/* PDF Download */}
              {product.pdfUrl && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h2 className="text-base font-semibold text-headline mb-3 flex items-center gap-2">
                    <FileDown className="h-4 w-4 text-primary flex-shrink-0" />
                    {product.pdfUrl.toLowerCase().includes("datenblatt") ? t("rental.datasheet", "Datenblatt") : t("rental.operatingManual")}
                  </h2>
                  <a
                    href={product.pdfUrl}
                    download
                    className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg px-4 py-3 text-sm font-medium transition-colors border border-primary/20"
                  >
                    <FileDown className="h-4 w-4 flex-shrink-0" />
                    {product.pdfUrl.toLowerCase().includes("datenblatt") ? t("rental.downloadDatasheet", "Datenblatt herunterladen") : t("rental.downloadPdf")}
                  </a>
                </div>
              )}

              {/* External Manual Link */}
              {product.externalManualUrl && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h2 className="text-base font-semibold text-headline mb-3 flex items-center gap-2">
                    <FileDown className="h-4 w-4 text-primary flex-shrink-0" />
                    Bedienungsanleitung des Herstellers
                  </h2>
                  <a
                    href={product.externalManualUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg px-4 py-3 text-sm font-medium transition-colors border border-primary/20"
                  >
                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    Zur Kurzanleitung des Herstellers
                  </a>
                </div>
              )}

              {/* Stecker-Anleitung für Anhänger */}
              {categoryId === "anhaenger" && (
                <div className="mt-6">
                  <AnhaengersteckerAnleitung collapsed={true} showHeader={false} />
                </div>
              )}

              {/* Hilfe-Artikel für Anhänger */}
              {categoryId === "anhaenger" && (
                <div className="space-y-3">
                  {/* Ladungssicherung */}
                  <Link
                    to="/hilfe"
                    state={{ articleId: "anhaenger-beladen" }}
                    className="block"
                  >
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 hover:bg-primary/10 transition-colors group">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm">
                            {t("rental.trailerLoadGuide")}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {t("rental.trailerLoadGuideDesc")}
                          </p>
                          <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-1.5 group-hover:underline">
                            {t("rental.trailerLoadGuideLink")}
                            <ExternalLink className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  {/* Codesystem */}
                  <Link
                    to="/hilfe"
                    state={{ articleId: "anhaenger-codesystem" }}
                    className="block"
                  >
                    <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 hover:bg-accent/10 transition-colors group">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Smartphone className="h-4 w-4 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm">
                            {t("rental.trailerCodeGuide")}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {t("rental.trailerCodeGuideDesc")}
                          </p>
                          <span className="inline-flex items-center gap-1 text-xs text-accent font-medium mt-1.5 group-hover:underline">
                            {t("rental.trailerCodeGuideLink")}
                            <ExternalLink className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  {/* Führerschein & Zugfahrzeug */}
                  <Link
                    to="/hilfe"
                    state={{ articleId: "anhaenger-fuehrerschein" }}
                    className="block"
                  >
                    <div className="bg-secondary border border-border rounded-xl p-4 hover:bg-secondary/80 transition-colors group">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Car className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm">
                            {t("rental.trailerLicenseGuide")}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {t("rental.trailerLicenseGuideDesc")}
                          </p>
                          <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-1.5 group-hover:underline">
                            {t("rental.trailerLicenseGuideLink")}
                            <ExternalLink className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Hilfe-Artikel für Erdbewegung (nur Minibagger) */}
              {categoryId === "erdbewegung" && product?.category === "minibagger" && (
                <div className="space-y-3">
                  <Link
                    to="/hilfe"
                    state={{ articleId: "minibagger-einweisung" }}
                    className="block"
                  >
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 hover:bg-primary/10 transition-colors group">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <HardHat className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm">
                            {t("rental.excavatorSafetyGuide")}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {t("rental.excavatorSafetyGuideDesc")}
                          </p>
                          <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-1.5 group-hover:underline">
                            {t("rental.excavatorSafetyGuideLink")}
                            <ExternalLink className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Hilfe-Artikel für Hüpfburgen */}
              {categoryId === "huepfburgen" && (
                <div className="space-y-3">
                  <Link
                    to="/hilfe"
                    state={{ articleId: "huepfburg-aufbau-sicherheit" }}
                    className="block"
                  >
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 hover:bg-primary/10 transition-colors group">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm">
                            Hüpfburg sicher aufbauen & nutzen
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            Schritt-für-Schritt-Anleitung für Auf-/Abbau, Sicherheitsregeln und Checkliste nach DIN EN 14960.
                          </p>
                          <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-1.5 group-hover:underline">
                            Zur Sicherheitsanleitung
                            <ExternalLink className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Hilfe-Artikel für Rüttelplatten (Verdichtung) */}
              {categoryId === "verdichtung" && (product?.category === "ruettelplatte" || product?.category === "ruettelplatte-reversierbar") && (
                <div className="space-y-3">
                  <Link
                    to="/hilfe"
                    state={{ articleId: "ruettelplatte-bedienung" }}
                    className="block"
                  >
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 hover:bg-primary/10 transition-colors group">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm">
                            Rüttelplatte – Bedienung & Verdichtungstipps
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            Einsteiger-Anleitung: Sicher starten, richtig verdichten und Pflaster rütteln – Schritt für Schritt erklärt.
                          </p>
                          <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-1.5 group-hover:underline">
                            Zur Bedienungsanleitung
                            <ExternalLink className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Direkt-Kauf-Banner für Artikel mit eigener Verkaufsseite (Eventboden / Bodenschutzmatten) */}
              {(product.id === "zeltboden-anthrazit" ||
                product.id === "bonn-zeltboden-anthrazit" ||
                product.id === "bodenschutz-fahrmatten" ||
                product.id === "bonn-bodenschutz-fahrmatten") && (
                <SalesPagesBanner
                  title="Diese Matten können Sie auch kaufen"
                  intro="Recycelter Kunststoff-Mix, extrem robust, ineinander verhakbar – ideal für dauerhafte Event-, Zelt- und Fahrflächen. Neu oder als Top-Used-Angebot ab Lager."
                  entries={[
                    {
                      label: "SLT Eventboden – NEU",
                      price: "ab 19,99 € brutto / Stück · Mengenrabatt ab 21 Stück",
                      href: "/verkauf/neumaschinen/slt-easyfloor-eventboden",
                      badge: "Neu",
                    },
                    {
                      label: "SLT Eventboden – Top-Used (einmal genutzt)",
                      price: "ab 16 € brutto / Stück · solange Vorrat",
                      href: "/verkauf/gebrauchtmaschinen/slt-easyfloor-eventboden-used",
                      badge: "Used",
                    },
                  ]}
                />
              )}

              {/* Kaufanfrage-Banner (nicht für Wohnwagen, Camping & Nutzfahrzeuge) */}
              {categoryId !== "wohnwagen-camping" && categoryId !== "nutzfahrzeuge" && (
                <PurchaseInquiryBanner
                  productName={product.name}
                  locationName={location.name}
                  locationEmail={location.email}
                  categoryId={categoryId}
                />
              )}
              {/* Standort-Verfügbarkeitshinweis – produktspezifisch (rentwareCode-basierte Automatik) */}
              {locationId && (
                <StandortVerfuegbarkeit
                  locationId={locationId}
                  product={product}
                  categoryId={categoryId}
                  deviceLabel={product.id === "weinsberg-caraone-480-qdk" ? "Wohnwagen" : "Gerät"}
                />

              )}

              {/* Standortspezifischer Block (Hookline + Standort-Fakten).
                  FAQs werden weiter unten in den bestehenden FAQ-Block eingehängt. */}
              {locationId && categoryId && (
                <LocalCategoryContentBlock locationId={locationId} categoryId={categoryId} />
              )}

              {/* SEO Content Block (Use-Cases + FAQ – inkl. lokaler FAQs) */}
              <ProductSEOContent
                product={product}
                location={location}
                categoryId={categoryId || ""}
                categoryTitle={category.title}
                productSEO={productSEO}
                additionalFaqs={locationId && categoryId ? getLocalCategoryContent(locationId, categoryId)?.faqs : undefined}
              />


              {/* Halteverbotsschilder: ausführlicher Ratgeber im SEO-Bereich */}
              {(product.id === "halteverbotsschilder-set" || product.id === "bonn-halteverbotsschilder-set") && (
                <HalteverbotsSeoSection locationId={location.id} />
              )}

            </div>

            {/* ── RIGHT COLUMN (sidebar: booking on md+, delivery on all) ── */}
            <div className="md:block">
              <div className="sticky top-4 space-y-4 md:space-y-3 lg:space-y-5">
                {/* Booking Card – desktop/tablet only */}
                <div className="hidden md:block bg-card rounded-xl border border-border p-4 md:p-3 lg:p-5">
                  {(product.pricePerMonth || product.pricePerDay || typeof productSEO?.dailyPriceFrom === "number") && (
                    <div className="mb-3 md:mb-2 lg:mb-4 pb-3 md:pb-2 lg:pb-4 border-b border-border">
                      <div className="text-2xl md:text-xl lg:text-3xl font-bold text-primary">
                        {product.pricePerMonth
                          ? product.pricePerMonth
                          : product.pricePerDay
                            ? product.pricePerDay
                            : `ab ${Number.isInteger(productSEO!.dailyPriceFrom as number) ? productSEO!.dailyPriceFrom : (productSEO!.dailyPriceFrom as number).toFixed(2).replace(".", ",")} €`}
                        {(product.pricePerMonth || product.pricePerDay || typeof productSEO?.dailyPriceFrom === "number") && (
                          <span className="text-primary">*</span>
                        )}
                        <span className="text-sm md:text-xs lg:text-base font-normal text-muted-foreground"> {product.pricePerMonth ? "/ Monat" : t("rental.perDay")}</span>
                      </div>
                      {product.priceWeekend && !product.pricePerMonth && (
                        <p className="text-sm md:text-xs lg:text-sm text-accent font-medium mt-1">
                          Weekend-Tarif: {product.priceWeekend}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Inkl. 19 % USt.{product.pricePerMonth && product.minRentalMonths ? ` · Mindestbuchungszeit ${product.minRentalMonths} Monate` : ""}
                      </p>
                      <p className="text-[11px] leading-snug text-muted-foreground mt-1">
                        *Unverbindlicher Ab-Preis{!product.pricePerMonth && !product.pricePerDay ? ", gerechnet auf Monatsmiete" : ""}. Tatsächlicher Preis abhängig von Standort, Mietdauer, Saison und Auslastung – tagesaktuell im Buchungsprozess.
                      </p>
                    </div>
                  )}
                  <div className="space-y-2 md:space-y-1.5 lg:space-y-2 mb-3 md:mb-2 lg:mb-4">
                    <Button
                      size="lg"
                      className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover md:h-9 md:text-sm lg:h-11 lg:text-base"
                      onClick={() => setShowBookingDialog(true)}
                    >
                      {t("rental.rentNow")}
                    </Button>
                    <Link to="/b2b/login" className="block">
                      <Button size="lg" variant="outline" className="w-full md:h-9 md:text-sm lg:h-11 lg:text-base border-2 border-primary text-primary bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary">
                        {t("rental.b2bConditions")}
                      </Button>
                    </Link>
                    <p className="text-[11px] leading-snug text-muted-foreground">
                      B2B-Konditionen sinnvoll ab größeren Mengen, Rahmenverträgen oder wiederkehrenden Bestellungen. Für einzelne Kurzmieten bitte direkt „{t("rental.rentNow")}" nutzen.
                    </p>
                  </div>


                  {/* Location */}
                  <div className="border-t border-border pt-3 md:pt-2 lg:pt-4 space-y-1.5 md:space-y-1 lg:space-y-2">
                    <h3 className="text-sm md:text-xs lg:text-sm font-semibold text-foreground">{t("rental.locationLabel")}</h3>
                    <div className="flex items-start gap-2 text-sm md:text-xs lg:text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 md:h-3 md:w-3 lg:h-4 lg:w-4 flex-shrink-0 mt-0.5" />
                      <span>{location.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm md:text-xs lg:text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 md:h-3 md:w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                      <a href={`tel:${location.phone}`} className="hover:text-primary truncate">{location.phone}</a>
                    </div>
                    <div className="flex items-center gap-2 text-sm md:text-xs lg:text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 md:h-3 md:w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                      <a href={`mailto:${location.email}`} className="hover:text-primary truncate">{location.email}</a>
                    </div>
                  </div>
                </div>

                {/* Delivery / Trailer Info – single instance (Wohnwagen & Nutzfahrzeuge sind selbstfahrend / werden nicht geliefert) */}
                {categoryId === "wohnwagen-camping" || categoryId === "nutzfahrzeuge" ? null : categoryId === "anhaenger" ? (
                  <TrailerInfoCard t={t} />
                ) : product && /\b(3[.,]5\s*t|5\s*t|E35|E50|E55)\b/.test(product.name + " " + (product.modelName || "")) ? (
                  <Card className="border-accent/30 bg-accent/5">
                    <CardContent className="pt-5 pb-4 flex items-start gap-3">
                      <Truck className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-sm text-headline">{t("rental.heavyTransportTitle", "Tiefladertransport")}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t("rental.heavyTransportDesc", "Diese Maschine wird per Tieflader transportiert. Transportkosten auf Anfrage.")}</p>
                        <Link to="/kontakt" className="inline-block mt-2">
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            {t("rental.heavyTransportCta", "Transport anfragen")}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <DeliveryCalculatorCompact productCategoryId={categoryId || ""} showAllCategories={false} productName={product?.name} originLocationId={location?.id as any} />
                )}
              </div>
            </div>
          </div>

          {/* Optional Accessories for Excavators */}
          {accessories.length > 0 && (
            <div className="mt-10 pt-8 border-t border-border">
              <div className="flex items-center gap-2 mb-5">
                <HardHat className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-headline">{t("rental.optionalAccessories", "Optionales Zubehör")}</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {t("rental.accessoriesHint", "Passende Anbaugeräte für diese Maschine – einfach dazu buchen.")}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {accessories.map((acc) => (
                  <Link key={acc.id} to={`/mieten/${location.id}/${acc.tags?.includes("baumaschine") || acc.tags?.includes("autotransport") || acc.tags?.includes("gebremst") ? "anhaenger" : categoryId}/${acc.id}`}>
                    <Card className="h-full hover:shadow-md transition-shadow group overflow-hidden border-primary/20">
                      <div className="aspect-[4/3] bg-muted">
                        {acc.image && acc.image !== "/placeholder.svg" ? (
                          <img
                            src={acc.image}
                            alt={`${acc.name} – Anbaugerät für ${product.name}`}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {acc.name}
                        </h3>
                        {acc.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{acc.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-10 pt-8 border-t border-border">
              <h2 className="text-lg font-bold text-headline mb-5">{t("rental.relatedProducts")}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <Link key={relatedProduct.id} to={`/mieten/${location.id}/${categoryId}/${relatedProduct.id}`}>
                    <Card className="h-full hover:shadow-md transition-shadow group overflow-hidden">
                      <div className="aspect-[4/3] bg-muted">
                        {relatedProduct.image ? (
                          <img
                            src={relatedProduct.image}
                            alt={relatedProduct.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {relatedProduct.name}
                        </h3>
                        {relatedProduct.pricePerDay && (
                          <p className="text-sm font-semibold text-primary mt-1">
                            {relatedProduct.pricePerDay}{t("rental.perDay")}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <ProductBookingDialog
        product={product}
        location={location}
        isOpen={showBookingDialog}
        onClose={() => setShowBookingDialog(false)}
        categoryId={categoryId}
      />
    </Layout>
  );
}

// ── Sub-components ──────────────────────────────────────────

function MobileBookingCard({
  product,
  location,
  categoryId,
  onBook,
  dailyPriceFrom,
  t,
}: {
  product: Product;
  location: ReturnType<typeof getLocationById>;
  categoryId?: string;
  onBook: () => void;
  dailyPriceFrom?: number;
  t: (key: string) => string;
}) {
  if (!location) return null;
  const showPrice = product.pricePerMonth || product.pricePerDay || typeof dailyPriceFrom === "number";
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      {showPrice && (
        <div className="mb-3 pb-3 border-b border-border">
          <div className="text-2xl font-bold text-primary">
            {product.pricePerMonth
              ? product.pricePerMonth
              : product.pricePerDay
                ? product.pricePerDay
                : `ab ${Number.isInteger(dailyPriceFrom as number) ? dailyPriceFrom : (dailyPriceFrom as number).toFixed(2).replace(".", ",")} €`}
            {(product.pricePerMonth || product.pricePerDay || typeof dailyPriceFrom === "number") && (
              <span className="text-primary">*</span>
            )}
            <span className="text-sm font-normal text-muted-foreground"> {product.pricePerMonth ? "/ Monat" : t("rental.perDay")}</span>
          </div>
          {product.priceWeekend && !product.pricePerMonth && (
            <p className="text-sm text-accent font-medium mt-0.5">
              Weekend-Tarif: {product.priceWeekend}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground mt-1">
            Inkl. 19 % USt.{product.pricePerMonth && product.minRentalMonths ? ` · Mindestbuchungszeit ${product.minRentalMonths} Monate` : ""}
          </p>
          <p className="text-[11px] leading-snug text-muted-foreground mt-1">
            *Unverbindlicher Ab-Preis{!product.pricePerMonth && !product.pricePerDay ? ", gerechnet auf Monatsmiete" : ""}. Tatsächlicher Preis abhängig von Standort, Mietdauer, Saison und Auslastung – tagesaktuell im Buchungsprozess.
          </p>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Button
          size="default"
          className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover"
          onClick={onBook}
        >
          {t("rental.rentNow")}
        </Button>
        <Link to="/b2b/login" className="w-full">
          <Button size="default" variant="outline" className="w-full border-2 border-primary text-primary bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary">
            {t("rental.b2bConditions")}
          </Button>
        </Link>
        <p className="text-[11px] leading-snug text-muted-foreground">
          B2B-Konditionen sinnvoll ab größeren Mengen, Rahmenverträgen oder wiederkehrenden Bestellungen. Für einzelne Kurzmieten bitte direkt „{t("rental.rentNow")}" nutzen.
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
        <MapPin className="h-3 w-3 flex-shrink-0" />
        <span className="truncate">{location.address}</span>
      </div>
    </div>
  );
}

function TrailerInfoCard({ t }: { t: (key: string) => string }) {
  return (
    <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl border border-accent/30 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
          <Clock className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">{t("rental.available247")}</h3>
          <p className="text-xs text-muted-foreground">{t("rental.available247Desc")}</p>
        </div>
      </div>
      <div className="space-y-3">
        {[
          { icon: Smartphone, title: t("rental.smsCodeSystem"), desc: t("rental.smsCodeSystemDesc") },
          { icon: Lock, title: t("rental.electronicLock"), desc: t("rental.electronicLockDesc") },
          { icon: Key, title: t("rental.selfPickup"), desc: t("rental.selfPickupDesc") },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center mt-4 pt-3 border-t border-accent/20">
        {t("rental.idRequired")}
      </p>
    </div>
  );
}
