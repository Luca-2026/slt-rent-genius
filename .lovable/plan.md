# Eigenes Mietanfrage-System mit Kalender, Warenkorb und sofortiger Gutscheinprüfung

## Ziel und klare Abgrenzung
Eigener Anfrageprozess für **alle Nicht-Anhänger**, auch mit Restcodes. **Anhänger bleiben bei Rentware** mit gültigem Standortcode; ohne Code klarer Kontaktweg, keine vorgetäuschte Online-Buchung.

Zunächst **unverbindliche Leads**, keine Reservierung/Zahlung/Gerätebelegung. Admin oder Mitarbeiter prüft und erstellt Angebot/Auftragsbestätigung im bestehenden Ablauf. Maschinenverfügbarkeit folgt später.

**Annahme für diesen Plan:** Anhänger bleiben vollständig im externen Buchungsweg; sie werden nicht gleichzeitig im eigenen Warenkorb verbindlich gebucht. Beide Warenkörbe bleiben getrennt, sehen aber konsistent aus.

## Aktueller Stand
Vorhanden: Zeitraum, Menge, Preisvorschau, Optionen und zusätzliche Artikel. Es fehlen ein gemeinsamer Warenkorb, Positionszeiträume und öffentliche Gutscheinprüfung ohne bestehende Anfrage. Rentware wird teils noch anhand von Codes statt Artikelart aktiviert.

## 1. Zuerst: Gutschein direkt am Eingabefeld prüfen
Diese Etappe separat umsetzen und prüfen, bevor der große Umbau beginnt.

- Vollständigen Code nach kurzer Eingabepause und Feldverlassen geschützt prüfen, nicht pro Tastendruck.
- Unmittelbare Feldzustände: **„Wird geprüft“**, **„Bitte E-Mail zur Zuordnung eingeben“**, **„Für diese Anfrage anwendbar“** oder verständlicher Fehler. Bei fehlendem Zeitraum/Artikeln zunächst Status/Kundenbindung prüfen und die konkrete Rabattberechnung später ergänzen.
- Code mit Kunden-E-Mail prüfen; ohne Identität kein vollständig gültiger Status. E-Mail direkt beim Gutscheinfeld in der Zusammenfassung, bestehendes Formular nutzt sein E-Mail-Feld.
- Bei Änderungen an Code/E-Mail/Positionen Prüfung verwerfen; verspätete Antworten ignorieren.
- Ungültiger eingegebener Code blockiert das Absenden, bis er korrigiert oder entfernt wird. Ein leeres Gutscheinfeld blockiert nie. Bei Dienstausfall keine falsche Gültigkeit anzeigen; Anfrage ohne Code bleibt möglich.
- Prüfung zeigt den konkreten 10-%-Rabatt nur auf berechtigte Mietpositionen. Versicherung, Zubehör, Haftungsfreistellung, Stundenlohn sowie bestehende ausgeschlossene Zusatzkosten bleiben unverändert; Sonderpreise/höhere Rabatte nicht stapeln.
- **Beim Prüfen weder reservieren noch einlösen.** Vor Lead-Speicherung erneut prüfen; vor Angebotsversand erneut prüfen und wie bisher reservieren, bei Annahme atomar einlösen. Zwischenzeitliche Einlösung verständlich behandeln.

- Vorprüfung aus Code/E-Mail bestätigt keine Identität: keine fremden Daten ausgeben, falschen Code/Zuordnung gemeinsam melden; endgültige Berechtigung geschützt prüfen.

## 2. Einheitlicher Buchungsweg und Warenkorbsymbol
- Zentral festlegen, ob ein Artikel Anhänger oder Nicht-Anhänger ist: über echte Hauptkategorie/Artikelmerkmale, niemals allein über Rentware-Code oder Namenssuche.
- Artikelansichten, Kategorien, Suche, Empfehlungen und ältere Kataloge verwenden dieselbe Entscheidung.
- Nicht-Anhänger: „Jetzt mieten“ öffnet den eigenen Kalender. Anhänger: bestehender Rentware-Kalender und dessen Checkout.
- Eigenes Symbol in Form/Größe/Farbe/Position am realen Rentware-Symbol ausrichten, mit Mengenanzeige und zugänglichem Namen; Navigation/Chat nicht überlagern.
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
- Aufschlüsselung: Menge × Dauer/Tarif, Versicherung, Optionen, Lieferung und Rabatt. Kaution separat, kein Mietumsatz.
- Privatkunden brutto, Geschäftskunden netto mit passendem Steuerhinweis; genau eine Umrechnung. Einheit passend zum Preisschema: Miettage/Kalendertage/Monate/Stück etc.
- Ohne belastbaren CMS-Preis: **„Preis auf Anfrage“**. Bekannte Positionen als bekannte Zwischensumme zeigen, unbepreiste nicht als null Euro oder vollständigen Gesamtpreis ausgeben.
- Nur am Artikel im CMS vorhandene Versicherungen/Haftungsfreistellungen anbieten. Pflichtdeckung nicht abwählbar; alternative Stufen als eindeutige Auswahl, kombinierbare Extras als Checkboxen.
- Selbstbeteiligung, Zeitraum und Euro-Aufpreis sichtbar. Versicherungsstufen beziehen sich auf die Standardversicherung; Mietrabatte reduzieren Versicherungen nicht.

### Schritt C – Warenkorb und weitere Artikel
- Menge, Standort, eigener Zeitraum und Optionsauswahl speichern; weitere Artikel auch auf anderen Produktseiten hinzufügen.
- Derselbe Artikel mit unterschiedlichen Zeiträumen bleibt getrennt. Zeitraum übernehmen oder je Position ändern; Änderungen rechnen neu und verwerfen die Gutscheinprüfung.

### Schritt D – Zusammenfassung und Lead
- Bilder, Zeiträume, Mengen, Preise/Optionen mit Bearbeiten/Entfernen; vollständige Kontakt-/Adressdaten und Lieferung ohne Registrierungszwang.
- Gutschein direkt im Feld prüfen; Rabatt und Ausschlüsse nachvollziehbar zeigen.
- **„Mietanfrage senden“**, nicht kostenpflichtig buchen. Keine Zahlung, keine Rechnungszahlungsoption für Privatkunden. Empfangsbestätigung mit Auftrags-ID, Positionen/Zeiträumen und ausstehender Mitarbeiterbestätigung.

## 4. Speicherung und Mitarbeiterablauf
- Ein gemeinsamer Warenkorb über Seitenwechsel, Schließen und Reload; Produkt, Standort, Menge, Zeitraum und Optionsschlüssel speichern, keine verbindlichen Browserpreise. Beim Öffnen/Absenden CMS neu laden und Änderungen zeigen.
- Kontaktdaten/Codes nicht unnötig dauerhaft speichern. Keine neue willkürliche Ablauffrist; alte Zeiträume markieren. Versionierter Speicher mit sicherem Verhalten bei beschädigten/gesperrten Daten.
- Erst nach erfolgreicher Lead-Speicherung gesendete Positionen entfernen. Fehler erhalten den Warenkorb; Wiederholungen erzeugen keinen zweiten Lead.
- Alle Positionen/Zeiträume in Mitarbeiteransicht, Benachrichtigung und Angebotsvorbelegung übernehmen. Globale Daten nur Zusammenfassung: keine pauschale Belegung aller Artikel zwischen frühester Abholung und letzter Rückgabe.
- Unterschiedliche Ausgabe-/Rückgabetermine auch in Protokollen und Verfügbarkeitsprüfung unterstützen; heutige Protokollgrenzen vor Freigabe prüfen und nötige positionsbezogene Rückgaben ergänzen.
- Mitarbeiter erstellt Angebot/Bestätigung im bestehenden geschützten Ablauf. Ausgestellte Rechnungen, angenommene Angebote, Kautionen und echte Aufträge unverändert lassen.

## Technische Umsetzung
- Gemeinsamer versionierter Warenkorb und fokussierte Kalender-/Optionsschritte. Zentrale Anhängerentscheidung in Detailseiten, Kategorien, Suche und Widgets.
- Begrenzte öffentliche Serverprüfung: veröffentlichte CMS-Produkte, erlaubte Optionen und validierte Eingaben; keine Browserpreise/fremden Profil-IDs vertrauen. Gutschein-Vorprüfung nicht schreibend und getrennt von Reservierung/Einlösung.
- Vorhandene Browser-/Server-Preis- und Add-on-Regeln wiederverwenden und Gleichheit testen; ältere alternative Rabattbasis-Helfer nicht ungeprüft nutzen.
- `requested_items` um Positionszeiträume/Standort/Optionen erweitern, alte Anfragen kompatibel halten. Parser, Mitarbeiteransicht, Angebot und Protokolle nachziehen.
- Lead serverseitig erneut berechnen, mit Wiederholungskennung speichern; Mailfehler erzeugt keinen zweiten Lead. Datenbankänderungen nur über vorgesehenen Migrationsweg mit Rechten; Entscheidungen in `AGENTS.md`, CMS-Fakten unverändert.

## Reihenfolge und Freigaben
1. **Gutscheinprüfung** im bisherigen Formular separat umsetzen und testen.
2. **Buchungsgrenze/Warenkorb:** Anhängerentscheidung, Speicherung, Symbol und Seitenwechsel; externen Ablauf erhalten.
3. **Kalender/Preis/Optionen:** einen Artikel vollständig prüfen, CMS-Preisgleichheit und Pflicht-/Wahloptionen.
4. **Mehrere Artikel/Zeiträume:** Mitarbeiter-, Angebots- und Protokollkompatibilität vollständig nachziehen.
5. **Lead-Abnahme:** freigegebene echte Testanfrage bis Mitarbeiteransicht, Angebotsvorschau und Empfangsbestätigung; dann kontrolliert veröffentlichen.
6. **Später separat:** öffentliche tatsächliche Maschinenverfügbarkeit nach Bereinigung der Bestandsdaten; nicht Teil der Erstumstellung.

## Tests und Bericht pro Etappe
- Mobil 402×725 und kleiner, Tablet 768×1024 in beiden Ausrichtungen, Desktop 1280×1800: Kalender, Tastatur, Scrollen, Symbol, Dialoge und Textüberläufe.
- Warenkorb: Seitenwechsel/Reload, derselbe Artikel mit mehreren Zeiträumen, Bearbeiten/Löschen, Speicherausfall, Preisänderungen und fehlgeschlagenes Absenden.
- Preise: Staffelgrenzen, Wochenende, Berlin/DST, Mengen/Sets, Standortpreise, Event/Monatsfälle, fehlende Preise, brutto/netto und centgenaue Summen.
- Optionen/Gutscheine: Pflichtversicherung, exklusive Stufen, ausgeschlossene Beträge; falscher Code/Kunde, eingelöst/reserviert, Dienstfehler, veraltete Antworten und keine Reservierung bei Vorprüfung.
- Lead: richtige Zuordnung, Auftrags-ID und Positionszeiträume, keine Doppelanfrage oder Gerätebelegung; Anhänger bleiben extern buchbar.
- Bericht je Etappe: umgesetzt, konkret geprüft, Tests und offene Punkte. Keine produktive Anfrage/Rechnung/Buchung/Mail ohne Freigabe; Testmails nur an luca@sandhoff.org. Mitarbeiterzugang für interne Abnahme erforderlich.

**Der Plan startet keine Umsetzung oder Veröffentlichung.** Gutscheinprüfung zuerst als eigene Etappe, danach Warenkorb-Umbau.
