import { creditRefund } from "./credit-refund.ts";
import { rentalRefundPdf } from "./rental-refund-pdf.ts";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

export async function rentalCreditRefund(service: any, invoiceId: string, userId: string, action: string, bankReference?: string) {
  const { data: invoice, error } = await service.from("inquiry_invoices").select("*").eq("id", invoiceId).single();
  if (error || !invoice?.rental_inquiry_id || !["invoice", "final"].includes(invoice.invoice_kind) || ["draft", "cancelled"].includes(invoice.status) || invoice.parent_invoice_id || invoice.deducted_installments?.length) throw new Error("Keine gültige erstmalige Mietrechnung.");
  const { data: siblings, error: siblingError } = await service.from("inquiry_invoices").select("id").eq("rental_inquiry_id", invoice.rental_inquiry_id).neq("id", invoiceId).neq("status", "draft").neq("status", "cancelled");
  if (siblingError || siblings?.length) throw new Error("Weitere Rechnungen oder Korrekturen erfordern gesonderte Abrechnung.");
  const amount = Math.round((Number(invoice.paid_amount) - Number(invoice.gross_amount)) * 100);
  if (amount <= 0) throw new Error("Kein Mietguthaben in dieser Rechnung vorhanden.");
  const { data: links, error: linksError } = await service.from("offer_payment_links").select("id").eq("inquiry_id", invoice.rental_inquiry_id).eq("inquiry_table", "rental_inquiries").eq("status", "paid");
  if (linksError) throw new Error("Originalzahlungen konnten nicht geprüft werden.");
  const payments = Array.isArray(invoice.payments) ? invoice.payments : [];
  const bank = !links?.length && payments.length > 0 && payments.every((p: any) => !/^(pi_|cs_)/.test(String(p.reference ?? "")) && /überweisung|ueberweisung|bank/i.test(String(p.label ?? "")));
  const { data: existing, error: readError } = await service.from("credit_note_refunds").select("*").eq("credit_note_id", invoiceId).maybeSingle();
  if (readError || (existing && existing.refund_kind !== "rental_credit")) throw new Error("Erstattungsstatus nicht sicher zuordenbar.");
  let claim = existing ?? { status: "available", amount_cents: amount, payout_method: bank ? "transfer" : "stripe", allocations: [] };
  if (action === "refund_rental_credit") {
    if (bank) {
      if (!existing) {
        const { data, error: insertError } = await service.from("credit_note_refunds").insert({ credit_note_id: invoiceId, refund_kind: "rental_credit", payout_method: "transfer", amount_cents: amount, allocations: [], created_by: userId, receipt_snapshot: { invoice_number: invoice.invoice_number, paid_amount: invoice.paid_amount, gross_amount: invoice.gross_amount } }).select("*").single();
        if (insertError || !data) throw new Error("Erstattungsauftrag bereits vorhanden oder nicht zulässig. Neu laden.");
        claim = data;
      }
    } else {
      await creditRefund(service, invoiceId, userId, true, true);
      const { data, error: reloadError } = await service.from("credit_note_refunds").select("*").eq("credit_note_id", invoiceId).single();
      if (reloadError || !data) throw new Error("Auszahlungsstatus ungeklärt. Nicht zusätzlich erstatten.");
      claim = data;
    }
  } else if (action === "confirm_rental_credit_transfer") {
    if (!existing || existing.payout_method !== "transfer" || !bank || !bankReference?.trim()) throw new Error("Kein bestätigbarer Bankauftrag vorhanden.");
    if (existing.status !== "succeeded") {
      const { data, error: updateError } = await service.from("credit_note_refunds").update({ status: "succeeded", bank_reference: bankReference.trim(), updated_at: new Date().toISOString() }).eq("id", existing.id).eq("status", "creating").select("*").single();
      if (updateError || !data) throw new Error("Bankbestätigung nicht gespeichert. Status erneut prüfen.");
      claim = data;
    }
  } else if (!bank && !existing) {
    await creditRefund(service, invoiceId, userId, false, true);
  }
  const { data: inquiry, error: inquiryError } = await service.from("rental_inquiries").select("order_code").eq("id", invoice.rental_inquiry_id).single();
  if (inquiryError) throw new Error("Auftrags-ID konnte nicht gelesen werden.");
  const pdf = await rentalRefundPdf(invoice, claim, inquiry?.order_code ?? null);
  let pdfUrl: string | null = null;
  if (claim.id) {
    const path = `rental-refunds/${claim.id}/${claim.status}-${String(claim.updated_at ?? claim.created_at).replace(/[^0-9]/g, "")}.pdf`;
    const { error: uploadError } = await service.storage.from("b2b-invoices").upload(path, pdf, { contentType: "application/pdf", upsert: false });
    if (uploadError && !/already exists|duplicate/i.test(uploadError.message ?? "")) throw new Error("Erstattung gespeichert; PDF-Speicherung fehlgeschlagen. Status prüfen, nicht erneut auszahlen.");
    const { data: signed, error: signError } = await service.storage.from("b2b-invoices").createSignedUrl(path, 3600);
    if (signError) throw new Error("PDF konnte nicht geöffnet werden.");
    pdfUrl = signed?.signedUrl ?? null;
  }
  return { success: true, amount_cents: amount, status: claim.status, payout_method: claim.payout_method, pdf_url: pdfUrl, pdf_base64: encodeBase64(pdf) };
}