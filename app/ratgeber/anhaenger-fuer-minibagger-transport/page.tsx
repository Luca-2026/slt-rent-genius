import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { JsonLd, generateBreadcrumbSchema } from '@/components/seo/json-ld'

export const metadata: Metadata = {
  title: 'Anhänger für Minibagger-Transport – Welcher passt?',
  description:
    'Welcher Anhänger für welchen Minibagger? Führerscheinvorgaben (B, BE, C1E) und praktische Tipps für den sicheren Transport.',
  alternates: {
    canonical: 'https://www.minibagger-krefeld.de/ratgeber/anhaenger-fuer-minibagger-transport',
  },
}

const transportTable = [
  {
    bagger: '1 t (Bobcat E10Z)',
    weight: '1.150 kg',
    trailer: '1,3–1,5 t Nutzlast',
    license: 'B (bis 3,5 t Gesamtgewicht)',
    notes: 'Passt auf Standard-Baumaschinenanhänger',
  },
  {
    bagger: '2 t (XCMG XE20E)',
    weight: '2.010 kg',
    trailer: '2,5–3 t Nutzlast',
    license: 'BE oder B96',
    notes: 'Tandemachser empfohlen',
  },
  {
    bagger: '2,7 t (XCMG XE27E)',
    weight: '2.700 kg',
    trailer: '3–3,5 t Nutzlast',
    license: 'BE',
    notes: 'Mindestens 3,5 t zul. Gesamtgewicht',
  },
  {
    bagger: '3,5 t (Bobcat E35z)',
    weight: '3.650 kg',
    trailer: '4–5 t Nutzlast',
    license: 'C1E oder CE',
    notes: 'Schwertransport-Anhänger',
  },
  {
    bagger: '5 t (Bobcat E50z)',
    weight: '5.100 kg',
    trailer: '6–7 t Nutzlast',
    license: 'C1E oder CE',
    notes: 'Lieferung empfohlen',
  },
]

export default function AnhaengerPage() {
  const breadcrumbs = [
    { name: 'Startseite', url: 'https://www.minibagger-krefeld.de/' },
    { name: 'Ratgeber', url: 'https://www.minibagger-krefeld.de/ratgeber' },
    { name: 'Anhänger für Transport', url: 'https://www.minibagger-krefeld.de/ratgeber/anhaenger-fuer-minibagger-transport' },
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
                <li className="text-headline font-medium truncate">Anhänger</li>
              </ol>
            </nav>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1 text-sm text-body bg-muted px-3 py-1 rounded-full">
                <Clock className="h-4 w-4" />
                7 Min. Lesezeit
              </span>
            </div>
            
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-headline mb-6">
              Anhänger für Minibagger-Transport
            </h1>
            
            <p className="text-lg text-body max-w-3xl leading-relaxed">
              Sie möchten den Minibagger selbst transportieren? Hier erfahren Sie, 
              welcher Anhänger für welche Baggergröße geeignet ist und welchen 
              Führerschein Sie dafür benötigen.
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="py-12 lg:py-16">
          <div className="section-container">
            <div className="max-w-4xl">
              {/* Transport Table */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-headline mb-6">
                  Übersicht: Anhänger nach Baggergröße
                </h2>
                
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-primary text-primary-foreground">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold">Minibagger</th>
                        <th className="text-left px-4 py-3 font-semibold">Gewicht</th>
                        <th className="text-left px-4 py-3 font-semibold">Anhänger</th>
                        <th className="text-left px-4 py-3 font-semibold">Führerschein</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transportTable.map((row, index) => (
                        <tr
                          key={row.bagger}
                          className={index % 2 === 0 ? 'bg-surface-light' : 'bg-background'}
                        >
                          <td className="px-4 py-3 font-medium text-headline">{row.bagger}</td>
                          <td className="px-4 py-3 text-body">{row.weight}</td>
                          <td className="px-4 py-3 text-body">{row.trailer}</td>
                          <td className="px-4 py-3 text-body">{row.license}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* License Classes */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-headline mb-6">
                  Führerscheinklassen erklärt
                </h2>
                
                <div className="space-y-4">
                  <div className="border border-border rounded-lg p-5">
                    <h3 className="font-bold text-headline mb-2">Klasse B (PKW-Führerschein)</h3>
                    <p className="text-body text-sm mb-3">
                      Mit dem normalen PKW-Führerschein dürfen Sie Anhänger bis 750 kg ziehen – 
                      oder schwerere Anhänger, solange das Gesamtgewicht von Fahrzeug + Anhänger 
                      3.500 kg nicht überschreitet.
                    </p>
                    <p className="text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Geeignet für: 1-Tonner auf leichtem Anhänger
                    </p>
                  </div>
                  
                  <div className="border border-border rounded-lg p-5">
                    <h3 className="font-bold text-headline mb-2">Klasse B96 (Schlüsselzahl)</h3>
                    <p className="text-body text-sm mb-3">
                      Mit der Schlüsselzahl B96 (kurze Schulung, keine Prüfung) dürfen Sie 
                      Kombinationen bis 4.250 kg Gesamtgewicht fahren.
                    </p>
                    <p className="text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Geeignet für: 2-Tonner mit mittlerem SUV/Transporter
                    </p>
                  </div>
                  
                  <div className="border border-border rounded-lg p-5">
                    <h3 className="font-bold text-headline mb-2">Klasse BE (Anhängerführerschein)</h3>
                    <p className="text-body text-sm mb-3">
                      Mit BE dürfen Sie Anhänger bis 3.500 kg zulässiges Gesamtgewicht ziehen – 
                      unabhängig vom Zugfahrzeug (solange dieses auch in Klasse B fällt).
                    </p>
                    <p className="text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Geeignet für: 2-Tonner und 2,7-Tonner
                    </p>
                  </div>
                  
                  <div className="border border-border rounded-lg p-5">
                    <h3 className="font-bold text-headline mb-2">Klasse C1E / CE (LKW-Führerschein)</h3>
                    <p className="text-body text-sm mb-3">
                      Für größere Minibagger ab 3,5 t benötigen Sie einen LKW-Führerschein. 
                      In diesem Fall empfehlen wir die Lieferung durch uns.
                    </p>
                    <p className="text-sm text-primary flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Empfehlung: Lieferservice nutzen
                    </p>
                  </div>
                </div>
              </section>

              {/* Practical Tips */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-headline mb-4">
                  Praktische Tipps für den Transport
                </h2>
                
                <ul className="space-y-3 text-body">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Auffahrrampen:</strong> Achten Sie auf ausreichend lange und 
                      tragfähige Rampen. Minibagger haben kurze Ketten und können leicht aufsetzen.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Verzurren:</strong> Verwenden Sie mindestens 4 Zurrgurte mit 
                      ausreichender Zugkraft. Sichern Sie den Bagger an den dafür vorgesehenen Ösen.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Ausleger:</strong> Legen Sie den Baggerarm ab und sichern Sie 
                      ihn zusätzlich. Der Löffel sollte flach auf der Ladefläche aufliegen.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Gewichtsverteilung:</strong> Positionieren Sie den Bagger so, 
                      dass die Stützlast im zulässigen Bereich liegt (siehe Fahrzeugschein).
                    </span>
                  </li>
                </ul>
              </section>

              {/* Warning */}
              <section className="mb-12">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <div className="flex gap-4">
                    <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-headline mb-2">Wichtig: Überladung vermeiden</h3>
                      <p className="text-body text-sm">
                        Bei Kontrollen wird häufig das Gesamtgewicht der Kombination geprüft. 
                        Überladung kann zu Bußgeldern bis 235 € und Punkten führen. Im 
                        Schadensfall kann die Versicherung die Leistung verweigern.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* CTA */}
              <section className="bg-primary rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold text-primary-foreground mb-4">
                  Lieber liefern lassen?
                </h2>
                <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                  Unser Lieferservice bringt den Minibagger direkt auf Ihre Baustelle – 
                  stressfrei und versichert.
                </p>
                <Link href="/kontakt" className="btn-cta">
                  Lieferung anfragen
                </Link>
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
