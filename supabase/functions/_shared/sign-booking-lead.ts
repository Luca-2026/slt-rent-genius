export type SignPermitMode = "existing" | "slt";
export function berlinDay(now: number): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  return ["year", "month", "day"].map(key => parts.find(p => p.type === key)?.value).join("-");
}
function dayShift(day: string, count: number) { return new Date(Date.parse(`${day}T12:00:00Z`) + count * 86400000).toISOString().slice(0, 10); }
export function nrwWorkday(day: string): boolean {
  const year = Number(day.slice(0, 4));
  const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), date = (h + l - 7 * m + 114) % 31 + 1;
  const easter = `${year}-${String(month).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
  return new Date(`${day}T12:00:00Z`).getUTCDay() !== 0 && !["01-01", "05-01", "10-03", "11-01", "12-25", "12-26"].includes(day.slice(5)) && ![-2, 1, 39, 50, 60].some(offset => day === dayShift(easter, offset));
}
export function signEarliestDay(mode: SignPermitMode, now = Date.now()): string {
  if (mode === "existing") return berlinDay(now + 96 * 3600000);
  let day = berlinDay(now), count = 0;
  while (count < 14) { day = dayShift(day, 1); if (nrwWorkday(day)) count++; }
  return day;
}
export function berlinTimestamp(day: string, time: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return NaN;
  const guess = Date.parse(`${day}T${time}:00Z`);
  const local = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).format(guess).replace(" ", "T");
  return guess - (Date.parse(`${local}Z`) - guess);
}
export function signLeadError(pkg: string, mode: SignPermitMode | null | undefined, day: string, time: string, now = Date.now()): string | null {
  if (pkg !== "sorglos") return null;
  if (mode !== "existing" && mode !== "slt") return "Bitte wählen: Genehmigung schon vorhanden oder Genehmigung durch SLT.";
  if (mode === "slt") return day >= signEarliestDay(mode, now) ? null : "Genehmigung durch SLT benötigt mindestens 14 Werktage Vorlauf (Mo–Sa, ohne NRW-Feiertage).";
  return berlinTimestamp(day, time) >= now + 96 * 3600000 ? null : "Bei vorhandener Genehmigung benötigen wir mindestens 96 Stunden Vorlauf bis zur Aufstellung.";
}