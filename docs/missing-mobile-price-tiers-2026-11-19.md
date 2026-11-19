# Fehlende Preisstaffeln auf dem Handy – 19.11.2026

## Belegte Ursache
Die mobile Buchungsansicht enthielt ausschließlich ProductPriceBlock mit Tages-, Wochenend- und Monatspreis. Anders als die Desktopansicht band sie RentalPriceTiers überhaupt nicht ein. Die gemeinsame öffentliche Standortpreisabfrage antwortete HTTP 200. Dieselbe Lücke wurde vor der Änderung auf www.slt-rental.de und localhost mit dem 1t-Minibagger reproduziert; die Staffeltexte befanden sich nur im ausgeblendeten Desktopbereich.

## Datenbank
Zwei Gesundheitsabfragen: Datenbank und Verbindungspool verfügbar, 0 Neustarts, RAM 61–63 %, Datenlaufwerk 5 %, 29/60 Verbindungen, keine Ressourcenwarnung. Kumulierte Rollbacks 26.612.096 → 26.612.097, kein aktuell belegter Wiederholungssturm.

Gespeicherter Minibagger: 90 / 81 / 72 / 54 € netto je Miettag, Wochenendpreis 145 €, zuletzt geändert 02.11.2026. Weitere Radlader-/130-€-Artikel haben 130 / 117 / 104 / 78 €; aus dem Screenshot allein ist der exakte zweite Artikel nicht eindeutig zuzuordnen. Keine Preisdatensätze verändert.

## Korrektur und Nachweis
MobileBookingCard bekommt dieselbe Staffelkomponente, dasselbe Originalprodukt und dieselben Standortpreiszeilen wie Desktop. Zusatztarife werden analog Desktop nicht doppelt gezeigt.

Nach Änderung auf 402 × 725 sichtbar: 107,10 / 96,39 / 85,68 / 64,26 € brutto aus den gespeicherten 90 / 81 / 72 / 54 €. Öffentliche Preisabfrage HTTP 200, keine Browserfehler; Desktop weiterhin gleiche Staffeltexte. Bestehende fünf priceDisplay-Tests bestanden; automatische Prüfung Build OK.

## Zeitliche Einordnung und Grenzen
Die letzte Abschlagsänderung berührte weder öffentliche Artikelpreise noch deren Speicherung oder Preisansicht. Die mobile fehlende Einbindung liegt bereits vor heutigen Änderungen im Quelltext. Warum sie heute Morgen in der konkreten Nutzersitzung anders wahrgenommen wurde, ist ohne damaligen Nachweis nicht feststellbar; kein Datenbankausfall behauptet. Nativer iPhone-Safari und die exakte zweite Screenshotmaschine nicht separat geprüft. Korrektur noch unveröffentlicht; produktive Website bis Veröffentlichung unverändert. Kein Neustart, keine Rechte-/Preis-/Datenbankänderung.