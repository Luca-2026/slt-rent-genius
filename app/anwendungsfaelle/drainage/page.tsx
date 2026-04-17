import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Phone, Clock, Droplets, AlertTriangle, ArrowRight } from "lucide-react"
import { LocalBusinessJsonLd, ArticleJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "Minibagger für Drainage mieten | Entwässerung & Rigolen | Krefeld",
  description: "Minibagger für Drainagearbeiten in Krefeld mieten. Ideal für Entwässerungsgräben, Rigolen und Versickerungsanlagen. Ab 120€/Tag inkl. Einweisung.",
  keywords: ["Minibagger Drainage", "Entwässerung Krefeld", "Rigole graben", "Versickerung anlegen"],
  openGraph: {
    title: "Minibagger für Drainage mieten | SLT Krefeld",
    description: "Professionelle Entwässerungslösungen mit dem Minibagger. Drainagen, Rigolen und mehr.",
    type: "article",
  },
}

const drainageTypes = [
  {
    name: "Drainageleitung",
    description: "Perforierte Rohre sammeln Wasser und leiten es gezielt ab",
    depth: "30-80 cm",
    width: "30-40 cm",
    bagger: "0,8t - 1,5t Minibagger",
    application: "Hausentwässerung, Hangsicherung, nasse Rasenflächen",
  },
  {
    name: "Rigole / Sickergraben",
    description: "Kiesschacht zur Versickerung von Regenwasser",
    depth: "100-200 cm",
    width: "60-100 cm",
    bagger: "1,5t - 2,5t Minibagger",
    application: "Regenwasserversickerung, Dachflächenentwässerung",
  },
  {
    name: "Muldenversickerung",
    description: "Flache Mulde zur oberflächlichen Versickerung",
    depth: "30-50 cm",
    width: "variabel",
    bagger: "1,0t - 1,7t Minibagger",
    application: "Große Grundstücke, natürliche Regenwasserbewirtschaftung",
  },
]

const processSteps = [
  {
    step: 1,
    title: "Gefälle planen",
    description: "Mindestens 1-2% Gefälle zum Ablaufpunkt sicherstellen. Bei längeren Strecken Kontrollschächte einplanen.",
  },
  {
    step: 2,
    title: "Graben ausheben",
    description: "Mit dem Minibagger zügig und gleichmäßig tief graben. Aushub seitlich lagern für Verfüllung.",
  },
  {
    step: 3,
    title: "Kiesbett anlegen",
    description: "Filterkies (16/32) als Bettung für Drainagerohr einbringen. Gefälle kontrollieren.",
  },
  {
    step: 4,
    title: "Rohr verlegen",
    description: "Drainagerohr mit Schlitzen nach unten verlegen, mit Kies umhüllen und Vlies abdecken.",
  },
  {
    step: 5,
    title: "Verfüllen",
    description: "Graben schichtweise verfüllen und verdichten. Oberboden aufbringen.",
  },
]

export default function DrainagePage() {
  return (
    <>
      <LocalBusinessJsonLd />
      <ArticleJsonLd
        title="Minibagger für Drainage mieten"
        description="Kompletter Ratgeber für Entwässerungsarbeiten mit dem Minibagger"
        datePublished="2024-01-15"
        dateModified="2024-01-20"
      />

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slt-blue to-slt-blue-dark text-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <Link
              href="/anwendungsfaelle"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Alle Anwendungsfälle
            </Link>

            <div className="max-w-3xl">
              <h1 className="font-display text-3xl md:text-5xl font-bold mb-6 text-balance">
                Minibagger für Drainage & Entwässerung
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                Staunässe im Garten oder feuchte Kellerwände? Mit einem Minibagger
                verlegen Sie Drainagen schnell und effizient. Wir beraten Sie zur
                richtigen Lösung für Ihr Entwässerungsproblem.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  href="tel:+4921519579229"
                  className="inline-flex items-center gap-2 bg-slt-yellow hover:bg-slt-yellow-hover text-slt-blue-dark font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Jetzt beraten lassen
                </a>
                <Link
                  href="/kontakt"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg transition-colors border border-white/20"
                >
                  Anfrage senden
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Indicators */}
        <section className="py-12 bg-amber-50 border-b border-amber-200">
          <div className="container mx-auto px-4">
            <div className="flex items-start gap-4 max-w-4xl mx-auto">
              <Droplets className="w-8 h-8 text-amber-600 shrink-0" />
              <div>
                <h2 className="font-display text-lg font-bold text-headline mb-2">
                  Wann ist eine Drainage notwendig?
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 text-body">
                  <ul className="space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                      Stehendes Wasser nach Regen
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                      Matschiger Rasen im Frühjahr/Herbst
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                      Feuchte Kellerwände
                    </li>
                  </ul>
                  <ul className="space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                      Drückendes Grundwasser
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                      Hangwasser von Nachbargrundstück
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                      Versiegelungsauflagen für Regenwasser
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Drainage Types */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-2xl md:text-4xl font-bold text-headline mb-4">
                Entwässerungslösungen im Überblick
              </h2>
              <p className="text-body max-w-2xl mx-auto">
                Je nach Problem und Grundstückssituation eignen sich unterschiedliche
                Entwässerungsmethoden.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {drainageTypes.map((type) => (
                <div
                  key={type.name}
                  className="bg-white rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
                >
                  <h3 className="font-display text-xl font-bold text-headline mb-3">
                    {type.name}
                  </h3>
                  <p className="text-body mb-4">{type.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tiefe:</span>
                      <span className="font-medium text-headline">{type.depth}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Breite:</span>
                      <span className="font-medium text-headline">{type.width}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Empfehlung:</span>
                      <span className="font-medium text-headline">{type.bagger}</span>
                    </div>
                  </div>

                  <div className="bg-surface-light rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Anwendung:</p>
                    <p className="text-sm text-headline">{type.application}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16 md:py-24 bg-surface-light">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-2xl md:text-4xl font-bold text-headline mb-4">
                Drainage verlegen - Schritt für Schritt
              </h2>
              <p className="text-body max-w-2xl mx-auto">
                Mit der richtigen Planung und einem Minibagger ist eine Drainage
                schnell verlegt.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="space-y-4">
                {processSteps.map((step, index) => (
                  <div
                    key={step.step}
                    className="bg-white rounded-xl p-6 border border-border flex items-start gap-4"
                  >
                    <div className="w-10 h-10 bg-slt-blue rounded-full flex items-center justify-center text-white font-bold shrink-0">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-bold text-headline mb-1">
                        {step.title}
                      </h3>
                      <p className="text-body">{step.description}</p>
                    </div>
                    {index < processSteps.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-muted-foreground hidden md:block" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Important Note */}
        <section className="py-12 bg-red-50 border-y border-red-200">
          <div className="container mx-auto px-4">
            <div className="flex items-start gap-4 max-w-3xl mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />
              <div>
                <h3 className="font-display text-lg font-bold text-headline mb-2">
                  Genehmigungspflicht beachten
                </h3>
                <p className="text-body">
                  In vielen Gemeinden ist die Versickerung von Regenwasser genehmigungspflichtig.
                  Informieren Sie sich vor Baubeginn bei Ihrer Stadt (Krefeld: Untere Wasserbehörde)
                  über notwendige Genehmigungen. Wir beraten Sie gerne zu den örtlichen Vorschriften.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Material Checklist */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-headline mb-8 text-center">
                Material-Checkliste für Ihre Drainage
              </h2>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-border">
                  <h3 className="font-display text-lg font-bold text-headline mb-4">
                    Baumaterial
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-body">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Drainagerohr DN 100 (perforiert)
                    </li>
                    <li className="flex items-start gap-2 text-body">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Filterkies 16/32 oder Drainagekies
                    </li>
                    <li className="flex items-start gap-2 text-body">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Geotextil / Drainagevlies
                    </li>
                    <li className="flex items-start gap-2 text-body">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Kontrollschächte (alle 25-30m)
                    </li>
                    <li className="flex items-start gap-2 text-body">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Sickerboxen / Rigolenkörper (bei Versickerung)
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-border">
                  <h3 className="font-display text-lg font-bold text-headline mb-4">
                    Werkzeug & Geräte
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-body">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Minibagger mit Tieflöffel (30-40cm)
                    </li>
                    <li className="flex items-start gap-2 text-body">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Laser-Nivelliergerät oder Schlauchwaage
                    </li>
                    <li className="flex items-start gap-2 text-body">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Rüttelplatte zum Verdichten
                    </li>
                    <li className="flex items-start gap-2 text-body">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Schubkarre, Schaufel, Rechen
                    </li>
                    <li className="flex items-start gap-2 text-body">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      Maßband, Schnur, Pflöcke
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Teaser */}
        <section className="py-16 md:py-24 bg-surface-light">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-border max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-headline mb-4">
                    Drainage-Paket
                  </h2>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-3 text-body">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Minibagger mit schmalem Tieflöffel
                    </li>
                    <li className="flex items-center gap-3 text-body">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Lieferung und Abholung
                    </li>
                    <li className="flex items-center gap-3 text-body">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Einweisung in die Bedienung
                    </li>
                    <li className="flex items-center gap-3 text-body">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Rüttelplatte optional zubuchbar
                    </li>
                  </ul>
                </div>

                <div className="text-center md:text-right">
                  <div className="text-sm text-muted-foreground mb-1">Ab</div>
                  <div className="font-display text-4xl md:text-5xl font-bold text-slt-blue mb-2">
                    120 €
                  </div>
                  <div className="text-muted-foreground mb-6">pro Tag inkl. MwSt.</div>
                  <a
                    href="tel:+4921519579229"
                    className="inline-flex items-center gap-2 bg-slt-yellow hover:bg-slt-yellow-hover text-slt-blue-dark font-semibold px-8 py-4 rounded-lg transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Jetzt anfragen
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Use Cases */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-headline mb-8 text-center">
              Weitere Anwendungsfälle
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Link
                href="/anwendungsfaelle/poolbau"
                className="group bg-white rounded-xl p-6 border border-border hover:border-slt-blue/30 hover:shadow-md transition-all"
              >
                <h3 className="font-display text-lg font-bold text-headline group-hover:text-slt-blue transition-colors">
                  Poolbau
                </h3>
                <p className="text-sm text-body mt-2">
                  Poolgrube ausheben und Erdreich transportieren
                </p>
              </Link>
              <Link
                href="/anwendungsfaelle/fundamente"
                className="group bg-white rounded-xl p-6 border border-border hover:border-slt-blue/30 hover:shadow-md transition-all"
              >
                <h3 className="font-display text-lg font-bold text-headline group-hover:text-slt-blue transition-colors">
                  Fundamente
                </h3>
                <p className="text-sm text-body mt-2">
                  Bodenplatten und Streifenfundamente ausheben
                </p>
              </Link>
              <Link
                href="/anwendungsfaelle/gartengestaltung"
                className="group bg-white rounded-xl p-6 border border-border hover:border-slt-blue/30 hover:shadow-md transition-all"
              >
                <h3 className="font-display text-lg font-bold text-headline group-hover:text-slt-blue transition-colors">
                  Gartengestaltung
                </h3>
                <p className="text-sm text-body mt-2">
                  Geländemodellierung und Pflanzarbeiten
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 bg-slt-blue text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl md:text-4xl font-bold mb-4">
              Entwässerungsproblem lösen?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Lassen Sie sich kostenlos beraten, welche Drainage-Lösung für Ihr
              Grundstück am besten geeignet ist.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:+4921519579229"
                className="inline-flex items-center gap-2 bg-slt-yellow hover:bg-slt-yellow-hover text-slt-blue-dark font-semibold px-8 py-4 rounded-lg transition-colors"
              >
                <Phone className="w-5 h-5" />
                02151 - 957 92 29
              </a>
              <div className="flex items-center gap-2 text-white/80">
                <Clock className="w-5 h-5" />
                Mo-Fr 7:00-18:00, Sa 8:00-14:00
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
