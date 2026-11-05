# Mitarbeiterprüfung – 5. November 2026

## Ergebnis
Keine vollständige Freigabe. Die Fortsetzung mit dem bestehenden berechtigten Admin-Konto ist erfolgt; fehlender Mitarbeiterzugang ist für dieses Konto kein Hindernis mehr. Es wurden keine Rollen geändert, keine tatsächlichen Zahlungen ausgelöst und keine finalen Rechnungen verschickt.

## Fortsetzung ab 10:59 UTC – Ergebnis dieses Prüfschritts

### Behoben und nachgeprüft
- Zusatzüberweisungen: aus der Mitarbeiteransicht entfernt; Erstellen, Freigeben und Abschließen auch serverseitig gesperrt. Historische Nachweise bleiben erhalten; es existierten keine Zusatzanträge.
- Kautionsabrechnung: serverseitig und in der Maske 500 € Kaution plus 123,76 € Mietguthaben statt 623,76 € Kaution. Kautionsauszahlung bleibt 500 €; Mietguthaben bleibt für die Rechnung. Bei explizit 0 € Kaution wird keine erfunden. Fehlende historische Kautionswerte behalten die historische Zuordnung; alte Abrechnungen werden nicht umgeschrieben.
- Der Testauftrag wurde mit bestehendem berechtigtem Mitarbeiterkonto geöffnet; die echte Maske zeigt 500 € / 123,76 € getrennt und wählt passend zum Bankeingang Überweisung statt Bar.
- Die echte Rechnungsvorschau wurde nach Veröffentlichung der Rechnungsfunktion neu erzeugt, als PDF geöffnet und gelesen: 556,92 € Rechnung, 680,68 € angerechnete Mietzahlungen, 123,76 € Mietguthaben, 500 € Kaution separat. Du-Anrede durchgehend im geprüften Rechnungs-PDF. Kein finaler Versand.
- Schlussrechnungen verwenden gespeicherte Zahlungseingänge statt im Browser gekürzter Entwurfswerte; getrennt gebuchte Kaution wird nicht doppelt entfernt.
- Gemeinsamer Erstattungsschutz auf ursprünglicher Zahlungs-ID: Kautions- und Rechnungskorrekturansprüche werden beim Schreiben gemeinsam serialisiert; aktive Einzelaufteilungen zählen selbst dann, wenn ein Gesamtstatus fehlerhaft ist. Eigentümerzuordnung und unveränderliche Anspruchsbeträge werden geprüft.
- Kautions-Erstattungsauftrag hat eine gespeicherte eindeutige Kennung; Timeout löscht den Anspruch nicht. Wiederaufnahme verwendet denselben Auftrag; ungeklärte ältere Versuche werden nicht blind erneut ausgelöst. Kundenmailfehler löschen keine Zahlungsnachweise.
- Erstattungsstatus prüft Identität und Betrag; erfolgreiche Erstattung wird durch verspätetes „pending“ nicht zurückgesetzt. Früh eingehende Kautionsmeldungen finden den bereits reservierten Anspruch über die Kennung.
- Miet-Rechnungskorrekturen prüfen Test-/Livemodus; ältere ungeklärte Ansprüche bleiben gesperrt.

### Prüfbelege
- 46 Tests in acht Dateien bestanden: reale PostgreSQL-Rechenregeln in isolierter Testdatenbank, gemeinsame Erstattungsgrenze, Doppelansprüche, Statusidentität, Kautionsrechnung, Vorschau und AB-Versandvoraussetzungen.
- Sechs PDF-Prüfungen bestanden; getrennte Beträge zusätzlich aus PDF-Text und echter Mitarbeiter-Rechnungsvorschau bestätigt.
- Drei geänderte Funktionen geprüft und eingespielt: Rechnungen, Mitarbeiterzahlungen und Stripe-Meldungen. Anwendung zuletzt ohne Buildfehler.
- Eingespielte Regeln anschließend lesend in der Datenbank bestätigt.
- Testauftrag nach der Vorschau weiterhin **0 Rechnungen und 0 Kautionsabrechnungen**; kein Geld bewegt und keine Kundennachweise umgeschrieben.

### Noch keine Freigabe
Dieser Schritt verifiziert die korrigierte Maske und Rechnungsvorschau, aber **nicht** den vollständigen Rückgabe-/Auszahlungsabschluss. Der gemeinsame Schutz wurde in isolierten Datenbanktests geprüft, nicht durch konkurrierende echte Provideraufrufe. Aktuell verfügbare Stripe-Konfiguration ist live; sie wurde nicht für Geldtests verwendet. Sichere Testmodus-Zahlungen benötigen getrennte Testkonfiguration, ohne den produktiven Schlüssel zu ersetzen.

Offen bleiben: tatsächliche Rückgabe mit Speichern/Wiederöffnen, finale Rechnung/Korrektur und Erstattungsstatus, echte parallele/abgebrochene Stripe-Testabläufe und externe/manuelle Providererstattungen; Verkauf einschließlich separater AB-Bearbeitung; CMS-Teilspeicherung; Versicherungsaltfälle/optionale Stufen; B2B-/Schilder-Rabattdurchlauf und Aktivierung; weitere Dokumentarten. Der direkte Weg zur Auszahlung eines bereits auf der ersten Rechnung bestehenden Mietguthabens ohne Rechnungskorrektur ist noch nicht vollständig umgesetzt/abgenommen. Keine Websiteveröffentlichung und keine allgemeine Rabattaktivierung.

## Tatsächlich im laufenden Programm geprüft

Testauftrag **#96ASUG**, interner Testkunde, kein echter Kundenauftrag.

| Prüfung | Beobachtung | Ergebnis |
|---|---|---|
| Wiederöffnen nach Auftragsänderung | Gespeicherte Position hat 20 % Rabatt; erhaltene Zahlung 1.180,68 €, aktuelle Miete 556,92 €, vereinbarte Kaution 500 € | Rabatt bleibt erhalten |
| Rechnung erstellen → PDF-Vorschau | Echter Vorschauaufruf, PDF geöffnet und Text gelesen; 416 € Mietnetto + 52 € Versicherung + 88,92 € USt = 556,92 € | Rabatt übernommen |
| Versicherung in Rechnung | 5 Kalendertage, 10,40 € je Kalendertag, 52 € gesamt; Selbstbehalt 1.500 € sichtbar; optionale Reduzierung nicht berechnet | Diese gespeicherte Position korrekt |
| Guthaben in Rechnung | PDF nennt 623,76 € Guthaben; Kaution 500 € zusätzlich erwähnt, aber Mietguthaben 123,76 € nicht separat zugeordnet | Nicht freigabefähig |
| Kautionsabrechnung öffnen | Maske bezeichnet 623,76 € als vorhandene Kaution; voreingestellte Auszahlung ist Bar, obwohl Eingang Banküberweisung | Trennung und Zahlungsweg prüfen/korrigieren; nicht abgeschlossen |
| Kundenakte über direkten Link | Richtige Testkundenakte öffnet | Bestanden |
| Angebot per Klick öffnen | Gespeichertes Angebots-PDF, HTTP 200, echte PDF-Datei | Bestanden |
| AB per Klick öffnen | Gespeicherte AB-M-2026-11-0031-A1, HTTP 200, echte PDF-Datei | Bestanden |
| Rückgabe ohne Übergabe | Weiter ist gesperrt, bis Hinweis bestätigt wurde; danach Rückgabemaske erreichbar | Bestanden |
| Unvollständige Rückgabe | Abschluss gesperrt, solange Zustand und Unterschriften fehlen | Bestanden; kein Abschluss erzeugt |
| Verkaufsanfragen | Mitarbeiterliste und manuelle Anfragemaske erreichbar | Nur Einstieg geprüft, kein Verkaufsauftrag angelegt |

Zusätzlicher Befund: Die Rechnungsvorschau verwendet Sie-Form, obwohl am Testkunden Du gespeichert ist. Keine Behauptung, dass die Rechnungsanrede bereits korrekt ist.

## Einzeltests

47 Tests in neun Testdateien bestanden: Kautionsberechnung, Rechnungssperren, Rechnungs-Korrekturerstattungen, Neuberechnung des Bankrabatts, Dokumentliste und Öffnen, Versicherungseditor, AB-Vorschau sowie Verkaufsformular. Diese Tests ersetzen keinen tatsächlichen Zahlungslauf.

## Noch nicht vollständig geprüft oder umgesetzt

- Kaution 500 € und Mietguthaben 123,76 € sind in Maske und Rechnungsvorschau getrennt; Auszahlung beider Teilbeträge noch Ende zu Ende abnehmen.
- Erstattungssaldo gemeinsam und atomar schützen: bereits abgeschlossene und ausstehende Kautions- sowie Mieterstattungen müssen gegen dieselbe ursprüngliche Stripe-Gesamtzahlung zählen. Codeprüfung findet getrennte Reservierungs-/Prüfschritte; konkurrierende Aufrufe sind noch nicht zuverlässig durch einen gemeinsamen Anspruch abgesichert. Keine tatsächliche Übererstattung reproduziert.
- Zusatzüberweisungsweg wurde eingestellt; historische Nachweise bleiben erhalten.
- Rückgabe vollständig abschließen, Kautionsabrechnung speichern/wieder öffnen, finale Rechnung/Korrektur und Erstattungsstatus bis zum Ende prüfen – erst nach Korrektur der genannten Fehler.
- Tatsächlicher Stripe-Testlauf einschließlich Teil-/Mehrfacherstattung und Abbruch/Parallelität. Der bestehende Testauftrag hat nur einen verbuchten Bankeingang, keine bezahlte Stripe-Transaktion; er belegt keinen Stripe-Erfolg. Kein echtes Kundengeld für Tests verwenden.
- Verkaufsangebot bis Annahme, AB-Bearbeitung und Rechnung prüfen; der Mietänderungspfad belegt die Verkaufs-AB-Bearbeitung nicht.
- CMS-Speichern/Wiederöffnen sowie Fehler zwischen Artikel- und Standortpreis-Speicherung prüfen, ohne produktive Artikelfakten für Tests zu verändern.
- Versicherungsänderung speichern/wieder öffnen, Altpauschalen und optionale Stufen vollständig prüfen.
- Überweisungsrabatt in separaten B2B-Belegen und Schilderabschluss sowie Zahlungsabbrüche vollständig prüfen; allgemeine Aktivierung bleibt offen.
- Weitere Dokumentarten (Rechnung, Gutschrift, Protokolle, B2B-Dokumente) tatsächlich anklicken, sobald passende freigegebene Testbelege vorliegen. Zwei vorhandene Miet-PDFs beweisen nicht alle Dokumentarten.

Ralfs Angebotsauswertung folgt gemäß Auftrag nach dem vollständigen Prüfbericht. Dieser Zwischenbericht ist keine Veröffentlichungsfreigabe.