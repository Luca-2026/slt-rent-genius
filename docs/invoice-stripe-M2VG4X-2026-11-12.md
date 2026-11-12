# #M2VG4X – Zahlungsabgleich, 12.11.2026

## Belegt
- RE-M-2026-11-0009 wurde am 09.11. um 07:40:34 UTC erstellt: 60,69 € brutto, keine Zahlung, offen.
- Stripe bestätigte die Zahlung von 160,69 € als erfolgreich. Der Auftrag erhielt sie um 07:42:33 UTC, die Rechnung jedoch nicht.
- Der Zahlungsprozess buchte ausschließlich den Auftrag; ein anschließender Rechnungsabgleich fehlte. Die Rechnung entstand vor der Zahlung; ihre Originalseiten dokumentieren deshalb den damaligen Stand.
- Vorher mit Lucas echtem Mitarbeiterzugang reproduziert: überfällig, keine Zahlung auf der Rechnung.

## Korrektur und Prüfung
- Service-only Abgleich für eine eindeutig zuordenbare normale Mietrechnung, bestätigter identischer Providerbeleg, keine Doppelbuchung. Mehrere Rechnungen/Abschläge und separate Mieterstattungen werden nicht automatisch zugeordnet.
- 60,69 € angerechnet; 100 € Kaution nicht als Mietguthaben verbucht. Zahlungseingang im Auftrag unverändert.
- Als Luca abgeglichen, aktualisiert, Rechnung gesucht: bezahlt, 0 € offen.
- Tatsächlicher PDF-Button: HTTP 200, ursprüngliche Seiten erhalten, ergänzte Zahlungsseite nennt Stripe-Eingang 09.11.2026, 160,69 € Gesamtzahlung, 60,69 € Rechnungsanrechnung und 0 € offen.
- Neue Stripe-Eingänge führen den Rechnungsabgleich nach bestätigter Auftragsbuchung aus. Fünf Datenbanktests und drei Rechentests prüfen Zuordnung, Wiederholung, uneindeutige Mehrrechnungen, Providerbeleg und Berechtigung; PDF-Tests prüfen Originalerhalt und Nachtrag.
- Eine Bestandsabfrage auf offene normale Rechnungen ohne Rechnungszahlung trotz Stripe-Auftragseingang ergab vorher einen Treffer, danach null. Das ist keine vollständige Prüfung sämtlicher Teilzahlungen/Abschläge.

## Grenzen
- Keine Kundenmail, neue Zahlung oder Erstattung ausgelöst. Die Kautionserstattung bleibt eigenständiger Mitarbeiterablauf.
- Kein neuer externer Stripe-Zahlungslauf mit Kundengeld getestet. Ralfs eigene Sitzung nicht getestet; tatsächlicher Mitarbeiterablauf als Luca geprüft.
- Bereits versendete PDF-Anhänge ändern sich nicht; Öffnen/Neuversand verwendet die Rechnung mit ergänztem Zahlungsnachweis.