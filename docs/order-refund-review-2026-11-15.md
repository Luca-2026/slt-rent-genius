# Auftragshistorie und gemeinsame Erstattungen – Prüfstand 15.11.2026

## Belegt: #UHSMCV
- Stripe-Nachweise: einmal 29,75 € Miete und einmal 100 € Kaution, beide erfolgreich; insgesamt 129,75 €. Keine doppelte Mieterstattung belegt.
- Mieterstattung erfasst durch Benedikt Nöchel am 14.11., Kaution durch Luca Sandhoff am 15.11. Historie verwendet die ursprünglichen Erfassungszeiten, nicht spätere Synchronisationszeiten.
- Mit Lucas tatsächlichem Mitarbeiterzugang auf Desktop und 390px geprüft: Historie direkt oben, 129,75 € erstattet, 0 € verbleibend; kein neuer Storno und kein weiterer Auszahlungsbutton für diesen vollständig erstatteten Auftrag.
- Keine Browserfehler, keine horizontale Handy-Überbreite nach Schließen des Dialogs.
- Kontrollabfrage nach Prüfung: 0 neue gemeinsame Erstattungsaufträge für diesen Auftrag; Provider-Nachweise weiterhin 12.975 Cent. Keine Auszahlung, Rechnung oder E-Mail ausgelöst.

## Implementiert
- Gemeinsames Auswahlfenster für getrennte Kautions- und Mietansprüche, inklusive Teilbeträgen; bestehende Originalzahlungsgrenzen bleiben getrennt und kumulativ geschützt.
- Neue unveränderliche Erstattungsaufträge reservieren beide Ansprüche, wiederholen dieselbe Anfrage idempotent und berücksichtigen historische Ledgers sowie Provider-Nachweise.
- Historische Erstattungswege sperren weitere Ansprüche nach einem neuen gemeinsamen Auftrag. Einheitliche Sperrreihenfolge schützt konkurrierende Alt-/Neuanfragen.
- Erfolgsstatus braucht passende Provider-Nachweise; offene Auszahlungen blockieren die Rechnung. Rechnungsnachträge zählen bei gemeinsamen Auszahlungen ausschließlich den Mietanteil.
- 52 gezielte Tests bestanden: historische Vollerstattung, gemeinsame Reservierung, wiederholte Anfrage, Restansprüche, Alt-/Neu-Sperren, Provider-Abgleich, Beleggrenzen und bisherige Mieterstattungsoberfläche. Automatischer Build zuletzt OK.

## Nicht freigegeben / offen
- Die vorhandene Stripe-Konfiguration ist live. Deshalb wurde keine echte neue Zahlung oder Erstattung zu Testzwecken erzeugt.
- Neue gemeinsame Live-Ausführung ist serverseitig gesperrt; dieser Schutz wurde mit Lucas Zugang geprüft (409, keine neue Anfrage). Bestehende geschützte Erstattungswege bleiben erreichbar.
- Isolierter Zahlungs-Ende-zu-Ende-Test, finale Rechnungs-PDF nach gemeinsamer Auszahlung, mehrere Originalzahlungen, Teilausfälle und finale Verlaufsmeldungen sind noch ausstehend. Manuelle Bar-/Bankbestätigung ist nicht abschließend geprüft.
- Bestehende Rechnungen/Abschläge benötigen weiterhin explizite Korrektur; keine automatische Verdoppelung von Forderungen.
- Die neue Oberfläche wurde nicht veröffentlicht. Die Lesefunktionen und additiven Schutzregeln sind bereitgestellt.