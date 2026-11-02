import { describe, expect, it, vi } from "vitest";
import { invoiceNumberForGeneration, matchesDocumentPreview } from "../../supabase/functions/_shared/invoice-preview";

describe("invoice preview", () => {
  it("never consumes a number before final issuance", async () => {
    const allocate = vi.fn(async () => "RE-M-2026-10-0006");
    expect(await invoiceNumberForGeneration(true, allocate)).toBe("VORSCHAU – ENTWURF");
    expect(allocate).not.toHaveBeenCalled();
    expect(await invoiceNumberForGeneration(false, allocate)).toBe("RE-M-2026-10-0006");
    expect(allocate).toHaveBeenCalledTimes(1);
  });
  it("requires a preview of the exact current invoice before sending", () => {
    const body = { invoice_kind: "final", items: [{ quantity: 3, unit_price: 15 }], payments: [{ amount: 45 }] };
    const key = JSON.stringify(body);
    expect(matchesDocumentPreview(null, body)).toBe(false);
    expect(matchesDocumentPreview(key, body)).toBe(true);
    expect(matchesDocumentPreview(key, { ...body, items: [{ quantity: 4, unit_price: 15 }] })).toBe(false);
    expect(matchesDocumentPreview(key, { ...body, payments: [{ amount: 30 }] })).toBe(false);
  });
  it("requires a new preview after a post-return rental discount", () => {
    const body = { invoice_kind: "final", items: [{ quantity: 3, unit_price: 100, discount_percent: 0, addons: [{ amount: 20 }] }] };
    const changed = { ...body, items: [{ ...body.items[0], discount_percent: 10 }] };
    expect(matchesDocumentPreview(JSON.stringify(body), changed)).toBe(false);
    expect(matchesDocumentPreview(JSON.stringify(changed), changed)).toBe(true);
    expect(body.items[0].discount_percent).toBe(0);
    expect(changed.items[0].addons[0].amount).toBe(20);
  });
});