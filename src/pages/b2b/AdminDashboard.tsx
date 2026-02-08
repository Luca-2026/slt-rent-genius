import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { openInvoiceInNewWindow } from "@/utils/invoiceViewer";
import { useToast } from "@/hooks/use-toast";

// Admin components
import { AdminStatsOverview } from "@/components/b2b/admin/AdminStatsOverview";
import { AdminReservationsTab } from "@/components/b2b/admin/AdminReservationsTab";
import { AdminRentalsTab } from "@/components/b2b/admin/AdminRentalsTab";
import { AdminInvoicesTab } from "@/components/b2b/admin/AdminInvoicesTab";
import { AdminCustomersTab } from "@/components/b2b/admin/AdminCustomersTab";
import { AdminOffersTab, type Offer, type OfferItem } from "@/components/b2b/admin/AdminOffersTab";
import { AdminDeliveryNotesTab } from "@/components/b2b/admin/AdminDeliveryNotesTab";
import { AdminStaffTab } from "@/components/b2b/admin/AdminStaffTab";
import { AdminCustomerEditDialog } from "@/components/b2b/admin/AdminCustomerEditDialog";
import { AdminCustomerDetailDialog } from "@/components/b2b/admin/AdminCustomerDetailDialog";
import { AdminExtendReservationDialog } from "@/components/b2b/admin/AdminExtendReservationDialog";
import { AdminCreateCustomerDialog } from "@/components/b2b/admin/AdminCreateCustomerDialog";
import { AdminCreateReservationDialog } from "@/components/b2b/admin/AdminCreateReservationDialog";
import { AdminCreateOfferDialog, type ExistingOffer, type ExistingOfferItem } from "@/components/b2b/admin/AdminCreateOfferDialog";
import { DeliveryNoteDialog } from "@/components/b2b/admin/DeliveryNoteDialog";

// UI
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Users, Receipt, FileText, Package, Shield, RefreshCw, Clock, Send, ClipboardCheck, UserCog,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { getProductImageUrl, getProductImageUrlByName } from "@/utils/productImageLookup";

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

// ─── Component ────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Data
  const [profiles, setProfiles] = useState<B2BProfile[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offerItems, setOfferItems] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [selectedProfile, setSelectedProfile] = useState<B2BProfile | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [vatDialogOpen, setVatDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [editCustomerOpen, setEditCustomerOpen] = useState(false);
  const [detailCustomerOpen, setDetailCustomerOpen] = useState(false);
  const [extendResOpen, setExtendResOpen] = useState(false);
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
  const [createReservationOpen, setCreateReservationOpen] = useState(false);
  const [createOfferOpen, setCreateOfferOpen] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [invoiceFromOffer, setInvoiceFromOffer] = useState<Offer | null>(null);
  const [proformaMode, setProformaMode] = useState(false);
  const [deliveryNoteOpen, setDeliveryNoteOpen] = useState(false);
  const [deliveryNoteOffer, setDeliveryNoteOffer] = useState<Offer | null>(null);
  // Edit offer state
  const [editingOffer, setEditingOffer] = useState<ExistingOffer | null>(null);
  const [editingOfferItems, setEditingOfferItems] = useState<ExistingOfferItem[]>([]);

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/b2b/dashboard");
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Data fetching
  const fetchData = async () => {
    setLoading(true);
    const [profilesRes, invoicesRes, reservationsRes, offersRes, offerItemsRes] = await Promise.all([
      supabase.from("b2b_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("b2b_invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("b2b_reservations").select("*").order("created_at", { ascending: false }),
      supabase.from("b2b_offers").select("*").order("created_at", { ascending: false }),
      supabase.from("b2b_offer_items").select("*"),
    ]);
    if (profilesRes.data) setProfiles(profilesRes.data as B2BProfile[]);
    if (invoicesRes.data) setInvoices(invoicesRes.data as Invoice[]);
    if (reservationsRes.data) setReservations(reservationsRes.data as Reservation[]);
    if (offersRes.data) setOffers(offersRes.data as Offer[]);
    if (offerItemsRes.data) setOfferItems(offerItemsRes.data as OfferItem[]);
    setLoading(false);
  };

  useEffect(() => {
    if (user && isAdmin) fetchData();
  }, [user, isAdmin]);

  // ─── Actions ──────────────────────────────────────────
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
      // If invoice is being created from an accepted offer, use the offer items
      const offer = invoiceFromOffer;
      let invoiceBody: any = { reservation_id: reservation.id, delivery_cost: 0 };

      if (offer) {
        const items = offerItems.filter((i) => i.offer_id === offer.id);
        invoiceBody = {
          reservation_id: reservation.id,
          delivery_cost: offer.delivery_cost || 0,
          custom_items: items.map((item) => ({
            product_name: item.product_name,
            description: item.description || undefined,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount_percent: item.discount_percent || 0,
            rental_start: item.rental_start || reservation.start_date,
            rental_end: item.rental_end || reservation.end_date,
            image_url: getProductImageUrl(reservation.product_id) || getProductImageUrlByName(item.product_name) || undefined,
          })),
          notes: proformaMode
            ? `PROFORMA-RECHNUNG (Vorkasse) – ${offer.notes || ""}`.trim()
            : (offer.notes || undefined),
          is_proforma: proformaMode,
        };
      } else {
        // Direct invoice without offer — also attach image
        invoiceBody.image_url = getProductImageUrl(reservation.product_id) || getProductImageUrlByName(reservation.product_name || reservation.product_id) || undefined;
      }

      const { data, error } = await supabase.functions.invoke("generate-invoice", {
        body: invoiceBody,
      });
      if (error) throw error;
      toast({
        title: proformaMode ? "Proforma-Rechnung erstellt!" : "Rechnung erstellt!",
        description: `${proformaMode ? "Proforma-Rechnung" : "Rechnung"} ${data.invoice?.invoice_number} wurde erfolgreich generiert.`,
      });
      setInvoiceDialogOpen(false);
      setSelectedReservation(null);
      setInvoiceFromOffer(null);
      setProformaMode(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Rechnung konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const confirmReservation = async (reservation: Reservation) => {
    setConfirmingId(reservation.id);
    try {
      const { data, error } = await supabase.functions.invoke("confirm-reservation", {
        body: { reservation_id: reservation.id },
      });
      if (error) throw error;
      toast({
        title: "Anfrage bestätigt!",
        description: data.email_sent
          ? "Der Kunde wurde per E-Mail benachrichtigt."
          : "Status auf 'bestätigt' gesetzt. (E-Mail-Versand nicht konfiguriert)",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Bestätigung fehlgeschlagen.",
        variant: "destructive",
      });
    } finally {
      setConfirmingId(null);
    }
  };

  const handleEditOffer = (offer: Offer, items: OfferItem[]) => {
    const matchingReservation = offer.reservation_id
      ? reservations.find((r) => r.id === offer.reservation_id) || null
      : null;

    setSelectedReservation(matchingReservation);
    setEditingOffer({
      id: offer.id,
      offer_number: offer.offer_number,
      reservation_id: offer.reservation_id,
      delivery_cost: offer.delivery_cost,
      notes: offer.notes,
      b2b_profile_id: offer.b2b_profile_id,
    });
    setEditingOfferItems(
      items.map((i) => ({
        product_name: i.product_name,
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unit_price,
        discount_percent: i.discount_percent,
      }))
    );
    setCreateOfferOpen(true);
  };

  const handleResendOffer = async (offer: Offer) => {
    setResendingId(offer.id);
    try {
      const items = offerItems.filter((i) => i.offer_id === offer.id);
      const matchingReservation = offer.reservation_id
        ? reservations.find((r) => r.id === offer.reservation_id)
        : null;

      const { data, error } = await supabase.functions.invoke("generate-offer", {
        body: {
          reservation_id: offer.reservation_id,
          offer_id: offer.id,
          items: items.map((item) => ({
            product_name: item.product_name,
            description: item.description || undefined,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount_percent: item.discount_percent || undefined,
            rental_start: matchingReservation?.start_date,
            rental_end: matchingReservation?.end_date,
            image_url: matchingReservation ? (getProductImageUrl(matchingReservation.product_id) || getProductImageUrlByName(item.product_name) || undefined) : undefined,
          })),
          delivery_cost: offer.delivery_cost,
          notes: offer.notes || undefined,
          send_email: true,
          save_prices: false,
        },
      });

      if (error) throw error;

      toast({
        title: "Angebot erneut versendet!",
        description: data.email_sent
          ? `Angebot ${offer.offer_number} wurde erneut per E-Mail versendet.`
          : `Angebot ${offer.offer_number} wurde aktualisiert. (E-Mail nicht konfiguriert)`,
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Angebot konnte nicht erneut versendet werden.",
        variant: "destructive",
      });
    } finally {
      setResendingId(null);
    }
  };

  // ─── Derived data ─────────────────────────────────────
  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });
  const formatCurrency = (n: number) => n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  const pendingReservations = reservations.filter(
    (r) => (r.status === "pending" || r.status === "offer_sent") && !invoices.some((inv) => inv.reservation_id === r.id)
  );

  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const openInvoices = invoices.filter((i) => i.status === "open");
  const overdueInvoices = invoices.filter((i) => i.status === "overdue");
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.gross_amount, 0);
  const pendingCustomers = profiles.filter((p) => p.status === "pending");

  // ─── Loading ──────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <B2BPortalLayout title="Admin-Dashboard" subtitle="Verwaltung">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </B2BPortalLayout>
    );
  }

  return (
    <B2BPortalLayout title="Admin-Dashboard" subtitle="Verwaltung & Übersicht">
      {/* KPI Overview */}
      <AdminStatsOverview
        totalCustomers={profiles.length}
        pendingCustomers={pendingCustomers.length}
        totalReservations={reservations.length}
        pendingReservations={pendingReservations.length}
        totalInvoices={invoices.length}
        openInvoices={openInvoices.length}
        overdueInvoices={overdueInvoices.length}
        totalRevenue={totalRevenue}
      />

      {/* Tab Navigation */}
      <Tabs defaultValue="reservations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 h-12">
          <TabsTrigger value="reservations" className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Anfragen</span>
            {pendingReservations.length > 0 && (
              <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {pendingReservations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="offers" className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Angebote</span>
            {offers.length > 0 && (
              <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {offers.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="delivery-notes" className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Lieferscheine</span>
          </TabsTrigger>
          <TabsTrigger value="rentals" className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Mietverträge</span>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Rechnungen</span>
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Kunden</span>
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">Mitarbeiter</span>
          </TabsTrigger>
        </TabsList>

        {/* Tabs Content */}
        <TabsContent value="reservations">
          <AdminReservationsTab
            reservations={pendingReservations}
            profiles={profiles}
            onCreateReservation={() => setCreateReservationOpen(true)}
            onCreateOffer={(res) => {
              setSelectedReservation(res);
              setEditingOffer(null);
              setEditingOfferItems([]);
              setCreateOfferOpen(true);
            }}
            onRefresh={fetchData}
          />
        </TabsContent>

        <TabsContent value="offers">
          <AdminOffersTab
            offers={offers}
            offerItems={offerItems}
            profiles={profiles}
            onEditOffer={handleEditOffer}
            onResendOffer={handleResendOffer}
            onViewOffer={openInvoiceInNewWindow}
            onCreateInvoice={(offer) => {
              const matchingReservation = offer.reservation_id
                ? reservations.find((r) => r.id === offer.reservation_id) || null
                : null;
              if (matchingReservation) {
                setSelectedReservation(matchingReservation);
                setInvoiceFromOffer(offer);
                setInvoiceDialogOpen(true);
              } else {
                toast({
                  title: "Fehler",
                  description: "Keine zugehörige Reservierung gefunden.",
                  variant: "destructive",
                });
              }
            }}
            onCreateProformaInvoice={(offer) => {
              const matchingReservation = offer.reservation_id
                ? reservations.find((r) => r.id === offer.reservation_id) || null
                : null;
              if (matchingReservation) {
                setSelectedReservation(matchingReservation);
                setInvoiceFromOffer(offer);
                setProformaMode(true);
                setInvoiceDialogOpen(true);
              } else {
                toast({
                  title: "Fehler",
                  description: "Keine zugehörige Reservierung gefunden.",
                  variant: "destructive",
                });
              }
            }}
            onCreateDeliveryNote={(offer) => {
              setDeliveryNoteOffer(offer);
              setDeliveryNoteOpen(true);
            }}
            resendingId={resendingId}
            onRefresh={fetchData}
          />
        </TabsContent>

        <TabsContent value="delivery-notes">
          <AdminDeliveryNotesTab
            profiles={profiles as any}
            onRefresh={fetchData}
          />
        </TabsContent>

        <TabsContent value="rentals">
          <AdminRentalsTab
            reservations={reservations.filter((r) => r.status === "confirmed")}
            profiles={profiles}
            onCreateReservation={() => setCreateReservationOpen(true)}
            onExtendReservation={(res) => {
              setSelectedReservation(res);
              setExtendResOpen(true);
            }}
            onGenerateInvoice={(res) => {
              setSelectedReservation(res);
              setInvoiceFromOffer(null);
              setInvoiceDialogOpen(true);
            }}
            hasInvoice={(resId) => invoices.some((inv) => inv.reservation_id === resId)}
            onRefresh={fetchData}
          />
        </TabsContent>

        <TabsContent value="invoices">
          <AdminInvoicesTab
            invoices={invoices}
            onStatusChange={updateInvoiceStatus}
            onViewInvoice={openInvoiceInNewWindow}
            onRefresh={fetchData}
          />
        </TabsContent>

        <TabsContent value="customers">
          <AdminCustomersTab
            profiles={profiles}
            invoices={invoices}
            reservations={reservations}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onEditCustomer={(profile) => {
              setSelectedProfile(profile);
              setEditCustomerOpen(true);
            }}
            onViewCustomer={(profile) => {
              setSelectedProfile(profile);
              setDetailCustomerOpen(true);
            }}
            onToggleVat={(profile) => {
              setSelectedProfile(profile);
              setVatDialogOpen(true);
            }}
            onCreateCustomer={() => setCreateCustomerOpen(true)}
            onRefresh={fetchData}
          />
        </TabsContent>

        <TabsContent value="staff">
          <AdminStaffTab />
        </TabsContent>
      </Tabs>

      {/* ─── Dialogs ─────────────────────────────────────── */}

      {/* VAT Verification */}
      <Dialog open={vatDialogOpen} onOpenChange={setVatDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>USt-IdNr. Verifizierung</DialogTitle>
            <DialogDescription>
              {selectedProfile?.vat_id_verified
                ? "Verifizierung zurückziehen? Zukünftige Rechnungen mit USt."
                : "USt-IdNr. als geprüft markieren? Zukünftige Rechnungen ohne USt. (Reverse-Charge)."}
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
                <Button variant="outline" onClick={() => setVatDialogOpen(false)}>Abbrechen</Button>
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

      {/* Invoice Generation */}
      <Dialog open={invoiceDialogOpen} onOpenChange={(open) => {
        setInvoiceDialogOpen(open);
        if (!open) {
          setInvoiceFromOffer(null);
          setProformaMode(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {proformaMode ? "Proforma-Rechnung (Vorkasse)" : "Rechnung erstellen"}
            </DialogTitle>
            <DialogDescription>
              {proformaMode
                ? `Proforma-Rechnung aus Angebot ${invoiceFromOffer?.offer_number} erstellen. Der Kunde zahlt vorab per Vorkasse.`
                : invoiceFromOffer
                  ? `Rechnung aus Angebot ${invoiceFromOffer.offer_number} erstellen.`
                  : "Erstelle eine Rechnung für diesen Mietvertrag."}
            </DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-2">
                  {invoiceFromOffer ? (
                    <>
                      <p className="font-semibold">Angebot {invoiceFromOffer.offer_number}</p>
                      <div className="space-y-1">
                        {offerItems
                          .filter((i) => i.offer_id === invoiceFromOffer.id)
                          .map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.product_name}</span>
                              <span className="font-medium">{formatCurrency(item.total_price)}</span>
                            </div>
                          ))}
                        {invoiceFromOffer.delivery_cost > 0 && (
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Lieferung</span>
                            <span>{formatCurrency(invoiceFromOffer.delivery_cost)}</span>
                          </div>
                        )}
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Brutto</span>
                        <span>{formatCurrency(invoiceFromOffer.gross_amount)}</span>
                      </div>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                  {(() => {
                    const profile = profiles.find((p) => p.id === selectedReservation.b2b_profile_id);
                    return profile?.tax_id && profile.vat_id_verified ? (
                      <Badge variant="outline" className="text-primary">
                        <Shield className="h-3 w-3 mr-1" />Reverse-Charge
                      </Badge>
                    ) : (
                      <Badge variant="secondary">inkl. 19% USt.</Badge>
                    );
                  })()}
                  {proformaMode && (
                    <Badge variant="outline" className="text-amber-600 border-amber-300">
                      Vorkasse – Zahlungseingang vor Übergabe erforderlich
                    </Badge>
                  )}
                </CardContent>
              </Card>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setInvoiceDialogOpen(false)}>Abbrechen</Button>
                <Button
                  className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                  onClick={() => generateInvoice(selectedReservation)}
                  disabled={generatingInvoice}
                >
                  {generatingInvoice ? (
                    <><RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />Wird erstellt...</>
                  ) : proformaMode ? (
                    <><Receipt className="h-4 w-4 mr-1.5" />Proforma-Rechnung erstellen</>
                  ) : (
                    <><Receipt className="h-4 w-4 mr-1.5" />Rechnung generieren</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Customer Detail */}
      <AdminCustomerDetailDialog
        profile={selectedProfile}
        invoices={invoices}
        reservations={reservations}
        open={detailCustomerOpen}
        onOpenChange={setDetailCustomerOpen}
        onEditCustomer={(profile) => {
          setSelectedProfile(profile);
          setEditCustomerOpen(true);
        }}
        onRefresh={fetchData}
      />

      {/* Customer Edit */}
      <AdminCustomerEditDialog
        profile={selectedProfile}
        open={editCustomerOpen}
        onOpenChange={setEditCustomerOpen}
        onSaved={fetchData}
      />

      {/* Extend Reservation */}
      <AdminExtendReservationDialog
        reservation={selectedReservation}
        companyName={profiles.find((p) => p.id === selectedReservation?.b2b_profile_id)?.company_name}
        open={extendResOpen}
        onOpenChange={setExtendResOpen}
        onSaved={fetchData}
      />

      {/* Create Customer */}
      <AdminCreateCustomerDialog
        open={createCustomerOpen}
        onOpenChange={setCreateCustomerOpen}
        onCreated={fetchData}
      />

      {/* Create Reservation */}
      <AdminCreateReservationDialog
        profiles={profiles}
        open={createReservationOpen}
        onOpenChange={setCreateReservationOpen}
        onCreated={fetchData}
      />

      {/* Create / Edit Offer */}
      <AdminCreateOfferDialog
        reservation={selectedReservation}
        profile={
          editingOffer
            ? profiles.find((p) => p.id === editingOffer.b2b_profile_id) || null
            : selectedReservation
              ? profiles.find((p) => p.id === selectedReservation.b2b_profile_id) || null
              : null
        }
        open={createOfferOpen}
        onOpenChange={(open) => {
          setCreateOfferOpen(open);
          if (!open) {
            setEditingOffer(null);
            setEditingOfferItems([]);
          }
        }}
        onCreated={fetchData}
        existingOffer={editingOffer}
        existingItems={editingOfferItems}
      />
      {/* Delivery Note */}
      <DeliveryNoteDialog
        offer={deliveryNoteOffer}
        offerItems={offerItems}
        profile={
          deliveryNoteOffer
            ? profiles.find((p) => p.id === deliveryNoteOffer.b2b_profile_id) || null
            : null
        }
        reservation={
          deliveryNoteOffer?.reservation_id
            ? reservations.find((r) => r.id === deliveryNoteOffer.reservation_id) || null
            : null
        }
        open={deliveryNoteOpen}
        onOpenChange={(open) => {
          setDeliveryNoteOpen(open);
          if (!open) setDeliveryNoteOffer(null);
        }}
        onCreated={fetchData}
      />
    </B2BPortalLayout>
  );
}
