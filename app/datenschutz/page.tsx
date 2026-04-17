import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Datenschutzerklärung | SLT Rental GmbH",
  description: "Datenschutzerklärung der SLT Rental GmbH. Informationen zur Verarbeitung personenbezogener Daten.",
  robots: "noindex, follow",
}

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slt-blue hover:text-slt-blue-dark mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Startseite
        </Link>

        <div className="max-w-3xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-headline mb-8">
            Datenschutzerklärung
          </h1>

          <div className="prose prose-lg max-w-none text-body space-y-8">
            <section>
              <h2 className="font-display text-xl font-bold text-headline mb-4">
                1. Datenschutz auf einen Blick
              </h2>
              <h3 className="font-display text-lg font-semibold text-headline mb-2">
                Allgemeine Hinweise
              </h3>
              <p>
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was
                mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website
                besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie
                persönlich identifiziert werden können.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-headline mb-4">
                2. Verantwortliche Stelle
              </h2>
              <p>
                SLT Rental GmbH<br />
                Kimplerstraße 296<br />
                47807 Krefeld<br />
                <br />
                Telefon: 02151 - 957 92 29<br />
                E-Mail: info@slt-rental.de
              </p>
              <p>
                Verantwortliche Stelle ist die natürliche oder juristische Person,
                die allein oder gemeinsam mit anderen über die Zwecke und Mittel
                der Verarbeitung von personenbezogenen Daten entscheidet.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-headline mb-4">
                3. Datenerfassung auf dieser Website
              </h2>

              <h3 className="font-display text-lg font-semibold text-headline mb-2">
                Wer ist verantwortlich für die Datenerfassung auf dieser Website?
              </h3>
              <p>
                Die Datenverarbeitung auf dieser Website erfolgt durch den
                Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt
                &quot;Verantwortliche Stelle&quot; in dieser Datenschutzerklärung entnehmen.
              </p>

              <h3 className="font-display text-lg font-semibold text-headline mb-2 mt-4">
                Wie erfassen wir Ihre Daten?
              </h3>
              <p>
                Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese
                mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie
                in ein Kontaktformular eingeben.
              </p>
              <p>
                Andere Daten werden automatisch oder nach Ihrer Einwilligung beim
                Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor
                allem technische Daten (z. B. Internetbrowser, Betriebssystem oder
                Uhrzeit des Seitenaufrufs).
              </p>

              <h3 className="font-display text-lg font-semibold text-headline mb-2 mt-4">
                Wofür nutzen wir Ihre Daten?
              </h3>
              <p>
                Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung
                der Website zu gewährleisten. Andere Daten können zur Analyse Ihres
                Nutzerverhaltens verwendet werden.
              </p>

              <h3 className="font-display text-lg font-semibold text-headline mb-2 mt-4">
                Welche Rechte haben Sie bezüglich Ihrer Daten?
              </h3>
              <p>
                Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft,
                Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu
                erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung
                dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur
                Datenverarbeitung erteilt haben, können Sie diese Einwilligung
                jederzeit für die Zukunft widerrufen. Außerdem haben Sie das Recht,
                unter bestimmten Umständen die Einschränkung der Verarbeitung Ihrer
                personenbezogenen Daten zu verlangen.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-headline mb-4">
                4. Hosting
              </h2>
              <p>
                Wir hosten die Inhalte unserer Website bei Vercel Inc. Anbieter
                ist Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA.
              </p>
              <p>
                Details entnehmen Sie der Datenschutzerklärung von Vercel:{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slt-blue hover:underline"
                >
                  https://vercel.com/legal/privacy-policy
                </a>
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-headline mb-4">
                5. Kontaktformular
              </h2>
              <p>
                Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden
                Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort
                angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für
                den Fall von Anschlussfragen bei uns gespeichert. Diese Daten
                geben wir nicht ohne Ihre Einwilligung weiter.
              </p>
              <p>
                Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6
                Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines
                Vertrags zusammenhängt oder zur Durchführung vorvertraglicher
                Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die
                Verarbeitung auf unserem berechtigten Interesse an der effektiven
                Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f
                DSGVO) oder auf Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)
                sofern diese abgefragt wurde.
              </p>
              <p>
                Die von Ihnen im Kontaktformular eingegebenen Daten verbleiben
                bei uns, bis Sie uns zur Löschung auffordern, Ihre Einwilligung
                zur Speicherung widerrufen oder der Zweck für die Datenspeicherung
                entfällt. Zwingende gesetzliche Bestimmungen - insbesondere
                Aufbewahrungsfristen - bleiben unberührt.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-headline mb-4">
                6. Anfrage per E-Mail oder Telefon
              </h2>
              <p>
                Wenn Sie uns per E-Mail oder Telefon kontaktieren, wird Ihre
                Anfrage inklusive aller daraus hervorgehenden personenbezogenen
                Daten (Name, Anfrage) zum Zwecke der Bearbeitung Ihres Anliegens
                bei uns gespeichert und verarbeitet.
              </p>
              <p>
                Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6
                Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines
                Vertrags zusammenhängt. In allen übrigen Fällen beruht die
                Verarbeitung auf Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)
                und/oder auf unseren berechtigten Interessen (Art. 6 Abs. 1 lit. f
                DSGVO).
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-headline mb-4">
                7. SSL- bzw. TLS-Verschlüsselung
              </h2>
              <p>
                Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der
                Übertragung vertraulicher Inhalte, wie zum Beispiel Anfragen,
                die Sie an uns als Seitenbetreiber senden, eine SSL- bzw.
                TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie
                daran, dass die Adresszeile des Browsers von &quot;http://&quot; auf
                &quot;https://&quot; wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
              </p>
              <p>
                Wenn die SSL- bzw. TLS-Verschlüsselung aktiviert ist, können die
                Daten, die Sie an uns übermitteln, nicht von Dritten mitgelesen
                werden.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-headline mb-4">
                8. Ihre Rechte
              </h2>
              <p>Sie haben folgende Rechte:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
                <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
                <li>Recht auf Löschung (Art. 17 DSGVO)</li>
                <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
              </ul>
              <p className="mt-4">
                Sie haben außerdem das Recht, sich bei einer
                Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer
                personenbezogenen Daten durch uns zu beschweren.
              </p>
            </section>

            <section>
              <p className="text-sm text-muted-foreground">
                Stand: Januar 2024
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
