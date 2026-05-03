// Sprint 5 – Build-Time-Prerender Route Catalogue
// ---------------------------------------------------------------
// Aggregates every prerenderable route (~1.250) for the static-HTML
// generator in scripts/prerender-rental.mjs. Pure data file – no
// React, no DOM access, safe to import via vite-node at build time.

import { localAreas, type LocalArea } from "./localSeoData";
import { locationData, type LocationInfo } from "./locationData";
import { locations, type LocationData, type Product } from "./rentalData";
import { productSEOData, type ProductSEOData } from "./productSEOData";
import { blogArticles, type BlogArticle } from "./blogArticles";
import { solutionData, type Solution } from "@/pages/Loesungen";

const BASE_URL = "https://www.slt-rental.de";
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/og/default-slt-rental.png`;
const TODAY = new Date().toISOString().slice(0, 10);

// Helper: clamp title under 60 chars (soft – never strip mid-word)
function clamp(str: string, max = 60): string {
  if (!str) return str;
  if (str.length <= max) return str;
  const cut = str.slice(0, max);
  const last = cut.lastIndexOf(" ");
  return (last > 30 ? cut.slice(0, last) : cut).trim();
}

function clampDesc(str: string, max = 158): string {
  if (!str) return str;
  if (str.length <= max) return str;
  const cut = str.slice(0, max);
  const last = cut.lastIndexOf(" ");
  return ((last > 80 ? cut.slice(0, last) : cut).trim()) + "…";
}

const LOCATION_DISPLAY: Record<string, string> = {
  krefeld: "Krefeld",
  bonn: "Bonn",
  muelheim: "Mülheim an der Ruhr",
};

// ---------------------------------------------------------------
// Types
// ---------------------------------------------------------------

export type RouteType =
  | "home"
  | "page"
  | "standort"
  | "localarea"
  | "solution"
  | "category"
  | "product"
  | "ratgeber"
  | "legal";

export interface SeoRouteBreadcrumb {
  name: string;
  path: string;
}

export interface SeoRoute {
  path: string;
  title: string;
  description: string;
  h1: string;
  intro: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  noindex?: boolean;
  changefreq?: string;
  priority?: number;
  lastmod?: string;
  breadcrumbs?: SeoRouteBreadcrumb[];
  routeType: RouteType;
  // Route-type specific payloads (kept lean – only the fields the
  // schema-builder + prerender actually consume):
  productData?: PrerenderProduct;
  categoryData?: PrerenderCategory;
  localareaData?: LocalArea;
  standortData?: LocationInfo;
  solutionData?: Solution;
  ratgeberData?: BlogArticle;
}

export interface PrerenderProduct {
  id: string;
  name: string;
  description?: string;
  image?: string;
  category: string;
  locationId: string;
  hasSEO: boolean;
  seoTitle?: string;
  metaDescription?: string;
  h1?: string;
  faqs?: { q: string; a: string }[];
  modelName?: string;
}

export interface PrerenderCategory {
  category: string;
  locationId: string;
  productCount: number;
  productSummaries: Array<{ id: string; name: string; path: string }>;
}

// ---------------------------------------------------------------
// Static & top-level pages
// ---------------------------------------------------------------

const STATIC_ROUTES: SeoRoute[] = [
  {
    path: "/",
    routeType: "home",
    title: "SLT Rental – Mietpark Krefeld, Bonn, Mülheim",
    description:
      "Baumaschinen, Anhänger und Event-Equipment mieten in NRW. SLT Rental – 3 Standorte, über 350 Geräte, Lieferung im Umkreis möglich.",
    h1: "Mietpark für Baumaschinen, Anhänger & Event-Equipment in NRW",
    intro: [
      "SLT Rental vermietet Baumaschinen, Anhänger, Aggregate und Event-Equipment an drei Standorten in Nordrhein-Westfalen: Krefeld (Hauptsitz), Bonn und Mülheim an der Ruhr.",
      "Über 350 Geräte für Bau, Garten- und Landschaftsbau, Industrie und Veranstaltungen – mit Lieferung in der gesamten Region und 24/7-Buchung für Anhänger.",
    ],
    changefreq: "daily",
    priority: 1.0,
    lastmod: TODAY,
  },
  {
    path: "/mieten",
    routeType: "page",
    title: "Mieten bei SLT Rental – Standort wählen",
    description: "Wählen Sie Ihren SLT-Standort: Krefeld, Bonn oder Mülheim an der Ruhr. Mietkatalog mit Baumaschinen, Anhängern, Aggregaten und Event-Equipment.",
    h1: "Mieten bei SLT Rental",
    intro: [
      "Wählen Sie Ihren SLT-Standort, um den Mietkatalog mit allen vor Ort verfügbaren Geräten zu öffnen.",
    ],
    changefreq: "weekly",
    priority: 0.9,
    lastmod: TODAY,
  },
  {
    path: "/mietartikel",
    routeType: "page",
    title: "Mietartikel-Übersicht | SLT Rental",
    description: "Alle Mietartikel von SLT Rental im Überblick – Baumaschinen, Anhänger, Aggregate, Event-Equipment für Krefeld, Bonn und Mülheim an der Ruhr.",
    h1: "Mietartikel-Übersicht",
    intro: ["Alle Mietartikel von SLT Rental im Überblick – Baumaschinen, Anhänger, Aggregate, Event-Equipment."],
    changefreq: "weekly",
    priority: 0.7,
    lastmod: TODAY,
  },
  {
    path: "/standorte",
    routeType: "page",
    title: "Standorte – SLT Rental in NRW",
    description: "Drei SLT-Rental-Standorte in NRW: Krefeld (Hauptsitz), Bonn und Mülheim an der Ruhr. Adressen, Öffnungszeiten und Anfahrt.",
    h1: "SLT-Rental-Standorte",
    intro: [
      "SLT Rental ist mit drei Standorten in Nordrhein-Westfalen vertreten: Krefeld am Niederrhein, Bonn im Rheinland und Mülheim an der Ruhr im Ruhrgebiet.",
    ],
    changefreq: "monthly",
    priority: 0.8,
    lastmod: TODAY,
  },
  {
    path: "/loesungen",
    routeType: "page",
    title: "Lösungen – Komplettpakete von SLT Rental",
    description: "Komplettlösungen für Garten- und Landschaftsbau, Tiefbau, Events, Umzüge und private Projekte. Alles aus einer Hand mieten bei SLT Rental.",
    h1: "Komplettlösungen von SLT Rental",
    intro: [
      "Statt einzelner Maschinen: ganze Pakete für Ihr Vorhaben. Wir kombinieren Geräte, Anhänger und Zubehör für typische Einsätze in Bau, Event und Privatprojekt.",
    ],
    changefreq: "monthly",
    priority: 0.8,
    lastmod: TODAY,
  },
  {
    path: "/dienstleistungen",
    routeType: "page",
    title: "Dienstleistungen | SLT Rental",
    description: "Lieferung, Übergabe, Werkstattservice und Beratung – die Dienstleistungen rund um Ihren Mietvorgang bei SLT Rental in NRW.",
    h1: "Dienstleistungen",
    intro: ["Lieferung, Übergabe, Werkstattservice und Beratung rund um Ihren Mietvorgang."],
    changefreq: "monthly",
    priority: 0.6,
    lastmod: TODAY,
  },
  {
    path: "/lieferung",
    routeType: "page",
    title: "Lieferung – Mietgeräte direkt zur Baustelle",
    description: "SLT Rental liefert Mietgeräte zur Baustelle oder zum Veranstaltungsort. Kilometer-basierte Pauschalen, alle Standorte in NRW.",
    h1: "Lieferung",
    intro: ["Wir liefern Ihre Mietgeräte direkt zur Baustelle oder zum Veranstaltungsort – mit kalkulierbarer Kilometerpauschale."],
    changefreq: "monthly",
    priority: 0.6,
    lastmod: TODAY,
  },
  {
    path: "/so-funktionierts",
    routeType: "page",
    title: "So funktioniert's | SLT Rental",
    description: "In wenigen Schritten zur Mietreservierung bei SLT Rental – Auswahl, Anfrage, Übergabe und Rückgabe einfach erklärt.",
    h1: "So funktioniert's",
    intro: ["In wenigen Schritten zur Reservierung – wir zeigen Ihnen den Ablauf von der Anfrage bis zur Rückgabe."],
    changefreq: "monthly",
    priority: 0.5,
    lastmod: TODAY,
  },
  {
    path: "/faq",
    routeType: "page",
    title: "FAQ – Häufige Fragen | SLT Rental",
    description: "Antworten auf häufige Fragen rund um Mietverträge, Versicherung, Lieferung, Rückgabe und Zahlungsabwicklung bei SLT Rental.",
    h1: "Häufige Fragen",
    intro: ["Die wichtigsten Antworten zu Mietvertrag, Versicherung, Lieferung und Rückgabe."],
    changefreq: "monthly",
    priority: 0.5,
    lastmod: TODAY,
  },
  {
    path: "/kontakt",
    routeType: "page",
    title: "Kontakt | SLT Rental",
    description: "Kontaktieren Sie SLT Rental in Krefeld, Bonn oder Mülheim an der Ruhr – Telefon, E-Mail und Adressen aller Standorte.",
    h1: "Kontakt",
    intro: ["Erreichen Sie unsere Standorte Krefeld, Bonn und Mülheim per Telefon, E-Mail oder direkt vor Ort."],
    changefreq: "monthly",
    priority: 0.6,
    lastmod: TODAY,
  },
  {
    path: "/ueber-uns",
    routeType: "page",
    title: "Über uns | SLT Rental",
    description: "SLT Rental – seit 2016 Mietpartner für Baumaschinen, Anhänger und Event-Equipment in Nordrhein-Westfalen. Drei Standorte, Werkstatt vor Ort.",
    h1: "Über SLT Rental",
    intro: ["Seit 2016 Ihr Mietpartner in NRW – mit eigenem Maschinenpark, Werkstatt und Service-Team."],
    changefreq: "yearly",
    priority: 0.5,
    lastmod: TODAY,
  },
  {
    path: "/karriere",
    routeType: "page",
    title: "Karriere bei SLT Rental",
    description: "Stellenangebote bei SLT Rental in Krefeld, Bonn und Mülheim. Werden Sie Teil unseres Teams – Service, Werkstatt, Disposition.",
    h1: "Karriere",
    intro: ["Werden Sie Teil des SLT-Teams – aktuelle Stellen an unseren Standorten."],
    changefreq: "weekly",
    priority: 0.5,
    lastmod: TODAY,
  },
  {
    path: "/tiefpreisgarantie",
    routeType: "page",
    title: "Tiefpreisgarantie | SLT Rental",
    description: "Mit der SLT-Tiefpreisgarantie sichern Sie sich faire Mietpreise. Finden Sie ein günstigeres Angebot? Wir unterbieten es.",
    h1: "Tiefpreisgarantie",
    intro: ["Faire Mietpreise garantiert – mit der SLT-Tiefpreisgarantie."],
    changefreq: "yearly",
    priority: 0.5,
    lastmod: TODAY,
  },
  {
    path: "/verkauf",
    routeType: "page",
    title: "Maschinen-Verkauf | SLT Rental",
    description: "Neumaschinen und gebrauchte Baumaschinen kaufen bei SLT Rental. Persönliche Beratung an drei Standorten in NRW.",
    h1: "Maschinen kaufen bei SLT Rental",
    intro: ["Neu- und Gebrauchtmaschinen aus dem SLT-Bestand – mit Beratung und Inspektion."],
    changefreq: "weekly",
    priority: 0.6,
    lastmod: TODAY,
  },
  {
    path: "/verkauf/gebrauchtmaschinen",
    routeType: "page",
    title: "Gebrauchtmaschinen | SLT Used",
    description: "Geprüfte Gebrauchtmaschinen aus dem SLT-Mietpark – Bagger, Anhänger und Zubehör mit dokumentierter Wartung.",
    h1: "Gebrauchtmaschinen",
    intro: ["Geprüfte Gebrauchtmaschinen aus unserem Mietpark mit dokumentierter Wartungshistorie."],
    changefreq: "weekly",
    priority: 0.6,
    lastmod: TODAY,
  },
  {
    path: "/hilfe",
    routeType: "page",
    title: "Hilfe & Wissen | SLT Rental",
    description: "Anleitungen, Tipps und Hilfetexte rund um die Anmietung bei SLT Rental – Anhänger, Bagger, Aggregate und mehr.",
    h1: "Hilfe & Wissen",
    intro: ["Anleitungen und Tipps zur Anmietung und zum Betrieb der Geräte."],
    changefreq: "monthly",
    priority: 0.5,
    lastmod: TODAY,
  },
  {
    path: "/ratgeber",
    routeType: "page",
    title: "Ratgeber & Magazin | SLT Rental",
    description: "Praxis-Tipps, Checklisten und Wissenswertes rund ums Mieten von Baumaschinen, Anhängern und Event-Equipment in NRW.",
    h1: "Ratgeber & Magazin",
    intro: ["Praxis-Tipps und Checklisten rund ums Mieten – aktuell und aus der täglichen Praxis."],
    changefreq: "weekly",
    priority: 0.7,
    lastmod: TODAY,
  },
];

// ---------------------------------------------------------------
// Standort-Routen (3)
// ---------------------------------------------------------------

const STANDORT_ROUTES: SeoRoute[] = locationData.map((loc) => {
  const intro: string[] = [];
  if (loc.storyIntro) intro.push(loc.storyIntro);
  if (loc.storyParagraphs?.[0]) intro.push(loc.storyParagraphs[0]);
  if (intro.length === 0) intro.push(loc.description);
  return {
    path: `/standorte/${loc.id}`,
    routeType: "standort",
    standortData: loc,
    title: clamp(`SLT Rental ${loc.name} – Mietpark vor Ort`, 60),
    description: clampDesc(
      `${loc.subtitle ? loc.subtitle + " · " : ""}${loc.address}, ${loc.city}. ${loc.description}`,
    ),
    h1: loc.storyHeadline || `Standort ${loc.name}`,
    intro,
    breadcrumbs: [
      { name: "Start", path: "/" },
      { name: "Standorte", path: "/standorte" },
      { name: loc.name, path: `/standorte/${loc.id}` },
    ],
    changefreq: "monthly",
    priority: 0.9,
    lastmod: TODAY,
  };
});

// ---------------------------------------------------------------
// Mieten-Standort-Übersichten (/mieten/:locationId) – Kategorie-Hub
// Verhindert 403, weil sonst dist/mieten/<loc>/ ohne index.html bleibt.
// ---------------------------------------------------------------

const MIETEN_LOCATION_ROUTES: SeoRoute[] = (locations as LocationData[]).map((loc) => {
  const locName = LOCATION_DISPLAY[loc.id] || loc.id;
  const categoryCount = Object.keys(loc.products || {}).length;
  return {
    path: `/mieten/${loc.id}`,
    routeType: "standort" as const,
    title: clamp(`Mieten in ${locName} – Baumaschinen, Anhänger & Event | SLT Rental`, 60),
    description: clampDesc(
      `Mietpark in ${locName}: Baumaschinen, Anhänger, Werkzeuge und Event-Equipment. ${categoryCount} Kategorien direkt vor Ort buchbar.`,
    ),
    h1: `Mieten in ${locName}`,
    intro: [
      `Wähle eine Kategorie und buche dein Mietgerät direkt am Standort ${locName}.`,
    ],
    breadcrumbs: [
      { name: "Start", path: "/" },
      { name: locName, path: `/mieten/${loc.id}` },
    ],
    changefreq: "weekly",
    priority: 0.85,
    lastmod: TODAY,
  };
});

// ---------------------------------------------------------------
// LocalArea-Routen (37)
// ---------------------------------------------------------------

const LOCALAREA_ROUTES: SeoRoute[] = localAreas.map((area) => {
  const longDesc = area.longDescription || area.description;
  // Split into 2 intro paragraphs by first sentence boundary near middle
  const intro = (() => {
    if (!longDesc) return [area.description];
    if (longDesc.length < 600) return [longDesc];
    const mid = Math.floor(longDesc.length / 2);
    const splitAt = longDesc.indexOf(". ", mid);
    if (splitAt === -1) return [longDesc];
    return [longDesc.slice(0, splitAt + 1), longDesc.slice(splitAt + 2)];
  })();
  return {
    path: `/mieten-in/${area.slug}`,
    routeType: "localarea",
    localareaData: area,
    title: clamp(`Baumaschinen mieten in ${area.name} | SLT Rental`, 60),
    description: clampDesc(area.description),
    h1: `Baumaschinen, Anhänger & Equipment mieten in ${area.name}`,
    intro,
    breadcrumbs: [
      { name: "Start", path: "/" },
      { name: "Mieten in", path: "/standorte" },
      { name: area.name, path: `/mieten-in/${area.slug}` },
    ],
    changefreq: "monthly",
    priority: 0.7,
    lastmod: TODAY,
  };
});

// ---------------------------------------------------------------
// Solution-Routen
// ---------------------------------------------------------------

const SOLUTION_ROUTES: SeoRoute[] = (solutionData as Solution[]).map((sol) => ({
  path: `/loesungen/${sol.id}`,
  routeType: "solution",
  solutionData: sol,
  title: clamp(`${sol.id.replace(/-/g, " ")} – Lösung von SLT Rental`, 60),
  description: clampDesc(
    `Komplettlösung von SLT Rental für ${sol.id.replace(/-/g, " ")}. Geräte, Anhänger und Zubehör aus einer Hand mieten in Krefeld, Bonn und Mülheim.`,
  ),
  h1: `Lösung: ${sol.id.replace(/-/g, " ")}`,
  intro: [
    `Komplettlösung von SLT Rental für ${sol.id.replace(/-/g, " ")} – passende Geräte, Anhänger und Zubehör aus einer Hand. An allen drei Standorten in NRW verfügbar.`,
  ],
  breadcrumbs: [
    { name: "Start", path: "/" },
    { name: "Lösungen", path: "/loesungen" },
    { name: sol.id, path: `/loesungen/${sol.id}` },
  ],
  changefreq: "monthly",
  priority: 0.7,
  lastmod: TODAY,
}));

// ---------------------------------------------------------------
// Category & Product Routen (3 Standorte × N Kategorien × M Produkte)
// ---------------------------------------------------------------

function categoryTitleDe(catId: string): string {
  const map: Record<string, string> = {
    "anhaenger": "Anhänger",
    "erdbewegung": "Erdbewegung",
    "werkzeuge": "Werkzeuge",
    "gartenpflege": "Gartenpflege",
    "aggregate": "Aggregate",
    "arbeitsbuehnen": "Arbeitsbühnen",
    "verdichtung": "Verdichtung",
    "kabel-stromverteiler": "Kabel & Stromverteiler",
    "leitern-gerueste": "Leitern & Gerüste",
    "heizung-trocknung": "Heizung & Trocknung",
    "absperrtechnik": "Absperrtechnik",
    "beschallung": "Beschallung",
    "kommunikation": "Kommunikation",
    "beleuchtung": "Beleuchtung",
    "buehne": "Bühne",
    "traversen-rigging": "Traversen & Rigging",
    "moebel-zelte": "Möbel & Zelte",
    "geschirr-glaeser-besteck": "Geschirr, Gläser & Besteck",
    "spezialeffekte": "Spezialeffekte",
    "huepfburgen": "Hüpfburgen",
  };
  return map[catId] || catId;
}

const CATEGORY_ROUTES: SeoRoute[] = [];
const PRODUCT_ROUTES: SeoRoute[] = [];

// Sprint 6 – Aufgabe 4: Canonical-Strategie "Krefeld-First".
// Indexiere alle Krefeld-Produkte je (categoryId/productId). Bonn- und
// Mülheim-Routen, deren Produkt auch in Krefeld existiert, zeigen via
// canonical auf die Krefeld-Variante. Eigene Sortimente
// (Bonn-only, Mülheim-only) bleiben self-canonical (= kein canonical-Feld).
const KREFELD_PRODUCT_INDEX: Set<string> = (() => {
  const idx = new Set<string>();
  const krefeld = (locations as LocationData[]).find((l) => l.id === "krefeld");
  if (!krefeld) return idx;
  for (const [catId, products] of Object.entries(krefeld.products)) {
    for (const p of products ?? []) idx.add(`${catId}/${p.id}`);
  }
  return idx;
})();

for (const loc of locations as LocationData[]) {
  const locName = LOCATION_DISPLAY[loc.id] || loc.name;
  for (const [catId, products] of Object.entries(loc.products)) {
    if (!products || products.length === 0) continue;
    const catTitle = categoryTitleDe(catId);

    const productSummaries = products.slice(0, 20).map((p) => ({
      id: p.id,
      name: p.name,
      path: `/mieten/${loc.id}/${catId}/${p.id}`,
    }));

    CATEGORY_ROUTES.push({
      path: `/mieten/${loc.id}/${catId}`,
      routeType: "category",
      categoryData: {
        category: catId,
        locationId: loc.id,
        productCount: products.length,
        productSummaries,
      },
      title: clamp(`${catTitle} mieten in ${locName} | SLT Rental`, 60),
      description: clampDesc(
        `${catTitle} mieten in ${locName} bei SLT Rental. ${products.length} Geräte verfügbar – Beratung, Lieferung und Werkstattservice vor Ort.`,
      ),
      h1: `${catTitle} mieten in ${locName}`,
      intro: [
        `Mietpark für ${catTitle} am SLT-Standort ${locName}. ${products.length} Geräte sofort wählbar – mit Lieferung in der Region und persönlicher Beratung.`,
      ],
      breadcrumbs: [
        { name: "Start", path: "/" },
        { name: "Mieten", path: "/mieten" },
        { name: locName, path: `/mieten/${loc.id}` },
        { name: catTitle, path: `/mieten/${loc.id}/${catId}` },
      ],
      changefreq: "weekly",
      priority: 0.8,
      lastmod: TODAY,
    });

    for (const p of products) {
      const seo: ProductSEOData | undefined = productSEOData[p.id];
      const hasSEO = !!seo;
      const fallbackTitle = `${p.name} mieten in ${locName} | SLT Rental`;
      const title = clamp(seo?.seoTitle || fallbackTitle, 60);
      const description = clampDesc(
        seo?.metaDescription ||
          p.description ||
          `${p.name} mieten in ${locName} bei SLT Rental. Faire Mietpreise, Beratung und Lieferung in der Region.`,
      );
      const h1 = seo?.h1 || `${p.name} mieten in ${locName}`;
      const intro = [
        seo?.metaDescription ||
          p.description ||
          `${p.name} mieten am Standort ${locName} – Beratung, Übergabe und Lieferung durch SLT Rental.`,
      ];
      if (seo?.useCaseBau) intro.push(`Einsatz Bau: ${seo.useCaseBau}`);

      // Krefeld-First Canonical: Bonn/Mülheim → Krefeld, sofern dort vorhanden.
      // Krefeld-Produkte und Standort-eigene Produkte bleiben self-canonical.
      const krefeldHasIt = KREFELD_PRODUCT_INDEX.has(`${catId}/${p.id}`);
      const canonical =
        loc.id !== "krefeld" && krefeldHasIt
          ? `/mieten/krefeld/${catId}/${p.id}`
          : undefined;

      PRODUCT_ROUTES.push({
        path: `/mieten/${loc.id}/${catId}/${p.id}`,
        routeType: "product",
        productData: {
          id: p.id,
          name: p.name,
          description: p.description,
          image: p.image,
          category: catId,
          locationId: loc.id,
          hasSEO,
          seoTitle: seo?.seoTitle,
          metaDescription: seo?.metaDescription,
          h1: seo?.h1,
          faqs: seo?.faqs,
          modelName: p.modelName,
        },
        title,
        description,
        h1,
        intro,
        canonical,
        ogType: "product",
        // Products without SEO content → noindex (still rendered for SPA)
        noindex: !hasSEO,
        breadcrumbs: [
          { name: "Start", path: "/" },
          { name: "Mieten", path: "/mieten" },
          { name: locName, path: `/mieten/${loc.id}` },
          { name: catTitle, path: `/mieten/${loc.id}/${catId}` },
          { name: p.name, path: `/mieten/${loc.id}/${catId}/${p.id}` },
        ],
        changefreq: "weekly",
        priority: hasSEO ? 0.7 : 0.3,
        lastmod: TODAY,
      });
    }
  }
}

// ---------------------------------------------------------------
// Ratgeber-Routen
// ---------------------------------------------------------------

const RATGEBER_ROUTES: SeoRoute[] = (blogArticles as BlogArticle[]).map((a) => ({
  path: `/ratgeber/${a.slug}`,
  routeType: "ratgeber",
  ratgeberData: a,
  title: clamp(a.metaTitle || a.title, 60),
  description: clampDesc(a.metaDescription || a.teaser),
  h1: a.title,
  intro: [a.teaser],
  ogType: "article",
  ogImage: a.ogImage?.startsWith("http") ? a.ogImage : `${BASE_URL}${a.ogImage}`,
  breadcrumbs: [
    { name: "Start", path: "/" },
    { name: "Ratgeber", path: "/ratgeber" },
    { name: a.title, path: `/ratgeber/${a.slug}` },
  ],
  changefreq: "monthly",
  priority: 0.6,
  lastmod: a.updatedAt || a.date,
}));

// ---------------------------------------------------------------
// Legal-Routen (noindex)
// ---------------------------------------------------------------

const LEGAL_ROUTES: SeoRoute[] = [
  {
    path: "/impressum",
    routeType: "legal",
    title: "Impressum | SLT Rental",
    description: "Impressum der SLT Technology Group GmbH & Co. KG – Anbieterkennung gemäß §5 TMG.",
    h1: "Impressum",
    intro: ["Anbieterkennung gemäß §5 TMG."],
    noindex: true,
    breadcrumbs: [
      { name: "Start", path: "/" },
      { name: "Impressum", path: "/impressum" },
    ],
    changefreq: "yearly",
    priority: 0.1,
    lastmod: TODAY,
  },
  {
    path: "/datenschutz",
    routeType: "legal",
    title: "Datenschutz | SLT Rental",
    description: "Datenschutzhinweise der SLT Rental GmbH gemäß DSGVO.",
    h1: "Datenschutz",
    intro: ["Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO."],
    noindex: true,
    breadcrumbs: [
      { name: "Start", path: "/" },
      { name: "Datenschutz", path: "/datenschutz" },
    ],
    changefreq: "yearly",
    priority: 0.1,
    lastmod: TODAY,
  },
  {
    path: "/agb",
    routeType: "legal",
    title: "AGB | SLT Rental",
    description: "Allgemeine Geschäftsbedingungen der SLT Rental GmbH für Mietverträge.",
    h1: "Allgemeine Geschäftsbedingungen",
    intro: ["Vertragsbedingungen für die Anmietung von Geräten und Equipment bei SLT Rental."],
    noindex: true,
    breadcrumbs: [
      { name: "Start", path: "/" },
      { name: "AGB", path: "/agb" },
    ],
    changefreq: "yearly",
    priority: 0.1,
    lastmod: TODAY,
  },
];

// ---------------------------------------------------------------
// Final aggregate
// ---------------------------------------------------------------

export const ALL_ROUTES: SeoRoute[] = [
  ...STATIC_ROUTES,
  ...STANDORT_ROUTES,
  ...MIETEN_LOCATION_ROUTES,
  ...LOCALAREA_ROUTES,
  ...SOLUTION_ROUTES,
  ...CATEGORY_ROUTES,
  ...PRODUCT_ROUTES,
  ...RATGEBER_ROUTES,
  ...LEGAL_ROUTES,
];

export const ROUTE_STATS = {
  static: STATIC_ROUTES.length,
  standort: STANDORT_ROUTES.length,
  mietenLocation: MIETEN_LOCATION_ROUTES.length,
  localarea: LOCALAREA_ROUTES.length,
  solution: SOLUTION_ROUTES.length,
  category: CATEGORY_ROUTES.length,
  product: PRODUCT_ROUTES.length,
  productWithSEO: PRODUCT_ROUTES.filter((r) => !r.noindex).length,
  ratgeber: RATGEBER_ROUTES.length,
  legal: LEGAL_ROUTES.length,
  total: 0,
};
ROUTE_STATS.total = ALL_ROUTES.length;
