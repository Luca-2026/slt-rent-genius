import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildOrderAmendment } from "../../supabase/functions/_shared/order-amendment";
const db = new PGlite();
const original = { direct_booking: true, deposit: 100, payment_terms: "vorkasse", items: [{ product_name: "Halteverbotsschilder-Set", product_slug: "halteverbotsschilder-set", quantity: 1, articles: 1, unit: "pauschal", unit_price: 39 / 1.19, start_date: "2026-11-24", end_date: "2026-12-03" }], totals: { netAmount: 32.77, vatAmount: 6.23, grossAmount: 39 } };
const amended = buildOrderAmendment({ deposit: 100, items: [{ ...original.items[0], rental_start: "2026-11-24", rental_end: "2026-12-03" }, { product_name: "Zusatzzeichen", product_slug: "vz-1060-31-ra1-gr-1", quantity: 1, articles: 1, unit_price: 6 / 1.19, rental_start: "2026-11-24", rental_end: "2026-12-03" }] }, original, "bonn");
beforeAll(async () => {
  await db.exec(`CREATE ROLE authenticated; CREATE ROLE anon; CREATE ROLE service_role; CREATE SCHEMA auth;
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT '22222222-2222-4222-8222-222222222222'::uuid $$;
  CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT 'service_role'::text $$;
  CREATE FUNCTION can_edit_operations(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;
  CREATE FUNCTION is_staff_member(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;
  CREATE TABLE rental_inquiries(id uuid PRIMARY KEY,status text,offer_number text,offer_payload jsonb,offer_total_gross numeric,start_date date,end_date date,offer_file_url text,offer_sent_at timestamptz,offer_accepted_at timestamptz,order_confirmation_number text,order_confirmation_file_url text,availability_pending boolean,b2b_reservation_id uuid,payments jsonb,payment_decision_version int DEFAULT 0);
  CREATE TABLE b2b_reservations(id uuid,inquiry_id uuid,start_date date,end_date date,updated_at timestamptz);
  CREATE TABLE deposit_settlements(rental_inquiry_id uuid);
  CREATE TABLE offer_payment_links(id uuid PRIMARY KEY,inquiry_id uuid,inquiry_table text,offer_number text,status text,stripe_session_id text,payment_intent_id text,amount_cents int,checkout_claim uuid,checkout_claimed_at timestamptz,checkout_request jsonb,updated_at timestamptz);
  CREATE TABLE sign_bookings(id uuid PRIMARY KEY,inquiry_id uuid,status text,expires_at timestamptz,total_cents int,confirmed_at timestamptz,confirmation_sent_at timestamptz,snapshot jsonb);
  CREATE TABLE b2b_managed_products(id uuid,slug text); CREATE TABLE b2b_instance_allocations(rental_inquiry_id uuid);
  CREATE TABLE rental_inquiry_events(rental_inquiry_id uuid,event text,details jsonb,user_id uuid);
  CREATE FUNCTION check_availability(uuid) RETURNS jsonb LANGUAGE sql AS $$ SELECT '{"all_available":true}'::jsonb $$;
  CREATE FUNCTION confirm_order(uuid,jsonb) RETURNS jsonb LANGUAGE sql AS $$ SELECT '{"mode":"confirm"}'::jsonb $$;`);
  await db.exec(readFileSync("drizzle/migrations/0115_rental_order_amendment_versions.sql", "utf8"));
  await db.exec(readFileSync("drizzle/migrations/0176_amendment_guard_settled_links.sql", "utf8"));
  await db.exec(readFileSync("drizzle/migrations/0107_sign_booking_payment_alias_fix.sql", "utf8"));
  const checkout = readFileSync("drizzle/migrations/0129_durable_rental_checkout_attempts.sql", "utf8").split("COMMENT ON COLUMN")[0].replace("AND id<>l.id AND status='active'", "AND id<>l.id");
  await db.exec(checkout);
  await db.exec(readFileSync("drizzle/migrations/0210_paid_sign_booking_amendments.sql", "utf8"));
  await db.exec("CREATE TRIGGER sign_payment AFTER UPDATE OF payments ON rental_inquiries FOR EACH ROW EXECUTE FUNCTION sign_booking_payment_state()");
}, 30000);
afterAll(() => db.close());
async function fixture(status = "paid") {
  const id = crypto.randomUUID();
  const receipt = { amount: 139, provider: "stripe", reference: `cs_${id}`, payment_intent_id: `pi_${id}` };
  await db.query("INSERT INTO rental_inquiries(id,status,offer_number,offer_payload,offer_total_gross,start_date,end_date,payments) VALUES($1,'accepted','ANG-ORIGINAL',$2,39,'2026-11-24','2026-12-03',$3)", [id, JSON.stringify(original), JSON.stringify([receipt])]);
  await db.query("INSERT INTO sign_bookings VALUES($1,$1,$2,now()-interval '2 days',13900,now()-interval '2 days',now()-interval '2 days',$3)", [id, status, JSON.stringify(original)]);
  await db.query("INSERT INTO offer_payment_links(id,inquiry_id,inquiry_table,offer_number,status,stripe_session_id,payment_intent_id,amount_cents) VALUES($1,$1,'rental_inquiries','ANG-ORIGINAL','paid',$2,$3,13900)", [id, receipt.reference, receipt.payment_intent_id]);
  return id;
}
const save = (id: string, payload: unknown = amended) => db.query("SELECT save_rental_order_amendment($1,0,$2,'Zusatzzeichen nach Genehmigungsprüfung',now())", [id, JSON.stringify(payload)]);
describe("Protected paid sign amendments", () => {
  it("saves appended signs, immutable original evidence and a 6 euro residual without altering the paid booking", async () => {
    const id = await fixture(); await save(id);
    const { rows } = await db.query<any>("SELECT r.offer_total_gross,r.order_revision,r.original_accepted_offer,r.start_date::text,r.end_date::text,b.status,b.snapshot FROM rental_inquiries r JOIN sign_bookings b ON b.inquiry_id=r.id WHERE r.id=$1", [id]);
    expect(Number(rows[0].offer_total_gross)).toBe(45); expect(rows[0].order_revision).toBe(1);
    expect(rows[0].original_accepted_offer.offer_payload).toEqual(original);
    expect(rows[0].status).toBe("paid"); expect(rows[0].snapshot).toEqual(original);
    expect(rows[0].start_date).toBe("2026-11-24"); expect(rows[0].end_date).toBe("2026-12-03");
  });
  it("rejects unpaid/expired direct bookings", async () => { await expect(save(await fixture("expired"))).rejects.toThrow(/bezahlte/); });
  it("rejects changing paid package prices", async () => { await expect(save(await fixture(), { ...amended, items: [{ ...amended.items[0], unit_price: 1 }, amended.items[1]] })).rejects.toThrow(/Positionen/); });
  it("rejects a forged total even when original lines are intact", async () => { await expect(save(await fixture(), { ...amended, totals: { ...amended.totals, grossAmount: 45.01 } })).rejects.toThrow(/summe/); });
  it("keeps paid reservation status after receiving the extra 6 euros", async () => {
    const id = await fixture(); await save(id);
    await expect(db.query("UPDATE rental_inquiries SET payments=payments||'[\"invalid\"]'::jsonb WHERE id=$1", [id])).rejects.toThrow(/centgenaue/);
    await db.query("UPDATE rental_inquiries SET payments=payments||'[{\"amount\":6,\"provider\":\"stripe\",\"reference\":\"cs_extra\"}]'::jsonb WHERE id=$1", [id]);
    const { rows } = await db.query<any>("SELECT status,total_cents,snapshot FROM sign_bookings WHERE id=$1", [id]);
    expect(rows[0].status).toBe("paid"); expect(rows[0].total_cents).toBe(13900); expect(rows[0].snapshot).toEqual(original);
  });
  it("allows checkout after a provider-receipt-matched original payment, not an unresolved competing session", async () => {
    const id = await fixture(); await save(id); const link = crypto.randomUUID(), claim = crypto.randomUUID();
    await db.query("INSERT INTO offer_payment_links(id,inquiry_id,inquiry_table,offer_number,status,amount_cents) VALUES($1,$2,'rental_inquiries','ANG-ORIGINAL','active',600)", [link,id]);
    const request = { metadata: { choice: "full", amount_cents: "600", payment_decision_version: "0" } };
    const { rows } = await db.query<any>("SELECT begin_rental_checkout($1,0,$2,$3) as result", [link,claim,JSON.stringify(request)]);
    expect(rows[0].result.claim).toBe(claim);
    const blocked = await fixture();
    await db.query("INSERT INTO offer_payment_links(id,inquiry_id,inquiry_table,status,stripe_session_id,amount_cents) VALUES($1,$2,'rental_inquiries','superseded','cs_unresolved',600)", [crypto.randomUUID(),blocked]);
    await expect(save(blocked)).rejects.toThrow(/abgleichen/);
  });
});