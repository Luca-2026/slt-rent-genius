import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  keywords?: string;
}

const BASE_URL = "https://www.slt-rental.de";
const DEFAULT_OG_IMAGE = "https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png";

export function SEO({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noIndex = false,
  jsonLd,
  keywords,
}: SEOProps) {
  const fullTitle = title.includes("SLT Rental") ? title : `${title} | SLT Rental`;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:site_name" content="SLT Rental" />
      <meta property="og:locale" content="de_DE" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

// Reusable JSON-LD for SLT Rental business
export const SLT_ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "SLT Rental",
  legalName: "SLT Technology Group GmbH & Co. KG",
  url: "https://www.slt-rental.de",
  logo: DEFAULT_OG_IMAGE,
  description: "Baumaschinen, Anhänger und Event-Equipment mieten in NRW. 3 Standorte in Krefeld, Bonn und Mülheim an der Ruhr.",
  telephone: "+49 2151 417 99 02",
  email: "mieten@slt-rental.de",
  foundingDate: "2016",
  areaServed: {
    "@type": "GeoCircle",
    geoMidpoint: { "@type": "GeoCoordinates", latitude: 51.3388, longitude: 6.5853 },
    geoRadius: "50000",
  },
  address: [
    {
      "@type": "PostalAddress",
      streetAddress: "Anrather Straße 291",
      addressLocality: "Krefeld",
      postalCode: "47807",
      addressCountry: "DE",
    },
    {
      "@type": "PostalAddress",
      streetAddress: "Siemensstraße 20",
      addressLocality: "Bonn",
      postalCode: "53121",
      addressCountry: "DE",
    },
    {
      "@type": "PostalAddress",
      streetAddress: "Düsseldorfer Straße 60",
      addressLocality: "Mülheim an der Ruhr",
      postalCode: "45481",
      addressCountry: "DE",
    },
  ],
  sameAs: ["https://www.facebook.com/slt-rental"],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "07:30",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "08:00",
      closes: "14:30",
    },
  ],
};

export const SLT_BREADCRUMB_JSONLD = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: `https://www.slt-rental.de${item.url}`,
  })),
});
