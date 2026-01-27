import { Layout } from "@/components/layout";
import { AnimatedSection } from "@/components/ui/animated-section";

export default function AGB() {
  return (
    <Layout>
      <div className="bg-muted/30 py-12 md:py-16">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Allgemeine Geschäfts- und Vermietbedingungen
            </h1>
            <p className="text-lg text-muted-foreground">
              der SLT Technology Group GmbH & Co. KG und der eingetragenen Marke „SLT-Rental"
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="section-container py-12">
        <div className="prose prose-slate max-w-none">
          {/* Section I */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">I. Geltungsbereich und Vertragspartner</h2>
            <p className="text-body mb-4">
              Für sämtliche Mietverträge zwischen SLT Technology Group GmbH & Co. KG („SLT") und dem Mieter gelten ausschließlich diese Allgemeinen Geschäfts- und Vermietbedingungen (im Folgenden „AGB"). Entgegenstehende Geschäftsbedingungen des Mieters werden nicht anerkannt, es sei denn, SLT stimmt deren Geltung ausdrücklich und schriftlich zu.
            </p>
            <p className="text-body mb-4">
              Ergänzungen oder Abweichungen von diesen AGB bedürfen der Schriftform. Die Vertragssprache ist deutsch.
            </p>
            <p className="text-body">
              Sollten einzelne Bestimmungen dieser AGB unwirksam sein, berührt dies nicht die Wirksamkeit der übrigen Bestimmungen. Die unwirksame Bestimmung wird durch eine solche ersetzt, die dem wirtschaftlichen Zweck am nächsten kommt.
            </p>
          </section>

          {/* Section II */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">II. Vertragsgegenstand und Vertragsschluss</h2>
            
            <h3 className="text-lg font-semibold text-foreground mb-3">2.1 Mietgegenstände</h3>
            <p className="text-body mb-6">
              SLT vermietet Baumaschinen, Baustelleninfrastruktur, Anhänger, Kraftfahrzeuge, Party- und Eventequipment, Verkehrssicherungsmaterialien und weitere Ausrüstungen. Alle Darstellungen auf www.slt-rental.de, in Social Media oder Printmedien sind freibleibend und unverbindlich.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">2.2 Mietanfrage und Angebotsunterbreitung</h3>
            <p className="text-body mb-4">
              Mietanfragen können über das Kontaktformular auf der Website, per E-Mail oder telefonisch gestellt werden. SLT prüft die Verfügbarkeit und unterbreitet ein verbindliches Angebot unter Vorbehalt. Der Vertrag kommt erst mit schriftlicher Bestätigung durch SLT zustande; Textform (E-Mail) genügt.
            </p>
            <p className="text-body mb-6">
              Für Online-Buchungen über den Webshop auf www.slt-rental.de gilt der Vertrag mit Versand der automatisierten Buchungsbestätigung durch SLT als abgeschlossen.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">2.3 Identitätsnachweis</h3>
            <p className="text-body mb-6">
              SLT ist berechtigt, vor Übergabe der Mietsache die Vorlage eines gültigen Personalausweises oder Reisepasses sowie einer aktuellen Meldebescheinigung (nicht älter als drei Monate) zu verlangen. Eine Vermietung kann bei Nichtvorlage verweigert werden; ein Anspruch des Mieters auf Schadensersatz besteht in diesem Fall nicht.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">2.4 Preise</h3>
            <p className="text-body mb-6">
              Alle Preise verstehen sich als Brutto-Endpreise inklusive der gesetzlich geltenden Mehrwertsteuer, sofern nicht anders ausgewiesen.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">2.5 Mietzinsfälligkeit</h3>
            <p className="text-body mb-6">
              Nach Vertragsschluss ist SLT zur Bereitstellung und Vorhaltung der Mietartikel verpflichtet. Mit Beginn der Mietzeit entsteht der Anspruch auf Zahlung des vollständigen Mietzinses.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">2.6 Kaution</h3>
            <p className="text-body mb-6">
              SLT ist berechtigt, für bestimmte Mietartikel eine Kaution zu verlangen. Die Kautionshöhe wird im Angebot oder Buchungsprozess ausgewiesen und ist vor Übergabe der Mietsache zu hinterlegen. Die Kaution wird unverzinst hinterlegt und innerhalb von fünf Werktagen nach ordnungsgemäßer Rückgabe und Prüfung des Mietgegenstandes zurückgezahlt. SLT ist berechtigt, berechtigte Ansprüche aus dem Mietverhältnis (insbesondere Mietforderungen und Schadensersatzansprüche wegen Beschädigung oder Verlust der Mietsache) mit der Kaution zu verrechnen.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">2.7 Vermietung an Dritte und Ausfuhr</h3>
            <p className="text-body mb-6">
              Eine Vermietung, Weitergabe oder Abtretung der Mietgegenstände an Dritte sowie deren Ausfuhr aus der Bundesrepublik Deutschland ist ohne ausdrückliche schriftliche Genehmigung von SLT untersagt. Bei Zuwiderhandlung haftet der Mieter für sämtliche hieraus entstehenden Schäden, Kosten und Bußgelder.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">2.8 Haftungsreduzierung und Versicherung</h3>
            <p className="text-body mb-6">
              Eine Haftungsreduzierung und/oder Versicherung kann im Buchungsprozess optional vereinbart werden. Für bestimmte Mietartikel besteht die Möglichkeit, eine entgeltliche Auslandshaftpflichtversicherung abzuschließen; die Versicherungsbedingungen sind auf Anfrage erhältlich.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">2.9 Transportleistungen</h3>
            <p className="text-body mb-4">
              Transportleistungen (Anlieferung, Abholung, Hin- und Rücktransport) können gegen gesonderte Vergütung vereinbart werden. Die Transportkosten sind spätestens mit Mietbeginn fällig; mit Bezahlung gelten diese als vereinbart.
            </p>
            <p className="text-body mb-6">
              Sofern ein Hin- und Rücktransport beauftragt wurde, setzen wir eine frei befahrbare Baustelle voraus. Sollte es zu Verzögerungen kommen, die nicht durch SLT zu vertreten sind (z.B. fehlende Zugänglichkeit, Wartezeiten), behalten wir uns vor, diese in Rechnung zu stellen. Teilabholungen werden gesondert in Rechnung gestellt.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">2.10 Barzahlungen</h3>
            <p className="text-body mb-6">
              Barzahlungen mit einem Betrag von mehr als 1.000 EUR werden mit einem Aufgeld von 3 % des Zahlbetrags versehen, um die erhöhten internen Bearbeitungs- und Sicherheitskosten abzudecken.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">2.11 Verzugszinsen und Inkassokosten</h3>
            <p className="text-body">
              Bei Zahlungsverzug gelten für Verbraucher Verzugszinsen von 5 Prozentpunkten über dem Basiszinssatz (§ 288 BGB), für Unternehmer von 9 Prozentpunkten über dem Basiszinssatz. Der Mieter trägt zudem sämtliche durch den Verzug entstehenden Kosten (Mahngebühren, Inkassokosten, Rechtsanwaltsgebühren).
            </p>
          </section>

          {/* Section III */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">III. Übergabe, Rückgabe und Zustand der Mietsache</h2>
            
            <h3 className="text-lg font-semibold text-foreground mb-3">3.1 Übergabeort und -zeit</h3>
            <p className="text-body mb-6">
              Die Übergabe erfolgt zum vereinbarten Mietbeginn an einem der Geschäftssitze von SLT (Krefeld, Bonn oder Mülheim an der Ruhr), sofern nichts anderes schriftlich vereinbart ist. Ein Versand oder eine Anlieferung erfolgt nach individueller Vereinbarung und gegen gesondertes Entgelt.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">3.1a Kontaktlose Übergabe von Anhängern</h3>
            <p className="text-body mb-6">
              Anhänger können nach vorheriger Vereinbarung kontaktlos mittels Code-System übergeben und zurückgenommen werden. Der Zugangscode ist ausschließlich für den vereinbarten Mietzeitraum gültig. Der Mieter ist verpflichtet, Verspätungen bzw. eine notwendige Verlängerung der Mietzeit rechtzeitig, mindestens 2 Stunden vor Mietende, schriftlich gegenüber SLT anzuzeigen. Erfolgt keine rechtzeitige Mitteilung, bleibt SLT die Berechnung der zusätzlichen Mietzeit und etwaiger Mehraufwände vorbehalten. Die Codes werden per SMS an die im Buchungsprozess angegebene Mobilfunknummer des Mieters versandt. Mit Eingabe seiner Mobilfunknummer im Buchungsprozess stimmt der Mieter dem Erhalt von SMS zum Zwecke der Abwicklung des Mietverhältnisses ausdrücklich zu.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">3.2 Zustandsprüfung bei Übergabe</h3>
            <p className="text-body mb-6">
              Bei Übergabe hat der Mieter den Zustand, die Vollständigkeit und die Funktion der Mietsache zu prüfen. Die Übernahme durch Unterzeichnung des Lieferscheins oder Übergabeprotokolls gilt als Anerkennung des ordnungsgemäßen Zustandes der Mietsache.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">3.3 Pflichten des Mieters beim Umgang mit der Mietsache</h3>
            <p className="text-body mb-6">
              Der Mieter ist verpflichtet, die Mietsache samt Zubehör pfleglich und bestimmungsgemäß sowie gemäß den geltenden Sicherheits- und Betriebsvorschriften zu behandeln. Die Bedienungsanleitung ist einzuhalten und der Mietgegenstand ist bestimmungsgemäß einzusetzen.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">3.4 Meldepflicht bei Mängeln</h3>
            <p className="text-body mb-6">
              Schäden, Funktionsstörungen oder Verluste sind SLT unverzüglich, spätestens innerhalb von 24 Stunden nach Feststellung, schriftlich anzuzeigen. Bei unterlassener oder verspäteter Anzeige haftet der Mieter für alle hieraus entstehenden Folgeschäden.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">3.5 Rückgabeort und -zeit</h3>
            <p className="text-body mb-4">
              Die Rückgabe hat zum vereinbarten Zeitpunkt, grundsätzlich an einem der Geschäftssitze von SLT (Krefeld, Bonn oder Mülheim an der Ruhr), in ordnungsgemäßem, vollständigem und sauberem Zustand zu erfolgen. Bei Rückholung durch SLT muss die Mietsache zu ebener Erde transportfähig bereitstehen.
            </p>
            <p className="text-body mb-6">
              Rückgaben außerhalb der Geschäftszeiten sind nur nach schriftlicher Vereinbarung möglich. Das Risiko für Verlust und Beschädigung bleibt bis zur tatsächlichen Rücknahme durch SLT beim Mieter.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">3.6 Rückgabevorgaben und Reinigung</h3>
            <p className="text-body mb-4">Die Mietsache ist wie folgt zurückzugeben:</p>
            <ul className="list-disc list-inside text-body mb-6 space-y-2 ml-4">
              <li><strong>Anhänger:</strong> besenrein</li>
              <li><strong>Baumaschinen, Stromaggregate, Arbeitsbühnen:</strong> vollgetankt oder vollgeladen, frei von grobem Schmutz</li>
              <li><strong>Zelte und Textilien:</strong> trocken, sortiert, gefaltet</li>
              <li><strong>Geräte mit Akku:</strong> vollgeladen</li>
              <li><strong>Kraftfahrzeuge:</strong> vollgetankt, gereinigt</li>
            </ul>
            <p className="text-body mb-4">
              Wird die Mietsache verspätet, unvollständig oder verschmutzt zurückgegeben, ist SLT berechtigt, den Mehraufwand (insbesondere Reinigung, Desinfektion und zusätzliche Mietgebühren) in Rechnung zu stellen.
            </p>
            <p className="text-body mb-6">
              Reinigung, Entsorgung und Transport werden – sofern nicht pauschal vereinbart – nach tatsächlichem Aufwand abgerechnet. Reparaturen, die auf vom Mieter zu vertretende Beschädigungen zurückzuführen sind, gehen zu dessen Lasten.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">3.7 Rückgabebestätigung</h3>
            <p className="text-body mb-6">
              Die Rückgabe wird mit Abschlussprotokoll dokumentiert. Ohne Protokoll gilt die Rückgabe als nicht erfolgt und die Mietsache bleibt im Verantwortungsbereich des Mieters.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">3.8 Anlagen als Vertragsbestandteil</h3>
            <p className="text-body mb-6">
              Anlagen (z.B. Stücklisten, Übergabeprotokolle, Aufmaße, Lieferscheine) werden Vertragsbestandteil.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">3.9 Be- und Entladung</h3>
            <p className="text-body">
              Sofern Abholung und/oder Rücklieferung durch den Mieter oder durch einen von ihm beauftragten Spediteur/Frachtführer vereinbart ist, ist der Mieter für die ordnungsgemäße Be- und Entladung sowie die Einhaltung der einschlägigen Ladungssicherungsregelungen verantwortlich.
            </p>
          </section>

          {/* Section IV */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">IV. Mietzeit, Mietende und verspätete Rückgabe</h2>
            
            <h3 className="text-lg font-semibold text-foreground mb-3">4.1 Mietdauer</h3>
            <p className="text-body mb-6">
              Die Mietzeit sowie Abhol- und Rückgabezeiten ergeben sich aus dem Mietvertrag oder der Buchungsbestätigung.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">4.2 Mietpreisberechnung und Nutzungsdauer</h3>
            <p className="text-body mb-6">
              Die Mietpreise basieren auf einer Tagesnutzungsdauer von 24 Stunden bzw. einer Wochennutzung von 168 Stunden. Für Maschinen mit Stundenzähler gelten 8 Betriebsstunden pro Tag bzw. 56 pro Woche. Jede angefangene Miet- oder Betriebsstunde wird als volle Stunde berechnet; jeder angefangene Miettag wird als voller Tag berechnet. Jede Überschreitung wird mit 1/8 des Tagespreises pro weiterer Stunde berechnet.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">4.3 Abmeldung und Freimeldung</h3>
            <p className="text-body mb-6">
              Für Mietverträge, die nicht über den Onlineshop abgeschlossen werden, ist der im Angebot angegebene Mietzeitraum zunächst nur eine unverbindliche Planungsannahme. Der Mieter ist verpflichtet, das Mietende bzw. die Freimeldung der Mietartikel rechtzeitig und verbindlich schriftlich per E-Mail an mieten@slt-rental.de anzuzeigen. Erfolgt keine schriftliche Freimeldung, läuft die Miete bis zur tatsächlichen Rückgabe weiter und wird entsprechend in Rechnung gestellt.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">4.4 Verspätete Rückgabe</h3>
            <p className="text-body mb-6">
              Bei verspäteter Rückgabe ist SLT berechtigt, einen Zuschlag in Höhe von 50 % des Bruttomietpreises pro verspätetem Tag zu berechnen. SLT behält sich die Geltendmachung eines höheren, konkret entstandenen Schadens vor; der Mieter kann den Nachweis eines geringeren Schadens führen.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">4.5 Zusätzliche Gebühren und Kostenerstattungen</h3>
            <p className="text-body mb-4">Zusätzlich zum Mietzins werden folgende Posten in Rechnung gestellt:</p>
            <ul className="list-disc list-inside text-body mb-4 space-y-2 ml-4">
              <li>Gebühren, Bußgelder und Mautkosten, die während der Mietzeit anfallen;</li>
              <li>eine Bearbeitungspauschale von 15,00 EUR je Vorgang für Bußgelder/Maut;</li>
              <li>eine Bearbeitungspauschale von 40,00 EUR je Schadensfall;</li>
              <li>Reinigungskosten ab 50,00 EUR netto, wenn die Rückgabevorgaben (siehe III.6) nicht erfüllt werden.</li>
            </ul>
            <p className="text-body">
              Dem Mieter bleibt der Nachweis eines geringeren Aufwands vorbehalten.
            </p>
          </section>

          {/* Section V */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">V. Haftung von SLT, Mängel, Rechte des Mieters</h2>
            
            <h3 className="text-lg font-semibold text-foreground mb-3">5.1 Haftungsbeschränkung</h3>
            <p className="text-body mb-4">
              SLT haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit. Für leichte Fahrlässigkeit haftet SLT nur bei Verletzung wesentlicher Vertragspflichten (sogenannter Kardinalpflichten); die Haftung ist auf den typisch vorhersehbaren Schaden begrenzt.
            </p>
            <p className="text-body mb-4">
              Für Unternehmer und Körperschaften des öffentlichen Rechts ist die Haftung für leichte Fahrlässigkeit ausgeschlossen, soweit keine Kardinalpflicht verletzt wurde.
            </p>
            <p className="text-body mb-4">
              Die Haftungsbeschränkungen gelten auch zugunsten der gesetzlichen Vertreter, Mitarbeiter und Erfüllungsgehilfen von SLT.
            </p>
            <p className="text-body mb-6">
              Eine Haftung nach dem Produkthaftungsgesetz bleibt unberührt.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">5.2 Mängelrüge und Mängelbeseitigung</h3>
            <p className="text-body">
              Der Mieter hat Mängel der Mietsache unverzüglich, spätestens innerhalb von 24 Stunden nach Feststellung, schriftlich anzuzeigen. SLT ist berechtigt, den Mangel nach eigener Wahl durch Reparatur oder Ersatzlieferung zu beseitigen. Weitergehende Rechte des Mieters (z.B. Minderung, Rücktritt) bestehen nur, wenn Nachbesserung oder Ersatzlieferung endgültig fehlschlagen.
            </p>
          </section>

          {/* Section VI */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">VI. Rücktritt und Stornierung durch den Mieter</h2>
            
            <h3 className="text-lg font-semibold text-foreground mb-3">6.1 Stornierungsrecht</h3>
            <p className="text-body mb-6">
              Der Mieter kann den Mietvertrag vor Mietbeginn jederzeit durch schriftliche Erklärung (Textform genügt) gegenüber SLT kündigen („Stornierung").
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">6.2 Stornogebühren (pauschalierte Entschädigung)</h3>
            <p className="text-body mb-4">
              Im Falle der Stornierung kann SLT eine pauschalierte Entschädigung verlangen, die sich – vorbehaltlich eines niedrigeren oder höheren Nachweises nach Abs. 6.3 – wie folgt bemisst (in Prozent des vereinbarten Gesamtmietpreises):
            </p>
            <ul className="list-disc list-inside text-body mb-6 space-y-2 ml-4">
              <li>bis 20 Tage vor Mietbeginn: 30 %</li>
              <li>bis 7 Tage vor Mietbeginn: 50 %</li>
              <li>bis 3 Tage vor Mietbeginn: 70 %</li>
              <li>bis 48 Stunden vor Mietbeginn: 90 %</li>
              <li>bei späterer Stornierung: 100 %</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mb-3">6.3 Nachweisvorbehalt</h3>
            <p className="text-body mb-6">
              Dem Mieter bleibt ausdrücklich der Nachweis vorbehalten, dass SLT kein oder nur ein wesentlich geringerer Schaden entstanden ist (z.B. durch anderweitige Vermietung, ersparte Auf- und Abbau-, Transport- oder Personalkosten). SLT bleibt umgekehrt der Nachweis eines höheren, konkret entstandenen Schadens vorbehalten.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">6.4 Kostenfreie Stornierungsoption</h3>
            <p className="text-body mb-6">
              Bei Buchung der kostenpflichtigen Option „Kostenfreie Stornierung" kann der Mieter bis 72 Stunden vor Mietbeginn ohne Gebühren stornieren. Eine Stornierung nach diesem Zeitpunkt unterliegt den Stornogebühren nach Abs. 6.2.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">6.5 Gesetzliche Rechte</h3>
            <p className="text-body">
              Gesetzliche Rücktritts-, Kündigungs- und Gewährleistungsrechte des Mieters bleiben unberührt.
            </p>
          </section>

          {/* Section VII */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">VII. Pflichten und Haftung des Mieters</h2>
            
            <h3 className="text-lg font-semibold text-foreground mb-3">7.1 Einhaltung von Vorschriften</h3>
            <p className="text-body mb-4">
              Der Mieter verpflichtet sich, alle geltenden gesetzlichen und behördlichen Vorschriften (insbesondere Unfallverhütungsvorschriften, Straßenverkehrsordnung, Führerscheinpflicht, Betriebssicherheitsverordnung) einzuhalten und alle erforderlichen Erlaubnisse und Genehmigungen einzuholen.
            </p>
            <p className="text-body mb-6">
              Für Verstöße gegen gesetzliche Vorschriften haftet der Mieter vollumfänglich und stellt SLT von sämtlichen Ansprüchen Dritter frei.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">7.2 Versicherung der Mietsache</h3>
            <p className="text-body mb-6">
              Die Versicherung der Mietsache obliegt dem Mieter, sofern keine Versicherung über SLT abgeschlossen wurde. Für einige Mietartikel (z.B. Anhänger mit Haftpflichtversicherung, Stromgeneratoren) besteht ein Versicherungsschutz; die Versicherungsbedingungen können auf Wunsch eingesehen werden.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">7.3 Unfall und Schadensfall – Meldepflicht</h3>
            <p className="text-body mb-6">
              Bei Unfällen, Verlust, Diebstahl oder Beschädigungen hat der Mieter unverzüglich die Polizei und SLT zu verständigen und ein Schadensprotokoll vorzulegen. Ansprüche Dritter darf der Mieter nicht anerkennen, ohne SLT vorher in Kenntnis zu setzen.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">7.4 Nutzung durch Dritte und Auslandsfahrten</h3>
            <p className="text-body mb-6">
              Die Nutzung der Mietsache durch Dritte sowie Auslandsfahrten sind nur nach vorheriger schriftlicher Genehmigung von SLT zulässig.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">7.5 Schlüssel und Zubehör</h3>
            <p className="text-body mb-6">
              Schlüssel, Zubehör und mitgelieferte Dokumente sind sorgfältig zu verwahren und bei Rückgabe vollständig zu übergeben. Verlust wird dem Mieter zu den tatsächlichen Wiederbeschaffungskosten berechnet.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">7.6 Personal- oder Maschinenmiete mit Bedienpersonal</h3>
            <p className="text-body mb-6">
              Der Mieter haftet auch bei Personaleinsatz für Verlust, Beschädigung und Wartezeiten, soweit diese nicht durch SLT verschuldet sind. Wartezeiten werden mit 139,00 EUR brutto pro Stunde berechnet. Zeiten, in denen der Mieter die von SLT zur Verfügung gestellten Fachkräfte wartet, während die vereinbarte Leistung nicht erbracht werden kann, gelten als Wartezeiten.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">7.7 Maschinenversicherung und Versicherungsbedingungen</h3>
            <p className="text-body mb-4">
              Sofern der Mieter eine Maschinenversicherung über SLT abschließt, gelten die im Angebot genannten Selbstbeteiligungen je Schadensfall. Vom Versicherungsschutz können bestimmte Risiken (z.B. Glasbruch, Reifenschäden, Fahrten ohne behördlich erforderliche Erlaubnis) ausgeschlossen sein; die Einzelheiten ergeben sich aus den Versicherungsbedingungen, die dem Mieter auf Wunsch überlassen werden.
            </p>
            <p className="text-body mb-6">
              Schließt der Mieter eine eigene Versicherung ab, hat diese mindestens Schäden nach den jeweils geltenden Bedingungen (z.B. ABMG 2008) sowie Schäden durch Abhandenkommen zu decken. Der Versicherungsschutz ist SLT auf Verlangen nachzuweisen.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">7.8 GPS-Ortungssystem</h3>
            <p className="text-body">
              Mietgeräte können mit einem GPS-Ortungssystem ausgestattet sein. Die an SLT übermittelten Daten werden zur Erfassung technischer Betriebszustände, zur Fernüberwachung, zur Diebstahlprävention und zur Ortung im Falle des Abhandenkommens verarbeitet. Die Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Weitere Hinweise zum Datenschutz enthält die Datenschutzerklärung unter www.slt-rental.de/datenschutz.
            </p>
          </section>

          {/* Section VIII */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">VIII. Aufbau, Service und Transport</h2>
            
            <h3 className="text-lg font-semibold text-foreground mb-3">8.1 Verfügbarkeit des Aufbauorts</h3>
            <p className="text-body mb-6">
              Bei Anmietung mit Service- oder Aufbaudienstleistungen ist der Mieter verpflichtet, einen geeigneten, freien und zugänglichen Aufbauort zur Verfügung zu stellen und alle erforderlichen Voraussetzungen für einen sicheren und schnellen Ablauf zu schaffen.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">8.2 Verzögerungen und Mehraufwand</h3>
            <p className="text-body mb-4">
              Für Verzögerungen oder Mehraufwand, die nicht durch SLT zu vertreten sind (z.B. fehlende Zugänglichkeit, Wartezeiten, notwendiges zusätzliches Personal, erforderliche Rückfragen), trägt der Mieter die entstehenden Kosten.
            </p>
            <p className="text-body mb-6">
              SLT ist nicht verpflichtet, den Aufbauort vor Vertragsbeginn auf Eignung zu überprüfen. Die Verantwortung hierfür obliegt dem Mieter.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">8.3 Unvorhergesehene Arbeiten</h3>
            <p className="text-body mb-6">
              Unvorhergesehene, vom vereinbarten Leistungsumfang nicht umfasste Arbeiten (z.B. zusätzliche Auf- und Abbauten, Wartezeiten, Nacharbeiten auf Wunsch des Mieters) werden nach Lohn- und Materialnachweis gesondert berechnet. Grundlage sind die jeweils gültigen Verrechnungssätze von SLT, insbesondere für Servicetechniker und spezialisierte Fachkräfte; diese können auf Anfrage eingesehen werden.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">8.4 Reisekosten und Übernachtung</h3>
            <p className="text-body">
              Reisekosten, Übernachtungs- und Verpflegungskosten von SLT-Mitarbeitern werden gesondert berechnet und sind vom Mieter zu tragen.
            </p>
          </section>

          {/* Section IX */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">IX. Besondere Bedingungen für Verkehrssicherung und Verkehrstechnik</h2>
            
            <h3 className="text-lg font-semibold text-foreground mb-3">9.1 Änderungen und Konkretisierungen</h3>
            <p className="text-body mb-6">
              Bei Änderungen oder Konkretisierungen der verkehrsrechtlichen Anordnung oder der Ausführungsplanung ist SLT berechtigt, das Angebot entsprechend anzupassen. Im Auftragsfall erfolgt die Abrechnung nach tatsächlichen Massen und Lieferscheinen.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">9.2 Zuständigkeiten des Auftraggebers – Kontrollen und Sicherung</h3>
            <p className="text-body mb-4">
              Die Kontrolle auf Vollständigkeit der Beschilderung, Absperrung und Beleuchtung nach Arbeitsschluss, die Durchführung von Sonderregelungen für arbeitsfreie Zeiten, die ggf. mehrmalige tägliche Reinigung der Verkehrssicherungsmaterialien sowie die Absicherung der Kernbaustelle einschließlich erforderlicher Anrampungen obliegen dem Auftraggeber, soweit nicht ausdrücklich etwas anderes schriftlich vereinbart ist.
            </p>
            <p className="text-body mb-6">
              Bei Arbeitsstellen längerer Dauer hat der Auftraggeber gemäß ZTV-SA tägliche Kontrollen mindestens zweimal täglich (bei Tagesanbruch und nach Eintritt der Dunkelheit) durchzuführen; an arbeitsfreien Tagen mindestens einmal täglich. Nach Unwetter oder Sturm sind Kontrollen unverzüglich vorzunehmen. Auf Wunsch können tägliche Kontrollfahrten durch SLT gesondert beauftragt werden.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">9.3 Eigentum und Abrechnung</h3>
            <p className="text-body mb-6">
              Die zur Verfügung gestellten Verkehrssicherungs-Materialien bleiben Eigentum von SLT. Die Abrechnung der Miete erfolgt monatlich, wenn die Mietzeit einen Monat überschreitet, spätestens jedoch nach 90 Tagen. Die Miete verlängert sich automatisch bis zur schriftlichen Abmeldung durch den Auftraggeber. Die Abmeldung bzw. der Abbau ist mindestens 72 Stunden vor dem geplanten Abbautermin schriftlich anzukündigen.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">9.4 Batteriewechsel</h3>
            <p className="text-body mb-6">
              Der Batteriewechsel an Leuchten und anderen batteriegestützten Einrichtungen hat spätestens alle 14 Tage zu erfolgen. Der Auftraggeber kann den Batteriewechsel und die Baustellenkontrolle als zusätzliche Leistung beauftragen.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">9.5 Behördliche Auflagen und Sondermaterialien</h3>
            <p className="text-body mb-6">
              Werden aufgrund behördlicher Auflagen oder Genehmigungsvorgaben zusätzliche Materialien oder Sperrmaßnahmen erforderlich, werden diese gesondert angeboten und berechnet.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">9.6 Haftung für Beschädigungen und Verluste</h3>
            <p className="text-body mb-6">
              Beschädigungen oder Verluste der Mietmaterialien während der Mietdauer gehen zu Lasten des Auftraggebers, auch wenn SLT die Kontrolle oder Überwachung vor Ort durchführt.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">9.7 Gebühren und Amtsentgelte</h3>
            <p className="text-body">
              Gebühren und Entgelte der Behörden sind – sofern nicht ausdrücklich anders angegeben – nicht Bestandteil des Angebots und werden gesondert abgerechnet.
            </p>
          </section>

          {/* Section X */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">X. Besondere Bedingungen für die Vermietung von Kraftfahrzeugen</h2>
            
            <h3 className="text-lg font-semibold text-foreground mb-3">10.1 Haftpflichtversicherung</h3>
            <p className="text-body mb-6">
              Für das gemietete Fahrzeug besteht eine Kfz-Haftpflichtversicherung mit einer maximalen Deckungssumme von 100 Mio. EUR für Personen- und Sachschäden und einer maximalen Deckungssumme von 12 Mio. EUR je geschädigter Person. Der Versicherungsschutz ist auf den europäischen Raum beschränkt.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">10.2 Vollkaskoschutz und Diebstahlschutz</h3>
            <p className="text-body mb-6">
              Der Mieter kann gegen gesondertes Entgelt einen Vollkaskoschutz (einschließlich Diebstahlschutz) mit einer vereinbarten Selbstbeteiligung abschließen. Durch Abschluss des Vollkaskoschutzes reduziert sich die Haftung des Mieters für Unfallschäden oder Verlust des Fahrzeugs auf die vereinbarte Selbstbeteiligung. Eine weitergehende Reduzierung der Selbstbeteiligung ist nach Maßgabe des jeweiligen Angebots möglich.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">10.3 Ausfall von Versicherungsschutz</h3>
            <p className="text-body mb-6">
              Bei vorsätzlicher oder grob fahrlässiger Schadenverursachung oder bei schwerwiegenden Verletzungen mietvertraglicher Pflichten kann der Anspruch auf Vollkasko- und Diebstahlschutz ganz oder teilweise entfallen.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">10.4 Haftung ohne Vollkaskoschutz</h3>
            <p className="text-body mb-6">
              Wird kein Vollkaskoschutz (inkl. Diebstahlschutz) vereinbart, haftet der Mieter für alle nicht nachweislich fremdverschuldeten Schäden am Mietfahrzeug bis zur Höhe des Wiederbeschaffungswerts zuzüglich weiterer ersatzfähiger Schäden (z.B. Wertminderung, Sachverständigenkosten, Abnutzungskosten).
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">10.5 Bearbeitungsentgelt für behördliche Anfragen</h3>
            <p className="text-body">
              Für die Bearbeitung von behördlichen Auskunftsanfragen im Zusammenhang mit Verkehrs- und Ordnungswidrigkeiten, Gesetzesverstößen oder sonstigen Vorwürfen, kann SLT gegenüber Mietern, die nicht Verbraucher im Sinne des § 13 BGB sind, ein angemessenes Bearbeitungsentgelt verlangen. Die Höhe wird im jeweiligen Mietvertrag ausgewiesen.
            </p>
          </section>

          {/* Section XI */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">XI. Datenschutz, Gerichtsstand und Schlussbestimmungen</h2>
            
            <h3 className="text-lg font-semibold text-foreground mb-3">11.1 Datenschutz</h3>
            <p className="text-body mb-6">
              Es gilt ergänzend die Datenschutzerklärung von SLT, abrufbar unter www.slt-rental.de/datenschutz. SLT verarbeitet im Rahmen der Geschäftsbeziehung auch personenbezogene Daten von zuständigen Ansprechpartnern der Geschäftspartner.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">11.2 Anwendbares Recht</h3>
            <p className="text-body mb-6">
              Für alle Streitigkeiten aus oder im Zusammenhang mit dem Mietverhältnis gilt das Recht der Bundesrepublik Deutschland. Das UN-Kaufrecht ist ausgeschlossen.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">11.3 Gerichtsstand</h3>
            <p className="text-body mb-6">
              Gerichtsstand ist – soweit gesetzlich zulässig – der Sitz von SLT in Krefeld. Bei Verträgen mit Verbrauchern gelten die gesetzlichen Gerichtsstände nach § 29 BGB.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">11.4 Einweisung</h3>
            <p className="text-body mb-6">
              Eine Einweisung in die Bedienung und Handhabung der Mietgegenstände wird nach Maßgabe der Verfügbarkeit durchgeführt.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">11.5 Auftragsbestätigung</h3>
            <p className="text-body mb-6">
              Auftragsbestätigungen werden dem Mieter übermittelt und sollten geprüft werden. Das Schreiben gilt mit oder ohne Unterschrift als wirksam.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">11.6 Nebenabreden und Änderungen</h3>
            <p className="text-body mb-6">
              Nebenabreden und Änderungen dieser AGB sowie des Mietvertrags bedürfen der Schriftform. Das gilt auch für die Aufhebung dieses Schriftformerfordernisses.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">11.7 Salvatorische Klausel</h3>
            <p className="text-body">
              Sollten einzelne Bestimmungen dieser AGB ganz oder teilweise unwirksam sein oder werden, berührt dies nicht die Gültigkeit der übrigen Bestimmungen. Die unwirksame Bestimmung wird durch eine wirksame Regelung ersetzt, die dem wirtschaftlichen Zweck am nächsten kommt.
            </p>
          </section>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-border">
            <p className="text-body font-semibold mb-2">Gültig ab: Januar 2026</p>
            <p className="text-body mb-4">Ort: Krefeld</p>
            <p className="text-body font-semibold">
              SLT Technology Group GmbH & Co. KG – eingetragene Marke SLT-Rental
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
