import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AddonSection, buildAddonsFromOptions, syncOptionalTiers, lineContext } from "./OfferAddonSection";
import type { OfferLine, OfferLineAddon } from "./offerMath";
import { normalizeInquiryOfferItems } from "../../../../supabase/functions/_shared/inquiry-offer-math";

const item: OfferLine = { product_name: "Bagger", quantity: 1, duration: 3, unit: "miettage", unit_price: 100, discount_percent: 0 };
const option = { key: "maschinenbruch", label: "Maschinenbruchversicherung", price_type: "per_unit" as const, price: 10, deductible: 1500 };

describe("Editierbare Maschinenbruchversicherung je Artikel", () => {
  it("keeps and edits a stored optional tier even without current CMS options", () => {
    const initial: OfferLineAddon[] = [{ key: 'opt-historic', label: 'Selbstbehalt-Reduzierung', note: 'Selbstbehalt 750 €', optional: true, price_type: 'per_unit', rate: 10, basis: 'full_period', days: 5, amount: 50 }];
    let saved = initial;
    function Editor() {
      const [addons, setAddons] = useState(initial);
      return <AddonSection item={{ ...item, addons }} options={[]} isSales={false} onChange={next => { saved = next; setAddons(next); }} />;
    }
    render(<Editor />);
    fireEvent.change(screen.getByLabelText('Tagessatz netto'), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText('Selbstbehalt / Zusatztext'), { target: { value: 'Selbstbehalt 500 €' } });
    expect(saved[0]).toMatchObject({ rate: 12, amount: 60, note: 'Selbstbehalt 500 €', optional: true });
    expect(syncOptionalTiers(saved, [], lineContext(item), 5)).toEqual(saved);
  });
  it("erzwingt Kalendertage auch ohne alten CMS-Standard und erhält den Selbstbehalt", () => {
    const [addon] = buildAddonsFromOptions([option], [option], item, "2026-11-06", "2026-11-10");
    expect(addon.days).toBe(5);
    expect(addon.basis).toBe("full_period");
    expect(addon.amount).toBe(50);
    expect(addon.note).toBe("Selbstbehalt 1.500 €");
  });
  it("speichert individuelle Bezeichnung, Selbstbehalt, Satz und manuelle Kalendertage ohne andere Artikel zu verändern", () => {
    const initial = buildAddonsFromOptions([option], [option], item, "2026-11-06", "2026-11-10");
    let saved: OfferLineAddon[] = initial;
    function Editor() {
      const [addons, setAddons] = useState(initial);
      return <AddonSection item={{ ...item, addons }} options={[option]} isSales={false} periodStart="2026-11-06" periodEnd="2026-11-10"
        onChange={next => { saved = next; setAddons(next); }} />;
    }
    render(<Editor />);
    fireEvent.change(screen.getByLabelText("Bezeichnung der Zusatzoption"), { target: { value: "Maschinenbruchversicherung Bagger" } });
    fireEvent.change(screen.getByLabelText("Selbstbehalt / Zusatztext"), { target: { value: "Selbstbehalt 750 €" } });
    fireEvent.change(screen.getByLabelText("Tagessatz netto"), { target: { value: "12" } });
    fireEvent.change(screen.getByLabelText("Kalendertage gesamt"), { target: { value: "6" } });
    expect(saved[0].amount).toBe(72);
    expect(saved[0].days).toBe(6);
    expect(initial[0].amount).toBe(50);
    const normalized = normalizeInquiryOfferItems([{ ...item, articles: 1, quantity: 3, rental_start: "2026-11-06", rental_end: "2026-11-10", addons: saved }]);
    expect(normalized[0].addons?.[0]).toMatchObject({ label: "Maschinenbruchversicherung Bagger", note: "Selbstbehalt 750 €", days: 6, rate: 12, amount: 72, days_manual: true });
  });
});