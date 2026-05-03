// Tarif-Hauptdatei (3 Klassen: A, C, D)
// Quelle: lieferpreise-slt-tarife-NEU-v4.csv (Mai 2026)

export type TarifKey = "A" | "C" | "D";

export interface TarifStufe {
  km: number;
  brutto: number;
}

export interface Tarif {
  key: TarifKey;
  name: string;
  fahrzeug: string;
  multiplier_2_maschinen: number;
  distances: TarifStufe[];
}

export const TARIFE: Record<TarifKey, Tarif> = {
  A: {
    key: "A",
    name: "Sprinter Standard",
    fahrzeug: "Sprinter solo",
    multiplier_2_maschinen: 1.0,
    distances: [
      { km: 5, brutto: 50 },
      { km: 10, brutto: 80 },
      { km: 15, brutto: 100 },
      { km: 20, brutto: 130 },
      { km: 25, brutto: 135 },
      { km: 30, brutto: 155 },
      { km: 35, brutto: 180 },
      { km: 40, brutto: 180 },
      { km: 45, brutto: 200 },
      { km: 50, brutto: 220 },
    ],
  },
  C: {
    key: "C",
    name: "Sprinter + 2,5t-Anhänger",
    fahrzeug: "Sprinter mit Pkw-Anhänger",
    multiplier_2_maschinen: 1.3,
    distances: [
      { km: 5, brutto: 65 },
      { km: 10, brutto: 85 },
      { km: 15, brutto: 105 },
      { km: 20, brutto: 130 },
      { km: 25, brutto: 135 },
      { km: 30, brutto: 155 },
      { km: 35, brutto: 180 },
      { km: 40, brutto: 180 },
      { km: 45, brutto: 200 },
      { km: 50, brutto: 220 },
    ],
  },
  D: {
    key: "D",
    name: "Sprinter + 3,5t-Baumaschinenanhänger",
    fahrzeug: "Sprinter mit Baumaschinenanhänger",
    multiplier_2_maschinen: 2.0,
    distances: [
      { km: 5, brutto: 75 },
      { km: 10, brutto: 95 },
      { km: 15, brutto: 120 },
      { km: 20, brutto: 150 },
      { km: 25, brutto: 160 },
      { km: 30, brutto: 185 },
      { km: 35, brutto: 210 },
      { km: 40, brutto: 215 },
      { km: 45, brutto: 235 },
      { km: 50, brutto: 260 },
    ],
  },
};
