/**
 * Paket 3b – Abnahmeregeln: Gruppen, Auftragsart, optionale Versicherungsstufen,
 * Editor-Summe = Serversumme, alte Angebote unverändert.
 */
import { describe, expect, it } from "vitest";
import {
  buildOfferTotals,
  ensureCategoryGroup,
  groupedIndices,
  nextOrderType,
  type OfferLine,
} from "@/components/b2b/inquiries/offerMath";
import { buildOptionalTier, lineContext } from "@/components/b2b/inquiries/OfferAddonSection";
import {
  buildOfferTotals as serverTotals,
  normalizeInquiryOfferItems,
  normalizeOfferGroups,
  normalizeExtraFields,
} from "../../supabase/functions/_shared/inquiry-offer-math";
import { offerPayloadToLines } from "@/components/b2b/inquiries/InquiryDetailPanel";
import type { AddonOption } from "@/lib/offerAddons";

/** Wie InquiryOfferForm.buildBody: quantity = Artikel × Dauer. */
function toServer(items: OfferLine[]) {
  return items.map((i) => ({
    ...i,
    articles: i.quantity,
    duration: i.duration ?? 1,
    quantity: i.quantity * (i.duration ?? 1),
    unit: "Kalendertage",
    unit_code: "kalendertage",
  }));
}

describe("Positionsgruppen", () => {
  it("zwei Artikel aus verschiedenen Kategorien erzeugen zwei Gruppen", () => {
    const a = ensureCategoryGroup([], "Bagger");
    const b = ensureCategoryGroup(a.groups, "Anhänger");
    const again = ensureCategoryGroup(b.groups, "bagger");
    expect(b.groups).toHaveLength(2);
    expect(again.groups).toHaveLength(2);
    expect(again.id).toBe(a.id);
    expect(b.groups.map((g) => g.source)).toEqual(["category", "category"]);
  });

  it("altes Angebot ohne Gruppen zeigt eine Gruppe „Positionen“", () => {
    const buckets = groupedIndices([], [{}, {}, {}]);
    expect(buckets).toHaveLength(1);
    expect(buckets[0].group).toBeNull();
    expect(buckets[0].indices).toEqual([0, 1, 2]);
  });
});

describe("Auftragsart", () => {
  it("Anlieferung 50 € setzt Lieferung", () => {
    expect(nextOrderType("pickup", 50, 0)).toBe("delivery");
  });
  it("0 € lässt Lieferung stehen, bis manuell zurückgeschaltet", () => {
    expect(nextOrderType("delivery", 0, 0)).toBe("delivery");
    expect(nextOrderType("pickup", 0, 0)).toBe("pickup");
  });
});

describe("Optionale Versicherungsstufe", () => {
  const line: OfferLine = {
    product_name: "Minibagger",
    quantity: 1,
    duration: 10,
    unit: "kalendertage",
    unit_price: 100,
    discount_percent: 0,
    addons: [
      { key: "mb", label: "Maschinenbruch", price_type: "per_unit", rate: 20, basis: "full_period", days: 10, amount: 200 },
    ],
  };
  const tier: AddonOption = { key: "mb-2", label: "Maschinenbruch", price_type: "per_unit", price: 0, deductible: 500, surcharge_percent: 50 };
  const opt = buildOptionalTier(tier, line.addons![0], lineContext(line), 10)!;

  it("Stufe 50 % auf 20 €/KT ergibt 10 €/KT", () => {
    expect(opt.optional).toBe(true);
    expect(opt.per_day).toBe(10);
  });

  it("Standard zählt in die Summe, Option nicht", () => {
    const withOpt = { ...line, addons: [...line.addons!, opt] };
    const t = buildOfferTotals([withOpt]);
    expect(t.addonsNet).toBe(200);
    expect(t.netAmount).toBe(1200);
  });

  it("Serversumme entspricht der Editorsumme", () => {
    const withOpt = { ...line, addons: [...line.addons!, opt] };
    const editor = buildOfferTotals([withOpt], 50);
    const server = serverTotals(normalizeInquiryOfferItems(toServer([withOpt])), 50);
    expect(server.netAmount).toBe(editor.netAmount);
    expect(server.grossAmount).toBe(editor.grossAmount);
  });
});

describe("Alte Angebote ohne neue Felder", () => {
  const oldPayload = {
    items: [
      { product_name: "Rüttelplatte", description: "", quantity: 3, unit: "Kalendertage", unit_price: 40, discount_percent: 10,
        addons: [{ key: "mb", label: "Maschinenbruch", amount: 12 }] },
    ],
    delivery_cost_delivery: 30,
    payment_terms: "vorkasse",
  };

  it("laden unverändert (keine Gruppen, Zusatzfelder, Overrides, Auftragsart)", () => {
    const snap = offerPayloadToLines(oldPayload)!;
    expect(snap.items).toHaveLength(1);
    expect(snap.items[0].group_id).toBeUndefined();
    expect(snap.items[0].name_override).toBeUndefined();
    expect(snap.meta.groups).toBeUndefined();
    expect(snap.meta.extra_fields).toBeUndefined();
    expect(snap.meta.order_type).toBeUndefined();
  });

  it("speichern mit derselben Summe wie vorher", () => {
    const items = normalizeInquiryOfferItems(oldPayload.items);
    expect(items[0].group_id).toBeUndefined();
    expect(items[0].addons?.[0].optional).toBeUndefined();
    // 3 × 40 € − 10 % = 108 € + 12 € Versicherung + 30 € Lieferung
    expect(serverTotals(items, 30).netAmount).toBe(150);
    expect(normalizeOfferGroups(undefined)).toBeUndefined();
    expect(normalizeExtraFields({ orderer: "  ", project: "" })).toBeUndefined();
  });
});

describe("Gesendetes Angebot erneut öffnen", () => {
  it("erhält Miettage auch bei älteren Snapshots ohne Einheitencode", () => {
    const snap = offerPayloadToLines({
      items: [{ product_name: "Minibagger", quantity: 2, unit: "Miettage", unit_price: 84 }],
    });
    expect(snap?.items[0].unit).toBe("miettage");
    expect(snap?.items[0].quantity).toBe(1);
    expect(snap?.items[0].duration).toBe(2);
  });
  it("erhält den einzelnen Miettag aus älteren Snapshots", () => {
    const snap = offerPayloadToLines({ items: [{ product_name: "Minibagger", quantity: 1, unit: "Miettag", unit_price: 84 }] });
    expect(snap?.items[0].unit).toBe("miettage");
    expect(snap?.items[0].duration).toBe(1);
  });
  it("liest Stückzahl und Dauer getrennt statt Stück × Dauer als Menge", () => {
    const snap = offerPayloadToLines({
      items: [{ product_name: "Rüttelplatte 100 kg", quantity: 10, articles: 1, duration: 10, unit: "Miettage", unit_code: "miettage", unit_price: 29, discount_percent: 0 }],
    })!;
    expect(snap.items[0].quantity).toBe(1);
    expect(snap.items[0].duration).toBe(10);
    expect(snap.items[0].unit).toBe("miettage");
  });
});
