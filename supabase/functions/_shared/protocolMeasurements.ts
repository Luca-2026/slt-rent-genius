/** Messwerte nur für ausgewählte Felder übernehmen; weder HTML noch PDF dürfen unvalidierte Texte enthalten. */
export interface ProtocolMeasurement { item_name: string; operating_hours: string; fuel_level: string; mileage: string }
const FUELS = new Map([ ["voll", "Voll (100 %)"], ["dreiviertel", "3/4 (75 %)"], ["halb", "1/2 (50 %)"], ["viertel", "1/4 (25 %)"], ["leer", "Leer"] ]);
const counter = (value: string) => /^\d{1,9}(?:[,.]\d{1,2})?$/.test(value) && Number(value.replace(",", ".")) <= 999999999;

export function parseProtocolMeasurements(raw: unknown): ProtocolMeasurement[] {
  if (raw === undefined) return [];
  if (!Array.isArray(raw) || raw.length > 60) throw new Error("Ungültige Messwerte.");
  return raw.map((m) => {
    if (!m || typeof m !== "object") throw new Error("Ungültige Messwerte.");
    const { item_name, operating_hours, fuel_level, mileage } = m as Record<string, unknown>;
    if (typeof item_name !== "string" || !item_name.trim() || item_name.length > 200 ||
        [operating_hours, fuel_level, mileage].some((v) => v != null && typeof v !== "string")) throw new Error("Ungültige Messwerte.");
    const hours = String(operating_hours ?? "").trim();
    const fuel = String(fuel_level ?? "").trim();
    const km = String(mileage ?? "").trim();
    if ((!hours && !fuel && !km) || (hours && !counter(hours)) || (km && !counter(km)) || (fuel && !FUELS.has(fuel))) throw new Error("Ungültige Messwerte.");
    return { item_name: item_name.trim(), operating_hours: hours, fuel_level: fuel, mileage: km };
  });
}

export const measurementRows = (m: ProtocolMeasurement) => [
  ...(m.mileage ? [{ label: "Kilometerstand", value: `${m.mileage} km` }] : []),
  ...(m.operating_hours ? [{ label: "Betriebsstunden", value: `${m.operating_hours} h` }] : []),
  ...(m.fuel_level ? [{ label: "Tankfüllstand", value: FUELS.get(m.fuel_level) ?? "" }] : []),
];