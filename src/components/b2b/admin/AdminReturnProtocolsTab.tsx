import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { openInvoiceInNewWindow } from "@/utils/invoiceViewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Eye, RefreshCw, ShieldCheck, Mail, MailX } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface ReturnProtocol {
  id: string;
  return_protocol_number: string;
  reservation_id: string | null;
  b2b_profile_id: string;
  status: string;
  overall_condition: string;
  cleaning_required: boolean;
  all_items_returned: boolean;
  signed_at: string | null;
  email_sent: boolean;
  file_url: string | null;
  notes: string | null;
  staff_name: string | null;
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

export function AdminReturnProtocolsTab({ profiles, onRefresh }: Props) {
  const [protocols, setProtocols] = useState<ReturnProtocol[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProtocols = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("b2b_return_protocols")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProtocols(data as ReturnProtocol[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchProtocols();
  }, []);

  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy, HH:mm", { locale: de });
  const getProfile = (id: string) => profiles.find((p) => p.id === id);

  const conditionBadge = (condition: string) => {
    switch (condition) {
      case "good":
        return <Badge className="bg-green-100 text-green-800 border-green-300">Gut</Badge>;
      case "minor_damage":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Leichte Mängel</Badge>;
      case "major_damage":
        return <Badge className="bg-red-100 text-red-800 border-red-300">Erhebliche Schäden</Badge>;
      default:
        return <Badge variant="outline">{condition}</Badge>;
    }
  };

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
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ClipboardCheck className="h-5 w-5 shrink-0" />
            Rückgabeprotokolle ({protocols.length})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={fetchProtocols} className="self-start h-10 sm:h-9">
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Aktualisieren
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {protocols.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Noch keine Rückgabeprotokolle erstellt.
          </p>
        ) : (
          <div className="space-y-3">
            {protocols.map((rp) => {
              const profile = getProfile(rp.b2b_profile_id);
              return (
                <Card key={rp.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{rp.return_protocol_number}</span>
                          {statusBadge(rp.status)}
                          {conditionBadge(rp.overall_condition)}
                          {!rp.all_items_returned && (
                            <Badge variant="outline" className="text-red-600 border-red-300 text-xs">
                              Fehlende Teile
                            </Badge>
                          )}
                          {rp.cleaning_required && (
                            <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">
                              Reinigung nötig
                            </Badge>
                          )}
                          {rp.email_sent ? (
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
                        {rp.staff_name && (
                          <p className="text-xs text-muted-foreground">
                            Mitarbeiter: {rp.staff_name}
                          </p>
                        )}
                        {rp.signed_at && (
                          <p className="text-xs text-muted-foreground">
                            Unterschrieben: {formatDate(rp.signed_at)}
                          </p>
                        )}
                        {rp.notes && (
                          <p className="text-xs text-muted-foreground italic">
                            {rp.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {rp.file_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openInvoiceInNewWindow(rp.file_url!)}
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
