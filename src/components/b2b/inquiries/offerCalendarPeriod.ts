import { rentalDuration, type RentalDayOptions } from "@/lib/pricing/rentalPricing";
import type { OfferLine } from "./offerMath";

// Legacy inquiry descriptions consisted only of a formatted rental period.
const LEGACY_PERIOD = /^(?:(?:Mo|Di|Mi|Do|Fr|Sa|So)\.?[,]?\s*)?\d{1,2}\.\s*\d{1,2}\.\s*\d{4}(?:[,]?\s*\d{1,2}:\d{2})?\s*[–—-]\s*(?:(?:Mo|Di|Mi|Do|Fr|Sa|So)\.?[,]?\s*)?\d{1,2}\.\s*\d{1,2}\.\s*\d{4}(?:[,]?\s*\d{1,2}:\d{2})?$/;

export function withoutLegacyPeriod(text?: string | null): string {
  return (text ?? "").split(/\s*·\s*|\n/).filter((part) => !LEGACY_PERIOD.test(part.trim())).join(" · ").trim();
}

export function calendarDescription(line: OfferLine): string {
  const text = withoutLegacyPeriod(line.description_override?.trim() || line.description);
  if (!line.rental_start) return text;
  const moment = (date: string, time?: string) => {
    const [year, month, day] = date.slice(0, 10).split("-");
    return `${day}.${month}.${year}${time ? `, ${time}` : ""}`;
  };
  const period = `Mietzeitraum: ${moment(line.rental_start, line.rental_start_time)}${line.rental_end ? ` – ${moment(line.rental_end, line.rental_end_time)}` : ""}`;
  return [text, period].filter(Boolean).join(" · ");
}

export function calendarDuration<T extends OfferLine>(line: T, opts: RentalDayOptions): T {
  if (!line.rental_start || !line.rental_end || line.protocol_charge_source) return line;
  const days = rentalDuration({ date: line.rental_start }, { date: line.rental_end }, "kalendertage");
  return { ...line, duration: rentalDuration(
    { date: line.rental_start, time: line.rental_start_time },
    { date: line.rental_end, time: line.rental_end_time },
    line.unit ?? "kalendertage", opts,
  ), addons: line.addons?.map((addon) => addon.basis === "full_period" && !addon.days_manual && !addon.manual
    ? { ...addon, days, period_start: line.rental_start, period_end: line.rental_end }
    : addon) };
}

export function inheritCalendarPeriod<T extends OfferLine>(line: T, base: OfferLine): T {
  return { ...line, rental_start: base.rental_start, rental_end: base.rental_end,
    rental_start_time: base.rental_start_time, rental_end_time: base.rental_end_time };
}