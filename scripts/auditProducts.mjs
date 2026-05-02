// Datenqualitäts-Audit für alle unique Produkte.
// Liest TS-Files mit einem TS-Compiler-frei Regex/AST-Light Ansatz:
// Wir nutzen tsx via dynamic import? Einfacher: regex-basiert über die Produkt-Objekte.
// Da Felder einfach sind, parsen wir die Quelltexte.

import fs from "node:fs";
import path from "node:path";

const FILES = [
  "src/data/products/krefeldProducts.ts",
  "src/data/products/bonnProducts.ts",
  "src/data/rentalData.ts",
];

// Extrahiere Produkt-Objekte heuristisch: Suche nach Objekten, die `id:` und `name:` enthalten.
function extractProducts(source, fileLabel) {
  const products = [];
  // Match top-level Objekte innerhalb von Arrays. Wir nutzen einen Brace-Counter.
  const len = source.length;
  let i = 0;
  while (i < len) {
    // Finde nächstes "id:" als Anker
    const idIdx = source.indexOf("id:", i);
    if (idIdx === -1) break;
    // Finde Beginn des umschließenden Objekts (rückwärts bis '{')
    let depth = 0;
    let start = -1;
    for (let j = idIdx; j >= 0; j--) {
      const c = source[j];
      if (c === "}") depth++;
      else if (c === "{") {
        if (depth === 0) { start = j; break; }
        depth--;
      }
    }
    if (start === -1) { i = idIdx + 3; continue; }
    // Finde Ende des Objekts (vorwärts mit string-aware brace counter)
    let end = -1;
    let d = 0;
    let inStr = null;
    let esc = false;
    for (let j = start; j < len; j++) {
      const c = source[j];
      if (inStr) {
        if (esc) { esc = false; continue; }
        if (c === "\\") { esc = true; continue; }
        if (c === inStr) inStr = null;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
      if (c === "{") d++;
      else if (c === "}") { d--; if (d === 0) { end = j; break; } }
    }
    if (end === -1) break;
    const objSrc = source.slice(start, end + 1);

    // Felder grob parsen
    const get = (key) => {
      const re = new RegExp(`${key}\\s*:\\s*("([^"\\\\]|\\\\.)*"|'([^'\\\\]|\\\\.)*'|\\\`([^\\\`\\\\]|\\\\.)*\\\`)`);
      const m = objSrc.match(re);
      if (!m) return undefined;
      return m[1].slice(1, -1);
    };
    const id = get("id");
    if (!id) { i = end + 1; continue; }
    const name = get("name");
    if (!name) { i = end + 1; continue; }
    const modelName = get("modelName");
    const description = get("description");
    const detailedDescription = get("detailedDescription");
    const category = get("category");

    // specifications: zähle Keys
    let specCount = 0;
    const specMatch = objSrc.match(/specifications\s*:\s*\{([\s\S]*?)\}/);
    if (specMatch) {
      const inner = specMatch[1];
      // Count "Key": "Value" pairs
      const pairs = inner.match(/"[^"]+"\s*:/g);
      specCount = pairs ? pairs.length : 0;
    }

    // brand-Heuristik: modelName vorhanden ODER specifications hat "Hersteller"
    const hasBrand = !!modelName || /"Hersteller"\s*:/.test(objSrc);

    // Spec-Keywords (Maße/Gewicht/Leistung)
    const fullText = `${description || ""} ${detailedDescription || ""} ${specMatch ? specMatch[1] : ""}`;
    const hasMeasurements = /(\d+\s*(?:cm|mm|m|kg|kVA|kW|V|Watt|l|Liter|t\b|U\/min|Hz))/i.test(fullText);

    const descWords = (description || "").trim().split(/\s+/).filter(Boolean).length;

    // Klassifizierung
    let grade;
    if (hasBrand && specCount >= 3 && hasMeasurements && descWords >= 5) grade = "GREEN";
    else if (hasMeasurements || specCount >= 2 || descWords >= 10) grade = "YELLOW";
    else grade = "RED";

    products.push({
      id, name, modelName, description, category, specCount,
      hasBrand, hasMeasurements, descWords,
      detailedLen: (detailedDescription || "").length,
      grade, file: fileLabel,
    });
    i = end + 1;
  }
  return products;
}

const all = [];
for (const f of FILES) {
  const src = fs.readFileSync(f, "utf8");
  const prods = extractProducts(src, path.basename(f));
  all.push(...prods);
}

// Deduplizieren nach id (Krefeld-Master gewinnt)
const byId = new Map();
for (const p of all) {
  if (!byId.has(p.id)) byId.set(p.id, p);
}
const unique = [...byId.values()];

// Aggregation
const byCategory = {};
const byGrade = { GREEN: 0, YELLOW: 0, RED: 0 };
const reds = [];
for (const p of unique) {
  const cat = p.category || "(ohne)";
  if (!byCategory[cat]) byCategory[cat] = { GREEN: 0, YELLOW: 0, RED: 0, total: 0 };
  byCategory[cat][p.grade]++;
  byCategory[cat].total++;
  byGrade[p.grade]++;
  if (p.grade === "RED") reds.push({ id: p.id, name: p.name, category: cat });
}

console.log("=== Datenqualitäts-Audit ===");
console.log(`Gesamt unique Produkte: ${unique.length}`);
console.log(`GRÜN: ${byGrade.GREEN} (${(byGrade.GREEN/unique.length*100).toFixed(1)}%)`);
console.log(`GELB: ${byGrade.YELLOW} (${(byGrade.YELLOW/unique.length*100).toFixed(1)}%)`);
console.log(`ROT:  ${byGrade.RED} (${(byGrade.RED/unique.length*100).toFixed(1)}%)`);
console.log("");
console.log("=== Pro Subkategorie ===");
const cats = Object.keys(byCategory).sort();
for (const c of cats) {
  const b = byCategory[c];
  console.log(`${c.padEnd(35)} total=${String(b.total).padStart(3)}  GRÜN=${String(b.GREEN).padStart(3)}  GELB=${String(b.YELLOW).padStart(3)}  ROT=${String(b.RED).padStart(3)}`);
}
console.log("");
console.log(`=== ROT-Produkte (${reds.length}) ===`);
for (const r of reds) {
  console.log(`  [${r.category}] ${r.id}  —  ${r.name}`);
}

// Persist für Generator-Schritt
fs.mkdirSync("scripts/.cache", { recursive: true });
fs.writeFileSync("scripts/.cache/audit.json", JSON.stringify(unique, null, 2));
console.log(`\nGespeichert: scripts/.cache/audit.json (${unique.length} Produkte)`);
