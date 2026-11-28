export interface PublicRouteProduct { id: string; slug: string; category: string; available_locations: string[] }
export interface PublicUrlRedirect { id: string; managed_product_id: string; location: string; old_path: string }
export function productPath(location: string, category: string, slug: string): string {
  return `/mieten/${[location, category, slug].map(encodeURIComponent).join("/")}`;
}
export function normalizeProductPath(path: string): string | null {
  const parts = path.replace(/\/+$/, "").split("/");
  if (parts.length !== 5 || parts[1] !== "mieten") return null;
  try {
    const decoded = parts.slice(2).map(decodeURIComponent);
    if (!decoded.every(s => s && !/[\/%?#\\\s]/.test(s)) || !["krefeld", "bonn", "muelheim"].includes(decoded[0])) return null;
    return productPath(decoded[0], decoded[1], decoded[2]);
  } catch { return null; }
}
/** Current exact routes win; history resolves directly by UUID, never through another old slug. */
export function resolveHistoricalProduct(path: string, products: PublicRouteProduct[], history: PublicUrlRedirect[]): string | null {
  const source = normalizeProductPath(path);
  if (!source) return null;
  if (products.some(p => p.available_locations.some(l => productPath(l, p.category, p.slug) === source))) return null;
  const records = history.filter(h => normalizeProductPath(h.old_path) === source);
  if (new Set(records.map(h => h.managed_product_id)).size !== 1) return null;
  const record = records[0];
  if (!record || !source.startsWith(`/mieten/${record.location}/`)) return null;
  const targets = products.filter(p => p.id === record.managed_product_id && p.available_locations.includes(record.location));
  if (targets.length !== 1) return null;
  const target = productPath(record.location, targets[0].category, targets[0].slug);
  return target === source ? null : target;
}