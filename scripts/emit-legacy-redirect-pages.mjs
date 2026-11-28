#!/usr/bin/env node
// Statische Weiterleitungsseiten für Alt-URLs.
// Das Hosting (Lovable/Cloudflare) wertet keine .htaccess aus und liefert
// für unbekannte Pfade die Startseite. Damit Alt-URLs nicht als Kopie der
// Startseite (Canonical „/“) gecrawlt werden, bekommt jede Regel aus
// dist/.legacy-redirects.json eine kleine Seite mit Canonical auf das Ziel,
// noindex und sofortiger Weiterleitung. Nur Ziele, die im Build als echte
// Seite existieren; vorhandene Seiten werden nie überschrieben.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";

const DIST = resolve(process.cwd(), "dist");
const RULES = resolve(DIST, ".legacy-redirects.json");
const ORIGIN = "https://www.slt-rental.de";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const pageFile = (path) => join(DIST, path.replace(/^\/+|\/+$/g, ""), "index.html");
const SAFE = /^\/[a-z0-9\-/äöüß._]*$/i;

export function redirectHtml(to) {
  const url = `${ORIGIN}${to}`;
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Weiterleitung | SLT Rental</title><meta name="robots" content="noindex, follow"><link rel="canonical" href="${esc(url)}"><meta http-equiv="refresh" content="0; url=${esc(to)}"><script>location.replace(${JSON.stringify(to)}+location.search+location.hash)</script></head><body><p>Diese Seite ist umgezogen: <a href="${esc(to)}">${esc(url)}</a></p></body></html>`;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  if (!existsSync(RULES)) {
    console.error(`[legacy-pages] FEHLT: ${RULES}`);
    process.exit(1);
  }
  const { rules } = JSON.parse(readFileSync(RULES, "utf-8"));
  let written = 0, skipped = 0;
  for (const { from, to } of rules) {
    const target = `/${to.replace(/^\/+|\/+$/g, "")}/`;
    if (!SAFE.test(from) || !SAFE.test(target) || from.includes("..")) { skipped++; continue; }
    if (from.replace(/\/+$/, "") === target.replace(/\/+$/, "")) { skipped++; continue; }
    const out = pageFile(from);
    if (existsSync(out) || !existsSync(pageFile(target))) { skipped++; continue; }
    mkdirSync(resolve(out, ".."), { recursive: true });
    writeFileSync(out, redirectHtml(target), "utf-8");
    written++;
  }
  console.log(`[legacy-pages] ${written} Weiterleitungsseiten geschrieben, ${skipped} übersprungen`);
}
