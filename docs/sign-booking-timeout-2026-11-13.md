# Halteverbot-Buchungsstörung – 13.11.2026

## Nachweise
- Gemeldet um 09:35 UTC: Kunde erhält wiederholt Timeout beim Übergang zur Bezahlung. Kundenname, E-Mail, Standort, Zeitraum und Refresh-Verhalten unbekannt.
- Lovable Cloud aktuell erreichbar; Speicher 61 %, Verbindungen 32/60, kein gemeldeter Ressourcenengpass. Kein Neustart vorgenommen.
- Preise live geladen in 2.774 ms, Kalender in 315 ms. Keine erfolgreiche neue Buchung seit 12.11. 11:25:14 UTC; insgesamt zehn gespeicherte Buchungen.
- Wiederholte `reserve_sign_booking`-Aufrufe und Warteschlange auf `b2b_managed_products` beobachtet. Die einzelnen Transaktionen waren nur Millisekunden alt: keine lang laufende Einzelsperre behauptet.
- PostgreSQL-Protokoll 09:39:28.222 UTC: `Nicht genügend Sets für diesen Zeitraum verfügbar`, Kontext `reserve_sign_booking` Zeile 22, SQLSTATE `40001`. Gleiche Ablehnung jede Sekunde; kein erfolgreicher Commit. Dieses für Transaktionswiederholung vorgesehene Signal ist für eine fachliche Bestandsablehnung falsch. Aus den vorliegenden Daten ist der unbekannte Kundenversuch nicht eindeutig zuzuordnen.

## Korrektur
- Migration 0179 ersetzt fachliche `40001`-Ablehnungen in Reservierung und Bestandsprüfung durch `23514`. Bestandsberechnung, Preise, Mengen, Zahlungsregeln und bestehende Buchungen bleiben unverändert.
- Reservierung erhält `lock_timeout=2s`. Dies begrenzt Sperrwartezeit, nicht die komplette Laufzeit oder jeden denkbaren gegenseitigen Sperrkonflikt.
- Oberfläche begrenzt Reservierungs-/Zahlungsstart auf 30 s und Zahlungsdaten auf 15 s. Zahlungsfehler bleiben sichtbar statt durch automatisches Nachladen überschrieben zu werden. Fehlgeschlagenes Laden bietet „Erneut versuchen“.
- Buchungsbeleg wird erst nach Abschluss des vorherigen Leseversuchs erneut abgefragt; keine überlappenden Fünf-Sekunden-Abfragen bei langen Antworten.
- Wiederholungen behalten bestehenden requestId bzw. Zahlungslink und verändern keine Zahlungs-Idempotenzregeln.

## Prüfung
- Live-Funktionsdefinitionen bestätigt: kein `40001`, `23514` vorhanden, Reservierungs-lock_timeout 2 s.
- Unmittelbar nach Korrektur keine wartenden Datenbanksperren. Keine weiteren PostgreSQL-Fehler nach 09:41 UTC in der abgefragten Protokollmenge.
- Live Kalender Bonn zeigt für 23.–24.11. neun Sets. Gezielte Reservierungsanfrage über die tatsächliche öffentliche Funktion für zehn Sets, bestätigte Testkundenadresse: HTTP 409 in 817 ms mit lesbarer Bestandsablehnung. Keine Buchung, keine Zahlung, keine Mail angelegt.
- 27 isolierte Tests bestanden: nicht wiederholbare Bestandsablehnung inkl. Trigger, Bestands-/Reservierungs-/Zahlungsregressionen und Warenkorb-/Zahlungsoptionen.
- Browser: Zahlungsdatenaufruf künstlich unterbrochen; nach 15 s Fehler und aktiver „Erneut versuchen“-Button sichtbar. Screenshot `/tmp/browser/sign-timeout/payment_timeout.png` visuell geprüft.
- Aktueller Build OK, 09:41:11 UTC.

## Grenzen und Veröffentlichung
- Datenbankkorrektur sofort produktiv. Oberflächenänderungen benötigen Veröffentlichung und ggf. Neuladen.
- Kein echter neuer Stripe-Zahlungslauf oder neuer erfolgreicher produktiver Buchungslauf durchgeführt; keine vollständige Zahlungsfreigabe behauptet.
- Historischer Einzelfall mangels Kundendaten nicht eindeutig zugeordnet. Kein Beleg, dass ein fehlender Refresh die Ursache war.
- Ursprüngliche allgemeine Sperrreihenfolge bei Mitarbeiteränderungen und Buchung ist mit dieser eng begrenzten Fehlerkorrektur nicht grundsätzlich umgebaut.
- Architekturregel nicht zusätzlich in root AGENTS.md gespeichert: bestehendes Größenbudget erschöpft; bestehende Regeln unverändert.