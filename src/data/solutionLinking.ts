/**
 * Interne Linkstruktur & SEO-Metadaten der Lösungsseiten (/loesungen/:id).
 *
 * Ziel: Jede Lösungsseite verlinkt kontextuell auf
 *  - konkrete Mietartikel (immer über die Standort-Vorabfrage, weil ein
 *    Artikel je Standort eine eigene URL hat),
 *  - passende Ratgeber-Artikel (redaktionelle Tiefe, Topical Authority),
 *  - thematisch verwandte Lösungsseiten (Silo-Struktur statt Zufallsauswahl).
 *
 * Keywords stammen aus Semrush (Datenbank DE, Stand 09/2026) – siehe
 * `primaryKeyword` / `keywordVolume` je Lösung. Titles/Descriptions sind
 * darauf ausgerichtet. Alle hier hinterlegten Slugs werden durch
 * `src/test/solutionLinks.test.ts` gegen die echten Routen geprüft.
 */

export interface SolutionProductLink {
  /** Kategorie-ID der Route /mieten/:location/:category/:slug */
  categoryId: string;
  /** Produkt-ID / Slug innerhalb der Kategorie */
  slug: string;
  /** Ankertext – enthält bewusst das Money-Keyword ("… mieten") */
  label: string;
}

export interface SolutionLinking {
  primaryKeyword: string;
  /** Monatliches Suchvolumen laut Semrush (DE) */
  keywordVolume: number;
  seoTitle: string;
  metaDescription: string;
  /** Top-Mietartikel dieser Lösung (Standortabfrage vorgeschaltet) */
  productLinks: SolutionProductLink[];
  /** Ratgeber-Slugs aus src/data/blogArticles.ts */
  guides: string[];
  /** Verwandte Lösungs-IDs aus src/pages/Loesungen.tsx */
  relatedSolutions: string[];
}

export const solutionLinking: Record<string, SolutionLinking> = {
  "tiefbau-erdbewegung": {
    primaryKeyword: "baumaschinen mieten",
    keywordVolume: 2400,
    seoTitle: "Baumaschinen mieten für Tiefbau & Erdbewegung | SLT Rental",
    metaDescription:
      "Baumaschinen mieten in NRW: Minibagger, Radlader, Rüttelplatten und Absperrtechnik für Kanalbau, Hausanschlüsse und Erdarbeiten. Standorte Krefeld, Bonn & Mülheim an der Ruhr.",
    productLinks: [
      { categoryId: "erdbewegung", slug: "bobcat-e10z", label: "1t Minibagger mieten" },
      { categoryId: "erdbewegung", slug: "minibagger-2-7t", label: "2,7t Minibagger mieten" },
      { categoryId: "erdbewegung", slug: "kramer-5045", label: "3t Radlader mieten" },
      { categoryId: "verdichtung", slug: "ruettelplatte-vp25-50", label: "Rüttelplatte mieten" },
      { categoryId: "absperrtechnik", slug: "halteverbotsschilder-set", label: "Halteverbotsschilder mieten" },
      { categoryId: "anhaenger", slug: "baumaschinen-3500", label: "Baumaschinenanhänger mieten" },
    ],
    guides: [
      "minibagger-mieten-ohne-fuehrerschein",
      "baustelle-innenstadt-baumaschine-beengte-verhaeltnisse",
      "halteverbotszone-einrichten-ratgeber",
    ],
    relatedSolutions: ["hochbau-renovierung", "garten-landschaftsbau", "handwerk-gewerbe"],
  },

  "hochbau-renovierung": {
    primaryKeyword: "arbeitsbühne mieten",
    keywordVolume: 4400,
    seoTitle: "Arbeitsbühne & Gerüst mieten für Hochbau | SLT Rental",
    metaDescription:
      "Arbeitsbühne, Rollgerüst, Bautrockner und Profi-Werkzeug mieten für Neubau, Sanierung und Ausbau. Beratung zur Arbeitshöhe, 3 Standorte in NRW, Tiefpreisgarantie.",
    productLinks: [
      { categoryId: "arbeitsbuehnen", slug: "scherenbuehne-8m", label: "7,8 m Scherenarbeitsbühne mieten" },
      { categoryId: "arbeitsbuehnen", slug: "scherenbuehne-12m", label: "11,8 m Scherenarbeitsbühne mieten" },
      { categoryId: "arbeitsbuehnen", slug: "gelenkteleskopsteiger-12m", label: "12 m Gelenkteleskopsteiger mieten" },
      { categoryId: "leitern-gerueste", slug: "rollgeruest-krause-6-4m", label: "Rollgerüst 6,4 m mieten" },
      { categoryId: "heizung-trocknung", slug: "bautrockner-kt553", label: "Bautrockner mieten" },
    ],
    guides: [
      "arbeitsbuehne-mieten-typ-arbeitshoehe",
      "baustelle-innenstadt-baumaschine-beengte-verhaeltnisse",
      "wochenendtarif-vs-tagesmiete",
    ],
    relatedSolutions: ["tiefbau-erdbewegung", "handwerk-gewerbe", "umzug-transport"],
  },

  "garten-landschaftsbau": {
    primaryKeyword: "gartengeräte mieten",
    keywordVolume: 1300,
    seoTitle: "Gartengeräte & Gartenmaschinen mieten in NRW | SLT Rental",
    metaDescription:
      "Gartengeräte mieten: Erdbohrer, Häcksler, Minibagger, Rüttelplatte und Anhänger für Garten- und Landschaftsbau. Vom Privatgarten bis zur Parkanlage, 3 Standorte in NRW.",
    productLinks: [
      { categoryId: "gartenpflege", slug: "erdbohrer-benzin", label: "Benzin-Erdbohrer mieten" },
      { categoryId: "gartenpflege", slug: "haecksler-ls95-gx", label: "Benzin-Häcksler mieten" },
      { categoryId: "erdbewegung", slug: "bobcat-e10z", label: "1t Minibagger mieten" },
      { categoryId: "verdichtung", slug: "ruettelplatte-vp1550w", label: "Rüttelplatte 97 kg mieten" },
      { categoryId: "anhaenger", slug: "kasten-laubgitter-1300", label: "Kastenanhänger mit Laubgitter mieten" },
    ],
    guides: [
      "minibagger-mieten-ohne-fuehrerschein",
      "anhaenger-richtig-beladen-ladung-sichern",
      "wochenendtarif-vs-tagesmiete",
    ],
    relatedSolutions: ["tiefbau-erdbewegung", "private-projekte", "handwerk-gewerbe"],
  },

  "events-veranstaltungen": {
    primaryKeyword: "partyzelt mieten",
    keywordVolume: 2900,
    seoTitle: "Partyzelt, Technik & Geschirr mieten für Events | SLT Rental",
    metaDescription:
      "Eventausstattung mieten in NRW: Partyzelte, Bierzeltgarnituren, Geschirr, PA-Anlagen und Lichttechnik für Hochzeit, Firmenfeier und Festival – inklusive Auf- und Abbauservice.",
    productLinks: [
      { categoryId: "moebel-zelte", slug: "partyzelt-4x8m", label: "Partyzelt 4x8 m mieten" },
      { categoryId: "moebel-zelte", slug: "eventzelt-6x12m", label: "Eventzelt 6x12 m mieten" },
      { categoryId: "moebel-zelte", slug: "bierzeltgarnitur-set", label: "Bierzeltgarnitur mieten" },
      { categoryId: "geschirr-glaeser-besteck", slug: "teller-simply-25-10er", label: "Teller & Geschirr mieten" },
      { categoryId: "beschallung", slug: "soundsystem-2-1-1400w", label: "PA-Anlage mieten" },
      { categoryId: "beleuchtung", slug: "led-beleuchtungsset-duo", label: "LED-Lichtanlage mieten" },
    ],
    guides: [
      "partyzelt-mieten-groesse-genehmigung",
      "geschirr-mieten-hochzeit-mengen-checkliste",
      "halteverbotszone-einrichten-ratgeber",
    ],
    relatedSolutions: ["kindergeburtstage", "private-projekte", "umzug-transport"],
  },

  "umzug-transport": {
    primaryKeyword: "anhänger mieten",
    keywordVolume: 12100,
    seoTitle: "Anhänger mieten für Umzug & Transport in NRW | SLT Rental",
    metaDescription:
      "Anhänger mieten für Umzug und Transport: Kasten-, Planen-, Koffer- und Autotransportanhänger. 24/7 Abholung per E-Mail-Code an 3 Standorten in NRW, faire Preise.",
    productLinks: [
      { categoryId: "anhaenger", slug: "kasten-laubgitter-750", label: "750 kg Kastenanhänger mieten" },
      { categoryId: "anhaenger", slug: "planen-l-750", label: "Planenanhänger L mieten" },
      { categoryId: "anhaenger", slug: "koffer-1500", label: "1500 kg Kofferanhänger mieten" },
      { categoryId: "anhaenger", slug: "autotransport-2700", label: "Autotransporter mieten" },
      { categoryId: "anhaenger", slug: "plattform-3500", label: "3500 kg Plattformanhänger mieten" },
    ],
    guides: [
      "anhaenger-24-stunden-mieten-email-code",
      "anhaenger-fuehrerschein-b-b96-be",
      "anhaenger-richtig-beladen-ladung-sichern",
      "halteverbotszone-einrichten-ratgeber",
    ],
    relatedSolutions: ["private-projekte", "hochbau-renovierung", "tiefbau-erdbewegung"],
  },

  "handwerk-gewerbe": {
    primaryKeyword: "werkzeug mieten",
    keywordVolume: 590,
    seoTitle: "Werkzeug, Stromerzeuger & Heizgeräte mieten | SLT Rental",
    metaDescription:
      "Profi-Werkzeug mieten für Handwerk und Gewerbe: Bohrhämmer, Stromerzeuger, Kompressoren, Heizlüfter und Rollgerüste. Tagesmiete oder Wochenendtarif, 3 Standorte in NRW.",
    productLinks: [
      { categoryId: "werkzeuge", slug: "bosch-bohrhammer-gbh18v-26f", label: "Akku-Bohrhammer mieten" },
      { categoryId: "aggregate", slug: "aggregat-7-5kva", label: "7,5 kVA Stromerzeuger mieten" },
      { categoryId: "aggregate", slug: "kompressor-2m3-bobcat-pa72", label: "2 m³ Kompressor mieten" },
      { categoryId: "heizung-trocknung", slug: "heizluefter-9kw", label: "9 kW Heizlüfter mieten" },
      { categoryId: "leitern-gerueste", slug: "rollgeruest-krause-4-4m", label: "Rollgerüst 4,4 m mieten" },
    ],
    guides: [
      "wochenendtarif-vs-tagesmiete",
      "arbeitsbuehne-mieten-typ-arbeitshoehe",
      "baustelle-innenstadt-baumaschine-beengte-verhaeltnisse",
    ],
    relatedSolutions: ["hochbau-renovierung", "tiefbau-erdbewegung", "garten-landschaftsbau"],
  },

  "private-projekte": {
    primaryKeyword: "geräte mieten privat",
    keywordVolume: 0,
    seoTitle: "Geräte & Anhänger mieten für private Projekte | SLT Rental",
    metaDescription:
      "Für Heimwerker: Anhänger, Häcksler, Bohrhammer, Rüttelplatte und Minibagger mieten – ohne Gewerbenachweis, mit Wochenendtarif. Standorte Krefeld, Bonn & Mülheim an der Ruhr.",
    productLinks: [
      { categoryId: "anhaenger", slug: "kasten-laubgitter-750", label: "750 kg Kastenanhänger mieten" },
      { categoryId: "gartenpflege", slug: "haecksler-axt25tc", label: "Elektro-Häcksler mieten" },
      { categoryId: "werkzeuge", slug: "bosch-bohrhammer-gbh18v-26f", label: "Akku-Bohrhammer mieten" },
      { categoryId: "verdichtung", slug: "ruettelplatte-vp1550w", label: "Rüttelplatte 97 kg mieten" },
      { categoryId: "erdbewegung", slug: "bobcat-e10z", label: "1t Minibagger mieten" },
    ],
    guides: [
      "minibagger-mieten-ohne-fuehrerschein",
      "anhaenger-fuehrerschein-b-b96-be",
      "wochenendtarif-vs-tagesmiete",
    ],
    relatedSolutions: ["garten-landschaftsbau", "umzug-transport", "kindergeburtstage"],
  },

  kindergeburtstage: {
    primaryKeyword: "hüpfburg mieten",
    keywordVolume: 9900,
    seoTitle: "Hüpfburg mieten für den Kindergeburtstag in NRW | SLT Rental",
    metaDescription:
      "Hüpfburg mieten für Kindergeburtstag und Familienfest: Hüpfburgen, Wasserrutschen, Partyzelt, Popcornmaschine und Musikanlage. Lieferung in Krefeld, Bonn & Mülheim an der Ruhr.",
    productLinks: [
      { categoryId: "huepfburgen", slug: "huepfburg-clown", label: "Hüpfburg Clown mieten" },
      { categoryId: "huepfburgen", slug: "huepfburg-rollercoaster-1", label: "Hüpfburg Rollercoaster mieten" },
      { categoryId: "huepfburgen", slug: "huepfburg-wasserpark", label: "Wasserrutsche mieten" },
      { categoryId: "moebel-zelte", slug: "partyzelt-4x6m", label: "Partyzelt 4x6 m mieten" },
      { categoryId: "spezialeffekte", slug: "popcornmaschine-xl-profi", label: "Popcornmaschine mieten" },
      { categoryId: "beschallung", slug: "soundsystem-2-1-1400w", label: "Musikanlage mieten" },
    ],
    guides: ["partyzelt-mieten-groesse-genehmigung", "geschirr-mieten-hochzeit-mengen-checkliste"],
    relatedSolutions: ["events-veranstaltungen", "private-projekte", "garten-landschaftsbau"],
  },
};
