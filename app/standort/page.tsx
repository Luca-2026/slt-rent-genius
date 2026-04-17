import { Metadata } from "next"
import Link from "next/link"
import { Phone, Clock, MapPin, Truck, CheckCircle, Navigation } from "lucide-react"
import { LocalBusinessJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "Standort Krefeld | Minibagger mieten mit Lieferung | SLT Rental",
  description: "SLT Rental Standort in Krefeld-Fischeln. Minibagger mieten mit Lieferung in Krefeld, Meerbusch, Moers, Willich, Tönisvorst und Umgebung.",
  keywords: ["Minibagger Krefeld", "Baggerverleih Krefeld", "SLT Standort", "Baumaschinenverleih Niederrhein"],
  openGraph: {
    title: "Standort Krefeld | Minibagger mieten | SLT Rental",
    description: "Ihr Ansprechpartner für Minibagger-Vermietung am Niederrhein. Lieferung im Umkreis von 30km.",
    type: "website",
  },
}

const deliveryAreas = [
  { city: "Krefeld", distance: "Zentral", time: "15-30 Min." },
  { city: "Meerbusch", distance: "~10 km", time: "15-20 Min." },
  { city: "Moers", distance: "~12 km", time: "20-25 Min." },
  { city: "Willich", distance: "~8 km", time: "15-20 Min." },
  { city: "Tönisvorst", distance: "~10 km", time: "15-20 Min." },
  { city: "Kempen", distance: "~15 km", time: "20-30 Min." },
  { city: "Viersen", distance: "~18 km", time: "25-30 Min." },
  { city: "Düsseldorf-Nord", distance: "~15 km", time: "20-30 Min." },
]

const serviceFeatures = [
  {
    title: "Lieferung & Abholung",
    description: "Wir bringen den Minibagger direkt zu Ihrem Einsatzort und holen ihn wieder ab.",
    icon: Truck,
  },
  {
    title: "Persönliche Einweisung",
    description: "Vor Ort erhalten Sie eine ausführliche Einweisung in die Bedienung der Maschine.",
    icon: CheckCircle,
  },
  {
    title: "Flexible Mietzeiten",
    description: "Stunden-, Tages- oder Wochenmiete - wir passen uns Ihrem Projekt an.",
    icon: Clock,
  },
  {
    title: "Kurzfristige Verfügbarkeit",
    description: "Bei freier Kapazität auch kurzfristige Buchungen am selben Tag möglich.",
    icon: Navigation,
  },
]

export default function StandortPage() {
  return (
    <>
      <LocalBusinessJsonLd />

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slt-blue to-slt-blue-dark text-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-slt-yellow mb-4">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">Standort Krefeld-Fischeln</span>
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-bold mb-6 text-balance">
                Ihr Partner für Minibagger-Vermietung am Niederrhein
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                Von unserem Standort in Krefeld-Fischeln liefern wir Minibagger in
                die gesamte Region. Persönliche Beratung, schnelle Verfügbarkeit und
                zuverlässiger Service - das ist SLT Rental.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  href="tel:+4921519579229"
                  className="inline-flex items-center gap-2 bg-slt-yellow hover:bg-slt-yellow-hover text-slt-blue-dark font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  02151 - 957 92 29
                </a>
                <Link
                  href="/kontakt"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg transition-colors border border-white/20"
                >
                  Anfrage senden
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-12 bg-surface-light border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slt-blue/10 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-slt-blue" />
                </div>
                <div>
                  <h3 className="font-medium text-headline mb-1">Adresse</h3>
                  <p className="text-body">
                    SLT Rental GmbH<br />
                    Kimplerstraße 296<br />
                    47807 Krefeld
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slt-blue/10 rounded-lg flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-slt-blue" />
                </div>
                <div>
                  <h3 className="font-medium text-headline mb-1">Öffnungszeiten</h3>
                  <p className="text-body">
                    Mo - Fr: 7:00 - 18:00 Uhr<br />
                    Samstag: 8:00 - 14:00 Uhr<br />
                    Sonntag: geschlossen
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slt-blue/10 rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-slt-blue" />
                </div>
                <div>
                  <h3 className="font-medium text-headline mb-1">Kontakt</h3>
                  <p className="text-body">
                    Tel: 02151 - 957 92 29<br />
                    info@slt-rental.de
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-headline mb-6">
                  So finden Sie uns
                </h2>
                <p className="text-body mb-6">
                  Unser Standort liegt verkehrsgünstig in Krefeld-Fischeln, direkt
                  an der Kimplerstraße. Von der A57 (Ausfahrt Krefeld-Fischeln) erreichen
                  Sie uns in wenigen Minuten.
                </p>

                <div className="bg-surface-light rounded-xl p-6 mb-6">
                  <h3 className="font-display text-lg font-bold text-headline mb-4">
                    Anfahrt
                  </h3>
                  <ul className="space-y-3 text-body">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-slt-blue rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                        1
                      </div>
                      <span>A57 Ausfahrt Krefeld-Fischeln</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-slt-blue rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                        2
                      </div>
                      <span>Richtung Krefeld-Zentrum auf die Kimplerstraße</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-slt-blue rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                        3
                      </div>
                      <span>Nach ca. 500m auf der rechten Seite</span>
                    </li>
                  </ul>
                </div>

                <a
                  href="https://www.google.com/maps/dir//Kimplerstra%C3%9Fe+296,+47807+Krefeld"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-slt-blue hover:bg-slt-blue-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  <Navigation className="w-5 h-5" />
                  Route in Google Maps
                </a>
              </div>

              {/* Map Placeholder */}
              <div className="bg-surface-medium rounded-xl overflow-hidden aspect-square lg:aspect-[4/3]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2498.123456789!2d6.598!3d51.302!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sKimplerstra%C3%9Fe%20296%2C%2047807%20Krefeld!5e0!3m2!1sde!2sde!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "400px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="SLT Rental Standort Krefeld"
                  className="grayscale-[20%]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Service Features */}
        <section className="py-16 md:py-24 bg-surface-light">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-2xl md:text-4xl font-bold text-headline mb-4">
                Unser Service für Sie
              </h2>
              <p className="text-body max-w-2xl mx-auto">
                Von der Beratung bis zur Rückgabe - wir begleiten Sie durch Ihr gesamtes Projekt.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {serviceFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl p-6 border border-border text-center"
                >
                  <div className="w-12 h-12 bg-slt-blue/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-slt-blue" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-headline mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-body">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Delivery Areas */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-2xl md:text-4xl font-bold text-headline mb-4">
                Unser Liefergebiet
              </h2>
              <p className="text-body max-w-2xl mx-auto">
                Wir liefern im Umkreis von ca. 30 km um Krefeld. Bei größeren Entfernungen
                sprechen Sie uns gerne an.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {deliveryAreas.map((area) => (
                  <div
                    key={area.city}
                    className="bg-white rounded-lg p-4 border border-border text-center"
                  >
                    <h3 className="font-medium text-headline">{area.city}</h3>
                    <p className="text-sm text-muted-foreground">{area.distance}</p>
                    <p className="text-xs text-slt-blue mt-1">{area.time}</p>
                  </div>
                ))}
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Lieferkosten je nach Entfernung ab 35 € - sprechen Sie uns für ein
                individuelles Angebot an.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-slt-blue text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl md:text-4xl font-bold mb-4">
              Besuchen Sie uns vor Ort
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Gerne zeigen wir Ihnen unsere Minibagger vor Ort und beraten Sie
              persönlich zu Ihrem Projekt.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:+4921519579229"
                className="inline-flex items-center gap-2 bg-slt-yellow hover:bg-slt-yellow-hover text-slt-blue-dark font-semibold px-8 py-4 rounded-lg transition-colors"
              >
                <Phone className="w-5 h-5" />
                02151 - 957 92 29
              </a>
              <div className="flex items-center gap-2 text-white/80">
                <Clock className="w-5 h-5" />
                Mo-Fr 7:00-18:00, Sa 8:00-14:00
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
