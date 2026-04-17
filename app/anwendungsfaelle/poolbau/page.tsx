import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Clock, CheckCircle2, Info } from 'lucide-react'
import { JsonLd, generateBreadcrumbSchema } from '@/components/seo/json-ld'

export const metadata: Metadata = {
  title: 'Poolbau mit Minibagger – Welche Größe für welchen Pool?',
  description:
    'Poolaushub mit dem Minibagger: Welche Baggergröße für welche Poolgröße? Zeitaufwand, Kosten und praktische Tipps für Krefeld und Umgebung.',
  alternates: {
    canonical: 'https://www.minibagger-krefeld.de/anwendungsfaelle/poolbau',
  },
}

const poolSizes = [
  {
    type: 'Aufstellpool / kleiner Einbaupool',
    dimensions: 'ca. 3 x 2 m, 1,2 m tief',
    excavation: '~10 m³',
    bagger: '2 t (XCMG XE20E)',
    time: '3–5 Stunden',
  },
  {
    type: 'Standard-Gartenpool',
    dimensions: 'ca. 6 x 3 m, 1,5 m tief',
    excavation: '~35 m³',
    bagger: '2,7 t (XCMG XE27E)',
    time: '1 Tag',
  },
  {
    type: 'Großer Familienpool',
    dimensions: 'ca. 8 x 4 m, 1,5–2 m tief',
    excavation: '~60–80 m³',
    bagger: '3,5 t (Bobcat E35z)',
    time: '1–2 Tage',
  },
  {
    type: 'Schwimmpool / Sportbecken',
    dimensions: 'ab 10 x 5 m, 2 m tief',
    excavation: '100+ m³',
    bagger: '5 t (Bobcat E50z)',
    time: '2–3 Tage',
  },
]

export default function PoolbauPage() {
  const breadcrumbs = [
    { name: 'Startseite', url: 'https://www.minibagger-krefeld.de/' },
    { name: 'Anwendungsfälle', url: 'https://www.minibagger-krefeld.de/anwendungsfaelle' },
    { name: 'Poolbau', url: 'https://www.minibagger-krefeld.de/anwendungsfaelle/poolbau' },
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
                  <Link href="/anwendungsfaelle" className="hover:text-primary">Anwendungsfälle</Link>
                </li>
                <li>/</li>
                <li className="text-headline font-medium">Poolbau</li>
              </ol>
            </nav>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1 text-sm text-body bg-muted px-3 py-1 rounded-full">
                <Clock className="h-4 w-4" />
                6 Min. Lesezeit
              </span>
              <span className="text-sm text-body bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                2 t – 3,5 t empfohlen
              </span>
            </div>
            
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-headline mb-6">
              Poolbau mit Minibagger
            </h1>
            
            <p className="text-lg text-body max-w-3xl leading-relaxed">
              Der Traum vom eigenen Pool im Garten beginnt mit einem ordentlichen Loch. 
              Mit dem richtigen Minibagger schaffen Sie den Aushub in wenigen Stunden – 
              was von Hand Tage dauern würde.
            </p>
          </div>
        </header>

        {/* Hero Image */}
        <div className="relative h-64 md:h-96">
          <Image
            src="https://www.slt-rental.de/assets/xcmg-xe20e-1-BLCFSuTW.jpg"
            alt="Minibagger beim Poolaushub"
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="py-12 lg:py-16">
          <div className="section-container">
            <div className="max-w-4xl">
              {/* Quick Overview */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-headline mb-6">
                  Welcher Minibagger für welchen Pool?
                </h2>
                
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-primary text-primary-foreground">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold">Pooltyp</th>
                        <th className="text-left px-4 py-3 font-semibold">Maße</th>
                        <th className="text-left px-4 py-3 font-semibold">Aushub</th>
                        <th className="text-left px-4 py-3 font-semibold">Empfohlener Bagger</th>
                        <th className="text-left px-4 py-3 font-semibold">Zeitaufwand</th>
                      </tr>
                    </thead>
                    <tbody>
                      {poolSizes.map((pool, index) => (
                        <tr
                          key={pool.type}
                          className={index % 2 === 0 ? 'bg-surface-light' : 'bg-background'}
                        >
                          <td className="px-4 py-3 font-medium text-headline">{pool.type}</td>
                          <td className="px-4 py-3 text-body">{pool.dimensions}</td>
                          <td className="px-4 py-3 text-body">{pool.excavation}</td>
                          <td className="px-4 py-3 text-primary font-medium">{pool.bagger}</td>
                          <td className="px-4 py-3 text-body">{pool.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Step by Step */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-headline mb-6">
                  Schritt für Schritt zum Poolaushub
                </h2>
                
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-headline mb-1">Grube abstecken</h3>
                      <p className="text-body text-sm">
                        Markieren Sie die Poolposition mit Schnur und Pflöcken. 
                        Planen Sie rundherum 50–80 cm Arbeitsraum für Isolierung und Verrohrung ein.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-headline mb-1">Oberboden abtragen</h3>
                      <p className="text-body text-sm">
                        Entfernen Sie zuerst die Grasnarbe und den Mutterboden (ca. 30 cm). 
                        Lagern Sie diesen separat – er ist wertvoll für die Gartengestaltung.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-headline mb-1">Grube ausheben</h3>
                      <p className="text-body text-sm">
                        Arbeiten Sie sich schichtweise in die Tiefe. Halten Sie die Wände 
                        leicht schräg (ca. 5°) für bessere Stabilität bis zur Schalung.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-headline mb-1">Boden verdichten</h3>
                      <p className="text-body text-sm">
                        Verdichten Sie den Grubengrund mit einer Rüttelplatte (können Sie 
                        bei uns mitmieten). Das verhindert späteres Absacken.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Krefeld-specific Tips */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-headline mb-4">
                  Besonderheiten in Krefeld
                </h2>
                
                <div className="bg-slt-yellow/10 border border-slt-yellow/30 rounded-xl p-6 mb-6">
                  <div className="flex gap-4">
                    <Info className="h-6 w-6 text-slt-yellow flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-headline mb-2">Grundwasser beachten</h3>
                      <p className="text-body text-sm">
                        In Teilen von Krefeld-Uerdingen und den Rheinauen liegt der 
                        Grundwasserspiegel relativ hoch. Bei Pools tiefer als 1,5 m 
                        empfehlen wir vorab eine Baugrunduntersuchung. Im Krefelder Süden 
                        (Fischeln, Oppum) ist der Boden meist lehmig und das Grundwasser tiefer.
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-body leading-relaxed">
                  <strong>Wohin mit dem Aushub?</strong> Bei 30–80 m³ Erdaushub brauchen 
                  Sie einen Plan. Möglichkeiten: Containerservice (in Krefeld ab ca. 250 €/Container), 
                  Verwendung im eigenen Garten (Hügelbeet, Geländemodellierung) oder 
                  Abgabe bei einer Deponie. Wir beraten Sie gerne.
                </p>
              </section>

              {/* Checklist */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-headline mb-4">
                  Checkliste: Daran sollten Sie denken
                </h2>
                
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-body">Baugenehmigung prüfen (in NRW für Pools ab 100 m³ erforderlich)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-body">Leitungen und Kabel im Boden lokalisieren</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-body">Zufahrt für Minibagger und Abtransport planen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-body">Aushub-Entsorgung organisieren</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-body">Rüttelplatte für Bodenverdichtung einplanen</span>
                  </li>
                </ul>
              </section>

              {/* CTA */}
              <section className="bg-primary rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold text-primary-foreground mb-4">
                  Poolprojekt geplant?
                </h2>
                <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                  Wir empfehlen Ihnen den passenden Minibagger für Ihre Poolgröße – 
                  inklusive Tipps für den Aushub.
                </p>
                <Link href="/kontakt" className="btn-cta">
                  Beratung anfragen
                </Link>
              </section>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="section-container pb-12">
          <Link
            href="/anwendungsfaelle"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Übersicht
          </Link>
        </div>
      </article>
    </>
  )
}
