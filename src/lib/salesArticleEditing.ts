import type { NewMachineRow, SalesArticleKind, UsedMachineRow } from "@/hooks/useSalesCatalog";

/** Sales goods need not have a model designation; never invent one. */
export function salesArticleValidation(form: { brand: string; category: string }): string | null {
  if (!form.brand.trim()) return "Bitte Hersteller / Marke angeben.";
  if (!form.category.trim()) return "Bitte eine Kategorie angeben.";
  return null;
}

/** A copy keeps maintained product facts, but not identity, publication or reference numbers. */
export function salesArticleCopy(kind: SalesArticleKind, row: NewMachineRow | UsedMachineRow, id: string) {
  const copy = structuredClone(row);
  copy.id = id;
  copy.slug = `${(row.slug || "verkaufsartikel").slice(0, 42)}-kopie-${id}`;
  copy.is_featured = false;
  if (kind === "new") {
    const next = copy as NewMachineRow;
    next.is_active = false;
    next.article_number = null;
    next.gtin = null;
  } else {
    const next = copy as UsedMachineRow;
    next.status = "hidden";
    next.reference_number = null;
  }
  return copy;
}