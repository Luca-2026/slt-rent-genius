import { useEffect, useState } from "react";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { openInvoiceInNewWindow } from "@/utils/invoiceViewer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ClipboardCheck, Calendar, RefreshCw, ExternalLink, CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface DeliveryNote {
  id: string;
  delivery_note_number: string;
  status: string;
  file_url: string | null;
  file_name: string | null;
  signed_at: string | null;
  created_at: string;
  notes: string | null;
  offer_id: string | null;
}

export default function B2BDeliveryNotes() {
  const { user } = useAuth();
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveryNotes = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("b2b_delivery_notes")
      .select("id, delivery_note_number, status, file_url, file_name, signed_at, created_at, notes, offer_id")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDeliveryNotes(data as DeliveryNote[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchDeliveryNotes();
  }, [user]);

  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });

  return (
    <B2BPortalLayout title="Übergabeprotokolle" subtitle={`${deliveryNotes.length} Übergabeprotokolle`}>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ClipboardCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{deliveryNotes.length}</p>
              <p className="text-xs text-muted-foreground">Gesamt</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {deliveryNotes.filter((d) => d.status === "signed").length}
              </p>
              <p className="text-xs text-muted-foreground">Unterschrieben</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-end mb-4">
        <Button variant="outline" size="sm" onClick={fetchDeliveryNotes} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Aktualisieren
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : deliveryNotes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="font-semibold text-lg mb-1">Keine Übergabeprotokolle</h3>
            <p className="text-sm text-muted-foreground">
              Du hast noch keine Übergabeprotokolle erhalten.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {deliveryNotes.map((dn) => (
              <Card key={dn.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{dn.delivery_note_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {dn.signed_at ? formatDate(dn.signed_at) : formatDate(dn.created_at)}
                      </p>
                    </div>
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Unterschrieben
                    </Badge>
                  </div>
                  {dn.file_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => openInvoiceInNewWindow(dn.file_url!, dn.delivery_note_number)}
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Übergabeprotokoll ansehen
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop table */}
          <Card className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Protokoll-Nr.</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Ansehen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryNotes.map((dn) => (
                  <TableRow key={dn.id}>
                    <TableCell className="font-medium">{dn.delivery_note_number}</TableCell>
                    <TableCell>
                      {dn.signed_at ? formatDate(dn.signed_at) : formatDate(dn.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="flex items-center gap-1 w-fit">
                        <CheckCircle2 className="h-3 w-3" />
                        Unterschrieben
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {dn.file_url ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openInvoiceInNewWindow(dn.file_url!, dn.delivery_note_number)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">–</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </B2BPortalLayout>
  );
}
