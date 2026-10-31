/** Resolve legacy source references without mutating stored CMS image values. */
export function seoPublicImage(value?: string): string | undefined {
  if (!value) return undefined;
  return value.replace(/^https:\/\/www\.slt-rental\.de\/src\/assets\/products\//, 'https://www.slt-rental.de/product-images/')
    .replace(/^\/src\/assets\/products\//, '/product-images/');
}