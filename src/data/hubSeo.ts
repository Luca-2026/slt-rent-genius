// Gemeinsame SEO-Texte für Startseite und Standort-Hubs.
// Wird von den React-Seiten UND vom Prerender (seo-routes-rental.ts) gelesen,
// damit initiales HTML und gerenderte Seite denselben Titel/H1/Description haben.

export const HOME_SEO = {
  title: "Baumaschinen & Equipment mieten in NRW | SLT Rental",
  description:
    "Baumaschinen, Anhänger & Event-Equipment mieten in NRW – Krefeld, Bonn & Mülheim. Über 1.700 Mietprodukte, Tiefpreisgarantie und Wochenendtarife.",
  /** Entspricht hero.title + " " + hero.titleHighlight (de.json). */
  h1: "Baumaschinen, Anhänger und Eventausstattung mieten – heute in NRW.",
} as const;

export const LOCATION_HUB_SEO_DESCRIPTIONS: Record<string, { de: string; en: string }> = {
  krefeld: {
    de: "Baumaschinen & Anhänger mieten in Krefeld ✓ Minibagger, Arbeitsbühnen, Event-Equipment ✓ 24/7 Anhänger-Abholung ✓ Tiefpreisgarantie",
    en: "Rent construction equipment & trailers in Krefeld ✓ Mini excavators, aerial platforms, event equipment ✓ 24/7 trailer pickup ✓ Fair rental prices",
  },
  bonn: {
    de: "Baumaschinen & Equipment mieten in Bonn ✓ Minibagger, Anhänger, Arbeitsbühnen, Hüpfburgen ✓ Lieferung auf die Baustelle ✓ Tiefpreisgarantie",
    en: "Rent construction equipment in Bonn ✓ Mini excavators, trailers, aerial platforms ✓ Delivery to your site ✓ Weekend rates available",
  },
  muelheim: {
    de: "Baumaschinen mieten in Mülheim an der Ruhr ✓ Bobcat-Bagger, Dumper, Radlader ✓ Erdbewegung ✓ Tiefpreisgarantie ✓ Lieferung im Ruhrgebiet",
    en: "Rent construction equipment in Mülheim an der Ruhr ✓ Bobcat excavators, dumpers, wheel loaders ✓ Professional earthmoving ✓ Delivery in the Ruhr area",
  },
};

// SEO-optimized title tags
export const LOCATION_HUB_SEO_TITLES: Record<string, { de: string; en: string }> = {
  krefeld: {
    de: "Baumaschinen & Anhänger mieten in Krefeld",
    en: "Rent Equipment & Trailers in Krefeld",
  },
  bonn: {
    de: "Baumaschinen & Equipment mieten in Bonn",
    en: "Rent Equipment in Bonn – Best Price Guarantee",
  },
  muelheim: {
    de: "Baumaschinen mieten in Mülheim an der Ruhr",
    en: "Rent Construction Equipment in Mülheim an der Ruhr",
  },
};


/** Standortnamen immer ausgeschrieben (nie nur „Mülheim“). */
const LOCATION_FULL_NAMES: Record<string, string> = {
  krefeld: "Krefeld",
  bonn: "Bonn",
  muelheim: "Mülheim an der Ruhr",
};

export function locationHubTitle(id: string, lang: "de" | "en" = "de"): string {
  const t = LOCATION_HUB_SEO_TITLES[id];
  return `${t?.[lang] || t?.de || `Equipment mieten in ${LOCATION_FULL_NAMES[id] ?? id}`} | SLT Rental`;
}

export function locationHubH1(id: string): string {
  return `Baumaschinen & Equipment mieten in ${LOCATION_FULL_NAMES[id] ?? id}`;
}
