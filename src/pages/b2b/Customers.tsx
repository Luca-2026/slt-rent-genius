import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEGMENT_FILTER_OPTIONS, SEGMENT_LABELS, matchesSegment, parseSegmentFilter, segmentOf, type SegmentFilter } from "@/lib/customerSegment";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { DeclineCreditLimitButton } from "@/components/b2b/DeclineCreditLimitButton";
import { GrantCreditLimitButton } from "@/components/b2b/GrantCreditLimitButton";
import { useCrmCustomers, crmCustomerLabel, type CrmCustomer } from "@/hooks/useCrmCustomers";
import { CustomerFormDialog } from "@/components/b2b/customers/CustomerFormDialog";
import { AdminCustomerDetailDialog } from "@/components/b2b/admin/AdminCustomerDetailDialog";
import { AdminCustomerEditDialog } from "@/components/b2b/admin/AdminCustomerEditDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Mail, Phone, MapPin, CreditCard, CalendarDays } from "lucide-react";
import { getLocationDisplayName } from "@/utils/plzLocationMapping";
import { toast } from "sonner";
import { ACTION_FILTER_OPTIONS, needsAction, parseActionFilter, registrationDate, type ActionFilter, type PortalProfileLite } from "@/lib/customerActions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

const euro = (n: number) => n.toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export default function Customers() {
  const { isStaff, isAdmin, isBranchManager, loading: accessLoading } = useStaffAccess();
  const { rows, loading, save, remove, reload } = useCrmCustomers();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CrmCustomer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const segment = parseSegmentFilter(searchParams.get("kunden"));
  const action = parseActionFilter(searchParams.get("handlung"));

  const [profiles, setProfiles] = useState<Row[]>([]);
  const [invoices, setInvoices] = useState<Row[]>([]);
  const [reservations, setReservations] = useState<Row[]>([]);
  const [firstInquiry, setFirstInquiry] = useState<Map<string, string>>(new Map());
  const [selectedProfile, setSelectedProfile] = useState<Row | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editPortalOpen, setEditPortalOpen] = useState(false);

  const loadPortal = useCallback(async () => {
    const [p, inv, res] = await Promise.all([
      supabase.from("b2b_profiles").select("*"),
      isAdmin ? supabase.from("b2b_invoices").select("*") : Promise.resolve({ data: [] }),
      isAdmin ? supabase.from("b2b_reservations").select("*") : Promise.resolve({ data: [] }),
    ]);
    setProfiles((p.data as Row[]) ?? []);
    setInvoices((inv.data as Row[]) ?? []);
    setReservations((res.data as Row[]) ?? []);
  }, [isAdmin]);

  useEffect(() => { if (isStaff) loadPortal(); }, [isStaff, loadPortal]);

  useEffect(() => {
    if (!isStaff) return;
    Promise.all([
      supabase.from("rental_inquiries").select("crm_customer_id,created_at").not("crm_customer_id", "is", null),
      supabase.from("sales_inquiries").select("crm_customer_id,created_at").not("crm_customer_id", "is", null),
    ]).then((res) => {
      const m = new Map<string, string>();
      for (const r of res.flatMap((x) => (x.data ?? []) as { crm_customer_id: string; created_at: string }[])) {
        const cur = m.get(r.crm_customer_id);
        if (!cur || r.created_at < cur) m.set(r.crm_customer_id, r.created_at);
      }
      setFirstInquiry(m);
    });
  }, [isStaff]);

  const profileById = useMemo(() => {
    const m = new Map<string, Row>();
    for (const p of profiles) m.set(p.id, p);
    return m;
  }, [profiles]);

  // Direktlink (z. B. von der Startseite): ?profil=<id>
  useEffect(() => {
    const id = searchParams.get("profil");
    if (!id || !isAdmin) return;
    const p = profileById.get(id);
    if (!p) return;
    setSelectedProfile(p);
    if (searchParams.get("aktion") === "bearbeiten") setEditPortalOpen(true); else setDetailOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete("profil"); next.delete("aktion");
    setSearchParams(next, { replace: true });
  }, [searchParams, profileById, isAdmin, setSearchParams]);

  const counts = useMemo(() => {
    const c: Record<ActionFilter, number> = { none: 0, alle: 0, freigabe: 0, kreditlimit: 0, loeschung: 0 };
    for (const p of profiles as PortalProfileLite[]) {
      for (const k of ["freigabe", "kreditlimit", "loeschung"] as const) if (needsAction(p, k)) c[k]++;
      if (needsAction(p, "alle")) c.alle++;
    }
    return c;
  }, [profiles]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter((c) => {
        if (!matchesSegment(segmentOf(c), segment)) return false;
        if (action !== "none") {
          const p = c.b2b_profile_id ? profileById.get(c.b2b_profile_id) : null;
          if (!p || !needsAction(p, action)) return false;
        }
        if (!q) return true;
        return [c.company_name, c.first_name, c.last_name, c.email, c.phone, c.city, c.postal_code]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      })
      .map((c) => ({ c, reg: registrationDate(c, c.b2b_profile_id ? profileById.get(c.b2b_profile_id) : null, firstInquiry.get(c.id)) }))
      .sort((a, b) => b.reg.localeCompare(a.reg));
  }, [rows, search, segment, action, profileById, firstInquiry]);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null) next.delete(key); else next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  if (!accessLoading && !isStaff) {
    return (
      <B2BPortalLayout title="Kundendaten">
        <p className="text-muted-foreground">Kein Zugriff auf diesen Bereich.</p>
      </B2BPortalLayout>
    );
  }

  const handleDelete = async (c: CrmCustomer) => {
    if (!window.confirm(`Kunde „${crmCustomerLabel(c)}" wirklich löschen?`)) return;
    try {
      await remove(c.id);
      toast.success("Kunde gelöscht.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Löschen fehlgeschlagen.");
    }
  };

  const openEdit = (c: CrmCustomer) => {
    const p = c.b2b_profile_id ? profileById.get(c.b2b_profile_id) : null;
    if (p && isAdmin) { setSelectedProfile(p); setDetailOpen(true); return; }
    setEditing(c); setDialogOpen(true);
  };

  return (
    <B2BPortalLayout title="Kundenkartei" subtitle="Alle Kunden – Privat- und Geschäftskunden inkl. B2B-Portal, neueste Registrierung zuerst">
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suche nach Firma, Name, E-Mail, Ort …"
          className="sm:w-72"
        />
        <Select value={segment} onValueChange={(v) => setParam("kunden", v === "all" ? null : (v as SegmentFilter))}>
          <SelectTrigger className="sm:w-56" aria-label="Kundengruppe"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SEGMENT_FILTER_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={action} onValueChange={(v) => setParam("handlung", v === "none" ? null : v)}>
          <SelectTrigger className="sm:w-56" aria-label="Handlungsbedarf"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ACTION_FILTER_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}{o.value !== "none" ? ` (${counts[o.value]})` : ""}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2 sm:ml-auto">
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Neuen Kunden anlegen
          </Button>
        </div>
      </div>

      {counts.alle > 0 && action === "none" && (
        <div role="note" className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-accent bg-accent/5 p-3 text-sm">
          <span className="font-semibold text-foreground">Offene Kundenanfragen:</span>
          {counts.freigabe > 0 && <button type="button" className="text-primary underline underline-offset-4" onClick={() => setParam("handlung", "freigabe")}>{counts.freigabe} Freischaltung{counts.freigabe === 1 ? "" : "en"}</button>}
          {counts.kreditlimit > 0 && <button type="button" className="text-primary underline underline-offset-4" onClick={() => setParam("handlung", "kreditlimit")}>{counts.kreditlimit} Kreditlimit-Antr{counts.kreditlimit === 1 ? "ag" : "äge"}</button>}
          {counts.loeschung > 0 && <button type="button" className="text-primary underline underline-offset-4" onClick={() => setParam("handlung", "loeschung")}>{counts.loeschung} Löschantr{counts.loeschung === 1 ? "ag" : "äge"}</button>}
        </div>
      )}

      <p className="mb-3 text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? "Kunde" : "Kunden"}</p>

      {loading ? (
        <p className="text-muted-foreground">Wird geladen …</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">Keine Kunden gefunden.</p>
      ) : (
        <div className="grid gap-3">
          {filtered.map(({ c, reg }) => {
            const p = c.b2b_profile_id ? profileById.get(c.b2b_profile_id) : null;
            const credit = p ? Number(p.credit_limit) || 0 : 0;
            return (
              <Card key={c.id} data-testid="customer-card">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold break-words">{crmCustomerLabel(c)}</span>
                      <Badge variant={segmentOf(c) === "portal" ? "secondary" : "outline"}>{SEGMENT_LABELS[segmentOf(c)]}</Badge>
                      {p?.status === "pending" && <Badge variant="destructive">Freischaltung offen</Badge>}
                      {p?.status === "approved" && <Badge variant="outline">Freigeschaltet</Badge>}
                      {p?.status === "rejected" && <Badge variant="outline">Abgelehnt</Badge>}
                      {p && needsAction(p, "kreditlimit") && <Badge className="bg-accent text-accent-foreground hover:bg-accent">Kreditlimit angefragt</Badge>}
                      {p && needsAction(p, "loeschung") && <Badge variant="destructive">Löschung beantragt</Badge>}
                      {c.location && <Badge variant="secondary">{getLocationDisplayName(c.location)}</Badge>}
                    </div>
                    {c.company_name && (c.first_name || c.last_name) && (
                      <p className="text-sm text-muted-foreground break-words">
                        {[c.salutation, c.first_name, c.last_name].filter(Boolean).join(" ")}
                      </p>
                    )}
                    <div className="mt-1 flex flex-col gap-0.5 text-sm text-muted-foreground">
                      {c.email && <span className="flex items-center gap-1.5 break-all"><Mail className="h-3.5 w-3.5 shrink-0" />{c.email}</span>}
                      {c.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 shrink-0" />{c.phone}</span>}
                      {(c.street || c.city) && (
                        <span className="flex items-center gap-1.5 break-words">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {[c.street, [c.postal_code, c.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
                        </span>
                      )}
                      {p && (
                        <span className="flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5 shrink-0" />
                          {credit > 0 ? `Kreditlimit ${euro(credit)} · genutzt ${euro(Number(p.used_credit) || 0)}` : "Kein Kreditlimit (Vorkasse)"}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                        {p ? "Registriert" : "Kunde seit"} {new Date(reg).toLocaleDateString("de-DE")}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {p && isBranchManager && !isAdmin && needsAction(p, "kreditlimit") && (
                      <>
                        <GrantCreditLimitButton profileId={p.id} companyName={p.company_name || crmCustomerLabel(c)} onDone={loadPortal} />
                        <DeclineCreditLimitButton profileId={p.id} companyName={p.company_name || crmCustomerLabel(c)} onDone={loadPortal} />
                      </>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openEdit(c)} aria-label={`${crmCustomerLabel(c)} bearbeiten`}>
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Bearbeiten
                    </Button>
                    {isAdmin && !p && (
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(c)} aria-label="Kunde löschen">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editing}
        onSave={save}
        allowPortal={isAdmin}
        onPortalCreated={async () => { await loadPortal(); await reload(); }}
      />

      {isAdmin && (
        <>
          <AdminCustomerDetailDialog
            profile={selectedProfile}
            invoices={invoices}
            reservations={reservations}
            open={detailOpen}
            onOpenChange={setDetailOpen}
            onEditCustomer={(profile) => { setSelectedProfile(profile); setEditPortalOpen(true); }}
            onRefresh={loadPortal}
          />
          <AdminCustomerEditDialog
            profile={selectedProfile}
            open={editPortalOpen}
            onOpenChange={setEditPortalOpen}
            onSaved={loadPortal}
          />
        </>
      )}
    </B2BPortalLayout>
  );
}
