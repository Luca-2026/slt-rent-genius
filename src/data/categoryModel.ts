// Etappe 3 – Zentrales Kategorie-Datenmodell
// ---------------------------------------------------------------
// Reine Datendatei ohne Importe aus rentalData (Zyklusvermeidung).
// Enthält: Anzeigenamen/SEO-Namen/Plural je Kategorie, Einleitungstexte,
// Kategorie-Umhängungen, Duplikat-Auflösung, Zubehör- und Verkaufs-Flags
// sowie Sortierlogik. Wird von rentalData (Zuordnung), seo-routes-rental
// (Texte/Indexierung) und legacyRedirects (301) verwendet.

export interface CategoryMeta {
  /** Anzeigename in Listen, Breadcrumbs, H1-Fallback. */
  displayName: string;
  /** Abweichender Name für Title und H1 (Keyword-Fokus). */
  seoName?: string;
  /** Pluralform für Formulierungen wie „Mietpark für …". */
  plural: string;
  /** Eigener Einleitungstext (ein Satz oder mehrere), {ort} wird ersetzt. */
  intro?: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  anhaenger: {
    displayName: "Anhänger",
    plural: "Anhänger",
    intro:
      "Anhänger von 750 bis 3.500 kg zulässigem Gesamtgewicht in {ort} – Kasten-, Koffer-, Plattform-, Motorrad- und Kippanhänger, viele Modelle mit 100 km/h-Zulassung. Welche Führerscheinklasse du brauchst, hängt vom Zugfahrzeug ab: Details dazu stehen im Ratgeber zum Anhängerführerschein B, B96 und BE.",
  },
  erdbewegung: {
    displayName: "Erdbewegung",
    plural: "Erdbewegungsmaschinen",
    intro:
      "Minibagger von 1 bis 6 Tonnen, Radlader und Dumper in {ort} – dazu Anbaugeräte mit MS01-, MS03- und MS08-Aufnahme wie Tieflöffel, Grabenräumlöffel, Kabellöffel, Hydraulikhämmer und Sortiergreifer. Passende Baumaschinenanhänger für den Transport bekommst du gleich mit.",
  },
  verdichtung: {
    displayName: "Verdichtung",
    plural: "Verdichtungsgeräte",
    intro:
      "Rüttelplatten, Stampfer und Walzen für die Bodenverdichtung in {ort} – vom leichten Gerät für Pflasterarbeiten bis zur schweren Platte für den Unterbau.",
  },
  arbeitsbuehnen: {
    displayName: "Arbeitsbühnen",
    plural: "Arbeitsbühnen",
    intro:
      "Scheren-, Teleskop- und Gelenkbühnen für Höhenarbeiten in {ort} – für Montage, Fassade, Baumpflege und Veranstaltungstechnik.",
  },
  werkzeuge: {
    displayName: "Werkzeuge",
    plural: "Werkzeuge",
    intro:
      "Elektro-, Akku- und Druckluftwerkzeuge in {ort} – Bohrhämmer, Bohrschrauber, Trennschleifer, Presslufthämmer und Spezialgeräte für Bau, Handwerk und Renovierung. Jedes Gerät ist geprüft und einsatzbereit.",
  },
  gartenpflege: {
    displayName: "Gartenpflege",
    plural: "Gartengeräte",
    intro:
      "Gartengeräte in {ort} – Vertikutierer, Häcksler, Baumstumpffräse, Bodenhacke, Rasenmäher und Laubbläser für Frühjahrsputz, Grundstückspflege und Rodung.",
  },
  "leitern-gerueste": {
    displayName: "Leitern & Gerüste",
    plural: "Leitern und Gerüste",
    intro:
      "Krause-Rollgerüste mit 3,3 bis 12,4 m Arbeitshöhe in {ort}, dazu Leitern, Belagbühnen und Gerüstteile. Schmal- und Breitaufbau stehen für enge Treppenhäuser wie für große Fassaden bereit.",
  },
  aggregate: {
    displayName: "Aggregate & Kompressoren",
    seoName: "Stromerzeuger & Kompressoren",
    plural: "Aggregate und Kompressoren",
    intro:
      "Stromerzeuger und Baukompressoren in {ort} – vom kompakten Aggregat für den Marktstand bis zum Großaggregat für Baustelle und Veranstaltung, dazu Kompressoren für Druckluftwerkzeuge.",
  },
  "kabel-stromverteiler": {
    displayName: "Kabel & Stromverteiler",
    plural: "Kabel und Stromverteiler",
    intro:
      "Stromverteiler, Anschlussschränke, CEE- und Schuko-Kabel, Adapter sowie Kabelbrücken in {ort}. Baustrom inklusive Antragstellung übernehmen wir auf Wunsch zum Festpreis.",
  },
  "heizung-trocknung": {
    displayName: "Heizung & Trocknung",
    plural: "Heiz- und Trocknungsgeräte",
    intro:
      "Bautrockner, Heizlüfter, Heizpilze und Klimageräte in {ort} – für Wasserschäden, Estrichtrocknung, Baustellenbeheizung und Außengastronomie.",
  },
  absperrtechnik: {
    displayName: "Absperr- & Verkehrstechnik",
    seoName: "Absperrtechnik",
    plural: "Absperr- und Verkehrstechnik",
    intro:
      "Verkehrszeichen, Halteverbotszonen, Bauzäune, Warnbaken und Lichtsignalanlagen in {ort}. Für Umzüge und Baustellen stellen wir die komplette Verkehrssicherung inklusive Beschilderung bereit.",
  },
  beleuchtung: {
    displayName: "Beleuchtung",
    plural: "Beleuchtung",
    intro:
      "LED-Spots, Flutlicht, Bühnenlicht und mobile Beleuchtung in {ort} – für Veranstaltungen, Baustellen und Außenbereiche.",
  },
  beschallung: {
    displayName: "Beschallung",
    plural: "Beschallungstechnik",
    intro:
      "Lautsprecher, Aktivsysteme, Mikrofone und Mischpulte in {ort} – von der kleinen Rednerbeschallung bis zur kompletten PA für Open-Air-Veranstaltungen.",
  },
  buehne: {
    displayName: "Bühne",
    plural: "Bühnen",
    intro:
      "Bühnenpodeste, Bühnenelemente und Zubehör in {ort} – frei kombinierbar für Konzerte, Reden, Modenschauen und Firmenfeiern.",
  },
  "traversen-rigging": {
    displayName: "Traversen & Rigging",
    plural: "Traversen und Rigging",
    intro:
      "Traversen, Verbinder und Rigging-Zubehör in {ort} – für Messestände, Bühnenkonstruktionen und den Aufbau von Licht- und Tontechnik.",
  },
  kommunikation: {
    displayName: "Funkgeräte",
    seoName: "Funkgeräte",
    plural: "Funkgeräte",
    intro:
      "Funkgeräte und passendes Zubehör in {ort} – für Baustellenkoordination, Veranstaltungsteams und Ordnerdienste.",
  },
  "moebel-zelte": {
    displayName: "Möbel & Zelte",
    plural: "Möbel und Zelte",
    intro:
      "Partyzelte, Bierzeltgarnituren, Stehtische, Hussen und Garderoben in {ort} – vom Gartenfest bis zum Firmenevent aus einer Hand.",
  },
  "geschirr-glaeser-besteck": {
    displayName: "Geschirr, Gläser & Besteck",
    plural: "Geschirr, Gläser und Besteck",
    intro:
      "Teller, Gläser, Tassen, Schüsseln und Besteck in {ort} – in Sets für kleine Feiern bis zur Hochzeitsgesellschaft. Rückgabe unabgespült ist möglich.",
  },
  "gastro-equipment": {
    displayName: "Gastro Equipment",
    plural: "Gastro-Geräte",
    intro:
      "Getränkekühlschränke, Eiswürfelbereiter, Fritteusen, Spülmaschinen, Warmhaltegeräte und Schwenkgrills in {ort} – für Catering, Feste und Gastronomie.",
  },
  spezialeffekte: {
    displayName: "Spezial Effekte",
    seoName: "Spezialeffekte",
    plural: "Spezialeffekte",
    intro:
      "Nebelmaschinen, Seifenblasenmaschinen, Funkeneffekte und Fotobooth in {ort} – für Bühnenshows, Hochzeiten und Firmenfeiern.",
  },
  huepfburgen: {
    displayName: "Hüpfburgen",
    plural: "Hüpfburgen",
    intro:
      "Aufblasbare Hüpfburgen und Spielgeräte in {ort} – für Kindergeburtstage, Straßenfeste und Vereinsveranstaltungen, inklusive Gebläse.",
  },
  "wohnwagen-camping": {
    displayName: "Wohnwagen & Camping",
    seoName: "Wohnwagen",
    plural: "Wohnwagen",
    intro:
      "Familientaugliche Wohnwagen mit Dusche, WC und Heizung in {ort}. Abholung am Standort, Überführung auf Anfrage.",
  },
  nutzfahrzeuge: {
    displayName: "Nutzfahrzeuge",
    seoName: "Nutzfahrzeuge & Kipper",
    plural: "Nutzfahrzeuge",
    intro:
      "Kipper, Pritschen- und Transportfahrzeuge in {ort} – für Umzug, Baustellenlogistik und Entsorgungsfahrten. Abholung am Standort, Überführung auf Anfrage.",
  },
  alle: {
    displayName: "Alle Artikel",
    plural: "Mietartikel",
  },
};

export function categoryDisplayName(catId: string): string {
  return CATEGORY_META[catId]?.displayName || catId;
}

export function categorySeoName(catId: string): string {
  const meta = CATEGORY_META[catId];
  return meta?.seoName || meta?.displayName || catId;
}

export function categoryPlural(catId: string): string {
  const meta = CATEGORY_META[catId];
  return meta?.plural || meta?.displayName || catId;
}

export function categoryIntro(catId: string, locationName: string): string | undefined {
  const intro = CATEGORY_META[catId]?.intro;
  return intro ? intro.replace(/\{ort\}/g, locationName) : undefined;
}

/** „1 Gerät" / „12 Geräte" – korrekte Grammatik statt „1 Geräte". */
export function deviceCountLabel(count: number): string {
  return count === 1 ? "1 Gerät" : `${count} Geräte`;
}

// ---------------------------------------------------------------
// 3.5 Falsch einsortierte Artikel → richtige Kategorie
// (Artikel-ID → Ziel-Kategorie; alte URL wird per 301 mitgezogen)
// ---------------------------------------------------------------
export const CATEGORY_REASSIGNMENTS: Record<string, string> = {
  "popcornmaschine-xl-profi": "gastro-equipment",
  "spuelmaschine-frontlader": "gastro-equipment",
  "bonn-spuelmaschine-gastro": "gastro-equipment",
  "buffet-tellerwaermer": "gastro-equipment",
  "bonn-buffet-tellerwaermer": "gastro-equipment",
  "einhell-laubbläser-gp-lb": "gartenpflege",
};

// ---------------------------------------------------------------
// 3.6 Doppelte Artikel: Zweitseite in „aggregate" entfällt,
// es bleibt genau EINE Produkt-URL (in „werkzeuge").
// Duplikat-ID → kanonische Artikel-ID
// ---------------------------------------------------------------
export const DUPLICATE_PRODUCT_CANONICAL: Record<string, string> = {
  "presslufthammer-tex21pe-aggregat": "presslufthammer-tex21pe",
  "erdrakete-45mm-aggregat": "erdrakete-45mm",
  "erdrakete-65mm-aggregat": "erdrakete-65mm",
  "erdrakete-75mm-aggregat": "erdrakete-75mm",
  "bonn-presslufthammer-tex21pe-aggregat": "bonn-presslufthammer-tex21pe",
  "bonn-erdrakete-45mm-aggregat": "bonn-erdrakete-45mm",
  "bonn-erdrakete-65mm-aggregat": "bonn-erdrakete-65mm",
  "bonn-erdrakete-75mm-aggregat": "bonn-erdrakete-75mm",
};

// ---------------------------------------------------------------
// 3.8 Zubehörartikel: bleiben buchbar und in der Kategorieliste,
// die Einzelseiten bekommen aber „noindex, follow" und fallen aus
// der Sitemap. Erkennung über den Artikel-Untertyp (Product.category).
// ---------------------------------------------------------------
export const ACCESSORY_SUBCATEGORIES = new Set<string>([
  "cee-kabel",
  "schuko-kabel",
  "netzwerkkabel",
  "hdmi-kabel",
  "powercon-kabel",
  "adapter",
  "kabelbruecke",
  "kabeltrommel",
  "erdung",
  "geruestteil",
  "buehnen-zubehoer",
  "traversen-zubehoer",
  "traversenverbinder",
  "husse",
  "garderobe",
  "zubehoer",
]);

/** Zusätzliche Einzelartikel, die reines Zubehör sind. */
export const ACCESSORY_PRODUCT_IDS = new Set<string>([
  "nivtec-fuesse",
  "kleiderbuegel",
  "staubsaugeraufsatz",
  "kanister",
]);

export function isAccessoryItem(
  product: { id?: string; category?: string } | undefined | null,
): boolean {
  if (!product) return false;
  if (product.id && ACCESSORY_PRODUCT_IDS.has(product.id)) return true;
  return !!product.category && ACCESSORY_SUBCATEGORIES.has(product.category);
}

// ---------------------------------------------------------------
// 3.9 Verkaufsartikel: Title und H1 ohne „mieten"
// ---------------------------------------------------------------
export const SALE_PRODUCT_IDS = new Set<string>(["blockbatterie-6v"]);

export function isSaleItem(product: { id?: string; name?: string } | undefined | null): boolean {
  if (!product) return false;
  if (product.id && SALE_PRODUCT_IDS.has(product.id)) return true;
  return !!product.name && /\(Verkauf\)/i.test(product.name);
}

// ---------------------------------------------------------------
// 3.4 Sortierung innerhalb einer Kategorie
// Explizites sortOrder gewinnt; sonst wird die führende Zahl aus dem
// Namen (kVA, kg, m, t) aufsteigend verwendet; sonst alphabetisch.
// ---------------------------------------------------------------
function leadingNumber(name: string): number | undefined {
  const m = name.match(/(\d+(?:[.,]\d+)?)\s*(kVA|kW|kg|t|m³|m|l)\b/i);
  if (!m) return undefined;
  const value = Number(m[1].replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

export function compareProductsInCategory(
  a: { name: string; sortOrder?: number },
  b: { name: string; sortOrder?: number },
): number {
  const sa = a.sortOrder ?? Number.POSITIVE_INFINITY;
  const sb = b.sortOrder ?? Number.POSITIVE_INFINITY;
  if (sa !== sb) return sa - sb;

  const na = leadingNumber(a.name);
  const nb = leadingNumber(b.name);
  if (na !== undefined && nb !== undefined && na !== nb) return na - nb;
  if (na !== undefined && nb === undefined) return -1;
  if (na === undefined && nb !== undefined) return 1;

  return a.name.localeCompare(b.name, "de");
}

/**
 * Kategorien, in denen nach Größe (kVA, kg, m, t) sortiert wird.
 * Anhänger bleiben bewusst außen vor – dort gilt die gepflegte
 * Reihenfolge nach Bauart und anschließend Gesamtgewicht.
 */
export const SORT_BY_SIZE_CATEGORIES = new Set<string>([
  "aggregate",
  "leitern-gerueste",
  "verdichtung",
  "arbeitsbuehnen",
]);

/** Ursprungskategorie der umgehängten Artikel – Basis für die 301-Regeln. */
export const CATEGORY_REASSIGNMENT_SOURCES: Record<string, string> = {
  "popcornmaschine-xl-profi": "spezialeffekte",
  "spuelmaschine-frontlader": "geschirr-glaeser-besteck",
  "bonn-spuelmaschine-gastro": "geschirr-glaeser-besteck",
  "buffet-tellerwaermer": "geschirr-glaeser-besteck",
  "bonn-buffet-tellerwaermer": "geschirr-glaeser-besteck",
  "einhell-laubbläser-gp-lb": "werkzeuge",
};

/** Kategorie, in der die entfallenen Duplikat-Zweitseiten lagen. */
export const DUPLICATE_SOURCE_CATEGORY = "aggregate";
