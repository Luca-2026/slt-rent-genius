import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Mail, RefreshCw, Send, Users } from "lucide-react";

interface AuthorizedPerson {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  max_rental_value: number;
  is_active: boolean;
  user_id: string | null;
  invited_at: string | null;
}

interface Props {
  profileId: string;
  companyName: string;
}

export function AdminAuthorizedPersonsTab({ profileId, companyName }: Props) {
  const { toast } = useToast();
  const [persons, setPersons] = useState<AuthorizedPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitingId, setInvitingId] = useState<string | null>(null);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(val);

  const fetchPersons = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("b2b_authorized_persons")
      .select("*")
      .eq("b2b_profile_id", profileId)
      .order("created_at", { ascending: true });
    setPersons((data as AuthorizedPerson[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPersons();
  }, [profileId]);

  const handleInvite = async (person: AuthorizedPerson) => {
    if (!person.email) {
      toast({ title: "Keine E-Mail hinterlegt", description: "Diese Person hat keine E-Mail-Adresse.", variant: "destructive" });
      return;
    }
    setInvitingId(person.id);
    try {
      const { data, error } = await supabase.functions.invoke("invite-authorized-person", {
        body: {
          person_id: person.id,
          email: person.email,
          first_name: person.first_name,
          last_name: person.last_name,
          company_name: companyName,
          b2b_profile_id: profileId,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Einladung gesendet", description: `${person.first_name} ${person.last_name} wurde eingeladen.` });
      fetchPersons();
    } catch (err: any) {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    } finally {
      setInvitingId(null);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("b2b_authorized_persons").update({ is_active: active }).eq("id", id);
    fetchPersons();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (persons.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">Keine autorisierten Personen hinterlegt.</p>
        <p className="text-xs mt-1">Der Kunde kann Mitarbeiter über sein Portal hinzufügen.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Kontakt</TableHead>
            <TableHead>Position</TableHead>
            <TableHead className="text-right">Wertlimit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {persons.map((p) => (
            <TableRow key={p.id} className={!p.is_active ? "opacity-50" : ""}>
              <TableCell>
                <p className="text-sm font-medium">{p.first_name} {p.last_name}</p>
              </TableCell>
              <TableCell className="text-xs">
                {p.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" />{p.email}</div>}
                {p.phone && <div>{p.phone}</div>}
              </TableCell>
              <TableCell className="text-xs">{p.position || "–"}</TableCell>
              <TableCell className="text-right text-sm">
                {p.max_rental_value > 0 ? formatCurrency(p.max_rental_value) : "Unbegrenzt"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={p.is_active}
                    onCheckedChange={(v) => toggleActive(p.id, v)}
                  />
                  {p.user_id ? (
                    <Badge variant="default" className="text-[10px]">Konto aktiv</Badge>
                  ) : p.invited_at ? (
                    <Badge variant="secondary" className="text-[10px]">Eingeladen</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">Nicht eingeladen</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {p.email && !p.user_id && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={invitingId === p.id}
                    onClick={() => handleInvite(p)}
                  >
                    <Send className="h-3.5 w-3.5 mr-1" />
                    {invitingId === p.id ? "Wird gesendet..." : p.invited_at ? "Erneut einladen" : "Einladen"}
                  </Button>
                )}
                {p.user_id && (
                  <Badge variant="default" className="text-[10px] bg-primary/10 text-primary">
                    ✓ Zugang eingerichtet
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
