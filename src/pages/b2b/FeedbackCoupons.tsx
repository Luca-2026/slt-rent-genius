import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Gift, RefreshCw, ShieldBan, Plus, Share2 } from "lucide-react";
import { ManualCouponDialog } from "@/components/b2b/ManualCouponDialog";
import type { Tables } from "@/integrations/supabase/types";

const statuses: Record<string, string> = { active: "Aktiv", reserved: "Reserviert", redeemed: "Eingelöst", blocked: "Gesperrt" };
type Coupon = (Tables<"rental_feedback_coupons"> | Tables<"manual_rental_coupons">) & { origin: "feedback" | "manual" };
export default function FeedbackCoupons() {
  const [rows, setRows] = useState<Coupon[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [canIssue, setCanIssue] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<{ id: string; invoice_id: string; customer_email: string; order_ref: string; source_kind: string; submitted_at: string | null }[]>([]);
  const [events, setEvents] = useState<Tables<"rental_coupon_events">[]>([]);
  const { isStaff, isAdmin } = useStaffAccess();
  const { toast } = useToast();
  const load = async () => {
    setLoading(true);
    const [feedback, manual, permission] = await Promise.all([
      supabase.from("rental_feedback_coupons").select("*"),
      supabase.from("manual_rental_coupons").select("*"),
      supabase.rpc("can_issue_rental_coupon"),
    ]);
    setCanIssue(permission.data === true);
    setRows([
      ...(feedback.data ?? []).map(r => ({ ...r, origin: "feedback" as const })),
      ...(manual.data ?? []).map(r => ({ ...r, origin: "manual" as const })),
    ].sort((a, b) => b.created_at.localeCompare(a.created_at)));
    setError(feedback.error || manual.error ? "Gutscheine konnten nicht geladen werden." : ""); setLoading(false);
    const [{ data: invites }, { data: history }, { data: manualHistory }] = await Promise.all([supabase.rpc("list_rental_feedback_invitations"), supabase.from("rental_coupon_events").select("*").order("created_at", { ascending: false }), supabase.from("manual_rental_coupon_events").select("*").order("created_at", { ascending: false })]);
    setPending(invites ?? []); setEvents([...(history ?? []), ...(manualHistory ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at)));
  };
  useEffect(() => { void load(); }, []);
  const block = async (id: string, origin: Coupon["origin"]) => {
    const reason = window.prompt("Grund für die Sperrung (mindestens 5 Zeichen)");
    if (!reason) return;
    const { error: err } = await supabase.rpc(origin === "manual" ? "block_manual_rental_coupon" : "block_rental_coupon", { p_coupon: id, p_reason: reason });
    if (err) toast({ title: "Sperrung nicht möglich", description: err.message, variant: "destructive" });
    else { toast({ title: "Gutschein gesperrt" }); void load(); }
  };
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); toast({ title: "Gutscheincode kopiert" }); }
    catch { toast({ title: "Kopieren nicht möglich", description: "Der Code bleibt zum Abtippen sichtbar.", variant: "destructive" }); }
  };
  const share = async (coupon: Coupon) => {
    const text = `Dein SLT Rental Gutscheincode: ${coupon.code}\n${coupon.discount_percent} % auf rabattfähige Mietpositionen, einmalig für deine nächste Miete. Versicherungen, Zubehör, Haftungsfreistellung und Stundenlohn sind ausgeschlossen.\nhttps://www.slt-rental.de`;
    if (!navigator.share) { await copy(text); return; }
    try { await navigator.share({ title: "SLT Rental Gutschein", text }); }
    catch (error) { if (!(error instanceof Error && error.name === "AbortError")) await copy(text); }
  };
  const copyInvite = async (invoice: string, kind: string) => {
    const { data, error: err } = await supabase.functions.invoke("rental-feedback", { body: { action: "invite", kind, invoice_id: invoice } });
    if (err || data?.error) toast({ title: "Link nicht verfügbar", description: data?.error ?? err?.message, variant: "destructive" });
    else { await navigator.clipboard.writeText(data.url); toast({ title: "Persönlicher Feedback-Link kopiert" }); }
  };
  return <B2BPortalLayout title="Gutscheine">
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <Gift className="h-6 w-6 text-accent" />
      {canIssue && <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />Gutschein erstellen</Button>}
      <Input aria-label="Gutscheine suchen" placeholder="Code oder Kunde suchen" value={search} onChange={e => setSearch(e.target.value)} className="flex-1 min-w-0 max-w-md" />
      <Button variant="outline" size="icon" aria-label="Gutscheine aktualisieren" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
    </div>
    {isStaff && pending.filter(i => !i.submitted_at && `${i.customer_email} ${i.order_ref}`.toLowerCase().includes(search.toLowerCase())).map(i => <div key={i.id} className="py-4 border-t border-border flex flex-wrap items-center justify-between gap-3"><div><Badge variant="secondary">Wartet auf Feedback</Badge><p className="text-sm mt-2 break-all">{i.customer_email} · #{i.order_ref}</p></div><Button variant="outline" onClick={() => copyInvite(i.invoice_id, i.source_kind)}><Copy className="h-4 w-4" />Feedback-Link</Button></div>)}
    {error && <p role="alert" className="text-destructive">{error}</p>}
    {loading ? <p className="text-muted-foreground">Wird geladen …</p> : rows.length === 0 ? <p className="text-muted-foreground">Noch keine Gutscheine vorhanden.</p> : <div className="divide-y divide-border border-y border-border">
      {rows.filter(r => `${r.code} ${r.customer_email}`.toLowerCase().includes(search.toLowerCase())).map(r => <article key={r.id} className="py-5 flex flex-col md:flex-row gap-4 md:items-center">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2"><strong className="text-lg">{r.discount_percent} %</strong><Badge variant={r.status === "active" ? "default" : "secondary"}>{statuses[r.status] ?? r.status}</Badge><Badge variant="outline">{r.origin === "manual" ? "Manuell" : "Feedback"}</Badge></div>
          <p className="font-mono text-sm break-all">{r.code}</p>
          {isStaff && <p className="text-sm text-muted-foreground break-all">{r.customer_email}</p>}
          <p className="text-xs text-muted-foreground">Aktiviert {new Date(r.created_at).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" })}{r.redeemed_at ? ` · Eingelöst ${new Date(r.redeemed_at).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" })}` : ""}</p>
          {r.reserved_offer_number && <p className="text-sm">Angebot {r.reserved_offer_number}{isStaff && r.reserved_kind === "inquiry" && <Link className="text-primary underline ml-2" to={`/b2b/mietanfragen/${r.reserved_order_id}`}>Auftrag öffnen</Link>}</p>}
          {r.block_reason && <p className="text-sm text-destructive">{r.block_reason}</p>}
          {isStaff && <details className="text-xs text-muted-foreground"><summary className="cursor-pointer">Verlauf</summary>{events.filter(e => e.coupon_id === r.id).map(e => <p key={e.id} className="mt-1 break-words">{new Date(e.created_at).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })} · {({ issued: "Erstellt", activated: "Aktiviert", reserved: "Reserviert", redeemed: "Eingelöst", blocked: "Gesperrt", released_expired: "Abgelaufene Reservierung gelöst" } as Record<string, string>)[e.event] ?? e.event}{e.note ? ` · ${e.note}` : ""}</p>)}</details>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => copy(r.code)}><Copy className="h-4 w-4" />Code kopieren</Button>
          {isStaff && r.status === "active" && <Button variant="outline" onClick={() => share(r)}><Share2 className="h-4 w-4" />Teilen</Button>}
          {(r.origin === "manual" ? canIssue : isAdmin) && ["active", "reserved"].includes(r.status) && <Button variant="outline" aria-label="Gutschein sperren" onClick={() => block(r.id, r.origin)}><ShieldBan className="h-4 w-4" /></Button>}
        </div>
      </article>)}
    </div>}
    {canIssue && <ManualCouponDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => void load()} />}
  </B2BPortalLayout>;
}