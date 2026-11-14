/** Advisory calculation only: never changes an order or issues a taxable document. */
export type CancellationCustomerKind = "private" | "business";
export type CancellationTermsVersion = "b2c-may-2026" | "b2b-may-2026";

const HOUR = 60 * 60 * 1000;
const BANDS = [
  { hours: 336, private: 25, business: 30 },
  { hours: 168, private: 40, business: 50 },
  { hours: 72, private: 60, business: 70 },
  { hours: 48, private: 75, business: 85 },
  { hours: 0, private: 85, business: 90 },
] as const;

export interface RentalCancellationInput {
  customerKind: CancellationCustomerKind;
  /** Must be evidenced by the contract, never inferred from today's customer profile. */
  termsVersion: CancellationTermsVersion | null;
  contractConfirmed: boolean;
  /** ISO instants with explicit offset; ambiguous local dates must be reviewed. */
  rentalStart: string | null;
  receivedAt: string;
  recordedAt: string;
  handedOver: boolean;
  openEnded: boolean;
  partialCancellation: boolean;
  reason: "customer_cancellation" | "no_show" | "statutory_right";
  /** Gross for B2C, net for B2B. Excludes deposit, options, insurance and services. */
  agreedRentalBasisCents: number | null;
  freeCancellationOptionAgreed: boolean;
  /** Paid option only, in its contractual price basis. Never invent payment evidence. */
  paidOptionCents: number;
}

export type RentalCancellationResult =
  | { kind: "close_request"; compensationBasisCents: 0; executionAllowed: false }
  | { kind: "manual_review"; reason: string; executionAllowed: false }
  | {
      kind: "estimate";
      termsVersion: CancellationTermsVersion;
      priceBasis: "gross" | "net";
      noticeHours: number;
      ratePercent: number;
      compensationBasisCents: number;
      retainedPaidOptionCents: number;
      freeCancellationApplies: boolean;
      /** Tax and legal approval deliberately block automatic execution. */
      executionAllowed: false;
    };

function instant(value: string | null): number | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const parsed = Date.parse(value);
  const datePart = value.slice(0, 10);
  const calendarDate = new Date(`${datePart}T00:00:00Z`);
  if (!Number.isFinite(parsed) || !Number.isFinite(calendarDate.getTime()) || calendarDate.toISOString().slice(0, 10) !== datePart) return null;
  return parsed;
}

const validCents = (value: number | null): value is number =>
  value !== null && Number.isSafeInteger(value) && value >= 0;

export function estimateRentalCancellation(input: RentalCancellationInput): RentalCancellationResult {
  const review = (reason: string): RentalCancellationResult => ({ kind: "manual_review", reason, executionAllowed: false });
  if (input.customerKind !== "private" && input.customerKind !== "business") return review("customer_kind_unknown");
  if (input.reason === "statutory_right") return review("statutory_right");
  if (input.reason !== "customer_cancellation" && input.reason !== "no_show") return review("reason_unknown");
  if (input.handedOver || input.openEnded || input.partialCancellation) return review("special_rental_case");
  if (!input.contractConfirmed) return { kind: "close_request", compensationBasisCents: 0, executionAllowed: false };
  const requiredVersion = input.customerKind === "private" ? "b2c-may-2026" : "b2b-may-2026";
  if (input.termsVersion !== requiredVersion) return review("contract_terms_unverified");
  const start = instant(input.rentalStart);
  const received = instant(input.receivedAt);
  const recorded = instant(input.recordedAt);
  if (start === null || received === null || recorded === null) return review("dates_missing_or_ambiguous");
  if (received > recorded) return review("future_receipt");
  if (!validCents(input.agreedRentalBasisCents) || !validCents(input.paidOptionCents)) return review("amount_unverified");
  if (!input.freeCancellationOptionAgreed && input.paidOptionCents > 0) return review("option_unverified");
  if (received >= start && input.reason !== "no_show") return review("rental_already_started");
  if (input.reason === "no_show" && recorded < start) return review("no_show_before_start");
  const noticeHours = (start - received) / HOUR;
  const freeCancellationApplies = input.reason !== "no_show" && input.freeCancellationOptionAgreed && noticeHours >= 72;
  const band = BANDS.find(candidate => noticeHours >= candidate.hours) ?? BANDS[BANDS.length - 1];
  const ratePercent = freeCancellationApplies ? 0 : input.reason === "no_show" ? (input.customerKind === "private" ? 85 : 90) : band[input.customerKind];
  const compensationBasisCents = Math.round(input.agreedRentalBasisCents * ratePercent / 100);
  if (!Number.isSafeInteger(compensationBasisCents)) return review("amount_unverified");
  return {
    kind: "estimate",
    termsVersion: input.termsVersion,
    priceBasis: input.customerKind === "private" ? "gross" : "net",
    noticeHours,
    ratePercent,
    compensationBasisCents,
    retainedPaidOptionCents: input.paidOptionCents,
    freeCancellationApplies,
    executionAllowed: false,
  };
}

/** Individual fees are entered as the final compensation amount, not a rental day rate. */
export function cancellationInvoiceItems(feeCents: number, priceBasis: "gross" | "net", vatRate: 0 | 19, paidOptionNetCents = 0) {
  if (!validCents(feeCents) || !validCents(paidOptionNetCents) || ![0, 19].includes(vatRate) || !["gross", "net"].includes(priceBasis)) throw new Error("Ungültige Stornogebühr");
  const net = priceBasis === "gross" ? Math.round(feeCents / (1 + vatRate / 100)) : feeCents;
  return [
    { product_name: "Stornogebühr", description: vatRate === 0 ? "Pauschalierte Entschädigung; nicht steuerbar" : "Vereinbarte Stornoleistung", quantity: 1, articles: 1, duration: 1, unit: "Pauschal", unit_price: net / 100, discount_percent: 0, vat_rate: vatRate, period_free: true },
    ...(paidOptionNetCents > 0 ? [{ product_name: "Stornooption – einbehaltener Aufpreis", description: "Vereinbarter Aufpreis für kostenfreie Stornierung", quantity: 1, articles: 1, duration: 1, unit: "Pauschal", unit_price: paidOptionNetCents / 100, discount_percent: 0, vat_rate: 19 as const, period_free: true }] : []),
  ];
}