// Smoke-Test: Self-Canonical-Strategie pro Standort.
// Run: bunx vite-node scripts/smoke-canonical.ts
import { ALL_ROUTES } from "../src/data/seo-routes-rental";

const products = ALL_ROUTES.filter((r) => r.routeType === "product");
const cats = ALL_ROUTES.filter((r) => r.routeType === "category");

console.log(`Total routes: ${ALL_ROUTES.length}`);
console.log(`Product routes: ${products.length}`);
console.log(`Category routes: ${cats.length}`);
console.log(
  `Products with explicit canonical override: ${products.filter((p) => p.canonical).length} (sollte 0 sein)`,
);

const byId: Record<string, typeof products> = {};
for (const p of products) {
  const id = p.productData?.id;
  if (!id) continue;
  (byId[id] ??= []).push(p);
}
const triLoc = Object.entries(byId).find(([, arr]) => arr.length >= 2);
if (triLoc) {
  console.log(`\n=== Cross-location product: ${triLoc[0]} ===`);
  for (const r of triLoc[1]) {
    console.log(`\n--- ${r.path} ---`);
    console.log(`  H1: ${r.h1}`);
    console.log(
      `  Canonical: ${r.canonical ? "OVERRIDE → " + r.canonical : "(self → " + r.path + ")"}`,
    );
    console.log(`  Intro (${r.intro.length} ¶):`);
    r.intro.forEach((p, i) =>
      console.log(`    [${i}] ${p.slice(0, 180)}${p.length > 180 ? "…" : ""}`),
    );
  }
}

// Bonn + Mülheim category sample
const bonnCat = cats.find((c) => c.path.startsWith("/mieten/bonn/"));
const muelCat = cats.find((c) => c.path.startsWith("/mieten/muelheim/"));
for (const c of [bonnCat, muelCat].filter(Boolean) as typeof cats) {
  console.log(`\n=== ${c.path} ===`);
  console.log(`  H1: ${c.h1}`);
  console.log(`  Canonical: ${c.canonical || "(self)"}`);
  c.intro.forEach((p, i) =>
    console.log(`    [${i}] ${p.slice(0, 180)}${p.length > 180 ? "…" : ""}`),
  );
}
