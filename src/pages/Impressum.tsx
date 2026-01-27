import { Layout } from "@/components/layout";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Phone, Mail, MapPin, Building2, Shield } from "lucide-react";

export default function Impressum() {
  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/5 to-background">
        <div className="section-container py-16 md:py-24">
          <AnimatedSection animation="fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Impressum
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Rechtliche Informationen und Angaben gemäß § 5 TMG
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="section-container py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Company Information */}
          <AnimatedSection animation="fade-in-up" delay={100}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Angaben gemäß § 5 TMG</h2>
                  <p className="text-muted-foreground">Unternehmensangaben</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-muted-foreground">
                  SLT-Rental ist eine eingetragene Marke der
                </p>
                <p className="text-xl font-semibold text-foreground">
                  SLT Technology Group GmbH & Co. KG
                </p>

                <div className="grid md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Anrather Straße 291</p>
                        <p className="text-muted-foreground">DE-47807 Krefeld</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="text-foreground">Fon: +49 (0) 2151 - 417 99 02</p>
                        <p className="text-muted-foreground">Fax: +49 (0) 2151 - 417 99 04</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary shrink-0" />
                      <a href="mailto:info@slt-rental.de" className="text-primary hover:underline">
                        info@slt-rental.de
                      </a>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground pt-4">
                  HRA 7075 Amtsgericht Krefeld
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Geschäftsführer */}
          <AnimatedSection animation="fade-in-up" delay={200}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4">Geschäftsführer</h2>
              <p className="text-lg text-foreground">Benedikt Nöchel</p>
            </div>
          </AnimatedSection>

          {/* Persönlich haftende Gesellschafterin */}
          <AnimatedSection animation="fade-in-up" delay={300}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-6">Persönlich haftende Gesellschafterin</h2>
              
              <div className="space-y-4">
                <p className="text-lg font-semibold text-foreground">SLT Management GmbH</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Anrather Straße 291</p>
                        <p className="text-muted-foreground">DE-47807 Krefeld</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="text-foreground">Fon: +49 (0) 2151 - 417 99 03</p>
                        <p className="text-muted-foreground">Fax: +49 (0) 2151 - 417 99 04</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary shrink-0" />
                      <a href="mailto:info@slt-m.de" className="text-primary hover:underline">
                        info@slt-m.de
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-1">
                  <p className="text-muted-foreground">HRB 18191 Amtsgericht Krefeld</p>
                  <p className="text-muted-foreground">Gerichtsstand: Amtsgericht Krefeld</p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Haftungsausschluss */}
          <AnimatedSection animation="fade-in-up" delay={400}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-6">Haftungsausschluss</h2>
              
              <div className="prose prose-gray max-w-none space-y-4 text-muted-foreground">
                <p>
                  Die SLT Technology Group GmbH & Co. KG prüft und aktualisiert die Informationen auf ihrer Webseite ständig. Trotz aller Sorgfalt können sich Daten und Informationen jeglicher Art inzwischen verändert haben. Eine Haftung, Garantie oder sonstiges Einstehen für die Aktualität, Richtigkeit und Vollständigkeit der zur Verfügung gestellten Informationen kann daher nicht übernommen werden.
                </p>
                <p>
                  Gleiches gilt auch für alle anderen Webseiten, auf die direkt mittels Hyperlinks oder in sonstiger Weise verwiesen wird. SLT Technology Group GmbH & Co. KG ist für den Inhalt der Webseiten, die aufgrund einer solchen Verbindung oder Hinweis erreicht werden, nicht verantwortlich.
                </p>
                <p>
                  Die SLT Technology Group GmbH & Co. KG lehnt jegliche Form der Haftung, insbesondere Vertragshaftung, Deliktshaftung, Gefährdungshaftung oder sonstige Haftung für direkten oder indirekten Schadensersatz, Ersatz des beiläufig entstandenen Schadens oder für Strafe einschließlich Schadensersatz oder für Schäden, die daraus resultieren oder in Zusammenhang damit stehen, dass die SLT Technology Group GmbH & Co. KG-Seiten aufgerufen, benutzt oder nicht benutzt werden können, oder für Schäden durch einen Leistungsausfall, eine Unterbrechung, einen Defekt, eine Übertragungsverzögerung, einen Computervirus oder sonstige schädliche Elemente oder einen Leitungs- und Systemausfall im Zusammenhang mit der Webseite der SLT Technology Group GmbH & Co. KG, ab, unabhängig davon, ob die SLT Technology Group GmbH & Co. KG sich der Möglichkeiten solcher Schäden bewusst ist oder nicht.
                </p>
                <p>
                  Die SLT Technology Group GmbH & Co. KG behält sich das Recht vor, jederzeit Änderungen oder Ergänzungen der bereitgestellten Informationen vorzunehmen.
                </p>
                <p>
                  Inhalt, Struktur und Gestaltung der SLT Technology Group GmbH & Co. KG Webseite sind urheberrechtlich geschützt. Die Vervielfältigung, Änderung, Darstellung, Verbreitung, Übermittlung, Veröffentlichung, Verkauf, Lizenzierung, Bearbeitung, Verfremdung oder Nutzung von Informationen oder Daten für welche Zwecke auch immer, insbesondere die Verwendung von Texten, Textteilen oder Bildmaterial, bedarf der vorherigen schriftlichen Zustimmung der SLT Technology Group GmbH & Co. KG.
                </p>
                <p>
                  Dieser Haftungsausschluss ist Teil des Internetangebotes, von welchem aus auf diese Seite verwiesen wurde. Sofern Teile oder einzelne Formulierungen dieses Textes der geltenden Rechtslage nicht, nicht mehr oder nicht vollständig entsprechen sollten, bleiben die übrigen Teile des Textes in ihrem Inhalt und ihrer Gültigkeit davon unberührt.
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Versicherung */}
          <AnimatedSection animation="fade-in-up" delay={500}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Betriebshaftpflicht-, Elektronik- & Maschinenbruchversicherung</h2>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium text-foreground">Gothaer Allgemeine Versicherung AG</p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Geltungsbereich des Versicherungsschutzes:</span> Deutschland
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </Layout>
  );
}
