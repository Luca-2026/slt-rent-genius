import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Trash2, Users, Edit2, X, Check } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";

interface AuthorizedPerson {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  max_rental_value: number;
  notes: string | null;
  is_active: boolean;
}

interface Props {
  profileId: string;
}

export function AuthorizedPersonsManager({ profileId }: Props) {
  const { toast } = useToast();
  const [persons, setPersons] = useState<AuthorizedPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [notes, setNotes] = useState("");

  const fetchPersons = async () => {
    const { data } = await supabase
      .from("b2b_authorized_persons")
      .select("*")
      .eq("b2b_profile_id", profileId)
      .order("created_at", { ascending: true });
    setPersons((data as AuthorizedPerson[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchPersons(); }, [profileId]);

  const resetForm = () => {
    setFirstName(""); setLastName(""); setEmail(""); setPhone("");
    setPosition(""); setMaxValue(""); setNotes(""); setEditingId(null);
  };

  const openAddDialog = () => { resetForm(); setDialogOpen(true); };

  const openEditDialog = (p: AuthorizedPerson) => {
    setEditingId(p.id);
    setFirstName(p.first_name);
    setLastName(p.last_name);
    setEmail(p.email || "");
    setPhone(p.phone || "");
    setPosition(p.position || "");
    setMaxValue(String(p.max_rental_value));
    setNotes(p.notes || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!firstName || !lastName) {
      toast({ title: "Vor- und Nachname sind Pflichtfelder", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        b2b_profile_id: profileId,
        first_name: firstName,
        last_name: lastName,
        email: email || null,
        phone: phone || null,
        position: position || null,
        max_rental_value: parseFloat(maxValue) || 0,
        notes: notes || null,
      };

      if (editingId) {
        const { error } = await supabase.from("b2b_authorized_persons").update(payload).eq("id", editingId);
        if (error) throw error;
        toast({ title: "Person aktualisiert" });
      } else {
        const { error } = await supabase.from("b2b_authorized_persons").insert(payload);
        if (error) throw error;
        toast({ title: "Person hinzugefügt" });
      }

      setDialogOpen(false);
      resetForm();
      fetchPersons();
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("b2b_authorized_persons").delete().eq("id", deleteId);
    if (error) {
      toast({ title: "Fehler beim Löschen", variant: "destructive" });
    } else {
      toast({ title: "Person entfernt" });
      fetchPersons();
    }
    setDeleteId(null);
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("b2b_authorized_persons").update({ is_active: active }).eq("id", id);
    fetchPersons();
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(val);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Autorisierte Personen</CardTitle>
              <CardDescription>
                Personen, die berechtigt sind, Mietgegenstände in deinem Namen anzumieten und abzuholen.
              </CardDescription>
            </div>
          </div>
          <Button onClick={openAddDialog} size="sm" className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
            <UserPlus className="h-4 w-4 mr-1.5" />
            Hinzufügen
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : persons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Noch keine autorisierten Personen hinterlegt.</p>
            <p className="text-sm mt-1">Füge Mitarbeiter hinzu, die Mietgeräte abholen dürfen.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {persons.map((p) => (
              <div
                key={p.id}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border ${
                  p.is_active ? "bg-background" : "bg-muted/50 opacity-70"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">
                      {p.first_name} {p.last_name}
                    </span>
                    {p.position && (
                      <span className="text-xs text-muted-foreground">({p.position})</span>
                    )}
                    <Badge variant={p.is_active ? "default" : "secondary"} className="text-xs">
                      {p.is_active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                    {p.email && <span>{p.email}</span>}
                    {p.phone && <span>{p.phone}</span>}
                    <span className="font-medium text-foreground">
                      Limit: {p.max_rental_value > 0 ? formatCurrency(p.max_rental_value) : "Unbegrenzt"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={p.is_active}
                    onCheckedChange={(v) => toggleActive(p.id, v)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(p)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) { setDialogOpen(false); resetForm(); } else setDialogOpen(true); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Person bearbeiten" : "Autorisierte Person hinzufügen"}</DialogTitle>
            <DialogDescription>
              Diese Person wird berechtigt, Mietgegenstände in deinem Namen anzumieten und abzuholen.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Vorname *</label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Max" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Nachname *</label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Mustermann" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">E-Mail</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="max@firma.de" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Telefon</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0151 123 456" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Position</label>
                <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Bauleiter" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Maximaler Mietwert (€)</label>
              <Input
                type="number"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                placeholder="0 = Unbegrenzt"
                min="0"
                step="100"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximaler Gesamtwert der Mietgegenstände, die diese Person anmieten darf. 0 = kein Limit.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Bemerkungen</label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Abbrechen</Button>
            <Button onClick={handleSave} disabled={saving || !firstName || !lastName}>
              {saving ? "Wird gespeichert..." : editingId ? "Aktualisieren" : "Hinzufügen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Person entfernen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Person wird dauerhaft aus der Liste der autorisierten Personen entfernt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Entfernen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
