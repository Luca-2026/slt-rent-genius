import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLocationDisplayName } from "@/utils/plzLocationMapping";
import { toast } from "sonner";

interface TransportRow {
  id: string;
  instance_id: string;
  from_location: string;
  to_location: string;
  due_at: string;
  status: "open" | "done" | "cancelled";
  transport_cost: number | null;
  cost_charged: boolean;
  rental_inquiry_id: string | null;
  done_at: string | null;
  instance?: { internal_inventory_number: string | null; serial_number: string | null } | null;
  product?: { name: string } | null;
  inquiry?: { offer_number: string | null; customer_name: string | null; company_name: string | null } | null;
}

const STATUS_LABEL = { open: "Offen", done: "Erledigt", cancelled: "Storniert" } as const;
const FILTER_KEY = "slt.transports.filter";
const loc = (l: string) => getLocationDisplayName(l) || l;
const fmt = (iso: string) => new Date(iso).toLocaleString("de-DE", { timeZone: "Europe/Berlin", weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function TransportOrders() {
  const { isStaff, canManageInventory, loading: accessLoading } = useStaffAccess() as ReturnType<typeof useStaffAccess> & { canManageInventory?: boolean };
  const saved = (() => { try { return JSON.parse(localStorage.getItem(FILTER_KEY) || "{}"); } catch { return {}; } })();
  const [status, setStatus] = useState<string>(saved.status ?? "open");
  const [location, setLocation] = useState<string>(saved.location ?? "all");
  const [rows, setRows] = useState<TransportRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("b2b_transport_orders" as any)
      .select("*, instance:b2b_product_instances(internal_inventory_number, serial_number), inquiry:rental_inquiries(offer_number, customer_name, company_name)")
      .order("due_at", { ascending: true })
      .limit(500);
    if (error) toast.error(`Transporte nicht ladbar: ${error.message}`);
    const list = ((data ?? []) as unknown) as TransportRow[];
    const ids = [...new Set(list.map((r: any) => r.managed_product_id))];
    if (ids.length) {
      const { data: prods } = await supabase.from("b2b_managed_products").select("id, name").in("id", ids);
      const byId = new Map((prods ?? []).map((p: any) => [p.id, p]));
      list.forEach((r: any) => { r.product = byId.get(r.managed_product_id) ?? null; });
    }
    setRows(list);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { localStorage.setItem(FILTER_KEY, JSON.stringify({ status, location })); }, [status, location]);

  const visible = useMemo(() => rows.filter((r) =>
    (status === "all" || r.status === status) &&
    (location === "all" || r.from_location === location || r.to_location === location)), [rows, status, location]);

  const markDone = async (id: string) => {
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("b2b_transport_orders" as any)
      .update({ status: "done", done_at: new Date().toISOString(), done_by: u.user?.id ?? null } as any).eq("id", id);
    if (error) { toast.error(`Nicht gespeichert: ${error.message}`); return; }
    toast.success("Transport erledigt.");
    void load();
  };

  if (!accessLoading && !isStaff) return <B2BPortalLayout title="Transporte"><p className="text-muted-foreground">Nur für Mitarbeiter.</p></B2BPortalLayout>;

  return (
    <B2BPortalLayout title="Transporte" subtitle="Überführungen von Geräten zwischen den Standorten">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Offen</SelectItem>
            <SelectItem value="done">Erledigt</SelectItem>
            <SelectItem value="cancelled">Storniert</SelectItem>
            <SelectItem value="all">Alle</SelectItem>
          </SelectContent>
        </Select>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Standorte</SelectItem>
            <SelectItem value="krefeld">Krefeld</SelectItem>
            <SelectItem value="bonn">Bonn</SelectItem>
            <SelectItem value="muelheim">Mülheim an der Ruhr</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => void load()}><RefreshCw className="mr-1 h-4 w-4" />Aktualisieren</Button>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Lädt …</p>
      ) : visible.length === 0 ? (
        <p className="text-muted-foreground">Keine Transporte für diese Auswahl.</p>
      ) : (
        <div className="space-y-2">
          {visible.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium break-words">{r.product?.name ?? "Gerät"}</span>
                    {r.instance?.internal_inventory_number && <span className="text-sm text-muted-foreground">{r.instance.internal_inventory_number}</span>}
                    <Badge variant={r.status === "open" ? "destructive" : "secondary"}>{STATUS_LABEL[r.status]}</Badge>
                  </div>
                  <p className="text-sm">{loc(r.from_location)} → {loc(r.to_location)} · fällig {fmt(r.due_at)}</p>
                  <p className="text-sm text-muted-foreground break-words">
                    {r.inquiry?.offer_number ? `Angebot ${r.inquiry.offer_number}` : ""}
                    {r.inquiry?.company_name || r.inquiry?.customer_name ? ` · ${r.inquiry.company_name || r.inquiry.customer_name}` : ""}
                    {r.transport_cost != null ? ` · Kosten ${Number(r.transport_cost).toLocaleString("de-DE", { style: "currency", currency: "EUR" })} netto${r.cost_charged ? " (eingepreist)" : ""}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {r.rental_inquiry_id && <Button asChild variant="outline" size="sm"><Link to={`/b2b/mietanfragen/${r.rental_inquiry_id}`}>Auftrag</Link></Button>}
                  {r.status === "open" && canManageInventory !== false && (
                    <Button size="sm" onClick={() => void markDone(r.id)}><Check className="mr-1 h-4 w-4" />Erledigt</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </B2BPortalLayout>
  );
}
