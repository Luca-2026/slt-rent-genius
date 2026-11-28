import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const { invoke, state } = vi.hoisted(() => ({invoke:vi.fn(),state:{basis:false,settled:false,error:false,allowed:true}}));
vi.mock("@/lib/invokeWithAuth",()=>({invokeWithAuth:invoke}));
vi.mock("@/hooks/useStaffAccess",()=>({useStaffAccess:()=>({canManageInventory:state.allowed,displayName:'Fixture'})}));
vi.mock("@/integrations/supabase/client",()=>({supabase:{from:(table:string)=>{
  const result=()=>({data:table==='rental_refund_bases' ? state.basis?{id:'basis'}:null : table==='deposit_settlements'?state.settled?{balance:500,payout_method:'transfer',payout_status:'paid'}:null:[],error:state.error?{message:'fixture unavailable'}:null});
  const q={select:()=>q,eq:()=>q,in:()=>q,order:()=>q,limit:()=>q,maybeSingle:async()=>result(),then:(r:(v:ReturnType<typeof result>)=>unknown)=>Promise.resolve(result()).then(r)};return q;
}}}));
vi.mock("@/components/b2b/inquiries/DepositSettlementCard",()=>({DepositSettlementCard:()=>null}));
vi.mock("@/components/b2b/inquiries/StripePaymentCard",()=>({StripePaymentCard:()=>null}));
import { OrderRefundOverview } from "@/components/b2b/inquiries/OrderRefundOverview";
const inquiry={id:'isolated',status:'accepted',offer_total_gross:193.92,offer_payload:{deposit:500},payments:[{amount:713.32,label:'Banküberweisung'}]};
const totals={success:true,execution_available:false,paid_cents:71332,deposit_available:50000,rent_available:0,deposit_used:0,rent_used:0,pending:false,can_refund_rent:true,requests:[]};
beforeEach(()=>{vi.clearAllMocks();state.basis=false;state.settled=false;state.error=false;state.allowed=true;invoke.mockResolvedValue({data:totals});});
afterEach(()=>cleanup());
it("missing basis and rent_available=0 no longer hide the existing rental action; opening only reads",async()=>{
  const prepare=vi.fn();render(<OrderRefundOverview inquiry={inquiry} onChanged={vi.fn()} onPrepareRentalBasis={prepare}/>);
  fireEvent.click(await screen.findByRole('button',{name:'Erstattung bearbeiten'}));
  fireEvent.click(await screen.findByRole('button',{name:'Mietguthaben / Erstattung'}));
  await waitFor(()=>expect(invoke).toHaveBeenCalledWith('offer-payment-admin',{action:'order_credit_info',inquiry_id:'isolated'}));
  expect(invoke.mock.calls.every(c=>['order_refund_info','order_credit_info'].includes(c[1].action))).toBe(true);
  fireEvent.click(screen.getByRole('dialog').querySelector('button:last-child') as HTMLElement);
  fireEvent.click(await screen.findByRole('button',{name:'Endgültige Rechnungsvorschau öffnen'}));expect(prepare).toHaveBeenCalledOnce();
});
it("fully repaid deposit does not strand the 19.40 rent action",async()=>{
  state.basis=true;state.settled=true;invoke.mockResolvedValue({data:{...totals,deposit_available:0,deposit_used:50000,rent_available:1940}});
  render(<OrderRefundOverview inquiry={inquiry} onChanged={vi.fn()}/>);
  fireEvent.click(await screen.findByRole('button',{name:'Erstattung bearbeiten'}));
  expect(await screen.findByRole('button',{name:'Mietguthaben / Erstattung'})).toBeEnabled();
});
it("pending bank rental claim remains inspectable but cannot issue a second available refund",async()=>{
  state.basis=true;state.settled=true;invoke.mockImplementation(async(_name,body)=>({data:body.action==='order_credit_info'?{success:true,amount_cents:1940,status:'available',payout_method:'transfer'}:{...totals,pending:true,rent_used:1940}}));
  render(<OrderRefundOverview inquiry={inquiry} onChanged={vi.fn()}/>);
  fireEvent.click(await screen.findByRole('button',{name:'Erstattung bearbeiten'}));
  fireEvent.click(await screen.findByRole('button',{name:'Mietguthaben / Erstattung'}));
  expect(await screen.findByRole('button',{name:'Überweisungsauftrag vorbereiten'})).toBeDisabled();
  expect(invoke.mock.calls.some(c=>c[1].action==='refund_order_credit')).toBe(false);
});
it("failed total RPC exposes no payout entry",async()=>{
  invoke.mockResolvedValue({data:{success:false,error:'No scope'}});render(<OrderRefundOverview inquiry={inquiry} onChanged={vi.fn()}/>);
  await screen.findByText('No scope');expect(screen.queryByRole('button',{name:'Erstattung bearbeiten'})).toBeNull();
});
it("ineligible staff gets no new financial action",async()=>{
  state.allowed=false;render(<OrderRefundOverview inquiry={inquiry} onChanged={vi.fn()}/>);
  await screen.findByTestId('refund-balances');expect(screen.queryByRole('button',{name:'Erstattung bearbeiten'})).toBeNull();
});