/**
 * Persists incoming public inquiries (rental + sales) so they can be worked on
 * inside the B2B portal instead of only living in a mailbox.
 *
 * Design rule: persisting must NEVER break the e-mail flow and vice versa.
 * Every call is wrapped in try/catch and returns null on failure.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

export const PORTAL_BASE_URL = "https://app.slt-rental.de";

function serviceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function insert(table: string, row: Record<string, unknown>): Promise<string | null> {
  try {
    const client = serviceClient();
    if (!client) {
      console.error(`[inquiry-store] missing service credentials for ${table}`);
      return null;
    }
    const { data, error } = await client.from(table).insert(row).select("id").single();
    if (error) {
      console.error(`[inquiry-store] insert into ${table} failed:`, error.message);
      return null;
    }
    return (data as { id: string }).id;
  } catch (err) {
    console.error(`[inquiry-store] insert into ${table} threw:`, err);
    return null;
  }
}

export function rentalInquiryLink(id: string | null): string {
  return id ? `${PORTAL_BASE_URL}/b2b/mietanfragen?id=${id}` : `${PORTAL_BASE_URL}/b2b/mietanfragen`;
}

export function salesInquiryLink(id: string | null): string {
  return id ? `${PORTAL_BASE_URL}/b2b/verkaufsanfragen?id=${id}` : `${PORTAL_BASE_URL}/b2b/verkaufsanfragen`;
}

export interface RentalInquiryInput {
  source?: string;
  location?: string | null;
  location_email?: string | null;
  product_name?: string | null;
  product_id?: string | null;
  category_slug?: string | null;
  quantity?: number | null;
  start_date?: string | null;
  start_time?: string | null;
  end_date?: string | null;
  end_time?: string | null;
  delivery_requested?: boolean;
  delivery_street?: string | null;
  delivery_postal_code?: string | null;
  delivery_city?: string | null;
  setup_service_requested?: boolean;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  customer_street?: string | null;
  customer_postal_code?: string | null;
  customer_city?: string | null;
  message?: string | null;
  attachments?: unknown[];
  raw_payload?: unknown;
}

export async function saveRentalInquiry(input: RentalInquiryInput): Promise<string | null> {
  return await insert("rental_inquiries", {
    source: input.source ?? "product_booking",
    location: input.location ?? null,
    location_email: input.location_email ?? null,
    product_name: input.product_name ?? null,
    product_id: input.product_id ?? null,
    category_slug: input.category_slug ?? null,
    quantity: input.quantity ?? null,
    start_date: input.start_date ?? null,
    start_time: input.start_time ?? null,
    end_date: input.end_date ?? null,
    end_time: input.end_time ?? null,
    delivery_requested: !!input.delivery_requested,
    delivery_street: input.delivery_street ?? null,
    delivery_postal_code: input.delivery_postal_code ?? null,
    delivery_city: input.delivery_city ?? null,
    setup_service_requested: !!input.setup_service_requested,
    customer_name: input.customer_name ?? null,
    customer_email: input.customer_email ?? null,
    customer_phone: input.customer_phone ?? null,
    customer_street: input.customer_street ?? null,
    customer_postal_code: input.customer_postal_code ?? null,
    customer_city: input.customer_city ?? null,
    message: input.message ?? null,
    attachments: input.attachments ?? [],
    raw_payload: input.raw_payload ?? null,
    email_sent: true,
  });
}

export interface SalesInquiryInput {
  kind: "new_machine" | "used_machine" | "rental_purchase";
  source?: string | null;
  location?: string | null;
  location_email?: string | null;
  brand?: string | null;
  product_category?: string | null;
  model?: string | null;
  article_number?: string | null;
  quantity?: string | null;
  requirements?: string | null;
  addons?: unknown[];
  year?: number | null;
  listed_price?: string | null;
  searched_machine?: string | null;
  interest?: string | null;
  wish_date?: string | null;
  delivery_option?: string | null;
  delivery_street?: string | null;
  delivery_postal_code?: string | null;
  delivery_city?: string | null;
  delivery_note?: string | null;
  customer_type?: string | null;
  company_name?: string | null;
  vat_id?: string | null;
  salutation?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  billing_identical?: boolean | null;
  billing_company?: string | null;
  billing_street?: string | null;
  billing_postal_code?: string | null;
  billing_city?: string | null;
  billing_country?: string | null;
  financing_desired?: boolean | null;
  financing_term?: string | null;
  financing_down_payment?: string | null;
  message?: string | null;
  found_via?: string | null;
  raw_payload?: unknown;
}

export async function saveSalesInquiry(input: SalesInquiryInput): Promise<string | null> {
  return await insert("sales_inquiries", {
    ...input,
    addons: input.addons ?? [],
    raw_payload: input.raw_payload ?? null,
    email_sent: true,
  });
}
