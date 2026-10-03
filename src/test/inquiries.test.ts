import { describe, expect, it } from "vitest";
import { buildOfferTotals, formatEuro, lineTotal } from "@/components/b2b/inquiries/offerMath";
import { canTransition, isMyPendingInquiry, isOpenInquiry, normalizeInquiryStatus } from "@/lib/inquiryStatus";

describe("offerMath", () => {
  it("rechnet Rabatte pro Position korrekt", () => {
    expect(lineTotal({ quantity: 3, unit_price: 100, discount_percent: 10 })).toBe(270);
  });

  it("addiert Lieferkosten vor der Umsatzsteuer", () => {
    const totals = buildOfferTotals(
      [{ product_name: "A", quantity: 2, unit_price: 50, discount_percent: 0 }],
      50,
    );
    expect(totals.netAmount).toBe(150);
    expect(totals.vatAmount).toBe(28.5);
    expect(totals.grossAmount).toBe(178.5);
  });

  it("rundet zentgenau", () => {
    const totals = buildOfferTotals([{ product_name: "A", quantity: 3, unit_price: 33.33, discount_percent: 7 }]);
    expect(totals.grossAmount).toBe(Math.round(totals.grossAmount * 100) / 100);
  });

  it("formatiert Euro deutsch", () => {
    expect(formatEuro(1234.5).replace(/\u00a0/g, " ")).toBe("1.234,50 €");
  });
});

describe("inquiryStatus", () => {
  it("fällt auf 'new' zurück", () => {
    expect(normalizeInquiryStatus("quatsch")).toBe("new");
  });

  it("erlaubt nur definierte Übergänge", () => {
    expect(canTransition("new", "in_progress")).toBe(true);
    expect(canTransition("done", "accepted")).toBe(false);
    expect(canTransition("new", "new")).toBe(false);
  });

  it("markiert offene Anfragen", () => {
    expect(isOpenInquiry("offer_sent")).toBe(true);
    expect(isOpenInquiry("done")).toBe(false);
  });
});

import { isUnprocessedInquiry, matchesInquiryListFilter } from "@/lib/inquiryStatus";
describe("offene Anfragen", () => {
  it("offen = nicht übernommen und kein Angebot", () => {
    expect(isUnprocessedInquiry({ status: "new", assigned_to: null })).toBe(true);
    expect(isUnprocessedInquiry({ status: "new", assigned_to: "u1" })).toBe(false);
    expect(isUnprocessedInquiry({ status: "offer_sent", assigned_to: null })).toBe(false);
    expect(isUnprocessedInquiry({ status: "accepted", assigned_to: null })).toBe(false);
  });
  it("Filter trennen sauber", () => {
    expect(matchesInquiryListFilter({ status: "in_progress", assigned_to: "u1" }, "working")).toBe(true);
    expect(matchesInquiryListFilter({ status: "rejected", assigned_to: null }, "rejected")).toBe(true);
    expect(matchesInquiryListFilter({ status: "offer_sent", assigned_to: "u" }, "unprocessed")).toBe(false);
  });
  it("laufend = angenommen + Auftragsbestätigung, abgeschlossen = abgerechnet", () => {
    const ab = "2026-09-30T10:00:00Z";
    expect(matchesInquiryListFilter({ status: "accepted", order_confirmed_at: null }, "running")).toBe(false);
    expect(matchesInquiryListFilter({ status: "accepted", order_confirmed_at: null }, "accepted")).toBe(true);
    expect(matchesInquiryListFilter({ status: "accepted", order_confirmed_at: ab }, "running")).toBe(true);
    expect(matchesInquiryListFilter({ status: "accepted", order_confirmed_at: ab }, "accepted")).toBe(false);
    expect(matchesInquiryListFilter({ status: "done", order_confirmed_at: ab }, "running")).toBe(false);
    expect(matchesInquiryListFilter({ status: "done", order_confirmed_at: ab }, "completed")).toBe(true);
  });
});

describe("isMyPendingInquiry", () => {
  it("zeigt nur eigene, noch nicht versendete Anfragen", () => {
    expect(isMyPendingInquiry({ status: "in_progress", assigned_to: "u1" }, "u1")).toBe(true);
    expect(isMyPendingInquiry({ status: "new", assigned_to: "u1" }, "u1")).toBe(true);
    expect(isMyPendingInquiry({ status: "offer_sent", assigned_to: "u1" }, "u1")).toBe(false);
    expect(isMyPendingInquiry({ status: "in_progress", assigned_to: "u2" }, "u1")).toBe(false);
    expect(isMyPendingInquiry({ status: "in_progress", assigned_to: null }, "u1")).toBe(false);
    expect(isMyPendingInquiry({ status: "in_progress", assigned_to: "u1" }, null)).toBe(false);
  });
});
