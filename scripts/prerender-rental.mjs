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

// ---------------------------------------------------------------
// Schema.org Offer sanitizer (mirrors src/lib/sanitizeJsonLd.ts).
// Removes Offer / AggregateOffer nodes lacking price or
// priceSpecification.price so Google Search Console doesn't flag
// "price required" warnings.
// ---------------------------------------------------------------
const OFFER_TYPES = new Set(["Offer", "AggregateOffer"]);

function _isObj(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function _typeOf(node) {
  const t = node["@type"];
  if (typeof t === "string") return t;
  if (Array.isArray(t) && typeof t[0] === "string") return t[0];
  return null;
}
function _hasPrice(node) {
  const d = node.price;
  if (typeof d === "number" && Number.isFinite(d)) return true;
  if (typeof d === "string" && d.trim() !== "") return true;
  const spec = node.priceSpecification;
  const specs = Array.isArray(spec) ? spec : spec ? [spec] : [];
  for (const s of specs) {
    if (_isObj(s)) {
      const p = s.price;
      if (typeof p === "number" && Number.isFinite(p)) return true;
      if (typeof p === "string" && p.trim() !== "") return true;
    }
  }
  if (_typeOf(node) === "AggregateOffer") {
    if (node.lowPrice != null && String(node.lowPrice).trim() !== "") return true;
  }
  return false;
}
function _clean(node) {
  if (Array.isArray(node)) return node.map(_clean).filter((n) => n !== undefined);
  if (!_isObj(node)) return node;
  const t = _typeOf(node);
  if (t && OFFER_TYPES.has(t) && !_hasPrice(node)) return undefined;
  const out = {};
  for (const [k, v] of Object.entries(node)) {
    const c = _clean(v);
    if (k === "offers" || k === "makesOffer") {
      if (c === undefined) continue;
      if (Array.isArray(c) && c.length === 0) continue;
      out[k] = c;
      continue;
    }
    if (c !== undefined) out[k] = c;
  }
  return out;
}
function sanitizeJsonLd(input) {
  const r = _clean(input);
  if (r === undefined) return Array.isArray(input) ? [] : {};
  return r;
}

function jsonLdScript(obj) {
  const sanitized = sanitizeJsonLd(obj);
  // Avoid </script> injection by escaping forward slash in closing tags.
  const json = JSON.stringify(sanitized).replace(/<\/script/gi, "<\\/script");
  return `<script type="application/ld+json">${json}</script>`;
}

// ---------------------------------------------------------------
// Markdown → HTML (mirrors src/pages/RatgeberArticle.tsx renderer).
// Supports: ## / ### headings, - / * lists, 1. ordered lists,
// | table | rows |, **bold**, [text](href), `code`, paragraphs.
// Output is escaped HTML safe for direct injection into the SSR hero.
// ---------------------------------------------------------------
function inlineMd(text) {
  let out = "";
  let last = 0;
  const re = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)|`(.+?)`/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out += escapeHtml(text.slice(last, m.index));
    if (m[1]) out += `<strong>${escapeHtml(m[1])}</strong>`;
    else if (m[2] && m[3]) {
      const href = m[3];
      const external = /^https?:\/\//i.test(href);
      const rel = external ? ` target="_blank" rel="noopener noreferrer"` : "";
      out += `<a href="${escapeAttr(href)}"${rel} style="color:#00507d;text-decoration:underline;">${escapeHtml(m[2])}</a>`;
    } else if (m[4]) out += `<code style="background:#f1f5f9;padding:1px 4px;border-radius:4px;font-size:0.9em;">${escapeHtml(m[4])}</code>`;
    last = m.index + m[0].length;
  }
  if (last < text.length) out += escapeHtml(text.slice(last));
  return out;
}

function renderMarkdown(md) {
  const lines = String(md || "").split("\n");
  const out = [];
  let listBuf = [];
  let olBuf = [];
  let tblHead = [];
  let tblRows = [];
  let inTbl = false;

  const flushUl = () => { if (listBuf.length) { out.push(`<ul style="margin:0 0 16px;padding-left:24px;">${listBuf.join("")}</ul>`); listBuf = []; } };
  const flushOl = () => { if (olBuf.length) { out.push(`<ol style="margin:0 0 16px;padding-left:24px;">${olBuf.join("")}</ol>`); olBuf = []; } };
  const flushTbl = () => {
    if (!inTbl) return;
    const thead = `<thead><tr>${tblHead.map(h => `<th style="border:1px solid #e2e8f0;padding:6px 10px;background:#f8fafc;text-align:left;">${inlineMd(h)}</th>`).join("")}</tr></thead>`;
    const tbody = `<tbody>${tblRows.map(r => `<tr>${r.map(c => `<td style="border:1px solid #e2e8f0;padding:6px 10px;">${inlineMd(c)}</td>`).join("")}</tr>`).join("")}</tbody>`;
    out.push(`<div style="overflow-x:auto;margin:0 0 16px;"><table style="width:100%;border-collapse:collapse;font-size:14px;">${thead}${tbody}</table></div>`);
    tblHead = []; tblRows = []; inTbl = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("|")) {
      const cells = line.split("|").slice(1, -1).map(c => c.trim());
      if (!inTbl) {
        tblHead = cells; inTbl = true;
        if (i + 1 < lines.length && lines[i + 1].startsWith("|") && lines[i + 1].includes("---")) i++;
        continue;
      }
      if (cells.every(c => /^[-:]+$/.test(c))) continue;
      tblRows.push(cells);
      continue;
    } else {
      flushTbl();
    }

    if (line.startsWith("### ")) { flushUl(); flushOl(); out.push(`<h3 style="font-size:20px;font-weight:600;color:#1a1a1a;margin:24px 0 10px;">${inlineMd(line.slice(4))}</h3>`); continue; }
    if (line.startsWith("## ")) { flushUl(); flushOl(); out.push(`<h2 style="font-size:24px;font-weight:700;color:#1a1a1a;margin:32px 0 12px;">${inlineMd(line.slice(3))}</h2>`); continue; }

    if (/^[-*☑]\s/.test(line.trimStart())) {
      flushOl();
      const text = line.replace(/^\s*[-*☑]\s/, "");
      listBuf.push(`<li style="margin-bottom:4px;">${inlineMd(text)}</li>`);
      continue;
    } else {
      flushUl();
    }

    if (/^\d+\.\s/.test(line.trimStart())) {
      flushUl();
      const text = line.replace(/^\s*\d+\.\s/, "");
      olBuf.push(`<li style="margin-bottom:4px;">${inlineMd(text)}</li>`);
      continue;
    } else {
      flushOl();
    }

    if (!line.trim()) continue;

    out.push(`<p style="margin:0 0 14px;line-height:1.65;">${inlineMd(line)}</p>`);
  }

  flushUl(); flushOl(); flushTbl();
  return out.join("");
}

function buildRatgeberHeroBlock(route) {
  const a = route.ratgeber;
  const parts = [
    `<div data-prerender-hero style="max-width:780px;margin:0 auto;padding:32px 16px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1a1a1a;line-height:1.6;">`,
  ];

  if (route.breadcrumbs && route.breadcrumbs.length > 1) {
    parts.push(`<nav aria-label="Breadcrumb" style="font-size:14px;color:#555;margin-bottom:16px;"><ol style="list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:6px;">`);
    route.breadcrumbs.forEach((b, i) => {
      const sep = i > 0 ? `<span aria-hidden="true" style="margin:0 4px;">›</span>` : "";
      parts.push(`<li>${sep}<a href="${escapeAttr(withTrailingSlash(b.path))}" style="color:#00507d;text-decoration:none;">${escapeHtml(b.name)}</a></li>`);
    });
    parts.push(`</ol></nav>`);
  }

  parts.push(`<h1 style="font-size:clamp(28px,4vw,40px);color:#00507d;margin:0 0 12px;font-weight:700;line-height:1.2;">${escapeHtml(route.h1)}</h1>`);

  if (a?.date || a?.category) {
    const dateStr = a.date ? new Date(a.date).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" }) : "";
    parts.push(`<p style="font-size:14px;color:#666;margin:0 0 24px;">${a.date ? `<time datetime="${escapeAttr(a.date)}">${escapeHtml(dateStr)}</time>` : ""}${a.date && a.category ? " · " : ""}${a.category ? escapeHtml(a.category) : ""}</p>`);
  }

  if (a?.quickFacts && a.quickFacts.length) {
    parts.push(`<aside style="background:#f0f6fa;border:1px solid #cfe0ec;border-radius:12px;padding:18px 20px;margin:0 0 28px;"><h2 style="font-size:16px;font-weight:600;margin:0 0 10px;">Auf einen Blick</h2><ul style="margin:0;padding-left:20px;">`);
    for (const f of a.quickFacts) parts.push(`<li style="margin-bottom:4px;">${inlineMd(f)}</li>`);
    parts.push(`</ul></aside>`);
  }

  if (a?.content) {
    parts.push(`<div data-prerender-body>${renderMarkdown(a.content)}</div>`);
  } else {
    for (const p of route.intro || []) if (p) parts.push(`<p style="margin:0 0 12px;font-size:17px;">${escapeHtml(p)}</p>`);
  }

  if (a?.author || a?.updatedAt) {
    const upd = a.updatedAt ? new Date(a.updatedAt).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" }) : "";
    parts.push(`<p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #e2e8f0;font-size:14px;color:#666;">${a.author ? `Von <strong>${escapeHtml(a.author)}</strong>` : ""}${a.author && upd ? ", aktualisiert am " : (upd ? "Aktualisiert am " : "")}${upd ? `<time datetime="${escapeAttr(a.updatedAt)}">${escapeHtml(upd)}</time>` : ""}</p>`);
  }

  parts.push(`</div>`);
  return parts.join("");
}

function buildHeroBlock(route) {
  if (route.routeType === "ratgeber") return buildRatgeberHeroBlock(route);
  // Visible SSR-fallback content. Lives INSIDE #root so React's createRoot()
  // replaces it on hydration. Bots (Googlebot, GPTBot, ClaudeBot, PerplexityBot)
  // see real, visible HTML — users without JS see a usable page too.
  const parts = [
    `<div data-prerender-hero style="max-width:1200px;margin:0 auto;padding:24px 16px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1a1a1a;line-height:1.6;">`,
  ];
  if (route.breadcrumbs && route.breadcrumbs.length > 1) {
    parts.push(`<nav aria-label="Breadcrumb" style="font-size:14px;color:#555;margin-bottom:12px;"><ol style="list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:6px;">`);
    route.breadcrumbs.forEach((b, i) => {
      const sep = i > 0 ? `<span aria-hidden="true" style="margin:0 4px;">›</span>` : "";
      parts.push(`<li>${sep}<a href="${escapeAttr(withTrailingSlash(b.path))}" style="color:#00507d;text-decoration:none;">${escapeHtml(b.name)}</a></li>`);
    });
    parts.push(`</ol></nav>`);
  }
  parts.push(`<h1 style="font-size:clamp(28px,4vw,42px);color:#00507d;margin:0 0 16px;font-weight:700;">${escapeHtml(route.h1)}</h1>`);
  for (const p of route.intro || []) {
    if (p) parts.push(`<p style="margin:0 0 12px;font-size:17px;">${escapeHtml(p)}</p>`);
  }
  parts.push(`<p style="margin-top:24px;color:#888;font-size:14px;">Inhalt wird geladen…</p>`);
  parts.push(`</div>`);
  return parts.join("");
}

// Server (LiteSpeed) erzwingt Trailing-Slash via 301. Canonical & Sitemap-URLs
// MÜSSEN deshalb mit "/" enden, sonst markiert Google die Seiten als
// "Seite mit Weiterleitung" und indexiert sie nicht.
function withTrailingSlash(path) {
  if (!path || path === "/") return "/";
  const [pathOnly, query] = path.split("?");
  if (/\.[a-zA-Z0-9]{2,5}$/.test(pathOnly)) return path;
  const normalized = pathOnly.endsWith("/") ? pathOnly : `${pathOnly}/`;
  return query ? `${normalized}?${query}` : normalized;
}

function buildHeadBlock(route, globalSchemas) {
  const canonical = `${BASE_URL}${withTrailingSlash(route.canonical || route.path)}`;
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

  // Insert hero INSIDE #root so React's createRoot() replaces it on hydration.
  const heroInsert = `<!-- prerender:hero:start -->${heroBlock}<!-- prerender:hero:end -->`;
  out = out.replace(
    /<div id="root">\s*<\/div>/i,
    `<div id="root">${heroInsert}</div>`,
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
    const loc = `${BASE_URL}${withTrailingSlash(r.path)}`;
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
