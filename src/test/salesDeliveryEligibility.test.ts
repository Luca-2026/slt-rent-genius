import { expect, it } from "vitest";
import { salesDeliveryAllowed, salesDeliveryInvoice } from "../../supabase/functions/_shared/sales-delivery-eligibility";
const order={status:"done",offer_number:"ANG-V-2026-11-0007",order_confirmed_at:null};
const invoice={id:"62484a81-a82c-41f6-826e-8233b9fa14e4",invoice_number:"RE-V-2026-11-0004",invoice_kind:"invoice",status:"open",credited_amount:0,offer_number:order.offer_number};
it("allows SFJ6FB's invoiced completed sale without fabricating an AB",()=>{
 expect(salesDeliveryAllowed(order,[invoice])).toBe(true);
 expect(salesDeliveryInvoice(order,[invoice])?.id).toBe(invoice.id);
 expect(order.order_confirmed_at).toBeNull();
});
it("retains confirmed accepted sales",()=>expect(salesDeliveryAllowed({status:"accepted",order_confirmed_at:"2026-11-18"},[])).toBe(true));
it.each(["new","offer_sent","rejected","cancelled"])("does not use an invoice to reactivate %s",status=>expect(salesDeliveryAllowed({...order,status},[invoice])).toBe(false));
it.each([{status:"draft"},{status:"cancelled"},{invoice_kind:"installment"},{invoice_kind:"credit_note"},{credited_amount:1},{offer_number:"OTHER"},{invoice_number:null}])("rejects invalid invoice evidence %j",change=>expect(salesDeliveryAllowed(order,[{...invoice,...change}])).toBe(false));
it("does not accept done alone",()=>expect(salesDeliveryAllowed(order,[])).toBe(false));