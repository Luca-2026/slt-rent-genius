import { useState, useEffect } from "react";
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
import {
  FileText, Send, Plus, Trash2, RefreshCw, Euro, Package,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

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
}

interface B2BProfile {
  id: string;
  company_name: string;
  tax_id?: string | null;
  vat_id_verified?: boolean;
}

interface OfferItem {
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
}

interface Props {
  reservation: Reservation | null;
  profile: B2BProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function AdminCreateOfferDialog({ reservation, profile, open, onOpenChange, onCreated }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<OfferItem[]>([]);
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [validDays, setValidDays] = useState(14);
  const [notes, setNotes] = useState("");
  const [sendEmail, setSendEmail] = useState(true);

  // Load existing customer prices when dialog opens
  useEffect(() => {
    if (open && reservation && profile) {
      loadCustomerPrices();
    }
  }, [open, reservation, profile]);

  const loadCustomerPrices = async () => {
    if (!profile || !reservation) return;

    // Check if there's a stored price for this customer + product
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

  const updateItem = (index: number, field: keyof OfferItem, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { product_name: "", description: "", quantity: 1, unit_price: 0, discount_percent: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateItemTotal = (item: OfferItem) => {
    const discounted = item.unit_price * (1 - item.discount_percent / 100);
    return Math.round(discounted * item.quantity * 100) / 100;
  };

  const netAmount = items.reduce((sum, item) => sum + calculateItemTotal(item), 0) + deliveryCost;
  const isReverseCharge = !!(profile?.tax_id && profile?.vat_id_verified);
  const vatRate = isReverseCharge ? 0 : 19;
  const vatAmount = isReverseCharge ? 0 : Math.round(netAmount * 0.19 * 100) / 100;
  const grossAmount = Math.round((netAmount + vatAmount) * 100) / 100;

  const handleCreate = async () => {
    if (!reservation) return;

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
      const { data, error } = await supabase.functions.invoke("generate-offer", {
        body: {
          reservation_id: reservation.id,
          items: validItems.map((item) => ({
            product_name: item.product_name,
            description: item.description || undefined,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount_percent: item.discount_percent || undefined,
            rental_start: reservation.start_date,
            rental_end: reservation.end_date || undefined,
          })),
          delivery_cost: deliveryCost,
          valid_days: validDays,
          notes: notes || undefined,
          send_email: sendEmail,
          save_prices: true,
        },
      });

      if (error) throw error;

      toast({
        title: "Angebot erstellt!",
        description: data.email_sent
          ? `Angebot ${data.offer?.offer_number} wurde erstellt und per E-Mail versendet.`
          : `Angebot ${data.offer?.offer_number} wurde erstellt. (E-Mail nicht konfiguriert)`,
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

  if (!reservation || !profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Angebot erstellen
          </DialogTitle>
          <DialogDescription>
            Preise eintragen und ein PDF-Angebot für den Kunden generieren.
          </DialogDescription>
        </DialogHeader>

        {/* Customer & Reservation Info */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{profile.company_name}</p>
                <p className="text-sm text-muted-foreground">
                  {reservation.product_name || reservation.product_id}
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>Standort: <span className="capitalize">{reservation.location}</span></p>
                <p>
                  {formatDate(reservation.start_date)}
                  {reservation.end_date ? ` – ${formatDate(reservation.end_date)}` : ""}
                </p>
              </div>
            </div>
            {isReverseCharge && (
              <Badge variant="outline" className="text-primary">
                Reverse-Charge (USt-IdNr. verifiziert)
              </Badge>
            )}
          </CardContent>
        </Card>

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
                  <Input
                    value={item.product_name}
                    onChange={(e) => updateItem(index, "product_name", e.target.value)}
                    placeholder="z.B. Minibagger 1,5t"
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

                <div className="grid grid-cols-3 gap-2">
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
        <div className="grid grid-cols-2 gap-3">
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
        </div>

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
                <span className="text-muted-foreground">Nettobetrag:</span>
                <span>{formatCurrency(netAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {isReverseCharge ? "USt. (Reverse-Charge):" : `USt. (${vatRate}%):`}
                </span>
                <span>{formatCurrency(vatAmount)}</span>
              </div>
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
        <div className="flex gap-3 justify-end pt-2">
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
                Wird erstellt...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1.5" />
                Angebot erstellen & senden
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
