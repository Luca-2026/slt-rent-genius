/** Übergabe/Rückgabe direkt im Mietauftrag (Detailansicht der Mietanfrage). */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, FileText, PackageCheck } from "lucide-react";
import { RentalProtocolDialog } from "./RentalProtocolDialog";
import type { RentalInquiry } from "@/components/b2b/inquiries/types";
import type { RentalProtocolState } from "@/hooks/useRentalProtocolStatus";
import type { ProtocolKind } from "@/lib/rentalProtocol";

interface Props {
  inquiry: RentalInquiry;
  state: RentalProtocolState;
  onChanged: () => void;
}

export function RentalProtocolSection({ inquiry, state, onChanged }: Props) {
  const [kind, setKind] = useState<ProtocolKind | null>(null);
  const accepted = inquiry.status === "accepted";
  if (!accepted && !state.delivery && !state.ret) return null;

  const Row = ({ title, number, url, date }: { title: string; number: string; url: string | null; date: string }) => (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2">
      <div className="min-w-0 text-sm">
        <p className="font-medium">{title} {number}</p>
        <p className="text-xs text-muted-foreground">{new Date(date).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })} Uhr</p>
      </div>
      {url && (
        <Button asChild size="sm" variant="outline">
          <a href={url} target="_blank" rel="noreferrer"><FileText className="h-4 w-4 mr-1" /> PDF</a>
        </Button>
      )}
    </div>
  );

  return (
    <div className="mt-4 space-y-2 rounded-lg border border-border p-3">
      <p className="text-sm font-semibold">Übergabe & Rückgabe</p>
      {!inquiry.order_confirmed_at && accepted && !state.delivery && (
        <p className="text-xs text-muted-foreground">Die Auftragsbestätigung ist noch nicht verschickt. Ein Übergabeprotokoll ist trotzdem möglich.</p>
      )}
      {state.delivery && <Row title="Übergabeprotokoll" number={state.delivery.number} url={state.delivery.file_url} date={state.delivery.created_at} />}
      {state.ret && <Row title="Rückgabeprotokoll" number={state.ret.number} url={state.ret.file_url} date={state.ret.created_at} />}
      {accepted && !state.delivery && (
        <Button className="w-full" onClick={() => setKind("delivery")}>
          <ClipboardCheck className="h-4 w-4 mr-2" /> Übergabeprotokoll erstellen
        </Button>
      )}
      {accepted && state.delivery && !state.ret && (
        <Button className="w-full" onClick={() => setKind("return")}>
          <PackageCheck className="h-4 w-4 mr-2" /> Rückgabeprotokoll erstellen
        </Button>
      )}
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
