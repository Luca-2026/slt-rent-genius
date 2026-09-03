import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  inquiryType: "rental" | "sales";
  inquiryId: string;
  customerEmail?: string | null;
  disabled?: boolean;
  onDone: () => void;
}

/**
 * Absage einer offenen Anfrage inkl. automatisch formulierter, freundlicher
 * E-Mail an den Kunden ("leider im angefragten Zeitraum nicht verfügbar").
 */
export function RejectInquiryDialog({ inquiryType, inquiryId, customerEmail, disabled, onDone }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("send-inquiry-rejection", {
      body: {
        inquiry_type: inquiryType,
        inquiry_id: inquiryId,
        note: note.trim() || null,
        notify_customer: notify && !!customerEmail,
      },
    });
    setBusy(false);
    if (error || (data as any)?.error) {
      toast({
        title: "Absage fehlgeschlagen",
        description: (data as any)?.error ?? error?.message ?? "Unbekannter Fehler",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Anfrage abgelehnt",
      description: (data as any)?.email_sent ? "Der Kunde wurde per E-Mail informiert." : "Ohne E-Mail-Versand.",
    });
    setOpen(false);
    setNote("");
    onDone();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled} className="text-destructive border-destructive/40">
          <XCircle className="h-3.5 w-3.5 mr-1" /> Ablehnen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Anfrage ablehnen</DialogTitle>
          <DialogDescription>
            Der Kunde erhält eine freundliche Absage: Der Mietgegenstand ist im angefragten Zeitraum
            leider bereits ausgebucht – wir unterstützen gerne beim nächsten Projekt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Checkbox
              id="notify-customer"
              checked={notify}
              onCheckedChange={(v) => setNotify(v === true)}
              disabled={!customerEmail}
            />
            <Label htmlFor="notify-customer" className="text-sm font-normal leading-snug">
              Kunden per E-Mail informieren
              {customerEmail ? ` (${customerEmail})` : " – keine E-Mail-Adresse hinterlegt"}
            </Label>
          </div>
          <div>
            <Label className="text-xs">Persönlicher Zusatz (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={800}
              placeholder="z. B. Alternativtermin oder vergleichbarer Artikel"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            Abbrechen
          </Button>
          <Button onClick={submit} disabled={busy} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {busy ? "Wird gesendet…" : "Ablehnen & Absage senden"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
