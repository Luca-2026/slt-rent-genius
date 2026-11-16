/** Explicit empty input means no place; delivery cities must never fall back to a branch. */
export function protocolSignedPlace(kind: "delivery" | "return", input: string | null | undefined, inquiry: { delivery_requested?: boolean; delivery_city?: string | null }, branchName: string): string {
  if (kind === "return") return branchName;
  if (input !== undefined) return (input ?? "").trim();
  return inquiry.delivery_requested ? inquiry.delivery_city?.trim() ?? "" : branchName;
}