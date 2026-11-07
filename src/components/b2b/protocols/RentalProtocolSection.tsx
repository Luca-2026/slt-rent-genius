/** Übergabe/Rückgabe direkt im Mietauftrag (Detailansicht der Mietanfrage). */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClipboardCheck, FileText, PackageCheck, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { RentalProtocolDialog } from "./RentalProtocolDialog";
import type { RentalInquiry } from "@/components/b2b/inquiries/types";
import type { RentalProtocolState } from "@/hooks/useRentalProtocolStatus";
import type { ProtocolKind } from "@/lib/rentalProtocol";
import { isProtocolCandidate } from "@/lib/rentalProtocol";

interface Props {
  inquiry: RentalInquiry;
  state: RentalProtocolState;
  onChanged: () => void;
}

/** Ausdrückliche Bestätigung vor einer Rückgabe ohne Übergabeprotokoll. */
export function ReturnWithoutDeliveryConfirm({ inquiryId, open, onCancel, onConfirmed }: { inquiryId: string; open: boolean; onCancel: () => void; onConfirmed: () => void }) {
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setOk(false); onCancel(); } }}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-md">
        <DialogHeader>
          <DialogTitle>Kein Übergabeprotokoll vorhanden</DialogTitle>
          <DialogDescription>Für diesen Auftrag wurde keine Übergabe dokumentiert. Der Zustand bei Mietbeginn lässt sich dann nicht vergleichen.</DialogDescription>
        </DialogHeader>
        <label className="flex items-start gap-2 text-sm">
          <Checkbox checked={ok} onCheckedChange={(v) => setOk(v === true)} className="mt-0.5" />
          <span>Mir ist bewusst, dass kein Übergabeprotokoll existiert, und ich erstelle das Rückgabeprotokoll trotzdem.</span>
        </label>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { setOk(false); onCancel(); }}>Abbrechen</Button>
          <Button disabled={!ok || busy} onClick={async () => {
            setBusy(true);
            const { error } = await supabase.rpc("log_return_without_delivery", { _inquiry_id: inquiryId });
            setBusy(false);
            if (error) { toast.error(error.message); return; }
            setOk(false); onConfirmed();
          }}>Weiter zum Rückgabeprotokoll</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RentalProtocolSection({ inquiry, state, onChanged }: Props) {
  const [kind, setKind] = useState<ProtocolKind | null>(null);
  const [askReturn, setAskReturn] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [closeOk, setCloseOk] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const { isSuperAdmin } = useStaffAccess();
  const closedAt = (inquiry as { closed_manually_at?: string | null }).closed_manually_at ?? null;
  const closedReason = (inquiry as { closed_manually_reason?: string | null }).closed_manually_reason ?? null;
  const accepted = inquiry.status === "accepted";
  const candidateState = { handedOver: !!state.delivery, returned: !!state.ret };
  const canDeliver = isProtocolCandidate(inquiry, "delivery", candidateState);
  const canReturn = isProtocolCandidate(inquiry, "return", candidateState);
  const canClose = isSuperAdmin && !closedAt && !state.ret && (accepted || (inquiry.status === "done" && !!inquiry.order_confirmed_at));
  if (!canDeliver && !canReturn && !state.delivery && !state.ret && !closedAt && !canClose) return null;

  const Row = ({ title, number, url, date }: { title: string; number: string; url: string | null; date: string }) => (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-card px-3 py-2">
      <div className="min-w-0 text-sm">
        <p className="font-medium">{title} {number}</p>
        <p className="text-xs text-muted-foreground">{new Date(date).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })} Uhr</p>
      </div>
      {url && (
        <Button asChild size="sm" variant="outline">
          <a href={url} target="_blank" rel="noreferrer"><FileText className="h-4 w-4" /> PDF</a>
        </Button>
      )}
    </div>
  );

  const closeManually = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("close_rental_without_protocol", { _inquiry_id: inquiry.id, _reason: reason });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Auftrag manuell abgeschlossen.");
    setCloseOpen(false); setCloseOk(false); setReason("");
    onChanged();
  };

  return (
    <div className="mt-3 space-y-2 border-t border-border pt-3">
      <p className="text-sm font-semibold">Übergabe & Rückgabe</p>
      {state.delivery && <Row title="Übergabeprotokoll" number={state.delivery.number} url={state.delivery.file_url} date={state.delivery.created_at} />}
      {state.delivery?.status === "signed" && !inquiry.order_confirmation_number && <Button variant="outline" className="min-h-10 w-full justify-start" disabled={busy} onClick={async () => {
        if (!state.delivery) return;
        setBusy(true);
        try {
          const { data, error } = await supabase.functions.invoke("send-order-confirmation", { body: { inquiry_type: "rental", handover_protocol_id: state.delivery.id, attach_pdf: true } });
          if (error || !data?.success) { toast.error(data?.error ?? "Auftragsbestätigung konnte nicht versendet werden."); return; }
          toast.success("Auftragsbestätigung versendet."); onChanged();
        } catch { toast.error("Auftragsbestätigung konnte nicht versendet werden."); }
        finally { setBusy(false); }
      }}><FileText className="h-4 w-4" /> Ausstehende AB senden</Button>}
      {state.delivery?.status === "signed_staff_only" && <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center text-sm">
        <span className="text-muted-foreground">Kundenunterschrift ausstehend</span>
        <Button variant="outline" size="sm" disabled={busy} onClick={async () => {
          if (!state.delivery) return;
          setBusy(true);
          const { data, error } = await supabase.functions.invoke("delivery-protocol-sign", { body: { action: "request", id: state.delivery.id } });
          setBusy(false);
          if (error || !data?.success) { toast.error("Unterschriftsanfrage konnte nicht gesendet werden."); return; }
          toast.success("Unterschriftsanfrage per E-Mail gesendet.");
        }}>Unterschrift per E-Mail anfordern</Button>
      </div>}
      {state.ret && <Row title="Rückgabeprotokoll" number={state.ret.number} url={state.ret.file_url} date={state.ret.created_at} />}
      {closedAt && (
        <div className="rounded-md border border-accent bg-accent/10 px-3 py-2 text-sm">
          <p className="font-medium text-foreground">Manuell abgeschlossen ohne Rückgabeprotokoll</p>
          <p className="text-xs text-muted-foreground break-words">{new Date(closedAt).toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "short" })} Uhr{closedReason ? ` · Grund: ${closedReason}` : ""}</p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {canDeliver && (
        <Button variant="outline" className="min-h-10 w-full justify-start" onClick={() => setKind("delivery")}>
          <ClipboardCheck className="h-4 w-4" /> Übergabeprotokoll erstellen
        </Button>
      )}
      {!state.ret && !closedAt && (canDeliver || canReturn) && (
        <Button className="min-h-10 w-full justify-start" variant="outline" disabled={!canReturn} onClick={() => (state.delivery ? setKind("return") : setAskReturn(true))}>
          <PackageCheck className="h-4 w-4" /> Rückgabeprotokoll erstellen
        </Button>
      )}
      </div>
      {canClose && (
        <Button className="w-full" variant="outline" onClick={() => setCloseOpen(true)}>
          <Lock className="h-4 w-4" /> Rückgabeprotokoll nicht ausgefüllt
        </Button>
      )}

      <ReturnWithoutDeliveryConfirm inquiryId={inquiry.id} open={askReturn} onCancel={() => setAskReturn(false)} onConfirmed={() => { setAskReturn(false); setKind("return"); }} />

      <Dialog open={closeOpen} onOpenChange={(o) => { if (!o) { setCloseOpen(false); setCloseOk(false); } }}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-md">
          <DialogHeader>
            <DialogTitle>Auftrag ohne Rückgabeprotokoll abschließen?</DialogTitle>
            <DialogDescription>Nur für Ausnahmefälle. Der Abschluss wird mit deinem Namen, Zeitpunkt und Grund im Verlauf gespeichert und kann nicht rückgängig gemacht werden.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="close-reason" className="text-xs">Grund (Pflicht)</Label>
            <Textarea id="close-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="z. B. Gerät zurück, Protokoll vor Ort vergessen" />
          </div>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={closeOk} onCheckedChange={(v) => setCloseOk(v === true)} className="mt-0.5" />
            <span>Ich bestätige ausdrücklich, dass dieser Auftrag ohne {state.delivery ? "" : "Übergabe- und "}Rückgabeprotokoll abgeschlossen wird.</span>
          </label>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setCloseOpen(false); setCloseOk(false); }}>Abbrechen</Button>
            <Button disabled={!closeOk || reason.trim().length < 5 || busy} onClick={closeManually}>Auftrag abschließen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RentalProtocolDialog
        kind={kind ?? "delivery"}
        inquiry={inquiry}
        open={kind !== null}
        onOpenChange={(o) => { if (!o) setKind(null); }}
        onCreated={onChanged}
      />
    </div>
  );
}
