#!/usr/bin/env node
/**
 * Etappe 5b · Schritt 1 — Read-only Feld-Audit.
 *
 * Vergleicht die Felder, die die statische Prerender-/Sitemap-Kette
 * (seo-routes-rental.ts + schemas-rental.ts + prerender-rental.mjs)
 * heute aus den statischen Quellen konsumiert, mit dem Schema von
 * b2b_managed_products in Lovable Cloud.
 *
 * Führt KEINE Schema-Änderung, keine Migration, keine App-Änderung aus.
 * Nur SELECT + statisches Zählen der Vorkommen in den .ts-Quellen.
 *
 * Aufruf:
 *   node scripts/audit-route-fields.mjs
 * (nutzt VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY aus .env)
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();
const load = (p) => readFileSync(resolve(ROOT, p), "utf8");

// ---- Static sources -------------------------------------------------------
const SEO_TS         = load("src/data/productSEOData.ts");
const RENTAL_TS      = load("src/data/rentalData.ts");
const KREFELD_TS     = load("src/data/products/krefeldProducts.ts");
const BONN_TS        = load("src/data/products/bonnProducts.ts");
const ROUTES_TS      = load("src/data/seo-routes-rental.ts");
const SCHEMAS_TS     = load("src/data/schemas-rental.ts");
const PRERENDER_MJS  = load("scripts/prerender-rental.mjs");
const EXPORT_TS      = load("scripts/exportRoutes.ts");
const LOCALCAT_TS    = load("src/data/localCategoryContent.ts");

// Count top-level ProductSEOData entries: `  "<slug>": {`
const seoEntryCount = (SEO_TS.match(/^  "[a-z0-9-]+":\s*\{/gm) || []).length;
const countIn = (src, re) => (src.match(re) || []).length;

const staticStats = {
  productSEOData_entries: seoEntryCount,
  with_h2s:            countIn(SEO_TS, /h2s:\s*\[/g),
  with_useCaseBau:     countIn(SEO_TS, /useCaseBau:/g),
  with_useCaseEvent:   countIn(SEO_TS, /useCaseEvent:/g),
  with_useCasePrivat:  countIn(SEO_TS, /useCasePrivat:/g),
  with_primaryKeywords:countIn(SEO_TS, /primaryKeywords:/g),
  with_is247:          countIn(SEO_TS, /is247:/g),
  with_dailyPriceFrom: countIn(SEO_TS, /dailyPriceFrom:/g),
  with_faqs:           countIn(SEO_TS, /faqs:\s*\[/g),
  localCategoryContent_entries: countIn(LOCALCAT_TS, /hookline:/g),
};

// Which fields does the prerender pipeline actually read from productData?
// (i.e. what ends up in the .prerender-routes.json product payload)
const consumedFromProductData = [
  "id","name","description","image","category","locationId",
  "h2s","useCaseBau","useCaseEvent","useCasePrivat","faqs","modelName",
];
const consumedFromCategoryData = ["category","locationId","productCount","productSummaries"];

// Fields Product-schema (schemas-rental.ts, Product JSON-LD) consumes
const consumedByProductSchema = ["name","description","image","modelName","faqs","locationId","category","id"];

// ---- DB stats -------------------------------------------------------------
const SUPA_URL = process.env.VITE_SUPABASE_URL;
const SUPA_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!SUPA_URL || !SUPA_KEY) {
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY");
  process.exit(1);
}

async function rpc(sql) {
  // No RPC available — use PostgREST count endpoints instead.
  throw new Error("unused");
}

async function tableColumns() {
  const res = await fetch(
    `${SUPA_URL}/rest/v1/managed_products_public?select=*&limit=1`,
    { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } },
  );
  if (!res.ok) throw new Error(`view fetch ${res.status}`);
  const rows = await res.json();
  return rows[0] ? Object.keys(rows[0]) : [];
}

async function countAll() {
  const res = await fetch(
    `${SUPA_URL}/rest/v1/managed_products_public?select=id`,
    { headers: {
      apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`,
      Prefer: "count=exact", "Range-Unit": "items", Range: "0-0",
    } },
  );
  const cr = res.headers.get("content-range");
  return cr ? Number(cr.split("/")[1]) : 0;
}

async function nonNullCount(field, extraFilter = "") {
  // For text/jsonb columns: use PostgREST `not.is.null` filter.
  const url =
    `${SUPA_URL}/rest/v1/managed_products_public` +
    `?select=id&${field}=not.is.null${extraFilter ? `&${extraFilter}` : ""}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`,
      Prefer: "count=exact", "Range-Unit": "items", Range: "0-0",
    },
  });
  const cr = res.headers.get("content-range");
  return cr ? Number(cr.split("/")[1]) : 0;
}

const cols = await tableColumns();
const total = await countAll();

// Fields we care about, with matching PostgREST filter for "has value".
const fieldsToInspect = [
  { key: "seo_meta_description", filter: "seo_meta_description=neq." },
  { key: "seo_faqs",              filter: "seo_faqs=not.eq.[]" },
  { key: "seo_local_content",     filter: "seo_local_content=not.eq.{}" },
  { key: "specifications",        filter: "specifications=not.eq.{}" },
  { key: "detailed_description",  filter: "detailed_description=neq." },
  { key: "description",           filter: "description=neq." },
  { key: "model_name",            filter: "model_name=neq." },
  { key: "features",              filter: "features=not.eq.{}" },
  { key: "tags",                  filter: "tags=not.eq.{}" },
  { key: "rental_notes",          filter: "rental_notes=not.eq.{}" },
  { key: "images",                filter: "images=not.eq.{}" },
];

const dbFill = {};
for (const f of fieldsToInspect) {
  // Only the not-null filter is reliable via PostgREST for jsonb — falling
  // back to the numbers we cross-check via `supabase--read_query` in the
  // report itself. Here we just log column presence.
  dbFill[f.key] = cols.includes(f.key) ? "present" : "MISSING";
}

// ---- Report ---------------------------------------------------------------
console.log("# Etappe 5b · Route-Field Audit (read-only)");
console.log(`Generated: ${new Date().toISOString()}`);
console.log(`DB rows in managed_products_public: ${total}`);
console.log();
console.log("## Static source statistics (grep-based)");
console.table(staticStats);
console.log();
console.log("## DB columns present in managed_products_public");
console.log(cols.join(", "));
console.log();
console.log("## Prerender pipeline consumes from productData:");
console.log("  " + consumedFromProductData.join(", "));
console.log("## Prerender pipeline consumes from categoryData:");
console.log("  " + consumedFromCategoryData.join(", "));
console.log("## Schemas-rental Product-JSON-LD consumes:");
console.log("  " + consumedByProductSchema.join(", "));
console.log();
console.log("## Field → DB column presence");
console.table(dbFill);
console.log();
console.log("Static references in seo-routes-rental / schemas / prerender:");
console.log(`  seo-routes-rental.ts   size=${ROUTES_TS.length}`);
console.log(`  schemas-rental.ts      size=${SCHEMAS_TS.length}`);
console.log(`  prerender-rental.mjs   size=${PRERENDER_MJS.length}`);
console.log(`  exportRoutes.ts        size=${EXPORT_TS.length}`);
console.log(`  krefeldProducts.ts     size=${KREFELD_TS.length}`);
console.log(`  bonnProducts.ts        size=${BONN_TS.length}`);
