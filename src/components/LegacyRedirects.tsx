import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import { buildLegacyRedirectRules, resolveLegacyCategory, resolveLegacyProduct } from "@/data/legacyRedirects";
import { getManagedProductsCache, getManagedProductsCacheStatus, useManagedProductsVersion } from "@/data/managedProductsCache";
import { productPath } from "../../supabase/functions/_shared/product-url-history";
import NotFound from "@/pages/NotFound";
const knownLegacySources = new Set(buildLegacyRedirectRules().map(r => r.from.replace(/\/+$/, "")));

function useVerifiedLegacyProduct(slug: string, locationId?: string): string | null {
  useManagedProductsVersion();
  if (getManagedProductsCacheStatus() !== "loaded") return null;
  if (!knownLegacySources.has(`${locationId ? `/produkte-${locationId}` : "/produkte"}/${slug}`)) return null;
  const target = resolveLegacyProduct(slug, locationId);
  if (target.kind !== "product") return target.kind === "category" ? target.path : null;
  const match = getManagedProductsCache().find(e => e.availableLocations.some(l => (!locationId || locationId === l) && productPath(l, e.category, e.slug) === target.path));
  return match ? target.path : null;
}

/**
 * Redirects old /produkte/:productSlug URLs to the best matching target
 * (product page → category → location hub). Shares its logic with the
 * server-side 301 rules generated from src/data/legacyRedirects.ts.
 */
export function LegacyProductRedirect() {
  const { productSlug } = useParams<{ productSlug: string }>();
  const navigate = useNavigate();
  const path = useVerifiedLegacyProduct(productSlug || "");

  useEffect(() => {
    if (path) navigate(path, { replace: true });
  }, [path, navigate]);

  return path || getManagedProductsCacheStatus() === "idle" ? null : <NotFound />;
}

/**
 * Redirects old /produkte-{location}/:productSlug to the matching new URL.
 */
export function LegacyLocationProductRedirect({ locationId }: { locationId: string }) {
  const { productSlug } = useParams<{ productSlug: string }>();
  const navigate = useNavigate();
  const path = useVerifiedLegacyProduct(productSlug || "", locationId);

  useEffect(() => {
    if (path) navigate(path, { replace: true });
  }, [path, navigate]);

  return path || getManagedProductsCacheStatus() === "idle" ? null : <NotFound />;
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

/**
 * Redirects old staff URLs /b2b/mietanfragen/:id to /b2b/mietvorgaenge/:id
 * so saved bookmarks and links from older e-mails keep working.
 */
export function RentalInquiryLegacyRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/b2b/mietvorgaenge/${id ?? ""}`} replace />;
}
