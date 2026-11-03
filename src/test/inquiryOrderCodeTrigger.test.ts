import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const db = new PGlite();
const original = readFileSync("drizzle/migrations/0073_reservation_order_code.sql", "utf8");
const start = original.indexOf("CREATE OR REPLACE FUNCTION public.assign_order_code()");
const end = original.indexOf("$$;", start) + 3;
const fix = readFileSync("drizzle/migrations/0102_fix_sales_inquiry_order_code_trigger.sql", "utf8");

beforeAll(async () => {
  await db.exec(`
    CREATE TABLE public.sales_inquiries (id text PRIMARY KEY, order_code text);
    CREATE TABLE public.rental_inquiries (id text PRIMARY KEY, order_code text, b2b_reservation_id text);
    CREATE TABLE public.b2b_reservations (id text PRIMARY KEY, order_code text);
    CREATE FUNCTION public.generate_order_code() RETURNS text LANGUAGE sql AS $$ SELECT 'ABC234'::text $$;
    ${original.slice(start, end)}
    CREATE TRIGGER trg_assign_order_code BEFORE INSERT OR UPDATE OF order_code ON public.sales_inquiries
      FOR EACH ROW EXECUTE FUNCTION public.assign_order_code();
    CREATE TRIGGER trg_assign_order_code BEFORE INSERT OR UPDATE OF order_code ON public.rental_inquiries
      FOR EACH ROW EXECUTE FUNCTION public.assign_order_code();
  `);
  await expect(db.exec("INSERT INTO public.sales_inquiries (id) VALUES ('broken')"))
    .rejects.toThrow('record "new" has no field "b2b_reservation_id"');
  await db.exec(fix);
}, 30_000);

afterAll(async () => { await db.close(); });

describe("Shared inquiry order-code trigger", () => {
  it.each(["purchase", "used-equipment"])("saves %s sales inquiries without rental-only fields", async (id) => {
    const result = await db.query<{ order_code: string }>(
      "INSERT INTO public.sales_inquiries (id) VALUES ($1) RETURNING order_code", [id],
    );
    expect(result.rows[0]?.order_code).toBe("ABC234");
    const saved = await db.query<{ order_code: string }>("SELECT order_code FROM public.sales_inquiries WHERE id=$1", [id]);
    expect(saved.rows[0]?.order_code).toBe("ABC234");
  });

  it("retains the linked reservation's order code for rental inquiries", async () => {
    await db.exec("INSERT INTO public.b2b_reservations VALUES ('reservation', 'VXQCC4')");
    const result = await db.query<{ order_code: string }>(
      "INSERT INTO public.rental_inquiries (id,b2b_reservation_id) VALUES ('linked','reservation') RETURNING order_code",
    );
    expect(result.rows[0]?.order_code).toBe("VXQCC4");
  });

  it("generates a code for rentals without a reservation", async () => {
    const result = await db.query<{ order_code: string }>(
      "INSERT INTO public.rental_inquiries (id) VALUES ('unlinked') RETURNING order_code",
    );
    expect(result.rows[0]?.order_code).toBe("ABC234");
  });

  it("keeps existing order codes immutable for both inquiry types", async () => {
    for (const table of ["sales_inquiries", "rental_inquiries"]) {
      await db.exec(`INSERT INTO public.${table} (id) VALUES ('immutable')`);
      const result = await db.query<{ order_code: string }>(
        `UPDATE public.${table} SET order_code='ZZZZZZ' WHERE id='immutable' RETURNING order_code`,
      );
      expect(result.rows[0]?.order_code).toBe("ABC234");
    }
  });
});