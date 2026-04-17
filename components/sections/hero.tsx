import Link from 'next/link'
import Image from 'next/image'
import { Star, Shield, Truck } from 'lucide-react'

const trustItems = [
  {
    icon: Star,
    text: '5,0 · 195 Google-Bewertungen',
  },
  {
    icon: Shield,
    text: 'Tiefpreisgarantie – 10 % günstiger',
  },
  {
    icon: Truck,
    text: 'Lieferung ab 90 € brutto',
  },
]

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-surface-light to-background py-16 lg:py-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300507d' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="section-container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-headline leading-tight mb-6">
              Minibagger mieten in Krefeld – von 1t bis 5t, sofort verfügbar
            </h1>
            <p className="text-lg md:text-xl text-body leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0">
              Profi-Minibagger der Klassen 1 t, 2 t, 2,7 t, 3,5 t und 5 t – inklusive passender Anbaugeräte. 
              Abholung am SLT-Standort Krefeld-Fichtenhain oder Lieferung direkt auf Ihre Baustelle.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <a
                href="https://www.slt-rental.de/mieten/krefeld/erdbewegung"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta text-center"
              >
                Minibagger auf slt-rental.de buchen
              </a>
              <Link href="/kontakt" className="btn-secondary text-center">
                Anfrage stellen
              </Link>
            </div>

            {/* Trust Row */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6">
              {trustItems.map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-2 text-sm text-body"
                >
                  <item.icon className="h-5 w-5 text-primary" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://www.slt-rental.de/assets/xcmg-xe27e-1-rowubIr-.jpg"
                alt="XCMG XE27E Minibagger auf Baustelle in Krefeld"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
            {/* Floating Badge */}
            <div className="absolute -bottom-4 -left-4 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg">
              <p className="text-sm font-semibold">Ab 99 €/Tag</p>
              <p className="text-xs opacity-80">inkl. MwSt.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
