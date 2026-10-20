import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Gift, RefreshCw, ShieldBan } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const statuses: Record<string, string> = { active: "Aktiv", reserved: "Reserviert", redeemed: "Eingelöst", blocked: "Gesperrt" };
export default function FeedbackCoupons() {
  const [rows, setRows] = useState<Tables<"rental_feedback_coupons">[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isStaff, isAdmin } = useStaffAccess();
  const { toast } = useToast();
  const load = async () => {
    setLoading(true);
    const { data, error: err } = await supabase.from("rental_feedback_coupons").select("*").order("created_at", { ascending: false });
    setRows(data ?? []); setError(err ? "Gutscheine konnten nicht geladen werden." : ""); setLoading(false);
  };
  useEffect(() => { void load(); }, []);
  const block = async (id: string) => {
    const reason = window.prompt("Grund für die Sperrung (mindestens 5 Zeichen)");
    if (!reason) return;
    const { error: err } = await supabase.rpc("block_rental_coupon", { p_coupon: id, p_reason: reason });
    if (err) toast({ title: "Sperrung nicht möglich", description: err.message, variant: "destructive" });
    else { toast({ title: "Gutschein gesperrt" }); void load(); }
  };
  return <B2BPortalLayout title="Gutscheine">
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <Gift className="h-6 w-6 text-accent" />
      <Input aria-label="Gutscheine suchen" placeholder="Code oder Kunde suchen" value={search} onChange={e => setSearch(e.target.value)} className="flex-1 min-w-0 max-w-md" />
      <Button variant="outline" size="icon" aria-label="Gutscheine aktualisieren" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
    </div>
    {error && <p role="alert" className="text-destructive">{error}</p>}
    {loading ? <p className="text-muted-foreground">Wird geladen …</p> : rows.length === 0 ? <p className="text-muted-foreground">Noch keine Gutscheine vorhanden.</p> : <div className="divide-y divide-border border-y border-border">
      {rows.filter(r => `${r.code} ${r.customer_email}`.toLowerCase().includes(search.toLowerCase())).map(r => <article key={r.id} className="py-5 flex flex-col md:flex-row gap-4 md:items-center">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2"><strong className="text-lg">10 %</strong><Badge variant={r.status === "active" ? "default" : "secondary"}>{statuses[r.status] ?? r.status}</Badge></div>
          <p className="font-mono text-sm break-all">{r.code}</p>
          {isStaff && <p className="text-sm text-muted-foreground break-all">{r.customer_email}</p>}
          <p className="text-xs text-muted-foreground">Aktiviert {new Date(r.created_at).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" })}{r.redeemed_at ? ` · Eingelöst ${new Date(r.redeemed_at).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" })}` : ""}</p>
          {r.reserved_offer_number && <p className="text-sm">Angebot {r.reserved_offer_number}{isStaff && r.reserved_kind === "inquiry" && <Link className="text-primary underline ml-2" to={`/b2b/mietanfragen/${r.reserved_order_id}`}>Auftrag öffnen</Link>}</p>}
          {r.block_reason && <p className="text-sm text-destructive">{r.block_reason}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { navigator.clipboard.writeText(r.code); toast({ title: "Gutscheincode kopiert" }); }}><Copy className="h-4 w-4" />Code kopieren</Button>
          {isAdmin && ["active", "reserved"].includes(r.status) && <Button variant="outline" aria-label="Gutschein sperren" onClick={() => block(r.id)}><ShieldBan className="h-4 w-4" /></Button>}
        </div>
      </article>)}
    </div>}
  </B2BPortalLayout>;
}