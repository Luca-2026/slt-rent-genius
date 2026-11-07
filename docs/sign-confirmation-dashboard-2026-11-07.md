# Schilderbestätigungen und Mitarbeiterstandort – 07.11.2026

## Befund
- Die automatische Bestätigung existiert bereits: `sign_booking_payment_state` setzt nach vollständiger Zahlung die Buchung auf paid. `wake_sign_booking_processor` startet den Worker unmittelbar und hält bei offenen Arbeiten einen minütlichen Wiederholungsjob bereit. `sign-booking-worker` erstellt und sendet die AB; `finish_sign_confirmation` speichert Versand und Auftragsbestätigung.
- Live lesend geprüft: alle fünf bezahlten Schilderbuchungen haben `confirmation_sent_at`, `order_confirmed_at` und AB-Nummer: PWUZQQ, Y8TATQ, ZQ2ZZH, 2678ZU, EGXKAD. Zwischen Zahlung und dokumentiertem Versand liegen jeweils circa 3–4 Sekunden. Das belegt gespeicherten erfolgreichen Versand, nicht den Eingang im Kundenpostfach.
- Die manuelle Dashboardliste und der Bestätigungszähler waren standortübergreifend. Vor Fertigstellung der automatischen AB konnten Direktbuchungen außerdem kurz als manuelle Bestätigungsaufgabe erscheinen.

## Änderung
- Automatische Schilderbuchungen (`source=sign_direct_booking` oder `offer_payload.direct_booking=true`) sind von manuellen AB-Aufgaben ausgeschlossen. Normale manuell angelegte Schilderaufträge bleiben unverändert.
- Bestätigungsliste, zugehörige Zahlungsbenachrichtigungen und Bestätigungszähler richten sich nach dem Mitarbeiterstandort, auch bei Admins. Bonn ist getrennt; Krefeld und Mülheim bilden dieselbe Arbeitsgruppe. Eine Kalenderauswahl „Alle Standorte“ verbreitert diese Aufgaben nicht.
- Abschlussarbeiten nach dem Mietende bleiben erhalten. Keine Änderung an Zahlungen, automatischem Versand, Aufgaben für Beklebung/Aufstellung oder Rechnungserstellung.

## Prüfung und Grenzen
- 51 Tests in fünf Dateien bestanden, darunter automatische/manuelle AB-Abgrenzung, Bonn, Krefeld/Mülheim, fehlender Mitarbeiterstandort und erhaltene Schilder-Abschlussarbeiten; bestehende atomare Buchungs-/Zahlungsprüfungen bestanden.
- Aktueller Preview-Build OK.
- Eigener angemeldeter Zugang im Browser auf `/b2b/start` zeigt Testfirma und „Kein Zugriff auf diesen Bereich“. Mitarbeiteransicht deshalb nicht live abgenommen; keine Rechte verändert.
- Keine neue Kundenmail, Testbuchung oder Geldbewegung ausgelöst. Website nicht veröffentlicht.