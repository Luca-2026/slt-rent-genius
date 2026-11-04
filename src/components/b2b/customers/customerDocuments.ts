import { supabase } from "@/integrations/supabase/client";
import { openStorageDocument } from "@/lib/openStorageDocument";
import { openInvoiceInNewWindow } from "@/utils/invoiceViewer";

export interface CustomerDocument {
  id: string;
  label: string;
  date: string | null;
  url: string;
  bucket?: string;
}

/** Read persisted evidence only; never regenerate or issue documents from the dossier. */
export async function loadCustomerDocuments(customerId: string, profileId?: string | null): Promise<CustomerDocument[]> {
  const documents: CustomerDocument[] = [];
  const add = (id: string, label: string, date: string | null, url: string | null | undefined, bucket?: string) => {
    if (url?.trim()) documents.push({ id, label, date, url, bucket });
  };
  const inquiries = await Promise.all([
    supabase.from("rental_inquiries").select("id,offer_number,offer_file_url,offer_sent_at,order_confirmation_number,order_confirmation_file_url,order_confirmed_at,original_accepted_offer").eq("crm_customer_id", customerId),
    supabase.from("sales_inquiries").select("id,offer_number,offer_file_url,offer_sent_at,order_confirmation_number,order_confirmation_file_url,order_confirmed_at").eq("crm_customer_id", customerId),
  ]);
  for (const result of inquiries) if (result.error) throw result.error;
  const rentalIds = (inquiries[0].data ?? []).map(q => q.id);
  const salesIds = (inquiries[1].data ?? []).map(q => q.id);
  inquiries.forEach((result, index) => (result.data ?? []).forEach(q => {
    const kind = index === 0 ? "Miete" : "Verkauf";
    add(`offer-${q.id}`, `Angebot ${q.offer_number ?? ""} · ${kind}`, q.offer_sent_at, q.offer_file_url);
    add(`ab-${q.id}`, `Auftragsbestätigung ${q.order_confirmation_number ?? ""} · ${kind}`, q.order_confirmed_at, q.order_confirmation_file_url);
    if ("original_accepted_offer" in q && q.original_accepted_offer && typeof q.original_accepted_offer === "object" && !Array.isArray(q.original_accepted_offer)) {
      const original = q.original_accepted_offer;
      if (typeof original.offer_file_url === "string") add(`original-${q.id}`, `Ursprüngliches Angebot ${typeof original.offer_number === "string" ? original.offer_number : ""}`, q.offer_sent_at, original.offer_file_url);
      if (typeof original.order_confirmation_file_url === "string") add(`original-ab-${q.id}`, "Ursprüngliche Auftragsbestätigung", q.order_confirmed_at, original.order_confirmation_file_url);
    }
  }));
  const invoiceQueries = [supabase.from("inquiry_invoices").select("id,invoice_number,invoice_kind,invoice_date,file_url,file_path,status").eq("crm_customer_id", customerId)];
  if (rentalIds.length) invoiceQueries.push(supabase.from("inquiry_invoices").select("id,invoice_number,invoice_kind,invoice_date,file_url,file_path,status").in("rental_inquiry_id", rentalIds));
  if (salesIds.length) invoiceQueries.push(supabase.from("inquiry_invoices").select("id,invoice_number,invoice_kind,invoice_date,file_url,file_path,status").in("sales_inquiry_id", salesIds));
  const invoiceResults = await Promise.all(invoiceQueries);
  for (const result of invoiceResults) {
    if (result.error) throw result.error;
    for (const v of result.data ?? []) if (v.status !== "draft") add(`invoice-${v.id}`, `${v.invoice_kind === "credit_note" ? "Gutschrift" : "Rechnung"} ${v.invoice_number ?? ""}`, v.invoice_date, v.file_url || v.file_path, "b2b-invoices");
  }
  const deliveryQueries = [];
  const returnQueries = [];
  if (rentalIds.length) {
    deliveryQueries.push(supabase.from("b2b_delivery_notes").select("id,delivery_note_number,created_at,file_url").in("rental_inquiry_id", rentalIds));
    returnQueries.push(supabase.from("b2b_return_protocols").select("id,return_protocol_number,created_at,file_url").in("rental_inquiry_id", rentalIds));
    const history = await supabase.from("rental_order_confirmation_deliveries").select("id,confirmation_number,sent_at,file_url,version").in("rental_inquiry_id", rentalIds);
    if (history.error) throw history.error;
    for (const d of history.data ?? []) add(`history-${d.id}`, `Auftragsbestätigung ${d.confirmation_number} · Fassung ${d.version}`, d.sent_at, d.file_url);
  }
  if (profileId) {
    deliveryQueries.push(supabase.from("b2b_delivery_notes").select("id,delivery_note_number,created_at,file_url").eq("b2b_profile_id", profileId));
    returnQueries.push(supabase.from("b2b_return_protocols").select("id,return_protocol_number,created_at,file_url").eq("b2b_profile_id", profileId));
    const [offers, invoices, profile] = await Promise.all([
      supabase.from("b2b_offers").select("id,offer_number,offer_date,file_url").eq("b2b_profile_id", profileId),
      supabase.from("b2b_invoices").select("id,invoice_number,invoice_kind,invoice_date,file_url,status").eq("b2b_profile_id", profileId),
      supabase.from("b2b_profiles").select("document_url,sepa_mandate_url").eq("id", profileId).single(),
    ]);
    for (const result of [offers, invoices, profile]) if (result.error) throw result.error;
    for (const v of offers.data ?? []) add(`portal-offer-${v.id}`, `Angebot ${v.offer_number} · B2B-Portal`, v.offer_date, v.file_url);
    for (const v of invoices.data ?? []) if (v.status !== "draft") add(`portal-invoice-${v.id}`, `${v.invoice_kind === "credit_note" ? "Gutschrift" : "Rechnung"} ${v.invoice_number ?? ""} · B2B-Portal`, v.invoice_date, v.file_url);
    add("business-proof", "Gewerbenachweis", null, profile.data?.document_url, "b2b-documents");
    add("sepa", "SEPA-Mandat", null, profile.data?.sepa_mandate_url, "b2b-documents");
  }
  for (const result of await Promise.all(deliveryQueries)) {
    if (result.error) throw result.error;
    for (const d of result.data ?? []) add(`delivery-${d.id}`, `Übergabeprotokoll ${d.delivery_note_number}`, d.created_at, d.file_url);
  }
  for (const result of await Promise.all(returnQueries)) {
    if (result.error) throw result.error;
    for (const d of result.data ?? []) add(`return-${d.id}`, `Rückgabeprotokoll ${d.return_protocol_number}`, d.created_at, d.file_url);
  }
  const seen = new Set<string>();
  return documents.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")).filter(d => {
    const key = d.url.split("?")[0];
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function openCustomerDocument(document: CustomerDocument) {
  // Renew even previously signed links: stored tokens can have expired.
  const match = document.url.match(/\/storage\/v1\/object\/(?:sign|public|authenticated)\/([^/]+)\/(.+)/);
  if (!/\.html(?:\?|$)/i.test(document.url) && (match || document.bucket)) {
    await openStorageDocument(document.url, match?.[1] ?? document.bucket);
  } else {
    await openInvoiceInNewWindow(document.url, document.label);
  }
}