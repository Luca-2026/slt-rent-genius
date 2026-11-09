import { describe, expect, it } from 'vitest';
import { buildProductSchemas } from '../data/schemas-rental';
import type { PrerenderProduct } from '../data/seo-routes-rental';

const product: PrerenderProduct = {
  id: 'ms01-grabenraeumloeffel-hydr-80cm', name: 'MS01 Grabenräumlöffel hydr. 80cm/52l',
  locationId: 'krefeld', category: 'erdbewegung', hasSEO: true,
};

describe('rental Product rich-result eligibility', () => {
  it('does not emit a Product without a real offer or product reviews', () => {
    const schemas = buildProductSchemas(product);
    expect(schemas.some(schema => schema['@type'] === 'Product')).toBe(false);
    expect(schemas.some(schema => schema['@type'] === 'BreadcrumbList')).toBe(true);
    expect(schemas.some(schema => schema['@type'] === 'LocalBusiness')).toBe(true);
  });
  it('retains genuine daily offers with one net-to-gross conversion', () => {
    const result = buildProductSchemas({ ...product, seoDailyNet: 100 }).find(schema => schema['@type'] === 'Product');
    expect(result?.offers).toMatchObject({ price: '119.00', priceCurrency: 'EUR' });
    expect(result).not.toHaveProperty('aggregateRating');
  });
  it('retains a real event package as a package, not a daily rate', () => {
    const result = buildProductSchemas({ ...product, seoEventBundle: true, seoBundleNet: 6 }).find(schema => schema['@type'] === 'Product');
    expect(result?.offers).toMatchObject({ price: '7.14', priceSpecification: { '@type': 'PriceSpecification' } });
  });
});