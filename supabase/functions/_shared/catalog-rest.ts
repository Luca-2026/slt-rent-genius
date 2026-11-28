import { readCompleteCatalog, type PageRequest } from "./catalog-pagination.ts";

export async function readRestCatalog<T extends { id: string }>(url: string, key: string, table: string, params: Record<string, string>, validate?: (row: T) => void): Promise<T[]> {
  return readCompleteCatalog<T>(async ({ after, limit, signal }: PageRequest) => {
    const query = new URLSearchParams({ ...params, order: "id.asc", limit: String(limit) });
    if (after) query.set("id", `gt.${after}`);
    const response = await fetch(`${url}/rest/v1/${table}?${query}`, { signal, headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" } });
    if (!response.ok) throw new Error(`Catalog request failed (${response.status})`);
    const range = response.headers.get("content-range")?.match(/\/(\d+)$/);
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error("Invalid catalog response");
    return { rows: rows as T[], count: range ? Number(range[1]) : null };
  }, { validate });
}