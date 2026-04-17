import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, ArrowLeft, ExternalLink, CheckCircle2 } from 'lucide-react'
import { JsonLd, generateBreadcrumbSchema } from '@/components/seo/json-ld'

export const metadata: Metadata = {
  title: 'Welcher Minibagger für mein Projekt? – Entscheidungshilfe',
  description:
    'Welcher Minibagger passt zu Ihrem Projekt? Von 1 t bis 5 t – mit konkreten Beispielen für Poolbau, Gartenumgestaltung, Fundamentaushub und mehr.',
  alternates: {
    canonical: 'https://www.minibagger-krefeld.de/ratgeber/welcher-minibagger-fuer-mein-projekt',
  },
}

const recommendations = [
  {
    weight: '1 t (Bobcat E10Z)',
    projects: [
      'Durchbrüche in Kellern und Innenräumen',
      'Arbeiten durch enge Gartentore (ab 71 cm)',
      'Kleine Pflasterarbeiten und Baumwurzelentfernung',
      'Aushub für Wasseranschlüsse',
    ],
    notSuitable: 'Tiefe Fundamentarbeiten, großflächige Erdbewegung',
    image: 'https://www.slt-rental.de/assets/bobcat-e10z-1-BIztT504.jpg',
  },
  {
    weight: '2 t (XCMG XE20E)',
    projects: [
      'Poolaushub für kleine bis mittlere Pools',
      'Drainagegräben und Entwässerungsarbeiten',
      'Gartenumgestaltung auf mittleren Flächen',
      'Pflanzlöcher für große Bäume',
    ],
    notSuitable: 'Sehr tiefe Fundamente, Großbaustellen',
    image: 'https://www.slt-rental.de/assets/xcmg-xe20e-1-BLCFSuTW.jpg',
  },
  {
    weight: '2,7 t (XCMG XE27E)',
    projects: [
      'Standard-Gartenbau und Terrassenanlagen',
      'Garagenfundamente und Carport-Aushub',
      'Mittlere Poolprojekte',
      'Umfangreiche Wurzelstockentfernung',
    ],
    notSuitable: 'Engste Zugänge unter 1,50 m',
    image: 'https://www.slt-rental.de/assets/xcmg-xe27e-1-rowubIr-.jpg',
  },
  {
    weight: '3,5 t (Bobcat E35z)',
    projects: [
      'Profi-Tiefbau und Leitungsbau',
      'Große Fundamentaushübe',
      'Umfangreiche Erdarbeiten',
      'Gewerbliche Bauvorhaben',
    ],
    notSuitable: 'Private Kleingärten mit engem Zugang',
    image: 'https://www.slt-rental.de/assets/bobcat-e35z-1-Dlcw6I8U.webp',
  },
  {
    weight: '5 t (Bobcat E50z)',
    projects: [
      'Großbaustellen und Gewerbebau',
      'Umfangreiche Erdbewegung',
      'Tiefe Baugruben',
      'Straßen- und Kanalbau',
    ],
    notSuitable: 'Eingeengte Privatgrundstücke',
    image: 'https://www.slt-rental.de/assets/bobcat-e50z-1-BERvbZde.webp',
  },
]

export default function WelcherMinibaggerPage() {
  const breadcrumbs = [
    { name: 'Startseite', url: 'https://www.minibagger-krefeld.de/' },
    { name: 'Ratgeber', url: 'https://www.minibagger-krefeld.de/ratgeber' },
    { name: 'Welcher Minibagger für mein Projekt?', url: 'https://www.minibagger-krefeld.de/ratgeber/welcher-minibagger-fuer-mein-projekt' },
  ]

  return (
    <>
      <JsonLd type="breadcrumb" data={generateBreadcrumbSchema(breadcrumbs)} />

      <article>
        {/* Header */}
        <header className="bg-surface-light py-12 lg:py-16">
          <div className="section-container">
            <nav className="mb-6">
              <ol className="flex items-center gap-2 text-sm text-body">
                <li>
                  <Link href="/" className="hover:text-primary">Startseite</Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/ratgeber" className="hover:text-primary">Ratgeber</Link>
                </li>
                <li>/</li>
                <li className="text-headline font-medium truncate">Welcher Minibagger...</li>
              </ol>
            </nav>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1 text-sm text-body bg-muted px-3 py-1 rounded-full">
                <Clock className="h-4 w-4" />
                8 Min. Lesezeit
              </span>
            </div>
            
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-headline mb-6">
              Welcher Minibagger für mein Projekt?
            </h1>
            
            <p className="text-lg text-body max-w-3xl leading-relaxed">
              Die richtige Baggergröße entscheidet über Effizienz, Kosten und Erfolg Ihres 
              Projekts. Zu klein bedeutet Zeitverlust, zu groß kann den Garten beschädigen 
              oder gar nicht erst durchpassen. Dieser Leitfaden hilft Ihnen bei der Wahl.
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="py-12 lg:py-16">
          <div className="section-container">
            <div className="max-w-4xl">
              {/* Intro */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-headline mb-4">
                  Die wichtigste Frage zuerst: Wie breit ist Ihr Zugang?
                </h2>
                <p className="text-body leading-relaxed mb-4">
                  Bevor Sie sich Gedanken über Grabtiefe und Motorleistung machen, messen Sie 
                  die engste Stelle auf dem Weg zum Einsatzort. Ein Gartentor, eine Einfahrt, 
                  ein Durchgang zwischen Haus und Garage – das bestimmt, welcher Bagger 
                  überhaupt in Frage kommt.
                </p>
                <div className="bg-slt-yellow/10 border border-slt-yellow/30 rounded-lg p-4">
                  <p className="font-medium text-headline">Praxis-Tipp:</p>
                  <p className="text-body text-sm">
                    Messen Sie nicht nur die Breite, sondern auch die Höhe. Der 1-Tonner 
                    Bobcat E10Z kann mit abgesenktem Ausleger unter 2-Meter-Durchgänge fahren.
                  </p>
                </div>
              </section>

              {/* Recommendations */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-headline mb-6">
                  Empfehlungen nach Gewichtsklasse
                </h2>
                
                <div className="space-y-8">
                  {recommendations.map((rec) => (
                    <div key={rec.weight} className="border border-border rounded-xl overflow-hidden">
                      <div className="md:flex">
                        <div className="md:w-1/3 relative h-48 md:h-auto">
                          <Image
                            src={rec.image}
                            alt={`Minibagger ${rec.weight}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-6 md:w-2/3">
                          <h3 className="text-xl font-bold text-primary mb-4">{rec.weight}</h3>
                          <p className="font-medium text-headline mb-2">Ideal geeignet für:</p>
                          <ul className="space-y-2 mb-4">
                            {rec.projects.map((project) => (
                              <li key={project} className="flex items-start gap-2 text-body text-sm">
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                {project}
                              </li>
                            ))}
                          </ul>
                          <p className="text-sm text-muted-foreground">
                            <strong>Weniger geeignet:</strong> {rec.notSuitable}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Krefeld-specific */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-headline mb-4">
                  Besonderheiten in Krefeld und Umgebung
                </h2>
                <p className="text-body leading-relaxed mb-4">
                  Die Bodenverhältnisse am Niederrhein sind nicht überall gleich. Im Krefelder 
                  Süden und Richtung Fischeln dominieren lehmige Böden – hier brauchen Sie 
                  etwas mehr Kraft und Zeit. In den Rheinauen bei Uerdingen ist der Boden 
                  sandiger und lässt sich schneller bearbeiten.
                </p>
                <p className="text-body leading-relaxed">
                  <strong>Unsere Empfehlung:</strong> Bei lehmigen Böden lieber eine Nummer 
                  größer wählen. Der 2,7-Tonner schafft im Lehm, was der 2-Tonner im Sand erledigt.
                </p>
              </section>

              {/* CTA */}
              <section className="bg-primary rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold text-primary-foreground mb-4">
                  Immer noch unsicher?
                </h2>
                <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                  Beschreiben Sie uns Ihr Projekt – wir empfehlen Ihnen den passenden Bagger.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/kontakt" className="btn-cta">
                    Beratung anfragen
                  </Link>
                  <a
                    href="https://www.slt-rental.de/mieten/krefeld/erdbewegung"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-primary-foreground border-2 border-primary-foreground/30 hover:bg-primary-foreground/10 transition-colors"
                  >
                    Minibagger ansehen
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="section-container pb-12">
          <Link
            href="/ratgeber"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Ratgeber-Übersicht
          </Link>
        </div>
      </article>
    </>
  )
}
