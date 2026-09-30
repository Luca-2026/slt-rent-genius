export interface RentalInquiry {
  id: string;
  source: string;
  location: string | null;
  location_email: string | null;
  product_name: string | null;
  product_id: string | null;
  category_slug: string | null;
  quantity: number | null;
  start_date: string | null;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  delivery_requested: boolean;
  delivery_street: string | null;
  delivery_postal_code: string | null;
  delivery_city: string | null;
  setup_service_requested: boolean;
  customer_name: string | null;
  customer_email: string | null;
  customer_kind: string | null;
  customer_phone: string | null;
  customer_street: string | null;
  customer_postal_code: string | null;
  customer_city: string | null;
  company_name: string | null;
  vat_id: string | null;
  message: string | null;
  attachments: unknown;
  /** Gesetzt, wenn die Anfrage aus dem B2B-Portal eines Firmenkunden stammt. */
  b2b_profile_id?: string | null;
  b2b_reservation_id?: string | null;
  rental_group_id?: string | null;
  crm_customer_id?: string | null;
  /** Gebündelte Artikel einer Website-Anfrage */
  requested_items?: RequestedItem[] | unknown;
  status: string;
  assigned_to: string | null;
  assigned_name: string | null;
  assigned_at: string | null;
  internal_notes: string | null;
  offer_number: string | null;
  offer_file_url: string | null;
  offer_total_gross: number | null;
  offer_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalesInquiry {
  id: string;
  kind: string;
  source: string | null;
  location: string | null;
  brand: string | null;
  product_category: string | null;
  product_slug?: string | null;
  product_kind?: string | null;
  model: string | null;
  article_number: string | null;
  quantity: string | null;
  requirements: string | null;
  addons: unknown;
  year: number | null;
  listed_price: string | null;
  searched_machine: string | null;
  interest: string | null;
  wish_date: string | null;
  delivery_option: string | null;
  delivery_street: string | null;
  delivery_postal_code: string | null;
  delivery_city: string | null;
  delivery_note: string | null;
  customer_type: string | null;
  company_name: string | null;
  vat_id: string | null;
  salutation: string | null;
  first_name: string | null;
  last_name: string | null;
  customer_email: string | null;
  customer_kind: string | null;
  customer_phone: string | null;
  billing_identical: boolean | null;
  billing_company: string | null;
  billing_street: string | null;
  billing_postal_code: string | null;
  billing_city: string | null;
  billing_country: string | null;
  financing_desired: boolean | null;
  financing_term: string | null;
  financing_down_payment: string | null;
  message: string | null;
  found_via: string | null;
  status: string;
  assigned_to: string | null;
  assigned_name: string | null;
  assigned_at: string | null;
  internal_notes: string | null;
  offer_number: string | null;
  offer_file_url: string | null;
  offer_total_gross: number | null;
  offer_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export type AnyInquiry = RentalInquiry | SalesInquiry;

export const SALES_KIND_LABELS: Record<string, string> = {
  new_machine: "Neuartikel",
  used_machine: "Gebrauchtartikel",
  rental_purchase: "Kauf aus Mietartikel",
};

export function salesInquiryTitle(inquiry: SalesInquiry): string {
  return (
    [inquiry.brand, inquiry.model].filter(Boolean).join(" ") ||
    inquiry.searched_machine ||
    inquiry.product_category ||
    inquiry.article_number ||
    "Kaufanfrage"
  );
}

export function salesInquiryCustomer(inquiry: SalesInquiry): string {
  return (
    inquiry.company_name ||
    [inquiry.first_name, inquiry.last_name].filter(Boolean).join(" ") ||
    inquiry.customer_email ||
    "-"
  );
}

export interface RequestedItem {
  product_name: string;
  product_slug?: string | null;
  quantity: number;
  set_size?: number | null;
  /** Vom Mitarbeiter vorgegebener Einzelpreis (z. B. KI-Import); fehlt = CMS-Preis. */
  unit_price?: number | null;
}

/** Untrusted JSON → Artikelliste; Fallback: Einzelartikel der Anfrage. */
export function requestedItemsOf(inquiry: Pick<RentalInquiry, "requested_items" | "product_name" | "quantity">): RequestedItem[] {
  const raw = Array.isArray(inquiry.requested_items) ? (inquiry.requested_items as Record<string, unknown>[]) : [];
  const list = raw
    .map((r) => ({
      product_name: String(r?.product_name ?? "").trim(),
      product_slug: r?.product_slug ? String(r.product_slug) : null,
      quantity: Math.max(1, Math.round(Number(r?.quantity) || 1)),
      set_size: Number(r?.set_size) > 1 ? Math.round(Number(r.set_size)) : null,
      unit_price: Number(r?.unit_price) > 0 ? Number(r.unit_price) : null,
    }))
    .filter((r) => r.product_name);
  if (list.length) return list;
  return inquiry.product_name
    ? [{ product_name: inquiry.product_name, quantity: inquiry.quantity && inquiry.quantity > 0 ? inquiry.quantity : 1 }]
    : [];
}
