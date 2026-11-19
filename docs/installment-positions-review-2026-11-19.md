# Abschlagspositionen – Prüfung 19.11.2026

## Änderung
- Der Abschlagseditor übernimmt Positionen und feste Einzelpreise aus dem operativen Angebot, einschließlich Rabatten, Bezeichnungsänderungen und vereinbarten Zusatzleistungen.
- Bearbeitete Mengen bestimmen den Rechnungsbetrag; Menge 0 lässt eine Position aus. Rechnungsmenge ist die im Angebot ausgewiesene Abrechnungsmenge (etwa Miettage), nicht ein zweites Produkt aus Stückzahl und Dauer.
- Der Server akzeptiert nur Positionsindex und Mengen; Preise/Text werden aus dem gespeicherten Angebot rekonstruiert. Geänderte Auftragsstände erfordern erneutes Öffnen. Abschlagsobergrenzen und Schlussrechnungsverrechnung bleiben erhalten.
- Vereinbarte Bankrabatte werden einmal auf die gewählten Leistungen berechnet. Optionale Addons und Kaution werden nicht aufgenommen.
- Bestehende Betrag-basierte Aufrufe bleiben für die unveröffentlichte bisherige Oberfläche kompatibel; ausgestellte PDFs bleiben unverändert.

## Nachweise
- 17 Tests zu Positionen, Mengen, Preismanipulation, Bruchteilen, Zusatzleistungen, Bankrabatt, Abschlagsgrenzen und bisherigen Rechnungsregeln bestanden.
- Automatische Vorschauprüfung: Build OK.
- Funktion send-inquiry-invoice bereitgestellt.
- Echter Luca-Zugang, bestehender Auftrag #Y4RGA8: Desktop 1280 × 1800, Tablet 768 × 1024 und Handy 402 × 725. Mengenänderungen, echte PDF-Vorschau HTTP 200 und Sperre nach nachträglicher Mengenänderung geprüft.
- PDF visuell und als Text gelesen: Raupenlader 5 Miettage × 215 € = 1.075 €, Versicherung 12 Kalendertage × 21,50 € = 258 €, Anlieferung 330 €, Abholung Menge 0 ausgelassen. Netto 1.663 €, USt 315,97 €, brutto 1.978,97 €. Zahlungsbedingung net_7 aus Angebot übernommen.
- Auftragsstatus accepted und updated_at 15:20:25 UTC unverändert zurückgelesen. Keine Rechnung ausgestellt, kein Mailversand, keine Geld-/Bestands-/Rechteänderung.

## Grenzen
- Finales Ausstellen, Speicherung einer neuen Rechnung und Kundenmail nicht ausgeführt; der echte Ablauf ist bis zur finalen PDF-Vorschau geprüft, nicht vollständig bis Versand.
- Nativer Safari und andere Mitarbeiterkonten nicht geprüft. Oberfläche nicht veröffentlicht.
- Root AGENTS.md-Regel konnte wegen Größenbudget nicht ergänzt werden; neue Rekonstruktionslogik liegt ausschließlich im gemeinsamen Helper installment-positions.