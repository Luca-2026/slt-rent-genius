import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";
import { shouldSendCustomerEmail } from "../../supabase/functions/_shared/customer-email-policy";

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
  vm.runInNewContext(compiled, { Request, Response, console, Date, Intl, ...dependencies, z: schemaZ,
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
      from: () => { const q = { select: () => q, eq: () => q, in: async () => ({ data: [{ role: "admin" }] }) }; return q; } };
  const run = handler("offer-payment-admin", { corsHeaders: { 'Access-Control-Allow-Origin': '*' }, createClient: () => service, isStripeConfigured: () => true, creditRefund, fetch });
    const response = await run(new Request("https://local.test", { method: "POST", headers: { Authorization: "Bearer isolated" }, body: JSON.stringify({ action: "refund_credit_note", credit_note_id: "credit" }) }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, amount_cents: 4000, customer_mailed: false });
    expect(creditRefund).toHaveBeenCalledWith(service, "credit", "staff", true);
    expect(fetch).not.toHaveBeenCalled();
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