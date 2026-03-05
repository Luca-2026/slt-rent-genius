import { useParams, Link, useNavigate } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { B2BReservationDialog } from "@/components/b2b/B2BReservationDialog";
import { useB2BDiscounts } from "@/hooks/useB2BDiscounts";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Package, CheckCircle,
  ShoppingCart, Play, Info, FileDown, ShieldCheck, ExternalLink,
  Car, Smartphone, HardHat, Sparkles, Percent, Zap,
} from "lucide-react";
import {
  getLocationById,
  getCategoryById,
  getProductById,
  getProductsForLocationCategory,
  getCompatibleAccessories,
  type Product,
} from "@/data/rentalData";

export default function B2BProductDetail() {
  const { locationId, categoryId, productId } = useParams<{
    locationId: string;
    categoryId: string;
    productId: string;
  }>();
  const navigate = useNavigate();
  const { b2bProfile } = useAuth();
  const { getDiscountForCategory } = useB2BDiscounts();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);

  const location = useMemo(() => getLocationById(locationId || ""), [locationId]);
  const category = useMemo(() => getCategoryById(categoryId || ""), [categoryId]);
  const product = useMemo(() => getProductById(productId || ""), [productId]);

  const discount = useMemo(
    () => (categoryId ? getDiscountForCategory(categoryId) : 0),
    [categoryId, getDiscountForCategory]
  );

  const relatedProducts = useMemo(() => {
    if (!location || !categoryId || !product) return [];
    const allProducts = getProductsForLocationCategory(location.id, categoryId);
    return allProducts
      .filter((p) => p.id !== product.id && !p.compatibleMachines)
      .filter((p) => p.image && p.image !== "/placeholder.svg")
      .slice(0, 4);
  }, [location, categoryId, product]);

  const accessories = useMemo(() => {
    if (!location || !product || categoryId !== "erdbewegung") return [];
    return getCompatibleAccessories(product.id, location.id);
  }, [location, product, categoryId]);

  const images = useMemo(() => {
    if (!product) return [];
    return product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];
  }, [product]);

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
      <B2BPortalLayout title="Produkt nicht gefunden">
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">Das Produkt wurde nicht gefunden.</p>
          <Button onClick={() => navigate("/b2b/produkte")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zum Katalog
          </Button>
        </div>
      </B2BPortalLayout>
    );
  }

  const handlePrevImage = () => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const handleNextImage = () => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  const videoUrls = product.videoUrls && product.videoUrls.length > 0
    ? product.videoUrls
    : product.videoUrl ? [product.videoUrl] : [];

  const hasDiscount = discount > 0;

  return (
    <B2BPortalLayout
      title={product.name}
      subtitle={category.title}
    >
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/b2b/produkte")}
        className="mb-3 md:mb-4 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Zurück zum Katalog
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* ── LEFT / MAIN COLUMN ── */}
        <div className="lg:col-span-2 space-y-4 md:space-y-5">
          {/* Image Gallery */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="relative bg-muted aspect-square sm:aspect-[4/3]">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentImageIndex]}
                    alt={`${product.name} – Ansicht ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background rounded-full p-2 shadow-md transition-all"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background rounded-full p-2 shadow-md transition-all"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <Badge className="absolute top-3 left-3 bg-background/90 text-foreground text-xs">
                        {currentImageIndex + 1} / {images.length}
                      </Badge>
                    </>
                  )}
                  {hasDiscount && (
                    <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground font-bold text-sm px-2 py-1">
                      <Percent className="h-3 w-3 mr-1" />
                      -{discount}% B2B
                    </Badge>
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
                      <img src={img} alt={`Vorschau ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── MOBILE ONLY: Inquiry Card inline ── */}
          <div className="lg:hidden">
            <B2BInquiryCard
              product={product}
              discount={discount}
              onInquiry={() => setInquiryProduct(product)}
            />
          </div>

          {/* Product Name + Description */}
          <div className="bg-card rounded-xl border border-border p-4 md:p-5 space-y-3 md:space-y-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-headline leading-tight">
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
                <h2 className="text-base font-semibold text-headline mb-3">Merkmale</h2>
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
                  Beschreibung
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.detailedDescription}
                </p>
              </div>
            )}
          </div>

          {/* Technical Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="bg-card rounded-xl border border-border p-4 md:p-5">
              <h2 className="text-base font-semibold text-headline mb-4">Technische Daten</h2>
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
                  Gewicht: {product.weightKg >= 1000 ? `${(product.weightKg / 1000).toFixed(1)} t` : `${product.weightKg} kg`}
                </p>
              )}
            </div>
          )}

          {/* Rental Notes */}
          {product.rentalNotes && product.rentalNotes.length > 0 && (
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 md:p-5">
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

          {/* Videos */}
          {videoUrls.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-4 md:p-5 space-y-4">
              {videoUrls.map((url, idx) => (
                <div key={url}>
                  <h2 className="text-base font-semibold text-headline mb-3 flex items-center gap-2">
                    <Play className="h-4 w-4 text-primary flex-shrink-0" />
                    {videoUrls.length > 1 ? `Produktvideo ${idx + 1}` : "Produktvideo"}
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
                </div>
              ))}
            </div>
          )}

          {/* PDF Download */}
          {product.pdfUrl && (
            <div className="bg-card rounded-xl border border-border p-4 md:p-5">
              <h2 className="text-base font-semibold text-headline mb-3 flex items-center gap-2">
                <FileDown className="h-4 w-4 text-primary flex-shrink-0" />
                Bedienungsanleitung
              </h2>
              <a
                href={product.pdfUrl}
                download
                className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg px-4 py-3 text-sm font-medium transition-colors border border-primary/20"
              >
                <FileDown className="h-4 w-4 flex-shrink-0" />
                PDF herunterladen
              </a>
            </div>
          )}

          {/* Hilfe-Artikel für Anhänger */}
          {categoryId === "anhaenger" && (
            <div className="space-y-3">
              <Link to="/hilfe" state={{ articleId: "anhaenger-beladen" }} className="block">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 hover:bg-primary/10 transition-colors group">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">Anhänger richtig beladen & sichern</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Tipps zur Ladungssicherung und Gewichtsverteilung.</p>
                      <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-1.5 group-hover:underline">
                        Zur Anleitung <ExternalLink className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              <Link to="/hilfe" state={{ articleId: "anhaenger-codesystem" }} className="block">
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 hover:bg-accent/10 transition-colors group">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Smartphone className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">Code-System & Abholung</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">So funktioniert die flexible Abholung mit Code.</p>
                      <span className="inline-flex items-center gap-1 text-xs text-accent font-medium mt-1.5 group-hover:underline">
                        Zum Code-System <ExternalLink className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              <Link to="/hilfe" state={{ articleId: "anhaenger-fuehrerschein" }} className="block">
                <div className="bg-secondary border border-border rounded-xl p-4 hover:bg-secondary/80 transition-colors group">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Car className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">Führerschein & Zugfahrzeug</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Welcher Führerschein wird für welchen Anhänger benötigt?</p>
                      <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-1.5 group-hover:underline">
                        Mehr erfahren <ExternalLink className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Hilfe-Artikel für Erdbewegung (Minibagger) */}
          {categoryId === "erdbewegung" && product?.category === "minibagger" && (
            <Link to="/hilfe" state={{ articleId: "minibagger-einweisung" }} className="block">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 hover:bg-primary/10 transition-colors group">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <HardHat className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">Minibagger Einweisung & Sicherheit</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Wichtige Hinweise zu Bedienung und Sicherheitsregeln.</p>
                    <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-1.5 group-hover:underline">
                      Zur Sicherheitsanleitung <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Hilfe-Artikel für Hüpfburgen */}
          {categoryId === "huepfburgen" && (
            <Link to="/hilfe" state={{ articleId: "huepfburg-aufbau-sicherheit" }} className="block">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 hover:bg-primary/10 transition-colors group">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">Hüpfburg sicher aufbauen & nutzen</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Schritt-für-Schritt-Anleitung für Auf-/Abbau und Sicherheitsregeln.</p>
                    <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-1.5 group-hover:underline">
                      Zur Sicherheitsanleitung <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* ── RIGHT COLUMN (desktop sticky sidebar) ── */}
        <div className="hidden lg:block">
          <div className="sticky top-4 space-y-5">
            <B2BInquiryCard
              product={product}
              discount={discount}
              onInquiry={() => setInquiryProduct(product)}
            />
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-6 md:mt-10 pt-6 md:pt-8 border-t border-border">
          <h2 className="text-base md:text-lg font-bold text-headline mb-4 md:mb-5">Weitere Produkte in dieser Kategorie</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {relatedProducts.map((rp) => (
              <Link key={rp.id} to={`/b2b/produkte/${locationId}/${categoryId}/${rp.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow group overflow-hidden">
                  <div className="aspect-[4/3] bg-muted">
                    {rp.image ? (
                      <img
                        src={rp.image}
                        alt={rp.name}
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
                      {rp.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Accessories for Erdbewegung */}
      {accessories.length > 0 && (
        <div className="mt-6 md:mt-10 pt-6 md:pt-8 border-t border-border">
          <div className="flex items-center gap-2 mb-5">
            <HardHat className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-headline">Optionales Zubehör</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {accessories.map((acc) => (
              <Link key={acc.id} to={`/b2b/produkte/${locationId}/${categoryId}/${acc.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow group overflow-hidden border-primary/20">
                  <div className="aspect-[4/3] bg-muted">
                    {acc.image && acc.image !== "/placeholder.svg" ? (
                      <img src={acc.image} alt={acc.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">{acc.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Single Reservation Dialog */}
      <B2BReservationDialog
        product={inquiryProduct}
        categorySlug={categoryId || ""}
        discountPercent={discount}
        open={!!inquiryProduct}
        onOpenChange={(open) => !open && setInquiryProduct(null)}
        preselectedLocation={locationId || b2bProfile?.assigned_location || "krefeld"}
      />
    </B2BPortalLayout>
  );
}

// ── B2B Inquiry Sidebar Card ──
function B2BInquiryCard({
  product,
  discount,
  onInquiry,
}: {
  product: Product;
  discount: number;
  onInquiry: () => void;
}) {
  const hasDiscount = discount > 0;

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-5 space-y-3 md:space-y-4">
      {/* Price info */}
      {product.pricePerDay && (
        <div className="pb-3 border-b border-border">
          <div className={`text-2xl font-bold ${hasDiscount ? "line-through text-muted-foreground" : "text-primary"}`}>
            {product.pricePerDay}
            <span className="text-sm font-normal"> / Tag</span>
          </div>
          {hasDiscount && (
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-accent text-accent-foreground text-sm px-2 py-0.5">
                -{discount}%
              </Badge>
              <span className="text-sm font-bold text-accent">Ihr B2B-Preis</span>
            </div>
          )}
          {product.priceWeekend && (
            <p className="text-xs text-muted-foreground mt-1">
              Weekend-Tarif: {product.priceWeekend}
            </p>
          )}
        </div>
      )}

      {!product.pricePerDay && hasDiscount && (
        <div className="pb-3 border-b border-border">
          <Badge className="bg-accent text-accent-foreground text-sm px-2 py-0.5">
            -{discount}% B2B-Rabatt
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">auf den Listenpreis</p>
        </div>
      )}

      {/* 1h Promise */}
      <div className="flex items-center gap-2 bg-primary/5 rounded-lg p-2.5 border border-primary/10">
        <Zap className="h-4 w-4 text-primary flex-shrink-0" />
        <p className="text-xs text-foreground font-medium">
          Angebot innerhalb von <strong>1 Stunde</strong> – garantiert!
        </p>
      </div>

      {/* Inquiry Button */}
      <Button
        size="lg"
        className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover"
        onClick={onInquiry}
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        Einzelanfrage senden
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Verbindliches Angebot mit Ihrem persönlichen B2B-Rabatt.
      </p>
    </div>
  );
}
