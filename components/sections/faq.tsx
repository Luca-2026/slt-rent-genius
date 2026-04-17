'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'Ab welcher Größe brauche ich einen Baggerschein?',
    answer: 'Auf privaten Grundstücken gibt es keine gesetzliche Pflicht für einen Baggerschein. Im gewerblichen Einsatz oder auf öffentlichem Gelände empfehlen wir jedoch eine Einweisung. Wir bieten bei Abholung eine kostenlose 15-minütige Einweisung an.',
  },
  {
    question: 'Passt ein 2,7-t-Minibagger durch ein 1,50-m-Gartentor?',
    answer: 'Ja, der XCMG XE27E hat eine Durchfahrtsbreite von exakt 1,50 m. Für schmalere Tore empfehlen wir den 2-Tonner (98 cm) oder den 1-Tonner Bobcat E10Z (71 cm), der sogar durch Haustüren passt.',
  },
  {
    question: 'Wie lange dauert ein Fundamentaushub mit einem 2-t-Minibagger?',
    answer: 'Für ein Garagenfundament (ca. 6 x 3 m, 80 cm tief) kalkulieren Sie etwa 4–6 Stunden. Bei lehmigen Böden, wie sie im Krefelder Süden typisch sind, kann es etwas länger dauern.',
  },
  {
    question: 'Was kostet die Lieferung nach Meerbusch, Willich oder Düsseldorf?',
    answer: 'Die Lieferung beginnt ab 90 € brutto für den Krefelder Stadtbereich. Für Meerbusch und Willich rechnen Sie mit ca. 110–130 €, für Düsseldorf ca. 140–160 € – je nach genauem Zielort. Gerne erstellen wir Ihnen ein individuelles Angebot.',
  },
  {
    question: 'Kann ich einen Minibagger am Samstag abholen?',
    answer: 'Ja, samstags sind wir von 08:00 bis 14:30 Uhr geöffnet. Bitte buchen Sie Ihre Samstagsabholung vorab online auf slt-rental.de oder telefonisch unter 02151 417 99 04.',
  },
  {
    question: 'Welchen Anhänger brauche ich für den Transport eines 1-t-Minibaggers?',
    answer: 'Für den Bobcat E10Z (1.150 kg) reicht ein Anhänger mit 1,3–1,5 t Nutzlast. Mit einem PKW-Führerschein (Klasse B) dürfen Sie Anhänger bis 750 kg oder bis 3,5 t Gesamtgewicht (Fahrzeug + Anhänger) ziehen.',
  },
  {
    question: 'Kann ich am Wochenende einen Minibagger mieten?',
    answer: 'Ja, Sie können Freitag abholen und Montag zurückbringen – Sie zahlen nur für 1 Tag, bekommen aber das ganze Wochenende. Das ist unser Wochenend-Tarif.',
  },
  {
    question: 'Haben Sie auch elektrische Minibagger für Innenbereich-Einsätze?',
    answer: 'Der XCMG XE20E und XE27E sind vollelektrische Minibagger – perfekt für emissionsfreies Arbeiten in Hallen, Kellern oder sensiblen Umgebungen. Sie arbeiten leiser und ohne Abgase.',
  },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="section-container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-headline mb-4">
              Häufige Fragen
            </h2>
            <p className="text-lg text-body">
              Antworten auf die wichtigsten Fragen rund um die Minibagger-Miete.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left bg-background hover:bg-surface-light transition-colors"
                  aria-expanded={openIndex === index}
                >
                  <span className="font-medium text-headline pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 text-primary flex-shrink-0 transition-transform',
                      openIndex === index && 'rotate-180'
                    )}
                  />
                </button>
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  )}
                >
                  <p className="px-5 pb-5 text-body leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Export FAQ data for JSON-LD schema
export const faqData = faqs
