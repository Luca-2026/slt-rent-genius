import { describe, it, expect } from "vitest";
import { revenueSummary, receivables, pipeline, periodStarts } from "@/lib/dashboardMetrics";

const today = new Date(2026, 8, 30); // Mi 30.09.2026

describe("dashboardMetrics", () => {
  it("Woche beginnt Montag", () => {
    expect(periodStarts(today)).toEqual({ day: "2026-09-30", week: "2026-09-28", month: "2026-09-01", year: "2026-01-01" });
  });
  it("Storno + Gutschrift heben sich auf, Entwürfe zählen nicht", () => {
    const r = revenueSummary(
      [
        { invoice_kind: "invoice", status: "cancelled", invoice_date: "2026-09-30", net_amount: 130, gross_amount: 154.7 },
        { invoice_kind: "credit_note", status: "paid", invoice_date: "2026-09-30", net_amount: -130, gross_amount: -154.7 },
        { invoice_kind: "invoice", status: "paid", invoice_date: "2026-09-29", net_amount: 680, gross_amount: 809.2 },
        { invoice_kind: "invoice", status: "draft", invoice_date: "2026-09-30", net_amount: 999, gross_amount: 999 },
        { invoice_kind: "invoice", status: "open", invoice_date: "2026-09-02", net_amount: 360, gross_amount: 428.4 },
      ],
      [
        { status: "cancelled", invoice_date: "2026-09-30", net_amount: 500, gross_amount: 595 },
        { status: "overdue", invoice_date: "2026-03-10", net_amount: 100, gross_amount: 119 },
      ],
      today,
    );
    expect(r).toEqual({ day: 0, week: 680, month: 1040, year: 1140 });
  });
  it("Portal-Testrechnung und Vollgutschrift saldieren centgenau in allen Zeiträumen", () => {
    expect(revenueSummary([], [
      { invoice_kind: "invoice", status: "cancelled", invoice_date: "2026-10-03", net_amount: 16.81, gross_amount: 20 },
      { invoice_kind: "credit_note", status: "paid", invoice_date: "2026-10-03", net_amount: -16.81, gross_amount: -20 },
      { invoice_kind: "invoice", status: "draft", invoice_date: "2026-10-03", net_amount: 100, gross_amount: 119 },
    ], new Date(2026, 9, 3))).toEqual({ day: 0, week: 0, month: 0, year: 0 });
  });
  it("Portal-Teilgutschrift reduziert Umsatz nur einmal und bleibt im Belegzeitraum", () => {
    const rows = [
      { invoice_kind: "invoice", status: "open", invoice_date: "2026-09-30", net_amount: 100, gross_amount: 119 },
      { invoice_kind: "credit_note", status: "paid", invoice_date: "2026-10-03", net_amount: -25, gross_amount: -29.75 },
    ];
    expect(revenueSummary([], rows, new Date(2026, 9, 3))).toEqual({ day: -25, week: 75, month: -25, year: 75 });
  });
  it("Forderungen ziehen Zahlungen und Gutschriften ab", () => {
    const r = receivables(
      [
        { invoice_kind: "invoice", status: "open", invoice_date: "2026-09-01", net_amount: 100, gross_amount: 119, paid_amount: 19, due_date: "2026-09-15" },
        { invoice_kind: "invoice", status: "open", invoice_date: "2026-09-29", net_amount: 100, gross_amount: 119, paid_amount: 119 },
      ],
      [{ status: "overdue", invoice_date: "2026-03-01", net_amount: 50, gross_amount: 59.5 }],
      today,
    );
    expect(r).toEqual({ open: 159.5, overdue: 159.5, overdueCount: 2 });
  });
  it("Pipeline trennt gesendet und angenommen", () => {
    expect(pipeline([
      { status: "offer_sent", offer_total_gross: 100 },
      { status: "accepted", offer_total_gross: 50 },
      { status: "done", offer_total_gross: 70 },
    ])).toEqual({ offered: 100, offeredCount: 1, accepted: 50, acceptedCount: 1 });
  });
});
