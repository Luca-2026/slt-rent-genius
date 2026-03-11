import { Layout } from "@/components/layout";
import { SEO, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Award, MapPin, Calendar, CheckCircle2, Mail, ArrowRight } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AnimatedSection } from "@/components/ui/animated-section";
import { useTranslation } from "react-i18next";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useState, useEffect, useRef } from "react";
import type { CarouselApi } from "@/components/ui/carousel";

// Team images
import imgBenedikt from "@/assets/team/benedikt-noechel.jpg";
import imgErsel from "@/assets/team/ersel-uzun.jpg";
import imgJuno from "@/assets/team/juno.png";
import imgTeamPhoto from "@/assets/team/team-photo.jpg";

// Partner logos
import logoKramer from "@/assets/partners/kramer.png";
import logoEibenstock from "@/assets/partners/eibenstock.jpg";
import logoBosch from "@/assets/partners/bosch.png";
import logoDoosan from "@/assets/partners/doosan.png";
import logoBaumax from "@/assets/partners/baumax.png";
import logoZoomlion from "@/assets/partners/zoomlion.png";

const partners = [
  { name: "Bosch", logo: logoBosch, url: "https://www.bosch-professional.com/de/de/" },
  { name: "Kramer", logo: logoKramer, url: "https://www.kramer.de/" },
  { name: "Eibenstock", logo: logoEibenstock, url: "https://www.eibenstock.de/" },
  { name: "Doosan", logo: logoDoosan, url: "https://www.doosanportablepower.eu/" },
  { name: "Baumax", logo: logoBaumax, url: "https://baumax-baumaschinen.de/" },
  { name: "Zoomlion", logo: logoZoomlion, url: "https://www.zoomlion-nrw.de/" },
];

function TeamMemberCard({ member, showEmail }: { member: { name: string; role: string; image: string | null; email: string | null }; showEmail?: boolean }) {
  const initials = member.name.split(' ').map(n => n[0]).join('');
  const avatarContent = (
    <Avatar className="h-20 w-20 md:h-20 md:w-20 lg:h-28 lg:w-28 xl:h-32 xl:w-32 mx-auto mb-2 md:mb-3 lg:mb-4 ring-2 ring-transparent group-hover:ring-accent transition-all duration-500 group-hover:shadow-xl group-hover:shadow-accent/10 overflow-visible [&>span]:overflow-hidden [&>span]:rounded-full [&>img]:rounded-full">
      {member.image ? <AvatarImage src={member.image} alt={member.name} className="object-cover" /> : null}
      <AvatarFallback className="bg-primary/10 text-primary text-xl lg:text-2xl">{initials}</AvatarFallback>
    </Avatar>
  );

  return (
    <div className="text-center group">
      {member.email ? (
        <a href={`mailto:${member.email}`} className="block cursor-pointer">
          {avatarContent}
        </a>
      ) : avatarContent}
      <h3 className="font-semibold text-headline text-sm lg:text-base group-hover:text-primary transition-colors duration-300">{member.name}</h3>
      <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">{member.role}</p>
      {member.email && (
        <a
          href={`mailto:${member.email}`}
          className={`inline-flex items-center gap-1 text-[10px] lg:text-xs text-primary mt-1.5 hover:underline opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${showEmail ? "!opacity-100" : ""}`}
        >
          <Mail className="h-3 w-3" /> E-Mail
        </a>
      )}
    </div>
  );
}

export default function About() {
  const { t } = useTranslation();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const stats = [
    { value: "2016", label: t("about.statFounded") },
    { value: "+3.500", label: t("about.statCustomers") },
    { value: "+1.700", label: t("about.statProducts") },
    { value: "3", label: t("about.statLocations") },
  ];

  const values = [
    { icon: Users, title: t("about.valueCustomerTitle"), description: t("about.valueCustomerDesc") },
    { icon: Award, title: t("about.valueQualityTitle"), description: t("about.valueQualityDesc") },
    { icon: MapPin, title: t("about.valueRegionalTitle"), description: t("about.valueRegionalDesc") },
    { icon: Calendar, title: t("about.valueFlexTitle"), description: t("about.valueFlexDesc") },
  ];

  const teamMembers = [
    { name: "Benedikt Nöchel", role: t("about.teamBenedikt"), image: imgBenedikt, email: "b.noechel@slt-rental.de" },
    { name: "Ersel Uzun", role: t("about.teamErsel"), image: imgErsel, email: "e.uzun@slt-rental.de" },
    { name: "Andreas Scherzow", role: t("about.teamAndreas"), image: null, email: "a.scherzow@slt-rental.de" },
    { name: "Patricia Preuss", role: t("about.teamPatricia"), image: null, email: "p.preuss@slt-rental.de" },
    { name: "Juno", role: t("about.teamJuno"), image: imgJuno, email: null },
  ];

  const whyItems = t("about.whyItems", { returnObjects: true }) as string[];

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    onSelect();
    return () => { carouselApi.off("select", onSelect); };
  }, [carouselApi]);

  // Autoplay for mobile carousel
  useEffect(() => {
    if (!carouselApi) return;
    const interval = setInterval(() => {
      carouselApi.scrollNext();
    }, 3500);
    // Pause on interaction
    const stop = () => clearInterval(interval);
    carouselApi.on("pointerDown", stop);
    return () => {
      clearInterval(interval);
      carouselApi.off("pointerDown", stop);
    };
  }, [carouselApi]);

  return (
    <Layout>
      <SEO
        title="Über uns – SLT Rental"
        description="Seit 2016 Ihr Partner für Baumaschinen- und Equipment-Vermietung in NRW. 3 Standorte, +3.500 Kunden, +1.700 Produkte. Lernen Sie unser Team kennen."
        canonical="/ueber-uns"
        jsonLd={SLT_BREADCRUMB_JSONLD([{ name: "Home", url: "/" }, { name: "Über uns", url: "/ueber-uns" }])}
      />

      {/* Hero */}
      <section className="bg-primary py-8 md:py-10 lg:py-24 xl:py-28 relative overflow-hidden">
        {/* Decorative background elements for desktop */}
        <div className="hidden lg:block absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-foreground/5 to-transparent" />
        <div className="hidden lg:block absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-accent/5 blur-3xl" />
        <div className="section-container relative z-10">
          <AnimatedSection animation="fade-in-up" delay={0}>
            <div className="max-w-3xl lg:max-w-4xl">
              <h1 className="text-xl md:text-2xl lg:text-5xl xl:text-6xl font-bold text-primary-foreground mb-2 md:mb-3 lg:mb-6 leading-tight">
                {t("about.heroTitle")}
              </h1>
              <p className="text-sm md:text-base lg:text-xl text-primary-foreground/80 leading-relaxed max-w-2xl">
                {t("about.heroDesc")}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats */}
      <section className="py-5 md:py-6 lg:py-10 xl:py-12 bg-surface-light border-b border-border">
        <div className="section-container">
          <div className="grid grid-cols-4 gap-2 md:gap-4 lg:gap-8">
            {stats.map((stat, index) => (
              <AnimatedSection key={stat.label} animation="scale-in" delay={index * 120}>
                <div className="text-center lg:py-4">
                  <span className="block text-lg md:text-2xl lg:text-5xl xl:text-6xl font-bold text-primary tracking-tight">{stat.value}</span>
                  <span className="text-muted-foreground text-[10px] md:text-xs lg:text-base xl:text-lg mt-1 block">{stat.label}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-8 md:py-12 lg:py-24 xl:py-28">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-16 xl:gap-20 items-center">
            <AnimatedSection animation="slide-in-left" delay={0}>
              <div>
                <h2 className="text-lg md:text-xl lg:text-4xl xl:text-5xl font-bold text-headline mb-3 md:mb-4 lg:mb-8 leading-tight">
                  {t("about.storyTitle")}
                </h2>
                <div className="space-y-2.5 md:space-y-3 lg:space-y-5 text-muted-foreground text-xs md:text-sm lg:text-base xl:text-lg leading-relaxed">
                  <p dangerouslySetInnerHTML={{ __html: t("about.storyP1") }} className="[&_strong]:text-headline [&_strong]:font-semibold" />
                  <p dangerouslySetInnerHTML={{ __html: t("about.storyP2") }} className="[&_strong]:text-headline [&_strong]:font-semibold" />
                  <p dangerouslySetInnerHTML={{ __html: t("about.storyP3") }} className="[&_strong]:text-headline [&_strong]:font-semibold" />
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="slide-in-right" delay={200}>
              <div className="rounded-2xl lg:rounded-3xl aspect-[4/3] overflow-hidden shadow-xl lg:shadow-2xl group">
                <img src={imgTeamPhoto} alt="SLT Rental Team" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-8 md:py-12 lg:py-24 xl:py-28 bg-surface-light">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up" delay={0}>
            <h2 className="text-lg md:text-xl lg:text-4xl xl:text-5xl font-bold text-headline mb-2 md:mb-3 lg:mb-4 text-center">{t("about.teamTitle")}</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-5 md:mb-6 lg:mb-12 text-xs md:text-sm lg:text-lg">{t("about.teamDesc")}</p>
          </AnimatedSection>

          {/* Desktop: grid */}
          <div className="hidden md:grid md:grid-cols-5 gap-4 lg:gap-8 xl:gap-10">
            {teamMembers.map((member, index) => (
              <AnimatedSection key={member.name} animation="fade-in-up" delay={index * 120}>
                <TeamMemberCard member={member} />
              </AnimatedSection>
            ))}
          </div>

          {/* Mobile: Carousel */}
          <div className="md:hidden">
            <Carousel setApi={setCarouselApi} opts={{ align: "center", loop: true }} className="w-full">
              <CarouselContent className="-ml-2">
                {teamMembers.map((member) => (
                  <CarouselItem key={member.name} className="pl-2 basis-[70%]">
                    <TeamMemberCard member={member} showEmail />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <div className="flex justify-center gap-1.5 mt-3">
              {teamMembers.map((_, i) => (
                <button
                  key={i}
                  onClick={() => carouselApi?.scrollTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? "w-4 bg-primary" : "w-1.5 bg-primary/30"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-8 md:py-12 lg:py-24 xl:py-28">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up" delay={0}>
            <h2 className="text-lg md:text-xl lg:text-4xl xl:text-5xl font-bold text-headline mb-4 md:mb-6 lg:mb-12 text-center">{t("about.valuesTitle")}</h2>
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-8">
            {values.map((value, index) => (
              <AnimatedSection key={value.title} animation="fade-in-up" delay={index * 150}>
                <Card className="h-full hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group border-border/50 lg:border-transparent lg:hover:border-accent/20">
                  <CardContent className="p-3 md:p-4 lg:p-8 xl:p-10 text-center">
                    <div className="w-9 h-9 md:w-10 md:h-10 lg:w-16 lg:h-16 xl:w-20 xl:h-20 bg-accent/10 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-3 lg:mb-6 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-500">
                      <value.icon className="h-4 w-4 md:h-5 md:w-5 lg:h-8 lg:w-8 xl:h-10 xl:w-10 text-accent" />
                    </div>
                    <h3 className="font-semibold text-headline mb-1 md:mb-1.5 lg:mb-3 text-xs md:text-sm lg:text-lg xl:text-xl leading-tight">{value.title}</h3>
                    <p className="text-[10px] md:text-xs lg:text-sm xl:text-base text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-8 md:py-12 lg:py-24 xl:py-28 bg-surface-light">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up" delay={0}>
            <div className="max-w-3xl lg:max-w-4xl mx-auto text-center mb-6 md:mb-8 lg:mb-14">
              <h2 className="text-lg md:text-xl lg:text-4xl xl:text-5xl font-bold text-headline mb-2 md:mb-3 lg:mb-5">{t("about.whyTitle")}</h2>
              <p className="text-muted-foreground text-xs md:text-sm lg:text-lg">{t("about.whyDesc")}</p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-3 lg:gap-5 max-w-5xl mx-auto">
            {Array.isArray(whyItems) && whyItems.map((item, index) => (
              <AnimatedSection key={item} animation="fade-in-up" delay={index * 80}>
                <div className="flex items-center gap-2.5 md:gap-3 lg:gap-4 bg-background p-3 md:p-3.5 lg:p-5 xl:p-6 rounded-lg lg:rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-400 group border border-transparent hover:border-accent/10">
                  <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-accent shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-headline text-xs md:text-sm lg:text-base xl:text-lg">{item}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-8 md:py-10 lg:py-20 xl:py-24">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up" delay={0}>
            <h2 className="text-base md:text-lg lg:text-2xl xl:text-3xl font-bold text-headline mb-4 md:mb-6 lg:mb-10 text-center">{t("about.partnersTitle")}</h2>
          </AnimatedSection>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 lg:gap-6 xl:gap-8 max-w-5xl mx-auto">
            {partners.map((partner, index) => (
              <AnimatedSection key={partner.name} animation="scale-in" delay={index * 100}>
                <a href={partner.url} target="_blank" rel="noopener noreferrer" className="aspect-[3/2] bg-surface-light rounded-lg lg:rounded-xl border border-border flex items-center justify-center p-2.5 md:p-3 lg:p-5 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all duration-400 group">
                  <img src={partner.logo} alt={partner.name} className="max-h-8 md:max-h-10 lg:max-h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-300" />
                </a>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection animation="fade-in-up" delay={600}>
            <div className="mt-4 md:mt-6 lg:mt-10 p-3 md:p-4 lg:p-6 bg-accent/10 border border-accent/20 rounded-lg lg:rounded-xl text-center max-w-4xl mx-auto">
              <p className="text-[10px] md:text-xs lg:text-sm xl:text-base text-body leading-relaxed">
                <strong className="text-headline">{t("about.partnersTitle")}:</strong>{" "}
                {t("about.partnerDealerNote").split("Zoomlion")[0]}
                <a href="https://www.zoomlion-nrw.de/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">Zoomlion</a>
                {t("about.partnerDealerNote").split("Zoomlion")[1]?.split("Baumax")[0]}
                <a href="https://baumax-baumaschinen.de/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">Baumax</a>
                {t("about.partnerDealerNote").split("Baumax")[1]}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 md:py-10 lg:py-24 xl:py-28 bg-primary relative overflow-hidden">
        <div className="hidden lg:block absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-primary-foreground/5 to-transparent" />
        <div className="hidden lg:block absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="section-container text-center relative z-10">
          <AnimatedSection animation="fade-in-up" delay={0}>
            <h2 className="text-lg md:text-xl lg:text-4xl xl:text-5xl font-bold text-primary-foreground mb-2 md:mb-3 lg:mb-5">{t("about.ctaTitle")}</h2>
            <p className="text-primary-foreground/80 max-w-xl lg:max-w-2xl mx-auto mb-4 md:mb-5 lg:mb-8 text-xs md:text-sm lg:text-lg">{t("about.ctaDesc")}</p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link to="/produkte">
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-cta-orange-hover text-sm md:text-base lg:text-lg md:px-6 md:py-2.5 lg:px-8 lg:py-3 group">
                  {t("about.ctaProducts")}
                  <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              <Link to="/kontakt">
                <Button size="sm" variant="outline" className="border-primary text-primary bg-primary-foreground hover:border-accent hover:bg-primary-foreground hover:text-primary text-sm md:text-base lg:text-lg md:px-6 md:py-2.5 lg:px-8 lg:py-3">
                  {t("about.ctaContact")}
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
