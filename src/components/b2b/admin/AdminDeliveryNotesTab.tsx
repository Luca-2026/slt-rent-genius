import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { openInvoiceInNewWindow } from "@/utils/invoiceViewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Eye, RefreshCw, ShieldCheck, Mail, MailX } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface DeliveryNote {
  id: string;
  delivery_note_number: string;
  offer_id: string | null;
  b2b_profile_id: string;
  status: string;
  signed_at: string | null;
  agb_accepted: boolean;
  agb_accepted_at: string | null;
  email_sent: boolean;
  file_url: string | null;
  notes: string | null;
  created_at: string;
}

interface B2BProfile {
  id: string;
  company_name: string;
  contact_first_name: string;
  contact_last_name: string;
}

interface Props {
  profiles: B2BProfile[];
  onRefresh: () => void;
}

export function AdminDeliveryNotesTab({ profiles, onRefresh }: Props) {
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveryNotes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("b2b_delivery_notes")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setDeliveryNotes(data as DeliveryNote[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchDeliveryNotes();
  }, []);

  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy, HH:mm", { locale: de });
  const getProfile = (id: string) => profiles.find((p) => p.id === id);

  const statusBadge = (status: string) => {
    switch (status) {
      case "signed":
        return <Badge className="bg-green-100 text-green-800 border-green-300">Unterschrieben</Badge>;
      case "draft":
        return <Badge variant="secondary">Entwurf</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          Lieferscheine ({deliveryNotes.length})
        </CardTitle>
        <Button variant="outline" size="sm" onClick={fetchDeliveryNotes}>
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Aktualisieren
        </Button>
      </CardHeader>
      <CardContent>
        {deliveryNotes.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Noch keine Lieferscheine erstellt.
          </p>
        ) : (
          <div className="space-y-3">
            {deliveryNotes.map((dn) => {
              const profile = getProfile(dn.b2b_profile_id);
              return (
                <Card key={dn.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{dn.delivery_note_number}</span>
                          {statusBadge(dn.status)}
                          {dn.agb_accepted && (
                            <Badge variant="outline" className="text-primary border-primary text-xs">
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              AGB akzeptiert
                            </Badge>
                          )}
                          {dn.email_sent ? (
                            <Badge variant="outline" className="text-green-700 border-green-300 text-xs">
                              <Mail className="h-3 w-3 mr-1" />
                              Versendet
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground text-xs">
                              <MailX className="h-3 w-3 mr-1" />
                              Nicht versendet
                            </Badge>
                          )}
                        </div>
                        {profile && (
                          <p className="text-sm text-muted-foreground">
                            {profile.company_name} · {profile.contact_first_name} {profile.contact_last_name}
                          </p>
                        )}
                        {dn.signed_at && (
                          <p className="text-xs text-muted-foreground">
                            Unterschrieben: {formatDate(dn.signed_at)}
                          </p>
                        )}
                        {dn.notes && (
                          <p className="text-xs text-muted-foreground italic">
                            {dn.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {dn.file_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openInvoiceInNewWindow(dn.file_url!)}
                          >
                            <Eye className="h-4 w-4 mr-1.5" />
                            Ansehen
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
