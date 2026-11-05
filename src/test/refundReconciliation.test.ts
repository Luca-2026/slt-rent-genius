import { expect, it, vi } from 'vitest';
import { reconcileStripeRefund, reconcileRefundsBeforeExecution } from '../../supabase/functions/_shared/refund-reconciliation';
function fixture() {
 const q:any={select:()=>q,eq:async()=>({data:[],error:null})};
 return {rpc:vi.fn().mockResolvedValue({error:null}),from:()=>q};
}
const refund={id:'re_external',payment_intent:'pi_original',amount:12376,currency:'eur',livemode:true,status:'succeeded',metadata:{}};
it('records metadata-free external refund with exact 12376 cents',async()=>{
 const service=fixture();await reconcileStripeRefund(service,refund,true);
 expect(service.rpc).toHaveBeenCalledWith('record_stripe_refund_receipt',expect.objectContaining({_amount:12376,_id:'re_external',_intent:'pi_original'}));
});
it('wrong mode never persists provider evidence',async()=>{
 const service=fixture();await expect(reconcileStripeRefund(service,refund,false)).rejects.toThrow();expect(service.rpc).not.toHaveBeenCalled();
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