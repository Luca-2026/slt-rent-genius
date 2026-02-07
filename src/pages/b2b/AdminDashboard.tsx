import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { openInvoiceInNewWindow } from "@/utils/invoiceViewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Users, Receipt, Shield, CheckCircle2, Clock, XCircle,
  FileText, Search, RefreshCw, Building2, CreditCard,
  AlertCircle, Send, Eye, Filter, Plus,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface B2BProfile {
  id: string;
  company_name: string;
  legal_form: string | null;
  tax_id: string | null;
  vat_id_verified: boolean;
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  billing_email: string | null;
  status: string;
  credit_limit: number;
  used_credit: number;
  assigned_location: string | null;
  street: string;
  house_number: string | null;
  postal_code: string;
  city: string;
  country: string | null;
  created_at: string;
}

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
  created_at: string;
}

interface Reservation {
  id: string;
  product_name: string | null;
  product_id: string;
  location: string;
  start_date: string;
  end_date: string | null;
  quantity: number;
  status: string;
  original_price: number | null;
  discounted_price: number | null;
  b2b_profile_id: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<B2BProfile[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<B2BProfile | null>(null);
  const [vatDialogOpen, setVatDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/b2b/dashboard");
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    const [profilesRes, invoicesRes, reservationsRes] = await Promise.all([
      supabase.from("b2b_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("b2b_invoices").select("id, invoice_number, invoice_date, due_date, gross_amount, net_amount, vat_amount, is_reverse_charge, status, file_url, email_sent, customer_company, b2b_profile_id, created_at").order("created_at", { ascending: false }),
      supabase.from("b2b_reservations").select("*").order("created_at", { ascending: false }),
    ]);

    if (profilesRes.data) setProfiles(profilesRes.data as B2BProfile[]);
    if (invoicesRes.data) setInvoices(invoicesRes.data as Invoice[]);
    if (reservationsRes.data) setReservations(reservationsRes.data as Reservation[]);
    setLoading(false);
  };

  useEffect(() => {
    if (user && isAdmin) fetchData();
  }, [user, isAdmin]);

  const toggleVatVerification = async (profile: B2BProfile) => {
    const newStatus = !profile.vat_id_verified;
    const { error } = await supabase
      .from("b2b_profiles")
      .update({ vat_id_verified: newStatus } as any)
      .eq("id", profile.id);

    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: newStatus ? "VAT ID verifiziert" : "VAT ID entzogen",
        description: `${profile.company_name}: USt-IdNr. ${newStatus ? "freigegeben" : "zurückgesetzt"}.`,
      });
      fetchData();
    }
    setVatDialogOpen(false);
  };

  const updateInvoiceStatus = async (invoiceId: string, newStatus: string) => {
    const { error } = await supabase
      .from("b2b_invoices")
      .update({ status: newStatus })
      .eq("id", invoiceId);

    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status aktualisiert" });
      fetchData();
    }
  };

  const generateInvoice = async (reservation: Reservation) => {
    setGeneratingInvoice(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-invoice", {
        body: {
          reservation_id: reservation.id,
          delivery_cost: 0,
          payment_due_days: 14,
        },
      });

      if (error) throw error;

      toast({
        title: "Rechnung erstellt!",
        description: `Rechnung ${data.invoice?.invoice_number} wurde erfolgreich generiert.`,
      });
      setInvoiceDialogOpen(false);
      setSelectedReservation(null);
      fetchData();
    } catch (error: any) {
      console.error("Invoice generation error:", error);
      toast({
        title: "Fehler",
        description: error.message || "Rechnung konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });
  const formatCurrency = (n: number) => n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  if (authLoading || loading) {
    return (
      <B2BPortalLayout title="Admin-Dashboard" subtitle="Verwaltung">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </B2BPortalLayout>
    );
  }

  // Pending reservations (no invoice yet)
  const pendingReservations = reservations.filter(
    (r) => r.status === "pending" && !invoices.some((inv) => (inv as any).reservation_id === r.id)
  );

  const filteredProfiles = profiles.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.company_name.toLowerCase().includes(q) || p.contact_email.toLowerCase().includes(q);
  });

  return (
    <B2BPortalLayout title="Admin-Dashboard" subtitle="Verwaltung & Rechnungen">
      <Tabs defaultValue="reservations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reservations" className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            Anfragen ({pendingReservations.length})
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-1.5">
            <Receipt className="h-4 w-4" />
            Rechnungen ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            Kunden ({profiles.length})
          </TabsTrigger>
        </TabsList>

        {/* Reservations / Pending */}
        <TabsContent value="reservations">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Offene Anfragen → Rechnung erstellen</h2>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Aktualisieren
            </Button>
          </div>

          {pendingReservations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500/40 mb-3" />
                <p className="text-muted-foreground">Keine offenen Anfragen vorhanden.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingReservations.map((res) => {
                const profile = profiles.find((p) => p.id === res.b2b_profile_id);
                return (
                  <Card key={res.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{res.product_name || res.product_id}</p>
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              Ausstehend
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Kunde: <strong>{profile?.company_name || "Unbekannt"}</strong> · 
                            Standort: {res.location} · 
                            Von: {formatDate(res.start_date)}
                            {res.end_date ? ` bis ${formatDate(res.end_date)}` : ""} · 
                            Menge: {res.quantity}
                          </p>
                          {res.original_price != null && (
                            <p className="text-sm text-muted-foreground">
                              Preis: {formatCurrency(res.original_price)}
                              {res.discounted_price != null && res.discounted_price !== res.original_price && (
                                <> → <span className="text-accent font-medium">{formatCurrency(res.discounted_price)}</span></>
                              )}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                          onClick={() => {
                            setSelectedReservation(res);
                            setInvoiceDialogOpen(true);
                          }}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Rechnung erstellen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Invoices */}
        <TabsContent value="invoices">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Alle Rechnungen</h2>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Aktualisieren
            </Button>
          </div>

          {invoices.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">Noch keine Rechnungen erstellt.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rechnungsnr.</TableHead>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead className="text-right">Brutto</TableHead>
                    <TableHead>USt.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>E-Mail</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <p className="font-medium">{inv.invoice_number}</p>
                        {inv.is_reverse_charge && (
                          <Badge variant="outline" className="text-xs mt-1">RC</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{inv.customer_company || "–"}</TableCell>
                      <TableCell className="text-sm">{formatDate(inv.invoice_date)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(inv.gross_amount)}</TableCell>
                      <TableCell className="text-sm">
                        {inv.is_reverse_charge ? "RC" : formatCurrency(inv.vat_amount)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={inv.status}
                          onValueChange={(v) => updateInvoiceStatus(inv.id, v)}
                        >
                          <SelectTrigger className="w-[120px] h-8 text-xs">
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
                      <TableCell>
                        {inv.email_sent ? (
                          <Badge variant="outline" className="text-xs text-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Gesendet
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            Ausstehend
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {inv.file_url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Rechnung öffnen"
                              onClick={() => openInvoiceInNewWindow(inv.file_url!, inv.invoice_number)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Customers / VAT Management */}
        <TabsContent value="customers">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold">B2B-Kunden & USt-IdNr. Verwaltung</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Firma suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
              <Button variant="outline" size="sm" onClick={fetchData}>
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredProfiles.map((profile) => {
              const profileInvoices = invoices.filter((i) => i.b2b_profile_id === profile.id);
              return (
                <Card key={profile.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-4 w-4 text-primary" />
                          <p className="font-semibold">{profile.company_name}</p>
                          <Badge variant={profile.status === "approved" ? "default" : profile.status === "rejected" ? "destructive" : "secondary"}>
                            {profile.status === "approved" ? "Aktiv" : profile.status === "rejected" ? "Abgelehnt" : "Ausstehend"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {profile.contact_first_name} {profile.contact_last_name} · {profile.contact_email}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs">
                          <span className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            Limit: {formatCurrency(profile.credit_limit)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Receipt className="h-3 w-3" />
                            {profileInvoices.length} Rechnungen
                          </span>
                          {profile.tax_id && (
                            <span className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              USt-IdNr.: {profile.tax_id}
                              {profile.vat_id_verified ? (
                                <Badge variant="default" className="text-[10px] px-1 py-0 ml-1">✓ Verifiziert</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-1">Ungeprüft</Badge>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {profile.tax_id && (
                          <Button
                            size="sm"
                            variant={profile.vat_id_verified ? "outline" : "default"}
                            onClick={() => {
                              setSelectedProfile(profile);
                              setVatDialogOpen(true);
                            }}
                          >
                            <Shield className="h-3.5 w-3.5 mr-1" />
                            {profile.vat_id_verified ? "VAT entziehen" : "VAT verifizieren"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* VAT Verification Dialog */}
      <Dialog open={vatDialogOpen} onOpenChange={setVatDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>USt-IdNr. Verifizierung</DialogTitle>
            <DialogDescription>
              {selectedProfile?.vat_id_verified
                ? "Möchtest du die Verifizierung der USt-IdNr. zurückziehen? Zukünftige Rechnungen werden dann mit USt. erstellt."
                : "Möchtest du die USt-IdNr. als geprüft und freigegeben markieren? Zukünftige Rechnungen werden dann ohne USt. (Reverse-Charge) erstellt."}
            </DialogDescription>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <p className="font-semibold">{selectedProfile.company_name}</p>
                  <p className="text-sm text-muted-foreground">USt-IdNr.: {selectedProfile.tax_id}</p>
                </CardContent>
              </Card>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setVatDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button
                  onClick={() => toggleVatVerification(selectedProfile)}
                  className={selectedProfile.vat_id_verified ? "" : "bg-accent text-accent-foreground hover:bg-cta-orange-hover"}
                >
                  {selectedProfile.vat_id_verified ? "Verifizierung entziehen" : "Als verifiziert markieren"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Generation Dialog */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechnung erstellen</DialogTitle>
            <DialogDescription>
              Erstelle eine Rechnung für diese Reservierung.
            </DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-2">
                  <p className="font-semibold">{selectedReservation.product_name || selectedReservation.product_id}</p>
                  <p className="text-sm text-muted-foreground">
                    Standort: {selectedReservation.location} · Menge: {selectedReservation.quantity}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Zeitraum: {formatDate(selectedReservation.start_date)}
                    {selectedReservation.end_date ? ` – ${formatDate(selectedReservation.end_date)}` : ""}
                  </p>
                  {selectedReservation.original_price != null && (
                    <p className="text-sm">
                      Preis: {formatCurrency(selectedReservation.discounted_price || selectedReservation.original_price)}
                    </p>
                  )}
                  {(() => {
                    const profile = profiles.find((p) => p.id === selectedReservation.b2b_profile_id);
                    if (profile?.tax_id && profile.vat_id_verified) {
                      return (
                        <Badge variant="outline" className="text-primary">
                          <Shield className="h-3 w-3 mr-1" />
                          Reverse-Charge (VAT verifiziert)
                        </Badge>
                      );
                    }
                    return (
                      <Badge variant="secondary">
                        inkl. 19% USt.
                      </Badge>
                    );
                  })()}
                </CardContent>
              </Card>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setInvoiceDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button
                  className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                  onClick={() => generateInvoice(selectedReservation)}
                  disabled={generatingInvoice}
                >
                  {generatingInvoice ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
                      Wird erstellt...
                    </>
                  ) : (
                    <>
                      <Receipt className="h-4 w-4 mr-1.5" />
                      Rechnung generieren
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </B2BPortalLayout>
  );
}
