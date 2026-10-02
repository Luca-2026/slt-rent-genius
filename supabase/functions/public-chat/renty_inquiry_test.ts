import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { validateInquiry, isTestEmail } from "./renty-inquiry.ts";

const base = {
  location: "krefeld", items: [{ product_name: "Minibagger 2 t", quantity: 1, product_url: null }],
  start_date: "2026-10-12", start_time: null, end_date: "2026-10-14", end_time: null, open_ended: false,
  delivery: false, delivery_street: null, delivery_postal_code: null, delivery_city: null,
  customer_kind: "private", company_name: null, customer_name: "Max Muster", customer_email: "max@example.com",
  customer_phone: "0151 1234567", customer_street: null, customer_postal_code: null, customer_city: null,
  project_description: null, customer_confirmed_summary: true,
};

Deno.test("valid inquiry passes", () => assertEquals(validateInquiry(base, "2026-10-02").errors, []));
Deno.test("missing pieces are listed", () => {
  const r = validateInquiry({ ...base, customer_email: "max", customer_phone: "12", delivery: true, customer_kind: "business", customer_confirmed_summary: false }, "2026-10-02");
  assertEquals(r.errors.length, 5);
});
Deno.test("past and inverted dates rejected", () => {
  assert(validateInquiry({ ...base, start_date: "2026-09-01" }, "2026-10-02").errors.some((e) => e.includes("Vergangenheit")));
  assert(validateInquiry({ ...base, end_date: "2026-10-10" }, "2026-10-02").errors.some((e) => e.includes("vor dem")));
});
Deno.test("open ended needs no end", () => assertEquals(validateInquiry({ ...base, end_date: null, open_ended: true }, "2026-10-02").errors, []));
Deno.test("test addresses detected", () => { assert(isTestEmail("a@example.com")); assert(!isTestEmail("a@gmail.com")); });
