import { ScrollArea } from "@/components/ui/scroll-area";

export function AGBScrollableText() {
  return (
    <ScrollArea className="h-64 border border-border rounded-lg p-4 bg-muted/30 text-sm text-muted-foreground leading-relaxed">
      <div className="space-y-4 pr-4">
        <p className="font-semibold text-foreground">
          Allgemeine Geschäfts- und Vermietbedingungen der SLT Technology Group GmbH & Co. KG
          und der eingetragenen Marke „SLT-Rental" – Stand: Januar 2026
        </p>

        {/* I */}
        <div>
          <p className="font-semibold text-foreground mb-1">I. Geltungsbereich und Vertragspartner</p>
          <p>
            Für sämtliche Mietverträge zwischen SLT Technology Group GmbH & Co. KG („SLT") und dem Mieter gelten
            ausschließlich diese Allgemeinen Geschäfts- und Vermietbedingungen (im Folgenden „AGB"). Entgegenstehende
            Geschäftsbedingungen des Mieters werden nicht anerkannt, es sei denn, SLT stimmt deren Geltung ausdrücklich
            und schriftlich zu.
          </p>
          <p>
            Ergänzungen oder Abweichungen von diesen AGB bedürfen der Schriftform. Die Vertragssprache ist deutsch.
          </p>
          <p>
            Sollten einzelne Bestimmungen dieser AGB unwirksam sein, berührt dies nicht die Wirksamkeit der übrigen
            Bestimmungen. Die unwirksame Bestimmung wird durch eine solche ersetzt, die dem wirtschaftlichen Zweck am
            nächsten kommt.
          </p>
        </div>

        {/* II */}
        <div>
          <p className="font-semibold text-foreground mb-1">II. Vertragsgegenstand und Vertragsschluss</p>
          <p><strong>2.1 Mietgegenstände:</strong> SLT vermietet Baumaschinen, Baustelleninfrastruktur, Anhänger, Kraftfahrzeuge, Party- und Eventequipment, Verkehrssicherungsmaterialien und weitere Ausrüstungen.</p>
          <p><strong>2.2 Mietanfrage:</strong> Mietanfragen können über das Kontaktformular, per E-Mail oder telefonisch gestellt werden. Der Vertrag kommt erst mit schriftlicher Bestätigung durch SLT zustande.</p>
          <p><strong>2.3 Identitätsnachweis:</strong> SLT ist berechtigt, vor Übergabe die Vorlage eines gültigen Personalausweises oder Reisepasses zu verlangen.</p>
          <p><strong>2.4 Preise:</strong> Alle Preise verstehen sich als Brutto-Endpreise inklusive der gesetzlichen Mehrwertsteuer, sofern nicht anders ausgewiesen.</p>
          <p><strong>2.5 Mietzinsfälligkeit:</strong> Mit Beginn der Mietzeit entsteht der Anspruch auf Zahlung des vollständigen Mietzinses.</p>
          <p><strong>2.6 Kaution:</strong> SLT ist berechtigt, für bestimmte Mietartikel eine Kaution zu verlangen. Die Kautionshöhe wird im Angebot oder Buchungsprozess ausgewiesen.</p>
          <p><strong>2.7 Vermietung an Dritte:</strong> Eine Weitergabe an Dritte sowie Ausfuhr aus Deutschland ist ohne schriftliche Genehmigung untersagt.</p>
          <p><strong>2.8 Haftungsreduzierung:</strong> Eine Haftungsreduzierung und/oder Versicherung kann im Buchungsprozess optional vereinbart werden.</p>
          <p><strong>2.9 Transportleistungen:</strong> Transportleistungen können gegen gesonderte Vergütung vereinbart werden.</p>
          <p><strong>2.10 Barzahlungen:</strong> Barzahlungen über 1.000 EUR werden mit 3 % Aufgeld versehen.</p>
          <p><strong>2.11 Verzugszinsen:</strong> Bei Zahlungsverzug gelten für Verbraucher 5 Prozentpunkte, für Unternehmer 9 Prozentpunkte über dem Basiszinssatz.</p>
        </div>

        {/* III */}
        <div>
          <p className="font-semibold text-foreground mb-1">III. Übergabe, Rückgabe und Zustand der Mietsache</p>
          <p><strong>3.1 Übergabeort:</strong> Die Übergabe erfolgt an einem der Geschäftssitze von SLT (Krefeld, Bonn oder Mülheim an der Ruhr).</p>
          <p><strong>3.1a Kontaktlose Übergabe:</strong> Anhänger können mittels Code-System kontaktlos übergeben werden.</p>
          <p><strong>3.2 Zustandsprüfung:</strong> Bei Übergabe hat der Mieter Zustand, Vollständigkeit und Funktion zu prüfen.</p>
          <p><strong>3.3 Pflichten des Mieters:</strong> Der Mieter ist verpflichtet, die Mietsache pfleglich und bestimmungsgemäß zu behandeln.</p>
          <p><strong>3.4 Meldepflicht:</strong> Schäden sind SLT unverzüglich, spätestens innerhalb von 24 Stunden, schriftlich anzuzeigen.</p>
          <p><strong>3.5 Rückgabe:</strong> Die Rückgabe hat zum vereinbarten Zeitpunkt in ordnungsgemäßem, vollständigem und sauberem Zustand zu erfolgen.</p>
          <p><strong>3.6 Reinigung:</strong> Anhänger besenrein, Baumaschinen vollgetankt/vollgeladen, Zelte trocken und sortiert.</p>
          <p><strong>3.7 Rückgabebestätigung:</strong> Die Rückgabe wird mit Abschlussprotokoll dokumentiert.</p>
          <p><strong>3.8 Anlagen:</strong> Anlagen (Stücklisten, Übergabeprotokolle etc.) werden Vertragsbestandteil.</p>
          <p><strong>3.9 Be- und Entladung:</strong> Bei Selbstabholung ist der Mieter für Be-/Entladung und Ladungssicherung verantwortlich.</p>
        </div>

        {/* IV */}
        <div>
          <p className="font-semibold text-foreground mb-1">IV. Mietzeit, Mietende und verspätete Rückgabe</p>
          <p><strong>4.1 Mietdauer:</strong> Mietzeit und Rückgabezeiten ergeben sich aus dem Mietvertrag oder der Buchungsbestätigung.</p>
          <p><strong>4.2 Mietpreisberechnung:</strong> 24 Stunden/Tag, 8 Betriebsstunden/Tag. Jede angefangene Stunde wird als volle Stunde berechnet.</p>
          <p><strong>4.3 Freimeldung:</strong> Der Mieter muss das Mietende rechtzeitig schriftlich per E-Mail anzeigen.</p>
          <p><strong>4.4 Verspätete Rückgabe:</strong> Zuschlag von 50 % des Bruttomietpreises pro verspätetem Tag.</p>
          <p><strong>4.5 Zusätzliche Gebühren:</strong> Bußgelder, Mautkosten, Bearbeitungspauschalen und Reinigungskosten werden gesondert berechnet.</p>
        </div>

        {/* V */}
        <div>
          <p className="font-semibold text-foreground mb-1">V. Haftung von SLT, Mängel, Rechte des Mieters</p>
          <p><strong>5.1 Haftungsbeschränkung:</strong> SLT haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit. Für leichte Fahrlässigkeit nur bei Verletzung wesentlicher Vertragspflichten.</p>
          <p><strong>5.2 Mängelrüge:</strong> Mängel sind unverzüglich, spätestens innerhalb von 24 Stunden, schriftlich anzuzeigen.</p>
        </div>

        {/* VI */}
        <div>
          <p className="font-semibold text-foreground mb-1">VI. Rücktritt und Stornierung durch den Mieter</p>
          <p><strong>6.1 Stornierungsrecht:</strong> Stornierung vor Mietbeginn jederzeit durch schriftliche Erklärung möglich.</p>
          <p><strong>6.2 Stornogebühren:</strong> Bis 20 Tage: 30 %, bis 7 Tage: 50 %, bis 3 Tage: 70 %, bis 48 Stunden: 90 %, danach: 100 %.</p>
          <p><strong>6.3 Nachweisvorbehalt:</strong> Dem Mieter bleibt der Nachweis eines geringeren Schadens vorbehalten.</p>
          <p><strong>6.4 Kostenfreie Stornierung:</strong> Mit Option „Kostenfreie Stornierung" bis 72 Stunden vor Mietbeginn ohne Gebühren.</p>
          <p><strong>6.5 Gesetzliche Rechte:</strong> Gesetzliche Rücktritts- und Gewährleistungsrechte bleiben unberührt.</p>
        </div>

        {/* VII */}
        <div>
          <p className="font-semibold text-foreground mb-1">VII. Pflichten und Haftung des Mieters</p>
          <p><strong>7.1 Vorschriften:</strong> Der Mieter verpflichtet sich, alle geltenden gesetzlichen Vorschriften einzuhalten.</p>
          <p><strong>7.2 Versicherung:</strong> Die Versicherung der Mietsache obliegt dem Mieter, sofern keine Versicherung über SLT abgeschlossen wurde.</p>
          <p><strong>7.3 Unfallmeldung:</strong> Bei Unfällen unverzüglich Polizei und SLT verständigen und Schadensprotokoll vorlegen.</p>
          <p><strong>7.4 Drittnutzung:</strong> Nutzung durch Dritte und Auslandsfahrten nur nach vorheriger schriftlicher Genehmigung.</p>
          <p><strong>7.5 Schlüssel:</strong> Schlüssel und Zubehör sind sorgfältig zu verwahren und bei Rückgabe vollständig zu übergeben.</p>
          <p><strong>7.6 Personal:</strong> Wartezeiten werden mit 139,00 EUR brutto pro Stunde berechnet.</p>
          <p><strong>7.7 Maschinenversicherung:</strong> Selbstbeteiligungen je Schadensfall gemäß Angebot.</p>
          <p><strong>7.8 GPS-Ortung:</strong> Mietgeräte können mit GPS-Ortungssystem ausgestattet sein (Art. 6 Abs. 1 lit. f DSGVO).</p>
        </div>

        {/* VIII */}
        <div>
          <p className="font-semibold text-foreground mb-1">VIII. Aufbau, Service und Transport</p>
          <p><strong>8.1 Aufbauort:</strong> Der Mieter ist verpflichtet, einen geeigneten, freien und zugänglichen Aufbauort bereitzustellen.</p>
          <p><strong>8.2 Verzögerungen:</strong> Mehraufwand durch fehlende Zugänglichkeit oder Wartezeiten trägt der Mieter.</p>
          <p><strong>8.3 Unvorhergesehene Arbeiten:</strong> Werden nach Lohn- und Materialnachweis gesondert berechnet.</p>
          <p><strong>8.4 Reisekosten:</strong> Reise- und Übernachtungskosten von SLT-Mitarbeitern werden gesondert berechnet.</p>
        </div>

        {/* IX */}
        <div>
          <p className="font-semibold text-foreground mb-1">IX. Besondere Bedingungen für Verkehrssicherung</p>
          <p><strong>9.1–9.7:</strong> Spezielle Regelungen für Verkehrssicherungsmaterialien, Kontrollen, Batteriewechsel und behördliche Auflagen.</p>
        </div>

        {/* X */}
        <div>
          <p className="font-semibold text-foreground mb-1">X. Besondere Bedingungen für Kraftfahrzeuge</p>
          <p><strong>10.1 Haftpflicht:</strong> Kfz-Haftpflichtversicherung mit max. 100 Mio. EUR Deckung.</p>
          <p><strong>10.2 Vollkasko:</strong> Optional mit vereinbarter Selbstbeteiligung abschließbar.</p>
          <p><strong>10.3 Ausfall:</strong> Bei Vorsatz oder grober Fahrlässigkeit kann Versicherungsschutz entfallen.</p>
          <p><strong>10.4 Ohne Vollkasko:</strong> Mieter haftet bis zum Wiederbeschaffungswert.</p>
          <p><strong>10.5 Bearbeitungsentgelt:</strong> Für behördliche Auskunftsanfragen kann ein Bearbeitungsentgelt erhoben werden.</p>
        </div>

        {/* XI */}
        <div>
          <p className="font-semibold text-foreground mb-1">XI. Datenschutz, Gerichtsstand und Schlussbestimmungen</p>
          <p><strong>11.1 Datenschutz:</strong> Es gilt die Datenschutzerklärung von SLT unter www.slt-rental.de/datenschutz.</p>
          <p><strong>11.2 Anwendbares Recht:</strong> Es gilt das Recht der Bundesrepublik Deutschland. UN-Kaufrecht ist ausgeschlossen.</p>
          <p><strong>11.3 Gerichtsstand:</strong> Gerichtsstand ist Krefeld.</p>
          <p><strong>11.4 Einweisung:</strong> Einweisung in Mietgegenstände nach Verfügbarkeit.</p>
          <p><strong>11.5 Auftragsbestätigung:</strong> Gilt mit oder ohne Unterschrift als wirksam.</p>
          <p><strong>11.6 Nebenabreden:</strong> Nebenabreden und Änderungen bedürfen der Schriftform.</p>
          <p><strong>11.7 Salvatorische Klausel:</strong> Unwirksamkeit einzelner Bestimmungen berührt nicht die Gültigkeit der übrigen.</p>
        </div>

        <p className="text-xs text-muted-foreground mt-4 pt-2 border-t border-border">
          Stand: Januar 2026 · SLT Technology Group GmbH & Co. KG · Krefeld
        </p>
      </div>
    </ScrollArea>
  );
}
