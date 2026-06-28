import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO, SLT_FAQ_JSONLD, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { WeddingInquiryDialog } from "@/components/hochzeit/WeddingInquiryDialog";
import {
  Music,
  Lightbulb,
  Sparkles,
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
  Mail,
} from "lucide-react";

const imgHero = "/images/hochzeit/hochzeit-ringtausch.jpg";
const imgDjLicht = "/images/hochzeit/dj-licht-ton-hochzeit.jpg";
const imgStehtische = "/images/hochzeit/stehtische-hussen-hochzeit.jpg";
const imgFotoboxGaeste = "/images/hochzeit/fotobox-gaeste-hochzeit.jpg";
const imgFotoboxProps = "/images/hochzeit/fotobox-props-hochzeit.jpg";
const imgGeschirrDarwin = "/images/hochzeit/geschirr-darwin-hochzeit.jpg";
const imgSound = "/product-images/soundsystem-1400w-1.jpeg";
const imgPartyzelt = "/product-images/partyzelt-5x12-1.avif";

const faqs = [
  {
    question: "Was kostet Hochzeitstechnik zum Mieten in Bonn, Krefeld oder Mülheim?",
    answer:
      "Für eine typische Hochzeit mit 60–100 Gästen liegt das Technikpaket aus DJ-Beschallung (D.A.S. Audio Aktiv-PA + Sennheiser-Funkmikrofon), Effektlicht und Nebelmaschine erfahrungsgemäß zwischen 180 € und 450 € netto pro Tag. Über das Wochenende (Fr 14:00 bis Mo 09:00) zahlst du bei SLT Rental nur eine Tagesmiete. Sparkular-Kaltfunken-Sets (2er/4er) liegen je nach Set zwischen 69 € und 99 €/Tag inkl. Granulat.",
  },
  {
    question: "Welche Marken/Geräte vermietet SLT Rental für Hochzeiten?",
    answer:
      "Wir vermieten in der Eventtechnik unter anderem: D.A.S. Audio Action 508A, D.A.S. Vantec und D.A.S. 3500 W PA-Systeme, Soundboks Gen.3 (akkubetriebener Outdoor-Lautsprecher, 126 dB), Pioneer CDJ 2000 NXS und Pioneer DJM 900 NXS2 für DJ-Sets, Sennheiser-Funkmikrofone (XSW-Serie), LED-Outdoorscheinwerfer TourLED 50 XCR, LED Moving Head Vector Spot Zoom 2.0, SLT LED Fluter RGBWAUV, Showtec Sunstrip Active MKII, ADJ Fog Fury Jett PRO Nebelmaschine, Kalt-Funkenfontänen (Sparkular) als 2er- und 4er-Set sowie TCM FX Turbo CO₂-Jet.",
  },
  {
    question: "Kann ich die Hochzeitstechnik selbst aufbauen?",
    answer:
      "Ja. Aktivboxen mit Bluetooth, Sennheiser-Funkmikrofone und LED-PAR-Scheinwerfer sind heute Plug-and-Play. Wir geben jedem Mieter eine kurze Einweisung am Tresen und legen jedem Set eine verständliche Bedienungsanleitung bei. Für komplexere Setups (Moving Heads, Truss-Systeme, Sparkular-Kaltfunken in geschlossenen Räumen) empfehlen wir unseren optionalen Aufbau- und Bedienservice – das ist sicherer und meist günstiger als ein externer DJ mit eigener Technik.",
  },
  {
    question: "Sind Sparkular-Kaltfunken in einer Eventlocation erlaubt?",
    answer:
      "In den meisten Bonner, Krefelder und Mülheimer Locations (Hotels, Restaurants, Eventscheunen) sind Sparkular-Geräte zugelassen, weil sie kalte Funken (< 200 °C) erzeugen, keine Pyrotechnik im Sinne der 1. SprengV sind und ohne BAM-Zulassung betrieben werden dürfen. Voraussetzung: 2 m Sicherheitsabstand nach vorne, 0,5 m seitlich, ausreichende Raumhöhe (mind. 3,5 m) und Zustimmung des Betreibers. Wir liefern auf Wunsch ein Datenblatt für die Locationleitung mit.",
  },
  {
    question: "Was ist eine Senkrechtnebelmaschine und brauche ich die?",
    answer:
      "Eine Senkrechtnebelmaschine (Vertical Fog) schießt einen dichten, kühlen Nebelstrahl 3–4 m senkrecht nach oben. Sie wird typischerweise für den Hochzeitstanz oder den Auftrittsmoment der Braut verwendet – kombiniert mit Sparkulars entsteht der bekannte „Wow-Effekt“ ohne die Hitze klassischer CO₂-Jets. Anders als Bodennebel zieht der Nebel direkt nach oben und löst Brandmelder seltener aus. Alternativ vermieten wir die ADJ Fog Fury Jett PRO – eine vertikale Hochleistungs-Nebelmaschine.",
  },
  {
    question: "Wie spare ich bei der Hochzeitstechnik konkret Geld?",
    answer:
      "Drei Hebel: 1) Wochenendtarif nutzen – bei SLT Rental zahlst du von Freitag 14:00 bis Montag 09:00 nur die einfache Tagesmiete. 2) Selbst abholen statt liefern lassen (Krefeld, Bonn oder Mülheim). 3) Komplettpaket statt Einzelmiete buchen – wir stellen DJ-Beschallung, 4 Effektscheinwerfer, Nebelmaschine und 2 Funkmikrofone zum gebündelten Satz zusammen. Brautpaare sparen so im Schnitt 600–900 € gegenüber einem klassischen Fullservice-DJ.",
  },
  {
    question: "Liefert ihr auch Stehtische, Geschirr und Zelte für die Hochzeit?",
    answer:
      "Ja. Wir sind eine der wenigen Stationen in NRW, die Technik und komplette Eventausstattung aus einer Hand anbieten: Stehtische mit Stretchhussen, 6er-/8er-/12er-Bierzeltgarnituren, Pagodenzelte und Festzelte bis 5 × 12 m, professionelles Darwin-Geschirr, Wein- und Sektgläser im 20er-Set sowie mobile Profi-Spülmaschinen für die Catering-Crew.",
  },
  {
    question: "Habt ihr Fotoboxen und Love-Buchstaben?",
    answer:
      "Beides auf Anfrage. Unsere Fotobox kommt mit DSLR-Kamera, Ringlicht, Sofortdruck (4×6\"), Touch-Display und einer Kiste voller Verkleidungs-Props. Die beleuchteten XXL-Love-Buchstaben sind ein Klassiker für Foto-Ecke und Tanzfläche. Bitte mindestens 4 Wochen vorher anfragen – wir reservieren auf Hochzeitstermine fest.",
  },
  {
    question: "Wann sollte ich die Hochzeitstechnik reservieren?",
    answer:
      "Für Termine zwischen Mai und September: idealerweise 4–6 Monate vorher. Beliebte Wochenenden (lange Wochenenden, Brückentage) sind oft schon im Januar vergeben. Für die Wintersaison (Oktober–April) reichen meist 4–8 Wochen Vorlauf. Wir blocken den Termin nach unverbindlicher Anfrage zunächst 7 Tage kostenfrei für euch.",
  },
  {
    question: "Was ist im Lieferumfang einer DJ-Beschallung enthalten?",
    answer:
      "Eine SLT-DJ-Beschallung für bis zu 120 Gäste umfasst typischerweise: 2× Aktivlautsprecher aus der D.A.S. Audio Action- oder Vantec-Serie auf Stativen, optional 1× Subwoofer für den Tanzboden, 1× Sennheiser-Funkmikrofon-Set (UHF, anmeldefrei), passende Kabelage, Verteilersteckdose und alle Adapter. Auf Wunsch ergänzen wir das Pioneer-Setup (CDJ 2000 NXS + DJM 900 NXS2) und Notebook-Halterung.",
  },
  {
    question: "Welche Stromanschlüsse brauche ich für die Hochzeitstechnik?",
    answer:
      "Für ein typisches Hochzeits-Setup (Beschallung, 4–6 LED-Scheinwerfer, Nebelmaschine, Sparkular) reichen 2 separate Haushaltsstromkreise à 16 A (3.600 W). Wichtig: Tanzflächenlicht und Nebelmaschine sollten nicht am selben FI hängen wie die Catering-Küche. Falls die Location nicht genug Anschlüsse hat, vermieten wir CEE-Verteiler 16 A/32 A sowie geräuscharme Stromaggregate (2,8 kVA bis 100 kVA) für die Außenfeier.",
  },
];

export default function HochzeitTechnik() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const openInquiry = () => setDialogOpen(true);

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
      name: "Hochzeitstechnik mieten – Bonn, Krefeld & Mülheim an der Ruhr",
      provider: {
        "@type": "LocalBusiness",
        name: "SLT Rental",
        telephone: "+49 2151 4179904",
      },
      areaServed: ["Bonn", "Krefeld", "Düsseldorf", "Köln", "Mülheim an der Ruhr", "Essen", "Duisburg"],
      serviceType:
        "Vermietung von Beschallung, Licht, Sparkular Kaltfunken, Nebelmaschinen, Fotobox, Love-Buchstaben und Eventausstattung für Hochzeiten",
    },
  ];

  return (
    <Layout>
      <SEO
        title="Hochzeit Technik mieten – Bonn, Krefeld & Mülheim | SLT Rental"
        description="Hochzeit Technik mieten in Bonn, Krefeld & Mülheim: DJ-Beschallung (D.A.S. Audio), Licht, Sparkular Kaltfunken, ADJ Nebelmaschine, Fotobox, Stehtische & Geschirr – Wochenendtarif, schriftliches Angebot in 24 h."
        canonical="/hochzeit-technik-mieten"
        keywords="hochzeit technik mieten, dj equipment mieten hochzeit, sparkular mieten, fotobox mieten hochzeit bonn, nebelmaschine hochzeit, love buchstaben mieten, hochzeit beschallung mieten krefeld, hochzeitslicht mieten nrw"
        ogImage="https://www.slt-rental.de/images/hochzeit/hochzeit-ringtausch.jpg"
        jsonLd={jsonLd}
      />

      {/* HERO – solid primary BG mit Bild rechts (kein Overlay-Text auf Foto) */}
      <section className="bg-primary text-primary-foreground">
        <div className="section-container py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-semibold mb-5">
                <Heart className="h-3.5 w-3.5" /> Eure Hochzeit – clever geplant
              </div>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-5 text-white">
                Hochzeit Technik mieten in Bonn, Krefeld &amp; Mülheim
              </h1>
              <p className="text-base md:text-lg text-white/90 mb-6 leading-relaxed">
                DJ-Beschallung von D.A.S. Audio, Effektlicht, Sparkular-Kaltfunken,
                ADJ-Nebelmaschine, Fotobox, Love-Buchstaben, Stehtische, Geschirr &amp;
                Zelte – alles aus einer Hand. Mit dem SLT-Wochenendtarif spart ihr
                gegenüber einem Fullservice-DJ schnell <strong>600 € bis 900 €</strong>.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                  onClick={openInquiry}
                >
                  <Mail className="mr-2 h-4 w-4" /> Kostenloses Angebot anfordern
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-7 text-sm text-white/85">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" /> Wochenendtarif Fr–Mo</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" /> Plug-and-Play Sets</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" /> Tiefpreisgarantie</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" /> Liefer- &amp; Aufbauservice optional</span>
              </div>

              <div className="grid sm:grid-cols-3 gap-2 mt-7 text-sm">
                <a href="tel:+4922850466061" className="rounded-md bg-white/10 hover:bg-white/15 border border-white/20 px-3 py-2 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-accent" />
                  <span><span className="block text-xs text-white/70">Bonn</span>0228 504 660 61</span>
                </a>
                <a href="tel:+4921514179904" className="rounded-md bg-white/10 hover:bg-white/15 border border-white/20 px-3 py-2 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-accent" />
                  <span><span className="block text-xs text-white/70">Krefeld</span>02151 417 99 04</span>
                </a>
                <a href="tel:+4921514179904" className="rounded-md bg-white/10 hover:bg-white/15 border border-white/20 px-3 py-2 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-accent" />
                  <span><span className="block text-xs text-white/70">Mülheim</span>02151 417 99 04</span>
                </a>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] hidden md:block">
              <img
                src={imgHero}
                alt="Brautpaar tauscht beim Hochzeit-Ringtausch die Eheringe – Hochzeitstechnik mieten in Bonn, Krefeld und Mülheim"
                className="w-full h-full object-cover"
                loading="eager"
              />
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
              Mit unserer Mietlösung + Freund:in als DJ landet ihr bei 350–550 € – bei
              identischer Sound- und Lichtqualität.
            </p>
          </Card>
          <Card className="p-6">
            <ShieldCheck className="h-8 w-8 text-accent mb-3" />
            <h3 className="text-lg font-bold mb-2">Profi-Equipment, kein Baumarkt</h3>
            <p className="text-sm text-muted-foreground">
              D.A.S. Audio, Soundboks, Pioneer, Sennheiser, ADJ, Sparkular, Showtec –
              wir vermieten exakt das, was auch unsere Event-Crews bei großen NRW-Events
              nutzen. Jedes Gerät wird zwischen den Vermietungen geprüft und gereinigt.
            </p>
          </Card>
          <Card className="p-6">
            <Heart className="h-8 w-8 text-accent mb-3" />
            <h3 className="text-lg font-bold mb-2">Alles aus einer Hand</h3>
            <p className="text-sm text-muted-foreground">
              Technik, Stehtische mit Hussen, Geschirr, Gläser, Zelte, Spülmaschine –
              eine Abholung, ein Ansprechpartner, eine Rechnung. Spart euch den
              Logistik-Marathon vor dem schönsten Tag.
            </p>
          </Card>
        </div>
      </section>

      {/* TECHNIK KATEGORIEN – Karten ohne einzelne Verlinkungen, gemeinsamer CTA unten */}
      <section className="bg-muted/30 py-14">
        <div className="section-container">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Das vermieten wir für eure Hochzeit
          </h2>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            Klick unten auf <strong>„Angebot anfordern“</strong> – wir fragen kurz nach
            eurem Wunsch-Mietstandort (Bonn, Krefeld oder Mülheim) und nehmen alle
            wichtigen Daten zu eurer Hochzeit auf. Innerhalb von 24 h bekommt ihr ein
            individuelles, schriftliches Angebot per E-Mail.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Card className="overflow-hidden">
              <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                <img
                  src={imgSound}
                  alt="2.1 Soundsystem 1400 W RMS – DJ-Beschallung für Hochzeiten mieten"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <Music className="h-6 w-6 text-accent mb-2" />
                <h3 className="font-bold text-lg mb-1">DJ-Beschallung &amp; Mikrofone</h3>
                <p className="text-sm text-muted-foreground">
                  D.A.S. Audio Action 508A / Vantec / 3500 W RMS-PAs, 2.1 Soundsystem,
                  Soundboks Gen.3 für Outdoor, Pioneer CDJ 2000 NXS / DJM 900 NXS2 und
                  Sennheiser-Funkmikrofone. Für 30 bis 250 Gäste.
                </p>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                <img
                  src={imgDjLicht}
                  alt="LED Moving Heads und Effektlicht bei einer Hochzeit – Lichttechnik mieten"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <Lightbulb className="h-6 w-6 text-accent mb-2" />
                <h3 className="font-bold text-lg mb-1">Licht &amp; Effektlicht</h3>
                <p className="text-sm text-muted-foreground">
                  LED Outdoorscheinwerfer TourLED 50 XCR, LED Moving Head Vector Spot
                  Zoom 2.0, SLT LED Fluter RGBWAUV, Showtec Sunstrip Active MKII, LED-PAR-
                  Sets &amp; T-Bar-Stative. Wash, Spots und Effekte aus einer Hand.
                </p>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative aspect-[16/10] bg-muted overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/85 to-accent/70" />
                <Sparkles className="relative h-20 w-20 text-white/95" />
              </div>
              <div className="p-5">
                <Sparkles className="h-6 w-6 text-accent mb-2" />
                <h3 className="font-bold text-lg mb-1">Sparkular &amp; Nebelmaschine</h3>
                <p className="text-sm text-muted-foreground">
                  Kalt-Funkenfontänen (Sparkular) als 2er- und 4er-Set, ADJ Fog Fury
                  Jett PRO Vertikal-Nebelmaschine, TCM FX Turbo CO₂-Jet – BAM-frei und
                  in den meisten NRW-Locations zugelassen.
                </p>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                <img
                  src={imgStehtische}
                  alt="Stehtische mit schwarzen Stretchhussen auf einer Hochzeit-Outdoor-Terrasse"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <Tent className="h-6 w-6 text-accent mb-2" />
                <h3 className="font-bold text-lg mb-1">Stehtische, Hussen &amp; Möbel</h3>
                <p className="text-sm text-muted-foreground">
                  Stehtische mit Stretchhussen (schwarz/weiß), 6er-/8er-/12er-
                  Bierzeltgarnituren, Klappstühle. Schnell auf- und abgebaut – auch
                  Selbstabholung im Pkw möglich.
                </p>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                <img
                  src={imgPartyzelt}
                  alt="Partyzelt 5×12 m für die Hochzeit-Outdoor-Feier mieten"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <Tent className="h-6 w-6 text-accent mb-2" />
                <h3 className="font-bold text-lg mb-1">Pagoden- &amp; Festzelte</h3>
                <p className="text-sm text-muted-foreground">
                  Pagodenzelte 3 × 3 m für die Bar oder den Sektempfang sowie Partyzelte
                  bis 5 × 12 m für die ganze Feier – inklusive Zeltboden auf Anfrage.
                </p>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                <img
                  src={imgGeschirrDarwin}
                  alt="Gedeckte Hochzeitstafel mit Darwin-Geschirr, Goldbesteck und Sektgläsern"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <Utensils className="h-6 w-6 text-accent mb-2" />
                <h3 className="font-bold text-lg mb-1">Geschirr, Gläser &amp; Spülmaschine</h3>
                <p className="text-sm text-muted-foreground">
                  Darwin-Geschirr, Wein-/Sekt-/Wassergläser im 20er-Set sowie mobile
                  Profi-Spülmaschine für das Catering-Team.
                </p>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                <img
                  src={imgFotoboxGaeste}
                  alt="Lachende Hochzeitsgäste posieren mit Verkleidungs-Props vor der Fotobox"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <Camera className="h-6 w-6 text-accent mb-2" />
                <h3 className="font-bold text-lg mb-1">Fotobox &amp; Love-Buchstaben</h3>
                <p className="text-sm text-muted-foreground">
                  DSLR-Fotobox mit Sofortdruck und Props-Kiste sowie beleuchtete XXL-
                  Love-Buchstaben – auf Anfrage, begrenzt verfügbar.
                </p>
              </div>
            </Card>
          </div>

          {/* Zentraler Sammel-CTA */}
          <div className="mt-10 rounded-xl bg-primary text-primary-foreground p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-1">
                Komplettes Hochzeitspaket – ein Formular, ein Angebot
              </h3>
              <p className="text-white/85 text-sm md:text-base">
                Wählt Mietstandort, Eventdatum und gewünschte Technik – wir senden euch
                innerhalb von 24 h ein individuelles Angebot per E-Mail.
              </p>
            </div>
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-cta-orange-hover shrink-0"
              onClick={openInquiry}
            >
              <Mail className="mr-2 h-4 w-4" /> Angebot anfordern
            </Button>
          </div>
        </div>
      </section>

      {/* EXPERTENWISSEN */}
      <section className="section-container py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Expertenwissen: So holt ihr das Maximum aus eurer Hochzeitstechnik
            </h2>
            <div className="space-y-5 text-[15px] leading-relaxed">
              <div>
                <h3 className="font-bold mb-1">1. Tonqualität schlägt Lautstärke</h3>
                <p className="text-muted-foreground">
                  Faustregel: 1× Aktiv-PA (z. B. D.A.S. Action 508A) pro 40 Gäste, ab
                  80 Gästen zusätzlich ein Subwoofer für den Bass beim Tanzen. Erst
                  dann klingt es auch bei voller Lautstärke noch sauber – statt
                  scheppernd.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-1">2. Licht in drei Schichten denken</h3>
                <p className="text-muted-foreground">
                  Stimmungslicht (warmweiße LED-Uplights an den Wänden, 3000 K),
                  Akzentlicht (Spots auf Brauttisch &amp; Hochzeitstorte) und
                  Tanzflächenlicht (Moving Heads/Bars). Wer alle drei kombiniert,
                  bekommt Locationfotos auf Instagram-Niveau – ohne dass es nach
                  Disco aussieht.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-1">3. Sparkular zum Hochzeitstanz – aber sicher</h3>
                <p className="text-muted-foreground">
                  Sparkular-Geräte erzeugen Kaltfunken bis 5 m Höhe. Plant 2 m
                  Sicherheitsabstand nach vorne und nichts Brennbares direkt darüber.
                  In Locations mit Brandmelder vorher kurz mit der Hausleitung
                  sprechen – die Geräte stoßen kaum Rauch aus und sind in 9 von 10
                  NRW-Locations unproblematisch.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-1">4. Vertikalnebel statt Bodennebel</h3>
                <p className="text-muted-foreground">
                  Bodennebel zieht über den Boden, verteilt sich unkontrolliert und
                  löst gerne Rauchmelder aus. Eine vertikale Nebelmaschine (z. B. ADJ
                  Fog Fury Jett PRO) schießt einen 3–4 m hohen Nebelstrahl – ideal,
                  um Sparkular-Funken sichtbar zu machen und den „magischen Moment“
                  beim Eröffnungstanz zu erzeugen.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-1">5. Strom &amp; Stolperfallen vorab klären</h3>
                <p className="text-muted-foreground">
                  Schickt uns vor der Hochzeit den Grundriss der Location – wir
                  rechnen aus, welche FI-Kreise ihr belegt und welche Kabelwege ihr
                  braucht. So gibt es am Hochzeitsabend keinen Sicherungsausfall
                  mitten im ersten Tanz. Auf Wunsch liefern wir Kabelbrücken und
                  CEE-Verteiler bis 63 A mit.
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
                loading="lazy"
              />
              <div className="p-5">
                <h3 className="font-bold mb-1 flex items-center gap-2">
                  <Camera className="h-5 w-5 text-accent" /> Fotobox-Tipp
                </h3>
                <p className="text-sm text-muted-foreground">
                  Stellt die Fotobox <strong>nicht</strong> direkt neben die
                  Tanzfläche – Gäste fotografieren sich lieber abseits vom Trubel.
                  Eine ruhige Ecke mit einem Pailletten-Backdrop und einer
                  Props-Kiste ist die beste Investition für Gästefotos.
                </p>
              </div>
            </Card>

            <Card className="p-5 bg-primary/5 border-primary/20">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Wine className="h-5 w-5 text-accent" /> Sparbeispiel: Hochzeit für 80 Gäste
              </h3>
              <ul className="text-sm space-y-1.5 text-foreground/90">
                <li>• DJ-Beschallung (D.A.S. Aktiv-PA + Sub): <span className="font-semibold">ca. 180 € / WE</span></li>
                <li>• 4× LED-Uplights warmweiß: <span className="font-semibold">ca. 60 € / WE</span></li>
                <li>• Sparkular 2er-Set + Granulat: <span className="font-semibold">ca. 69 €</span></li>
                <li>• ADJ Fog Fury Jett PRO Nebelmaschine: <span className="font-semibold">ca. 75 € / WE</span></li>
                <li>• 10 Stehtische + schwarze Hussen: <span className="font-semibold">ca. 95 € / WE</span></li>
              </ul>
              <div className="border-t border-border mt-3 pt-3 flex items-center justify-between">
                <span className="text-sm">Gesamt Mietlösung</span>
                <span className="font-bold text-lg">≈ 479 €</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>Fullservice-DJ-Paket (Marktdurchschnitt)</span>
                <span>≈ 1.500 €</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Richtpreise netto, Stand 2026, abhängig von Standort und Verfügbarkeit.
                Genaue Preise erhaltet ihr im individuellen Angebot.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* SEKUNDÄRER CTA + interne Links */}
      <section className="bg-muted/30 py-14">
        <div className="section-container">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Hochzeit komplett planen – mit einer einzigen Anfrage
          </h2>
          <p className="text-muted-foreground mb-6 max-w-3xl">
            Statt 4 Vermieter zu koordinieren, bekommt ihr bei SLT Rental Technik,
            Möbel, Geschirr und Zelte aus einer Hand. Sendet uns über das Formular
            eure Wunschausstattung – wir kümmern uns um Verfügbarkeit, Reservierung
            und Logistik.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
              onClick={openInquiry}
            >
              <Mail className="mr-2 h-4 w-4" /> Jetzt Angebot anfordern
            </Button>
            <Link to="/ratgeber">
              <Button size="lg" variant="outline">Ratgeber &amp; Mengenrechner</Button>
            </Link>
            <Link to="/lieferung">
              <Button size="lg" variant="outline">Lieferung &amp; Aufbau in NRW</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-container py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          Häufige Fragen zur Hochzeitstechnik in Bonn, Krefeld &amp; Mülheim
        </h2>
        <p className="text-muted-foreground mb-6 max-w-3xl">
          Antworten unseres Event-Teams aus Krefeld-Fichtenhain, Bonn-Mehlem und
          Mülheim an der Ruhr – aus 9 Jahren NRW-Hochzeiten.
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
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
            Bereit, eure Hochzeit clever &amp; günstig zu rocken?
          </h2>
          <p className="text-white/85 mb-6 max-w-2xl mx-auto">
            Schickt uns euer Datum, die Gästezahl und die Location – wir schnüren
            euch innerhalb von 24 h ein passendes Technik- und Ausstattungspaket.
          </p>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
            onClick={openInquiry}
          >
            <Mail className="mr-2 h-4 w-4" /> Unverbindliches Angebot anfordern
          </Button>
        </div>
      </section>

      <WeddingInquiryDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </Layout>
  );
}
