import { describe, it, expect } from 'vitest';
import { seoRentalOffer } from '../lib/seoProductOffer';
describe('unchanged CMS price in rental structured data', () => {
  it('preserves decimal euros and applies existing gross display once', () => {
    expect(seoRentalOffer({ pricePerDay: '12.50 €', url: '/test' })?.price).toBe('14.88');
  });
  it('uses monthly units for monthly offers', () => {
    expect(seoRentalOffer({ pricePerMonth: '100,00 €', pricePerDay: '20 €', url: '/test' })?.priceSpecification.unitCode).toBe('MON');
  });
  it('does not invent prices for quote-only articles', () => {
    expect(seoRentalOffer({ pricePerDay: 'Auf Anfrage', url: '/test' })).toBeUndefined();
  });
  it('reads the CMS construction base rate without changing it', () => {
    expect(seoRentalOffer({ dailyNet: 100, url: '/test' })?.price).toBe('119.00');
  });
  it('never converts an event bundle into a daily offer', () => {
    expect(seoRentalOffer({ dailyNet: 100, eventBundle: true, url: '/test' })).toBeUndefined();
  });
});