import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resolveLegacyCategory, resolveLegacyProduct } from "@/data/legacyRedirects";

/**
 * Redirects old /produkte/:productSlug URLs to the best matching target
 * (product page → category → location hub). Shares its logic with the
 * server-side 301 rules generated from src/data/legacyRedirects.ts.
 */
export function LegacyProductRedirect() {
  const { productSlug } = useParams<{ productSlug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const target = resolveLegacyProduct(productSlug || "");
    navigate(target.path, { replace: true });
  }, [productSlug, navigate]);

  return null;
}

/**
 * Redirects old /produkte-{location}/:productSlug to the matching new URL.
 */
export function LegacyLocationProductRedirect({ locationId }: { locationId: string }) {
  const { productSlug } = useParams<{ productSlug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const target = resolveLegacyProduct(productSlug || "", locationId);
    navigate(target.path, { replace: true });
  }, [productSlug, locationId, navigate]);

  return null;
}

/**
 * Redirects old /kategorien-{loc}/:category and /kategorie/:compound
 * to /mieten/:loc/:category.
 */
export function LegacyCategoryRedirect({ locationId }: { locationId: string }) {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const target = resolveLegacyCategory(categorySlug || "", locationId);
    navigate(target.path, { replace: true });
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
