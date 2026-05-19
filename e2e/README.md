# E2E-Tests (Playwright)

End-to-End-Tests, die für **jede in `src/data/localCategoryContent.ts`
definierte (Standort, Kategorie)-Kombination** die Produktdetailseite
des ersten verfügbaren Produkts öffnen und prüfen, dass:

1. der Standort-Block (`LocalCategoryContentBlock`) sichtbar gerendert wird
2. die **Hookline** im Block steht
3. die **Standort-Fakten** im Block stehen
4. mindestens eine **lokale FAQ-Frage** auf der Seite erscheint

Aktuell deckt das 45 Kombinationen ab (22 Bonn + 22 Mülheim + 1 Krefeld).

## Voraussetzungen

- Vite-Dev-Server läuft auf `http://localhost:8080`
  (`npm run dev`) **oder** `PLAYWRIGHT_BASE_URL` zeigt auf eine
  laufende Instanz (z. B. die Preview-URL).
- Chromium ist installiert: `npx playwright install chromium`
- In Ubuntu/Debian-CI zusätzlich einmalig:
  `npx playwright install --with-deps chromium`

## Ausführen

```bash
# Fixture neu generieren + Tests in einem Rutsch:
bash scripts/run-e2e.sh

# Oder manuell:
npx vite-node ./e2e/generate-fixtures.ts
npx playwright test
```

## Aufbau

- `e2e/generate-fixtures.ts` – liest `localCategoryContent` und
  `rentalData`, schreibt die Testmatrix nach
  `e2e/fixtures/local-category-cases.json`. Dieser Umweg ist nötig,
  damit Playwright nicht die Vite-Asset-Imports der Datenquellen
  parsen muss.
- `e2e/local-category-content.spec.ts` – iteriert über die Fixture
  und prüft je Kombination Hookline, Standort-Fakten und FAQ.
- `playwright.config.ts` – nutzt `baseURL` aus
  `PLAYWRIGHT_BASE_URL` (Default `http://localhost:8080`).

## Hinweis Sandbox

In der Lovable-Sandbox fehlen die System-Libs für Chromium
(`libglib-2.0.so.0` u. a.). Der Wrapper `scripts/run-e2e.sh`
versucht sie via `nix build` bereitzustellen, aber das ist nicht
in jeder Sandbox-Variante zuverlässig. Lokal/CI auf einer regulären
Linux-Distribution laufen die Tests problemlos.
