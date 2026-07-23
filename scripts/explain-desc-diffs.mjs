#!/usr/bin/env node
/**
 * Read-only: erklärt Description-Diffs zwischen Baseline (2026-07-20)
 * und aktuellem Prerender-Output. Klassifiziert unerklärte Diffs, ohne
 * Änderungen vorzunehmen.
 *
 * Usage: node scripts/explain-desc-diffs.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();
const BASELINE = resolve(ROOT, "scripts/baseline-routes-2026-07-20.json");
const CURRENT = resolve(ROOT, "dist/.prerender-routes.json");

// ---------- Load .env for Supabase creds (read-only) ----------
function loadEnv() {
  const envPath = resolve(ROOT, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv();

if (!existsSync(BASELINE)) {
  console.error(`FATAL: baseline missing at ${BASELINE}`);
  process.exit(1);
}
if (!existsSync(CURRENT)) {
  console.error(`FATAL: current prerender missing at ${CURRENT}. Run: npx vite-node scripts/exportRoutes.ts`);
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(BASELINE, "utf-8"));
const current = JSON.parse(readFileSync(CURRENT, "utf-8"));

const baseMap = new Map(baseline.routes.map((r) => [r.path, r]));
const curMap = new Map(current.routes.map((r) => [r.path, r]));

// ---------- Ermittle Diffs ----------
const diffs = [];
for (const [path, cur] of curMap) {
  const base = baseMap.get(path);
  if (!base) continue; // neue Route -> zählt nicht als Description-Diff
  if ((base.description || "") !== (cur.description || "")) {
    diffs.push({ path, base: base.description || "", cur: cur.description || "", routeType: cur.routeType || base.routeType });
  }
}

// ---------- Supabase-Overrides für Produkt-Routen laden ----------
const SUPA_URL = process.env.VITE_SUPABASE_URL;
const SUPA_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const productSlugs = new Set();
for (const d of diffs) {
  const m = d.path.match(/^\/mieten\/[^/]+\/[^/]+\/([^/]+)\/?$/);
  if (m) productSlugs.add(m[1]);
}

const overrides = new Map(); // slug -> { seo_meta_description, name }
if (SUPA_URL && SUPA_KEY && productSlugs.size > 0) {
  const slugList = [...productSlugs];
  const CHUNK = 100;
  for (let i = 0; i < slugList.length; i += CHUNK) {
    const chunk = slugList.slice(i, i + CHUNK);
    const inList = chunk.map((s) => `"${s}"`).join(",");
    const url = `${SUPA_URL}/rest/v1/managed_products_public?select=slug,name,seo_meta_description&slug=in.(${encodeURIComponent(inList)})`;
    const res = await fetch(url, { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } });
    if (!res.ok) {
      console.error(`[WARN] Supabase fetch failed ${res.status}: ${await res.text()}`);
      break;
    }
    const rows = await res.json();
    for (const r of rows) {
      // Ein Slug kann pro Standort mehrfach vorkommen – wir merken uns "irgendein"
      // Eintrag mit gefüllter seo_meta_description bevorzugt.
      const prev = overrides.get(r.slug);
      if (!prev || (!prev.seo_meta_description && r.seo_meta_description)) {
        overrides.set(r.slug, r);
      }
    }
  }
} else {
  console.error("[WARN] Supabase env fehlt – Overrides werden nicht geprüft.");
}

// ---------- Klassifiziere unerklärte Diffs ----------
function classify(d) {
  const m = d.path.match(/^\/mieten\/[^/]+\/[^/]+\/([^/]+)\/?$/);
  const slug = m ? m[1] : null;
  const ov = slug ? overrides.get(slug) : null;

  // 1) CMS-Override erklärt Diff?
  if (ov && ov.seo_meta_description && ov.seo_meta_description.trim() === (d.cur || "").trim()) {
    return { explained: true, cause: "CMS-Override (seo_meta_description)" };
  }
  if (ov && ov.seo_meta_description && (d.cur || "").includes(ov.seo_meta_description.trim().slice(0, 40))) {
    return { explained: true, cause: "CMS-Override (seo_meta_description, partial match)" };
  }

  // Unerklärt – Ursachen klassifizieren
  const causes = [];
  const base = d.base;
  const cur = d.cur;
  const name = ov?.name;

  // excelName-Fallback entfernt: Baseline enthielt einen Namen, der jetzt nicht mehr auftaucht
  if (name && base.includes(name) && !cur.includes(name)) {
    causes.push("Name in Baseline, nicht mehr in aktueller Description");
  }
  if (base.length && cur.length && Math.abs(base.length - cur.length) < 15) {
    causes.push("nur minimale Textänderung (~<15 Zeichen)");
  }
  if (!cur) causes.push("aktuelle Description leer");
  if (!base) causes.push("Baseline-Description leer");
  if (d.routeType && d.routeType !== "product") {
    causes.push(`non-product routeType=${d.routeType}`);
  }

  return { explained: false, cause: causes.length ? causes.join("; ") : "UNGEKLÄRT" };
}

const classified = diffs.map((d) => ({ ...d, ...classify(d) }));
const explained = classified.filter((d) => d.explained);
const unexplained = classified.filter((d) => !d.explained);

// ---------- Markdown-Ausgabe ----------
function esc(s) {
  return String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}
function trunc(s, n = 140) {
  s = String(s ?? "");
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

const out = [];
out.push("# Description-Diff-Erklärung (Baseline 2026-07-20 vs. aktuell)");
out.push("");
out.push(`Baseline: ${baseline.generatedAt} · Routen: ${baseline.routes.length}`);
out.push(`Aktuell:  ${current.generatedAt} · Routen: ${current.routes.length}`);
out.push("");
out.push("## a) Zusammenfassung");
out.push("");
out.push("| Kennzahl | Wert |");
out.push("|---|---:|");
out.push(`| Diffs gesamt | ${diffs.length} |`);
out.push(`| davon durch CMS-Override erklärt | ${explained.length} |`);
out.push(`| Rest (nicht durch Override erklärt) | ${unexplained.length} |`);
out.push(`| Produkt-Slugs in Diffs | ${productSlugs.size} |`);
out.push(`| Overrides in DB (seo_meta_description gefüllt) | ${[...overrides.values()].filter((v) => v.seo_meta_description).length} |`);
out.push("");
out.push("## b) Nicht durch Override erklärte Routen");
out.push("");
if (unexplained.length === 0) {
  out.push("_Keine unerklärten Diffs._");
} else {
  out.push("| Pfad | Description Baseline | Description aktuell | Ursache |");
  out.push("|---|---|---|---|");
  for (const d of unexplained) {
    out.push(`| ${esc(d.path)} | ${esc(trunc(d.base))} | ${esc(trunc(d.cur))} | ${esc(d.cause)} |`);
  }
}

console.log(out.join("\n"));
