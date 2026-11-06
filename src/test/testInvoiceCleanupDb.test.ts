import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, it, expect } from 'vitest';
const db = new PGlite();
const order = '11111111-1111-4111-8111-111111111111';
beforeAll(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT NULL::uuid $$;
    CREATE FUNCTION has_role(uuid,text) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
    CREATE SEQUENCE numbers;
    CREATE FUNCTION generate_inquiry_credit_note_number_for(text) RETURNS text LANGUAGE sql AS $$ SELECT 'GS-'||$1||'-'||nextval('numbers') $$;
    CREATE TABLE inquiry_invoices(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),invoice_number text,invoice_kind text DEFAULT 'invoice',
      parent_invoice_id uuid,inquiry_type text DEFAULT 'rental',rental_inquiry_id uuid,sales_inquiry_id uuid,status text DEFAULT 'draft',
      net_amount numeric,vat_amount numeric,gross_amount numeric,vat_rate numeric DEFAULT 19,credited_amount numeric DEFAULT 0,
      invoice_date date DEFAULT current_date,due_date date,notes text,updated_at timestamptz);
    CREATE TABLE b2b_invoices(LIKE inquiry_invoices INCLUDING DEFAULTS); ALTER TABLE b2b_invoices ADD COLUMN reservation_id uuid;
    CREATE TABLE inquiry_invoice_items(invoice_id uuid,position integer,product_name text,description text,quantity numeric,unit text,unit_price numeric,total_price numeric,vat_rate numeric,addons jsonb);
    CREATE TABLE b2b_invoice_items(invoice_id uuid,product_name text,description text,quantity numeric,unit_price numeric,total_price numeric);
    CREATE TABLE credit_note_refunds(credit_note_id uuid,refund_kind text);
  `);
  await db.exec(readFileSync('drizzle/migrations/0160_automatic_registered_test_invoice_credits.sql','utf8'));
  await db.query("INSERT INTO test_order_registry(source_table,source_id,evidence) VALUES('rental_inquiries',$1,'Explicit isolated E2E test order')", [order]);
},30000);
afterAll(() => db.close());
it('registered 378.52 EUR test invoice automatically cancels with exact negative net/VAT/gross',async()=>{
  const { rows } = await db.query<{id:string}>("INSERT INTO inquiry_invoices(invoice_number,rental_inquiry_id,status,net_amount,vat_amount,gross_amount) VALUES('RE-TEST-1',$1,'paid',318.08,60.44,378.52) RETURNING id",[order]);
  const invoice = (await db.query<{status:string,credited_amount:string}>('SELECT status,credited_amount FROM inquiry_invoices WHERE id=$1',[rows[0].id])).rows[0];
  expect(invoice.status).toBe('cancelled'); expect(Number(invoice.credited_amount)).toBe(378.52);
  const c = (await db.query<{net_amount:string,vat_amount:string,gross_amount:string}>('SELECT * FROM inquiry_invoices WHERE parent_invoice_id=$1',[rows[0].id])).rows[0];
  expect([Number(c.net_amount),Number(c.vat_amount),Number(c.gross_amount)]).toEqual([-318.08,-60.44,-378.52]);
  await db.query("SELECT credit_registered_test_invoice('inquiry_invoices',$1)",[rows[0].id]);
  expect((await db.query('SELECT * FROM inquiry_invoices WHERE parent_invoice_id=$1',[rows[0].id])).rows).toHaveLength(1);
});
it('production invoice with TEST in its name remains unchanged unless explicitly registered',async()=>{
  const { rows } = await db.query<{id:string}>("INSERT INTO inquiry_invoices(invoice_number,status,net_amount,vat_amount,gross_amount) VALUES('RE-TEST-NAME-REAL','paid',100,19,119) RETURNING id");
  expect((await db.query<{status:string}>('SELECT status FROM inquiry_invoices WHERE id=$1',[rows[0].id])).rows[0].status).toBe('paid');
  expect((await db.query('SELECT * FROM inquiry_invoices WHERE parent_invoice_id=$1',[rows[0].id])).rows).toHaveLength(0);
});
it('draft does not create credits; finalization creates them immediately',async()=>{
  const { rows } = await db.query<{id:string}>("INSERT INTO inquiry_invoices(invoice_number,rental_inquiry_id,net_amount,vat_amount,gross_amount) VALUES('RE-TEST-DRAFT',$1,468,88.92,556.92) RETURNING id",[order]);
  expect((await db.query('SELECT * FROM inquiry_invoices WHERE parent_invoice_id=$1',[rows[0].id])).rows).toHaveLength(0);
  await db.query("UPDATE inquiry_invoices SET status='paid' WHERE id=$1",[rows[0].id]);
  expect(Number((await db.query<{gross_amount:string}>('SELECT gross_amount FROM inquiry_invoices WHERE parent_invoice_id=$1',[rows[0].id])).rows[0].gross_amount)).toBe(-556.92);
});
it('portal invoices receive the same automatic full accounting credit',async()=>{
  const { rows } = await db.query<{id:string}>("INSERT INTO b2b_invoices(invoice_number,net_amount,vat_amount,gross_amount) VALUES('RE-PORTAL',16.81,3.19,20) RETURNING id");
  await db.query("INSERT INTO test_order_registry(source_table,source_id,evidence) VALUES('b2b_invoices',$1,'Explicit isolated portal test')",[rows[0].id]);
  await db.query("UPDATE b2b_invoices SET status='open' WHERE id=$1",[rows[0].id]);
  expect(Number((await db.query<{gross_amount:string}>('SELECT gross_amount FROM b2b_invoices WHERE parent_invoice_id=$1',[rows[0].id])).rows[0].gross_amount)).toBe(-20);
});
it('customer roles cannot register tests or execute the correction function',async()=>{
  await db.exec('SET ROLE authenticated');
  try {
    await expect(db.query("INSERT INTO test_order_registry VALUES('rental_inquiries',gen_random_uuid(),'Unauthorized test marker',now())")).rejects.toThrow();
    await expect(db.query("SELECT credit_registered_test_invoice('inquiry_invoices',gen_random_uuid())")).rejects.toThrow();
  } finally { await db.exec('RESET ROLE'); }
});