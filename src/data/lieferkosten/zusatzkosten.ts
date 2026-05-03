// Zusatzkosten / Margenhebel
// Quelle: lieferpreise-slt-zusatzkosten-NEU-v5.csv

export const ZUSATZKOSTEN = {
  geruest: {
    aufschlag_pro_meter: 8, // €/m über 4,4 m
    aufbau_basis: 75,
    aufbau_pro_meter: 15,
    geruest_basis_meter: 4.4,
  },
  moebel: {
    moebel_aufschlag_je_stueck: 2,
    schwelle_stueck: 5,
  },
  alle: {
    rueckweg_faktor: 2,
    express_pauschale: 50,
    wochenende_faktor: 1.25,
    wartezeit_pro_15min: 15,
    standard_uebergabe_min: 15,
  },
} as const;
