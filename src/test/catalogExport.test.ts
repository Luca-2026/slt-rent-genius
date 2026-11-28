import { afterEach, expect, it, vi } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

let output = "";
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); if (output) rmSync(output, { recursive: true, force: true }); });
function fixture(n: number, failPrices = false) {
  output = mkdtempSync(join(tmpdir(), "slt-catalog-export-"));
  vi.stubEnv("SEO_OUTPUT_DIR", output); vi.stubEnv("VITE_SUPABASE_URL", "https://isolated.example.test"); vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "synthetic-public-key"); vi.stubEnv("CMS_URL_HISTORY_ENABLED", "false");
  const products = Array.from({ length: n }, (_, i) => ({ id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`, slug: `synthetic-${i}`, category: "erdbewegung", name: `Synthetic ${i}`, available_locations: ["bonn", "krefeld", "muelheim"], images: [], specifications: { Grabtiefe: "1820 mm" }, pricing_scheme: "bau", price_from_1_rd: 100, prices_same_all_locations: false, seo_meta_description: "Synthetic fixture only", rentware_code: {}, updated_at: "2026-11-28T10:00:00Z" }));
  const prices = products.flatMap(p => p.available_locations.map(location => ({ managed_product_id: p.id, location, price_from_1_rd: location === "bonn" ? 90 : 100 })));
  vi.stubGlobal("fetch", vi.fn(async (input: string) => {
    const url = new URL(input); if (url.origin !== "https://isolated.example.test") throw new Error("External request forbidden");
    const table = url.pathname.split("/").pop();
    if (table === "public_product_prices" && failPrices) return new Response("error", { status: 503 });
    let data: {id:string;[key:string]:unknown}[] = table === "managed_products_public" ? products : table === "public_product_prices" ? prices.map(p => ({ ...p, id: `${p.managed_product_id}:${p.location}` })) : [];
    const cursor = url.searchParams.get("id")?.slice(3);
    if (cursor) data = data.filter(p => p.id > cursor);
    const composite = url.searchParams.get("or")?.match(/managed_product_id\.gt\.([^,]+),and\(managed_product_id\.eq\.[^,]+,location\.gt\.([^\)]+)/);
    if (composite) data = data.filter(p => p.id > `${composite[1]}:${composite[2]}`);
    data.sort((a,b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
    const count = data.length;
    const page = data.slice(0, Math.min(99, Number(url.searchParams.get("limit") ?? 500))).map(p => table === "public_product_prices" ? Object.fromEntries(Object.entries(p).filter(([key]) => key !== "id")) : p);
    return new Response(JSON.stringify(page), { headers: { "content-range": `0-${Math.max(0,page.length-1)}/${count}`, "content-type": "application/json" } });
  }));
}
it("exports 1001 CMS articles at all three sites despite a server cap of 99, with location prices", async () => {
  fixture(1001);
  await import("../../scripts/exportRoutes");
  const payload = JSON.parse(readFileSync(join(output, ".prerender-routes.json"), "utf8"));
  const products = payload.routes.filter((r: {routeType:string}) => r.routeType === "product");
  expect(products).toHaveLength(3003);
  expect(new Set(products.map((r: {path:string}) => r.path)).size).toBe(3003);
  const bonn = products.find((r: {path:string}) => r.path.endsWith("/bonn/erdbewegung/synthetic-1000"));
  expect(JSON.stringify(bonn.schemas)).toContain("107.1"); // 90 net × 1.19, shared price resolver.
  const legacy = JSON.parse(readFileSync(join(output, ".legacy-redirects.json"), "utf8")).rules;
  const valid = new Set(payload.routes.map((r:{path:string})=>r.path.replace(/\/+$/, "")));
  expect(legacy.every((r:{from:string;to:string})=>valid.has(r.to.replace(/\/+$/, "")) && !valid.has(r.from.replace(/\/+$/, "")))).toBe(true);
}, 30_000);
it("confirmed empty CMS removes every static product instead of reviving July data", async () => {
  fixture(0); await import("../../scripts/exportRoutes");
  const payload = JSON.parse(readFileSync(join(output, ".prerender-routes.json"), "utf8"));
  expect(payload.routes.filter((r:{routeType:string})=>r.routeType === "product")).toHaveLength(0);
  expect(payload.routes.some((r:{path:string})=>r.path === "/mieten/bonn")).toBe(true);
});
it("a failed price page does not overwrite the last validated output", async () => {
  fixture(1, true); writeFileSync(join(output, ".prerender-routes.json"), "previous validated release");
  await expect(import("../../scripts/exportRoutes")).rejects.toThrow();
  expect(readFileSync(join(output, ".prerender-routes.json"), "utf8")).toBe("previous validated release");
});