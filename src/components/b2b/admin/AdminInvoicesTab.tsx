import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, Receipt, RefreshCw, Plus, Minus, FileX, Trash2, Download, Send, Mail, CheckCircle } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  gross_amount: number;
  net_amount: number;
  vat_amount: number;
  is_reverse_charge: boolean;
  status: string;
  file_url: string | null;
  email_sent: boolean;
  customer_company: string | null;
  b2b_profile_id: string;
  reservation_id: string | null;
  created_at: string;
  notes: string | null;
}

interface Props {
  invoices: Invoice[];
  onStatusChange: (invoiceId: string, status: string) => void;
  onViewInvoice: (fileUrl: string, invoiceNumber: string) => void;
  onDelete: (invoiceId: string) => void;
  onRefresh: () => void;
}

interface CorrectionItem {
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export function AdminInvoicesTab({
  invoices,
  onStatusChange,
  onViewInvoice,
  onDelete,
  onRefresh,
}: Props) {
  const { toast } = useToast();
  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false);
  const [correctionType, setCorrectionType] = useState<"correction" | "credit">("correction");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [correctionItems, setCorrectionItems] = useState<CorrectionItem[]>([
    { product_name: "", description: "", quantity: 1, unit_price: 0 },
  ]);
  const [correctionNotes, setCorrectionNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [deleteConfirmInvoice, setDeleteConfirmInvoice] = useState<Invoice | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportMonth, setExportMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const [sendEmailConfirmInvoice, setSendEmailConfirmInvoice] = useState<Invoice | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

  const sendInvoiceEmail = async (invoice: Invoice) => {
    setSendingEmailId(invoice.id);
    setSendEmailConfirmInvoice(null);
    try {
      const { data, error } = await supabase.functions.invoke("send-invoice-email", {
        body: { invoice_id: invoice.id },
      });
      if (error) throw error;
      toast({
        title: "Rechnung versendet!",
        description: `${invoice.invoice_number} wurde an ${data.recipient} gesendet (CC: debitoren@slt-tg.de, krefeld@slt-rental.de).`,
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Fehler beim Versenden",
        description: error.message || "E-Mail konnte nicht gesendet werden.",
        variant: "destructive",
      });
    } finally {
      setSendingEmailId(null);
    }
  };
  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });
  const formatCurrency = (n: number) =>
    n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  const statusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-primary/10 text-primary border-primary/20";
      case "overdue": return "bg-destructive/10 text-destructive border-destructive/20";
      case "cancelled": return "bg-muted text-muted-foreground";
      default: return "bg-accent/10 text-accent border-accent/20";
    }
  };

  const openCorrectionDialog = (invoice: Invoice, type: "correction" | "credit") => {
    setSelectedInvoice(invoice);
    setCorrectionType(type);
    if (type === "credit") {
      // Pre-fill with negative full amount as credit
      setCorrectionItems([{
        product_name: `Gutschrift zu ${invoice.invoice_number}`,
        description: `Vollständige Gutschrift der Rechnung ${invoice.invoice_number}`,
        quantity: 1,
        unit_price: -invoice.net_amount,
      }]);
    } else {
      setCorrectionItems([{ product_name: "", description: "", quantity: 1, unit_price: 0 }]);
    }
    setCorrectionNotes("");
    setCorrectionDialogOpen(true);
  };

  const addCorrectionItem = () => {
    setCorrectionItems([...correctionItems, { product_name: "", description: "", quantity: 1, unit_price: 0 }]);
  };

  const removeCorrectionItem = (index: number) => {
    if (correctionItems.length > 1) {
      setCorrectionItems(correctionItems.filter((_, i) => i !== index));
    }
  };

  const updateCorrectionItem = (index: number, field: keyof CorrectionItem, value: string | number) => {
    const updated = [...correctionItems];
    (updated[index] as any)[field] = value;
    setCorrectionItems(updated);
  };

  const generateCorrection = async () => {
    if (!selectedInvoice) return;
    
    const validItems = correctionItems.filter((item) => item.product_name.trim() !== "");
    if (validItems.length === 0) {
      toast({ title: "Fehler", description: "Mindestens eine Position ist erforderlich.", variant: "destructive" });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-invoice", {
        body: {
          reservation_id: selectedInvoice.reservation_id,
          custom_items: validItems.map((item) => ({
            product_name: item.product_name,
            description: item.description || undefined,
            quantity: item.quantity,
            unit_price: Math.abs(item.unit_price),
            discount_percent: 0,
          })),
          delivery_cost: 0,
          notes: [
            correctionType === "correction"
              ? `RECHNUNGSKORREKTUR zu Rechnung ${selectedInvoice.invoice_number}`
              : `GUTSCHRIFT zu Rechnung ${selectedInvoice.invoice_number}`,
            correctionNotes,
          ].filter(Boolean).join("\n"),
          is_correction: true,
          original_invoice_number: selectedInvoice.invoice_number,
        },
      });

      if (error) throw error;

      toast({
        title: correctionType === "correction" ? "Rechnungskorrektur erstellt!" : "Gutschrift erstellt!",
        description: `${data.invoice?.invoice_number} wurde erfolgreich generiert.`,
      });

      // If credit note, mark original invoice as cancelled
      if (correctionType === "credit") {
        await onStatusChange(selectedInvoice.id, "cancelled");
      }

      setCorrectionDialogOpen(false);
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Dokument konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const correctionTotal = correctionItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  // Generate month options (last 24 months)
  const monthOptions = Array.from({ length: 24 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      value: format(d, "yyyy-MM"),
      label: format(d, "MMMM yyyy", { locale: de }),
    };
  });

  const exportCsv = async () => {
    setExporting(true);
    try {
      const [year, month] = exportMonth.split("-").map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const filtered = invoices.filter((inv) => {
        const d = new Date(inv.invoice_date);
        return d >= startDate && d <= endDate;
      });

      if (filtered.length === 0) {
        toast({ title: "Keine Daten", description: "Für den gewählten Monat gibt es keine Rechnungen.", variant: "destructive" });
        setExporting(false);
        return;
      }

      const profileIds = [...new Set(filtered.map((i) => i.b2b_profile_id))];
      const { data: profiles } = await supabase
        .from("b2b_profiles")
        .select("id, tax_id")
        .in("id", profileIds);

      const taxMap: Record<string, string> = {};
      profiles?.forEach((p: any) => { taxMap[p.id] = p.tax_id || ""; });

      const header = "Rechnungsnummer;Kunde;USt-IdNr;Rechnungsdatum;Fälligkeitsdatum;Netto;MwSt;Brutto;Reverse-Charge;Status";
      const rows = filtered.map((inv) => {
        const taxId = (inv as any).vat_id_at_creation || taxMap[inv.b2b_profile_id] || "";
        return [
          inv.invoice_number,
          `"${(inv.customer_company || "").replace(/"/g, '""')}"`,
          taxId,
          inv.invoice_date,
          inv.due_date || "",
          inv.net_amount.toFixed(2).replace(".", ","),
          inv.vat_amount.toFixed(2).replace(".", ","),
          inv.gross_amount.toFixed(2).replace(".", ","),
          inv.is_reverse_charge ? "Ja" : "Nein",
          inv.status === "paid" ? "Bezahlt" : inv.status === "overdue" ? "Überfällig" : inv.status === "cancelled" ? "Storniert" : "Offen",
        ].join(";");
      });

      const monthLabel = format(startDate, "yyyy-MM");
      const csv = "\uFEFF" + [header, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Rechnungen_${monthLabel}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: "CSV exportiert", description: `${filtered.length} Rechnungen für ${format(startDate, "MMMM yyyy", { locale: de })} exportiert.` });
    } catch (error: any) {
      toast({ title: "Fehler beim Export", description: error.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold">Alle Rechnungen</h2>
          <p className="text-sm text-muted-foreground">Rechnungsstatus verwalten, Korrekturen und Gutschriften erstellen</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={exportMonth} onValueChange={setExportMonth}>
            <SelectTrigger className="w-full sm:w-[180px] h-10 sm:h-9 text-sm">
              <SelectValue placeholder="Monat wählen" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            disabled={exporting || invoices.length === 0}
            className="h-10 sm:h-9"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            {exporting ? "Exportiere..." : "CSV Export"}
          </Button>
          <Button variant="outline" size="sm" onClick={onRefresh} className="h-10 sm:h-9">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Aktualisieren
          </Button>
        </div>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Receipt className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-medium text-foreground">Noch keine Rechnungen</p>
            <p className="text-sm text-muted-foreground mt-1">
              Rechnungen werden aus Anfragen erstellt.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden md:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rechnungsnr.</TableHead>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Fällig</TableHead>
                    <TableHead className="text-right">Brutto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{inv.invoice_number}</p>
                          {inv.is_reverse_charge && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">RC</Badge>
                          )}
                          {inv.notes?.includes("RECHNUNGSKORREKTUR") && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-600 border-amber-300">Korrektur</Badge>
                          )}
                          {inv.notes?.includes("GUTSCHRIFT") && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-red-600 border-red-300">Gutschrift</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{inv.customer_company || "–"}</TableCell>
                      <TableCell className="text-sm">{formatDate(inv.invoice_date)}</TableCell>
                      <TableCell className="text-sm">
                        {inv.due_date ? formatDate(inv.due_date) : "–"}
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm">
                        {formatCurrency(inv.gross_amount)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={inv.status}
                          onValueChange={(v) => onStatusChange(inv.id, v)}
                        >
                          <SelectTrigger className={`w-[130px] h-8 text-xs border ${statusColor(inv.status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Offen</SelectItem>
                            <SelectItem value="paid">Bezahlt</SelectItem>
                            <SelectItem value="overdue">Überfällig</SelectItem>
                            <SelectItem value="cancelled">Storniert</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {inv.file_url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onViewInvoice(inv.file_url!, inv.invoice_number)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              <span className="text-xs">PDF</span>
                            </Button>
                          )}
                          {inv.file_url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSendEmailConfirmInvoice(inv)}
                              disabled={sendingEmailId === inv.id}
                              title={inv.email_sent ? "Erneut per E-Mail senden" : "Per E-Mail senden"}
                              className={inv.email_sent ? "text-primary" : "text-amber-600"}
                            >
                              {sendingEmailId === inv.id ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : inv.email_sent ? (
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              ) : (
                                <Send className="h-3.5 w-3.5 mr-1" />
                              )}
                              <span className="hidden lg:inline text-xs">{inv.email_sent ? "Gesendet" : "Senden"}</span>
                            </Button>
                          )
                          {inv.status !== "cancelled" && !inv.notes?.includes("GUTSCHRIFT") && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openCorrectionDialog(inv, "correction")}
                                title="Rechnungskorrektur erstellen"
                              >
                                <FileX className="h-3.5 w-3.5 mr-1" />
                                <span className="hidden lg:inline text-xs">Korrektur</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600"
                                onClick={() => openCorrectionDialog(inv, "credit")}
                                title="Gutschrift erstellen"
                              >
                                <Minus className="h-3.5 w-3.5 mr-1" />
                                <span className="hidden lg:inline text-xs">Gutschrift</span>
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => setDeleteConfirmInvoice(inv)}
                            title="Rechnung löschen"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Mobile card layout */}
          <div className="md:hidden space-y-3">
            {invoices.map((inv) => (
              <Card key={inv.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{inv.invoice_number}</span>
                        {inv.is_reverse_charge && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">RC</Badge>
                        )}
                        {inv.notes?.includes("RECHNUNGSKORREKTUR") && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-600 border-amber-300">Korrektur</Badge>
                        )}
                        {inv.notes?.includes("GUTSCHRIFT") && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-red-600 border-red-300">Gutschrift</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{inv.customer_company || "–"}</p>
                    </div>
                    <p className="font-semibold text-sm whitespace-nowrap">{formatCurrency(inv.gross_amount)}</p>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>Datum: {formatDate(inv.invoice_date)}</span>
                    <span>Fällig: {inv.due_date ? formatDate(inv.due_date) : "–"}</span>
                  </div>

                  <Select
                    value={inv.status}
                    onValueChange={(v) => onStatusChange(inv.id, v)}
                  >
                    <SelectTrigger className={`w-full h-10 text-sm border ${statusColor(inv.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Offen</SelectItem>
                      <SelectItem value="paid">Bezahlt</SelectItem>
                      <SelectItem value="overdue">Überfällig</SelectItem>
                      <SelectItem value="cancelled">Storniert</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex flex-wrap gap-2">
                    {inv.file_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewInvoice(inv.file_url!, inv.invoice_number)}
                        className="h-10"
                      >
                        <Eye className="h-4 w-4 mr-1.5" />
                        PDF
                      </Button>
                    )}
                    {inv.status !== "cancelled" && !inv.notes?.includes("GUTSCHRIFT") && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openCorrectionDialog(inv, "correction")}
                          className="h-10"
                        >
                          <FileX className="h-3.5 w-3.5 mr-1.5" />
                          Korrektur
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 h-10"
                          onClick={() => openCorrectionDialog(inv, "credit")}
                        >
                          <Minus className="h-3.5 w-3.5 mr-1.5" />
                          Gutschrift
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive h-10"
                      onClick={() => setDeleteConfirmInvoice(inv)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Correction / Credit Note Dialog */}
      <Dialog open={correctionDialogOpen} onOpenChange={setCorrectionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {correctionType === "correction" ? "Rechnungskorrektur" : "Gutschrift"} erstellen
            </DialogTitle>
            <DialogDescription>
              {correctionType === "correction"
                ? `Korrekturrechnung zur Originalrechnung ${selectedInvoice?.invoice_number} erstellen.`
                : `Gutschrift zur Originalrechnung ${selectedInvoice?.invoice_number} erstellen. Die Originalrechnung wird automatisch storniert.`}
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              {/* Original Invoice Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Originalrechnung: {selectedInvoice.invoice_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedInvoice.customer_company} · {formatDate(selectedInvoice.invoice_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(selectedInvoice.gross_amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedInvoice.is_reverse_charge ? "Reverse-Charge" : "inkl. 19% USt."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Correction Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Positionen</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCorrectionItem}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Position
                  </Button>
                </div>

                {correctionItems.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label className="text-xs">Bezeichnung</Label>
                          <Input
                            value={item.product_name}
                            onChange={(e) => updateCorrectionItem(index, "product_name", e.target.value)}
                            placeholder="z.B. Korrektur Mietdauer"
                            className="h-8 text-sm"
                          />
                        </div>
                        {correctionItems.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="mt-5 text-red-500"
                            onClick={() => removeCorrectionItem(index)}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs">Beschreibung</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateCorrectionItem(index, "description", e.target.value)}
                          placeholder="Optionale Beschreibung"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Menge</Label>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => updateCorrectionItem(index, "quantity", parseInt(e.target.value) || 1)}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">
                            {correctionType === "credit" ? "Betrag (negativ)" : "Einzelpreis (€)"}
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateCorrectionItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Notes */}
              <div>
                <Label className="text-xs">Anmerkungen</Label>
                <Textarea
                  value={correctionNotes}
                  onChange={(e) => setCorrectionNotes(e.target.value)}
                  placeholder={correctionType === "correction"
                    ? "Grund der Korrektur..."
                    : "Grund der Gutschrift..."}
                  rows={2}
                />
              </div>

              {/* Total */}
              <Card className="border-primary/20">
                <CardContent className="p-3 flex justify-between items-center">
                  <span className="font-medium text-sm">Nettobetrag (Korrektur):</span>
                  <span className="font-semibold text-lg">
                    {formatCurrency(Math.abs(correctionTotal))}
                  </span>
                </CardContent>
              </Card>

              {correctionType === "credit" && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                  <p className="text-sm text-destructive font-medium">
                    ⚠ Die Originalrechnung {selectedInvoice.invoice_number} wird bei Erstellung der Gutschrift automatisch storniert.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
                <Button variant="outline" onClick={() => setCorrectionDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button
                  onClick={generateCorrection}
                  disabled={generating || correctionItems.every((i) => !i.product_name.trim())}
                  className={correctionType === "credit" ? "bg-destructive hover:bg-destructive/90" : "bg-accent text-accent-foreground hover:bg-cta-orange-hover"}
                >
                  {generating ? (
                    <><RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />Wird erstellt...</>
                  ) : correctionType === "correction" ? (
                    <><FileX className="h-4 w-4 mr-1.5" />Korrektur erstellen</>
                  ) : (
                    <><Minus className="h-4 w-4 mr-1.5" />Gutschrift erstellen</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmInvoice} onOpenChange={(open) => !open && setDeleteConfirmInvoice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rechnung löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie die Rechnung <strong>{deleteConfirmInvoice?.invoice_number}</strong> unwiderruflich löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirmInvoice) {
                  onDelete(deleteConfirmInvoice.id);
                  setDeleteConfirmInvoice(null);
                }
              }}
            >
              Endgültig löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
