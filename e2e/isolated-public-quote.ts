import { publicRentalQuote } from "../supabase/functions/_shared/public-rental-quote.ts";
const input=JSON.parse(await Bun.stdin.text());
const service={from:(table:string)=>{ const result={data:table==="b2b_managed_products"?input.products:input.prices,error:null}; const q={select:()=>q,eq:()=>q,in:async()=>result};return q;}};
try { console.log(JSON.stringify({lines:await publicRentalQuote(service,input.items)})); } catch(e) { console.log(JSON.stringify({error:e instanceof Error?e.message:"invalid"})); }
