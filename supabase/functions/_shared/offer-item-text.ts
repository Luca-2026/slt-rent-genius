/** Customer-facing snapshot overrides take precedence over the linked catalogue label. */
export function offerItemText(item: { product_name?: string | null; description?: string | null; name_override?: string | null; description_override?: string | null }) {
  return {
    product_name: item.name_override || item.product_name,
    description: item.description_override || item.description,
  };
}