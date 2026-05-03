// Kategorien-Mapping: Produkt → Tarif
// Quelle: lieferpreise-slt-mapping-NEU-v2.csv

import type { TarifKey } from "./tarife";

export type ProduktKategorie =
  | "anhaenger"
  | "werkzeuge"
  | "verdichtung"
  | "gartenpflege"
  | "aggregate"
  | "kabel-stromverteiler"
  | "heizung-trocknung"
  | "absperrtechnik"
  | "beleuchtung"
  | "beschallung"
  | "buehne"
  | "traversen-rigging"
  | "kommunikation"
  | "moebel-zelte"
  | "geschirr-glaeser-besteck"
  | "spezialeffekte"
  | "huepfburgen"
  | "leitern-gerueste"
  | "erdbewegung"
  | "arbeitsbuehnen";

export interface KategorieMapping {
  default_tarif: TarifKey | "NONE";
  ui_switch_tarife?: TarifKey[];
  hinweis?: string;
  label: string;
}

export const KATEGORIE_MAPPING: Record<ProduktKategorie, KategorieMapping> = {
  anhaenger: { default_tarif: "NONE", label: "Anhänger", hinweis: "Selbstabholung – keine Lieferung möglich" },
  werkzeuge: { default_tarif: "A", label: "Werkzeuge", hinweis: "Inkl. Zwangsmischer/Häcksler/Steinsäge/Fugenschneider" },
  verdichtung: { default_tarif: "A", label: "Verdichtung", hinweis: "Standard. Bei großen Walzgeräten ggf. Tarif C/D" },
  gartenpflege: { default_tarif: "A", label: "Gartenpflege", hinweis: "Standard. Bei Großhäcksler ggf. Tarif C/D" },
  aggregate: { default_tarif: "A", label: "Aggregate", hinweis: "Sprinter / Pkw-Anhänger" },
  "kabel-stromverteiler": { default_tarif: "A", label: "Kabel & Stromverteiler" },
  "heizung-trocknung": { default_tarif: "A", label: "Heizung & Trocknung" },
  absperrtechnik: { default_tarif: "A", label: "Absperrtechnik" },
  beleuchtung: { default_tarif: "A", label: "Beleuchtung" },
  beschallung: { default_tarif: "A", label: "Beschallung" },
  buehne: { default_tarif: "A", label: "Bühne", hinweis: "Bei Großbühne individuelles Angebot" },
  "traversen-rigging": { default_tarif: "A", label: "Traversen & Rigging" },
  kommunikation: { default_tarif: "A", label: "Kommunikation" },
  "moebel-zelte": { default_tarif: "A", label: "Möbel & Zelte", hinweis: "Möbel-Aufschlag/Stück ab 5 Stück" },
  "geschirr-glaeser-besteck": { default_tarif: "A", label: "Geschirr, Gläser & Besteck" },
  spezialeffekte: { default_tarif: "A", label: "Spezialeffekte" },
  huepfburgen: { default_tarif: "A", label: "Hüpfburgen", hinweis: "Bei XL-Hüpfburgen individuelles Angebot" },
  "leitern-gerueste": { default_tarif: "A", label: "Leitern & Gerüste", hinweis: "Inkl. optional Aufbau-Service-Aufschlag" },
  erdbewegung: {
    default_tarif: "C",
    ui_switch_tarife: ["C", "D"],
    label: "Erdbewegung",
    hinweis: "Default 1t (C); UI-Switch auf 2t/3t (D)",
  },
  arbeitsbuehnen: {
    default_tarif: "C",
    ui_switch_tarife: ["C", "D"],
    label: "Arbeitsbühnen",
    hinweis: "Default 8m Anhängerarbeitsbühne (C); UI-Switch auf 12m+ (D)",
  },
};
