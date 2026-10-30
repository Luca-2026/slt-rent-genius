import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, RefreshCw, Mail, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Info { status: string; email: string; email_confirmed: boolean; password_set: boolean; ready: boolean; business_filename: string | null; sepa_filename: string | null; business_url: string | null; sepa_url: string | null }
export function B2BOnboardingDialog({customerId,open,onOpenChange,onUpdated}:{customerId:string|null;open:boolean;onOpenChange:(v:boolean)=>void;onUpdated:()=>void}) {
  const [info,setInfo]=useState<Info|null>(null); const [busy,setBusy]=useState(false);
  const call=async (body:Record<string,unknown>) => {
    const {data,error}=await supabase.functions.invoke('onsite-b2b-customer',{body:{...body,customer_id:customerId}});
    if(error || data?.error) throw new Error(data?.error || error?.message || 'Vorgang fehlgeschlagen');
    return data;
  };
  const load=async () => {setBusy(true);try {setInfo(await call({action:'info'}));} catch(e){toast.error(e instanceof Error?e.message:'Laden fehlgeschlagen');}finally{setBusy(false);}};
  useEffect(()=>{setInfo(null);if(open && customerId) void load();},[open,customerId]);
  const action=async (action:string) => {setBusy(true);try{await call({action});toast.success(action==='approve'?'B2B-Account freigeschaltet.':'Einladung versendet.');onUpdated();await load();}catch(e){toast.error(e instanceof Error?e.message:'Vorgang fehlgeschlagen');}finally{setBusy(false);}};
  const upload=async (file:File|undefined,kind:string) => {
    if(!file) return;
    if(file.size>5*1024*1024){toast.error('Maximal 5 MB je Datei.');return;}
    setBusy(true);
    try {
      const base64=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=reject;reader.readAsDataURL(file);});
      await call({action:'upload',kind,filename:file.name,mime:file.type,base64});toast.success('Dokument gespeichert.');await load();onUpdated();
    }catch(e){toast.error(e instanceof Error?e.message:'Hochladen fehlgeschlagen');}finally{setBusy(false);}
  };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>B2B-Profil freischalten</DialogTitle></DialogHeader>
    {info ? <div className="space-y-5 min-w-0">
      <div className="flex flex-wrap items-center gap-2"><Badge variant={info.status==='approved'?'secondary':'outline'}>{info.status==='approved'?'Freigeschaltet':'Freischaltung offen'}</Badge><span className="text-sm break-all">{info.email}</span></div>
      <div className="flex flex-wrap gap-2 text-sm"><Badge variant={info.email_confirmed?'secondary':'outline'}>E-Mail {info.email_confirmed?'bestätigt':'ausstehend'}</Badge><Badge variant={info.password_set?'secondary':'outline'}>Passwort {info.password_set?'festgelegt':'ausstehend'}</Badge></div>
      {(['business','sepa'] as const).map(kind=>{const name=kind==='business'?info.business_filename:info.sepa_filename;const url=kind==='business'?info.business_url:info.sepa_url;return <div key={kind} className="space-y-2"><Label htmlFor={`onsite-${kind}`}>{kind==='business'?'Gewerbeanmeldung / Handelsregistereintrag':'Unterschriebenes SEPA-Mandat'}</Label>{name && <div className="flex gap-2 items-center min-w-0"><FileText className="h-4 w-4 shrink-0"/>{url?<a className="text-primary underline break-all text-sm" href={url} target="_blank" rel="noreferrer">{name}</a>:<span className="text-sm break-all">{name}</span>}</div>}<Input id={`onsite-${kind}`} type="file" accept="application/pdf,image/jpeg,image/png" disabled={busy} onChange={e=>{void upload(e.target.files?.[0],kind);e.target.value='';}} className="min-w-0"/></div>;})}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2"><Button variant="outline" disabled={busy} onClick={()=>void load()}><RefreshCw className="h-4 w-4 mr-2"/>Status aktualisieren</Button>{!info.email_confirmed && <Button variant="outline" disabled={busy} onClick={()=>void action('resend')}><Mail className="h-4 w-4 mr-2"/>Einladung erneut senden</Button>}{info.status!=='approved' && <Button disabled={busy || !info.ready} onClick={()=>void action('approve')}><CheckCircle className="h-4 w-4 mr-2"/>B2B-Account freischalten</Button>}</div>
    </div>:<p className="text-muted-foreground">{busy?'Wird geladen …':'Profil konnte nicht geladen werden.'}</p>}
  </DialogContent></Dialog>;
}