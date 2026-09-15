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

## Phase 5 – Produkt-Template
- [ ] name/longName/model, Title ≤60, Meta 120–155, Preiszeile brutto (netto in Klammern), Pflichtblöcke, Alternativen als Links, Führerschein-Logik, JSON-LD

## Phase 6 – Einzelne Produktseiten
- [ ] Kipper, Pritschenkipper, Wohnwagen, Bobcat, Slug/Name-Abgleich, Verkehrszeichen, Beschallung, FAQ-Ergänzungen

## Phase 7 – Redirects & URL-Hygiene
- [ ] Regelbasierte 301, Trailing Slash, Ortsseiten, Microsite-Ziel

## Phase 8 – Strukturierte Daten & Technik
- [ ] LocalBusiness, ItemList/Article/FAQ, Kategorie-OG-Bilder, Canonical, Performance

## Phase 9 – Abnahme
- [ ] 12 curl-Stichproben, Qualitätschecks, 69 Kategorieseiten Zählabgleich, Redirect-Tests, Sitemap-Check, TODO-Liste
