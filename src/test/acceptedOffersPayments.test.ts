import { describe, expect, it } from "vitest";
import { hasRentalEnded, isAwaitingOfferConfirmation, rentalCloseoutTasks } from "@/lib/dashboardMetrics";

describe("accepted offers on staff home", () => {
  it("includes all 14 accepted inquiries, not only the three signed online", () => {
    const rows = Array.from({ length: 14 }, (_, index) => ({
      status: "accepted", offer_total_gross: 1.19, order_confirmed_at: null,
      onlineAcceptance: index < 3,
    }));
    expect(rows.filter((r) => isAwaitingOfferConfirmation(r))).toHaveLength(14);
  });
  it("keeps an accepted offer older than 30 days visible", () => {
    const row = { status: "accepted", offer_total_gross: 1.19, offer_sent_at: "2026-03-11", order_confirmed_at: null };
    expect(isAwaitingOfferConfirmation(row)).toBe(true);
  });
  it("excludes confirmed and not-yet-accepted inquiries", () => {
    expect(isAwaitingOfferConfirmation({ status: "accepted", offer_total_gross: 1.19, order_confirmed_at: "2026-10-07" })).toBe(false);
    expect(isAwaitingOfferConfirmation({ status: "offer_sent", offer_total_gross: 1.19 })).toBe(false);
  });
  it("Andre Krieger: Mietende 19.10., bezahlt am 19.10., am 20.10. keine neue Bestätigung", () => {
    const row = { status: "accepted", offer_total_gross: 301.07, end_date: "2026-10-19", end_time: "17:00", order_confirmed_at: null };
    expect(hasRentalEnded(row, new Date("2026-10-20T06:15:00Z"))).toBe(true);
    expect(isAwaitingOfferConfirmation(row, new Date("2026-10-20T06:15:00Z"))).toBe(false);
    expect(rentalCloseoutTasks({ deliverySigned: true, returnSigned: false, invoiced: false })).toEqual(["Rückgabe klären · Rückgabeprotokoll fehlt", "Schlussrechnung fehlt"]);
  });
  it("berücksichtigt Berliner Rückgabezeit am selben Tag", () => {
    const row = { status: "accepted", offer_total_gross: 1, end_date: "2026-10-20", end_time: "17:00" };
    expect(hasRentalEnded(row, new Date("2026-10-20T14:59:00Z"))).toBe(false);
    expect(hasRentalEnded(row, new Date("2026-10-20T15:00:00Z"))).toBe(true);
  });
  it("verlängerte Angebotsposition hat Vorrang; ohne Endzeit gilt Tagesende", () => {
    const row = { status: "accepted", offer_total_gross: 1, end_date: "2026-10-19", offer_payload: { items: [{ rental_end: "2026-10-21" }] } };
    expect(hasRentalEnded(row, new Date("2026-10-21T20:00:00Z"))).toBe(false);
    expect(hasRentalEnded(row, new Date("2026-10-21T22:01:00Z"))).toBe(true);
  });
  it("vollständig dokumentierte Miete benötigt keinen Abschlusshinweis", () => {
    expect(rentalCloseoutTasks({ deliverySigned: true, returnSigned: true, invoiced: true })).toEqual([]);
    expect(rentalCloseoutTasks({ deliverySigned: false, returnSigned: true, invoiced: true })).toEqual(["Übergabeprotokoll fehlt"]);
  });
});