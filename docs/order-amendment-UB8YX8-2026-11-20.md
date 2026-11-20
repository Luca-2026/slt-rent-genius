# AB-Änderung #UB8YX8

## Befund
- Gespeicherter Auftrag: Mietende 20.11.2026; unverändert seit Übergabe/AB am Morgen.
- Gemeinsamer Änderungsentwurf von Benedikt Nöchel vom 20.11.2026, 16:23 UTC: Mietende 23.11.17:00, Rückholung 24.11.10:00, 2 manuelle Miettage, Personenkorb. Kein bestätigter Auftragsspeicherlauf nachweisbar.
- Die Vereinbarungsnotiz war leer. Vor der Korrektur fordert die echte Vorschau eine Notiz (HTTP 400); nach Eingabe erfolgreich (200). Notiz und Vereinbarungszeit wurden bisher weder gespeichert noch wiederhergestellt. Daher gingen diese Voraussetzungen beim Wiederöffnen verloren.

## Korrektur
- Vereinbarungsnotiz/-zeit im selben Entwurf wie Positionen speichern und aus lokalen/kollegialen Entwürfen wiederherstellen.
- Erste tatsächliche Eingabe schreibt auch dann einen Server-Entwurf, wenn der anfängliche Verzögerungslauf noch nicht stattgefunden hat.
- Fehlende Vereinbarungsangaben werden vor der Vorschau erklärt; Pflichtnachweis, Vorschaupflicht und geschützte Auftragsspeicherung bleiben erhalten.
- Erfolgreiche Abschlüsse deaktivieren verzögerte Entwurfsschreibvorgänge.

## Prüfung und Grenzen
- 36 Tests: lokaler/Server-Notizrestore, erste Entwurfssicherung, fehlende Vereinbarung, bestehende Miet-/Verkaufs-, Rabatt- und DB-Änderungsregeln.
- Echter Luca-Zugang: vorhandenen Entwurf geöffnet; AB-PDF-Vorschau 200 mit Mietende 23.11., Rückholung 24.11., 2 Miettagen und 985,92 € brutto; Vereinbarungsnotiz nach Neuladen wiederhergestellt, mobile Ansicht 402 px ohne horizontalen Überlauf.
- Produktive Server-Entwurfsschreibvorgänge während der Nachprüfung abgefangen, lokale Wiederherstellung real geprüft. Benedikts Server-Entwurf unverändert zurückgelesen.
- Kein produktiver Auftragsabschluss, kein Mailversand, keine Preis-/Zahlungs-/Originalbelegänderung. Finale Speicherung/Versand nicht Ende zu Ende geprüft; Oberfläche nicht veröffentlicht. Tatsächlichen Verlängerungstermin beim Nutzer angefragt, keine Termine auf Verdacht übernommen.