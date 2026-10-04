# Edge function rules

- Legacy B2B protocol HTML footers must use `unifiedFooterHtml` from `_shared/pdf-footer.ts`; their email PDFs use `drawUnifiedFooter` with the reservation location so both outputs match business documents.
- Online payments (Stripe) only via `_shared/stripe-pay.ts` (tested): amount = offer gross + deposit − recorded payments; the webhook books a payment into `inquiry.payments` only on an exact cent match, idempotently, so the order confirmation stays tied to full payment. Deposit refunds only via `offer-payment-admin` (admin and branch manager); in Stripe test mode only the test customer address receives a payment link.
