import { createClient } from "@supabase/supabase-js";
import { expect, it, vi } from "vitest";
import { assertFinanceLocation, invoiceLocation, loadFinanceActor } from "../../supabase/functions/_shared/finance-scope";

function client(invoice: Record<string, unknown>, orderLocation: unknown = "bonn", deny = false) {
  const transport = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    // Every call is synthesized here; this never calls global fetch or a real host.
    const name = url.pathname.split("/").at(-1);
    const body = name === "staff_profiles" ? [{location:"bonn"},{location:"krefeld"}]
      : name === "inquiry_invoices" ? invoice : name === "rental_inquiries" || name === "sales_inquiries" ? {location:orderLocation}
      : name === "has_role" ? false : name === "can_edit_operations" ? !deny : null;
    return new Response(JSON.stringify(body),{status:200,headers:{"Content-Type":"application/json"}});
  });
  return {sdk:createClient("https://isolated.example.test","fixture-key",{auth:{persistSession:false,autoRefreshToken:false,storageKey:crypto.randomUUID()},global:{fetch:transport}}),transport};
}
it("missing authoritative order location never inherits the invoice's location",async()=>{
  const {sdk}=client({location:"bonn",rental_inquiry_id:"order",sales_inquiry_id:null},null);
  expect(await invoiceLocation(sdk,"invoice")).toBeNull();
});
it("dual rental/sales linkage is ambiguous and triggers no order lookup",async()=>{
  const {sdk,transport}=client({location:"bonn",rental_inquiry_id:"rental",sales_inquiry_id:"sales"});
  expect(await invoiceLocation(sdk,"invoice")).toBeNull();
  expect(transport).toHaveBeenCalledTimes(1);
});
it("conflicting invoice/order locations are denied to non-admins",async()=>{
  const {sdk}=client({location:"bonn",rental_inquiry_id:"order"},"krefeld");
  expect(await invoiceLocation(sdk,"invoice")).toBeNull();
});
it("standalone legacy invoice retains its own documented location",async()=>{
  const {sdk}=client({location:"bonn",rental_inquiry_id:null,sales_inquiry_id:null});
  expect(await invoiceLocation(sdk,"invoice")).toBe("bonn");
});
it("real SDK adapter reads all active profile locations and current operations revocation",async()=>{
  const active=client({});
  const scope=await loadFinanceActor(active.sdk,"actor");
  expect(scope).toEqual({admin:false,manager:false,canEdit:true,locations:["bonn","krefeld"]});
  expect(()=>assertFinanceLocation(scope,"krefeld")).not.toThrow();
  const revoked=await loadFinanceActor(client({},"bonn",true).sdk,"actor");
  expect(()=>assertFinanceLocation(revoked,"bonn")).toThrow("Keine Berechtigung");
});