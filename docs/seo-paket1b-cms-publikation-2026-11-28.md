# Paket 1B – CMS-Datenpublikation / SEO-Synchronisierung (28.11.2026)

## Ist-Architektur (geprüft)
- Speichern: save_managed_article (eine Transaktion für Artikel + geänderte Standortpreise, stabile UUID), Autosave über useArticleAutosave. Öffentlich nur managed_products_public (is_published = true).
- Dynamisch (sofort nach Speichern): Website liest die View live; Renty liest die View mit 10 Min. Cache (Ablaufzeit = maximale Verzögerung), Rechner nutzen dieselben Live-Daten.
- Statisch (Prerender-HTML, sitemap.xml, llms.txt, Weiterleitungsseiten): entstehen nur in `npm run build`, d. h. nur bei einer Lovable-Veröffentlichung.
- Hosting: Lovable hinter Cloudflare. Es gibt keinen offiziell dokumentierten Weg, nur Inhalte/HTML neu zu erzeugen; jede Veröffentlichung baut den aktuellen Projektstand – inkl. unfreigegebener Codeänderungen. Kein Trigger/Job/Deploy-API im Projekt.

## Entscheidung
Automatischer statischer Refresh nach CMS-Speichern wird NICHT aktiviert, weil er Software-Release und Datenpublikation koppeln würde. Umgesetzt nur sichere Teile:
1. `src/lib/publicationRefresh.ts`: Änderungserkennung (nur öffentliche Felder, Entwürfe nie), Snapshot-Validierung (vollständig per exakter Zählung, nicht leer, keine Duplikate/Entwürfe), Single-Flight-Koordinator mit Revision/Watermark, Coalescing, begrenztem Retry/Backoff, letzter guter Stand bleibt bei Fehlern. Standardmäßig deaktiviert, kein Adapter für Produktion.
2. `scripts/exportRoutes.ts`: Build bricht ab, wenn die CMS-Antwort abgeschnitten/unvollständig ist (Content-Range-Gesamtzahl ≠ Zeilen). Vorher hätte ein Limit über 1.000 Zeilen still einen Teilkatalog erzeugen können. Aktuell 393 publizierte Artikel.
3. Tests: `src/test/publicationRefresh.test.ts` (14).

## Für echten content-only Refresh fehlt
- Offizieller Mechanismus, statische Dateien unabhängig vom Code zu veröffentlichen (oder Build aus festem freigegebenem Commit). Alternative ohne Hosting-Änderung: Sitemap/Prerender bei jeder freigegebenen Veröffentlichung (heutiger Stand).
- Optional (separate Freigabe nötig): Migration für Statusanzeige (Tabelle mit requested/built revision, Status, Fehler; nur Admin lesbar) + Trigger, der bei öffentlich relevanter Änderung die Revision erhöht.

## Zeiten
- Gemessen nicht (keine Produktivänderung erlaubt). Laut Code: Website sofort nach Neuladen; Renty ≤ 10 Min.; statisches HTML/Sitemap erst bei nächster Veröffentlichung.

## Rollback
Änderung an exportRoutes zurücknehmen (git restore). Neues Modul wird von keinem Laufzeitpfad verwendet.
