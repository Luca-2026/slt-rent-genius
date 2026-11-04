import { describe, expect, it } from "vitest";
import { invoiceExtraFields, normalizeExtraFields } from "../../supabase/functions/_shared/inquiry-offer-math";
import { cleanExtraFields } from "@/components/b2b/inquiries/offerMath";

describe("customer references from offers to invoices", () => {
  const references = { commission: "KOM-2026-014", project: "BV-2026-081", orderer: "Testbesteller", cost_center: "KS-42" };
  it.each(["rental", "sales"])("preserves commission and project for %s invoices", () => {
    const savedOffer = { extra_fields: normalizeExtraFields(cleanExtraFields(references)) };
    expect(invoiceExtraFields(savedOffer, undefined)).toEqual(references);
  });
  it.each(["invoice", "supplement", "installment", "final"])("inherits references when a %s draft omits them", () => {
    expect(invoiceExtraFields({ extra_fields: references }, {})).toEqual(references);
  });
  it("keeps inherited references alongside an explicit editor correction", () => {
    expect(invoiceExtraFields({ extra_fields: references }, { project: "BV-2026-082" })).toEqual({ ...references, project: "BV-2026-082" });
    expect(references.project).toBe("BV-2026-081");
  });
  it("omits absent references on legacy offers", () => {
    expect(invoiceExtraFields(null, undefined)).toBeUndefined();
    expect(invoiceExtraFields({}, { commission: "  ", project: null })).toBeUndefined();
  });
});