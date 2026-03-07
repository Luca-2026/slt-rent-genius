import { Layout } from "@/components/layout";
import { SEO, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
import { Link, useParams, Navigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Construction, ShieldCheck, Truck, ClipboardList, ExternalLink } from "lucide-react";
import { AnimatedSection } from "@/components/ui/animated-section";
import { solutionData } from "./Loesungen";
import { productCategories } from "@/data/rentalData";
import { LocationSelectDialog } from "@/components/solutions/LocationSelectDialog";
import { useTranslation } from "react-i18next";
import { useTranslatedCategories } from "@/hooks/useTranslatedProduct";

export default function LoesungDetail() {
  const { t } = useTranslation();
  const { solutionId } = useParams<{ solutionId: string }>();
  const solution = solutionData.find(s => s.id === solutionId);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();

  if (!solution) {
    return <Navigate to="/loesungen" replace />;
  }

  const Icon = solution.icon;
  const rawRelatedCategories = productCategories.filter(cat => 
    solution.categories.includes(cat.id)
  );
  const relatedCategories = useTranslatedCategories(rawRelatedCategories);

  const otherSolutions = solutionData.filter(s => s.id !== solution.id).slice(0, 3);

  const title = t(`solutions.items.${solution.id}.title`);
  const subtitle = t(`solutions.items.${solution.id}.subtitle`);
  const description = t(`solutions.items.${solution.id}.description`);
  const highlights = t(`solutions.items.${solution.id}.highlights`, { returnObjects: true }) as string[];

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setLocationDialogOpen(true);
  };

  const handleImageClick = (imageIndex: number) => {
    const categoryId = solution.imageCategories?.[imageIndex] || solution.categories[0];
    setSelectedCategoryId(categoryId);
    setLocationDialogOpen(true);
  };

  return (
    <Layout>
      <SEO
        title={`${title} – Mietlösungen | SLT Rental`}
        description={`${subtitle} – ${description.slice(0, 120)}...`}
        canonical={`/loesungen/${solution.id}`}
        jsonLd={SLT_BREADCRUMB_JSONLD([{ name: "Home", url: "/" }, { name: "Lösungen", url: "/loesungen" }, { name: title, url: `/loesungen/${solution.id}` }])}
      />
      <LocationSelectDialog
        open={locationDialogOpen}
        onOpenChange={setLocationDialogOpen}
        targetCategoryId={selectedCategoryId}
        title={t("solutions.selectLocation")}
        description={t("solutions.selectLocationDesc")}
      />

      {/* Hero Section */}
      <section className={`bg-gradient-to-br ${solution.color} py-12 lg:py-20 relative overflow-hidden`}>
        <div className="absolute inset-0">
          <img src={solution.image} alt={`${title} – SLT Rental Lösungen`} className="w-full h-full object-cover opacity-15" />
        </div>
        <div className="section-container relative z-10">
          <Link 
            to="/loesungen" 
            className="inline-flex items-center text-primary hover:text-primary/80 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("solutions.allSolutions")}
          </Link>
          
          <AnimatedSection animation="fade-in-up">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-background shadow-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-8 h-8 lg:w-10 lg:h-10 text-primary" />
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">
                  {subtitle}
                </Badge>
                <h1 className="text-3xl lg:text-4xl font-bold text-headline">
                  {title}
                </h1>
              </div>
            </div>
            
            <p className="text-body-text text-lg max-w-3xl mb-8">
              {description}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="py-8 lg:py-12">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            {solution.images && solution.images.length > 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {solution.images.map((img, index) => {
                  const categoryId = solution.imageCategories?.[index] || solution.categories[0];
                  const category = relatedCategories.find(c => c.id === categoryId);
                  const categoryTitle = category?.title || categoryId;
                  return (
                    <button
                      key={index}
                      className={`${index === 0 ? 'md:col-span-2 aspect-[16/9] rounded-2xl' : 'aspect-[4/3] rounded-xl'} overflow-hidden bg-muted cursor-pointer group relative`}
                      onClick={() => handleImageClick(index)}
                    >
                      <img src={img} alt={`${title} ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <span className="text-sm font-medium text-white">{categoryTitle}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="aspect-[21/9] rounded-2xl overflow-hidden bg-muted">
                <img src={solution.image} alt={title} className="w-full h-full object-cover" />
              </div>
            )}
          </AnimatedSection>
        </div>
      </section>

      {/* Highlights & Equipment */}
      <section className="py-8 lg:py-12">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12">
            <AnimatedSection animation="fade-in-up">
              <h2 className="text-2xl font-bold text-headline mb-6">
                {t("solutions.whatWeOffer")}
              </h2>
              <div className="space-y-4">
                {Array.isArray(highlights) && highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-surface-light hover:bg-muted/50 transition-colors">
                    <CheckCircle2 className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-body-text">{highlight}</span>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-in-up" delay={0.1}>
              <h2 className="text-2xl font-bold text-headline mb-6">
                {t("solutions.relatedCategories")}
              </h2>
              <div className="grid gap-4">
                {relatedCategories.map((category) => (
                  <button key={category.id} onClick={() => handleCategoryClick(category.id)} className="group text-left w-full">
                    <Card className="hover:shadow-md transition-all border-2 hover:border-primary/20">
                      <CardContent className="p-4 flex items-center gap-4">
                        {category.icon && (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <img src={category.icon} alt={category.title} className="w-8 h-8 object-contain" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-headline group-hover:text-primary transition-colors">
                            {category.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {category.description}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </CardContent>
                    </Card>
                  </button>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Dienstleistungen Section */}
      {(solution.id === "events-veranstaltungen" || solution.id === "tiefbau-erdbewegung" || solution.id === "kindergeburtstage") && (
        <section className="py-8 lg:py-12 bg-surface-light">
          <div className="section-container">
            <AnimatedSection animation="fade-in-up">
              <h2 className="text-2xl font-bold text-headline mb-2">
                Unsere Dienstleistungen
              </h2>
              <p className="text-muted-foreground mb-6">
                Wir bieten Ihnen den kompletten Service – nicht nur die Vermietung.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {solution.id === "tiefbau-erdbewegung" && (
                  <>
                    <Card className="border-2 hover:border-primary/30 transition-all">
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ShieldCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-headline mb-1">Verkehrssicherung & Absperrplanung</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Komplette Absperrplanung, Halteverbotszonen einrichten, Antragsformulare und Koordination mit Straßenverkehrsbehörden & Bauämtern.
                          </p>
                          <a href="https://www.slt-infra.de" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-accent font-medium hover:underline">
                            www.slt-infra.de <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-2 hover:border-primary/30 transition-all">
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ClipboardList className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-headline mb-1">Projektplanung & Behördenkoordination</h3>
                          <p className="text-sm text-muted-foreground">
                            Von der Bedarfsermittlung über Genehmigungsanträge bis zur Abstimmung mit Bauämtern – wir übernehmen die komplette Koordination.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
                {(solution.id === "events-veranstaltungen" || solution.id === "kindergeburtstage") && (
                  <>
                    <Card className="border-2 hover:border-primary/30 transition-all">
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Construction className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-headline mb-1">Auf- & Abbau</h3>
                          <p className="text-sm text-muted-foreground">
                            Professioneller Auf- und Abbau von Zelten, Bühnen, Möbeln, Beleuchtung und Beschallung – alles aus einer Hand.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-2 hover:border-primary/30 transition-all">
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Truck className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-headline mb-1">Anlieferung & Abholung</h3>
                          <p className="text-sm text-muted-foreground">
                            Flexible Lieferung direkt zu Ihrem Veranstaltungsort – wir bringen alles, bauen auf und holen nach dem Event wieder ab.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
                <Card className="border-2 hover:border-primary/30 transition-all md:col-span-2">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-headline mb-1">Individuelle Beratung</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Sie haben ein spezielles Projekt? Kontaktieren Sie uns – wir erstellen Ihnen ein maßgeschneidertes Angebot mit allen Dienstleistungen.
                      </p>
                      <Link to="/kontakt" className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                        Jetzt anfragen <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      <section className="py-8 lg:py-12 bg-surface-light">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <Card className="bg-gradient-to-r from-primary to-primary-800 text-primary-foreground overflow-hidden">
              <CardContent className="p-8 lg:p-12">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="flex-1">
                    <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                      {t("solutions.readyForProject")}
                    </h2>
                    <p className="text-primary-foreground/80 mb-6">
                      {t("solutions.readyForProjectDesc")}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Link to="/standorte">
                        <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                          <MapPin className="mr-2 h-4 w-4" />
                          {t("solutions.findLocations")}
                        </Button>
                      </Link>
                      <Link to="/kontakt">
                        <Button size="lg" variant="secondary">
                          {t("solutions.contactUs")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="hidden lg:flex w-48 h-48 rounded-2xl bg-white/10 items-center justify-center">
                    <Icon className="w-24 h-24 text-white/50" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* More Solutions */}
      <section className="py-12 lg:py-16">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-2xl font-bold text-headline mb-8">
              {t("solutions.moreSolutions")}
            </h2>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-3 gap-6">
            {otherSolutions.map((otherSolution, index) => {
              const OtherIcon = otherSolution.icon;
              const otherTitle = t(`solutions.items.${otherSolution.id}.title`);
              const otherSubtitle = t(`solutions.items.${otherSolution.id}.subtitle`);
              return (
                <AnimatedSection key={otherSolution.id} animation="fade-in-up" delay={index * 0.1}>
                  <Link to={`/loesungen/${otherSolution.id}`}>
                    <Card className="h-full group hover:shadow-md transition-all border-2 hover:border-primary/20">
                      <div className="aspect-[16/9] relative overflow-hidden">
                        {otherSolution.image ? (
                          <img 
                            src={otherSolution.image} 
                            alt={otherTitle} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${otherSolution.color}`} />
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-xl bg-background/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <OtherIcon className="w-7 h-7 text-primary" />
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-headline group-hover:text-primary transition-colors">
                          {otherTitle}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {otherSubtitle}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
