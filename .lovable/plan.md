# Eigenes Mietanfrage-System mit Kalender, Warenkorb und sofortiger Gutscheinprüfung

## Ziel und klare Abgrenzung
Für normale Websitekunden entsteht ein eigener, durchgängiger Anfrageprozess für **alle Nicht-Anhänger**. **Anhänger bleiben bei Rentware**, sofern ein gültiger Standortcode vorliegt. Ein Restcode an einer Maschine darf nicht mehr zur externen Buchung führen. Anhänger ohne gültigen Buchungsweg erhalten einen klaren Kontakt-/Anfrageweg, keine vorgetäuschte Online-Buchung.

Das eigene System erzeugt zunächst **unverbindliche Leads**, keine bestätigten Reservierungen, Zahlungen oder Gerätebelegungen. Ein Admin oder Mitarbeiter prüft die Anfrage und erstellt anschließend über den bestehenden Ablauf Angebot und Auftragsbestätigung. Echte Maschinenverfügbarkeit wird erst später eingebunden.

**Annahme für diesen Plan:** Anhänger bleiben vollständig im externen Buchungsweg; sie werden nicht gleichzeitig im eigenen Warenkorb verbindlich gebucht. Beide Warenkörbe bleiben getrennt, sehen aber konsistent aus.

## Aktueller Stand
Das Formular hat bereits Zeitraum, Menge, CMS-Preisvorschau, Optionen und zusätzliche Artikel. Entwürfe sind aber pro Hauptartikel gespeichert, nicht als gemeinsamer Warenkorb; zusätzliche Artikel besitzen keinen eigenen Zeitraum. Die Gutscheinprüfung erfordert bisher eine gespeicherte Anfrage oder ein B2B-Profil. Rentware-Einstiege entscheiden teilweise anhand von Codes statt Artikelart. Diese Grundlagen werden gezielt erweitert, nicht neu erfunden.

## 1. Zuerst: Gutschein direkt am Eingabefeld prüfen
Diese Etappe separat umsetzen und prüfen, bevor der große Umbau beginnt.

- Beim vollständigen Code und nach kurzer Eingabepause sowie beim Verlassen des Feldes eine geschützte Prüfung auslösen; keine Anfrage pro Tastendruck.
- Unmittelbare Feldzustände: **„Wird geprüft“**, **„Bitte E-Mail zur Zuordnung eingeben“**, **„Für diese Anfrage anwendbar“** oder verständlicher Fehler. Bei fehlendem Zeitraum/Artikeln zunächst Status/Kundenbindung prüfen und die konkrete Rabattberechnung später ergänzen.
- Code und Kunden-E-Mail gemeinsam prüfen. Ohne Kundenidentität darf ein Code nicht als vollständig gültig bezeichnet werden. Im neuen Ablauf liegt die E-Mail direkt beim Gutscheinfeld in der abschließenden Zusammenfassung; im bisherigen Formular ist sie bereits vorhanden.
- Bei Änderung von Code, E-Mail, Artikeln, Standort, Menge oder Zeitraum die alte Prüfung verwerfen und erneut prüfen; verspätete Antworten dürfen neue Eingaben nicht überschreiben.
- Ungültiger eingegebener Code blockiert das Absenden, bis er korrigiert oder entfernt wird. Ein leeres Gutscheinfeld blockiert nie. Bei Dienstausfall keine falsche Gültigkeit anzeigen; Anfrage ohne Code bleibt möglich.
- Prüfung zeigt den konkreten 10-%-Rabatt nur auf berechtigte Mietpositionen. Versicherung, Zubehör, Haftungsfreistellung, Stundenlohn sowie bestehende ausgeschlossene Zusatzkosten bleiben unverändert; Sonderpreise/höhere Rabatte nicht stapeln.
- **Beim Prüfen weder reservieren noch einlösen.** Vor Lead-Speicherung erneut prüfen; vor Angebotsversand erneut prüfen und wie bisher reservieren, bei Annahme atomar einlösen. Zwischenzeitliche Einlösung verständlich behandeln.

- Vorprüfung aus Code/E-Mail bestätigt keine Identität: keine fremden Daten ausgeben, falschen Code/Zuordnung gemeinsam melden; endgültige Berechtigung geschützt prüfen.

## 2. Einheitlicher Buchungsweg und Warenkorbsymbol
- Zentral festlegen, ob ein Artikel Anhänger oder Nicht-Anhänger ist: über echte Hauptkategorie/Artikelmerkmale, niemals allein über Rentware-Code oder Namenssuche.
- Artikelansichten, Kategorien, Suche, Empfehlungen und ältere Kataloge verwenden dieselbe Entscheidung.
- Nicht-Anhänger: „Jetzt mieten“ öffnet den eigenen Kalender. Anhänger: bestehender Rentware-Kalender und dessen Checkout.
- Eigener Warenkorb im gleichen sichtbaren Stil wie das bisherige Symbol: Form, Größe, Farbe, Mengenanzeige und Position vor Umsetzung am realen externen Symbol vergleichen. Symbol erhält eindeutigen Namen und eine stabile Position ohne Überlagerung von Navigation/Chat.
- Auf Anhängerseiten externes Symbol, sonst eigener Warenkorb; vorhandene eigene Positionen bleiben separat erreichbar. Keine überlappenden Symbole. Rentware nur bei Anhängerbedarf laden.
- B2B-Portal, Unterschriften und bisherige geschützte Abläufe bleiben ohne störenden Warenkorb.

## 3. Neuer Kundenablauf

### Schritt A – Zeitraum und Menge
- Monatskalender mit Abholung und Rückgabe, Datum mit Wochentag sowie Uhrzeit; Mobil kompakt und gut scrollbar, Tablet/Desktop mit mehr Kalenderfläche.
- Standortbezogene Abholzeiten verwenden; ungültige Zeitfolge auch bei gleichem Datum abweisen. Nicht verfügbare Daten nicht als „frei“ darstellen.
- Vorläufiger Hinweis: **„Verfügbarkeit wird nach deiner Anfrage bestätigt.“** Vor-Ort-Bestand und konkrete Zeitraumverfügbarkeit ausdrücklich unterscheiden.
- Bau-/Event-, Wochenend- und Nutzungstagsregeln aus dem bestehenden geprüften Preismodul übernehmen, keine neue Tageszählung erfinden. Spezialfälle wie Monatsmiete ohne Enddatum ausdrücklich darstellen und nur aktivieren, wenn der CMS-Tarif und Mindestlaufzeit unterstützt werden.

### Schritt B – Preis und Optionen
- Sobald Zeitraum und Menge feststehen, Mietpreis aus veröffentlichten CMS-Preisen am gewählten Standort berechnen. Tatsächlich gespeicherte Staffeln einschließlich manueller Werte verwenden.
- Preisaufbau: Menge × berechnete Mietdauer/Tarif, Versicherungen, gewählte Zusatzoptionen, gegebenenfalls Lieferung und Gutscheinrabatt. Kaution separat, nicht als Mietumsatz.
- Privatkunden brutto, Geschäftskunden netto mit passendem Steuerhinweis; genau eine Umrechnung. Einheit passend zum Preisschema: Miettage/Kalendertage/Monate/Stück etc.
- Ohne belastbaren CMS-Preis: **„Preis auf Anfrage“**. Bekannte Positionen als bekannte Zwischensumme zeigen, unbepreiste nicht als null Euro oder vollständigen Gesamtpreis ausgeben.
- Nur am Artikel im CMS vorhandene Versicherungen/Haftungsfreistellungen anbieten. Pflichtdeckung nicht abwählbar; alternative Stufen als eindeutige Auswahl, kombinierbare Extras als Checkboxen.
- Selbstbeteiligung, Zeitraum und Euro-Aufpreis sichtbar. Versicherungsstufen beziehen sich auf die Standardversicherung; Mietrabatte reduzieren Versicherungen nicht.

### Schritt C – In den Anfrage-Warenkorb
- Artikel mit Menge, Standort, eigenem Zeitraum und gewählten Optionen hinzufügen.
- „Weitere Artikel auswählen“ führt zurück zu den Artikelseiten; alle bisherigen Positionen bleiben erhalten.
- Derselbe Artikel kann für unterschiedliche Zeiträume als separate Position vorkommen. Nur identische Konfigurationen gezielt zusammenfassen.
- Zeitraum für weitere Artikel übernehmen können, aber jede Position unabhängig ändern. Änderungen berechnen ihre Preise/Optionen neu und lösen Gutschein-Neuprüfung aus.

### Schritt D – Zusammenfassung und Kontaktdaten
- Positionen mit Bild, Zeitraum, Menge, Mietpreis und Optionen; Bearbeiten/Entfernen jederzeit möglich. Erforderliche Angaben vor Absenden prüfen.
- Kontaktdaten, vollständige Adresse und Lieferung wie im bestehenden Anfrageprozess, ohne Registrierungszwang.
- Gutscheinprüfung direkt im Feld; Rabatt und ausgeschlossene Beträge sichtbar nachvollziehbar.
- Abschlussaktion **„Mietanfrage senden“**, nicht „Kostenpflichtig buchen“. Kein direkter Zahlungsvorgang und kein Rechnungszahlungsangebot an Privatkunden.
- Empfangsbestätigung mit Auftrags-ID, allen Positionen/Zeiträumen und Hinweis auf ausstehende Mitarbeiterbestätigung.

## 4. Zwischenspeicherung und verschiedene Zeiträume
- Gemeinsamer Website-Warenkorb über Seitenwechsel, Dialogschließen, Neuladen und weitere Artikel hinweg. Speichern bei jeder relevanten Änderung, nicht erst beim Absenden.
- Produkt, Standort, Mengen, Zeiträume und Optionsschlüssel speichern; gespeicherte Preise sind nie verbindliche Wahrheiten. Beim Öffnen/Absenden CMS-Stand neu laden, Preisänderungen zeigen.
- Keine Kontaktdaten/Codes unnötig dauerhaft speichern, keine neue willkürliche Ablauffrist; alte Zeiträume markieren. Beschädigten/gesperrten Speicher sicher abfangen und Sitzungsersatz anbieten.
- Erst nach bestätigter Lead-Speicherung gesendete Positionen entfernen. Bei Fehler bleiben sie erhalten. Mehrfachklick/Wiederholung darf keine doppelten Leads erzeugen.

## 5. Mitarbeiterseite und bestehende Abläufe
- Mehrere Positionen und unterschiedliche Zeiträume vollständig im Lead speichern und in Mitarbeiteransicht, Angebotsvorbelegung und interner Benachrichtigung anzeigen.
- Globale Start-/Enddaten nur als Zusammenfassung kennzeichnen; keine längere pauschale Belegung sämtlicher Artikel daraus ableiten. Preise, Protokolle und Verfügbarkeitsprüfung nutzen den jeweiligen Positionszeitraum.
- Bei unterschiedlichen Abhol-/Rückgabeterminen die Grenzen der heutigen Protokolle prüfen; erforderlichenfalls positionsbezogene Termine/Rückgaben ergänzen, bevor diese Funktion freigegeben wird.
- Mitarbeiter prüft Preis/Bestand und kann das bestehende Angebot erstellen. Reale Gerätezuweisung und Bestätigung ausschließlich über vorhandene geschützte Verfügbarkeits-/Bestätigungsfunktionen.
- Keine Änderungen an ausgestellten Rechnungen, angenommenen Angeboten, Kautionsabrechnungen oder echten Kundenaufträgen.

## Technische Umsetzung
- Gemeinsamer versionierter Anfrage-Warenkorb; Kalender/Optionen als kleine Schritte statt überladener Dialog. Anhängerentscheidung zentral für Artikelansichten, Suche und externe Widgets.
- Begrenzte öffentliche Serverprüfung für Preise und Gutscheine: nur veröffentlichte CMS-Produkte und erlaubte Optionsschlüssel; keine Browserpreise oder fremde Profil-IDs vertrauen. Nicht-schreibende Vorprüfung von Reservierung/Einlösung trennen.
- Bestehende Browser-/Server-Preis- und Add-on-Regeln wiederverwenden und auf Gleichheit prüfen; ältere Helfer mit Rabattbasis nicht ungeprüft übernehmen.
- `requested_items` um optionale Positionszeiträume/Standort/Optionsauswahl erweitern. Ältere Anfragen behalten ihren Gesamtzeitraum. Parser, Mitarbeiteransicht, Angebote, Belege und Protokolle nachziehen.
- Lead erneut berechnen und mit Wiederholungskennung speichern; E-Mail-Fehler erzeugen keinen zweiten Lead. Datenbankänderungen ausschließlich über den vorgesehenen Migrationsweg mit passenden Rechten; Architektur in `AGENTS.md` dokumentieren. CMS-Fakten bleiben unverändert.

## Umsetzung in freigabefähigen Etappen
1. **Gutschein-Feldprüfung:** bisheriges Formular erweitern, Fehler-/Änderungsfälle und Nicht-Einlösung testen.
2. **Buchungsgrenze und Warenkorb:** zentrale Anhängerentscheidung, globale Speicherung, Symbol, Seitenwechsel; Rentware unverändert funktionsfähig halten.
3. **Kalender, Preise und Optionen:** ein Artikel Ende zu Ende, CMS-Preisgleichheit und Pflicht-/Wahloptionen.
4. **Mehrere Artikel/Zeiträume:** Positionsbearbeitung plus vollständige Mitarbeiter-/Angebots-/Protokollkompatibilität; erst dann freigeben.
5. **Lead-Abschluss und Abnahme:** echte freigegebene Testanfrage bis Mitarbeiteransicht, Angebotsvorschau und Empfangsbestätigung; anschließend kontrolliert veröffentlichen.
6. **Später separat:** echter öffentlicher Verfügbarkeitskalender je Maschine. Nicht Teil dieser Erstumstellung; fehlende Bestandsdaten vorher bereinigen.

## Tests und Bericht pro Etappe
- Mobil 402×725 und kleiner, Tablet 768×1024 in beiden Ausrichtungen, Desktop 1280×1800: Kalender, Tastatur, Scrollen, Symbol, Dialoge und Textüberläufe.
- Warenkorb: Seitenwechsel/Reload, derselbe Artikel mit mehreren Zeiträumen, Bearbeiten/Löschen, Speicherausfall, Preisänderungen und fehlgeschlagenes Absenden.
- Preise: Staffelgrenzen, Wochenende, Berlin/DST, Mengen/Sets, Standortpreise, Event/Monatsfälle, fehlende Preise, brutto/netto und centgenaue Summen.
- Optionen/Gutscheine: Pflichtversicherung, exklusive Stufen, ausgeschlossene Beträge; falscher Code/Kunde, eingelöst/reserviert, Dienstfehler, veraltete Antworten und keine Reservierung bei Vorprüfung.
- Lead: richtige Zuordnung, Auftrags-ID und Positionszeiträume, keine Doppelanfrage oder Gerätebelegung; Anhänger bleiben extern buchbar.
- Bericht je Etappe: umgesetzt, konkret geprüft, Tests und offene Punkte. Keine produktive Anfrage/Rechnung/Buchung/Mail ohne Freigabe; Testmails nur an luca@sandhoff.org. Mitarbeiterzugang für interne Abnahme erforderlich.

**Der Plan startet keine Umsetzung oder Veröffentlichung.** Gutscheinprüfung zuerst als eigene Etappe, danach Warenkorb-Umbau.
