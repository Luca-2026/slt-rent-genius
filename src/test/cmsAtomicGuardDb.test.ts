import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
const db=new PGlite();
const product="22222222-0000-0000-0000-000000000001";
const current="11111111-0000-0000-0000-000000000001";
const other="11111111-0000-0000-0000-000000000002";
const items=(articles=1)=>JSON.stringify({items:[{product_slug:"baumaschinen-3500",articles,rental_start:"2026-12-04",rental_end:"2026-12-04"}]});
beforeAll(async()=>{
 await db.exec(readFileSync("e2e/fixtures/cms-quantity-schema.sql","utf8"));
 await db.exec(readFileSync("docs/prepared/0215_availability_item_period_hotfix.sql","utf8"));
 await db.exec(readFileSync("docs/prepared/0215_cms_atomic_guard.sql","utf8"));
 await db.exec(readFileSync("docs/prepared/0215_confirm_order_atomic.sql","utf8"));
},30000);
afterAll(()=>db.close());
beforeEach(async()=>{
 await db.exec("TRUNCATE rental_inquiries,b2b_reservations,b2b_product_instances,b2b_instance_allocations,b2b_transport_orders,rental_inquiry_events,b2b_managed_products;UPDATE allowed SET ok=true");
 await db.query("INSERT INTO b2b_managed_products VALUES($1,'baumaschinen-3500','3500 kg Baumaschinenanhänger','{\"bonn\":1,\"krefeld\":2,\"muelheim\":0}')",[product]);
});
const add=(id=current,status="offer_sent",count=1)=>db.query("INSERT INTO rental_inquiries(id,status,location,start_date,end_date,start_time,end_time,offer_payload) VALUES($1,$2,'bonn','2026-12-04','2026-12-04','08:30','16:30',$3)",[id,status,items(count)]);
it("CMS stock one rejects two article acceptance and leaves original offer unchanged",async()=>{
 await add(current,"offer_sent",2);
 await expect(db.query("UPDATE rental_inquiries SET status='accepted'")).rejects.toThrow("nicht ausreichend");
 expect((await db.query<{status:string}>("SELECT status FROM rental_inquiries")).rows[0].status).toBe("offer_sent");
});
it("accepted without AB keeps capacity; unconfirmed offers do not",async()=>{
 await add(current,"accepted");await add(other);
 await expect(db.query("UPDATE rental_inquiries SET status='accepted' WHERE id=$1",[other])).rejects.toThrow("nicht ausreichend");
});
it("linked B2B reservation is self-excluded, not another booking",async()=>{
 await add();
 await db.query("INSERT INTO b2b_reservations(status,location,product_id,start_date,end_date,quantity,inquiry_id) VALUES('pending','bonn','baumaschinen-3500','2026-12-04','2026-12-04',1,$1)",[current]);
 await db.query("UPDATE rental_inquiries SET status='accepted' WHERE id=$1",[current]);
 const r=await db.query<{r:{items:Array<{free:number;available:boolean}>}}>("SELECT check_availability($1) r",[current]);
 expect(r.rows[0].r.items[0]).toMatchObject({free:1,available:true});
 await db.query("SELECT confirm_order($1,'{}')",[current]);
});
it("cancellation releases quantity but confirmed done retains it on its dates",async()=>{
 await add(current,"accepted");await db.query("SELECT confirm_order($1,'{}')",[current]);
 await db.query("UPDATE rental_inquiries SET status='done'");await add(other);
 await expect(db.query("UPDATE rental_inquiries SET status='accepted' WHERE id=$1",[other])).rejects.toThrow("nicht ausreichend");
 await db.query("UPDATE rental_inquiries SET status='cancelled' WHERE id=$1",[current]);
 await db.query("UPDATE rental_inquiries SET status='accepted' WHERE id=$1",[other]);
 expect((await db.query<{status:string}>("SELECT status FROM rental_inquiries WHERE id=$1",[other])).rows[0].status).toBe("accepted");
});
it("UUID references cannot bypass stable-product quantity validation",async()=>{
 await add(current,"accepted");await add(other);
 await expect(db.query("UPDATE rental_inquiries SET status='accepted',offer_payload=$1 WHERE id=$2",[JSON.stringify({items:[{product_slug:product,articles:1,rental_start:"2026-12-04",rental_end:"2026-12-04"}]}),other])).rejects.toThrow("nicht ausreichend");
});