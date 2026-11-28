import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { z } from "zod";
import { expect, it, vi } from "vitest";
import * as financeScope from "../../supabase/functions/_shared/finance-scope";

// Actual handler AND actual discriminated schema, no permissive schema mock.
function handler(dependencies: Record<string, unknown>) {
  let serve: ((request:Request)=>Promise<Response>)|undefined;
  const source=readFileSync("supabase/functions/offer-payment-admin/index.ts","utf8").replace(/^import[\s\S]*?;\s*$/gm,"");
  const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
  vm.runInNewContext(compiled,{Request,Response,Error,Date,console,z,...financeScope,...dependencies,
    Deno:{env:{get:()=>"isolated"},serve:(fn:typeof serve)=>{serve=fn;}}});
  if(!serve) throw new Error("Handler absent");
  return serve;
}
const ORDER="11111111-1111-1111-1111-111111111111",REQ="22222222-2222-2222-2222-222222222222";
const post=(body:unknown)=>new Request("https://isolated.example.test",{method:"POST",headers:{Authorization:"Bearer local-fixture"},body:JSON.stringify(body)});
function authService() {
  return {auth:{getUser:async()=>({data:{user:{id:ORDER}},error:null})},rpc:vi.fn(async()=>({data:true,error:null})),from:vi.fn<(table:string)=>unknown>(()=>{throw new Error("Unexpected DB read");})};
}
it.each([
  {action:"unknown",link_id:ORDER},
  {action:"refund_deposit",link_id:ORDER,request_id:REQ,amount_cents:1.5},
  {action:"refund_deposit",link_id:ORDER,request_id:REQ,amount_cents:0},
  {action:"refund_deposit",link_id:"manipulated",request_id:REQ,amount_cents:100},
  {action:"order_refund_confirm_manual",inquiry_id:ORDER,request_id:REQ,reference:"ABC"},
  {action:"order_refund_confirm_manual",inquiry_id:ORDER,request_id:REQ,reference:"ABC",paid_on:"invalid"},
])("invalid action/ID/cents/date is refused before finance reads: %j",async body=>{
  const service=authService(),stripe=vi.fn(()=>{throw new Error("Provider forbidden");}),orderRefund=vi.fn();
  const run=handler({createClient:()=>service,setRentalCheckoutStripe:vi.fn(),stripeClient:stripe,orderRefund});
  expect((await run(post(body))).status).toBe(400);
  expect(service.from).not.toHaveBeenCalled(); expect(orderRefund).not.toHaveBeenCalled(); expect(stripe).not.toHaveBeenCalled();
});
it.each(["order_refund_info","order_refund_sync","order_refund_execute","order_refund_confirm_manual"])("validated %s dispatches only to order refunds, never deposit provider",async action=>{
  const service=authService();
  const q={select:()=>q,eq:()=>q,then:(resolve:(result:unknown)=>unknown)=>Promise.resolve({data:[],error:null}).then(resolve)};
  service.from.mockImplementation(()=>q);
  const orderRefund=vi.fn(async()=>({success:true})),stripe=vi.fn(()=>{throw new Error("Provider forbidden");});
  const run=handler({createClient:()=>service,setRentalCheckoutStripe:vi.fn(),stripeClient:stripe,orderRefund});
  const response=await run(post({action,inquiry_id:ORDER,request_id:REQ,deposit_cents:100,rent_cents:0,reference:"ABC",paid_on:"2026-11-28"}));
  expect(response.status).toBe(200); expect(orderRefund).toHaveBeenCalledOnce(); expect(stripe).not.toHaveBeenCalled();
});