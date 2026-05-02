#!/usr/bin/env node
// Sprint 5 Smoke-Test (Mock dist/index.html)
// ---------------------------------------------------------------
// Ohne echten vite-build: legt eine Mock-Shell `dist/index.html` an,
// triggert exportRoutes via vite-node und prerender-rental, und
// validiert eine Stichprobe von Routen (Aufgabe 8).

import { spawnSync } from "node:child_process";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  statSync,
  rmSync,
} from "node:fs";
import { resolve, join } from "node:path";

const ROOT = process.cwd();
const DIST = resolve(ROOT, "dist");

function step(label) {
  console.log(`\n=== ${label} ===`);
}

function fail(msg) {
  console.error(`\n[SMOKE FAIL] ${msg}`);
  process.exit(1);
}

function run(cmd, args, env = {}) {
  const r = spawnSync(cmd, args, {
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  if (r.status !== 0) fail(`${cmd} ${args.join(" ")} exited ${r.status}`);
}

// 1. Mock dist
step("1. Mock dist/index.html anlegen");
if (existsSync(DIST)) rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
const MOCK_SHELL = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Loading…</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/main.js"></script>
  </body>
</html>
`;
writeFileSync(join(DIST, "index.html"), MOCK_SHELL, "utf-8");
console.log("  mock dist/index.html written");

// 2. exportRoutes via vite-node
step("2. vite-node scripts/exportRoutes.ts");
run("npx", ["vite-node", "scripts/exportRoutes.ts"]);

const payload = JSON.parse(
  readFileSync(join(DIST, ".prerender-routes.json"), "utf-8"),
);
console.log(`  routes loaded: ${payload.routes.length}`);
console.log(`  stats: ${JSON.stringify(payload.stats)}`);

// 3. Prerender
step("3. node scripts/prerender-rental.mjs");
run("node", ["scripts/prerender-rental.mjs"]);

// 4. Verify counts
step("4. Routen-Counts");
const routes = payload.routes;
console.log(`  Total written candidates: ${routes.length}`);

// 5. Smoke-Stichproben
step("5. Stichproben");
const samples = [
  "/",
  "/standorte/krefeld",
  "/standorte/bonn",
  "/standorte/muelheim",
  "/mieten-in/krefeld",
  "/mieten-in/duesseldorf",
  "/mieten/krefeld/anhaenger",
  "/loesungen/garten-landschaftsbau",
  "/impressum",
  "/ratgeber/minibagger-mieten-ohne-fuehrerschein",
];

const sizes = [];
for (const p of samples) {
  const fp = p === "/" ? join(DIST, "index.html") : join(DIST, p.replace(/^\//, ""), "index.html");
  if (!existsSync(fp)) {
    console.warn(`  MISSING ${p} -> ${fp}`);
    continue;
  }
  const s = statSync(fp).size;
  sizes.push({ path: p, size: s });
  const html = readFileSync(fp, "utf-8");
  const schemaCount = (html.match(/application\/ld\+json/g) || []).length;
  console.log(`  ${p.padEnd(50)} ${String(s).padStart(7)} bytes  ${schemaCount} schemas`);
}

// 6. Mülheim-Schema-Verifikation
step("6. Mülheim-LocalBusiness JSON-LD");
const mhFile = join(DIST, "standorte/muelheim/index.html");
if (!existsSync(mhFile)) fail("Mülheim-Standort-File fehlt");
const mhHtml = readFileSync(mhFile, "utf-8");
if (!mhHtml.includes("Ruhrorter Str. 122")) fail("Mülheim-Adresse falsch");
if (!mhHtml.includes("Bobcat")) fail("Mülheim-Bobcat-Hinweis fehlt");
if (!mhHtml.includes("Zentrallager in Krefeld")) fail("Mülheim-Krefeld-Hinweis fehlt");
console.log("  ✓ Adresse Ruhrorter Str. 122 vorhanden");
console.log("  ✓ Bobcat-Hinweis vorhanden");
console.log("  ✓ Krefeld-Disposition-Hinweis vorhanden");

// Print Mülheim LocalBusiness JSON
const mhMatch = mhHtml.match(/<script type="application\/ld\+json">(\{[^<]*"@id":"[^"]*muelheim[^"]*"[^<]*\})<\/script>/);
if (mhMatch) {
  console.log("\n--- Mülheim LocalBusiness JSON-LD ---");
  try {
    console.log(JSON.stringify(JSON.parse(mhMatch[1]), null, 2));
  } catch {
    console.log(mhMatch[1].slice(0, 500));
  }
}

// 7. Bonn-Adresse
step("7. Bonn-Adresse");
const bnFile = join(DIST, "standorte/bonn/index.html");
const bnHtml = readFileSync(bnFile, "utf-8");
if (!bnHtml.includes("Drachenburgstra")) fail("Bonn-Adresse fehlt");
console.log("  ✓ Drachenburgstraße 8 vorhanden");

// 8. Hero-Block
step("8. Hero-Block-Stichprobe (Düsseldorf)");
const dueFile = join(DIST, "mieten-in/duesseldorf/index.html");
if (existsSync(dueFile)) {
  const dueHtml = readFileSync(dueFile, "utf-8");
  if (!dueHtml.includes("data-prerender-hero")) fail("Hero-Container fehlt");
  if (!/<h1>[^<]*Düsseldorf/.test(dueHtml)) fail("H1 mit Düsseldorf fehlt");
  console.log("  ✓ Hero + H1 mit Düsseldorf vorhanden");
}

// 9. Stats
step("9. Bytes-Verteilung");
sizes.sort((a, b) => a.size - b.size);
if (sizes.length > 0) {
  console.log(`  min=${sizes[0].size}  median=${sizes[Math.floor(sizes.length / 2)].size}  max=${sizes[sizes.length - 1].size}`);
}

// 10. Sitemap
step("10. sitemap.xml");
const sitemap = readFileSync(join(DIST, "sitemap.xml"), "utf-8");
const urlCount = (sitemap.match(/<url>/g) || []).length;
console.log(`  sitemap urls: ${urlCount}`);

// 11. Resume test
step("11. Resume-Test (zweiter Run mit PRERENDER_RESUME=1)");
run("node", ["scripts/prerender-rental.mjs"], { PRERENDER_RESUME: "1" });

console.log("\n[SMOKE OK]");
