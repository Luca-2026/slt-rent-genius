// Historical TS data is a test fixture only, never a runtime fallback.
import { locations } from "@/data/rentalData";
import { setManagedProductsCache } from "@/data/managedProductsCache";
export function seedPublicStaticCatalogFixture() {
  setManagedProductsCache(locations.flatMap(location => Object.entries(location.products).flatMap(([category, products]) => products.map(product => ({ slug: product.id, category, availableLocations: [location.id], product })))));
}