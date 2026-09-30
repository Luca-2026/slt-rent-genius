import { describe, expect, it } from "vitest";
import { evaluateOrderPayment } from "@/lib/orderConfirmation";

describe("evaluateOrderPayment", () => {
  it("sperrt ohne Zahlungseingang bei Vorkasse", () => {
    const r = evaluateOrderPayment({ gross: 500, payments: [], paymentTerms: "vorkasse" });
    expect(r.state).toBe("none");
    expect(r.canSend).toBe(false);
    expect(r.blockReason).toMatch(/kein Zahlungseingang/);
  });

  it("erlaubt ohne Zahlung bei Zahlung auf Rechnung nur mit Bestätigung", () => {
    const r = evaluateOrderPayment({ gross: 500, payments: [], paymentTerms: "net_14" });
    expect(r.canSend).toBe(true);
    expect(r.needsAcknowledgement).toBe(true);
  });

  it("erkennt Teilzahlung und offenen Rest (inkl. Kaution)", () => {
    const r = evaluateOrderPayment({ gross: 595, deposit: 200, payments: [{ amount: 595 }], paymentTerms: "vorkasse" });
    expect(r.state).toBe("partial");
    expect(r.openCents).toBe(20000);
    expect(r.needsAcknowledgement).toBe(true);
  });

  it("vollständig bezahlt nur bei Summe + Kaution, centgenau", () => {
    const r = evaluateOrderPayment({ gross: 100.1, deposit: 0.2, payments: [{ amount: 0.1 }, { amount: 100.2 }] });
    expect(r.state).toBe("full");
    expect(r.openCents).toBe(0);
    expect(r.needsAcknowledgement).toBe(false);
  });

  it("1 Cent zu wenig ist nicht vollständig", () => {
    const r = evaluateOrderPayment({ gross: 178.5, payments: [{ amount: 178.49 }] });
    expect(r.state).toBe("partial");
    expect(r.openCents).toBe(1);
  });

  it("ohne Angebotssumme gesperrt – niemals 'vollständig bezahlt'", () => {
    const r = evaluateOrderPayment({ gross: null, payments: [] });
    expect(r.state).toBe("no_total");
    expect(r.canSend).toBe(false);
  });

  it("meldet Überzahlung", () => {
    const r = evaluateOrderPayment({ gross: 100, payments: [{ amount: 120 }] });
    expect(r.state).toBe("full");
    expect(r.overpaidCents).toBe(2000);
  });
});
