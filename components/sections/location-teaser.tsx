import Image from 'next/image'
import { MapPin, Phone, Mail, Clock, User, ExternalLink } from 'lucide-react'

export function LocationTeaserSection() {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Map */}
          <div className="relative rounded-xl overflow-hidden shadow-lg h-[400px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2494.8432!2d6.5853!3d51.3102!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b8b1642573a647%3A0x9717df05a5e57b00!2sAnrather%20Str.%20291%2C%2047807%20Krefeld!5e0!3m2!1sde!2sde!4v1703505600000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="SLT Rental Standort Krefeld-Fichtenhain"
            />
          </div>

          {/* Info */}
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-headline mb-6">
              Ihr SLT-Standort Krefeld-Fichtenhain
            </h2>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-headline">Adresse</p>
                  <p className="text-body">
                    Anrather Straße 291<br />
                    47807 Krefeld-Fichtenhain
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-headline">Telefon</p>
                  <a
                    href="tel:+4921514179904"
                    className="text-primary hover:underline"
                  >
                    02151 417 99 04
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-headline">E-Mail</p>
                  <a
                    href="mailto:krefeld@slt-rental.de"
                    className="text-primary hover:underline"
                  >
                    krefeld@slt-rental.de
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-headline">Öffnungszeiten</p>
                  <p className="text-body">
                    Mo–Fr: 07:30–18:00 Uhr<br />
                    Sa: 08:00–14:30 Uhr (mit Buchung)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <User className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-headline">Standortleiter</p>
                  <p className="text-body">Benedikt Nöchel</p>
                </div>
              </div>
            </div>

            <a
              href="https://www.google.com/maps/dir//Anrather+Str.+291,+47807+Krefeld"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              Route planen
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
