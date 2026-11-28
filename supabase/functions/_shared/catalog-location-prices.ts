import { readCompleteCatalog } from "./catalog-pagination.ts";
export interface PublicLocationPrice { managed_product_id: string; location: string; [key: string]: unknown }
export async function readRestLocationPrices(url: string, key: string): Promise<PublicLocationPrice[]> {
  const rows = await readCompleteCatalog(async ({ after, limit, signal }) => {
    const params = new URLSearchParams({ select: "*", order: "managed_product_id.asc,location.asc", limit: String(limit) });
    if (after) {
      const [id, location] = after.split(":");
      params.set("or", `(managed_product_id.gt.${id},and(managed_product_id.eq.${id},location.gt.${location}))`);
    }
    const response = await fetch(`${url}/rest/v1/public_product_prices?${params}`, { signal, headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" } });
    if (!response.ok) throw new Error(`Location price request failed (${response.status})`);
    const raw = await response.json();
    if (!Array.isArray(raw)) throw new Error("Invalid location prices");
    const data = (raw as PublicLocationPrice[]).map(r => {
      if (typeof r.managed_product_id !== "string" || !r.managed_product_id || !["krefeld", "bonn", "muelheim"].includes(r.location)) throw new Error("Invalid location price identity");
      for (const [k, v] of Object.entries(r)) if (k !== "managed_product_id" && k !== "location" && v !== null && (typeof v !== "number" || !Number.isFinite(v) || v < 0)) throw new Error("Invalid location price");
      return { ...r, id: `${r.managed_product_id}:${r.location}` };
    });
    const total = response.headers.get("content-range")?.match(/\/(\d+)$/);
    return { rows: data, count: total ? Number(total[1]) : null };
  });
  return rows.map(({ id: _key, ...r }) => r);
}