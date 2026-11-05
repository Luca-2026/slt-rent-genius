import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, it, expect } from "vitest";
const db = new PGlite();
beforeAll(async()=>{
 await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth;
 CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT 'service_role'::text $$;
 CREATE TABLE offer_payment_links(id uuid PRIMARY KEY,inquiry_id uuid,inquiry_table text,payment_intent_id text,status text,paid_cents integer,deposit_cents integer);
 CREATE TABLE inquiry_invoices(id uuid PRIMARY KEY,rental_inquiry_id uuid,invoice_kind text,status text,parent_invoice_id uuid,deducted_installments jsonb,paid_amount numeric,gross_amount numeric,credit_refund_amount numeric);
 CREATE TABLE deposit_refunds(id uuid PRIMARY KEY,link_id uuid,amount_cents integer,status text,stripe_refund_id text,updated_at timestamptz);
 CREATE TABLE credit_note_refunds(id uuid PRIMARY KEY,credit_note_id uuid UNIQUE,amount_cents integer,status text,allocations jsonb,updated_at timestamptz);
 `);
 for(const f of ['0141_serialize_shared_original_payment_refunds','0142_reconcile_durable_deposit_refunds','0143_validate_credit_refund_provider_evidence','0147_durable_external_stripe_refund_receipts','0148_direct_rental_credit_refund_receipts','0149_route_bank_rental_refunds_safely']) await db.exec(readFileSync(`drizzle/migrations/${f}.sql`,'utf8'));
 await db.exec('CREATE TRIGGER rental_amount BEFORE INSERT OR UPDATE ON credit_note_refunds FOR EACH ROW EXECUTE FUNCTION guard_credit_note_refund_amount()');
},30000);
afterAll(()=>db.close());
async function fixture(bank=false){const invoice=crypto.randomUUID(),inquiry=crypto.randomUUID(),link=crypto.randomUUID(),intent=`pi_${crypto.randomUUID()}`;
 await db.query("INSERT INTO inquiry_invoices VALUES($1,$2,'invoice','paid',null,'[]',680.68,556.92,null)",[invoice,inquiry]);
 await db.exec("ALTER TABLE inquiry_invoices ADD COLUMN IF NOT EXISTS payments jsonb DEFAULT '[{\"label\":\"Banküberweisung\"}]'");
 if(!bank) await db.query("INSERT INTO offer_payment_links VALUES($1,$2,'rental_inquiries',$3,'paid',118068,50000)",[link,inquiry,intent]);
 return {invoice,inquiry,link,intent};}
async function claim(f:any,amount=12376,bank=false){const id=crypto.randomUUID(); await db.query("INSERT INTO credit_note_refunds(id,credit_note_id,amount_cents,status,allocations,refund_kind,payout_method) VALUES($1,$2,$3,'creating',$4,'rental_credit',$5)",[id,f.invoice,amount,JSON.stringify(bank?[]:[{payment_intent:f.intent,amount_cents:amount,status:'creating'}]),bank?'transfer':'stripe']);return id;}
it('500 deposit plus exact 123.76 direct rental refund shares original capacity',async()=>{const f=await fixture();await db.query("INSERT INTO deposit_refunds(id,link_id,amount_cents,status) VALUES($1,$2,50000,'creating')",[crypto.randomUUID(),f.link]);await claim(f);expect((await db.query<{amount_cents:number}>('SELECT amount_cents FROM credit_note_refunds WHERE credit_note_id=$1',[f.invoice])).rows[0].amount_cents).toBe(12376);});
it('rejects a manipulated 123.77 rental claim',async()=>{await expect(claim(await fixture(),12377)).rejects.toThrow('Mietguthaben');});
it('rejects a second claim on the same invoice',async()=>{const f=await fixture();await claim(f);await expect(claim(f)).rejects.toThrow();});
it('bank completion requires evidence and cannot reroute Stripe payments',async()=>{const f=await fixture();await expect(claim(f,12376,true)).rejects.toThrow('Bankzahlungen');const b=await fixture(true),id=await claim(b,12376,true);await expect(db.query("UPDATE credit_note_refunds SET status='succeeded' WHERE id=$1",[id])).rejects.toThrow('Banknachweis');await db.query("UPDATE credit_note_refunds SET status='succeeded',bank_reference='TEST BANK 123' WHERE id=$1",[id]);expect((await db.query<{status:string}>('SELECT status FROM credit_note_refunds WHERE id=$1',[id])).rows[0].status).toBe('succeeded');});
it('does not allow a correction to ignore an already paid rental credit',async()=>{const f=await fixture();await claim(f);await expect(db.query("INSERT INTO inquiry_invoices(id,rental_inquiry_id,invoice_kind,status,parent_invoice_id) VALUES($1,$2,'credit_note','open',$3)",[crypto.randomUUID(),f.inquiry,f.invoice])).rejects.toThrow('Korrekturabrechnung');});