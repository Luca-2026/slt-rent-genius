import { useState } from "react";
import { matchesStaffSearch } from "@/lib/staffSearch";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FileDown, ArrowUpRight, RefreshCw, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLocationDisplayName } from "@/utils/plzLocationMapping";
import { toast } from "sonner";

const date = (value: string | null) => value ? new Date(`${value.slice(0, 10)}T12:00:00Z`).toLocaleDateString("de-DE") : "–";
const statusLabels: Record<string, string> = { paid: "Bezahlt", reserved: "Reserviert", expired: "Abgelaufen", review: "Zahlung prüfen" };

export default function SignBookings() {
  const { isStaff, loading: accessLoading } = useStaffAccess();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState(() => localStorage.getItem("slt.signBookings.location") || "all");
  const [status, setStatus] = useState(() => localStorage.getItem("slt.signBookings.status") || "all");
  const [opening, setOpening] = useState<string | null>(null);
  const { data: rows = [], isPending, isFetching, error, refetch } = useQuery({
    queryKey: ["staff-sign-bookings"],
    enabled: !accessLoading && isStaff,
    queryFn: async () => {
      const bookings = await supabase.from("sign_bookings").select("id,inquiry_id,location,package,quantity,start_date,end_date,status,permit_mode,permit_path,permit_valid_from,permit_valid_until,permit_issued_on,confirmation_sent_at,staff_notified_at").order("start_date", { ascending: true });
      if (bookings.error) throw bookings.error;
      if (!bookings.data.length) return [];
      const inquiries = await supabase.from("rental_inquiries").select("id,order_code,customer_name,company_name,customer_email,customer_phone,delivery_street,delivery_postal_code,delivery_city,internal_notes,status").in("id", bookings.data.map(b => b.inquiry_id));
      if (inquiries.error) throw inquiries.error;
      const byId = new Map(inquiries.data.map(i => [i.id, i]));
      return bookings.data.map(b => ({ ...b, inquiry: byId.get(b.inquiry_id), address: [byId.get(b.inquiry_id)?.delivery_street, byId.get(b.inquiry_id)?.delivery_postal_code, byId.get(b.inquiry_id)?.delivery_city].filter(Boolean).join(" ") }));
    },
  });
  const openPermit = async (path: string) => {
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    setOpening(path);
    try {
      const { data, error } = await supabase.storage.from("sign-permits").createSignedUrl(path, 300);
      if (error || !data) throw error || new Error("missing document");
      if (tab) tab.location.href = data.signedUrl;
      else toast.error("Bitte das Öffnen neuer Fenster erlauben und erneut versuchen.");
    } catch {
      tab?.close();
      toast.error("Genehmigung konnte nicht geöffnet werden. Bitte erneut versuchen.");
    } finally { setOpening(null); }
  };
  const visible = rows.filter(b => (location === "all" || b.location === location) && (status === "all" || b.status === status) &&
    matchesStaffSearch(search, [b.id, b.inquiry_id, b.inquiry?.order_code, b.inquiry?.customer_name, b.inquiry?.company_name, b.inquiry?.customer_email, b.address]));

  return <B2BPortalLayout title="Halteverbote">
    {accessLoading ? <p className="text-muted-foreground">Lädt …</p> : !isStaff ? <p>Nur für Mitarbeiter.</p> : <>
      <div className="mb-5 flex flex-wrap gap-2">
        <div className="relative min-w-0 flex-1 basis-56"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Halteverbote suchen" placeholder="Auftrag, Kunde oder Adresse" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Select value={location} onValueChange={v => { setLocation(v); localStorage.setItem("slt.signBookings.location", v); }}><SelectTrigger aria-label="Standort" className="w-full sm:w-52"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Alle Standorte</SelectItem><SelectItem value="krefeld">Krefeld</SelectItem><SelectItem value="bonn">Bonn</SelectItem><SelectItem value="muelheim">Mülheim an der Ruhr</SelectItem></SelectContent></Select>
        <Select value={status} onValueChange={v => { setStatus(v); localStorage.setItem("slt.signBookings.status", v); }}><SelectTrigger aria-label="Buchungsstatus" className="w-full sm:w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Alle Buchungen</SelectItem>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
        <Button variant="outline" size="icon" aria-label="Aktualisieren" title="Aktualisieren" disabled={isFetching} onClick={() => void refetch()}><RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /></Button>
      </div>
      {error ? <p role="alert" className="text-destructive">Halteverbote konnten nicht geladen werden. Bitte erneut aktualisieren.</p> : isPending ? <p className="text-muted-foreground">Halteverbote werden geladen …</p> : !visible.length ? <p className="text-muted-foreground">Keine Halteverbote für diese Auswahl.</p> : <div className="space-y-3">
        {visible.map(b => <article key={b.id} className="rounded-lg border border-border p-4 space-y-4">
          <div className="flex flex-wrap justify-between gap-3">
            <div className="min-w-0 space-y-1"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{b.inquiry?.order_code ? `#${b.inquiry.order_code}` : "Halteverbot"}</span><Badge variant={b.status === "review" ? "destructive" : "secondary"}>{statusLabels[b.status] || b.status}</Badge><span className="text-sm text-muted-foreground">{getLocationDisplayName(b.location)}</span></div><p className="font-medium break-words">{b.inquiry?.company_name || b.inquiry?.customer_name || "–"}</p><p className="text-sm">{b.package === "standard" ? "Schildermiete · Selbstabholung" : "Rundum-sorglos-Paket"} · {b.quantity} {b.quantity === 1 ? "Set" : "Sets"}</p></div>
            <Button asChild variant="outline" size="sm"><Link to={`/b2b/mietanfragen/${b.inquiry_id}`}>Auftrag öffnen<ArrowUpRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-muted-foreground">Mietzeitraum</dt><dd>{date(b.start_date)} – {date(b.end_date)}</dd></div>
            <div><dt className="text-muted-foreground">Genehmigungszeitraum / Beklebung</dt><dd>{b.permit_valid_from ? `${date(b.permit_valid_from)} – ${date(b.permit_valid_until)}` : "Nicht hinterlegt"}</dd></div>
            <div><dt className="text-muted-foreground">Genehmigung vom</dt><dd>{b.permit_issued_on ? date(b.permit_issued_on) : "Nicht hinterlegt"}</dd></div>
            <div><dt className="text-muted-foreground">Genehmigung</dt><dd>{b.permit_mode === "slt" ? "Beantragung durch SLT" : b.permit_mode === "existing" ? "Vom Kunden vorhanden" : b.package === "standard" ? "Angaben durch den Kunden" : "Nicht hinterlegt"}</dd></div>
            {b.address && <div className="sm:col-span-2"><dt className="text-muted-foreground">Aufstelladresse</dt><dd className="break-words whitespace-pre-line">{b.address}</dd></div>}
          </dl>
          {b.permit_path ? <Button variant="outline" size="sm" disabled={opening === b.permit_path} onClick={() => void openPermit(b.permit_path || "")}><FileDown className="mr-2 h-4 w-4" />{opening === b.permit_path ? "Öffnet …" : "Genehmigung öffnen"}</Button> : <p className="text-sm text-muted-foreground">Keine Genehmigungs-PDF hinterlegt.</p>}
          <details className="border-t border-border pt-3 text-sm"><summary className="cursor-pointer font-medium">Weitere Auftragsinfos</summary><div className="mt-3 space-y-2 break-words"><p>{b.inquiry?.customer_name}</p>{b.inquiry?.customer_email && <p><a className="text-primary underline" href={`mailto:${b.inquiry.customer_email}`}>{b.inquiry.customer_email}</a></p>}{b.inquiry?.customer_phone && <p><a className="text-primary underline" href={`tel:${b.inquiry.customer_phone}`}>{b.inquiry.customer_phone}</a></p>}<p>Kundenbestätigung: {b.confirmation_sent_at ? "Versendet" : "Noch nicht versendet"}</p><p>Standortbenachrichtigung: {b.staff_notified_at ? "Versendet" : "Noch nicht versendet"}</p>{b.inquiry?.internal_notes && <p className="whitespace-pre-line">{b.inquiry.internal_notes}</p>}</div></details>
        </article>)}
      </div>}
    </>}
  </B2BPortalLayout>;
}