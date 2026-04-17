import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

const useCases = [
  {
    title: 'Poolbau',
    description: 'Welche Baggergröße für welche Poolgröße? Von der Grube bis zum fertigen Pool.',
    image: 'https://www.slt-rental.de/assets/xcmg-xe20e-1-BLCFSuTW.jpg',
    href: '/anwendungsfaelle/poolbau',
  },
  {
    title: 'Drainage & Entwässerung',
    description: 'Gräben ausheben ohne Rückenbruch – effizient und präzise mit dem richtigen Minibagger.',
    image: 'https://www.slt-rental.de/assets/bobcat-e35z-1-Dlcw6I8U.webp',
    href: '/anwendungsfaelle/drainage-entwaesserung',
  },
  {
    title: 'Gartenumgestaltung',
    description: 'Boden abtragen, Wurzelstöcke entfernen, Terrassen vorbereiten – alles in einem Arbeitsgang.',
    image: 'https://www.slt-rental.de/assets/xcmg-xe27e-1-rowubIr-.jpg',
    href: '/anwendungsfaelle/gartenumgestaltung',
  },
  {
    title: 'Fundamentaushub',
    description: 'Garage, Carport, Gartenhaus – die richtige Tiefe für ein stabiles Fundament.',
    image: 'https://www.slt-rental.de/assets/bobcat-e50z-1-BERvbZde.webp',
    href: '/anwendungsfaelle/fundamentaushub',
  },
]

export function UseCasesSection() {
  return (
    <section className="py-16 lg:py-24 bg-surface-light">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-headline mb-4">
            Anwendungsfälle
          </h2>
          <p className="text-lg text-body max-w-2xl mx-auto">
            Praktische Leitfäden für Ihre Projekte – mit konkreten Empfehlungen 
            für Baggergröße, Zeitaufwand und Kosten.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase) => (
            <Link
              key={useCase.href}
              href={useCase.href}
              className="content-card group"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={useCase.image}
                  alt={useCase.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <h3 className="absolute bottom-4 left-4 right-4 text-xl font-bold text-white">
                  {useCase.title}
                </h3>
              </div>
              <div className="p-4">
                <p className="text-body text-sm mb-4">{useCase.description}</p>
                <span className="inline-flex items-center gap-1 text-primary font-medium text-sm group-hover:gap-2 transition-all">
                  Zum Leitfaden
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/anwendungsfaelle" className="btn-secondary">
            Alle Anwendungsfälle ansehen
          </Link>
        </div>
      </div>
    </section>
  )
}
