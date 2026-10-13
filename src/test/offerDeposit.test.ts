import { describe, expect, it } from "vitest";
import { needsOfferDepositWarning } from "../lib/offerDeposit";

describe("Kautionswarnung bei Angeboten", () => {
  it("warnt bei fehlender Kaution und 0 Euro", () => {
    for (const value of [undefined, null, "", "none", 0, "0", -1, NaN]) {
      expect(needsOfferDepositWarning(value)).toBe(true);
    }
  });
  it("warnt nicht bei positivem Kautionsbetrag", () => {
    expect(needsOfferDepositWarning(100)).toBe(false);
    expect(needsOfferDepositWarning("250")).toBe(false);
  });
  it("ändert Rechnungen und Verkaufsangebote nicht", () => {
    expect(needsOfferDepositWarning(0, false)).toBe(false);
  });
});