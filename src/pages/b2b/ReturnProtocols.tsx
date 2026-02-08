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
  Undo2, Calendar, RefreshCw, ExternalLink, CheckCircle2, AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface ReturnProtocol {
  id: string;
  return_protocol_number: string;
  status: string;
  file_url: string | null;
  file_name: string | null;
  signed_at: string | null;
  created_at: string;
  notes: string | null;
  overall_condition: string;
  all_items_returned: boolean;
  damage_description: string | null;
}

export default function B2BReturnProtocols() {
  const { user } = useAuth();
  const [protocols, setProtocols] = useState<ReturnProtocol[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProtocols = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("b2b_return_protocols")
      .select("id, return_protocol_number, status, file_url, file_name, signed_at, created_at, notes, overall_condition, all_items_returned, damage_description")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProtocols(data as ReturnProtocol[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchProtocols();
  }, [user]);

  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });

  const conditionBadge = (condition: string) => {
    switch (condition) {
      case "gut":
        return <Badge className="bg-green-100 text-green-800 border-green-300">Gut</Badge>;
      case "beschaedigt":
        return <Badge className="bg-red-100 text-red-800 border-red-300">Beschädigt</Badge>;
      case "maengel":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Mängel</Badge>;
      default:
        return <Badge variant="outline">{condition}</Badge>;
    }
  };

  return (
    <B2BPortalLayout title="Rückgabeprotokolle" subtitle={`${protocols.length} Rückgabeprotokolle`}>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Undo2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{protocols.length}</p>
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
                {protocols.filter((p) => p.status === "signed").length}
              </p>
              <p className="text-xs text-muted-foreground">Unterschrieben</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-end mb-4">
        <Button variant="outline" size="sm" onClick={fetchProtocols} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Aktualisieren
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : protocols.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Undo2 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="font-semibold text-lg mb-1">Keine Rückgabeprotokolle</h3>
            <p className="text-sm text-muted-foreground">
              Du hast noch keine Rückgabeprotokolle erhalten.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {protocols.map((rp) => (
              <Card key={rp.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{rp.return_protocol_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {rp.signed_at ? formatDate(rp.signed_at) : formatDate(rp.created_at)}
                      </p>
                    </div>
                    {conditionBadge(rp.overall_condition)}
                  </div>
                  {!rp.all_items_returned && (
                    <div className="flex items-center gap-1 text-yellow-600 text-xs">
                      <AlertTriangle className="h-3 w-3" />
                      Nicht alle Artikel zurückgegeben
                    </div>
                  )}
                  {rp.damage_description && (
                    <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                      {rp.damage_description}
                    </p>
                  )}
                  {rp.file_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => openInvoiceInNewWindow(rp.file_url!, rp.return_protocol_number)}
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Rückgabeprotokoll ansehen
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
                  <TableHead>Zustand</TableHead>
                  <TableHead>Vollständig</TableHead>
                  <TableHead className="text-center">Ansehen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {protocols.map((rp) => (
                  <TableRow key={rp.id}>
                    <TableCell className="font-medium">{rp.return_protocol_number}</TableCell>
                    <TableCell>
                      {rp.signed_at ? formatDate(rp.signed_at) : formatDate(rp.created_at)}
                    </TableCell>
                    <TableCell>{conditionBadge(rp.overall_condition)}</TableCell>
                    <TableCell>
                      {rp.all_items_returned ? (
                        <Badge className="bg-green-100 text-green-800 border-green-300">Ja</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Unvollständig</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {rp.file_url ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openInvoiceInNewWindow(rp.file_url!, rp.return_protocol_number)}
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
