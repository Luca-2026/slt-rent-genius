import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, expect, it } from "vitest";
const db = new PGlite();
beforeAll(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE TABLE offer_payment_links(id uuid PRIMARY KEY,inquiry_id uuid,inquiry_table text,payment_intent_id text,status text,paid_cents integer,deposit_cents integer);
    CREATE TABLE inquiry_invoices(id uuid PRIMARY KEY,rental_inquiry_id uuid);
    CREATE TABLE deposit_refunds(id uuid PRIMARY KEY,link_id uuid,amount_cents integer,status text,stripe_refund_id text,updated_at timestamptz);
    CREATE TABLE credit_note_refunds(id uuid PRIMARY KEY,credit_note_id uuid,amount_cents integer,status text,allocations jsonb,updated_at timestamptz);`);
  await db.exec(readFileSync("drizzle/migrations/0141_serialize_shared_original_payment_refunds.sql", "utf8"));
  await db.exec(readFileSync("drizzle/migrations/0142_reconcile_durable_deposit_refunds.sql", "utf8"));
}, 30000);
afterAll(() => db.close());
async function fixture() {
  const link = crypto.randomUUID(), inquiry = crypto.randomUUID(), credit = crypto.randomUUID(), intent = `pi_${crypto.randomUUID()}`;
  await db.query("INSERT INTO offer_payment_links VALUES($1,$2,'rental_inquiries',$3,'paid',118068,50000)", [link, inquiry, intent]);
  await db.query("INSERT INTO inquiry_invoices VALUES($1,$2)", [credit, inquiry]);
  return { link, credit, intent };
}
const deposit = (link: string, amount = 50000, id = crypto.randomUUID()) => db.query("INSERT INTO deposit_refunds(id,link_id,amount_cents,status,request_id) VALUES($1,$2,$3,'creating',$1)", [id, link, amount]);
const credit = (id: string, intent: string, amount: number) => db.query("INSERT INTO credit_note_refunds VALUES($1,$2,$3,'creating',$4::jsonb,now())", [crypto.randomUUID(), id, amount, JSON.stringify([{ payment_intent: intent, amount_cents: amount, status: 'creating' }])]);
it("allows 500 deposit plus 123.76 rental refund below the original total", async () => {
  const f = await fixture(); await deposit(f.link); await credit(f.credit, f.intent, 12376);
  expect((await db.query<{ count: number }>("SELECT count(*)::int AS count FROM deposit_refunds WHERE link_id=$1", [f.link])).rows[0]?.count).toBe(1);
});
it("blocks credit refunds exceeding the shared original 1180.68 payment", async () => {
  const f = await fixture(); await deposit(f.link);
  await expect(credit(f.credit, f.intent, 68069)).rejects.toThrow("gemeinsam");
});
it("blocks a deposit when a rental reservation already consumes capacity", async () => {
  const f = await fixture(); await credit(f.credit, f.intent, 118068);
  await expect(deposit(f.link)).rejects.toThrow("gemeinsam");
});
it("counts an active allocation even if the overall credit says failed", async () => {
  const f = await fixture(); await credit(f.credit, f.intent, 118068);
  await db.query("UPDATE credit_note_refunds SET status='failed' WHERE credit_note_id=$1", [f.credit]);
  await expect(deposit(f.link)).rejects.toThrow("gemeinsam");
});
it("duplicate durable request cannot reserve twice", async () => {
  const f = await fixture(), id = crypto.randomUUID(); await deposit(f.link, 10000, id);
  await expect(deposit(f.link, 10000, id)).rejects.toThrow();
});
it("late pending events cannot undo a successful refund", async () => {
  const f = await fixture(), id = crypto.randomUUID(); await deposit(f.link, 50000, id);
  await db.query("SELECT sync_deposit_refund($1,$2,'re_test','succeeded',50000)", [id, f.intent]);
  await db.query("SELECT sync_deposit_refund($1,$2,'re_test','pending',50000)", [id, f.intent]);
  expect((await db.query<{ status: string }>("SELECT status FROM deposit_refunds WHERE id=$1", [id])).rows[0]?.status).toBe('succeeded');
});
it("provider amount mismatch does not change the stored reservation", async () => {
  const f = await fixture(), id = crypto.randomUUID(); await deposit(f.link, 50000, id);
  await expect(db.query("SELECT sync_deposit_refund($1,$2,'re_test','succeeded',50001)", [id, f.intent])).rejects.toThrow("Anspruch");
});