import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
const db = new PGlite();
const reserveSql = readFileSync("drizzle/migrations/0104_sign_booking_atomic_reservation.sql", "utf8");
const paymentSql = readFileSync("drizzle/migrations/0107_sign_booking_payment_alias_fix.sql", "utf8");
const capacitySql = readFileSync("drizzle/migrations/0105_sign_booking_capacity_and_payment_safety.sql", "utf8");
function functionOnly(sql: string, name: string) { const start=sql.indexOf(`CREATE OR REPLACE FUNCTION public.${name}(`); return sql.slice(start,sql.indexOf("END; $$;",start)+9); }
beforeAll(async()=>{
await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth; CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT 'service_role' $$;
CREATE TABLE public.rental_inquiries(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),source text,location text,location_email text,product_name text,product_id text,category_slug text,quantity integer,start_date text,start_time text,end_date text,end_time text,delivery_requested boolean,delivery_street text,delivery_postal_code text,delivery_city text,setup_service_requested boolean,customer_name text,customer_email text,customer_phone text,customer_street text,customer_postal_code text,customer_city text,message text,attachments jsonb,raw_payload jsonb,status text,assigned_to uuid,assigned_name text,assigned_at timestamptz,internal_notes text,offer_number text,offer_file_url text,offer_total_gross numeric,offer_sent_at timestamptz,email_sent boolean,created_at timestamptz,updated_at timestamptz,customer_kind text,company_name text,vat_id text,crm_customer_id uuid,b2b_profile_id uuid,b2b_reservation_id uuid,rental_group_id text,offer_payload jsonb,payments jsonb,paid_amount numeric,order_confirmed_at timestamptz,order_confirmed_by_name text,order_confirmation_number text,order_confirmation_file_url text,requested_items jsonb,installment_enabled boolean,installment_amount_net numeric,installment_interval_months integer,installment_next_due date,installment_open_ended boolean,installment_reminded_on date,payment_reminder_sent_at timestamptz,offer_accepted_at timestamptz,payment_followup_sent_at timestamptz,customer_salutation text,payment_reminder_manual_at timestamptz,customer_mobile text,address_form text,use_saturday boolean,use_sunday boolean,availability_pending boolean,order_code text,feedback_coupon_code text,closed_manually_at timestamptz,closed_manually_by uuid,closed_manually_reason text);
CREATE TABLE b2b_managed_products(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),slug text,name text,category text,is_published boolean,quantities jsonb,direct_booking_config jsonb);
CREATE TABLE b2b_reservations(id uuid PRIMARY KEY,product_id text,location text,status text,quantity int,start_date date,end_date date);
CREATE TABLE rental_inquiry_events(rental_inquiry_id uuid,event text,details jsonb);
CREATE TABLE offer_payment_links(inquiry_id uuid,inquiry_table text,status text,updated_at timestamptz);
CREATE TABLE staff_todo_lists(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),title text,description text,location text,status text,priority text,due_date date,created_by_name text,sent_at timestamptz,completed_at timestamptz);
CREATE TABLE staff_todo_items(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),list_id uuid,title text,note text,sort_order int,is_done boolean DEFAULT false);
CREATE FUNCTION public.slt_normalize_location(v text) RETURNS text LANGUAGE sql AS $$ SELECT lower(v) $$;
CREATE FUNCTION public.slt_try_date(v text) RETURNS date LANGUAGE sql AS $$ SELECT nullif(v,'')::date $$;
CREATE FUNCTION public.generate_offer_number_for(v text) RETURNS text LANGUAGE sql AS $$ SELECT 'ANG-M-TEST' $$;
`);
const schema=readFileSync("drizzle/migrations/0103_sign_booking_schema.sql","utf8");
for(const table of ['sign_bookings','sign_permit_uploads']) { const start=schema.indexOf(`CREATE TABLE public.${table}`); await db.exec(schema.slice(start,schema.indexOf(');',start)+2)); }
await db.exec(functionOnly(reserveSql,'reserve_sign_booking')+functionOnly(reserveSql,'expire_sign_bookings')+functionOnly(paymentSql,'sign_booking_payment_state')+functionOnly(capacitySql,'guard_sign_inventory'));
await db.exec(readFileSync('drizzle/migrations/0108_sign_booking_operational_tasks.sql','utf8'));
await db.exec(`CREATE TRIGGER payments AFTER UPDATE OF payments ON rental_inquiries FOR EACH ROW EXECUTE FUNCTION sign_booking_payment_state(); CREATE TRIGGER inventory BEFORE INSERT OR UPDATE OF status,offer_payload,quantity,start_date,end_date,location ON rental_inquiries FOR EACH ROW EXECUTE FUNCTION guard_sign_inventory();`);
await db.exec(`INSERT INTO b2b_managed_products(slug,name,category,is_published,quantities,direct_booking_config) VALUES('halteverbotsschilder-set','Halteverbotsschilder-Set','absperrtechnik',true,'{"bonn":10,"krefeld":10}','{"enabled":true,"live_enabled":false,"standardGrossCents":4900,"sorglosGrossCents":19900,"depositCents":10000,"maxRentalDays":10}');`);
},30000);
afterAll(()=>db.close());
const base={location:'bonn',package:'standard',quantity:1,start_date:'2027-03-01',end_date:'2027-03-05',start_time:'10:00',end_time:'10:00',name:'Luca Sandhoff',email:'luca@sandhoff.org',phone:'021514179904',street:'Anrather Straße 291',postalCode:'47807',city:'Krefeld',customerKind:'private',termsAccepted:true,pickupConfirmed:true,municipalFeesAccepted:true,zoneStreet:'Anrather Straße 291',zonePostalCode:'47807',zoneCity:'Krefeld',message:'Isolated test'};
async function reserve(body: typeof base, request=crypto.randomUUID()) { const r=await db.query<{b: {id:string;inquiry_id:string}}>('SELECT reserve_sign_booking($1,$2,$3::jsonb,NULL) AS b',[request,crypto.randomUUID(),JSON.stringify(body)]); return r.rows[0]?.b; }
describe('Complete isolated sign reservations',()=>{
it.each([['bonn','standard',14900],['bonn','sorglos',29900],['krefeld','standard',14900],['krefeld','sorglos',29900]])('saves and fully pays %s/%s at %i cents',async(location,pkg,total)=>{
 const request=crypto.randomUUID(), body={...base,location:String(location),package:String(pkg)};
 const b=await reserve(body,request); expect(b).toBeDefined(); if(!b) return;
 expect((await reserve(body,request))?.id).toBe(b.id);
 const result=await db.query<{total_cents:number;hold:number}>('SELECT total_cents,extract(epoch from expires_at-created_at)::int AS hold FROM sign_bookings WHERE id=$1',[b.id]);
 expect(result.rows[0]).toEqual({total_cents:total,hold:86400});
 const inquiry=await db.query<{customer_email:string}>('SELECT customer_email FROM rental_inquiries WHERE id=$1',[b.inquiry_id]); expect(inquiry.rows[0]?.customer_email).toBe('luca@sandhoff.org');
 await db.query('UPDATE rental_inquiries SET payments=$2::jsonb WHERE id=$1',[b.inquiry_id,JSON.stringify([{amount:Number(total)/100,label:'Banküberweisung'}])]);
 expect((await db.query<{status:string}>('SELECT status FROM sign_bookings WHERE id=$1',[b.id])).rows[0]?.status).toBe('paid');
});
it.each(['bonn','krefeld'])('rejects the eleventh set and releases expired holds in %s',async location=>{
 const body={...base,location,quantity:10,start_date:'2027-04-05',end_date:'2027-04-09'};
 const b=await reserve(body); expect(b).toBeDefined(); if(!b) return;
 await expect(reserve({...body,quantity:1})).rejects.toThrow('Nicht genügend Sets');
 await db.query("UPDATE sign_bookings SET expires_at=now()-interval '1 second' WHERE id=$1",[b.id]); await db.exec('SELECT expire_sign_bookings()');
 expect((await db.query<{status:string}>('SELECT status FROM sign_bookings WHERE id=$1',[b.id])).rows[0]?.status).toBe('expired');
 expect(await reserve(body)).toBeDefined();
});
it('rejects other customer addresses while production remains disabled',async()=>{await expect(reserve({...base,email:'someone@example.com'})).rejects.toThrow('Testbetrieb');});
it.each(['bonn','krefeld'])('creates one setup checklist at %s and enforces permit review before paid setup',async location=>{
 const body={...base,location,package:'sorglos',start_date:'2027-06-07',end_date:'2027-06-09'}, request=crypto.randomUUID();
 const b=await reserve(body,request); if(!b) throw new Error('Missing booking');
 await reserve(body,request);
 const lists=await db.query<{id:string;location:string;status:string}>('SELECT id,location,status FROM staff_todo_lists WHERE sign_booking_id=$1',[b.id]);
 expect(lists.rows).toHaveLength(1); expect(lists.rows[0]?.location).toBe(location); expect(lists.rows[0]?.status).toBe('sent');
 const list=lists.rows[0]; if(!list) throw new Error('Missing task');
 expect((await db.query('SELECT * FROM staff_todo_items WHERE list_id=$1',[list.id])).rows).toHaveLength(3);
 await expect(db.query("UPDATE staff_todo_items SET is_done=true WHERE list_id=$1 AND sign_step='setup'",[list.id])).rejects.toThrow('Genehmigungsprüfung');
 await db.query("UPDATE staff_todo_items SET is_done=true WHERE list_id=$1 AND sign_step='permit'",[list.id]);
 await expect(db.query("UPDATE staff_todo_items SET is_done=true WHERE list_id=$1 AND sign_step='setup'",[list.id])).rejects.toThrow('Zahlungseingang');
 await db.query('UPDATE rental_inquiries SET payments=$2::jsonb WHERE id=$1',[b.inquiry_id,JSON.stringify([{amount:299}])]);
 await db.query("UPDATE staff_todo_items SET is_done=true WHERE list_id=$1 AND sign_step='setup'",[list.id]);
 expect((await db.query('SELECT * FROM staff_todo_lists WHERE sign_booking_id=$1',[b.id])).rows).toHaveLength(1);
});
it('creates no setup work for self-pickup and closes work for expired setup holds',async()=>{
 const standard=await reserve({...base,start_date:'2027-07-05',end_date:'2027-07-07'}); if(!standard) throw new Error('Missing booking');
 expect((await db.query('SELECT * FROM staff_todo_lists WHERE sign_booking_id=$1',[standard.id])).rows).toHaveLength(0);
 const setup=await reserve({...base,package:'sorglos',start_date:'2027-08-02',end_date:'2027-08-04'}); if(!setup) throw new Error('Missing booking');
 await db.query("UPDATE sign_bookings SET expires_at=now()-interval '1 second' WHERE id=$1",[setup.id]); await db.exec('SELECT expire_sign_bookings()');
 expect((await db.query<{status:string}>('SELECT status FROM staff_todo_lists WHERE sign_booking_id=$1',[setup.id])).rows[0]?.status).toBe('done');
});
});
