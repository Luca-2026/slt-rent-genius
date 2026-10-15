# CMS-Artikelmaske (Mietartikel)
- Preisschema (bau/event) gilt je Artikel (`pricing_scheme`); Hauptkategorie (`main_category`: event/bau) steuert die Filterzuordnung der Website. Preise netto, Spalten `price_*` in b2b_managed_products, optional je Standort in b2b_managed_product_location_prices (gleiche RLS wie b2b_managed_products).
- Migration alter Textpreise: Monatspreis ÷ 20 = `price_from_20_rd`; nicht lesbare Werte landen in migration_price_log, nichts wird geraten.
- Leere Staffelstufen sollen auf die nächstniedrigere gefüllte Stufe zurückfallen (3 → 1, 10 → 3, 20 → 10), nie auf 0. Geplant, wird in Paket 2 (Preismodul src/lib/pricing) umgesetzt, heute noch nicht im Code.
- Beim Speichern werden die Alt-Textfelder (`price_per_day` "89,00 €/Tag") aus dem Grundpreis zurückgeschrieben (`legacyDayPrice`/`formatDayPriceText`), damit Website und Angebots-Editor unverändert lesen.
- Grundpreis (Event: 1–3 KT, Bau: ab 1 Miettag) ist nur Pflicht bei `is_published` UND NICHT `on_request` (`basePriceRequired`); sonst speichern ohne Preis, die Maske zeigt den Hinweis, dass die Webseite dann keinen Preis anzeigt.
- Diese Datei ist für jedes Änderungspaket zur Maske freigegeben und wird mit den Regeln mitgepflegt.
