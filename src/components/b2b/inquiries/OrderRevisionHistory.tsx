import { useEffect,useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
export function OrderRevisionHistory({inquiry}:{inquiry:Record<string,any>}) {
 const [rows,setRows]=useState<{version:number;agreement_note:string;agreed_at:string}[]>([]);
 const [paymentUrl,setPaymentUrl]=useState<string|null>(null);
 const [deliveries,setDeliveries]=useState<{id:string;confirmation_number:string;file_url:string;sent_at:string}[]>([]);
 useEffect(()=>{let active=true;
  void supabase.from("rental_order_revisions").select("version,agreement_note,agreed_at").eq("rental_inquiry_id",inquiry.id).order("version",{ascending:false}).then(({data})=>{if(active)setRows(data ?? []);});
  void supabase.from("rental_order_confirmation_deliveries").select("id,confirmation_number,file_url,sent_at").eq("rental_inquiry_id",inquiry.id).order("sent_at",{ascending:false}).then(({data})=>{if(active)setDeliveries(data ?? []);});
  void supabase.from("offer_payment_links").select("token").eq("inquiry_id",inquiry.id).eq("inquiry_table","rental_inquiries").eq("status","active").maybeSingle().then(({data})=>{if(active)setPaymentUrl(data ? `https://www.slt-rental.de/zahlung/${data.token}` : null);});
  return()=>{active=false;};
 },[inquiry.id,inquiry.order_revision,inquiry.payments,inquiry.order_confirmed_at]);
 if(!inquiry.order_revision)return null;
 const original=inquiry.original_accepted_offer;
 return <section className="space-y-2 border-t border-border pt-3 text-sm"><h4 className="font-semibold">Auftragsänderungen</h4>
  {original?.offer_file_url && <a href={original.offer_file_url} target="_blank" rel="noreferrer" className="text-primary underline">Ursprünglich angenommenes Angebot {original.offer_number}</a>}
  {original?.order_confirmation_file_url && <a href={original.order_confirmation_file_url} target="_blank" rel="noreferrer" className="block text-primary underline">Ursprüngliche Auftragsbestätigung</a>}
  {rows.map(row=><p key={row.version}><strong>{row.version ? `Änderung ${row.version}` : "Originalauftrag"}</strong> · {new Date(row.agreed_at).toLocaleString("de-DE",{timeZone:"Europe/Berlin"})}<br/>{row.agreement_note}</p>)}
  {deliveries.map(row=><a key={row.id} href={row.file_url} target="_blank" rel="noreferrer" className="block text-primary underline">AB {row.confirmation_number} · {new Date(row.sent_at).toLocaleString("de-DE",{timeZone:"Europe/Berlin"})}</a>)}
  {paymentUrl && <Button variant="outline" size="sm" onClick={()=>void navigator.clipboard.writeText(paymentUrl)}>Restzahlungslink kopieren</Button>}
 </section>;
}