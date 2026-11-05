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
}, 30000);
afterAll(() => db.close());
async function fixture(payments: unknown[] = []) {
  const id = crypto.randomUUID();
  const items = [{ product_name: "Miete", quantity: 1, unit_price: 100, discount_percent: 0, addons: [{ key: "insurance", label: "Versicherung", amount: 10 }] }];
  const base = { items, totals: priceBankTransfer(items).totals, deposit: 100, bank_transfer_discount: newBankDiscountPolicy() };
  await db.query("INSERT INTO rental_inquiries VALUES($1,'accepted','TEST',$2::jsonb,$3::jsonb,130.9,'original.pdf',NULL,0)", [id, JSON.stringify(base), JSON.stringify(payments)]);
  const priced = priceBankTransfer(items, 0, "bank");
  return { id, base, bank: { ...base, items: priced.items, totals: priced.totals, bank_transfer_discount: { ...base.bank_transfer_discount, selected: "bank" } } };
}
const decide = (id: string, payload: unknown, expected = 0, method = "bank") => db.query("SELECT select_rental_payment_method($1,'TEST',$2,$3,$4::jsonb)", [id, expected, method, JSON.stringify(payload)]);
describe("protected persisted bank discount", () => {
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