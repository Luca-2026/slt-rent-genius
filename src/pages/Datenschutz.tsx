import { Layout } from "@/components/layout";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Shield, User, Mail, Phone, MapPin, Cookie, Lock, FileText, Clock, Scale } from "lucide-react";

export default function Datenschutz() {
  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/5 to-background">
        <div className="section-container py-16 md:py-24">
          <AnimatedSection animation="fade-in-up">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  Datenschutzerklärung
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mt-4">
              Informationen zum Schutz Ihrer personenbezogenen Daten gemäß DSGVO
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="section-container py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* 1. Verantwortlicher */}
          <AnimatedSection animation="fade-in-up" delay={100}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">1</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">Verantwortlicher</h2>
              </div>
              
              <div className="bg-muted/50 rounded-xl p-6">
                <p className="font-semibold text-foreground text-lg mb-4">
                  SLT Technology Group GmbH & Co. KG
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-foreground">Anrather Straße 291</p>
                      <p className="text-muted-foreground">47807 Krefeld</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary shrink-0" />
                      <a href="tel:+4921514179902" className="text-primary hover:underline">
                        +49 (0) 2151 - 417 99 02
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary shrink-0" />
                      <a href="mailto:info@slt-rental.de" className="text-primary hover:underline">
                        info@slt-rental.de
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* 2. Datenschutzbeauftragter */}
          <AnimatedSection animation="fade-in-up" delay={150}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">2</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">Datenschutzbeauftragter</h2>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center shrink-0">
                  <User className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-lg">Benedikt Nöchel</p>
                  <p className="text-muted-foreground">Anrather Straße 291, 47807 Krefeld</p>
                  <a href="mailto:datenschutz@slt-rental.de" className="text-primary hover:underline flex items-center gap-2 mt-2">
                    <Mail className="h-4 w-4" />
                    datenschutz@slt-rental.de
                  </a>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* 3. Datenverarbeitung */}
          <AnimatedSection animation="fade-in-up" delay={200}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">3</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">Datenverarbeitung auf unserer Website</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Wir verarbeiten Ihre personenbezogenen Daten, wenn Sie:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      unsere Website besuchen (automatisch durch den Webserver erfasste Daten wie IP-Adresse, Datum/Uhrzeit, aufgerufene Seiten, Browsertyp, Betriebssystem)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      unser Kontaktformular nutzen
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      einen Mietvertrag über unseren Online-Shop abschließen
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      uns per E-Mail, Telefon oder postalisch kontaktieren
                    </li>
                  </ul>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold text-foreground mb-3">Verarbeitete Datenarten:</h3>
                  <div className="grid sm:grid-cols-2 gap-2 text-muted-foreground">
                    {[
                      "Name, Vorname",
                      "Anschrift, ggf. Firma",
                      "Telefonnummer, E-Mail-Adresse",
                      "Vertragsdaten (z.B. Mietgegenstand, Zeitraum, Preis)",
                      "Zahlungsinformationen (bei Online-Buchung)",
                      "Nutzungsdaten (IP-Adresse, Zeitpunkt, aufgerufene Seiten)",
                      "Kommunikationsinhalte"
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* 4. Zwecke und Rechtsgrundlagen */}
          <AnimatedSection animation="fade-in-up" delay={250}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">4</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">Zwecke und Rechtsgrundlagen der Verarbeitung</h2>
              </div>
              
              <div className="space-y-4">
                <p className="text-muted-foreground mb-4">Wir verarbeiten Ihre Daten:</p>
                <div className="grid gap-4">
                  {[
                    { basis: "Art. 6 Abs. 1 lit. b DSGVO", purpose: "Zur Vertragserfüllung und -anbahnung" },
                    { basis: "Art. 6 Abs. 1 lit. c DSGVO", purpose: "Zur Erfüllung gesetzlicher Pflichten" },
                    { basis: "Art. 6 Abs. 1 lit. a DSGVO", purpose: "Auf Basis Ihrer Einwilligung, z.B. für Cookies/Tracking" },
                    { basis: "Art. 6 Abs. 1 lit. f DSGVO", purpose: "Zur Wahrung unserer berechtigten Interessen, z.B. für IT-Sicherheit, Webstatistik, Marketing" },
                  ].map((item) => (
                    <div key={item.basis} className="flex items-start gap-3 bg-muted/50 rounded-lg p-4">
                      <Scale className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <span className="font-mono text-sm text-primary">{item.basis}</span>
                        <p className="text-muted-foreground">{item.purpose}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* 5. Cookies */}
          <AnimatedSection animation="fade-in-up" delay={300}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">5</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">Cookies & Tracking-Technologien</h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Wir verwenden auf unserer Webseite Cookies und vergleichbare Technologien. 
                  Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden und 
                  bestimmte Informationen über Sie enthalten (z.B. zur Funktionalität des Online-Shops, 
                  zu Analysezwecken oder für Marketing).
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4 my-6">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Cookie className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">Technisch notwendige Cookies</span>
                    </div>
                    <p className="text-sm">Für den Betrieb der Seite und des Shops erforderlich.</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Cookie className="h-5 w-5 text-accent" />
                      <span className="font-semibold text-foreground">Analyse-/Marketing-Cookies</span>
                    </div>
                    <p className="text-sm">Nur mit Ihrer Einwilligung beim ersten Besuch (Cookie-Banner/Consent-Tool).</p>
                  </div>
                </div>

                <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                  <p className="text-foreground font-medium">
                    <strong>Widerruf:</strong> Sie können Ihre Einwilligung jederzeit über unser Cookie-Tool 
                    oder die Einstellungen Ihres Browsers widerrufen.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* 6. Kontaktformular */}
          <AnimatedSection animation="fade-in-up" delay={350}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">6</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">Kontaktformular und E-Mail-Kontakt</h2>
              </div>
              
              <p className="text-muted-foreground">
                Wenn Sie uns per Formular, E-Mail oder Telefon kontaktieren, speichern und verarbeiten 
                wir Ihre Angaben zur Bearbeitung der Anfrage sowie für Anschlussfragen. Die Daten werden 
                nicht ohne Ihre Einwilligung an Dritte weitergegeben.
              </p>
            </div>
          </AnimatedSection>

          {/* 7. Online-Buchung */}
          <AnimatedSection animation="fade-in-up" delay={400}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">7</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">Online-Buchung und Vertragsabwicklung</h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Für die Abwicklung von Buchungen/Mietverträgen verarbeiten wir zusätzlich Ihre Vertrags- 
                  und Zahlungsdaten. Ohne diese Daten ist ein Vertragsabschluss nicht möglich.
                </p>
                <p>
                  Zur Zahlungsabwicklung nutzen wir ggf. externe Zahlungsdienstleister (z.B. PayPal, Stripe, Klarna). 
                  Für die Verarbeitung Ihrer Daten bei diesen Anbietern gilt deren Datenschutzerklärung.
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* 8. Weitergabe */}
          <AnimatedSection animation="fade-in-up" delay={450}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">8</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">Weitergabe von Daten / Auftragsverarbeiter</h2>
              </div>
              
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Wir geben Ihre Daten ausschließlich dann an Dritte weiter, wenn dies zur Vertragserfüllung 
                  erforderlich ist (z.B. Transportdienstleister, Zahlungsanbieter) oder eine rechtliche 
                  Verpflichtung besteht.
                </p>
                <p>
                  Wir arbeiten mit externen IT- und Hosting-Dienstleistern zusammen, die Ihre Daten nur im 
                  Rahmen unserer Weisungen und auf Basis eines Auftragsverarbeitungsvertrags (Art. 28 DSGVO) 
                  verarbeiten.
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* 9. Social Media */}
          <AnimatedSection animation="fade-in-up" delay={500}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">9</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">Social Media & Einbindung von Diensten Dritter</h2>
              </div>
              
              <p className="text-muted-foreground">
                Unsere Website kann Dienste von Drittanbietern einbinden (z.B. Google Maps zur Standortanzeige, 
                Social Plugins). Beim Aufruf solcher Inhalte kann es zur Übertragung personenbezogener Daten 
                an diese Anbieter, ggf. auch in Drittländer außerhalb der EU, kommen. Es gelten die 
                Datenschutzbestimmungen der jeweiligen Anbieter.
              </p>
            </div>
          </AnimatedSection>

          {/* 10. Speicherdauer */}
          <AnimatedSection animation="fade-in-up" delay={550}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Speicherdauer</h2>
              </div>
              
              <p className="text-muted-foreground">
                Wir speichern Ihre personenbezogenen Daten nur so lange, wie dies zur Erfüllung der 
                jeweiligen Zwecke erforderlich ist oder wir gesetzlich zur Aufbewahrung verpflichtet 
                sind (insbesondere steuer- und handelsrechtliche Aufbewahrungsfristen).
              </p>
            </div>
          </AnimatedSection>

          {/* 11. Ihre Rechte */}
          <AnimatedSection animation="fade-in-up" delay={600}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Scale className="h-5 w-5 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Ihre Rechte</h2>
              </div>
              
              <div className="space-y-4">
                <p className="text-muted-foreground">Sie haben jederzeit das Recht:</p>
                <div className="grid gap-3">
                  {[
                    { article: "Art. 15 DSGVO", right: "auf Auskunft über die bei uns gespeicherten personenbezogenen Daten" },
                    { article: "Art. 16 DSGVO", right: "auf Berichtigung unrichtiger Daten" },
                    { article: "Art. 17 DSGVO", right: 'auf Löschung ("Recht auf Vergessenwerden")' },
                    { article: "Art. 18 DSGVO", right: "auf Einschränkung der Verarbeitung" },
                    { article: "Art. 20 DSGVO", right: "auf Datenübertragbarkeit" },
                    { article: "Art. 21 DSGVO", right: "auf Widerspruch gegen die Verarbeitung" },
                    { article: "Art. 7 Abs. 3 DSGVO", right: "auf Widerruf Ihrer Einwilligung (mit Wirkung für die Zukunft)" },
                  ].map((item) => (
                    <div key={item.article} className="flex items-start gap-3 bg-muted/50 rounded-lg p-3">
                      <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-1 rounded shrink-0">
                        {item.article}
                      </span>
                      <span className="text-muted-foreground">{item.right}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-accent/10 rounded-lg p-4 border border-accent/20 mt-6">
                  <p className="text-foreground">
                    Bitte richten Sie Ihre Anfrage an die oben genannte Kontaktadresse. Sie haben außerdem 
                    das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* 12. Sicherheit */}
          <AnimatedSection animation="fade-in-up" delay={650}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Sicherheit</h2>
              </div>
              
              <p className="text-muted-foreground">
                Wir treffen technische und organisatorische Sicherheitsmaßnahmen, um Ihre Daten gegen 
                zufällige oder vorsätzliche Manipulation, Verlust, Zerstörung oder gegen den Zugriff 
                unberechtigter Personen zu schützen. Unsere Sicherheitsmaßnahmen werden entsprechend 
                der technologischen Entwicklung fortlaufend verbessert.
              </p>
            </div>
          </AnimatedSection>

          {/* 13. Änderungen */}
          <AnimatedSection animation="fade-in-up" delay={700}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Änderung der Datenschutzerklärung</h2>
              </div>
              
              <p className="text-muted-foreground">
                Wir behalten uns vor, diese Datenschutzerklärung jederzeit anzupassen, z.B. bei Änderungen 
                von Gesetzen, unserer Website oder unserer Dienste.
              </p>
            </div>
          </AnimatedSection>

          {/* Stand */}
          <AnimatedSection animation="fade-in-up" delay={750}>
            <div className="text-center py-8 border-t border-border">
              <p className="text-muted-foreground">
                <strong className="text-foreground">Stand:</strong> Januar 2026
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </Layout>
  );
}
