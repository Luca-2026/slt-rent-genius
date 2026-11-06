import { generateOfferPdf } from "./offer-pdf.ts";

/** The database creates accounting credits atomically; this only adds immutable PDF evidence. */
export async function completeTestInvoiceDocuments(service: any, table: string, invoiceId: string) {
  if (!["inquiry_invoices", "b2b_invoices"].includes(table)) throw new Error("Invalid invoice source");
  const { error: creditError } = await service.rpc("credit_registered_test_invoice", { _table: table, _id: invoiceId });
  if (creditError) throw new Error(creditError.message);
  const { data: credits, error } = await service.from(table).select("*").eq("parent_invoice_id", invoiceId)
    .eq("invoice_kind", "credit_note").like("notes", "Automatische vollständige Gutschrift:%");
  if (error) throw new Error(error.message);
  if (!credits?.length) return [];
  const { data: original, error: originalError } = await service.from(table).select("*").eq("id", invoiceId).single();
  if (originalError) throw new Error(originalError.message);
  const result = [];
  for (const credit of credits) {
    let path = table === "inquiry_invoices" ? credit.file_path : null;
    if (!credit.file_url) {
      const name = `Rechnungskorrektur_${credit.invoice_number}.pdf`;
      path = `test-invoice-credits/${table}/${credit.id}/${name}`;
      const sourceTable = original.rental_inquiry_id ? "rental_inquiries" : original.sales_inquiry_id ? "sales_inquiries" : "b2b_reservations";
      const sourceId = original.rental_inquiry_id || original.sales_inquiry_id || original.reservation_id;
      const { data: order } = sourceId ? await service.from(sourceTable).select("order_code").eq("id", sourceId).maybeSingle() : { data: null };
      const bytes = await generateOfferPdf({
        documentType: "credit_note", offerNumber: credit.invoice_number, orderCode: order?.order_code ?? null,
        offerDate: credit.invoice_date, validUntil: credit.invoice_date,
        parentInvoiceNumber: original.invoice_number, parentInvoiceDate: original.invoice_date,
        creditReason: credit.notes, creditAlreadyPaid: 0, creditRefundAmount: 0, creditRemainingBalance: 0,
        profile: { company_name: original.company_name || original.customer_company || original.customer_name,
          contact_first_name: original.customer_name || "", contact_last_name: "",
          street: original.customer_street || original.customer_address || "", house_number: "",
          postal_code: original.customer_postal_code || "", city: original.customer_city || "", country: original.customer_country || "Deutschland" },
        items: [{ product_name: "Vollständige Test-Rechnungskorrektur", description: credit.notes, quantity: 1, unit: "Pauschale",
          unit_price: Math.abs(Number(credit.net_amount)), total_price: Math.abs(Number(credit.net_amount)), discount_percent: 0 }],
        deliveryCost: 0, deliveryCostDelivery: 0, deliveryCostReturn: 0, servicesSurcharge: 0, servicesWithPrices: [],
        netAmount: Math.abs(Number(credit.net_amount)), vatRate: Number(credit.vat_rate),
        vatAmount: Math.abs(Number(credit.vat_amount)), grossAmount: Math.abs(Number(credit.gross_amount)),
        isReverseCharge: Boolean(credit.is_reverse_charge), notes: "Interner Testbeleg. Keine reale Forderung oder Auszahlung.",
        validDays: 0, deposit: 0, staffName: "Automatische Testbereinigung", issuingLocation: original.location || "krefeld",
      });
      const { error: uploadError } = await service.storage.from("b2b-invoices").upload(path, bytes, { contentType: "application/pdf", upsert: false });
      if (uploadError && !/already exists|duplicate/i.test(uploadError.message)) throw new Error(uploadError.message);
      const { data: signed, error: signedError } = await service.storage.from("b2b-invoices").createSignedUrl(path, 31536000);
      if (signedError || !signed?.signedUrl) throw new Error("Gutschrift-PDF nicht verfügbar");
      const update = table === "inquiry_invoices" ? { file_url: signed.signedUrl, file_name: name, file_path: path } : { file_url: signed.signedUrl, file_name: name };
      const { error: updateError } = await service.from(table).update(update).eq("id", credit.id);
      if (updateError) throw new Error(updateError.message);
    }
    result.push({ id: credit.id, invoice_number: credit.invoice_number, gross_amount: credit.gross_amount, file_path: path });
  }
  return result;
}