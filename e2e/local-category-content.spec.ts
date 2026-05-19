/**
 * E2E: Lokaler Standort × Kategorie-Content auf Produktdetailseiten
 *
 * Für jede (Standort, Kategorie)-Kombination aus
 * `src/data/localCategoryContent.ts` öffnen wir die Produktdetailseite
 * des ersten verfügbaren Produkts und prüfen, dass die echten lokalen
 * Inhalte gerendert werden:
 *   1. Standort-Block (LocalCategoryContentBlock) ist sichtbar
 *   2. Hookline-Snippet steht im Block
 *   3. Standort-Fakten-Snippet steht im Block
 *   4. Mindestens eine lokale FAQ-Frage steht irgendwo auf der Seite
 *
 * Hinweis: Wir testen Produkt-URLs (nicht Kategorie-URLs), weil
 * der Standort-Block und die zusätzlichen FAQs ausschließlich auf
 * ProductDetail gerendert werden – siehe src/pages/rental/ProductDetail.tsx.
 *
 * Fixture wird vorab via `npm run e2e:fixtures` erzeugt
 * (e2e/generate-fixtures.ts → e2e/fixtures/local-category-cases.json),
 * damit Vite-spezifische Asset-Importe nicht von Playwright/esbuild
 * geparst werden müssen.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test, expect, type Page } from "@playwright/test";

type Case = {
  locationId: string;
  categoryId: string;
  productId: string | null;
  productName: string | null;
  hookline: string;
  standortFakten: string;
  faqs: { q: string; a: string }[];
};

const here = dirname(fileURLToPath(import.meta.url));
const cases: Case[] = JSON.parse(
  readFileSync(resolve(here, "fixtures/local-category-cases.json"), "utf8"),
);

function snippet(text: string, max = 50): string {
  const dot = text.indexOf(".");
  const end = dot > 20 && dot < max ? dot : max;
  return text.slice(0, end).trim();
}

async function gotoProduct(
  page: Page,
  locationId: string,
  categoryId: string,
  productId: string,
) {
  await page.goto(`/mieten/${locationId}/${categoryId}/${productId}`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector("h1", { timeout: 15_000 });
}

test.describe("Lokaler Kategorie-Content je Standort", () => {
  for (const c of cases) {
    const title = `${c.locationId} / ${c.categoryId} → ${c.productName ?? "(kein Produkt)"}`;

    if (!c.productId) {
      test.skip(title, () => {
        // Kein Produkt am Standort in dieser Kategorie – Render-Pfad
        // nicht testbar. Wird bewusst übersprungen.
      });
      continue;
    }

    test(title, async ({ page }) => {
      await gotoProduct(page, c.locationId, c.categoryId, c.productId);

      const block = page.locator(
        `[data-local-content="${c.locationId}-${c.categoryId}"]`,
      );
      await expect(block, "LocalCategoryContentBlock muss gerendert sein")
        .toBeVisible();

      const hookSnippet = snippet(c.hookline);
      await expect(
        block,
        `Hookline-Snippet "${hookSnippet}" fehlt im Standort-Block`,
      ).toContainText(hookSnippet);

      const faktenSnippet = snippet(c.standortFakten);
      await expect(
        block,
        `Standort-Fakten-Snippet "${faktenSnippet}" fehlt im Standort-Block`,
      ).toContainText(faktenSnippet);

      if (c.faqs.length > 0) {
        const firstQ = c.faqs[0].q;
        await expect(
          page.locator("body"),
          `Lokale FAQ-Frage "${firstQ}" fehlt auf der Seite`,
        ).toContainText(firstQ);
      }
    });
  }
});
