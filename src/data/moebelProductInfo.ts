// Preis- und Standort-spezifische SEO-Inhalte für Möbel-Produktdetailseiten
// Nur für Produkte, deren Preise/Inhalte aus Rentware bzw. Standortwissen belegt sind.

export interface MoebelProductLocationInfo {
  /** Kurzer Preishinweis direkt unter der H1 */
  priceHint: {
    perDay: string; // z. B. "ab 8 € / Tag"
    perWeekend: string; // z. B. "ab 15 € / Wochenende (Fr–Mo)"
    note?: string;
  };
  /** Zwei bis drei einzigartige SEO-Absätze pro Standort */
  seoParagraphs: string[];
}

type ProductKey = "bierzeltgarnitur-set" | "stehtisch";
type LocationKey = "krefeld" | "bonn" | "muelheim";

export const moebelProductInfo: Record<ProductKey, Record<LocationKey, MoebelProductLocationInfo>> = {
  "bierzeltgarnitur-set": {
    krefeld: {
      priceHint: {
        perDay: "ab 8 € / Tag",
        perWeekend: "ab 15 € / Wochenende (Fr–Mo)",
        note: "Endpreis und Verfügbarkeit werden im Buchungsschritt transparent ausgewiesen. Tiefpreisgarantie inklusive.",
      },
      seoParagraphs: [
        "Eine Bierzeltgarnitur in Krefeld zu mieten ist die naheliegende Lösung für Schützenfeste in Fischeln, Linn oder Oppum, für Karnevalssitzungen am Niederrhein und für klassische Vereinsabende. Das Set besteht aus einem klappbaren Tisch (50 × 220 cm) und zwei dazu passenden Bänken (25 × 220 cm) und bietet acht bis zehn Sitzplätze – je nachdem, wie eng zusammengerückt wird.",
        "Wer die nüchterne Holzoptik repräsentativer wirken lassen möchte, ergänzt im Bestellprozess das weiße Hussen-Set (zwei Bankhussen + eine Tischhusse). Damit wird aus der Standard-Bierzeltgarnitur in wenigen Minuten eine ruhige Tischlandschaft – passend für Hochzeiten in Bockum, Verberg oder Forstwald oder für Firmen-Sommerfeste im Europark Fichtenhain. Selbstabholung erfolgt an der Filiale in Krefeld; Lieferung berechnet der Lieferkostenrechner anhand Ihrer Adresse.",
      ],
    },
    bonn: {
      priceHint: {
        perDay: "ab 8 € / Tag",
        perWeekend: "ab 15 € / Wochenende (Fr–Mo)",
        note: "Endpreis und Verfügbarkeit werden im Buchungsschritt transparent ausgewiesen. Tiefpreisgarantie inklusive.",
      },
      seoParagraphs: [
        "Eine Bierzeltgarnitur in Bonn zu mieten passt zu Gartenhochzeiten in Bad Godesberg, zu Sommerfesten von NGOs und Bundesbehörden in der Rheinaue und zu klassischen Schützen- und Vereinsfesten in Beuel oder Pützchen. Das Set kombiniert einen klappbaren Tisch (50 × 220 cm) mit zwei Bänken (25 × 220 cm) und bietet acht bis zehn Sitzplätze pro Garnitur.",
        "Für 60 Hochzeitsgäste rechnen Sie mit rund sieben bis acht Garnituren – aufgebaut in U-Form unter einem Eventzelt 6×8 m oder in Reihen für eine Tafel-Optik. Das weiße Hussen-Set ist im Buchungsprozess optional zubuchbar und macht aus der Bierbankgarnitur eine repräsentative Tischlandschaft. Abholung an der Filiale in Bonn; Lieferung im Rheinland transparent über den Lieferkostenrechner kalkuliert.",
      ],
    },
    muelheim: {
      priceHint: {
        perDay: "ab 8 € / Tag",
        perWeekend: "ab 15 € / Wochenende (Fr–Mo)",
        note: "Endpreis und Verfügbarkeit werden im Buchungsschritt transparent ausgewiesen. Tiefpreisgarantie inklusive.",
      },
      seoParagraphs: [
        "Eine Bierzeltgarnitur in Mülheim an der Ruhr zu mieten ist die Standardlösung für Vereinsjubiläen in Saarn, runde Geburtstage in Heißen, Hochzeiten am Schloss Broich und Open-Air-Anlässe an der Ruhraue. Das Set umfasst einen klappbaren Tisch (50 × 220 cm) und zwei Bänke (25 × 220 cm); acht bis zehn Personen finden pro Garnitur Platz.",
        "Praktisch für Buffet-Aufbauten: Zwei Garnituren parallel ergeben eine 4,4 m lange Tafel – mit dem optional buchbaren weißen Hussen-Set sofort einsatzbereit als Catering-Insel. Abholung an der Filiale Ruhrorter Straße in Mülheim an der Ruhr; Lieferung in Speldorf, Saarn, Broich, Styrum und das westliche Ruhrgebiet wird im Buchungsprozess transparent berechnet.",
      ],
    },
  },
  "stehtisch": {
    krefeld: {
      priceHint: {
        perDay: "ab 5 € / Tag",
        perWeekend: "ab 10 € / Wochenende (Fr–Mo)",
        note: "Hussen in Weiß oder Schwarz optional zubuchbar. Endpreis und Verfügbarkeit werden im Buchungsschritt transparent ausgewiesen.",
      },
      seoParagraphs: [
        "Einen Stehtisch in Krefeld zu mieten lohnt sich für Sektempfänge vor der Schützenhalle in Fischeln, für Empfangsbereiche bei Vereinsjubiläen in Bockum oder als Cocktail-Insel beim Firmenfest im Europark Fichtenhain. Der klappbare Stehtisch (Ø 80 cm, Höhe 110 cm) entspricht der klassischen Geometrie eines Bistro- bzw. Cocktailtischs – pro Tisch finden vier bis sechs Personen entspannt Platz.",
        "Faustregel für Empfänge: Pro 25 Gäste rund fünf Stehtische einplanen. Die passende Stretch-Husse ist optional in Weiß (Hochzeiten, Trauerfeiern, repräsentative Empfänge) oder Schwarz (Firmenevents, Produktpräsentationen) zubuchbar – beide Varianten sitzen faltenfrei und werden gewaschen zurückgegeben. Abholung an der Filiale Krefeld, Lieferung ins Krefelder Umland transparent kalkuliert.",
      ],
    },
    bonn: {
      priceHint: {
        perDay: "ab 5 € / Tag",
        perWeekend: "ab 10 € / Wochenende (Fr–Mo)",
        note: "Hussen in Weiß oder Schwarz optional zubuchbar. Endpreis und Verfügbarkeit werden im Buchungsschritt transparent ausgewiesen.",
      },
      seoParagraphs: [
        "Einen Stehtisch in Bonn zu mieten passt zu Sektempfängen vor dem Standesamt in Bad Godesberg, zu Open-Air-Receptions am Rand der Rheinaue oder zu Foyer-Mingle-Bereichen bei Firmensommerfesten in Beuel. Der klappbare Tisch (Ø 80 cm, Höhe 110 cm) bietet vier bis sechs stehenden Personen Platz – für 25 Empfangsgäste planen Sie etwa fünf Stehtische ein.",
        "Die optionale Stretch-Husse gibt es in Weiß und Schwarz: Weiß empfehlen wir für Hochzeiten in Bad Godesberg oder Endenich und für Sommerempfänge mit Bezug zum Wasser; Schwarz für Tagungen, Pressekonferenzen und Produktpräsentationen in Bonner Eventlocations. Selbstabholung an der Filiale Bonn; Lieferung ins gesamte Rheinland über den Lieferkostenrechner.",
      ],
    },
    muelheim: {
      priceHint: {
        perDay: "ab 5 € / Tag",
        perWeekend: "ab 10 € / Wochenende (Fr–Mo)",
        note: "Hussen in Weiß oder Schwarz optional zubuchbar. Endpreis und Verfügbarkeit werden im Buchungsschritt transparent ausgewiesen.",
      },
      seoParagraphs: [
        "Einen Stehtisch in Mülheim an der Ruhr zu mieten passt zu Sektempfängen am Schloss Broich, zu Sommerempfängen in Saarn und zu Industrie- und Tagungsanlässen in den Gewerbegebieten Speldorf und Styrum. Der klappbare Bistrotisch (Ø 80 cm, Höhe 110 cm) bietet vier bis sechs stehenden Personen Platz; pro 25 Empfangsgäste rund fünf Tische einplanen.",
        "Die Stretch-Husse ist optional in Weiß (Hochzeiten, Trauungen im Standesamt, Sommerempfänge) oder Schwarz (Industrie-Events, Produktpräsentationen) zubuchbar. Abholung an der Filiale Ruhrorter Straße in Mülheim an der Ruhr; Lieferung in Saarn, Speldorf, Mintard, Heißen, Styrum und das westliche Ruhrgebiet wird im Buchungsprozess transparent berechnet.",
      ],
    },
  },
};

/** Resolve product key from product.id (handles location-prefixed Bonn IDs like "bonn-stehtisch") */
export function getMoebelInfoKey(productId: string): ProductKey | null {
  if (productId === "bierzeltgarnitur-set" || productId === "bonn-bierzeltgarnitur-set") return "bierzeltgarnitur-set";
  if (productId === "stehtisch" || productId === "bonn-stehtisch") return "stehtisch";
  return null;
}
