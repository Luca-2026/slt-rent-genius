import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { invokeWithAuth } from "@/lib/invokeWithAuth";
import { useToast } from "@/hooks/use-toast";

export function ResendOfferButton({ inquiryId, inquiryType, onChanged }: { inquiryId: string; inquiryType: "rental" | "sales"; onChanged: () => void }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<{ recipient: string; offer_number: string; request_id: string } | null>(null);
  const open = async () => {
    setBusy(true);
    try {
      const { data, error } = await invokeWithAuth("resend-inquiry-offer", { inquiry_id: inquiryId, inquiry_type: inquiryType, preview: true });
      if (error || !data?.success) throw new Error(data?.error || "Angebot konnte nicht geprüft werden.");
      setPreview({ recipient: data.recipient, offer_number: data.offer_number, request_id: crypto.randomUUID() });
    } catch (error) { toast({ title: "Neuversand nicht möglich", description: error instanceof Error ? error.message : "Bitte erneut versuchen.", variant: "destructive" }); }
    finally { setBusy(false); }
  };
  const send = async () => {
    if (!preview || busy) return;
    setBusy(true);
    try {
      const { data, error } = await invokeWithAuth("resend-inquiry-offer", { inquiry_id: inquiryId, inquiry_type: inquiryType, expected_email: preview.recipient, request_id: preview.request_id });
      if (error || !data?.email_sent) throw new Error(data?.error || "Versand nicht bestätigt.");
      toast({ title: "Angebot erneut versendet", description: data.warning || `An ${data.recipient}` });
      setPreview(null); onChanged();
    } catch (error) { toast({ title: "Versand nicht bestätigt", description: error instanceof Error ? error.message : "Bitte erneut versuchen.", variant: "destructive" }); }
    finally { setBusy(false); }
  };
  return <>
    <Button size="sm" variant="outline" disabled={busy} onClick={open}><Mail className="mr-2 h-4 w-4" />Angebot erneut senden</Button>
    <AlertDialog open={!!preview} onOpenChange={(open) => { if (!open && !busy) setPreview(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Angebot erneut senden?</AlertDialogTitle><AlertDialogDescription className="break-words">Angebot {preview?.offer_number} an {preview?.recipient}. Das vorhandene PDF und die Angebotsnummer bleiben unverändert; es wird keine überarbeitete Fassung erstellt.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel disabled={busy}>Abbrechen</AlertDialogCancel><Button disabled={busy} onClick={send}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}Jetzt senden</Button></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}