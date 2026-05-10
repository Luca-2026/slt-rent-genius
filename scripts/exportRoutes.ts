// Sprint 5 – Build-time export of route catalogue + per-route JSON-LD
// ---------------------------------------------------------------
// Run via: vite-node scripts/exportRoutes.ts
// Reads ALL_ROUTES + resolveRouteSchemas, serializes everything to
// dist/.prerender-routes.json so the pure-Node prerender script can
// consume it without needing TypeScript or vite asset resolution.

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  ALL_ROUTES,
  ROUTE_STATS,
  buildUsedMachineRoute,
  type SeoRoute,
  type UsedMachineSeoInput,
} from "../src/data/seo-routes-rental";
import {
  resolveRouteSchemas,
  buildGlobalSchemas,
} from "../src/data/schemas-rental";

const distDir = resolve(process.cwd(), "dist");
if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });

// ---------------------------------------------------------------
// Fetch live used-machine data from Supabase REST so each detail
// page gets its own prerendered HTML with proper OG title/image.
// ---------------------------------------------------------------
async function fetchUsedMachineRoutes(): Promise<SeoRoute[]> {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.warn("[exportRoutes] No Supabase env – skipping used-machine routes");
    return [];
  }
  try {
    const endpoint =
      `${url}/rest/v1/used_machines` +
      `?select=slug,manufacturer,model,year,hours,location,price_net,price_on_request,images,updated_at,status` +
      `&status=neq.sold`;
    const res = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      console.warn(`[exportRoutes] used_machines fetch failed: ${res.status}`);
      return [];
    }
    const rows = (await res.json()) as UsedMachineSeoInput[];
    return rows
      .filter((r) => r && r.slug && r.manufacturer && r.model)
      .map(buildUsedMachineRoute);
  } catch (err) {
    console.warn(`[exportRoutes] used_machines fetch error: ${(err as Error).message}`);
    return [];
  }
}

const usedMachineRoutes = await fetchUsedMachineRoutes();
const allRoutes: SeoRoute[] = [...ALL_ROUTES, ...usedMachineRoutes];

const enriched = allRoutes.map((route) => {
  // image fields from data-files may be webpack-resolved objects under
  // vite-node – normalize to plain string URLs (or strip).
  const stripImage = (img: unknown): string | undefined => {
    if (!img) return undefined;
    if (typeof img === "string") return img;
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
  stats: { ...ROUTE_STATS, usedMachines: usedMachineRoutes.length, total: enriched.length },
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
    `karriere=${ROUTE_STATS.karriere} usedMachines=${usedMachineRoutes.length} ` +
    `legal=${ROUTE_STATS.legal})`,
);
