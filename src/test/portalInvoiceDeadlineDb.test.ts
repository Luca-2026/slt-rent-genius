import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, expect, it } from "vitest";
const db = new PGlite();
beforeAll(async () => {
  await db.exec("CREATE TABLE b2b_invoices(id text primary key, status text, invoice_date date, due_date date, payment_terms text, payment_due_days integer);");
  await db.exec(readFileSync("drizzle/migrations/0201_preserve_portal_invoice_payment_deadline.sql", "utf8"));
  await db.exec("CREATE TRIGGER due BEFORE INSERT OR UPDATE ON b2b_invoices FOR EACH ROW EXECUTE FUNCTION compute_invoice_due_date();");
}, 30000);
afterAll(() => db.close());
it("new portal invoices use three saved calendar days rather than the net_14 label", async () => {
  await db.exec("INSERT INTO b2b_invoices VALUES('new','open','2026-11-21',null,'net_14',3)");
  expect((await db.query<{ due: string }>("SELECT due_date::text due FROM b2b_invoices WHERE id='new'")).rows[0]?.due).toBe("2026-11-24");
});
it("draft finalization uses the same three-day date as the PDF", async () => {
  await db.exec("INSERT INTO b2b_invoices VALUES('draft','draft',null,null,'net_14',3); UPDATE b2b_invoices SET status='open',invoice_date='2026-11-21' WHERE id='draft'");
  expect((await db.query<{ due: string }>("SELECT due_date::text due FROM b2b_invoices WHERE id='draft'")).rows[0]?.due).toBe("2026-11-24");
});
it.each(["open", "paid", "overdue", "cancelled"])("does not recalculate a historical %s invoice", async (status) => {
  await db.query("INSERT INTO b2b_invoices VALUES($1,'draft','2026-11-21','2026-12-05','net_14',14)", [status]);
  await db.query("UPDATE b2b_invoices SET status=$1 WHERE id=$1", [status]);
  await db.query("UPDATE b2b_invoices SET payment_due_days=3 WHERE id=$1", [status]);
  expect((await db.query<{ due: string }>("SELECT due_date::text due FROM b2b_invoices WHERE id=$1", [status])).rows[0]?.due).toBe("2026-12-05");
});