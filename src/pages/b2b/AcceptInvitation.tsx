import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PasswordStrengthIndicator } from '@/components/b2b/PasswordStrengthIndicator';

export default function AcceptInvitation() {
  const [ready,setReady]=useState(false);const [error,setError]=useState('');const [password,setPassword]=useState('');const [confirm,setConfirm]=useState('');const [busy,setBusy]=useState(false);const [success,setSuccess]=useState(false);
  const navigate=useNavigate();
  useEffect(()=>{
    let active=true;
    const verify=async()=>{
      const query=new URLSearchParams(window.location.search);const hash=new URLSearchParams(window.location.hash.slice(1));const token=query.get('token_hash');const type=query.get('type') || hash.get('type');
      if(type!=='invite'){setError('Bitte öffne den Einladungslink aus deiner E-Mail.');return;}
      if(token){window.history.replaceState(null,'','/b2b/einladung');const {error}=await supabase.auth.verifyOtp({token_hash:token,type:'invite'});if(error)throw error;}
      const {data:{user},error}=await supabase.auth.getUser();if(error || !user?.email_confirmed_at)throw new Error('Einladung ungültig oder abgelaufen.');
      window.history.replaceState(null,'','/b2b/einladung');if(active)setReady(true);
    };
    verify().catch(()=>{if(active)setError('Einladung ungültig oder abgelaufen. Bitte eine neue Einladung anfordern.');});
    return()=>{active=false;};
  },[]);
  const submit=async(e:React.FormEvent)=>{e.preventDefault();if(password!==confirm){toast.error('Passwörter stimmen nicht überein.');return;}setBusy(true);try{const {error}=await supabase.auth.updateUser({password});if(error)throw error;await supabase.auth.signOut();setSuccess(true);}catch(e){toast.error(e instanceof Error?e.message:'Passwort konnte nicht gespeichert werden');}finally{setBusy(false);}};
  return <main className="min-h-screen bg-background flex items-center justify-center p-4"><div className="w-full max-w-md space-y-5"><h1 className="text-2xl font-semibold">B2B-Portal</h1>{success?<><h2 className="text-xl font-semibold">Passwort festgelegt</h2><p className="text-muted-foreground">Deine E-Mail ist bestätigt. Nach der Freischaltung durch den Standort kannst du deinen B2B-Account nutzen.</p><Button onClick={()=>navigate('/b2b/login')}>Zum Login</Button></>:error?<p role="alert" className="text-destructive">{error}</p>:!ready?<p>Einladung wird geprüft …</p>:<form onSubmit={submit} className="space-y-4"><h2 className="text-xl font-semibold">Eigenes Passwort festlegen</h2><div className="space-y-2"><Label htmlFor="invite-password">Passwort</Label><Input id="invite-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/><PasswordStrengthIndicator password={password}/></div><div className="space-y-2"><Label htmlFor="invite-confirm">Passwort bestätigen</Label><Input id="invite-confirm" type="password" autoComplete="new-password" required value={confirm} onChange={e=>setConfirm(e.target.value)}/></div><Button type="submit" className="w-full" disabled={busy}>{busy?'Wird gespeichert …':'Passwort speichern'}</Button></form>}</div></main>;
}