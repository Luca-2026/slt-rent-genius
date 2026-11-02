import { describe, expect, it } from "vitest";
import { publicRentalQuote } from "../../supabase/functions/_shared/public-rental-quote";
const product = { id: "p", slug: "bagger", name: "Bagger", category: "erdbewegung", pricing_scheme: "bau", prices_same_all_locations: true, price_from_1_rd: 100, price_from_3_rd: 90, addon_options: [{ key: "insurance", label: "Versicherung", is_default: true, full_period_default: true, price_type: "percent", price: 10 }, { key: "tier", label: "Reduzierung", surcharge_percent: 15 }, { key: "tier2", label: "Reduzierung 2", surcharge_percent: 25 }] };
const row = { id: "a", product_slug: "bagger", location: "krefeld", quantity: 1, start_date: "2026-11-03", start_time: "08:00", end_date: "2026-11-05", end_time: "16:00", selected_addons: ["tier"], use_saturday: false, use_sunday: false };
function service(p = product) {
  return { from: (table: string) => {
    const result = { data: table === "b2b_managed_products" ? [p] : [], error: null };
    const query: any = { select: () => query, eq: () => query, in: () => Promise.resolve(result) };
    return query;
  } };
}
describe("Öffentliche CMS-Preisvorschau", () => {
  it("übernimmt 3-Tage-Staffel und berechnet Versicherung ohne Mietrabatt", async () => {
    const [quote] = await publicRentalQuote(service(), [row]);
    expect(quote.rental_net).toBe(270);
    expect(quote.addons[0].amount).toBe(27);
    expect(quote.addons[1].amount).toBe(4.05);
  });
  it("rundet Versicherungsstufen je Tag wie das Angebotsformular", async () => {
    const [quote] = await publicRentalQuote(service({ ...product, price_from_3_rd: 89 }), [row]);
    expect(quote.addons[1].amount).toBe(3.99);
  });
  it("lehnen unbekannte Optionen ab", async () => {
    await expect(publicRentalQuote(service(), [{ ...row, selected_addons: ["fake"] }])).rejects.toThrow();
  });
  it("berechnet nicht mehrere alternative Stufen gleichzeitig", async () => {
    await expect(publicRentalQuote(service(), [{ ...row, selected_addons: ["tier", "tier2"] }])).rejects.toThrow();
  });
  it("fehlende CMS-Preise bleiben unbekannt statt null Euro", async () => {
    const [quote] = await publicRentalQuote(service({ ...product, price_from_1_rd: null, price_from_3_rd: null } as any), [row]);
    expect(quote.rental_net).toBeNull();
    expect(quote.addons[0].amount).toBeNull();
  });
  it("Wochenend-Nutzung wirkt pro Position", async () => {
    const long = { ...row, start_date: "2026-11-02", end_date: "2026-11-09", end_time: "08:00", selected_addons: [] };
    const [normal] = await publicRentalQuote(service(), [long]);
    const [used] = await publicRentalQuote(service(), [{ ...long, use_saturday: true, use_sunday: true }]);
    expect(normal.duration).toBe(5);
    expect(used.duration).toBe(7);
  });
});