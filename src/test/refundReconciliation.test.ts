import { expect, it, vi } from 'vitest';
import { reconcileStripeRefund, reconcileRefundsBeforeExecution } from '../../supabase/functions/_shared/refund-reconciliation';
function fixture() {
 const q:any={select:()=>q,eq:async()=>({data:[],error:null})};
 return {rpc:vi.fn().mockResolvedValue({error:null}),from:()=>q};
}
const refund={id:'re_external',payment_intent:'pi_original',amount:12376,currency:'eur',livemode:true,status:'succeeded',metadata:{}};
it('marks the 700 € settlement paid only after matching provider evidence, never just a refund request',async()=>{
 const updates:unknown[]=[];
 const service={rpc:vi.fn(async(name:string)=>({data:name==='deposit_payout_verified',error:null})),from:(table:string)=>{
  const q:any={select:()=>q,limit:()=>q,maybeSingle:async()=>({data:{inquiry_id:'florian',inquiry_table:'rental_inquiries'},error:null}),update:(value:unknown)=>{updates.push(value);return q;},eq:()=>q,then:(resolve:any)=>resolve({data:table==='deposit_refunds'?[]:table==='deposit_settlements'?[{id:'settlement',balance:700}]:[],error:null})};return q;
 }};
 await reconcileStripeRefund(service,{...refund,id:'re_deposit',amount:70000,metadata:{deposit_refund_id:'claim'}},true);
 expect(service.rpc).toHaveBeenCalledWith('deposit_payout_verified',{_inquiry:'florian',_cents:70000});
 expect(updates).toHaveLength(1);
 expect(updates[0]).toEqual(expect.objectContaining({payout_status:'paid'}));
 updates.length=0;
 await reconcileStripeRefund(service,{...refund,status:'pending',metadata:{deposit_refund_id:'claim'}},true);
 expect(updates).toHaveLength(0);
});
it('records metadata-free external refund with exact 12376 cents',async()=>{
 const service=fixture();await reconcileStripeRefund(service,refund,true);
 expect(service.rpc).toHaveBeenCalledWith('record_stripe_refund_receipt',expect.objectContaining({_amount:12376,_id:'re_external',_intent:'pi_original'}));
});
it('wrong mode never persists provider evidence',async()=>{
 const service=fixture();await expect(reconcileStripeRefund(service,refund,false)).rejects.toThrow();expect(service.rpc).not.toHaveBeenCalled();
});
it('accepts the actual Stripe Refund shape without livemode using verified event mode',async()=>{
 const service=fixture();const {livemode,...providerRefund}=refund;
 await reconcileStripeRefund(service,providerRefund,true);
 expect(service.rpc).toHaveBeenCalledWith('record_stripe_refund_receipt',expect.objectContaining({_live:true,_amount:12376}));
});
it('test-mode refunds without livemode remain test receipts',async()=>{
 const service=fixture();const {livemode,...providerRefund}=refund;
 await reconcileStripeRefund(service,providerRefund,false);
 expect(service.rpc).toHaveBeenCalledWith('record_stripe_refund_receipt',expect.objectContaining({_live:false}));
});
it.each([
 {...refund,payment_intent:null}, {...refund,currency:'usd'}, {...refund,amount:0}, {...refund,amount:1.5},
])('still rejects incompatible evidence without writing receipts',async invalid=>{
 const service=fixture();await expect(reconcileStripeRefund(service,invalid,true)).rejects.toThrow('Ungültiger');
 expect(service.rpc).not.toHaveBeenCalled();
});
it('persistence failure is retryable and never asserts execution capacity',async()=>{
 const service=fixture();service.rpc.mockResolvedValue({error:{message:'failed'}});
 const stripe={refunds:{list:async function*(){yield refund;}}};
 await expect(reconcileRefundsBeforeExecution(service,stripe,'pi_original',true)).rejects.toThrow('gespeichert');
 expect(service.rpc).toHaveBeenCalledTimes(1);
});
it('reads every provider refund before checking shared capacity',async()=>{
 const service=fixture();const stripe={refunds:{list:async function*(){yield refund;yield {...refund,id:'re_second',amount:50000};}}};
 await reconcileRefundsBeforeExecution(service,stripe,'pi_original',true);
 expect(service.rpc.mock.calls.map(c=>c[0])).toEqual(['record_stripe_refund_receipt','record_stripe_refund_receipt','assert_stripe_refund_execution_capacity']);
});