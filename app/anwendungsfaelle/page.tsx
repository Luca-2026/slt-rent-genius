import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { JsonLd, generateBreadcrumbSchema } from '@/components/seo/json-ld'

export const metadata: Metadata = {
  title: 'Anwendungsfälle – Minibagger-Projekte im Überblick',
  description:
    'Praktische Leitfäden für Poolbau, Gartenumgestaltung, Drainage und Fundamentaushub. Mit Empfehlungen für die richtige Baggergröße.',
  alternates: {
    canonical: 'https://www.minibagger-krefeld.de/anwendungsfaelle',
  },
  openGraph: {
    title: 'Minibagger-Anwendungsfälle | SLT Rental Krefeld',
    description:
      'Praktische Leitfäden für Ihre Projekte mit dem Minibagger.',
    url: 'https://www.minibagger-krefeld.de/anwendungsfaelle',
  },
}

const useCases = [
  {
    slug: 'poolbau',
    title: 'Poolbau',
    description:
      'Welche Baggergröße für welche Poolgröße? Von der Grube bis zum fertigen Pool – mit konkreten Maßen und Zeitschätzungen.',
    image: 'https://www.slt-rental.de/assets/xcmg-xe20e-1-BLCFSuTW.jpg',
    recommendation: '2 t – 2,7 t empfohlen',
    duration: '1–2 Tage',
  },
  {
    slug: 'gartenumgestaltung',
    title: 'Gartenumgestaltung',
    description:
      'Boden abtragen, Wurzelstöcke entfernen, Terrassen vorbereiten – alles in einem Arbeitsgang effizient erledigen.',
    image: 'https://www.slt-rental.de/assets/xcmg-xe27e-1-rowubIr-.jpg',
    recommendation: '1 t – 2,7 t je nach Fläche',
    duration: '1–3 Tage',
  },
  {
    slug: 'drainage-entwaesserung',
    title: 'Drainage & Entwässerung',
    description:
      'Gräben ausheben ohne Rückenbruch – effizient und präzise mit dem richtigen Minibagger für Ihr Entwässerungsprojekt.',
    image: 'https://www.slt-rental.de/assets/bobcat-e35z-1-Dlcw6I8U.webp',
    recommendation: '2 t – 3,5 t empfohlen',
    duration: '1–2 Tage',
  },
  {
    slug: 'fundamentaushub',
    title: 'Fundamentaushub',
    description:
      'Garage, Carport, Gartenhaus – die richtige Tiefe für ein stabiles Fundament. Mit Berechnungsbeispielen.',
    image: 'https://www.slt-rental.de/assets/bobcat-e50z-1-BERvbZde.webp',
    recommendation: '2,7 t – 5 t empfohlen',
    duration: '1–2 Tage',
  },
]

export default function AnwendungsfaellePage() {
  const breadcrumbs = [
    { name: 'Startseite', url: 'https://www.minibagger-krefeld.de/' },
    { name: 'Anwendungsfälle', url: 'https://www.minibagger-krefeld.de/anwendungsfaelle' },
  ]

  return (
    <>
      <JsonLd type="breadcrumb" data={generateBreadcrumbSchema(breadcrumbs)} />

      {/* Hero */}
      <section className="bg-surface-light py-16 lg:py-20">
        <div className="section-container">
          <nav className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-body">
              <li>
                <Link href="/" className="hover:text-primary">
                  Startseite
                </Link>
              </li>
              <li>/</li>
              <li className="text-headline font-medium">Anwendungsfälle</li>
            </ol>
          </nav>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-headline mb-4">
            Anwendungsfälle
          </h1>
          <p className="text-lg text-body max-w-3xl">
            Praktische Leitfäden für Ihre Projekte – mit konkreten Empfehlungen für 
            Baggergröße, Zeitaufwand und Kosten. Egal ob Poolbau, Gartenumgestaltung 
            oder Fundamentaushub.
          </p>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase) => (
              <Link
                key={useCase.slug}
                href={`/anwendungsfaelle/${useCase.slug}`}
                className="content-card group overflow-hidden"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={useCase.image}
                    alt={useCase.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {useCase.title}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
                        {useCase.recommendation}
                      </span>
                      <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
                        {useCase.duration}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-body mb-4">{useCase.description}</p>
                  <span className="inline-flex items-center gap-1 text-primary font-medium group-hover:gap-2 transition-all">
                    Zum Leitfaden
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-surface-light">
        <div className="section-container text-center">
          <h2 className="text-2xl font-bold text-headline mb-4">
            Ihr Projekt ist nicht dabei?
          </h2>
          <p className="text-body mb-6 max-w-xl mx-auto">
            Beschreiben Sie uns Ihr Vorhaben – wir beraten Sie persönlich und 
            empfehlen den passenden Minibagger.
          </p>
          <Link href="/kontakt" className="btn-primary inline-block">
            Beratung anfragen
          </Link>
        </div>
      </section>
    </>
  )
}
