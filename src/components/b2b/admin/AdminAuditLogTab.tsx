import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuditRow {
  id: string;
  actor_email: string | null;
  actor_role: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_label: string | null;
  changes: any;
  created_at: string;
}

const ENTITY_LABELS: Record<string, string> = {
  auth: "Anmeldung",
  b2b_managed_products: "Produkt (CMS)",
  b2b_profiles: "B2B-Profil",
  b2b_invoices: "Rechnung",
  b2b_offers: "Angebot",
  b2b_delivery_notes: "Lieferschein",
};

const ACTION_COLORS: Record<string, string> = {
  login: "bg-blue-100 text-blue-800",
  insert: "bg-green-100 text-green-800",
  update: "bg-amber-100 text-amber-800",
  status_change: "bg-purple-100 text-purple-800",
  delete: "bg-red-100 text-red-800",
};

export default function AdminAuditLogTab() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [actorFilter, setActorFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("admin_audit_log" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    setRows((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const uniqueActors = Array.from(new Set(rows.map((r) => r.actor_email).filter(Boolean))) as string[];

  const filtered = rows.filter((r) => {
    if (entityFilter !== "all" && r.entity_type !== entityFilter) return false;
    if (actorFilter !== "all" && r.actor_email !== actorFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${r.actor_email ?? ""} ${r.entity_label ?? ""} ${r.action} ${JSON.stringify(r.changes ?? {})}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Audit-Log (Super-Admin)
          </CardTitle>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Aktualisieren
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Letzte 500 Ereignisse. Nur für dich und Benedikt sichtbar. Ein täglicher Report wird an
          l.sandhoff@slt-rental.de und b.noechle@slt-rental.de versendet.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Input placeholder="Suche (Text, Firma, Feld)..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger><SelectValue placeholder="Bereich" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Bereiche</SelectItem>
              {Object.entries(ENTITY_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={actorFilter} onValueChange={setActorFilter}>
            <SelectTrigger><SelectValue placeholder="Admin" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Admins</SelectItem>
              {uniqueActors.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr className="text-left">
                <th className="px-3 py-2">Zeit</th>
                <th className="px-3 py-2">Admin</th>
                <th className="px-3 py-2">Aktion</th>
                <th className="px-3 py-2">Bereich</th>
                <th className="px-3 py-2">Objekt</th>
                <th className="px-3 py-2">Änderungen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Keine Einträge</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-t align-top">
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                    {new Date(r.created_at).toLocaleString("de-DE")}
                  </td>
                  <td className="px-3 py-2">
                    <div>{r.actor_email ?? "System"}</div>
                    {r.actor_role === "super_admin" && <Badge variant="secondary" className="text-xs">Super</Badge>}
                  </td>
                  <td className="px-3 py-2">
                    <Badge className={ACTION_COLORS[r.action] ?? ""}>{r.action}</Badge>
                  </td>
                  <td className="px-3 py-2">{ENTITY_LABELS[r.entity_type] ?? r.entity_type}</td>
                  <td className="px-3 py-2">{r.entity_label ?? r.entity_id ?? "—"}</td>
                  <td className="px-3 py-2 max-w-md">
                    {r.changes && Object.keys(r.changes).length > 0 ? (
                      <details>
                        <summary className="cursor-pointer text-primary">Details</summary>
                        <pre className="text-xs bg-muted p-2 mt-1 rounded overflow-auto max-h-64">
                          {JSON.stringify(r.changes, null, 2)}
                        </pre>
                      </details>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
