import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { openInvoiceInNewWindow } from "@/utils/invoiceViewer";
import { generateBlankDeliveryNotePdf, type DeviceConditionData } from "@/utils/deliveryNoteBlankPdf";
import { DeviceConditionDialog } from "./DeviceConditionDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Eye, RefreshCw, ShieldCheck, Mail, MailX, Send, Trash2, Download, FileSignature } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

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
  known_defects: string | null;
  additional_defects: string | null;
  created_at: string;
}

interface DeliveryNoteItem {
  product_name: string;
  quantity: number;
  description: string | null;
  serial_number: string | null;
  condition_notes: string | null;
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
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"download" | "send">("download");
  const [dialogDn, setDialogDn] = useState<DeliveryNote | null>(null);
  const [dialogItems, setDialogItems] = useState<DeliveryNoteItem[]>([]);
  const [dialogLoading, setDialogLoading] = useState(false);

  const handleDelete = async (dn: DeliveryNote) => {
    if (!confirm(`Übergabeprotokoll ${dn.delivery_note_number} wirklich löschen?`)) return;
    setDeletingId(dn.id);
    try {
      await supabase.from("b2b_delivery_note_items").delete().eq("delivery_note_id", dn.id);
      await supabase.from("b2b_return_protocols").update({ delivery_note_id: null }).eq("delivery_note_id", dn.id);
      const { error } = await supabase.from("b2b_delivery_notes").delete().eq("id", dn.id);
      if (error) throw error;
      toast({ title: "Übergabeprotokoll gelöscht" });
      fetchDeliveryNotes();
    } catch (err: any) {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const fetchDeliveryNotes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("b2b_delivery_notes")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setDeliveryNotes(data as DeliveryNote[]);
    setLoading(false);
  };

  const sendEmail = async (dnId: string) => {
    setSendingId(dnId);
    try {
      const { data, error } = await supabase.functions.invoke("resend-protocol-email", {
        body: { type: "delivery_note", id: dnId },
      });
      if (error) throw error;
      toast({ title: "E-Mail versendet", description: `Übergabeprotokoll wurde an ${data.recipient} gesendet.` });
      fetchDeliveryNotes();
    } catch (err: any) {
      toast({ title: "Fehler", description: err.message || "E-Mail konnte nicht gesendet werden.", variant: "destructive" });
    } finally {
      setSendingId(null);
    }
  };

  const fetchItemsForNote = async (dnId: string): Promise<DeliveryNoteItem[]> => {
    const { data } = await supabase
      .from("b2b_delivery_note_items")
      .select("*")
      .eq("delivery_note_id", dnId);
    return (data || []) as DeliveryNoteItem[];
  };

  const openConditionDialog = async (dn: DeliveryNote, mode: "download" | "send") => {
    const items = await fetchItemsForNote(dn.id);
    setDialogDn(dn);
    setDialogItems(items);
    setDialogMode(mode);
    setDialogOpen(true);
  };

  const buildPdfData = (dn: DeliveryNote, items: DeliveryNoteItem[], condition: DeviceConditionData) => {
    const profile = profiles.find((p) => p.id === dn.b2b_profile_id);
    return {
      delivery_note_number: dn.delivery_note_number,
      created_at: dn.created_at,
      notes: dn.notes,
      known_defects: dn.known_defects,
      additional_defects: dn.additional_defects,
      items: items.map((i) => ({
        product_name: i.product_name,
        quantity: i.quantity,
        description: i.description,
        serial_number: i.serial_number,
        condition_notes: i.condition_notes,
      })),
      company_name: profile?.company_name || "–",
      contact_name: profile ? `${profile.contact_first_name} ${profile.contact_last_name}` : "–",
      deviceCondition: condition,
    };
  };

  const handleDialogConfirm = async (condition: DeviceConditionData) => {
    if (!dialogDn) return;
    setDialogLoading(true);

    try {
      const pdfBytes = await generateBlankDeliveryNotePdf(
        buildPdfData(dialogDn, dialogItems, condition)
      );

      if (dialogMode === "download") {
        const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${dialogDn.delivery_note_number}-blanko.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: "PDF heruntergeladen" });
      } else {
        // Upload + send email + set status to pending_customer_signature
        const fileName = `${dialogDn.delivery_note_number}-blanko.pdf`;
        const storagePath = `${dialogDn.b2b_profile_id}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("b2b-documents")
          .upload(storagePath, pdfBytes, {
            contentType: "application/pdf",
            upsert: true,
          });
        if (uploadError) throw uploadError;

        // Set status to pending_customer_signature
        await supabase
          .from("b2b_delivery_notes")
          .update({ status: "pending_customer_signature" })
          .eq("id", dialogDn.id);

        const { data, error } = await supabase.functions.invoke("resend-protocol-email", {
          body: {
            type: "delivery_note_signature_request",
            id: dialogDn.id,
            pdf_storage_path: storagePath,
          },
        });
        if (error) throw error;
        toast({
          title: "Unterschriftsanfrage versendet",
          description: `E-Mail an ${data.recipient} gesendet. Status auf 'Unterschrift ausstehend' gesetzt.`,
        });
      }

      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    } finally {
      setDialogLoading(false);
    }
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
      case "pending_customer_signature":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Unterschrift ausstehend</Badge>;
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
    <>
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <ClipboardCheck className="h-5 w-5 shrink-0" />
              Übergabeprotokolle ({deliveryNotes.length})
            </CardTitle>
            <Button variant="outline" size="sm" onClick={fetchDeliveryNotes} className="self-start h-10 sm:h-9">
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Aktualisieren
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {deliveryNotes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Noch keine Übergabeprotokolle erstellt.
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
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 sm:h-9 flex-1 sm:flex-none"
                            onClick={() => openConditionDialog(dn, "download")}
                          >
                            <Download className="h-4 w-4 mr-1.5" />
                            Blanko PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 sm:h-9 flex-1 sm:flex-none text-amber-700 border-amber-300 hover:bg-amber-50"
                            onClick={() => openConditionDialog(dn, "send")}
                          >
                            <FileSignature className="h-4 w-4 mr-1.5" />
                            Zur Unterschrift
                          </Button>
                          {dn.file_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-10 sm:h-9 flex-1 sm:flex-none"
                              onClick={() => openInvoiceInNewWindow(dn.file_url!)}
                            >
                              <Eye className="h-4 w-4 mr-1.5" />
                              Ansehen
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 sm:h-9 flex-1 sm:flex-none"
                            onClick={() => sendEmail(dn.id)}
                            disabled={sendingId === dn.id}
                          >
                            <Send className="h-4 w-4 mr-1.5" />
                            {sendingId === dn.id ? "Sende..." : dn.email_sent ? "Erneut senden" : "Versenden"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-10 sm:h-9"
                            onClick={() => handleDelete(dn)}
                            disabled={deletingId === dn.id}
                          >
                            {deletingId === dn.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
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

      {/* Device condition dialog */}
      {dialogDn && (
        <DeviceConditionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          deliveryNoteNumber={dialogDn.delivery_note_number}
          items={dialogItems}
          mode={dialogMode}
          onConfirm={handleDialogConfirm}
          loading={dialogLoading}
        />
      )}
    </>
  );
}
