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
  it("übernimmt unbepreiste Haftungsreduzierung als Wunsch ohne erfundenen Preis", async () => {
    const p = { ...product, addon_options: [...product.addon_options, { key: "sb_reduktion", label: "Reduzierung Selbstbehalt", price: 15, price_type: "percent", deductible: 1000 }] } as any;
    const [quote] = await publicRentalQuote(service(p), [{ ...row, selected_addons: ["sb_reduktion"] }]);
    expect(quote.addons.find((a: any) => a.key === "sb_reduktion")).toMatchObject({ amount: null, deductible: 1000 });
    expect(quote.options.find((a: any) => a.key === "sb_reduktion")).toMatchObject({ is_default: false, amount: null });
  });
  it("weist zwei gleichzeitig angefragte Haftungsreduzierungen zurück", async () => {
    const p = { ...product, addon_options: [{ key: "sb_reduktion", label: "Stufe 1" }, { key: "sb_reduktion-2", label: "Stufe 2" }] } as any;
    await expect(publicRentalQuote(service(p), [{ ...row, selected_addons: ["sb_reduktion", "sb_reduktion-2"] }])).rejects.toThrow("Bitte nur eine Haftungsreduzierung wählen");
  });
  it("6t-Bagger: Wochenendpauschale bleibt 275 netto inklusive beider Nutzungstage", async () => {
    const p = { ...product, price_from_1_rd: 185, price_from_3_rd: 168, price_weekend_num: 275 };
    for (const use_saturday of [false, true]) for (const use_sunday of [false, true]) {
      const [quote] = await publicRentalQuote(service(p), [{ ...row, start_date: "2026-11-06", start_time: "16:00", end_date: "2026-11-09", end_time: "09:30", selected_addons: [], use_saturday, use_sunday }]);
      expect(quote.rental_net).toBe(275);
      expect(quote.unit).toBe("pauschal");
    }
  });
  it("6t-Bagger: längere Miete steigt durch Samstag und Sonntag von 840 auf 1176 netto", async () => {
    const p = { ...product, price_from_1_rd: 185, price_from_3_rd: 168, price_weekend_num: 275 };
    const input = { ...row, start_date: "2026-11-09", end_date: "2026-11-16", end_time: "08:00", selected_addons: [] };
    const [normal] = await publicRentalQuote(service(p), [input]);
    const [saturday] = await publicRentalQuote(service(p), [{ ...input, use_saturday: true }]);
    const [both] = await publicRentalQuote(service(p), [{ ...input, use_saturday: true, use_sunday: true }]);
    expect(normal.rental_net).toBe(840);
    expect(saturday.rental_net).toBe(1008);
    expect(both.rental_net).toBe(1176);
  });
  it("berechnet 100 Tage Schildermiete aus CMS mit täglich einem Zehntel ab Tag elf", async () => {
    const signs = { ...product, slug: "halteverbotsschilder-set", category: "absperrtechnik", direct_booking_config: { enabled: true, standardGrossCents: 4900, sorglosGrossCents: 19900, depositCents: 10000, maxRentalDays: 100, municipalFeesSeparate: true } };
    const input = { ...row, product_slug: signs.slug, selected_addons: [], start_date: "2027-03-01", end_date: "2027-06-08" };
    const [quote] = await publicRentalQuote(service(signs), [input]);
    expect(quote.rental_net).toBe(411.76);
    expect(quote.deposit).toBe(100);
    const [tooLong] = await publicRentalQuote(service(signs), [{ ...input, end_date: "2027-06-09" }]);
    expect(tooLong.rental_net).toBeNull();
  });
  it("Stornierung kostet einmalig 5 % reine Miete ohne Versicherung und Kaution", async () => {
    const [quote] = await publicRentalQuote(service({ ...product, specifications: { Kaution: "1.000 €" } } as any), [{ ...row, quantity: 2, selected_addons: ["kostenfreie_stornierung"] }]);
    expect(quote.rental_net).toBe(540);
    expect(quote.deposit).toBe(2000);
    expect(quote.addons.find((a: any) => a.key === "insurance")?.amount).toBe(54);
    expect(quote.addons.find((a: any) => a.key === "kostenfreie_stornierung")?.amount).toBe(27);
  });
  it("Stornierung bleibt ohne Mietpreis wählbar und ohne erfundenen Betrag", async () => {
    const [quote] = await publicRentalQuote(service({ ...product, price_from_1_rd: null, price_from_3_rd: null } as any), [{ ...row, selected_addons: ["kostenfreie_stornierung"] }]);
    expect(quote.options.find((a: any) => a.key === "kostenfreie_stornierung")?.is_default).toBe(false);
    expect(quote.addons.find((a: any) => a.key === "kostenfreie_stornierung")?.amount).toBeNull();
  });
  it("Kaution aus CMS bleibt steuerfrei, mengenbezogen und unabhängig vom Mietzeitraum", async () => {
    const [quote] = await publicRentalQuote(service({ ...product, specifications: { Kaution: "1.000 €" } } as any), [{ ...row, quantity: 2 }]);
    expect(quote.deposit).toBe(2000);
    const [missing] = await publicRentalQuote(service(), [row]);
    expect(missing.deposit).toBeNull();
  });
  it("übernimmt 3-Tage-Staffel und berechnet Versicherung ohne Mietrabatt", async () => {
    const [quote] = await publicRentalQuote(service(), [row]);
    expect(quote.rental_net).toBe(270);
    expect(quote.addons[0].amount).toBe(27);
    expect(quote.addons[1].amount).toBe(4.05);
  });
  it("rundet Versicherungsstufen je Tag wie das Angebotsformular", async () => {
    const [quote] = await publicRentalQuote(service({ ...product, price_from_3_rd: 89 }), [row]);
    expect(quote.addons[1].amount).toBe(4.02);
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