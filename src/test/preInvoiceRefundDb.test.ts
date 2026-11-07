import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, expect, it } from "vitest";
const db = new PGlite();
beforeAll(async () => {
 await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth;
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT null::uuid $$;
 CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT 'service_role'::text $$;
 CREATE FUNCTION can_edit_operations(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;
 CREATE TABLE rental_inquiries(id uuid PRIMARY KEY);
 CREATE TABLE inquiry_invoices(id uuid PRIMARY KEY,rental_inquiry_id uuid,invoice_kind text,status text,paid_amount numeric,gross_amount numeric);
 CREATE TABLE deposit_settlements(id uuid PRIMARY KEY,rental_inquiry_id uuid,balance numeric,payout_status text,payout_method text);
 CREATE FUNCTION deposit_payout_verified(uuid,bigint) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;
 CREATE TABLE offer_payment_links(id uuid PRIMARY KEY,inquiry_id uuid,inquiry_table text,payment_intent_id text,status text,paid_cents integer,deposit_cents integer);
 CREATE TABLE deposit_refunds(id uuid PRIMARY KEY,link_id uuid,amount_cents integer,status text,stripe_refund_id text);
 CREATE TABLE credit_note_refunds(id uuid PRIMARY KEY,credit_note_id uuid,amount_cents integer,allocations jsonb,status text);
 `);
 for (const f of ['0141_serialize_shared_original_payment_refunds','0147_durable_external_stripe_refund_receipts','0165_pre_invoice_rental_refund_and_issue_lock','0166_include_order_refunds_in_execution_reconciliation','0167_fix_order_refund_allocation_completion_guard','0168_protect_order_refund_allocation_terminal_states']) await db.exec(readFileSync(`drizzle/migrations/${f}.sql`, 'utf8'));
}, 30000);
afterAll(() => db.close());
async function fixture(bank=false) {
 const inquiry=crypto.randomUUID(), basis=crypto.randomUUID(), link=crypto.randomUUID(), intent='pi_'+crypto.randomUUID();
 await db.query('INSERT INTO rental_inquiries VALUES($1)',[inquiry]);
 await db.query("INSERT INTO deposit_settlements VALUES($1,$2,700,'paid','stripe')",[crypto.randomUUID(),inquiry]);
 await db.query('INSERT INTO rental_refund_bases(id,inquiry_id,gross_amount,paid_amount,payments) VALUES($1,$2,307.26,377.23,$3)',[basis,inquiry,JSON.stringify([{label:bank?'Banküberweisung':'Stripe',reference:bank?'':intent,amount:377.23}])]);
 if(!bank) await db.query("INSERT INTO offer_payment_links VALUES($1,$2,'rental_inquiries',$3,'paid',102963,70000)",[link,inquiry,intent]);
 return {inquiry,basis,link,intent};
}
async function claim(f:Awaited<ReturnType<typeof fixture>>,bank=false,amount=6997) {
 const id=crypto.randomUUID();
 await db.query("INSERT INTO rental_order_refunds(id,basis_id,amount_cents,allocations,created_by,payout_method) VALUES($1,$2,$3,$4,$5,$6)",[id,f.basis,amount,JSON.stringify(bank?[]:[{payment_intent:f.intent,amount_cents:amount,status:'creating'}]),crypto.randomUUID(),bank?'transfer':'stripe']);
 return id;
}
it('blocks the final invoice until 69.97 rental credit has been refunded',async()=>{
 const f=await fixture(); await expect(db.query('SELECT check_rental_invoice_refunds($1,307.26,377.23)',[f.inquiry])).rejects.toThrow('Mietguthabenerstattung');
});
it('blocks an unpaid 700 deposit independently of rental credit',async()=>{
 const f=await fixture(); await db.query("UPDATE deposit_settlements SET payout_status='pending' WHERE rental_inquiry_id=$1",[f.inquiry]);
 await expect(db.query('SELECT check_rental_invoice_refunds($1,377.23,377.23)',[f.inquiry])).rejects.toThrow('Kautionserstattung');
});
it('700 deposit plus 69.97 rental refund before invoice shares original capacity and requires evidence',async()=>{
 const f=await fixture(); await db.query("INSERT INTO deposit_refunds(id,link_id,amount_cents,status) VALUES($1,$2,70000,'creating')",[crypto.randomUUID(),f.link]);
 await claim(f);
 await expect(db.query("UPDATE rental_order_refunds SET status='succeeded' WHERE basis_id=$1",[f.basis])).rejects.toThrow('nicht vollständig');
 await db.query("INSERT INTO stripe_refund_receipts(refund_id,payment_intent,amount_cents,currency,livemode,status) VALUES('pyr_credit',$1,6997,'eur',true,'succeeded')",[f.intent]);
 await db.query("SELECT sync_rental_order_refund($1,$2,'pyr_credit','succeeded',6997)",[f.basis,f.intent]);
 const result=await db.query<{check_rental_invoice_refunds:{refunded_cents:number}}>('SELECT check_rental_invoice_refunds($1,307.26,377.23)',[f.inquiry]);
 expect(result.rows[0].check_rental_invoice_refunds.refunded_cents).toBe(6997);
 expect(30726-37723+6997).toBe(0);
 await expect(claim(f)).rejects.toThrow();
 await expect(db.query('UPDATE rental_refund_bases SET gross_amount=300 WHERE id=$1',[f.basis])).rejects.toThrow('nicht geändert');
});
it('rejects 69.98 instead of the exact 69.97 refund',async()=>{await expect(claim(await fixture(),false,6998)).rejects.toThrow('Mietguthaben');});
it('protects original-payment cap including existing deposit claims',async()=>{
 const f=await fixture(); await db.query('UPDATE offer_payment_links SET paid_cents=76996 WHERE id=$1',[f.link]);
 await db.query("INSERT INTO deposit_refunds(id,link_id,amount_cents,status) VALUES($1,$2,70000,'creating')",[crypto.randomUUID(),f.link]);
 await expect(claim(f)).rejects.toThrow('Gesamtzahlung');
});
it('bank refunds require a transfer reference before releasing the invoice',async()=>{
 const f=await fixture(true),id=await claim(f,true);
 await expect(db.query("UPDATE rental_order_refunds SET status='succeeded' WHERE id=$1",[id])).rejects.toThrow('Banknachweis');
 await db.query("UPDATE rental_order_refunds SET status='succeeded',bank_reference='BANK-6997' WHERE id=$1",[id]);
 expect((await db.query('SELECT check_rental_invoice_refunds($1,307.26,377.23)',[f.inquiry])).rows.length).toBe(1);
});
it('permits a real 20 euro customer debt instead of forcing zero',async()=>{
 const f=await fixture(); expect((await db.query('SELECT check_rental_invoice_refunds($1,397.23,377.23)',[f.inquiry])).rows.length).toBe(1);
 expect(Math.round((397.23-377.23)*100)).toBe(2000);
});
it('invoice finalization cannot bypass the refund lock',async()=>{
 const f=await fixture(),id=crypto.randomUUID();
 await db.query("INSERT INTO inquiry_invoices VALUES($1,$2,'final','draft',377.23,307.26,$3)",[id,f.inquiry,f.basis]);
 await expect(db.query("UPDATE inquiry_invoices SET status='paid' WHERE id=$1",[id])).rejects.toThrow('Mietguthabenerstattung');
});
