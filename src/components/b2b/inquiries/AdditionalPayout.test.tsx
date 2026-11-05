import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({ rpc:vi.fn(), row:null as Record<string,unknown>|null }));
vi.mock("@/hooks/use-toast",()=>({useToast:()=>({toast:vi.fn()})}));
vi.mock("@/integrations/supabase/client",()=>({supabase:{auth:{getUser:async()=>({data:{user:{id:"staff"}}})},rpc:mocks.rpc,from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:mocks.row,error:null})})})})}}));
import { AdditionalPayout } from "./AdditionalPayout";
beforeEach(()=>{mocks.row=null;mocks.rpc.mockReset();mocks.rpc.mockResolvedValue({data:false,error:null});});
afterEach(cleanup);
it("requested extra payout cannot be confirmed or approved by ordinary staff",async()=>{
 mocks.row={id:"req",status:"requested",amount_cents:1000,original_stripe_cents:10000,correction_refund_cents:10000,prior_refund_cents:0,recipient:"TEST",iban:"DE65320500000000478446",reason:"Ausfall"};
 render(<AdditionalPayout creditId="credit"/>);
 fireEvent.click(screen.getByRole("button",{name:/Zusatzbetrag überweisen|Zusätzliche Auszahlung/}));
 await screen.findByText("Freigabe ausstehend");
 expect(screen.queryByRole("button",{name:"Freigeben"})).not.toBeInTheDocument();
 expect(screen.queryByRole("button",{name:"Ausgeführte Überweisung bestätigen"})).not.toBeInTheDocument();
});
it("registered approver submits explicit decision but no payment command",async()=>{
 mocks.row={id:"req",status:"requested",amount_cents:1000,original_stripe_cents:10000,correction_refund_cents:10000,prior_refund_cents:0,recipient:"TEST",iban:"DE65320500000000478446",reason:"Ausfall"};
 mocks.rpc.mockImplementation(async(name:string)=>({data:name==="can_approve_rental_payout",error:null}));
 render(<AdditionalPayout creditId="credit"/>);
 fireEvent.click(screen.getByRole("button",{name:/Zusatzbetrag überweisen|Zusätzliche Auszahlung/}));
 fireEvent.change(await screen.findByLabelText("Entscheidungsnotiz"),{target:{value:"Ausfall geprüft"}});
 fireEvent.click(screen.getByRole("button",{name:"Freigeben"}));
 await waitFor(()=>expect(mocks.rpc).toHaveBeenCalledWith("decide_rental_additional_payout",{_id:"req",_approve:true,_note:"Ausfall geprüft"}));
 expect(mocks.rpc.mock.calls.some(([name])=>name==="complete_rental_additional_payout")).toBe(false);
});