import { describe, it, expect } from "vitest";
import { issuedInvoiceGross } from "@/components/b2b/inquiries/InquiryDetailPanel";
describe("issuedInvoiceGross", () => {
  it("uses the issued invoice instead of the offer (#5CQAZZ)", () => {
    expect(issuedInvoiceGross([{ invoice_kind: "invoice", status: "open", gross_amount: 1979.21, credited_amount: 0 }])).toBe(1979.21);
  });
  it("ignores drafts, cancelled invoices and credit notes", () => {
    expect(issuedInvoiceGross([
      { invoice_kind: "invoice", status: "draft", gross_amount: 5, credited_amount: 0 },
      { invoice_kind: "invoice", status: "cancelled", gross_amount: 5, credited_amount: 0 },
      { invoice_kind: "credit_note", status: "open", gross_amount: 5, credited_amount: 0 },
    ])).toBeNull();
  });
});
