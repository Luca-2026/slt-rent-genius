import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
export default function Unsubscribe() {
  const [params] = useSearchParams(); const token = params.get('token') ?? '';
  const [state, setState] = useState('loading');
  useEffect(() => {
    if (!token) { setState('invalid'); return; }
    let alive = true;
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`, { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }).then(async r => { const d = await r.json(); if(alive) setState(!r.ok ? 'invalid' : d.reason === 'already_unsubscribed' ? 'success' : d.valid ? 'valid' : 'invalid'); }).catch(() => { if(alive) setState('error'); });
    return () => { alive = false; };
  }, [token]);
  async function confirm() { setState('loading'); const {data,error} = await supabase.functions.invoke('handle-email-unsubscribe',{body:{token}}); setState(!error && data?.success ? 'success' : 'error'); }
  return <main className="mx-auto max-w-xl space-y-6 px-6 py-16"><img src="/favicon.png" alt="SLT Rental" className="h-16 w-16" /><h1 className="text-2xl font-semibold">SLT Rental E-Mails</h1><p>{state === 'loading' ? 'Wird geprüft …' : state === 'success' ? 'Du erhältst keine weiteren App-E-Mails. Zugang und Passwort-E-Mails bleiben möglich.' : state === 'valid' ? 'Möchtest du dich von App-E-Mails abmelden?' : state === 'invalid' ? 'Dieser Link ist ungültig.' : 'Die Anfrage konnte nicht abgeschlossen werden. Bitte versuche es erneut.'}</p>{state === 'valid' && <Button onClick={() => void confirm()}>Abmeldung bestätigen</Button>}</main>;
}