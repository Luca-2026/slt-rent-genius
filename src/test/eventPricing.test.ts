import { describe, expect, it } from "vitest";
import * as client from "@/lib/pricing/rentalPricing";
import * as server from "../../supabase/functions/_shared/rental-pricing";
import { normalizeInquiryOfferItems } from "../../supabase/functions/_shared/inquiry-offer-math";
import { calendarDescription } from "@/components/b2b/inquiries/offerCalendarPeriod";
import { offerPayloadToLines } from "@/components/b2b/inquiries/InquiryDetailPanel";
import { lineTotal } from "@/components/b2b/inquiries/offerMath";
import { publicRentalQuote } from "../../supabase/functions/_shared/public-rental-quote";
import { managedPricePatch } from "@/components/b2b/admin/managedPriceSave";
import { emptyPriceSet } from "@/components/b2b/admin/ManagedPriceFields";

describe("Event flat period pricing", () => {
  it.each([[3,100],[5,200],[7,300],[10,240]])("%i touched calendar days cost %i net per article", (days,total) => {
    const input = { scheme:"event", prices:{price_base_1_3_cd:100}, start:{date:"2026-11-16",time:"08:00"}, end:{date:`2026-11-${15+days}`,time:"16:00"} };
    expect(client.computeRentalLinePrice(input)).toMatchObject({unit:"pauschal",duration:1,unit_price:total});
    expect(server.computeRentalLinePrice(input)).toEqual(client.computeRentalLinePrice(input));
  });
  it("three Bierglas sets at four KT cost 62.49, not 17.49", () => {
    const result=client.computeRentalLinePrice({scheme:"event",prices:{price_base_1_3_cd:15,surcharge_per_cd_from_4:5.83},start:{date:"2026-11-12"},end:{date:"2026-11-15"}});
    expect(result).toMatchObject({unit:"pauschal",duration:1,unit_price:20.83});
    if(result.kind==="duration_only") throw new Error("Missing price");
    expect(lineTotal({product_name:"Bierglas",quantity:3,duration:1,unit:result.unit,unit_price:result.unit_price})).toBe(62.49);
  });
  it("Friday 16:00 to Monday 09:30 defaults to base 100",()=> {
    for(const mod of [client,server]) expect(mod.computeRentalLinePrice({scheme:"event",prices:{price_base_1_3_cd:100},start:{date:"2026-11-13",time:"16:00"},end:{date:"2026-11-16",time:"09:30"}})).toMatchObject({kind:"weekend",unit_price:100,duration:1});
  });
  it("Friday 10:00 costs 150 instead of the weekend base",()=> {
    expect(client.computeRentalLinePrice({scheme:"event",prices:{price_base_1_3_cd:100},start:{date:"2026-11-13",time:"10:00"},end:{date:"2026-11-16",time:"09:30"}})).toMatchObject({kind:"tier",unit_price:150,duration:1});
  });
  it("a maintained lower weekend rate of 80 overrides base 100",()=> {
    expect(client.computeRentalLinePrice({scheme:"event",prices:{price_base_1_3_cd:100,price_weekend_num:80},start:{date:"2026-11-13",time:"16:00"},end:{date:"2026-11-16",time:"09:30"}})).toMatchObject({unit_price:80});
  });
  it("Bau without a weekend price remains ordinary daily pricing",()=> {
    expect(client.computeRentalLinePrice({scheme:"bau",prices:{price_from_1_rd:100},start:{date:"2026-11-13",time:"16:00"},end:{date:"2026-11-16",time:"09:30"}})).toMatchObject({kind:"tier",unit:"miettage",unit_price:100});
  });
  it("an explicit zero surcharge stays zero",()=> {
    expect(client.tierPriceEvent(client.resolveProductPrices({pricing_scheme:"event",price_base_1_3_cd:100,surcharge_per_cd_from_4:0},null),5)?.total).toBe(100);
  });
  it("manual weekly units do not relabel a tariff automatically",()=> {
    expect(client.computeRentalLinePrice({scheme:"event",unit:"wochen",durationOverride:3,prices:{price_base_1_3_cd:100},start:{date:"2026-11-13"},end:{date:"2026-11-16"}})).toEqual({kind:"duration_only",unit:"wochen",duration:3});
  });
  it("discounts apply to the complete period price",()=> {
    expect(lineTotal({product_name:"Event",quantity:3,duration:1,unit:"pauschal",unit_price:20.83,discount_percent:10})).toBe(56.24);
  });
  it("snapshot normalization and reopening retain flat amounts and event basis",()=> {
    const saved=normalizeInquiryOfferItems([{product_name:"Event",quantity:3,articles:3,duration:1,unit_code:"pauschal",unit:"Pauschal",unit_price:20.83,price_basis:"event",rental_period_label:"4 Kalendertage",rental_start:"2026-11-12",rental_end:"2026-11-15"}]);
    expect(saved[0]).toMatchObject({quantity:3,duration:1,unit_price:20.83,price_basis:"event"});
    const restored=offerPayloadToLines({items:saved})?.items[0];
    expect(restored).toMatchObject({quantity:3,duration:1,unit:"pauschal",price_basis:"event"});
    if(!restored) throw new Error("Missing line");
    const desc=calendarDescription(restored);
    expect(calendarDescription({...restored,description:desc})).toBe(desc);
  });
  it("public quote agrees with the offer: three sets = 62.49 net",async()=> {
    const product={id:"p",slug:"glass",category:"glaeser",pricing_scheme:"event",prices_same_all_locations:true,price_base_1_3_cd:15,surcharge_per_cd_from_4:5.83,addon_options:[]};
    const service={from:(table:string)=>{const q:any={select:()=>q,eq:()=>q,in:async()=>({data:table==="b2b_managed_products"?[product]:[],error:null})};return q;}};
    const [quote]=await publicRentalQuote(service,[{id:"a",product_slug:"glass",location:"krefeld",quantity:3,start_date:"2026-11-16",start_time:"08:00",end_date:"2026-11-19",end_time:"16:00",selected_addons:[]}]);
    expect(quote).toMatchObject({unit:"pauschal",duration:1,unit_price:20.83,rental_net:62.49});
  });
  it("new base fills only a missing weekend price, preserving manual prices",()=> {
    const before={category:"glaeser",pricing_scheme:"event" as const,prices:emptyPriceSet(),price_per_day:"",price_weekend:"",price_per_month:"",tier_prices_manual:[],prices_same_all_locations:true};
    expect(managedPricePatch({...before,prices:{...before.prices,price_base_1_3_cd:"100"}},before)).toMatchObject({price_weekend_num:100});
    const maintained={...before,prices:{...before.prices,price_weekend_num:"80"}};
    expect(managedPricePatch({...maintained,prices:{...maintained.prices,price_base_1_3_cd:"100"}},maintained)).not.toHaveProperty("price_weekend_num");
  });
});