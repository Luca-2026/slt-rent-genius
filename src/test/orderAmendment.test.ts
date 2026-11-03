import { describe,expect,it } from "vitest";
import { buildOrderAmendment } from "../../supabase/functions/_shared/order-amendment";
const item = { product_name:"Testartikel",quantity:10,articles:1,unit_price:10,discount_percent:0,rental_start:"2026-11-10",rental_end:"2026-11-19" };
const original = {items:[item],deposit:100,offer_number:"ANG-ORIGINAL",terms_text:"Originalbedingungen"};
describe("Auftragsänderung ohne neues Angebot",()=>{
 it("ändert Preis und Zeitraum, erhält das Original unverändert",()=>{
  const before=JSON.stringify(original);
  const result=buildOrderAmendment({items:[{...item,unit_price:12,rental_end:"2026-11-20"}],deposit:100,payment_terms:"vorkasse"},original,"krefeld");
  expect(result.totals.grossAmount).toBe(142.8);expect(result.items[0].rental_end).toBe("2026-11-20");expect(JSON.stringify(original)).toBe(before);expect(result.offer_number).toBe("ANG-ORIGINAL");
 });
 it("übernimmt geänderte Artikel",()=>{const result=buildOrderAmendment({items:[{...item,product_name:"Neuer Artikel"}],deposit:100},original,"krefeld");expect(result.items[0].product_name).toBe("Neuer Artikel");});
 it("weist Kaution getrennt vom Mietpreis aus",()=>{const result=buildOrderAmendment({items:[item],deposit:100},original,"krefeld");expect(result.totals.grossAmount).toBe(119);expect(result.deposit).toBe(100);});
 it("lehnt ungültige Mietzeiträume ab",()=>{expect(()=>buildOrderAmendment({items:[{...item,rental_end:"2026-11-09"}]},original,"krefeld")).toThrow();});
});