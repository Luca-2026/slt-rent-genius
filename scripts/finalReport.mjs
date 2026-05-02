// Sprint 3 Final Report
import fs from "node:fs";
import path from "node:path";

const RESULTS_DIR = "scripts/.cache/seo-results";
const SKIP_LOG = "scripts/.cache/skip-log.json";
const PLAN = JSON.parse(fs.readFileSync("scripts/.cache/generation-plan.json", "utf8"));
const audit = JSON.parse(fs.readFileSync("scripts/.cache/audit.json", "utf8"));
const auditMap = new Map(audit.map(a => [a.id, a]));
const products = JSON.parse(fs.readFileSync("scripts/.cache/products-full.json", "utf8"));
const productMap = new Map(products.map(p => [p.id, p]));

const cachedFiles = fs.readdirSync(RESULTS_DIR).filter(f => f.endsWith(".json"));
const cached = cachedFiles.map(f => {
  const data = JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, f), "utf8"));
  return { id: f.replace(/\.json$/, ""), ...data };
});

const skips = fs.existsSync(SKIP_LOG) ? JSON.parse(fs.readFileSync(SKIP_LOG, "utf8")) : [];

console.log("=".repeat(70));
console.log("SPRINT 3 — GESAMTREPORT");
console.log("=".repeat(70));
console.log("");
console.log("## 1. COVERAGE-STATISTIK");
console.log(`Plan total:           ${PLAN.bucketA.length + PLAN.bucketB.length} Produkte (A=${PLAN.bucketA.length} neu, B=${PLAN.bucketB.length} cluster-overwrite)`);
console.log(`Cached (generiert):   ${cached.length}`);
console.log(`Skips (ROT+validator):${skips.length}`);
const redCount = skips.filter(s => s.reason === "RED-grade").length;
const valCount = skips.length - redCount;
console.log(`  davon ROT:          ${redCount}`);
console.log(`  davon Validator:    ${valCount}`);
const expected = PLAN.bucketA.length + PLAN.bucketB.length;
const accountedFor = cached.length + skips.length;
console.log(`Plan-Abdeckung:       ${cached.length}/${expected} = ${(cached.length/expected*100).toFixed(1)}%`);
console.log(`Sum check:            ${accountedFor} (cached+skips) vs ${expected} expected`);
console.log("");

console.log("## 2. KOMPLETTE SKIP-LISTE");
console.log("");
for (const s of skips) {
  const p = productMap.get(s.id);
  const sub = p?.category || p?.subcategory || "—";
  console.log(`  [${s.reason.padEnd(12)}] ${s.id}`);
  console.log(`    Name:    ${s.name}`);
  console.log(`    Kateg.:  ${sub}`);
  console.log("");
}

console.log("=".repeat(70));
console.log("## 3. STICHPROBEN-TEXTE (4)");
console.log("=".repeat(70));

function findCachedByPredicate(pred) {
  return cached.find(c => {
    const p = productMap.get(c.id);
    return p && pred(p, c);
  });
}

function dumpFull(label, c) {
  const p = productMap.get(c.id);
  console.log("");
  console.log("─".repeat(70));
  console.log(`### ${label}`);
  console.log(`ID: ${c.id}  |  Name: ${p?.name}  |  Kat: ${p?.category}`);
  console.log("─".repeat(70));
  console.log(`metaTitle:       ${c.metaTitle}`);
  console.log(`metaDescription: ${c.metaDescription}`);
  console.log(`h2s:             ${JSON.stringify(c.h2s, null, 2)}`);
  console.log(`useCaseBauProfi:        ${c.useCaseBauProfi || c.useCases?.bauProfi || "—"}`);
  console.log(`useCasePrivatGarten:    ${c.useCasePrivatGarten || c.useCases?.privatGarten || "—"}`);
  console.log(`useCaseEventGastronomie:${c.useCaseEventGastronomie || c.useCases?.eventGastronomie || "—"}`);
  if (c.faq) console.log(`FAQ:`); 
  if (c.faq) console.log(JSON.stringify(c.faq, null, 2));
}

const sampleAnh = findCachedByPredicate((p) => /anh[äa]nger|trailer/i.test(p.category || "") || /anh[äa]nger/i.test(p.name || ""));
const sampleBag = findCachedByPredicate((p) => /bagger|minibagger/i.test(p.category || "") || /bagger/i.test(p.name || ""));
const sampleEvent = findCachedByPredicate((p) => /m[öo]bel|zelt|stuhl|tisch|bestuhlung/i.test((p.category||"")+" "+(p.name||"")));
const sampleTool = findCachedByPredicate((p) => /werkzeug|garten|s[äa]ge|bohr|schleif|h[äa]cksler|rasen/i.test((p.category||"")+" "+(p.name||"")));

if (sampleAnh) dumpFull("Anhänger", sampleAnh); else console.log("(kein Anhänger im Cache)");
if (sampleBag) dumpFull("Minibagger", sampleBag); else console.log("(kein Bagger im Cache)");
if (sampleEvent) dumpFull("Möbel/Zelt", sampleEvent); else console.log("(kein Event-Item im Cache)");
if (sampleTool) dumpFull("Werkzeug/Garten Long-Tail", sampleTool); else console.log("(kein Werkzeug im Cache)");

console.log("");
console.log("=".repeat(70));
console.log("## 4. QUERVERGLEICH ANHÄNGER (useCase-Felder)");
console.log("=".repeat(70));
const anhCached = cached.filter(c => {
  const p = productMap.get(c.id);
  return p && (/anh[äa]nger|trailer/i.test(p.category || "") || /anh[äa]nger/i.test(p.name || ""));
}).slice(0, 7);

console.log(`Gefundene Anhänger im Cache: ${anhCached.length}`);
console.log("");
for (const c of anhCached) {
  const p = productMap.get(c.id);
  console.log("─".repeat(70));
  console.log(`◆ ${p?.name}  (${c.id})`);
  console.log(`  Kat: ${p?.category}`);
  console.log(`  BAU:    ${c.useCaseBauProfi || c.useCases?.bauProfi || "—"}`);
  console.log(`  PRIVAT: ${c.useCasePrivatGarten || c.useCases?.privatGarten || "—"}`);
  console.log(`  EVENT:  ${c.useCaseEventGastronomie || c.useCases?.eventGastronomie || "—"}`);
  console.log("");
}
