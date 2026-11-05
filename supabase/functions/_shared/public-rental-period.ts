/** Shared staffed pickup windows; null means closed, undefined means by appointment. */
export const publicPickupHours = {
  krefeld: { weekdays: { open: "08:00", close: "18:00" }, saturday: { open: "10:00", close: "14:30" } },
  bonn: { weekdays: { open: "07:00", close: "16:30" }, friday: { open: "07:00", close: "18:00" }, saturday: null },
} as const;
export function validCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function isSignSelfPickup(row: { product_slug?: string; sign_package?: string }): boolean {
  return row.product_slug === "halteverbotsschilder-set" && row.sign_package === "standard";
}
export function validPublicRentalPeriod(row: { location: string; start_date: string; end_date: string; start_time: string; end_time: string; product_slug?: string; sign_package?: string }): boolean {
  if (!validCalendarDate(row.start_date) || !validCalendarDate(row.end_date)) return false;
  const time = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!time.test(row.start_time) || !time.test(row.end_time) || `${row.end_date}T${row.end_time}` <= `${row.start_date}T${row.start_time}`) return false;
  if (isSignSelfPickup(row)) return row.location === "krefeld" || row.location === "bonn";
  if (row.location === "muelheim") return true; // Explicitly subject to appointment confirmation.
  const hours = publicPickupHours[row.location as keyof typeof publicPickupHours];
  if (!hours) return false;
  return [[row.start_date, row.start_time], [row.end_date, row.end_time]].every(([date, value]) => {
    const day = new Date(`${date}T12:00:00Z`).getUTCDay();
    const window = day === 0 ? null : day === 6 ? hours.saturday : day === 5 && "friday" in hours ? hours.friday : hours.weekdays;
    return !!window && value >= window.open && value <= window.close;
  });
}