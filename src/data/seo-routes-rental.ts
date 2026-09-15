// Sprint 5 – Build-Time-Prerender Route Catalogue
// ---------------------------------------------------------------
// Aggregates every prerenderable route (~1.250) for the static-HTML
// generator in scripts/prerender-rental.mjs. Pure data file – no
// React, no DOM access, safe to import via vite-node at build time.

import { localAreas, type LocalArea } from "./localSeoData";
import { locationData, type LocationInfo } from "./locationData";
import { locations, type LocationData, type Product } from "./rentalData";
import { productSEOData, type ProductSEOData } from "./productSEOData";
import {
  locationParagraph,
  resolveAvailabilityStatus,
  availabilityParagraph,
  bookingHint,
} from "@/data/locationBlocks";
import {
  categoryDisplayName,
  categorySeoName,
  categoryPlural,
  categoryIntro,
  deviceCountLabel,
  isAccessoryItem,
  isSaleItem,
} from "./categoryModel";
import { blogArticles, getArticlesForCategory, type BlogArticle } from "./blogArticles";
import { kbArticles, kbCategories, type KBArticle, type KBCategory } from "./knowledgeBaseData";

import { solutionData, type Solution } from "@/pages/Loesungen";
import { solutionLinking } from "@/data/solutionLinking";
import { jobListings } from "@/components/karriere/jobData";
import { getLocalCategoryContent } from "./localCategoryContent";
import { getProductAvailability } from "@/lib/productAvailability";
import { getDrivingLicenseInfo, resolveProductFaqs } from "./productPageContent";
import { categoryContent as productCategoryContent } from "@/components/rental/ProductSEOContent";

const BASE_URL = "https://www.slt-rental.de";
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/og/default-slt-rental.png`;

// Schnittkanten aufräumen: keine offenen Klammern, keine hängenden Trenner
// und keine abgeschnittenen Preis-/Maßangaben ("… ab 9", "… 2,00 ×").
function tidyCut(str: string): string {
  let s = str.trim();
  // offene Klammer ohne Gegenstück → Klammerteil komplett entfernen
  const open = (s.match(/\(/g) || []).length;
  const close = (s.match(/\)/g) || []).length;
  if (open > close) s = s.slice(0, s.lastIndexOf("(")).trim();
  // hängende Zahl/Einheit ohne Bezug am Ende (z. B. "ab 9", "2,00 ×", "50 l/")
  s = s.replace(/\s+(?:ab|Ab|ca\.|bis|für)?\s*\d+(?:[.,]\d+)?\s*[×x/]?$/u, "");
  // hängende Trenner/Satzzeichen
  s = s.replace(/[\s–—\-,;:|/&·]+$/u, "");
  return s.trim();
}

// Weicher Clamp: nie mitten im Wort, Ergebnis wird aufgeräumt.
function clamp(str: string, max = 60): string {
  if (!str) return str;
  if (str.length <= max) return str;
  const cut = str.slice(0, max);
  const last = cut.lastIndexOf(" ");
  return tidyCut(last > 30 ? cut.slice(0, last) : cut);
}

function clampDesc(str: string, max = 155): string {
  if (!str) return str;
  const clean = str.replace(/[✓✔☑]/g, "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return /[.!?]$/.test(clean) ? clean : `${clean}.`;
  const sentenceEnds = [...clean.matchAll(/[.!?](?:\s|$)/g)]
    .map((match) => (match.index ?? 0) + 1)
    .filter((index) => index >= 120 && index <= max);
  if (sentenceEnds.length) return clean.slice(0, sentenceEnds[sentenceEnds.length - 1]).trim();
  const cut = clean.slice(0, max - 1);
  const last = cut.lastIndexOf(" ");
  return `${tidyCut(last > 80 ? cut.slice(0, last) : cut)}.`;
}

// Title mit Standort: Der Standort darf NIEMALS wegge-clamped werden, sonst
// entstehen identische Titles ("… mieten in | SLT Rental") über alle Standorte
// → Google wertet das als Duplicate Content. Deshalb wird nur der Name gekürzt.
function localizedTitle(name: string, locName: string, max = 60): string {
  const tail = ` mieten in ${locName}`;
  const full = `${name}${tail} | SLT Rental`;
  if (full.length <= max) return full;
  const withoutSuffix = `${name}${tail}`;
  if (withoutSuffix.length <= max) return withoutSuffix;

  const budget = max - tail.length;
  // Zuerst sinnvolle Kürzungen des Namens versuchen (statt hartem Abschneiden):
  // Klammerzusatz weg → Detail nach „–“/„,“ weg → erst dann harter Cut.
  const candidates = [
    name.replace(/\s*\([^)]*\)\s*$/u, ""),
    name.split(/\s+[–—]\s+/u)[0],
    name.split(/\s*\(/u)[0],
    name.split(",")[0],
  ]
    .map((c) => tidyCut(c))
    .filter((c) => c.length > 3);
  for (const c of candidates) {
    if (c.length <= budget) return `${c}${tail}`;
  }
  let short = name.slice(0, Math.max(budget, 0));
  const sp = short.lastIndexOf(" ");
  if (sp > 12) short = short.slice(0, sp);
  return `${tidyCut(short)}${tail}`;
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
  /** Extra JSON-LD blocks rendered verbatim (in addition to type-derived ones). */
  inlineSchemas?: Record<string, unknown>[];
  /**
   * Statisch vorgerenderte interne Linklisten (Hub-Seiten).
   * Ohne diese Blöcke sehen Crawler auf /mieten/ und /mieten/:loc/ nur H1 + Intro,
   * weil die Kacheln rein clientseitig gerendert werden.
   */
  linkSections?: Array<{
    heading: string;
    links: Array<{ name: string; path: string; note?: string }>;
  }>;
  /**
   * Statisch vorgerenderte Textblöcke (z. B. Standort-Details auf /standorte/,
   * Über-uns-Volltext). Reiner Text, damit Crawler ihn ohne JS sehen.
   */
  textSections?: Array<{ heading: string; paragraphs: string[] }>;
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
  h2s?: string[];
  useCaseBau?: string;
  useCaseEvent?: string;
  useCasePrivat?: string;
  faqs?: { q: string; a: string }[];
  modelName?: string;
  longName?: string;
  specifications?: Record<string, string>;
  pricePerDay?: string;
  pricePerMonth?: string;
  priceWeekend?: string;
  priceUnitLabel?: string;
  minRentalMonths?: number;
  availabilityText?: string;
  bookingHint?: string;
  locationText?: string;
  alternatives?: Array<{ name: string; path: string }>;
  accessories?: Array<{ name: string; path: string }>;
  guides?: Array<{ name: string; path: string }>;
  drivingLicense?: { heading: string; text: string };
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

// ---------------------------------------------------------------
// Hilfsdaten für vorgerenderte Hub-Inhalte (Etappe 2)
// Quelle ausschließlich locationData.ts / blogArticles.ts – nichts erfunden.
// ---------------------------------------------------------------

const LOC_INFO: Record<string, LocationInfo> = Object.fromEntries(
  (locationData as LocationInfo[]).map((l) => [l.id, l]),
);

/** Öffnungszeiten als Fließtext, geschlossene Tage werden weggelassen. */
function hoursLine(loc: LocationInfo | undefined): string {
  if (!loc) return "";
  return loc.hours
    .filter((h) => !/geschlossen/i.test(h.time))
    .map((h) => `${h.day} ${h.time.replace(/\*/g, "")}`)
    .join(", ");
}

/** Übergabemodus je Standort (Stammdaten-Formulierung, Etappe 2.4). */
const HANDOVER_MODE: Record<string, string> = {
  krefeld:
    "Übergabe vor Ort zu den Öffnungszeiten, Anhänger zusätzlich rund um die Uhr per Code",
  bonn: "Anhänger rund um die Uhr per Code, übrige Geräte auf Anfrage",
  muelheim: "Beratung und Übergabe vor Ort zu den Öffnungszeiten",
};

const LOCATION_IDS_ORDERED = ["krefeld", "bonn", "muelheim"];

const POPULAR_CATEGORY_IDS = [
  "anhaenger",
  "erdbewegung",
  "werkzeuge",
  "gartenpflege",
  "arbeitsbuehnen",
  "aggregate",
  "moebel-zelte",
  "huepfburgen",
];

const NEWEST_ARTICLES = [...(blogArticles as BlogArticle[])]
  .sort((a, b) => (b.updatedAt || b.date).localeCompare(a.updatedAt || a.date))
  .slice(0, 3);

function locationCardNote(locId: string): string {
  const loc = LOC_INFO[locId];
  if (!loc) return "";
  const hours = hoursLine(loc);
  return [`${loc.address}, ${loc.city}`, hours, HANDOVER_MODE[locId]]
    .filter(Boolean)
    .join(" · ");
}

function categoryLinksFor(locId: string) {
  const loc = (locations as LocationData[]).find((l) => l.id === locId);
  if (!loc) return [];
  return Object.entries(loc.products || {})
    .filter(([, products]) => Array.isArray(products) && products.length > 0)
    .map(([catId]) => ({
      name: `${categoryTitleDe(catId)} mieten in ${LOCATION_DISPLAY[locId]}`,
      path: `/mieten/${locId}/${catId}`,
    }));
}

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
    linkSections: [
      {
        heading: "Unsere Standorte",
        links: LOCATION_IDS_ORDERED.map((id) => ({
          name: `Mieten in ${LOCATION_DISPLAY[id]}`,
          path: `/mieten/${id}`,
          note: locationCardNote(id),
        })),
      },
      {
        heading: "Beliebte Kategorien",
        links: POPULAR_CATEGORY_IDS.map((catId) => ({
          name: `${categoryTitleDe(catId)} mieten`,
          path: `/mieten/krefeld/${catId}`,
        })),
      },
      {
        heading: "Ratgeber",
        links: NEWEST_ARTICLES.map((a) => ({
          name: a.title,
          path: `/ratgeber/${a.slug}`,
        })),
      },
    ],
    textSections: [
      {
        heading: "Warum SLT Rental",
        paragraphs: [
          "Anhänger rund um die Uhr per Code abholen – ohne Wartezeit und unabhängig von den Öffnungszeiten.",
          "Über 350 Geräte für Bau, Garten- und Landschaftsbau, Industrie und Veranstaltungen.",
          "Lieferung in der Region rund um Krefeld, Bonn und Mülheim an der Ruhr.",
          "Eigene Werkstatt am Hauptsitz Krefeld: gewartete, einsatzbereite Technik.",
        ],
      },
    ],
    changefreq: "daily",
    priority: 1.0,
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
    linkSections: [
      {
        heading: "Standorte",
        links: LOCATION_IDS_ORDERED.map((id) => ({
          name: `Mieten in ${LOCATION_DISPLAY[id]}`,
          path: `/mieten/${id}`,
          note: locationCardNote(id),
        })),
      },
      ...LOCATION_IDS_ORDERED.map((id) => ({
        heading: `Kategorien in ${LOCATION_DISPLAY[id]}`,
        links: categoryLinksFor(id),
      })),
    ],

    changefreq: "weekly",
    priority: 0.9,
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
    textSections: LOCATION_IDS_ORDERED.map((id) => {
      const loc = LOC_INFO[id];
      return {
        heading: `${LOCATION_DISPLAY[id]} – ${loc?.subtitle || "Standort"}`,
        paragraphs: [
          `Adresse: ${loc?.address}, ${loc?.city}`,
          `Öffnungszeiten: ${hoursLine(loc)}`,
          loc?.hoursNote ? `Hinweis: ${loc.hoursNote.replace(/^\*/, "")}` : "",
          `Übergabe: ${HANDOVER_MODE[id]}`,
          loc?.deliveryRadius?.length
            ? `Liefergebiet: ${joinCities(loc.deliveryRadius, 6)}`
            : "",
          `Anfahrt: ${loc?.mapUrl}`,
        ].filter(Boolean),
      };
    }),
    linkSections: [
      {
        heading: "Mietkatalog je Standort",
        links: LOCATION_IDS_ORDERED.map((id) => ({
          name: `Mietkatalog ${LOCATION_DISPLAY[id]}`,
          path: `/mieten/${id}`,
        })),
      },
      {
        heading: "Standortseiten",
        links: LOCATION_IDS_ORDERED.map((id) => ({
          name: `Standort ${LOCATION_DISPLAY[id]}`,
          path: `/standorte/${id}`,
        })),
      },
      {
        heading: "Orte, die wir beliefern",
        links: (localAreas as LocalArea[]).map((a) => ({
          name: `Mieten in ${a.name}`,
          path: `/mieten-in/${a.slug}`,
        })),
      },
    ],

    changefreq: "monthly",
    priority: 0.8,
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
  },
  {
    path: "/ueber-uns",
    routeType: "page",
    title: "Über uns | SLT Rental",
    description: "SLT Rental – seit 2016 Mietpartner für Baumaschinen, Anhänger und Event-Equipment in Nordrhein-Westfalen. Drei Standorte, Werkstatt vor Ort.",
    h1: "Über SLT Rental",
    intro: ["Seit 2016 Ihr Mietpartner in NRW – mit eigenem Maschinenpark, Werkstatt und Service-Team."],
    textSections: [
      {
        heading: "SLT Rental seit 2016",
        paragraphs: [
          "SLT Rental vermietet seit 2016 Baumaschinen, Anhänger, Aggregate und Event-Equipment in Nordrhein-Westfalen. Aus dem Start am Niederrhein sind drei Standorte geworden: Krefeld als Hauptsitz, Bonn und Mülheim an der Ruhr.",
          "Am Hauptsitz Krefeld-Fichtenhain liegt unser Zentrallager mit über 350 Geräten sowie unsere eigene Werkstatt. Dort werden alle Maschinen gewartet, geprüft und repariert, bevor sie wieder in die Vermietung gehen.",
          "Unser Team berät persönlich, weist vor Ort in die Geräte ein und organisiert Lieferung und Abholung in der Region. Anhänger sind zusätzlich rund um die Uhr per Code abholbar.",
        ],
      },
    ],
    linkSections: [
      {
        heading: "Weiter zu",
        links: [
          { name: "Unsere Standorte", path: "/standorte" },
          { name: "Zum Mietkatalog", path: "/mieten" },
        ],
      },
    ],

    changefreq: "yearly",
    priority: 0.5,
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
  },
  {
    path: "/verkauf",
    routeType: "page",
    title: "Maschinen-Verkauf | SLT Rental",
    description: "Neumaschinen und gebrauchte Baumaschinen kaufen bei SLT Rental. Persönliche Beratung an drei Standorten in NRW.",
    h1: "Maschinen kaufen bei SLT Rental",
    intro: ["Neu- und Gebrauchtmaschinen aus dem SLT-Bestand – mit Beratung und Inspektion."],
    // /verkauf leitet clientseitig auf /verkauf/neumaschinen/ weiter → nicht indexieren,
    // sonst meldet die Search Console "Seite mit Weiterleitung".
    noindex: true,
    changefreq: "weekly",
    priority: 0.6,
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
  },
  {
    path: "/verkauf/neumaschinen",
    routeType: "page",
    title: "Neumaschinen kaufen | SLT Rental",
    description: "Neumaschinen kaufen bei SLT Rental – Bagger, Anhänger, Aggregate und Zubehör mit Beratung und Service in NRW.",
    h1: "Neumaschinen",
    intro: ["Neumaschinen aus unserem Sortiment – mit persönlicher Beratung, Einweisung und Service-Anbindung."],
    changefreq: "weekly",
    priority: 0.6,
  },
  {
    path: "/hilfe",
    routeType: "page",
    title: "Hilfe & Wissen | SLT Rental",
    description: "Anleitungen, Tipps und Hilfetexte rund um die Anmietung bei SLT Rental – Anhänger, Bagger, Aggregate und mehr.",
    h1: "Hilfe & Wissen",
    intro: ["Anleitungen und Tipps zur Anmietung und zum Betrieb der Geräte."],
    textSections: (kbCategories as KBCategory[]).map((cat) => ({
      heading: cat.title,
      paragraphs: [
        cat.description,
        ...(kbArticles as KBArticle[])
          .filter((a) => a.categoryId === cat.id)
          .map((a) => `${a.title} – ${a.description}`),
      ].filter(Boolean),
    })),

    changefreq: "monthly",
    priority: 0.5,
  },
  {
    path: "/ratgeber",
    routeType: "page",
    title: "Ratgeber & Magazin | SLT Rental",
    description: "Praxis-Tipps, Checklisten und Wissenswertes rund ums Mieten von Baumaschinen, Anhängern und Event-Equipment in NRW.",
    h1: "Ratgeber & Magazin",
    intro: ["Praxis-Tipps und Checklisten rund ums Mieten – aktuell und aus der täglichen Praxis."],
    linkSections: [
      {
        heading: "Alle Ratgeber-Artikel",
        links: [...(blogArticles as BlogArticle[])]
          .sort((a, b) => (b.updatedAt || b.date).localeCompare(a.updatedAt || a.date))
          .map((a) => ({
            name: a.title,
            path: `/ratgeber/${a.slug}`,
            note: `${a.date} · ${a.teaser}`,
          })),
      },
    ],

    changefreq: "weekly",
    priority: 0.7,
  },
  // ---------------------------------------------------------------
  // Anbietervergleiche (statisch geprerendert wie City-Pages)
  // ---------------------------------------------------------------
  {
    path: "/vergleich",
    routeType: "page",
    title: "Anbietervergleich: SLT Rental vs. HKL, Boels, Beyer",
    description:
      "Sachlicher Vergleich von SLT Rental mit HKL, Boels Rental und Beyer-Mietservice. Standorte, Online-Buchung, Tiefpreisgarantie, Lieferung und Sortiment im Überblick.",
    h1: "SLT Rental im Vergleich zu anderen Vermietern in NRW",
    intro: [
      "Sachlicher Anbietervergleich nach objektiven, nachprüfbaren Kriterien. Drei Detailseiten vergleichen SLT Rental mit HKL Baumaschinen, Boels Rental und Beyer-Mietservice.",
    ],
    changefreq: "monthly",
    priority: 0.6,
    breadcrumbs: [
      { name: "Start", path: "/" },
      { name: "Anbietervergleich", path: "/vergleich" },
    ],
  },
  // ---------------------------------------------------------------
  // BAUMAX Service & Reparatur (Landing-Page für lokale Sichtbarkeit)
  // ---------------------------------------------------------------
  {
    path: "/service/baumax-reparatur-nrw",
    routeType: "page",
    title: "BAUMAX Reparatur & Servicebetrieb NRW – Krefeld & Bonn",
    description:
      "Autorisierter BAUMAX Fachhändler in NRW: Reparatur, Wartung, Inspektion und Original-Ersatzteile für Raddumper, Minidumper, Rüttelplatten und Stampfer in Krefeld und Bonn.",
    h1: "BAUMAX Reparatur & Servicebetrieb in NRW",
    intro: [
      "SLT Rental ist autorisierter BAUMAX Fachhändler mit eigener Werkstatt in Krefeld und Bonn – Wartung, Reparatur, Garantieabwicklung und Original-Ersatzteile für das gesamte BAUMAX-Sortiment.",
    ],
    changefreq: "monthly",
    priority: 0.7,
    breadcrumbs: [
      { name: "Start", path: "/" },
      { name: "BAUMAX Service NRW", path: "/service/baumax-reparatur-nrw" },
    ],
  },
  ...([
    {
      slug: "slt-vs-hkl",
      competitor: "HKL",
      title: "SLT Rental vs. HKL: Maschinenvermietung in NRW im Vergleich",
      description:
        "Sachlicher Vergleich von SLT Rental und HKL: Standorte in NRW, Online-Buchung, Tiefpreisgarantie, Lieferung und Gerätekategorien.",
      h1: "SLT Rental und HKL im Vergleich",
      faqs: [
        { q: "Was unterscheidet SLT Rental von HKL?", a: "SLT Rental ist ein regionaler Mietpark in Nordrhein-Westfalen mit drei Standorten in Krefeld, Bonn und Mülheim an der Ruhr und einem breiten Sortiment, das neben Baumaschinen auch Anhänger, Stromaggregate und Event-Equipment umfasst. HKL ist ein bundesweit aktiver Vermieter mit Schwerpunkt Baumaschinen und einem dichten Filialnetz." },
        { q: "Kann ich bei SLT Rental auch als Privatkunde mieten?", a: "Ja. SLT Rental vermietet an Privatkunden (B2C) und an Unternehmen (B2B). Anhänger sind 24/7 online buchbar, Baumaschinen und Eventtechnik werden über Anfrage oder den Mietkatalog reserviert." },
        { q: "Gibt es bei SLT Rental eine Tiefpreisgarantie?", a: "Ja. Finden Sie ein vergleichbares Mietangebot in der Region günstiger, unterbietet SLT Rental den Preis. Details stehen auf der Seite Tiefpreisgarantie." },
        { q: "An welchen Standorten ist SLT Rental in NRW vertreten?", a: "SLT Rental ist mit drei Standorten in Nordrhein-Westfalen vertreten: Krefeld (Hauptsitz), Bonn und Mülheim an der Ruhr. Lieferung in den Umkreis ist über alle Standorte möglich." },
      ],
    },
    {
      slug: "slt-vs-boels",
      competitor: "Boels",
      title: "SLT Rental vs. Boels: Maschinenvermietung in NRW im Vergleich",
      description:
        "Sachlicher Vergleich von SLT Rental und Boels Rental: Standorte in NRW, Online-Buchung, Tiefpreisgarantie, Lieferung und Gerätekategorien.",
      h1: "SLT Rental und Boels im Vergleich",
      faqs: [
        { q: "Was unterscheidet SLT Rental von Boels?", a: "SLT Rental ist ein regional verwurzelter Mietpark in NRW mit drei Standorten in Krefeld, Bonn und Mülheim an der Ruhr. Boels Rental ist international aufgestellt und betreibt ein dichtes Netz an Niederlassungen. SLT bietet zusätzlich Event-Equipment und 24/7-Anhängerbuchung an." },
        { q: "Kann ich bei SLT Rental auch kurzfristig mieten?", a: "Ja. Über die Online-Buchung sind Anhänger 24/7 verfügbar, viele Baumaschinen und Geräte können kurzfristig nach Verfügbarkeit reserviert werden. Telefonische Beratung läuft über die Standortteams." },
        { q: "Welche Gerätekategorien bietet SLT Rental?", a: "Baumaschinen (zum Beispiel Minibagger), Anhänger, Arbeitsbühnen, Stromaggregate und Event-Equipment. Das vollständige Sortiment finden Sie im Mietkatalog je Standort." },
        { q: "Liefert SLT Rental zur Baustelle?", a: "Ja. Die Lieferkosten werden anhand einer Kilometerpauschale kalkuliert. Auf der Seite Lieferung steht ein Rechner für eine erste Preisindikation." },
      ],
    },
    {
      slug: "slt-vs-beyer",
      competitor: "Beyer",
      title: "SLT Rental vs. Beyer: Maschinenvermietung in NRW im Vergleich",
      description:
        "Sachlicher Vergleich von SLT Rental und Beyer-Mietservice: Standorte in NRW, Online-Buchung, Tiefpreisgarantie, Lieferung und Gerätekategorien.",
      h1: "SLT Rental und Beyer-Mietservice im Vergleich",
      faqs: [
        { q: "Was unterscheidet SLT Rental von Beyer-Mietservice?", a: "SLT Rental ist ein regional aufgestellter Mietpark mit drei Standorten in NRW (Krefeld, Bonn, Mülheim an der Ruhr) und einem Sortiment, das neben Baumaschinen auch Anhänger, Stromaggregate und Event-Equipment umfasst. Beyer-Mietservice fokussiert sich auf Bau- und Industriegeräte und ist an mehreren Standorten in NRW vertreten." },
        { q: "Bietet SLT Rental auch Event-Equipment an?", a: "Ja. Zum SLT-Sortiment gehören Zelte, Bestuhlung, Stromaggregate und weitere Eventtechnik. Diese Geräte sind über den Mietkatalog der Standorte verfügbar." },
        { q: "Wie schnell kann ich Geräte bei SLT Rental bekommen?", a: "Anhänger sind 24/7 online buchbar. Für Baumaschinen und Aggregate hängt die Verfügbarkeit vom Standort und Zeitraum ab. Eine Verfügbarkeitsprüfung läuft direkt im Mietkatalog oder telefonisch über die Standortteams." },
        { q: "Gibt es eine Tiefpreisgarantie bei SLT Rental?", a: "Ja. Sollten Sie ein vergleichbares Angebot in der Region günstiger finden, unterbietet SLT Rental den Preis. Bedingungen stehen auf der Seite Tiefpreisgarantie." },
      ],
    },
  ].map((v): SeoRoute => ({
    path: `/vergleich/${v.slug}`,
    routeType: "page",
    title: v.title,
    description: v.description,
    h1: v.h1,
    intro: [
      "Sachlicher Anbietervergleich nach objektiven Kriterien. SLT Rental ist ein regionaler Mietpark in Nordrhein-Westfalen mit drei Standorten.",
    ],
    changefreq: "monthly",
    priority: 0.6,
    breadcrumbs: [
      { name: "Start", path: "/" },
      { name: "Vergleich", path: "/vergleich" },
      { name: v.competitor, path: `/vergleich/${v.slug}` },
    ],
    inlineSchemas: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: v.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Start", item: `${BASE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Vergleich", item: `${BASE_URL}/vergleich` },
          { "@type": "ListItem", position: 3, name: v.competitor, item: `${BASE_URL}/vergleich/${v.slug}` },
        ],
      },
    ],
  }))),
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
    linkSections: [
      {
        heading: `Kategorien in ${locName}`,
        links: Object.entries(loc.products || {})
          .filter(([, products]) => Array.isArray(products) && products.length > 0)
          .map(([catId]) => ({
            name: `${categoryTitleDe(catId)} mieten in ${locName}`,
            path: `/mieten/${loc.id}/${catId}`,
          })),
      },
    ],
    changefreq: "weekly",
    priority: 0.85,
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
  };
});

// ---------------------------------------------------------------
// Solution-Routen
// ---------------------------------------------------------------

/** Deutsche Anzeigenamen (Quelle: src/i18n/locales/de.json → solutions.items). */
const SOLUTION_NAMES_DE: Record<string, string> = {
  "garten-landschaftsbau": "Garten- & Landschaftsbau",
  "tiefbau-erdbewegung": "Tiefbau & Erdbewegung",
  "hochbau-renovierung": "Hochbau & Renovierung",
  "events-veranstaltungen": "Events & Veranstaltungen",
  "umzug-transport": "Umzug & Transport",
  "handwerk-gewerbe": "Handwerk & Gewerbe",
  "private-projekte": "Private Projekte",
  "kindergeburtstage": "Kindergeburtstage & Feste",
};

const SOLUTION_ROUTES: SeoRoute[] = (solutionData as Solution[]).map((sol) => {
  // Titel/Description kommen aus der zentralen, Semrush-gestützten Linkstruktur,
  // damit Prerender-HTML und Runtime-SEO identisch sind.
  const linking = solutionLinking[sol.id];
  const nameDe = SOLUTION_NAMES_DE[sol.id] || sol.id.replace(/-/g, " ");
  return {
    path: `/loesungen/${sol.id}`,
    routeType: "solution",
    solutionData: sol,
    title: clamp(linking?.seoTitle || `${nameDe} – Lösung von SLT Rental`, 65),
    description: clampDesc(
      linking?.metaDescription ||
        `Komplettlösung von SLT Rental für ${nameDe}. Geräte, Anhänger und Zubehör aus einer Hand mieten in Krefeld, Bonn und Mülheim an der Ruhr.`,
    ),
    h1: `${nameDe} – Mietlösungen von SLT Rental`,
    intro: [
      `Komplettlösung von SLT Rental für ${nameDe} – passende Geräte, Anhänger und Zubehör aus einer Hand. An allen drei Standorten in Krefeld, Bonn und Mülheim an der Ruhr verfügbar.`,
    ],
    breadcrumbs: [
      { name: "Start", path: "/" },
      { name: "Lösungen", path: "/loesungen" },
      { name: nameDe, path: `/loesungen/${sol.id}` },
    ],
    changefreq: "monthly",
    priority: 0.7,
  };
});

// ---------------------------------------------------------------
// Category & Product Routen (3 Standorte × N Kategorien × M Produkte)
// ---------------------------------------------------------------

// Anzeigenamen kommen zentral aus dem Kategorie-Datenmodell (Etappe 3.1).
function categoryTitleDe(catId: string): string {
  return categoryDisplayName(catId);
}

const CATEGORY_ROUTES: SeoRoute[] = [];
const PRODUCT_ROUTES: SeoRoute[] = [];

// Standortinfo-Lookup für lokal eindeutige Inhalte (Plan A: Self-Canonical
// pro Standort statt „Krefeld-First". Damit jede Standort-URL eindeutige,
// indexierbare Substanz bekommt – ohne Daten zu erfinden, nur reale Felder
// aus locationData.ts.)
const LOCATION_INFO_INDEX: Record<string, LocationInfo> = Object.fromEntries(
  (locationData as LocationInfo[]).map((l) => [l.id, l]),
);

function joinCities(cities: string[] | undefined, max = 5): string {
  if (!cities || cities.length === 0) return "";
  const list = cities.slice(0, max);
  if (list.length === 1) return list[0];
  return list.slice(0, -1).join(", ") + " und " + list[list.length - 1];
}

/**
 * Standortspezifische Intro-Absätze für Produkt- und Kategorieseiten.
 * Verwendet ausschließlich reale Daten aus `locationData.ts` (Adresse,
 * Lieferradius, Service-Charakter). Erzeugt pro Standort einen klar
 * unterscheidbaren Text – Voraussetzung für Self-Canonical ohne DC-Risiko.
 */
function buildLocationIntro(
  loc: LocationInfo,
  subject: string, // z.B. „Minibagger 2,5t mieten" oder „Aggregate"
  opts: { compact?: boolean } = {},
): string[] {
  const radius = joinCities(loc.deliveryRadius, 6);
  const out: string[] = [];

  if (loc.serviceCharacter === "full-warehouse") {
    out.push(
      `Standort ${loc.name}: ${subject} ist an unserem Mietpark in der ${loc.address}, ${loc.city} verfügbar – mit Übergabe vor Ort, persönlicher Einweisung und eigener Werkstatt für schnelle Service-Reaktion.`,
    );
    if (radius) {
      out.push(
        `Lieferung im Einzugsgebiet ${loc.name}: ${radius}. Auch kurzfristige Termine sind möglich – sprechen Sie uns an, wir disponieren tagesgenau aus dem ${loc.name}er Lager.`,
      );
    }
  } else if (loc.serviceCharacter === "service-handover") {
    out.push(
      `Standort ${loc.name}: ${subject} bekommen Sie über unseren Service-Standort in der ${loc.address}, ${loc.city}. Beratung, Übergabe und Rücknahme finden persönlich vor Ort statt; das Gerät disponieren wir aus unserem Zentrallager Krefeld – meist innerhalb von 24 Stunden.`,
    );
    if (radius) {
      out.push(
        `Lieferung im Einzugsgebiet ${loc.name}: ${radius}. Über die A40 erreichen wir das gesamte Ruhrgebiet schnell – ideal für Bauunternehmen, Industrie und Veranstalter, die einen festen Ansprechpartner statt anonymer Online-Abwicklung suchen.`,
      );
    }
  } else {
    // krefeld / fallback
    out.push(
      `Standort ${loc.name} (Hauptsitz): ${subject} liegt vor Ort in der ${loc.address}, ${loc.city} bereit – inklusive Werkstatt, Service-Team und Direkt-Übergabe.`,
    );
    if (radius) {
      out.push(
        `Lieferung am Niederrhein: ${radius}. Im Stadtgebiet ${loc.name} ist Lieferung und Abholung in der Regel taggleich möglich.`,
      );
    }
  }

  // Produktseiten bekommen nur EINEN Standortabsatz (Doorway-Vermeidung):
  // Adresse/Übergabe + Liefergebiet in einem Satzblock, ohne Wiederholung.
  if (opts.compact) {
    const first = out[0];
    const delivery = radius ? ` Liefergebiet ab ${loc.name}: ${radius}.` : "";
    return [`${first}${delivery}`];
  }
  return out;
}


for (const loc of locations as LocationData[]) {
  const locName = LOCATION_DISPLAY[loc.id] || loc.name;
  const locInfo = LOCATION_INFO_INDEX[loc.id];
  for (const [catId, products] of Object.entries(loc.products)) {
    if (!products || products.length === 0) continue;
    const catTitle = categoryTitleDe(catId);
    // Title/H1 nutzen den SEO-Namen (z. B. „Wohnwagen" statt „Wohnwagen & Camping"),
    // Breadcrumb und Listen bleiben beim Anzeigenamen.
    const catSeoName = categorySeoName(catId);

    // Alle Geräte prerendern (kein slice): sonst haben Produkte ab Position 21
    // keinen internen Link aus ihrer Kategorie.
    const productSummaries = products.map((p) => ({
      id: p.id,
      name: p.name,
      path: `/mieten/${loc.id}/${catId}/${p.id}`,
    }));

    // Etappe 3.2/3.3: korrekte Grammatik (1 Gerät / n Geräte, Pluralform der
    // Kategorie) plus eigener Einleitungstext je Kategorie statt Boilerplate.
    const countLabel = deviceCountLabel(products.length);
    const ownIntro = categoryIntro(catId, locName);
    const categoryIntroBase = [
      `Mietpark für ${categoryPlural(catId)} am SLT-Standort ${locName}. ${countLabel} sofort wählbar – mit Lieferung in der Region und persönlicher Beratung.`,
      ...(ownIntro ? [ownIntro] : []),
    ];
    // Etappe 4: ein einziger, zentral gepflegter Standortabsatz je Kategorie.
    const categoryLocalIntro = [
      locationParagraph(loc.id, `${catSeoName.toLowerCase()} mieten`, { categoryId: catId }),
    ].filter(Boolean);

    CATEGORY_ROUTES.push({
      path: `/mieten/${loc.id}/${catId}`,
      routeType: "category",
      categoryData: {
        category: catId,
        locationId: loc.id,
        productCount: products.length,
        productSummaries,
      },
      title: localizedTitle(catSeoName, locName),
      description: clampDesc(
        `${catSeoName} mieten in ${locName} bei SLT Rental. ${countLabel} verfügbar – ${
          loc.id === "bonn"
            ? "Anhänger rund um die Uhr per Code, übrige Geräte auf Anfrage."
            : "Beratung, Lieferung und Service vor Ort."
        }`,
      ),
      h1: `${catSeoName} mieten in ${locName}`,
      intro: [...categoryIntroBase, ...categoryLocalIntro],
      breadcrumbs: [
        { name: "Start", path: "/" },
        { name: "Mieten", path: "/mieten" },
        { name: locName, path: `/mieten/${loc.id}` },
        { name: catTitle, path: `/mieten/${loc.id}/${catId}` },
      ],
      changefreq: "weekly",
      priority: 0.8,
    });

    // Standort-Präfix für SEO-Lookup (bonn-/krefeld-/muelheim-…). Überschreibt
    // standortspezifische Varianten den kanonischen Slug. (Etappe 5b.2) Der
    // historische `mh-`-Prefix ist nach der Mülheim-Entkopplung entfernt;
    // Mülheim nutzt jetzt `muelheim-` bzw. den kanonischen Slug.
    for (const p of products) {
      const seo: ProductSEOData | undefined =
        productSEOData[`${loc.id}-${p.id}`] ?? productSEOData[p.id];
      const hasSEO = !!seo;
      // Krefeld-zentrierte SEO-Strings (seoTitle, metaDescription, h1) auf
      // den aktuellen Standort umschreiben. Ohne diesen Replace bekämen
      // Bonn/Mülheim-URLs identische Title/Description wie Krefeld und
      // würden von Google als Duplicate Content deindexiert.
      // Etappe 4.4: Nach dem Umschreiben entstehen sonst Dopplungen wie
      // „Krefeld und Krefeld" – Standortnamen danach deduplizieren.
      const dedupeLoc = (s: string) => {
        const n = locName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp(`\\b${n}\\s*(?:,|und|&|/)\\s*${n}\\b`, "gi");
        let out = s;
        let prev: string;
        do {
          prev = out;
          out = out.replace(re, locName);
        } while (out !== prev);
        return out;
      };
      const localize = (s: string | undefined) =>
        s
          ? dedupeLoc(s.replace(/\bin Krefeld\b/g, `in ${locName}`).replace(/\bKrefeld\b/g, locName))
          : s;

      // Etappe 3.9: Verkaufsartikel bekommen nie „mieten" in Title/H1.
      const isSale = isSaleItem(p);
      const saleName = p.name.replace(/\s*\(Verkauf\)\s*$/i, "").trim();
      const fallbackTitle = isSale
        ? clamp(`${saleName} kaufen in ${locName} | SLT Rental`, 60)
        : localizedTitle(p.name, locName);
      const customTitle = localize(seo?.seoTitle);
      const clampedCustom = customTitle ? clamp(customTitle, 60) : "";
      // Custom-Title nur nutzen, wenn der Standort nach dem Clampen erhalten bleibt.
      const title =
        !isSale && clampedCustom && clampedCustom.includes(locName)
          ? clampedCustom
          : fallbackTitle;

      const description = clampDesc(
        localize(seo?.metaDescription) ||
          p.description ||
          `${p.name} mieten in ${locName} bei SLT Rental. Faire Mietpreise, Beratung und Lieferung in der Region.`,
      );
      const h1 = isSale
        ? `${saleName} kaufen in ${locName}`
        : localize(seo?.h1) || `${p.name} mieten in ${locName}`;
      const locationText = locationParagraph(loc.id, `${p.name} mieten`, { categoryId: catId });
      const availStatus = resolveAvailabilityStatus(p, loc.id, { categoryId: catId });
      const availabilityText = availabilityParagraph(availStatus, loc.id);
      const availabilityBookingHint = bookingHint(availStatus);
      const localFaqs = getLocalCategoryContent(loc.id, catId)?.faqs ?? [];
      const resolvedFaqs = resolveProductFaqs({
        product: p,
        categoryId: catId,
        productFaqs: seo?.faqs,
        categoryFaqs: productCategoryContent[catId]?.faqs,
        localFaqs,
      });
      const intro = [
        localize(seo?.metaDescription) ||
          p.description ||
          `${p.name} mieten am Standort ${locName} – Beratung, Übergabe und Lieferung durch SLT Rental.`,
      ];
      const ownIndex = products.findIndex((candidate) => candidate.id === p.id);
      const neighbors = products
        .map((candidate, index) => ({ candidate, distance: Math.abs(index - ownIndex), index }))
        .filter(({ candidate }) => candidate.id !== p.id && !candidate.compatibleMachines)
        .sort((a, b) => a.distance - b.distance || a.index - b.index)
        .map(({ candidate }) => candidate);
      const manualAlternatives = (p.relatedSlugs || [])
        .map((slug) => products.find((candidate) => candidate.id === slug))
        .filter((candidate): candidate is Product => Boolean(candidate) && candidate.id !== p.id);
      const alternatives = [...manualAlternatives, ...neighbors]
        .filter((candidate, index, all) => all.findIndex((item) => item.id === candidate.id) === index)
        .slice(0, 4)
        .map((candidate) => ({
          name: candidate.modelName ? `${candidate.name} – ${candidate.modelName}` : candidate.name,
          path: `/mieten/${loc.id}/${catId}/${candidate.id}`,
        }));
      const accessories = Object.entries(loc.products)
        .flatMap(([accessoryCategory, categoryProducts]) =>
          categoryProducts
            .filter((candidate) => candidate.compatibleMachines?.includes(p.id))
            .map((candidate) => ({
              name: candidate.name,
              path: `/mieten/${loc.id}/${accessoryCategory}/${candidate.id}`,
            })),
        )
        .slice(0, 12);


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
          faqs: resolvedFaqs,
          modelName: p.modelName,
            longName: p.longName,
            specifications: p.specifications,
            pricePerDay: p.pricePerDay,
            pricePerMonth: p.pricePerMonth,
            priceWeekend: p.priceWeekend,
            priceUnitLabel: p.priceUnitLabel,
            minRentalMonths: p.minRentalMonths,
            availabilityText,
            bookingHint: availabilityBookingHint,
            locationText,
            alternatives,
            accessories,
            guides: getArticlesForCategory(catId, 3).map((article) => ({
              name: article.title,
              path: `/ratgeber/${article.slug}`,
            })),
            drivingLicense: getDrivingLicenseInfo(p, catId),
        },
        title,
        description,
        h1,
        intro,
        // canonical bewusst undefined → self-canonical via route.path
        ogType: "product",
        // OG-Image = erstes Artikelbild (absolut), sonst Default.
        ogImage: absolutizeImage(typeof p.image === "string" ? p.image : undefined),
        // Produktseiten sind indexierbar – jede Variante hat unique Title, H1,
        // Description, Intro und Breadcrumbs pro Standort. Ausnahme (Etappe 3.8):
        // reine Zubehörartikel bleiben buchbar und in der Kategorieliste,
        // ihre Einzelseiten gehen aber auf „noindex, follow".
        noindex: isAccessoryItem(p),
        breadcrumbs: [
          { name: "Start", path: "/" },
          { name: "Mieten", path: "/mieten" },
          { name: locName, path: `/mieten/${loc.id}` },
          { name: catTitle, path: `/mieten/${loc.id}/${catId}` },
          { name: p.name, path: `/mieten/${loc.id}/${catId}/${p.id}` },
        ],
        changefreq: "weekly",
        priority: hasSEO ? 0.7 : 0.5,
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
// Karriere-Stellen (Job-Detailseiten)
// ---------------------------------------------------------------

const KARRIERE_VALID_DAYS = 90;
const KARRIERE_OG_IMAGE = `${BASE_URL}/images/og/karriere-slt-rental.png`;

function buildJobPostingJsonLd(job: typeof jobListings[number], absUrl: string) {
  const datePosted = job.datePosted ?? new Date().toISOString().slice(0, 10);
  const validThrough =
    job.validThrough ??
    new Date(Date.now() + 1000 * 60 * 60 * 24 * KARRIERE_VALID_DAYS)
      .toISOString()
      .slice(0, 10);

  // Build a short HTML description from the structured fields so Google Jobs
  // gets the same content the user sees, even before React hydrates.
  const descParts: string[] = [`<p>${job.description}</p>`];
  if (job.tasks?.length) {
    descParts.push(
      `<h3>Deine Aufgaben</h3><ul>${job.tasks.map((t) => `<li>${t}</li>`).join("")}</ul>`,
    );
  }
  descParts.push(
    `<h3>Was du mitbringst</h3><ul>${job.requirements
      .map((r) => `<li>${r}</li>`)
      .join("")}</ul>`,
  );
  descParts.push(
    `<h3>Was wir bieten</h3><ul>${job.benefits.map((b) => `<li>${b}</li>`).join("")}</ul>`,
  );
  const descriptionHtml = descParts.join("");

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: descriptionHtml,
    datePosted,
    validThrough,
    employmentType: job.employmentType,
    hiringOrganization: {
      "@type": "Organization",
      name: "SLT Rental",
      sameAs: BASE_URL,
      logo: `${BASE_URL}/images/og/default-slt-rental.png`,
    },
    identifier: {
      "@type": "PropertyValue",
      name: "SLT Rental",
      value: job.id,
    },
    directApply: true,
    url: absUrl,
    jobLocation: job.locations.map((loc) => ({
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: loc.street,
        addressLocality: loc.city,
        postalCode: loc.postalCode,
        addressRegion: loc.region ?? "NRW",
        addressCountry: "DE",
      },
    })),
  };
  if (job.industry) data.industry = job.industry;
  if (job.remote) {
    data.jobLocationType = "TELECOMMUTE";
    data.applicantLocationRequirements = { "@type": "Country", name: "DE" };
  }
  if (job.salaryMin && job.salaryMax) {
    data.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "EUR",
      value: {
        "@type": "QuantitativeValue",
        minValue: job.salaryMin,
        maxValue: job.salaryMax,
        unitText: job.salaryUnit ?? "YEAR",
      },
    };
  }
  return data;
}

const KARRIERE_ROUTES: SeoRoute[] = jobListings.map((job) => {
  const path = `/karriere/${job.slug}/`;
  const absUrl = `${BASE_URL}${path}`;
  const title = clamp(job.seoTitle ?? `${job.title} – Job in ${job.location} | SLT Rental`, 65);
  const description = clampDesc(
    job.seoDescription ??
      `${job.title} bei SLT Rental in ${job.location}. ${job.shortPitch ?? "Jetzt direkt online bewerben."}`,
  );

  const inlineSchemas: Record<string, unknown>[] = [
    buildJobPostingJsonLd(job, absUrl),
  ];
  if (job.faqs?.length) {
    inlineSchemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: job.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  return {
    path,
    routeType: "page",
    title,
    description,
    h1: job.title,
    intro: [job.shortPitch ?? job.description].filter(Boolean) as string[],
    canonical: path,
    ogType: "article",
    ogImage: KARRIERE_OG_IMAGE,
    breadcrumbs: [
      { name: "Start", path: "/" },
      { name: "Karriere", path: "/karriere" },
      { name: job.title, path },
    ],
    changefreq: "weekly",
    priority: 0.6,
    // Authoritative page-specific timestamp: Datum der (Neu-)Veröffentlichung der Stelle.
    lastmod: job.datePosted,
    inlineSchemas,
  };
});

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
  },
  {
    path: "/datenschutz",
    routeType: "legal",
    title: "Datenschutz | SLT Rental",
    description: "Datenschutzhinweise der SLT Technology Group GmbH & Co. KG gemäß DSGVO.",
    h1: "Datenschutz",
    intro: ["Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO."],
    noindex: true,
    breadcrumbs: [
      { name: "Start", path: "/" },
      { name: "Datenschutz", path: "/datenschutz" },
    ],
    changefreq: "yearly",
    priority: 0.1,
  },
  {
    path: "/agb",
    routeType: "legal",
    title: "AGB | SLT Rental",
    description: "Allgemeine Geschäftsbedingungen der SLT Technology Group GmbH & Co. KG für Mietverträge.",
    h1: "Allgemeine Geschäftsbedingungen",
    intro: ["Vertragsbedingungen für die Anmietung von Geräten und Equipment bei SLT Rental."],
    noindex: true,
    breadcrumbs: [
      { name: "Start", path: "/" },
      { name: "AGB", path: "/agb" },
    ],
    changefreq: "yearly",
    priority: 0.1,
  },
];

// ---------------------------------------------------------------
// Used-Machine builder (data fetched at build-time in exportRoutes.ts)
// ---------------------------------------------------------------

export interface UsedMachineSeoInput {
  slug: string;
  manufacturer: string;
  model: string;
  year?: number | null;
  hours?: number | null;
  location?: string | null;
  price_net?: number | null;
  price_on_request?: boolean;
  images?: string[] | null;
  updated_at?: string | null;
}

export function buildUsedMachineRoute(m: UsedMachineSeoInput): SeoRoute {
  const path = `/verkauf/gebrauchtmaschinen/${m.slug}`;
  const locLabel = m.location ? LOCATION_DISPLAY[m.location] || m.location : "";
  const priceStr =
    !m.price_on_request && m.price_net
      ? `${new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(Number(m.price_net))} netto`
      : "Preis auf Anfrage";
  const title = clamp(`${m.manufacturer} ${m.model} gebraucht kaufen | SLT Used`, 65);
  const description = clampDesc(
    `${m.manufacturer} ${m.model}${m.year ? `, Bj. ${m.year}` : ""}${
      m.hours != null ? `, ${m.hours} Bh` : ""
    } – geprüfte Gebrauchtmaschine aus dem SLT-Mietpark${
      locLabel ? `, Standort ${locLabel}` : ""
    }. ${priceStr}.`,
  );
  const ogImage =
    Array.isArray(m.images) && m.images.length > 0
      ? m.images[0]
      : `${BASE_URL}/images/og/default-slt-rental.png`;
  return {
    path,
    routeType: "page",
    title,
    description,
    h1: `${m.manufacturer} ${m.model}`,
    intro: [
      `${m.manufacturer} ${m.model}${m.year ? `, Baujahr ${m.year}` : ""}${
        m.hours != null ? `, ${m.hours.toLocaleString("de-DE")} Betriebsstunden` : ""
      }.`,
      `Geprüfte Gebrauchtmaschine aus dem SLT-Mietpark mit dokumentierter Wartungshistorie. ${priceStr}.`,
    ],
    canonical: path,
    ogType: "product",
    ogImage,
    breadcrumbs: [
      { name: "Start", path: "/" },
      { name: "Verkauf", path: "/verkauf" },
      { name: "Gebrauchtmaschinen", path: "/verkauf/gebrauchtmaschinen" },
      { name: `${m.manufacturer} ${m.model}`, path },
    ],
    changefreq: "weekly",
    priority: 0.6,
    lastmod: m.updated_at ? m.updated_at.slice(0, 10) : undefined,
  };
}

// ---------------------------------------------------------------
// New-Machine builder (data fetched at build-time in exportRoutes.ts)
// ---------------------------------------------------------------

export interface NewMachineSeoInput {
  slug: string;
  brand: string;
  model: string;
  name?: string | null;
  category?: string | null;
  price_gross?: number | null;
  price_on_request?: boolean;
  vat_rate?: number | null;
  short_description?: string | null;
  images?: string[] | null;
  updated_at?: string | null;
}

function absolutizeImage(img: string | null | undefined): string {
  if (!img) return DEFAULT_OG_IMAGE;
  if (img.startsWith("http")) return img;
  return `${BASE_URL}${img.startsWith("/") ? "" : "/"}${img}`;
}

export function buildNewMachineRoute(m: NewMachineSeoInput): SeoRoute {
  const path = `/verkauf/neumaschinen/${m.slug}`;
  const priceStr =
    !m.price_on_request && m.price_gross
      ? `${new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(Number(m.price_gross))} brutto`
      : "Preis auf Anfrage";
  const title = clamp(`${m.brand} ${m.model} kaufen | Neumaschine – SLT Rental`, 65);
  const description = clampDesc(
    m.short_description ||
      `${m.brand} ${m.model} – Neumaschine bei SLT Rental. ${priceStr}.`,
  );
  const ogImage = absolutizeImage(
    Array.isArray(m.images) && m.images.length > 0 ? m.images[0] : null,
  );
  return {
    path,
    routeType: "page",
    title,
    description,
    h1: `${m.brand} ${m.model}`,
    intro: [
      m.short_description ||
        `${m.brand} ${m.model} – fabrikneue Maschine bei SLT Rental.`,
      `${priceStr}. Persönliche Beratung & Service vor Ort.`,
    ],
    canonical: path,
    ogType: "product",
    ogImage,
    breadcrumbs: [
      { name: "Start", path: "/" },
      { name: "Verkauf", path: "/verkauf" },
      { name: "Neumaschinen", path: "/verkauf/neumaschinen" },
      { name: `${m.brand} ${m.model}`, path },
    ],
    changefreq: "weekly",
    priority: 0.6,
    lastmod: m.updated_at ? m.updated_at.slice(0, 10) : undefined,
  };
}

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
  ...KARRIERE_ROUTES,
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
  karriere: KARRIERE_ROUTES.length,
  legal: LEGAL_ROUTES.length,
  total: 0,
};
ROUTE_STATS.total = ALL_ROUTES.length;
