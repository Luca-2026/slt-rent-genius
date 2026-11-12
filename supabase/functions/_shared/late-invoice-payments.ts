export interface LateInvoicePayment {
  amount: number;
  date?: string;
  label?: string;
  reference?: string;
  receipt_amount?: number;
  invoice_payment_recorded_at?: string;
}

export function lateInvoicePaymentStatement(invoice: {
  created_at?: string; gross_amount: unknown; paid_amount: unknown; credited_amount?: unknown;
  payments?: LateInvoicePayment[] | null;
}) {
  const payments = (invoice.payments ?? []).filter(p => p.invoice_payment_recorded_at &&
    Date.parse(p.invoice_payment_recorded_at) > Date.parse(invoice.created_at ?? ""));
  return {
    payments,
    balance: Math.max(0, (Math.round(Number(invoice.gross_amount) * 100) -
      Math.round(Number(invoice.paid_amount ?? 0) * 100) - Math.round(Number(invoice.credited_amount ?? 0) * 100)) / 100),
  };
}