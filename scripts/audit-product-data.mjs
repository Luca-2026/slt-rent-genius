#!/usr/bin/env bun
// Etappe 1: Read-only Audit — vergleicht statische Produktdaten (rentalData.ts +
// productSEOData.ts) mit dem CMS (b2b_managed_products via psql) und produziert
// einen Markdown-Bericht. Keine Schreiboperationen.
//
// Aufruf:  bun scripts/audit-product-data.mjs > audit-report.md
//
// Notiz: nutzt dieselbe Bun-Asset-Stub-Technik wie import-static-products.mjs.

import path from "node:path";
import fs from "node:fs";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const IMG_RE = /\.(jpe?g|png|webp|svg|gif|avif)$/i;
Bun.plugin({
  name: "asset-stub",
  setup(build) {
    build.onLoad({ filter: IMG_RE }, (args) => ({
      contents: `export default ${JSON.stringify(args.path)};`,
      loader: "js",
    }));
  },
});

// ---------- Statische Produkte laden ----------
const rental = await import(path.resolve(ROOT, "src/data/rentalData.ts"));
const seoMod = await import(path.resolve(ROOT, "src/data/productSEOData.ts"));
const { locations, generateProductSlug } = rental;
const productSEOData = seoMod.productSEOData || {};

function toPublicUrl(raw) {
  if (!raw || typeof raw !== "string") return null;
  if (raw.startsWith("/product-images/")) return raw;
  if (raw.startsWith("http")) return raw;
  if (raw.includes("/src/assets/products/")) {
    return "/product-images/" + raw.split("/src/assets/products/")[1];
  }
  if (raw.includes("/public/")) return raw.split("/public")[1];
  return raw;
}

const staticBySlug = new Map();
const routeSet = new Set();
for (const loc of locations) {
  for (const [category, products] of Object.entries(loc.products || {})) {
    for (const p of products) {
      const slug = generateProductSlug ? generateProductSlug(p) : p.id;
      routeSet.add(`/mieten/${loc.id}/${category}/${slug}`);
      const rawImages = Array.isArray(p.images) && p.images.length ? p.images : p.image ? [p.image] : [];
      const images = rawImages.map(toPublicUrl).filter(Boolean);
      const existing = staticBySlug.get(slug);
      if (existing) {
        if (!existing.available_locations.includes(loc.id)) existing.available_locations.push(loc.id);
        for (const img of images) if (!existing.images.includes(img)) existing.images.push(img);
        if (p.rentwareCode) Object.assign(existing.rentware_code, p.rentwareCode);
      } else {
        staticBySlug.set(slug, {
          slug,
          name: p.name,
          model_name: p.modelName ?? null,
          description: p.description ?? null,
          detailed_description: p.detailedDescription ?? null,
          category,
          available_locations: [loc.id],
          images,
          specifications: p.specifications ?? {},
          price_per_day: p.pricePerDay ?? null,
          price_weekend: p.priceWeekend ?? null,
          price_per_month: p.pricePerMonth ?? null,
          rentware_code: p.rentwareCode ? { ...p.rentwareCode } : {},
          on_request: !!p.onRequest,
        });
      }
    }
  }
}

// ---------- DB-Produkte laden ----------
const dbJson = execSync(
  `psql -Atc "SELECT json_agg(row_to_json(t)) FROM (SELECT slug,name,model_name,description,detailed_description,category,available_locations,images,specifications,price_per_day,price_weekend,price_per_month,rentware_code,on_request,seo_meta_description,seo_faqs,is_published FROM b2b_managed_products) t"`,
  { encoding: "utf8" },
).trim();
const dbRows = JSON.parse(dbJson);
const dbBySlug = new Map(dbRows.map((r) => [r.slug, r]));

// ---------- Diff ----------
const onlyStatic = [];
const onlyDb = [];
const diffs = []; // { slug, field, static, db }

// Normalize a rentware_code map: lowercase keys, drop empty/null values, sort keys.
function normRentware(raw) {
  if (!raw || typeof raw !== "object") return {};
  const out = {};
  for (const k of Object.keys(raw)) {
    const v = raw[k];
    if (v == null) continue;
    const s = String(v).trim();
    if (!s) continue;
    out[k.toLowerCase()] = s;
  }
  const sorted = {};
  for (const k of Object.keys(out).sort()) sorted[k] = out[k];
  return sorted;
}

for (const [slug, s] of staticBySlug) {
  const d = dbBySlug.get(slug);
  if (!d) { onlyStatic.push(s); continue; }
  const check = (field, sv, dv, opts = {}) => {
    const eq = opts.eq || ((a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null));
    if (!eq(sv, dv)) diffs.push({ slug, name: s.name, field, static: sv, db: dv });
  };
  check("name", s.name, d.name);
  check("category", s.category, d.category);
  check("model_name", s.model_name, d.model_name);
  check("description", s.description, d.description);
  check("detailed_description", (s.detailed_description || "").length, (d.detailed_description || "").length,
    { eq: (a, b) => Math.abs(a - b) < 20 });
  check("available_locations", [...s.available_locations].sort(), [...(d.available_locations || [])].sort());
  check("images_count", s.images.length, (d.images || []).length);
  check("specifications_keys", Object.keys(s.specifications || {}).sort(), Object.keys(d.specifications || {}).sort());
  check("price_per_day", s.price_per_day, d.price_per_day);
  check("price_weekend", s.price_weekend, d.price_weekend);
  check("price_per_month", s.price_per_month, d.price_per_month);
  check("rentware_code", normRentware(s.rentware_code), normRentware(d.rentware_code));
  check("on_request", s.on_request, d.on_request);
  // SEO
  const seo = productSEOData[slug];
  if (seo) {
    check("seo_meta_description_present", !!seo.metaDescription, !!d.seo_meta_description);
    check("seo_faqs_count", (seo.faqs || []).length, Array.isArray(d.seo_faqs) ? d.seo_faqs.length : 0);
  }
}
for (const [slug, d] of dbBySlug) {
  if (!staticBySlug.has(slug)) onlyDb.push(d);
}

// ---------- Neue Prüfung: on_request=false ohne rentware_code an mind. einem Standort ----------
const bookableWithoutCode = [];
for (const d of dbRows) {
  if (d.on_request) continue;
  const rc = normRentware(d.rentware_code);
  if (Object.keys(rc).length === 0) {
    bookableWithoutCode.push({ slug: d.slug, name: d.name, locations: (d.available_locations || []).join(", ") });
  }
}

// ---------- Bild-URLs prüfen (Existenz auf Disk unter public/) ----------
const publicRoot = path.join(ROOT, "public");
const brokenImages = []; // { slug, url }
for (const d of dbRows) {
  for (const url of d.images || []) {
    if (!url.startsWith("/")) continue; // externe URLs überspringen
    const abs = path.join(publicRoot, url.replace(/^\//, ""));
    if (!fs.existsSync(abs)) brokenImages.push({ slug: d.slug, url });
  }
}
const missingImages = dbRows.filter((d) => !d.images || d.images.length === 0)
  .map((d) => ({ slug: d.slug, name: d.name }));

// ---------- SEO-Only Einträge ----------
const seoSlugs = Object.keys(productSEOData);
const seoOrphans = seoSlugs.filter((s) => !staticBySlug.has(s) && !dbBySlug.has(s));

// ---------- Routen-Vergleich mit exportRoutes ----------
let exportRoutesCount = null;
try {
  const routesPath = path.join(ROOT, "dist/.prerender-routes.json");
  if (fs.existsSync(routesPath)) {
    const j = JSON.parse(fs.readFileSync(routesPath, "utf8"));
    exportRoutesCount = (j.routes || []).filter((r) => r.routeType === "product").length;
  }
} catch {}

// ---------- Report ----------
const L = [];
const add = (s = "") => L.push(s);
add(`# Produktdaten-Audit — Etappe 1 (read-only)`);
add(`_Generiert: ${new Date().toISOString()}_`);
add("");
add(`## Kennzahlen`);
add(`| Metrik | Wert |`);
add(`|---|---:|`);
add(`| Statische Produkte (unique Slugs) | ${staticBySlug.size} |`);
add(`| CMS-Produkte (b2b_managed_products) | ${dbBySlug.size} |`);
add(`| Statische Produktrouten (loc × cat × slug) | ${routeSet.size} |`);
add(`| Produktrouten aus dist/.prerender-routes.json | ${exportRoutesCount ?? "n/a (kein aktueller Build)"} |`);
add(`| SEO-Einträge (productSEOData) | ${seoSlugs.length} |`);
add(`| Nur statisch (fehlen in DB) | ${onlyStatic.length} |`);
add(`| Nur in DB (kein statisches Pendant) | ${onlyDb.length} |`);
add(`| Felddifferenzen gesamt | ${diffs.length} |`);
add(`| DB-Produkte ohne Bilder | ${missingImages.length} |`);
add(`| Kaputte Bild-URLs (Datei fehlt in public/) | ${brokenImages.length} |`);
add(`| SEO-Waisen (in productSEOData, weder statisch noch DB) | ${seoOrphans.length} |`);
add("");

add(`## Nur statisch — fehlen komplett in DB (${onlyStatic.length})`);
if (onlyStatic.length === 0) add(`_Keine._`);
else {
  add(`| Slug | Name | Kategorie | Standorte |`);
  add(`|---|---|---|---|`);
  for (const s of onlyStatic) add(`| \`${s.slug}\` | ${s.name} | ${s.category} | ${s.available_locations.join(", ")} |`);
}
add("");

add(`## Nur in DB — kein statisches Pendant (${onlyDb.length})`);
if (onlyDb.length === 0) add(`_Keine._`);
else {
  add(`| Slug | Name | Kategorie | Standorte |`);
  add(`|---|---|---|---|`);
  for (const s of onlyDb) add(`| \`${s.slug}\` | ${s.name} | ${s.category} | ${(s.available_locations||[]).join(", ")} |`);
}
add("");

// Diffs gruppiert pro Feld
const byField = {};
for (const d of diffs) (byField[d.field] ||= []).push(d);
add(`## Felddifferenzen (statisch ≠ DB), gruppiert nach Feld`);
add(`Regel für Etappe 2: **DB gewinnt**, statisch schließt nur Lücken (leeres DB-Feld).`);
add("");
for (const field of Object.keys(byField).sort()) {
  const arr = byField[field];
  add(`### \`${field}\` — ${arr.length} Abweichungen`);
  add(`| Slug | Statisch | DB |`);
  add(`|---|---|---|`);
  const trim = (v) => {
    const s = typeof v === "string" ? v : JSON.stringify(v);
    if (!s) return "_(leer)_";
    return s.length > 90 ? s.slice(0, 87) + "…" : s;
  };
  for (const d of arr.slice(0, 40)) add(`| \`${d.slug}\` | ${trim(d.static)} | ${trim(d.db)} |`);
  if (arr.length > 40) add(`| … | _+${arr.length - 40} weitere_ |  |`);
  add("");
}

add(`## DB-Produkte ohne Bilder (${missingImages.length})`);
if (missingImages.length === 0) add(`_Keine._`);
else {
  add(`| Slug | Name |`);
  add(`|---|---|`);
  for (const m of missingImages.slice(0, 60)) add(`| \`${m.slug}\` | ${m.name} |`);
  if (missingImages.length > 60) add(`| … | +${missingImages.length - 60} weitere |`);
}
add("");

add(`## Kaputte Bild-URLs — Datei fehlt in \`public/\` (${brokenImages.length})`);
if (brokenImages.length === 0) add(`_Keine._`);
else {
  add(`| Slug | URL |`);
  add(`|---|---|`);
  for (const b of brokenImages.slice(0, 60)) add(`| \`${b.slug}\` | \`${b.url}\` |`);
  if (brokenImages.length > 60) add(`| … | +${brokenImages.length - 60} weitere |`);
}
add("");

add(`## SEO-Waisen in productSEOData (${seoOrphans.length})`);
if (seoOrphans.length === 0) add(`_Keine._`);
else for (const s of seoOrphans) add(`- \`${s}\``);
add("");

add(`---`);
add(`_Erzeugt von \`scripts/audit-product-data.mjs\`. Etappe 1: nur Lesen, keine Änderungen._`);

const md = L.join("\n");
const outPath = path.join(ROOT, "scripts/.cache/audit-product-data.md");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, md);
process.stdout.write(md);
