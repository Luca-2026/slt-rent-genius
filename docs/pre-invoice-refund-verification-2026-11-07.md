# Mietguthaben vor Schlussrechnung – Prüfung 07.11.2026

## Ergebnis
- Mietguthaben kann vor der erstmaligen Schlussrechnung erstattet werden. Grundlage ist die ausdrücklich vorbereitete, serverseitig berechnete Rechnungsvorschau ohne Rechnungsnummer.
- Sobald eine Erstattung beauftragt ist, bleiben Betrag, Originalzahlungen und Abrechnungsgrundlage unveränderlich. Keine zweite Erstattung über die später ausgestellte Rechnung.
- Schlussrechnung bleibt bei offener Kautionsauszahlung oder offenem Mietguthaben gesperrt. Prüfung vor Nummernvergabe und nochmals transaktional beim Rechnungsabschluss.
- Bestätigte Mieterstattung steht auf der Rechnung mit Betrag, Datum und tatsächlichem Zahlungsweg; ursprüngliche Zahlungseingänge und steuerliche Beträge bleiben erhalten. Echte Kundennachforderungen bleiben sichtbar.
- Keine separate Erstattungs-PDF. Voraus-/Abschlagsrechnungen wurden nicht auf eine zurückzugebende Kaution umgestellt.

## Florian #C48T6Q – tatsächliche Mitarbeiteransicht
1. Bestehenden Vorgang mit Lucas bereitgestelltem Zugang geöffnet.
2. Rechnungsvorschau mit dem bestehenden 20-%-Rabatt geöffnet: 307,26 € Rechnungsbetrag gegenüber 377,23 € Mietzahlungen.
3. Erstattungsgrundlage ausdrücklich vorbereitet und zurückgelesen: 69,97 € Mietguthaben, keine ausgestellte Rechnung, kein Erstattungsauftrag angelegt.
4. Finaler Rechnungsbutton bleibt gesperrt: „Mietguthabenerstattung noch offen“.
5. In der Kautionsabrechnung „Mietguthaben / Erstattung“ geöffnet: 69,97 €, noch nicht beauftragt, Auszahlung auf ursprüngliche Zahlung möglich.
6. Keine Auszahlungsschaltfläche betätigt. Die bereits belegte Kautionserstattung von 700 € bleibt unverändert.

## Automatisierte Prüfung
68 Tests in neun Dateien erfolgreich. Darunter:
- exakte 69,97 € statt manipulierter 69,98 €;
- offene 700-€-Kaution blockiert unabhängig vom Mietguthaben;
- Erst-Rechnung kann Erstattungssperre auch durch direkten Statuswechsel nicht umgehen;
- gemeinsamer Originalzahlungsschutz für Kaution, Rechnungskorrekturen und vorgezogene Mieterstattung;
- erfolgreiche Providerbelege einschließlich pyr_-IDs notwendig;
- Bankbestätigung erst mit Referenz, keine Umleitung von Stripe nach Bank;
- unveränderliche Grundlage, zweite Auszahlung ausgeschlossen;
- simulierte Provider-Ausführung vor Rechnung: 69,97 € genau einmal, dauerhafter Beleg gespeichert;
- Saldo 307,26 − 377,23 + 69,97 = 0,00 €;
- echte Nachforderung 397,23 − 377,23 = 20,00 € bleibt erhalten.

## PDF und Darstellung
- Test-PDF mit 700 € bestätigter Kaution und 69,97 € bestätigter Mieterstattung erzeugt, Text ausgelesen und visuell geprüft: 0,00 € Restbetrag und ursprünglicher Zahlungsweg.
- Echte Erstattungsdialog-Ansicht geprüft. Keine horizontale Überbreite bei 1280, 820 und 390 px. Der Cookie-Hinweis kann den unteren Vorschauabschluss überlagern; Dialog ist per Escape schließbar. Das ist keine Auszahlungssperre.
- Aktueller Preview-Build fehlerfrei.

## Bereitstellung und Grenzen
- Zahlungs-/Rechnungs-/Webhookfunktionen eingespielt; neue Oberfläche noch nicht veröffentlicht.
- Keine echte zusätzliche Kundenauszahlung, keine echte Rechnung, keine Kundenmail ausgelöst.
- Noch operativ offen: Mitarbeiter startet Florians 69,97-€-Auszahlung, wartet auf bestätigten Providerstatus, prüft die neue Vorschau und stellt erst dann die Rechnung aus.
- Der vollständig reale Ablauf Auszahlung → Providerbestätigung → ausgestellte Kundenrechnung wurde bewusst nicht mit produktivem Kundengeld getestet. Keine vollständige E2E-Freigabe behauptet.
- Bestehende bereits ausgestellte Rechnungen behalten den bisherigen Rechnungserstattungs-/Korrekturweg; vorgezogene Erstattungen sind zunächst auf die erstmalige Abrechnung begrenzt.