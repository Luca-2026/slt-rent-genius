import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, RefreshCw, Inbox, Clock, ExternalLink, Check, Undo2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { usePhoneCalls, type PhoneCall } from "@/hooks/usePhoneCalls";
import { INTENT_LABEL, PRIORITY_LABEL, PRIORITY_ORDER, type CallIntent, type CallPriority } from "@/lib/callPriority";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AiInquiryImportDialog } from "@/components/b2b/inquiries/AiInquiryImportDialog";
import { createInquiryFromImport } from "@/lib/createInquiryFromImport";

const LOC: Record<string, string> = { krefeld: "Krefeld", bonn: "Bonn", muelheim: "Mülheim an der Ruhr" };
const STATUS: Record<PhoneCall["status"], string> = { open: "Offen", in_progress: "In Bearbeitung", done: "Erledigt" };
const PRIO_CLASS: Record<CallPriority, string> = {
  sofort: "bg-destructive text-destructive-foreground",
  heute: "bg-accent text-accent-foreground",
  woche: "bg-primary/15 text-primary",
  info: "bg-muted text-muted-foreground",
};

const fmt = (c: PhoneCall) => new Date(c.call_started_at ?? c.created_at).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" });
const who = (c: PhoneCall) => [c.company_name, c.customer_name ?? c.caller_name].filter(Boolean).join(" · ") || c.caller_phone || "Unbekannter Anrufer";

export function PriorityBadge({ p }: { p: CallPriority | null }) {
  if (!p) return <Badge variant="outline">Wird ausgewertet</Badge>;
  return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-semibold", PRIO_CLASS[p])}>{PRIORITY_LABEL[p]}</span>;
}

const ASSISTANT: Record<string, string> = { krefeld: "Lena Krefeld/Mülheim", bonn: "Lena Bonn" };

export default function PhoneCalls() {
  const { isStaff, loading: accessLoading } = useStaffAccess();
  const { rows, loading, reload } = usePhoneCalls();
  const [prio, setPrio] = useState("all");
  const [intent, setIntent] = useState("all");
  const [loc, setLoc] = useState("all");
  const [asst, setAsst] = useState("all");
  const [status, setStatus] = useState("active");
  const [selId, setSelId] = useState<string | null>(null);

  const filtered = useMemo(() => rows.filter((c) =>
    (prio === "all" || c.priority === prio) && (intent === "all" || c.intent === intent) &&
    (loc === "all" || (c.location ?? (c.assistant === "bonn" ? "bonn" : null)) === loc) && (asst === "all" || c.assistant === asst) &&
    (status === "all" || (status === "active" ? c.status !== "done" : c.status === status))), [rows, prio, intent, loc, asst, status]);
  const sel = rows.find((r) => r.id === selId) ?? null;

  if (!accessLoading && !isStaff) return <B2BPortalLayout title="Anrufe"><p className="text-muted-foreground">Nur für Mitarbeiter.</p></B2BPortalLayout>;

  return (
    <B2BPortalLayout title="Anrufe" subtitle="Telefonate der Telefonassistenz mit KI-Vorauswertung, nach Priorität sortiert">
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5">
        <Select value={status} onValueChange={setStatus}><SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger><SelectContent>
          <SelectItem value="active">Offen & in Bearbeitung</SelectItem><SelectItem value="open">Offen</SelectItem>
          <SelectItem value="in_progress">In Bearbeitung</SelectItem><SelectItem value="done">Erledigt</SelectItem><SelectItem value="all">Alle</SelectItem>
        </SelectContent></Select>
        <Select value={prio} onValueChange={setPrio}><SelectTrigger aria-label="Priorität"><SelectValue /></SelectTrigger><SelectContent>
          <SelectItem value="all">Alle Prioritäten</SelectItem>{PRIORITY_ORDER.map((p) => <SelectItem key={p} value={p}>{PRIORITY_LABEL[p]}</SelectItem>)}
        </SelectContent></Select>
        <Select value={intent} onValueChange={setIntent}><SelectTrigger aria-label="Anliegen"><SelectValue /></SelectTrigger><SelectContent>
          <SelectItem value="all">Alle Anliegen</SelectItem>{(Object.keys(INTENT_LABEL) as CallIntent[]).map((k) => <SelectItem key={k} value={k}>{INTENT_LABEL[k]}</SelectItem>)}
        </SelectContent></Select>
        <Select value={asst} onValueChange={setAsst}><SelectTrigger aria-label="Assistent"><SelectValue /></SelectTrigger><SelectContent>
          <SelectItem value="all">Beide Assistenten</SelectItem>{Object.entries(ASSISTANT).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
        </SelectContent></Select>
        <Select value={loc} onValueChange={setLoc}><SelectTrigger aria-label="Standort"><SelectValue /></SelectTrigger><SelectContent>
          <SelectItem value="all">Alle Standorte</SelectItem>{Object.entries(LOC).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
        </SelectContent></Select>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? "Anruf" : "Anrufe"}</p>

      {loading ? <p className="text-muted-foreground">Lädt …</p> : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          <Phone className="mx-auto mb-2 h-6 w-6" aria-hidden="true" />
          Noch keine Anrufe. Sobald fonio nach einem Gespräch Daten schickt, erscheinen sie hier.
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {filtered.map((c) => (
            <li key={c.id} className="flex items-stretch gap-1">
              <button type="button" onClick={() => setSelId(c.id)} className="flex min-w-0 flex-1 flex-col gap-1 p-3 text-left hover:bg-muted md:flex-row md:items-start md:gap-4">
                <div className="flex shrink-0 items-center gap-2 md:w-36 md:flex-col md:items-start md:gap-1">
                  <PriorityBadge p={c.priority} />
                  <span className="text-xs text-muted-foreground">{fmt(c)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn("font-medium", c.status === "done" && "text-muted-foreground line-through")}>{who(c)}</p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {c.analysis_status === "failed" ? `Nicht ausgewertet: ${c.analysis_error ?? ""}` : c.summary ?? c.provider_summary ?? "Wird ausgewertet …"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap content-start gap-1 text-xs md:w-52 md:justify-end">
                  {c.intent && <Badge variant="secondary">{INTENT_LABEL[c.intent]}</Badge>}
                  {c.assistant && <Badge>{ASSISTANT[c.assistant]}</Badge>}
                  {c.location && <Badge variant="outline">{LOC[c.location]}</Badge>}
                  <Badge variant="outline">{STATUS[c.status]}</Badge>
                </div>
              </button>
              <div className="flex shrink-0 items-start p-3 pl-0 sm:items-start md:w-28 md:justify-end md:pr-3">
                <QuickDoneToggle call={c} onDone={reload} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={!!sel} onOpenChange={(o) => !o && setSelId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {sel && <CallDetail call={sel} onChanged={reload} />}
        </SheetContent>
      </Sheet>
    </B2BPortalLayout>
  );
}

function QuickDoneToggle({ call, onDone }: { call: PhoneCall; onDone: () => void }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const done = call.status === "done";

  const toggle = async () => {
    setBusy(true);
    const patch = done
      ? { status: "open" }
      : { status: "done" };
    const { error } = await supabase.from("phone_calls" as never).update(patch as never).eq("id", call.id);
    setBusy(false);
    if (error) {
      toast({ title: "Speichern fehlgeschlagen", description: error.message, variant: "destructive" });
    } else {
      onDone();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      title={done ? "Als offen markieren" : "Als erledigt markieren"}
      aria-label={done ? "Als offen markieren" : "Als erledigt markieren"}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-md border px-0 text-xs font-medium transition-colors sm:h-8 sm:w-auto sm:min-w-[6rem] sm:gap-1.5 sm:px-3",
        done
          ? "border-border text-muted-foreground hover:bg-muted"
          : "border-primary/40 text-primary hover:bg-primary/10",
      )}
    >
      {done ? <Undo2 className="h-3.5 w-3.5" aria-hidden="true" /> : <Check className="h-3.5 w-3.5" aria-hidden="true" />}
      <span className="hidden sm:inline">{done ? "Offen" : "Erledigt"}</span>
    </button>
  );
}

function CallDetail({ call, onChanged }: { call: PhoneCall; onChanged: () => void }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notes, setNotes] = useState(call.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const update = async (patch: Record<string, unknown>) => {
    setBusy(true);
    const { error } = await supabase.from("phone_calls" as never).update(patch as never).eq("id", call.id);
    setBusy(false);
    if (error) toast({ title: "Speichern fehlgeschlagen", description: error.message, variant: "destructive" });
    else onChanged();
  };
  const take = async () => {
    const { data } = await supabase.auth.getUser();
    await update({ status: "in_progress", assigned_to: data.user?.id ?? null });
  };
  const reanalyze = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("analyze-phone-call", { body: { id: call.id } });
    setBusy(false);
    const msg = (data as { error?: string } | null)?.error ?? (error ? "Auswertung fehlgeschlagen." : null);
    if (msg) toast({ title: "Auswertung fehlgeschlagen", description: msg, variant: "destructive" });
    else { toast({ title: "Neu ausgewertet" }); onChanged(); }
  };
  const importText = [
    call.caller_phone ? `Anrufernummer: ${call.caller_phone}` : null,
    call.company_name ? `Firma: ${call.company_name}` : null,
    call.customer_name ?? call.caller_name ? `Name: ${call.customer_name ?? call.caller_name}` : null,
    call.email ? `E-Mail: ${call.email}` : null,
    call.transcript ?? call.provider_summary ?? call.summary,
  ].filter(Boolean).join("\n");
  const createInquiry = async (r: Parameters<typeof createInquiryFromImport>[0]) => {
    const id = await createInquiryFromImport(r);
    if (id) {
      await supabase.from("phone_calls" as never).update({ rental_inquiry_id: id, status: "in_progress" } as never).eq("id", call.id);
    }
    toast({ title: "Mietanfrage angelegt", description: "Der Anruf ist verknüpft und gilt als erledigt, sobald das Angebot gesendet wurde." });
    onChanged();
    if (id) navigate(`/b2b/mietanfragen?status=all&anfrage=${id}`);
  };

  return (
    <div className="space-y-5">
      <SheetHeader><SheetTitle>{who(call)}</SheetTitle></SheetHeader>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <PriorityBadge p={call.priority} />
        {call.intent && <Badge variant="secondary">{INTENT_LABEL[call.intent]}</Badge>}
        {call.assistant && <Badge>{ASSISTANT[call.assistant]}</Badge>}
        {call.location && <Badge variant="outline">{LOC[call.location]}</Badge>}
        <span className="inline-flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{fmt(call)}{call.duration_seconds != null && ` · ${Math.round(call.duration_seconds / 60)} Min.`}</span>
      </div>

      {call.priority_reason && <p className="text-sm text-muted-foreground">Begründung: {call.priority_reason}</p>}
      {call.analysis_status === "failed" && <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm">Nicht ausgewertet: {call.analysis_error}</p>}

      <section>
        <h3 className="mb-1 text-sm font-semibold">Zusammenfassung</h3>
        <p className="text-sm">{call.summary ?? call.provider_summary ?? "—"}</p>
      </section>

      <section className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div><span className="text-muted-foreground">Telefon: </span>{call.caller_phone ? <a className="text-primary underline" href={`tel:${call.caller_phone}`}>{call.caller_phone}</a> : "—"}</div>
        <div><span className="text-muted-foreground">E-Mail: </span>{call.email ?? "—"}</div>
        <div><span className="text-muted-foreground">Mietbeginn: </span>{call.rental_start ? new Date(call.rental_start).toLocaleDateString("de-DE") : "—"}</div>
        <div><span className="text-muted-foreground">Mietende: </span>{call.details?.rental_end ? new Date(call.details.rental_end).toLocaleDateString("de-DE") : "—"}</div>
        <div><span className="text-muted-foreground">Adresse: </span>{[call.details?.address?.street, [call.details?.address?.postal_code, call.details?.address?.city].filter(Boolean).join(" ")].filter(Boolean).join(", ") || "—"}</div>
        <div><span className="text-muted-foreground">Lieferung: </span>{call.details?.delivery?.wanted === true ? `Ja${call.details.delivery.address ? ` – ${call.details.delivery.address}` : ""}` : call.details?.delivery?.wanted === false ? "Selbstabholung" : "—"}</div>
        <div><span className="text-muted-foreground">Rückruf: </span>{[call.details?.callback_time, call.details?.callback_phone].filter(Boolean).join(" · ") || "—"}</div>
        <div><span className="text-muted-foreground">Kundenkartei: </span>{call.crm_customer_id ? <a className="text-primary underline" href="/b2b/kundendaten">bekannter Kunde</a> : "nicht gefunden"}</div>
      </section>

      {(call.details?.items?.length ?? 0) > 0 ? (
        <section><h3 className="mb-1 text-sm font-semibold">Artikel und Menge</h3><ul className="list-disc pl-5 text-sm">{call.details!.items!.map((x, i) => <li key={i}>{x.quantity ? `${x.quantity} × ` : ""}{x.name}{x.note ? ` (${x.note})` : ""}</li>)}</ul></section>
      ) : call.mentioned_items.length > 0 && (
        <section><h3 className="mb-1 text-sm font-semibold">Genannte Artikel</h3><ul className="list-disc pl-5 text-sm">{call.mentioned_items.map((x, i) => <li key={i}>{x}</li>)}</ul></section>
      )}
      {call.open_points.length > 0 && (
        <section><h3 className="mb-1 text-sm font-semibold">Offene Punkte</h3><ul className="list-disc pl-5 text-sm">{call.open_points.map((x, i) => <li key={i}>{x}</li>)}</ul></section>
      )}

      <section className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Select value={call.priority ?? ""} onValueChange={(v) => update({ priority: v, priority_overridden: true })}>
          <SelectTrigger aria-label="Priorität ändern"><SelectValue placeholder="Priorität" /></SelectTrigger>
          <SelectContent>{PRIORITY_ORDER.map((p) => <SelectItem key={p} value={p}>{PRIORITY_LABEL[p]}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={call.status} onValueChange={(v) => update({ status: v })}>
          <SelectTrigger aria-label="Status ändern"><SelectValue /></SelectTrigger>
          <SelectContent>{Object.entries(STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
        </Select>
      </section>

      <div className="flex flex-wrap gap-2">
        {call.status === "open" && <Button onClick={take} disabled={busy}>Übernehmen</Button>}
        {call.rental_inquiry_id && <Button variant="secondary" onClick={() => navigate(`/b2b/mietanfragen?status=all&anfrage=${call.rental_inquiry_id}`)}><ExternalLink className="mr-1 h-4 w-4" />Mietanfrage öffnen</Button>}
        <Button variant={call.rental_inquiry_id ? "outline" : "default"} onClick={() => setImportOpen(true)} disabled={busy || !importText.trim()}><Inbox className="mr-1 h-4 w-4" />{call.rental_inquiry_id ? "Weitere Mietanfrage anlegen" : "Mietanfrage anlegen"}</Button>
        <Button variant="outline" onClick={reanalyze} disabled={busy}><RefreshCw className="mr-1 h-4 w-4" />Erneut auswerten</Button>
        {call.recording_url && <Button variant="outline" asChild><a href={call.recording_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-1 h-4 w-4" />Aufnahme</a></Button>}
      </div>

      <AiInquiryImportDialog open={importOpen} onOpenChange={setImportOpen} initialText={importText} onConfirm={createInquiry} />

      <section>
        <h3 className="mb-1 text-sm font-semibold">Notiz</h3>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        <Button size="sm" className="mt-2" variant="outline" disabled={busy || notes === (call.notes ?? "")} onClick={() => update({ notes: notes.trim() || null })}>Notiz speichern</Button>
      </section>

      {call.transcript && (
        <section>
          <h3 className="mb-1 text-sm font-semibold">Transkript</h3>
          <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">{call.transcript}</pre>
        </section>
      )}
    </div>
  );
}
