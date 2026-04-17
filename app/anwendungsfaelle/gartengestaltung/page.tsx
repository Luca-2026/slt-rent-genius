import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Phone, Clock, Leaf, TreePine, Mountain, Droplets } from "lucide-react"
import { LocalBusinessJsonLd, ArticleJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "Minibagger für Gartengestaltung mieten | Erdarbeiten im Garten | Krefeld",
  description: "Minibagger für Gartengestaltung in Krefeld mieten. Ideal für Geländemodellierung, Teichanlagen, Pflanzlöcher und Terrassenbau. Ab 120€/Tag.",
  keywords: ["Minibagger Garten", "Gartengestaltung Krefeld", "Erdarbeiten Garten", "Geländemodellierung"],
  openGraph: {
    title: "Minibagger für Gartengestaltung mieten | SLT Krefeld",
    description: "Professionelle Gartengestaltung mit dem Minibagger. Kompakte Maschinen für jeden Garten.",
    type: "article",
  },
}

const gardenProjects = [
  {
    title: "Geländemodellierung",
    description: "Hügel anlegen, Senken auffüllen oder Hanglagen terrassieren",
    icon: Mountain,
    tasks: [
      "Oberboden abtragen und seitlich lagern",
      "Erdreich umverteilen und verdichten",
      "Böschungen anlegen und formen",
      "Rasenaussaat vorbereiten",
    ],
    bagger: "1,0t - 1,7t",
  },
  {
    title: "Teich & Wasserspiele",
    description: "Gartenteiche, Schwimmteiche oder Bachläufe anlegen",
    icon: Droplets,
    tasks: [
      "Teichmulde in gewünschter Form ausheben",
      "Verschiedene Tiefenzonen gestalten",
      "Aushub für Randbepflanzung nutzen",
      "Zu- und Ablauf vorbereiten",
    ],
    bagger: "0,8t - 1,5t",
  },
  {
    title: "Pflanzarbeiten",
    description: "Große Pflanzlöcher für Bäume, Hecken und Sträucher",
    icon: TreePine,
    tasks: [
      "Pflanzlöcher für Großbäume ausheben",
      "Heckengräben anlegen",
      "Wurzelballen einsetzen",
      "Substrat einarbeiten",
    ],
    bagger: "0,8t - 1,0t",
  },
  {
    title: "Terrassenbau",
    description: "Untergrund für Terrassen und Wege vorbereiten",
    icon: Leaf,
    tasks: [
      "Terrassenfläche ausheben",
      "Tragschicht einbringen",
      "Fläche planieren",
      "Gefälle für Entwässerung herstellen",
    ],
    bagger: "1,0t - 1,7t",
  },
]

const advantages = [
  {
    title: "Kompakte Abmessungen",
    description: "Unsere Minibagger passen durch Gartentore ab 80cm Breite und schonen Ihren Rasen",
  },
  {
    title: "Schonende Arbeit",
    description: "Gummiketten verteilen das Gewicht und minimieren Flurschäden",
  },
  {
    title: "Vielseitige Einsätze",
    description: "Vom Pflanzloch bis zur kompletten Geländeumgestaltung",
  },
  {
    title: "Schnelle Ergebnisse",
    description: "In wenigen Stunden schaffen Sie, was sonst Tage dauert",
  },
]

export default function GartengestaltungPage() {
  return (
    <>
      <LocalBusinessJsonLd />
      <ArticleJsonLd
        title="Minibagger für Gartengestaltung mieten"
        description="Kompletter Ratgeber für Gartenarbeiten mit dem Minibagger"
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
                Minibagger für Gartengestaltung mieten
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                Verwandeln Sie Ihren Garten mit einem Minibagger. Ob Geländemodellierung,
                Teichanlage oder Terrassenbau - mit der richtigen Maschine gelingen
                auch große Projekte schnell und professionell.
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

        {/* Advantages */}
        <section className="py-12 bg-surface-light border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {advantages.map((advantage) => (
                <div key={advantage.title} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-medium text-headline">{advantage.title}</h3>
                    <p className="text-sm text-body">{advantage.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Garden Projects */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-2xl md:text-4xl font-bold text-headline mb-4">
                Gartenprojekte mit dem Minibagger
              </h2>
              <p className="text-body max-w-2xl mx-auto">
                Von der kleinen Umgestaltung bis zum kompletten Gartenneubau -
                unsere Minibagger unterstützen Sie bei jedem Vorhaben.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {gardenProjects.map((project) => (
                <div
                  key={project.title}
                  className="bg-white rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slt-blue/10 rounded-lg flex items-center justify-center shrink-0">
                      <project.icon className="w-6 h-6 text-slt-blue" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-bold text-headline mb-2">
                        {project.title}
                      </h3>
                      <p className="text-body mb-4">{project.description}</p>

                      <ul className="space-y-2 mb-4">
                        {project.tasks.map((task, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-body">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            {task}
                          </li>
                        ))}
                      </ul>

                      <div className="inline-flex items-center gap-2 bg-surface-light px-3 py-1.5 rounded-full">
                        <span className="text-sm text-muted-foreground">Empfohlen:</span>
                        <span className="text-sm font-medium text-headline">{project.bagger}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-16 md:py-24 bg-surface-light">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-headline mb-8 text-center">
                Tipps für die Gartenarbeit mit dem Minibagger
              </h2>

              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-border">
                  <h3 className="font-display text-lg font-bold text-headline mb-2">
                    Zufahrt planen
                  </h3>
                  <p className="text-body">
                    Prüfen Sie vorab die Zufahrt zum Garten. Unsere kleinsten Bagger
                    (0,8t) passen durch Tore ab 80cm Breite. Messen Sie kritische Stellen
                    aus und teilen Sie uns die Maße bei der Buchung mit.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-border">
                  <h3 className="font-display text-lg font-bold text-headline mb-2">
                    Oberboden schonen
                  </h3>
                  <p className="text-body">
                    Lagern Sie wertvollen Oberboden immer separat vom Unterboden.
                    So können Sie ihn später wieder aufbringen und sparen teure
                    Neuanschaffung.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-border">
                  <h3 className="font-display text-lg font-bold text-headline mb-2">
                    Leitungen beachten
                  </h3>
                  <p className="text-body">
                    Informieren Sie sich vor Grabarbeiten über unterirdische Leitungen
                    (Strom, Gas, Wasser). Im Zweifelsfall hilft eine Leitungsauskunft
                    oder vorsichtiges Freilegen per Hand.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-border">
                  <h3 className="font-display text-lg font-bold text-headline mb-2">
                    Wetter berücksichtigen
                  </h3>
                  <p className="text-body">
                    Bei längerer Trockenheit ist der Boden hart - planen Sie mehr Zeit
                    ein. Nach Regen kann der Boden zu weich sein. Ideal sind leicht
                    feuchte Bedingungen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Teaser */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-br from-slt-blue to-slt-blue-dark rounded-2xl p-8 md:p-12 text-white max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                    Gartenpaket für Heimwerker
                  </h2>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-3 text-white/90">
                      <CheckCircle className="w-5 h-5 text-slt-yellow" />
                      Kompakter Minibagger (0,8t - 1,7t)
                    </li>
                    <li className="flex items-center gap-3 text-white/90">
                      <CheckCircle className="w-5 h-5 text-slt-yellow" />
                      Verschiedene Löffelbreiten
                    </li>
                    <li className="flex items-center gap-3 text-white/90">
                      <CheckCircle className="w-5 h-5 text-slt-yellow" />
                      Planierschild für Feinarbeiten
                    </li>
                    <li className="flex items-center gap-3 text-white/90">
                      <CheckCircle className="w-5 h-5 text-slt-yellow" />
                      Lieferung direkt in den Garten
                    </li>
                  </ul>
                </div>

                <div className="text-center md:text-right">
                  <div className="text-sm text-white/70 mb-1">Tagespreis ab</div>
                  <div className="font-display text-4xl md:text-5xl font-bold mb-2">
                    120 €
                  </div>
                  <div className="text-white/70 mb-6">inkl. MwSt.</div>
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
        <section className="py-16 md:py-24 bg-surface-light">
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
              Traumgarten geplant?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Wir beraten Sie gerne, welcher Minibagger für Ihr Gartenprojekt
              am besten geeignet ist.
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
