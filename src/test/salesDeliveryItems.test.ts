import { expect,it } from "vitest";
import { salesDeliveryItems, salesDeliverySourceItems } from "../../supabase/functions/_shared/sales-delivery-items";
it("uses confirmed sales goods with overrides and item counts, never requested goods or duration",()=>{
 expect(salesDeliveryItems({items:[{product_name:"Original",name_override:"Verkaufte Maschine",quantity:14,articles:2,unit:"Stück"},{product_name:"Optional",quantity:1,optional:true},{product_name:"Aufbau",quantity:1,line_kind:"service"}]})).toEqual([{name:"Verkaufte Maschine",description:"",quantity:2,unit:"Stück"}]);
});
it("rejects missing or invalid sold goods rather than inventing a delivery",()=>{
 expect(()=>salesDeliveryItems({})).toThrow();expect(()=>salesDeliveryItems({items:[{product_name:"Maschine",quantity:0}]})).toThrow();
});
it("uses issued invoice goods even if a legacy offer has no items",()=>{
 expect(salesDeliverySourceItems({},[{product_name:"BAUMAX KDe550",quantity:1,unit:"Stück"}])).toEqual([{name:"BAUMAX KDe550",description:"",quantity:1,unit:"Stück"}]);
});
it("never substitutes stale offer goods for an empty invoice",()=>{
 expect(()=>salesDeliverySourceItems({items:[{product_name:"Stale",quantity:1}]},[])).toThrow();
});