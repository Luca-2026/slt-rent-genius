import { Layout } from "@/components/layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Award, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Team images
import imgBenedikt from "@/assets/team/benedikt-noechel.jpg";
import imgErsel from "@/assets/team/ersel-uzun.jpg";
import imgJuno from "@/assets/team/juno.png";

const stats = [
  { value: "2016", label: "Gründung" },
  { value: "+3.500", label: "Kunden" },
  { value: "+800", label: "Produkte" },
  { value: "3", label: "Standorte" },
];

const values = [
  {
    icon: Users,
    title: "Kundenorientierung",
    description: "Persönliche Beratung und individuelle Lösungen stehen bei uns im Mittelpunkt.",
  },
  {
    icon: Award,
    title: "Qualität",
    description: "Regelmäßig gewartetes Equipment und zuverlässiger Service.",
  },
  {
    icon: MapPin,
    title: "Regionalität",
    description: "3 Standorte in NRW – immer in deiner Nähe mit schneller Verfügbarkeit.",
  },
  {
    icon: Calendar,
    title: "Flexibilität",
    description: "Von einem Tag bis mehrere Monate – wir passen uns deinem Projekt an.",
  },
];

const partners = [
  "Partner 1",
  "Partner 2",
  "Partner 3",
  "Partner 4",
  "Partner 5",
  "Partner 6",
];

const teamMembers = [
  {
    name: "Benedikt Nöchel",
    role: "Standortleiter Krefeld",
    image: imgBenedikt,
  },
  {
    name: "Ersel Uzun",
    role: "Standortleiter Bonn",
    image: imgErsel,
  },
  {
    name: "Andreas Scherzow",
    role: "Standortleiter Mülheim",
    image: null,
  },
  {
    name: "Patricia Preuss",
    role: "Backoffice",
    image: null,
  },
  {
    name: "Juno",
    role: "Vermietprofi auf vier Pfoten",
    image: imgJuno,
  },
];

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-12 lg:py-20">
        <div className="section-container">
          <div className="max-w-3xl">
            <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
              Über SLT Rental
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Seit 2016 sind wir dein zuverlässiger Partner für Baumaschinen, Anhänger und 
              Equipment-Vermietung in Nordrhein-Westfalen. Was als kleine Idee begann, ist heute 
              ein Unternehmen mit über 800 Mietprodukten an 3 Standorten.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-surface-light border-b border-border">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <span className="block text-3xl lg:text-4xl font-bold text-primary">{stat.value}</span>
                <span className="text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-12 lg:py-20">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-6">
                Unsere Geschichte
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-headline">2016</strong> haben wir SLT Rental mit einer klaren Vision gegründet: 
                  Baumaschinen- und Equipment-Vermietung einfacher, schneller und kundenfreundlicher zu machen.
                </p>
                <p>
                  Was mit wenigen Geräten in Krefeld begann, ist heute ein Unternehmen mit über 
                  <strong className="text-headline"> 800 Mietprodukten</strong> und Standorten in Krefeld, Bonn und Mülheim.
                </p>
                <p>
                  Unser Erfolgsrezept? <strong className="text-headline">Persönlicher Service</strong>, 
                  faire Preise und Equipment, auf das du dich verlassen kannst. Ob Privatperson mit 
                  Wochenendprojekt oder Bauunternehmen mit Großauftrag – wir finden die passende Lösung.
                </p>
              </div>
            </div>
            <div className="bg-muted rounded-xl aspect-[4/3] flex items-center justify-center">
              <span className="text-muted-foreground">Team-Bild Platzhalter</span>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-12 lg:py-20">
        <div className="section-container">
          <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-4 text-center">
            Unser Team
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Die Menschen hinter SLT Rental – persönlich, kompetent und immer für dich da.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {teamMembers.map((member) => (
              <div key={member.name} className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-3">
                  {member.image ? (
                    <AvatarImage src={member.image} alt={member.name} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-headline text-sm">{member.name}</h3>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 lg:py-20 bg-surface-light">
        <div className="section-container">
          <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-8 text-center">
            Unsere Werte
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="font-semibold text-headline mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-12 lg:py-20">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-4">
              Warum SLT Rental?
            </h2>
            <p className="text-muted-foreground">
              Was uns von anderen unterscheidet? Eine Kombination aus Erfahrung, 
              Service und dem Willen, immer besser zu werden.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              "Über 800 Produkte sofort verfügbar",
              "Faire, transparente Preise ohne Überraschungen",
              "Weekend-Tarife für Privatkunden",
              "Persönliche Beratung vor Ort",
              "Schnelle Lieferung in ganz NRW",
              "B2B-Konditionen für Geschäftskunden",
              "Regelmäßig gewartetes Equipment",
              "Online-Buchung rund um die Uhr",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-surface-light p-4 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                <span className="text-headline">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-12 lg:py-16 bg-surface-light">
        <div className="section-container">
          <h2 className="text-xl font-bold text-headline mb-8 text-center">
            Unsere Partner & Marken
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
            {partners.map((partner) => (
              <div
                key={partner}
                className="aspect-[3/2] bg-background rounded-lg border border-border flex items-center justify-center"
              >
                <span className="text-sm text-muted-foreground">{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 lg:py-16 bg-primary">
        <div className="section-container text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-primary-foreground mb-4">
            Bereit, loszulegen?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-6">
            Entdecke unser Equipment-Sortiment oder kontaktiere uns für eine persönliche Beratung.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/produkte">
              <Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                Produkte entdecken
              </Button>
            </Link>
            <Link to="/kontakt">
              <Button variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                Kontakt aufnehmen
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
