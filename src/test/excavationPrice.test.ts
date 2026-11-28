import { describe, it, expect } from "vitest";
import { publicRentalQuote } from "../../supabase/functions/_shared/public-rental-quote";
import { excavationLinePrice } from "@/lib/excavationPrice";

const product = { id: "p", slug: "bagger", name: "Bagger", category: "erdbewegung", pricing_scheme: "bau", prices_same_all_locations: true, price_from_1_rd: 100, price_from_3_rd: 90, price_from_10_rd: 80, addon_options: [] };
function service(p: any) {
  return { from: (table: string) => {
    const result = { data: table === "b2b_managed_products" ? [p] : [], error: null };
    const query: any = { select: () => query, eq: () => query, in: () => Promise.resolve(result) };
    return query;
  } };
}
const row = { id: "a", product_slug: "bagger", location: "krefeld", quantity: 1, start_time: "08:00", end_time: "16:00", selected_addons: [], use_saturday: false, use_sunday: false };

describe("Aushubrechner-Preis = serverseitige Preisvorschau", () => {
  // Di–Do = 3 Miettage, Mo–Fr = 5 Miettage, Mi–Mi über Wochenende ohne Sa/So = 6 Miettage
  for (const [start, end, days] of [["2026-11-03", "2026-11-03", 1], ["2026-11-03", "2026-11-05", 3], ["2026-11-02", "2026-11-06", 5]] as const) {
    it(`${days} Miettage`, async () => {
      const [quote] = await publicRentalQuote(service(product), [{ ...row, start_date: start, end_date: end }]);
      expect(excavationLinePrice({ products: [product], rows: [] }, "bagger", "krefeld", 1, days)).toBeCloseTo(quote.rental_net);
    });
  }
  it("ohne Bau-Staffel (z. B. Wochenpreis) kein Richtwert → Preis auf Anfrage", () => {
    expect(excavationLinePrice({ products: [{ ...product, pricing_scheme: "woche" }], rows: [] }, "bagger", "krefeld", 1, 3)).toBeNull();
  });
  it("ohne gepflegten Preis kein Richtwert", () => {
    expect(excavationLinePrice({ products: [{ ...product, price_from_1_rd: null, price_from_3_rd: null, price_from_10_rd: null }], rows: [] }, "bagger", "krefeld", 1, 3)).toBeNull();
  });
});
