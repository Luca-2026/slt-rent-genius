import { describe, it, expect } from "vitest";
import { shapeVolume, soilResult, dumperTrips, readMachine, recommendExcavators, assessExcavator, assessDumper, computeState, sanitizeState, decodeShare, encodeShare, INITIAL_STATE, CRANE_NOTE, accessSanityHint } from "@/lib/excavationCalculator";

const e10z = { id: "bobcat-e10z", name: "1t", data: readMachine({ Betriebsgewicht: "1176 kg", Gesamtbreite: "1100 mm einfahrbar auf 710 mm" }) };
const xe20 = { id: "xcmg-xe20e", name: "2t", data: readMachine({ Betriebsgewicht: "2050kg", Gesamtbreite: "1300 mm einfahrbar auf 990 mm" }) };
const withDepth = (c: typeof e10z, d: string) => ({ ...c, data: { ...c.data, digDepthM: readMachine({ Grabtiefe: d }).digDepthM } });

describe("Aushubrechner – Mengen", () => {
  it("40 m² × 30 cm, 20 %, 1,6 t/m³ = 12 / 14,4 m³ / 19,2 t", () => {
    const r = soilResult(shapeVolume({ kind: "area", a: 40, c: 30 }), 1.6, 20);
    expect(r.bank).toBeCloseTo(12); expect(r.loose).toBeCloseTo(14.4); expect(r.tons).toBeCloseTo(19.2); expect(r.extra).toBeCloseTo(2.4);
  });
  it("20 m² × 120 cm = 24 m³", () => expect(shapeVolume({ kind: "area", a: 20, c: 120 })).toBeCloseTo(24));
  it("Graben 20 m × 40 cm × 80 cm = 6,4 m³", () => expect(shapeVolume({ kind: "trench", a: 20, b: 40, c: 80 })).toBeCloseTo(6.4));
  it("Kreis 4 m × 150 cm ≈ 18,85 m³", () => expect(shapeVolume({ kind: "circle", a: 4, c: 150 })).toBeCloseTo(18.85, 2));
  it("Dumper 14,4 m³, 0,3 m³ Mulde, 800 kg, Füllgrad 100 % = 48 Fahrten", () => {
    const t = dumperTrips(14.4, 1.6, 0.3, 800, 1)!;
    expect(t.perTrip).toBeCloseTo(0.3); expect(t.trips).toBe(48);
  });
  it("Nutzlast begrenzt bei großer Mulde", () => {
    const t = dumperTrips(14.4, 1.6, 0.6, 550, 1)!;
    expect(t.limitedBy).toBe("payload"); expect(t.perTrip).toBeCloseTo(0.34375); expect(t.trips).toBe(42);
  });
  it("liest RMD800-Mulde gestrichen und Nutzlast", () => {
    const d = readMachine({ "Max. Tragfähigkeit": "800 kg", "Muldengröße": "305 l / 400 l (gestrichen / gehäuft)" });
    expect(d.struckM3).toBeCloseTo(0.305); expect(d.payloadKg).toBe(800);
  });
});

describe("Aushubrechner – Eignung", () => {
  const known = [withDepth(e10z, "1.800 mm"), withDepth(xe20, "2.400 mm")];
  it("80 cm Zufahrt (9 cm Reserve): 1t potenziell passend, prüfen lassen, Kran nur als unverbindliche Prüfung", () => {
    const p = recommendExcavators(known, { volume: 5, depthM: 0.3, accessM: 0.8 });
    expect(p.main).toBeUndefined(); expect(p.smallest?.id).toBe("bobcat-e10z"); expect(p.smallest?.status).toBe("check"); expect(p.smallest?.accessTier).toBe("possible");
    expect(p.crane).toBe(true); expect(CRANE_NOTE).toMatch(/qualifizierter Hebedienst.*keine Zusage|Zusage ist damit nicht verbunden/);
  });
  it("85 cm Zufahrt (14 cm Reserve): 1t gute geometrische Vorauswahl", () => {
    const a = assessExcavator(known[0], { volume: 5, depthM: 0.3, accessM: 0.85 });
    expect(a.status).toBe("fit"); expect(a.accessTier).toBe("good");
  });
  it("100 cm Zufahrt: 1t passt und ist Empfehlung, 2t sehr knapp – Zeitersparnis nur qualitativ", () => {
    const p = recommendExcavators(known, { volume: 24, depthM: 1.2, accessM: 1 });
    expect(p.main?.id).toBe("bobcat-e10z"); expect(p.main?.status).toBe("fit");
    expect(p.review.find((a) => a.id === "xcmg-xe20e")?.accessTier).toBe("tight"); expect(p.hints[0]).toMatch(/Zeit sparen.*noch zu prüfen.*keine Zusage/);
  });
  it("20 m² × 120 cm ohne hinterlegte Grabtiefe: nur prüfen lassen, keine feste Empfehlung", () => {
    const p = recommendExcavators([e10z, xe20], { volume: 24, depthM: 1.2 });
    expect(p.main).toBeUndefined(); expect(p.smallest?.status).toBe("check"); expect(p.review).toHaveLength(2);
  });
  it("fehlende Grabtiefe auch unter 1 m wird Prüfbedarf", () => {
    expect(assessExcavator(e10z, { volume: 5, depthM: 0.5 }).status).toBe("check");
  });
  it("bekannte zu geringe Grabtiefe auch unter 1 m ist ungeeignet (80-%-Planungsfaktor)", () => {
    expect(assessExcavator(withDepth(e10z, "1.000 mm"), { volume: 5, depthM: 0.9 }).status).toBe("unfit");
    expect(assessExcavator(withDepth(e10z, "1.000 mm"), { volume: 5, depthM: 0.8 }).status).toBe("fit");
  });
  it("unbekannte Tiefe (nur bekanntes Volumen) behauptet keine Eignung", () => {
    expect(assessExcavator(known[0], { volume: 10, depthM: null }).status).toBe("check");
  });
  it("unbekannte Baggerbreite bei Zufahrt = prüfen", () => {
    const x = { id: "x", name: "x", data: { ...known[0].data, widthM: null } };
    expect(assessExcavator(x, { volume: 5, depthM: 0.3, accessM: 1.2 }).status).toBe("check");
  });
  it("unbekannte Dumperbreite bei Zufahrt = prüfen, nie passend", () => {
    const d = readMachine({ "Max. Tragfähigkeit": "800 kg", "Muldengröße": "305 l" });
    expect(assessDumper(d, 1, 14.4, 1.33, 0.85).status).toBe("check");
    expect(assessDumper(d, undefined, 14.4, 1.33, 0.85).status).toBe("fit");
  });
});

describe("Aushubrechner – Formular und geteilte Links", () => {
  it("Standard 40 m² × 30 cm rechnet 12 m³", () => expect(computeState(INITIAL_STATE).bank).toBeCloseTo(12));
  it("0 % Auflockerung im Expertenmodus bleibt 0", () => {
    const c = computeState({ ...INITIAL_STATE, expert: true, loosening: "0", density: "1,6" });
    expect(c.loosening).toBe(0); expect(c.density).toBe(1.6);
  });
  it("negative, übermäßige und unendliche Werte werden ungültig statt Zahl", () => {
    for (const v of ["-5", "1e9", "Infinity", "NaN", "99999999"]) {
      const c = computeState({ ...INITIAL_STATE, shapes: [{ kind: "area", v: { a: v, c: "30" } }] });
      expect(c.bank).toBe(0); expect(c.invalid).toContain("Teilfläche 1");
    }
    expect(computeState({ ...INITIAL_STATE, access: "-80" }).accessM).toBeUndefined();
  });
  it("manipulierte Links: ungültige Shapes und Bodenart werden verworfen", () => {
    expect(decodeShare("kaputt%%")).toBeNull();
    expect(decodeShare(btoa(encodeURIComponent(JSON.stringify({ shapes: [{ kind: "hexagon" }] }))))).toBeNull();
    const s = decodeShare(btoa(encodeURIComponent(JSON.stringify({ shapes: [{ kind: "area", v: { a: "20", c: { x: 1 } } }, { kind: "evil" }], soil: "__proto__", project: 99 }))))!;
    expect(s.shapes).toHaveLength(1); expect(s.soil).toBe("unbekannt"); expect(s.project).toBe(0); expect(s.shapes[0].v.c).toBeUndefined();
    expect(sanitizeState({ shapes: Array.from({ length: 50 }, () => ({ kind: "area", v: {} })) })!.shapes).toHaveLength(10);
  });
  it("Share-Link erhält Expertenwerte inklusive Modus", () => {
    const s = { ...INITIAL_STATE, expert: true, density: "1,9", loosening: "0", fill: "70", access: "100", days: "3" };
    expect(decodeShare(encodeShare(s))).toEqual(s);
  });
});

describe("Aushubrechner – Bobcat E10Z mit Herstellerdaten (Zufahrtsstufen)", () => {
  const specs = { Betriebsgewicht: "1176 kg", Gesamtbreite: "1100 mm einfahrbar auf 710 mm", Grabtiefe: "1820 mm", Planierschild: "1100 mm einfahrbar auf 710 mm" };
  const real = { id: "minibagger-1t", name: "1t Minibagger", data: readMachine(specs) };
  it("liest Transportbreite 71 cm und Grabtiefe 1,82 m", () => { expect(real.data.widthM).toBeCloseTo(0.71); expect(real.data.digDepthM).toBeCloseTo(1.82); });
  const cases: [number, string, string][] = [[40, "none", "unfit"], [70, "none", "unfit"], [71, "tight", "check"], [75, "tight", "check"], [80, "possible", "check"], [85, "good", "fit"], [90, "good", "fit"], [100, "good", "fit"]];
  for (const depth of [0.3, 1.2]) for (const [cmAccess, tier, status] of cases) it(`${cmAccess} cm Zufahrt, ${depth * 100} cm Tiefe → ${tier}/${status}`, () => {
    const a = assessExcavator(real, { volume: 20 * depth, depthM: depth, accessM: cmAccess / 100 });
    expect(a.accessTier).toBe(tier); expect(a.status).toBe(status);
    expect(a.reasons.join(" ")).not.toMatch(/Grabtiefe nicht hinterlegt|langsam/);
  });
  it("40 cm: freundlicher Hinweis auf 71 cm, nie passend, plus Rückfrage zur Eingabe", () => {
    const p = recommendExcavators([real], { volume: 6, depthM: 0.3, accessM: 0.4 });
    expect(p.main).toBeUndefined(); expect(p.smallest?.status).toBe("unfit");
    expect(p.hints[0]).toBe("Unser kompakter 1t Minibagger benötigt nominell mindestens 71 cm lichte Durchfahrtsbreite. Gibt es eine alternative Zufahrt? Gerne prüfen wir eine Lösung für dein Projekt.");
    expect(accessSanityHint(0.4, [real])).toMatch(/^Meinst du wirklich 40 cm\?/); expect(accessSanityHint(0.71, [real])).toBeNull();
  });
  it("6 m³ bei 90 cm: E10Z Empfehlung ohne Langsam-Aussage", () => {
    const p = recommendExcavators([real], { volume: 6, depthM: 0.3, accessM: 0.9 });
    expect(p.main?.id).toBe("minibagger-1t"); expect(p.main?.reasons.join(" ")).not.toMatch(/langsam/);
  });
  it("Parser: eingefahren/ausgefahren als getrennte Felder und deutsche Trennzeichen", () => {
    expect(readMachine({ "Spurbreite eingefahren": "0,71 m", "Spurbreite ausgefahren": "1.100 mm" }).widthM).toBeCloseTo(0.71);
    expect(readMachine({ Gesamtbreite: "1.300 mm (eingefahren 990 mm)" }).widthM).toBeCloseTo(0.99);
    expect(readMachine({ Gesamtbreite: "78 cm" }).widthM).toBeCloseTo(0.78);
  });
  it("Dumper nutzt dieselben Stufen (80 cm breit)", () => {
    const d = readMachine({ Gesamtbreite: "80 cm", "Max. Tragfähigkeit": "800 kg", "Muldengröße": "305 l" });
    expect(assessDumper(d, 0.79, 6, 1.33, 0.85).status).toBe("unfit");
    expect(assessDumper(d, 0.82, 6, 1.33, 0.85).accessTier).toBe("tight");
    expect(assessDumper(d, 0.87, 6, 1.33, 0.85).accessTier).toBe("possible");
    expect(assessDumper(d, 0.9, 6, 1.33, 0.85).status).toBe("fit");
  });
});
