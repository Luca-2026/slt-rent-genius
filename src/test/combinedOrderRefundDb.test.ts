import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, expect, it } from "vitest";
const db = new PGlite();
beforeAll(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT null::uuid $$;
    CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT 'service_role'::text $$;
    CREATE FUNCTION can_edit_operations(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;
    CREATE FUNCTION has_role(uuid,text) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;
    CREATE FUNCTION slt_stock_location(text) RETURNS text LANGUAGE sql AS $$ SELECT $1 $$;
    CREATE TABLE staff_profiles(user_id uuid,is_active boolean,location text);
    CREATE TABLE rental_inquiries(id uuid PRIMARY KEY,location text,payments jsonb,offer_payload jsonb,offer_total_gross numeric,cancelled_at timestamptz,cancellation_payload jsonb);
    CREATE TABLE rental_inquiry_events(id uuid DEFAULT gen_random_uuid(),rental_inquiry_id uuid,event text,details jsonb,user_id uuid);
    CREATE TABLE inquiry_invoices(id uuid PRIMARY KEY,rental_inquiry_id uuid,invoice_kind text,status text,paid_amount numeric,gross_amount numeric,parent_invoice_id uuid,deducted_installments jsonb);
    CREATE TABLE deposit_settlements(id uuid PRIMARY KEY,rental_inquiry_id uuid,balance numeric,payout_status text,payout_method text);
    CREATE FUNCTION deposit_payout_verified(uuid,bigint) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;
    CREATE TABLE offer_payment_links(id uuid PRIMARY KEY,inquiry_id uuid,inquiry_table text,payment_intent_id text,status text,paid_cents integer,deposit_cents integer);
    CREATE TABLE deposit_refunds(id uuid PRIMARY KEY,link_id uuid,amount_cents integer,status text,stripe_refund_id text);
    CREATE TABLE credit_note_refunds(id uuid PRIMARY KEY,credit_note_id uuid,amount_cents integer,allocations jsonb,status text);
  `);
  for (const file of ["0141_serialize_shared_original_payment_refunds","0147_durable_external_stripe_refund_receipts","0165_pre_invoice_rental_refund_and_issue_lock","0166_include_order_refunds_in_execution_reconciliation","0167_fix_order_refund_allocation_completion_guard","0168_protect_order_refund_allocation_terminal_states","0189_combined_order_refund_requests","0190_combined_refund_capacity_and_invoice_evidence","0191_freeze_combined_refund_claims_and_scope_execution","0192_combined_refund_lock_order_and_execution_gate"]) await db.exec(readFileSync(`drizzle/migrations/${file}.sql`,"utf8"));
  // Exact read-only production definition captured during this release check, not prepared finance SQL.
  await db.exec(readFileSync("docs/releaseabschluss-evidence/live-order_refund_totals.sql","utf8"));
},30000);
afterAll(() => db.close());
it("72EJQ5 authoritative basis: no invoice means no executable rent credit, prepared basis unlocks only 19.40",async()=>{
  const id=crypto.randomUUID(),basis=crypto.randomUUID();
  await db.query("INSERT INTO rental_inquiries VALUES($1,'krefeld',$2,$3,193.92,null,null)",[id,JSON.stringify([{amount:713.32,label:'Banküberweisung'}]),JSON.stringify({deposit:500,totals:{grossAmount:193.92}})]);
  const read=async()=> (await db.query<{t:{deposit_available:number;rent_available:number;deposit_used:number;rent_used:number}}>("SELECT order_refund_totals($1) t",[id])).rows[0].t;
  expect(await read()).toMatchObject({deposit_available:50000,rent_available:0});
  await db.query("INSERT INTO rental_refund_bases(id,inquiry_id,gross_amount,paid_amount,payments) VALUES($1,$2,193.92,213.32,$3)",[basis,id,JSON.stringify([{amount:213.32,label:'Banküberweisung'}])]);
  expect(await read()).toMatchObject({deposit_available:50000,rent_available:1940});
  await db.query("INSERT INTO deposit_settlements VALUES($1,$2,500,'paid','transfer')",[crypto.randomUUID(),id]);
  expect(await read()).toMatchObject({deposit_available:0,deposit_used:50000,rent_available:1940});
  await db.query("INSERT INTO rental_order_refunds(basis_id,amount_cents,allocations,created_by,payout_method) VALUES($1,1940,'[]',$2,'transfer')",[basis,crypto.randomUUID()]);
  expect(await read()).toMatchObject({deposit_available:0,rent_available:0,rent_used:1940});
});
async function fixture() {
  const id=crypto.randomUUID(),link=crypto.randomUUID(),actor=crypto.randomUUID(),intent=`pi_${crypto.randomUUID()}`;
  await db.query("INSERT INTO rental_inquiries VALUES($1,'krefeld',$2,$3,0,now(),$4)",[id,JSON.stringify([{amount:129.75,label:"Stripe",reference:intent}]),JSON.stringify({deposit:100,totals:{grossAmount:29.75}}),JSON.stringify({totals:{grossAmount:0}})]);
  await db.query("INSERT INTO offer_payment_links VALUES($1,$2,'rental_inquiries',$3,'paid',12975,10000)",[link,id,intent]);
  return {id,link,actor,intent};
}
async function reserve(f:Awaited<ReturnType<typeof fixture>>,deposit=10000,rent=2975,request=crypto.randomUUID()) {
  await db.query("SELECT reserve_order_refund($1,$2,$3,$4,$5,'stripe',$6)",[request,f.id,f.actor,deposit,rent,JSON.stringify([{payment_intent:f.intent,amount_cents:deposit+rent,deposit_cents:deposit,rent_cents:rent,status:"creating"}])]); return request;
}
it("UHSMCV cannot refund a second rental or deposit amount after the two historical payouts",async()=>{
  const f=await fixture(),basis=crypto.randomUUID();
  await db.query("INSERT INTO rental_refund_bases(id,inquiry_id,gross_amount,paid_amount,payments) VALUES($1,$2,0,29.75,$3)",[basis,f.id,JSON.stringify([{amount:29.75,reference:f.intent,label:"Stripe"}])]);
  await db.query("INSERT INTO rental_order_refunds(basis_id,amount_cents,allocations,created_by) VALUES($1,2975,$2,$3)",[basis,JSON.stringify([{payment_intent:f.intent,amount_cents:2975,status:"creating"}]),f.actor]);
  await db.query("INSERT INTO deposit_refunds(id,link_id,amount_cents,status) VALUES($1,$2,10000,'creating')",[crypto.randomUUID(),f.link]);
  const totals=(await db.query<{order_refund_totals:{deposit_available:number;rent_available:number}}>("SELECT order_refund_totals($1)",[f.id])).rows[0].order_refund_totals;
  expect(totals.deposit_available).toBe(0); expect(totals.rent_available).toBe(0);
  await expect(reserve(f,0,2975)).rejects.toThrow();
});
it("one combined request consumes both claims and is retryable with the same ID",async()=>{
  const f=await fixture(),request=await reserve(f);
  await reserve(f,10000,2975,request);
  expect((await db.query("SELECT id FROM order_refund_requests WHERE inquiry_id=$1",[f.id])).rows).toHaveLength(1);
  await expect(reserve(f)).rejects.toThrow();
  await expect(db.query("INSERT INTO deposit_refunds(id,link_id,amount_cents,status) VALUES($1,$2,1,'creating')",[crypto.randomUUID(),f.link])).rejects.toThrow();
});
it("combined provider evidence is counted once and partial claims leave only the true remainder",async()=>{
  const f=await fixture(),request=await reserve(f,5000,1000);
  await db.query("SELECT record_stripe_refund_receipt('re_combined',$1,6000,'eur',true,'succeeded')",[f.intent]);
  await db.query("SELECT sync_order_refund($1,$2,'re_combined','succeeded',6000)",[request,f.intent]);
  await expect(db.query("SELECT assert_stripe_refund_execution_capacity($1)",[f.intent])).resolves.toBeDefined();
  const totals=(await db.query<{order_refund_totals:{deposit_available:number;rent_available:number}}>("SELECT order_refund_totals($1)",[f.id])).rows[0].order_refund_totals;
  expect(totals.deposit_available).toBe(5000);expect(totals.rent_available).toBe(1975);
  await reserve(f,5000,1975);
});
it("invalid amounts and provider-less completion cannot bypass the request",async()=>{
  const f=await fixture();await expect(reserve(f,10000,2976)).rejects.toThrow();
  const id=await reserve(f);await expect(db.query("UPDATE order_refund_requests SET status='succeeded' WHERE id=$1",[id])).rejects.toThrow();
});