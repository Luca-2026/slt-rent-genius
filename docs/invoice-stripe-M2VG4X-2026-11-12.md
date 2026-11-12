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
- Folgeprüfung 12.11. ab 17:57 UTC: zusätzliche Wiederholungslücke gefunden und behoben. `settle_rental_stripe_receipt_v2` schließt den Zahlungsbeleg bereits vor dem Rechnungsabgleich ab; zuvor quittierte die Wiederholzustellung deshalb sofort 200, selbst wenn der Rechnungsabgleich zuvor fehlgeschlagen war. Wiederholungen bestätigter Mietzahlungen rufen jetzt denselben idempotenten Rechnungsabgleich erneut auf; erneute Lesefehler/Abgleichfehler liefern 500 statt falscher Erfolgsmeldung.
- Aktualisierte `stripe-webhook` erfolgreich eingespielt. 31 Vitest-Prüfungen bestanden (einschließlich Abgleichfehler/Wiederholung, Mehrrechnungen, Teilzahlung 20 € mit 40,69 € Rest, Kaution 100 €, kein Gutschriftenabgleich und geschützte Zahlungswahl), zusätzlich drei PDF-Prüfungen bestanden. Aktuelles Buildsignal: OK.
- Erneut mit Lucas echtem Mitarbeiterzugang geöffnet: RE-M-2026-11-0009 bezahlt, 60,69 € angerechnet, 0 € offen; PDF-Klick HTTP 200 und Zahlungsnachtrag ausgelesen. Keine offenen normalen Rechnungen ohne Zahlung trotz Stripe-Auftragseingang bei erneuter gezielter Bestandsabfrage.
- Fehlerwiederholung isoliert getestet; keine absichtlich gestörte produktive Stripe-Zustellung oder neue externe Zahlung ausgeführt. Eine vollständige Provider-Ende-zu-Ende-Abnahme ist damit nicht belegt. Mehrrechnungen/Abschläge/Sondererstattungen bleiben bewusst vom automatischen Einzelrechnungsabgleich ausgeschlossen.
- Keine Kundenmail, neue Zahlung oder Erstattung ausgelöst. Die Kautionserstattung bleibt eigenständiger Mitarbeiterablauf.
- Kein neuer externer Stripe-Zahlungslauf mit Kundengeld getestet. Ralfs eigene Sitzung nicht getestet; tatsächlicher Mitarbeiterablauf als Luca geprüft.
- Bereits versendete PDF-Anhänge ändern sich nicht; Öffnen/Neuversand verwendet die Rechnung mit ergänztem Zahlungsnachweis.