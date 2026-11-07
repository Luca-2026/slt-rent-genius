# Monitoring-Prüfung – 7. November 2026

## Stripe-Erstattungsstatus

Die Meldung ist bestätigt, ihre vermutete Ursache jedoch nicht: Der aktuelle Stripe-Refund-Beleg enthält PaymentIntent, EUR und einen positiven Ganzzahlbetrag, aber kein `livemode`-Feld. Die alte Bedingung `refund.livemode !== live` lehnt deshalb auch gültige Erstattungen ab.

Live lesend geprüft: Ereignis `evt_3UYTC9HXHko0hef31r60kbJ4` ist ein Live-`refund.created`; dazu Refund `re_3UYTC9HXHko0hef31YNlReZ4`, 15.000 Cent, EUR, succeeded, PaymentIntent vorhanden, kein livemode. 13 Erstattungsereignisse waren ohne Abschluss gespeichert. Keine Auszahlungen ausgelöst.

Korrektur: Modus stammt wie bisher aus dem signaturgeprüften Ereignis oder dem authentifizierten Stripe-Client. Nur ein ausdrücklich vorhandener widersprüchlicher Refund-Modus wird abgewiesen. Ungültige Beträge, fehlende PaymentIntents und Fremdwährungen bleiben gesperrt; Speicherausfälle bleiben wiederholbar. Keine Änderung an Erstattungsgrenzen oder Belegen. `stripe-webhook` und `offer-payment-admin` eingespielt.

## Angenommene Angebote ohne Standort

Bestätigt: Standortloses/unerkanntes Angebot fiel aus der bisherigen Standortfilterung. Sechs Verkaufsanfragen ohne Standort vorhanden; derzeit keine angenommene Verkaufsanfrage ohne AB für eine reale Wiedergabe dieses Falls.

Korrektur: Admins erhalten zusätzlich nicht zugeordnete Vorgänge mit Hinweis „Standort noch zuzuordnen“. Bekannte fremde Standorte bleiben ausgeblendet, normale Standortmitarbeiter bekommen weiterhin nur ihre Niederlassung. Derselbe Filter gilt für Liste und Zähler; der Zähler berücksichtigt jetzt auch Verkauf. Keine Standorte erfunden, keine Kunden-/Rollenänderungen.

## Prüfungen und Grenzen

- 41 Tests in refundReconciliation, acceptedOffersPayments, dashboardMetrics und myTasks erfolgreich.
- Refund ohne livemode in Live- und Testmodus geprüft; ausdrückliche Modusabweichung, fehlender PaymentIntent, USD, Nullbetrag und Bruchteile bleiben blockiert.
- Admin ohne Standort sieht nur nicht zugeordnete Vorgänge; Bonn/Krefeld/Mülheim-Trennung bleibt geprüft.
- Aktuelle Vorschau meldet Build OK.
- Angemeldeter eigener Zugang zur Startseite zeigt „Kein Zugriff auf diesen Bereich“; echte Mitarbeiteransicht damit nicht abgenommen.
- Nach Einspielen keine neuen Stripe-Logs verfügbar; Wiederholung und Abschluss der 13 alten Ereignisse noch nicht beobachtet. Kein erfolgreicher vollständiger Live-Erstattungslauf behauptet.
- Website nicht veröffentlicht; Dashboardänderung daher noch nicht für die veröffentlichte Mitarbeiteransicht aktiv.