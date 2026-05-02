// Mengen-Analyse: Bonn-/Mülheim-Spiegel vs. echte Unique-Produkte
// + Coverage-Check gegen productSEOData.ts (Template-Cluster vs. unique)

import fs from "node:fs";

const products = JSON.parse(fs.readFileSync("scripts/.cache/products-full.json", "utf8"));

// === 1. ECHTE UNIQUE-PRODUKTE ===========================
// Heuristik: Bonn-Varianten haben i.d.R. id-Prefix `bonn-` ODER eine 1:1 äquivalente Krefeld-id ohne Prefix
const krefeldIds = new Set(products.filter(p => p.sourceFile === "krefeldProducts.ts").map(p => p.id));
const rentalDataIds = new Set(products.filter(p => p.sourceFile === "rentalData.ts").map(p => p.id));
const bonnOnlyIds = products.filter(p => p.sourceFile === "bonnProducts.ts").map(p => p.id);

// Falsch-Treffer aus rentalData (Standort-Objekte: id="krefeld" / "bonn") rausfiltern
const FALSE_HITS = new Set(["krefeld", "bonn", "muelheim"]);
const cleaned = products.filter(p => !FALSE_HITS.has(p.id));

// Bonn-Spiegel-Erkennung
const bonnPrefixed = cleaned.filter(p => p.id.startsWith("bonn-"));
// Equivalente Krefeld-id berechnen:
function strippedBonnId(id) { return id.replace(/^bonn-/, ""); }
const bonnSpiegelOfKrefeld = bonnPrefixed.filter(p => krefeldIds.has(strippedBonnId(p.id)) || rentalDataIds.has(strippedBonnId(p.id)));
const bonnEcht = bonnPrefixed.filter(p => !bonnSpiegelOfKrefeld.includes(p));

// "Echte" unique Produkte = alles außer Bonn-Spiegeln
const echtUniqueIds = new Set(cleaned.map(p => p.id).filter(id => !bonnSpiegelOfKrefeld.find(b => b.id === id)));

console.log("=== MENGEN-ANALYSE ===");
console.log(`Gesamt extrahiert (mit False-Hits):           ${products.length}`);
console.log(`Nach False-Hit-Filter (krefeld/bonn-Objekte): ${cleaned.length}`);
console.log("");
console.log(`  davon aus krefeldProducts.ts:   ${products.filter(p => p.sourceFile === "krefeldProducts.ts").length}`);
console.log(`  davon aus rentalData.ts:        ${products.filter(p => p.sourceFile === "rentalData.ts" && !FALSE_HITS.has(p.id)).length}`);
console.log(`  davon aus bonnProducts.ts:      ${bonnPrefixed.length}`);
console.log(`     ↳ Bonn-Spiegel von Krefeld:  ${bonnSpiegelOfKrefeld.length}`);
console.log(`     ↳ Bonn-only (echt unique):   ${bonnEcht.length}`);
console.log("");
console.log(`>>> ECHTE UNIQUE PRODUKTE (Generierungsziel): ${echtUniqueIds.size}`);

// === 2. COVERAGE-CHECK gegen productSEOData.ts =================
const seoSrc = fs.readFileSync("src/data/productSEOData.ts", "utf8");
// Extrahiere alle Top-Level-Keys aus productSEOData = { "id": { ... }, ... }
const seoIds = [...seoSrc.matchAll(/^\s\s"([^"]+)"\s*:\s*\{/gm)].map(m => m[1]);
const seoIdSet = new Set(seoIds);

const echtUnique = cleaned.filter(p => echtUniqueIds.has(p.id));
const withSEO = echtUnique.filter(p => seoIdSet.has(p.id));
const withoutSEO = echtUnique.filter(p => !seoIdSet.has(p.id));

console.log("\n=== COVERAGE: productSEOData.ts ===");
console.log(`Einträge in productSEOData.ts:            ${seoIds.length}`);
console.log(`  davon zu echten Unique-Produkten:       ${withSEO.length}`);
console.log(`  davon orphan (kein matching Produkt):   ${seoIds.filter(id => !echtUniqueIds.has(id)).length}`);
console.log(`Echte Unique-Produkte OHNE SEO-Eintrag:   ${withoutSEO.length}`);

// === 3. TEMPLATE-CLUSTER-ERKENNUNG =============================
// Parse useCaseBau aus jedem SEO-Eintrag
const seoEntries = [];
const entryRe = /"([a-z0-9_-]+)"\s*:\s*\{([\s\S]*?)\n\s\s\},/g;
let m;
while ((m = entryRe.exec(seoSrc)) !== null) {
  const id = m[1];
  const body = m[2];
  const useCaseBau = (body.match(/useCaseBau:\s*"([^"]*)"/) || [])[1] || "";
  const useCaseEvent = (body.match(/useCaseEvent:\s*"([^"]*)"/) || [])[1] || "";
  const useCasePrivat = (body.match(/useCasePrivat:\s*"([^"]*)"/) || [])[1] || "";
  seoEntries.push({ id, useCaseBau, useCaseEvent, useCasePrivat });
}

// Cluster nach identischem useCaseBau+Event+Privat-Tripel
const clusters = new Map();
for (const e of seoEntries) {
  const key = `${e.useCaseBau}||${e.useCaseEvent}||${e.useCasePrivat}`;
  if (!clusters.has(key)) clusters.set(key, []);
  clusters.get(key).push(e.id);
}

const templateClusters = [...clusters.entries()].filter(([_, ids]) => ids.length >= 3);
const uniqueEntries = [...clusters.entries()].filter(([_, ids]) => ids.length === 1);
const smallGroups = [...clusters.entries()].filter(([_, ids]) => ids.length === 2);

console.log("\n=== TEMPLATE-CLUSTER-ANALYSE ===");
console.log(`Distinct useCase-Tripel:                  ${clusters.size}`);
console.log(`Cluster mit ≥3 identischen Texten:        ${templateClusters.length}`);
console.log(`  → betreffen insgesamt Produkte:         ${templateClusters.reduce((a, [_, ids]) => a + ids.length, 0)}`);
console.log(`Cluster mit genau 2 identischen Texten:   ${smallGroups.length}`);
console.log(`Echte unique Texte (1x vorkommendes Tripel): ${uniqueEntries.length}`);

console.log("\n--- Top 5 größte Template-Cluster ---");
const top = templateClusters.sort((a, b) => b[1].length - a[1].length).slice(0, 5);
for (const [key, ids] of top) {
  const sample = key.split("||")[0].slice(0, 90);
  console.log(`  ${ids.length}× useCaseBau="${sample}..."`);
  console.log(`     IDs: ${ids.slice(0, 5).join(", ")}${ids.length > 5 ? ", …" : ""}`);
}

// === 4. EMPFEHLUNG: WAS GENERIEREN? =============================
const templateClusterIdSet = new Set();
for (const [_, ids] of templateClusters) ids.forEach(id => templateClusterIdSet.add(id));

const toGenerate_neu = withoutSEO.filter(p => p.grade !== "RED" || true); // RED separat behandeln unten
const toGenerate_overwrite = withSEO.filter(p => templateClusterIdSet.has(p.id));
const toKeep = withSEO.filter(p => !templateClusterIdSet.has(p.id));

console.log("\n=== GENERIERUNGS-PLAN ===");
console.log(`A) Neu zu generieren (kein SEO-Eintrag):       ${withoutSEO.length}`);
console.log(`B) Zu überschreiben (Template-Cluster):        ${toGenerate_overwrite.length}`);
console.log(`C) Beizubehalten (bereits unique-aussehend):   ${toKeep.length}`);
console.log(`   ─────────────────────────────────────────────`);
console.log(`   GESAMT KI-Calls A+B:                        ${withoutSEO.length + toGenerate_overwrite.length}`);

// Persistieren für nächste Phase
fs.writeFileSync("scripts/.cache/generation-plan.json", JSON.stringify({
  echtUniqueIds: [...echtUniqueIds],
  bonnSpiegelIds: bonnSpiegelOfKrefeld.map(p => p.id),
  toGenerateNew: withoutSEO.map(p => p.id),
  toOverwrite: toGenerate_overwrite.map(p => p.id),
  toKeep: toKeep.map(p => p.id),
  templateClusters: top.map(([key, ids]) => ({ pattern: key.slice(0, 100), count: ids.length, ids })),
}, null, 2));
console.log("\nGespeichert: scripts/.cache/generation-plan.json");
