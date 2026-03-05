import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  UserPlus,
  Shield,
  Eye,
  Warehouse,
  Calculator,
  RefreshCw,
  UserX,
  UserCheck,
  Pencil,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface StaffProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  position: string | null;
  is_active: boolean;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

const ROLE_MAP: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  admin: {
    label: "Admin (Vollzugriff)",
    icon: <Shield className="h-3.5 w-3.5" />,
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  standort_mitarbeiter: {
    label: "Standortmitarbeiter",
    icon: <Warehouse className="h-3.5 w-3.5" />,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  buchhaltung: {
    label: "Buchhaltung",
    icon: <Calculator className="h-3.5 w-3.5" />,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  readonly: {
    label: "Nur Lesen",
    icon: <Eye className="h-3.5 w-3.5" />,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  },
};

export function AdminStaffTab() {
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Create form state
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    position: "",
    role: "standort_mitarbeiter",
  });

  const [newRole, setNewRole] = useState("");

  const fetchStaff = async () => {
    setLoading(true);
    const [staffRes, rolesRes] = await Promise.all([
      supabase.from("staff_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (staffRes.data) setStaff(staffRes.data as StaffProfile[]);
    if (rolesRes.data) setRoles(rolesRes.data as UserRole[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const getStaffRole = (userId: string): string => {
    const staffRoles = roles.filter(
      (r) => r.user_id === userId && r.role !== "user"
    );
    return staffRoles.length > 0 ? staffRoles[0].role : "user";
  };

  const resetForm = () => {
    setForm({
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      phone: "",
      position: "",
      role: "standort_mitarbeiter",
    });
  };

  const handleCreate = async () => {
    if (!form.email || !form.password || !form.first_name || !form.last_name || !form.role) {
      toast({
        title: "Fehler",
        description: "Bitte fülle alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }
    if (form.password.length < 6) {
      toast({
        title: "Fehler",
        description: "Passwort muss mindestens 6 Zeichen lang sein.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-staff", {
        body: { action: "create", ...form },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Mitarbeiter angelegt!",
        description: `${form.first_name} ${form.last_name} wurde erfolgreich erstellt.`,
      });
      resetForm();
      setCreateOpen(false);
      fetchStaff();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Mitarbeiter konnte nicht angelegt werden.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedStaff || !newRole) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-staff", {
        body: {
          action: "update_role",
          staff_user_id: selectedStaff.user_id,
          new_role: newRole,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Rolle aktualisiert!",
        description: `${selectedStaff.first_name} ${selectedStaff.last_name} hat jetzt die Rolle "${ROLE_MAP[newRole]?.label || newRole}".`,
      });
      setEditRoleOpen(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Rolle konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (staffMember: StaffProfile) => {
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-staff", {
        body: {
          action: staffMember.is_active ? "deactivate" : "reactivate",
          staff_user_id: staffMember.user_id,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: staffMember.is_active ? "Mitarbeiter deaktiviert" : "Mitarbeiter reaktiviert",
        description: `${staffMember.first_name} ${staffMember.last_name} wurde ${staffMember.is_active ? "deaktiviert" : "reaktiviert"}.`,
      });
      fetchStaff();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-staff", {
        body: {
          action: "delete",
          staff_user_id: selectedStaff.user_id,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Mitarbeiter gelöscht",
        description: `${selectedStaff.first_name} ${selectedStaff.last_name} wurde endgültig gelöscht.`,
      });
      setDeleteConfirmOpen(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Mitarbeiter konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredStaff = staff.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.position || "").toLowerCase().includes(q)
    );
  });

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Shield className="h-5 w-5 shrink-0" />
            Mitarbeiterverwaltung
          </CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-10"
            />
            <Button variant="outline" size="icon" onClick={fetchStaff} className="h-10 w-10 shrink-0">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-accent text-accent-foreground hover:bg-cta-orange-hover h-10 shrink-0"
            >
              <UserPlus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Mitarbeiter anlegen</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredStaff.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {searchQuery ? "Keine Mitarbeiter gefunden." : "Noch keine Mitarbeiter angelegt."}
          </p>
        ) : (
          <>
            {/* Desktop: Table */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>E-Mail</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Rolle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Erstellt</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((s) => {
                    const role = getStaffRole(s.user_id);
                    const roleInfo = ROLE_MAP[role];
                    return (
                      <TableRow key={s.id} className={!s.is_active ? "opacity-50" : ""}>
                        <TableCell className="font-medium">
                          {s.first_name} {s.last_name}
                        </TableCell>
                        <TableCell>{s.email}</TableCell>
                        <TableCell>{s.position || "–"}</TableCell>
                        <TableCell>
                          {roleInfo ? (
                            <Badge className={`${roleInfo.color} flex items-center gap-1 w-fit`}>
                              {roleInfo.icon}
                              {roleInfo.label}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">{role}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {s.is_active ? (
                            <Badge variant="default" className="bg-green-600">Aktiv</Badge>
                          ) : (
                            <Badge variant="secondary">Deaktiviert</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(s.created_at), "dd.MM.yyyy", { locale: de })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedStaff(s);
                                setNewRole(getStaffRole(s.user_id));
                                setEditRoleOpen(true);
                              }}
                              title="Rolle ändern"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(s)}
                              disabled={saving}
                              title={s.is_active ? "Deaktivieren" : "Reaktivieren"}
                            >
                              {s.is_active ? (
                                <UserX className="h-3.5 w-3.5" />
                              ) : (
                                <UserCheck className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedStaff(s);
                                setDeleteConfirmOpen(true);
                              }}
                              disabled={saving}
                              title="Löschen"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile: Card Layout */}
            <div className="lg:hidden space-y-3">
              {filteredStaff.map((s) => {
                const role = getStaffRole(s.user_id);
                const roleInfo = ROLE_MAP[role];
                return (
                  <div
                    key={s.id}
                    className={`border rounded-lg p-4 space-y-3 ${!s.is_active ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {s.first_name} {s.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{s.email}</p>
                        {s.position && (
                          <p className="text-xs text-muted-foreground mt-0.5">{s.position}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {s.is_active ? (
                          <Badge variant="default" className="bg-green-600 text-xs">Aktiv</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Deaktiviert</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {roleInfo ? (
                          <Badge className={`${roleInfo.color} flex items-center gap-1 text-xs`}>
                            {roleInfo.icon}
                            {roleInfo.label}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">{role}</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(s.created_at), "dd.MM.yy", { locale: de })}
                        </span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-3"
                          onClick={() => {
                            setSelectedStaff(s);
                            setNewRole(getStaffRole(s.user_id));
                            setEditRoleOpen(true);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1.5" />
                          Rolle
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-3"
                          onClick={() => handleToggleActive(s)}
                          disabled={saving}
                        >
                          {s.is_active ? (
                            <>
                              <UserX className="h-3.5 w-3.5 mr-1.5" />
                              Deaktivieren
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                              Aktivieren
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-3 text-destructive hover:text-destructive"
                          onClick={() => {
                            setSelectedStaff(s);
                            setDeleteConfirmOpen(true);
                          }}
                          disabled={saving}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          Löschen
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>

      {/* Create Staff Dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(v) => {
          setCreateOpen(v);
          if (!v) resetForm();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Neuen Mitarbeiter anlegen
            </DialogTitle>
            <DialogDescription>
              Erstelle ein Benutzerkonto für einen Mitarbeiter und weise eine Rolle zu.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Login-Daten</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>E-Mail *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="mitarbeiter@slt.de"
                  />
                </div>
                <div>
                  <Label>Passwort *</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 Zeichen"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Vorname *</Label>
              <Input
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Nachname *</Label>
              <Input
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+49 ..."
              />
            </div>
            <div>
              <Label>Position</Label>
              <Input
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                placeholder="z.B. Filialleiter"
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Rolle *</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_MAP).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        {val.icon}
                        {val.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {form.role === "admin" && "Vollzugriff auf alle Funktionen."}
                {form.role === "standort_mitarbeiter" &&
                  "Kann Reservierungen, Übergabeprotokolle und Rückgaben verwalten."}
                {form.role === "buchhaltung" &&
                  "Kann Rechnungen, Angebote und Zahlungsstatus einsehen und bearbeiten."}
                {form.role === "readonly" && "Kann alle Daten einsehen, aber nichts bearbeiten."}
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={handleCreate}
              disabled={saving}
              className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
            >
              {saving ? "Wird angelegt..." : "Mitarbeiter anlegen"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rolle ändern</DialogTitle>
            <DialogDescription>
              Weise {selectedStaff?.first_name} {selectedStaff?.last_name} eine neue Rolle zu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_MAP).map(([key, val]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      {val.icon}
                      {val.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setEditRoleOpen(false)}>
                Abbrechen
              </Button>
              <Button
                onClick={handleUpdateRole}
                disabled={saving}
                className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
              >
                {saving ? "Wird gespeichert..." : "Rolle speichern"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
