# Paket 1 – CMS-Ist-Überblick und Änderungen (28.11.2026)

## Datenfluss
- Führend: Tabelle b2b_managed_products (+ b2b_managed_product_location_prices); öffentlich nur View managed_products_public (WHERE is_published = true).
- Pflege: InventoryEditorDialog (Basis/Bilder/Technik/Preise/SEO/Intern), Speichern über save_managed_article, Autosave useArticleAutosave.
- Website live: useManagedProducts liest managed_products_public → managedProductsCache. Status loaded = nur DB; idle/error + USE_STATIC_FALLBACK = statischer Katalog (Stand Juli 2026).
- Renty: Katalog aus managed_products_public, 10 Min. Cache, letzter bekannter Stand als Fallback.
- Prerender/Sitemap/llms: nur beim Build (npm run build: exportRoutes liest managed_products_public → prerender-rental → audit-404-mapping → build-htaccess → emit-legacy-redirect-pages). Kein Trigger/Webhook bei CMS-Speichern; neue/geänderte Artikel erscheinen im initialen HTML/Sitemap erst nach der nächsten Veröffentlichung, im React-Rendering sofort.
- Slug-Historie: keine DB-Spalte; Umbenennungen nur über RENAMED_PRODUCT_SLUGS im Code.

## Hosting
- Live: Lovable-Hosting hinter Cloudflare. .htaccess wird nicht ausgewertet (als Datei ausgeliefert). Kein echter 301/404/410, kein apex→www-Redirect aus dem Projekt heraus.

## Offene Risiken
- Statischer Fallback bei DB-Fehler zeigt alte Artikel/Preise (z. B. bobcat-e10z).
- /mieten/muelheim und /mieten-in/muelheim-an-der-ruhr haben denselben Titel (Kannibalisierung, GSC-Prüfung nötig).
- Startseiten-Text nennt „über 1.700 Mietprodukte“, ältere Texte „über 350 Geräte“ – Zahl unbelegt.
