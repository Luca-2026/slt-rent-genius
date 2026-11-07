# Florian Tillmann – Erstattungsprüfung vom 07.11.2026

## Ergebnis für Auftrag #C48T6Q

- Zahlungen: 1.029,63 € und 47,60 €, insgesamt 1.077,23 €.
- Stripe bestätigt die **700,00 € Kautionserstattung als erfolgreich**, ausgelöst am 07.11.2026 um 12:21 UTC durch den zuvor gestarteten Mitarbeiterauftrag. Ursprüngliche Zahlungsart: PayPal über Stripe.
- Die App hatte den erfolgreichen Beleg nicht gespeichert. Das ist korrigiert: Erstattungsauftrag und Providerbeleg stehen beide auf `succeeded`, die Kautionsabrechnung auf `paid` mit Datum 07.11.2026.
- Rechnungsvorschau: 307,26 € brutto; angerechnete Mietzahlung 377,23 €; **69,97 € Mietguthaben**. Kaution separat 700,00 € erhalten und erstattet.
- Insgesamt gehören 769,97 € zurück. Davon sind 700,00 € bereits bestätigt, 69,97 € noch offen.
- **Keine ausgestellte Rechnung vorhanden.** Deshalb ist das Mietguthaben noch nicht ausführbar. Die vorhandene Vorschau ist kein Rechnungsbeleg.

## Fehlerursache und Korrektur

1. Stripe verwendet für diese PayPal-Erstattung eine `pyr_`-Kennung. Die Belegprüfung akzeptierte nur `re_` und lehnte den tatsächlichen erfolgreichen Beleg ab.
2. Dadurch blieb die lokale 700-€-Reservierung offen. Weitere Aktionen sahen keine freie 700-€-Kapazität und meldeten „Keine einzelne Originalzahlung deckt die offene Kaution“.
3. Die Belegprüfung akzeptiert jetzt beide gültigen Kennungsarten, weiterhin mit strenger Betrags-, Währungs-, Identitäts- und Statusprüfung und ausschließlich service-seitigem Schreibrecht.
4. „Erstattungsstatus abgleichen“ liest vorhandene Stripe-Belege, ohne eine neue Erstattung anzulegen. Damit wurde Florians echter erfolgreicher Auftrag zurückgelesen und bestätigt.
5. Ungeklärte Aufträge werden nicht durch neue Reservierungen ersetzt. Die Kautionsabrechnung kann denselben gespeicherten Auftrag wieder aufnehmen; laufende Auszahlungen bleiben gegen Doppelzahlung gesperrt.
6. Mietguthabenerstattungen speichern jetzt ebenfalls den dauerhaften Providerbeleg über die gemeinsame Abgleichlogik.

## Gewählter Ablauf: zwei Schritte

Die Kautionsabrechnung zeigt getrennt:

1. **Kautionserstattung** mit Betrag, Zahlungsweg und bestätigtem Datum. Bei unklarem Status zuerst Abgleich statt neuer Auszahlung.
2. **Überschüssiges Mietguthaben** aus der ausgestellten Rechnung. Ohne Rechnung steht die Voraussetzung sichtbar dort; nach Ausstellung ist „Mietguthaben / Erstattung“ direkt verfügbar. Bestehende Rechte bleiben unverändert.

Die Rechnung berücksichtigt den Rabatt und zeigt das positive Guthaben. Nach dessen Auszahlung enthält die aktuelle Rechnungsfassung den tatsächlichen Erstattungsweg und noch offenen Betrag. Es entsteht kein separates Mietguthaben-PDF.

## Durchgeführte Prüfungen

| Prüfung | Ergebnis |
| --- | --- |
| Echte Stripe-Historie beider Zahlungsaufträge | Originalzahlung: genau eine erfolgreiche 700-€-Erstattung; Nachzahlung: keine Erstattung |
| Authentifizierte Mitarbeiteransicht, echter Florian-Auftrag | Statusabgleich ausgeführt; bereits erfolgte Kaution bestätigt; keine neue Auszahlung ausgelöst |
| Rücklesen gespeicherter Provider-/Erstattungsbelege | Beide 70.000 Cent, `succeeded`; Kautionsabrechnung `paid` |
| Echte Rechnungsvorschau über Vorschau-Schaltfläche | HTTP 200; PDF zeigt 700 € erstattet am 07.11., beide ursprünglichen Eingänge, 377,23 € Anrechnung, 307,26 € Rechnung, 69,97 € Guthaben |
| Desktop 1280 px, Tablet 820 px, Handy 390 px | Kautionsansicht ohne horizontalen Seitenüberlauf |
| Vollständiger Mietguthabenablauf mit simuliertem Stripe und Rechnungsfixture | Nach 700 € Kaution exakt 69,97 €; Providerbeleg gespeichert; Wiederholung erzeugt keine zweite Auszahlung; Originalrechnung unverändert |
| Gemeinsame PostgreSQL-Erstattungsgrenzen mit isolierter Testdatenbank | 700 € + 69,97 € zulässig; Überzahlung blockiert; doppelte Belegzählung ausgeschlossen; endgültiger Erfolg kann nicht zu „pending“ zurückfallen |
| Regressionstests | 66 Tests in 10 Dateien bestanden |
| Automatische Website-Prüfung | Neuester Eintrag: build OK |

## Bewusst nicht ausgeführt / verbleibende Grenze

- Keine neue echte Auszahlung, keine Rechnungsausstellung, kein Versand während dieser Prüfung.
- Die **69,97 € sind noch nicht real ausgezahlt**. Vollständiger echter Ende-zu-Ende-Nachweis dieses zweiten Geldtransfers ist erst nach Ausstellung der rabattierten Rechnung und ausdrücklichem Mitarbeiter-Auszahlungsauftrag möglich.
- Die technische Blockade bei Florians Kaution ist behoben und am echten Auftrag überprüft. Eine vollständige Freigabe beider echten Geldtransfers wird nicht behauptet.
- Backend-Korrekturen sind eingespielt. Die neuen Bedienelemente sind in der Vorschau vorhanden, noch nicht veröffentlicht.

## Nächster betrieblicher Schritt

Die geprüfte rabattierte Rechnung ausstellen. Danach in der Kautionsabrechnung unter „2. Überschüssiges Mietguthaben“ die 69,97 € über den vorhandenen Rechnungserstattungsauftrag starten. Nicht noch einmal 700 € erstatten und keine zusätzliche Bankauszahlung veranlassen.