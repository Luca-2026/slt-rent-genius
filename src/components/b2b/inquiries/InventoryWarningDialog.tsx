/**
 * Bestätigungsdialog vor dem Versand, wenn der Bestand am Standort im
 * gewählten Zeitraum nicht ausreicht oder gar nicht gepflegt ist.
 * Der Versand bleibt bewusst möglich – die Entscheidung liegt beim Team.
 */
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Info } from "lucide-react";
import type { InventoryIssue } from "@/lib/inventoryAvailability";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issues: InventoryIssue[];
  documentLabel: string;
  onConfirm: () => void;
}

function formatDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("de-DE");
}

export function InventoryWarningDialog({ open, onOpenChange, issues, documentLabel, onConfirm }: Props) {
  const hasOver = issues.some((i) => i.severity === "over");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className={hasOver ? "h-5 w-5 text-destructive" : "h-5 w-5 text-amber-600"} />
            {hasOver ? "Bestand reicht nicht aus" : "Bestand nicht gepflegt"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasOver
              ? "Für mindestens eine Position ist im gewählten Zeitraum am Standort nicht genug Bestand frei."
              : "Für mindestens eine Position ist am Standort keine Bestandsmenge hinterlegt."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ul className="space-y-3 text-sm">
          {issues.map((issue, i) => (
            <li
              key={`${issue.productName}-${i}`}
              className={
                "rounded-md border p-3 " +
                (issue.severity === "over"
                  ? "border-destructive/40 bg-destructive/5"
                  : "border-amber-500/40 bg-amber-500/5")
              }
            >
              <div className="flex gap-2">
                {issue.severity === "over" ? (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                ) : (
                  <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                )}
                <div className="min-w-0">
                  <p className="break-words">{issue.message}</p>
                  {issue.conflicts.length > 0 && (
                    <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                      {issue.conflicts.slice(0, 5).map((c) => (
                        <li key={c.id} className="break-words">
                          {c.ref}
                          {c.label ? ` · ${c.label}` : ""} · {formatDate(c.start)}
                          {c.end && c.end !== c.start ? ` – ${formatDate(c.end)}` : ""} · {c.quantity} Stk.
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <AlertDialogFooter>
          <AlertDialogCancel>Zurück zur Bearbeitung</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Trotzdem senden – {documentLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
