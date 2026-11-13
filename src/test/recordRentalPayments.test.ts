import { describe, expect, it, vi } from "vitest";
import { recordRentalPayments } from "../../supabase/functions/_shared/record-rental-payments";
import { newBankDiscountPolicy } from "@/lib/bankTransferDiscount";

const fixture = (selected: "bank" | "regular" = "regular", documents: { issued?: boolean; settlement?: boolean; readError?: boolean } = {}) => {
  const inquiry = { payment_decision_version: 2, offer_payload: { items: [{ product_name: "Miete", quantity: 1, unit_price: 100 }], deposit: 300, bank_transfer_discount: { ...newBankDiscountPolicy(), selected } } };
  const query: any = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: inquiry, error: null }) };
  return { from: (table: string) => {
    if (table === "rental_inquiries") return query;
    const result = { data: (table === "inquiry_invoices" ? documents.issued : documents.settlement) ? [{ id: "issued" }] : [], error: documents.readError ? new Error("Unavailable") : null };
    const docs: any = { select: () => docs, eq: () => docs, not: () => docs, limit: async () => result };
    return docs;
  }, rpc: vi.fn().mockResolvedValue({ data: { success: true, gross: 115.43 }, error: null }) };
};
describe("bank receipt automatically applies the agreed three percent", () => {
  it("records UVWBYM's actual 1824.03 EUR bank receipt without changing its issued installment price", async () => {
    const service = fixture("regular", { issued: true });
    const receipt = [{ label: "Banküberweisung", amount: 1824.03, date: "2026-11-16" }];
    await recordRentalPayments(service, "UVWBYM", "staff", [], receipt);
    expect(service.rpc).toHaveBeenCalledWith("record_rental_staff_payments", expect.objectContaining({ _payments: receipt, _bank_payload: null }));
  });
  it("preserves the agreed price after a deposit settlement while recording real money", async () => {
    const service = fixture("regular", { settlement: true });
    await recordRentalPayments(service, "id", "staff", [], [{ label: "Banküberweisung", amount: 119 }]);
    expect(service.rpc.mock.calls[0]?.[1]._bank_payload).toBeNull();
  });
  it("does not record a receipt if protected document status cannot be read", async () => {
    const service = fixture("regular", { readError: true });
    await expect(recordRentalPayments(service, "id", "staff", [], [{ label: "Banküberweisung", amount: 119 }])).rejects.toThrow("geprüft");
    expect(service.rpc).not.toHaveBeenCalled();
  });
  it("records actual money and the 3% price in one protected transaction, with unchanged deposit", async () => {
    const service = fixture();
    const receipt = [{ label: "Banküberweisung", amount: 415.43 }];
    await recordRentalPayments(service, "id", "staff", [], receipt);
    expect(service.rpc).toHaveBeenCalledWith("record_rental_staff_payments", expect.objectContaining({
      _payments: receipt, _expected_payments: [], _bank_payload: expect.objectContaining({ deposit: 300, totals: expect.objectContaining({ grossAmount: 115.43 }), bank_transfer_discount: expect.objectContaining({ selected: "bank", rate: 3 }) }),
    }));
  });
  it("does not grant an automatic discount to mixed payments", async () => {
    const service = fixture();
    await recordRentalPayments(service, "id", "staff", [], [{ label: "Barzahlung", amount: 10 }, { label: "Banküberweisung", amount: 100 }]);
    expect(service.rpc.mock.calls[0]?.[1]._bank_payload).toBeNull();
  });
  it("does not recalculate a previously selected bank discount on subsequent transfers", async () => {
    const service = fixture("bank");
    await recordRentalPayments(service, "id", "staff", [], [{ label: "Banküberweisung", amount: 20 }]);
    expect(service.rpc.mock.calls[0]?.[1]._bank_payload).toBeNull();
  });
  it("surfaces transaction failures instead of claiming a receipt was saved", async () => {
    const service = fixture();
    service.rpc.mockResolvedValue({ data: null, error: { message: "Zahlungen inzwischen geändert" } });
    await expect(recordRentalPayments(service, "id", "staff", [], [{ label: "Banküberweisung", amount: 20 }])).rejects.toThrow("inzwischen");
  });
});