import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, expect, it } from "vitest";
const db = new PGlite();
beforeAll(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth;
  CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT coalesce(current_setting('test.role',true),'service_role') $$;
  CREATE TABLE rental_inquiries(id uuid primary key,payments jsonb,offer_total_gross numeric);
  CREATE TABLE inquiry_invoices(id uuid primary key,rental_inquiry_id uuid,status text,invoice_kind text,rental_refund_basis_id uuid,gross_amount numeric,paid_amount numeric,credited_amount numeric,payments jsonb,paid_at timestamptz);
  CREATE TABLE credit_note_refunds(credit_note_id uuid);
  CREATE TABLE rental_refund_bases(id uuid,inquiry_id uuid);
  CREATE TABLE rental_order_refunds(basis_id uuid);
  CREATE TABLE offer_payment_links(inquiry_id uuid,inquiry_table text,payment_intent_id text,stripe_session_id text,paid_at timestamptz,amount_cents integer);`);
  for (const f of ['0177_single_rental_invoice_stripe_receipts','0178_rental_receipt_refund_basis_lookup']) await db.exec(readFileSync(`drizzle/migrations/${f}.sql`,'utf8'));
},30000);
afterAll(() => db.close());
async function fixture() {
  const r=crypto.randomUUID(), i=crypto.randomUUID(), ref='cs_'+r, pi='pi_'+r;
  await db.query('INSERT INTO rental_inquiries VALUES($1,$2,60.69)',[r,JSON.stringify([{amount:160.69,date:'2026-11-09',provider:'stripe',reference:ref,payment_intent_id:pi,recorded_at:'2026-11-09T07:42:33Z'}])]);
  await db.query("INSERT INTO inquiry_invoices VALUES($1,$2,'open','invoice',null,60.69,0,0,'[]',null)",[i,r]);
  await db.query("INSERT INTO offer_payment_links VALUES($1,'rental_inquiries',$2,$3,now(),16069)",[r,pi,ref]);
  return {r,i};
}
it('M2VG4X allocates 60.69 from 160.69 and settles only the invoice',async()=>{
 const {r,i}=await fixture(); await db.query('SELECT sync_single_rental_invoice_receipts($1)',[r]);
 const x=(await db.query<{paid_amount:string,status:string,payments:{receipt_amount:number,amount:number}[]}>('SELECT * FROM inquiry_invoices WHERE id=$1',[i])).rows[0];
 expect(Number(x.paid_amount)).toBe(60.69); expect(x.status).toBe('paid'); expect(x.payments[0].receipt_amount-x.payments[0].amount).toBe(100);
});
it('repeating provider reconciliation cannot duplicate a payment',async()=>{
 const {r,i}=await fixture(); await db.query('SELECT sync_single_rental_invoice_receipts($1)',[r]); await db.query('SELECT sync_single_rental_invoice_receipts($1)',[r]);
 expect((await db.query<{n:number}>('SELECT jsonb_array_length(payments) n FROM inquiry_invoices WHERE id=$1',[i])).rows[0].n).toBe(1);
});
it('does not guess allocations with multiple invoices',async()=>{
 const {r,i}=await fixture(); await db.query("INSERT INTO inquiry_invoices(id,rental_inquiry_id,status,invoice_kind) VALUES($1,$2,'open','installment')",[crypto.randomUUID(),r]);
 await db.query('SELECT sync_single_rental_invoice_receipts($1)',[r]);
 expect(Number((await db.query<{paid_amount:string}>('SELECT paid_amount FROM inquiry_invoices WHERE id=$1',[i])).rows[0].paid_amount)).toBe(0);
});
it('requires a matching confirmed provider receipt',async()=>{
 const {r,i}=await fixture(); await db.query('UPDATE offer_payment_links SET amount_cents=1 WHERE inquiry_id=$1',[r]); await db.query('SELECT sync_single_rental_invoice_receipts($1)',[r]);
 expect(Number((await db.query<{paid_amount:string}>('SELECT paid_amount FROM inquiry_invoices WHERE id=$1',[i])).rows[0].paid_amount)).toBe(0);
});
it('rejects direct staff calls to the service-only reconciliation',async()=>{
 await db.exec("SET test.role='authenticated'"); await expect(db.query('SELECT sync_single_rental_invoice_receipts($1)',[crypto.randomUUID()])).rejects.toThrow('Not authorized'); await db.exec("SET test.role='service_role'");
});
it('keeps a genuine unpaid balance on partial receipt',async()=>{
 const {r,i}=await fixture();
 await db.query("UPDATE rental_inquiries SET payments=jsonb_set(payments,'{0,amount}','20') WHERE id=$1",[r]);
 await db.query('UPDATE offer_payment_links SET amount_cents=2000 WHERE inquiry_id=$1',[r]);
 await db.query('SELECT sync_single_rental_invoice_receipts($1)',[r]);
 const x=(await db.query<{paid_amount:string,status:string}>('SELECT paid_amount,status FROM inquiry_invoices WHERE id=$1',[i])).rows[0];
 expect(Number(x.paid_amount)).toBe(20); expect(x.status).toBe('open'); expect(60.69-Number(x.paid_amount)).toBeCloseTo(40.69,2);
});
it('never allocates Stripe receipts to a credit note',async()=>{
 const {r,i}=await fixture(); await db.query("UPDATE inquiry_invoices SET invoice_kind='credit_note' WHERE id=$1",[i]);
 await db.query('SELECT sync_single_rental_invoice_receipts($1)',[r]);
 expect(Number((await db.query<{paid_amount:string}>('SELECT paid_amount FROM inquiry_invoices WHERE id=$1',[i])).rows[0].paid_amount)).toBe(0);
});