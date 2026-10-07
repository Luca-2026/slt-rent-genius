import { describe, expect, it } from "vitest";
import { needsPaymentReminder, type ReminderCandidate } from "../../supabase/functions/_shared/payment-reminder";

const now = new Date("2026-10-07T16:00:00Z"); // 18:00 Berlin
const base: ReminderCandidate = {
  status: "accepted", start_date: "2026-10-09", start_time: "08:00", customer_email: "kunde@example.com",
  offer_number: "ANG-M-1", payment_reminder_sent_at: null, payment_terms: "vorkasse", open_cents: 10000,
};

describe("Zahlungserinnerung 48 h vor Mietbeginn", () => {
  it("sendet innerhalb von 48 Stunden vor Mietbeginn", () => expect(needsPaymentReminder(base, now)).toBe(true));
  it("sendet nicht früher als 48 Stunden vorher", () =>
    expect(needsPaymentReminder({ ...base, start_date: "2026-10-10", start_time: "08:00" }, now)).toBe(false));
  it("sendet sofort bei später Annahme (z. B. Mietbeginn morgen)", () =>
    expect(needsPaymentReminder({ ...base, start_date: "2026-10-08" }, now)).toBe(true));
  it("nur einmal je Anfrage", () =>
    expect(needsPaymentReminder({ ...base, payment_reminder_sent_at: "2026-10-07T10:00:00Z" }, now)).toBe(false));
  it("nicht bei vollständig bezahlt", () => expect(needsPaymentReminder({ ...base, open_cents: 0 }, now)).toBe(false));
  it("nicht bei Zahlung auf Rechnung", () => expect(needsPaymentReminder({ ...base, payment_terms: "net_14" }, now)).toBe(false));
  it("nur angenommene Angebote", () => expect(needsPaymentReminder({ ...base, status: "offer_sent" }, now)).toBe(false));
  it("nicht nach Mietbeginn", () => expect(needsPaymentReminder({ ...base, start_date: "2026-10-07", start_time: "08:00" }, now)).toBe(false));
});
