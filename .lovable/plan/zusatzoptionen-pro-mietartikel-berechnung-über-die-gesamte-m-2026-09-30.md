# Zusatzoptionen pro Mietartikel – Berechnung über die gesamte Mietdauer

## Ausgangslage (geprüft)
- Pro Position können schon heute mehrere Zusatzoptionen gewählt werden (CMS-Optionen, Standardliste, freie Option).
- Der Vorschlagsbetrag einer Prozent-Option (z. B. Maschinenbruch 12 %) rechnet heute nur **Anzahl × Preis** – die Mietdauer fehlt. Bei 2 Baggern × 5 Arbeitstage × 120 € werden 12 % von 240 € statt von 1.200 € vorgeschlagen. Das ist ein Fehler und wird mit behoben.
- Es gibt keine Unterscheidung zwischen „berechnete Miettage“ und „tatsächliche Mietdauer“.

## Fachliche Logik

Jede Zusatzoption bekommt eine **Berechnungsgrundlage**:

| Grundlage | Bedeutung | Beispiel |
|---|---|---|
| Wie Mietposition (Standard) | Gleiche Dauer und Einheit wie der Artikel | Reinigungspauschale, Elektronikversicherung bei Tagesmiete |
| **Gesamte Mietdauer (Kalendertage)** – Checkbox | Zählt jeden Kalendertag von Mietbeginn bis Mietende, auch Wochenende/Feiertage | Maschinenbruch beim Bagger, der Mo–Fr gerechnet wird |
| Einmalig | Fester Betrag, unabhängig von Dauer | Freie Pauschale |

Rechenweg je Preisart:
- **% der Mietsumme:** Prozentsatz × Anzahl × Tagespreis (nach Rabatt) × Tage der Grundlage.
  Bei „gesamte Mietdauer“: Tage = Kalendertage des Zeitraums (z. B. 01.–14.10. = 14 statt 10 Arbeitstage).
- **€ je Tag:** Tagessatz × Anzahl × Tage der Grundlage.
- **Pauschale:** fester Betrag, Checkbox nicht verfügbar.

Regeln:
- Checkbox nur sichtbar, wenn die Position einen Mietzeitraum hat und in Tagen/Wochen/Monaten abgerechnet wird. Bei Pauschalpreis/Stück ausgeblendet.
- Kalendertage werden aus Mietbeginn/-ende der Position berechnet (inkl. abweichendem Zeitraum). Fehlt das Enddatum: Hinweis „Mietende fehlt – Kalendertage nicht berechenbar“, Betrag bleibt manuell.
- Wochen/Monate: Grundlage wird auf einen Tagespreis umgerechnet (Wochenpreis / 7, Monatspreis / 30) – im Formular sichtbar erklärt.
- Der vorgeschlagene Betrag bleibt **überschreibbar**. Wird er manuell geändert, bleibt er stehen und wird nicht bei jeder Mengenänderung neu berechnet; ein kleiner „Neu berechnen“-Link setzt ihn zurück.
- Prozentsatz ist je Option im Formular anpassbar (z. B. 12 % → 10 %).
- CMS: Pro Zusatzoption kann im Artikel „standardmäßig über gesamte Mietdauer“ vorbelegt werden (Bagger, Aggregate, Arbeitsbühnen ab Werk an).

## So sieht es der Mitarbeiter
Unter jeder Position je Zusatzoption eine Zeile:
```text
Maschinenbruchversicherung        [12] %      [x] Über gesamte Mietdauer
Selbstbehalt 1.000 €
Grundlage: 2 × 120,00 € × 14 Kalendertage (01.10.–14.10.)   = 403,20 €
                                                     [403,20 €]  Neu berechnen
```
Die Rechenzeile ist immer sichtbar, damit jeder sofort sieht, woher der Betrag kommt.

## So sieht es der Kunde (PDF und E-Mail)
Direkt unter der Position, eingerückt:
```text
  ↳ Maschinenbruchversicherung (Selbstbehalt 1.000 €)                    403,20 €
     12 % · berechnet über die gesamte Mietdauer: 14 Kalendertage
     (01.10.–14.10.2026), da der Versicherungsschutz auch an
     nicht berechneten Tagen (z. B. Wochenende) besteht.
```
Ohne Checkbox: „12 % der Mietsumme dieser Position“. Summenblock unverändert (Zwischensumme Zusatzoptionen).

## Rechnung, Überarbeitung, Auftragsbestätigung
- Grundlage, Prozentsatz, Tage und Zeitraum werden im Angebots-Snapshot gespeichert und von „Angebot überarbeiten“, Auftragsbestätigung und Rechnung 1:1 übernommen (gleiche Erklärzeile im Rechnungs-PDF).
- Alte Angebote ohne diese Angaben bleiben unverändert gültig (nur Betrag + Bezeichnung).

## Tests
- Rechenmodul: Prozent/Tagessatz/Pauschale, Arbeitstage vs. Kalendertage, Wochen/Monate, Rabatt, fehlendes Enddatum, manuell überschriebener Betrag.
- Server prüft Betrag gegen Angaben (Abweichung nur bei manuell markierten Beträgen erlaubt).
- Probe-PDF (Angebot + Rechnung) mit Bagger 5 Arbeitstage / 7 Kalendertage visuell prüfen.
- Echter Durchlauf mit Testanfrage an luca@sandhoff.org (Angebot → Überarbeitung → Rechnung).

## Technische Details
- `offerMath.ts` / `_shared/inquiry-offer-math.ts`: `OfferLineAddon` erweitert um `price_type`, `rate`, `basis: "line" | "full_period" | "once"`, `billed_days`, `period_start/end`, `manual`. Neue gemeinsame Funktion `computeAddonAmount()` + `calendarDaysInclusive()`; `suggestAddonAmount` berücksichtigt künftig die Dauer.
- `offerAddons.ts`: `AddonOption.full_period_default?: boolean`; `AddonOptionsEditor` bekommt die Checkbox.
- `InquiryOfferForm.tsx`: Zeilen-UI wie oben, Neuberechnung bei Mengen-/Zeitraumänderung solange `manual=false`.
- `normalizeAddons` übernimmt/validiert die neuen Felder; `offer-pdf.ts`, `send-inquiry-offer`, `send-inquiry-invoice`, `send-order-confirmation` rendern die Erklärzeile.
- Keine Datenbankänderung nötig (Angaben liegen im bestehenden JSON-Snapshot / `addon_options`).
