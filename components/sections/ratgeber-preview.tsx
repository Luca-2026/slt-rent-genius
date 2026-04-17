import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'

const ratgeberArticles = [
  {
    title: 'Welcher Minibagger für mein Projekt?',
    description: 'Entscheidungshilfe für die richtige Baggergröße – von 1 t bis 5 t, mit konkreten Projektbeispielen.',
    href: '/ratgeber/welcher-minibagger-fuer-mein-projekt',
    readTime: '8 Min.',
  },
  {
    title: 'Minibagger ohne Baggerschein?',
    description: 'Ab welcher Größe brauchen Sie einen Baggerschein? Was gilt auf privaten Grundstücken?',
    href: '/ratgeber/minibagger-ohne-baggerschein',
    readTime: '5 Min.',
  },
  {
    title: 'Minibagger-Mietkosten in Krefeld',
    description: 'Transparente Preisübersicht: Tagesmiete, Wochenpreis, Lieferkosten nach Meerbusch, Willich & Co.',
    href: '/ratgeber/minibagger-mietkosten-krefeld',
    readTime: '6 Min.',
  },
  {
    title: 'Anhänger für Minibagger-Transport',
    description: 'Welcher Anhänger für welchen Bagger? Führerscheinvorgaben und Tipps für den sicheren Transport.',
    href: '/ratgeber/anhaenger-fuer-minibagger-transport',
    readTime: '7 Min.',
  },
]

export function RatgeberPreviewSection() {
  return (
    <section className="py-16 lg:py-24 bg-surface-light">
      <div className="section-container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-headline mb-4">
              Ratgeber
            </h2>
            <p className="text-lg text-body max-w-2xl">
              Praktisches Wissen für Ihr Projekt – von Experten geschrieben, 
              für Einsteiger verständlich.
            </p>
          </div>
          <Link
            href="/ratgeber"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline whitespace-nowrap"
          >
            Alle Ratgeber
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {ratgeberArticles.map((article) => (
            <Link
              key={article.href}
              href={article.href}
              className="content-card p-6 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-body bg-muted px-2 py-1 rounded">
                      {article.readTime} Lesezeit
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-headline mb-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-body text-sm">{article.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
