import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, ArrowLeft, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { JsonLd, generateBreadcrumbSchema, generateFaqSchema } from '@/components/seo/json-ld'

export const metadata: Metadata = {
  title: 'Minibagger ohne Baggerschein? – Rechtliche Grundlagen',
  description:
    'Ab welcher Größe brauchen Sie einen Baggerschein? Was gilt auf privaten Grundstücken und im gewerblichen Einsatz? Alle rechtlichen Grundlagen für Krefeld.',
  alternates: {
    canonical: 'https://www.minibagger-krefeld.de/ratgeber/minibagger-ohne-baggerschein',
  },
}

const faqData = [
  {
    question: 'Brauche ich einen Baggerschein für meinen privaten Garten?',
    answer: 'Nein, auf privaten Grundstücken gibt es keine gesetzliche Pflicht für einen Baggerschein. Wir empfehlen aber dringend eine Einweisung.',
  },
  {
    question: 'Was ist, wenn ich den Bagger auch auf der Straße bewege?',
    answer: 'Für das Fahren auf öffentlichen Straßen benötigen Sie einen Führerschein der entsprechenden Klasse. Die meisten Minibagger werden aber per Anhänger transportiert.',
  },
  {
    question: 'Bietet SLT Rental eine Einweisung an?',
    answer: 'Ja, wir bieten bei jeder Abholung eine kostenlose 15-minütige Einweisung an. Für umfangreichere Schulungen sprechen Sie uns gerne an.',
  },
]

export default function BaggerscheinPage() {
  const breadcrumbs = [
    { name: 'Startseite', url: 'https://www.minibagger-krefeld.de/' },
    { name: 'Ratgeber', url: 'https://www.minibagger-krefeld.de/ratgeber' },
    { name: 'Minibagger ohne Baggerschein', url: 'https://www.minibagger-krefeld.de/ratgeber/minibagger-ohne-baggerschein' },
  ]

  return (
    <>
      <JsonLd type="breadcrumb" data={generateBreadcrumbSchema(breadcrumbs)} />
      <JsonLd type="faq" data={generateFaqSchema(faqData)} />

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
                <li className="text-headline font-medium truncate">Baggerschein</li>
              </ol>
            </nav>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1 text-sm text-body bg-muted px-3 py-1 rounded-full">
                <Clock className="h-4 w-4" />
                5 Min. Lesezeit
              </span>
            </div>
            
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-headline mb-6">
              Minibagger ohne Baggerschein?
            </h1>
            
            <p className="text-lg text-body max-w-3xl leading-relaxed">
              Eine der häufigsten Fragen bei der Minibagger-Miete: Brauche ich einen 
              Baggerschein? Die kurze Antwort: Auf Privatgrund nicht zwingend. Die 
              ausführliche Antwort finden Sie hier.
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="py-12 lg:py-16">
          <div className="section-container">
            <div className="max-w-4xl">
              {/* Quick Overview */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-headline mb-6">
                  Auf einen Blick
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                      <h3 className="font-bold text-headline">Kein Schein nötig</h3>
                    </div>
                    <ul className="space-y-2 text-body text-sm">
                      <li>Arbeiten auf privatem Grundstück</li>
                      <li>Keine öffentlichen Verkehrsflächen</li>
                      <li>Eigenverantwortliche Nutzung</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <XCircle className="h-6 w-6 text-red-600" />
                      <h3 className="font-bold text-headline">Schein erforderlich</h3>
                    </div>
                    <ul className="space-y-2 text-body text-sm">
                      <li>Gewerbliche Baustellen</li>
                      <li>Arbeit auf öffentlichem Gelände</li>
                      <li>Wenn der Arbeitgeber es verlangt</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Detailed Explanation */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-headline mb-4">
                  Die rechtliche Situation
                </h2>
                <p className="text-body leading-relaxed mb-4">
                  In Deutschland gibt es keinen „Baggerführerschein" im klassischen Sinne. 
                  Was umgangssprachlich als Baggerschein bezeichnet wird, ist offiziell ein 
                  „Befähigungsnachweis zum Führen von Erdbaumaschinen" nach DGUV Vorschrift 49.
                </p>
                <p className="text-body leading-relaxed mb-4">
                  Diese Vorschrift gilt für gewerbliche Arbeitgeber und deren Beschäftigte. 
                  Wenn Sie als Privatperson einen Minibagger auf Ihrem eigenen Grundstück 
                  nutzen, fallen Sie nicht unter diese Regelung.
                </p>
                
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
                  <div className="flex gap-4">
                    <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-headline mb-2">Wichtiger Hinweis</p>
                      <p className="text-body text-sm">
                        Auch ohne Scheinpflicht tragen Sie die volle Verantwortung für 
                        Schäden. Eine gründliche Einweisung ist daher unbedingt empfohlen – 
                        sowohl für Ihre Sicherheit als auch zum Schutz des Geräts.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Our Offer */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-headline mb-4">
                  Unsere Einweisung bei Abholung
                </h2>
                <p className="text-body leading-relaxed mb-4">
                  Bei jeder Abholung am Standort Krefeld-Fichtenhain bieten wir Ihnen eine 
                  kostenlose 15-minütige Einweisung an. Dabei zeigen wir Ihnen:
                </p>
                <ul className="space-y-2 text-body mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    Bedienelemente und Steuerung des Minibaggers
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    Sicherheitsfunktionen und Notabschaltung
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    Wechsel von Anbaugeräten (Löffel, Greifer)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    Tipps für effizientes Arbeiten
                  </li>
                </ul>
                <p className="text-body leading-relaxed">
                  Nach wenigen Minuten Übung haben die meisten Einsteiger ein sicheres 
                  Gefühl für das Gerät. Die Joystick-Steuerung moderner Minibagger ist 
                  intuitiver als man denkt.
                </p>
              </section>

              {/* FAQ */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-headline mb-6">
                  Häufige Fragen zum Baggerschein
                </h2>
                
                <div className="space-y-4">
                  {faqData.map((faq, index) => (
                    <div key={index} className="border border-border rounded-lg p-5">
                      <h3 className="font-semibold text-headline mb-2">{faq.question}</h3>
                      <p className="text-body text-sm">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* CTA */}
              <section className="bg-primary rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold text-primary-foreground mb-4">
                  Bereit für Ihr Projekt?
                </h2>
                <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                  Mieten Sie Ihren Minibagger und profitieren Sie von unserer 
                  kostenlosen Einweisung vor Ort.
                </p>
                <Link href="/kontakt" className="btn-cta">
                  Jetzt Minibagger anfragen
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
