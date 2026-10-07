import { describe, expect, it } from "vitest";
import { isAwaitingOfferConfirmation } from "@/lib/dashboardMetrics";

describe("accepted offers on staff home", () => {
  it("includes all 14 accepted inquiries, not only the three signed online", () => {
    const rows = Array.from({ length: 14 }, (_, index) => ({
      status: "accepted", offer_total_gross: 1.19, order_confirmed_at: null,
      onlineAcceptance: index < 3,
    }));
    expect(rows.filter(isAwaitingOfferConfirmation)).toHaveLength(14);
  });
  it("keeps an accepted offer older than 30 days visible", () => {
    const row = { status: "accepted", offer_total_gross: 1.19, offer_sent_at: "2026-03-11", order_confirmed_at: null };
    expect(isAwaitingOfferConfirmation(row)).toBe(true);
  });
  it("excludes confirmed and not-yet-accepted inquiries", () => {
    expect(isAwaitingOfferConfirmation({ status: "accepted", offer_total_gross: 1.19, order_confirmed_at: "2026-10-07" })).toBe(false);
    expect(isAwaitingOfferConfirmation({ status: "offer_sent", offer_total_gross: 1.19 })).toBe(false);
  });
});