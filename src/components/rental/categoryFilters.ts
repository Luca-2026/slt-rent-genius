// Category filter configurations for all product categories
import type { FilterSection } from "./CategoryFilter";

// ============= WERKZEUGE =============
export const werkzeugeFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "catFilters.werkzeugtyp",
    defaultExpanded: true,
    options: [
      { id: "bohrhammer", label: "catFilters.bohrhammer", sublabel: "catFilters.bohrhammer_sub" },
      { id: "bohrschrauber", label: "catFilters.bohrschrauber", sublabel: "catFilters.bohrschrauber_sub" },
      { id: "winkelschleifer", label: "catFilters.winkelschleifer", sublabel: "catFilters.winkelschleifer_sub" },
      { id: "saege", label: "catFilters.saege", sublabel: "catFilters.saege_sub" },
      { id: "abbruch", label: "catFilters.abbruch", sublabel: "catFilters.abbruch_sub" },
      { id: "messen", label: "catFilters.messen", sublabel: "catFilters.messen_sub" },
      { id: "beton", label: "catFilters.beton", sublabel: "catFilters.beton_sub" },
      { id: "zubehoer", label: "catFilters.zubehoer", sublabel: "catFilters.zubehoer_sub" },
    ],
  },
  {
    id: "power",
    label: "catFilters.antrieb",
    defaultExpanded: false,
    options: [
      { id: "akku", label: "catFilters.akku" },
      { id: "elektro", label: "catFilters.elektro" },
      { id: "benzin", label: "catFilters.benzin" },
    ],
  },
];

// ============= GARTENPFLEGE =============
export const gartenpflegeFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "catFilters.geraetetyp",
    defaultExpanded: true,
    options: [
      { id: "schneiden", label: "catFilters.schneiden", sublabel: "catFilters.schneiden_sub" },
      { id: "boden", label: "catFilters.boden", sublabel: "catFilters.boden_sub" },
      { id: "rasen", label: "catFilters.rasen", sublabel: "catFilters.rasen_sub" },
      { id: "reinigen", label: "catFilters.reinigen", sublabel: "catFilters.reinigen_sub" },
      { id: "entsorgen", label: "catFilters.entsorgen", sublabel: "catFilters.entsorgen_sub" },
    ],
  },
];

// ============= AGGREGATE =============
export const aggregateFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "catFilters.geraetetyp",
    defaultExpanded: true,
    options: [
      { id: "aggregat", label: "catFilters.stromaggregate", sublabel: "catFilters.stromaggregate_sub" },
      { id: "akkupack", label: "catFilters.akkupacks", sublabel: "catFilters.akkupacks_sub" },
      { id: "kompressor", label: "catFilters.kompressoren", sublabel: "catFilters.kompressoren_sub" },
    ],
  },
  {
    id: "power",
    label: "catFilters.leistung",
    defaultExpanded: true,
    options: [
      { id: "bis-5kva", label: "catFilters.bis5kva", sublabel: "catFilters.bis5kva_sub" },
      { id: "5-20kva", label: "catFilters.5bis20kva", sublabel: "catFilters.5bis20kva_sub" },
      { id: "ab-20kva", label: "catFilters.ab20kva", sublabel: "catFilters.ab20kva_sub" },
    ],
  },
];

// ============= ARBEITSBÜHNEN =============
export const arbeitsbuehnenFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "catFilters.buehnentyp",
    defaultExpanded: true,
    options: [
      { id: "scherenbuehne", label: "catFilters.scherenbuehne", sublabel: "catFilters.scherenbuehne_sub" },
      { id: "mastbuehne", label: "catFilters.mastbuehne", sublabel: "catFilters.mastbuehne_sub" },
      { id: "gelenkbuehne", label: "catFilters.gelenkbuehne", sublabel: "catFilters.gelenkbuehne_sub" },
      { id: "teleskopbuehne", label: "catFilters.teleskopbuehne", sublabel: "catFilters.teleskopbuehne_sub" },
      { id: "anhaengerbuehne", label: "catFilters.anhaengerbuehne", sublabel: "catFilters.anhaengerbuehne_sub" },
    ],
  },
  {
    id: "height",
    label: "catFilters.arbeitshoehe",
    defaultExpanded: true,
    options: [
      { id: "bis-10m", label: "catFilters.bis10m" },
      { id: "10-15m", label: "catFilters.10bis15m" },
      { id: "ab-15m", label: "catFilters.ab15m" },
    ],
  },
];

// ============= VERDICHTUNG =============
export const verdichtungFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "catFilters.geraetetyp",
    defaultExpanded: true,
    options: [
      { id: "stampfer", label: "catFilters.stampfer", sublabel: "catFilters.stampfer_sub" },
      { id: "ruettelplatte", label: "catFilters.ruettelplatte", sublabel: "catFilters.ruettelplatte_sub" },
      { id: "ruettelplatte-reversierbar", label: "catFilters.ruettelplatte_rev", sublabel: "catFilters.ruettelplatte_rev_sub" },
      { id: "walze", label: "catFilters.walze", sublabel: "catFilters.walze_sub" },
    ],
  },
  {
    id: "weight",
    label: "catFilters.einsatzgewicht",
    defaultExpanded: false,
    options: [
      { id: "bis-100kg", label: "catFilters.bis100kg" },
      { id: "100-200kg", label: "catFilters.100bis200kg" },
      { id: "ab-200kg", label: "catFilters.ab200kg" },
    ],
  },
];

// ============= HEIZUNG & TROCKNUNG =============
export const heizungTrocknungFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "catFilters.geraetetyp",
    defaultExpanded: true,
    options: [
      { id: "heizluefter", label: "catFilters.heizluefter", sublabel: "catFilters.heizluefter_sub" },
      { id: "heizpilz", label: "catFilters.heizpilz", sublabel: "catFilters.heizpilz_sub" },
      { id: "bautrockner", label: "catFilters.bautrockner", sublabel: "catFilters.bautrockner_sub" },
    ],
  },
  {
    id: "heizleistung",
    label: "catFilters.heizleistung",
    defaultExpanded: false,
    options: [
      { id: "bis-2kw", label: "catFilters.bis2kw", sublabel: "catFilters.bis2kw_sub" },
      { id: "3kw", label: "catFilters.3kw", sublabel: "catFilters.3kw_sub" },
      { id: "ab-9kw", label: "catFilters.9kw", sublabel: "catFilters.9kw_sub" },
    ],
  },
  {
    id: "trocknung",
    label: "catFilters.trocknungsflaeche",
    defaultExpanded: false,
    options: [
      { id: "bis-20m2", label: "catFilters.bis20m2", sublabel: "catFilters.bis20m2_sub" },
      { id: "ab-50m2", label: "catFilters.ab50m2", sublabel: "catFilters.ab50m2_sub" },
    ],
  },
];

// ============= LEITERN & GERÜSTE =============
export const leiternGeruesteFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "catFilters.typ",
    defaultExpanded: true,
    options: [
      { id: "stehleiter", label: "catFilters.stehleiter", sublabel: "catFilters.stehleiter_sub" },
      { id: "kombileiter", label: "catFilters.kombileiter", sublabel: "catFilters.kombileiter_sub" },
      { id: "rollgeruest", label: "catFilters.rollgeruest", sublabel: "catFilters.rollgeruest_sub" },
      { id: "geruestteil", label: "catFilters.geruestteil", sublabel: "catFilters.geruestteil_sub" },
    ],
  },
  {
    id: "arbeitshoehe",
    label: "catFilters.arbeitshoehe",
    defaultExpanded: true,
    options: [
      { id: "bis-3m", label: "catFilters.bis3m", sublabel: "catFilters.bis3m_sub" },
      { id: "3-6m", label: "catFilters.3bis6m", sublabel: "catFilters.3bis6m_sub" },
      { id: "ab-6m", label: "catFilters.ab6m", sublabel: "catFilters.ab6m_sub" },
    ],
  },
];

// ============= BELEUCHTUNG =============
export const beleuchtungFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "catFilters.lichttyp",
    defaultExpanded: true,
    options: [
      { id: "fluter", label: "catFilters.fluter", sublabel: "catFilters.fluter_sub" },
      { id: "spot", label: "catFilters.spot", sublabel: "catFilters.spot_sub" },
      { id: "moving-head", label: "catFilters.movingHead", sublabel: "catFilters.movingHead_sub" },
      { id: "deko", label: "catFilters.dekobeleuchtung", sublabel: "catFilters.dekobeleuchtung_sub" },
      { id: "arbeitsleuchte", label: "catFilters.arbeitsleuchte", sublabel: "catFilters.arbeitsleuchte_sub" },
    ],
  },
  {
    id: "einsatz",
    label: "catFilters.einsatzbereich",
    defaultExpanded: false,
    options: [
      { id: "event", label: "catFilters.eventBuehne", sublabel: "catFilters.eventBuehne_sub" },
      { id: "baustelle", label: "catFilters.baustelleIndustrie", sublabel: "catFilters.baustelleIndustrie_sub" },
    ],
  },
];

// ============= MÖBEL & ZELTE =============
export const moebelZelteFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "catFilters.produktart",
    defaultExpanded: true,
    options: [
      { id: "zelt", label: "catFilters.zelte", sublabel: "catFilters.zelte_sub" },
      { id: "moebel", label: "catFilters.tischeStühle", sublabel: "catFilters.tischeStühle_sub" },
      { id: "husse", label: "catFilters.hussen", sublabel: "catFilters.hussen_sub" },
      { id: "kuehlgeraet", label: "catFilters.kuehlgeraete", sublabel: "catFilters.kuehlgeraete_sub" },
    ],
  },
  {
    id: "zeltgroesse",
    label: "catFilters.zeltgroesse",
    defaultExpanded: true,
    options: [
      { id: "bis-16m2", label: "catFilters.bis16m2", sublabel: "catFilters.bis16m2_sub" },
      { id: "17-40m2", label: "catFilters.17bis40m2", sublabel: "catFilters.17bis40m2_sub" },
      { id: "ab-48m2", label: "catFilters.ab48m2", sublabel: "catFilters.ab48m2_sub" },
    ],
  },
];



// ============= BESCHALLUNG =============
export const beschallungFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "catFilters.typ",
    defaultExpanded: true,
    options: [
      { id: "pa", label: "catFilters.paSysteme", sublabel: "catFilters.paSysteme_sub" },
      { id: "lautsprecher", label: "catFilters.lautsprecher", sublabel: "catFilters.lautsprecher_sub" },
      { id: "subwoofer", label: "catFilters.subwoofer", sublabel: "catFilters.subwoofer_sub" },
      { id: "mikrofon", label: "catFilters.mikrofone", sublabel: "catFilters.mikrofone_sub" },
      { id: "zubehoer", label: "catFilters.zubehoer", sublabel: "catFilters.zubehoer_beschallung_sub" },
    ],
  },
  {
    id: "personen",
    label: "catFilters.personenanzahl",
    defaultExpanded: true,
    options: [
      { id: "bis-30", label: "catFilters.bis30", sublabel: "catFilters.bis30_sub" },
      { id: "bis-75", label: "catFilters.bis75", sublabel: "catFilters.bis75_sub" },
      { id: "bis-250", label: "catFilters.bis250", sublabel: "catFilters.bis250_sub" },
    ],
  },
  {
    id: "features",
    label: "catFilters.ausstattung",
    defaultExpanded: false,
    options: [
      { id: "bluetooth", label: "catFilters.bluetooth", sublabel: "catFilters.bluetooth_sub" },
      { id: "akku", label: "catFilters.akkuBetrieben", sublabel: "catFilters.akkuBetrieben_sub" },
      { id: "mischpult", label: "catFilters.mischpult", sublabel: "catFilters.mischpult_sub" },
    ],
  },
];



// ============= GESCHIRR, GLÄSER & BESTECK =============
export const geschirrFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "catFilters.kategorie",
    defaultExpanded: true,
    options: [
      { id: "geschirr", label: "catFilters.geschirr", sublabel: "catFilters.geschirr_sub" },
      { id: "glaeser", label: "catFilters.glaeser", sublabel: "catFilters.glaeser_sub" },
      { id: "besteck", label: "catFilters.besteck", sublabel: "catFilters.besteck_sub" },
      { id: "zubehoer", label: "catFilters.zubehoer_geschirr", sublabel: "catFilters.zubehoer_geschirr_sub" },
    ],
  },
  {
    id: "anlass",
    label: "catFilters.anlass",
    defaultExpanded: false,
    options: [
      { id: "hochwertig", label: "catFilters.hochwertig", sublabel: "catFilters.hochwertig_sub" },
      { id: "standard", label: "catFilters.standard", sublabel: "catFilters.standard_sub" },
    ],
  },
];

// ============= HÜPFBURGEN =============
export const huepfburgenFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "catFilters.typ",
    defaultExpanded: true,
    options: [
      { id: "huepfburg", label: "catFilters.huepfburgen", sublabel: "catFilters.huepfburgen_sub" },
      { id: "rutsche", label: "catFilters.rutschen", sublabel: "catFilters.rutschen_sub" },
      { id: "spiel", label: "catFilters.spielgeraete", sublabel: "catFilters.spielgeraete_sub" },
    ],
  },
  {
    id: "size",
    label: "catFilters.groesse",
    defaultExpanded: false,
    options: [
      { id: "klein", label: "catFilters.klein", sublabel: "catFilters.klein_sub" },
      { id: "mittel", label: "catFilters.mittel", sublabel: "catFilters.mittel_sub" },
      { id: "gross", label: "catFilters.gross", sublabel: "catFilters.gross_sub" },
    ],
  },
];

// ============= ABSPERR- & VERKEHRSTECHNIK =============
export const absperrtechnikFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "catFilters.produktart",
    defaultExpanded: true,
    options: [
      { id: "verkehrszeichen", label: "catFilters.verkehrszeichen", sublabel: "catFilters.verkehrszeichen_sub" },
      { id: "warnbarke", label: "catFilters.warnbarken", sublabel: "catFilters.warnbarken_sub" },
      { id: "warnleuchte", label: "catFilters.warnleuchten", sublabel: "catFilters.warnleuchten_sub" },
      { id: "bauzaun", label: "catFilters.bauzaeune", sublabel: "catFilters.bauzaeune_sub" },
      { id: "absperrgitter", label: "catFilters.absperrgitter", sublabel: "catFilters.absperrgitter_sub" },
      { id: "schrankenzaun", label: "catFilters.schrankenzaeune", sublabel: "catFilters.schrankenzaeune_sub" },
      { id: "zubehoer", label: "catFilters.zubehoer", sublabel: "catFilters.zubehoer_absperr_sub" },
    ],
  },
  {
    id: "reflektionsklasse",
    label: "catFilters.reflektionsklasse",
    defaultExpanded: false,
    options: [
      { id: "ra1", label: "catFilters.ra1", sublabel: "catFilters.ra1_sub" },
      { id: "ra2", label: "catFilters.ra2", sublabel: "catFilters.ra2_sub" },
    ],
  },
];

// ============= SPEZIALEFFEKTE =============
export const spezialeffekteFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "catFilters.effekttyp",
    defaultExpanded: true,
    options: [
      { id: "nebel", label: "catFilters.nebelDunst", sublabel: "catFilters.nebelDunst_sub" },
      { id: "seifenblasen", label: "catFilters.seifenblasen", sublabel: "catFilters.seifenblasen_sub" },
      { id: "funken", label: "catFilters.funkenPyro", sublabel: "catFilters.funkenPyro_sub" },
      { id: "konfetti", label: "catFilters.konfetti", sublabel: "catFilters.konfetti_sub" },
    ],
  },
];

// ============= KABEL & STROMVERTEILER =============
export const kabelStromverteilerFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "catFilters.produktart",
    defaultExpanded: true,
    options: [
      { id: "stromverteiler", label: "catFilters.stromverteiler", sublabel: "catFilters.stromverteiler_sub" },
      { id: "adapter", label: "catFilters.adapter", sublabel: "catFilters.adapter_sub" },
      { id: "kabelbruecke", label: "catFilters.kabelbruecken", sublabel: "catFilters.kabelbruecken_sub" },
      { id: "erdung", label: "catFilters.erdung", sublabel: "catFilters.erdung_sub" },
    ],
  },
  {
    id: "kabeltyp",
    label: "catFilters.kabeltyp",
    defaultExpanded: true,
    options: [
      { id: "schuko", label: "catFilters.schuko", sublabel: "catFilters.schuko_sub" },
      { id: "cee", label: "catFilters.ceeKabel", sublabel: "catFilters.ceeKabel_sub" },
      { id: "powercon", label: "catFilters.powercon", sublabel: "catFilters.powercon_sub" },
      { id: "powercon-true1", label: "catFilters.powerconTrue1", sublabel: "catFilters.powerconTrue1_sub" },
      { id: "lautsprecherkabel", label: "catFilters.lautsprecherkabel", sublabel: "catFilters.lautsprecherkabel_sub" },
      { id: "netzwerk", label: "catFilters.netzwerk", sublabel: "catFilters.netzwerk_sub" },
      { id: "hdmi", label: "catFilters.hdmi", sublabel: "catFilters.hdmi_sub" },
    ],
  },
  {
    id: "laenge",
    label: "catFilters.kabellaenge",
    defaultExpanded: false,
    options: [
      { id: "bis-3m", label: "catFilters.bis3mKabel" },
      { id: "5m", label: "catFilters.5m" },
      { id: "10m", label: "catFilters.10m" },
      { id: "20m", label: "catFilters.20m" },
      { id: "ab-25m", label: "catFilters.ab25m" },
    ],
  },
];

// ============= BÜHNE =============
export const buehneFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "catFilters.typ",
    defaultExpanded: true,
    options: [
      { id: "element", label: "catFilters.buehnenelemente", sublabel: "catFilters.buehnenelemente_sub" },
      { id: "treppe", label: "catFilters.treppen", sublabel: "catFilters.treppen_sub" },
      { id: "zubehoer", label: "catFilters.zubehoer", sublabel: "catFilters.zubehoer_buehne_sub" },
    ],
  },
];

// ============= TRAVERSEN & RIGGING =============
export const traversenFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "catFilters.typ",
    defaultExpanded: true,
    options: [
      { id: "traverse", label: "catFilters.traversen", sublabel: "catFilters.traversen_sub" },
      { id: "ecke", label: "catFilters.eckverbinder", sublabel: "catFilters.eckverbinder_sub" },
      { id: "stativ", label: "catFilters.stative", sublabel: "catFilters.stative_sub" },
    ],
  },
];

// ============= KOMMUNIKATION =============
export const kommunikationFilterSections: FilterSection[] = [
  {
    id: "type",
    label: "catFilters.typ",
    defaultExpanded: true,
    options: [
      { id: "funk", label: "catFilters.funkgeraete", sublabel: "catFilters.funkgeraete_sub" },
      { id: "headset", label: "catFilters.headsets", sublabel: "catFilters.headsets_sub" },
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

// Get search placeholder i18n keys for each category
export const categorySearchPlaceholders: Record<string, string> = {
  "werkzeuge": "catSearch.werkzeuge",
  "gartenpflege": "catSearch.gartenpflege",
  "aggregate": "catSearch.aggregate",
  "arbeitsbuehnen": "catSearch.arbeitsbuehnen",
  "verdichtung": "catSearch.verdichtung",
  "heizung-trocknung": "catSearch.heizungTrocknung",
  "leitern-gerueste": "catSearch.leiternGerueste",
  "beleuchtung": "catSearch.beleuchtung",
  "beschallung": "catSearch.beschallung",
  "moebel-zelte": "catSearch.moebelZelte",
  "geschirr-glaeser-besteck": "catSearch.geschirr",
  "huepfburgen": "catSearch.huepfburgen",
  "absperrtechnik": "catSearch.absperrtechnik",
  "spezialeffekte": "catSearch.spezialeffekte",
  "kabel-stromverteiler": "catSearch.kabelStromverteiler",
  "buehne": "catSearch.buehne",
  "traversen-rigging": "catSearch.traversenRigging",
  "kommunikation": "catSearch.kommunikation",
};

// Category display name i18n keys for delivery calculator
export const categoryDisplayNames: Record<string, string> = {
  "werkzeuge": "catDisplay.werkzeuge",
  "gartenpflege": "catDisplay.gartenpflege",
  "aggregate": "catDisplay.aggregate",
  "arbeitsbuehnen": "catDisplay.arbeitsbuehnen",
  "verdichtung": "catDisplay.verdichtung",
  "heizung-trocknung": "catDisplay.heizungTrocknung",
  "leitern-gerueste": "catDisplay.leiternGerueste",
  "beleuchtung": "catDisplay.beleuchtung",
  "beschallung": "catDisplay.beschallung",
  "moebel-zelte": "catDisplay.moebelZelte",
  "geschirr-glaeser-besteck": "catDisplay.geschirr",
  "huepfburgen": "catDisplay.huepfburgen",
  "absperrtechnik": "catDisplay.absperrtechnik",
  "spezialeffekte": "catDisplay.spezialeffekte",
  "kabel-stromverteiler": "catDisplay.kabelStromverteiler",
  "buehne": "catDisplay.buehne",
  "traversen-rigging": "catDisplay.traversenRigging",
  "kommunikation": "catDisplay.kommunikation",
  "erdbewegung": "catDisplay.erdbewegung",
  "anhaenger": "catDisplay.anhaenger",
};
