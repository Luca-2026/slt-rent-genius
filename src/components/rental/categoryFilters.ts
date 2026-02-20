// Category filter configurations for all product categories
import type { FilterSection } from "./CategoryFilter";

// ============= WERKZEUGE =============
export const werkzeugeFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "Werkzeugtyp",
    defaultExpanded: true,
    options: [
      { id: "bohrhammer", label: "Bohrhämmer", sublabel: "SDS-Plus & SDS-Max" },
      { id: "bohrschrauber", label: "Bohrschrauber", sublabel: "Akku-Bohrmaschinen" },
      { id: "winkelschleifer", label: "Winkelschleifer", sublabel: "Trennschleifen" },
      { id: "saege", label: "Sägen", sublabel: "Kreis-, Säbel-, Stichsäge" },
      { id: "abbruch", label: "Abbruch & Meißeln", sublabel: "Abbruchhammer" },
      { id: "messen", label: "Messen & Orten", sublabel: "Laser, Ortungsgeräte" },
      { id: "beton", label: "Betonbearbeitung", sublabel: "Kernbohrer, Rüttler" },
      { id: "zubehoer", label: "Zubehör", sublabel: "Bohrer, Meißel, Akkus" },
    ],
  },
  {
    id: "power",
    label: "Antrieb",
    defaultExpanded: false,
    options: [
      { id: "akku", label: "Akku" },
      { id: "elektro", label: "Elektro (Kabel)" },
      { id: "benzin", label: "Benzin" },
    ],
  },
];

// ============= GARTENPFLEGE =============
export const gartenpflegeFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "Gerätetyp",
    defaultExpanded: true,
    options: [
      { id: "schneiden", label: "Schneiden & Sägen", sublabel: "Kettensäge, Heckenschere" },
      { id: "boden", label: "Bodenbearbeitung", sublabel: "Erdbohrer, Fräse, Hacke" },
      { id: "rasen", label: "Rasenpflege", sublabel: "Mäher, Vertikutierer" },
      { id: "reinigen", label: "Reinigen", sublabel: "Hochdruckreiniger" },
      { id: "entsorgen", label: "Häckseln & Entsorgen", sublabel: "Häcksler, Laubbläser" },
    ],
  },
];

// ============= AGGREGATE =============
export const aggregateFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "Gerätetype",
    defaultExpanded: true,
    options: [
      { id: "aggregat", label: "Stromaggregate", sublabel: "Notstrom & Baustrom" },
      { id: "akkupack", label: "Akkupacks", sublabel: "Tragbare Speicher" },
      { id: "kompressor", label: "Kompressoren", sublabel: "Druckluft" },
    ],
  },
  {
    id: "power",
    label: "Leistung",
    defaultExpanded: true,
    options: [
      { id: "bis-5kva", label: "Bis 5 kVA", sublabel: "Kleine Verbraucher" },
      { id: "5-20kva", label: "5-20 kVA", sublabel: "Mittlere Projekte" },
      { id: "ab-20kva", label: "Ab 20 kVA", sublabel: "Großveranstaltungen" },
    ],
  },
];

// ============= ARBEITSBÜHNEN =============
export const arbeitsbuehnenFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "Bühnentyp",
    defaultExpanded: true,
    options: [
      { id: "scherenbuehne", label: "Scherenbühne", sublabel: "Vertikaler Hub" },
      { id: "mastbuehne", label: "Mastbühne", sublabel: "Kompakt & wendig" },
      { id: "gelenkbuehne", label: "Gelenkbühne", sublabel: "Flexibler Ausleger" },
      { id: "teleskopbuehne", label: "Teleskopbühne", sublabel: "Große Reichweite" },
      { id: "anhaengerbuehne", label: "Anhänger-Arbeitsbühne", sublabel: "Mobil & straßentauglich" },
    ],
  },
  {
    id: "height",
    label: "Arbeitshöhe",
    defaultExpanded: true,
    options: [
      { id: "bis-10m", label: "Bis 10m" },
      { id: "10-15m", label: "10-15m" },
      { id: "ab-15m", label: "Ab 15m" },
    ],
  },
];

// ============= VERDICHTUNG =============
export const verdichtungFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "Gerätetyp",
    defaultExpanded: true,
    options: [
      { id: "stampfer", label: "Stampfer", sublabel: "Für Gräben & Engstellen" },
      { id: "ruettelplatte", label: "Rüttelplatte vorwärts", sublabel: "Für Flächen" },
      { id: "ruettelplatte-reversierbar", label: "Rüttelplatte reversierbar", sublabel: "Vor- & Rückwärts" },
      { id: "walze", label: "Walze", sublabel: "Große Flächen" },
    ],
  },
  {
    id: "weight",
    label: "Einsatzgewicht",
    defaultExpanded: false,
    options: [
      { id: "bis-100kg", label: "Bis 100 kg" },
      { id: "100-200kg", label: "100-200 kg" },
      { id: "ab-200kg", label: "Ab 200 kg" },
    ],
  },
];

// ============= HEIZUNG & TROCKNUNG =============
export const heizungTrocknungFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "Gerätetyp",
    defaultExpanded: true,
    options: [
      { id: "heizluefter", label: "Heizlüfter", sublabel: "Elektro-Heizlüfter" },
      { id: "heizpilz", label: "Heizpilz", sublabel: "Infrarot-Heizstrahler" },
      { id: "bautrockner", label: "Bautrockner", sublabel: "Kondensations-Entfeuchtung" },
    ],
  },
  {
    id: "leistung",
    label: "Heizleistung",
    defaultExpanded: true,
    options: [
      { id: "bis-2kw", label: "Bis 2 kW", sublabel: "230 V Schuko – kein CEE nötig" },
      { id: "3kw", label: "3 kW", sublabel: "230 V – kein CEE nötig" },
      { id: "ab-9kw", label: "9 kW", sublabel: "⚡ 400 V CEE-Starkstrom erforderlich" },
    ],
  },
];

// ============= LEITERN & GERÜSTE =============
export const leiternGeruesteFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "Typ",
    defaultExpanded: true,
    options: [
      { id: "stehleiter", label: "Stehleiter", sublabel: "Alu-Stehleiter" },
      { id: "kombileiter", label: "Kombileiter", sublabel: "Mehrzweck-Leitern" },
      { id: "rollgeruest", label: "Rollgerüste", sublabel: "Fahrbar, Alu" },
      { id: "geruestteil", label: "Gerüstteile", sublabel: "Rahmen, Böden & Zubehör" },
    ],
  },
  {
    id: "arbeitshoehe",
    label: "Arbeitshöhe",
    defaultExpanded: true,
    options: [
      { id: "bis-3m", label: "Bis 3 m", sublabel: "Kleine Leitern" },
      { id: "3-6m", label: "3 – 6 m", sublabel: "Mittlere Leitern & Gerüste" },
      { id: "ab-6m", label: "Ab 6 m", sublabel: "Große Rollgerüste" },
    ],
  },
];

// ============= BELEUCHTUNG =============
export const beleuchtungFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "Lichttyp",
    defaultExpanded: true,
    options: [
      { id: "fluter", label: "Fluter & Strahler", sublabel: "Baustelle & Outdoor" },
      { id: "spot", label: "LED Spots", sublabel: "Akzentbeleuchtung" },
      { id: "buehne", label: "Bühnenlicht", sublabel: "Moving Heads, PAR" },
      { id: "deko", label: "Dekobeleuchtung", sublabel: "Lichterketten, Effekte" },
    ],
  },
];

// ============= BESCHALLUNG =============
export const beschallungFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "Typ",
    defaultExpanded: true,
    options: [
      { id: "pa", label: "PA-Systeme", sublabel: "Komplett-Anlagen" },
      { id: "lautsprecher", label: "Lautsprecher", sublabel: "Aktiv & Passiv" },
      { id: "mikrofon", label: "Mikrofone", sublabel: "Funk & Kabel" },
      { id: "mischpult", label: "Mischpulte", sublabel: "Analog & Digital" },
    ],
  },
];

// ============= MÖBEL & ZELTE =============
export const moebelZelteFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "Kategorie",
    defaultExpanded: true,
    options: [
      { id: "zelt", label: "Zelte", sublabel: "Party- & Pagodenzelte" },
      { id: "tisch", label: "Tische", sublabel: "Bierzelt, Stehtisch" },
      { id: "stuhl", label: "Stühle & Bänke", sublabel: "Klapp- & Festzeltgarnitur" },
      { id: "lounge", label: "Lounge-Möbel", sublabel: "Sofas, Sessel" },
    ],
  },
];

// ============= GESCHIRR, GLÄSER & BESTECK =============
export const geschirrFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "Kategorie",
    defaultExpanded: true,
    options: [
      { id: "geschirr", label: "Geschirr", sublabel: "Teller, Tassen" },
      { id: "glaeser", label: "Gläser", sublabel: "Wein, Bier, Cocktail" },
      { id: "besteck", label: "Besteck", sublabel: "Messer, Gabel, Löffel" },
      { id: "servieren", label: "Servieren", sublabel: "Tabletts, Karaffen" },
    ],
  },
];

// ============= HÜPFBURGEN =============
export const huepfburgenFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "Typ",
    defaultExpanded: true,
    options: [
      { id: "huepfburg", label: "Hüpfburgen", sublabel: "Klassische Modelle" },
      { id: "rutsche", label: "Rutschen", sublabel: "Mit Wasseranschluss" },
      { id: "spiel", label: "Spielgeräte", sublabel: "Parcours & Co." },
    ],
  },
  {
    id: "size",
    label: "Größe",
    defaultExpanded: false,
    options: [
      { id: "klein", label: "Klein", sublabel: "Bis 4x4m" },
      { id: "mittel", label: "Mittel", sublabel: "4x4m - 6x6m" },
      { id: "gross", label: "Groß", sublabel: "Ab 6x6m" },
    ],
  },
];

// ============= ABSPERRTECHNIK =============
export const absperrtechnikFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "Typ",
    defaultExpanded: true,
    options: [
      { id: "gitter", label: "Absperrgitter", sublabel: "Veranstaltungen" },
      { id: "zaun", label: "Bauzäune", sublabel: "Baustellen" },
      { id: "bake", label: "Warnbaken", sublabel: "Verkehrssicherung" },
      { id: "band", label: "Flatterband", sublabel: "Absperrung" },
    ],
  },
];

// ============= SPEZIALEFFEKTE =============
export const spezialeffekteFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "Effekttyp",
    defaultExpanded: true,
    options: [
      { id: "nebel", label: "Nebel & Dunst", sublabel: "Nebelmaschinen" },
      { id: "seifenblasen", label: "Seifenblasen", sublabel: "Blasenmaschinen" },
      { id: "funken", label: "Funken & Pyro", sublabel: "Kalte Funken" },
      { id: "konfetti", label: "Konfetti", sublabel: "Shooter & Kanonen" },
    ],
  },
];

// ============= KABEL & STROMVERTEILER =============
export const kabelStromverteilerFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "Produktart",
    defaultExpanded: true,
    options: [
      { id: "stromverteiler", label: "Stromverteiler", sublabel: "UV, Anschlussschränke" },
      { id: "adapter", label: "Adapter", sublabel: "CEE & Speakon Adapter" },
      { id: "kabelbruecke", label: "Kabelbrücken", sublabel: "Überfahrschutz" },
      { id: "erdung", label: "Erdung", sublabel: "Erdungsspieße" },
    ],
  },
  {
    id: "kabeltyp",
    label: "Kabeltyp",
    defaultExpanded: true,
    options: [
      { id: "schuko", label: "Schuko", sublabel: "230V Verlängerungen" },
      { id: "cee", label: "CEE Kabel", sublabel: "16A / 32A / 63A rot" },
      { id: "powercon", label: "PowerCon", sublabel: "Neutrik PowerCon" },
      { id: "powercon-true1", label: "PowerCon TRUE1", sublabel: "Neutrik TRUE1 Top" },
      { id: "lautsprecherkabel", label: "Lautsprecherkabel", sublabel: "Speakon NL2/NL4" },
      { id: "netzwerk", label: "Netzwerk / EtherCon", sublabel: "Cat-5e & Cat-7" },
      { id: "hdmi", label: "HDMI / Video", sublabel: "Glasfaser & Kupfer" },
    ],
  },
  {
    id: "laenge",
    label: "Kabellänge",
    defaultExpanded: false,
    options: [
      { id: "bis-3m", label: "Bis 3 m" },
      { id: "5m", label: "5 m" },
      { id: "10m", label: "10 m" },
      { id: "20m", label: "20 m" },
      { id: "ab-25m", label: "Ab 25 m" },
    ],
  },
];

// ============= BÜHNE =============
export const buehneFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "Typ",
    defaultExpanded: true,
    options: [
      { id: "element", label: "Bühnenelemente", sublabel: "Podeste & Platten" },
      { id: "treppe", label: "Treppen", sublabel: "Bühnentreppen" },
      { id: "zubehoer", label: "Zubehör", sublabel: "Füße, Verbinder" },
    ],
  },
];

// ============= TRAVERSEN & RIGGING =============
export const traversenFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "Typ",
    defaultExpanded: true,
    options: [
      { id: "traverse", label: "Traversen", sublabel: "Verschiedene Längen" },
      { id: "ecke", label: "Eckverbinder", sublabel: "90° & variabel" },
      { id: "stativ", label: "Stative", sublabel: "Travers-Ständer" },
    ],
  },
];

// ============= KOMMUNIKATION =============
export const kommunikationFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "Typ",
    defaultExpanded: true,
    options: [
      { id: "funk", label: "Funkgeräte", sublabel: "UHF/VHF" },
      { id: "headset", label: "Headsets", sublabel: "Kabel & Funk" },
    ],
  },
];

// Map category IDs to their filter configurations
export const categoryFilterMap: Record<string, FilterSection[]> = {
  "werkzeuge": werkzeugeFilterSections,
  "gartenpflege": gartenpflegeFilterSections,
  "aggregate": aggregateFilterSections,
  "arbeitsbuehnen": arbeitsbuehnenFilterSections,
  "verdichtung": verdichtungFilterSections,
  "heizung-trocknung": heizungTrocknungFilterSections,
  "leitern-gerueste": leiternGeruesteFilterSections,
  "beleuchtung": beleuchtungFilterSections,
  "beschallung": beschallungFilterSections,
  "moebel-zelte": moebelZelteFilterSections,
  "geschirr-glaeser-besteck": geschirrFilterSections,
  "huepfburgen": huepfburgenFilterSections,
  "absperrtechnik": absperrtechnikFilterSections,
  "spezialeffekte": spezialeffekteFilterSections,
  "kabel-stromverteiler": kabelStromverteilerFilterSections,
  "buehne": buehneFilterSections,
  "traversen-rigging": traversenFilterSections,
  "kommunikation": kommunikationFilterSections,
};

// Get search placeholder for each category
export const categorySearchPlaceholders: Record<string, string> = {
  "werkzeuge": "Werkzeug suchen...",
  "gartenpflege": "Gartengerät suchen...",
  "aggregate": "Aggregat suchen...",
  "arbeitsbuehnen": "Arbeitsbühne suchen...",
  "verdichtung": "Verdichtungsgerät suchen...",
  "heizung-trocknung": "Heiz-/Trocknungsgerät suchen...",
  "leitern-gerueste": "Leiter/Gerüst suchen...",
  "beleuchtung": "Beleuchtung suchen...",
  "beschallung": "PA-Equipment suchen...",
  "moebel-zelte": "Möbel/Zelt suchen...",
  "geschirr-glaeser-besteck": "Geschirr suchen...",
  "huepfburgen": "Hüpfburg suchen...",
  "absperrtechnik": "Absperrtechnik suchen...",
  "spezialeffekte": "Effekt suchen...",
  "kabel-stromverteiler": "Kabel/Verteiler suchen...",
  "buehne": "Bühnenelement suchen...",
  "traversen-rigging": "Traverse suchen...",
  "kommunikation": "Funkgerät suchen...",
};

// Category display names for delivery calculator
export const categoryDisplayNames: Record<string, string> = {
  "werkzeuge": "Werkzeuge",
  "gartenpflege": "Gartenpflege",
  "aggregate": "Aggregate",
  "arbeitsbuehnen": "Arbeitsbühnen",
  "verdichtung": "Verdichtung",
  "heizung-trocknung": "Heizung & Trocknung",
  "leitern-gerueste": "Leitern & Gerüste",
  "beleuchtung": "Beleuchtung",
  "beschallung": "Beschallung",
  "moebel-zelte": "Möbel & Zelte",
  "geschirr-glaeser-besteck": "Geschirr",
  "huepfburgen": "Hüpfburgen",
  "absperrtechnik": "Absperrtechnik",
  "spezialeffekte": "Spezialeffekte",
  "kabel-stromverteiler": "Kabel & Stromverteiler",
  "buehne": "Bühne",
  "traversen-rigging": "Traversen",
  "kommunikation": "Kommunikation",
  "erdbewegung": "Erdbewegung",
  "anhaenger": "Anhänger",
};
