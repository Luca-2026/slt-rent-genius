import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { openInvoiceInNewWindow } from "@/utils/invoiceViewer";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Building2, CalendarDays, CreditCard, Edit, Eye, Package,
  Percent, Receipt, RefreshCw, Save, Shield, Trash2, TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

// ─── Types ────────────────────────────────────────────────
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
  payment_due_days: number;
  deletion_requested_at: string | null;
  credit_limit_requested_at: string | null;
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
  reservation_id: string | null;
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
  notes: string | null;
  created_at: string;
}

interface CategoryDiscount {
  id: string;
  category_id: string;
  discount_percent: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  profile: B2BProfile | null;
  invoices: Invoice[];
  reservations: Reservation[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditCustomer: (profile: B2BProfile) => void;
  onRefresh: () => void;
}

// ─── Component ────────────────────────────────────────────
export function AdminCustomerDetailDialog({
  profile,
  invoices,
  reservations,
  open,
  onOpenChange,
  onEditCustomer,
  onRefresh,
}: Props) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [discounts, setDiscounts] = useState<CategoryDiscount[]>([]);
  const [editingDiscounts, setEditingDiscounts] = useState<Record<string, number>>({});
  const [savingDiscounts, setSavingDiscounts] = useState(false);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });
  const formatCurrency = (n: number) =>
    n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  // Fetch categories & discounts when profile changes
  useEffect(() => {
    if (!open || !profile) return;

    const fetchData = async () => {
      setLoadingDiscounts(true);
      const [catRes, discRes] = await Promise.all([
        supabase.from("product_categories").select("id, name, slug").order("sort_order"),
        supabase.from("b2b_category_discounts").select("*").eq("b2b_profile_id", profile.id),
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (discRes.data) {
        setDiscounts(discRes.data as CategoryDiscount[]);
        const map: Record<string, number> = {};
        (discRes.data as CategoryDiscount[]).forEach((d) => {
          map[d.category_id] = d.discount_percent;
        });
        setEditingDiscounts(map);
      }
      setLoadingDiscounts(false);
    };
    fetchData();
  }, [open, profile?.id]);

  // Derived data for this customer
  const customerInvoices = invoices.filter((i) => i.b2b_profile_id === profile?.id);
  const customerReservations = reservations.filter((r) => r.b2b_profile_id === profile?.id);
  const paidInvoices = customerInvoices.filter((i) => i.status === "paid");
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.gross_amount, 0);
  const totalInvoiceVolume = customerInvoices.reduce((sum, i) => sum + i.gross_amount, 0);
  const creditUsage = profile && profile.credit_limit > 0
    ? Math.round((profile.used_credit / profile.credit_limit) * 100)
    : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const saveDiscounts = async () => {
    if (!profile) return;
    setSavingDiscounts(true);

    try {
      // Delete existing discounts for this profile
      await supabase
        .from("b2b_category_discounts")
        .delete()
        .eq("b2b_profile_id", profile.id);

      // Insert new discounts (only non-zero)
      const toInsert = Object.entries(editingDiscounts)
        .filter(([, pct]) => pct > 0)
        .map(([category_id, discount_percent]) => ({
          b2b_profile_id: profile.id,
          category_id,
          discount_percent,
        }));

      if (toInsert.length > 0) {
        const { error } = await supabase
          .from("b2b_category_discounts")
          .insert(toInsert);
        if (error) throw error;
      }

      toast({ title: "Rabatte gespeichert", description: `${toInsert.length} Kategorierabatte für ${profile.company_name} gespeichert.` });
      onRefresh();
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } finally {
      setSavingDiscounts(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!profile) return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-customer", {
        body: { profile_id: profile.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Kunde gelöscht",
        description: data.email_sent
          ? `${profile.company_name} wurde gelöscht. Bestätigungsemail versendet.`
          : `${profile.company_name} wurde gelöscht.`,
      });
      setDeleteDialogOpen(false);
      onOpenChange(false);
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Fehler beim Löschen",
        description: error.message || "Kunde konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {profile.company_name}
          </DialogTitle>
          <DialogDescription>Kundenübersicht, Rabatte, Mietvorgänge & Rechnungen</DialogDescription>
        </DialogHeader>

        {/* ─── KPI Summary ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <CalendarDays className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Registriert</p>
              <p className="font-semibold text-sm">{formatDate(profile.created_at)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-4 w-4 mx-auto text-primary mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Umsatz (bezahlt)</p>
              <p className="font-semibold text-sm text-primary">{formatCurrency(totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Receipt className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Rechnungen</p>
              <p className="font-semibold text-sm">{customerInvoices.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Package className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Mietvorgänge</p>
              <p className="font-semibold text-sm">{customerReservations.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Credit Limit Bar */}
        {profile.credit_limit > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> Kreditlimit
              </span>
              <span className="font-medium">
                {formatCurrency(profile.used_credit)} / {formatCurrency(profile.credit_limit)} ({creditUsage}%)
              </span>
            </div>
            <Progress
              value={creditUsage}
              className={`h-2 ${creditUsage >= 90 ? "[&>div]:bg-destructive" : creditUsage >= 70 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-primary"}`}
            />
          </div>
        )}

        {/* Contact & VAT summary */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>{profile.contact_first_name} {profile.contact_last_name}</span>
          <span>·</span>
          <span>{profile.contact_email}</span>
          <span>·</span>
          <span>{profile.street} {profile.house_number}, {profile.postal_code} {profile.city}</span>
          {profile.tax_id && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {profile.tax_id}
                {profile.vat_id_verified && <Badge variant="default" className="text-[9px] px-1 py-0">RC</Badge>}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { onOpenChange(false); onEditCustomer(profile); }}
          >
            <Edit className="h-3.5 w-3.5 mr-1" /> Stammdaten bearbeiten
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Konto löschen
          </Button>
        </div>

        {/* Deletion Request Banner */}
        {profile.deletion_requested_at && (
          <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
            <Trash2 className="h-4 w-4 text-destructive shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Löschung beantragt</p>
              <p className="text-xs text-muted-foreground">
                Der Kunde hat am {formatDate(profile.deletion_requested_at)} die Löschung seines Kontos beantragt.
              </p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Jetzt löschen
            </Button>
          </div>
        )}

        {/* ─── Tabs ─────────────────────────────────────────── */}
        <Tabs defaultValue="discounts" className="mt-2">
          <TabsList className="grid w-full grid-cols-3 h-10">
            <TabsTrigger value="discounts" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Percent className="h-3.5 w-3.5 mr-1" /> Rabatte
            </TabsTrigger>
            <TabsTrigger value="rentals" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Package className="h-3.5 w-3.5 mr-1" /> Mietvorgänge
            </TabsTrigger>
            <TabsTrigger value="invoices" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Receipt className="h-3.5 w-3.5 mr-1" /> Rechnungen
            </TabsTrigger>
          </TabsList>

          {/* ── Discounts Tab ──────────────────────────────── */}
          <TabsContent value="discounts" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Feste Kategorierabatte für diesen Kunden. Diese werden automatisch bei Angeboten berücksichtigt.
            </p>
            {loadingDiscounts ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-2 p-2 rounded-lg border bg-card">
                      <Label className="flex-1 text-xs font-medium truncate">{cat.name}</Label>
                      <div className="flex items-center gap-1 shrink-0">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={editingDiscounts[cat.id] || ""}
                          placeholder="0"
                          onChange={(e) =>
                            setEditingDiscounts((prev) => ({
                              ...prev,
                              [cat.id]: Math.max(0, Math.min(100, Number(e.target.value))),
                            }))
                          }
                          className="w-16 h-8 text-xs text-right"
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  onClick={saveDiscounts}
                  disabled={savingDiscounts}
                  className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                >
                  {savingDiscounts ? (
                    <><RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" /> Wird gespeichert...</>
                  ) : (
                    <><Save className="h-3.5 w-3.5 mr-1" /> Rabatte speichern</>
                  )}
                </Button>
              </>
            )}
          </TabsContent>

          {/* ── Rentals Tab ────────────────────────────────── */}
          <TabsContent value="rentals">
            {customerReservations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Keine Mietvorgänge vorhanden.</p>
            ) : (
              <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produkt</TableHead>
                      <TableHead>Zeitraum</TableHead>
                      <TableHead>Standort</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Preis</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerReservations.map((res) => {
                      const endDate = res.end_date ? new Date(res.end_date + "T23:59:59") : null;
                      const isActive = !endDate || endDate >= today;
                      const statusLabel = res.status === "confirmed"
                        ? (isActive ? "Aktiv" : "Beendet")
                        : res.status === "pending" ? "Ausstehend"
                        : res.status === "offer_sent" ? "Angebot gesendet"
                        : res.status === "cancelled" ? "Storniert"
                        : res.status;

                      return (
                        <TableRow key={res.id}>
                          <TableCell>
                            <p className="text-sm font-medium">{res.product_name || res.product_id}</p>
                            <p className="text-[11px] text-muted-foreground">Menge: {res.quantity}</p>
                          </TableCell>
                          <TableCell className="text-xs">
                            {formatDate(res.start_date)}
                            {res.end_date ? ` – ${formatDate(res.end_date)}` : ""}
                          </TableCell>
                          <TableCell className="text-xs capitalize">{res.location}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                res.status === "confirmed" && isActive ? "default"
                                : res.status === "cancelled" ? "destructive"
                                : "secondary"
                              }
                              className="text-[10px]"
                            >
                              {statusLabel}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {res.discounted_price != null
                              ? formatCurrency(res.discounted_price)
                              : res.original_price != null
                              ? formatCurrency(res.original_price)
                              : "–"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* ── Invoices Tab ───────────────────────────────── */}
          <TabsContent value="invoices">
            {customerInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Keine Rechnungen vorhanden.</p>
            ) : (
              <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rechnungsnr.</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead className="text-right">Brutto</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerInvoices.map((inv) => {
                      const statusColor =
                        inv.status === "paid" ? "bg-primary/10 text-primary"
                        : inv.status === "overdue" ? "bg-destructive/10 text-destructive"
                        : inv.status === "cancelled" ? "bg-muted text-muted-foreground"
                        : "bg-accent/10 text-accent";
                      const statusLabel =
                        inv.status === "paid" ? "Bezahlt"
                        : inv.status === "overdue" ? "Überfällig"
                        : inv.status === "cancelled" ? "Storniert"
                        : "Offen";

                      return (
                        <TableRow key={inv.id}>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium">{inv.invoice_number}</span>
                              {inv.is_reverse_charge && (
                                <Badge variant="outline" className="text-[9px] px-1 py-0">RC</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">{formatDate(inv.invoice_date)}</TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            {formatCurrency(inv.gross_amount)}
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-[10px] ${statusColor}`}>{statusLabel}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {inv.file_url && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openInvoiceInNewWindow(inv.file_url!, inv.invoice_number)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {/* Total revenue summary */}
                <div className="flex justify-between items-center p-3 border-t bg-muted/30">
                  <span className="text-xs text-muted-foreground">Gesamtvolumen / davon bezahlt</span>
                  <div className="text-right">
                    <span className="text-sm font-medium">{formatCurrency(totalInvoiceVolume)}</span>
                    <span className="text-xs text-muted-foreground mx-1">/</span>
                    <span className="text-sm font-semibold text-primary">{formatCurrency(totalRevenue)}</span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kundenkonto endgültig löschen?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Das Konto von <strong>{profile.company_name}</strong> wird unwiderruflich gelöscht, 
                einschließlich aller Reservierungen, Rechnungen, Angebote und Rabatte.
              </p>
              <p className="text-destructive font-medium">
                Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCustomer}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <><RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" /> Wird gelöscht...</>
              ) : (
                <><Trash2 className="h-3.5 w-3.5 mr-1" /> Endgültig löschen</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
