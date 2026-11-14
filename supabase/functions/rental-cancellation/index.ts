import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "https://esm.sh/zod@3.23.8";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { estimateRentalCancellation, cancellationInvoiceItems } from "../_shared/rental-cancellation.ts";
import { buildOfferTotals, lineTotal } from "../_shared/inquiry-offer-math.ts";

const Body = z.object({
  action: z.enum(["preview", "confirm"]), inquiry_id: z.string().uuid(),
  expected_updated_at: z.string().datetime({ offset: true }).optional(),
  received_at: z.string().datetime({ offset: true }), reason: z.string().trim().min(3).max(1000),
  mode: z.enum(["agb", "individual"]), fee_cents: z.number().int().min(0).max(100000000).optional(),
  vat_rate: z.union([z.literal(0), z.literal(19)]), tax_confirmed: z.literal(true),
  terms_confirmed: z.boolean(), no_show: z.boolean(),
});
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function berlinInstant(date: string, time: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const local = `${date}T${time}:00`;
  const formatter = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
  const matches = ["+01:00", "+02:00"].map(offset => new Date(`${local}${offset}`)).filter(d => Number.isFinite(d.getTime()) && formatter.format(d).replace(" ", "T") === local);
  return matches.length === 1 ? matches[0].toISOString() : null;
}

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const token = req.headers.get("Authorization")?.replace(/^Bearer /, "");
    if (!token) return json({ error: "Nicht angemeldet" }, 401);
    const service = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", { auth: { persistSession: false } });
    const { data: auth, error: authError } = await service.auth.getUser(token);
    if (authError || !auth.user) return json({ error: "Nicht angemeldet" }, 401);
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: "Bitte Stornoangaben vollständig prüfen" }, 400);
    const b = parsed.data;
    const { data: allowed, error: rightsError } = await service.rpc("can_edit_operations", { _user_id: auth.user.id });
    if (rightsError || !allowed) return json({ error: "Keine Berechtigung" }, 403);
    const { data: r, error: readError } = await service.from("rental_inquiries").select("*").eq("id", b.inquiry_id).single();
    if (readError || !r) return json({ error: "Auftrag nicht gefunden" }, 404);
    const { data: admin, error: adminError } = await service.rpc("has_role", { _user_id: auth.user.id, _role: "admin" });
    if (adminError) return json({ error: "Rechte konnten nicht geprüft werden" }, 403);
    if (!admin) {
      const { data: staff, error } = await service.from("staff_profiles").select("location,is_active").eq("user_id", auth.user.id).single();
      const location = (v: string) => /bonn/i.test(v) ? "bonn" : /krefeld|m.lheim/i.test(v) ? "krefeld" : v;
      if (error || !staff?.is_active || !r.location || location(staff.location ?? "") !== location(r.location)) return json({ error: "Keine Berechtigung für diesen Standort" }, 403);
    }
    if (r.cancelled_at) return json({ success: true, confirmed: true, snapshot: r.cancellation_payload });
    const [{ data: deliveries, error: deliveryError }, { data: invoices, error: invoiceError }, { data: transports, error: transportError }] = await Promise.all([
      service.from("b2b_delivery_notes").select("id").eq("rental_inquiry_id", r.id).in("status", ["signed", "signed_staff_only"]),
      service.from("inquiry_invoices").select("id,invoice_number,status,invoice_kind").eq("rental_inquiry_id", r.id).neq("status", "draft"),
      service.from("b2b_transport_orders").select("id").eq("rental_inquiry_id", r.id).eq("status", "done"),
    ]);
    if (deliveryError || invoiceError || transportError) return json({ error: "Vorhandene Belege konnten nicht geprüft werden" }, 409);
    if (deliveries?.length || transports?.length) return json({ error: "Bereits ausgeführte Übergabe oder Transportleistung: bitte individuelle Rückgabe-/Leistungsabrechnung verwenden." }, 409);
    // Existing invoices cannot silently become a second claim against the same payment.
    if (invoices?.length) return json({ error: "Bestehende Rechnungen zuerst über Stornieren / Gutschrift korrigieren und die Zahlungszuordnung prüfen. Ein zusätzlicher Stornobeleg ist hier noch nicht freigegeben.", existing_invoices: invoices }, 409);
    const payments = Array.isArray(r.payments) ? r.payments : [];
    const paid = payments.reduce((s: number, p: any) => s + Math.round(Number(p.amount ?? 0) * 100), 0);
    if (!Number.isSafeInteger(paid) || paid < 0) return json({ error: "Zahlungen müssen geprüft werden" }, 409);
    const payload = r.offer_payload ?? {};
    const items = Array.isArray(payload.items) ? payload.items : [];
    const rentalNet = items.filter((i: any) => !i.period_free).reduce((s: number, i: any) => s + lineTotal(i), 0);
    const optionNet = items.reduce((s: number, i: any) => s + (Array.isArray(i.addons) ? i.addons : []).filter((a: any) => !a.optional && /kostenfreie[-_]stornierung/.test(String(a.key))).reduce((v: number, a: any) => v + Number(a.amount ?? 0), 0), 0);
    const fullyPaid = paid >= Math.round((Number(r.offer_total_gross ?? 0) + Number(payload.deposit ?? 0)) * 100) && paid > 0;
    if (optionNet > 0 && paid > 0 && !fullyPaid) return json({ error: "Teilzahlung mit Stornooption: Zuordnung des bezahlten Optionsaufpreises muss zuerst geprüft werden." }, 409);
    const optionNetCents = fullyPaid ? Math.round(optionNet * 100) : 0;
    const kind = r.customer_kind === "business" ? "business" : "private";
    const start = berlinInstant(String(r.start_date ?? ""), String(r.start_time ?? ""));
    const estimate = estimateRentalCancellation({ customerKind: kind, termsVersion: b.terms_confirmed ? kind === "business" ? "b2b-may-2026" : "b2c-may-2026" : null, contractConfirmed: Boolean(r.order_confirmed_at), rentalStart: start, receivedAt: b.received_at, recordedAt: new Date().toISOString(), handedOver: false, openEnded: Boolean(r.installment_open_ended || payload.open_ended), partialCancellation: false, reason: b.no_show ? "no_show" : "customer_cancellation", agreedRentalBasisCents: items.length ? Math.round(rentalNet * (kind === "private" ? 1.19 : 1) * 100) : null, freeCancellationOptionAgreed: optionNet > 0, paidOptionCents: kind === "private" ? Math.round(optionNetCents * 1.19) : optionNetCents });
    if (b.mode === "agb" && estimate.kind !== "estimate") return json({ error: "AGB-Berechnung nicht eindeutig möglich. Vertragsnachweis und Zeitraum prüfen oder individuelle Gebühr vereinbaren.", estimate }, 409);
    if (Date.parse(b.received_at) > Date.now()) return json({ error: "Stornoeingang darf nicht in der Zukunft liegen" }, 400);
    const fee = b.mode === "individual" ? b.fee_cents : estimate.kind === "estimate" ? estimate.compensationBasisCents : undefined;
    if (fee == null) return json({ error: "Individuelle Gebühr fehlt" }, 400);
    const invoiceItems = cancellationInvoiceItems(fee, kind === "private" ? "gross" : "net", b.vat_rate, optionNetCents);
    const totals = buildOfferTotals(invoiceItems);
    const snapshot = { mode: b.mode, reason: b.reason, received_at: b.received_at, terms_confirmed: b.terms_confirmed, no_show: b.no_show, estimate, fee_cents: fee, price_basis: kind === "private" ? "gross" : "net", vat_rate: b.vat_rate, tax_confirmed: true, retained_option_net_cents: optionNetCents, invoice_items: invoiceItems, totals, original_offer_total_gross: r.offer_total_gross, deposit: Number(payload.deposit ?? 0), paid_cents: paid };
    if (b.action === "preview") return json({ success: true, confirmed: false, expected_updated_at: r.updated_at, snapshot });
    if (!b.expected_updated_at) return json({ error: "Zuerst Stornovorschau prüfen" }, 400);
    const { data, error } = await service.rpc("confirm_rental_cancellation", { _inquiry: r.id, _actor: auth.user.id, _expected: b.expected_updated_at, _snapshot: snapshot });
    if (error) return json({ error: error.message }, 409);
    return json({ success: true, confirmed: true, snapshot: data });
  } catch (error) {
    console.error("rental-cancellation", error);
    return json({ error: "Storno konnte nicht abgeschlossen werden. Bitte aktuellen Stand neu laden." }, 500);
  }
});