import { describe, it, expect } from "vitest";
import { classifyChange, validateCatalogSnapshot, parseContentRangeTotal, createRefreshCoordinator } from "@/lib/publicationRefresh";

const pub = (o: Record<string, unknown> = {}) => ({ id: "a", slug: "minibagger-1t", is_published: true, price_from_1_rd: 89, ...o });
const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `id${i}`, slug: `s${i}` }));
const noSleep = async () => {};

describe("classifyChange", () => {
  it("ignores drafts entirely", () => {
    expect(classifyChange({ is_published: false, name: "a" }, { is_published: false, name: "b" })).toBe("none");
    expect(classifyChange(null, { is_published: false, slug: "x" })).toBe("none");
  });
  it("detects publish and unpublish", () => {
    expect(classifyChange(pub({ is_published: false }), pub())).toBe("published");
    expect(classifyChange(pub(), pub({ is_published: false }))).toBe("unpublished");
  });
  it("detects public field changes (price, specs, faq, images, slug, category, locations)", () => {
    for (const patch of [{ price_from_1_rd: 95 }, { specifications: { Grabtiefe: "1820 mm" } }, { seo_faqs: [{ q: "x" }] },
      { images: ["/product-images/a.jpg"] }, { slug: "neu" }, { category: "erdbewegung" }, { available_locations: ["bonn"] }]) {
      expect(classifyChange(pub(), pub(patch))).toBe("public_update");
    }
  });
  it("ignores internal-only and unchanged fields, key order irrelevant", () => {
    expect(classifyChange(pub({ internal_notes: "a", updated_at: "1" }), pub({ internal_notes: "b", updated_at: "2" }))).toBe("none");
    expect(classifyChange(pub({ specifications: { a: 1, b: 2 } }), pub({ specifications: { b: 2, a: 1 } }))).toBe("none");
  });
  it("location price changes of a published article count", () => {
    expect(classifyChange(pub(), pub(), true)).toBe("public_update");
  });
});

describe("validateCatalogSnapshot", () => {
  it("accepts confirmed empty, rejects partial, unknown-count, duplicate and draft rows", () => {
    expect(validateCatalogSnapshot([], 0).ok).toBe(true);
    expect(validateCatalogSnapshot([], 1).ok).toBe(false);
    expect(validateCatalogSnapshot(rows(1000), 1393).ok).toBe(false);
    expect(validateCatalogSnapshot(rows(3), null).ok).toBe(false);
    expect(validateCatalogSnapshot([...rows(2), { id: "id0", slug: "s0" }], 3).ok).toBe(false);
    expect(validateCatalogSnapshot([{ id: "x", slug: "x", is_published: false }], 1).ok).toBe(false);
    expect(validateCatalogSnapshot({ error: "timeout" }, 1).ok).toBe(false);
  });
  it("accepts a complete snapshot", () => expect(validateCatalogSnapshot(rows(393), 393).ok).toBe(true));
  it("parses content-range totals", () => {
    expect(parseContentRangeTotal("0-392/393")).toBe(393);
    expect(parseContentRangeTotal("*/0")).toBe(0);
    expect(parseContentRangeTotal("0-9/*")).toBeNull();
    expect(parseContentRangeTotal(null)).toBeNull();
  });
});

describe("refresh coordinator", () => {
  it("is disabled by default path: never builds or activates", async () => {
    let calls = 0;
    const c = createRefreshCoordinator({ enabled: false, adapter: { build: async () => { calls++; return { artifact: 1, rows: rows(1), expectedCount: 1 }; }, activate: async () => { calls++; } } });
    await c.notify("public_update");
    expect(calls).toBe(0);
    expect(c.state.status).toBe("disabled");
  });
  it("coalesces changes arriving during a run and never runs in parallel", async () => {
    let active = 0, maxActive = 0, builds = 0;
    let release!: () => void;
    const gate = new Promise<void>((r) => { release = r; });
    const c = createRefreshCoordinator({ enabled: true, sleep: noSleep, adapter: {
      build: async (rev) => { active++; maxActive = Math.max(maxActive, active); builds++; if (builds === 1) await gate; active--; return { artifact: rev, rows: rows(2), expectedCount: 2 }; },
      activate: async () => {},
    } });
    const p = c.notify("public_update");
    c.notify("published"); c.notify("public_update");
    release();
    await p;
    expect(maxActive).toBe(1);
    expect(builds).toBe(2);
    expect(c.state.builtRevision).toBe(3);
    expect(c.state.lastGood).toBe(3);
    expect(c.state.status).toBe("updated");
  });
  it("ignores irrelevant changes", async () => {
    let builds = 0;
    const c = createRefreshCoordinator({ enabled: true, sleep: noSleep, adapter: { build: async () => { builds++; return { artifact: 1, rows: rows(1), expectedCount: 1 }; }, activate: async () => {} } });
    await c.notify("none");
    expect(builds).toBe(0);
  });
  it("retries with bounded attempts and keeps the last good artifact on failure (DB timeout / empty / partial)", async () => {
    let n = 0; const activated: string[] = [];
    const c = createRefreshCoordinator<string>({ enabled: true, maxAttempts: 3, sleep: noSleep, adapter: {
      build: async () => { n++; if (n === 1) return { artifact: "good", rows: rows(2), expectedCount: 2 };
        if (n === 2) throw new Error("timeout"); if (n === 3) return { artifact: "empty-partial", rows: [], expectedCount: 2 };
        return { artifact: "partial", rows: rows(1000), expectedCount: 1200 }; },
      activate: async (a) => { activated.push(a); },
    } });
    await c.notify("public_update");
    await c.notify("public_update");
    expect(activated).toEqual(["good"]);
    expect(c.state.lastGood).toBe("good");
    expect(c.state.status).toBe("failed");
    expect(c.state.lastError).toMatch(/unvollständig/);
    expect(n).toBe(4);
  });
  it("recovers after a transient failure with a retry", async () => {
    let n = 0;
    const c = createRefreshCoordinator({ enabled: true, sleep: noSleep, adapter: { build: async () => { if (++n === 1) throw new Error("503"); return { artifact: "ok", rows: rows(1), expectedCount: 1 }; }, activate: async () => {} } });
    await c.notify("published");
    expect(c.state.status).toBe("updated");
    expect(c.state.lastGood).toBe("ok");
  });
  it("activation failure does not replace last good artifact", async () => {
    const c = createRefreshCoordinator({ enabled: true, maxAttempts: 1, sleep: noSleep, adapter: { build: async () => ({ artifact: "new", rows: rows(1), expectedCount: 1 }), activate: async () => { throw new Error("deploy refused"); } } });
    await c.notify("public_update");
    expect(c.state.lastGood).toBeNull();
    expect(c.state.status).toBe("failed");
  });
});
