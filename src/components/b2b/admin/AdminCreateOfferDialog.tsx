import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, Send, Plus, Trash2, RefreshCw, Euro, Package,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { getProductImageUrl, getProductImageUrlByName } from "@/utils/productImageLookup";
import { DEPOSIT_OPTIONS, ADDITIONAL_SERVICES, getServicesForCategory, calculateServicesSurcharge } from "@/data/additionalServices";
import { ProductAutocomplete } from "@/components/b2b/admin/ProductAutocomplete";

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
  category_slug?: string | null;
  additional_services?: any;
  deposit?: number | null;
  rental_group_id?: string | null;
}

interface B2BProfile {
  id: string;
  company_name: string;
  tax_id?: string | null;
  vat_id_verified?: boolean;
}

interface OfferItemInput {
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  rental_start?: string;
  rental_end?: string;
  start_time?: string;
  end_time?: string;
}

export interface ExistingOffer {
  id: string;
  offer_number: string;
  reservation_id: string | null;
  delivery_cost: number;
  notes: string | null;
  b2b_profile_id: string;
  deposit?: number | null;
  additional_services?: any;
}

export interface ExistingOfferItem {
  product_name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  discount_percent: number;
}

interface Props {
  reservation: Reservation | null;
  allReservations?: Reservation[];
  profile: B2BProfile | null;
  profiles?: B2BProfile[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  existingOffer?: ExistingOffer | null;
  existingItems?: ExistingOfferItem[];
}

export function AdminCreateOfferDialog({
  reservation,
  profile: profileProp,
  profiles: profilesList,
  open,
  onOpenChange,
  onCreated,
  existingOffer,
  existingItems,
}: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<OfferItemInput[]>([]);
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [validDays, setValidDays] = useState(14);
  const [notes, setNotes] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [deposit, setDeposit] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [selectedProfileId, setSelectedProfileId] = useState("");
  // Track the context key that was used to initialize the form, so we only reset when the context actually changes
  const lastInitKey = useRef<string | null>(null);

  const isEditing = !!existingOffer;
  const isStandalone = !reservation && !isEditing;

  // Resolve the active profile: from prop (reservation/edit mode) or from selector (standalone)
  const profile = profileProp || (isStandalone && profilesList
    ? profilesList.find((p) => p.id === selectedProfileId) || null
    : null);

  const approvedProfiles = (profilesList || []).filter((p: any) => p.status === "approved");

  // Initialize form when dialog opens with a NEW context (different reservation/offer), not on every open toggle
  useEffect(() => {
    if (!open) return;

    const contextKey = existingOffer?.id || reservation?.id || "standalone";
    if (lastInitKey.current === contextKey) return; // Already initialized for this context
    lastInitKey.current = contextKey;

    if (existingOffer && existingItems && existingItems.length > 0) {
      setItems(
        existingItems.map((item) => ({
          product_name: item.product_name,
          description: item.description || "",
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent,
        }))
      );
      setDeliveryCost(existingOffer.delivery_cost || 0);
      setNotes(existingOffer.notes || "");
      setDeposit(existingOffer.deposit ? String(existingOffer.deposit) : "");
      if (existingOffer.additional_services && Array.isArray(existingOffer.additional_services)) {
        setSelectedServices(new Set(existingOffer.additional_services.map((s: any) => s.id)));
      } else {
        setSelectedServices(new Set());
      }
    } else if (reservation) {
      setDeposit(reservation.deposit ? String(reservation.deposit) : "");
      if (reservation.additional_services && Array.isArray(reservation.additional_services)) {
        setSelectedServices(new Set(reservation.additional_services.map((s: any) => s.id)));
      } else {
        setSelectedServices(new Set());
      }
    } else if (isStandalone) {
      setItems([{ product_name: "", description: "", quantity: 1, unit_price: 0, discount_percent: 0, rental_start: "", rental_end: "", start_time: "", end_time: "" }]);
      setDeliveryCost(0);
      setNotes("");
      setDeposit("");
      setSelectedServices(new Set());
      setSelectedProfileId("");
    }
  }, [open, existingOffer?.id, reservation?.id]);

  // Load customer prices when reservation + profile are available
  useEffect(() => {
    if (open && reservation && profile) {
      loadCustomerPrices();
    }
  }, [open, reservation, profile]);

  const loadCustomerPrices = async () => {
    if (!profile || !reservation) return;

    const { data: existingPrices } = await supabase
      .from("b2b_customer_prices")
      .select("*")
      .eq("b2b_profile_id", profile.id)
      .eq("product_name", reservation.product_name || reservation.product_id);

    const existingPrice = existingPrices?.[0];

    setItems([
      {
        product_name: reservation.product_name || reservation.product_id,
        description: reservation.end_date
          ? `Mietzeitraum: ${formatDate(reservation.start_date)} – ${formatDate(reservation.end_date)}`
          : `Ab: ${formatDate(reservation.start_date)}`,
        quantity: reservation.quantity || 1,
        unit_price: existingPrice?.unit_price || reservation.original_price || 0,
        discount_percent: 0,
      },
    ]);
    setDeliveryCost(0);
    setNotes(reservation.notes || "");
  };

  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });
  const formatCurrency = (n: number) =>
    n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  const updateItem = (index: number, field: keyof OfferItemInput, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { product_name: "", description: "", quantity: 1, unit_price: 0, discount_percent: 0, rental_start: "", rental_end: "", start_time: "", end_time: "" },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (serviceId.startsWith("mbv-")) {
        for (const id of next) {
          if (id.startsWith("mbv-")) next.delete(id);
        }
      }
      if (next.has(serviceId)) {
        next.delete(serviceId);
      } else {
        next.add(serviceId);
      }
      return next;
    });
  };

  const calculateItemTotal = (item: OfferItemInput) => {
    const discounted = item.unit_price * (1 - item.discount_percent / 100);
    return Math.round(discounted * item.quantity * 100) / 100;
  };

  // Base = item totals only (excl. delivery & deposit) for service % calculation
  const itemsNetTotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const { total: servicesSurcharge, breakdown: servicesBreakdown } = calculateServicesSurcharge(selectedServices, itemsNetTotal);
  const netAmount = itemsNetTotal + deliveryCost + servicesSurcharge;
  const isReverseCharge = !!(profile?.tax_id && profile?.vat_id_verified);
  const vatRate = isReverseCharge ? 0 : 19;
  const vatAmount = isReverseCharge ? 0 : Math.round(netAmount * 0.19 * 100) / 100;
  const grossAmount = Math.round((netAmount + vatAmount) * 100) / 100;

  const reservationId = existingOffer?.reservation_id || reservation?.id;
  const categorySlug = (reservation as any)?.category_slug;
  // In standalone mode, show ALL services (including MBV options)
  const relevantServices = isStandalone ? ADDITIONAL_SERVICES : getServicesForCategory(categorySlug);

  const handleCreate = async () => {
    if (!isStandalone && !reservationId) return;
    if (isStandalone && !profile) {
      toast({ title: "Fehler", description: "Bitte einen Kunden auswählen.", variant: "destructive" });
      return;
    }
    const validItems = items.filter((item) => item.product_name && item.unit_price > 0);
    if (validItems.length === 0) {
      toast({
        title: "Fehler",
        description: "Bitte mindestens einen Artikel mit Preis angeben.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const startDate = reservation?.start_date || undefined;
      const endDate = reservation?.end_date || undefined;

      const servicesArray = selectedServices.size > 0
        ? ADDITIONAL_SERVICES.filter((s) => selectedServices.has(s.id)).map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            pricePercent: s.pricePercent,
          }))
        : undefined;

      const { data, error } = await supabase.functions.invoke("generate-offer", {
        body: {
          reservation_id: reservationId || undefined,
          b2b_profile_id: isStandalone ? profile!.id : undefined,
          offer_id: existingOffer?.id || undefined,
          items: validItems.map((item) => ({
            product_name: item.product_name,
            description: item.description || undefined,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount_percent: item.discount_percent || undefined,
            rental_start: item.rental_start || startDate,
            rental_end: item.rental_end || endDate,
            start_time: item.start_time || undefined,
            end_time: item.end_time || undefined,
            image_url: getProductImageUrl(reservation?.product_id || "") || getProductImageUrlByName(item.product_name) || undefined,
          })),
          delivery_cost: deliveryCost,
          valid_days: validDays,
          notes: notes || undefined,
          send_email: sendEmail,
          save_prices: true,
          deposit: deposit && deposit !== "none" ? Number(deposit) : undefined,
          additional_services: servicesArray,
        },
      });

      if (error) throw error;

      toast({
        title: isEditing ? "Angebot aktualisiert!" : "Angebot erstellt!",
        description: data.email_sent
          ? `Angebot ${data.offer?.offer_number} wurde ${isEditing ? "aktualisiert" : "erstellt"} und per E-Mail versendet.`
          : `Angebot ${data.offer?.offer_number} wurde ${isEditing ? "aktualisiert" : "erstellt"}. (E-Mail nicht konfiguriert)`,
      });

      onCreated();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Angebot konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // In standalone mode, show dialog even without profile selected yet
  if (!isStandalone && !profile) return null;
  if (!isEditing && !reservation && !isStandalone) return null;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
        if (!newOpen) lastInitKey.current = null;
        onOpenChange(newOpen);
      }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isEditing ? "Angebot bearbeiten" : "Angebot erstellen"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Angebot ${existingOffer.offer_number} anpassen und erneut versenden.`
              : isStandalone
                ? "Wähle einen Kunden und erstelle ein Angebot mit individuellen Positionen."
                : "Preise eintragen und ein PDF-Angebot für den Kunden generieren."}
          </DialogDescription>
        </DialogHeader>

        {/* Customer selector (standalone) or info */}
        {isStandalone ? (
          <div>
            <Label>Kunde *</Label>
            <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
              <SelectTrigger><SelectValue placeholder="Kunde wählen" /></SelectTrigger>
              <SelectContent>
                {approvedProfiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.company_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {profile && isReverseCharge && (
              <Badge variant="outline" className="text-primary mt-2">
                Reverse-Charge (USt-IdNr. verifiziert)
              </Badge>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{profile!.company_name}</p>
                  {reservation && (
                    <p className="text-sm text-muted-foreground">
                      {reservation.product_name || reservation.product_id}
                    </p>
                  )}
                </div>
                {reservation && (
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Standort: <span className="capitalize">{reservation.location}</span></p>
                    <p>
                      {formatDate(reservation.start_date)}
                      {reservation.end_date ? ` – ${formatDate(reservation.end_date)}` : ""}
                    </p>
                  </div>
                )}
              </div>
              {isReverseCharge && (
                <Badge variant="outline" className="text-primary">
                  Reverse-Charge (USt-IdNr. verifiziert)
                </Badge>
              )}
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Offer Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Positionen</Label>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Position
            </Button>
          </div>

          {items.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Position {index + 1}
                  </span>
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                <div>
                  <Label className="text-xs">Bezeichnung *</Label>
                  <ProductAutocomplete
                    value={item.product_name}
                    onChange={(name, productId, categorySlug) => updateItem(index, "product_name", name)}
                    placeholder="Produkt suchen oder eingeben..."
                    className="h-8 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Beschreibung</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    placeholder="z.B. Mietzeitraum, Details..."
                    className="h-8 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Menge</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Einzelpreis (€ netto) *</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, "unit_price", Number(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Rabatt (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={item.discount_percent}
                      onChange={(e) => updateItem(index, "discount_percent", Number(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Rental period per item (standalone or editable) */}
                {(isStandalone || isEditing) && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <Label className="text-xs">Mietbeginn</Label>
                      <Input
                        type="date"
                        value={item.rental_start || ""}
                        onChange={(e) => updateItem(index, "rental_start", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Uhrzeit Beginn</Label>
                      <Input
                        type="time"
                        value={item.start_time || ""}
                        onChange={(e) => updateItem(index, "start_time", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Mietende</Label>
                      <Input
                        type="date"
                        value={item.rental_end || ""}
                        onChange={(e) => updateItem(index, "rental_end", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Uhrzeit Ende</Label>
                      <Input
                        type="time"
                        value={item.end_time || ""}
                        onChange={(e) => updateItem(index, "end_time", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="text-right text-sm">
                  <span className="text-muted-foreground">Summe: </span>
                  <span className="font-semibold">{formatCurrency(calculateItemTotal(item))}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        {/* Additional options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Lieferkosten (€ netto)</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={deliveryCost}
              onChange={(e) => setDeliveryCost(Number(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Gültigkeitsdauer (Tage)</Label>
            <Input
              type="number"
              min={1}
              value={validDays}
              onChange={(e) => setValidDays(Number(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Kaution (€)</Label>
            <Select value={deposit} onValueChange={setDeposit}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine</SelectItem>
                {DEPOSIT_OPTIONS.map((d) => (
                  <SelectItem key={d} value={String(d)}>{d} €</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Additional Services */}
        {relevantServices.length > 0 && (
          <div>
            <Label className="text-xs mb-2 block">Zusatzoptionen</Label>
            <div className="space-y-1.5 rounded-md border p-3 bg-muted/30">
              {relevantServices.map((service) => {
                const surchargeEntry = servicesBreakdown.find((b) => b.service.id === service.id);
                return (
                  <label key={service.id} className="flex items-start gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedServices.has(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium">{service.name}</p>
                        {service.pricePercent !== null && (
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                            {service.pricePercent}% {selectedServices.has(service.id) && itemsNetTotal > 0 && surchargeEntry
                              ? `(${formatCurrency(surchargeEntry.amount)})`
                              : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{service.description}</p>
                    </div>
                  </label>
                );
              })}
              {servicesSurcharge > 0 && (
                <div className="pt-1.5 border-t mt-1.5 flex justify-between text-xs font-medium">
                  <span>Zusatzkosten gesamt:</span>
                  <span>{formatCurrency(servicesSurcharge)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <Label className="text-xs">Anmerkungen</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optionale Anmerkungen zum Angebot..."
            rows={2}
            className="text-sm"
          />
        </div>

        {/* Totals */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Positionen:</span>
                <span>{formatCurrency(itemsNetTotal)}</span>
              </div>
              {deliveryCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lieferkosten:</span>
                  <span>{formatCurrency(deliveryCost)}</span>
                </div>
              )}
              {servicesSurcharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zusatzoptionen:</span>
                  <span>{formatCurrency(servicesSurcharge)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nettobetrag:</span>
                <span>{formatCurrency(netAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {isReverseCharge ? "USt. (Reverse-Charge):" : `USt. (${vatRate}%):`}
                </span>
                <span>{formatCurrency(vatAmount)}</span>
              </div>
              {deposit && deposit !== "none" && Number(deposit) > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Kaution:</span>
                  <span>{formatCurrency(Number(deposit))}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base text-primary">
                <span>Bruttobetrag:</span>
                <span>{formatCurrency(grossAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sendEmail"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="rounded border-muted-foreground"
          />
          <label htmlFor="sendEmail" className="text-sm text-muted-foreground">
            Angebot per E-Mail an den Kunden senden
          </label>
        </div>

        <p className="text-xs text-muted-foreground">
          <Euro className="h-3 w-3 inline mr-1" />
          Die eingegebenen Preise werden dauerhaft für diesen Kunden gespeichert.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleCreate}
            disabled={saving}
            className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
                Wird {isEditing ? "aktualisiert" : "erstellt"}...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1.5" />
                {isEditing ? "Angebot aktualisieren & senden" : "Angebot erstellen & senden"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
