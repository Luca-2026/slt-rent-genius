#!/usr/bin/env bun
// Build mapping: SEO-orphan slug (in productSEOData but no product) → base slug in DB.
// Rule: strip prefixes (bonn-, mh-, muelheim-, krefeld-), try direct match against
// existing product slugs. Allow lenient variants: umlaut transcription differences
// (ae↔a, oe↔o, ue↔u), collapsed hyphens.
import path from "node:path";
import fs from "node:fs";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const IMG_RE = /\.(jpe?g|png|webp|svg|gif|avif)$/i;
Bun.plugin({ name: "asset-stub", setup(b){ b.onLoad({filter:IMG_RE},(a)=>({contents:`export default ${JSON.stringify(a.path)};`,loader:"js"})); }});

const seoMod = await import(path.resolve(ROOT, "src/data/productSEOData.ts"));
const productSEOData = seoMod.productSEOData || {};

const dbSlugs = JSON.parse(execSync(`psql -Atc "SELECT json_agg(slug) FROM b2b_managed_products"`, {encoding:"utf8"}).trim());
const dbSet = new Set(dbSlugs);

// Loose form: strip hyphens, unify umlaut variants
function loose(s) {
  return s
    .toLowerCase()
    .replace(/ae/g, "a")
    .replace(/oe/g, "o")
    .replace(/ue/g, "u")
    .replace(/[^a-z0-9]/g, "");
}
const looseIndex = new Map();
for (const s of dbSet) {
  const l = loose(s);
  if (!looseIndex.has(l)) looseIndex.set(l, s);
}

const PREFIXES = ["bonn-", "mh-", "muelheim-", "krefeld-"];

const rows = [];
for (const slug of Object.keys(productSEOData)) {
  if (dbSet.has(slug)) continue; // not an orphan
  let base = slug;
  for (const p of PREFIXES) if (base.startsWith(p)) { base = base.slice(p.length); break; }
  let match = null;
  let how = null;
  if (dbSet.has(base)) { match = base; how = "prefix-strip"; }
  else {
    const l = loose(base);
    if (looseIndex.has(l)) { match = looseIndex.get(l); how = "loose-match"; }
  }
  rows.push({ orphan: slug, match, how });
}

rows.sort((a,b) => (a.match?0:1) - (b.match?0:1) || a.orphan.localeCompare(b.orphan));
const matched = rows.filter(r => r.match);
const noMatch = rows.filter(r => !r.match);

const L = [];
L.push(`# SEO-Waisen Mapping (${rows.length} Einträge)`);
L.push(`Regel: Prefix (bonn-/mh-/muelheim-/krefeld-) entfernen, direkt oder lose (Umlaut/Bindestrich) matchen.`);
L.push(``);
L.push(`| Alt-Slug | Match | Aktion |`);
L.push(`|---|---|---|`);
for (const r of rows) {
  const action = r.match
    ? `Merge in \`${r.match}\` (nur wenn DB-SEO-Feld leer) — via ${r.how}`
    : `**KEIN MATCH** → verwerfen`;
  L.push(`| \`${r.orphan}\` | ${r.match ? `\`${r.match}\`` : "—"} | ${action} |`);
}
L.push(``);
L.push(`**Summary:** ${matched.length} matched, ${noMatch.length} verworfen.`);

fs.mkdirSync("scripts/.cache", {recursive:true});
fs.writeFileSync("scripts/.cache/orphan-mapping.md", L.join("\n"));
fs.writeFileSync("scripts/.cache/orphan-mapping.json", JSON.stringify(rows, null, 2));
process.stdout.write(L.join("\n"));
