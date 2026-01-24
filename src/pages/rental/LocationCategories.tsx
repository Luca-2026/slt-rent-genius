import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { CategoryGrid } from "@/components/rental/CategoryGrid";
import { ProductSearch } from "@/components/rental/ProductSearch";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Phone } from "lucide-react";
import { getLocationById } from "@/data/rentalData";

export default function LocationCategories() {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  
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

  return (
    <Layout>
      {/* Header */}
      <section className="bg-primary py-8 lg:py-12">
        <div className="section-container">
          <Link 
            to="/mieten" 
            className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Standort wechseln
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-foreground">
                    {location.shortName}
                  </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-primary-foreground">
                  {location.name}
                </h1>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-primary-foreground/80">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {location.address}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  {location.phone}
                </span>
              </div>
            </div>

            {/* Search */}
            <div className="lg:w-96">
              <ProductSearch 
                locationId={location.id}
                onCategorySelect={handleCategorySelect}
                placeholder="Kategorie suchen..."
              />
            </div>
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
    </Layout>
  );
}
