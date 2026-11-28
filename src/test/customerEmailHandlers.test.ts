import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";
import { shouldSendCustomerEmail } from "../../supabase/functions/_shared/customer-email-policy";
import * as financeScope from "../../supabase/functions/_shared/finance-scope";
const scopeDeps = { ...financeScope };

// Execute the actual edge handler with isolated auth/storage/provider adapters.
function handler(file: string, dependencies: Record<string, unknown>) {
  let serve: ((request: Request) => Promise<Response>) | undefined;
  const source = readFileSync(`supabase/functions/${file}/index.ts`, "utf8").replace(/^import[\s\S]*?;\s*$/gm, "");
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
  const schema: Record<string, unknown> = {};
  const z = new Proxy(() => schema, { get: () => () => schema });
  const chain = new Proxy(schema, { get: (_, key) => key === "safeParse" ? (data: unknown) => ({ success: true, data }) : () => chain });
  Object.assign(schema, { safeParse: (data: unknown) => ({ success: true, data }) });
  const schemaZ = new Proxy(z, { get: () => () => chain });
  vm.runInNewContext(compiled, { Request, Response, Error, console, Date, Intl, ...dependencies, z: schemaZ,
    Deno: { env: { get: () => "isolated-test" }, serve: (fn: typeof serve) => { serve = fn; } },
  });
  if (!serve) throw new Error("Handler not registered");
  return serve;
}

describe("customer mail suppression in real edge handlers (no money/mail)", () => {
  it.each(["rental_inquiries", "sales_inquiries"])("stores online acceptance in %s without sending the unnecessary team email", async (table) => {
    const fetch = vi.fn();
    const updates: Record<string, unknown>[] = [];
    const inquiry = { id: "order", status: "offer_sent", offer_number: "ANG-TEST", customer_email: "customer@example.test", location: "bonn", offer_payload: { payment_terms: "net_14" } };
    const link = { id: "link", inquiry_id: "order", inquiry_table: table, status: "active", offer_number: "ANG-TEST", gross_amount: 114.35 };
    const service = { rpc: async (name: string) => ({ data: name === "check_public_rate_limit" ? true : null }),
      from: (name: string) => {
        let updating = false;
        const result = () => ({ data: updating ? { id: "link" } : name === "offer_acceptance_links" ? link : inquiry });
        const q = { select: () => q, eq: () => q, update: (patch: Record<string, unknown>) => { updating = true; updates.push(patch); return q; }, maybeSingle: async () => result(), then: (resolve: (v: unknown) => unknown) => Promise.resolve(result()).then(resolve) };
        return q;
      } };
    const run = handler("offer-accept", { createClient: () => service, allowsBindingOffer: () => true,
      LOCATION_CONTACTS: { bonn: { name: "Bonn", email: "team@example.test", phone: "" } }, resolveLocationKey: () => "bonn", isPrepayTerms: () => false,
      shouldSendCustomerEmail, operationalEmailRecipient: (_: string, email: string) => email,
      documentEmailRecipients: (email: string) => ({ to: [email] }), codedSubject: async (_: unknown, subject: string) => subject, fetch });
    const response = await run(new Request("https://local.test", { method: "POST", body: JSON.stringify({ action: "accept", token: "isolated-token", signer_name: "Customer", signature_data: "data:image/png;base64,AA==", agb_accepted: true, binding_accepted: true }) }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, status: "accepted" });
    expect(updates).toContainEqual(expect.objectContaining({ status: "accepted", signer_name: "Customer", accepted_channel: "online", agb_accepted: true }));
    expect(fetch).not.toHaveBeenCalled();
  });
  it("completes a credit refund without an extra customer email", async () => {
    const fetch = vi.fn();
    const creditRefund = vi.fn(async () => ({ success: true, status: "succeeded", amount_cents: 4000 }));
    const service = { auth: { getUser: async () => ({ data: { user: { id: "staff" } } }) }, rpc: async () => ({ data: true }),
      from: () => { const q: any = { maybeSingle: async () => ({ data: { location: "bonn" } }), select: () => q, eq: () => q, in: async () => ({ data: [{ role: "admin" }] }) }; return q; } };
    const stripeClient = vi.fn(() => { throw new Error("Provider access forbidden in handler test"); });
    const setRentalCheckoutStripe = vi.fn();
    const run = handler("offer-payment-admin", { ...scopeDeps, corsHeaders: { 'Access-Control-Allow-Origin': '*' }, createClient: () => service, isStripeConfigured: () => true, creditRefund, setRentalCheckoutStripe, stripeClient, fetch });
    const response = await run(new Request("https://local.test", { method: "POST", headers: { Authorization: "Bearer isolated" }, body: JSON.stringify({ action: "refund_credit_note", credit_note_id: "credit" }) }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, amount_cents: 4000, customer_mailed: false });
    expect(creditRefund).toHaveBeenCalledWith(service, "credit", "staff", true);
    expect(setRentalCheckoutStripe).toHaveBeenCalledOnce();
    expect(stripeClient).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each(["pending", "failed", "partial_failed"])("does not report %s credit refunds as a completed payout or send mail", async (status) => {
    const fetch = vi.fn(() => { throw new Error("External access forbidden"); });
    const creditRefund = vi.fn(async () => ({ success: true, status, amount_cents: 4000 }));
    const service = { auth: { getUser: async () => ({ data: { user: { id: "staff" } } }) }, rpc: async () => ({ data: true }),
      from: () => { const q: any = { maybeSingle: async () => ({ data: { location: "bonn" } }), select: () => q, eq: () => q, in: async () => ({ data: [{ role: "admin" }] }) }; return q; } };
    const run = handler("offer-payment-admin", { ...scopeDeps, corsHeaders: {}, createClient: () => service, isStripeConfigured: () => true,
      setRentalCheckoutStripe: vi.fn(), creditRefund, fetch });
    const response = await run(new Request("https://local.test", { method: "POST", headers: { Authorization: "Bearer isolated" }, body: JSON.stringify({ action: "refund_credit_note", credit_note_id: "credit" }) }));
    expect(await response.json()).toMatchObject({ status, customer_mailed: false });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("preserves a refund failure and never sends a success mail", async () => {
    const fetch = vi.fn(() => { throw new Error("External access forbidden"); });
    const creditRefund = vi.fn(async () => { throw new Error("Provider outcome unknown"); });
    const service = { auth: { getUser: async () => ({ data: { user: { id: "staff" } } }) }, rpc: async () => ({ data: true }),
      from: () => { const q: any = { maybeSingle: async () => ({ data: { location: "bonn" } }), select: () => q, eq: () => q, in: async () => ({ data: [{ role: "admin" }] }) }; return q; } };
    const run = handler("offer-payment-admin", { ...scopeDeps, corsHeaders: {}, createClient: () => service, isStripeConfigured: () => true,
      setRentalCheckoutStripe: vi.fn(), creditRefund, fetch });
    const response = await run(new Request("https://local.test", { method: "POST", headers: { Authorization: "Bearer isolated" }, body: JSON.stringify({ action: "refund_credit_note", credit_note_id: "credit" }) }));
    expect(await response.json()).toMatchObject({ success: false, error: "Provider outcome unknown" });
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each([null, "standort_mitarbeiter"])("denies credit execution without the required privileged role: %s", async (role) => {
    const creditRefund = vi.fn();
    const service = { auth: { getUser: async () => ({ data: { user: { id: "staff" } } }) }, rpc: async () => ({ data: true }),
      from: () => { const q: any = { maybeSingle: async () => ({ data: { location: "bonn" } }), select: () => q, eq: () => q, in: async () => ({ data: role ? [{ role }] : [] }) }; return q; } };
    const run = handler("offer-payment-admin", { ...scopeDeps, corsHeaders: {}, createClient: () => service, isStripeConfigured: () => true,
      setRentalCheckoutStripe: vi.fn(), creditRefund });
    const response = await run(new Request("https://local.test", { method: "POST", headers: { Authorization: "Bearer isolated" }, body: JSON.stringify({ action: "refund_credit_note", credit_note_id: "credit" }) }));
    expect(response.status).toBe(403);
    expect(creditRefund).not.toHaveBeenCalled();
  });
  it("hourly job sends no customer payment reminder but still processes staff decline notices", async () => {
    const fetch = vi.fn();
    const processOfferFollowups = vi.fn(async () => ({ sent: 0 }));
    const from = vi.fn();
    const run = handler("payment-reminder", { createClient: () => ({ from }), isCronCall: async () => true,
      shouldSendCustomerEmail, isStripeTestMode: () => false, processOfferFollowups, fetch });
    const response = await run(new Request("https://local.test", { method: "POST", body: "{}" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ due: 0, sent: 0 });
    expect(from).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(processOfferFollowups).toHaveBeenCalledOnce();
  });
});
describe("offer-payment-admin location scope before financial side effects", () => {
  function scopedService(opts: { admin?: boolean; manager?: boolean; staff: string; orderLocation: string; roles: string[] }) {
    const writes: string[] = [];
    const service = { auth: { getUser: async () => ({ data: { user: { id: "staff" } } }) },
      rpc: async (name: string, args: Record<string, unknown>) => ({ data: name === "has_role" ? (args._role === "admin" ? !!opts.admin : !!opts.manager) : true, error: null }),
      from: (table: string) => {
        const result = () => ({ error: null, data: table === "staff_profiles" ? [{ location: opts.staff }]
          : table === "inquiry_invoices" ? { location: opts.orderLocation, rental_inquiry_id: "order", sales_inquiry_id: null }
          : table === "rental_inquiries" ? { location: opts.orderLocation }
          : table === "offer_payment_links" ? { id: "link", inquiry_table: "rental_inquiries", inquiry_id: "order", status: "paid", payment_intent_id: "pi_x", deposit_cents: 10000, livemode: true }
          : null });
        const q: any = { select: () => q, eq: () => q, in: async () => ({ data: opts.roles.map(role => ({ role })), error: null }), maybeSingle: async () => result(), single: async () => result(),
          insert: () => { writes.push(table); return q; }, then: (r: (v: unknown) => unknown) => Promise.resolve(result()).then(r) };
        return q;
      } };
    return { service, writes };
  }
  const deps = (service: unknown, creditRefund = vi.fn(), stripeClient = vi.fn(() => { throw new Error("Provider forbidden"); })) =>
    ({ ...scopeDeps, corsHeaders: {}, createClient: () => service, isStripeConfigured: () => true, isStripeTestMode: () => false, setRentalCheckoutStripe: vi.fn(), creditRefund, stripeClient, fetch: vi.fn(() => { throw new Error("Network forbidden"); }) });
  const post = (body: unknown) => new Request("https://local.test", { method: "POST", headers: { Authorization: "Bearer isolated" }, body: JSON.stringify(body) });
  it("branch manager of Bonn cannot read or execute a Krefeld credit refund", async () => {
    const { service } = scopedService({ manager: true, staff: "bonn", orderLocation: "krefeld", roles: ["niederlassungsleiter"] });
    const creditRefund = vi.fn();
    for (const action of ["credit_refund_info", "refund_credit_note"]) {
      const res = await handler("offer-payment-admin", deps(service, creditRefund))(post({ action, credit_note_id: "credit" }));
      expect(res.status).toBe(403);
    }
    expect(creditRefund).not.toHaveBeenCalled();
  });
  it("admin keeps central cross-location credit access", async () => {
    const { service } = scopedService({ admin: true, staff: "bonn", orderLocation: "krefeld", roles: ["admin"] });
    const creditRefund = vi.fn(async () => ({ success: true, status: "succeeded" }));
    const res = await handler("offer-payment-admin", deps(service, creditRefund))(post({ action: "credit_refund_info", credit_note_id: "credit" }));
    expect(res.status).toBe(200); expect(creditRefund).toHaveBeenCalledOnce();
  });
  it("Bonn staff cannot refund a Krefeld Stripe deposit: no reservation, no provider", async () => {
    const { service, writes } = scopedService({ staff: "bonn", orderLocation: "krefeld", roles: ["standort_mitarbeiter"] });
    const stripeClient = vi.fn(() => { throw new Error("Provider forbidden"); });
    const res = await handler("offer-payment-admin", deps(service, vi.fn(), stripeClient))(post({ action: "refund_deposit", link_id: "link", amount_cents: 1000, request_id: "req" }));
    expect(res.status).toBe(403); expect(writes).toEqual([]); expect(stripeClient).not.toHaveBeenCalled();
  });
  it("Bonn staff cannot sync Krefeld deposit refunds", async () => {
    const { service } = scopedService({ staff: "bonn", orderLocation: "krefeld", roles: ["standort_mitarbeiter"] });
    const stripeClient = vi.fn(() => { throw new Error("Provider forbidden"); });
    const res = await handler("offer-payment-admin", deps(service, vi.fn(), stripeClient))(post({ action: "sync_deposit_refunds", inquiry_id: "order" }));
    expect(res.status).toBe(403); expect(stripeClient).not.toHaveBeenCalled();
  });
  it("manipulated location parameters are ignored; the record decides", async () => {
    const { service } = scopedService({ manager: true, staff: "bonn", orderLocation: "krefeld", roles: ["niederlassungsleiter"] });
    const res = await handler("offer-payment-admin", deps(service))(post({ action: "order_credit_info", inquiry_id: "order", location: "bonn" }));
    expect(res.status).toBe(403);
  });
});
