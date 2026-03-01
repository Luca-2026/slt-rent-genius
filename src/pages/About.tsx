import { Layout } from "@/components/layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Award, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AnimatedSection } from "@/components/ui/animated-section";
import { useTranslation } from "react-i18next";

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

export default function About() {
  const { t } = useTranslation();

  const stats = [
    { value: "2016", label: t("about.statFounded") },
    { value: "+3.500", label: t("about.statCustomers") },
    { value: "+800", label: t("about.statProducts") },
    { value: "3", label: t("about.statLocations") },
  ];

  const values = [
    { icon: Users, title: t("about.valueCustomerTitle"), description: t("about.valueCustomerDesc") },
    { icon: Award, title: t("about.valueQualityTitle"), description: t("about.valueQualityDesc") },
    { icon: MapPin, title: t("about.valueRegionalTitle"), description: t("about.valueRegionalDesc") },
    { icon: Calendar, title: t("about.valueFlexTitle"), description: t("about.valueFlexDesc") },
  ];

  const teamMembers = [
    { name: "Benedikt Nöchel", role: t("about.teamBenedikt"), image: imgBenedikt },
    { name: "Ersel Uzun", role: t("about.teamErsel"), image: imgErsel },
    { name: "Andreas Scherzow", role: t("about.teamAndreas"), image: null },
    { name: "Patricia Preuss", role: t("about.teamPatricia"), image: null },
    { name: "Juno", role: t("about.teamJuno"), image: imgJuno },
  ];

  const whyItems = t("about.whyItems", { returnObjects: true }) as string[];

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-12 lg:py-20">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up" delay={0}>
            <div className="max-w-3xl">
              <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
                {t("about.heroTitle")}
              </h1>
              <p className="text-lg text-primary-foreground/80">
                {t("about.heroDesc")}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-surface-light border-b border-border">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <AnimatedSection key={stat.label} animation="scale-in" delay={index * 120}>
                <div className="text-center">
                  <span className="block text-3xl lg:text-4xl font-bold text-primary">{stat.value}</span>
                  <span className="text-muted-foreground">{stat.label}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-12 lg:py-20">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="slide-in-left" delay={0}>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-6">
                  {t("about.storyTitle")}
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p dangerouslySetInnerHTML={{ __html: t("about.storyP1") }} className="[&_strong]:text-headline" />
                  <p dangerouslySetInnerHTML={{ __html: t("about.storyP2") }} className="[&_strong]:text-headline" />
                  <p dangerouslySetInnerHTML={{ __html: t("about.storyP3") }} className="[&_strong]:text-headline" />
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="slide-in-right" delay={200}>
              <div className="rounded-xl aspect-[4/3] overflow-hidden shadow-xl">
                <img src={imgTeamPhoto} alt="SLT Rental Team" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-12 lg:py-20">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up" delay={0}>
            <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-4 text-center">{t("about.teamTitle")}</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">{t("about.teamDesc")}</p>
          </AnimatedSection>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {teamMembers.map((member, index) => (
              <AnimatedSection key={member.name} animation="scale-in" delay={index * 100}>
                <div className="text-center group">
                  <Avatar className="h-24 w-24 mx-auto mb-3 ring-2 ring-transparent group-hover:ring-accent transition-all duration-300 group-hover:shadow-lg">
                    {member.image ? <AvatarImage src={member.image} alt={member.name} className="object-cover" /> : null}
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-headline text-sm group-hover:text-primary transition-colors duration-300">{member.name}</h3>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 lg:py-20 bg-surface-light">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up" delay={0}>
            <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-8 text-center">{t("about.valuesTitle")}</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <AnimatedSection key={value.title} animation="fade-in-up" delay={index * 150}>
                <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                      <value.icon className="h-7 w-7 text-accent" />
                    </div>
                    <h3 className="font-semibold text-headline mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-12 lg:py-20">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up" delay={0}>
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-4">{t("about.whyTitle")}</h2>
              <p className="text-muted-foreground">{t("about.whyDesc")}</p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {Array.isArray(whyItems) && whyItems.map((item, index) => (
              <AnimatedSection key={item} animation="fade-in-up" delay={index * 80}>
                <div className="flex items-center gap-3 bg-surface-light p-4 rounded-lg hover:shadow-md hover:bg-background transition-all duration-300 group">
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-headline">{item}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-12 lg:py-16 bg-surface-light">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up" delay={0}>
            <h2 className="text-xl font-bold text-headline mb-8 text-center">{t("about.partnersTitle")}</h2>
          </AnimatedSection>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {partners.map((partner, index) => (
              <AnimatedSection key={partner.name} animation="scale-in" delay={index * 100}>
                <a href={partner.url} target="_blank" rel="noopener noreferrer" className="aspect-[3/2] bg-background rounded-lg border border-border flex items-center justify-center p-4 hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
                  <img src={partner.logo} alt={partner.name} className="max-h-12 w-auto object-contain" />
                </a>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection animation="fade-in-up" delay={600}>
            <div className="mt-8 p-4 bg-accent/10 border border-accent/20 rounded-lg text-center">
              <p className="text-sm text-body">
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
      <section className="py-12 lg:py-16 bg-primary">
        <div className="section-container text-center">
          <AnimatedSection animation="fade-in-up" delay={0}>
            <h2 className="text-2xl lg:text-3xl font-bold text-primary-foreground mb-4">{t("about.ctaTitle")}</h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-6">{t("about.ctaDesc")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/produkte">
                <Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">{t("about.ctaProducts")}</Button>
              </Link>
              <Link to="/kontakt">
                <Button variant="outline" className="border-primary text-primary bg-primary-foreground hover:border-accent hover:bg-primary-foreground hover:text-primary">{t("about.ctaContact")}</Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}