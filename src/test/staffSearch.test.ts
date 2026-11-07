import { describe, expect, it } from "vitest";
import { loadAllSearchRows, matchesStaffSearch } from "@/lib/staffSearch";

describe("staff search", () => {
  it("finds order IDs with or without hash and regardless of case", () => {
    expect(matchesStaffSearch(" #vxqcc4 ", ["VXQCC4"])).toBe(true);
    expect(matchesStaffSearch("vxqcc4", ["VXQCC4"])).toBe(true);
    expect(matchesStaffSearch("#OTHER1", ["VXQCC4"])).toBe(false);
  });
  it("searches both customer and company names, including umlaut spellings", () => {
    expect(matchesStaffSearch("Do ehler", ["Ralf Döhler"])).toBe(true);
    expect(matchesStaffSearch("Doehler Ralf", ["Ralf Döhler", "SLT"])).toBe(true);
    expect(matchesStaffSearch("SLT Ralf", ["Ralf Döhler", "SLT"])).toBe(true);
    expect(matchesStaffSearch("Carmen", ["Ralf Döhler", "SLT"])).toBe(false);
  });
  it("finds booking UUIDs, prefixes, offers and confirmations", () => {
    const fields = ["2f784c11-5425-4049-a71c-e38d72a6ac40", "ANG-M-2026-11-0035", "AB-M-2026-11-0031-A1"];
    for (const query of [fields[0], "2f784c11", "ang-m-2026-11-0035", "ab-m-2026-11-0031-a1"]) {
      expect(matchesStaffSearch(query, fields)).toBe(true);
    }
    expect(matchesStaffSearch("unknown", fields)).toBe(false);
  });
  it("loads older records beyond the first page", async () => {
    const source = Array.from({ length: 1001 }, (_, id) => ({ id }));
    const rows = await loadAllSearchRows(async (from, to) => ({ data: source.slice(from, to + 1), error: null }));
    expect(rows).toHaveLength(1001);
    expect(rows.at(-1)).toEqual({ id: 1000 });
  });
  it("does not silently return incomplete results on a failed page", async () => {
    await expect(loadAllSearchRows(async () => ({ data: null, error: new Error("failed") }))).rejects.toThrow("failed");
  });
});