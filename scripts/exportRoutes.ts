// Sprint 5 – Build-time export of route catalogue + per-route JSON-LD
// ---------------------------------------------------------------
// Run via: vite-node scripts/exportRoutes.ts
// Reads ALL_ROUTES + resolveRouteSchemas, serializes everything to
// dist/.prerender-routes.json so the pure-Node prerender script can
// consume it without needing TypeScript or vite asset resolution.

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { ALL_ROUTES, ROUTE_STATS } from "../src/data/seo-routes-rental";
import {
  resolveRouteSchemas,
  buildGlobalSchemas,
} from "../src/data/schemas-rental";

const distDir = resolve(process.cwd(), "dist");
if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });

const enriched = ALL_ROUTES.map((route) => {
  // image fields from data-files may be webpack-resolved objects under
  // vite-node – normalize to plain string URLs (or strip).
  const stripImage = (img: unknown): string | undefined => {
    if (!img) return undefined;
    if (typeof img === "string") return img;
    // vite-node returns asset modules as { default: "/asset/..." } – take src
    if (typeof img === "object" && img && "src" in (img as Record<string, unknown>)) {
      return String((img as Record<string, unknown>).src);
    }
    return undefined;
  };
  if (route.productData?.image) {
    route.productData.image = stripImage(route.productData.image);
  }
  if (route.ogImage) route.ogImage = stripImage(route.ogImage) || route.ogImage;

  const schemas = resolveRouteSchemas(route);
  return {
    path: route.path,
    routeType: route.routeType,
    title: route.title,
    description: route.description,
    h1: route.h1,
    intro: route.intro,
    canonical: route.canonical,
    ogImage: route.ogImage,
    ogType: route.ogType,
    noindex: route.noindex === true,
    changefreq: route.changefreq,
    priority: route.priority,
    lastmod: route.lastmod,
    breadcrumbs: route.breadcrumbs,
    schemas,
  };
});

const payload = {
  generatedAt: new Date().toISOString(),
  stats: ROUTE_STATS,
  globalSchemas: buildGlobalSchemas(),
  routes: enriched,
};

const outPath = resolve(distDir, ".prerender-routes.json");
writeFileSync(outPath, JSON.stringify(payload), "utf-8");

console.log(
  `[exportRoutes] Wrote ${enriched.length} routes to ${outPath} ` +
    `(static=${ROUTE_STATS.static} standort=${ROUTE_STATS.standort} ` +
    `localarea=${ROUTE_STATS.localarea} solution=${ROUTE_STATS.solution} ` +
    `category=${ROUTE_STATS.category} product=${ROUTE_STATS.product} ` +
    `[seo=${ROUTE_STATS.productWithSEO}] ratgeber=${ROUTE_STATS.ratgeber} ` +
    `legal=${ROUTE_STATS.legal})`,
);
