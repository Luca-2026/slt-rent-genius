import { useParams, Link, useNavigate } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import { Layout } from "@/components/layout";
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
import { ArrowLeft, ChevronLeft, ChevronRight, Package, MapPin, Phone, Mail, CheckCircle, Clock, Smartphone, Lock, Key, Play, Info, FileDown, ShieldCheck, ExternalLink, Car, HardHat } from "lucide-react";
import {
  getLocationById,
  getCategoryById,
  getProductById,
  getProductsForLocationCategory,
  type Product,
} from "@/data/rentalData";
import { ProductBookingDialog } from "@/components/rental/ProductBookingDialog";
import { DeliveryCalculatorCompact } from "@/components/products/DeliveryCalculatorCompact";
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
  const rawProduct = useMemo(() => getProductById(productId || ""), [productId]);
  const product = useTranslatedProduct(rawProduct);

  const rawRelatedProducts = useMemo(() => {
    if (!location || !categoryId || !rawProduct) return [];
    const allProducts = getProductsForLocationCategory(location.id, categoryId);
    return allProducts.filter((p) => p.id !== rawProduct.id).slice(0, 4);
  }, [location, categoryId, rawProduct]);
  const relatedProducts = useTranslatedProducts(rawRelatedProducts);

  const images = useMemo(() => {
    if (!product) return [];
    return product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];
  }, [product]);

  useEffect(() => {
    if (product && location) {
      document.title = `${product.name} | ${location.shortName} | SLT Rental`;
      const metaDescription = document.querySelector('meta[name="description"]');
      const descText = `${product.name} – ${location.shortName}. ${product.description || ""}`;
      if (metaDescription) {
        metaDescription.setAttribute("content", descText);
      } else {
        const meta = document.createElement("meta");
        meta.name = "description";
        meta.content = descText;
        document.head.appendChild(meta);
      }
    }
    return () => { document.title = "SLT Rental"; };
  }, [product, location]);

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
    return (
      <Layout>
        <div className="section-container py-20 text-center">
          <h1 className="text-2xl font-bold text-headline mb-4">{t("rental.productNotFound")}</h1>
          <p className="text-muted-foreground mb-6">{t("rental.productNotFoundDesc")}</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("rental.back")}
          </Button>
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
                  <Link to={`/mieten/${location.id}`}>{location.shortName}</Link>
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
      <section className="py-6 lg:py-10">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* ── LEFT / MAIN COLUMN ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Image Gallery */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="relative bg-muted" style={{ aspectRatio: "4/3" }}>
                  {images.length > 0 ? (
                    <>
                      <img
                        src={images[currentImageIndex]}
                        alt={`${product.name} – Bild ${currentImageIndex + 1}`}
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
                          <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── MOBILE ONLY: Booking Card inline ── */}
              <div className="lg:hidden">
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
                    {product.name}
                  </h1>
                  {product.description && (
                    <p className="text-base text-muted-foreground mt-2 leading-relaxed">
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
                    <p className="text-sm text-muted-foreground leading-relaxed">
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
                  {product.weightKg && (
                    <p className="text-xs text-muted-foreground mt-3">
                      {t("rental.payload")}: {product.weightKg >= 1000 ? `${(product.weightKg / 1000).toFixed(1)} t` : `${product.weightKg} kg`}
                    </p>
                  )}
                </div>
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
                    {t("rental.operatingManual")}
                  </h2>
                  <a
                    href={product.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg px-4 py-3 text-sm font-medium transition-colors border border-primary/20"
                  >
                    <FileDown className="h-4 w-4 flex-shrink-0" />
                    {t("rental.downloadPdf")}
                  </a>
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

              {/* Hilfe-Artikel für Erdbewegung (Minibagger) */}
              {categoryId === "erdbewegung" && (
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
            </div>

            {/* ── RIGHT COLUMN (desktop sticky sidebar) ── */}
            <div className="hidden lg:block">
              <div className="sticky top-4 space-y-5">
                {/* Booking Card */}
                <div className="bg-card rounded-xl border border-border p-5">
                  {product.pricePerDay && (
                    <div className="mb-4 pb-4 border-b border-border">
                      <div className="text-3xl font-bold text-primary">
                        {product.pricePerDay}
                        <span className="text-base font-normal text-muted-foreground"> {t("rental.perDay")}</span>
                      </div>
                      {product.priceWeekend && (
                        <p className="text-sm text-accent font-medium mt-1">
                          Weekend-Tarif: {product.priceWeekend}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="space-y-2 mb-4">
                    <Button
                      size="lg"
                      className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                      onClick={() => setShowBookingDialog(true)}
                    >
                      {t("rental.rentNow")}
                    </Button>
                    <Link to="/b2b/login" className="block">
                      <Button size="lg" variant="default" className="w-full">
                        {t("rental.b2bConditions")}
                      </Button>
                    </Link>
                  </div>

                  {/* Location */}
                  <div className="border-t border-border pt-4 space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">{t("rental.locationLabel")}</h3>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{location.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <a href={`tel:${location.phone}`} className="hover:text-primary truncate">{location.phone}</a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <a href={`mailto:${location.email}`} className="hover:text-primary truncate">{location.email}</a>
                    </div>
                  </div>
                </div>

                {/* Delivery / Trailer Info */}
                {categoryId === "anhaenger" ? (
                  <TrailerInfoCard t={t} />
                ) : (
                  <DeliveryCalculatorCompact productCategoryId={categoryId || ""} showAllCategories={false} />
                )}
              </div>
            </div>
          </div>

          {/* ── MOBILE: Delivery / Trailer Info below ── */}
          <div className="lg:hidden mt-5">
            {categoryId === "anhaenger" ? (
              <TrailerInfoCard t={t} />
            ) : (
              <DeliveryCalculatorCompact productCategoryId={categoryId || ""} showAllCategories={false} />
            )}
          </div>

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
