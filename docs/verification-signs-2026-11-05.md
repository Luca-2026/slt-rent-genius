# Schilderpreise und 24/7-Selbstabholung – 05.11.2026

## Ursache und Änderungen
- Artikelseite zeigte Staffelpreise über SignPackagePrices; Paketwahl zeigte dieselben Tabellen. Beide Tabellen und ungeeignete Verlängerungsformeln sind entfernt. Öffentlich bleibt der Standardgrundpreis für 1–10 Tage; Rundum-Sorglos-Konditionen werden bei Paketwahl gezeigt.
- Preisbereiche warteten auf zusätzliche Konfigurationsabfragen und behandelten den noch laufenden Abruf fälschlich als fehlenden Preis. Der bestätigte Grundpreis von 39 € brutto steht nun sofort bereit; gemeinsame zwischengespeicherte Konfiguration aktualisiert ihn. Buchungsbeträge bleiben aus den aktuellen serverseitigen Tarifen berechnet.
- Kalender und Buchungsprüfung verwendeten normale Geschäftszeiten auch bei Schilder-Selbstabholung. Ausschließlich Produkt halteverbotsschilder-set mit Paket standard in Bonn/Krefeld hat jetzt ein 24/7-Fenster; Datum, gültige Uhrzeit und zeitliche Reihenfolge bleiben Pflicht. Sorglos, andere Mietartikel und Rentware wurden nicht für 24/7 geöffnet.
- Die Preisvorschau erhält die Paketkennung, damit sie dieselbe Ausnahme wie Kalender, Warenkorb und Buchungsprüfung verwendet.

## Prüfungen
- 56 Tests in neun Dateien bestanden: Preisbasis 3900 Cent, sämtliche bestehenden Staffelberechnungen, Kalenderregeln, andere Mietartikel, Paketwahl, Warenkorb und Persistenz.
- Bonn, Desktop 1280×1800: echte Artikelseite ohne Staffelpreise/fehlenden Grundpreis; Paket standard gewählt; Sonntag 08.11.2026 00:00 bis Montag 09.11.2026 23:59 auswählbar. Echte Preisvorschau zeigt 39 € Miete plus 100 € Kaution, Warenkorb enthält identische Daten.
- Krefeld, Handy 390×844: gleicher echter Ablauf mit identischen Zeiten und Beträgen, Screenshot ohne horizontalen Inhaltsüberlauf oder Laufzeitfehler.
- Konfigurationsabfrage künstlich 15 Sekunden verzögert: Standardgrundpreis schon vorher 39 €, keine Meldung „Preis derzeit nicht verfügbar“.
- Nach Neuladen: Nachtzeitraum und Preis im wieder geöffneten Warenkorb erhalten.
- sign-booking und public-rental-quote erfolgreich deployed; letzter Buildstatus OK.

## Abgrenzung
Keine echte Reservierung, Zahlung oder Kundenmail erzeugt; vollständige Zahlungs-/Mitarbeiter-Abnahme bleibt getrennt offen. Website nicht veröffentlicht. Die zuvor dokumentierten Abrechnungs-/Erstattungsprobleme sind durch diese Schilderkorrektur nicht behoben.