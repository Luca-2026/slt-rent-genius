#!/usr/bin/env node
// Sprint 5 – Build-Time Prerender for ~1.250 routes
// ---------------------------------------------------------------
// Reads dist/.prerender-routes.json (produced by scripts/exportRoutes.ts)
// and emits a static index.html per route into dist/<route>/index.html.
// Also rewrites dist/sitemap.xml with all indexable routes.
//
// Pure Node, no TypeScript, no dependencies beyond node:fs/path.
// Resume-capable: an existing dist/<route>/index.html that contains the
// PRERENDER_MARKER is skipped on subsequent runs.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join, dirname } from "node:path";

const ROOT = process.cwd();
const DIST = resolve(ROOT, "dist");
const ROUTES_JSON = resolve(DIST, ".prerender-routes.json");
const TEMPLATE_HTML = resolve(DIST, "index.html");
const BASE_URL = "https://www.slt-rental.de";
const PRERENDER_MARKER = "<!-- prerender:slt-v1 -->";

if (!existsSync(ROUTES_JSON)) {
  console.error(`[prerender] FATAL: ${ROUTES_JSON} missing. Run vite-node scripts/exportRoutes.ts first.`);
  process.exit(1);
}
if (!existsSync(TEMPLATE_HTML)) {
  console.error(`[prerender] FATAL: ${TEMPLATE_HTML} missing. Run vite build first.`);
  process.exit(1);
}

const payload = JSON.parse(readFileSync(ROUTES_JSON, "utf-8"));
const template = readFileSync(TEMPLATE_HTML, "utf-8");

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(str) {
  return escapeHtml(str);
}

function jsonLdScript(obj) {
  // Avoid </script> injection by escaping forward slash in closing tags.
  const json = JSON.stringify(obj).replace(/<\/script/gi, "<\\/script");
  return `<script type="application/ld+json">${json}</script>`;
}

function buildHeroBlock(route) {
  const parts = [`<div data-prerender-hero style="position:absolute;left:-9999px;top:-9999px;visibility:hidden;">`];
  parts.push(`<h1>${escapeHtml(route.h1)}</h1>`);
  for (const p of route.intro || []) {
    if (p) parts.push(`<p>${escapeHtml(p)}</p>`);
  }
  if (route.breadcrumbs && route.breadcrumbs.length > 1) {
    parts.push(`<nav aria-label="Breadcrumb"><ol>`);
    for (const b of route.breadcrumbs) {
      parts.push(`<li><a href="${escapeAttr(b.path)}">${escapeHtml(b.name)}</a></li>`);
    }
    parts.push(`</ol></nav>`);
  }
  parts.push(`</div>`);
  return parts.join("");
}

function buildHeadBlock(route, globalSchemas) {
  const canonical = `${BASE_URL}${route.canonical || route.path}`;
  const ogImage = route.ogImage || `${BASE_URL}/images/og/default-slt-rental.png`;
  const ogType = route.ogType || "website";
  const titleFull = route.title.includes("SLT Rental") ? route.title : `${route.title} | SLT Rental`;
  const robots = route.noindex ? "noindex, follow" : "index, follow, max-image-preview:large";

  const lines = [
    `<title>${escapeHtml(titleFull)}</title>`,
    `<meta name="description" content="${escapeAttr(route.description)}">`,
    `<meta name="robots" content="${robots}">`,
    `<link rel="canonical" href="${escapeAttr(canonical)}">`,
    `<meta property="og:title" content="${escapeAttr(titleFull)}">`,
    `<meta property="og:description" content="${escapeAttr(route.description)}">`,
    `<meta property="og:type" content="${ogType}">`,
    `<meta property="og:image" content="${escapeAttr(ogImage)}">`,
    `<meta property="og:url" content="${escapeAttr(canonical)}">`,
    `<meta property="og:site_name" content="SLT Rental">`,
    `<meta property="og:locale" content="de_DE">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeAttr(titleFull)}">`,
    `<meta name="twitter:description" content="${escapeAttr(route.description)}">`,
    `<meta name="twitter:image" content="${escapeAttr(ogImage)}">`,
  ];

  for (const s of globalSchemas) lines.push(jsonLdScript(s));
  for (const s of route.schemas || []) lines.push(jsonLdScript(s));

  return lines.join("\n    ");
}

function injectIntoTemplate(html, headBlock, heroBlock) {
  let out = html;

  // Inject head block before </head>.
  // Strip any prior prerender block first (for resume / re-runs).
  out = out.replace(
    /<!-- prerender:head:start -->[\s\S]*?<!-- prerender:head:end -->/g,
    "",
  );
  out = out.replace(
    /<!-- prerender:hero:start -->[\s\S]*?<!-- prerender:hero:end -->/g,
    "",
  );

  const headInsert = `<!-- prerender:head:start -->\n    ${headBlock}\n    ${PRERENDER_MARKER}\n    <!-- prerender:head:end -->`;
  out = out.replace(/<\/head>/i, `${headInsert}\n  </head>`);

  // Insert hero AFTER #root so React hydration keeps #root pristine.
  const heroInsert = `\n    <!-- prerender:hero:start -->${heroBlock}<!-- prerender:hero:end -->\n`;
  out = out.replace(
    /(<div id="root">\s*<\/div>)/i,
    `$1${heroInsert}`,
  );

  return out;
}

function pathToFile(routePath) {
  if (routePath === "/") return join(DIST, "index.html");
  // Strip leading slash, treat as directory + index.html
  const clean = routePath.replace(/^\/+/, "").replace(/\/+$/, "");
  return join(DIST, clean, "index.html");
}

function isAlreadyPrerendered(filePath) {
  if (!existsSync(filePath)) return false;
  try {
    const content = readFileSync(filePath, "utf-8");
    return content.includes(PRERENDER_MARKER);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------
// Main
// ---------------------------------------------------------------

const RESUME = process.env.PRERENDER_RESUME === "1";
const routes = payload.routes;
const globalSchemas = payload.globalSchemas || [];

console.log(`[prerender] Starting (${routes.length} routes, resume=${RESUME})`);
const t0 = Date.now();

let written = 0;
let skipped = 0;
let errors = 0;

for (let i = 0; i < routes.length; i++) {
  const route = routes[i];
  try {
    const filePath = pathToFile(route.path);

    // Resume support: skip if already written by a previous run AND we're in resume mode.
    // Index.html (root) is always overwritten because that file IS the template.
    if (RESUME && route.path !== "/" && isAlreadyPrerendered(filePath)) {
      skipped++;
      continue;
    }

    const headBlock = buildHeadBlock(route, globalSchemas);
    const heroBlock = buildHeroBlock(route);
    const html = injectIntoTemplate(template, headBlock, heroBlock);

    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, html, "utf-8");
    written++;
  } catch (err) {
    errors++;
    console.error(`[prerender] ERR ${route.path}: ${err.message}`);
  }

  if ((i + 1) % 50 === 0) {
    process.stdout.write(
      `[prerender] ${i + 1}/${routes.length} (written=${written} skipped=${skipped} err=${errors})\n`,
    );
  }
}

// ---------------------------------------------------------------
// sitemap.xml
// ---------------------------------------------------------------

const sitemapEntries = routes
  .filter((r) => !r.noindex)
  .map((r) => {
    const loc = `${BASE_URL}${r.path}`;
    const parts = [`  <url>`, `    <loc>${escapeHtml(loc)}</loc>`];
    if (r.lastmod) parts.push(`    <lastmod>${escapeHtml(r.lastmod)}</lastmod>`);
    if (r.changefreq) parts.push(`    <changefreq>${escapeHtml(r.changefreq)}</changefreq>`);
    if (typeof r.priority === "number") parts.push(`    <priority>${r.priority.toFixed(1)}</priority>`);
    parts.push(`  </url>`);
    return parts.join("\n");
  })
  .join("\n");

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>
`;
writeFileSync(resolve(DIST, "sitemap.xml"), sitemapXml, "utf-8");

const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
console.log(
  `[prerender] DONE in ${elapsed}s — written=${written} skipped=${skipped} errors=${errors} sitemap=${
    routes.filter((r) => !r.noindex).length
  } urls`,
);

if (errors > 0) process.exit(1);
