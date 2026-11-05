import { describe, expect, it, vi } from "vitest";
import { selectStaffRentalPayment } from "../../supabase/functions/_shared/staff-payment-decision";
import { newBankDiscountPolicy } from "../../supabase/functions/_shared/bank-transfer-discount";

function serviceFixture(options: { issued?: boolean; settlement?: boolean; readError?: boolean; selected?: "regular" | "bank"; payments?: unknown[] } = {}) {
  const inquiry = { id: "test", offer_number: "TEST", payment_decision_version: 2, offer_total_gross: 119,
    payments: options.payments ?? [], offer_payload: { items: [{ product_name: "Miete", quantity: 1, unit_price: 100 }], bank_transfer_discount: { ...newBankDiscountPolicy(), selected: options.selected ?? "regular" } } };
  const rpc = vi.fn().mockResolvedValue({ data: { gross: 115.43 }, error: null });
  const from = (table: string) => {
    const response = table === "rental_inquiries" ? { data: inquiry, error: null } : { data: (table === "inquiry_invoices" ? options.issued : options.settlement) ? [{ id: "issued" }] : [], error: options.readError ? new Error("Unavailable") : null };
    const query: any = { select: () => query, eq: () => query, not: () => query, limit: () => Promise.resolve(response), maybeSingle: () => Promise.resolve(response) };
    return query;
  };
  return { from, rpc };
}

describe("staff rental payment decisions", () => {
  it("applies exactly 3 percent on 100 EUR net through the protected decision", async () => {
    const service = serviceFixture();
    await selectStaffRentalPayment(service, "test", "bank");
    expect(service.rpc).toHaveBeenCalledWith("select_rental_payment_method", expect.objectContaining({ _expected: 2, _method: "bank", _payload: expect.objectContaining({ totals: expect.objectContaining({ grossAmount: 115.43 }) }) }));
  });
  it("blocks a payment change after an issued invoice", async () => {
    const service = serviceFixture({ issued: true });
    await expect(selectStaffRentalPayment(service, "test", "bank")).rejects.toThrow("Belegkorrektur");
    expect(service.rpc).not.toHaveBeenCalled();
  });
  it("blocks discount for a mixed cash payment", async () => {
    const service = serviceFixture({ payments: [{ amount: 10, label: "Barzahlung" }] });
    await expect(selectStaffRentalPayment(service, "test", "bank")).rejects.toThrow("vollständig");
    expect(service.rpc).not.toHaveBeenCalled();
  });
  it("fails closed when issued documents cannot be read", async () => {
    const service = serviceFixture({ readError: true });
    await expect(selectStaffRentalPayment(service, "test", "bank")).rejects.toThrow("geprüft");
    expect(service.rpc).not.toHaveBeenCalled();
  });
  it("blocks a change after deposit settlement", async () => {
    const service = serviceFixture({ settlement: true });
    await expect(selectStaffRentalPayment(service, "test", "bank")).rejects.toThrow("Kaution");
    expect(service.rpc).not.toHaveBeenCalled();
  });
});