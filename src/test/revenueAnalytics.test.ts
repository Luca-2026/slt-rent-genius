import { describe, it, expect } from "vitest";
import { analyze, buildCategoryIndex, SERVICE_LABEL, UNASSIGNED_CATEGORY, type AnalyticsInvoice, type AnalyticsFilter } from "@/lib/revenueAnalytics";

const idx = buildCategoryIndex([
  { name: "Minibagger 1,8t", category: "Erdbewegung" },
  { name: "Rüttelplatte 100 kg", category: "Verdichtung" },
  { name: "3500 kg Planenanhänger XXL", category: "Anhänger" },
]);
const base: AnalyticsFilter = { business: "rental", from: null, to: null, location: "all", segment: "all", category: "all" };
const inv = (p: Partial<AnalyticsInvoice>): AnalyticsInvoice => ({
  id: Math.random().toString(), source: "inquiry", business: "rental", invoice_kind: "invoice", status: "open",
  invoice_date: "2026-09-10", net_amount: 0, location: "krefeld", segment: "private", items: [], ...p,
});

describe("analyze", () => {
  const data: AnalyticsInvoice[] = [
    inv({ net_amount: 680, serviceAmount: 80, items: [{ product_name: "Minibagger 1,8t", total_price: 600 }] }),
    inv({ net_amount: 360, location: "bonn", segment: "business", items: [{ product_name: "Rüttelplatte 100 kg", total_price: 360 }] }),
    // Storno + Gutschrift heben sich auf
    inv({ status: "cancelled", net_amount: 65, items: [{ product_name: "1t Minibagger", total_price: 65 }] }),
    inv({ invoice_kind: "credit_note", status: "paid", net_amount: -65, items: [{ product_name: "1t Minibagger", total_price: -65 }] }),
    // Portal: Kaution zählt nicht, storniert/Entwurf zählt nicht
    inv({ source: "portal", segment: "portal", net_amount: 1120, items: [{ product_name: "Kaution", total_price: 150 }, { product_name: "3500 kg Planenanhänger XXL", total_price: 1120 }] }),
    inv({ source: "portal", status: "cancelled", net_amount: 999, items: [] }),
    inv({ status: "draft", net_amount: 500, items: [] }),
    inv({ business: "sales", net_amount: 10000, fallbackCategory: "Neumaschinen", items: [{ product_name: "Radlader X", total_price: 10000 }] }),
  ];

  it("Gesamt = Standorte = Kategorien = Artikel", () => {
    const r = analyze(data, idx, base);
    expect(r.total).toBe(2160);
    const s = (b: { revenue: number }[]) => Math.round(b.reduce((a, x) => a + x.revenue, 0) * 100) / 100;
    expect(s(r.byLocation)).toBe(2160);
    expect(s(r.byCategory)).toBe(2160);
    expect(s(r.byArticle)).toBe(2160);
  });

  it("Lieferkosten landen in Lieferung & Service, Kategorien aus dem CMS", () => {
    const r = analyze(data, idx, base);
    expect(r.byCategory.find((c) => c.key === SERVICE_LABEL)?.revenue).toBe(80);
    expect(r.byCategory.find((c) => c.key === "Erdbewegung")?.revenue).toBe(600);
    expect(r.byCategory.find((c) => c.key === "Anhänger")?.revenue).toBe(1120);
    expect(r.byArticle.find((a) => a.label === "1t Minibagger")).toBeUndefined();
  });

  it("Filter Standort, Kundengruppe, Zeitraum, Kategorie", () => {
    expect(analyze(data, idx, { ...base, location: "bonn" }).total).toBe(360);
    expect(analyze(data, idx, { ...base, segment: "business" }).total).toBe(1480);
    expect(analyze(data, idx, { ...base, segment: "private" }).total).toBe(680);
    expect(analyze(data, idx, { ...base, from: "2026-10-01" }).total).toBe(0);
    const c = analyze(data, idx, { ...base, category: "Erdbewegung" });
    expect(c.total).toBe(600);
    expect(c.byArticle).toHaveLength(1);
  });

  it("Verkauf getrennt, Kategorie aus Anfrage als Rückfall", () => {
    const r = analyze(data, idx, { ...base, business: "sales" });
    expect(r.total).toBe(10000);
    expect(r.byCategory[0].key).toBe("Neumaschinen");
    const u = analyze([inv({ net_amount: 50, items: [{ product_name: "Unbekannt", total_price: 50 }] })], idx, base);
    expect(u.byCategory[0].key).toBe(UNASSIGNED_CATEGORY);
  });
});

describe("Zuordnung", () => {
  it("Gerätewort ordnet abweichende Namen zu, Nebenkosten/Versicherung getrennt, fehlende Positionen", async () => {
    const { analyze: a, buildCategoryIndex: b, ADDON_LABEL, UNSPLIT_LABEL } = await import("@/lib/revenueAnalytics");
    const ix = b([{ name: "2t Minibagger", category: "erdbewegung" }, { name: "Rüttelplatte VP 15/50W 97kg", category: "verdichtung" }]);
    const f = { business: "rental" as const, from: null, to: null, location: "all", segment: "all" as const, category: "all" };
    const r = a([
      { id: "1", source: "portal", business: "rental", invoice_kind: "invoice", status: "paid", invoice_date: "2026-01-01", net_amount: 487.1, serviceAmount: 200, location: "krefeld", segment: "portal",
        items: [{ product_name: "Minibagger 2,5 t", total_price: 171 }, { product_name: "Reduzierung Maschinenbruchversicherung", total_price: 26.1 }, { product_name: "Kaution", total_price: 750 }, { product_name: "Rüttelplatte 100 kg", total_price: 90 }] },
      { id: "2", source: "portal", business: "rental", invoice_kind: "invoice", status: "paid", invoice_date: "2026-01-01", net_amount: 565, serviceAmount: 120, location: "krefeld", segment: "portal", fallbackArticle: "6t Minibagger", items: [] },
      { id: "3", source: "portal", business: "rental", invoice_kind: "invoice", status: "paid", invoice_date: "2026-01-01", net_amount: 100, location: "krefeld", segment: "portal", items: [] },
    ], ix, f);
    const c = Object.fromEntries(r.byCategory.map((x) => [x.key, x.revenue]));
    expect(c.erdbewegung).toBe(171 + 445);
    expect(c.verdichtung).toBe(90);
    expect(c[ADDON_LABEL]).toBe(26.1);
    expect(c[SERVICE_LABEL]).toBe(320);
    expect(c[UNSPLIT_LABEL]).toBe(100);
    expect(r.total).toBe(1152.1);
  });
});
