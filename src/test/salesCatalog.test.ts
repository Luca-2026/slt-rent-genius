import { describe, expect, it } from "vitest";
import {
  firstImage,
  grossToNet,
  newMachineToCatalogItem,
  usedMachineToCatalogItem,
  type NewMachineRow,
  type UsedMachineRow,
} from "@/hooks/useSalesCatalog";
import { buildOfferTotals, isValidOfferTotal } from "@/components/b2b/inquiries/offerMath";
import { SALES_ADDON_PRESETS, isSalesAddonNegative } from "@/lib/salesAddons";

const newRow: NewMachineRow = {
  id: "1", slug: "marke-modell", brand: "Marke", model: "Modell", name: "Marke Modell",
  article_number: "A-1", gtin: null, category: "Eventtechnik", short_description: null,
  description: null, specifications: null, content: null,
  images: ["/img/placeholder.svg", "/img/foto.jpg"], showroom_locations: ["bonn"],
  price_gross: 1190, compare_at_price: null, vat_rate: 19, price_on_request: false,
  is_featured: false, is_active: true, sort_order: 0, created_at: "", updated_at: "",
};

const usedRow: UsedMachineRow = {
  id: "2", slug: "gebraucht-modell", category: "Erdbewegung", manufacturer: "Marke",
  model: "Bagger", year: 2019, hours: 1200, price_net: 15900, price_on_request: false,
  description: null, specifications: null, content: null, images: null, status: "available",
  reference_number: "GB-7", location: "krefeld", is_featured: false, created_at: "", updated_at: "",
};

describe("Verkaufskatalog", () => {
  it("rechnet Brutto in Netto (19 %)", () => {
    expect(grossToNet(1190, 19)).toBe(1000);
    expect(grossToNet(null)).toBeNull();
  });

  it("ignoriert Platzhalterbilder", () => {
    expect(firstImage(["/img/placeholder.svg", "/img/foto.jpg"])).toBe("/img/foto.jpg");
    expect(firstImage([])).toBeNull();
  });

  it("mappt Neuartikel mit Nettopreis", () => {
    const item = newMachineToCatalogItem(newRow);
    expect(item).toMatchObject({ kind: "new", name: "Marke Modell", net_price: 1000, price_on_request: false });
    expect(item.image).toBe("/img/foto.jpg");
  });

  it("mappt Gebrauchtartikel mit Baujahr und Stunden", () => {
    const item = usedMachineToCatalogItem(usedRow);
    expect(item).toMatchObject({ kind: "used", net_price: 15900, year: 2019, hours: 1200 });
  });

  it("liefert 'Preis auf Anfrage' ohne Betrag", () => {
    const item = newMachineToCatalogItem({ ...newRow, price_on_request: true });
    expect(item.net_price).toBeNull();
    expect(item.price_on_request).toBe(true);
  });
});

describe("Verkaufs-Zusatzoptionen", () => {
  it("kennt Lieferung, Garantie, Einweisung und Inzahlungnahme", () => {
    expect(SALES_ADDON_PRESETS.map((p) => p.key)).toEqual([
      "lieferung",
      "garantieverlaengerung",
      "einweisung",
      "inzahlungnahme",
    ]);
  });

  it("markiert nur die Inzahlungnahme als Abzug", () => {
    expect(isSalesAddonNegative("inzahlungnahme")).toBe(true);
    expect(isSalesAddonNegative("lieferung")).toBe(false);
  });

  it("zieht Inzahlungnahme vor der Umsatzsteuer ab", () => {
    const totals = buildOfferTotals([
      {
        product_name: "Bagger",
        quantity: 1,
        unit_price: 20000,
        discount_percent: 0,
        addons: [
          { key: "lieferung", label: "Lieferung", amount: 500 },
          { key: "inzahlungnahme", label: "Inzahlungnahme Altgerät", amount: -2500 },
        ],
      },
    ]);
    expect(totals.addonsNet).toBe(-2000);
    expect(totals.netAmount).toBe(18000);
    expect(totals.grossAmount).toBe(21420);
    expect(isValidOfferTotal(totals.netAmount)).toBe(true);
  });

  it("erkennt eine unzulässige negative Gesamtsumme", () => {
    const totals = buildOfferTotals([
      {
        product_name: "Kleingerät",
        quantity: 1,
        unit_price: 100,
        discount_percent: 0,
        addons: [{ key: "inzahlungnahme", label: "Inzahlungnahme", amount: -500 }],
      },
    ]);
    expect(isValidOfferTotal(totals.netAmount)).toBe(false);
  });
});
