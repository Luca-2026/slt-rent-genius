import { allRentalRoutes } from "../src/data/seo-routes-rental.ts";
const routes = allRentalRoutes;
const products = routes.filter(r => r.routeType === "product");
console.log(`Total: ${routes.length}, Products: ${products.length}`);
console.log(`Products with canonical override: ${products.filter(p=>p.canonical).length}`);

const byId = {};
for (const p of products) {
  const id = p.productData?.id;
  if (!id) continue;
  byId[id] ??= [];
  byId[id].push(p);
}
const triLoc = Object.entries(byId).find(([_, arr]) => arr.length >= 2);
if (triLoc) {
  console.log(`\n=== Cross-location product: ${triLoc[0]} ===`);
  for (const r of triLoc[1]) {
    console.log(`\n--- ${r.path} ---`);
    console.log(`  H1: ${r.h1}`);
    console.log(`  Canonical: ${r.canonical || "(self → "+r.path+")"}`);
    console.log(`  Intro (${r.intro.length} ¶):`);
    r.intro.forEach((p,i)=>console.log(`    [${i}] ${p.slice(0,160)}${p.length>160?"…":""}`));
  }
}
