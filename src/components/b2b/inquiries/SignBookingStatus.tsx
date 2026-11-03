import { useEffect, useState } from "react";
import { FileDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
export function SignBookingStatus({ inquiryId }: { inquiryId: string }) {
  const [booking, setBooking] = useState<{ status: string; expires_at: string; permit_path: string | null; permit_mode: string | null; terms_accepted_at: string | null; terms_version: string | null; confirmation_sent_at: string | null } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const read = async () => { const { data, error } = await supabase.from("sign_bookings").select("status,expires_at,permit_path,permit_mode,terms_accepted_at,terms_version,confirmation_sent_at").eq("inquiry_id", inquiryId).maybeSingle(); if (active) { setBooking(data); if (error) setError("Buchungsstatus konnte nicht geladen werden."); } };
    void read(); const timer = window.setInterval(read, 15000);
    return () => { active = false; clearInterval(timer); };
  }, [inquiryId]);
  const download = async () => {
    if (!booking?.permit_path) return;
    const { data, error } = await supabase.storage.from("sign-permits").createSignedUrl(booking.permit_path, 300);
    if (error || !data) { setError("Genehmigung konnte nicht geöffnet werden."); return; }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };
  const evidence = booking && <div className="space-y-1 text-sm">{booking.permit_mode && <p className="font-semibold">{booking.permit_mode === "slt" ? "Genehmigung durch SLT · 14 Werktage Vorlauf" : "Genehmigung vorhanden · mindestens 96 Stunden Vorlauf"}</p>}{booking.terms_accepted_at && <p>AGB bestätigt am {new Date(booking.terms_accepted_at).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })} · Fassung {booking.terms_version}</p>}</div>;
  return <div className="space-y-3"><h3 className="font-semibold">Schilder-Direktbuchung</h3>{evidence}{booking && <><p>{booking.status === "paid" ? booking.confirmation_sent_at ? "Vollständig bezahlt · Bestätigung versendet" : "Vollständig bezahlt · Bestätigung wird automatisch versendet" : booking.status === "review" ? "Zahlung prüfen – keine automatische Bestätigung" : booking.status === "expired" ? "Reservierung abgelaufen · Bestand freigegeben" : `Reserviert bis ${new Date(booking.expires_at).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })} Uhr`}</p>{booking.permit_path && <Button variant="outline" onClick={download}><FileDown className="h-4 w-4" />Genehmigung öffnen</Button>}<p className="text-sm text-muted-foreground">Überweisung unter Zahlungseingänge erfassen. Die Bestätigung erfolgt nur bei vollständiger centgenauer Zahlung innerhalb der Reservierungsfrist.</p></>}{error && <p role="alert" className="text-destructive">{error}</p>}</div>;
}