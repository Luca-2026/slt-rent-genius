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
 * Redirects old /kategorien-krefeld/:category to /mieten/krefeld/:category
 */
export function LegacyCategoryRedirect({ locationId }: { locationId: string }) {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!categorySlug) {
      navigate(`/mieten/${locationId}`, { replace: true });
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

    const mapped = categoryMap[categorySlug] || categorySlug;
    navigate(`/mieten/${locationId}/${mapped}`, { replace: true });
  }, [categorySlug, locationId, navigate]);

  return null;
}
