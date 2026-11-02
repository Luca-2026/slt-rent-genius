# Eigenes Mietanfrage-System mit Kalender, Warenkorb und sofortiger Gutscheinprüfung

## Ziel und klare Abgrenzung
Eigener Anfrageprozess für **alle Nicht-Anhänger**, auch mit Restcodes. **Anhänger bleiben bei Rentware** mit gültigem Standortcode; ohne Code klarer Kontaktweg, keine vorgetäuschte Online-Buchung.

Zunächst **unverbindliche Leads**, keine Reservierung/Zahlung/Gerätebelegung. Admin oder Mitarbeiter prüft und erstellt Angebot/Auftragsbestätigung im bestehenden Ablauf. Maschinenverfügbarkeit folgt später.

Langfristiges Ziel: ausgewählte Artikel direkt online buchbar machen; Angebote dann vorrangig für Geschäftskunden und große Projektvolumen. Das ändert heute weder Zahlungs- noch Freigaberegeln.

**Annahme für diesen Plan:** Anhänger bleiben vollständig im externen Buchungsweg; sie werden nicht gleichzeitig im eigenen Warenkorb verbindlich gebucht. Beide Warenkörbe bleiben getrennt, sehen aber konsistent aus.

## Aktueller Stand
Vorhanden: Zeitraum, Menge, Preisvorschau, Optionen und zusätzliche Artikel. Es fehlen ein gemeinsamer Warenkorb, Positionszeiträume und öffentliche Gutscheinprüfung ohne bestehende Anfrage. Rentware wird teils noch anhand von Codes statt Artikelart aktiviert.

## 1. Zuerst: Gutschein direkt am Eingabefeld prüfen
Diese Etappe zuerst separat umsetzen und prüfen.

- Vollständigen Code nach kurzer Eingabepause und Feldverlassen geschützt prüfen, nicht pro Tastendruck.
- Feldzustände: **„Wird geprüft“**, **„E-Mail erforderlich“**, **„Anwendbar“** oder Fehler. Rabattbetrag erst mit Zeitraum/Artikeln berechnen.
- Code mit Kunden-E-Mail prüfen; ohne Identität kein vollständig gültiger Status. E-Mail direkt beim Gutscheinfeld in der Zusammenfassung, bestehendes Formular nutzt sein E-Mail-Feld.
- Bei Änderungen an Code/E-Mail/Positionen Prüfung verwerfen; verspätete Antworten ignorieren.
- Ungültigen Code korrigieren/entfernen vor Absenden; leeres Feld blockiert nie. Dienstausfall nicht als gültig anzeigen, Anfrage ohne Code möglich.
- Prüfung zeigt den konkreten 10-%-Rabatt nur auf berechtigte Mietpositionen. Versicherung, Zubehör, Haftungsfreistellung, Stundenlohn sowie bestehende ausgeschlossene Zusatzkosten bleiben unverändert; Sonderpreise/höhere Rabatte nicht stapeln.
- **Beim Prüfen weder reservieren noch einlösen.** Vor Lead-Speicherung erneut prüfen; vor Angebotsversand erneut prüfen und wie bisher reservieren, bei Annahme atomar einlösen. Zwischenzeitliche Einlösung verständlich behandeln.

- Vorprüfung aus Code/E-Mail bestätigt keine Identität: keine fremden Daten ausgeben, falschen Code/Zuordnung gemeinsam melden; endgültige Berechtigung geschützt prüfen.

## 2. Einheitlicher Buchungsweg und Warenkorbsymbol
- Zentral festlegen, ob ein Artikel Anhänger oder Nicht-Anhänger ist: über echte Hauptkategorie/Artikelmerkmale, niemals allein über Rentware-Code oder Namenssuche.
- Artikelansichten, Kategorien, Suche, Empfehlungen und ältere Kataloge verwenden dieselbe Entscheidung.
- Nicht-Anhänger: „Jetzt mieten“ öffnet den eigenen Kalender. Anhänger: bestehender Rentware-Kalender und dessen Checkout.
- Kalender und komplette Strecke als **globales Pop-up**, auf jeder öffentlichen Website-Seite fortsetzbar. Warenkorbsymbol **oben rechts auch auf der Startseite**; Klick öffnet den gespeicherten Stand bis zum Lead-Abschluss. Schließen oder Zurückkehren zur Website verliert den Stand innerhalb der Frist nicht. Anhängerseiten öffnen stattdessen Rentware.
- Eigenes Symbol in Form/Größe/Farbe/Position am realen Rentware-Symbol ausrichten, mit Mengenanzeige und zugänglichem Namen; Navigation/Chat nicht überlagern.
- Auf Anhängerseiten externes Symbol, sonst eigener Warenkorb; vorhandene eigene Positionen bleiben separat erreichbar. Keine überlappenden Symbole. Rentware nur bei Anhängerbedarf laden.
- B2B-Portal, Unterschriften und bisherige geschützte Abläufe bleiben ohne störenden Warenkorb.

## 3. Neuer Kundenablauf

### Schritt A – Zeitraum und Menge
- Monatskalender mit Abholung und Rückgabe, Datum mit Wochentag sowie Uhrzeit; Mobil kompakt und gut scrollbar, Tablet/Desktop mit mehr Kalenderfläche.
- Standortbezogene Abholzeiten verwenden; ungültige Zeitfolge auch bei gleichem Datum abweisen. Nicht verfügbare Daten nicht als „frei“ darstellen.
- Vorläufiger Hinweis: **„Verfügbarkeit wird nach deiner Anfrage bestätigt.“** Vor-Ort-Bestand und konkrete Zeitraumverfügbarkeit ausdrücklich unterscheiden.
- Geprüfte Bau-/Event-/Wochenend-/Nutzungstagsregeln übernehmen. Monatsmiete ohne Enddatum nur mit passendem CMS-Tarif/Mindestlaufzeit.

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
- **15-Minuten-Frist:** startet beim ersten hinzugefügten Artikel für den gesamten Warenkorb. Sichtbare Restzeit `14:59` und Ablaufhinweis im Pop-up. Als Standard keine Verlängerung durch Tippen, Hinzufügen, Seitenwechsel oder Reload; neue Frist erst für einen neuen Warenkorb nach Leerung.
- Nach Ablauf automatisch alle ungesendeten Positionen samt Zeiträumen/Optionen und Gutscheinprüfung leeren, auch nach Rückkehr aus Hintergrund/geschlossenem Browser. Bei Wiederöffnung: „Dein Warenkorb ist abgelaufen. Bitte wähle deine Artikel erneut.“ Kontaktdaten/Codes nicht unnötig dauerhaft speichern; beschädigten/gesperrten Speicher sicher behandeln.
- Nach erfolgreicher Lead-Speicherung gesendete Positionen entfernen. Fehler erhalten sie nur bis zum Fristende; Wiederholungen erzeugen keinen zweiten Lead. Absenden und Fristablauf eindeutig koordinieren: bereits erfolgreich gespeicherte Leads nie löschen, abgelaufene Warenkörbe nicht neu absenden.
- Alle Positionen/Zeiträume in Mitarbeiteransicht, Benachrichtigung und Angebotsvorbelegung übernehmen. Globale Daten nur Zusammenfassung: keine pauschale Belegung aller Artikel zwischen frühester Abholung und letzter Rückgabe.
- Unterschiedliche Ausgabe-/Rückgabetermine auch in Protokollen und Verfügbarkeitsprüfung unterstützen; heutige Protokollgrenzen vor Freigabe prüfen und nötige positionsbezogene Rückgaben ergänzen.
- Mitarbeiter erstellt Angebot/Bestätigung im bestehenden geschützten Ablauf. Ausgestellte Rechnungen, angenommene Angebote, Kautionen und echte Aufträge unverändert lassen.

## Technische Umsetzung
- Gemeinsamer versionierter Warenkorb und fokussierte Kalender-/Optionsschritte. Zentrale Anhängerentscheidung in Detailseiten, Kategorien, Suche und Widgets.
- Begrenzte öffentliche Serverprüfung: veröffentlichte CMS-Produkte, erlaubte Optionen und validierte Eingaben; keine Browserpreise/fremden Profil-IDs vertrauen. Gutschein-Vorprüfung nicht schreibend und getrennt von Reservierung/Einlösung.
- Vorhandene Browser-/Server-Preis- und Add-on-Regeln wiederverwenden und Gleichheit testen; ältere alternative Rabattbasis-Helfer nicht ungeprüft nutzen.
- `requested_items` um Positionszeiträume/Standort/Optionen erweitern, alte Anfragen kompatibel halten. Parser, Mitarbeiteransicht, Angebot und Protokolle nachziehen.
- Lead serverseitig erneut berechnen, mit Wiederholungskennung speichern; Mailfehler erzeugt keinen zweiten Lead. Datenbankänderungen nur über vorgesehenen Migrationsweg mit Rechten; Entscheidungen in `AGENTS.md`, CMS-Fakten unverändert.
- Frist über einen gespeicherten absoluten Ablaufzeitpunkt berechnen, nicht über heruntergezählte Sekunden; Tabs synchronisieren. Countdown löscht keine bereits gesendeten Leads und reserviert in der jetzigen Phase keinen Bestand.

## Später: echte 15-Minuten-Reservierungen und Direktbuchung
- **Wichtig:** Heute hält ein Lead-Warenkorb keine Maschine zurück. Daher gibt seine Leerung noch keinen Bestand frei; mehrere unverbindliche Anfragen sind möglich. Keine falsche Reservierungszusage zeigen.
- Bei aktivierter Verfügbarkeit hält der Server konkrete Geräte bzw. verfügbare Mengen für die jeweiligen Mietzeiträume höchstens 15 Minuten. Gleichzeitige Zugriffe transaktional prüfen: nur tatsächlich freie Kapazität vergeben, nicht pauschal alle Anfragen desselben Artikels sperren.
- Ablauf zählt serverseitig auch bei geschlossenem Browser. Abgelaufene Haltefristen bei jeder Verfügbarkeits-/Buchungsprüfung nicht mehr berücksichtigen; Freigabe darf nicht auf einen Browser-Timer oder häufige Hintergrundabfragen angewiesen sein.
- Vor Direktbuchung gültige Haltefrist atomar in verbindliche Belegung überführen; Zahlung, Ablauf, Abbruch und Wiederholung dürfen keine Doppelbuchung oder verlorene Zahlung erzeugen. Bestehende bestätigte Belegungen schützen. Dieser Ausbauschritt braucht eigene Abnahme vor Aktivierung.

## Reihenfolge und Freigaben
1. **Gutscheinprüfung** im bisherigen Formular separat umsetzen und testen.
2. **Buchungsgrenze/Warenkorb:** Anhängerentscheidung, Speicherung, Symbol und Seitenwechsel; externen Ablauf erhalten.
3. **Kalender/Preis/Optionen:** einen Artikel vollständig prüfen, CMS-Preisgleichheit und Pflicht-/Wahloptionen.
4. **Mehrere Artikel/Zeiträume:** Mitarbeiter-, Angebots- und Protokollkompatibilität vollständig nachziehen.
5. **Lead-Abnahme:** freigegebene echte Testanfrage bis Mitarbeiteransicht, Angebotsvorschau und Empfangsbestätigung; dann kontrolliert veröffentlichen.
6. **Später separat:** tatsächliche Maschinenverfügbarkeit, serverseitige 15-Minuten-Haltefristen und anschließend Direktbuchung ausgewählter Artikel. Erst nach Bestandsbereinigung und Prüfung paralleler Zugriffe/Zahlungsabläufe aktivieren; Angebote für Geschäftskunden/große Projekte erhalten.

## Tests und Bericht pro Etappe
- Mobil 402×725 und kleiner, Tablet 768×1024 in beiden Ausrichtungen, Desktop 1280×1800: Kalender, Tastatur, Scrollen, Symbol, Dialoge und Textüberläufe.
- Warenkorb: Seitenwechsel/Reload, derselbe Artikel mit mehreren Zeiträumen, Bearbeiten/Löschen, Speicherausfall, Preisänderungen und fehlgeschlagenes Absenden.
- Timer: bei 14:59 erhalten, bei genau 15:00 leer; Reload/weitere Tabs/Hintergrund verlängern nicht. Globales Pop-up von Start-/Artikel-/Kategorieseite fortsetzen. Später zwei gleichzeitige Buchungen um das letzte Gerät testen: nur eine erhält die Kapazität, abgelaufene Haltefrist gibt sie wieder frei.
- Preise: Staffelgrenzen, Wochenende, Berlin/DST, Mengen/Sets, Standortpreise, Event/Monatsfälle, fehlende Preise, brutto/netto und centgenaue Summen.
- Optionen/Gutscheine: Pflichtversicherung, exklusive Stufen, ausgeschlossene Beträge; falscher Code/Kunde, eingelöst/reserviert, Dienstfehler, veraltete Antworten und keine Reservierung bei Vorprüfung.
- Lead: richtige Zuordnung, Auftrags-ID und Positionszeiträume, keine Doppelanfrage oder Gerätebelegung; Anhänger bleiben extern buchbar.
- Bericht je Etappe: umgesetzt, konkret geprüft, Tests und offene Punkte. Keine produktive Anfrage/Rechnung/Buchung/Mail ohne Freigabe; Testmails nur an luca@sandhoff.org. Mitarbeiterzugang für interne Abnahme erforderlich.

**Keine Umsetzung oder Veröffentlichung vor Freigabe.**
