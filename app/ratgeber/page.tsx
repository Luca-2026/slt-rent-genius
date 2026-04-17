import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Clock, ArrowRight } from 'lucide-react'
import { JsonLd, generateBreadcrumbSchema } from '@/components/seo/json-ld'

export const metadata: Metadata = {
  title: 'Ratgeber – Minibagger mieten leicht gemacht',
  description:
    'Praktische Ratgeber rund um die Minibagger-Miete: Welcher Bagger für welches Projekt, Kosten, Führerschein-Fragen und Transport-Tipps.',
  alternates: {
    canonical: 'https://www.minibagger-krefeld.de/ratgeber',
  },
  openGraph: {
    title: 'Minibagger-Ratgeber | SLT Rental Krefeld',
    description:
      'Praktische Ratgeber rund um die Minibagger-Miete in Krefeld und Umgebung.',
    url: 'https://www.minibagger-krefeld.de/ratgeber',
  },
}

const ratgeberArticles = [
  {
    slug: 'welcher-minibagger-fuer-mein-projekt',
    title: 'Welcher Minibagger für mein Projekt?',
    description:
      'Entscheidungshilfe für die richtige Baggergröße – von 1 t bis 5 t, mit konkreten Projektbeispielen und Empfehlungen für Krefelder Bodenverhältnisse.',
    readTime: '8 Min.',
    topics: ['Baggergrößen', 'Projektplanung', 'Kaufentscheidung'],
  },
  {
    slug: 'minibagger-ohne-baggerschein',
    title: 'Minibagger ohne Baggerschein?',
    description:
      'Ab welcher Größe brauchen Sie einen Baggerschein? Was gilt auf privaten Grundstücken und was im gewerblichen Einsatz? Alle rechtlichen Grundlagen.',
    readTime: '5 Min.',
    topics: ['Rechtliches', 'Führerschein', 'Sicherheit'],
  },
  {
    slug: 'minibagger-mietkosten-krefeld',
    title: 'Minibagger-Mietkosten in Krefeld',
    description:
      'Transparente Preisübersicht: Tagesmiete, Wochenpreis, Lieferkosten nach Meerbusch, Willich, Düsseldorf und weitere Städte am Niederrhein.',
    readTime: '6 Min.',
    topics: ['Kosten', 'Preise', 'Lieferung'],
  },
  {
    slug: 'anhaenger-fuer-minibagger-transport',
    title: 'Anhänger für Minibagger-Transport',
    description:
      'Welcher Anhänger für welchen Bagger? Führerscheinvorgaben (B, BE, C1E) und praktische Tipps für den sicheren Transport.',
    readTime: '7 Min.',
    topics: ['Transport', 'Anhänger', 'Führerschein'],
  },
]

export default function RatgeberPage() {
  const breadcrumbs = [
    { name: 'Startseite', url: 'https://www.minibagger-krefeld.de/' },
    { name: 'Ratgeber', url: 'https://www.minibagger-krefeld.de/ratgeber' },
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
              <li className="text-headline font-medium">Ratgeber</li>
            </ol>
          </nav>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-headline mb-4">
            Ratgeber
          </h1>
          <p className="text-lg text-body max-w-3xl">
            Praktisches Wissen für Ihr Projekt – von Experten geschrieben, für Einsteiger
            verständlich. Hier finden Sie Antworten auf die wichtigsten Fragen rund um die
            Minibagger-Miete.
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-8">
            {ratgeberArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/ratgeber/${article.slug}`}
                className="content-card p-6 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="inline-flex items-center gap-1 text-xs text-body bg-muted px-2 py-1 rounded">
                        <Clock className="h-3 w-3" />
                        {article.readTime} Lesezeit
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-headline mb-3 group-hover:text-primary transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-body text-sm mb-4 leading-relaxed">
                      {article.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.topics.map((topic) => (
                        <span
                          key={topic}
                          className="text-xs bg-surface-light text-body px-2 py-1 rounded"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-primary font-medium text-sm group-hover:gap-2 transition-all">
                      Artikel lesen
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
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
            Noch Fragen?
          </h2>
          <p className="text-body mb-6 max-w-xl mx-auto">
            Unser Team berät Sie gerne persönlich – telefonisch oder vor Ort am Standort
            Krefeld-Fichtenhain.
          </p>
          <Link href="/kontakt" className="btn-primary inline-block">
            Kontakt aufnehmen
          </Link>
        </div>
      </section>
    </>
  )
}
