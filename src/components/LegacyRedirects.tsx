import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductWithContext, locations, productCategories } from "@/data/rentalData";

/**
 * Redirects old /produkte/:productSlug URLs to new /mieten/:location/:category/:product
 * Also handles old /produkte/:category routes by checking if slug matches a category first.
 */
export function LegacyProductRedirect() {
  const { productSlug } = useParams<{ productSlug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!productSlug) {
      navigate("/mieten", { replace: true });
      return;
    }

    // Check if this is actually an old category slug (e.g. /produkte/arbeitsbuehnen)
    const isCategory = productCategories.some((c) => c.id === productSlug);
    if (isCategory) {
      navigate(`/mieten/krefeld/${productSlug}`, { replace: true });
      return;
    }

    // Try to find the product by ID across all locations
    const ctx = getProductWithContext(productSlug);
    if (ctx) {
      navigate(`/mieten/${ctx.locationId}/${ctx.categoryId}/${ctx.product.id}`, { replace: true });
      return;
    }

    // Try normalised matching (handle umlaut differences like "bühne" vs "buhne")
    const normalised = productSlug.toLowerCase();
    for (const location of locations) {
      for (const [categoryId, products] of Object.entries(location.products)) {
        const found = products.find((p) => {
          const pid = p.id.toLowerCase();
          const norm = (s: string) => s.replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss");
          return pid === normalised || norm(pid) === norm(normalised);
        });
        if (found) {
          navigate(`/mieten/${location.id}/${categoryId}/${found.id}`, { replace: true });
          return;
        }
      }
    }

    // Fallback: redirect to rental start
    navigate("/mieten", { replace: true });
  }, [productSlug, navigate]);

  return null;
}

/**
 * Redirects old /produkte-{location}/:productSlug to new /mieten/:location/:category/:product
 */
export function LegacyLocationProductRedirect({ locationId }: { locationId: string }) {
  const { productSlug } = useParams<{ productSlug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!productSlug) {
      navigate(`/mieten/${locationId}`, { replace: true });
      return;
    }

    // Search in the specific location first
    const location = locations.find((l) => l.id === locationId);
    if (location) {
      for (const [categoryId, products] of Object.entries(location.products)) {
        const found = products.find((p) => p.id.toLowerCase() === productSlug.toLowerCase());
        if (found) {
          navigate(`/mieten/${locationId}/${categoryId}/${found.id}`, { replace: true });
          return;
        }
      }
    }

    // Fallback: try all locations
    const ctx = getProductWithContext(productSlug);
    if (ctx) {
      navigate(`/mieten/${ctx.locationId}/${ctx.categoryId}/${ctx.product.id}`, { replace: true });
      return;
    }

    navigate(`/mieten/${locationId}`, { replace: true });
  }, [productSlug, locationId, navigate]);

  return null;
}

/**
 * Redirects old /kategorien-{loc}/:category and /kategorie/:compound to /mieten/:loc/:category
 * Detects location prefix in compound slugs like "bonn-anhaenger" or "krefeld-huepfburgen"
 */
export function LegacyCategoryRedirect({ locationId }: { locationId: string }) {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!categorySlug) {
      navigate(`/mieten/${locationId}`, { replace: true });
      return;
    }

    let slug = categorySlug;
    let resolvedLocation = locationId;

    // Detect and strip location prefix (e.g. "bonn-anhaenger" → location=bonn, slug=anhaenger)
    const locationPrefixes: Record<string, string> = {
      "krefeld-": "krefeld",
      "bonn-": "bonn",
      "muelheim-": "muelheim",
      "duisburg-": "muelheim",
    };
    for (const [prefix, locId] of Object.entries(locationPrefixes)) {
      if (slug.toLowerCase().startsWith(prefix)) {
        resolvedLocation = locId;
        slug = slug.substring(prefix.length);
        break;
      }
    }

    // Remove trailing suffixes like "Zus" or other junk
    slug = slug.replace(/Zus$/i, "").toLowerCase();

    // Handle "alle-produkte" or "alle" → redirect to location overview
    if (slug === "alle-produkte" || slug === "alle") {
      navigate(`/mieten/${resolvedLocation}`, { replace: true });
      return;
    }

    // Map old category names to new ones
    const categoryMap: Record<string, string> = {
      "rigging": "traversen-rigging",
      "buehnen": "buehne",
      "anhaenger": "anhaenger",
      "arbeitsbuehnen": "arbeitsbuehnen",
      "erdbewegung": "erdbewegung",
      "werkzeuge": "werkzeuge",
      "aggregate": "aggregate",
      "beleuchtung": "beleuchtung",
      "beschallung": "beschallung",
      "heizung-trocknung": "heizung-trocknung",
      "absperrtechnik": "absperrtechnik",
      "kommunikation": "kommunikation",
      "verdichtung": "verdichtung",
      "kabel-stromverteiler": "kabel-stromverteiler",
      "leitern-gerueste": "leitern-gerueste",
      "moebel-zelte": "moebel-zelte",
      "geschirr-glaeser-besteck": "geschirr-glaeser-besteck",
      "spezialeffekte": "spezialeffekte",
      "huepfburgen": "huepfburgen",
      "gartenpflege": "gartenpflege",
    };

    const mapped = categoryMap[slug] || slug;
    navigate(`/mieten/${resolvedLocation}/${mapped}`, { replace: true });
  }, [categorySlug, locationId, navigate]);

  return null;
}

/**
 * Redirects /mieten/:locationId/alle to /mieten/:locationId
 */
export function LegacyAlleRedirect() {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/mieten/${locationId || ""}`, { replace: true });
  }, [locationId, navigate]);

  return null;
}
