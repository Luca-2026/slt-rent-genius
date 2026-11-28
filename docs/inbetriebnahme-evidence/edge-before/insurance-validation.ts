import { computeAddonAmount, daysPerUnit } from './addon-calc.ts';
import type { InquiryOfferItem } from './inquiry-offer-math.ts';
/** New rental offers/amendments must explicitly convert legacy flat insurance;
 * issued invoices and original historical evidence are never reinterpreted. */
export function assertCalendarInsurance(items: InquiryOfferItem[]) {
  for (const [index, item] of items.entries()) for (const addon of item.addons ?? []) {
    if (!/maschinenbruch/i.test(`${addon.key} ${addon.label}`)) continue;
    if (addon.basis !== 'full_period' || !['per_unit','percent'].includes(addon.price_type ?? '') || !Number.isInteger(addon.days) || Number(addon.days) < 1 || Number(addon.days) > 3660 || !Number.isFinite(addon.rate) || Number(addon.rate) < 0) throw new Error(`Position ${index+1}: Maschinenbruchversicherung benötigt Tagessatz und Kalendertage; alte Pauschale bitte ausdrücklich umstellen.`);
    if (!/selbstbehalt\s*[:\-]?\s*\d/i.test(`${addon.note ?? ''} ${addon.label}`)) throw new Error(`Position ${index+1}: Selbstbehalt der Maschinenbruchversicherung fehlt.`);
    const articles=Math.max(1,Number(item.articles)||1);
    const expected=computeAddonAmount({price_type:addon.price_type,rate:Number(addon.rate),basis:'full_period',days:addon.days},{articles,duration:item.quantity/articles,days_per_unit:daysPerUnit(item.unit),unit_price:item.unit_price,discount_percent:item.discount_percent});
    if (expected === null || Math.abs(expected-addon.amount)>0.011) throw new Error(`Position ${index+1}: Versicherungssumme stimmt nicht mit Tagessatz und Kalendertagen überein.`);
  }
}