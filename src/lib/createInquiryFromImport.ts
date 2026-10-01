import { supabase } from "@/integrations/supabase/client";
import type { ReviewState } from "@/components/b2b/inquiries/AiInquiryImportDialog";

/**
 * Legt aus der geprüften KI-Import-Ansicht eine Mietanfrage an (Quelle „ai_import“).
 * Einzige Stelle dafür – genutzt von „Mietanfragen“ und „Anrufe“.
 * Gibt die ID der neuen Anfrage zurück.
 */
export async function createInquiryFromImport(r: ReviewState): Promise<string | null> {
  const lines = r.lines.filter((l) => l.product_name.trim());
  const message = [
    r.notes.trim(),
    r.open_questions.length ? `Offene Fragen:\n- ${r.open_questions.join("\n- ")}` : "",
    `Originaltext (KI-Import):\n${r.source_text.trim()}`,
  ].filter(Boolean).join("\n\n");
  const { data: auth } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("rental_inquiries")
    .insert({
      source: "ai_import",
      location: r.location,
      product_name: lines[0].product_name.trim(),
      quantity: lines[0].quantity > 0 ? lines[0].quantity : 1,
      requested_items: lines.map((l) => ({
        product_name: l.product_name.trim(),
        product_slug: l.product_slug,
        quantity: l.quantity > 0 ? l.quantity : 1,
        unit_price: l.unit_price && l.unit_price > 0 ? l.unit_price : null,
      })),
      start_date: r.start_date,
      end_date: r.end_date || null,
      customer_kind: r.customer_kind || "private",
      company_name: r.company_name.trim() || null,
      customer_name: r.customer_name.trim() || r.company_name.trim(),
      customer_email: r.customer_email.trim(),
      customer_phone: r.customer_phone.trim() || null,
      customer_street: r.customer_street.trim() || null,
      customer_postal_code: r.customer_postal_code.trim() || null,
      customer_city: r.customer_city.trim() || null,
      delivery_requested: Boolean(r.delivery),
      delivery_street: r.delivery ? r.delivery_street.trim() || null : null,
      delivery_postal_code: r.delivery ? r.delivery_postal_code.trim() || null : null,
      delivery_city: r.delivery ? r.delivery_city.trim() || null : null,
      message,
      status: "in_progress",
      assigned_to: auth.user?.id ?? null,
      assigned_at: new Date().toISOString(),
      crm_customer_id: r.crm_customer_id,
    } as never)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return (data as { id?: string } | null)?.id ?? null;
}
