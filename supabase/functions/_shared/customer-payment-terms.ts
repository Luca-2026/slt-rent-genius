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