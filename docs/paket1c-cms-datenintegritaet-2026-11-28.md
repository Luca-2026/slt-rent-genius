# Paket 1C – CMS-Datenintegrität

Stand: 28.11.2026 UTC. Ausgang: `abca73223d15050f1d29bbdddcd21b1bc1cf2830`.
Endstand: Commit mit diesem Bericht und `paket1c-evidence`; Hash über `git log` eindeutig bestimmbar, kein selbstreferenzieller Hash.

## Entscheidung und Grenzen

**1C-Preview: GO ausschließlich für weitere isolierte Abnahme der implementierten Schutzmechanismen. URL-Historie ist vorbereitet, nicht aktiviert. Vollständige 1C-Abnahme noch offen. Produktion: NO-GO.**

Keine Veröffentlichung, produktive Migration, Edge-Deployment, Artikel-/Preis-/Bestands-/Rechteänderung, echte Anfrage/Buchung/Zahlung/Erstattung/Mail, Secret- oder Hostingänderung. Finanzcode, reviewed SQL 0213, dessen Rollback und Original-Prepared-Artefakt bleiben unverändert und inaktiv. Produktiv ausschließlich öffentliche Spaltendefinitionen, Preis-Viewdefinition und aggregierte Anzahl gelesen: **393 veröffentlichte Artikel** zum Abfragezeitpunkt; kein Testartikel und keine Kundendaten gelesen.

Die vollständige Produktionskette wurde **nicht manuell ausgeführt**: diese Umgebung untersagt manuelle Projektbuilds/App-Typechecks und prüft automatisch. Aktueller automatischer Eintrag: **build OK**, einschließlich App-Typprüfung. Das belegt keinen vollständig protokollierten Produktionslauf Export → Prerender → Sitemap → Hosting. Dieser Lauf im zugelassenen CI bleibt erforderlich. Deno wurde tatsächlich separat ausgeführt.

## Ist-/Soll-Datenfluss

```text
Vorhandener Artikeleditor / useArticleAutosave
  -> save_managed_article: stabile UUID, atomarer Artikel-/Standortpreis-Save
  -> b2b_managed_products + b2b_managed_product_location_prices
  -> managed_products_public: nur publizierte Artikel, keine internen Bestandsfelder
  -> public_product_prices: publizierte Artikel, Schlüssel (managed_product_id, location)
  -> vollständige paginierte Reads + Inhaltsabgleich
     -> Website-Cache / Kataloghook / Rechner
     -> Renty / Fonio
     -> kontrollierter statischer SEO-Export

Nur nach separater Freigabe:
  erfolgreicher CMS-UPDATE/DELETE -> atomarer History-Trigger
  -> alte vollständige Standort-/Kategorie-/Artikelpfade + Artikel-UUID
  -> public_product_url_redirects: ausschließlich eindeutig aktuelle öffentliche Ziele
  -> gemeinsamer Resolver -> vorhandener Router / Legacy-Generator
```

Kategorie für URL ist `category`, nicht `subcategory` oder `main_category`. Standortangebot ist `available_locations`; Vor-Ort-Hinweis separat `stocked_locations`. Frontend-ID bleibt aus Kompatibilitätsgründen Slug; `managedId`/Datenbank-UUID ist die dauerhafte Identität für History und Preise. Diese öffentlichen Quellen beweisen **keine Terminverfügbarkeit**; bestehende serverseitige Quote-/Verfügbarkeitsprüfungen bleiben erforderlich.

Belegte vorherige Vollkataloglimits: Provider und Hook unpaginiert; Renty unpaginiert mit zehn Minuten Cache und altem Cache bei Fehler; Fonio publizierter Basistabellen-Katalog unpaginiert, 60 Sekunden Cache; Export verlangte 10.000, konnte aber durch den 1.000er Data-API-Grenzwert abgeschnitten werden. Suchausgabe-Limits von Renty 8 und Fonio 5/3 bleiben unverändert. CRM-Anruferabfrage mit bewusstem Limit 2.000 wurde nicht fachfremd verändert.

## Pagination und Konsistenz

- Runtime-neutraler Helper `supabase/functions/_shared/catalog-pagination.ts`, REST-Adapter `catalog-rest.ts`, zusammengesetzter Standortpreisadapter `catalog-location-prices.ts`.
- Artikel nach eindeutiger UUID aufsteigend; Cursor `id > letzter Schlüssel`. Standortpreise nach UUID und Standort; keine Name-/Slug-Sortierung, kein N+1.
- Seitengröße 500, höchstens 100.000 Zeilen und 1.000 Seiten, zehn Sekunden je Anfrage, 60 Sekunden Gesamtlauf, zwei vollständige Versuche. Abbruch signalisiert; kein Teilresultat.
- Exakter PostgREST-Count gilt **nach Cursorfilter**, also für verbleibende Zeilen. Gesamterwartung = bisherige Zeilen + verbleibender Count. Kurze Seiten gelten nicht als Ende: kleineres Serverlimit wird unterstützt. Terminierung wird mit leerer Schlussseite geprüft, auch auf exakten Grenzen.
- Ungültige/unbekannte Counts, fehlende/doppelte/nicht fortschreitende IDs, Reihenfolgefehler, überschrittene Grenzen, Timeout/Fehler und vorzeitiges Ende blockieren die komplette Lieferung.
- Zwei vollständige Inhaltsreads müssen kanonisch identisch sein, nicht lediglich gleich viele IDs haben. Export gleicht zusätzlich Produkt-/Standortpreis-Bundles erneut ab. Preise/Specs/SEO-Änderungen bei gleichem Count werden erkannt.
- **Keine MVCC-/Revisionsgarantie:** zwei gleiche Beobachtungen schließen alle adversarialen Zwischenänderungen oder Änderungen direkt danach nicht aus. Vorhandene öffentliche API liefert keine gemeinsame Snapshotrevision. Bei beobachteter Änderung Retry, bei anhaltender Änderung Sperre; für streng transaktionalen Snapshot ist künftig separat geprüfte serverseitige Snapshot-/Revisionsunterstützung nötig.
- Bestätigt leer ist gültig: Website zeigt keine Artikel; Export entfernt alle statischen Produktseiten. Unvollständig leer bleibt Fehler. Exportfehler überschreibt in den lokalen Tests nicht das letzte validierte Artefakt; eine neue CI-Ausgabe darf erst nach komplettem Erfolg aktiviert werden.

Öffentliche Produktidentität, sichere Segmente/Standorte, Preise und private/draft-Leakage werden geprüft. Browserloader validiert außerdem Bilderlisten, technische Daten, Text-/FAQ-Formate. Rechnerpreise lesen die öffentliche View; Standortpreisfehler werden nicht als leere gültige Preise behandelt. SEO-Standortpreise benutzen denselben `resolveProductPrices` wie die Website, inklusive gemeinsamer/standortabhängiger Tarife.

## URL-Historie: vorbereitet und inaktiv

`docs/prepared/0214_managed_article_url_history.sql` liegt **außerhalb automatischer Migrationen**, unabhängig von Finanz-0213. Keine Live-Anwendung.

- AFTER-Trigger erfasst alte öffentlich angebotene Pfade bei Slug-, Kategorie-, Standort-, Publikationsänderung oder Löschung innerhalb derselben Transaktion wie der bestehende Save. Keine History für reine Entwürfe/erste Publikation/Text-/Preisänderung.
- Eindeutigkeit `(Artikel-UUID, alter vollständiger Pfad)`; Zeitstempel; keine browser-only Wahrheit. Keine Rekonstruktion unbekannter Vergangenheit. Löschung darf History nicht entfernen; bewusst kein löschendes FK-Verhalten.
- Direktzugriff auf Rohhistory für anon/authenticated gesperrt, RLS aktiviert; service_role explizit berechtigt. Definer-Trigger hat leeren festen search_path, qualifizierte Objekte, keine dynamischen Nutzer-SQL-Eingaben. Öffentliche View zeigt nur minimale eindeutige Routingreferenzen zu publizierten, am jeweiligen Standort angebotenen Artikeln, keine privaten Artikelinhalte.
- Aktuelle Route gewinnt bei Wiederverwendung/Rückbenennung. Mehrere historische Eigentümer bleiben unresolved. Deaktivierung/Standortentfernung/Löschung liefert kein Ziel, niemals andere Filiale/Homepage. Ziel wird direkt aus aktueller UUID aufgelöst, keine Kette/Schleife.
- Unicode-Segmente werden einmal UTF-8-kodiert; manipulierte/mehrfach kodierte Trennzeichen werden vom Resolver verworfen.
- `src/lib/productUrlHistory.ts`: **CMS_URL_HISTORY_ENABLED = false**. Export liest History nur mit gesondertem `CMS_URL_HISTORY_ENABLED=true`. Ohne Aktivierung keine Abfrage; bei Runtime-Lesefehler keine historische Weiterleitung. Der bestehende Save/RPC und alte Clients funktionieren unabhängig weiter.
- Vor Aktivierung sind unabhängiger SQL-Review, vollständige PostgreSQL-Konkurrenztests und abgestimmte SQL/UI/Export-Freigabe nötig. Die lokale PGlite-Abnahme ist kein Nachweis echter Mehrverbindungsparallelität.

Router prüft exakte aktuelle Kategorie/Standortzugehörigkeit. Bekannte Legacy-Produkte dürfen nur auf bestätigte aktuelle Zielartikel führen; unbekannte Produktpfade nicht auf Homepage/Hubs. Export prüft bestehende Legacy-Regeln gegen gültige Zielrouten, aktuelle Quellen und Duplikate. Die vorhandenen 2.383 Legacy-Seiten wurden nicht live umgeschrieben. Konfliktregeln wurden synthetisch geprüft; vollständige reale Legacy-Stichproben/Prerenderabnahme fehlen.

**Hostingblocker 1B bleibt:** vorhandene .htaccess wird auf dem aktuellen Hosting nicht zuverlässig ausgewertet. Client-Navigate und noindex/canonical/refresh-Seiten sind keine echten HTTP301/404. Prozentkodierte Historypfade sind vom bestehenden Legacy-Seitengenerator noch nicht vollständig abgenommen; dessen SAFE-Prüfung kann sie auslassen. Nicht ohne eigene Freigabe erweitern. Bei fehlendem Ziel nutzt die SPA bestehende Not-found/noindex-Darstellung, ohne erfundenen Serverstatus.

## Fallback-/Recovery-/Freshness-Matrix

| Zustand | Artikel/Preise/Empfehlungen | Allgemeines/Kontakt/Warenkorb |
|---|---|---|
| Vollständig bestätigt, unter 60 Sekunden | Nutzbar als begrenzte aktuelle Katalogbeobachtung; keine Terminfreigabe | Normaler Ablauf, serverseitige Quote weiter maßgeblich |
| Initiales Laden | Keine historischen Artikel | Allgemeine Seiten/Kontakt bleiben |
| Erfolgreich leer | Keine Artikel, kein Juli-Fallback | Gültiger leerer Katalog, Kontakt bleibt |
| Fehler/Teilseiten/Timeout | Website sofort fail-closed; Renty kein abgelaufener Cache-Fallback | Freundliche Meldung, keine Aussage „kein Bestand“ |
| Bestätigung mindestens 60 Sekunden alt | Zugriff/Empfehlungen/Preis-Snapshot gesperrt | Kein zweiter persistenter Produktstamm |
| Recovery | Erst vollständige neue Bestätigung, neue Preise/Artikel | Bestehender Warenkorb bleibt; Quote wird erneut serverseitig geprüft |

Website aktualisiert serialisiert alle 30 Sekunden, bei Fokus und vorhandenen Artikel-Realtime-Ereignissen; unabhängiger Ablauftimer informiert die Verbraucher. Renty/Fonio verwenden maximal 60 Sekunden bestätigten Katalog, keine zehnminütigen Altartikel. Renty-Sanitisierung hat request-lokale bestätigte Artikellinks; statische Sitemaplinks legitimieren nur allgemeine Standort-/Kategorieseiten und können deaktivierte Artikel nicht dauerhaft verifizieren.

Rechner-Mengen-/Leistungsberechnung bleibt möglich. Aushub/Dumper empfehlen nur aktuelle Cacheartikel; Bautrocknerpreise lesen öffentliche Artikel/Preise und berücksichtigen Standortangebot/Fehler. Legacy-Kompatibilitätsreferenzen werden auf aktuell bestätigte Artikel zurückaufgelöst. Warenkorbinhalt wird bei Datenfehler nicht still gelöscht; neue ungeprüfte Artikel/Pakete und Fortsetzung/Versand werden gesperrt, Preise nicht bestätigt. Die bestehende 15-Minuten-Frist bleibt unverändert. Kurze Störungen setzen valide allgemeine Seiten nicht pauschal noindex; Browser-Ausfalltest prüft dies am Artikeldetail.

## Mitarbeiterworkflow

Bestehender Editor, Autosave und atomarer Save bleiben die einzigen Pflegewege. Keine neue Pflichtaufgabe und kein manuelles Redirect-Pflegen. In diesem Stand ist History transparent inaktiv, bis separat freigegeben. CMS-Speichern löst nach wie vor **keine automatische Veröffentlichung/SEO-Regeneration** aus. Neue statische Artefakte nur aus validiertem vollständigem CMS-Katalog bei ausdrücklich genehmigtem Release.

## Betroffene Dateien

- Shared: `catalog-pagination.ts`, `catalog-rest.ts`, `catalog-location-prices.ts`, `product-url-history.ts`.
- Browser: `src/lib/publicCatalog.ts`, `productUrlHistory.ts`, `publicationRefresh.ts`; `useManagedProducts.ts`; `ManagedProductsProvider.tsx`; `managedProductsCache.ts`, `rentalData.ts`, `featureFlags.ts`.
- Darstellung/Verbraucher: `LegacyRedirects.tsx`, `ProductDetail.tsx`, `CategoryProducts.tsx`, `CalculatorRecommendations.tsx`, `DryingCalculator.tsx`, `RentalRequestCart.tsx`.
- Export: `scripts/exportRoutes.ts`.
- Edge-Code ausschließlich lokal: `public-chat/index.ts`, `renty-agent.ts`, `fonio-live-lookup/index.ts`.
- Tests: `catalogPagination`, `catalogRecovery`, `productUrlHistoryDb`, `catalogExport`; bestehende `publicationRefresh`, `blogLinks`, `solutionLinks`, `signCartCheckout`; synthetische Fixture `fixtures/publicStaticCatalog.ts`; `e2e/isolated-public-regression.py`, `isolated-catalog-recovery.py`.
- Prepared-SQL 0214, dieser Bericht/Evidence, AGENTS und Roadmap. Keine Finanzartefakte verändert.

## Tatsächlich ausgeführte Abnahme

| Prüfung | Ergebnis / Grenze |
|---|---|
| Baseline Vollsuite | **1.727 bestanden / 233 Dateien** |
| Baseline öffentliche Browser | **42 bestanden**, externe Writes/Auth/Provider/Mails abgefangen |
| Baseline vier Deno-Entrypoints | **exit 0** |
| Zwischenlauf nach 1C | 1.756 bestanden / 3 fehlgeschlagen: zwei historische Linktests hatten keinen expliziten Katalogfixture, Schildertest keinen bestätigten Cache. Fixtures ergänzt, keine Assertions entfernt/abgeschwächt |
| Finale Vollsuite, wiederholt nach letzter Codeänderung | **1.759 bestanden / 237 Dateien / 0 fehlgeschlagen**, +32 Tests |
| Pagination | 0/1/999/1000/1001/3500/7001; kleinere Servercap, Counts/IDs/Ordnung, finale Timeoutseite, Churn, Retry, leere Antwort, echte Fehler |
| Lokale History-DB | 11 PGlite-Tests: echter Save-RPC, Entwurf/Publikation, Preis/Specs/SEO/Bilder, mehrere Renames/Kategorien/Standorte, Deaktivierung/Reaktivierung, Reuse/Kollision, Löschung, Rollback, Wiederholung/Grants, Unicode |
| Tatsächlicher Export mit synthetischem HTTP-Transport | 1.001 Artikel, **3.003 Produktpfade**, Servercap99; Standortpreise, Legacy-Zielprüfung, bestätigter leerer Katalog, Ausfall erhält letzte validierte Ausgabe. Kein Produktionsbuild |
| Öffentliche Browser nachher | **42 bestanden**, 390/1280 px, alle drei Standorte, Bagger+Dumper im gemeinsamen Warenkorb, Preise/Projektbericht, Reload/Deduplizierung, Aushub/Trocknung/Strom, Tools/OG |
| Zusätzlicher Ausfall-/Recovery-Browser | **12 bestanden**, alle drei Standorte: gesund → Ausfall mit Kontakt und ohne pauschales noindex → bestätigt leer/Not-found → Recovery; keine echten Aktionen |
| PDFs | Drei synthetische A4-Berichte im 42er Ablauf erstellt; Browserassertion identischer Rechner-/Berichtsbetrag. Keine echten Auftragsdokumente |
| Deno final, echte Entry Points/transitiv | **exit 0** für vier Finanzentrypoints plus public-chat und fonio-live-lookup |
| Automatische App-Prüfung | **build OK**, vollständiges Log archiviert; kein separat manuell ausgeführter App-Typecheck |
| Vollständiger Produktionsbuild/Prerender/Sitemap | **Nicht ausgeführt**, erlaubtes CI erforderlich |
| Authentifizierter CMS/B2B/Finanz/Stripe/Rentware-E2E | **Nicht getestet**, keine nachweislich sichere isolierte Auth-/Providerumgebung |
| Aktivierte History im echten Router samt statischem Prerender/Legacy-Stichproben | **Nicht getestet**, Feature inaktiv, separate SQL-/Rolloutfreigabe erforderlich |
| Echte parallele PostgreSQL-Saves, alle Manipulations-/Rolloutkombinationen | **Nicht vollständig getestet**, PGlite ist kein Mehrverbindungsserver |
| Live-KI-Gespräch / spätere MCP-Schnittstelle | **Nicht getestet / nicht neu gebaut**; bestehende deterministische Renty-Tooltests bestanden in Vollsuite |

Vollständige Ausgaben: `docs/paket1c-evidence/`. Browserabbau zeigt vorbestehende TargetClosedError-Warnungen, zentrale Checks bestanden, pageerror-Liste leer. Zwischenzeitliche Browser-Countfixture wurde um echte CORS-Expose-Headers ergänzt; keine Sicherheitsprüfung ausgeschaltet. Unit-fetch-Sperre bleibt. Historische TS-Artikel dienen in Linktests ausdrücklich nur als isolierte Fixture, nicht als Runtime-Fallback. Screenshots visuell geprüft, temporär unter `/tmp/browser`; kein dauerhafter Screenshotnachweis behauptet.

## Release-/Rollbackplan und offene Freigaben

1. Backup von Quellstand, Schema/Daten, Storage und Funktionsdefinitionen; isolierte Wiederherstellung tatsächlich prüfen. Keine Finanzbelege zurücksetzen.
2. Sichere Staging-DB/Auth/Storage und synthetische CMS-Mitarbeiter-/B2B-Konten, Mail-Sink und getrennte Provider-/Rentware-Testwege bereitstellen; keine produktiven Kundenkonten.
3. Vollständige CMS-Mitarbeiterabnahme und 0214-SQL-Review mit echter PostgreSQL-Parallelität; bislang publizierte Route/Legacykonflikte und Unicode-Prerender im erlaubten CI prüfen. Fehlende Tabelle/Flagoff gegen alte Clients prüfen.
4. Separates 1C-Release: erst vorbereitete 0214 nach ausdrücklicher SQL-Freigabe; anschließend kompatible UI/Exportflag und Katalogfunktionen separat freigeben. Keine implizite Mitaktivierung von Finanz-0213 oder Entwicklungsbranch-Publish.
5. Vollständiger Produktionsbuild mit vollständigem Log; keine Teilartefakte aktivieren. Sitemap, Canonicals, Legacy-Stichproben, Kontakt/Recovery, alle Rechner/Preise/PDF und Auth-Strecken vor Release kontrollieren. HTTP301/404 bleibt Hostingentscheidung.
6. Bei Fehler Historyflags aus, Capture-Trigger kontrolliert deaktivieren, **Historytabelle/Nachweise behalten**. Frontend-Rollback darf den unsicheren statischen Artikelfallback nicht wieder aktivieren. Letzten validierten Release behalten; Geld-/Dokumentnachweise und Finance-0213-Rollback unverändert erhalten.

**1B.3 bleibt Produktions-NO-GO:** kaufmännische Storno-Bar-/Kassenperioden-/DATEV-Abstimmung, Bankbelegabgleich, Admin-Zuordnung für einen Standortmitarbeiter, echte isolierte Mitarbeiter-/Provider-/Parallelitätsabnahme, erlaubter Vollbuild und separate Finanz-SQL/Edge/UI-Freigaben fehlen weiterhin. Keine Entscheidungen/Rechte eigenmächtig geändert.

1C kann unabhängig weiter isoliert abgenommen werden; **keine vollständige Release-Readiness oder Produktionsfreigabe behauptet**.