import { describe, expect, it } from "vitest";
import {
  addMonths, installmentPeriod, installmentDeductions, sumDeductions, nextInstallmentNumber,
  validateInstallment, percentOf, monthlyNetFromOffer, isInstallmentDue, invoiceSeries, deductionNote,
} from "@/lib/installments";

describe("installments", () => {
  it("trennt Rechnungskreise", () => {
    expect(invoiceSeries("rental")).toBe("M");
    expect(invoiceSeries("sales")).toBe("V");
  });

  it("verschiebt Monate mit Monatsende-Kappung", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2026-11-15", 2)).toBe("2027-01-15");
    expect(installmentPeriod("2026-10-01")).toEqual({ start: "2026-10-01", end: "2026-10-31" });
    expect(installmentPeriod("2026-10-15", 3)).toEqual({ start: "2026-10-15", end: "2027-01-14" });
  });

  it("zieht nur gültige Abschläge ab, Gutschriften anteilig", () => {
    const rows = [
      { id: "a", invoice_number: "RE-M-2026-10-0001", invoice_kind: "installment", invoice_date: "2026-10-01", status: "paid", net_amount: 1000, vat_amount: 190, gross_amount: 1190, installment_number: 1 },
      { id: "b", invoice_number: "RE-M-2026-11-0001", invoice_kind: "installment", invoice_date: "2026-11-01", status: "cancelled", net_amount: 1000, vat_amount: 190, gross_amount: 1190, installment_number: 2 },
      { id: "c", invoice_number: "RE-M-2026-12-0001", invoice_kind: "installment", invoice_date: "2026-12-01", status: "open", net_amount: 1000, vat_amount: 190, gross_amount: 1190, credited_amount: 595, installment_number: 3 },
      { id: "d", invoice_number: "RE-M-2026-12-0002", invoice_kind: "invoice", invoice_date: "2026-12-02", status: "open", net_amount: 50, vat_amount: 9.5, gross_amount: 59.5 },
    ];
    const list = installmentDeductions(rows);
    expect(list.map((d) => d.invoice_number)).toEqual(["RE-M-2026-10-0001", "RE-M-2026-12-0001"]);
    expect(list[1]).toMatchObject({ net: 500, vat: 95, gross: 595 });
    expect(sumDeductions(list)).toEqual({ net: 1500, vat: 285, gross: 1785 });
    expect(nextInstallmentNumber(rows)).toBe(4);
    expect(deductionNote(list, (d) => d)).toContain("Summe der Abschläge: netto 1500,00 €");
  });

  it("begrenzt Abschläge bei befristeten Aufträgen", () => {
    expect(validateInstallment(0, { openEnded: true, orderNet: null, alreadyBilledNet: 0 })).not.toBeNull();
    expect(validateInstallment(600, { openEnded: false, orderNet: 1000, alreadyBilledNet: 500 })).toContain("500,00");
    expect(validateInstallment(500, { openEnded: false, orderNet: 1000, alreadyBilledNet: 500 })).toBeNull();
    expect(validateInstallment(5000, { openEnded: true, orderNet: 1000, alreadyBilledNet: 900 })).toBeNull();
    expect(percentOf(1234.5, 30)).toBe(370.35);
  });

  it("schlägt Monatsbetrag aus Monatspositionen vor", () => {
    expect(
      monthlyNetFromOffer([
        { unit: "Monat", quantity: 2, unit_price: 900, discount_percent: 10, addons: [{ amount: 50 }] },
        { unit: "Pauschal", quantity: 1, unit_price: 150 },
      ]),
    ).toBe(1670);
  });

  it("erkennt fällige Abschläge", () => {
    expect(isInstallmentDue({ id: "1", installment_enabled: true, installment_next_due: "2026-10-01" }, "2026-10-01")).toBe(true);
    expect(isInstallmentDue({ id: "1", installment_enabled: true, installment_next_due: "2026-10-02" }, "2026-10-01")).toBe(false);
    expect(isInstallmentDue({ id: "1", installment_enabled: false, installment_next_due: "2026-09-01" }, "2026-10-01")).toBe(false);
    expect(isInstallmentDue({ id: "1", installment_enabled: true, installment_next_due: "2026-09-01", status: "rejected" }, "2026-10-01")).toBe(false);
  });
});
