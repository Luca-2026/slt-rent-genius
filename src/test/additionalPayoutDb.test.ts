import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, expect, it } from "vitest";
const db = new PGlite();
const staff = "11111111-1111-4111-8111-111111111111";
const approver = "22222222-2222-4222-8222-222222222222";
const stranger = "33333333-3333-4333-8333-333333333333";
beforeAll(async () => {
  await db.exec(`CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('test.actor',true),'')::uuid $$;
    CREATE FUNCTION can_edit_operations(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT $1 IN ('${staff}','${approver}') $$;
    CREATE FUNCTION has_role(uuid,text) RETURNS boolean LANGUAGE sql AS $$ SELECT $1 IN ('${approver}','${stranger}') $$;
    CREATE TABLE rental_inquiries(id uuid PRIMARY KEY);
    CREATE TABLE inquiry_invoices(id uuid PRIMARY KEY,rental_inquiry_id uuid,invoice_kind text,status text,credit_refund_amount numeric,gross_amount numeric);
    CREATE TABLE offer_payment_links(id uuid PRIMARY KEY,inquiry_id uuid,inquiry_table text,status text,payment_intent_id text,paid_cents int,paid_at timestamptz);
    CREATE TABLE deposit_refunds(link_id uuid,amount_cents int,status text);
    CREATE TABLE credit_note_refunds(credit_note_id uuid,amount_cents int,status text);`);
  await db.exec(readFileSync("drizzle/migrations/0136_rental_additional_payout_approval.sql", "utf8"));
  await db.exec(readFileSync("drizzle/migrations/0137_guard_additional_payout_approval_and_evidence.sql", "utf8"));
  await db.query("INSERT INTO rental_payout_approvers(user_id) VALUES($1)", [approver]);
}, 30000);
afterAll(() => db.close());
const actor = (id: string) => db.query("SELECT set_config('test.actor',$1,false)", [id]);
async function fixture(refund = 100) {
  const inquiry=crypto.randomUUID(), credit=crypto.randomUUID(), link=crypto.randomUUID();
  await db.query("INSERT INTO rental_inquiries VALUES($1)",[inquiry]);
  await db.query("INSERT INTO inquiry_invoices VALUES($1,$2,'credit_note','open',$3,-$3)",[credit,inquiry,refund]);
  await db.query("INSERT INTO offer_payment_links VALUES($1,$2,'rental_inquiries','paid','pi_fixture',10000,now())",[link,inquiry]);
  return { inquiry,credit,link };
}
const request = (credit: string, amount = 1000) => db.query<{ id: string }>("SELECT request_rental_additional_payout($1,$2,'Gerät ausgefallen','Testempfänger','DE65320500000000478446') AS id",[credit,amount]);
const decide = (id: string) => db.query("SELECT decide_rental_additional_payout($1,true,'Geprüft und genehmigt')",[id]);
const complete = (id: string) => db.query("SELECT complete_rental_additional_payout($1,'BANK-TEST-NACHWEIS')",[id]);
it("refund above original Stripe payment requires designated approver, not any admin", async () => {
  const f=await fixture(); await actor(staff);
  const id=(await request(f.credit)).rows[0]?.id; if(!id) throw new Error("Missing request");
  const row=(await db.query<{approval_required:boolean;status:string}>("SELECT * FROM rental_additional_payouts WHERE id=$1",[id])).rows[0];
  expect(row?.approval_required).toBe(true); expect(row?.status).toBe("requested");
  await expect(complete(id)).rejects.toThrow("Freigabe");
  await actor(stranger); await expect(decide(id)).rejects.toThrow("berechtigten Superadmin");
  await actor(approver); await decide(id);
  await actor(staff); await complete(id); await complete(id);
  expect((await db.query<{count:number}>("SELECT count(*)::int AS count FROM rental_additional_payout_events WHERE payout_id=$1 AND event='paid'",[id])).rows[0]?.count).toBe(1);
});
it("approval alone never marks an executed payment, and repeated request retains immutable amount", async () => {
  const f=await fixture(10); await actor(staff);
  const id=(await request(f.credit)).rows[0]?.id; if(!id) throw new Error("Missing request");
  expect((await request(f.credit)).rows[0]?.id).toBe(id);
  await expect(request(f.credit,2000)).rejects.toThrow("unveränderlicher");
  await actor(approver); await decide(id);
  expect((await db.query<{paid_at:null}>("SELECT paid_at FROM rental_additional_payouts WHERE id=$1",[id])).rows[0]?.paid_at).toBeNull();
  await expect(db.query("UPDATE rental_additional_payouts SET amount_cents=99999 WHERE id=$1",[id])).rejects.toThrow("unveränderlich");
});
it("non-staff cannot request; client has no direct write grants", async () => {
  const f=await fixture(); await actor(stranger); await expect(request(f.credit)).rejects.toThrow("Berechtigung");
  const grants=await db.query<{allowed:boolean}>("SELECT has_table_privilege('authenticated','rental_additional_payouts','INSERT') AS allowed");
  expect(grants.rows[0]?.allowed).toBe(false);
});
it("late provider refund cannot bypass approval, and pending refunds count", async () => {
  const f=await fixture(10); await actor(staff);
  await db.query("INSERT INTO deposit_refunds VALUES($1,2000,'pending')",[f.link]);
  const id=(await request(f.credit,500)).rows[0]?.id; if(!id) throw new Error("Missing request");
  expect(Number((await db.query<{prior_refund_cents:string}>("SELECT prior_refund_cents FROM rental_additional_payouts WHERE id=$1",[id])).rows[0]?.prior_refund_cents)).toBe(2000);
  await db.query("INSERT INTO deposit_refunds VALUES($1,7000,'pending')",[f.link]);
  await expect(complete(id)).rejects.toThrow("Freigabe");
});