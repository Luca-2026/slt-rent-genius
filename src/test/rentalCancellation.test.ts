import { describe, expect, it } from "vitest";
import { estimateRentalCancellation, cancellationInvoiceItems, type RentalCancellationInput } from "../../supabase/functions/_shared/rental-cancellation";
import { buildOfferTotals } from "../../supabase/functions/_shared/inquiry-offer-math";
import { canTransition, matchesInquiryListFilter, isOpenInquiry } from "@/lib/inquiryStatus";

const START = Date.parse("2026-11-30T09:00:00+01:00");
const input = (hours: number, overrides: Partial<RentalCancellationInput> = {}): RentalCancellationInput => ({
  customerKind: "private", termsVersion: "b2c-may-2026", contractConfirmed: true,
  rentalStart: new Date(START).toISOString(), receivedAt: new Date(START - hours * 3600000).toISOString(),
  recordedAt: "2026-12-01T09:00:00+01:00", handedOver: false, openEnded: false, partialCancellation: false,
  reason: "customer_cancellation", agreedRentalBasisCents: 10000,
  freeCancellationOptionAgreed: false, paidOptionCents: 0, ...overrides,
});

describe("AGB-Storno: reine Vorschau ohne automatische Durchführung", () => {
  it("übernimmt individuelle Privatkundengebühr 70 € brutto genau einmal", () => {
    expect(buildOfferTotals(cancellationInvoiceItems(7000, "gross", 19)).grossAmount).toBe(70);
  });
  it("berechnet individuelle Firmengebühr 70 € netto mit ausdrücklich gewählten 19 %", () => {
    expect(buildOfferTotals(cancellationInvoiceItems(7000, "net", 19)).grossAmount).toBe(83.3);
  });
  it("schlägt auf nicht steuerbare 70 € Entschädigung keine Umsatzsteuer auf", () => {
    expect(buildOfferTotals(cancellationInvoiceItems(7000, "gross", 0)).grossAmount).toBe(70);
  });
  it("behält bezahlte Option 5 € netto bei gebührenfreier Stornierung", () => {
    expect(buildOfferTotals(cancellationInvoiceItems(0, "gross", 0, 500)).grossAmount).toBe(5.95);
  });
  it("lässt individuelle Kulanzgebühr 0 € zu", () => {
    expect(buildOfferTotals(cancellationInvoiceItems(0, "gross", 0)).grossAmount).toBe(0);
  });
  it("akzeptiert keine negativen manuellen Stornogebühren", () => {
    expect(() => cancellationInvoiceItems(-1, "net", 0)).toThrow();
  });
  it("zeigt Stornos im eigenen Filter, nicht als offen und nicht wiedereröffnbar", () => {
    expect(matchesInquiryListFilter({ status: "cancelled" }, "cancelled")).toBe(true);
    expect(isOpenInquiry("cancelled")).toBe(false);
    expect(canTransition("cancelled", "in_progress")).toBe(false);
  });
  for (const [hours, privateRate, businessRate] of [
    [400, 25, 30], [336, 25, 30], [336 + 1 / 60, 25, 30], [336 - 1 / 60, 40, 50],
    [168, 40, 50], [168 + 1 / 60, 40, 50], [168 - 1 / 60, 60, 70],
    [72, 60, 70], [72 + 1 / 60, 60, 70], [72 - 1 / 60, 75, 85],
    [48, 75, 85], [48 + 1 / 60, 75, 85], [48 - 1 / 60, 85, 90],
  ]) {
    it(`Privat: ${hours} Stunden ergeben ${privateRate} % vom Bruttomietpreis`, () => {
      expect(estimateRentalCancellation(input(hours))).toMatchObject({ kind: "estimate", priceBasis: "gross", ratePercent: privateRate, compensationBasisCents: privateRate * 100, executionAllowed: false });
    });
    it(`Firma: ${hours} Stunden ergeben ${businessRate} % vom Nettomietpreis`, () => {
      expect(estimateRentalCancellation(input(hours, { customerKind: "business", termsVersion: "b2b-may-2026" }))).toMatchObject({ kind: "estimate", priceBasis: "net", ratePercent: businessRate, compensationBasisCents: businessRate * 100, executionAllowed: false });
    });
  }
  it("behält exakt 72 Stunden vorher den bezahlten 5-%-Aufpreis, aber keine Entschädigung", () => {
    expect(estimateRentalCancellation(input(72, { freeCancellationOptionAgreed: true, paidOptionCents: 500 }))).toMatchObject({ ratePercent: 0, compensationBasisCents: 0, retainedPaidOptionCents: 500, freeCancellationApplies: true });
  });
  it("wendet unmittelbar nach der Optionsfrist wieder die normale Staffel an", () => {
    expect(estimateRentalCancellation(input(72 - 1 / 60, { freeCancellationOptionAgreed: true, paidOptionCents: 500 }))).toMatchObject({ ratePercent: 75, compensationBasisCents: 7500, retainedPaidOptionCents: 500, freeCancellationApplies: false });
  });
  it("erfindet ohne bezahlten Optionsbeleg keinen einbehaltenen Betrag", () => {
    expect(estimateRentalCancellation(input(80, { freeCancellationOptionAgreed: true }))).toMatchObject({ compensationBasisCents: 0, retainedPaidOptionCents: 0 });
  });
  it("erzeugt ohne bestätigten Vertrag keine pauschalierte Stornoforderung", () => {
    expect(estimateRentalCancellation(input(48, { contractConfirmed: false }))).toEqual({ kind: "close_request", compensationBasisCents: 0, executionAllowed: false });
  });
  for (const override of [
    { termsVersion: null }, { termsVersion: "b2b-may-2026" }, { agreedRentalBasisCents: null },
    { handedOver: true }, { openEnded: true }, { partialCancellation: true }, { rentalStart: null },
    { rentalStart: "2026-11-30T09:00:00" }, { rentalStart: "2026-02-30T09:00:00Z" },
    { agreedRentalBasisCents: -1 }, { agreedRentalBasisCents: 100.5 }, { paidOptionCents: 500 },
    { reason: "statutory_right" }, { receivedAt: "2026-12-02T09:00:00Z" },
  ] satisfies Partial<RentalCancellationInput>[]) {
    it(`verlangt eine Prüfung: ${JSON.stringify(override)}`, () => {
      expect(estimateRentalCancellation(input(80, override))).toMatchObject({ kind: "manual_review", executionAllowed: false });
    });
  }
  it("verwendet Eingang statt späterer Bearbeitung", () => {
    expect(estimateRentalCancellation(input(336, { recordedAt: "2026-11-30T08:30:00+01:00" }))).toMatchObject({ ratePercent: 25 });
  });
  it("berücksichtigt die Berliner Sommerzeit in den expliziten Zeitpunkten", () => {
    expect(estimateRentalCancellation(input(80, { rentalStart: "2026-10-26T09:00:00+01:00", receivedAt: "2026-10-23T10:00:00+02:00" }))).toMatchObject({ noticeHours: 72, ratePercent: 60 });
  });
  it("rundet die Entschädigung einmal auf Cent", () => {
    expect(estimateRentalCancellation(input(336, { agreedRentalBasisCents: 21346 }))).toMatchObject({ compensationBasisCents: 5337 });
  });
  it("wendet Nichtabholungsquote nur nach Mietbeginn an", () => {
    expect(estimateRentalCancellation(input(2, { reason: "no_show", recordedAt: new Date(START - 3600000).toISOString() }))).toMatchObject({ kind: "manual_review" });
    expect(estimateRentalCancellation(input(-2, { reason: "no_show", freeCancellationOptionAgreed: true, paidOptionCents: 500 }))).toMatchObject({ ratePercent: 85, freeCancellationApplies: false });
    expect(estimateRentalCancellation(input(-2, { reason: "no_show", customerKind: "business", termsVersion: "b2b-may-2026" }))).toMatchObject({ ratePercent: 90 });
  });
  it("behandelt eine laufende Miete nicht als Vor-Mietbeginn-Storno", () => {
    expect(estimateRentalCancellation(input(-1))).toMatchObject({ kind: "manual_review", reason: "rental_already_started" });
  });
});