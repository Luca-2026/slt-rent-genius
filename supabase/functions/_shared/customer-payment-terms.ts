/** Private customers may only prepay; custom text must not bypass that rule. */
export function allowsCustomerPaymentTerms(customerKind: unknown, terms: unknown): boolean {
  if (customerKind === "business") return true;
  return terms === "vorkasse" || terms === "anzahlung_30" || terms === "rentpair_vorkasse" || !terms;
}

export function safeCustomerPaymentTerms(customerKind: unknown, terms: string, invoice: boolean): string {
  const normalized = terms === "rentpair_vorkasse" ? "vorkasse" : terms;
  if (!allowsCustomerPaymentTerms(customerKind, normalized) || (invoice && customerKind !== "business" && normalized !== "vorkasse")) {
    return invoice ? "vorkasse" : "anzahlung_30";
  }
  return normalized;
}

/** Only an unambiguous calendar deadline anchored to the invoice date is computable. */
export function customInvoicePaymentDays(text: string): number | null {
  const normalized = text.replace(/\s+/g, " ").trim();
  // Split payments and receipt/workday deadlines cannot be dated from invoice issuance.
  if (/%|arbeitstag|werktag|rechnungseingang/i.test(normalized)) return null;
  const matches = [...normalized.matchAll(/\b(?:innerhalb\s+von\s+)?(\d{1,3})\s+(?:Kalendertagen?|Tagen?)\s+nach\s+(?:dem\s+)?(?:Rechnungsdatum|Rechnungsstellung)\b/gi)];
  if (matches.length !== 1) return null;
  return Number(matches[0]?.[1]);
}

export function invoicePaymentDueDate(invoiceDate: Date, days: number): Date {
  const date = new Date(invoiceDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

/** Invoice defaults inherit the agreement, while explicit staff choices remain explicit. */
export function invoicePaymentAgreement(customerKind: unknown, requested: unknown, offered: unknown, requestedCustom: unknown, offeredCustom: unknown) {
  const allowed = ["net_7", "net_14", "net_30", "vorkasse", "custom"];
  const explicit = typeof requested === "string" && allowed.includes(requested);
  const agreed = typeof offered === "string" && allowed.includes(offered) ? offered : null;
  let terms = explicit ? requested as string : agreed ?? (customerKind === "business" ? "net_14" : "vorkasse");
  const custom = String((explicit ? requestedCustom : offeredCustom) ?? "").trim().slice(0, 600);
  terms = safeCustomerPaymentTerms(customerKind, terms, true);
  const days: Record<string, number> = { vorkasse: 0, net_7: 7, net_14: 14, net_30: 30 };
  return { terms, custom: terms === "custom" ? custom : "", days: terms === "custom" ? customInvoicePaymentDays(custom) : days[terms] ?? 14 };
}