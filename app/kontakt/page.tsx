import { Metadata } from "next"
import { Phone, Mail, MapPin, Clock, MessageSquare } from "lucide-react"
import { LocalBusinessJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "Kontakt | Minibagger mieten Krefeld | SLT Rental",
  description: "Kontaktieren Sie SLT Rental für Minibagger-Vermietung in Krefeld. Telefon: 02151-9579229. Persönliche Beratung und schnelle Verfügbarkeit.",
  keywords: ["Kontakt SLT Rental", "Minibagger mieten Krefeld Telefon", "Baggerverleih Anfrage"],
  openGraph: {
    title: "Kontakt | Minibagger mieten | SLT Rental Krefeld",
    description: "Ihre Anfrage für Minibagger-Vermietung. Rufen Sie uns an oder senden Sie eine Nachricht.",
    type: "website",
  },
}

export default function KontaktPage() {
  return (
    <>
      <LocalBusinessJsonLd />

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slt-blue to-slt-blue-dark text-white py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="font-display text-3xl md:text-5xl font-bold mb-6 text-balance">
                Kontaktieren Sie uns
              </h1>
              <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                Haben Sie Fragen zur Minibagger-Vermietung oder möchten Sie ein
                Angebot? Wir beraten Sie gerne persönlich und finden die passende
                Lösung für Ihr Projekt.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-headline mb-8">
                  So erreichen Sie uns
                </h2>

                <div className="space-y-6 mb-8">
                  <a
                    href="tel:+4921519579229"
                    className="flex items-start gap-4 p-4 bg-slt-blue/5 hover:bg-slt-blue/10 rounded-xl transition-colors group"
                  >
                    <div className="w-12 h-12 bg-slt-blue rounded-lg flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-headline group-hover:text-slt-blue transition-colors">
                        Telefon
                      </h3>
                      <p className="text-lg font-semibold text-slt-blue">
                        02151 - 957 92 29
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Schnellste Beratung - rufen Sie direkt an
                      </p>
                    </div>
                  </a>

                  <a
                    href="mailto:info@slt-rental.de"
                    className="flex items-start gap-4 p-4 bg-surface-light hover:bg-surface-medium rounded-xl transition-colors group"
                  >
                    <div className="w-12 h-12 bg-slt-blue/10 rounded-lg flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-slt-blue" />
                    </div>
                    <div>
                      <h3 className="font-medium text-headline group-hover:text-slt-blue transition-colors">
                        E-Mail
                      </h3>
                      <p className="text-slt-blue">info@slt-rental.de</p>
                      <p className="text-sm text-muted-foreground">
                        Antwort innerhalb von 24 Stunden
                      </p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4 p-4 bg-surface-light rounded-xl">
                    <div className="w-12 h-12 bg-slt-blue/10 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-slt-blue" />
                    </div>
                    <div>
                      <h3 className="font-medium text-headline">Adresse</h3>
                      <p className="text-body">
                        SLT Rental GmbH<br />
                        Kimplerstraße 296<br />
                        47807 Krefeld
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-surface-light rounded-xl">
                    <div className="w-12 h-12 bg-slt-blue/10 rounded-lg flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-slt-blue" />
                    </div>
                    <div>
                      <h3 className="font-medium text-headline">Öffnungszeiten</h3>
                      <div className="text-body space-y-1">
                        <p>Montag - Freitag: 7:00 - 18:00 Uhr</p>
                        <p>Samstag: 8:00 - 14:00 Uhr</p>
                        <p>Sonntag: geschlossen</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="bg-slt-yellow/10 rounded-xl p-6 border border-slt-yellow/20">
                  <h3 className="font-display text-lg font-bold text-headline mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-slt-blue" />
                    Für eine schnelle Beratung
                  </h3>
                  <p className="text-body text-sm mb-3">
                    Teilen Sie uns bei Ihrer Anfrage am besten folgende Informationen mit:
                  </p>
                  <ul className="text-sm text-body space-y-1">
                    <li>- Art des Projekts (z.B. Poolbau, Drainage, Fundament)</li>
                    <li>- Gewünschter Mietzeitraum</li>
                    <li>- Einsatzort (PLZ oder Ortsname)</li>
                    <li>- Zufahrtsbreite zum Grundstück</li>
                  </ul>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-border">
                  <h2 className="font-display text-2xl font-bold text-headline mb-6">
                    Anfrage senden
                  </h2>

                  <form className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-headline mb-2"
                        >
                          Vorname *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          required
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-slt-blue/20 focus:border-slt-blue transition-colors"
                          placeholder="Max"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-headline mb-2"
                        >
                          Nachname *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          required
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-slt-blue/20 focus:border-slt-blue transition-colors"
                          placeholder="Mustermann"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-headline mb-2"
                      >
                        E-Mail *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-slt-blue/20 focus:border-slt-blue transition-colors"
                        placeholder="max@beispiel.de"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-headline mb-2"
                      >
                        Telefon
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-slt-blue/20 focus:border-slt-blue transition-colors"
                        placeholder="02151 123456"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="project"
                        className="block text-sm font-medium text-headline mb-2"
                      >
                        Projektart
                      </label>
                      <select
                        id="project"
                        name="project"
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-slt-blue/20 focus:border-slt-blue transition-colors"
                      >
                        <option value="">Bitte wählen...</option>
                        <option value="poolbau">Poolbau</option>
                        <option value="fundament">Fundament / Bodenplatte</option>
                        <option value="gartengestaltung">Gartengestaltung</option>
                        <option value="drainage">Drainage / Entwässerung</option>
                        <option value="abriss">Abriss / Rückbau</option>
                        <option value="sonstiges">Sonstiges</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-headline mb-2"
                      >
                        Ihre Nachricht *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-slt-blue/20 focus:border-slt-blue transition-colors resize-none"
                        placeholder="Beschreiben Sie Ihr Projekt und den gewünschten Mietzeitraum..."
                      />
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="privacy"
                        name="privacy"
                        required
                        className="mt-1 w-4 h-4 rounded border-border text-slt-blue focus:ring-slt-blue/20"
                      />
                      <label htmlFor="privacy" className="text-sm text-body">
                        Ich habe die{" "}
                        <a href="/datenschutz" className="text-slt-blue hover:underline">
                          Datenschutzerklärung
                        </a>{" "}
                        gelesen und bin mit der Verarbeitung meiner Daten einverstanden. *
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slt-yellow hover:bg-slt-yellow-hover text-slt-blue-dark font-semibold px-6 py-4 rounded-lg transition-colors"
                    >
                      Anfrage absenden
                    </button>

                    <p className="text-xs text-muted-foreground text-center">
                      * Pflichtfelder - Wir melden uns innerhalb von 24 Stunden bei Ihnen.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Alternative CTA */}
        <section className="py-16 md:py-24 bg-slt-blue text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl md:text-4xl font-bold mb-4">
              Schneller geht es telefonisch
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Für eine sofortige Beratung und kurzfristige Buchungen rufen Sie
              uns am besten direkt an.
            </p>
            <a
              href="tel:+4921519579229"
              className="inline-flex items-center gap-2 bg-slt-yellow hover:bg-slt-yellow-hover text-slt-blue-dark font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
            >
              <Phone className="w-6 h-6" />
              02151 - 957 92 29
            </a>
          </div>
        </section>
      </main>
    </>
  )
}
