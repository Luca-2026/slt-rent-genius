import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { CategoryGrid } from "@/components/rental/CategoryGrid";
import { ProductSearch } from "@/components/rental/ProductSearch";
import { ProductBookingDialog } from "@/components/rental/ProductBookingDialog";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Phone, Mail, Navigation } from "lucide-react";
import { getLocationById, type Product } from "@/data/rentalData";
import krefeldImage from "@/assets/locations/krefeld.jpg";
import bonnImage from "@/assets/locations/bonn.webp";

// Location images mapping
const locationImages: Record<string, string> = {
  krefeld: krefeldImage,
  bonn: bonnImage,
};

// Location descriptions
const locationDescriptions: Record<string, string> = {
  krefeld: "Miete bei uns Minibagger, Anhänger, Stromaggregate, Eventequipment und vieles mehr für dein nächstes Projekt zum besten Preis!",
  bonn: "Miete bei uns Minibagger, Anhänger, Stromaggregate, Eventequipment und vieles mehr für dein nächstes Projekt zum besten Preis!",
  muelheim: "Miete bei uns Minibagger, Anhänger, Stromaggregate, Eventequipment und vieles mehr für dein nächstes Projekt zum besten Preis!",
};

export default function LocationCategories() {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const location = locationId ? getLocationById(locationId) : undefined;

  if (!location) {
    return (
      <Layout>
        <div className="section-container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Standort nicht gefunden</h1>
          <Link to="/mieten">
            <Button>Zurück zur Standortauswahl</Button>
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

  // Extract address parts
  const addressParts = location.address.split(", ");
  const streetAddress = addressParts[0] || "";
  const cityAddress = addressParts[1] || "";

  // Google Maps URL
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.address)}`;

  return (
    <Layout>
      {/* Header with Location Info */}
      <section className="bg-primary py-8 lg:py-12">
        <div className="section-container">
          <Link 
            to="/mieten" 
            className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Standort wechseln
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Text Content */}
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold text-primary-foreground mb-4">
                SLT Rental in {location.name}
              </h1>
              <p className="text-primary-foreground/80 text-lg mb-8">
                {locationDescriptions[location.id] || "Miete bei uns Equipment für dein nächstes Projekt!"}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary-foreground mb-1">Adresse</p>
                    <p className="text-primary-foreground/80 text-sm">
                      {streetAddress}<br />
                      {cityAddress}
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary-foreground mb-1">Kontakt</p>
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

              {/* Route Button */}
              <a 
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" className="gap-2">
                  <Navigation className="h-4 w-4" />
                  Route planen
                </Button>
              </a>
            </div>

            {/* Location Image */}
            <div className="relative">
              {locationImages[location.id] ? (
                <img 
                  src={locationImages[location.id]} 
                  alt={`SLT Rental Standort ${location.name}`}
                  className="w-full h-64 lg:h-80 object-cover rounded-xl shadow-lg"
                />
              ) : (
                <div className="w-full h-64 lg:h-80 bg-primary-foreground/10 rounded-xl flex items-center justify-center">
                  <MapPin className="h-16 w-16 text-primary-foreground/30" />
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="mt-8 lg:mt-12 max-w-xl">
            <ProductSearch 
              locationId={location.id}
              onCategorySelect={handleCategorySelect}
              onProductSelect={handleProductSelect}
              placeholder="Mietartikel suchen..."
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 lg:py-16">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Kategorien am Standort {location.name}
            </h2>
            <CategoryGrid location={location} />
          </AnimatedSection>
        </div>
      </section>

      {/* Weekend Info */}
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="section-container">
          <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl p-8 lg:p-12">
            <div className="max-w-2xl">
              <span className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium mb-4">
                💰 Weekend-Tarif
              </span>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Freitag leihen, Montag zurückgeben – nur 1 Tag zahlen!
              </h2>
              <p className="text-muted-foreground">
                Bei vielen Produkten gilt unser beliebter Weekend-Tarif: Du holst Freitagmittag ab 
                und bringst das Gerät Montag früh zurück – bezahlt wird nur ein Miettag.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Booking Dialog */}
      <ProductBookingDialog
        product={selectedProduct}
        location={location}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </Layout>
  );
}
