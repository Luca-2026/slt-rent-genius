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
  const valid = Number.isFinite(value) && value > 0 && value <= 9999999999.99;

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
    if (data?.pending_approval) toast.info("Kreditlimitfreigabe liegt beim Admin", { description: "Benedikt und Luca erhalten eine Freigabeaufgabe. Das bisherige Limit bleibt unverändert." });
    else toast.success(data?.email_sent ? `Kreditlimit vergeben, Bestätigung an ${data.email_sent_to} gesendet.` : "Kreditlimit vergeben, E-Mail konnte nicht gesendet werden.");
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
              {companyName}: Bis 2.000 € kannst du das Limit direkt vergeben. Höhere Beträge werden Benedikt und Luca zur Admin-Freigabe vorgelegt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <Label htmlFor="grant-amount">Kreditlimit (€)</Label>
            <Input id="grant-amount" type="number" inputMode="decimal" min={0} step={100}
              value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="z. B. 1000" />
            {value > MAX_BRANCH_LIMIT && <p className="text-xs text-muted-foreground mt-1">Kreditlimitfreigabe liegt beim Admin. Das bisherige Limit bleibt bis zur Entscheidung unverändert.</p>}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction disabled={!valid || busy} onClick={run}>{value > MAX_BRANCH_LIMIT ? "Admin-Freigabe anfragen" : "Vergeben & E-Mail senden"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
