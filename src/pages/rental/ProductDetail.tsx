import { useParams, Link, useNavigate } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { ArrowLeft, ChevronLeft, ChevronRight, Package, MapPin, Phone, Mail, CheckCircle, Clock, Smartphone, Lock, Key } from "lucide-react";
import {
  getLocationById,
  getCategoryById,
  getProductById,
  getProductsForLocationCategory,
  type Product,
} from "@/data/rentalData";
import { ProductBookingDialog } from "@/components/rental/ProductBookingDialog";
import { DeliveryCalculatorCompact } from "@/components/products/DeliveryCalculatorCompact";

export default function ProductDetail() {
  const { locationId, categoryId, productId } = useParams<{
    locationId: string;
    categoryId: string;
    productId: string;
  }>();
  const navigate = useNavigate();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  const location = useMemo(() => getLocationById(locationId || ""), [locationId]);
  const category = useMemo(() => getCategoryById(categoryId || ""), [categoryId]);
  const product = useMemo(() => getProductById(productId || ""), [productId]);

  // Get related products from same category
  const relatedProducts = useMemo(() => {
    if (!location || !categoryId || !product) return [];
    const allProducts = getProductsForLocationCategory(location.id, categoryId);
    return allProducts.filter((p) => p.id !== product.id).slice(0, 4);
  }, [location, categoryId, product]);

  const images = useMemo(() => {
    if (!product) return [];
    return product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];
  }, [product]);

  // Update page title for SEO
  useEffect(() => {
    if (product && location) {
      document.title = `${product.name} mieten in ${location.shortName} | SLT Rental`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      const descText = `${product.name} mieten in ${location.shortName}. ${product.description || ""} Jetzt online reservieren bei SLT Rental.`;
      if (metaDescription) {
        metaDescription.setAttribute("content", descText);
      } else {
        const meta = document.createElement("meta");
        meta.name = "description";
        meta.content = descText;
        document.head.appendChild(meta);
      }
    }
    
    return () => {
      document.title = "SLT Rental";
    };
  }, [product, location]);

  // Handle keyboard navigation for images
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (images.length <= 1) return;
      if (e.key === "ArrowLeft") {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length]);

  if (!location || !category || !product) {
    return (
      <Layout>
        <div className="section-container py-20 text-center">
          <h1 className="text-2xl font-bold text-headline mb-4">
            Produkt nicht gefunden
          </h1>
          <p className="text-muted-foreground mb-6">
            Das gesuchte Produkt existiert nicht oder ist nicht mehr verfügbar.
          </p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </div>
      </Layout>
    );
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Layout>
      {/* Breadcrumb Navigation */}
      <div className="bg-muted/50 border-b border-border">
        <div className="section-container py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/mieten">Standorte</Link>
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
                <BreadcrumbPage>{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-8 lg:py-12">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Images & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                {/* Main Image */}
                <div className="relative aspect-[4/3] bg-muted">
                  {images.length > 0 ? (
                    <>
                      <img
                        src={images[currentImageIndex]}
                        alt={`${product.name} - Bild ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Navigation Arrows */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background rounded-full p-2 shadow-lg transition-all"
                            aria-label="Vorheriges Bild"
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </button>
                          <button
                            onClick={handleNextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background rounded-full p-2 shadow-lg transition-all"
                            aria-label="Nächstes Bild"
                          >
                            <ChevronRight className="h-6 w-6" />
                          </button>
                        </>
                      )}

                      {/* Image Counter */}
                      {images.length > 1 && (
                        <Badge className="absolute top-4 left-4 bg-background/90 text-foreground">
                          {currentImageIndex + 1} / {images.length}
                        </Badge>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-20 w-20 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                  <div className="p-4 bg-muted/30 border-t border-border">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex
                              ? "border-primary ring-2 ring-primary/30"
                              : "border-transparent hover:border-muted-foreground/30"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-headline mb-2">
                  {product.name}
                </h1>
                
                {product.description && (
                  <p className="text-lg text-muted-foreground mb-6">
                    {product.description}
                  </p>
                )}

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Features */}
                {product.features && product.features.length > 0 && (
                  <div className="border-t border-border pt-6">
                    <h2 className="text-lg font-semibold text-headline mb-4">
                      Ausstattung & Features
                    </h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weight Info */}
                {product.weightKg && (
                  <div className="border-t border-border pt-6 mt-6">
                    <h2 className="text-lg font-semibold text-headline mb-2">
                      Technische Daten
                    </h2>
                    <p className="text-muted-foreground">
                      Nutzlast: {product.weightKg >= 1000 ? `${(product.weightKg / 1000).toFixed(1)} t` : `${product.weightKg} kg`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Booking & Info */}
            <div className="space-y-6">
              {/* Booking Card */}
              <div className="bg-card rounded-xl border border-border p-6 sticky top-4">
                {/* Pricing */}
                <div className="mb-6">
                  {product.pricePerDay && (
                    <div className="text-3xl font-bold text-primary">
                      {product.pricePerDay}
                      <span className="text-lg font-normal text-muted-foreground"> / Tag</span>
                    </div>
                  )}
                  {product.priceWeekend && (
                    <p className="text-sm text-accent font-medium mt-1">
                      Weekend-Tarif: {product.priceWeekend}
                    </p>
                  )}
                </div>

                {/* CTA Buttons */}
                <Button
                  size="lg"
                  className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover mb-2"
                  onClick={() => setShowBookingDialog(true)}
                >
                  Jetzt mieten
                </Button>
                <Link to="/b2b/login" className="block mb-4">
                  <Button
                    size="lg"
                    variant="default"
                    className="w-full"
                  >
                    Als Geschäftskunde mieten
                  </Button>
                </Link>

                {/* Location Info */}
                <div className="border-t border-border pt-4 mt-4 space-y-3">
                  <h3 className="font-semibold text-foreground">Standort</h3>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{location.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${location.phone}`} className="hover:text-primary">
                      {location.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${location.email}`} className="hover:text-primary">
                      {location.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Conditional: Delivery Calculator OR 24/7 Trailer Info */}
              {categoryId === "anhaenger" ? (
                /* 24/7 Trailer Rental Info */
                <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl border border-accent/30 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg">24/7 Verfügbar</h3>
                      <p className="text-sm text-muted-foreground">Rund um die Uhr mietbar</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Smartphone className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">SMS-Code System</p>
                        <p className="text-sm text-muted-foreground">
                          Nach Buchung erhalten Sie einen SMS-Code zum Entsperren des Anhängers.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Lock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Elektronisches Schloss</p>
                        <p className="text-sm text-muted-foreground">
                          Code am Schloss der Deichsel eingeben und Anhänger mitnehmen.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Key className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Selbstabholung</p>
                        <p className="text-sm text-muted-foreground">
                          Abholen und Zurückbringen am Standort – ganz ohne Wartezeit.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-accent/20">
                    <p className="text-xs text-muted-foreground text-center">
                      Personalausweis für Identifikation bei der Buchung erforderlich
                    </p>
                  </div>
                </div>
              ) : (
                /* Delivery Calculator for non-trailer products */
                <DeliveryCalculatorCompact
                  productCategoryId={categoryId || ""}
                  showAllCategories={false}
                />
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <h2 className="text-xl font-bold text-headline mb-6">
                Ähnliche Produkte
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    to={`/mieten/${location.id}/${categoryId}/${relatedProduct.id}`}
                  >
                    <Card className="h-full hover:shadow-md transition-shadow group overflow-hidden">
                      <div className="aspect-[4/3] bg-muted">
                        {relatedProduct.image ? (
                          <img
                            src={relatedProduct.image}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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
                            {relatedProduct.pricePerDay}/Tag
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

      {/* Booking Dialog */}
      <ProductBookingDialog
        product={product}
        location={location}
        isOpen={showBookingDialog}
        onClose={() => setShowBookingDialog(false)}
      />
    </Layout>
  );
}
