import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import { CategoryGrid } from "@/components/rental/CategoryGrid";
import { ProductSearch } from "@/components/rental/ProductSearch";
import { ProductBookingDialog } from "@/components/rental/ProductBookingDialog";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Phone, Navigation, User } from "lucide-react";
import { getLocationById, type Product } from "@/data/rentalData";
import { GoogleReviews, getPlaceId, getReviewUrl } from "@/components/reviews/GoogleReviews";
import { useTranslation } from "react-i18next";
import krefeldImage from "@/assets/locations/krefeld.jpg";
import bonnImage from "@/assets/locations/bonn.webp";

// Team images
import imgBenedikt from "@/assets/team/benedikt-noechel.jpg";
import imgErsel from "@/assets/team/ersel-uzun.jpg";

// Location images mapping
const locationImages: Record<string, string> = {
  krefeld: krefeldImage,
  bonn: bonnImage,
};

// Location managers
const locationManagers: Record<string, { name: string; roleKey: string; image: string | null; email: string }> = {
  krefeld: { name: "Benedikt Nöchel", roleKey: "rental.locationManager", image: imgBenedikt, email: "b.noechel@slt-rental.de" },
  bonn: { name: "Ersel Uzun", roleKey: "rental.locationManager", image: imgErsel, email: "e.uzun@slt-rental.de" },
  muelheim: { name: "Andreas Scherzow", roleKey: "rental.locationManager", image: null, email: "a.scherzow@slt-rental.de" },
};

// Location descriptions (kept as data, could be translated if needed)
const locationDescriptions: Record<string, { de: string; en: string }> = {
  krefeld: {
    de: "Miete bei uns Minibagger, Anhänger, Stromaggregate, Eventequipment und vieles mehr für dein nächstes Projekt zum besten Preis!",
    en: "Rent mini excavators, trailers, generators, event equipment and much more for your next project at the best price!",
  },
  bonn: {
    de: "Miete bei uns Minibagger, Anhänger, Stromaggregate, Eventequipment und vieles mehr für dein nächstes Projekt zum besten Preis!",
    en: "Rent mini excavators, trailers, generators, event equipment and much more for your next project at the best price!",
  },
  muelheim: {
    de: "Miete bei uns Minibagger, Anhänger, Stromaggregate, Eventequipment und vieles mehr für dein nächstes Projekt zum besten Preis!",
    en: "Rent mini excavators, trailers, generators, event equipment and much more for your next project at the best price!",
  },
};

export default function LocationCategories() {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("en") ? "en" : "de";
  
  const location = locationId ? getLocationById(locationId) : undefined;

  if (!location) {
    return (
      <Layout>
        <div className="section-container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{t("rental.locationNotFound")}</h1>
          <Link to="/mieten">
            <Button>{t("rental.backToLocations")}</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleCategorySelect = (categoryId: string) => {
    navigate(`/mieten/${location.id}/${categoryId}`);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
  };

  const addressParts = location.address.split(", ");
  const streetAddress = addressParts[0] || "";
  const cityAddress = addressParts[1] || "";
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.address)}`;
  const description = locationDescriptions[location.id]?.[lang] || locationDescriptions[location.id]?.de || "";

  return (
    <Layout>
      <SEO
        title={`Equipment mieten in ${location.name} | SLT Rental`}
        description={description}
        canonical={`/mieten/${location.id}`}
        keywords={`Baumaschinen mieten ${location.name}, Anhänger mieten ${location.name}, Equipment ${location.name}`}
      />
      {/* Header with Location Info */}
      <section className="bg-primary py-8 lg:py-12">
        <div className="section-container">
          <Link 
            to="/mieten" 
            className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("rental.changeLocation")}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold text-primary-foreground mb-4">
                SLT Rental in {location.name}
              </h1>
              <p className="text-primary-foreground/80 text-lg mb-8">
                {description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary-foreground mb-1">{t("rental.address")}</p>
                    <p className="text-primary-foreground/80 text-sm">
                      {streetAddress}<br />
                      {cityAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary-foreground mb-1">{t("rental.contactLabel")}</p>
                    <p className="text-primary-foreground/80 text-sm">
                      <a href={`mailto:${location.email}`} className="hover:text-primary-foreground transition-colors">
                        {location.email}
                      </a><br />
                      <a href={`tel:${location.phone.replace(/\s/g, '')}`} className="hover:text-primary-foreground transition-colors">
                        {location.phone}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" className="gap-2">
                    <Navigation className="h-4 w-4" />
                    {t("rental.planRoute")}
                  </Button>
                </a>

                {locationManagers[location.id] && (
                  <a 
                    href={`mailto:${locationManagers[location.id].email}`}
                    className="flex items-center gap-3 bg-primary-foreground/10 rounded-full pl-1 pr-4 py-1 hover:bg-primary-foreground/20 transition-colors cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Avatar className="h-10 w-10 border-2 border-primary-foreground/20">
                      {locationManagers[location.id].image ? (
                        <AvatarImage 
                          src={locationManagers[location.id].image!} 
                          alt={locationManagers[location.id].name} 
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-primary-foreground leading-tight">
                        {locationManagers[location.id].name}
                      </p>
                      <p className="text-xs text-primary-foreground/70">
                        {t(locationManagers[location.id].roleKey)}
                      </p>
                    </div>
                  </a>
                )}
              </div>
            </div>

            <div className="relative">
              {locationImages[location.id] ? (
                <img 
                  src={locationImages[location.id]} 
                  alt={`SLT Rental ${location.name}`}
                  className="w-full h-64 lg:h-80 object-cover rounded-xl shadow-lg"
                />
              ) : (
                <div className="w-full h-64 lg:h-80 bg-primary-foreground/10 rounded-xl flex items-center justify-center">
                  <MapPin className="h-16 w-16 text-primary-foreground/30" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 lg:mt-12 max-w-xl">
            <ProductSearch 
              locationId={location.id}
              onCategorySelect={handleCategorySelect}
              onProductSelect={handleProductSelect}
              placeholder={t("rental.searchArticles")}
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 lg:py-16">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-xl font-bold text-foreground mb-6">
              {t("rental.categoriesAtLocation", { name: location.name })}
            </h2>
            <CategoryGrid location={location} />
          </AnimatedSection>
        </div>
      </section>

      {/* Google Reviews */}
      {getPlaceId(location.id) && (
        <section className="py-12 lg:py-16 bg-muted/30">
          <div className="section-container">
            <AnimatedSection animation="fade-in-up">
              <GoogleReviews
                placeId={getPlaceId(location.id)!}
                locationName={location.name}
                variant="full"
              />
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Weekend Info */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="section-container">
          <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl p-8 lg:p-12">
            <div className="max-w-2xl">
              <span className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium mb-4">
                💰 {t("rental.weekendRate")}
              </span>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                {t("rental.weekendTitle")}
              </h2>
              <p className="text-muted-foreground">
                {t("rental.weekendDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <ProductBookingDialog
        product={selectedProduct}
        location={location}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </Layout>
  );
}
