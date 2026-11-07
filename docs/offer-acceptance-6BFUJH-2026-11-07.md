# Angebotsannahme #6BFUJH – 07.11.2026

## Ursache
ANG-M-2026-11-0045 für Luisa Peltzer wurde am 07.11. um 12:07 UTC (13:07 Berlin) versendet. Der eingetragene Mietbeginn war bereits am selben Tag um 08:00 Berlin. Die gemeinsame Annahmefrist war das Minimum aus Angebotsgültigkeit und Mietbeginn: Der frisch versendete Link war daher sofort abgelaufen. Dieselbe Frist blockierte die Vor-Ort-Unterschrift und den atomaren Datenbank-Annahmeschutz.

## Korrektur
Migration 0169 korrigiert die gemeinsame Frist: Bei bereits zum Versand begonnenen Mieten endet sie am früheren Termin aus Mietende und Angebotsgültigkeit; vor Mietbeginn verschickte Angebote behalten die bisherige Grenze am Mietbeginn. Explizite kürzere Ablaufzeiten bleiben erhalten. Keine abgelehnten, abgelaufenen oder ersetzten Links werden reaktiviert.

Für #6BFUJH liefert der bestehende produktive Link jetzt `active`, Annahmefrist 09.11.2026 um 09:00 Berlin. Angebotsnummer, Preise, Mietdaten, Zahlungen und gespeicherter Status wurden nicht geändert. Die Vor-Ort-Oberfläche zeigt außerdem konkrete Serverfehler und erneuert eine abgelaufene Mitarbeitersitzung einmal statt nur einen pauschalen Fehler anzuzeigen.

## Nachweise und Grenzen
- Deployed offer-accept info: HTTP 200, active, Frist 09.11. 09:00 Berlin.
- Öffentlicher echter Angebotslink in Chromium auf Desktop und Handy zeigt Angebotsdaten und Unterschriftsformular statt Ablaufmeldung; Screenshots unter /tmp/browser/offer-acceptance.
- Datenbanktests prüfen echte Migration und bestehenden Entscheidungstrigger für Online/Vor-Ort, alte Fassung, echte Ablaufzeit, fehlende Uhrzeit und terminale Links. Bestehende Übergabe-/Nachfragetests bleiben erfolgreich.
- Die gemintete eigene Sitzung ist Lucas Testfirma ohne Mitarbeiterrechte; Mitarbeiterdialog deshalb in dieser Sitzung nicht erreichbar. Kein Zugriffsschutz wurde dafür geändert. Die erfolgreiche Vor-Ort-Speicherung ist nur in isolierter Datenbank mit dem produktiven Entscheidungstrigger geprüft, nicht im echten Mitarbeiterdialog.
- Keine Unterschrift im Namen der Kundin, keine Annahme, Zahlung oder Kundenmail ausgelöst. Die Kundin bzw. ein berechtigter Mitarbeiter muss die echte Unterschrift selbst leisten.
- Die Fristenkorrektur ist bereits live; die verständlichere Vor-Ort-Fehleranzeige ist noch unveröffentlicht.