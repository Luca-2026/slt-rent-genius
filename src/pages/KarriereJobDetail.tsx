import { useMemo, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO, SLT_BREADCRUMB_JSONLD, SLT_JOBPOSTING_JSONLD, SLT_FAQ_JSONLD } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/ui/animated-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MapPin,
  Briefcase,
  Calendar,
  CheckCircle2,
  Euro,
  ChevronRight,
  Mail,
  Phone,
} from "lucide-react";
import { jobListings } from "@/components/karriere/jobData";
import { QuickApplyForm } from "@/components/karriere/QuickApplyForm";
import { ApplicationWizard } from "@/components/karriere/ApplicationWizard";

const BASE_URL = "https://www.slt-rental.de";

function formatSalary(min?: number, max?: number, unit?: "YEAR" | "MONTH" | "HOUR") {
  if (!min || !max) return null;
  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(n);
  const suffix = unit === "HOUR" ? "€/Std." : unit === "MONTH" ? "€/Monat" : "€/Jahr";
  return `${fmt(min)}–${fmt(max)} ${suffix}`;
}

export default function KarriereJobDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [showWizard, setShowWizard] = useState(false);

  const job = useMemo(
    () => jobListings.find((j) => j.slug === slug || j.id === slug),
    [slug]
  );

  if (!job) {
    return <Navigate to="/karriere" replace />;
  }

  const datePosted = job.datePosted ?? new Date().toISOString().slice(0, 10);
  const validThrough =
    job.validThrough ??
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().slice(0, 10);
  const canonical = `/karriere/${job.slug}`;
  const url = `${BASE_URL}${canonical}`;

  const descriptionHtml = `
    <p>${job.description}</p>
    ${job.tasks?.length ? `<h3>Deine Aufgaben</h3><ul>${job.tasks.map((t) => `<li>${t}</li>`).join("")}</ul>` : ""}
    <h3>Was du mitbringst</h3>
    <ul>${job.requirements.map((r) => `<li>${r}</li>`).join("")}</ul>
    <h3>Was wir bieten</h3>
    <ul>${job.benefits.map((b) => `<li>${b}</li>`).join("")}</ul>
  `.trim();

  const jobJsonLd = SLT_JOBPOSTING_JSONLD({
    title: job.title,
    description: descriptionHtml,
    datePosted,
    validThrough,
    employmentType: job.employmentType,
    identifier: job.id,
    url,
    industry: job.industry,
    locations: job.locations,
    remote: job.remote,
    baseSalary:
      job.salaryMin && job.salaryMax
        ? { min: job.salaryMin, max: job.salaryMax, unitText: job.salaryUnit ?? "YEAR" }
        : undefined,
  });

  const breadcrumbJsonLd = SLT_BREADCRUMB_JSONLD([
    { name: "Home", url: "/" },
    { name: "Karriere", url: "/karriere" },
    { name: job.title, url: canonical },
  ]);

  const faqJsonLd = job.faqs?.length ? SLT_FAQ_JSONLD(job.faqs) : null;
  const jsonLd = [jobJsonLd, breadcrumbJsonLd, ...(faqJsonLd ? [faqJsonLd] : [])];

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryUnit);
  const relatedJobs = jobListings.filter((j) => j.id !== job.id).slice(0, 3);

  return (
    <Layout>
      <SEO
        title={job.seoTitle ?? `${job.title} – Job in ${job.location}`}
        description={
          job.seoDescription ??
          `${job.title} bei SLT Rental in ${job.location}. Jetzt direkt online bewerben.`
        }
        canonical={canonical}
        ogType="article"
        jsonLd={jsonLd}
      />

      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="section-container py-3">
          <nav className="text-sm text-muted-foreground flex items-center flex-wrap gap-1">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/karriere" className="hover:text-primary">Karriere</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground line-clamp-1">{job.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 lg:py-16">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <div className="max-w-4xl">
              <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
                {job.industry ?? "Stellenangebot"}
              </Badge>
              <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">{job.title}</h1>
              {job.shortPitch && (
                <p className="text-lg text-muted-foreground mb-6 max-w-3xl">{job.shortPitch}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />{job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-primary" />{job.type}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />Start: {job.startDate}
                </span>
                {salary && (
                  <span className="flex items-center gap-1.5">
                    <Euro className="h-4 w-4 text-primary" />{salary}
                  </span>
                )}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Main content */}
      <section className="py-12 bg-background">
        <div className="section-container grid lg:grid-cols-3 gap-10">
          {/* Left: details */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Über die Rolle</h2>
              <p className="text-muted-foreground leading-relaxed">{job.description}</p>
            </div>

            {job.tasks && job.tasks.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Deine Aufgaben</h2>
                <ul className="space-y-2">
                  {job.tasks.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Was du mitbringst</h2>
              <ul className="space-y-2">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Das bieten wir dir</h2>
              <ul className="space-y-2">
                {job.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Über SLT Rental</h2>
              <p className="text-muted-foreground leading-relaxed">
                SLT Rental ist eines der wachstumsstärksten Vermietunternehmen für Baumaschinen,
                Anhänger und Eventtechnik in NRW. An unseren drei Standorten in Krefeld, Bonn und
                Mülheim an der Ruhr arbeitet ein familiäres Team mit modernster Ausstattung,
                digitalen Prozessen und KI-Tools – damit unsere Kunden den besten Service bekommen
                und du jeden Tag mit den besten Werkzeugen arbeitest.
              </p>
            </div>

            {job.faqs && job.faqs.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Häufige Fragen</h2>
                <Accordion type="single" collapsible className="w-full">
                  {job.faqs.map((f, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger className="text-left">{f.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {f.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {/* Mobile apply (full wizard) */}
            <div className="lg:hidden border-t border-border pt-8" id="bewerben-mobile">
              <h2 className="text-2xl font-bold text-foreground mb-4">Jetzt bewerben</h2>
              {!showWizard ? (
                <>
                  <QuickApplyForm job={job} />
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setShowWizard(true)}
                      className="text-sm text-primary underline"
                    >
                      Lieber ausführlich bewerben?
                    </button>
                  </div>
                </>
              ) : (
                <ApplicationWizard job={job} onClose={() => setShowWizard(false)} />
              )}
            </div>
          </div>

          {/* Right: sticky apply card */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <Card className="border-primary/30 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-1">Schnell bewerben</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    In 30 Sekunden – ohne Anschreiben. Antwort innerhalb von 5 Werktagen.
                  </p>
                  {!showWizard ? (
                    <>
                      <QuickApplyForm job={job} />
                      <div className="text-center mt-4">
                        <button
                          type="button"
                          onClick={() => setShowWizard(true)}
                          className="text-sm text-primary underline"
                        >
                          Lieber ausführlich bewerben?
                        </button>
                      </div>
                    </>
                  ) : (
                    <ApplicationWizard job={job} onClose={() => setShowWizard(false)} />
                  )}
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-5 text-sm space-y-3">
                  <p className="font-medium text-foreground">Fragen vorab?</p>
                  <a
                    href="tel:+4921514179904"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                  >
                    <Phone className="h-4 w-4" /> 02151 417 99 04
                  </a>
                  <a
                    href="mailto:karriere@slt-rental.de"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                  >
                    <Mail className="h-4 w-4" /> karriere@slt-rental.de
                  </a>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </section>

      {/* Related jobs */}
      {relatedJobs.length > 0 && (
        <section className="py-12 bg-muted/30 border-t border-border">
          <div className="section-container">
            <h2 className="text-2xl font-bold text-foreground mb-6">Weitere offene Stellen</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedJobs.map((rj) => (
                <Link
                  key={rj.id}
                  to={`/karriere/${rj.slug}`}
                  className="block group"
                >
                  <Card className="h-full hover:border-primary/40 transition-colors">
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                        {rj.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{rj.location}</span>
                        <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{rj.type}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background border-t border-border p-3 shadow-lg">
        <Button
          asChild
          size="lg"
          className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover"
        >
          <a href="#bewerben-mobile">Jetzt bewerben</a>
        </Button>
      </div>
      <div className="lg:hidden h-20" aria-hidden />
    </Layout>
  );
}
