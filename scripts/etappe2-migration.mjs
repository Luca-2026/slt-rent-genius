#!/usr/bin/env bun
// Etappe 2 — Migration: DB gewinnt, statisch füllt nur leere Felder.
// Erzeugt scripts/.cache/etappe2-migration.sql + scripts/.cache/etappe2-plan.md
import path from "node:path";
import fs from "node:fs";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const IMG_RE = /\.(jpe?g|png|webp|svg|gif|avif)$/i;
Bun.plugin({ name:"asset-stub", setup(b){ b.onLoad({filter:IMG_RE},(a)=>({contents:`export default ${JSON.stringify(a.path)};`,loader:"js"})); }});

const rental = await import(path.resolve(ROOT, "src/data/rentalData.ts"));
const seoMod = await import(path.resolve(ROOT, "src/data/productSEOData.ts"));
const { locations, generateProductSlug } = rental;
const productSEOData = seoMod.productSEOData || {};

function toPublicUrl(raw) {
  if (!raw || typeof raw !== "string") return null;
  if (raw.startsWith("/product-images/")) return raw;
  if (raw.startsWith("http")) return raw;
  if (raw.includes("/src/assets/products/")) return "/product-images/" + raw.split("/src/assets/products/")[1];
  if (raw.includes("/public/")) return raw.split("/public")[1];
  return raw;
}

// Static merged by base slug (preserve first-seen image order)
const staticBySlug = new Map();
for (const loc of locations) {
  for (const [category, products] of Object.entries(loc.products || {})) {
    for (const p of products) {
      const slug = generateProductSlug ? generateProductSlug(p) : p.id;
      const rawImages = Array.isArray(p.images) && p.images.length ? p.images : p.image ? [p.image] : [];
      const images = rawImages.map(toPublicUrl).filter(Boolean);
      const existing = staticBySlug.get(slug);
      if (existing) {
        for (const img of images) if (!existing.images.includes(img)) existing.images.push(img);
      } else {
        staticBySlug.set(slug, { slug, name: p.name, images: [...images] });
      }
    }
  }
}

// Load DB
const dbRows = JSON.parse(execSync(
  `psql -Atc "SELECT json_agg(row_to_json(t)) FROM (SELECT slug,name,images,rental_notes,seo_meta_description,seo_faqs,on_request,rentware_code,available_locations FROM b2b_managed_products) t"`,
  { encoding:"utf8" }
).trim());
const dbBySlug = new Map(dbRows.map(r => [r.slug, r]));
const dbSet = new Set(dbBySlug.keys());

// ---------- C.1: Bilder-Migration (36 Produkte ohne DB-Bilder) ----------
const imgUpdates = []; // {slug, images}
for (const d of dbRows) {
  if (d.images && d.images.length) continue;
  const s = staticBySlug.get(d.slug);
  if (!s || !s.images.length) continue;
  // Filter out placeholder.svg — no real image source
  const real = s.images.filter(u => !/placeholder\.svg$/i.test(u));
  if (!real.length) continue;
  imgUpdates.push({ slug: d.slug, images: real });
}

// ---------- C.2: SEO für 304 Produkte ----------
const seoUpdates = []; // {slug, meta?, faqs?}
for (const d of dbRows) {
  const seo = productSEOData[d.slug];
  if (!seo) continue;
  const set = {};
  if ((!d.seo_meta_description || !d.seo_meta_description.trim()) && seo.metaDescription) {
    set.meta = seo.metaDescription;
  }
  const faqsEmpty = !Array.isArray(d.seo_faqs) || d.seo_faqs.length === 0;
  if (faqsEmpty && Array.isArray(seo.faqs) && seo.faqs.length) {
    set.faqs = seo.faqs;
  }
  if (Object.keys(set).length) seoUpdates.push({ slug: d.slug, ...set });
}

// ---------- C.3: Waisen-Merge ----------
const orphans = JSON.parse(fs.readFileSync("scripts/.cache/orphan-mapping.json","utf8"));
const orphanApplied = []; // {orphan, base, fields:[...]}
const orphanConflict = []; // {orphan, base, field, existing}
const orphanNoMatch = orphans.filter(o => !o.match);
// index existing seoUpdates by slug for merge-awareness
const seoIndex = new Map(seoUpdates.map(u => [u.slug, u]));
for (const o of orphans) {
  if (!o.match) continue;
  const seo = productSEOData[o.orphan];
  if (!seo) continue;
  const d = dbBySlug.get(o.match);
  if (!d) continue;
  const current = seoIndex.get(o.match) || {};
  const applied = [];
  // meta
  const dbMetaEmpty = !d.seo_meta_description || !d.seo_meta_description.trim();
  if (seo.metaDescription) {
    if (dbMetaEmpty && !current.meta) {
      current.meta = seo.metaDescription;
      applied.push("seo_meta_description");
    } else {
      orphanConflict.push({ orphan: o.orphan, base: o.match, field: "seo_meta_description", existing: (d.seo_meta_description||current.meta||"").slice(0,60) });
    }
  }
  // faqs
  const dbFaqsEmpty = !Array.isArray(d.seo_faqs) || d.seo_faqs.length === 0;
  if (Array.isArray(seo.faqs) && seo.faqs.length) {
    if (dbFaqsEmpty && !current.faqs) {
      current.faqs = seo.faqs;
      applied.push("seo_faqs");
    } else {
      orphanConflict.push({ orphan: o.orphan, base: o.match, field: "seo_faqs", existing: `${(d.seo_faqs||current.faqs||[]).length} FAQs` });
    }
  }
  if (applied.length) {
    if (!seoIndex.has(o.match)) { seoUpdates.push({ slug: o.match, ...current }); seoIndex.set(o.match, current); }
    else Object.assign(seoIndex.get(o.match), current);
    orphanApplied.push({ orphan: o.orphan, base: o.match, fields: applied });
  }
}

// ---------- C.4: 18 Zubehör → on_request=true + rental_note ----------
const ACC_NOTE = "Zubehörartikel: Buchung erfolgt in Kombination mit der passenden Basismaschine. Fragen Sie das Zubehör einfach bei Ihrer Maschinenbuchung mit an.";
function normRentware(raw) {
  if (!raw || typeof raw !== "object") return {};
  const out = {};
  for (const k of Object.keys(raw)) { const v = raw[k]; if (v == null) continue; const s = String(v).trim(); if (s) out[k.toLowerCase()] = s; }
  return out;
}
const accUpdates = [];
for (const d of dbRows) {
  if (d.on_request) continue;
  if (Object.keys(normRentware(d.rentware_code)).length > 0) continue;
  const notes = Array.isArray(d.rental_notes) ? [...d.rental_notes] : [];
  const hasNote = notes.some(n => typeof n === "string" && n.includes("Zubehörartikel"));
  if (!hasNote) notes.push(ACC_NOTE);
  accUpdates.push({ slug: d.slug, notes });
}

// ---------- SQL ----------
const sqlL = [];
sqlL.push("-- Etappe 2 Migration (DB gewinnt; nur leere Felder werden gefüllt)");
sqlL.push("BEGIN;");

const sqlStr = s => "'" + String(s).replace(/'/g,"''") + "'";
const sqlJson = j => "'" + JSON.stringify(j).replace(/'/g,"''") + "'::jsonb";
const sqlArr = a => "ARRAY[" + a.map(sqlStr).join(",") + "]::text[]";

sqlL.push(`\n-- C.1 Bilder (${imgUpdates.length})`);
for (const u of imgUpdates) {
  sqlL.push(`UPDATE b2b_managed_products SET images=${sqlArr(u.images)}, updated_at=now() WHERE slug=${sqlStr(u.slug)} AND (images IS NULL OR cardinality(images)=0);`);
}
sqlL.push(`\n-- C.2/C.3 SEO (${seoUpdates.length})`);
for (const u of seoUpdates) {
  const sets = [];
  if (u.meta) sets.push(`seo_meta_description=${sqlStr(u.meta)}`);
  if (u.faqs) sets.push(`seo_faqs=${sqlJson(u.faqs)}`);
  if (!sets.length) continue;
  const guards = [];
  if (u.meta) guards.push("(seo_meta_description IS NULL OR seo_meta_description='')");
  if (u.faqs) guards.push("(seo_faqs IS NULL OR jsonb_array_length(seo_faqs)=0)");
  sqlL.push(`UPDATE b2b_managed_products SET ${sets.join(", ")}, updated_at=now() WHERE slug=${sqlStr(u.slug)} AND ${guards.join(" AND ")};`);
}
sqlL.push(`\n-- C.4 Zubehör → on_request + Hinweis (${accUpdates.length})`);
for (const u of accUpdates) {
  sqlL.push(`UPDATE b2b_managed_products SET on_request=true, rental_notes=${sqlArr(u.notes)}, updated_at=now() WHERE slug=${sqlStr(u.slug)};`);
}
sqlL.push("\nCOMMIT;");

fs.mkdirSync("scripts/.cache",{recursive:true});
fs.writeFileSync("scripts/.cache/etappe2-migration.sql", sqlL.join("\n"));

// ---------- Plan/Report ----------
const R = [];
R.push(`# Etappe 2 — Migrationsplan\n`);
R.push(`- C.1 Bilder-Updates: **${imgUpdates.length}**`);
R.push(`- C.2/C.3 SEO-Updates (Meta+FAQs, inkl. Waisen-Merge): **${seoUpdates.length}** Produkte`);
R.push(`- C.3 Waisen angewendet: **${orphanApplied.length}** (von ${orphans.filter(o=>o.match).length} gematchten)`);
R.push(`- C.3 Waisen-Konflikte: **${orphanConflict.length}**`);
R.push(`- C.3 Waisen ohne Match verworfen: **${orphanNoMatch.length}**`);
R.push(`- C.4 Zubehör → on_request=true: **${accUpdates.length}**`);
R.push(`\n## C.4 Zubehör-Liste\n`);
for (const u of accUpdates) R.push(`- \`${u.slug}\``);
R.push(`\n## C.3 Waisen-Konflikte (Zielfeld schon gefüllt, verworfen)\n`);
if (!orphanConflict.length) R.push("_Keine._");
else for (const c of orphanConflict) R.push(`- \`${c.orphan}\` → \`${c.base}\` — Feld \`${c.field}\` existiert bereits (${c.existing})`);
fs.writeFileSync("scripts/.cache/etappe2-plan.md", R.join("\n"));
process.stdout.write(R.join("\n"));
