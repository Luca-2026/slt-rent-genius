import { useParams, Link, useNavigate } from "react-router-dom";
import { categoryContent as seoCategoryContent } from "@/components/rental/ProductSEOContent";
import { getProductSEO } from "@/data/productSEOData";
import { useMemo, useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
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
import { ProductBookingDialog } from "@/components/rental/ProductBookingDialog";
import { AnhaengersteckerAnleitung } from "@/components/rental/AnhaengersteckerAnleitung";
import { DeliveryCalculatorCompact } from "@/components/products/DeliveryCalculatorCompact";
import { PurchaseInquiryBanner } from "@/components/rental/PurchaseInquiryBanner";
import { ServiceBanner } from "@/components/rental/ServiceBanner";
import { ProductSEOContent } from "@/components/rental/ProductSEOContent";
import { useTranslation } from "react-i18next";

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

  const location = useMemo(() => getLocationById(locationId || ""), [locationId]);
  const rawCategory = useMemo(() => getCategoryById(categoryId || ""), [categoryId]);
  const category = useTranslatedCategory(rawCategory) || rawCategory;
  const rawProduct = useMemo(() => {
    // Find the product in the specific location to get correct rentwareCode
    if (location && categoryId) {
      const locationProducts = getProductsForLocationCategory(location.id, categoryId);
      const found = locationProducts.find((p) => p.id === productId);
      if (found) return found;
    }
    if (location) {
      const allLocationProducts = getAllProductsForLocation(location.id);
      const found = allLocationProducts.find((p) => p.id === productId);
      if (found) return found;
    }
    return getProductById(productId || "");
  }, [productId, location, categoryId]);
  const product = useTranslatedProduct(rawProduct);

  const rawRelatedProducts = useMemo(() => {
    if (!location || !categoryId || !rawProduct) return [];
    const allProducts = getProductsForLocationCategory(location.id, categoryId);
    return allProducts.filter((p) => p.id !== rawProduct.id && !p.compatibleMachines).slice(0, 4);
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

  // Get product-specific SEO data from Excel
  const productSEO = useMemo(() => product ? getProductSEO(product.id) : undefined, [product]);

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
    return (text: string): string => {
      let result = text
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

      // SEO: Meta description - generic name + model for CTR
      const modelInfo = product.modelName ? ` ${product.modelName}` : '';
      let descText: string;
      if (product.description) {
        const descSnippet = product.description.length > 80 
          ? product.description.substring(0, 80).replace(/\s+\S*$/, '') 
          : product.description;
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

      // SEO: Keywords meta tag
      if (productSEO?.primaryKeywords) {
        let keywordsMeta = document.querySelector('meta[name="keywords"]');
        if (!keywordsMeta) {
          keywordsMeta = document.createElement("meta");
          keywordsMeta.setAttribute("name", "keywords");
          document.head.appendChild(keywordsMeta);
        }
        keywordsMeta.setAttribute("content", productSEO.primaryKeywords);
      }

      // SEO: Canonical URL
      const canonicalUrl = `https://www.slt-rental.de/mieten/${location.id}/${categoryId}/${product.id}`;
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
        "description": product.description || "",
        "image": images.length > 0 ? (images[0].startsWith("http") ? images[0] : `https://www.slt-rental.de${images[0].startsWith("/") ? "" : "/"}${images[0]}`) : undefined,
        "url": canonicalUrl,
        "category": category.title,
        "sku": product.id,
        "offers": {
          "@type": "Offer",
          "availability": "https://schema.org/InStock",
          "priceCurrency": "EUR",
          "price": product.pricePerDay?.replace(/[^\d,]/g, "").replace(",", ".") || undefined,
          "priceValidUntil": new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
          "url": canonicalUrl,
          "seller": {
            "@type": "LocalBusiness",
            "name": "SLT Rental",
            "url": "https://www.slt-rental.de",
          },
          "areaServed": { "@type": "City", "name": location.name },
        },
      };
      // Add brand + model if modelName exists
      if (product.modelName) {
        // Extract brand from modelName (first word) or from specs
        const specs = product.specifications || {};
        const brand = specs["Hersteller"] || product.modelName.split(" ")[0];
        jsonLd["brand"] = { "@type": "Brand", "name": brand };
        jsonLd["model"] = product.modelName;
      } else {
        jsonLd["brand"] = { "@type": "Brand", "name": "SLT Rental" };
      }

      const jsonLdArray: Record<string, unknown>[] = [jsonLd];

      // FAQ JSON-LD: prefer product-specific FAQs, fallback to category
      const productFaqs = productSEO?.faqs;
      const categoryFaqs = categoryId ? seoCategoryContent[categoryId]?.faqs : null;
      const faqItems = productFaqs?.length ? productFaqs : categoryFaqs;
      if (faqItems?.length) {
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
          { "@type": "ListItem", "position": 1, "name": "Startseite", "item": "https://www.slt-rental.de" },
          { "@type": "ListItem", "position": 2, "name": `Mieten ${location.name}`, "item": `https://www.slt-rental.de/mieten/${location.id}` },
          { "@type": "ListItem", "position": 3, "name": category.title, "item": `https://www.slt-rental.de/mieten/${location.id}/${categoryId}` },
          { "@type": "ListItem", "position": 4, "name": product.name, "item": canonicalUrl },
        ],
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
                  {product.description && (
                    <p className="text-base text-muted-foreground mt-2 leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  )}
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
                {product.detailedDescription && (
                  <div className="border-t border-border pt-4">
                    <h2 className="text-base font-semibold text-headline mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary flex-shrink-0" />
                      {t("rental.descriptionTitle")}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {product.detailedDescription}
                    </p>
                  </div>
                )}
              </div>

              {/* Technical Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h2 className="text-base font-semibold text-headline mb-4">{t("rental.technicalData")}</h2>
                  <div className="divide-y divide-border rounded-lg overflow-hidden border border-border">
                    {Object.entries(product.specifications).map(([key, value], i) => (
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

              {/* Kaufanfrage-Banner */}
              <PurchaseInquiryBanner
                productName={product.name}
                locationName={location.name}
                locationEmail={location.email}
                categoryId={categoryId}
              />

              {/* SEO Content Block */}
              <ProductSEOContent
                product={product}
                location={location}
                categoryId={categoryId || ""}
                categoryTitle={category.title}
                productSEO={productSEO}
              />

            </div>

            {/* ── RIGHT COLUMN (sidebar: booking on md+, delivery on all) ── */}
            <div className="md:block">
              <div className="sticky top-4 space-y-4 md:space-y-3 lg:space-y-5">
                {/* Booking Card – desktop/tablet only */}
                <div className="hidden md:block bg-card rounded-xl border border-border p-4 md:p-3 lg:p-5">
                  {product.pricePerDay && (
                    <div className="mb-3 md:mb-2 lg:mb-4 pb-3 md:pb-2 lg:pb-4 border-b border-border">
                      <div className="text-2xl md:text-xl lg:text-3xl font-bold text-primary">
                        {product.pricePerDay}
                        <span className="text-sm md:text-xs lg:text-base font-normal text-muted-foreground"> {t("rental.perDay")}</span>
                      </div>
                      {product.priceWeekend && (
                        <p className="text-sm md:text-xs lg:text-sm text-accent font-medium mt-1">
                          Weekend-Tarif: {product.priceWeekend}
                        </p>
                      )}
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
                      <Button size="lg" variant="default" className="w-full md:h-9 md:text-sm lg:h-11 lg:text-base">
                        {t("rental.b2bConditions")}
                      </Button>
                    </Link>
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

                {/* Delivery / Trailer Info – single instance */}
                {categoryId === "anhaenger" ? (
                  <TrailerInfoCard t={t} />
                ) : product && /3[.,]5\s*t|5\s*t|e35|e50|e55/i.test(product.name + " " + (product.modelName || "")) ? (
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
                  <DeliveryCalculatorCompact productCategoryId={categoryId || ""} showAllCategories={false} productName={product?.name} />
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
  t,
}: {
  product: Product;
  location: ReturnType<typeof getLocationById>;
  categoryId?: string;
  onBook: () => void;
  t: (key: string) => string;
}) {
  if (!location) return null;
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      {product.pricePerDay && (
        <div className="mb-3 pb-3 border-b border-border">
          <div className="text-2xl font-bold text-primary">
            {product.pricePerDay}
            <span className="text-sm font-normal text-muted-foreground"> {t("rental.perDay")}</span>
          </div>
          {product.priceWeekend && (
            <p className="text-sm text-accent font-medium mt-0.5">
              Weekend-Tarif: {product.priceWeekend}
            </p>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <Button
          size="default"
          className="flex-1 bg-accent text-accent-foreground hover:bg-cta-orange-hover"
          onClick={onBook}
        >
          {t("rental.rentNow")}
        </Button>
        <Link to="/b2b/login" className="flex-1">
          <Button size="default" variant="default" className="w-full">
            {t("rental.b2bConditions")}
          </Button>
        </Link>
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
