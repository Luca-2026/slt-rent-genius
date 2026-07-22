# Etappe 5b · Schritt 1 — Feld-Audit Prerender/Sitemap → CMS

**Read-only.** Keine Schema-Änderung, keine Migration, keine Frontend-Änderung.
Skript: `scripts/audit-route-fields.mjs` (run: `node scripts/audit-route-fields.mjs`).

Stand: 22.07.2026 · 369 Zeilen in `managed_products_public` · 402 Einträge in `productSEOData.ts`.

---

## 0) Konsum-Karte: was liest die Prerender-Kette tatsächlich?

`scripts/exportRoutes.ts` schreibt pro Produkt-Route ein `productData`-Payload
in `dist/.prerender-routes.json`, das `scripts/prerender-rental.mjs` und
`src/data/schemas-rental.ts` in HTML/JSON-LD verwandeln:

| Sink | Verbrauchte Felder |
|---|---|
| Prerender HTML (`buildProductInfoBlock`) | `description`, `useCaseBau/Event/Privat`, `h2s`, `faqs` |
| Product-JSON-LD (`schemas-rental.ts`) | `name`, `description`, `image`, `modelName`, `faqs` |
| Title/H1/Intro (`seo-routes-rental.ts`) | `p.name`, `p.description`, `p.image`, `p.modelName`, `seo?.seoTitle`, `seo?.metaDescription`, `seo?.h1`, `seo?.useCaseBau`, `seo?.faqs` |
| Category-Payload | `category`, `locationId`, `productCount`, top-20 `productSummaries` |

**Wichtiger Nebenbefund:** `seo-routes-rental.ts` befüllt das
`productData`-Objekt (Zeilen 772–785) **nicht** mit `h2s`, `useCaseEvent`,
`useCasePrivat`. `exportRoutes.ts` reicht diese Keys zwar weiter, sie sind
aber undefined → die Blöcke „Themen auf dieser Seite" und „Einsatz Event/
Privat" werden im aktuellen HTML **nicht** ausgeliefert. Nur
`seo?.useCaseBau` landet über den Intro-Absatz im Prerender-HTML.
Migrationsrisiko dieser drei Felder ist damit **niedrig** — sie sind heute
faktisch tote Fracht.

---

## 1) Felder aus den statischen Quellen (vollständig)

### 1a) Aus `productSEOData.ts` (Lookup pro Produkt)

| # | Feld | Zweck | In DB? | Static-Füllung | Live-Konsum heute |
|---|---|---|---|---|---|
| 1 | `seoTitle` | Route-Title (60 Zeichen) | **fehlt** | 402 | Title-Tag / OG-Title |
| 2 | `metaDescription` | Meta-Description + Intro | ✅ `seo_meta_description` | 402 | Meta, OG, Intro; DB gewinnt |
| 3 | `h1` | H1 der Detailseite | **fehlt** | 402 | Hero-H1 |
| 4 | `h2s[]` | „Themen auf dieser Seite"-Liste | **fehlt** | 403 | **derzeit nicht gerendert** (s. §0) |
| 5 | `useCaseBau` | Intro-Absatz + „Einsatz Bau" | **fehlt** | 404 | Nur Intro-Absatz aktiv |
| 6 | `useCaseEvent` | „Einsatz Event"-Block | **fehlt** | 404 | **derzeit nicht gerendert** |
| 7 | `useCasePrivat` | „Einsatz Privat"-Block | **fehlt** | 404 | **derzeit nicht gerendert** |
| 8 | `primaryKeywords` | `<meta name="keywords">` (Client, `ProductDetail.tsx:270`) | **fehlt** | 404 | Client-side, nicht prerendert |
| 9 | `is247` | Flag für 24/7-Buchbarkeit | **fehlt** | 404 | derzeit ungelesen im Prerender |
| 10 | `dailyPriceFrom` | „ab X €" + Offer-JSON-LD Kandidat | **fehlt** | 87 | Client-UI in `ProductDetail.tsx` (Preisbadge); **nicht** im Prerender |
| 11 | `faqs[{q,a}]` | FAQ-Accordion + FAQPage-JSON-LD | ✅ `seo_faqs` | 403 | HTML + JSON-LD; DB gewinnt |
| 12 | `excelName` | interne Herkunftsangabe | – | 402 | ungelesen |

Lookup-Schlüssel: `${seoLocPrefix}-${p.id}` mit Fallback `p.id`. Für Mülheim
ist der Prefix historisch `mh-` — de-facto-Ersatz für einen `seoPrefix`.
→ In Etappe 3 ist Mülheim entkoppelt, `mh-`-Einträge verlieren an Bedeutung.

### 1b) Aus `rentalData.ts` + `products/*Products.ts` (statischer Katalog)

| # | Feld | In DB? | Prerender/Route-Konsum |
|---|---|---|---|
| 13 | `p.id` (Slug) | ✅ `slug` | Pfadsegment |
| 14 | `p.name` | ✅ `name` | Title, H1, Breadcrumb, JSON-LD |
| 15 | `p.description` | ✅ `description` | Meta-Fallback, JSON-LD, Prerender-HTML |
| 16 | `p.image` | ✅ `images[0]` | OG-Image, Product-JSON-LD `image` |
| 17 | `p.modelName` | ✅ `model_name` | JSON-LD `brand`+`model` |
| 18 | `p.category` (Zuordnung pro Standort) | ✅ `category` + `available_locations` | Kategorie-Route, Breadcrumb |
| 19 | `p.detailedDescription` | ✅ `detailed_description` | nur Client-UI, nicht prerendert |
| 20 | `p.specifications` (KV) | ✅ `specifications` (jsonb) | nur Client-UI, nicht prerendert |
| 21 | `p.rentwareCode` (pro Standort) | ✅ `rentware_code` (jsonb) | Verfügbarkeits-Text im Intro (`getProductAvailability`) |
| 22 | `p.onRequest` | ✅ `on_request` | Verfügbarkeits-Text im Intro |
| 23 | `p.pricePerDay/Weekend/Month` | ✅ (drei Textspalten) | nur Client-UI |
| 24 | `p.features[]` / `p.tags[]` | ✅ | nur Client-UI |
| 25 | `p.rental_notes[]` (per Kategorie) | ✅ `rental_notes` | Client-UI |
| 26 | `p.weight` / `p.driveType` | ✅ `weight_kg` / `drive_type` | Filter-UI |
| 27 | Bild-Referenzen (`p.images[]`) | ✅ `images[]` | Client-UI; Prerender nutzt nur `[0]` |

### 1c) Route-Bausteine außerhalb des Produkt-Records

| # | Feld | Quelle | In DB? | Kommentar |
|---|---|---|---|---|
| 28 | Kategorie-Titel (DE) | `categoryTitleDe()` in `seo-routes-rental.ts` | – (Constant-Map) | 20 Werte, hartkodiert |
| 29 | Kategorie-Beschreibung | `productCategories` in `rentalData.ts` | (nicht genutzt in Routen) | Nur für UI |
| 30 | Breadcrumb-Segmente | zusammengesetzt aus `locName`, `catTitle`, `p.name` | – | Deterministisch generierbar |
| 31 | Standort-Intro (`buildLocationIntro`) | `locationData.ts` (Adresse, `deliveryRadius`, `serviceCharacter`) | ❌ nicht in `b2b_managed_products` — anderer Scope | Standort-Metadaten, keine Produkt-Ebene |
| 32 | Lokaler Katalog-Content | `localCategoryContent.ts` (55 Einträge: Kategorie×Standort) | **fehlt** | Wird im Produkt-Intro pro Route eingehängt |
| 33 | Verfügbarkeits-Headline | `getProductAvailability(p, loc)` | ableitbar aus `rentware_code` + `on_request` | ✅ heute schon DB-gestützt |
| 34 | Verwandte Kategorien pro Standort | `Object.entries(loc.products)` | ✅ `available_locations` + `category` | ableitbar |

---

## 2) Migrationsvorschlag pro Feld

Kürzel: **a)** neue CMS-Spalte + Migration · **b)** zur Laufzeit ableitbar · **c)** bewusst weglassen.

### SEO-Kernfelder (dringend für „DB = Single Source")

| # | Feld | Empfehlung | Begründung | Aufwand |
|---|---|---|---|---|
| 1 | `seoTitle` | **a)** `seo_title text` | Title ist ranking-relevant; Live-Änderung ohne Redeploy nötig. Migration aus 402 Static-Einträgen; Fallback bleibt `${name} mieten in ${loc}`. | **M** |
| 3 | `h1` | **a)** `seo_h1 text` (optional) | H1 weicht selten von `name` ab, aber für ~50 Produkte differenziert. Alternativ **b)** wenn Aufwand priorisieren. | **S** |
| 4 | `h2s[]` | **c)** bewusst entfallen lassen | Wird heute nicht gerendert (§0). Neu einführen käme einer *neuen* SEO-Feature-Entscheidung gleich, nicht einer Migration. Impact: 0 (Feature ist inaktiv). | **S** |
| 5 | `useCaseBau` | **a)** `seo_use_case_bau text` | Einziger useCase, der heute *tatsächlich* im Intro landet. 404 gepflegte Texte. | **M** |
| 6 | `useCaseEvent` | **a)** `seo_use_case_event text` + Prerender aktivieren | Static gepflegt (404), Sichtbarmachen bringt substanziellen SEO-Content-Zuwachs. Optional in 5b nur Migrations-Spalte, Rendering separat. | **M** |
| 7 | `useCasePrivat` | **a)** `seo_use_case_privat text` + Prerender aktivieren | Analog #6. | **M** |
| 10 | `dailyPriceFrom` | **a)** `daily_price_from numeric` | Preisbadge im Client aktiv (87 Werte gepflegt), Kandidat für Product-JSON-LD `Offer.priceSpecification` (heute noch nicht gebaut, sanitizer entfernt Offer ohne Preis). | **S** |

### SEO-Randfelder

| # | Feld | Empfehlung | Begründung | Aufwand |
|---|---|---|---|---|
| 8 | `primaryKeywords` | **c)** entfallen | `<meta name="keywords">` wird von Google ignoriert; ist reines Legacy. **Zusätzlich TODO im Frontend**: Zeilen 270/277 in `ProductDetail.tsx` können später entsorgt werden. | **S** |
| 9 | `is247` | **b)** ableitbar aus `category` + `rentware_code` | 24/7 gilt heute nur für Anhänger mit SMS-Code — deterministisch aus Kategorie ableitbar; keine Spalte nötig. | **S** |
| 12 | `excelName` | **c)** entfallen | Interne Herkunfts-Notiz aus dem Excel-Import; kein Konsument. | **S** |

### Katalog-Felder (schon in DB)

| # | Feld | Empfehlung | Begründung |
|---|---|---|---|
| 13–27 | `id/name/description/image/modelName/category/…` | **keine Aktion** | Alle Prerender-relevanten Katalog-Felder liegen bereits in `b2b_managed_products` und werden über die View gelesen. |

### Route-Bausteine

| # | Feld | Empfehlung | Begründung | Aufwand |
|---|---|---|---|---|
| 28 | Kategorie-Titel-Map | **b)** ableitbar / Constant beibehalten | 20 Werte, ändern sich extrem selten. Optional: neue `product_categories` Tabelle in einem späteren Sprint. | **S** |
| 30 | Breadcrumbs | **b)** deterministisch | Keine Spalte. | 0 |
| 31 | Standort-Intro | **c)** außerhalb Scope 5b | Bezieht sich auf `locationData.ts` (Standort-Datei, nicht Produkt); Migration wäre eigenes Standort-CMS. | – |
| 32 | `localCategoryContent` (55 Einträge) | **a)** neue Tabelle `b2b_local_category_content` (`location_id`, `category`, `hookline`, `standort_fakten`) | Wird pro Produkt-Route eingehängt, verdient eigene Tabelle statt Spalte auf 369 Produkten (Duplikation × N Produkte pro Kat/Standort). | **M** |
| 33 | Verfügbarkeits-Headline | **b)** bereits ableitbar | Aktiv via `getProductAvailability`. Keine Aktion. | 0 |

---

## 3) Empfohlene Reihenfolge (Etappen 5b.2 ff.)

Regel: klein & entkoppelt vor groß & verzweigt. Kein Sammel-Migrationsschritt.

1. **5b.2 · Aufräumen (S).** Feld 12 (`excelName`) & 8 (`primaryKeywords`)-Konsum im Frontend als Legacy markieren; keine DB-Änderung.
2. **5b.3 · `seo_title` einführen (M).** Neue Spalte, Migration aus 402 Static-Einträgen, `seo-routes-rental.ts` DB-first mit statischem Fallback (Muster identisch zu `seo_meta_description`). Isolierbar, keine JSON-LD-Änderung.
3. **5b.4 · `daily_price_from` (S).** Kleinste Migration, aktiviert bereits sichtbaren Preisbadge unabhängig vom Static-Import und ist Voraussetzung für spätere `Offer`-JSON-LD (separater Sprint).
4. **5b.5 · `seo_use_case_bau` (M).** Bereits im Intro live; migrieren, damit Editorial Änderungen sofort landen. Danach frühestens im gleichen Turn Feld 3 `seo_h1` als Anhängsel.
5. **5b.6 · `seo_use_case_event` + `seo_use_case_privat` (M).** Zwei Spalten, plus einmalige Aktivierung im Prerender (Bugfix aus §0: `productData` in `seo-routes-rental.ts` muss die Felder befüllen). Erst *nach* 5b.5, damit man das Muster einmal validiert hat.
6. **5b.7 · `b2b_local_category_content` als eigene Tabelle (M).** 55 Zeilen, RLS wie `b2b_managed_products` (`anon` nur SELECT über View). Prerender-Konsum in `seo-routes-rental.ts` (Zeile 764) umziehen.
7. **5b.8 · Cleanup (S).** `productSEOData.ts` als Import in `seo-routes-rental.ts` / `exportRoutes.ts` entfernen sobald 5b.5+5b.6 abgenommen. Alte Static-Dateien bleiben als Frontend-Fallback stehen, bis `USE_STATIC_FALLBACK=false` geflippt wird (eigener Turn).

**Bewusst nicht vorgeschlagen:** Migration von `h2s`. Wird nicht gerendert;
das wäre eine neue Feature-Entscheidung, kein Konsolidierungs-Schritt.

---

## 4) Zusammenfassung Aufwand

| Klasse | Felder | Aufwand |
|---|---|---|
| **a) Neue Spalte + Migration** | seo_title, seo_h1, seo_use_case_bau/event/privat, daily_price_from | 5×**M** + 1×**S** |
| **a) Neue Tabelle** | localCategoryContent → `b2b_local_category_content` | **M** |
| **b) Laufzeit-ableitbar** | is247, Kategorie-Titel, Breadcrumbs, Verfügbarkeit | 0 |
| **c) Bewusst weglassen** | h2s, primaryKeywords, excelName | Aufräumaufwand **S** |

Ende Audit. Nächster Turn (dein Go): Umsetzungsplan 5b.2 mit konkretem
Migrations-SQL für Punkt 1 der Reihenfolge.
