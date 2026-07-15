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
  buildNewMachineRoute,
  type SeoRoute,
  type UsedMachineSeoInput,
  type NewMachineSeoInput,
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

async function fetchNewMachineRoutes(): Promise<SeoRoute[]> {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.warn("[exportRoutes] No Supabase env – skipping new-machine routes");
    return [];
  }
  try {
    const endpoint =
      `${url}/rest/v1/new_machines` +
      `?select=slug,brand,model,name,category,price_gross,price_on_request,vat_rate,short_description,images,updated_at,is_active` +
      `&is_active=eq.true`;
    const res = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      console.warn(`[exportRoutes] new_machines fetch failed: ${res.status}`);
      return [];
    }
    const rows = (await res.json()) as NewMachineSeoInput[];
    return rows
      .filter((r) => r && r.slug && r.brand && r.model)
      .map(buildNewMachineRoute);
  } catch (err) {
    console.warn(`[exportRoutes] new_machines fetch error: ${(err as Error).message}`);
    return [];
  }
}

// ---------------------------------------------------------------
// Fetch published CMS-managed rental products so prerendered HTML
// (title, H1, description, breadcrumbs, product image) always reflects
// the latest editor-published state. Without this override, the static
// build freezes names/descriptions from src/data/**/*Products.ts.
// ---------------------------------------------------------------
interface ManagedProductRoutePayload {
  slug: string;
  name: string;
  description: string | null;
  category: string;
  available_locations: string[];
  images: string[] | null;
  model_name: string | null;
}

async function fetchManagedProducts(): Promise<ManagedProductRoutePayload[]> {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.warn("[exportRoutes] No Supabase env – skipping managed-product overrides");
    return [];
  }
  try {
    const endpoint =
      `${url}/rest/v1/managed_products_public` +
      `?select=slug,name,description,category,available_locations,images,model_name`;
    const res = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      console.warn(`[exportRoutes] managed_products fetch failed: ${res.status}`);
      return [];
    }
    return (await res.json()) as ManagedProductRoutePayload[];
  } catch (err) {
    console.warn(`[exportRoutes] managed_products fetch error: ${(err as Error).message}`);
    return [];
  }
}

const LOCATION_DISPLAY_FOR_OVERRIDE: Record<string, string> = {
  krefeld: "Krefeld",
  bonn: "Bonn",
  muelheim: "Mülheim an der Ruhr",
};
function clampTitle(s: string, max = 60) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const last = cut.lastIndexOf(" ");
  return (last > 30 ? cut.slice(0, last) : cut).trim();
}
function clampDescription(s: string, max = 158) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const last = cut.lastIndexOf(" ");
  return ((last > 80 ? cut.slice(0, last) : cut).trim()) + "…";
}

const [usedMachineRoutes, newMachineRoutes, managedProducts] = await Promise.all([
  fetchUsedMachineRoutes(),
  fetchNewMachineRoutes(),
  fetchManagedProducts(),
]);
const allRoutes: SeoRoute[] = [...ALL_ROUTES, ...usedMachineRoutes, ...newMachineRoutes];

// Apply CMS overrides on matching product routes (by path).
if (managedProducts.length) {
  const routeByPath = new Map<string, SeoRoute>();
  for (const r of allRoutes) if (r.routeType === "product") routeByPath.set(r.path, r);
  let overridden = 0;
  for (const m of managedProducts) {
    const image = m.images && m.images.length ? m.images[0] : undefined;
    for (const loc of m.available_locations || []) {
      const path = `/mieten/${loc}/${m.category}/${m.slug}`;
      const route = routeByPath.get(path);
      if (!route) continue;
      const locName = LOCATION_DISPLAY_FOR_OVERRIDE[loc] || loc;
      route.title = clampTitle(`${m.name} mieten in ${locName} | SLT Rental`);
      route.h1 = `${m.name} mieten in ${locName}`;
      if (m.description) route.description = clampDescription(m.description);
      if (route.breadcrumbs && route.breadcrumbs.length) {
        route.breadcrumbs[route.breadcrumbs.length - 1] = {
          name: m.name,
          path: route.path,
        };
      }
      if (route.productData) {
        route.productData.name = m.name;
        if (m.description) route.productData.description = m.description;
        if (image) route.productData.image = image;
        if (m.model_name) route.productData.modelName = m.model_name;
      }
      overridden++;
    }
  }
  console.log(`[exportRoutes] CMS override applied on ${overridden} product routes (${managedProducts.length} rows).`);
}


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
  const ratgeber = route.routeType === "ratgeber" && route.ratgeberData
    ? {
        content: route.ratgeberData.content,
        quickFacts: route.ratgeberData.quickFacts,
        author: route.ratgeberData.author,
        date: route.ratgeberData.date,
        updatedAt: route.ratgeberData.updatedAt,
        category: route.ratgeberData.category,
      }
    : undefined;
  // Pass product/category payloads through so prerender can render
  // specs + FAQ statically (SEO-critical: no "Inhalt wird geladen…").
  const productData = route.routeType === "product" && route.productData
    ? {
        id: route.productData.id,
        name: route.productData.name,
        description: route.productData.description,
        image: route.productData.image,
        category: route.productData.category,
        locationId: route.productData.locationId,
        h2s: route.productData.h2s,
        useCaseBau: route.productData.useCaseBau,
        useCaseEvent: route.productData.useCaseEvent,
        useCasePrivat: route.productData.useCasePrivat,
        faqs: route.productData.faqs,
        modelName: route.productData.modelName,
      }
    : undefined;
  const categoryData = route.routeType === "category" && route.categoryData
    ? {
        category: route.categoryData.category,
        locationId: route.categoryData.locationId,
        productCount: route.categoryData.productCount,
        productSummaries: route.categoryData.productSummaries,
      }
    : undefined;
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
    ratgeber,
    productData,
    categoryData,
  };
});

const payload = {
  generatedAt: new Date().toISOString(),
  stats: { ...ROUTE_STATS, usedMachines: usedMachineRoutes.length, newMachines: newMachineRoutes.length, total: enriched.length },
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
    `newMachines=${newMachineRoutes.length} legal=${ROUTE_STATS.legal})`,
);
