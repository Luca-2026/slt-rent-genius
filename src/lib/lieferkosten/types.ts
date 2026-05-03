import type { TarifKey } from "@/data/lieferkosten/tarife";
import type { ProduktKategorie } from "@/data/lieferkosten/mapping";

export type LiefermodusType = "hin-rueck" | "einzel" | "selbstabholung";

export interface CalculatePriceParams {
  kategorie: ProduktKategorie;
  tarif: TarifKey;
  km: number;
  liefermodus?: LiefermodusType;
  zweiMaschinen?: boolean;
  // Möbel/Zelte
  moebelStueck?: number;
  // Gerüst
  geruestArbeitshoehe?: number;
  geruestAufbauService?: boolean;
  // Margenhebel
  express?: boolean;
  lieferdatum?: Date;
}

export interface PriceBreakdownLine {
  label: string;
  betrag: number;
  isMultiplier?: boolean;
  multiplierWert?: number;
  laufendeSumme: number;
}

export interface PriceResult {
  total: number;
  oneWayBase: number;
  distanceUsed: number;
  breakdown: PriceBreakdownLine[];
  hinweis?: string;
  outOfRange?: boolean;
}
