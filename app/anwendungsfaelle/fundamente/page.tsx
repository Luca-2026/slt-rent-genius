import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Phone, Clock, Wrench, Target, Shield, AlertTriangle } from "lucide-react"
import { LocalBusinessJsonLd, ArticleJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "Minibagger für Fundamente mieten | Bodenplatte & Streifenfundament | Krefeld",
  description: "Minibagger für Fundamentarbeiten in Krefeld mieten. Perfekt für Bodenplatten, Streifenfundamente und Punktfundamente. Ab 150€/Tag inkl. Einweisung.",
  keywords: ["Minibagger Fundament", "Bodenplatte ausheben", "Streifenfundament graben", "Fundament mieten Krefeld"],
  openGraph: {
    title: "Minibagger für Fundamente mieten | SLT Krefeld",
    description: "Professionelle Fundamentarbeiten mit dem richtigen Minibagger. Beratung, Lieferung und Einweisung inklusive.",
    type: "article",
  },
}

const fundamentTypes = [
  {
    name: "Bodenplatte",
    description: "Großflächige Fundamentplatte für Garagen, Gartenhäuser oder Anbauten",
    depth: "30-50 cm",
    bagger: "1,5t - 2,5t Minibagger",
    duration: "1-2 Tage",
    tips: ["Frosttiefe beachten (80cm)", "Sauberkeitsschicht einplanen", "Drainage nicht vergessen"],
  },
  {
    name: "Streifenfundament",
    description: "Linienförmiges Fundament unter tragenden Wänden",
    depth: "80-100 cm (frostfrei)",
    bagger: "1,0t - 1,7t Minibagger",
    duration: "1 Tag",
    tips: ["Breite mind. 30cm", "Exakte Flucht einhalten", "Bewehrung vorbereiten"],
  },
  {
    name: "Punktfundament",
    description: "Einzelne Fundamente für Pfosten, Carports oder Pergolen",
    depth: "80 cm (frostfrei)",
    bagger: "0,8t - 1,0t Minibagger",
    duration: "0,5-1 Tag",
    tips: ["Pfostenschuhe einplanen", "Abstände exakt messen", "Verdichtung prüfen"],
  },
]

const processSteps = [
  {
    step: 1,
    title: "Planung & Absteckung",
    description: "Fundament exakt abstecken, Höhenpunkte setzen und Grabentiefe markieren",
    icon: Target,
  },
  {
    step: 2,
    title: "Oberboden abtragen",
    description: "Mutterboden seitlich lagern für spätere Wiederverwendung im Garten",
    icon: Wrench,
  },
  {
    step: 3,
    title: "Aushub auf Tiefe",
    description: "Fundamentgraben auf erforderliche Tiefe ausheben, Sohle verdichten",
    icon: Shield,
  },
  {
    step: 4,
    title: "Feinarbeiten",
    description: "Kanten begradigen, Sauberkeitsschicht einbringen, für Betonarbeiten vorbereiten",
    icon: CheckCircle,
  },
]

export default function FundamentePage() {
  return (
    <>
      <LocalBusinessJsonLd />
      <ArticleJsonLd
        title="Minibagger für Fundamente mieten"
        description="Kompletter Ratgeber für Fundamentarbeiten mit dem Minibagger"
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
                Minibagger für Fundamente mieten
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                Ob Bodenplatte, Streifenfundament oder Punktfundament - mit dem richtigen
                Minibagger arbeiten Sie präzise und effizient. Wir beraten Sie zur
                optimalen Maschinengröße für Ihr Projekt.
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

        {/* Fundament Types */}
        <section className="py-16 md:py-24 bg-surface-light">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-2xl md:text-4xl font-bold text-headline mb-4">
                Die richtige Lösung für jeden Fundamenttyp
              </h2>
              <p className="text-body max-w-2xl mx-auto">
                Je nach Bauvorhaben benötigen Sie unterschiedliche Fundamentarten.
                Wir helfen Ihnen, den passenden Minibagger zu wählen.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {fundamentTypes.map((type) => (
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
                      <span className="text-muted-foreground">Aushubtiefe:</span>
                      <span className="font-medium text-headline">{type.depth}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Empfehlung:</span>
                      <span className="font-medium text-headline">{type.bagger}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Zeitaufwand:</span>
                      <span className="font-medium text-headline">{type.duration}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-medium text-headline mb-2">Tipps:</p>
                    <ul className="space-y-1">
                      {type.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-body">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-2xl md:text-4xl font-bold text-headline mb-4">
                So gehen Sie vor
              </h2>
              <p className="text-body max-w-2xl mx-auto">
                Mit der richtigen Vorbereitung und Vorgehensweise gelingt jedes Fundament
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {processSteps.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-16 h-16 bg-slt-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-slt-blue" />
                  </div>
                  <div className="text-sm font-medium text-slt-blue mb-2">
                    Schritt {step.step}
                  </div>
                  <h3 className="font-display text-lg font-bold text-headline mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-body">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Important Note */}
        <section className="py-12 bg-amber-50 border-y border-amber-200">
          <div className="container mx-auto px-4">
            <div className="flex items-start gap-4 max-w-3xl mx-auto">
              <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
              <div>
                <h3 className="font-display text-lg font-bold text-headline mb-2">
                  Wichtiger Hinweis zur Frosttiefe
                </h3>
                <p className="text-body">
                  In der Region Krefeld liegt die Frosttiefe bei etwa 80 cm. Fundamente
                  für tragende Bauteile müssen mindestens bis zu dieser Tiefe reichen,
                  um Frostschäden zu vermeiden. Bei Unsicherheiten beraten wir Sie gerne
                  zur richtigen Aushubtiefe.
                </p>
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
                    Komplettpaket für Ihr Fundament
                  </h2>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-3 text-body">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Passender Minibagger (0,8t - 2,5t)
                    </li>
                    <li className="flex items-center gap-3 text-body">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Tieflöffel in verschiedenen Breiten
                    </li>
                    <li className="flex items-center gap-3 text-body">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Lieferung und Abholung
                    </li>
                    <li className="flex items-center gap-3 text-body">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Persönliche Einweisung vor Ort
                    </li>
                  </ul>
                </div>

                <div className="text-center md:text-right">
                  <div className="text-sm text-muted-foreground mb-1">Ab</div>
                  <div className="font-display text-4xl md:text-5xl font-bold text-slt-blue mb-2">
                    150 €
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
              <Link
                href="/anwendungsfaelle/drainage"
                className="group bg-white rounded-xl p-6 border border-border hover:border-slt-blue/30 hover:shadow-md transition-all"
              >
                <h3 className="font-display text-lg font-bold text-headline group-hover:text-slt-blue transition-colors">
                  Drainage & Entwässerung
                </h3>
                <p className="text-sm text-body mt-2">
                  Drainagegräben und Versickerungsanlagen
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 bg-slt-blue text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl md:text-4xl font-bold mb-4">
              Fundament-Projekt geplant?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Lassen Sie sich kostenlos beraten, welcher Minibagger für Ihr
              Fundament optimal ist.
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
