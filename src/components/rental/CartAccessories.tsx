import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadCatalog, pickCatalogImage, type CatalogProduct } from "@/components/b2b/inquiries/InquiryProductCombobox";
import type { RentalCartItem } from "@/lib/rentalCart";

export function CartAccessories({ item, existing, onAdd }: { item: RentalCartItem; existing: RentalCartItem[]; onAdd: (item: RentalCartItem) => void }) {
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  useEffect(() => { let active = true; loadCatalog().then(data => { if (active) setCatalog(data); }); return () => { active = false; }; }, []);
  const slugs = catalog.find(product => product.slug === item.product_slug)?.suggested_accessory_slugs ?? [];
  const products = catalog.filter(product => slugs.includes(product.slug) && product.category !== "anhaenger" && !existing.some(row => row.product_slug === product.slug) && (!product.available_locations?.length || product.available_locations.includes(item.location)));
  if (!products.length) return null;
  return <div className="space-y-3"><h3 className="font-semibold">Passende Zusatzartikel</h3>{products.map(product => <div key={product.slug} className="flex items-center gap-3 border-b border-border pb-3">{pickCatalogImage(product.images) && <img src={pickCatalogImage(product.images)} alt="" className="h-12 w-12 shrink-0 object-contain" />}<span className="min-w-0 flex-1 text-sm">{product.name}</span><Button size="sm" variant="outline" disabled={existing.length >= 29} onClick={() => onAdd({ ...item, id: crypto.randomUUID(), product_slug: product.slug, product_name: product.name, image: pickCatalogImage(product.images), quantity: 1, selected_addons: [] })}><Plus className="h-4 w-4" />Hinzufügen</Button></div>)}</div>;
}