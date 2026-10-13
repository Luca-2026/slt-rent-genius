import { describe, expect, it } from "vitest";
import { isPaymentOverdue, needsPaymentFollowup, paymentSatisfied, type FollowupCandidate } from "../../supabase/functions/_shared/payment-followup";

const now = new Date("2026-10-13T16:00:00Z");
const base: FollowupCandidate = {
  status: "accepted", offer_number: "ANG-M-1", customer_email: "kunde@example.com",
  offer_accepted_at: "2026-10-13T14:55:00Z", payment_followup_sent_at: null, order_confirmed_at: null,
  payment_terms: "vorkasse", gross: 100, deposit: 50, paid_cents: 0,
};

describe("Nachfass-E-Mail 1 Stunde nach Annahme", () => {
  it("sendet nach 1 Stunde ohne Zahlung", () => expect(needsPaymentFollowup(base, now)).toBe(true));
  it("sendet nicht vor Ablauf der Stunde", () =>
    expect(needsPaymentFollowup({ ...base, offer_accepted_at: "2026-10-13T15:30:00Z" }, now)).toBe(false));
  it("nur einmal", () => expect(needsPaymentFollowup({ ...base, payment_followup_sent_at: "2026-10-13T15:56:00Z" }, now)).toBe(false));
  it("nicht bei Zahlung auf Rechnung", () => expect(needsPaymentFollowup({ ...base, payment_terms: "net_14" }, now)).toBe(false));
  it("nicht wenn voll bezahlt (Miete + Kaution)", () => expect(needsPaymentFollowup({ ...base, paid_cents: 15000 }, now)).toBe(false));
  it("Vorkasse: nur Miete ohne Kaution reicht nicht", () => expect(needsPaymentFollowup({ ...base, paid_cents: 10000 }, now)).toBe(true));
  it("Anzahlung 30 % reicht", () =>
    expect(paymentSatisfied({ payment_terms: "anzahlung_30", gross: 100, deposit: 50, paid_cents: 3000 })).toBe(true));
});

describe("Zahlung überfällig 24 Stunden nach Nachfass-E-Mail", () => {
  it("überfällig nach 24 Stunden ohne Zahlung", () =>
    expect(isPaymentOverdue({ ...base, payment_followup_sent_at: "2026-10-12T15:59:00Z" }, now)).toBe(true));
  it("nicht vor Fristende", () =>
    expect(isPaymentOverdue({ ...base, payment_followup_sent_at: "2026-10-12T16:30:00Z" }, now)).toBe(false));
  it("nicht nach Anzahlung bei Anzahlungsangebot", () =>
    expect(isPaymentOverdue({ ...base, payment_terms: "anzahlung_30", paid_cents: 3000, payment_followup_sent_at: "2026-10-12T10:00:00Z" }, now)).toBe(false));
});
