import Link from 'next/link'

export function FinalCtaSection() {
  return (
    <section className="py-16 lg:py-24 bg-primary">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Bereit für Ihr Projekt?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-10">
            Ob Poolbau, Gartenumgestaltung oder Fundamentaushub – 
            wir haben den passenden Minibagger für Sie.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.slt-rental.de/mieten/krefeld/erdbewegung"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta text-center"
            >
              Direkt auf slt-rental.de buchen
            </a>
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-primary-foreground border-2 border-primary-foreground/30 hover:bg-primary-foreground/10 transition-colors"
            >
              Persönliche Beratung anfragen
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
