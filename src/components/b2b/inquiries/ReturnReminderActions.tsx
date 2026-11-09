import { useCallback, useEffect, useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { invokeWithAuth } from '@/lib/invokeWithAuth';

interface Delivery { id: string; stage: number; status: string; actor_name: string; recipient_email: string; sent_at?: string; created_at: string }
export function ReturnReminderActions({ inquiryId }: { inquiryId: string }) {
  const { toast } = useToast();
  const [history, setHistory] = useState<Delivery[]>([]);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<{ stage: 1 | 2; greeting: string; paragraphs: string[] } | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const load = useCallback(async () => {
    const { data, error: failure } = await invokeWithAuth('send-transactional-email', { inquiryId, action: 'status' });
    if (failure || data?.error) { setError(data?.error ?? 'Versandverlauf nicht verfügbar'); return; }
    setError(''); setHistory(data.deliveries ?? []); setEmail(data.recipientEmail ?? '');
  }, [inquiryId]);
  useEffect(() => { void load(); }, [load]);
  async function open(stage: 1 | 2) {
    setBusy(true); setConfirmed(false);
    try {
      const { data, error: failure } = await invokeWithAuth('send-transactional-email', { inquiryId, action: 'preview', stage, expectedEmail: email });
      if (failure || data?.error) throw new Error(data?.error ?? 'Vorschau nicht verfügbar');
      setPreview({ stage, greeting: data.greeting, paragraphs: data.paragraphs });
    } catch (e) { toast({ title: 'Erinnerung nicht möglich', description: e instanceof Error ? e.message : 'Bitte erneut versuchen', variant: 'destructive' }); }
    finally { setBusy(false); }
  }
  async function send() {
    if (!preview) return;
    setBusy(true);
    try {
      const { data, error: failure } = await invokeWithAuth('send-transactional-email', { inquiryId, action: 'send', stage: preview.stage, expectedEmail: email, noResponseConfirmed: confirmed });
      if (failure || data?.error || !data?.success) throw new Error(data?.error ?? (data?.reason === 'email_suppressed' ? 'Diese Kundenadresse empfängt keine App-E-Mails.' : 'Versand fehlgeschlagen'));
      toast({ title: data.alreadyQueued ? 'Erinnerung bereits vorbereitet' : 'Erinnerung für Versand vorgemerkt' }); setPreview(null); await load();
    } catch (e) { toast({ title: 'Erinnerung nicht versendet', description: e instanceof Error ? e.message : 'Bitte erneut versuchen', variant: 'destructive' }); }
    finally { setBusy(false); }
  }
  const blocked = (stage: number) => history.some(h => h.stage === stage && ['sent','pending','queued','preparing'].includes(h.status));
  return <section aria-label="Rückgabeerinnerungen" className="space-y-3 border-t border-border pt-4">
    <h3 className="text-sm font-semibold">Rückgabeerinnerungen</h3>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <Button variant="outline" className="min-h-11 w-full" disabled={busy || !!error || !email || blocked(1)} onClick={() => void open(1)}><Mail />Freundliche Erinnerung</Button>
      <Button variant="outline" className="min-h-11 w-full" disabled={busy || !!error || !email || blocked(2) || !history.some(h => h.stage === 1 && h.status === 'sent')} onClick={() => void open(2)}><Mail />Bestimmte Rückgabeaufforderung</Button>
    </div>
    {history.map(h => <p key={h.id} className="break-words text-xs text-muted-foreground">Stufe {h.stage} · {h.status === 'sent' ? 'Versendet' : ['pending','queued'].includes(h.status) ? 'Versand ausstehend' : h.status === 'dlq' || h.status === 'failed' ? 'Versand fehlgeschlagen' : h.status === 'suppressed' ? 'Adresse gesperrt' : 'In Vorbereitung'} · {h.actor_name} · {h.recipient_email} · {new Date(h.sent_at ?? h.created_at).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}</p>)}
    <Button variant="ghost" size="sm" disabled={busy} onClick={() => void load()}>Versandstatus aktualisieren</Button>
    <Dialog open={!!preview} onOpenChange={open => { if (!open && !busy) setPreview(null); }}><DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>{preview?.stage === 2 ? 'Rückgabeaufforderung' : 'Freundliche Erinnerung'}</DialogTitle></DialogHeader>
      <p className="break-words text-sm"><strong>An:</strong> {email}</p><p className="text-sm">{preview?.greeting}</p>{preview?.paragraphs.map((p,i) => <p className="text-sm" key={i}>{p}</p>)}
      {preview?.stage === 2 && <label className="flex items-start gap-3 text-sm"><Checkbox checked={confirmed} onCheckedChange={value => setConfirmed(value === true)} /><span>Die erste Erinnerung ist unbeantwortet, der Mietgegenstand wurde nicht zurückgegeben und keine Verlängerung vereinbart.</span></label>}
      <Button disabled={busy || (preview?.stage === 2 && !confirmed)} onClick={() => void send()}>{busy ? <Loader2 className="animate-spin" /> : <Mail />}Erinnerung senden</Button>
    </DialogContent></Dialog>
  </section>;
}