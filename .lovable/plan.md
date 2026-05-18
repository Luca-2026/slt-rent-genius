## Ziel

Google soll alle Standort-Varianten (Bonn, Mülheim, Krefeld) als eigenständig indexieren – nicht mehr als "Alternative Seite mit richtigem kanonischen Tag" wegwerfen.

Zwei Hebel:

1. **Automatik "echte Verfügbarkeit":** Ist für ein Produkt ein `rentwareCode[bonn]` (bzw. `muelheim`) hinterlegt → "Verfügbar in Bonn" (bzw. Mülheim) mit Sofort-Buchbarkeit. Fehlt der Code → "Auf Anfrage in Bonn – Lieferung aus Krefeld in 24 h". Beide Varianten sind crawl- und indexierbar (`index, follow`), unterscheiden sich aber sichtbar im DOM.
2. **Sichtbare, einzigartige Inhalte pro Standort-Produkt-Kombi** (nicht nur `<head>`), damit Google echte Differenzierung sieht.

## Bestandsaufnahme

- `Product.rentwareCode: Record<string, string>` ist bereits pro Standort gepflegt (Krefeld, Bonn, Mülheim). Stand heute: ~30 Bonn-Codes, ~12 Mülheim-Codes – Rest läuft als "auf Anfrage" aus Krefeld.
- `StandortVerfuegbarkeit.tsx` differenziert bisher nur per Standort-Charakter (`full-warehouse` / `service-handover` / `delivery-only`), nicht per Produkt-Verfügbarkeit.
- Canonical zeigt aktuell pro Variante auf sich selbst → Google kanonisiert auf Krefeld, weil Body fast identisch.

## Lösung – 4 Bausteine

### 1. Verfügbarkeits-Automatik (`getProductAvailability`)

Neue Helper-Funktion in `src/lib/productAvailability.ts`:

```ts
type AvailabilityStatus = "available-local" | "on-request" | "available-warehouse";
function getProductAvailability(product, locationId): {
  status, badgeLabel, headline, body, deliveryHours, isBookable
}
```

Regel:
- `rentwareCode[locationId]` vorhanden → `available-local` ("Sofort verfügbar in {Name}")
- Standort ist `full-warehouse` (Krefeld) → `available-warehouse`
- Sonst → `on-request` ("Auf Anfrage – Lieferung aus Krefeld in 24 h")

### 2. `StandortVerfuegbarkeit` erweitern

Neue Props: `product`, damit pro Produkt unterschieden wird:
- **Available-local:** grünes Badge "Vor Ort in Bonn verfügbar", konkrete Lieferzeit, Buttons "Jetzt verfügbar prüfen".
- **On-request:** blaues Badge "Auf Anfrage", 24h-Lieferversprechen aus Krefeld, Anfrage-CTA, Hinweis "Crew, Beratung & Übergabe in {Stadt}".
- Bei beiden: 2–3 standortspezifische Sätze (Lieferradius, A-Autobahnen, Zielgruppen Bonn/Mülheim).

### 3. Standortspezifischer SSR-Content im `ProductDetail`

Pro Standort sichtbarer Block (kein nur-`<head>`):

- **Lokaler Mietpark-Hinweis** (Adresse, Anfahrt, ÖPNV-Anbindung) – aus `locationData.ts`.
- **Verfügbarkeits-Sektion** (Baustein 2) – sichtbar verschieden je Status.
- **1–2 standortspezifische FAQ** (z. B. "Liefern Sie {Produkt} in Bonn-Bad Godesberg?" / "Mülheim Innenstadt mit A40-Sperrung?").
- **Lokaler Use-Case-Absatz** (z. B. "Tiefbau am Rheinufer Bonn", "Industrieprojekte Ruhrgebiet Mülheim").
- Diese Blöcke gehen in **Prerender** + Live-Render, damit Googlebot sie ohne JS sieht.

Quelle der Texte: bereits vorhandene `localSeoData` + neue, kompakte Felder pro Kategorie (Verdichtung, Bagger, Anhänger, Werkzeug, Event, Möbel/Zelte) – nicht pro Einzelprodukt, sondern pro **Kategorie × Standort**. So bleibt der Pflegeaufwand handhabbar.

### 4. Self-Canonical für alle Standort-Varianten

Canonical bleibt pro Variante self-canonical (Bonn-URL → Bonn-Canonical), weil jetzt echter Content-Unterschied existiert. Krefeld-Konsolidierung (Option A) wird verworfen.

## Schrittweise Umsetzung (pro Kategorie – Bonn & Mülheim)

Reihenfolge: **erst die kleinste Kategorie (Verdichtung – 6 Produkte), dann hochskalieren**, damit wir nach jedem Schritt im Browser prüfen können.

1. **Sprint 1 – Infrastruktur (gemeinsam, einmalig):**
   - `getProductAvailability` Helper + Unit-Test
   - `StandortVerfuegbarkeit` erweitern (Props: product, status-spezifische Darstellung)
   - Neue Datei `src/data/localCategoryContent.ts` mit Schema `{ locationId, categoryId } → { hookline, useCase, faqs[], deliveryNote }`
   - `ProductDetail.tsx` rendert neue Blöcke (sichtbar, im SSR-Hero ebenfalls)
   - `scripts/prerender-rental.mjs` schreibt die neuen Blöcke in den Hero-Fallback

2. **Sprint 2 – Kategorie "Verdichtung" (Bonn):**
   - 6 Produkte: VP16, VP25, HVP30, HVP38, HVP50, Stampfer GS72
   - Content für `bonn/verdichtung` schreiben (Rüttelplatten-Use-Cases, A555/A565, typische Bonner Tiefbau-Stadtteile)
   - Visueller QA-Check + GSC-URL-Inspektion

3. **Sprint 3 – Kategorie "Verdichtung" (Mülheim):**
   - Mülheim-Service-Handover-Story + Ruhrgebiets-Use-Cases
   - QA

4. **Sprint 4–N:** restliche Kategorien analog, jeweils Bonn dann Mülheim:
   - Erdbewegung / Bagger
   - Anhänger
   - Werkzeug / Bohrhammer
   - Gartenpflege
   - Event / Möbel / Zelte
   - Hebebühnen
   - …(nach `getCategoriesForLocation('bonn')` / `('muelheim')` durchgehen)

5. **Abschluss:**
   - Sitemap-Lastmod auf alle Bonn/Mülheim-URLs hochsetzen
   - 50 Stichproben-URLs in GSC zur Re-Indexierung einreichen
   - Smoke-Test (`scripts/smoke-canonical.mjs`) erweitern um "Standort-spezifischer Content vorhanden"

## Technische Details

- **Keine Datenbankänderungen** – alles statisch in `src/data/`.
- **Keine API-Calls für Verfügbarkeit** – `rentwareCode[locationId]` ist die Wahrheit.
- **SEO:** Robots bleibt `index, follow` für alle Varianten, Canonical bleibt self-canonical.
- **Schema.org Offer:** Bei `available-local` `availability: InStock`, bei `on-request` `availability: PreOrder` mit `deliveryLeadTime: PT24H`.
- **Performance:** Neue Blöcke sind reines HTML/CSS, keine zusätzlichen Bundle-Imports.
- **Pflegeaufwand:** Pro Kategorie × Standort ein Eintrag (~10 Kategorien × 2 Standorte = 20 Einträge) statt pro Produkt × Standort (~450 Einträge).

## Was ich zuerst tue

Sprint 1 (Infrastruktur) + Sprint 2 (Bonn/Verdichtung) in dieser Antwort. Danach pausiere ich, du prüfst eine URL live in der GSC, und wir gehen Kategorie für Kategorie weiter.
