// Merge: Cache → src/data/productSEOData.ts
// - Überschreibt Template-Cluster (B)
// - Ergänzt neue Einträge (A)
// - Lässt unique Bestandseinträge (toKeep) unverändert
// - Entfernt Orphans (Einträge ohne match in echtUniqueIds)
// - Schreibt skip-log-final.json kommentiert

import fs from "node:fs";
import path from "node:path";

const SEO_FILE = "src/data/productSEOData.ts";
const RESULTS_DIR = "scripts/.cache/seo-results";
const PLAN = JSON.parse(fs.readFileSync("scripts/.cache/generation-plan.json", "utf8"));
const SKIP_LOG = JSON.parse(fs.readFileSync("scripts/.cache/skip-log.json", "utf8"));
const products = JSON.parse(fs.readFileSync("scripts/.cache/products-full.json", "utf8"));
const productMap = new Map(products.map(p => [p.id, p]));
const echtUnique = new Set(PLAN.echtUniqueIds);
const toKeep = new Set(PLAN.toKeep);

// === Existing parse ===
const src = fs.readFileSync(SEO_FILE, "utf8");
const headerEnd = src.indexOf("export const productSEOData");
const header = src.slice(0, headerEnd);

// Parse existing entries (id → raw block string)
const entryRe = /^  "([^"]+)":\s*\{\n([\s\S]*?)\n  \},\n/gm;
const existing = new Map();
let m;
while ((m = entryRe.exec(src)) !== null) {
  existing.set(m[1], m[0]);
}
console.log(`Existing entries parsed: ${existing.size}`);

// === Load cache ===
const cacheFiles = fs.readdirSync(RESULTS_DIR).filter(f => f.endsWith(".json"));
const cache = new Map();
for (const f of cacheFiles) {
  const j = JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, f), "utf8"));
  const id = j.id || f.replace(/\.json$/, "");
  cache.set(id, j.generated || j);
}
console.log(`Cache entries: ${cache.size}`);

// === Helpers ===
function esc(s) {
  if (s == null) return "";
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "");
}
function arrLit(arr) {
  return "[" + (arr || []).map(s => `"${esc(s)}"`).join(", ") + "]";
}
function buildEntry(id, gen) {
  const p = productMap.get(id);
  const name = p?.name || id;
  const primaryKw = `${name} mieten in Krefeld, ${name} leihen in Krefeld, ${name} mieten NRW`;
  const faqs = (gen.faq || []).map(f => `      { q: "${esc(f.question)}", a: "${esc(f.answer)}" }`).join(",\n");
  return `  "${id}": {
    excelName: "${esc(name)}",
    seoTitle: "${esc(gen.metaTitle)}",
    metaDescription: "${esc(gen.metaDescription)}",
    h1: "${esc(name)} mieten in Krefeld – Jetzt verfügbar bei SLT Rental",
    h2s: ${arrLit(gen.h2s)},
    useCaseBau: "${esc(gen.useCaseBau)}",
    useCaseEvent: "${esc(gen.useCaseEvent)}",
    useCasePrivat: "${esc(gen.useCasePrivat)}",
    primaryKeywords: "${esc(primaryKw)}",
    is247: false,
    faqs: [
${faqs},
    ],
  },\n`;
}

// === Build new map ===
let overwritten = 0, added = 0, kept = 0, removedOrphans = 0, skippedNoCache = 0;
const finalEntries = [];

// Collect target IDs: union of (existing ∩ echtUnique) and cache keys
const targetIds = new Set();
for (const id of existing.keys()) {
  if (echtUnique.has(id)) targetIds.add(id); else removedOrphans++;
}
for (const id of cache.keys()) targetIds.add(id);

// Sort alphabetically for stability
const sortedIds = [...targetIds].sort();

for (const id of sortedIds) {
  const cached = cache.get(id);
  const exist = existing.get(id);
  if (toKeep.has(id) && exist && !cached) {
    finalEntries.push(exist);
    kept++;
  } else if (cached) {
    finalEntries.push(buildEntry(id, cached));
    if (exist) overwritten++; else added++;
  } else if (exist) {
    finalEntries.push(exist);
    kept++;
    skippedNoCache++;
  }
}

// === Write file ===
const newSrc = header + `export const productSEOData: Record<string, ProductSEOData> = {\n` + finalEntries.join("") + `};\n`;
fs.writeFileSync(SEO_FILE, newSrc);

console.log("");
console.log("=== MERGE-RESULT ===");
console.log(`Overwritten:        ${overwritten}`);
console.log(`Added (new):        ${added}`);
console.log(`Kept untouched:     ${kept}  (incl. ${skippedNoCache} red/skip mit Bestand)`);
console.log(`Orphans removed:    ${removedOrphans}`);
console.log(`Final entries:      ${finalEntries.length}`);

// === Final skip log ===
const finalSkip = SKIP_LOG.map(s => {
  const p = productMap.get(s.id);
  return {
    id: s.id,
    name: s.name,
    category: p?.category || null,
    subcategory: p?.subcategory || null,
    reason: s.reason,
    _comment: s.reason === "RED-grade"
      ? "Datenbasis zu dünn (kein Modell, keine Specs, kurze Beschreibung) — bewusst nicht generiert."
      : "Validator hat Generierung verworfen (z.B. erfundene Spec/Marke, zu kurz/lang).",
  };
});
fs.writeFileSync("scripts/.cache/skip-log-final.json", JSON.stringify({
  _comment: "Sprint 3 finaler Skip-Log. RED-grade = absichtlich übersprungen (Datenbasis zu dünn). validator = LLM-Output verworfen.",
  total: finalSkip.length,
  red: finalSkip.filter(s => s.reason === "RED-grade").length,
  validator: finalSkip.filter(s => s.reason !== "RED-grade").length,
  entries: finalSkip,
}, null, 2));
console.log(`Skip-log written: scripts/.cache/skip-log-final.json (${finalSkip.length} Einträge)`);
