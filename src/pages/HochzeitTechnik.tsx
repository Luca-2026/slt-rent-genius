import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO, SLT_FAQ_JSONLD, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LocationSelectDialog } from "@/components/solutions/LocationSelectDialog";
import {
  Music,
  Lightbulb,
  Sparkles,
  Cloud,
  Camera,
  Utensils,
  Tent,
  Wine,
  Heart,
  CheckCircle2,
  Euro,
  ShieldCheck,
  Phone,
  ArrowRight,
} from "lucide-react";

const imgHero = "/images/hochzeit/hochzeit-ringtausch.jpg";
const imgDjLicht = "/images/hochzeit/dj-licht-ton-hochzeit.jpg";
const imgStehtische = "/images/hochzeit/stehtische-hussen-hochzeit.jpg";
const imgFotoboxGaeste = "/images/hochzeit/fotobox-gaeste-hochzeit.jpg";
const imgFotoboxProps = "/images/hochzeit/fotobox-props-hochzeit.jpg";
const imgGeschirrDarwin = "/images/hochzeit/geschirr-darwin-hochzeit.jpg";

interface CategoryTarget {
  categoryId?: string;
  title: string;
  description: string;
}

const faqs = [
  {
    question: "Was kostet Hochzeitstechnik zum Mieten in Bonn oder Krefeld?",
    answer:
      "Für eine typische Hochzeit mit 60–100 Gästen liegt das Technikpaket aus Beschallung (Aktivlautsprecher + Funkmikro), Effektlicht und Nebelmaschine erfahrungsgemäß zwischen 180 € und 450 € netto pro Tag. Über das Wochenende (Fr 14:00 bis Mo 09:00) zahlst du bei SLT Rental nur eine Tagesmiete – das ist im Schnitt 50–60 % günstiger als ein DJ-Komplettpaket mit Technik. Sparkular-Kaltfunken und Senkrechtnebelmaschine bewegen sich pro Gerät bei 65–120 € pro Einsatz inkl. Verbrauchsmaterial.",
  },
  {
    question: "Kann ich die Hochzeitstechnik selbst aufbauen?",
    answer:
      "Ja. Aktivboxen mit Bluetooth-Empfänger, Funkmikrofone und LED-PAR-Scheinwerfer sind heute Plug-and-Play. Wir geben jedem Mieter eine kurze Einweisung am Tresen und legen jedem Set eine verständliche Bedienungsanleitung bei. Für komplexere Setups (Moving Heads, Truss-Systeme, Sparkular-Kaltfunken in geschlossenen Räumen) empfehlen wir unseren optionalen Aufbau- und Bedienservice – das ist sicherer und meist günstiger als ein externer DJ mit eigener Technik.",
  },
  {
    question: "Sind Sparkular-Kaltfunken in einer Eventlocation erlaubt?",
    answer:
      "In den meisten Bonner und Krefelder Locations (z. B. Hotels, Restaurants, Eventscheunen) sind Sparkular-Geräte zugelassen, weil sie kalte Funken (< 200 °C) erzeugen, keine Pyrotechnik im Sinne der 1. SprengV sind und ohne BAM-Zulassung betrieben werden dürfen. Voraussetzung: 2 m Sicherheitsabstand nach vorne, 0,5 m seitlich, ausreichende Raumhöhe (mind. 3,5 m) und Zustimmung des Betreibers. Wir liefern auf Wunsch ein Datenblatt für die Locationleitung mit.",
  },
  {
    question: "Was ist eine Senkrechtnebelmaschine und brauche ich die?",
    answer:
      "Eine Senkrechtnebelmaschine (Vertical Fog) schießt einen dichten, kühlen Nebelstrahl 3–4 m senkrecht nach oben. Sie wird typischerweise für den Hochzeitstanz oder die Auftrittsmoment der Braut verwendet – kombiniert mit Sparkulars entsteht der bekannte „Wow-Effekt“ ohne die Hitze klassischer CO₂-Jets. Anders als normale Bodennebelmaschinen löst sie keine Brandmelder aus, da der Nebel sofort nach oben aufsteigt und sich verteilt.",
  },
  {
    question: "Wie spare ich bei der Hochzeitstechnik konkret Geld?",
    answer:
      "Drei Hebel: 1) Wochenendtarif nutzen – bei SLT Rental zahlst du von Freitag 14:00 bis Montag 09:00 nur die einfache Tagesmiete. 2) Selbst abholen statt liefern lassen (Krefeld oder Bonn). 3) Komplettpaket statt Einzelmiete buchen – wir stellen DJ-Beschallung, 4 Effektscheinwerfer, Nebelmaschine und 2 Funkmikros zum gebündelten Satz zusammen. Im Schnitt sparen Brautpaare so 600–900 € gegenüber einem klassischen Fullservice-DJ.",
  },
  {
    question: "Liefert ihr auch Stehtische, Geschirr und Zelte für die Hochzeit?",
    answer:
      "Ja. Wir sind eine der wenigen Stationen in NRW, die Technik und komplette Eventausstattung aus einer Hand anbieten: Stehtische mit Stretchhussen, 6er-/8er-/12er-Bierzeltgarnituren, Pagodenzelte 3×3 m bis 5×5 m, Festzelte bis 12 m Breite, professionelles Darwin-Geschirr, Goldbesteck, Weiß-/Sektgläser im 20er-Set sowie mobile Spülmaschinen für die Catering-Crew. So musst du nicht 4 Vermieter koordinieren, sondern bekommst alles bei einer Abholung.",
  },
  {
    question: "Habt ihr Fotoboxen und Love-Buchstaben?",
    answer:
      "Ja, beides auf Anfrage. Unsere Fotobox kommt mit DSLR-Kamera, Ringlicht, Sofortdruck (4×6\"), Touch-Display und einer Kiste voller Verkleidungs-Props (Hüte, Brillen, Schilder). Die beleuchteten XXL-Love-Buchstaben (ca. 80 cm hoch) sind ein Klassiker für Foto-Ecke und Tanzfläche. Bitte mindestens 4 Wochen vorher anfragen – wir haben begrenzte Stückzahlen und reservieren auf Hochzeitstermine fest.",
  },
  {
    question: "Wann sollte ich die Hochzeitstechnik reservieren?",
    answer:
      "Für Termine zwischen Mai und September: idealerweise 4–6 Monate vorher. Beliebte Wochenenden (lange Wochenenden, Brückentage) sind oft schon im Januar vergeben. Für die Wintersaison (Oktober–April) reichen meist 4–8 Wochen Vorlauf. Wir blocken den Termin nach unverbindlicher Anfrage zunächst 7 Tage kostenfrei für dich.",
  },
  {
    question: "Was ist im Lieferumfang einer DJ-Beschallung enthalten?",
    answer:
      "Eine SLT-DJ-Beschallung für bis zu 120 Gäste umfasst typischerweise: 2× Aktivlautsprecher 12\" oder 15\" (z. B. RCF ART 912/932) auf Stativen, 1× Subwoofer 18\" für den Tanzboden, 1× Funkmikrofon-Set (UHF, anmeldefrei), passende Kabelage, Verteilersteckdose und alle benötigten Adapter. Auf Wunsch ergänzen wir DJ-Mischpult (Pioneer DDJ) und Notebook-Halterung.",
  },
  {
    question: "Welche Stromanschlüsse brauche ich für die Hochzeitstechnik?",
    answer:
      "Für ein typisches Hochzeits-Setup (Beschallung, 4–6 LED-Scheinwerfer, Nebelmaschine, Sparkular) reichen 2 separate Haushaltsstromkreise à 16 A (3.600 W). Wichtig: Tanzflächenlicht und Nebelmaschine sollten nicht am selben FI hängen wie die Catering-Küche. Falls die Location nicht genug Anschlüsse hat, vermieten wir CEE-Verteiler 16 A/32 A sowie geräuscharme Stromaggregate für die Außenfeier.",
  },
];

export default function HochzeitTechnik() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [target, setTarget] = useState<CategoryTarget>({ title: "", description: "" });

  const openCategory = (categoryId: string, title: string, description: string) => {
    setTarget({ categoryId, title, description });
    setDialogOpen(true);
  };

  const jsonLd = [
    SLT_FAQ_JSONLD(faqs),
    SLT_BREADCRUMB_JSONLD([
      { name: "Start", url: "/" },
      { name: "Service", url: "/dienstleistungen" },
      { name: "Hochzeit Technik mieten", url: "/hochzeit-technik-mieten" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Hochzeitstechnik mieten – Bonn & Krefeld",
      provider: {
        "@type": "LocalBusiness",
        name: "SLT Rental",
        telephone: "+49 2151 4179904",
      },
      areaServed: ["Bonn", "Krefeld", "Düsseldorf", "Köln", "Mülheim an der Ruhr"],
      serviceType:
        "Vermietung von Beschallung, Licht, Sparkular Kaltfunken, Nebelmaschinen, Fotobox, Love-Buchstaben und Eventausstattung für Hochzeiten",
    },
  ];

  return (
    <Layout>
      <SEO
        title="Hochzeitstechnik mieten in Bonn & Krefeld – DJ-Equipment, Licht, Sparkular"
        description="Hochzeit Technik mieten in Bonn & Krefeld: DJ-Beschallung, Licht, Sparkular Kaltfunken, Senkrechtnebel, Fotobox, Love-Buchstaben, Stehtische & Geschirr. Wochenendtarif – bis 60 % günstiger als Fullservice-DJ."
        canonical="/hochzeit-technik-mieten"
        keywords="hochzeit technik mieten, dj equipment mieten hochzeit, sparkular mieten, fotobox mieten hochzeit bonn, nebelmaschine hochzeit, love buchstaben mieten, hochzeit beschallung mieten krefeld, hochzeitslicht mieten"
        ogImage="https://www.slt-rental.de/images/hochzeit/dj-licht-ton-hochzeit.jpg"
        jsonLd={jsonLd}
      />

      {/* HERO */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img
            src={imgHero}
            alt="Brautpaar tauscht beim Hochzeit-Ringtausch die Eheringe – Hochzeitstechnik mieten in Bonn und Krefeld"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative section-container py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 px-3 py-1 rounded-full text-xs font-semibold mb-5 text-white">
              <Heart className="h-3.5 w-3.5" /> Eure Hochzeit – clever geplant
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-5">
              Hochzeitstechnik mieten in Bonn &amp; Krefeld
            </h1>
            <p className="text-lg md:text-xl text-white/85 mb-6 leading-relaxed">
              DJ-Beschallung, Effektlicht, Sparkular-Kaltfunken, Senkrechtnebel,
              Fotobox, Love-Buchstaben, Stehtische, Geschirr &amp; Zelte – alles
              aus einer Hand. Mit dem SLT-Wochenendtarif sparst du gegenüber einem
              Fullservice-DJ schnell <strong>600 € bis 900 €</strong>.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                onClick={() =>
                  openCategory("beschallung", "DJ-Beschallung für eure Hochzeit", "Wähle deinen Standort für die DJ-Beschallung.")
                }
              >
                Technik-Paket sichern <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <a href="tel:+4921514179904">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Phone className="mr-2 h-4 w-4" /> 02151 417 99 04
                </Button>
              </a>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8 text-sm text-white/80">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" /> Wochenendtarif Fr–Mo</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" /> Plug-and-Play Sets</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" /> Tiefpreisgarantie</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" /> Liefer- &amp; Aufbauservice optional</span>
            </div>
          </div>
        </div>
      </section>

      {/* WARUM SLT */}
      <section className="section-container py-14">
        <div className="grid md:grid-cols-3 gap-5">
          <Card className="p-6">
            <Euro className="h-8 w-8 text-accent mb-3" />
            <h3 className="text-lg font-bold mb-2">Bis zu 60 % günstiger</h3>
            <p className="text-sm text-muted-foreground">
              Ein Fullservice-DJ inkl. Technik kostet in Bonn/Köln im Schnitt 1.400–1.800 €.
              Mit unserer Mietlösung + Freund:in als DJ landest du bei 350–550 € – bei
              identischer Sound- und Lichtqualität.
            </p>
          </Card>
          <Card className="p-6">
            <ShieldCheck className="h-8 w-8 text-accent mb-3" />
            <h3 className="text-lg font-bold mb-2">Profi-Equipment, kein Baumarkt</h3>
            <p className="text-sm text-muted-foreground">
              RCF, Pioneer, Cameo, MagicFX Sparkular – wir vermieten exakt das, was
              auch unsere DJs und Event-Crews bei großen NRW-Events nutzen. Jedes Gerät
              wird zwischen den Vermietungen geprüft und gereinigt.
            </p>
          </Card>
          <Card className="p-6">
            <Heart className="h-8 w-8 text-accent mb-3" />
            <h3 className="text-lg font-bold mb-2">Alles aus einer Hand</h3>
            <p className="text-sm text-muted-foreground">
              Technik, Stehtische mit Hussen, Geschirr, Gläser, Zelte, Spülmaschine –
              eine Abholung, ein Ansprechpartner, eine Rechnung. Spart dir den
              Logistik-Marathon vor dem schönsten Tag.
            </p>
          </Card>
        </div>
      </section>

      {/* TECHNIK KATEGORIEN */}
      <section className="bg-muted/30 py-14">
        <div className="section-container">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Technik für die Hochzeit – das mieten Brautpaare wirklich</h2>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            Klick auf eine Kategorie – wir fragen kurz nach deinem Wunsch-Mietstandort
            (Bonn oder Krefeld) und führen dich direkt zur Verfügbarkeit und Preisliste.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Beschallung */}
            <button
              onClick={() => openCategory("beschallung", "DJ-Beschallung mieten", "Wähle deinen Mietstandort für die Beschallung.")}
              className="text-left group"
            >
              <Card className="overflow-hidden hover:shadow-lg transition h-full">
                <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                  <img
                    src={imgDjLicht}
                    alt="DJ-Pult mit Beschallung, Movingheads und Effektlicht bei einer Hochzeitsfeier"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-5">
                  <Music className="h-6 w-6 text-accent mb-2" />
                  <h3 className="font-bold text-lg mb-1">DJ-Beschallung</h3>
                  <p className="text-sm text-muted-foreground">
                    Aktivlautsprecher RCF, Subwoofer, Funkmikrofone für Trauung &amp;
                    Reden. Für 30 bis 250 Gäste.
                  </p>
                </div>
              </Card>
            </button>

            {/* Licht / Beleuchtung */}
            <button
              onClick={() => openCategory("beleuchtung", "Hochzeitsbeleuchtung mieten", "Wähle deinen Mietstandort für Licht & Effekte.")}
              className="text-left group"
            >
              <Card className="overflow-hidden hover:shadow-lg transition h-full">
                <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                  <img
                    src={imgDjLicht}
                    alt="Movingheads und Uplights in warmen Tönen bei einer Abendhochzeit – Lichttechnik mieten"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-5">
                  <Lightbulb className="h-6 w-6 text-accent mb-2" />
                  <h3 className="font-bold text-lg mb-1">Licht &amp; Effektlicht</h3>
                  <p className="text-sm text-muted-foreground">
                    LED-Uplights für warme Wandfarben, Movingheads für die Tanzfläche,
                    Lasershow auf Wunsch.
                  </p>
                </div>
              </Card>
            </button>

            {/* Sparkular & Nebel = spezialeffekte */}
            <button
              onClick={() => openCategory("spezialeffekte", "Sparkular & Nebelmaschinen mieten", "Wähle deinen Mietstandort für Spezialeffekte.")}
              className="text-left group"
            >
              <Card className="overflow-hidden hover:shadow-lg transition h-full">
                <div className="relative aspect-[16/10] bg-muted overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-accent/60" />
                  <Sparkles className="relative h-20 w-20 text-white/90" />
                </div>
                <div className="p-5">
                  <Sparkles className="h-6 w-6 text-accent mb-2" />
                  <h3 className="font-bold text-lg mb-1">Sparkular &amp; Senkrechtnebel</h3>
                  <p className="text-sm text-muted-foreground">
                    Kaltfunken-Fontänen (BAM-frei) und Senkrechtnebelmaschinen für den
                    Hochzeitstanz – kein Funken-Stress, kein Brandmelder-Risiko.
                  </p>
                </div>
              </Card>
            </button>

            {/* Stehtische / Möbel & Zelte */}
            <button
              onClick={() => openCategory("moebel-zelte", "Möbel & Zelte für die Hochzeit", "Wähle deinen Mietstandort für Möbel & Zelte.")}
              className="text-left group"
            >
              <Card className="overflow-hidden hover:shadow-lg transition h-full">
                <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                  <img
                    src={imgStehtische}
                    alt="Stehtische mit schwarzen Stretchhussen auf einer Hochzeit-Outdoor-Terrasse"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-5">
                  <Tent className="h-6 w-6 text-accent mb-2" />
                  <h3 className="font-bold text-lg mb-1">Stehtische, Hussen &amp; Zelte</h3>
                  <p className="text-sm text-muted-foreground">
                    Stehtische mit Stretchhussen (schwarz/weiß), Bierzeltgarnituren,
                    Pagoden &amp; Festzelte 3×3 m bis 12 m.
                  </p>
                </div>
              </Card>
            </button>

            {/* Geschirr & Gläser */}
            <button
              onClick={() =>
                openCategory("geschirr-glaeser-besteck", "Geschirr, Gläser & Besteck mieten", "Wähle deinen Mietstandort für die Tischausstattung.")
              }
              className="text-left group"
            >
              <Card className="overflow-hidden hover:shadow-lg transition h-full">
                <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                  <img
                    src={imgGeschirrDarwin}
                    alt="Gedeckte Hochzeitstafel mit Darwin-Geschirr in Blau, Goldbesteck und Sektgläsern"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-5">
                  <Utensils className="h-6 w-6 text-accent mb-2" />
                  <h3 className="font-bold text-lg mb-1">Geschirr, Gläser &amp; Spülmaschine</h3>
                  <p className="text-sm text-muted-foreground">
                    Darwin-Geschirr, Goldbesteck, Wein-/Sektgläser im 20er-Set sowie
                    mobile Profi-Spülmaschine für das Catering.
                  </p>
                </div>
              </Card>
            </button>

            {/* Fotobox / Love-Buchstaben — Anfrage */}
            <a
              href="mailto:bonn@slt-rental.de?subject=Hochzeit%20Anfrage%20Fotobox%20%2F%20Love-Buchstaben&body=Hallo%20SLT-Team%2C%0A%0Awir%20heiraten%20am%20%5BDatum%5D%20und%20interessieren%20uns%20f%C3%BCr%20%5BFotobox%20%2F%20Love-Buchstaben%5D%20in%20%5BBonn%20%2F%20Krefeld%5D.%0A%0AVielen%20Dank!"
              className="text-left group"
            >
              <Card className="overflow-hidden hover:shadow-lg transition h-full">
                <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                  <img
                    src={imgFotoboxGaeste}
                    alt="Lachende Hochzeitsgäste posieren mit Verkleidungs-Props vor der Fotobox"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-5">
                  <Camera className="h-6 w-6 text-accent mb-2" />
                  <h3 className="font-bold text-lg mb-1">Fotobox &amp; Love-Buchstaben</h3>
                  <p className="text-sm text-muted-foreground">
                    DSLR-Fotobox mit Sofortdruck und Props sowie beleuchtete XXL-Love-
                    Buchstaben – auf Anfrage, begrenzt verfügbar.
                  </p>
                </div>
              </Card>
            </a>
          </div>
        </div>
      </section>

      {/* EXPERTENWISSEN */}
      <section className="section-container py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Expertenwissen: So holst du das Maximum aus deiner Hochzeitstechnik
            </h2>
            <div className="space-y-5 text-[15px] leading-relaxed">
              <div>
                <h3 className="font-bold mb-1">1. Tonqualität schlägt Lautstärke</h3>
                <p className="text-muted-foreground">
                  Ein häufiger Fehler: zu kleine Lautsprecher, die für den Pegel
                  hochgezogen werden müssen. Faustregel: 1× 12&quot;-Aktivbox pro 40
                  Gäste, ab 80 Gästen zusätzlich ein 18&quot;-Subwoofer für den Bass
                  beim Tanzen. Erst dann klingt es auch bei voller Lautstärke
                  noch sauber – statt scheppernd.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-1">2. Licht in drei Schichten denken</h3>
                <p className="text-muted-foreground">
                  Stimmungslicht (warmweiße LED-Uplights an den Wänden, 3000 K),
                  Akzentlicht (Spots auf Brauttisch &amp; Hochzeitstorte) und
                  Tanzflächenlicht (Movingheads/Bars). Wer alle drei kombiniert,
                  bekommt Locationfotos auf Instagram-Niveau – ohne dass es nach
                  Disco aussieht.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-1">3. Sparkular zum Hochzeitstanz – aber sicher</h3>
                <p className="text-muted-foreground">
                  Sparkular-Geräte (z. B. MagicFX Sparkular Mini/Plus) erzeugen
                  Kaltfunken bis 5 m Höhe. Plane 2 m Sicherheitsabstand nach vorne
                  und nichts Brennbares direkt darüber. In Locations mit Brandmelder:
                  vorher kurz mit der Hausleitung sprechen – die Geräte stoßen kaum
                  Rauch aus und sind in 9 von 10 NRW-Locations unproblematisch.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-1">4. Senkrechtnebel statt Bodennebel</h3>
                <p className="text-muted-foreground">
                  Bodennebel zieht über den Boden, verteilt sich unkontrolliert und
                  löst gerne Rauchmelder aus. Eine Senkrechtnebelmaschine schießt
                  einen 3–4 m hohen Nebelstrahl, der sich sofort verteilt – ideal,
                  um Sparkular-Funken sichtbar zu machen und den „magischen Moment“
                  beim Eröffnungstanz zu erzeugen.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-1">5. Strom &amp; Stolperfallen vorab klären</h3>
                <p className="text-muted-foreground">
                  Schick uns vor der Hochzeit den Grundriss der Location – wir
                  rechnen aus, welche FI-Kreise du belegst und welche Kabelwege du
                  brauchst. So gibt es am Hochzeitsabend keinen Sicherungsausfall
                  mitten im ersten Tanz. Auf Wunsch liefern wir Kabelbrücken mit.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <Card className="overflow-hidden">
              <img
                src={imgFotoboxProps}
                alt="Verkleidungs-Props und Schilder für die Hochzeitsfotobox auf einem Holztisch"
                className="w-full h-56 object-cover"
              />
              <div className="p-5">
                <h3 className="font-bold mb-1 flex items-center gap-2">
                  <Camera className="h-5 w-5 text-accent" /> Fotobox-Tipp
                </h3>
                <p className="text-sm text-muted-foreground">
                  Stelle die Fotobox <strong>nicht</strong> direkt neben die
                  Tanzfläche – Gäste fotografieren sich lieber abseits vom Trubel.
                  Eine ruhige Ecke mit unserem 2-m-Pailletten-Backdrop und einer
                  Props-Kiste ist die beste Investition für Gästefotos.
                </p>
              </div>
            </Card>

            <Card className="p-5 bg-primary/5 border-primary/20">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Wine className="h-5 w-5 text-accent" /> Sparbeispiel: Hochzeit für 80 Gäste
              </h3>
              <ul className="text-sm space-y-1.5 text-foreground/90">
                <li>• DJ-Beschallung Stereo + Sub: <span className="font-semibold">ca. 180 € / WE</span></li>
                <li>• 4× LED-Uplights warmweiß: <span className="font-semibold">ca. 60 € / WE</span></li>
                <li>• 2× Sparkular Plus + Verbrauch: <span className="font-semibold">ca. 140 €</span></li>
                <li>• 1× Senkrechtnebelmaschine: <span className="font-semibold">ca. 75 € / WE</span></li>
                <li>• 10 Stehtische + schwarze Hussen: <span className="font-semibold">ca. 95 € / WE</span></li>
              </ul>
              <div className="border-t border-border mt-3 pt-3 flex items-center justify-between">
                <span className="text-sm">Gesamt Mietlösung</span>
                <span className="font-bold text-lg">≈ 550 €</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>Fullservice-DJ-Paket (Marktdurchschnitt)</span>
                <span>≈ 1.500 €</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Richtpreise netto, Stand 2026, abhängig von Standort und Verfügbarkeit.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* DEKO & EXTRAS */}
      <section className="bg-muted/30 py-14">
        <div className="section-container">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Dekoration &amp; Catering-Equipment – günstiger als jeder Mietshop
          </h2>
          <p className="text-muted-foreground mb-6 max-w-3xl">
            Tischset, Geschirr, Gläser, Stretchhussen, Spülmaschine, Zelte –
            zusammen gemietet wird die Hochzeit nicht nur stilvoll, sondern auch
            deutlich günstiger als bei Einzelvermietern. Klick auf eine Kategorie
            und wähle anschließend deinen Mietstandort.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => openCategory("geschirr-glaeser-besteck", "Geschirr & Gläser", "Standort wählen")}>
              Darwin-Geschirr &amp; Gläser
            </Button>
            <Button variant="outline" onClick={() => openCategory("moebel-zelte", "Stehtische & Zelte", "Standort wählen")}>
              Stehtische, Hussen &amp; Zelte
            </Button>
            <Button variant="outline" onClick={() => openCategory("moebel-zelte", "Bierzeltgarnituren", "Standort wählen")}>
              Bierzeltgarnituren
            </Button>
            <Button variant="outline" onClick={() => openCategory("geschirr-glaeser-besteck", "Mobile Spülmaschine", "Standort wählen")}>
              Mobile Spülmaschine
            </Button>
            <Button variant="outline" onClick={() => openCategory("beschallung", "Funkmikrofone für die Trauung", "Standort wählen")}>
              Funkmikrofone für die Trauung
            </Button>
            <Button variant="outline" onClick={() => openCategory("spezialeffekte", "Sparkular & Nebel", "Standort wählen")}>
              Sparkular &amp; Nebelmaschinen
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-5 mt-10">
            <Link to="/ratgeber" className="block">
              <Card className="p-5 hover:shadow-md transition">
                <h3 className="font-bold mb-1">Ratgeber: Geschirr-Mengen richtig planen</h3>
                <p className="text-sm text-muted-foreground">
                  Wie viele Teller, Gläser und Besteck-Sets brauchst du wirklich? Unser
                  Hochzeits-Mengenrechner.
                </p>
              </Card>
            </Link>
            <Link to="/lieferung" className="block">
              <Card className="p-5 hover:shadow-md transition">
                <h3 className="font-bold mb-1">Lieferung &amp; Aufbau in NRW</h3>
                <p className="text-sm text-muted-foreground">
                  Wir liefern Bonn, Köln, Düsseldorf, Krefeld, Mülheim und das Umland.
                  Aufbau-Service auf Wunsch.
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-container py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          Häufige Fragen zur Hochzeitstechnik in Bonn &amp; Krefeld
        </h2>
        <p className="text-muted-foreground mb-6 max-w-3xl">
          Antworten unseres Event-Teams aus Bonn-Mehlem und Krefeld-Fichtenhain –
          aus 9 Jahren NRW-Hochzeiten.
        </p>
        <Accordion type="single" collapsible className="max-w-3xl">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`q-${i}`}>
              <AccordionTrigger className="text-left">{f.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-14">
        <div className="section-container text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Bereit, eure Hochzeit clever &amp; günstig zu rocken?
          </h2>
          <p className="text-white/85 mb-6 max-w-2xl mx-auto">
            Schreib uns euer Datum, die Gästezahl und die Location – wir schnüren
            euch innerhalb von 24 h ein passendes Technik- und Ausstattungspaket.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="mailto:bonn@slt-rental.de?subject=Hochzeit%20%E2%80%93%20Technik-Anfrage">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                Unverbindliche Anfrage senden
              </Button>
            </a>
            <Link to="/kontakt">
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                Persönliche Beratung
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <LocationSelectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        targetCategoryId={target.categoryId}
        title={target.title || "Mietstandort wählen"}
        description={target.description || "Wähle deinen Standort für die Hochzeitstechnik."}
      />
    </Layout>
  );
}
