import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, it, expect } from 'vitest';
const db = new PGlite();
const id = '11111111-1111-4111-8111-111111111111';
const payload = { items: [{ product_name: 'Verkaufsgerät', quantity: 2, articles: 2, duration: 1, unit: 'stueck', unit_price: 100 }], deposit: 0, payment_terms: 'vorkasse', bank_transfer_discount: null, totals: { grossAmount: 238 } };
beforeAll(async () => {
 await db.exec(`CREATE ROLE authenticated; CREATE ROLE anon; CREATE ROLE service_role; CREATE SCHEMA auth;
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT '${id}'::uuid $$;
 CREATE FUNCTION can_edit_operations(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;
 CREATE FUNCTION is_staff_member(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;
 CREATE FUNCTION guard_order_revision_history() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Historie unveränderlich'; END $$;
 CREATE FUNCTION guard_original_accepted_offer() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF OLD.original_accepted_offer IS NOT NULL AND NEW.original_accepted_offer IS DISTINCT FROM OLD.original_accepted_offer THEN RAISE EXCEPTION 'Original unveränderlich'; END IF; RETURN NEW; END $$;
 CREATE TABLE sales_inquiries(id uuid PRIMARY KEY,status text,customer_kind text,offer_number text,offer_payload jsonb,offer_total_gross numeric,offer_file_url text,offer_sent_at timestamptz,offer_accepted_at timestamptz,order_confirmation_number text,order_confirmation_file_url text);`);
 await db.exec(readFileSync('drizzle/migrations/0144_sales_order_amendment_versions.sql','utf8'));
 await db.query("INSERT INTO sales_inquiries(id,status,customer_kind,offer_number,offer_payload,offer_total_gross) VALUES($1,'accepted','private','ANG-V-ORIGINAL',$2,119)",[id,JSON.stringify({...payload,items:[{...payload.items[0],quantity:1,articles:1}],totals:{grossAmount:119}})]);
},30000);
afterAll(()=>db.close());
it('sales order changes keep original 119 offer evidence and save operational 238',async()=>{
 await db.query("SELECT save_sales_order_amendment($1,0,$2,'Telefonisch vereinbart',now())",[id,JSON.stringify(payload)]);
 const row=(await db.query<any>('SELECT * FROM sales_inquiries WHERE id=$1',[id])).rows[0];
 expect(row.offer_number).toBe('ANG-V-ORIGINAL');expect(Number(row.offer_total_gross)).toBe(238);expect(Number(row.original_accepted_offer.offer_total_gross)).toBe(119);expect(row.order_revision).toBe(1);
});
it('stale sales change cannot overwrite the current revision',async()=>{
 await expect(db.query("SELECT save_sales_order_amendment($1,0,$2,'Telefonisch vereinbart',now())",[id,JSON.stringify(payload)])).rejects.toThrow('inzwischen');
});
it('sales totals cannot be manipulated by one cent',async()=>{
 await expect(db.query("SELECT save_sales_order_amendment($1,1,$2,'Telefonisch vereinbart',now())",[id,JSON.stringify({...payload,totals:{grossAmount:238.01}})])).rejects.toThrow('Auftragssumme');
});
it('private sales customer cannot receive invoice payment terms',async()=>{
 await expect(db.query("SELECT save_sales_order_amendment($1,1,$2,'Telefonisch vereinbart',now())",[id,JSON.stringify({...payload,payment_terms:'net_14'})])).rejects.toThrow('Zahlungsbedingungen');
});
it('history cannot be rewritten',async()=>{
 await expect(db.exec("UPDATE sales_order_revisions SET agreement_note='changed'")).rejects.toThrow('unveränderlich');
});