#!/usr/bin/env bun
// Generate a single INSERT INTO tmp_seo_load VALUES (...), (...) statement.
import fs from "node:fs";
import path from "node:fs";
import { execSync } from "node:child_process";
const rawPlan = fs.readFileSync("scripts/.cache/etappe2-migration.sql","utf8");
// Extract SEO updates and rebuild as a single INSERT INTO staging.
const IMG_RE = /\.(jpe?g|png|webp|svg|gif|avif)$/i;
Bun.plugin({name:"asset-stub",setup(b){b.onLoad({filter:IMG_RE},(a)=>({contents:`export default ${JSON.stringify(a.path)};`,loader:"js"}));}});
const seoMod = await import(process.cwd()+"/src/data/productSEOData.ts");
const productSEOData = seoMod.productSEOData || {};
const orphans = JSON.parse(fs.readFileSync("scripts/.cache/orphan-mapping.json","utf8"));

const dbRows = JSON.parse(execSync(`psql -Atc "SELECT json_agg(row_to_json(t)) FROM (SELECT slug,seo_meta_description,seo_faqs FROM b2b_managed_products) t"`,{encoding:"utf8"}).trim());
const dbBySlug = new Map(dbRows.map(r=>[r.slug,r]));

// Build merged {slug -> {meta?, faqs?}}
const target = new Map();
function want(slug){ if(!target.has(slug))target.set(slug,{}); return target.get(slug); }
// C.2 direct SEO
for(const d of dbRows){
  const seo = productSEOData[d.slug]; if(!seo) continue;
  const t = want(d.slug);
  if((!d.seo_meta_description||!d.seo_meta_description.trim())&&seo.metaDescription) t.meta = seo.metaDescription;
  const faqsEmpty = !Array.isArray(d.seo_faqs)||d.seo_faqs.length===0;
  if(faqsEmpty && Array.isArray(seo.faqs) && seo.faqs.length) t.faqs = seo.faqs;
}
// C.3 orphan merges
const orphanApplied=[], orphanConflict=[];
for(const o of orphans){
  if(!o.match) continue;
  const seo = productSEOData[o.orphan]; if(!seo) continue;
  const d = dbBySlug.get(o.match); if(!d) continue;
  const t = want(o.match);
  const dbMetaEmpty = !d.seo_meta_description||!d.seo_meta_description.trim();
  if(seo.metaDescription){
    if(dbMetaEmpty && !t.meta){ t.meta=seo.metaDescription; orphanApplied.push({orphan:o.orphan,base:o.match,field:"seo_meta_description"}); }
    else orphanConflict.push({orphan:o.orphan,base:o.match,field:"seo_meta_description",existing:(d.seo_meta_description||t.meta||"").slice(0,50)});
  }
  const dbFaqsEmpty=!Array.isArray(d.seo_faqs)||d.seo_faqs.length===0;
  if(Array.isArray(seo.faqs)&&seo.faqs.length){
    if(dbFaqsEmpty && !t.faqs){ t.faqs=seo.faqs; orphanApplied.push({orphan:o.orphan,base:o.match,field:"seo_faqs"}); }
    else orphanConflict.push({orphan:o.orphan,base:o.match,field:"seo_faqs",existing:`${(d.seo_faqs||t.faqs||[]).length} FAQs`});
  }
}
// Remove empty entries
for(const [k,v] of target) if(!v.meta && !v.faqs) target.delete(k);

const rows = [...target.entries()].map(([slug,v])=>({slug,meta:v.meta||null,faqs:v.faqs||null}));
fs.writeFileSync("scripts/.cache/seo-payload.json", JSON.stringify(rows));
fs.writeFileSync("scripts/.cache/orphan-conflicts.json", JSON.stringify(orphanConflict));
fs.writeFileSync("scripts/.cache/orphan-applied.json", JSON.stringify(orphanApplied));
console.log("rows:", rows.length, "conflicts:", orphanConflict.length, "applied:", orphanApplied.length);
console.log("payload bytes:", fs.statSync("scripts/.cache/seo-payload.json").size);
