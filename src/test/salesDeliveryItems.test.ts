import { expect,it } from "vitest";
import { salesDeliveryItems } from "../../supabase/functions/_shared/sales-delivery-items";
it("uses confirmed sales goods with overrides and item counts, never requested goods or duration",()=>{
 expect(salesDeliveryItems({items:[{product_name:"Original",name_override:"Verkaufte Maschine",quantity:14,articles:2,unit:"Stück"},{product_name:"Optional",quantity:1,optional:true},{product_name:"Aufbau",quantity:1,line_kind:"service"}]})).toEqual([{name:"Verkaufte Maschine",description:"",quantity:2,unit:"Stück"}]);
});
it("rejects missing or invalid sold goods rather than inventing a delivery",()=>{
 expect(()=>salesDeliveryItems({})).toThrow();expect(()=>salesDeliveryItems({items:[{product_name:"Maschine",quantity:0}]})).toThrow();
});