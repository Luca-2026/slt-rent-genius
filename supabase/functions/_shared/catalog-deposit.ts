/** Explicit CMS facts only; absent or ambiguous deposit amounts remain unknown. */
export function catalogDeposit(product: { deposit_amount?: number | null; specifications?: unknown; rental_notes?: unknown }): number | null {
  if (product.deposit_amount != null) return Number.isFinite(product.deposit_amount) && product.deposit_amount >= 0 ? product.deposit_amount : null;
  const specs = product.specifications;
  const value = specs && typeof specs === "object" && !Array.isArray(specs)
    ? Object.entries(specs).find(([key]) => key.trim().toLowerCase() === "kaution")?.[1] : undefined;
  const notes = Array.isArray(product.rental_notes) ? product.rental_notes : [];
  const source = value ?? notes.find(note => typeof note === "string" && /^Kaution\s+[\d.,]+\s*€\s*$/i.test(note.trim()));
  if (typeof source === "number") return Number.isFinite(source) && source >= 0 ? source : null;
  if (typeof source !== "string") return null;
  const match = /^(?:Kaution\s+)?(\d+(?:\.\d{3})*(?:,\d{1,2})?)\s*(?:€|EUR)\s*$/i.exec(source.trim());
  return match ? Number(match[1].replace(/\./g, "").replace(",", ".")) : null;
}