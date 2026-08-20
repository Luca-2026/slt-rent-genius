/**
 * Hook: veröffentlichte CMS-Mietartikel aus DB laden (via View ohne interne Felder).
 * Der Merge-Layer in `mergeManagedProducts.ts` verschmilzt sie mit den statischen TS-Daten.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/data/rentalData";
import { PRODUCT_SUBCATEGORIES } from "@/data/productSubcategories";


export interface ManagedProductRow {
  id: string;
  slug: string;
  name: string;
  model_name: string | null;
  description: string | null;
  detailed_description: string | null;
  category: string;
  /** Filter-Zugehörigkeit (Untertyp), steuert die Kategoriefilter im Frontend. */
  subcategory?: string | null;
  available_locations: string[];
  images: string[];
  specifications: Record<string, string>;
  features: string[];
  tags: string[];
  rental_notes: string[];
  price_per_day: string | null;
  price_unit_label?: string | null;
  price_weekend: string | null;
  price_per_month: string | null;
  min_rental_months: number | null;
  weight_kg: number | null;
  drive_type: string | null;
  rentware_code: Record<string, string>;
  on_request: boolean;
  pdf_url: string | null;
  external_manual_url: string | null;
  video_url: string | null;
  video_urls: string[];
  sort_order: number | null;
  seo_meta_description: string | null;
  seo_faqs: Array<{ question: string; answer: string }>;
  seo_local_content: Record<string, string>;
  image_alts?: string[] | null;
}

/**
 * Effektive Filter-Zugehörigkeit eines CMS-Artikels.
 * CMS-Feld schlägt die statische Migrations-Map, diese schlägt die Hauptkategorie.
 */
export function resolveSubcategory(row: { slug: string; category: string; subcategory?: string | null }): string {
  const explicit = row.subcategory?.trim();
  if (explicit) return explicit;
  return PRODUCT_SUBCATEGORIES[row.slug] ?? row.category;
}

export function managedRowToProduct(row: ManagedProductRow): Product {
  return {
    id: row.slug, // id im Frontend = slug für stabile URLs
    name: row.name,
    modelName: row.model_name ?? undefined,
    description: row.description ?? undefined,
    detailedDescription: row.detailed_description ?? undefined,
    image: row.images[0],
    images: row.images.length ? row.images : undefined,
    imageAlts: row.image_alts?.length ? row.image_alts : undefined,
    videoUrl: row.video_url ?? undefined,
    videoUrls: row.video_urls?.length ? row.video_urls : undefined,
    pricePerDay: row.price_per_day ?? undefined,
    priceUnitLabel: row.price_unit_label ?? undefined,
    priceWeekend: row.price_weekend ?? undefined,
    pricePerMonth: row.price_per_month ?? undefined,
    minRentalMonths: row.min_rental_months ?? undefined,
    features: row.features?.length ? row.features : undefined,
    specifications: row.specifications && Object.keys(row.specifications).length
      ? row.specifications
      : undefined,
    pdfUrl: row.pdf_url ?? undefined,
    externalManualUrl: row.external_manual_url ?? undefined,
    tags: row.tags?.length ? row.tags : undefined,
    // Frontend-Filter matchen auf dem Artikel-Untertyp (z. B. "minibagger"),
    // im CMS steht in `category` dagegen die Hauptkategorie ("erdbewegung").
    // Priorität: CMS-Feld „Filter-Zugehörigkeit" > statische Map > Hauptkategorie.
    category: resolveSubcategory(row),

    weightKg: row.weight_kg ?? undefined,
    sortOrder: row.sort_order ?? undefined,
    rentwareCode: row.rentware_code && Object.keys(row.rentware_code).length
      ? row.rentware_code
      : undefined,
    onRequest: row.on_request,
    driveType: row.drive_type ?? undefined,
    rentalNotes: row.rental_notes?.length ? row.rental_notes : undefined,
    seoMetaDescription: row.seo_meta_description ?? undefined,
    seoFaqs: row.seo_faqs?.length
      ? row.seo_faqs
          .map((f: any) => ({
            question: f?.question ?? f?.q ?? "",
            answer: f?.answer ?? f?.a ?? "",
          }))
          .filter((f) => f.question && f.answer)
      : undefined,
  };

}

/** Alle veröffentlichten Managed-Artikel (Public-View). */
export function useManagedProducts() {
  return useQuery({
    queryKey: ["managed-products-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("managed_products_public" as never)
        .select("*");
      if (error) throw error;
      return (data as unknown as ManagedProductRow[]) ?? [];
    },
    staleTime: 60_000,
  });
}

/** Für Admins: alle Artikel inkl. Entwürfe und interner Bestandsdaten. */
export interface AdminManagedProductRow extends ManagedProductRow {
  is_published: boolean;
  quantities: Record<string, number>;
  quantity_notes: Record<string, string>;
  seo_draft_meta_description: string | null;
  seo_draft_faqs: Array<{ question: string; answer: string }> | null;
  seo_draft_generated_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useAdminManagedProducts() {
  return useQuery({
    queryKey: ["managed-products-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("b2b_managed_products" as never)
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as AdminManagedProductRow[]) ?? [];
    },
    staleTime: 15_000,
  });
}
