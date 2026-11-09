import { netToGross } from './priceDisplay';
import { parsePriceValue } from './catalogPricing';

export function seoRentalOffer(input: { pricePerMonth?: string; pricePerDay?: string; dailyNet?: number | null; eventBundle?: boolean; bundleNet?: number | null; url: string; availability?: string }) {
  const source = input.pricePerMonth || input.pricePerDay;
  // A genuine 1–3-day package is an Offer, but never a daily unit price.
  const amount = input.eventBundle ? input.bundleNet : input.pricePerMonth ? parsePriceValue(input.pricePerMonth) : input.dailyNet ?? parsePriceValue(source);
  if (amount === undefined || !Number.isFinite(amount) || amount <= 0) return undefined;
  const price = netToGross(amount).toFixed(2);
  const unitCode = input.pricePerMonth ? 'MON' : 'DAY';
  return {
    '@type': 'Offer', url: input.url, price, priceCurrency: 'EUR',
    businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut',
    ...(input.availability ? { availability: input.availability } : {}),
    ...(input.eventBundle ? { eligibleDuration: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' } } : {}),
    priceSpecification: input.eventBundle
      ? { '@type': 'PriceSpecification', price, priceCurrency: 'EUR', valueAddedTaxIncluded: true }
      : { '@type': 'UnitPriceSpecification', price, priceCurrency: 'EUR', unitCode, valueAddedTaxIncluded: true },
  };
}