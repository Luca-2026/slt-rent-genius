/**
 * Datumsanzeige für Anrufe nach deutschem Kalendertag (Europe/Berlin):
 * heute → „Heute, 10:30“, gestern → „Gestern, 23:30“, bis 6 Tage → „Di, 14.10., 09:15“, älter → „14.10.2026, 09:15“.
 */
const TZ = "Europe/Berlin";

function berlinDayKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

function dayDiff(a: string, b: string): number {
  return Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86_400_000);
}

export function callDateLabel(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const time = new Intl.DateTimeFormat("de-DE", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(d);
  const diff = dayDiff(berlinDayKey(now), berlinDayKey(d));
  if (diff === 0) return `Heute, ${time}`;
  if (diff === 1) return `Gestern, ${time}`;
  if (diff > 1 && diff < 7) {
    const wd = new Intl.DateTimeFormat("de-DE", { timeZone: TZ, weekday: "short" }).format(d).replace(".", "");
    const dm = new Intl.DateTimeFormat("de-DE", { timeZone: TZ, day: "2-digit", month: "2-digit" }).format(d);
    return `${wd}, ${dm}, ${time}`;
  }
  const full = new Intl.DateTimeFormat("de-DE", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
  return `${full}, ${time}`;
}
