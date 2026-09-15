# Roadmap – SEO-/Content-Überarbeitung (Prompt 14.09.2026)

## Phase 1 – Prerender-Vollständigkeit (erledigt)
- [x] Alle Routen datengetrieben (1.285 Routen, keine handgepflegte Liste)
- [x] Build-Log: Routen je Typ, noindex-Zahl, Liste fehlgeschlagener Routen
- [x] Bonn-Hub mit 23 Kategorie-Links
- [x] sitemap.xml (1.281 URLs, lastmod wo vorhanden, ohne noindex), robots.txt verweist darauf

## Phase 2 – Hub-/Listenseiten serverseitig (erledigt)
- [x] /, /mieten/, /mieten/bonn/, /standorte/, /hilfe/, /ratgeber/, /ueber-uns/ mit Links/Texten im HTML
- [ ] Offen: /hilfe/<artikel>/ existiert als URL nicht (Hilfe ist eine Seite) – eigene Artikel-URLs wären neue Routen

## Phase 3 – Kategorie-Datenmodell (erledigt)
- [x] displayName/seoName/Plural, Singular-Grammatik, eigene Einleitungen
- [x] Sortierung, falsch einsortierte Produkte, Duplikate 301, Kommunikation = Funkgeräte, Zubehör noindex, Verkaufsartikel „kaufen"

## Phase 4 – Standortbausteine & Verfügbarkeit (erledigt)
- [x] 3 zentrale Textbausteine (src/data/locationBlocks.ts), Status je Produkt/Standort, genau ein Standort- und ein Verfügbarkeitsabsatz, Dedupe „Krefeld und Krefeld", Abholregel für Anhänger/Nutzfahrzeuge/Wohnwagen
- [ ] Offen: echte Öffnungszeiten für Mülheim fehlen in den Stammdaten

## Phase 5 – Produkt-Template (erledigt)
- [x] name/longName/model, Title ≤60, vollständige Meta-Descriptions ohne Auslassungspunkte, Preiszeile brutto (netto in Klammern), Pflichtblöcke im Prerender-HTML, Alternativen/Zubehör/Ratgeber als Links, Product/Offer/FAQ/Breadcrumb-JSON-LD
- [x] Neu vorgerendert: 1.085 Produkt-, 69 Kategorie- und 119 weitere Routen; insgesamt 1.273 Routen, 0 Fehler, 1.069 Sitemap-URLs
- [ ] Offen: Mindestens drei produktspezifische FAQ und Führerschein-Hinweise nur dort ergänzen, wo belastbare Stammdaten vorhanden sind (Teil von Phase 6)

## Phase 6 – Einzelne Produktseiten (teilweise erledigt)
- [x] Führerschein-Hinweise für Anhänger, 7,5-t-Kipper, 3,5-t-Pritschenkipper und Wohnwagen zentral gepflegt
- [x] FAQ-Kaskade für sichtbare Seite, Prerender-HTML und FAQPage-JSON-LD vereinheitlicht; belegte Stammdaten ergänzen fehlende Fragen
- [x] Neu vorgerendert: 1.085 Produkt-, 69 Kategorie- und 119 weitere Routen; insgesamt 1.273 Routen, 0 Fehler, 1.069 Sitemap-URLs
- [ ] Offen: weitere Einzelkorrekturen aus dem Gesamtauftrag (Bobcat, Slug/Name-Abgleich, Verkehrszeichen, Beschallung)

## Phase 7 – Redirects & URL-Hygiene
- [ ] Regelbasierte 301, Trailing Slash, Ortsseiten, Microsite-Ziel

## Phase 8 – Strukturierte Daten & Technik
- [ ] LocalBusiness, ItemList/Article/FAQ, Kategorie-OG-Bilder, Canonical, Performance

## Phase 9 – Abnahme
- [ ] 12 curl-Stichproben, Qualitätschecks, 69 Kategorieseiten Zählabgleich, Redirect-Tests, Sitemap-Check, TODO-Liste
