/** Shared matching for staff names and document/order/booking identifiers. */
export function normalizeStaffSearch(value: string): string {
  return value.toLocaleLowerCase("de")
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/#/g, "").replace(/\s+/g, " ").trim();
}

export function matchesStaffSearch(query: string, values: readonly (string | null | undefined)[]): boolean {
  const terms = normalizeStaffSearch(query).split(" ").filter(Boolean);
  const fields = values.map(value => normalizeStaffSearch(value ?? ""));
  return terms.every(term => fields.some(field => field.includes(term)));
}

export async function loadAllSearchRows<T>(fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const rows: T[] = [];
  const pageSize = 500;
  for (let from = 0; ; from += pageSize) {
    const result = await fetchPage(from, from + pageSize - 1);
    if (result.error) throw result.error;
    const page = result.data ?? [];
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}