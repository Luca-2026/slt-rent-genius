import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { newBankDiscountPolicy, priceBankTransfer } from "@/lib/bankTransferDiscount";
const db = new PGlite();
beforeAll(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth;
    CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT 'service_role' $$;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT NULL::uuid $$;
    CREATE FUNCTION public.is_staff_member(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;
    CREATE TABLE rental_inquiries(id uuid PRIMARY KEY,status text,offer_number text,offer_payload jsonb,payments jsonb,offer_total_gross numeric,offer_file_url text,original_accepted_offer jsonb);
    CREATE TABLE inquiry_invoices(rental_inquiry_id uuid,status text);
    CREATE TABLE deposit_settlements(rental_inquiry_id uuid);
    CREATE TABLE offer_payment_links(inquiry_id uuid,inquiry_table text,status text,stripe_session_id text,id uuid DEFAULT gen_random_uuid(),offer_number text);
    CREATE TABLE sign_bookings(inquiry_id uuid,status text,gross_cents int,total_cents int,deposit_cents int,snapshot jsonb);
    CREATE TABLE rental_inquiry_events(rental_inquiry_id uuid,event text,details jsonb);`);
  await db.exec(readFileSync("drizzle/migrations/0125_rental_bank_transfer_discount_decisions.sql", "utf8"));
  await db.exec(readFileSync("drizzle/migrations/0126_protect_bank_discount_snapshot_and_checkout.sql", "utf8"));
  await db.exec(readFileSync("drizzle/migrations/0128_serialize_rental_online_checkout_claims.sql", "utf8"));
  await db.exec(readFileSync("drizzle/migrations/0129_durable_rental_checkout_attempts.sql", "utf8"));
  await db.exec(`ALTER TABLE rental_inquiries ADD COLUMN paid_amount numeric;
    ALTER TABLE offer_payment_links ADD COLUMN amount_cents integer DEFAULT 23090, ADD COLUMN payment_intent_id text, ADD COLUMN paid_cents integer, ADD COLUMN paid_at timestamptz, ADD COLUMN warning text, ADD COLUMN updated_at timestamptz;
    CREATE TABLE stripe_webhook_events(event_id text PRIMARY KEY,type text,result text);`);
  await db.exec(readFileSync("drizzle/migrations/0130_atomic_rental_stripe_receipts.sql", "utf8"));
  await db.exec(readFileSync("drizzle/migrations/0131_harden_rental_payment_snapshot_guards.sql", "utf8"));
  await db.exec(readFileSync("drizzle/migrations/0132_bind_rental_receipts_to_durable_attempts.sql", "utf8"));
}, 30000);
afterAll(() => db.close());
async function fixture(payments: unknown[] = []) {
  const id = crypto.randomUUID();
  const items = [{ product_name: "Miete", quantity: 1, unit_price: 100, discount_percent: 0, addons: [{ key: "insurance", label: "Versicherung", amount: 10 }] }];
  const base = { items, totals: priceBankTransfer(items).totals, deposit: 100, bank_transfer_discount: newBankDiscountPolicy() };
  await db.query("INSERT INTO rental_inquiries(id,status,offer_number,offer_payload,payments,offer_total_gross,offer_file_url,original_accepted_offer,payment_decision_version) VALUES($1,'accepted','TEST',$2::jsonb,$3::jsonb,130.9,'original.pdf',NULL,0)", [id, JSON.stringify(base), JSON.stringify(payments)]);
  const priced = priceBankTransfer(items, 0, "bank");
  return { id, base, bank: { ...base, items: priced.items, totals: priced.totals, bank_transfer_discount: { ...base.bank_transfer_discount, selected: "bank" } } };
}
const decide = (id: string, payload: unknown, expected = 0, method = "bank") => db.query("SELECT select_rental_payment_method($1,'TEST',$2,$3,$4::jsonb)", [id, expected, method, JSON.stringify(payload)]);
describe("protected persisted bank discount", () => {
  it("retries an unfinished webhook and books completed/async deliveries exactly once", async () => {
    const f = await fixture();
    const link = (await db.query<{ id: string }>("INSERT INTO offer_payment_links(inquiry_id,inquiry_table,status,offer_number,stripe_session_id,checkout_request) VALUES($1,'rental_inquiries','active','TEST','cs_test',$2::jsonb) RETURNING id", [f.id, JSON.stringify({ metadata: { amount_cents: "23090" } })])).rows[0]?.id;
    if (!link) throw new Error("Missing link");
    await db.query("INSERT INTO stripe_webhook_events VALUES('evt_crash','completed',NULL)");
    const settle = (event: string, amount = 23090, version: number | null = 0) => db.query<{ settled: { added: boolean; result: string } }>("SELECT settle_rental_stripe_receipt_v2($1,'completed',$2,'cs_test','pi_test',$3,'eur','TEST',$4,NULL) AS settled", [event, link, amount, version]);
    expect((await settle('evt_crash')).rows[0]?.settled.added).toBe(true);
    expect((await settle('evt_async')).rows[0]?.settled.added).toBe(false);
    const row = (await db.query<{ payments: unknown[]; paid_amount: number }>("SELECT payments,paid_amount FROM rental_inquiries WHERE id=$1", [f.id])).rows[0];
    expect(row?.payments).toHaveLength(1); expect(Number(row?.paid_amount)).toBe(230.9);
    expect((await settle('evt_stale',23090,1)).rows[0]?.settled.result).toBe('already_booked');
    expect((await settle('evt_missing_version',23090,null)).rows[0]?.settled.result).toBe('already_booked');
    expect((await settle('evt_wrong_amount',1)).rows[0]?.settled.result).toBe('reconciliation_required');
  });
  it("recovers the same immutable attempt after a process crash, even with a different requested choice", async () => {
    const f = await fixture();
    const link = (await db.query<{ id: string }>("INSERT INTO offer_payment_links(inquiry_id,inquiry_table,status,offer_number) VALUES($1,'rental_inquiries','active','TEST') RETURNING id", [f.id])).rows[0]?.id;
    if (!link) throw new Error("Missing test link");
    const request = { metadata: { amount_cents: "23090", payment_decision_version: "0", choice: "full" }, expires_at: 2000000000 };
    const claim = crypto.randomUUID();
    const begin = (c: string, r: unknown) => db.query<{ attempt: { claim: string; request: typeof request } }>("SELECT begin_rental_checkout($1,0,$2,$3::jsonb) AS attempt", [link, c, JSON.stringify(r)]);
    await begin(claim, request);
    const recovered = (await begin(crypto.randomUUID(), { metadata: { choice: "anzahlung", amount_cents: "1" } })).rows[0]?.attempt;
    expect(recovered?.claim).toBe(claim); expect(recovered?.request).toEqual(request);
    await expect(decide(f.id, f.bank)).rejects.toThrow("Online-Zahlung");
    await db.query("UPDATE offer_payment_links SET checkout_claimed_at=now()-interval '24 hours' WHERE id=$1", [link]);
    await expect(begin(crypto.randomUUID(), request)).rejects.toThrow("abgeglichen");
  });
  it("serializes ordinary rentals without a discount policy too", async () => {
    const f = await fixture();
    await db.query("UPDATE rental_inquiries SET offer_payload=offer_payload-'bank_transfer_discount' WHERE id=$1", [f.id]);
    const link = (await db.query<{ id: string }>("INSERT INTO offer_payment_links(inquiry_id,inquiry_table,status,offer_number) VALUES($1,'rental_inquiries','active','TEST') RETURNING id", [f.id])).rows[0]?.id;
    if (!link) throw new Error("Missing link");
    const claim = crypto.randomUUID();
    const request = { metadata: { amount_cents: "23090", payment_decision_version: "0", choice: "full", checkout_claim: claim } };
    await db.query("SELECT begin_rental_checkout($1,0,$2,$3::jsonb)", [link, claim, JSON.stringify(request)]);
    const recovered = await db.query<{ attempt: { claim: string } }>("SELECT begin_rental_checkout($1,0,$2,$3::jsonb) AS attempt", [link, crypto.randomUUID(), JSON.stringify(request)]);
    expect(recovered.rows[0]?.attempt.claim).toBe(claim);
  });
  it("blocks a second payment link for the same order and fabricated outstanding amount", async () => {
    const f = await fixture();
    const links = (await db.query<{ id: string }>("INSERT INTO offer_payment_links(inquiry_id,inquiry_table,status,offer_number) VALUES($1,'rental_inquiries','active','TEST'),($1,'rental_inquiries','active','TEST') RETURNING id", [f.id])).rows;
    const first = links[0]?.id, second = links[1]?.id;
    if (!first || !second) throw new Error("Missing links");
    const request = { metadata: { amount_cents: "23090", payment_decision_version: "0", choice: "full" } };
    await expect(db.query("SELECT begin_rental_checkout($1,0,$2,$3::jsonb)", [first, crypto.randomUUID(), JSON.stringify({ ...request, metadata: { ...request.metadata, amount_cents: "1" } })])).rejects.toThrow("Zahlbetrag");
    await db.query("SELECT begin_rental_checkout($1,0,$2,$3::jsonb)", [first, crypto.randomUUID(), JSON.stringify(request)]);
    await db.query("UPDATE offer_payment_links SET status='superseded' WHERE id=$1", [first]);
    await expect(db.query("SELECT begin_rental_checkout($1,0,$2,$3::jsonb)", [second, crypto.randomUUID(), JSON.stringify(request)])).rejects.toThrow("Andere Online-Zahlung");
  });
  it("preserves the agreed rate and policy evidence during selection", async () => {
    const f = await fixture();
    await expect(decide(f.id, { ...f.bank, bank_transfer_discount: { ...f.bank.bank_transfer_discount, rate: 20 } })).rejects.toThrow("Rabattvereinbarung");
  });
  it("does not consume a new attempt when an old installment event is redelivered", async () => {
    const f = await fixture();
    const link = (await db.query<{ id: string }>("INSERT INTO offer_payment_links(inquiry_id,inquiry_table,status,offer_number,stripe_session_id,amount_cents) VALUES($1,'rental_inquiries','active','TEST','cs_installment',3927) RETURNING id", [f.id])).rows[0]?.id;
    if (!link) throw new Error("Missing link");
    const settle = (event: string, session: string, intent: string, amount: number, claim: string | null = null) => db.query<{ settled: { added: boolean; result: string } }>("SELECT settle_rental_stripe_receipt_v2($1,'completed',$2,$3,$4,$5,'eur','TEST',0,$6) AS settled", [event, link, session, intent, amount, claim]);
    expect((await settle('evt_installment','cs_installment','pi_installment',3927)).rows[0]?.settled.added).toBe(true);
    const claim = crypto.randomUUID();
    const request = { metadata: { amount_cents: "19163", checkout_claim: claim } };
    await db.query("UPDATE offer_payment_links SET checkout_claim=$2,checkout_request=$3::jsonb WHERE id=$1", [link, claim, JSON.stringify(request)]);
    expect((await settle('evt_installment_repeat','cs_installment','pi_installment',3927)).rows[0]?.settled.result).toBe('already_booked');
    expect((await db.query<{ checkout_claim: string }>("SELECT checkout_claim FROM offer_payment_links WHERE id=$1", [link])).rows[0]?.checkout_claim).toBe(claim);
    expect((await settle('evt_wrong_claim','cs_remaining','pi_remaining',19163,crypto.randomUUID())).rows[0]?.settled.result).toBe('reconciliation_required');
    expect((await settle('evt_remaining','cs_remaining','pi_remaining',19163,claim)).rows[0]?.settled.added).toBe(true);
    const row = (await db.query<{ payments: unknown[]; paid_amount: number }>("SELECT payments,paid_amount FROM rental_inquiries WHERE id=$1", [f.id])).rows[0];
    expect(row?.payments).toHaveLength(2); expect(Number(row?.paid_amount)).toBe(230.9);
  });
  it("persists 3 % on rental including insurance, preserves original and 100 euro deposit", async () => {
    const f = await fixture(); await decide(f.id, f.bank);
    const row = (await db.query<{ offer_total_gross: string; offer_payload: typeof f.bank; original_accepted_offer: { offer_total_gross: number }; payment_decision_version: number }>("SELECT * FROM rental_inquiries WHERE id=$1", [f.id])).rows[0];
    expect(Number(row?.offer_total_gross)).toBe(126.97);
    expect(row?.offer_payload.deposit).toBe(100);
    expect(Number(row?.original_accepted_offer.offer_total_gross)).toBe(130.9);
    expect(row?.payment_decision_version).toBe(1);
  });
  it("rejects mixed recorded payments and later non-bank payment insertion", async () => {
    const mixed = await fixture([{ amount: 10, label: "Barzahlung" }]);
    await expect(decide(mixed.id, mixed.bank)).rejects.toThrow("Gemischte");
    const bank = await fixture([{ amount: 10, label: "Banküberweisung" }]); await decide(bank.id, bank.bank);
    await expect(db.query("UPDATE rental_inquiries SET payments=$2::jsonb WHERE id=$1", [bank.id, JSON.stringify([{ amount: 126.97, label: "PayPal" }])])).rejects.toThrow("Überweisungsrabatt");
  });
  it("rejects stale decision, fabricated price and changed article data", async () => {
    const f = await fixture();
    await expect(decide(f.id, { ...f.bank, items: f.bank.items.map(i => ({ ...i, product_name: "Altered" })) })).rejects.toThrow("Artikel");
    await expect(decide(f.id, { ...f.bank, totals: { ...f.bank.totals, grossAmount: 1 } })).rejects.toThrow("Zahlbetrag");
    await decide(f.id, f.bank);
    await expect(decide(f.id, f.base, 0, "regular")).rejects.toThrow("inzwischen");
  });
  it("blocks changing an issued invoice or an active online checkout", async () => {
    const f = await fixture(); await db.query("INSERT INTO inquiry_invoices VALUES($1,'open')", [f.id]);
    await expect(decide(f.id, f.bank)).rejects.toThrow("Belegkorrektur");
    const g = await fixture(); await db.query("INSERT INTO offer_payment_links(inquiry_id,inquiry_table,status,stripe_session_id) VALUES($1,'rental_inquiries','active','cs_live_open')", [g.id]);
    await expect(decide(g.id, g.bank)).rejects.toThrow("Online-Zahlung");
  });
  it("allows only one checkout claim and blocks payment changes during creation", async () => {
    const f = await fixture();
    const result = await db.query<{ id: string }>("INSERT INTO offer_payment_links(inquiry_id,inquiry_table,status,offer_number) VALUES($1,'rental_inquiries','active','TEST') RETURNING id", [f.id]);
    const id = result.rows[0]?.id; if (!id) throw new Error("Missing test link");
    const first = await db.query<{ ok: boolean }>("SELECT claim_rental_checkout($1,0,$2) AS ok", [id, crypto.randomUUID()]);
    const second = await db.query<{ ok: boolean }>("SELECT claim_rental_checkout($1,0,$2) AS ok", [id, crypto.randomUUID()]);
    expect(first.rows[0]?.ok).toBe(true); expect(second.rows[0]?.ok).toBe(false);
    await expect(decide(f.id, f.bank)).rejects.toThrow("Online-Zahlung");
  });
});