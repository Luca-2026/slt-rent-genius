import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "AGB | Allgemeine Geschäftsbedingungen | SLT Rental GmbH",
  description: "Allgemeine Geschäftsbedingungen der SLT Rental GmbH für die Vermietung von Baumaschinen und Minibaggern.",
  robots: "noindex, follow",
}

export default function AGBPage() {
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
            Allgemeine Geschäftsbedingungen
          </h1>

          <div className="prose prose-lg max-w-none text-body space-y-8">
            <section>
              <h2 className="font-display text-xl font-bold text-headline mb-4">
                § 1 Geltungsbereich
              </h2>
              <p>
                (1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle
                Verträge zwischen der SLT Rental GmbH, Kimplerstraße 296, 47807
                Krefeld (nachfolgend &quot;Vermieter&quot;) und dem Kunden (nachfolgend
                &quot;Mieter&quot;) über die Vermietung von Baumaschinen, insbesondere
                Minibaggern und Zubehör.
              </p>
              <p>
                (2) Abweichende Bedingungen des Mieters werden nicht anerkannt,
                es sei denn, der Vermieter stimmt ihrer Geltung ausdrücklich
                schriftlich zu.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-headline mb-4">
                § 2 Vertragsschluss
              </h2>
              <p>
                (1) Die Darstellung der Mietgeräte auf der Website stellt kein
                rechtlich bindendes Angebot dar, sondern eine unverbindliche
                Aufforderung zur Abgabe eines Angebots.
              </p>
              <p>
                (2) Der Mietvertrag kommt durch schriftliche Auftragsbestätigung
                des Vermieters oder durch Übergabe des Mietgegenstandes zustande.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-headline mb-4">
                § 3 Mietzeit und Mindestmietdauer
              </h2>
              <p>
                (1) Die Mietzeit beginnt mit der Übergabe des Mietgegenstandes
                an den Mieter oder dessen Beauftragten und endet mit der Rückgabe
                an den Vermieter.
              </p>
              <p>
                (2) Die Mindestmietdauer beträgt in der Regel einen Tag.
                Abweichende Vereinbarungen bedürfen der Schriftform.
              </p>
              <p>
                (3) Eine vorzeitige Rückgabe berechtigt nicht zur Mietminderung,
                sofern nicht anders vereinbart.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-headline mb-4">
                § 4 Mietzins und Zahlungsbedingungen
              </h2>
              <p>
                (1) Der Mietzins richtet sich nach der jeweils gültigen Preisliste
                des Vermieters oder nach individueller Vereinbarung.
              </p>
              <p>
                (2) Im Mietzins enthalten sind die normale Abnutzung sowie eine
                Haftpflichtversicherung mit branchenüblicher Selbstbeteiligung.
              </p>
              <p>
                (3) Zusätzliche Kosten wie Transport, Kraftstoff, Reinigung oder
                Reparaturen werden gesondert berechnet.
              </p>
              <p>
                (4) Der Mietzins ist bei Übernahme des Mietgegenstandes fällig,
                sofern nicht anders vereinbart.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-headline mb-4">
                § 5 Pflichten des Mieters
              </h2>
              <p>Der Mieter verpflichtet sich:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  den Mietgegenstand nur bestimmungsgemäß und sachgerecht zu
                  verwenden
                </li>
                <li>
                  die Bedienungsanleitung und Sicherheitsvorschriften zu beachten
                </li>
                <li>
                  den Mietgegenstand pfleglich zu behandeln und vor Beschädigung
                  zu schützen
                </li>
                <li>
                  nur geeignetes und geschultes Personal mit der Bedienung zu
                  betrauen
                </li>
                <li>
                  Schäden und Mängel unverzüglich dem Vermieter mitzuteilen
                </li>
                <li>
                  den Mietgegenstand nicht ohne Zustimmung des Vermieters an
                  Dritte weiterzugeben
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-headline mb-4">
                § 6 Haftung und Schadensersatz
              </h2>
              <p>
                (1) Der Mieter haftet für alle Schäden am Mietgegenstand, die
                während der Mietzeit entstehen, es sei denn, er weist nach, dass
                er den Schaden nicht zu vertreten hat.
              </p>
              <p>
                (2) Bei Beschädigung oder Verlust hat der Mieter die Reparaturkosten
                bzw. den Wiederbeschaffungswert zu erstatten.
              </p>
              <p>
                (3) Der Mieter haftet für alle Schäden, die durch unsachgemäße
                Bedienung oder Verwendung des Mietgegenstandes entstehen.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-headline mb-4">
                § 7 Rückgabe des Mietgegenstandes
              </h2>
              <p>
                (1) Der Mietgegenstand ist pünktlich zum vereinbarten Zeitpunkt
                im sauberen und ordnungsgemäßen Zustand zurückzugeben.
              </p>
              <p>
                (2) Verspätete Rückgabe berechtigt den Vermieter zur Berechnung
                weiterer Miettage sowie eines Verspätungszuschlags.
              </p>
              <p>
                (3) Die Reinigungskosten werden bei Rückgabe im unsauberen
                Zustand gesondert berechnet.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-headline mb-4">
                § 8 Stornierung
              </h2>
              <p>
                (1) Stornierungen sind bis 48 Stunden vor dem vereinbarten
                Mietbeginn kostenlos möglich.
              </p>
              <p>
                (2) Bei Stornierung innerhalb von 48 Stunden vor Mietbeginn
                wird eine Stornogebühr von 50% des vereinbarten Tagesmietzinses
                berechnet.
              </p>
              <p>
                (3) Bei Nichtabholung ohne Absage wird der volle Tagesmietzins
                berechnet.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-headline mb-4">
                § 9 Gewährleistung
              </h2>
              <p>
                (1) Der Vermieter gewährleistet, dass der Mietgegenstand bei
                Übergabe in einem betriebsfähigen und sicheren Zustand ist.
              </p>
              <p>
                (2) Mängel, die bei Übernahme erkennbar sind, müssen sofort
                gerügt werden. Spätere Mängelrügen werden nur berücksichtigt,
                wenn der Mieter nachweist, dass der Mangel bereits bei Übergabe
                vorlag.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-headline mb-4">
                § 10 Schlussbestimmungen
              </h2>
              <p>
                (1) Es gilt das Recht der Bundesrepublik Deutschland.
              </p>
              <p>
                (2) Erfüllungsort und Gerichtsstand ist Krefeld, sofern der
                Mieter Kaufmann ist oder keinen allgemeinen Gerichtsstand in
                Deutschland hat.
              </p>
              <p>
                (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein,
                bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
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
