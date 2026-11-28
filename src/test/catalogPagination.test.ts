import { describe, expect, it, vi } from "vitest";
import { readCompleteCatalog, validatePublicProduct, type PageRequest } from "../../supabase/functions/_shared/catalog-pagination";

const makeRows = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `id-${String(i).padStart(6, "0")}`, price: i }));
function pages(rows: ReturnType<typeof makeRows>, cap = 500) {
  return vi.fn(async ({ after, limit }: PageRequest) => {
    const remaining = rows.filter(r => after === null || r.id > after);
    return { rows: remaining.slice(0, Math.min(cap, limit)), count: remaining.length };
  });
}
describe("complete keyset catalogues", () => {
  it.each([0, 1, 999, 1000, 1001, 3500, 7001])("returns every row for %i articles including exact boundaries", async n => {
    const rows = makeRows(n), fetchPage = pages(rows);
    expect(await readCompleteCatalog(fetchPage)).toEqual(rows);
    expect(fetchPage).toHaveBeenCalledTimes(2 * (Math.ceil(n / 500) + 1));
  });
  it("continues short pages under a smaller server cap", async () => {
    const rows = makeRows(1001);
    expect(await readCompleteCatalog(pages(rows, 99))).toEqual(rows);
  });
  it("rejects unknown, negative, changing and implausible counts", async () => {
    for (const count of [null, -1, 0.5, 100001]) await expect(readCompleteCatalog(async () => ({ rows: [], count }), { attempts: 1 })).rejects.toThrow();
    let n = 0;
    await expect(readCompleteCatalog(async () => ++n === 1 ? { rows: makeRows(1), count: 2 } : { rows: [], count: 0 }, { attempts: 1 })).rejects.toThrow("changed");
  });
  it("rejects duplicate, missing and nonadvancing IDs and unordered pages", async () => {
    for (const rows of [[{ id: "" }], [{ id: "x" }, { id: "x" }], [{ id: "b" }, { id: "a" }]]) await expect(readCompleteCatalog(async () => ({ rows, count: rows.length }), { attempts: 1 })).rejects.toThrow();
  });
  it("rejects premature termination, excess rows and endless cursors", async () => {
    await expect(readCompleteCatalog(async () => ({ rows: [], count: 1 }), { attempts: 1 })).rejects.toThrow("Incomplete");
    await expect(readCompleteCatalog(async () => ({ rows: makeRows(2), count: 1 }), { attempts: 1 })).rejects.toThrow("exceeds");
    await expect(readCompleteCatalog(pages(makeRows(10), 1), { maxPages: 2, attempts: 1 })).rejects.toThrow("bound");
  });
  it("aborts a hung final page without returning partial results", async () => {
    let signal: AbortSignal | undefined;
    await expect(readCompleteCatalog(({ after, signal: s }) => {
      signal = s;
      return after ? new Promise<never>(() => {}) : Promise.resolve({ rows: makeRows(1), count: 1 });
    }, { attempts: 1, timeoutMs: 10 })).rejects.toThrow("timeout");
    expect(signal?.aborted).toBe(true);
  });
  it("rejects equal-count price/deactivation changes between complete passes", async () => {
    let pass = 0;
    await expect(readCompleteCatalog(async ({ after }) => {
      if (!after) pass++;
      return { rows: after ? [] : [{ id: "a", price: pass }], count: after ? 0 : 1 };
    }, { attempts: 1 })).rejects.toThrow("content changed");
  });
  it("retries an entire observation after transient failure and recovers", async () => {
    const normal = pages(makeRows(1001)); let fail = true;
    expect(await readCompleteCatalog(async r => { if (r.after && fail) { fail = false; throw new Error("503"); } return normal(r); })).toEqual(makeRows(1001));
  });
  it("validates public route identity, prices and private/draft leakage", () => {
    const p = { id: "a", slug: "test", category: "erdbewegung", name: "Fixture", available_locations: ["bonn"], price_from_1_rd: 100 };
    expect(() => validatePublicProduct(p)).not.toThrow();
    for (const patch of [{ is_published: false }, { internal_notes: "private" }, { price_from_1_rd: -1 }, { price_from_1_rd: "100" }, { slug: "../test" }, { available_locations: ["unknown"] }]) expect(() => validatePublicProduct({ ...p, ...patch })).toThrow();
  });
});