import { Layout } from "@/components/layout";
import { Link, useParams, Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin } from "lucide-react";
import { AnimatedSection } from "@/components/ui/animated-section";
import { solutions } from "./Loesungen";
import { productCategories } from "@/data/rentalData";

export default function LoesungDetail() {
  const { solutionId } = useParams<{ solutionId: string }>();
  const solution = solutions.find(s => s.id === solutionId);

  if (!solution) {
    return <Navigate to="/loesungen" replace />;
  }

  const Icon = solution.icon;
  const relatedCategories = productCategories.filter(cat => 
    solution.categories.includes(cat.id)
  );

  // Get other solutions for "More solutions" section
  const otherSolutions = solutions.filter(s => s.id !== solution.id).slice(0, 3);

  return (
    <Layout>
      {/* Hero Section */}
      <section className={`bg-gradient-to-br ${solution.color} py-12 lg:py-20 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10 bg-cover bg-center" />
        <div className="section-container relative z-10">
          <Link 
            to="/loesungen" 
            className="inline-flex items-center text-primary hover:text-primary/80 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Alle Lösungen
          </Link>
          
          <AnimatedSection animation="fade-in-up">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-background shadow-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-8 h-8 lg:w-10 lg:h-10 text-primary" />
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">
                  {solution.subtitle}
                </Badge>
                <h1 className="text-3xl lg:text-4xl font-bold text-headline">
                  {solution.title}
                </h1>
              </div>
            </div>
            
            <p className="text-body-text text-lg max-w-3xl mb-8">
              {solution.description}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Main Image */}
      <section className="py-8 lg:py-12">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <div className="aspect-[21/9] rounded-2xl overflow-hidden bg-muted">
              <img 
                src="/placeholder.svg" 
                alt={solution.title}
                className="w-full h-full object-cover"
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Highlights & Equipment */}
      <section className="py-8 lg:py-12">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Highlights */}
            <AnimatedSection animation="fade-in-up">
              <h2 className="text-2xl font-bold text-headline mb-6">
                Das bieten wir dir
              </h2>
              <div className="space-y-4">
                {solution.highlights.map((highlight, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl bg-surface-light hover:bg-muted/50 transition-colors"
                  >
                    <CheckCircle2 className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-body-text">{highlight}</span>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            {/* Related Categories */}
            <AnimatedSection animation="fade-in-up" delay={0.1}>
              <h2 className="text-2xl font-bold text-headline mb-6">
                Passende Produktkategorien
              </h2>
              <div className="grid gap-4">
                {relatedCategories.map((category) => (
                  <Link 
                    key={category.id}
                    to={`/mieten/krefeld/${category.id}`}
                    className="group"
                  >
                    <Card className="hover:shadow-md transition-all border-2 hover:border-primary/20">
                      <CardContent className="p-4 flex items-center gap-4">
                        {category.icon && (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <img 
                              src={category.icon} 
                              alt={category.title}
                              className="w-8 h-8 object-contain"
                            />
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
                  </Link>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Location CTA */}
      <section className="py-8 lg:py-12 bg-surface-light">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <Card className="bg-gradient-to-r from-primary to-primary-800 text-primary-foreground overflow-hidden">
              <CardContent className="p-8 lg:p-12">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="flex-1">
                    <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                      Bereit für dein Projekt?
                    </h2>
                    <p className="text-primary-foreground/80 mb-6">
                      Besuche einen unserer Standorte und lass dich persönlich beraten. 
                      Wir helfen dir, das optimale Equipment zusammenzustellen.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Link to="/standorte">
                        <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                          <MapPin className="mr-2 h-4 w-4" />
                          Standorte finden
                        </Button>
                      </Link>
                      <Link to="/kontakt">
                        <Button size="lg" variant="secondary">
                          Kontakt aufnehmen
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="hidden lg:block w-48 h-48 rounded-2xl bg-white/10 flex items-center justify-center">
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
              Weitere Lösungen entdecken
            </h2>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-3 gap-6">
            {otherSolutions.map((otherSolution, index) => {
              const OtherIcon = otherSolution.icon;
              return (
                <AnimatedSection key={otherSolution.id} animation="fade-in-up" delay={index * 0.1}>
                  <Link to={`/loesungen/${otherSolution.id}`}>
                    <Card className="h-full group hover:shadow-md transition-all border-2 hover:border-primary/20">
                      <div className={`aspect-[16/9] bg-gradient-to-br ${otherSolution.color} relative overflow-hidden`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-xl bg-background/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <OtherIcon className="w-7 h-7 text-primary" />
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-headline group-hover:text-primary transition-colors">
                          {otherSolution.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {otherSolution.subtitle}
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
