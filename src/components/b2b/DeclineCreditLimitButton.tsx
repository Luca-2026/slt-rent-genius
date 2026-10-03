import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  profileId: string;
  companyName: string;
  onDone: () => void;
}

/** „Kein Kreditlimit vergeben“ – Absage-E-Mail an den Kunden, Anfrage wird abgeschlossen. */
export function DeclineCreditLimitButton({ profileId, companyName, onDone }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("decline-credit-limit", { body: { profileId } });
    setBusy(false);
    if (error || data?.error) {
      toast.error(`Absage fehlgeschlagen: ${data?.error || error?.message}`);
      return;
    }
    toast.success(data?.email_sent ? `Kreditlimit-Anfrage abgeschlossen, E-Mail an ${data.email_sent_to} gesendet.` : "Anfrage abgeschlossen, E-Mail konnte nicht gesendet werden.");
    onDone();
  };

  return (
    <>
      <Button size="sm" variant="outline" disabled={busy} onClick={() => setOpen(true)}>
        Kein Kreditlimit vergeben
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kein Kreditlimit vergeben?</AlertDialogTitle>
            <AlertDialogDescription>
              {companyName} erhält eine freundliche E-Mail: Aktuell kann noch kein Kreditlimit vergeben werden, die erste Miete erfolgt per Vorkasse, das Konto wird proaktiv geprüft und eine erneute Anfrage ist jederzeit möglich. Die Anfrage verschwindet danach aus den offenen Kundenanfragen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={run}>Absagen &amp; E-Mail senden</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
