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

type ProductKey = "bierzeltgarnitur-set" | "stehtisch" | "huepfburg-clown" | "huepfburg-rollercoaster";
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
  "huepfburg-clown": {
    krefeld: {
      priceHint: {
        perDay: "ab 50 € / Tag",
        perWeekend: "Wochenend- & Mehrtagespreise im Buchungsschritt",
        note: "Endpreis und Verfügbarkeit werden im Buchungsschritt transparent ausgewiesen.",
      },
      seoParagraphs: [
        "Die Hüpfburg Clown in Krefeld zu mieten ist die XXL-Lösung für Kindergeburtstage in Bockum, Verberg oder Forstwald, für Schul- und Kita-Sommerfeste in Fischeln und Oppum sowie für Stadtteilfeste am Niederrhein. Mit 6,10 m × 5,20 m × 5,90 m und einer aufblasbaren Clown-Figur auf dem Dach ist sie unsere größte Hüpfburg – bis zu 6 Kinder springen gleichzeitig (max. 450 kg, Altersempfehlung 3–16 Jahre).",
        "Vor der Buchung wichtig: Stellfläche von mindestens 7 × 6 m auf ebenem, hindernisfreiem Untergrund (Rasen oder Asphalt) und ein Stromanschluss in Reichweite für das mitgelieferte 1.500-Watt-Gebläse. Im Lieferumfang enthalten sind Tragesack, Gebläse, Gewebeplane und 8 Heringe zur Bodenfixierung. Selbstabholung an der Filiale Krefeld; Lieferung ins Krefelder Umland wird über den Lieferkostenrechner transparent kalkuliert.",
      ],
    },
    bonn: {
      priceHint: {
        perDay: "ab 50 € / Tag",
        perWeekend: "Wochenend- & Mehrtagespreise im Buchungsschritt",
        note: "Endpreis und Verfügbarkeit werden im Buchungsschritt transparent ausgewiesen.",
      },
      seoParagraphs: [
        "Die Hüpfburg Clown in Bonn zu mieten passt zu Kindergeburtstagen in Bad Godesberg, Endenich oder Beuel, zu Pfarr- und Kita-Sommerfesten im Rhein-Sieg-Kreis und zu Familienfesten an der Rheinaue. Mit 6,10 m × 5,20 m × 5,90 m Außenmaß und einer aufblasbaren Clown-Figur auf dem Dach ist sie die XXL-Variante – bis zu 6 Kinder zwischen 3 und 16 Jahren springen gleichzeitig (max. 450 kg).",
        "Planen Sie eine Stellfläche von mindestens 7 × 6 m auf ebenem Untergrund und einen Stromanschluss für das mitgelieferte 1.500-Watt-Gebläse ein. Tragesack, Gebläse, Gewebeplane und 8 Heringe sind im Lieferumfang enthalten. Selbstabholung erfolgt an der Filiale Bonn; Lieferung ins Bonner Umland und in den Rhein-Sieg-Kreis wird im Buchungsprozess transparent berechnet.",
      ],
    },
    muelheim: {
      priceHint: {
        perDay: "ab 50 € / Tag",
        perWeekend: "Wochenend- & Mehrtagespreise im Buchungsschritt",
        note: "Endpreis und Verfügbarkeit werden im Buchungsschritt transparent ausgewiesen.",
      },
      seoParagraphs: [
        "Die Hüpfburg Clown in Mülheim an der Ruhr zu mieten ist die naheliegende Wahl für Kindergeburtstage in Saarn, Heißen oder Speldorf, für Schul- und Kita-Sommerfeste im westlichen Ruhrgebiet und für Familienanlässe rund um Schloss Broich. Mit 6,10 m × 5,20 m × 5,90 m Außenmaß und Clown-Figur auf dem Dach bietet sie Platz für bis zu 6 Kinder gleichzeitig (Altersempfehlung 3–16 Jahre, max. 450 kg).",
        "Vor der Buchung beachten: Stellfläche mindestens 7 × 6 m auf ebenem Untergrund und ein Stromanschluss in Reichweite für das mitgelieferte 1.500-Watt-Gebläse. Tragesack, Gebläse, Gewebeplane und 8 Heringe gehören zum Lieferumfang. Abholung an der Filiale Ruhrorter Straße in Mülheim an der Ruhr; Lieferung in Saarn, Speldorf, Mintard, Styrum und das westliche Ruhrgebiet wird transparent über den Lieferkostenrechner kalkuliert.",
      ],
    },
  },
  "huepfburg-rollercoaster": {
    krefeld: {
      priceHint: {
        perDay: "ab 50 € / Tag",
        perWeekend: "Wochenend- & Mehrtagespreise im Buchungsschritt",
        note: "Endpreis und Verfügbarkeit werden im Buchungsschritt transparent ausgewiesen.",
      },
      seoParagraphs: [
        "Die Hüpfburg Rollercoaster in Krefeld zu mieten ist die beliebte Wahl für Kindergeburtstage in Bockum, Verberg oder Forstwald sowie für Schul- und Vereinsfeste in Fischeln und Oppum. Mit 4,90 m × 4,00 m × 3,50 m im Kirmes-Achterbahn-Design springen bis zu 6 Kinder gleichzeitig – inklusive integrierter Rutsche.",
        "Vor der Buchung wichtig: Stellfläche von mindestens 6 × 5 m auf ebenem Untergrund und ein Stromanschluss in Reichweite für das mitgelieferte 1.100-Watt-Gebläse. Im Lieferumfang enthalten sind Tragesack, Gebläse, Gewebeplane und Bodenheringe. Selbstabholung an der Filiale Krefeld; Lieferung wird transparent über den Lieferkostenrechner kalkuliert.",
      ],
    },
    bonn: {
      priceHint: {
        perDay: "ab 50 € / Tag",
        perWeekend: "Wochenend- & Mehrtagespreise im Buchungsschritt",
        note: "Endpreis und Verfügbarkeit werden im Buchungsschritt transparent ausgewiesen.",
      },
      seoParagraphs: [
        "Die Hüpfburg Rollercoaster in Bonn zu mieten passt zu Kindergeburtstagen in Bad Godesberg, Endenich oder Beuel und zu Schul- und Vereinsfesten im Rhein-Sieg-Kreis. Mit 4,90 m × 4,00 m × 3,50 m im Kirmes-Achterbahn-Design springen bis zu 6 Kinder gleichzeitig – inklusive integrierter Rutsche.",
        "Planen Sie eine Stellfläche von mindestens 6 × 5 m auf ebenem Untergrund und einen Stromanschluss für das mitgelieferte 1.100-Watt-Gebläse ein. Tragesack, Gebläse, Gewebeplane und Bodenheringe sind im Lieferumfang enthalten. Selbstabholung erfolgt an der Filiale Bonn; Lieferung ins Bonner Umland und in den Rhein-Sieg-Kreis wird im Buchungsprozess transparent berechnet.",
      ],
    },
    muelheim: {
      priceHint: {
        perDay: "ab 50 € / Tag",
        perWeekend: "Wochenend- & Mehrtagespreise im Buchungsschritt",
        note: "Endpreis und Verfügbarkeit werden im Buchungsschritt transparent ausgewiesen.",
      },
      seoParagraphs: [
        "Die Hüpfburg Rollercoaster in Mülheim an der Ruhr zu mieten ist die passende Wahl für Kindergeburtstage in Saarn, Heißen oder Speldorf und für Schul- und Vereinsfeste im westlichen Ruhrgebiet. Mit 4,90 m × 4,00 m × 3,50 m im Kirmes-Achterbahn-Design springen bis zu 6 Kinder gleichzeitig – inklusive integrierter Rutsche.",
        "Vor der Buchung beachten: Stellfläche mindestens 6 × 5 m auf ebenem Untergrund und ein Stromanschluss in Reichweite für das mitgelieferte 1.100-Watt-Gebläse. Tragesack, Gebläse, Gewebeplane und Bodenheringe gehören zum Lieferumfang. Abholung an der Filiale Ruhrorter Straße in Mülheim an der Ruhr; Lieferung wird transparent über den Lieferkostenrechner kalkuliert.",
      ],
    },
  },
};

/** Resolve product key from product.id (handles location-prefixed Bonn IDs like "bonn-stehtisch") */
export function getMoebelInfoKey(productId: string): ProductKey | null {
  if (productId === "bierzeltgarnitur-set" || productId === "bonn-bierzeltgarnitur-set") return "bierzeltgarnitur-set";
  if (productId === "stehtisch" || productId === "bonn-stehtisch") return "stehtisch";
  if (productId === "huepfburg-clown" || productId === "bonn-huepfburg-clown" || productId === "muelheim-huepfburg-clown") return "huepfburg-clown";
  if (
    productId === "huepfburg-rollercoaster-1" ||
    productId === "huepfburg-rollercoaster-2" ||
    productId === "bonn-huepfburg-rollercoaster-1" ||
    productId === "bonn-huepfburg-rollercoaster-2" ||
    productId === "muelheim-huepfburg-rollercoaster-1" ||
    productId === "muelheim-huepfburg-rollercoaster-2"
  ) return "huepfburg-rollercoaster";
  return null;
}
