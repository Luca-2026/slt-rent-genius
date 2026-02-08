import { getProductById, locations } from "@/data/rentalData";
import type { Product } from "@/data/rentalData";

/**
 * Looks up a product image by product ID from rental data
 * and returns an absolute URL that can be used in external HTML documents.
 */
export function getProductImageUrl(productId: string): string | null {
  const product = getProductById(productId);
  return product?.image ? toAbsoluteUrl(product.image) : null;
}

/**
 * Looks up a product image by product name (fallback when ID doesn't match).
 * Searches all locations for a product with a matching name.
 */
export function getProductImageUrlByName(productName: string): string | null {
  for (const location of locations) {
    for (const products of Object.values(location.products)) {
      const found = (products as Product[]).find(
        (p) => p.name === productName || p.id === productName
      );
      if (found?.image) return toAbsoluteUrl(found.image);
    }
  }
  return null;
}

function toAbsoluteUrl(imagePath: string): string {
  if (imagePath.startsWith("http")) return imagePath;
  return `${window.location.origin}${imagePath}`;
}
