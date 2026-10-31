import { netToGross } from './priceDisplay';
import { parsePriceValue } from './catalogPricing';

export function seoRentalOffer(input: { pricePerMonth?: string; pricePerDay?: string; url: string; availability?: string }) {
  const source = input.pricePerMonth || input.pricePerDay;
  if (!source) return undefined;
  const amount = parsePriceValue(source);
  if (amount === undefined || !Number.isFinite(amount) || amount <= 0) return undefined;
  const price = netToGross(amount).toFixed(2);
  const unitCode = input.pricePerMonth ? 'MON' : 'DAY';
  return {
    '@type': 'Offer', url: input.url, price, priceCurrency: 'EUR',
    businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut',
    ...(input.availability ? { availability: input.availability } : {}),
    priceSpecification: { '@type': 'UnitPriceSpecification', price, priceCurrency: 'EUR', unitCode, valueAddedTaxIncluded: true },
  };
}