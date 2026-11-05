import { priceBankTransfer, hasBankDiscountPolicy } from "../../supabase/functions/_shared/bank-transfer-discount";
import { invoiceBankDiscount } from "../../supabase/functions/_shared/invoice-bank-discount";
import type { OfferLine } from "@/components/b2b/inquiries/offerMath";

/** Convert editor article counts to server billing quantities exactly once. */
export function editorBankDiscount<T extends OfferLine>(lines: T[], costs: number, policy: unknown, kind: "amendment" | "invoice" | "supplement" | "final", settlement = false): T[] {
  if (!hasBankDiscountPolicy(policy)) return lines;
  const server = lines.map(line => ({ ...line, quantity: line.quantity * (line.duration && line.duration > 0 ? line.duration : 1) }));
  const priced = kind === "amendment" ? priceBankTransfer(server, costs, policy.selected).items : invoiceBankDiscount(server, costs, policy, kind, settlement).items;
  return lines.map((line, index) => ({ ...line, addons: priced[index]?.addons ?? [] }));
}