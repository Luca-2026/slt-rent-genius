import { useState } from "react";
import { Layout } from "@/components/layout";
import { SEO, SLT_FAQ_JSONLD } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { productCategories } from "@/data/rentalData";
import { useTranslatedCategories } from "@/hooks/useTranslatedProduct";
import { LocationSelectDialog } from "@/components/solutions/LocationSelectDialog";
import { AnimatedSection } from "@/components/ui/animated-section";
import { useTranslation } from "react-i18next";
import { MietartikelSearch } from "@/components/rental/MietartikelSearch";

const bauTeaserProducts = [
  { name: "Minibagger Bobcat E10z", price: "ab 120 €/Tag", categoryId: "erdbewegung", slug: "bobcat-e10z" },
  { name: "Rüttelplatte 90 kg", price: "ab 35 €/Tag", categoryId: "verdichtung", slug: "ruettelplatte-90kg" },
  { name: "Kastenanhänger 750 kg", price: "ab 20 €/Tag", categoryId: "anhaenger", slug: "kastenanhanger-750kg" },
];

const eventTeaserProducts = [
  { name: "PA-Anlage 500W", price: "ab 65 €/Tag", categoryId: "beschallung", slug: "pa-anlage-500w" },
  { name: "Partyzelt 3×6 m", price: "ab 50 €/Tag", categoryId: "moebel-zelte", slug: "partyzelt-3x6" },
  { name: "Hüpfburg Multiplay", price: "ab 100 €/Tag", categoryId: "huepfburgen", slug: "huepfburg-multiplay" },
];

const faqData = [
  {
    question: "Was kann ich bei SLT Rental mieten?",
    answer: "Bei SLT Rental können Sie über 1.700 verschiedene Mietartikel buchen – von Baumaschinen wie Minibagger und Rüttelplatten über Anhänger in verschiedenen Größen bis hin zu komplettem Event-Equipment. Unser Sortiment umfasst Arbeitsbühnen, Werkzeuge, Aggregate, PA-Anlagen, Beleuchtung, Geschirr & Gläser, Hüpfburgen und vieles mehr.",
  },
  {
    question: "An welchen Standorten in NRW bietet SLT Rental Miete an?",
    answer: "Wir betreiben drei Standorte in Nordrhein-Westfalen: Krefeld (Hauptsitz, Anrather Straße 291), Bonn (Drachenburgstraße 8) und Mülheim an der Ruhr (Ruhrorter Str. 122). Von dort aus liefern wir ins gesamte Rhein-Ruhr-Gebiet.",
  },
  {
    question: "Wie funktioniert die Wochenendmiete?",
    answer: "Unsere Wochenendmiete bietet Ihnen attraktive Pauschalen: Sie holen Ihr Mietgerät freitags ab und geben es montags zurück – zahlen aber nur einen vergünstigten Wochenendpreis statt drei Einzeltage. Viele Geräte sind so am Wochenende besonders günstig zu mieten.",
  },
  {
    question: "Kann ich einen Anhänger auch am Wochenende abholen?",
    answer: "Ja! An unserem Standort Mülheim an der Ruhr bieten wir für Anhänger einen 24/7-Service per SMS-Code an. Sie können Ihren Anhänger rund um die Uhr abholen und zurückbringen – auch an Sonn- und Feiertagen. An den Standorten Krefeld und Bonn gelten die regulären Öffnungszeiten.",
  },
  {
    question: "Liefert SLT Rental direkt zur Baustelle?",
    answer: "Ja, wir bieten einen Lieferservice für Baumaschinen und schweres Equipment direkt zu Ihrer Baustelle im gesamten Rhein-Ruhr-Gebiet. Die Lieferkosten berechnen sich nach Entfernung und Gerätegröße. Fragen Sie einfach bei der Buchung nach.",
  },
  {
    question: "Gibt es Rabatt für Geschäftskunden?",
    answer: "Absolut. Über unser B2B-Portal erhalten Geschäftskunden individuelle Rahmenkonditionen, Mengenrabatte und ein eigenes Kreditlimit. Die Registrierung ist kostenlos – nach Freischaltung profitieren Sie sofort von vergünstigten Nettopreisen und vereinfachter Abrechnung.",
  },
  {
    question: "Was ist die Tiefpreisgarantie?",
    answer: "Unsere Tiefpreisgarantie bedeutet: Finden Sie dasselbe Mietgerät bei einem anderen Vermieter in der Region günstiger, unterbieten wir den Preis. Senden Sie uns einfach das Vergleichsangebot – wir passen unseren Preis entsprechend an.",
  },
];

export default function Mietartikel() {
  const { t } = useTranslation();
  const rawCategories = productCategories.filter(c => c.id !== "alle");
  const categories = useTranslatedCategories(rawCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setDialogOpen(true);
  };

  const bauCategories = categories.filter(c =>
    ["anhaenger", "erdbewegung", "verdichtung", "arbeitsbuehnen", "werkzeuge", "gartenpflege", "leitern-gerueste", "aggregate", "kabel-stromverteiler", "heizung-trocknung", "absperrtechnik"].includes(c.id)
  );
  const eventCategories = categories.filter(c =>
    ["beleuchtung", "beschallung", "buehne", "traversen-rigging", "kommunikation", "moebel-zelte", "geschirr-glaeser-besteck", "spezialeffekte", "huepfburgen", "wohnwagen-camping"].includes(c.id)
  );

  const CategoryCard = ({ category }: { category: typeof categories[0] }) => (
    <button
      onClick={() => handleCategoryClick(category.id)}
      className="text-left"
    >
      <Card className="h-full group hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer">
        <div className="aspect-square bg-muted/50 flex items-center justify-center p-3 md:p-4 group-hover:bg-primary/5 transition-colors">
          {category.icon ? (
            <img
              src={category.icon}
              alt={category.title}
              className="w-[85%] h-[85%] object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-20 h-20 bg-muted rounded-full" />
          )}
        </div>
        <CardContent className="p-3 text-center">
          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {category.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 hidden sm:block">
            {category.description}
          </p>
        </CardContent>
      </Card>
    </button>
  );

  const TeaserBlock = ({ products, groupLabel }: { products: typeof bauTeaserProducts; groupLabel: string }) => (
    <div className="mt-6 p-4 md:p-6 bg-muted/30 rounded-xl border">
      <h3 className="font-semibold text-lg text-foreground mb-4">Beliebte {groupLabel}-Produkte</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {products.map((p) => (
          <button
            key={p.slug}
            onClick={() => handleCategoryClick(p.categoryId)}
            className="flex items-center gap-3 p-3 bg-background rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all text-left"
          >
            <div>
              <p className="font-medium text-sm text-foreground">{p.name}</p>
              <p className="text-xs text-primary font-semibold mt-0.5">{p.price}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const faqJsonLd = SLT_FAQ_JSONLD(faqData);

  return (
    <Layout>
      <SEO
        title="Baumaschinen, Event-Equipment, Wohnwagen & Anhänger mieten in NRW | SLT Rental"
        description="Alle Mietkategorien von SLT Rental: Bagger, Anhänger, Arbeitsbühnen, PA-Anlagen, Geschirr, Hüpfburgen und Wohnwagen für Camping & Urlaub. Über 1.700 Mietprodukte an 3 Standorten in NRW."
        canonical="/mietartikel"
        jsonLd={faqJsonLd}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-10 md:py-16">
        <div className="section-container text-center">
          <Badge variant="outline" className="mb-4">{t("mietartikel.badge")}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-headline mb-4">
            {t("mietartikel.title")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            {t("mietartikel.subtitle")}
          </p>
          <MietartikelSearch />
        </div>
      </section>

      {/* Intro Block */}
      <section className="section-container py-8 md:py-12">
        <AnimatedSection>
          <div className="prose prose-sm md:prose-base max-w-4xl mx-auto text-muted-foreground">
            <p>
              <strong className="text-foreground">SLT Rental</strong> ist Ihr Mietpartner in Nordrhein-Westfalen – seit 2016 vermieten wir professionelle Technik für Bau, Handwerk und Events. An unseren drei Standorten in <strong className="text-foreground">Krefeld</strong>, <strong className="text-foreground">Bonn</strong> und <strong className="text-foreground">Mülheim an der Ruhr</strong> stehen Ihnen über 1.700 Mietprodukte in mehr als 20 Kategorien zur Verfügung.
            </p>
            <p>
              Ob Sie einen <strong className="text-foreground">Bagger</strong> für den Aushub, eine <strong className="text-foreground">Rüttelplatte</strong> für den Wegebau, einen <strong className="text-foreground">Anhänger</strong> für den Transport oder <strong className="text-foreground">Arbeitsbühnen</strong> für Arbeiten in der Höhe benötigen – bei SLT Rental finden Sie das passende Equipment. Für Events und Veranstaltungen bieten wir <strong className="text-foreground">Geschirr & Gläser</strong>, <strong className="text-foreground">PA-Anlagen</strong>, Beleuchtung, Bühnen und sogar Hüpfburgen. Neu im Sortiment: <strong className="text-foreground">Wohnwagen & Camping</strong> – unser familientauglicher Weinsberg CaraOne 480 QDK ist auf Anfrage an allen drei Standorten verfügbar.
            </p>
            <p>
              Profitieren Sie von unserer <strong className="text-foreground">Tiefpreisgarantie</strong>, attraktiven <strong className="text-foreground">Wochenendtarifen</strong> und der bequemen Online-Buchung. Anhänger sind in Mülheim an der Ruhr per SMS-Code sogar <strong className="text-foreground">24/7</strong> verfügbar. Für Geschäftskunden bieten wir individuelle <strong className="text-foreground">B2B-Konditionen</strong> mit Rahmenverträgen und Mengenrabatten. Lieferung ins gesamte Rhein-Ruhr-Gebiet auf Anfrage.
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* Bau & Handwerk */}
      <section className="section-container py-10 md:py-14">
        <AnimatedSection>
          <h2 className="text-2xl md:text-3xl font-bold text-headline mb-2">{t("mietartikel.bauHandwerk")}</h2>
          <p className="text-muted-foreground mb-6">{t("mietartikel.bauHandwerkDesc")}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {bauCategories.map(cat => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
          <TeaserBlock products={bauTeaserProducts} groupLabel="Bau" />
        </AnimatedSection>
      </section>

      {/* Event & Veranstaltung */}
      <section className="section-container py-10 md:py-14">
        <AnimatedSection>
          <h2 className="text-2xl md:text-3xl font-bold text-headline mb-2">{t("mietartikel.eventVeranstaltung")}</h2>
          <p className="text-muted-foreground mb-6">{t("mietartikel.eventVeranstaltungDesc")}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {eventCategories.map(cat => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
          <TeaserBlock products={eventTeaserProducts} groupLabel="Event" />
        </AnimatedSection>
      </section>

      {/* FAQ Section */}
      <section className="section-container py-10 md:py-14">
        <AnimatedSection>
          <h2 className="text-2xl md:text-3xl font-bold text-headline mb-6">Häufige Fragen rund ums Mieten</h2>
          <Accordion type="single" collapsible className="max-w-3xl mx-auto">
            {faqData.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger className="text-left text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimatedSection>
      </section>

      <LocationSelectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        targetCategoryId={selectedCategoryId}
        title={t("mietartikel.selectLocation")}
        description={t("mietartikel.selectLocationDesc")}
      />
    </Layout>
  );
}
