import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, ArrowLeft, ExternalLink, Truck, Info } from 'lucide-react'
import { JsonLd, generateBreadcrumbSchema } from '@/components/seo/json-ld'

export const metadata: Metadata = {
  title: 'Minibagger-Mietkosten in Krefeld – Preisübersicht 2026',
  description:
    'Was kostet ein Minibagger in Krefeld? Transparente Preisübersicht: Tagesmiete, Wochenpreis, Lieferkosten nach Meerbusch, Willich, Düsseldorf.',
  alternates: {
    canonical: 'https://www.minibagger-krefeld.de/ratgeber/minibagger-mietkosten-krefeld',
  },
}

const priceTable = [
  { weight: '1 t (Bobcat E10Z)', daily: 'ab 99 €', weekend: 'ab 99 €', weekly: 'ab 399 €' },
  { weight: '2 t (XCMG XE20E)', daily: 'ab 129 €', weekend: 'ab 129 €', weekly: 'ab 499 €' },
  { weight: '2,7 t (XCMG XE27E)', daily: 'ab 149 €', weekend: 'ab 149 €', weekly: 'ab 579 €' },
  { weight: '3,5 t (Bobcat E35z)', daily: 'ab 189 €', weekend: 'ab 189 €', weekly: 'ab 729 €' },
  { weight: '5 t (Bobcat E50z)', daily: 'ab 229 €', weekend: 'ab 229 €', weekly: 'ab 879 €' },
]

const deliveryZones = [
  { zone: 'Krefeld Stadtgebiet', price: 'ab 90 €', time: '30–45 Min.' },
  { zone: 'Meerbusch, Willich, Tönisvorst', price: 'ab 110 €', time: '20–35 Min.' },
  { zone: 'Düsseldorf (Stadtgebiet)', price: 'ab 140 €', time: '25–40 Min.' },
  { zone: 'Duisburg, Moers', price: 'ab 130 €', time: '25–40 Min.' },
  { zone: 'Neuss, Kaarst, Korschenbroich', price: 'ab 130 €', time: '30–45 Min.' },
  { zone: 'Viersen, Kempen, Nettetal', price: 'ab 150 €', time: '35–50 Min.' },
]

export default function MietkostenPage() {
  const breadcrumbs = [
    { name: 'Startseite', url: 'https://www.minibagger-krefeld.de/' },
    { name: 'Ratgeber', url: 'https://www.minibagger-krefeld.de/ratgeber' },
    { name: 'Mietkosten Krefeld', url: 'https://www.minibagger-krefeld.de/ratgeber/minibagger-mietkosten-krefeld' },
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
                <li className="text-headline font-medium truncate">Mietkosten</li>
              </ol>
            </nav>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1 text-sm text-body bg-muted px-3 py-1 rounded-full">
                <Clock className="h-4 w-4" />
                6 Min. Lesezeit
              </span>
            </div>
            
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-headline mb-6">
              Minibagger-Mietkosten in Krefeld
            </h1>
            
            <p className="text-lg text-body max-w-3xl leading-relaxed">
              Transparente Preise ohne versteckte Kosten. Hier finden Sie alle Mietpreise 
              für Minibagger am Standort Krefeld sowie die Lieferkosten in die umliegenden 
              Städte am Niederrhein.
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="py-12 lg:py-16">
          <div className="section-container">
            <div className="max-w-4xl">
              {/* Price Table */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-headline mb-6">
                  Mietpreise nach Gewichtsklasse
                </h2>
                
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full">
                    <thead className="bg-primary text-primary-foreground">
                      <tr>
                        <th className="text-left px-6 py-4 font-semibold">Minibagger</th>
                        <th className="text-left px-6 py-4 font-semibold">Tagesmiete</th>
                        <th className="text-left px-6 py-4 font-semibold">Wochenende*</th>
                        <th className="text-left px-6 py-4 font-semibold">Wochenmiete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {priceTable.map((row, index) => (
                        <tr
                          key={row.weight}
                          className={index % 2 === 0 ? 'bg-surface-light' : 'bg-background'}
                        >
                          <td className="px-6 py-4 font-medium text-headline">{row.weight}</td>
                          <td className="px-6 py-4 text-body">{row.daily}</td>
                          <td className="px-6 py-4 text-body">{row.weekend}</td>
                          <td className="px-6 py-4 text-body">{row.weekly}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <p className="text-sm text-muted-foreground mt-3">
                  * Wochenendtarif: Freitag abholen, Montag zurückbringen – Sie zahlen nur 1 Tag.
                  Alle Preise inkl. MwSt.
                </p>
              </section>

              {/* What's Included */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-headline mb-4">
                  Was ist im Mietpreis enthalten?
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-surface-light rounded-lg p-5">
                    <h3 className="font-semibold text-headline mb-3">Inklusive</h3>
                    <ul className="space-y-2 text-body text-sm">
                      <li>Minibagger mit vollem Tank</li>
                      <li>Standard-Tieflöffel</li>
                      <li>Kostenlose Einweisung bei Abholung</li>
                      <li>Vollkasko-Versicherung mit 1.500 € SB</li>
                      <li>24-Stunden-Nutzung (pro Miettag)</li>
                    </ul>
                  </div>
                  <div className="bg-surface-light rounded-lg p-5">
                    <h3 className="font-semibold text-headline mb-3">Optional zubuchbar</h3>
                    <ul className="space-y-2 text-body text-sm">
                      <li>Zusätzliche Anbaugeräte (Greifer, Räumlöffel)</li>
                      <li>Lieferung und Abholung</li>
                      <li>Reduzierte Selbstbeteiligung (500 €)</li>
                      <li>Verlängerung der Mietzeit</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Delivery Costs */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-headline mb-4 flex items-center gap-2">
                  <Truck className="h-6 w-6 text-primary" />
                  Lieferkosten nach Region
                </h2>
                <p className="text-body mb-6">
                  Keine Zeit für die Abholung? Wir liefern Ihren Minibagger direkt auf die 
                  Baustelle – und holen ihn nach Mietende wieder ab.
                </p>
                
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left px-6 py-3 font-semibold text-headline">Region</th>
                        <th className="text-left px-6 py-3 font-semibold text-headline">Preis (Hin + Rück)</th>
                        <th className="text-left px-6 py-3 font-semibold text-headline">Fahrzeit ab Krefeld</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveryZones.map((zone, index) => (
                        <tr
                          key={zone.zone}
                          className={index % 2 === 0 ? 'bg-surface-light' : 'bg-background'}
                        >
                          <td className="px-6 py-3 text-body">{zone.zone}</td>
                          <td className="px-6 py-3 font-medium text-headline">{zone.price}</td>
                          <td className="px-6 py-3 text-body">{zone.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="bg-slt-yellow/10 border border-slt-yellow/30 rounded-lg p-4 mt-4">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-slt-yellow flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-body">
                      <strong>Tipp:</strong> Bei längeren Mietzeiten (ab 1 Woche) gewähren 
                      wir oft Rabatt auf die Lieferkosten. Fragen Sie uns!
                    </p>
                  </div>
                </div>
              </section>

              {/* Tiefpreisgarantie */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-headline mb-4">
                  Unsere Tiefpreisgarantie
                </h2>
                <p className="text-body leading-relaxed mb-4">
                  Finden Sie ein vergleichbares Angebot eines anderen Anbieters in Krefeld 
                  günstiger, unterbieten wir den Preis um 10 %. Einfach Angebot vorlegen – 
                  wir passen unseren Preis entsprechend an.
                </p>
                <p className="text-body leading-relaxed">
                  Die Tiefpreisgarantie gilt für vergleichbare Minibagger gleicher 
                  Gewichtsklasse und Ausstattung bei Vermietern im Umkreis von 30 km.
                </p>
              </section>

              {/* CTA */}
              <section className="bg-primary rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold text-primary-foreground mb-4">
                  Jetzt Minibagger buchen
                </h2>
                <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                  Aktuelle Verfügbarkeit und Online-Buchung auf slt-rental.de
                </p>
                <a
                  href="https://www.slt-rental.de/mieten/krefeld/erdbewegung"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cta inline-flex items-center gap-2"
                >
                  Zur Buchung
                  <ExternalLink className="h-4 w-4" />
                </a>
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
