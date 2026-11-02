import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DECLINE_REASONS } from "../../../../supabase/functions/_shared/offer-followup";

export function OfferDecisionHistory({ inquiryId, status }: { inquiryId: string; status: string }) {
  const [events, setEvents] = useState<{ id: string; event: string; created_at: string; details: Record<string, unknown> }[]>([]);
  useEffect(() => {
    let active = true;
    supabase.from("rental_inquiry_events").select("id,event,created_at,details").eq("rental_inquiry_id", inquiryId).in("event", ["offer_declined", "offer_expired"]).order("created_at", { ascending: false })
      .then(({ data }) => { if (active) setEvents((data ?? []).map((r) => ({ ...r, details: (r.details ?? {}) as Record<string, unknown> }))); });
    return () => { active = false; };
  }, [inquiryId, status]);
  if (!events.length) return null;
  return <div className="mb-4 border-l-4 border-primary pl-4 space-y-3">
    {events.map((event) => <div key={event.id} className="space-y-1 text-sm">
      <p className="font-semibold">{event.event === "offer_declined" ? "Kunde hat Angebot abgelehnt" : "Angebot automatisch abgelaufen"} · {String(event.details.offer_number ?? "")}</p>
      <p className="text-muted-foreground">{new Date(event.created_at).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}</p>
      {event.details.reason && <p>Grund: {DECLINE_REASONS[event.details.reason as keyof typeof DECLINE_REASONS] ?? String(event.details.reason)}</p>}
      {event.details.note && <p className="whitespace-pre-wrap break-words">{String(event.details.note)}</p>}
    </div>)}
  </div>;
}