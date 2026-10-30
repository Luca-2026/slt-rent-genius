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