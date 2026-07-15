
# Mietartikel-CMS im B2B-Admin-Portal

Neuer Reiter **„Inventar"** im `/b2b/admin`-Bereich. Admins können bestehende Artikel bearbeiten und neue anlegen, inkl. KI-generiertem SEO-Content, Bildern, technischen Daten, Rentware-Codes und internen Bestandsmengen pro Standort. Änderungen werden im öffentlichen Frontend und im B2B-Portal wirksam.

## 1. Datenmodell (Supabase)

### Neue Tabelle `b2b_managed_products`
Hält alle CMS-gepflegten Artikel. Feldstruktur spiegelt das bestehende `Product`-Interface aus `src/data/rentalData.ts`:

- `id` uuid
- `slug` text unique – identisch zur URL im Frontend, dient als Merge-Key gegen TS-Daten
- `name`, `model_name`, `description`, `detailed_description` text
- `category` text (z. B. `erdbewegung`, `geschirr`), FK per String zu `productCategories`
- `available_locations` text[] – `["krefeld","bonn","muelheim"]`
- `images` text[] – Storage-URLs
- `specifications` jsonb (Key/Value)
- `features`, `tags`, `rental_notes` text[]
- `price_per_day`, `price_weekend`, `price_per_month`, `min_rental_months`, `weight_kg`, `drive_type`
- `rentware_code` jsonb – `{ "krefeld": "…", "bonn": "…" }` (Memory-Regel greift automatisch)
- `pdf_url`, `external_manual_url`, `video_url`, `video_urls`
- `sort_order` int
- **Intern (nie ans Frontend):** `quantities` jsonb `{ "krefeld": 3, "bonn": 1, "muelheim": 0 }`, `quantity_notes` jsonb `{ "krefeld": "1 St. in Werkstatt", … }`
- `seo_meta_description`, `seo_faqs` jsonb (Array `{ question, answer }`), `seo_local_content` jsonb pro Standort
- `is_published` boolean default false
- `created_by`, `updated_by` uuid, `created_at`, `updated_at`

### Neue Tabelle `b2b_managed_product_overrides` (optional, siehe unten)
Nicht nötig – wir nutzen `slug` als Merge-Key: Existiert in DB ein Datensatz mit gleicher Slug wie ein TS-Artikel, überschreibt DB im Frontend die TS-Version.

### RLS & Grants
- SELECT `is_published=true` für `anon` + `authenticated` (nur veröffentlichte Artikel öffentlich sichtbar; interne Felder `quantities`/`quantity_notes` bleiben trotzdem lesbar – deshalb kommt ein **View** `public.managed_products_public` ohne die internen Felder + Base-Table SELECT nur für Admins).
- Admin (`has_role(auth.uid(),'admin')`): full access auf Base-Table.
- `service_role`: full access.

### Neuer Storage-Bucket `product-images` (public read, admin write).

## 2. Frontend-Merge (Hybrid: DB überschreibt TS)

`src/data/rentalData.ts` bekommt einen asynchronen Loader:
- Bei Initialisierung (via React Query in einem neuen `useRentalData`-Hook) werden alle veröffentlichten Einträge aus `managed_products_public` geladen.
- Merge-Logik: pro Standort werden Kategorien/Produkte aus TS-Dateien geholt und Einträge mit gleicher Slug durch DB-Version ersetzt; komplett neue DB-Einträge werden je nach `available_locations` in die entsprechende Kategorie eingefügt.
- Alle Consumer (`CategoryProducts`, `ProductDetail`, `RentwareSearch`, `HeroSearch`, `B2BProducts`, `B2BProductDetail`) rufen den Hook statt der direkten TS-Exports.
- Bestehende Helper (`getProductsForLocationCategory`, `getAllProductsForLocation`, `getProductById`, `generateProductSlug`) bekommen jeweils eine „mit merged data"-Variante; die statischen Exports bleiben als Fallback (SSR/Prerendering, siehe unten).

**Prerendering (`scripts/prerender-rental.mjs`)**: erweitert um DB-Fetch via anon-Key vor dem Build, damit CMS-Artikel auch in HTML/Sitemap landen.

## 3. Admin-UI – neuer Tab „Inventar"

`src/pages/b2b/AdminDashboard.tsx` bekommt Tab **Inventar** mit:

**Listenansicht** (`AdminInventoryTab.tsx`)
- Filter: Standort, Kategorie, Suche, Status (veröffentlicht/Entwurf), Quelle (DB/TS).
- Tabelle: Bild, Name, Kategorie, Standorte, Bestand Krefeld/Bonn/Mülheim, Rentware-Codes, Status.
- Aktionen: Neu, Bearbeiten, Duplizieren, Veröffentlichen/Verstecken, Löschen.
- TS-Artikel erscheinen als „TS (schreibgeschützt)" – Klick „Bearbeiten" legt automatisch einen DB-Override mit vorbefüllten Feldern an.

**Bearbeitungsdialog** (`InventoryEditorDialog.tsx`) mit Tabs:
1. **Basis** – Name, Kategorie, Standorte, Slug (auto), Kurzbeschreibung, Sortierung
2. **Bilder** – Upload in `product-images` mit Reorder + Alt-Text
3. **Technische Daten** – Spec-Editor (Key/Value Rows), Features, Gewicht, Antriebsart
4. **Preise & Buchung** – Preise, Rentware-Code je Standort (Memory-Regel: sobald Code gesetzt → automatisch `onRequest=false`, „auf Anfrage"-Sätze werden aus Content-Feldern gestrippt und der Nutzer sieht dies als Hinweis)
5. **SEO & Content** – Meta-Description, Long-Description, FAQs, lokaler Content pro Standort. Jedes Feld hat **„KI generieren"** und **„Neu generieren"**.
6. **Intern (Bestand)** – Menge + Notiz je Standort. Rot markiert „Nur intern – nicht im Frontend sichtbar." Leere Felder bleiben leer und werden bei bestehenden Artikeln nicht angefasst.

## 4. Edge Functions

**`admin-generate-product-content`** (verify_jwt=false, manueller Admin-Check)
- Input: `{ field: "meta_description" | "detailed_description" | "faqs" | "local_content", product: {...}, location?: "krefeld"|"bonn"|"muelheim" }`
- Prüft Admin-Rolle, ruft Lovable AI Gateway (`google/gemini-2.5-flash`) mit Prompts pro Feldtyp. Nutzt bestehende SLT-Tone-of-Voice-Regeln (Du-Ansprache, SLT CI, keine erfundenen Specs).
- Output: strukturierter Text/JSON, kein automatisches Speichern – Admin sieht Preview und übernimmt per Klick.
- Rate-Limit-Handling für 402/429.

**`admin-manage-product`** (verify_jwt=false, Admin-Check)
- Insert/Update/Delete Wrapper für `b2b_managed_products` (mit Slug-Validierung, Auto-Slug aus Name, Konsistenz-Check „Rentware-Code ⇒ keine 'auf Anfrage'-Sätze").

## 5. Sicherheit

- Alle Edge Functions verifizieren JWT + Admin-Rolle via `user_roles`.
- RLS wie oben; interner View für Public verhindert Leak von Bestand/Notizen.
- Zod-Validierung serverseitig für alle Inputs (Länge, Typen, erlaubte Standorte).
- Storage-Bucket-Policies: nur Admins upload/delete, public read.
- Sanitization aller HTML-Ausgaben (Meta/Description werden als Text gerendert, keine `dangerouslySetInnerHTML`).

## 6. Tests

- **DB**: Migration-Dry-Run + RLS-Check (Admin darf alles, anon sieht nur `managed_products_public`, Bestandsfelder nicht abrufbar).
- **Edge Functions**: manuelle Testaufrufe für beide Functions (Auth-Fehlerfall, Rollenfehlerfall, Success).
- **Frontend Merge**: Playwright-Skript unter `/tmp/browser/inventory/`:
  - Login als Admin → Inventar-Tab → neuen Artikel „E2E-Testbagger" in Kategorie Erdbewegung/Krefeld anlegen → Rentware-Code setzen → veröffentlichen.
  - Screenshot `Mietartikel/Krefeld/Erdbewegung` → prüft, dass Artikel auftaucht.
  - Screenshot `B2B/Produkte` → prüft Buchbarkeit.
  - Screenshot Detailseite → prüft SEO-Meta, FAQs, Bilder, keine Bestandsmengen sichtbar.
  - Anschließend Bestand ändern (5 Krefeld, Notiz „intern") → Public-Seite darf sich nicht ändern, DB-Query als anon darf `quantities` nicht zurückgeben.
- **Konsistenz-Check**: Bei Rentware-Code-Set greift die Memory-Regel (`onRequest` weg, „auf Anfrage" aus Text entfernt) → Test verifiziert das.

## 7. Nicht im Scope (bewusst)
- Auto-Sync statischer TS-Artikel in DB (bleibt manueller Erstimport per „Bearbeiten"-Klick).
- Versions-/Änderungshistorie einzelner Felder.
- Übersetzungen (bestehendes i18n-System bleibt für TS-Artikel; DB-Artikel werden zunächst nur auf Deutsch gepflegt).
- Automatische Bild-Optimierung/CDN (Bilder werden 1:1 aus Storage geladen).

## Technische Notizen
- Neue Files: `supabase/functions/admin-generate-product-content/`, `supabase/functions/admin-manage-product/`, `src/hooks/useManagedProducts.ts`, `src/components/b2b/admin/AdminInventoryTab.tsx`, `src/components/b2b/admin/InventoryEditorDialog.tsx` (+ Sub-Komponenten pro Tab), `src/lib/mergeManagedProducts.ts`.
- Änderungen in: `src/pages/b2b/AdminDashboard.tsx` (Tab-Registrierung), `src/data/rentalData.ts` (async Helper), `src/pages/rental/*`, `src/pages/b2b/B2BProducts.tsx`, `src/pages/b2b/B2BProductDetail.tsx`, `scripts/prerender-rental.mjs`, `supabase/config.toml`.
- Model für KI: `google/gemini-2.5-flash` (schnell, günstig, ausreichend für SEO-Texte). Bei Bedarf pro Feld auf `google/gemini-2.5-pro` upgradebar.

## Umsetzungsreihenfolge
1. Migration + Storage-Bucket + View
2. Edge Functions (`admin-manage-product`, `admin-generate-product-content`)
3. Merge-Layer im Frontend
4. Admin-UI (Listenansicht → Editor-Dialog → KI-Buttons → Bestandsseite)
5. Prerendering-Anpassung
6. Playwright-Tests + manuelle Verifikation
