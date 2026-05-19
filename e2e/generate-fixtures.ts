/**
 * Erzeugt e2e/fixtures/local-category-cases.json aus den echten
 * Datenquellen. Wird via tsx ausgeführt, damit Vite-spezifische
 * Asset-Importe (PNG/SVG/WEBP) nicht von Playwright/esbuild
 * geparst werden müssen.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { localCategoryContent } from "../src/data/localCategoryContent";
import { getProductsForLocationCategory } from "../src/data/rentalData";

const here = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(here, "fixtures/local-category-cases.json");

type Case = {
  locationId: string;
  categoryId: string;
  productId: string | null;
  productName: string | null;
  hookline: string;
  standortFakten: string;
  faqs: { q: string; a: string }[];
};

const cases: Case[] = [];
for (const [locationId, byCat] of Object.entries(localCategoryContent)) {
  for (const [categoryId, content] of Object.entries(byCat)) {
    const products = getProductsForLocationCategory(locationId, categoryId);
    const p = products[0];
    cases.push({
      locationId,
      categoryId,
      productId: p?.id ?? null,
      productName: p?.name ?? null,
      hookline: content.hookline,
      standortFakten: content.standortFakten,
      faqs: content.faqs,
    });
  }
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(cases, null, 2), "utf8");
console.log(`Wrote ${cases.length} cases → ${outPath}`);
