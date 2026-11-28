import { describe, it, expect } from "vitest";
import { publicTools, searchTools, calculateExcavation, calculateDryingTool, calculatePowerTool, locationInfo, validateContext, relevantSpecs, type CatalogRow, type ExcavationArgs } from "../../supabase/functions/public-chat/renty-tools.ts";
import { calculateDrying } from "@/lib/dryingCalculator";
import { calculatePower } from "@/lib/powerCalculator";
import { decodeShare } from "@/lib/excavationCalculator";
import { locationData } from "@/data/locationData";
import { rentyPageContext, rentyStarterQuestions } from "@/lib/rentyContext";

const e10z: CatalogRow = { slug: "minibagger-1t", name: "1t Minibagger", model_name: "E10Z", category: "erdbewegung", subcategory: "minibagger", available_locations: ["krefeld", "bonn", "muelheim"], specifications: { Betriebsgewicht: "1176 kg", Gesamtbreite: "1100 mm einfahrbar auf 710 mm", Grabtiefe: "1820 mm" } };
const xe20: CatalogRow = { slug: "minibagger-2t", name: "2t Minibagger", category: "erdbewegung", subcategory: "minibagger", available_locations: ["krefeld", "bonn"], specifications: { Betriebsgewicht: "2050 kg", Gesamtbreite: "1300 mm einfahrbar auf 990 mm" } };
const rows = [e10z, xe20];
const area = (m2: number, cm: number, extra: Partial<ExcavationArgs> = {}): ExcavationArgs => ({ location: "bonn", shapes: [{ kind: "area", area_m2: m2, depth_cm: cm, length_m: null, width_m: null, width_cm: null, diameter_m: null, volume_m3: null }], soil: null, access_cm: null, days: null, density_t_m3: null, loosening_pct: null, ...extra });

describe("Renty – Tool-Register", () => {
  it("kennt alle Rechner und die Lieferung mit kanonischen Links", () => {
    const urls = publicTools().map((t) => t.url);
    for (const u of ["/tools/", "/tools/aushubrechner/", "/tools/bautrockner-rechner/", "/tools/baustromrechner/", "/lieferung/"]) expect(urls).toContain(`https://www.slt-rental.de${u}`);
  });
  it("findet den Aushubrechner für Pool-Fragen", () => expect(searchTools("Pool ausheben").tools[0].slug).toBe("aushubrechner"));
  it("Öffnungszeiten stammen aus den Website-Stammdaten", () => {
    for (const l of locationInfo(null).locations) expect(l.hours).toEqual(locationData.find((x) => x.id === l.id)!.hours);
  });
});

describe("Renty – Aushub wie Website", () => {
  it("40 m² × 30 cm, 20 %, 1,6 t/m³ = 12 / 14,4 m³ / 19,2 t", () => {
    const r: any = calculateExcavation(area(40, 30, { density_t_m3: 1.6, loosening_pct: 20 }), rows);
    expect(r.volumes).toMatchObject({ bank_m3: 12, loose_m3: 14.4, weight_t: 19.2 });
  });
  it("E10Z bei 80 cm prüfen lassen, bei 40 cm passt nicht mit 71-cm-Hinweis", () => {
    const r80: any = calculateExcavation(area(20, 30, { access_cm: 80 }), rows);
    expect(r80.recommendation).toBeNull(); expect(r80.smallest_for_orientation).toMatchObject({ slug: "minibagger-1t", status: "check", access_tier: "possible", url: "https://www.slt-rental.de/mieten/bonn/erdbewegung/minibagger-1t/" });
    const r40: any = calculateExcavation(area(20, 30, { access_cm: 40 }), rows);
    expect(r40.smallest_for_orientation.status).toBe("unfit"); expect(r40.hints[0]).toMatch(/mindestens 71 cm/); expect(r40.access_hint).toMatch(/Meinst du wirklich 40 cm/);
  });
  it("Standortwechsel: Mülheim kennt nur dortige Maschinen; ohne Standort keine Maschinen", () => {
    const m: any = calculateExcavation(area(20, 30, { location: "muelheim", access_cm: 100 }), rows);
    expect(m.unfit.concat(m.review).map((x: any) => x?.slug)).not.toContain("minibagger-2t");
    expect((calculateExcavation(area(20, 30, { location: null }), rows) as any).machines).toBeNull();
  });
  it("fehlende Daten: 2t ohne Grabtiefe bleibt Prüfbedarf; ungültige Maße werden abgelehnt", () => {
    const r: any = calculateExcavation(area(20, 120, { access_cm: 120 }), rows);
    expect(r.review.map((x: any) => x.slug)).toContain("minibagger-2t");
    expect((calculateExcavation(area(-5, 30), rows) as any).error).toBeTruthy();
  });
  it("Link übergibt die Konfiguration an den Website-Rechner", () => {
    const r: any = calculateExcavation(area(20, 30, { access_cm: 80 }), rows);
    const u = new URL(r.calculator_url);
    expect(u.pathname).toBe("/tools/aushubrechner/"); expect(u.searchParams.get("standort")).toBe("bonn");
    expect(decodeShare(u.searchParams.get("aushub"))?.access).toBe("80");
  });
});

describe("Renty – Bautrockner und Baustrom identisch zur Website", () => {
  it("Bautrockner", () => {
    const r: any = calculateDryingTool({ location: "krefeld", length_m: 6, width_m: 5, height_m: 2.5, standing_water: true, with_fans: true }, []);
    const web = calculateDrying({ length: 6, width: 5, height: 2.5, standingWater: true, withFans: true })!;
    expect(r.days).toEqual(web.days); expect(r.dryer).toEqual(web.dryer); expect(r.fans).toBe(web.fans);
  });
  it("Baustrom", () => {
    const r: any = calculatePowerTool({ location: null, consumers: [{ kw: 3, product_slug: null, qty: 2 }, { kw: 2.2, product_slug: null, qty: 1 }], grid_connection: false, distance_m: 25 }, []);
    const web = calculatePower({ consumers: [{ kw: 3, qty: 2 }, { kw: 2.2, qty: 1 }], gridConnection: false, distanceM: 25 })!;
    expect([r.total_kw, r.kva, r.ampere]).toEqual([web.totalKw, web.kva, web.ampere]);
    expect(r.distributor).toEqual(web.distributor); expect(r.generator).toEqual(web.generator);
  });
});

describe("Renty – Kontext und Produktdaten", () => {
  it("Kontext verwirft Querystrings und unbekannte Werte", () => {
    expect(validateContext({ path: "/tools/aushubrechner/?email=x@y.de" })).toBeNull();
    expect(validateContext({ path: "/mieten/bonn/erdbewegung/minibagger-1t/", location: "paris", product: "minibagger-1t" })).toEqual({ path: "/mieten/bonn/erdbewegung/minibagger-1t/", location: null, product: "minibagger-1t" });
  });
  it("Browser sendet nur Pfad, Standort und Artikel", () => {
    expect(rentyPageContext("/tools/aushubrechner/", "?standort=bonn&aushub=abc")).toEqual({ path: "/tools/aushubrechner/", location: "bonn", product: null });
    expect(rentyStarterQuestions(rentyPageContext("/tools/aushubrechner/"))?.[0]).toMatch(/Aushub/);
  });
  it("Grabtiefe kommt auch hinter vielen anderen Feldern mit", () => {
    const specs: Record<string, string> = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`Feld ${i}`, "x"]));
    specs.Grabtiefe = "1820 mm";
    expect(relevantSpecs(specs).slice(0, 1)).toEqual(["Grabtiefe: 1820 mm"]);
  });
});
