# Hotfix 0215 – Mengenverfügbarkeit (vorbereitet, nicht angewendet)
Ursache: check_inventory_availability zählte unverbindliche Angebote (in_progress/offer_sent) als gebucht und nutzte den Anfrage- statt den Positionszeitraum; check_availability castete per UTC auf Datum.
Produktiv lesend: baumaschinen-3500 (22e0dac9…), quantities Bonn 1/Krefeld 2/Mülheim 0, 0 Einzelgeräte, 0 Reservierungen; #CYPWN5 offer_sent, Anfrage 02.11.–04.12., 2 Positionen 30.11. → booked 2 → frei 0. #NWHAP2 selbst ausgeschlossen.
Fix: docs/prepared/0215_availability_item_period_hotfix.sql; Rollback: 0215_availability_item_period_rollback.sql (exakte aktuelle Produktivdefinitionen).
Tests: src/test/availabilityItemPeriodDb.test.ts (10, PGlite, inkl. Reproduktion mit Rollback-Definition). Keine echte Parallelität geprüft.
Mengen-Order: confirm_order überspringt Artikel ohne Einzelgeräte (CONTINUE WHEN NOT tracked) – keine Prüfung, kein Transfer. Button bleibt aus; Dialog zeigt freien CMS-Bestand anderer Standorte als Hinweis.
Build: npm run build Exit 0, 1337 Prerender-Routen, 0 Fehler, Sitemap 1129 (full-build.log). Suite 1769/1769. Deno grün: 6 Entry-Points; send-order-confirmation hat 2 bestehende Typfehler (unverändert).
Anwendung nach Freigabe: SQL ausführen, danach check_availability für #NWHAP2 lesend prüfen.
