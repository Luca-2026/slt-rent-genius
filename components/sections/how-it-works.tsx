import { MapPin, Search, Calendar, CreditCard, Truck, ExternalLink } from 'lucide-react'

const steps = [
  {
    icon: MapPin,
    title: 'Standort',
    description: 'Wählen Sie Krefeld-Fichtenhain als Standort',
  },
  {
    icon: Search,
    title: 'Minibagger wählen',
    description: 'Finden Sie den passenden Bagger für Ihr Projekt',
  },
  {
    icon: Calendar,
    title: 'Zeitraum',
    description: 'Legen Sie Start- und Enddatum fest',
  },
  {
    icon: CreditCard,
    title: 'Bezahlen',
    description: 'Bequem online oder vor Ort',
  },
  {
    icon: Truck,
    title: 'Abholen oder liefern',
    description: 'Selbstabholung oder Lieferung auf Ihre Baustelle',
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-headline mb-4">
            So einfach funktioniert&apos;s
          </h2>
          <p className="text-lg text-body max-w-2xl mx-auto">
            In 5 Schritten zum Minibagger – von der Auswahl bis zur Abholung.
          </p>
        </div>

        <div className="relative">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-border" />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-4">
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                {/* Step Number */}
                <div className="relative z-10 w-24 h-24 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <step.icon className="h-10 w-10 text-primary-foreground" />
                </div>
                {/* Step Number Badge */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-8 h-8 bg-slt-yellow text-foreground rounded-full flex items-center justify-center font-bold text-sm shadow">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-headline mb-2">{step.title}</h3>
                <p className="text-sm text-body">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <a
            href="https://www.slt-rental.de/so-funktionierts"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            Ausführliche Anleitung auf slt-rental.de
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
