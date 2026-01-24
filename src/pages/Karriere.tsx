import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection } from "@/components/ui/animated-section";
import { 
  Clock, 
  Laptop, 
  Coffee, 
  GraduationCap, 
  PartyPopper, 
  Shirt, 
  Award, 
  MessageSquare,
  PiggyBank,
  Flame
} from "lucide-react";
import { JobCard } from "@/components/karriere/JobCard";
import { jobListings } from "@/components/karriere/jobData";

const benefits = [
  { icon: Clock, label: "Flexible Arbeitszeiten" },
  { icon: PiggyBank, label: "Betriebliche Altersvorsorge" },
  { icon: Laptop, label: "Eigener Laptop" },
  { icon: Coffee, label: "Küche mit Getränken & Obst" },
  { icon: Flame, label: "Grillplatz" },
  { icon: GraduationCap, label: "Weiterbildungen" },
  { icon: PartyPopper, label: "Weihnachtsfeier" },
  { icon: Shirt, label: "Arbeitskleidung" },
  { icon: Award, label: "Bonussystem" },
  { icon: MessageSquare, label: "Offene Feedbackkultur" }
];

export default function Karriere() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 lg:py-24">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                Karriere bei SLT
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Werde Teil unseres Teams
              </h1>
              <p className="text-lg text-muted-foreground">
                Wir suchen motivierte Talente, die mit uns die Vermietungsbranche gestalten wollen. 
                Entdecke unsere aktuellen Stellenangebote und Benefits.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-16 bg-background">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Aktuelle Stellenangebote
            </h2>
          </AnimatedSection>

          <div className="grid gap-6 max-w-4xl mx-auto">
            {jobListings.map((job, index) => (
              <AnimatedSection key={job.id} animation="fade-in-up" delay={index * 100}>
                <JobCard job={job} index={index} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/30">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-3xl font-bold text-foreground mb-4 text-center">
              Das bieten wir unserem Team
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Bei SLT erwartet dich mehr als nur ein Job – wir bieten dir ein Arbeitsumfeld, 
              in dem du dich wohlfühlen und weiterentwickeln kannst.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {benefits.map((benefit, index) => (
              <AnimatedSection key={benefit.label} animation="fade-in-up" delay={index * 50}>
                <Card className="text-center p-6 hover:shadow-md transition-shadow border-border hover:border-primary/30">
                  <CardContent className="p-0">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="h-7 w-7 text-primary" />
                    </div>
                    <p className="font-medium text-foreground text-sm">
                      {benefit.label}
                    </p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="section-container text-center">
          <AnimatedSection animation="fade-in-up">
            <h2 className="text-3xl font-bold mb-4">
              Keine passende Stelle gefunden?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Wir freuen uns auch über Initiativbewerbungen! Schick uns einfach deine Unterlagen 
              und erzähle uns, warum du zu SLT passt.
            </p>
            <a href="mailto:karriere@slt-rental.de">
              <Button size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
                Initiativbewerbung senden
              </Button>
            </a>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
