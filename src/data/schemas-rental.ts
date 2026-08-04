// Sprint 5 – Schema-Builder for Build-Time-Prerender
// ---------------------------------------------------------------
// Pure data functions that emit JSON-LD blocks per route type.
// No React, no runtime fetch – safe to invoke from vite-node.
// Mülheim is differentiated as "service-handover" / Bobcat-Filiale.
//
// IMPORTANT: aggregateRating values come from the real Google Reviews cache
// (google_reviews_cache table). Never invent review counts or ratings.
// Krefeld: 5.0 / 207 | Bonn: 4.9 / 105 | Mülheim: shares Krefeld data.

import type {
  SeoRoute,
  PrerenderProduct,
  PrerenderCategory,
} from "./seo-routes-rental";
import type { LocalArea } from "./localSeoData";
import type { LocationInfo } from "./locationData";
import type { Solution } from "@/pages/Loesungen";
import type { BlogArticle } from "./blogArticles";
const BASE_URL = "https://www.slt-rental.de";
const DEFAULT_IMG = `${BASE_URL}/images/og/default-slt-rental.png`;

type JsonLd = Record<string, unknown>;

// ---------------------------------------------------------------
// Reusable references
// ---------------------------------------------------------------

const ORG_ID = `${BASE_URL}/#organization`;
const WEBSITE_ID = `${BASE_URL}/#website`;

const LOCATION_DETAILS: Record<string, {
  id: string;
  name: string;
  street: string;
  postalCode: string;
  city: string;
  cityFull: string;
  phone: string;
  email: string;
  geo: { latitude: number; longitude: number };
  description: string;
  isMuelheim?: boolean;
}> = {
  krefeld: {
    id: "krefeld",
    name: "SLT Rental – Krefeld (Hauptsitz)",
    street: "Anrather Straße 291",
    postalCode: "47807",
    city: "Krefeld",
    cityFull: "Krefeld",
    phone: "+49 2151 4179904",
    email: "krefeld@slt-rental.de",
    geo: { latitude: 51.3388, longitude: 6.5853 },
    description:
      "Hauptsitz von SLT Rental am Niederrhein. Komplettes Mietsortiment, eigene Werkstatt und Disposition für die Standorte Bonn und Mülheim.",
  },
  bonn: {
    id: "bonn",
    name: "SLT Rental – Bonn",
    street: "Drachenburgstraße 8",
    postalCode: "53179",
    city: "Bonn",
    cityFull: "Bonn",
    phone: "+49 228 50466061",
    email: "bonn@slt-rental.de",
    geo: { latitude: 50.6879, longitude: 7.1534 },
    description:
      "SLT-Rental-Filiale im Rheinland mit eigenem Sortiment für Tiefbau, Sanierung, Garten- und Landschaftsbau sowie Veranstaltungstechnik.",
  },
  muelheim: {
    id: "muelheim",
    name: "SLT Rental – Mülheim an der Ruhr",
    street: "Ruhrorter Str. 122",
    postalCode: "45478",
    city: "Mülheim an der Ruhr",
    cityFull: "Mülheim an der Ruhr",
    phone: "+49 2151 4179904",
    email: "muelheim@slt-rental.de",
    geo: { latitude: 51.4181, longitude: 6.8807 },
    description:
      "Service-Standort von SLT Rental in der Bobcat-Filiale Mülheim. Beratung, Übergabe und Rücknahme von Mietgeräten. Disposition aus dem SLT-Zentrallager in Krefeld.",
    isMuelheim: true,
  },
};

const LOCATION_BUSINESS_ID = (locId: string) =>
  `${BASE_URL}/standorte/${locId}#localbusiness`;

// Real Google Reviews data – sourced from realGoogleReviews.ts (snapshot of
// google_reviews_cache table). Never invent values.
import { REAL_LOCATION_REVIEWS } from "./realGoogleReviews";
const LOCATION_RATINGS = REAL_LOCATION_REVIEWS;

function localBusiness(locId: string): JsonLd {
  const loc = LOCATION_DETAILS[locId];
  if (!loc) return {};
  const hours = loc.isMuelheim
    ? [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          opens: "00:00",
          closes: "23:59",
        },
      ]
    : loc.id === "krefeld"
    ? [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "08:00",
          closes: "18:00",
        },
        { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "10:00", closes: "14:30" },
      ]
    : loc.id === "bonn"
    ? [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "07:00",
          closes: "18:00",
        },
        { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "08:00", closes: "17:30" },
      ]
    : [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "07:30",
          closes: "18:00",
        },
        { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "08:00", closes: "14:30" },
      ];
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": LOCATION_BUSINESS_ID(loc.id),
    name: loc.name,
    legalName: "SLT Technology Group GmbH & Co. KG",
    url: abs(`/standorte/${loc.id}`),
    logo: DEFAULT_IMG,
    image: DEFAULT_IMG,
    description: loc.description,
    telephone: loc.phone,
    email: loc.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: loc.street,
      postalCode: loc.postalCode,
      addressLocality: loc.cityFull,
      addressRegion: "NRW",
      addressCountry: "DE",
    },
    geo: { "@type": "GeoCoordinates", latitude: loc.geo.latitude, longitude: loc.geo.longitude },
    openingHoursSpecification: hours,
    priceRange: "€€",
    areaServed: [
      { "@type": "City", name: loc.cityFull },
      { "@type": "AdministrativeArea", name: "Nordrhein-Westfalen" },
    ],
    // sameAs: nur verifizierte Profile. Facebook ist real (siehe Footer).
    // TODO: Sobald die echten URLs vorliegen, hier Trustpilot- und sellwerk-Profil
    // je Standort ergänzen, z.B. "https://de.trustpilot.com/review/slt-rental.de"
    // und das jeweilige sellwerk-Profil pro Standort.
    sameAs: ["https://www.facebook.com/sltrental"],
    parentOrganization: { "@id": ORG_ID },
  };
}

// ---------------------------------------------------------------
// Breadcrumbs
// ---------------------------------------------------------------

// Kanonische URL-Form der Website: immer mit abschließendem Slash.
// Ohne Slash liefert Apache einen 301 → Google meldet "Seite mit Weiterleitung".
function abs(path: string): string {
  if (!path) return `${BASE_URL}/`;
  if (/^https?:/i.test(path)) return path;
  const [pure, hash] = path.split("#");
  const withSlash = pure.endsWith("/") || /\.[a-zA-Z0-9]+$/.test(pure) ? pure : `${pure}/`;
  return `${BASE_URL}${withSlash}${hash ? `#${hash}` : ""}`;
}

function breadcrumbList(items: Array<{ name: string; path: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

// ---------------------------------------------------------------
// Per-route builders
// ---------------------------------------------------------------

export function buildHomeSchemas(): JsonLd[] {
  return [
    localBusiness("krefeld"),
    localBusiness("bonn"),
    localBusiness("muelheim"),
    breadcrumbList([{ name: "Start", path: "/" }]),
  ];
}

export function buildStandortSchemas(loc: LocationInfo | undefined): JsonLd[] {
  if (!loc) return [];
  return [
    localBusiness(loc.id),
    breadcrumbList([
      { name: "Start", path: "/" },
      { name: "Standorte", path: "/standorte" },
      { name: loc.name, path: `/standorte/${loc.id}` },
    ]),
  ];
}

export function buildLocalAreaSchemas(area: LocalArea | undefined): JsonLd[] {
  if (!area) return [];
  const desc = area.longDescription || area.description;
  return [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `Baumaschinen- und Geräteverleih in ${area.name}`,
      serviceType: "Equipment rental",
      provider: { "@id": ORG_ID },
      areaServed: { "@type": "City", name: area.name },
      description: desc,
      url: abs(`/mieten-in/${area.slug}`),
    },
    breadcrumbList([
      { name: "Start", path: "/" },
      { name: "Mieten in", path: "/standorte" },
      { name: area.name, path: `/mieten-in/${area.slug}` },
    ]),
  ];
}

export function buildSolutionSchemas(sol: Solution | undefined): JsonLd[] {
  if (!sol) return [];
  return [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: sol.id.replace(/-/g, " "),
      serviceType: "Equipment rental package",
      provider: { "@id": ORG_ID },
      areaServed: ["Krefeld", "Bonn", "Mülheim an der Ruhr", "Nordrhein-Westfalen"],
      url: abs(`/loesungen/${sol.id}`),
    },
    breadcrumbList([
      { name: "Start", path: "/" },
      { name: "Lösungen", path: "/loesungen" },
      { name: sol.id, path: `/loesungen/${sol.id}` },
    ]),
  ];
}

export function buildCategorySchemas(cat: PrerenderCategory | undefined): JsonLd[] {
  if (!cat) return [];
  const loc = LOCATION_DETAILS[cat.locationId];
  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${cat.category} mieten in ${loc?.cityFull || cat.locationId}`,
      url: abs(`/mieten/${cat.locationId}/${cat.category}`),
      isPartOf: { "@id": WEBSITE_ID },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${cat.category} – Mietkatalog ${loc?.cityFull || cat.locationId}`,
      numberOfItems: cat.productCount,
      itemListElement: cat.productSummaries.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.name,
        url: abs(p.path),
      })),
    },
    breadcrumbList([
      { name: "Start", path: "/" },
      { name: "Mieten", path: "/mieten" },
      { name: loc?.cityFull || cat.locationId, path: `/mieten/${cat.locationId}` },
      { name: cat.category, path: `/mieten/${cat.locationId}/${cat.category}` },
    ]),
  ];
}

export function buildProductSchemas(p: PrerenderProduct | undefined): JsonLd[] {
  if (!p) return [];
  const loc = LOCATION_DETAILS[p.locationId];
  const localizeFaqText = (text: string): string => {
    const locationEmail = loc?.email;
    if (!locationEmail) return text;
    return text
      .replace(/Genehmigungs-Kopie an die jeweilige Standort-E-Mail senden \(krefeld@\/bonn@\/muelheim@slt-rental\.de\)/gi, `Genehmigungs-Kopie an ${locationEmail} senden`)
      .replace(/Genehmigungs-Kopie an mieten@slt-rental\.de/gi, `Genehmigungs-Kopie an ${locationEmail}`)
      .replace(/Genehmigungs-Kopie an (?:krefeld|bonn|muelheim)@slt-rental\.de/gi, `Genehmigungs-Kopie an ${locationEmail}`)
      .replace(/an mieten@slt-rental\.de gesendet/gi, `an ${locationEmail} gesendet`)
      .replace(/an (?:krefeld|bonn|muelheim)@slt-rental\.de gesendet/gi, `an ${locationEmail} gesendet`);
  };
  const productUrl = abs(`/mieten/${p.locationId}/${p.category}/${p.id}`);
  const image = p.image
    ? p.image.startsWith("http")
      ? p.image
      : `${BASE_URL}${p.image}`
    : DEFAULT_IMG;

  const locRating = LOCATION_RATINGS[p.locationId];

  const product: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description || `${p.name} mieten bei SLT Rental ${loc?.cityFull || ""}`.trim(),
    image,
    url: productUrl,
    brand: p.modelName ? { "@type": "Brand", name: p.modelName.split(" ")[0] } : undefined,
    model: p.modelName,
    aggregateRating: locRating
      ? {
          "@type": "AggregateRating",
          ratingValue: locRating.ratingValue,
          reviewCount: locRating.reviewCount,
          bestRating: "5",
          worstRating: "1",
        }
      : undefined,
    review: locRating?.reviews?.length
      ? locRating.reviews.map((r) => ({
          "@type": "Review",
          author: { "@type": "Person", name: r.author },
          reviewRating: {
            "@type": "Rating",
            ratingValue: String(r.rating),
            bestRating: "5",
            worstRating: "1",
          },
          reviewBody: r.text,
          datePublished: r.datePublished,
        }))
      : undefined,
  };

  // strip undefineds to keep JSON tidy
  Object.keys(product).forEach((k) => product[k] === undefined && delete product[k]);

  const out: JsonLd[] = [
    product,
    localBusiness(p.locationId),
  ];

  if (p.faqs && p.faqs.length > 0) {
    out.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: p.faqs.map((f) => ({
        "@type": "Question",
        name: localizeFaqText(f.q),
        acceptedAnswer: { "@type": "Answer", text: localizeFaqText(f.a) },
      })),
    });
  }

  out.push(
    breadcrumbList([
      { name: "Start", path: "/" },
      { name: "Mieten", path: "/mieten" },
      { name: loc?.cityFull || p.locationId, path: `/mieten/${p.locationId}` },
      { name: p.category, path: `/mieten/${p.locationId}/${p.category}` },
      { name: p.name, path: `/mieten/${p.locationId}/${p.category}/${p.id}` },
    ]),
  );
  return out;
}

/**
 * Extrahiert HowTo-Steps aus einem Ratgeber-Markdown, wenn dort
 * nummerierte Schritt-Headings (### 1. Title, ### 2. ...) vorhanden sind.
 * Liefert null zurück, wenn keine Schrittstruktur erkennbar ist – dann
 * wird kein HowTo-Schema ausgespielt (vermeidet erfundene Strukturen).
 */
function extractHowToSteps(content: string): { name: string; text: string }[] | null {
  if (!content) return null;
  const stepRe = /^###\s+(\d+)\.\s+(.+)$/gm;
  const matches: { idx: number; num: number; name: string; pos: number; end: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = stepRe.exec(content)) !== null) {
    matches.push({
      idx: matches.length,
      num: parseInt(m[1], 10),
      name: m[2].trim(),
      pos: m.index,
      end: m.index + m[0].length,
    });
  }
  if (matches.length < 3) return null;
  // Validiere fortlaufende Nummerierung (1,2,3,...)
  for (let i = 0; i < matches.length; i++) {
    if (matches[i].num !== i + 1) return null;
  }
  return matches.map((step, i) => {
    const nextPos = matches[i + 1]?.pos ?? content.length;
    const body = content
      .slice(step.end, nextPos)
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      // strip markdown noise
      .map((l) => l.replace(/^[-*]\s+/, "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[(.+?)\]\((.+?)\)/g, "$1").replace(/`(.+?)`/g, "$1"))
      .join(" ");
    return { name: step.name, text: body.slice(0, 500) || step.name };
  });
}

function buildArticleAuthor(authorName: string | undefined): JsonLd {
  const name = authorName?.trim() || "SLT Rental";
  if (name === "SLT Rental") {
    return { "@type": "Organization", name, "@id": ORG_ID };
  }
  return { "@type": "Person", name };
}

export function buildRatgeberSchemas(a: BlogArticle | undefined): JsonLd[] {
  if (!a) return [];
  const url = abs(`/ratgeber/${a.slug}`);
  const image = a.ogImage?.startsWith("http") ? a.ogImage : `${BASE_URL}${a.ogImage}`;
  const wordCount = (a.content || "").trim().split(/\s+/).filter(Boolean).length;
  const keywords = (a.keyword || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const out: JsonLd[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: a.title,
      description: a.metaDescription || a.teaser,
      image: { "@type": "ImageObject", url: image },
      author: buildArticleAuthor(a.author),
      publisher: { "@id": ORG_ID },
      datePublished: a.date,
      dateModified: a.updatedAt || a.date,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      inLanguage: "de-DE",
      articleSection: a.category,
      ...(keywords.length ? { keywords } : {}),
      ...(wordCount ? { wordCount } : {}),
      url,
    },
  ];

  const steps = extractHowToSteps(a.content || "");
  if (steps && steps.length) {
    out.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: a.title,
      description: a.metaDescription || a.teaser,
      image: { "@type": "ImageObject", url: image },
      totalTime: undefined, // bewusst leer – nicht erfinden
      step: steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
        url: `${url}#schritt-${i + 1}`,
      })),
    });
  }

  out.push(
    breadcrumbList([
      { name: "Start", path: "/" },
      { name: "Ratgeber", path: "/ratgeber" },
      { name: a.title, path: `/ratgeber/${a.slug}` },
    ]),
  );
  return out;
}

export function buildLegalSchemas(route: SeoRoute): JsonLd[] {
  return route.breadcrumbs ? [breadcrumbList(route.breadcrumbs)] : [];
}

export function buildPageSchemas(route: SeoRoute): JsonLd[] {
  return route.breadcrumbs ? [breadcrumbList(route.breadcrumbs)] : [];
}

// ---------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------

export function resolveRouteSchemas(route: SeoRoute): JsonLd[] {
  let base: JsonLd[];
  switch (route.routeType) {
    case "home":
      base = buildHomeSchemas();
      break;
    case "standort":
      base = buildStandortSchemas(route.standortData);
      break;
    case "localarea":
      base = buildLocalAreaSchemas(route.localareaData);
      break;
    case "solution":
      base = buildSolutionSchemas(route.solutionData);
      break;
    case "category":
      base = buildCategorySchemas(route.categoryData);
      break;
    case "product":
      base = buildProductSchemas(route.productData);
      break;
    case "ratgeber":
      base = buildRatgeberSchemas(route.ratgeberData);
      break;
    case "legal":
      base = buildLegalSchemas(route);
      break;
    case "page":
    default:
      base = buildPageSchemas(route);
  }
  if (route.inlineSchemas?.length) {
    base = [...base, ...route.inlineSchemas];
  }
  return base;
}

// Global schemas (rendered once on every page from index.html template,
// kept here so the prerender can serialize them too if the template gets
// stripped down later).
export function buildGlobalSchemas(): JsonLd[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": ORG_ID,
      name: "SLT Rental",
      legalName: "SLT Technology Group GmbH & Co. KG",
      url: BASE_URL,
      logo: DEFAULT_IMG,
      // TODO: Trustpilot- und sellwerk-Profil ergänzen, sobald URLs vorliegen.
      sameAs: ["https://www.facebook.com/sltrental"],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: BASE_URL,
      name: "SLT Rental",
      publisher: { "@id": ORG_ID },
      inLanguage: "de-DE",
    },
  ];
}
