import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const db = new PGlite();
beforeAll(async () => {
  await db.exec(`
    CREATE TABLE rental_inquiries(id uuid PRIMARY KEY, status text, installment_enabled boolean DEFAULT false, closed_manually_at timestamptz, updated_at timestamptz);
    CREATE TABLE sales_inquiries(id uuid PRIMARY KEY, installment_enabled boolean, updated_at timestamptz);
    CREATE TABLE b2b_return_protocols(rental_inquiry_id uuid, status text);
    CREATE TABLE inquiry_invoices(rental_inquiry_id uuid, sales_inquiry_id uuid, invoice_kind text, status text);
  `);
  await db.exec(readFileSync("/tmp/invoice-closeout-migration.sql", "utf8"));
  await db.exec(`CREATE TRIGGER invoice_closeout AFTER INSERT ON inquiry_invoices FOR EACH ROW EXECUTE FUNCTION close_rental_inquiry_on_invoice()`);
}, 30000);
afterAll(() => db.close());

it("an invoice must not hide handover actions on an accepted rental without a return protocol", async () => {
  const id = crypto.randomUUID();
  await db.query("INSERT INTO rental_inquiries(id,status) VALUES($1,'accepted')", [id]);
  await db.query("INSERT INTO inquiry_invoices VALUES($1,null,'invoice','paid')", [id]);
  expect((await db.query<{ status: string }>("SELECT status FROM rental_inquiries WHERE id=$1", [id])).rows[0].status).toBe("accepted");
});

it("signed staff-only returns count as operationally returned for invoice closeout", async () => {
  const id = crypto.randomUUID();
  await db.query("INSERT INTO rental_inquiries(id,status) VALUES($1,'accepted')", [id]);
  await db.query("INSERT INTO b2b_return_protocols VALUES($1,'signed_staff_only')", [id]);
  await db.query("INSERT INTO inquiry_invoices VALUES($1,null,'final','open')", [id]);
  expect((await db.query<{ status: string }>("SELECT status FROM rental_inquiries WHERE id=$1", [id])).rows[0].status).toBe("done");
});

it("draft return protocols do not authorize operational closeout", async () => {
  const id = crypto.randomUUID();
  await db.query("INSERT INTO rental_inquiries(id,status) VALUES($1,'accepted')", [id]);
  await db.query("INSERT INTO b2b_return_protocols VALUES($1,'draft')", [id]);
  await db.query("INSERT INTO inquiry_invoices VALUES($1,null,'invoice','open')", [id]);
  expect((await db.query<{ status: string }>("SELECT status FROM rental_inquiries WHERE id=$1", [id])).rows[0].status).toBe("accepted");
});

it("final invoices still end installments without claiming a missing return", async () => {
  const id = crypto.randomUUID();
  await db.query("INSERT INTO rental_inquiries(id,status,installment_enabled) VALUES($1,'accepted',true)", [id]);
  await db.query("INSERT INTO inquiry_invoices VALUES($1,null,'final','open')", [id]);
  expect((await db.query("SELECT status,installment_enabled FROM rental_inquiries WHERE id=$1", [id])).rows[0]).toEqual({ status: "accepted", installment_enabled: false });
});