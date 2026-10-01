/**
 * jsonb speichert Objekt-Schlüssel sortiert (kurze zuerst) – die im CMS per
 * Drag & Drop festgelegte Reihenfolge liegt daher separat in `spec_order`.
 * Schlüssel, die nicht in `order` stehen, folgen in ihrer bisherigen Reihenfolge.
 */
export function orderSpecs<V>(specs: Record<string, V> | null | undefined, order: string[] | null | undefined): Record<string, V> {
  const src = specs ?? {};
  if (!order?.length) return { ...src };
  const out: Record<string, V> = {};
  for (const k of order) if (k in src) out[k] = src[k];
  for (const k of Object.keys(src)) if (!(k in out)) out[k] = src[k];
  return out;
}
