# Mitarbeiterprüfung – 5. November 2026

## Ergebnis
Keine vollständige Freigabe. Die Fortsetzung mit dem bestehenden berechtigten Admin-Konto ist erfolgt; fehlender Mitarbeiterzugang ist für dieses Konto kein Hindernis mehr. Es wurden keine Rollen geändert, keine tatsächlichen Zahlungen ausgelöst und keine finalen Rechnungen verschickt.

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

- Kaution 500 € und Mietguthaben 123,76 € separat in Abrechnung, Rechnung und Auszahlung ausweisen.
- Erstattungssaldo gemeinsam und atomar schützen: bereits abgeschlossene und ausstehende Kautions- sowie Mieterstattungen müssen gegen dieselbe ursprüngliche Stripe-Gesamtzahlung zählen. Codeprüfung findet getrennte Reservierungs-/Prüfschritte; konkurrierende Aufrufe sind noch nicht zuverlässig durch einen gemeinsamen Anspruch abgesichert. Keine tatsächliche Übererstattung reproduziert.
- Den nach Missverständnis eingeführten separaten Zusatzüberweisungsweg zurücknehmen; er ist weiterhin erreichbar.
- Rückgabe vollständig abschließen, Kautionsabrechnung speichern/wieder öffnen, finale Rechnung/Korrektur und Erstattungsstatus bis zum Ende prüfen – erst nach Korrektur der genannten Fehler.
- Tatsächlicher Stripe-Testlauf einschließlich Teil-/Mehrfacherstattung und Abbruch/Parallelität. Der bestehende Testauftrag hat nur einen verbuchten Bankeingang, keine bezahlte Stripe-Transaktion; er belegt keinen Stripe-Erfolg. Kein echtes Kundengeld für Tests verwenden.
- Verkaufsangebot bis Annahme, AB-Bearbeitung und Rechnung prüfen; der Mietänderungspfad belegt die Verkaufs-AB-Bearbeitung nicht.
- CMS-Speichern/Wiederöffnen sowie Fehler zwischen Artikel- und Standortpreis-Speicherung prüfen, ohne produktive Artikelfakten für Tests zu verändern.
- Versicherungsänderung speichern/wieder öffnen, Altpauschalen und optionale Stufen vollständig prüfen.
- Überweisungsrabatt in separaten B2B-Belegen und Schilderabschluss sowie Zahlungsabbrüche vollständig prüfen; allgemeine Aktivierung bleibt offen.
- Weitere Dokumentarten (Rechnung, Gutschrift, Protokolle, B2B-Dokumente) tatsächlich anklicken, sobald passende freigegebene Testbelege vorliegen. Zwei vorhandene Miet-PDFs beweisen nicht alle Dokumentarten.

Ralfs Angebotsauswertung folgt gemäß Auftrag nach dem vollständigen Prüfbericht. Dieser Zwischenbericht ist keine Veröffentlichungsfreigabe.