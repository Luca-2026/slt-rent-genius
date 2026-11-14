# Storno-Prüfung, 14.11.2026

## Bestätigte Vertragsunterlagen

Die tatsächlichen Angebotsanhänge aus dem öffentlichen Dokumentenspeicher wurden heruntergeladen und mit den lokalen Dateien verglichen:
- B2B: SHA-256 `dd3195c51333a0b76e7e559dc656e10482a79baa1eb89c95cd5525272c83a217` stimmt mit `public/legal/AGB-B2B.pdf` überein.
- B2C: SHA-256 `770d16fa42d287aa23d556309b1afeb7ec93d6ab7fb7a97f1dbe7c46fd3d4864` stimmt mit `public/legal/AGB-B2C.pdf` überein.
- Der im Portal verlinkte Speicher-Download `downloads/AGB_Vermietbedingungen.pdf` enthält tatsächlich 20/7/3 Tage, 48 Stunden und 30/50/70/90/100 %. Keine bloße Vermutung anhand des Dateinamens.

## Umsetzung und geprüfter Ablauf

Der Mitarbeiterdialog ermöglicht AGB-Berechnung oder individuelle Gebühr (auch 0 €), mit dokumentiertem Eingang/Grund und ausdrücklich gewählter Steuerbehandlung. B2C-Brutto- und B2B-Netto-Basis bleiben getrennt. Die bezahlte Stornooption bleibt nach Lucas Entscheidung einbehalten.

Der geschützte Storno speichert den Betrag unveränderlich, protokolliert den Mitarbeiter, sperrt aktive Annahme-/Zahlungslinks, beendet Folgerechnungen und gibt nicht übergebene Geräte/Schilder frei. Bestehende Rechnungen, ausgeführte Transporte und signierte Übergaben werden vor Bestätigung abgefangen. Originalangebot und Zahlungen bleiben unverändert.

67 fokussierte Tests erfolgreich: Staffelgrenzen, Optionen, individuelle 70 € brutto/netto, 0 €, Steuerwahl, atomare Speicherung, Versionskonflikt, Doppelbestätigung, vorhandene Rechnungen und ausgegebene Schilder.

Echter Luca-Mitarbeiterablauf am neu registrierten Testauftrag #P8RJFX: individuelle 70 € nicht steuerbare Gebühr → Vorschau → Storno → originale Rechnungsvorschau → RE-M-2026-11-0026. Rechnung gespeichert und PDF mit 70 € / Stornogebühr / Auftrags-ID gelesen. Automatische vollständige Neutralisierung GS-M-2026-11-0003 über −70 €, Original credited_amount=70/status=cancelled. Kein Kundenversand, keine echte Zahlung oder Erstattung. Storno nach Neuladen erhalten. Desktop und 390px-Dialog geprüft; Cookieüberlagerung entdeckt und für geöffneten Dialog beseitigt.

## Noch offene Fälle

- Bestehende ausgestellte Rechnungen/Abschläge: integrierte Korrekturabrechnung nicht implementiert; aktuell ausdrückliche Sperre statt doppelter Forderung/Erstattung. Vorhandene Rechnungs-Gutschrift bleibt separat nutzbar.
- Erstattung nach neuer Stornorechnung ist mit dem bestehenden Mietguthabenweg verbunden; eine echte Stripe-/Bankauszahlung wurde nicht zu Testzwecken durchgeführt. Kaution bleibt separat manuell abzurechnen.
- Externer Rentware-Storno, Teilstorno, laufende Mietkündigung und bereits ausgeführte Aufstellung/Transport bleiben gesonderte Abrechnung.
- Testkundenversand wird absichtlich unterdrückt; normaler Kundenversand nutzt den bestehenden Rechnungssender, aber hier kein echter Postfacheingang geprüft.
- Oberfläche noch nicht veröffentlicht.

AGB-Berechnung benötigt bestätigten Vertrag, dokumentierte aktuelle AGB und eindeutigen Mietbeginn; unklare Fälle erhalten keinen erfundenen Tarif. Steuerwahl wird pro Storno durch den Mitarbeiter bestätigt. Das ersetzt keine Rechts-/Steuerberatung. Historische Verträge und Download-Verweise nicht pauschal umgestellt.