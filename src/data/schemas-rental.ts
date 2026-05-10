// Sprint 5 – Schema-Builder for Build-Time-Prerender
// ---------------------------------------------------------------
// Pure data functions that emit JSON-LD blocks per route type.
// No React, no runtime fetch – safe to invoke from vite-node.
// Mülheim is differentiated as "service-handover" / Bobcat-Filiale.

import type {
  SeoRoute,
  PrerenderProduct,
  PrerenderCategory,
} from "./seo-routes-rental";
import type { LocalArea } from "./localSeoData";
import type { LocationInfo } from "./locationData";
import type { Solution } from "@/pages/Loesungen";
import type { BlogArticle } from "./blogArticles";
import {
  buildCampingCategorySchemas,
  buildCaraOneProductSchemas,
} from "./camping-content";

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
    url: `${BASE_URL}/standorte/${loc.id}`,
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
    parentOrganization: { "@id": ORG_ID },
  };
}

// ---------------------------------------------------------------
// Breadcrumbs
// ---------------------------------------------------------------

function breadcrumbList(items: Array<{ name: string; path: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${BASE_URL}${it.path}`,
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
      url: `${BASE_URL}/mieten-in/${area.slug}`,
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
      url: `${BASE_URL}/loesungen/${sol.id}`,
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
      url: `${BASE_URL}/mieten/${cat.locationId}/${cat.category}`,
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
        url: `${BASE_URL}${p.path}`,
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
  const productUrl = `${BASE_URL}/mieten/${p.locationId}/${p.category}/${p.id}`;
  const image = p.image
    ? p.image.startsWith("http")
      ? p.image
      : `${BASE_URL}${p.image}`
    : DEFAULT_IMG;

  const offer: JsonLd = {
    "@type": "Offer",
    availability: "https://schema.org/InStock",
    priceCurrency: "EUR",
    url: productUrl,
    availableAtOrFrom: { "@id": LOCATION_BUSINESS_ID(p.locationId) },
  };
  if (loc?.isMuelheim) {
    offer.description =
      "Verfügbar am Service-Standort Mülheim. Disposition aus dem Zentrallager Krefeld.";
  }

  const product: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description || `${p.name} mieten bei SLT Rental ${loc?.cityFull || ""}`.trim(),
    image,
    url: productUrl,
    brand: p.modelName ? { "@type": "Brand", name: p.modelName.split(" ")[0] } : undefined,
    model: p.modelName,
    offers: offer,
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
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
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

export function buildRatgeberSchemas(a: BlogArticle | undefined): JsonLd[] {
  if (!a) return [];
  const url = `${BASE_URL}/ratgeber/${a.slug}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: a.title,
      description: a.metaDescription || a.teaser,
      image: a.ogImage?.startsWith("http") ? a.ogImage : `${BASE_URL}${a.ogImage}`,
      author: { "@type": "Organization", name: a.author || "SLT Rental", "@id": ORG_ID },
      publisher: { "@id": ORG_ID },
      datePublished: a.date,
      dateModified: a.updatedAt || a.date,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      url,
    },
    breadcrumbList([
      { name: "Start", path: "/" },
      { name: "Ratgeber", path: "/ratgeber" },
      { name: a.title, path: `/ratgeber/${a.slug}` },
    ]),
  ];
}

export function buildLegalSchemas(route: SeoRoute): JsonLd[] {
  return route.breadcrumbs ? [breadcrumbList(route.breadcrumbs)] : [];
}

export function buildPageSchemas(route: SeoRoute): JsonLd[] {
  // Custom JSON-LD for flat /camping URLs
  if (route.path === "/camping" || route.path === "/camping/weinsberg-caraone-480-qdk") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const m = require("./camping-content");
    const extra: JsonLd[] =
      route.path === "/camping"
        ? m.buildCampingCategorySchemas()
        : m.buildCaraOneProductSchemas();
    return route.breadcrumbs ? [breadcrumbList(route.breadcrumbs), ...extra] : extra;
  }
  return route.breadcrumbs ? [breadcrumbList(route.breadcrumbs)] : [];
}

// ---------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------

export function resolveRouteSchemas(route: SeoRoute): JsonLd[] {
  switch (route.routeType) {
    case "home":
      return buildHomeSchemas();
    case "standort":
      return buildStandortSchemas(route.standortData);
    case "localarea":
      return buildLocalAreaSchemas(route.localareaData);
    case "solution":
      return buildSolutionSchemas(route.solutionData);
    case "category":
      return buildCategorySchemas(route.categoryData);
    case "product":
      return buildProductSchemas(route.productData);
    case "ratgeber":
      return buildRatgeberSchemas(route.ratgeberData);
    case "legal":
      return buildLegalSchemas(route);
    case "page":
    default:
      return buildPageSchemas(route);
  }
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
      sameAs: ["https://www.facebook.com/slt-rental"],
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
