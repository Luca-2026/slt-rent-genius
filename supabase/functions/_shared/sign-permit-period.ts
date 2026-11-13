/** Customer-declared permit data for standard sign rentals; the sign labelling period may differ from the rental period. */
export type SignPermitPeriod = { permitValidFrom: string; permitValidUntil: string; permitIssuedOn: string; permitValidFromTime?: string; permitValidUntilTime?: string };
export const SIGN_PERMIT_HOURS = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}:00`);
const iso = /^\d{4}-\d{2}-\d{2}$/;
const valid = (v: string) => iso.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) && new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v;
const berlinToday = (now: number) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date(now));

export function signPermitPeriodError(p: Partial<SignPermitPeriod>, rentalStart: string, rentalEnd: string, now = Date.now()): string | null {
  const { permitValidFrom: from = "", permitValidUntil: until = "", permitIssuedOn: issued = "" } = p;
  if (!valid(from) || !valid(until) || !valid(issued)) return "Bitte Genehmigungszeitraum (von/bis) und Datum der Genehmigung angeben.";
  if (until < from) return "Das Ende der Genehmigung darf nicht vor dem Beginn liegen.";
  const { permitValidFromTime: startTime, permitValidUntilTime: endTime } = p;
  if (startTime !== undefined || endTime !== undefined) {
    if (!startTime || !endTime || !SIGN_PERMIT_HOURS.includes(startTime) || !SIGN_PERMIT_HOURS.includes(endTime)) return "Bitte Beginn und Ende der Genehmigung in vollen Stunden angeben.";
    if (from === until && endTime < startTime) return "Das Ende der Genehmigung darf nicht vor dem Beginn liegen.";
  }
  if (issued > berlinToday(now)) return "Das Datum der Genehmigung darf nicht in der Zukunft liegen.";
  if (issued > until) return "Die Genehmigung muss vor Ende des genehmigten Zeitraums ausgestellt sein.";
  if (from < rentalStart || until > rentalEnd) return "Der genehmigte Zeitraum muss innerhalb des Mietzeitraums liegen.";
  return null;
}
