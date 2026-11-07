import { creditRefund } from "./credit-refund.ts";

/** An unnumbered, server-calculated billing basis is not an issued invoice. */
export async function preInvoiceRefund(service: any, inquiryId: string, userId: string, action: string, reference?: string) {
  const { data: basis, error } = await service.from("rental_refund_bases").select("*").eq("inquiry_id", inquiryId).single();
  if (error || !basis) throw new Error("Zuerst die Rechnungsvorschau mit dem endgültigen Rabatt prüfen.");
  const { data: issued, error: issuedError } = await service.from("inquiry_invoices").select("id").eq("rental_inquiry_id", inquiryId).not("status", "in", "(draft,cancelled)");
  if (issuedError || issued?.length) throw new Error("Bereits ausgestellte Rechnungen über den bestehenden Rechnungserstattungsweg abrechnen.");
  const { data: existing, error: readError } = await service.from("rental_order_refunds").select("*").eq("basis_id", basis.id).maybeSingle();
  if (readError) throw new Error("Erstattungsstatus konnte nicht gelesen werden.");
  const amount = Math.max(0, Math.round((Number(basis.paid_amount) - Number(basis.gross_amount)) * 100));
  if (!amount) return { success: true, amount_cents: 0, status: "none", payout_method: "none" };
  const { data: links, error: linkError } = await service.from("offer_payment_links").select("id").eq("inquiry_id", inquiryId).eq("inquiry_table", "rental_inquiries").eq("status", "paid");
  if (linkError) throw new Error("Originalzahlungen konnten nicht geprüft werden.");
  const bank = !links?.length && basis.payments.length > 0 && basis.payments.every((p: any) => !/^(pi_|cs_)/.test(String(p.reference ?? "")) && /überweisung|ueberweisung|bank/i.test(String(p.label ?? "")));
  if (!bank) return creditRefund(service, basis.id, userId, action === "refund_order_credit", true, true);
  let claim = existing;
  if (action === "refund_order_credit" && !claim) {
    const { data, error: insertError } = await service.from("rental_order_refunds").insert({ basis_id: basis.id, amount_cents: amount, allocations: [], created_by: userId, payout_method: "transfer" }).select("*").single();
    if (insertError || !data) throw new Error("Erstattungsauftrag nicht gespeichert. Status neu prüfen.");
    claim = data;
  }
  if (action === "confirm_order_credit_transfer") {
    if (!claim || claim.payout_method !== "transfer" || !reference?.trim()) throw new Error("Kein bestätigbarer Bankauftrag vorhanden.");
    if (claim.status !== "succeeded") {
      const { data, error: updateError } = await service.from("rental_order_refunds").update({ status: "succeeded", bank_reference: reference.trim(), updated_at: new Date().toISOString() }).eq("id", claim.id).eq("status", "creating").select("*").single();
      if (updateError || !data) throw new Error("Banknachweis nicht gespeichert.");
      claim = data;
    }
  }
  return { success: true, amount_cents: amount, status: claim?.status ?? "available", payout_method: "transfer" };
}