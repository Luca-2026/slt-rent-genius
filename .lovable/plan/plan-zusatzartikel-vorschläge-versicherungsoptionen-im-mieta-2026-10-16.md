# Plan: Zusatzartikel-Vorschläge & Versicherungsoptionen im Mietanfrage-Formular

## Ausgangslage (analysiert)

- Anfrageformular (`ProductBookingDialog` + `InquiryItemsPicker`): Kunden können heute Zusatzartikel nur manuell über die Suche hinzufügen – keine Vorschläge, keine Versicherungen.
- Versicherungen (`addon_options`, jsonb) sind bei 35 von 382 veröffentlichten Artikeln gepflegt, inkl. Selbstbeteiligung und Stufen (z. B. 6-t-Minibagger: Maschinenbruch 1.500 € SB + Reduzierung auf 500 €). Werden bisher nur im internen Angebotsformular genutzt.
- Zubehör-Zuordnung existiert nur rudimentär: `related_slugs` (7 Artikel) und das statische Feld `compatibleMachines` (nur Erdbewegung, nicht in der DB).

## Teil 1: Zusatzartikel-Vorschläge

1. **Neues CMS-Feld `suggested_accessory_slugs` (text[])** an `b2b_managed_products` + Aufnahme in die Public-View, damit das Formular die Vorschläge laden kann. Pflege im Mietartikel-CMS (Mehrfachauswahl aus dem Katalog).
2. **Analyse & Befüllung Produkt für Produkt** – ohne erfundene Zuordnungen. Quellen, in dieser Reihenfolge:
   - vorhandene `compatibleMachines`-Zuordnungen (Erdbewegung),
   - vorhandene `related_slugs`,
   - faktische Adapter-/Schnittstellen-Logik aus den gepflegten Artikeldaten (z. B. MS01/MS03/MS08-Anbaugeräte passend zur Baggerklasse laut Name/Technische Daten),
   - Anhänger-Zubehör nur wo eindeutig (z. B. Kabel zur Steinsäge, wie bereits in `related_slugs` gepflegt).
   Artikel ohne belastbare Zuordnung bleiben leer.
3. **Reporting**: Liste pro Mietartikel (Slug, Name, vorgeschlagene Zusatzartikel, Quelle der Zuordnung) als Markdown-Datei zur Prüfung, bevor die Zuordnungen in die DB geschrieben werden.
4. **Anzeige im Formular**: Unter „Artikel in deiner Anfrage" ein Block „Passende Zusatzartikel" mit den vorgeschlagenen Artikeln (Bild, Name, Tagespreis, Hinzufügen-Button). Ein Klick fügt den Artikel als Position hinzu – gleiche Mechanik wie heute. Nur Artikel mit gepflegten Vorschlägen zeigen den Block.

## Teil 2: Versicherungsoptionen im Anfrageformular

1. `addon_options` ist bereits in der Public-View verfügbar → kein DB-Schema nötig.
2. Im Anfrageformular pro Hauptartikel (und je Zusatzartikel mit gepflegten Optionen) ein Abschnitt „Versicherung":
   - Standardstufe als ausgewählte Pflichtoption, z. B. „Maschinenbruchversicherung (Pflicht), Selbstbeteiligung 1.500 €".
   - Weitere gepflegte Stufen als wählbare Zusatzoption, z. B. „Reduzierung Selbstbeteiligung auf 500 €".
   - Nur bei Artikeln mit gepflegten `addon_options`; sonst erscheint nichts.
3. Die Auswahl wird mit der Anfrage übermittelt (Erweiterung `send-inquiry-email`: Items erhalten `selected_addons`), in der Anfrage gespeichert und im internen Angebotsformular als Vorbelegung übernommen, damit Angebot und Kundenwunsch übereinstimmen.
4. Preise: im Formular nur informativ (Prozent/Betrag wie gepflegt), keine eigene Preisberechnung – die verbindliche Berechnung bleibt im Angebot.

## Technische Details

- Migration: `ALTER TABLE b2b_managed_products ADD COLUMN suggested_accessory_slugs text[] NOT NULL DEFAULT '{}'` + View-Erweiterung `managed_products_public` + `public_product_prices` unverändert.
- Neue/geänderte Dateien (Auswahl): `InquiryItemsPicker.tsx` (Vorschläge + Versicherungsblock), `ProductBookingDialog.tsx` (State, Versand), `send-inquiry-email/index.ts` (Addons entgegennehmen), `InventoryEditorDialog.tsx` + neuer `SuggestedAccessoriesEditor.tsx` (CMS-Pflege), `InquiryOfferForm.tsx` (Vorbelegung aus Anfrage).
- Tests: Auswahl/Vorbelegung der Versicherungsstufen und Vorschlagslogik als Unit-Tests neben bestehenden (`offerGroupsAndOptions.test.ts`-Muster).
- Keine Änderung an Preisen, Angebots-PDF oder bestehenden Versicherungsdaten.

## Reihenfolge

1. Migration + CMS-Pflegefeld
2. Analyse-Skript → Reporting-Datei mit allen Zuordnungsvorschlägen → **deine Freigabe**
3. Befüllung der Zuordnungen (nach Freigabe)
4. Formular-UI (Vorschläge + Versicherung) + Versand + Angebots-Vorbelegung
5. Tests, Build, Deployment der Edge Function
