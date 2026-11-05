import { beforeEach, expect, it, vi } from "vitest";
const { stripe } = vi.hoisted(() => ({ stripe: { checkout: { sessions: { retrieve: vi.fn() } }, paymentIntents: { retrieve: vi.fn() }, refunds: { list: vi.fn(), create: vi.fn() } } }));
vi.mock("../supabase/functions/_shared/stripe-pay.ts", () => ({ stripeClient: () => stripe, isStripeTestMode: () => false, toCents: (n: unknown) => Math.max(0, Math.round(Number(n) * 100) || 0) }));
import { creditRefund } from "../supabase/functions/_shared/credit-refund";
function fixture(existing: any = null) {
 const invoice = { id: "invoice", rental_inquiry_id: "rental", invoice_kind: "invoice", status: "paid", gross_amount: 556.92, paid_amount: 680.68, invoice_number: "RE-M-TEST", payments: [{ amount: 680.68, reference: "pi_original" }] };
 const inserts: any[] = [];
 const service: any = { rpc: vi.fn(async()=>({error:null})), from:(table:string)=>{
  const q:any={select:()=>q,eq:()=>q,neq:()=>q,maybeSingle:async()=>({data:table==='inquiry_invoices'?invoice:existing}),single:async()=>({data:{status:'succeeded',amount_cents:12376}}),insert:async(data:any)=>{inserts.push(data);return {error:null}},then:(resolve:any)=>resolve({data:[]})};return q;
 }};
 stripe.paymentIntents.retrieve.mockResolvedValue({livemode:true,status:'succeeded',currency:'eur',latest_charge:{amount:118068}});
 stripe.refunds.list.mockImplementation(async function*(){});
 stripe.refunds.create.mockResolvedValue({id:'re_rental',amount:12376,status:'succeeded'});
 return {service,inserts,invoice};
}
beforeEach(()=>vi.clearAllMocks());
it('refunds only 123.76 rental overpayment, not the 500 deposit or invoice gross',async()=>{
 const {service,inserts}=fixture();await creditRefund(service,'invoice','staff',true,true);
 expect(inserts[0].amount_cents).toBe(12376);expect(inserts[0].refund_kind).toBe('rental_credit');
 expect(stripe.refunds.create).toHaveBeenCalledWith(expect.objectContaining({amount:12376,payment_intent:'pi_original'}),{idempotencyKey:'credit-invoice-pi_original'});
});
it('preflight leaves invoice, original payments and provider unchanged',async()=>{
 const {service,inserts,invoice}=fixture();expect((await creditRefund(service,'invoice','staff',false,true)).amount_cents).toBe(12376);
 expect(invoice.gross_amount).toBe(556.92);expect(invoice.paid_amount).toBe(680.68);expect(inserts).toHaveLength(0);expect(stripe.refunds.create).not.toHaveBeenCalled();
});
it('repeated completed rental refund cannot pay twice',async()=>{
 const {service}=fixture({status:'succeeded',amount_cents:12376,allocations:[{payment_intent:'pi_original',amount_cents:12376,refund_id:'re_existing'}]});
 expect((await creditRefund(service,'invoice','staff',true,true)).already_requested).toBe(true);expect(stripe.refunds.create).not.toHaveBeenCalled();
});
it('rejects draft rental invoices',async()=>{const {service,invoice}=fixture();invoice.status='draft';await expect(creditRefund(service,'invoice','staff',true,true)).rejects.toThrow();expect(stripe.refunds.create).not.toHaveBeenCalled();});
it('rejects exhausted original Stripe balance',async()=>{const {service}=fixture();stripe.refunds.list.mockImplementation(async function*(){yield {amount:118068,status:'succeeded',metadata:{kind:'deposit'}}});await expect(creditRefund(service,'invoice','staff',true,true)).rejects.toThrow('verfügbar');expect(stripe.refunds.create).not.toHaveBeenCalled();});