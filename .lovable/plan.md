# Karriereseite-Relaunch: Mehr Bewerbungen + Google Jobs Sichtbarkeit

## Ziel
- Jede Stelle bekommt eine **eigene Landingpage** mit eigener URL (`/karriere/:slug`)
- Strukturierte Daten (**JobPosting JSON-LD**) damit Google Jobs, Stepstone-Aggregatoren, Indeed & Co. die Stellen automatisch crawlen
- Conversion-Optimierung: weniger Reibung, mehr Vertrauen, klare CTAs

## Was wir bauen

### 1. Dedizierte Stellen-Detailseiten (`/karriere/:slug`)
Pro Stelle eine vollwertige Seite mit:
- H1 = Jobtitel + Standort, klare Sub-Headline
- Sticky "Jetzt bewerben"-Button (Mobile + Desktop)
- Ausführliche Sections: Über die Rolle · Aufgaben · Anforderungen · Benefits · Über SLT · Standort/Anfahrt · FAQ
- Vertrauenselemente: Team-/Werkstatt-Foto, Google-Bewertungen, Mitarbeiterstimmen
- "Schnell-bewerben"-Variante (nur Name, Email, Telefon, CV upload) **+** ausführlicher Wizard als Option
- Verwandte Stellen unten

### 2. Google Jobs / Job-Aggregator Indexierung
- **JobPosting Schema.org JSON-LD** auf jeder Stellenseite mit allen Pflichtfeldern: `title`, `description` (HTML), `datePosted`, `validThrough`, `employmentType`, `hiringOrganization`, `jobLocation`, `baseSalary` (wenn möglich), `directApply: true`
- Ergänzt um `identifier`, `industry`, `educationRequirements`, `experienceRequirements`
- **Stellen-Sitemap** (`/sitemap-jobs.xml`) die im Sitemap-Index referenziert wird → Google Jobs entdeckt neue Stellen schnell
- Saubere Meta-Tags + OpenGraph pro Stelle
- `<link rel="canonical">` korrekt gesetzt
- Übersichtsseite `/karriere` listet alle Stellen mit `ItemList`-Schema und verlinkt auf die Detailseiten

### 3. Karriere-Übersichtsseite Überarbeitung
- Stärkerer Hero mit konkretem Versprechen ("In 2 Min bewerben – Antwort in 5 Werktagen")
- Stellen als Karten mit Standort-Badge, Jobtyp, Gehaltsspanne (wenn freigegeben), "Details" → eigene Seite
- "Initiativbewerbung"-CTA prominent
- Filter nach Standort & Jobtyp

### 4. Conversion-Boost
- **Bestätigungsmail** an Bewerber mit klarer "Was passiert jetzt"-Timeline (haben wir teils schon)
- WhatsApp/Telefon-Direktkontakt als Alternative zur Bewerbung
- Reduzierte Pflichtfelder im Schnell-Modus
- Trust-Badges: "Antwort in 5 Werktagen", "Familiäres Team seit XXX", Google-Sterne

### 5. Job-Daten in Datenbank (optional, empfohlen)
Damit du/Team neue Stellen ohne Code-Änderung anlegen kannst:
- Tabelle `job_listings` (title, slug, location, type, description, requirements, benefits, salary_min/max, valid_through, is_active, ...)
- Admin-Bereich um Stellen zu verwalten
- Sitemap & JSON-LD lesen direkt aus DB → neue Stelle = sofort bei Google Jobs einreichbar

```text
Aktuell:  jobData.ts (hardcoded) → 1 Seite /karriere
Neu:      DB / jobData.ts → /karriere (Liste) + /karriere/:slug (je Stelle, JSON-LD, Sitemap)
```

## Technische Details
- React Router: neue Route `/karriere/:slug` → `KarriereJobDetail.tsx`
- Komponenten: `JobDetailHero`, `JobDetailContent`, `QuickApplyForm`, `JobJsonLd`
- SEO: Anpassung `SEO.tsx` Props, `SLT_JOBPOSTING_JSONLD` Helper
- Sitemap-Edge-Function (`supabase/functions/sitemap`) erweitern oder neue `sitemap-jobs` anlegen
- Prerendering-Skript (`scripts/prerender-rental.mjs` Pattern) ergänzen, damit Stellenseiten als statisches HTML ausgespielt werden → entscheidend für Google Jobs Crawler

## Was ich von dir brauche

1. **Job-Daten-Quelle**: DB-Tabelle (komfortabel, du kannst selbst pflegen) **oder** weiter im Code (`jobData.ts`)?
2. **Gehaltsangaben**: Dürfen wir Spannen veröffentlichen? Google Jobs rankt Stellen mit Gehalt deutlich besser. Falls ja, brauche ich min/max pro Stelle.
3. **Quick-Apply**: Soll es zusätzlich zum ausführlichen Wizard ein 30-Sekunden-Formular geben (Name, Mail, Tel, CV)?
4. **Scope dieses Schritts**: Soll ich direkt alles umsetzen (Detailseiten + JSON-LD + Sitemap + Übersicht-Redesign), oder lieber in 2 Etappen (erst Detailseiten + SEO, dann Conversion-Polish)?

Sobald du auf die 4 Punkte antwortest, lege ich los.