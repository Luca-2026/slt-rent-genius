/** Runtime-neutral keyset pagination. Two matching full reads are an observation,
 * not a PostgreSQL MVCC snapshot; persistent churn fails closed. */
export interface CatalogPage<T> { rows: T[]; count: number | null }
export interface PageRequest { after: string | null; limit: number; signal: AbortSignal }
export const CATALOG_FRESH_MS = 60_000;
export function canonicalCatalog(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalCatalog).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonicalCatalog((value as Record<string, unknown>)[k])}`).join(",")}}`;
  return JSON.stringify(value) ?? "null";
}
export async function readCompleteCatalog<T extends { id: string }>(
  fetchPage: (request: PageRequest) => PromiseLike<CatalogPage<T>>,
  options: { pageSize?: number; maxRows?: number; maxPages?: number; timeoutMs?: number; totalTimeoutMs?: number; attempts?: number; validate?: (row: T) => void } = {},
): Promise<T[]> {
  const { pageSize = 500, maxRows = 100_000, maxPages = 1000, timeoutMs = 10_000, totalTimeoutMs = 60_000, attempts = 2 } = options;
  for (const n of [pageSize, maxRows, maxPages, timeoutMs, totalTimeoutMs, attempts]) if (!Number.isSafeInteger(n) || n < 1) throw new Error("Invalid catalog bounds");
  const deadline = Date.now() + totalTimeoutMs;
  async function pass(): Promise<T[]> {
    const rows: T[] = []; let after: string | null = null; let total: number | null = null;
    for (let page = 0; page < maxPages; page++) {
      const controller = new AbortController();
      const remainingMs = deadline - Date.now();
      if (remainingMs <= 0) throw new Error("Catalog total timeout");
      let timer: ReturnType<typeof setTimeout> | undefined;
      const timeout = new Promise<never>((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error("Catalog timeout")); }, Math.min(timeoutMs, remainingMs)); });
      let result: CatalogPage<T>;
      try { result = await Promise.race([Promise.resolve(fetchPage({ after, limit: pageSize, signal: controller.signal })), timeout]); }
      finally { clearTimeout(timer); }
      if (!Number.isSafeInteger(result.count) || result.count === null || result.count < 0 || result.count > maxRows) throw new Error("Catalog count unavailable or implausible");
      // PostgREST exact count includes the keyset filter, i.e. remaining rows.
      const expected = rows.length + result.count;
      if (expected > maxRows || (total !== null && total !== expected)) throw new Error("Catalog changed during read");
      total = expected;
      if (!Array.isArray(result.rows) || result.rows.length > pageSize) throw new Error("Invalid catalog page");
      for (const row of result.rows) {
        if (!row || typeof row.id !== "string" || !row.id || (after !== null && row.id <= after)) throw new Error("Missing, duplicate or non-advancing catalog ID");
        options.validate?.(row); rows.push(row); after = row.id;
      }
      if (rows.length > total || rows.length > maxRows) throw new Error("Catalog exceeds count");
      // Always verify termination, even on exact boundaries; a short page may be a server cap.
      if (result.rows.length === 0) {
        if (rows.length !== total) throw new Error("Incomplete catalog");
        return rows;
      }
    }
    throw new Error("Catalog page bound exceeded");
  }
  let last: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const first = await pass(), second = await pass();
      if (canonicalCatalog(first) !== canonicalCatalog(second)) throw new Error("Catalog content changed between reads");
      return second;
    } catch (error) { last = error; }
  }
  throw last instanceof Error ? last : new Error("Catalog unavailable");
}

/** Public projections must never promote draft/internal records or invalid route facts. */
export function validatePublicProduct(row: { id: string }): void {
  const r = row as Record<string, unknown>;
  for (const key of ["slug", "category", "name"]) if (typeof r[key] !== "string" || !r[key]) throw new Error(`Invalid public ${key}`);
  for (const key of ["slug", "category"]) if (/[\/%?#\\\s]/.test(String(r[key]))) throw new Error("Unsafe public route segment");
  if (!Array.isArray(r.available_locations) || r.available_locations.some(l => !["krefeld", "bonn", "muelheim"].includes(l))) throw new Error("Invalid public locations");
  if (r.is_published === false || ["internal_notes", "quantities", "customer_email"].some(k => k in r)) throw new Error("Private catalog record");
  for (const [key, value] of Object.entries(r)) if (/^price_(from_|base_|short_|weekend_num)|^surcharge_|^deposit_amount$/.test(key) && value !== null && (typeof value !== "number" || !Number.isFinite(value) || value < 0)) throw new Error("Invalid public numeric price");
}