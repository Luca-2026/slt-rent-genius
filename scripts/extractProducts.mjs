// Erweiterte Extraktion mit detailedDescription + specifications (key→value).
// Gleiches Vorgehen wie auditProducts.mjs, aber speichert vollständigeren Datensatz.

import fs from "node:fs";
import path from "node:path";

const FILES = [
  "src/data/products/krefeldProducts.ts",
  "src/data/products/bonnProducts.ts",
  "src/data/rentalData.ts",
];

function findObjects(source) {
  const out = [];
  let i = 0;
  const len = source.length;
  while (i < len) {
    const idIdx = source.indexOf("id:", i);
    if (idIdx === -1) break;
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
    let end = -1, d = 0, inStr = null, esc = false;
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
    out.push({ start, end, src: source.slice(start, end + 1) });
    i = end + 1;
  }
  return out;
}

function getStr(objSrc, key) {
  const re = new RegExp(`(?:^|[\\s,{])${key}\\s*:\\s*("([^"\\\\]|\\\\.)*"|'([^'\\\\]|\\\\.)*'|\\\`([^\\\`\\\\]|\\\\.)*\\\`)`);
  const m = objSrc.match(re);
  if (!m) return undefined;
  const raw = m[1].slice(1, -1);
  return raw.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\'/g, "'");
}

function getSpecs(objSrc) {
  const m = objSrc.match(/specifications\s*:\s*\{([\s\S]*?)\n\s*\}/);
  if (!m) return undefined;
  const inner = m[1];
  const re = /"([^"]+)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  const obj = {};
  let mm;
  while ((mm = re.exec(inner)) !== null) {
    obj[mm[1]] = mm[2].replace(/\\"/g, '"');
  }
  return Object.keys(obj).length ? obj : undefined;
}

const all = [];
for (const f of FILES) {
  const src = fs.readFileSync(f, "utf8");
  const objs = findObjects(src);
  for (const o of objs) {
    const id = getStr(o.src, "id");
    const name = getStr(o.src, "name");
    if (!id || !name) continue;
    const modelName = getStr(o.src, "modelName");
    const description = getStr(o.src, "description");
    const detailedDescription = getStr(o.src, "detailedDescription");
    const category = getStr(o.src, "category");
    const specs = getSpecs(o.src);
    all.push({
      id, name, modelName, description, detailedDescription, category,
      specifications: specs,
      sourceFile: path.basename(f),
    });
  }
}

// Dedup
const byId = new Map();
for (const p of all) if (!byId.has(p.id)) byId.set(p.id, p);
const unique = [...byId.values()];

fs.writeFileSync("scripts/.cache/products-full.json", JSON.stringify(unique, null, 2));
console.log(`Saved scripts/.cache/products-full.json (${unique.length} produkte)`);
console.log(`Mit specifications: ${unique.filter(p => p.specifications).length}`);
console.log(`Mit detailedDescription: ${unique.filter(p => p.detailedDescription).length}`);
