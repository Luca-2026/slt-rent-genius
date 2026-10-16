/** Auftrags-ID (#ABC123) für E-Mail-Betreffs. Die ID vergibt die Datenbank, hier wird sie nur gelesen. */
// deno-lint-ignore no-explicit-any
type Svc = any;

export const subjectWithCode = (subject: string, code?: string | null) =>
  code ? `${subject} · Auftrag #${code}` : subject;

export async function orderCodeFor(
  svc: Svc,
  ref: { table?: string | null; id?: string | null; reservationId?: string | null },
): Promise<string | null> {
  try {
    if (ref.table && ref.id && ["rental_inquiries", "sales_inquiries"].includes(ref.table)) {
      const { data } = await svc.from(ref.table).select("order_code").eq("id", ref.id).maybeSingle();
      if (data?.order_code) return data.order_code;
    }
    if (ref.reservationId) {
      const { data } = await svc.from("b2b_reservations").select("order_code").eq("id", ref.reservationId).maybeSingle();
      if (data?.order_code) return data.order_code;
    }
  } catch (_e) { /* Betreff ohne ID ist kein Versandhindernis */ }
  return null;
}

/** Betreff mit Auftrags-ID, Datenbank-Lookup inklusive. */
export async function codedSubject(
  svc: Svc,
  subject: string,
  ref: { table?: string | null; id?: string | null; reservationId?: string | null },
): Promise<string> {
  return subjectWithCode(subject, await orderCodeFor(svc, ref));
}
