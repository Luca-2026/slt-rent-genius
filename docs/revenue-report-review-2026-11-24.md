# Standortbezogene Umsatz- und Angebotsauswertung – Abnahme 24.11.2026

## Ergebnis
- Die vorhandene Auswertung und die Startseite nutzen dieselbe geschützte serverseitige Rechnung.
- Drei unabhängige Stufen: nachweislich versendete Angebote, tatsächlich angenommene Angebote, fakturierter Nettoumsatz.
- Tag, Montag–Sonntag-Woche, Monat, Quartal, Jahr und freie Zeiträume; aktuelle Perioden bis heute, Berliner Kalendertage.
- Miete/Verkauf getrennt und gemeinsam; Kategorien, Artikel, Kundengruppen, CSV, Seitenwechsel, Belegöffnung und Vorgangslinks.
- Ralf als aktiver Niederlassungsleiter ausschließlich Bonn. Luca und Benedikt als Admins Bonn, Krefeld einschließlich Mülheim an der Ruhr oder zusammen.
- Kein Deckungsbeitrag, Bonus oder Zielvergleich; kein Import externer Rentware-Umsätze. Einkaufsdaten, Gemeinkosten, Preise und Originalbelege unverändert.

## Fachliche Behandlung
- Versand braucht den bestätigten Link-Versand oder einen im tatsächlichen Versandablauf gesetzten Erfolg. Der frühe Zeitstempel `offer_sent_at` reicht nicht.
- Gleiche Fassung erneut versendet: kein zusätzlicher Wert. Geänderte Fassung: Wertdifferenz, nicht ein zweites vollständiges Angebot.
- Annahme bleibt nach Fakturierung/Erledigung erhalten. Unveränderliche Auftragsrevisionen buchen nur ihre Differenz zum Vorgänger am Vereinbarungsdatum; belegtes Mietstorno mindert am Stornotag.
- Rechnung nach Rechnungsdatum; Entwürfe/Kautionen ausgeschlossen. Gutschrift negativ am eigenen Datum. Abschlag plus Schlussrechnung mit bereits abgezogenen Abschlägen; kein zusätzlicher Abzug von `credited_amount`.
- Unbekannte historische Beträge bleiben NULL und werden nicht aus Brutto mit pauschal 19 Prozent geschätzt. Unbelegte Artikelaufteilungen gehen nicht in Kategorie-/Artikelsummen ein.
- Historische PDF-Adressen werden nach Angebotsfassung gespeichert. Ist keine passende alte PDF belegt, erscheint ein Fehler statt einer neueren Fassung.
- Beleg-Geldwerte sind unveränderliche Nachweise; Rechnungspositionsaufteilungen werden während der Belegerstellung ergänzt. Statusänderungen ändern keinen historischen Geldwert.

## Zahlennachweis aus echten Belegen
Zeitraum 01.–24.11.2026, fakturierter Nettoumsatz:

| Organisatorischer Standort | Miete | Verkauf | Gesamt | Belege |
|---|---:|---:|---:|---:|
| Bonn | 4.251,28 € | 0,00 € | 4.251,28 € | 13 |
| Krefeld einschließlich Mülheim an der Ruhr | 12.640,59 € | 7.856,72 € | 20.497,31 € | 44 |
| Zusammen | 16.891,87 € | 7.856,72 € | 24.748,59 € | 57 |

- Direkter Rechnungsabgleich: Krefeld-Miete 12.495,59 € plus Mülheim-Miete 145,00 €; Bonn 4.251,28 €, Verkauf Krefeld 7.856,72 €.
- Keine ausgestellte Anfragerechnung ohne Auswertungsnachweis; keine Abweichung zwischen belegtem Netto und zugehöriger Artikelaufteilung bei der Prüfung.
- Ralfs CSV: 13 Belege, ausschließlich Bonn, Summe 4.251,28 €. Kennzahl und Zeitverlauf stimmen damit überein.
- Luca/Benedikt: Summe Bonn plus Krefeld entspricht der gemeinsamen Ansicht.

## Echte Mitarbeiterprüfungen
**Luca:** angemeldete Identität bestätigt; Standorte/Geschäftsarten, Monats-CSV, echte Rechnungs-PDF, Startseite und mobile Darstellung geprüft.

**Ralf:** tatsächliche aktive Leiteridentität bestätigt; alle fünf Perioden und alle drei Stufen, Geschäftsarten, Kunden-/Datumsfilter, CSV und echte Rechnungs-PDF. Keine Standortwahl. Alle ausgegebenen Belege und Optionen Bonn-only. Manipulierte Krefeld-Abfrage liefert Berechtigungsfehler 42501; direkte Ereignisabfrage enthält keine fremden Standorte. Startseite ausschließlich Bonn.

**Benedikt:** tatsächliche Identität bestätigt; beide Standorte einzeln/zusammen und exakter Zahlennachweis oben; leeres Jahr/Monat und ungültige Datumsfolge unterscheiden sich sichtbar; Angebots-Seitenwechsel und Reload erhalten den Seitenzustand. Startseite wählt den eigenen dokumentierten Standort Krefeld vor.

## Automatisierte Prüfung
57 Tests in sechs Dateien bestanden; aktuelle automatische Vorschauprüfung ohne Fehler. Selektive Tests: `revenueReport`, `revenueReportsDb`, `revenueAnalytics`, `dashboardMetrics`, `creditAssessment`, `portalWebsiteLink`.

Abgedeckt: Rollen/aktive Standorte, anonyme und fremde Zugriffe, verweigerte Schreib-/Capture-Zugriffe, eigene und fremde PDFs, Mitternacht Berlin, Kalenderwechsel, fünf Zeiträume, Parameter/CSV, Versand/Neuversand, Miet-/Verkaufsrevisionen, Annahme trotz Erledigung, Storno, Abschlag/Schlussrechnung/Gutschrift, 1005-Beleg-Paginierung, versionsgenaue alte PDFs und unbekannte historische Werte/Aufteilungen.

## Darstellung und Grenzen
- Chromium-Browser bei 360/390/430 px, 820 px Tablet und 1280 px Desktop geprüft; keine horizontale Seitenüberschreitung. Lange Kunden-/Standortnamen brechen um, Kennzahlen bleiben lesbar, Filter und Belegliste wurden bedient.
- Startseiten-Umsatzliste bewusst untereinander; Tablet-Zeilenkollision dadurch vermieden. Fehler-/Leerstandsanzeigen und ungültige Datumsfolge geprüft.
- Historische Angebotsdaten sind teilweise unvollständig: für 01.–24.11.2026 anfänglich 65 Versand- und 2 Annahmenachweise ohne eindeutig belegten Nettobetrag. Die Ansicht kennzeichnet diese Lücken; die angebotenen Summen sind daher ausdrücklich keine unbelegt vollständige Historie.
- Keine echten Kundenangebote zu Testzwecken versendet; keine produktiven Rechnungen oder Zahlungen für Statistiktests erzeugt. Schreibwege in isolierter Testdatenbank geprüft.
- Nativer iPhone-Safari, echte neue Versand-/Annahme-/Rechnungsabschlüsse in Produktion und später erst entstehende Daten bleiben ungeprüft. Oberfläche noch nicht veröffentlicht; Funktionen/Schema für die Auswertung sind bereits im gemeinsamen Cloud-Datenbestand vorhanden.
- Temporäre Browserbilder wurden geprüft, liegen aber nur unter `/tmp/browser/revenue/` und sind keine dauerhaft bereitgestellten Anlagen.