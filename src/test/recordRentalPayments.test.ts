import { describe, expect, it, vi } from "vitest";
import { recordRentalPayments } from "../../supabase/functions/_shared/record-rental-payments";
import { newBankDiscountPolicy } from "@/lib/bankTransferDiscount";

const fixture = (selected: "bank" | "regular" = "regular") => {
  const inquiry = { payment_decision_version: 2, offer_payload: { items: [{ product_name: "Miete", quantity: 1, unit_price: 100 }], deposit: 300, bank_transfer_discount: { ...newBankDiscountPolicy(), selected } } };
  const query: any = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: inquiry, error: null }) };
  return { from: () => query, rpc: vi.fn().mockResolvedValue({ data: { success: true, gross: 115.43 }, error: null }) };
};
describe("bank receipt automatically applies the agreed three percent", () => {
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