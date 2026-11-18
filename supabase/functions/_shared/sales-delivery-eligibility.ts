export type SalesDeliveryInvoice = { id: string; invoice_number: string | null; invoice_kind: string; status: string; credited_amount: number | null; offer_number?: string | null };
export function salesDeliveryInvoice(inquiry: { status: string; offer_number?: string | null }, invoices: SalesDeliveryInvoice[]) {
  if (inquiry.status !== "done" || !inquiry.offer_number) return undefined;
  return invoices.find(i => i.invoice_number && ["invoice", "final"].includes(i.invoice_kind) && !["draft", "cancelled"].includes(i.status) && Number(i.credited_amount ?? 0) === 0 && i.offer_number === inquiry.offer_number);
}
export function salesDeliveryAllowed(inquiry: { status: string; order_confirmed_at?: string | null; offer_number?: string | null }, invoices: SalesDeliveryInvoice[]) {
  return (["accepted", "done"].includes(inquiry.status) && !!inquiry.order_confirmed_at) || !!salesDeliveryInvoice(inquiry, invoices);
}