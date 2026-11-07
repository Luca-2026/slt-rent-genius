import type { OfferLine } from "./offerMath";

export type ServiceKind = "setup" | "dismantle";
export type ServiceUnit = "personnel_hours" | "hours" | "daily" | "flat";
export const SERVICE_UNITS: { value: ServiceUnit; label: string }[] = [
  { value: "personnel_hours", label: "Personalstunden" },
  { value: "hours", label: "Stunden" },
  { value: "daily", label: "Tagespauschale" },
  { value: "flat", label: "Pauschale" },
];
export function serviceName(kind: ServiceKind) { return kind === "setup" ? "Aufbau" : "Abbau"; }
export function serviceUnit(line: OfferLine): ServiceUnit {
  return SERVICE_UNITS.find(u => line.description === `Abrechnung: ${u.label}`)?.value ?? "flat";
}
export function isLogisticsService(line: OfferLine, kind?: ServiceKind): boolean {
  return line.period_free === true && (kind ? line.product_name === serviceName(kind) : ["Aufbau", "Abbau"].includes(line.product_name)) && SERVICE_UNITS.some(u => line.description === `Abrechnung: ${u.label}`);
}
export function logisticsService(kind: ServiceKind, unit: ServiceUnit = "flat", quantity = 1, price = 0): OfferLine {
  const label = SERVICE_UNITS.find(u => u.value === unit)?.label ?? "Pauschale";
  return { product_name: serviceName(kind), description: `Abrechnung: ${label}`, period_free: true, vat_rate: 19, payment_cost_kind: "rental", quantity, duration: 1, unit: "stueck", unit_price: price, discount_percent: 0, price_manual: true };
}
export function migrateServiceCosts<T extends OfferLine>(items: T[], setup: number, dismantle: number): (T | OfferLine)[] {
  return [...items, ...(setup > 0 && !items.some(i => isLogisticsService(i, "setup")) ? [logisticsService("setup", "flat", 1, setup)] : []), ...(dismantle > 0 && !items.some(i => isLogisticsService(i, "dismantle")) ? [logisticsService("dismantle", "flat", 1, dismantle)] : [])];
}