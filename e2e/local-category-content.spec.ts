/**
 * E2E: Lokaler Standort × Kategorie-Content auf Produktdetailseiten
 *
 * Für jede in `localCategoryContent` definierte (Standort, Kategorie)
 * Kombination öffnen wir die Produktdetailseite des ersten verfügbaren
 * Produkts und prüfen, dass die echten lokalen Inhalte gerendert
 * werden:
 *   1. Hookline (sichtbarer Standort-Block)
 *   2. Standort-Fakten (sichtbarer Standort-Block)
 *   3. Mindestens eine FAQ-Frage (angehängt an Produkt-FAQ)
 *
 * Hinweis: Wir testen Produkt-, nicht Kategorie-URLs, weil
 * `LocalCategoryContentBlock` und die zusätzlichen FAQs ausschließlich
 * auf der Produktdetailseite gerendert werden (siehe
 * src/pages/rental/ProductDetail.tsx).
 */
import { test, expect, type Page } from "@playwright/test";
import { localCategoryContent } from "../src/data/localCategoryContent";
import { getProductsForLocationCategory } from "../src/data/rentalData";

// Snippet-Helper: nimmt einen kurzen, eindeutigen Ausschnitt aus
// einem längeren Text, damit kleine Whitespace-/Markup-Unterschiede
// die Suche nicht brechen.
function snippet(text: string, max = 60): string {
  // Erstes Stück bis zum ersten Satzpunkt oder max Zeichen.
  const dot = text.indexOf(".");
  const end = dot > 20 && dot < max ? dot : max;
  return text.slice(0, end).trim();
}

async function gotoProduct(page: Page, locationId: string, categoryId: string, productId: string) {
  const url = `/mieten/${locationId}/${categoryId}/${productId}`;
  await page.goto(url, { waitUntil: "domcontentloaded" });
  // Warte auf den Standort-Block bzw. einen H1 als Render-Signal.
  await page.waitForSelector("h1", { timeout: 15_000 });
}

// Test-Matrix dynamisch aus den Datenquellen aufbauen.
type Case = {
  locationId: string;
  categoryId: string;
  productId: string;
  productName: string;
  hookline: string;
  standortFakten: string;
  faqs: { q: string; a: string }[];
};

const cases: Case[] = [];
for (const [locationId, byCat] of Object.entries(localCategoryContent)) {
  for (const [categoryId, content] of Object.entries(byCat)) {
    const products = getProductsForLocationCategory(locationId, categoryId);
    if (products.length === 0) {
      // Keine Produkte am Standort in dieser Kategorie → überspringen,
      // aber sichtbar im Report.
      cases.push({
        locationId,
        categoryId,
        productId: "__none__",
        productName: "—",
        hookline: content.hookline,
        standortFakten: content.standortFakten,
        faqs: content.faqs,
      });
      continue;
    }
    const p = products[0];
    cases.push({
      locationId,
      categoryId,
      productId: p.id,
      productName: p.name,
      hookline: content.hookline,
      standortFakten: content.standortFakten,
      faqs: content.faqs,
    });
  }
}

test.describe("Lokaler Kategorie-Content je Standort", () => {
  for (const c of cases) {
    const title = `${c.locationId} / ${c.categoryId} → ${c.productName}`;

    if (c.productId === "__none__") {
      test.skip(title, () => {
        // Kein Produkt am Standort – Render-Pfad nicht testbar.
      });
      continue;
    }

    test(title, async ({ page }) => {
      await gotoProduct(page, c.locationId, c.categoryId, c.productId);

      // 1) Standort-Block ist im DOM verankert (data-attribut aus
      //    LocalCategoryContentBlock).
      const block = page.locator(
        `[data-local-content="${c.locationId}-${c.categoryId}"]`,
      );
      await expect(block, "LocalCategoryContentBlock muss gerendert sein").toBeVisible();

      // 2) Hookline – im Standort-Block sichtbar.
      const hookSnippet = snippet(c.hookline, 50);
      await expect(
        block,
        `Hookline-Snippet "${hookSnippet}" fehlt im Standort-Block`,
      ).toContainText(hookSnippet);

      // 3) Standort-Fakten – im Standort-Block sichtbar.
      const faktenSnippet = snippet(c.standortFakten, 50);
      await expect(
        block,
        `Standort-Fakten-Snippet "${faktenSnippet}" fehlt im Standort-Block`,
      ).toContainText(faktenSnippet);

      // 4) Mindestens eine lokale FAQ-Frage muss in der Seite vorkommen.
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
