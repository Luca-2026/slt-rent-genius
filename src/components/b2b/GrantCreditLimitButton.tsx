import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MAX_BRANCH_LIMIT = 2000;

interface Props {
  profileId: string;
  companyName: string;
  onDone: () => void;
}

/** Niederlassungsleiter: Kreditlimit bis 2.000 € vergeben, Kunde erhält Bestätigungs-E-Mail. */
export function GrantCreditLimitButton({ profileId, companyName, onDone }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState("");
  const value = amount === "" ? 0 : Number(amount);
  const valid = Number.isFinite(value) && value > 0 && value <= MAX_BRANCH_LIMIT;

  const run = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("grant-credit-limit", { body: { profileId, amount: value } });
    setBusy(false);
    if (error || data?.error) {
      toast.error(`Kreditlimit fehlgeschlagen: ${data?.error || error?.message}`);
      return;
    }
    toast.success(data?.email_sent ? `Kreditlimit vergeben, Bestätigung an ${data.email_sent_to} gesendet.` : "Kreditlimit vergeben, E-Mail konnte nicht gesendet werden.");
    setOpen(false);
    onDone();
  };

  return (
    <>
      <Button size="sm" disabled={busy} onClick={() => setOpen(true)}>Limit vergeben</Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kreditlimit vergeben</AlertDialogTitle>
            <AlertDialogDescription>
              {companyName} erhält eine Bestätigungs-E-Mail, dass jetzt bis zu diesem Betrag auf Rechnung gemietet werden kann. Als Niederlassungsleiter kannst du höchstens 2.000 € vergeben.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <Label htmlFor="grant-amount">Kreditlimit (€)</Label>
            <Input id="grant-amount" type="number" inputMode="decimal" min={0} max={MAX_BRANCH_LIMIT} step={100}
              value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="z. B. 1000" />
            {value > MAX_BRANCH_LIMIT && <p className="text-xs text-destructive mt-1">Höchstens 2.000 € – höhere Limits vergibt ein Admin.</p>}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction disabled={!valid || busy} onClick={run}>Vergeben &amp; E-Mail senden</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
