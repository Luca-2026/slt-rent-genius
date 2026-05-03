// Zentrale Lieferkosten-Logik
// Quelle: lieferpreise-slt-tarife-NEU-v4-2.csv, lieferpreise-slt-mapping-NEU-v2-2.csv,
// lieferpreise-slt-zusatzkosten-NEU-v5-2.csv

export type TariffKey = "A" | "C" | "D";

export interface TariffDistance {
  km: number;
  brutto: number;
}

export interface Tariff {
  key: TariffKey;
  name: string;
  vehicle: string;
  multiplier2Maschinen: number;
  distances: TariffDistance[];
}

export const tariffs: Record<TariffKey, Tariff> = {
  A: {
    key: "A",
    name: "Sprinter Standard",
    vehicle: "Sprinter solo",
    multiplier2Maschinen: 1.0,
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
    vehicle: "Sprinter mit Pkw-Anhänger",
    multiplier2Maschinen: 1.3,
    distances: [
      { km: 5, brutto: 75 },
      { km: 10, brutto: 95 },
      { km: 15, brutto: 115 },
      { km: 20, brutto: 145 },
      { km: 25, brutto: 150 },
      { km: 30, brutto: 175 },
      { km: 35, brutto: 200 },
      { km: 40, brutto: 200 },
      { km: 45, brutto: 225 },
      { km: 50, brutto: 245 },
    ],
  },
  D: {
    key: "D",
    name: "Sprinter + 3,5t-Baumaschinenanhänger",
    vehicle: "Sprinter mit Baumaschinenanhänger",
    multiplier2Maschinen: 2.0,
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

// Zusatzkosten (Konstanten aus CSV)
export const ZUSATZKOSTEN = {
  geruest: {
    aufschlagProMeter: 8, // pro Meter Arbeitshöhe über 4,4 m
    aufbauBasis: 75,
    aufbauProMeter: 15,
  },
  moebel: {
    aufschlagJeStueck: 2, // ab 5 Stück
    schwellwert: 5,
    aufbauBasis: 75,
    aufbauProMoebel: 10, // pro Bierzeltgarnitur/Stehtisch
    aufbauProZelt: 75,
  },
  rueckwegFaktor: 2,
  expressPauschale: 50,
  wochenendeFaktor: 1.25,
} as const;

// Produkt-Kategorie → Tarif Mapping
export interface SubtypeOption {
  key: string;
  label: string; // Kunden-sichtbar (z.B. "1t Bagger")
  tarif: TariffKey; // intern
}

export interface CategoryConfig {
  defaultTarif: TariffKey | null; // null = keine Lieferung (Anhänger)
  // Kunden-sichtbare Geräte-Subtypen, die intern auf Tarife mappen
  subtypes?: SubtypeOption[];
  defaultSubtype?: string;
  hinweis?: string;
  label: string;
  scope?: "geruest" | "moebel"; // für Sonder-Aufschläge
}

export const categoryConfigs: Record<string, CategoryConfig> = {
  werkzeuge: { defaultTarif: "A", label: "Werkzeuge (Zwangsmischer, Häcksler, Steinsäge, Fugenschneider)" },
  verdichtung: { defaultTarif: "A", label: "Verdichtung (Rüttelplatten etc.)", hinweis: "Bei großen Walzgeräten individuelles Angebot" },
  gartenpflege: { defaultTarif: "A", label: "Gartenpflege", hinweis: "Bei Großhäcksler individuelles Angebot" },
  aggregate: { defaultTarif: "A", label: "Aggregate / Stromerzeuger" },
  "kabel-stromverteiler": { defaultTarif: "A", label: "Kabel & Stromverteiler" },
  "heizung-trocknung": { defaultTarif: "A", label: "Heizung & Trocknung" },
  absperrtechnik: { defaultTarif: "A", label: "Absperrtechnik" },
  beleuchtung: { defaultTarif: "A", label: "Beleuchtung" },
  beschallung: { defaultTarif: "A", label: "Beschallung" },
  buehne: { defaultTarif: "A", label: "Bühne", hinweis: "Bei Großbühne individuelles Angebot" },
  "traversen-rigging": { defaultTarif: "A", label: "Traversen & Rigging" },
  kommunikation: { defaultTarif: "A", label: "Kommunikation" },
  "moebel-zelte": { defaultTarif: "A", label: "Möbel & Zelte", scope: "moebel", hinweis: "Möbel-Aufschlag/Stück ab 5 Stück" },
  "geschirr-glaeser-besteck": { defaultTarif: "A", label: "Geschirr, Gläser & Besteck" },
  spezialeffekte: { defaultTarif: "A", label: "Spezialeffekte" },
  huepfburgen: { defaultTarif: "A", label: "Hüpfburgen", hinweis: "Bei XL-Hüpfburgen individuelles Angebot" },
  "leitern-gerueste": { defaultTarif: "A", label: "Leitern & Gerüste", scope: "geruest", hinweis: "Inkl. optional Aufbau-Service" },
  erdbewegung: {
    defaultTarif: "C",
    label: "Erdbewegung (Bagger, Dumper, Radlader)",
    defaultSubtype: "1t-bagger",
    subtypes: [
      { key: "1t-bagger", label: "1t Bagger", tarif: "C" },
      { key: "dumper", label: "Dumper", tarif: "C" },
      { key: "2t-bagger", label: "2t Bagger", tarif: "D" },
      { key: "3t-bagger", label: "3t Bagger", tarif: "D" },
      { key: "radlader", label: "Radlader / Knicklader", tarif: "D" },
    ],
  },
  arbeitsbuehnen: {
    defaultTarif: "C",
    label: "Arbeitsbühnen",
    defaultSubtype: "8m",
    subtypes: [
      { key: "8m", label: "8m Anhängerarbeitsbühne", tarif: "C" },
      { key: "12m", label: "12m Scherenbühne", tarif: "D" },
      { key: "14m+", label: "14m+ Arbeitsbühne", tarif: "D" },
    ],
  },
};

export interface CalculatePriceInput {
  tarif: TariffKey;
  km: number;
  twoMachines?: boolean;
  rueckweg?: boolean;
  express?: boolean;
  wochenende?: boolean;
  // Gerüst-Optionen
  arbeitshoeheMeter?: number; // wenn > 4,4 → Aufschlag pro Meter
  aufbauService?: boolean;
  // Möbel-Optionen
  moebelAnzahl?: number; // ab 5 Stück: Aufschlag pro Stück
  moebelAufbauService?: boolean;
  moebelAufbauStueck?: number; // Bierzeltgarnituren / Stehtische
  moebelAufbauZelte?: number;
}

export interface CalculatePriceResult {
  basis: number;
  distanceUsed: number;
  zwischensummeNachMaschinen: number;
  zwischensummeNachRueckweg: number;
  geruestHoehenAufschlag: number;
  geruestAufbau: number;
  moebelAufschlag: number;
  moebelAufbau: number;
  expressAufschlag: number;
  wochenendeFaktor: number;
  total: number;
}


// Findet nächsthöhere Distanzstufe
function findDistanceEntry(tariff: Tariff, km: number): TariffDistance {
  const sorted = [...tariff.distances].sort((a, b) => a.km - b.km);
  for (const entry of sorted) {
    if (km <= entry.km) return entry;
  }
  return sorted[sorted.length - 1];
}

export function calculatePrice(input: CalculatePriceInput): CalculatePriceResult {
  const tariff = tariffs[input.tarif];
  const entry = findDistanceEntry(tariff, input.km);
  const basis = entry.brutto;

  let zwischensumme = basis;

  // 2 Maschinen Multiplikator
  if (input.twoMachines && tariff.multiplier2Maschinen > 1) {
    zwischensumme = zwischensumme * tariff.multiplier2Maschinen;
  }
  const zwischensummeNachMaschinen = zwischensumme;

  // Rückweg (×2 = Anlieferung + Abholung)
  if (input.rueckweg) {
    zwischensumme = zwischensumme * ZUSATZKOSTEN.rueckwegFaktor;
  }
  const zwischensummeNachRueckweg = zwischensumme;

  // Gerüst-spezifische Aufschläge (NICHT mit Maschinen-/Rückweg-Faktoren multipliziert,
  // additiv aufgeschlagen)
  let geruestHoehenAufschlag = 0;
  let geruestAufbau = 0;
  if (input.arbeitshoeheMeter && input.arbeitshoeheMeter > 4.4) {
    const zusatzMeter = Math.ceil(input.arbeitshoeheMeter - 4.4);
    geruestHoehenAufschlag = zusatzMeter * ZUSATZKOSTEN.geruest.aufschlagProMeter;
    if (input.rueckweg) geruestHoehenAufschlag *= 2;
  }
  if (input.aufbauService && input.arbeitshoeheMeter) {
    geruestAufbau = ZUSATZKOSTEN.geruest.aufbauBasis +
      Math.max(0, Math.ceil(input.arbeitshoeheMeter)) * ZUSATZKOSTEN.geruest.aufbauProMeter;
  }

  // Möbel-Aufschlag
  let moebelAufschlag = 0;
  if (input.moebelAnzahl && input.moebelAnzahl >= ZUSATZKOSTEN.moebel.schwellwert) {
    moebelAufschlag = input.moebelAnzahl * ZUSATZKOSTEN.moebel.aufschlagJeStueck;
    if (input.rueckweg) moebelAufschlag *= 2;
  }

  // Möbel-Aufbauservice
  let moebelAufbau = 0;
  if (input.moebelAufbauService) {
    const stueck = input.moebelAufbauStueck ?? 0;
    const zelte = input.moebelAufbauZelte ?? 0;
    if (stueck > 0 || zelte > 0) {
      moebelAufbau =
        ZUSATZKOSTEN.moebel.aufbauBasis +
        stueck * ZUSATZKOSTEN.moebel.aufbauProMoebel +
        zelte * ZUSATZKOSTEN.moebel.aufbauProZelt;
    }
  }

  zwischensumme += geruestHoehenAufschlag + geruestAufbau + moebelAufschlag + moebelAufbau;


  // Express-Pauschale
  const expressAufschlag = input.express ? ZUSATZKOSTEN.expressPauschale : 0;
  zwischensumme += expressAufschlag;

  // Wochenend-Faktor (zuletzt, auf alles)
  const wochenendeFaktor = input.wochenende ? ZUSATZKOSTEN.wochenendeFaktor : 1;
  zwischensumme = zwischensumme * wochenendeFaktor;

  return {
    basis,
    distanceUsed: entry.km,
    zwischensummeNachMaschinen,
    zwischensummeNachRueckweg,
    geruestHoehenAufschlag,
    geruestAufbau,
    moebelAufschlag,
    moebelAufbau,
    expressAufschlag,
    wochenendeFaktor,
    total: zwischensumme,
  };
}
