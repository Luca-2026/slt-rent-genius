import { describe, expect, it } from 'vitest';
import { seoPath } from '../lib/seoUrl';
import { seoPublicImage } from '../lib/seoPublicImage';
describe('SEO output URLs without CMS mutations', () => {
  it('encodes umlauts once', () => {
    expect(seoPath('/mieten/bonn/werkzeuge/einhell-laubbläser/')).toBe('/mieten/bonn/werkzeuge/einhell-laubbl%C3%A4ser/');
    expect(seoPath('/mieten/bonn/werkzeuge/einhell-laubbl%C3%A4ser/')).toBe('/mieten/bonn/werkzeuge/einhell-laubbl%C3%A4ser/');
  });
  it('maps legacy image references to existing public assets', () => {
    expect(seoPublicImage('/src/assets/products/geschirr/buffet-tellerwaermer-1.jpeg')).toBe('/product-images/geschirr/buffet-tellerwaermer-1.jpeg');
  });
});