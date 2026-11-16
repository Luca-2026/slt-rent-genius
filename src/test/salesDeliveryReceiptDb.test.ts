import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll,afterAll,it,expect } from "vitest";
const db=new PGlite();
const id="00000000-0000-0000-0000-000000000001";
beforeAll(async()=>{
 await db.exec(`CREATE ROLE authenticated;CREATE ROLE service_role;CREATE SCHEMA auth;CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT '${id}'::uuid $$;CREATE FUNCTION can_edit_operations(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;CREATE FUNCTION generate_delivery_note_number() RETURNS text LANGUAGE sql AS $$ SELECT 'LS-TEST' $$;CREATE TABLE sales_inquiries(id uuid PRIMARY KEY);INSERT INTO sales_inquiries VALUES('${id}');`);
 await db.exec(readFileSync("drizzle/migrations/0196_sales_delivery_notes.sql","utf8"));
 await db.exec(`INSERT INTO sales_delivery_notes(id,sales_inquiry_id,snapshot,file_path,created_by) VALUES('${id}','${id}','{"items":[{"name":"Sold machine","quantity":1}]}','original.pdf','${id}')`);
},30000);
afterAll(()=>db.close());
it("does not mark a printed unsigned note as received",async()=>{expect((await db.query("SELECT receipt_method,received_at FROM sales_delivery_notes")).rows[0]).toEqual({receipt_method:null,received_at:null});});
it("requires a complete receipt and keeps the original immutable",async()=>{
 await expect(db.exec("UPDATE sales_delivery_notes SET receipt_method='paper'")).rejects.toThrow("unvollständig");
 await expect(db.exec("UPDATE sales_delivery_notes SET snapshot='{}'")).rejects.toThrow("unveränderlich");
});
it("stores signed paper evidence and prevents replacement",async()=>{
 await db.exec(`UPDATE sales_delivery_notes SET receipt_method='paper',signer_name='Test recipient',received_at=now(),receipt_recorded_at=now(),receipt_recorded_by='${id}',signed_file_path='signed.pdf'`);
 expect((await db.query("SELECT file_path,signed_file_path,receipt_method FROM sales_delivery_notes")).rows[0]).toEqual({file_path:"original.pdf",signed_file_path:"signed.pdf",receipt_method:"paper"});
 await expect(db.exec("UPDATE sales_delivery_notes SET signer_name='Other recipient'")).rejects.toThrow("abgeschlossen");
});