// Zentrale Liefertarife – geteilt zwischen Website (src/data/lieferkosten) und Edge Functions.
// Quelle: lieferpreise-slt-tarife-NEU-v4-2.csv / mapping-NEU-v2-2.csv. Beträge sind BRUTTO.

export type TariffKey = "A" | "B" | "C";
export interface TariffDistance { km: number; brutto: number }
export interface Tariff { key: TariffKey; name: string; vehicle: string; multiplier2Maschinen: number; distances: TariffDistance[] }

export const tariffs: Record<TariffKey, Tariff> = {
  A: { key: "A", name: "Sprinter Standard", vehicle: "Sprinter solo", multiplier2Maschinen: 1.0, distances: [
    { km: 5, brutto: 50 }, { km: 10, brutto: 80 }, { km: 15, brutto: 100 }, { km: 20, brutto: 130 }, { km: 25, brutto: 135 },
    { km: 30, brutto: 155 }, { km: 35, brutto: 180 }, { km: 40, brutto: 180 }, { km: 45, brutto: 200 }, { km: 50, brutto: 220 } ] },
  B: { key: "B", name: "Sprinter + 2,5t-Anhänger (Baumaschinen < 2 t)", vehicle: "Sprinter mit Pkw-Anhänger", multiplier2Maschinen: 1.3, distances: [
    { km: 5, brutto: 75 }, { km: 10, brutto: 95 }, { km: 15, brutto: 115 }, { km: 20, brutto: 145 }, { km: 25, brutto: 150 },
    { km: 30, brutto: 175 }, { km: 35, brutto: 200 }, { km: 40, brutto: 200 }, { km: 45, brutto: 225 }, { km: 50, brutto: 245 } ] },
  C: { key: "C", name: "Sprinter + 3,5t-Baumaschinenanhänger (Baumaschinen < 3,5 t)", vehicle: "Sprinter mit Baumaschinenanhänger", multiplier2Maschinen: 1.8, distances: [
    { km: 5, brutto: 95 }, { km: 10, brutto: 105 }, { km: 15, brutto: 130 }, { km: 20, brutto: 160 }, { km: 25, brutto: 170 },
    { km: 30, brutto: 195 }, { km: 35, brutto: 220 }, { km: 40, brutto: 225 }, { km: 45, brutto: 250 }, { km: 50, brutto: 275 } ] },
};

export const TIEFLADER_AB_KG = 3000;
export const MAX_DELIVERY_KM = 50;

export function parseWeightKg(text?: string | null): number | null {
  if (!text) return null;
  const t = text.toLowerCase();
  const tons = t.match(/(\d{1,2}(?:[.,]\d{1,2})?)\s*(?:t\b|tonnen)/);
  if (tons) return parseFloat(tons[1].replace(",", ".")) * 1000;
  const kg = t.match(/(\d{1,2}[.\s]?\d{3}|\d{3,5})\s*kg/);
  if (kg) return parseInt(kg[1].replace(/[.\s]/g, ""), 10);
  return null;
}

/** Subtyp-Schlüssel je Artikel (Erdbewegung/Arbeitsbühnen); null = Kategorie ohne Subtypen. */
export function deliverySubtypeKey(category: string, productName?: string | null): string | null {
  const lower = (productName ?? "").toLowerCase();
  if (category === "erdbewegung") {
    const w = parseWeightKg(productName);
    if (w !== null && w > TIEFLADER_AB_KG) return "tieflader";
    if (/xe27|2[.,]7\s*t|3\s*t|e35/i.test(lower)) return /radlader|knicklader|kramer/i.test(lower) ? "radlader" : "3t-bagger";
    if (/2\s*t|e20/i.test(lower)) return "2t-bagger";
    if (/radlader|knicklader|kramer/i.test(lower)) return "radlader";
    if (/dumper/i.test(lower)) return "dumper";
    if (/xe27|2[.,]7\s*t|3[.,]?\s*t|e35|e50|e55|3500|5000/i.test(lower)) return "3t-bagger";
    return "1t-bagger";
  }
  if (category === "arbeitsbuehnen") {
    if (/anh[aä]nger\s*-?\s*(arbeits)?b[uü]hne|anh[aä]ngerarbeitsb[uü]hne/i.test(lower)) return "18m-anhaenger";
    if (/nifty|hr\s*12|gelenkteleskop/i.test(lower)) return "12m-gelenk";
    if (/teleskop[\s-]*mast/i.test(lower)) return "11m-teleskop";
    if (/scher/i.test(lower)) {
      const m = lower.match(/^\s*(\d{1,2})(?:[.,](\d))?\s*m\b/);
      const meters = m ? parseFloat(`${m[1]}.${m[2] ?? "0"}`) : NaN;
      return !isNaN(meters) && meters <= 9 ? "8m-scheren" : "12m-scheren";
    }
    return /12m|14m/i.test(lower) ? "12m-scheren" : "18m-anhaenger";
  }
  return null;
}

const SUBTYPE_TARIFF: Record<string, TariffKey> = { "1t-bagger": "B", "2t-bagger": "B", "3t-bagger": "C", dumper: "B", radlader: "C", tieflader: "C", "18m-anhaenger": "B", "8m-scheren": "B", "12m-scheren": "C", "11m-teleskop": "C", "12m-gelenk": "C" };

/** Liefertarif je Artikel. Anhänger: keine Lieferung. Über 3 t: Tieflader auf Anfrage. */
export function deliveryTariffFor(category: string, productName?: string | null): { tarif: TariffKey | null; onRequest: boolean } {
  if (category === "anhaenger") return { tarif: null, onRequest: false };
  const sub = deliverySubtypeKey(category, productName);
  if (sub === "tieflader") return { tarif: "C", onRequest: true };
  return { tarif: sub ? SUBTYPE_TARIFF[sub] : "A", onRequest: false };
}

export function tariffBrutto(tarif: TariffKey, km: number): { brutto: number; band: number } {
  const sorted = [...tariffs[tarif].distances].sort((a, b) => a.km - b.km);
  const entry = sorted.find(e => km <= e.km) ?? sorted[sorted.length - 1];
  return { brutto: entry.brutto, band: entry.km };
}

export type CartDeliveryQuote =
  | { status: "priced"; tarif: TariffKey; tariff_name: string; product_name: string; km: number; band: number; two_machines: boolean; brutto: number; net: number }
  | { status: "on_request"; reason: "tieflader" | "distance"; product_name: string | null; km: number }
  | { status: "none" };

const RANK: Record<TariffKey, number> = { A: 1, B: 2, C: 3 };

/**
 * Lieferung + Abholung für den ganzen Warenkorb nach dem teuersten Artikel-Tarif.
 * Zwei oder mehr Maschinen (Tarif B/C) → Maschinen-Aufschlag des gewählten Tarifs.
 */
export function cartDeliveryQuote(lines: { category: string; product_name: string; quantity: number }[], km: number): CartDeliveryQuote {
  const rated = lines.map(line => ({ line, ...deliveryTariffFor(line.category, line.product_name) })).filter(r => r.tarif !== null);
  if (!rated.length) return { status: "none" };
  const heavy = rated.find(r => r.onRequest);
  if (heavy) return { status: "on_request", reason: "tieflader", product_name: heavy.line.product_name, km };
  if (!(km > 0) || km > MAX_DELIVERY_KM) return { status: "on_request", reason: "distance", product_name: null, km };
  const top = rated.reduce((a, b) => (RANK[b.tarif!] > RANK[a.tarif!] ? b : a));
  const tarif = top.tarif!;
  const machineUnits = rated.filter(r => r.tarif === "B" || r.tarif === "C").reduce((sum, r) => sum + r.line.quantity, 0);
  const twoMachines = machineUnits >= 2 && tariffs[tarif].multiplier2Maschinen > 1;
  const { brutto: base, band } = tariffBrutto(tarif, km);
  const brutto = Math.round(base * (twoMachines ? tariffs[tarif].multiplier2Maschinen : 1) * 2 * 100) / 100;
  return { status: "priced", tarif, tariff_name: tariffs[tarif].name, product_name: top.line.product_name, km, band, two_machines: twoMachines, brutto, net: Math.round((brutto / 1.19) * 100) / 100 };
}
