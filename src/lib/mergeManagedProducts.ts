/**
 * Merge-Utility: verschmelzt CMS-DB-Artikel mit statischen TS-Artikeln pro Standort/Kategorie.
 * Regel: existiert in DB ein Artikel mit gleicher Slug wie in TS, überschreibt DB.
 * Neue DB-Artikel werden je nach `available_locations` in die passende Kategorie eingefügt.
 */
import type { Product } from "@/data/rentalData";
import { generateProductSlug } from "@/data/rentalData";
import {
  managedRowToProduct,
  type ManagedProductRow,
} from "@/hooks/useManagedProducts";

export function mergeProductsForLocationCategory(
  locationId: string,
  categoryId: string,
  staticProducts: Product[],
  managedRows: ManagedProductRow[] | undefined,
): Product[] {
  if (!managedRows?.length) return staticProducts;

  const relevant = managedRows.filter(
    (r) =>
      r.available_locations.includes(locationId) &&
      (categoryId === "alle" || r.category === categoryId),
  );

  const bySlug = new Map<string, Product>();
  for (const p of staticProducts) bySlug.set(generateProductSlug(p), p);

  for (const row of relevant) {
    bySlug.set(row.slug, managedRowToProduct(row));
  }

  return Array.from(bySlug.values()).sort((a, b) => {
    const sa = a.sortOrder ?? 999;
    const sb = b.sortOrder ?? 999;
    if (sa !== sb) return sa - sb;
    return a.name.localeCompare(b.name);
  });
}

export function mergeAllProductsForLocation(
  locationId: string,
  staticProducts: Product[],
  managedRows: ManagedProductRow[] | undefined,
): Product[] {
  return mergeProductsForLocationCategory(locationId, "alle", staticProducts, managedRows);
}

/** Findet ein Produkt anhand Slug – DB gewinnt vor TS. */
export function findMergedProductBySlug(
  slug: string,
  staticProducts: Product[],
  managedRows: ManagedProductRow[] | undefined,
): Product | undefined {
  const managed = managedRows?.find((r) => r.slug === slug);
  if (managed) return managedRowToProduct(managed);
  return staticProducts.find((p) => generateProductSlug(p) === slug);
}
