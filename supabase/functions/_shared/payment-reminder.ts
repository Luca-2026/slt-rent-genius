/**
 * Zahlungserinnerung vor Mietbeginn (getestet: payment-reminder_test.ts / src/test/paymentReminder.test.ts).
 * Regel: angenommenes Angebot, offener Betrag > 0, keine Zahlung auf Rechnung,
 * Mietbeginn innerhalb der nächsten 48 Stunden (bei später Annahme sofort), höchstens einmal je Anfrage.
 */
export const REMINDER_WINDOW_HOURS = 48;
const INVOICE = new Set(["net_7", "net_14", "net_30", "custom"]);

export interface ReminderCandidate {
  status: string | null;
  start_date: string | null; // YYYY-MM-DD (Berlin)
  start_time?: string | null; // HH:MM
  customer_email: string | null;
  offer_number: string | null;
  payment_reminder_sent_at: string | null;
  payment_terms: string | null;
  open_cents: number;
}

/** Mietbeginn als UTC-Zeitpunkt (Berlin, Standard 08:00). */
export function rentalStartUtc(date: string, time?: string | null): Date {
  const hhmm = /^\d{2}:\d{2}/.test(time ?? "") ? String(time).slice(0, 5) : "08:00";
  const guess = new Date(`${date}T${hhmm}:00Z`);
  const berlin = new Date(guess.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
  const utc = new Date(guess.toLocaleString("en-US", { timeZone: "UTC" }));
  return new Date(guess.getTime() - (berlin.getTime() - utc.getTime()));
}

export function needsPaymentReminder(c: ReminderCandidate, now: Date): boolean {
  if (c.status !== "accepted") return false;
  if (c.payment_reminder_sent_at) return false;
  if (!c.start_date || !c.offer_number) return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((c.customer_email ?? "").trim())) return false;
  if (c.open_cents <= 0) return false;
  if (INVOICE.has(c.payment_terms ?? "")) return false;
  const start = rentalStartUtc(c.start_date, c.start_time).getTime();
  if (start <= now.getTime()) return false; // Miete läuft schon – keine Vorab-Erinnerung mehr
  return start - now.getTime() <= REMINDER_WINDOW_HOURS * 3600 * 1000;
}
