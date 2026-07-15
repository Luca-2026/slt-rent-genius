#!/usr/bin/env bun
// Erzeugt scripts/import-static-products.sql aus scripts/import-static-products.json
import fs from "node:fs";
import path from "node:path";

const rows = JSON.parse(fs.readFileSync("scripts/import-static-products.json", "utf8"));

function esc(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
  return `'${String(v).replace(/'/g, "''")}'`;
}
function arr(v) {
  if (!Array.isArray(v) || v.length === 0) return "ARRAY[]::text[]";
  const items = v.map((s) => `'${String(s).replace(/'/g, "''")}'`).join(",");
  return `ARRAY[${items}]::text[]`;
}
function json(v) {
  const s = JSON.stringify(v ?? {});
  return `'${s.replace(/'/g, "''")}'::jsonb`;
}

const stmts = [];
stmts.push("BEGIN;");
for (const r of rows) {
  stmts.push(
    `INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      ${esc(r.slug)}, ${esc(r.name)}, ${esc(r.model_name)}, ${esc(r.description)}, ${esc(r.detailed_description)}, ${esc(r.category)},
      ${arr(r.available_locations)}, ${arr(r.images)}, ${json(r.specifications)}, ${arr(r.features)}, ${arr(r.tags)}, ${arr(r.rental_notes)},
      ${esc(r.price_per_day)}, ${esc(r.price_weekend)}, ${esc(r.price_per_month)}, ${esc(r.min_rental_months)},
      ${esc(r.weight_kg)}, ${esc(r.drive_type)}, ${json(r.rentware_code)}, ${esc(r.on_request)}, ${esc(r.pdf_url)},
      ${esc(r.external_manual_url)}, ${esc(r.video_url)}, ${arr(r.video_urls)}, ${esc(r.sort_order)}, TRUE
    ) ON CONFLICT (slug) DO NOTHING;`
  );
}
stmts.push("COMMIT;");

fs.writeFileSync("scripts/import-static-products.sql", stmts.join("\n"));
console.log(`Wrote ${rows.length} INSERTs to scripts/import-static-products.sql`);
