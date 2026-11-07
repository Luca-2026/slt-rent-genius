import { describe, expect, it } from "vitest";
import { depositRefundPayment } from "@/lib/depositRefundPayment";

const links = [{ id: "topup", status: "paid", deposit_cents: 4760, paid_cents: 4760 }, { id: "original", status: "paid", deposit_cents: 70000, paid_cents: 102963 }];
describe("deposit original payment", () => {
  it("Florian: refunds 700 € from 1029.63 € original payment, not 47.60 € top-up", () => {
    expect(depositRefundPayment(links, [], 70000)).toEqual({ link: links[1], available: 70000 });
  });
  it("keeps 69.97 € rental credit separate from 700 € deposit", () => {
    expect(depositRefundPayment(links, [], 76997)).toBeNull();
    expect(70000 + 6997).toBeLessThan(102963 + 4760);
  });
  it("counts unresolved refunds and only releases failed or canceled claims", () => {
    expect(depositRefundPayment(links, [{ link_id: "original", amount_cents: 70000, status: "creating" }], 70000)).toBeNull();
    expect(depositRefundPayment(links, [{ link_id: "original", amount_cents: 70000, status: "failed" }], 70000)?.link.id).toBe("original");
  });
});