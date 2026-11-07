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
  it("completes a credit refund without an extra customer email", async () => {
    const fetch = vi.fn();
    const creditRefund = vi.fn(async () => ({ success: true, status: "succeeded", amount_cents: 4000 }));
    const service = { auth: { getUser: async () => ({ data: { user: { id: "staff" } } }) }, rpc: async () => ({ data: true }),
      from: () => { const q = { select: () => q, eq: () => q, in: async () => ({ data: [{ role: "admin" }] }) }; return q; } };
    const run = handler("offer-payment-admin", { createClient: () => service, isStripeConfigured: () => true, creditRefund, fetch });
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