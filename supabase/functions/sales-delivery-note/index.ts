import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "https://esm.sh/zod@3.23.8";
import { salesDeliveryItems } from "../_shared/sales-delivery-items.ts";
import { salesDeliveryAllowed, salesDeliveryInvoice } from "../_shared/sales-delivery-eligibility.ts";
import { salesDeliveryPdf } from "./pdf.ts";
const json=(v:unknown,status=200)=>new Response(JSON.stringify(v),{status,headers:{...corsHeaders,"Content-Type":"application/json"}});
const Body=z.discriminatedUnion("action",[
 z.object({action:z.literal("create"),inquiry_id:z.string().uuid(),request_id:z.string().uuid(),notes:z.string().trim().max(2000).default("")}),
 z.object({action:z.literal("open"),id:z.string().uuid(),original:z.boolean().optional()}),
 z.object({action:z.literal("sign"),id:z.string().uuid(),name:z.string().trim().min(2).max(120),confirmed:z.literal(true),signature:z.string().regex(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/).max(600000)}),
 z.object({action:z.literal("paper"),id:z.string().uuid(),name:z.string().trim().min(2).max(120),received_at:z.string().datetime(),confirmed:z.literal(true),mime:z.enum(["application/pdf","image/jpeg","image/png"]),document:z.string().min(10).max(14000000)})
]);
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
 try{
  const auth=req.headers.get("Authorization")?.replace(/^Bearer /i,"");
  const svc=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const {data:{user}}=await svc.auth.getUser(auth||"");if(!user)return json({error:"Nicht angemeldet."},401);
  const {data:can}=await svc.rpc("can_edit_operations",{_user_id:user.id});if(!can)return json({error:"Keine Mitarbeiterberechtigung."},403);
  const parsed=Body.safeParse(await req.json());if(!parsed.success)return json({error:"Angaben zum Lieferschein unvollständig."},400);
  const b=parsed.data;
  if(b.action==="create"){
   const {data:existing}=await svc.from("sales_delivery_notes").select("*").eq("id",b.request_id).maybeSingle();
   if(existing){if(existing.sales_inquiry_id!==b.inquiry_id)return json({error:"Ungültige Wiederholung."},409);return json({success:true,id:existing.id});}
   const {data:i,error}=await svc.from("sales_inquiries").select("*").eq("id",b.inquiry_id).single();if(error||!i)return json({error:"Verkaufsauftrag nicht gefunden."},404);
   let invoices: any[]=[];
   if(!i.order_confirmed_at){const result=await svc.from("inquiry_invoices").select("*").eq("sales_inquiry_id",i.id).order("created_at",{ascending:false});if(result.error)throw result.error;invoices=result.data??[];}
   if(!salesDeliveryAllowed(i,invoices))return json({error:"Es fehlt eine Auftragsbestätigung oder eine gültige Rechnung zum erledigten Verkaufsauftrag."},409);
   const invoice=salesDeliveryInvoice(i,invoices);
   let items=salesDeliveryItems(i.offer_payload||{});
   if(invoice){const result=await svc.from("inquiry_invoice_items").select("product_name,description,quantity,unit").eq("invoice_id",invoice.id).order("position");if(result.error)throw result.error;items=salesDeliveryItems({items:result.data??[]});}
   const source=invoice??i;
   const snapshot={items,source_invoice_id:invoice?.id??null,source_invoice_number:invoice?.invoice_number??null,order_code:i.order_code,offer_number:i.offer_number,order_confirmation_number:i.order_confirmation_number,location:source.location,customer:source.company_name||source.customer_name||[i.first_name,i.last_name].filter(Boolean).join(" "),address:[invoice?source.customer_street:i.billing_street,invoice?source.customer_postal_code:i.billing_postal_code,invoice?source.customer_city:i.billing_city].filter(Boolean).join(" "),delivery_address:[source.delivery_street,source.delivery_postal_code,source.delivery_city].filter(Boolean).join(" "),notes:b.notes,created_at:new Date().toISOString()};
   const {data:number,error:numErr}=await svc.rpc("generate_delivery_note_number");if(numErr)throw numErr;
   const path=`sales-delivery/${b.inquiry_id}/${b.request_id}/original.pdf`;const bytes=await salesDeliveryPdf(snapshot,number);
   const upload=await svc.storage.from("b2b-invoices").upload(path,bytes,{contentType:"application/pdf",upsert:false});if(upload.error)throw upload.error;
   const saved=await svc.from("sales_delivery_notes").insert({id:b.request_id,sales_inquiry_id:b.inquiry_id,delivery_note_number:number,snapshot,file_path:path,created_by:user.id});if(saved.error)throw saved.error;
   return json({success:true,id:b.request_id});
  }
  const {data:note,error}=await svc.from("sales_delivery_notes").select("*").eq("id",b.id).single();if(error||!note)return json({error:"Lieferschein nicht gefunden."},404);
  if(b.action==="open"){
   const {data,error}=await svc.storage.from("b2b-invoices").createSignedUrl(!b.original&&note.signed_file_path?note.signed_file_path:note.file_path,300);if(error)throw error;return json({success:true,url:data.signedUrl});
  }
  if(note.receipt_method)return json({error:"Der Empfang ist bereits dokumentiert."},409);
  const at=b.action==="sign"?new Date().toISOString():b.received_at;
  if(Date.parse(at)>Date.now()+60000)return json({error:"Empfangsdatum liegt in der Zukunft."},400);
  let bytes:Uint8Array,mime:string,extension:string;
  if(b.action==="sign"){bytes=await salesDeliveryPdf(note.snapshot,note.delivery_note_number,{name:b.name,at,signature:b.signature});mime="application/pdf";extension="pdf";}
  else {bytes=Uint8Array.from(atob(b.document),c=>c.charCodeAt(0));mime=b.mime;extension=mime==="application/pdf"?"pdf":mime==="image/png"?"png":"jpg";
   const valid=mime==="application/pdf"?String.fromCharCode(...bytes.slice(0,5))==="%PDF-":mime==="image/png"?bytes[0]===137&&bytes[1]===80:bytes[0]===255&&bytes[1]===216;
   if(!valid||bytes.length>10*1024*1024)return json({error:"Bitte PDF, JPG oder PNG bis 10 MB hochladen."},400);
  }
  const path=`sales-delivery/${note.sales_inquiry_id}/${note.id}/receipt-${crypto.randomUUID()}.${extension}`;
  const upload=await svc.storage.from("b2b-invoices").upload(path,bytes,{contentType:mime,upsert:false});if(upload.error)throw upload.error;
  const saved=await svc.from("sales_delivery_notes").update({receipt_method:b.action==="sign"?"digital":"paper",signer_name:b.name,received_at:at,receipt_recorded_at:new Date().toISOString(),receipt_recorded_by:user.id,signature_data:b.action==="sign"?b.signature:null,signed_file_path:path}).eq("id",note.id).is("receipt_method",null).select("id").maybeSingle();
  if(saved.error||!saved.data){await svc.storage.from("b2b-invoices").remove([path]);return json({error:"Empfang wurde bereits gespeichert oder konnte nicht gespeichert werden."},409);}
  return json({success:true,id:note.id});
 }catch(e){console.error("sales-delivery-note",e);return json({error:e instanceof Error?e.message:"Lieferschein konnte nicht gespeichert werden."},500);}
});