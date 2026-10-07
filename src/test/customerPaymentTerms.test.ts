import { describe, expect, it } from "vitest";
import { allowsCustomerPaymentTerms, safeCustomerPaymentTerms } from "@/lib/customerPaymentTerms";

describe("private customers never pay on invoice", () => {
  it.each(["net_7", "net_14", "net_30", "custom"])("rejects %s for private customers", (terms) => {
    expect(allowsCustomerPaymentTerms("private", terms)).toBe(false);
  });
  it("repairs old private invoice drafts to immediate payment", () => {
    expect(safeCustomerPaymentTerms("private", "net_14", true)).toBe("vorkasse");
  });
  it("repairs old private offer drafts to advance payment", () => {
    expect(safeCustomerPaymentTerms("private", "net_30", false)).toBe("anzahlung_30");
  });
  it("allows prepayment and leaves business terms unchanged", () => {
    expect(allowsCustomerPaymentTerms("private", "vorkasse")).toBe(true);
    expect(allowsCustomerPaymentTerms("private", "anzahlung_30")).toBe(true);
    expect(safeCustomerPaymentTerms("business", "net_14", true)).toBe("net_14");
  });
});