import { z } from "zod";

export function canManageCreditChecks(isAdmin: boolean, isBranchManager: boolean, isActiveStaff: boolean) {
  return isAdmin || (isBranchManager && isActiveStaff);
}

export const creditAssessmentSchema = z.object({
  company_name: z.string().trim().min(1).max(255),
  rating: z.string().trim().max(100).nullable(),
  recommended_limit: z.number().finite().nonnegative().max(999999999999.99).nullable(),
  notes: z.string().trim().max(4000),
}).refine((v) => Boolean(v.rating) || v.recommended_limit !== null, { message: "Bitte Rating oder Kreditlinienempfehlung eintragen." });

export const creditEuro = (value: number) => value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

type MatchCustomer = { id: string; customer_kind: string; company_name: string | null; first_name: string | null; last_name: string | null; postal_code: string | null; city: string | null };
const normalizeCompany = (value: string) => value.toLocaleLowerCase("de-DE").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, " ").trim();

/** Suggestions only: names alone never authorize a persistent customer association. */
export function findCreditCustomerMatches<T extends MatchCustomer>(customers: T[], company: string, postalCode = "", city = ""): T[] {
  const query = normalizeCompany(company);
  if (query.length < 3) return [];
  return customers.filter((c) => c.customer_kind === "business" || c.customer_kind === "b2b")
    .map((c) => {
      const name = normalizeCompany(c.company_name || [c.first_name, c.last_name].filter(Boolean).join(" "));
      const matches = name.includes(query) || (query.includes(name) && name.length >= 3);
      const score = (name === query ? 100 : 0) + (postalCode && postalCode.trim() === c.postal_code ? 20 : 0) + (city && normalizeCompany(city) === normalizeCompany(c.city || "") ? 10 : 0);
      return { c, matches, score };
    }).filter((r) => r.matches).sort((a, b) => b.score - a.score).map((r) => r.c).slice(0, 5);
}