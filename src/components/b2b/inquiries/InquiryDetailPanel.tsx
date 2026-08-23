import { ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ExternalLink, UserCheck, UserMinus } from "lucide-react";
import { INQUIRY_STATUSES, canTransition, type InquiryStatus } from "@/lib/inquiryStatus";
import { InquiryStatusBadge } from "./InquiryStatusBadge";
import { InquiryOfferForm } from "./InquiryOfferForm";
import { useInquiryActions } from "./useInquiryActions";
import type { OfferLine } from "./offerMath";
import { formatEuro } from "./offerMath";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  table: "rental_inquiries" | "sales_inquiries";
  inquiryType: "rental" | "sales";
  inquiry: {
    id: string;
    status: string;
    location: string | null;
    assigned_to: string | null;
    assigned_name: string | null;
    internal_notes: string | null;
    offer_number: string | null;
    offer_file_url: string | null;
    offer_total_gross: number | null;
    offer_sent_at: string | null;
  };
  defaultItems: OfferLine[];
  details: ReactNode;
  onChanged: () => void;
}

export function InquiryDetailPanel({ table, inquiryType, inquiry, defaultItems, details, onChanged }: Props) {
  const { user } = useAuth();
  const { busy, actorName, claim, release, setStatus, saveNotes } = useInquiryActions(table, onChanged);
  const [notes, setNotes] = useState(inquiry.internal_notes ?? "");

  useEffect(() => setNotes(inquiry.internal_notes ?? ""), [inquiry.id, inquiry.internal_notes]);

  const mine = inquiry.assigned_to === user?.id;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <InquiryStatusBadge status={inquiry.status} />
        {inquiry.assigned_name ? (
          <span className="text-sm text-muted-foreground">
            Bearbeitet von <strong>{inquiry.assigned_name}</strong>
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Noch niemand zugewiesen</span>
        )}
        {mine ? (
          <Button size="sm" variant="outline" onClick={() => release(inquiry.id)} disabled={busy}>
            <UserMinus className="h-3.5 w-3.5 mr-1" /> Freigeben
          </Button>
        ) : (
          <Button size="sm" onClick={() => claim(inquiry.id, inquiry.status)} disabled={busy}>
            <UserCheck className="h-3.5 w-3.5 mr-1" /> Übernehmen
          </Button>
        )}
        <Select
          value=""
          onValueChange={(value) => setStatus(inquiry.id, inquiry.status, value as InquiryStatus)}
        >
          <SelectTrigger className="w-[190px] h-9">
            <SelectValue placeholder="Status ändern" />
          </SelectTrigger>
          <SelectContent>
            {INQUIRY_STATUSES.filter((s) => canTransition(inquiry.status, s)).map((s) => (
              <SelectItem key={s} value={s}>
                {s === "in_progress" ? "In Bearbeitung" :
                  s === "offer_sent" ? "Angebot gesendet" :
                  s === "accepted" ? "Angenommen" :
                  s === "rejected" ? "Abgelehnt" :
                  s === "done" ? "Erledigt" : "Neu"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {details}

      <Separator />

      <div>
        <Label className="text-xs">Interne Notizen</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        <Button
          size="sm"
          variant="outline"
          className="mt-2"
          onClick={() => saveNotes(inquiry.id, notes)}
          disabled={busy || notes === (inquiry.internal_notes ?? "")}
        >
          Notiz speichern
        </Button>
      </div>

      <Separator />

      {inquiry.offer_number && (
        <div className="rounded-lg border border-border p-3 text-sm space-y-1">
          <div className="font-semibold">Angebot {inquiry.offer_number}</div>
          <div className="text-muted-foreground">
            {inquiry.offer_sent_at ? new Date(inquiry.offer_sent_at).toLocaleString("de-DE") : "—"}
            {inquiry.offer_total_gross != null && ` · ${formatEuro(Number(inquiry.offer_total_gross))} brutto`}
          </div>
          {inquiry.offer_file_url && (
            <a
              href={inquiry.offer_file_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary underline"
            >
              PDF öffnen <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-2">
          {inquiry.offer_number ? "Neues Angebot senden" : "Angebot erstellen"}
        </h3>
        <InquiryOfferForm
          inquiryType={inquiryType}
          inquiryId={inquiry.id}
          location={inquiry.location}
          defaultItems={defaultItems}
          staffName={actorName}
          disabled={busy}
          onSent={onChanged}
        />
      </div>
    </div>
  );
}
