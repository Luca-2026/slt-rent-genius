# DATEV-Barzahlungsexport: KOST 1

## Anlass und Ursache
Die Rückmeldung im Screenshot bestätigt einen erfolgreichen DATEV-Import, aber eine fehlende Auftragszuordnung in KOST 1. Der gemeinsame CSV-Renderer schrieb die Auftrags-ID ausschließlich in RechNr und ließ Kost1 explizit leer. Ein vorhandener Kost1-Helfer wurde nicht verwendet.

## Änderung
Die Auftrags-ID wird ohne Anzeigepräfix # in Kost1 geschrieben und bleibt zusätzlich in RechNr erhalten. Alle Kassenanhänge verwenden denselben Renderer. Header, 13 Spalten, Vorzeichen, Datumsformat, Windows-1252 und Kassenaufteilung bleiben unverändert. Ohne echte Auftrags-ID bleibt Kost1 leer; eine Rechnungsnummer wird nicht als Kostenstelle erfunden.

## Nachweise
- Acht gezielte Tests erfolgreich: Auftrags-ID in Spalte 9, zusätzlich in Spalte 3, Barauszahlung −76,20 €, keine erfundene Kostenstelle, bisherige CSV-Regeln erhalten.
- Vorschau-Build OK.
- Tagesabschlussfunktion deposit-refund-digest erfolgreich aktualisiert.
- Produktionsdaten des bisherigen Tagesabschlussfensters am 09.11. gelesen: Auftrag 7KQY76, Krefeld, Eingang 132,73 €, Kautionsauszahlung −76,20 €. Keine Daten verändert.

## Grenzen
Ein echter Testversand ausschließlich an luca@sandhoff.org wurde versucht, jedoch mit HTTP 401 abgelehnt; auch nach Minten des eigenen Mitarbeiterzugangs. Es wurde keine erfolgreiche Zustellung behauptet und keine Berechtigung verändert. Der tatsächliche DATEV-Import und die Anzeige in KOST 1 sind nicht geprüft. Die CSV-Anhänge im Screenshot waren nicht als Dateien hochgeladen.

## Buchhaltung
Neue Exporte enthalten die ergänzte Zuordnung. Bereits importierte Buchungen nicht erneut importieren, sonst drohen Doppelbuchungen. Historische E-Mail-Anhänge ändern sich nicht nachträglich.