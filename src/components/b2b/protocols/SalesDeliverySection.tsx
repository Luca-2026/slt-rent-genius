import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { invokeWithAuth } from "@/lib/invokeWithAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SignaturePad } from "@/components/b2b/SignaturePad";
import { FileText, PenLine, Printer, Upload } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { readProtocolDraft, writeProtocolDraft, deleteProtocolDraft } from "@/lib/protocolDraft";
type Note=Tables<"sales_delivery_notes">;
type Draft={name:string;comment:string;signature:string|null;checked:boolean;file:File|null;receivedDate:string;requestId:string};
export function SalesDeliverySection({inquiryId,confirmed}:{inquiryId:string;confirmed:boolean}){
 const {user}=useAuth();
 const [ready,setReady]=useState(false);
 const [notes,setNotes]=useState<Note[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const [mode,setMode]=useState<"create"|"digital"|"paper"|null>(null),[selected,setSelected]=useState<Note|null>(null);
 const [name,setName]=useState(""),[comment,setComment]=useState(""),[signature,setSignature]=useState<string|null>(null),[checked,setChecked]=useState(false),[file,setFile]=useState<File|null>(null),[receivedDate,setReceivedDate]=useState("");
 const [requestId,setRequestId]=useState<string>(()=>crypto.randomUUID());
 const draftKey=user&&mode?`sales-delivery:${user.id}:${inquiryId}:${selected?.id??"new"}:${mode}`:null;
 useEffect(()=>{if(!ready||!draftKey)return;void writeProtocolDraft<Draft>(draftKey,{name,comment,signature,checked,file,receivedDate,requestId}).catch(()=>toast.error("Entwurf konnte auf diesem Gerät nicht gespeichert werden."));},[ready,draftKey,name,comment,signature,checked,file,receivedDate,requestId]);
 const load=async()=>{const result=await supabase.from("sales_delivery_notes").select("*").eq("sales_inquiry_id",inquiryId).order("created_at",{ascending:false});if(result.error){setError("Lieferscheine konnten nicht geladen werden.");return;}setNotes(result.data);setError("");};
 useEffect(()=>{void load();},[inquiryId]);
 const call=async(body:Record<string,unknown>)=>{const {data,error}=await invokeWithAuth<{success:boolean;url?:string;error?:string}>("sales-delivery-note",body);if(error||!data?.success)throw new Error(data?.error||"Lieferschein konnte nicht gespeichert werden.");return data;};
 const open=async(note:Note,original=false)=>{const tab=window.open("about:blank","_blank");if(tab)tab.opener=null;try{const data=await call({action:"open",id:note.id,original});if(tab&&data.url)tab.location.href=data.url;else toast.error("Bitte neue Fenster erlauben.");}catch(e){tab?.close();toast.error(e instanceof Error?e.message:"Dokument nicht verfügbar.");}};
 const start=async(next:"create"|"digital"|"paper",note:Note|null=null)=>{setReady(false);setSelected(note);setName("");setSignature(null);setChecked(false);setFile(null);setComment("");setReceivedDate("");setRequestId(crypto.randomUUID());setMode(next);
  try{if(user){const draft=await readProtocolDraft<Draft>(`sales-delivery:${user.id}:${inquiryId}:${note?.id??"new"}:${next}`);if(draft){const d=draft.value;setName(d.name);setComment(d.comment);setSignature(d.signature);setChecked(d.checked);setFile(d.file);setReceivedDate(d.receivedDate);setRequestId(d.requestId);}}}catch{toast.error("Gesicherter Entwurf konnte nicht geladen werden.");}finally{setReady(true);}
 };
 const submit=async()=>{setBusy(true);try{
  if(mode==="create")await call({action:"create",inquiry_id:inquiryId,request_id:requestId,notes:comment});
  else if(selected&&mode==="digital")await call({action:"sign",id:selected.id,name,signature,confirmed:checked});
  else if(selected&&mode==="paper"&&file){const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(",")[1]);reader.onerror=reject;reader.readAsDataURL(file);});await call({action:"paper",id:selected.id,name,received_at:new Date(receivedDate).toISOString(),confirmed:checked,mime:file.type,document:data});}
  if(draftKey)await deleteProtocolDraft(draftKey);setReady(false);await load();setMode(null);toast.success(mode==="create"?"Lieferschein gespeichert.":"Warenempfang dokumentiert.");
 }catch(e){toast.error(e instanceof Error?e.message:"Speichern fehlgeschlagen.");}finally{setBusy(false);}};
 return <section aria-label="Lieferscheine Verkauf" className="space-y-3 border-y border-border py-4">
  <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">Lieferscheine · Verkauf</h3><Button variant="outline" className="min-h-11" disabled={!confirmed||busy} onClick={()=>start("create")}><FileText className="mr-2 h-4 w-4"/>Lieferschein erstellen</Button></div>
  {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
  {notes.map(note=><article key={note.id} className="space-y-3 rounded-lg border border-border p-3"><div className="flex flex-wrap gap-2 text-sm"><strong>{note.delivery_note_number}</strong><span>{note.receipt_method?`Ware erhalten · ${note.receipt_method==="paper"?"Papierbeleg":"digital unterschrieben"}`:"Empfang noch nicht bestätigt"}</span></div>
   {note.received_at&&<p className="text-xs text-muted-foreground">{note.signer_name} · {new Date(note.received_at).toLocaleString("de-DE",{timeZone:"Europe/Berlin"})}</p>}
   <div className="grid gap-2 sm:grid-cols-2"><Button variant="outline" className="min-h-11" onClick={()=>void open(note,true)}><Printer className="mr-2 h-4 w-4"/>PDF öffnen / drucken</Button>{note.receipt_method?<Button variant="outline" className="min-h-11" onClick={()=>void open(note)}><FileText className="mr-2 h-4 w-4"/>Empfangsnachweis öffnen</Button>:<><Button variant="outline" className="min-h-11" onClick={()=>start("digital",note)}><PenLine className="mr-2 h-4 w-4"/>Digital unterschreiben</Button><Button variant="outline" className="min-h-11" onClick={()=>start("paper",note)}><Upload className="mr-2 h-4 w-4"/>Papierbeleg hinterlegen</Button></>}</div>
  </article>)}
  <Dialog open={mode!==null} onOpenChange={v=>!busy&&!v&&setMode(null)}><DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>{mode==="create"?"Lieferschein erstellen":mode==="digital"?"Warenempfang unterschreiben":"Unterschriebenen Papierbeleg hinterlegen"}</DialogTitle><DialogDescription>{mode==="create"?"Verkaufsartikel aus dem bestätigten Auftrag. Der Lieferschein enthält keine Mietbedingungen.":"Empfang der auf diesem Lieferschein aufgeführten gekauften Ware."}</DialogDescription></DialogHeader>
   {mode==="create"?<><label className="space-y-1 text-sm">Bemerkungen / Abweichungen<Textarea value={comment} onChange={e=>setComment(e.target.value)} maxLength={2000}/></label><Button disabled={busy||!ready} onClick={()=>void submit()}>Lieferschein speichern</Button></>:<>
    <label className="space-y-1 text-sm">Name des Empfängers<Input aria-label="Name des Empfängers" value={name} onChange={e=>setName(e.target.value)} maxLength={120}/></label>
    {mode==="digital"?(signature?<div className="space-y-2"><img src={signature} alt="Gespeicherte Empfängerunterschrift" className="h-36 w-full object-contain"/><Button variant="outline" onClick={()=>setSignature(null)}>Neu unterschreiben</Button></div>:<SignaturePad onSignatureChange={setSignature} label="Unterschrift Empfänger"/>):<><label className="space-y-1 text-sm">Empfangsdatum und Uhrzeit<Input aria-label="Empfangsdatum und Uhrzeit" type="datetime-local" value={receivedDate} onChange={e=>setReceivedDate(e.target.value)}/></label><label className="space-y-1 text-sm">Unterschriebener Lieferschein<Input aria-label="Unterschriebener Lieferschein" type="file" accept="application/pdf,image/jpeg,image/png" onChange={e=>{const f=e.target.files?.[0];if(f&&f.size>10*1024*1024){toast.error("Maximal 10 MB.");return;}setFile(f??null);}}/></label>{file&&<p className="text-sm break-words">{file.name}</p>}</>}
    <label className="flex min-h-11 items-center gap-3 text-sm"><Checkbox checked={checked} onCheckedChange={v=>setChecked(v===true)}/><span>{mode==="digital"?"Ich bestätige den Erhalt der aufgeführten gekauften Ware.":"Der Beleg ist vom Empfänger unterschrieben und bestätigt den Warenempfang."}</span></label>
    <Button disabled={busy||!ready||name.trim().length<2||!checked||(mode==="digital"?!signature:!file||!receivedDate)} onClick={()=>void submit()}>{busy?"Wird gespeichert …":"Warenempfang speichern"}</Button>
   </>}
  </DialogContent></Dialog>
 </section>;
}