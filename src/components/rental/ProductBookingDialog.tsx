import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, Loader2, Send, CheckCircle2, Calendar, Truck, Wrench } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { Product, LocationData } from "@/data/rentalData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProductBookingDialogProps {
  product: Product | null;
  location: LocationData | null;
  isOpen: boolean;
  onClose: () => void;
  categoryId?: string;
}

interface InquiryForm {
  name: string;
  email: string;
  phone: string;
  startDate: string;
  endDate: string;
  message: string;
  deliveryRequested: boolean;
  deliveryStreet: string;
  deliveryPostalCode: string;
  deliveryCity: string;
  setupServiceRequested: boolean;
}

// Categories where "Betreuung / Auf- & Abbau" makes sense (event-related)
const SETUP_SERVICE_CATEGORIES = [
  'beleuchtung', 'beschallung', 'moebel-zelte', 'buehne', 'traversen-rigging',
  'spezialeffekte', 'geschirr-glaeser-besteck', 'huepfburgen', 'kommunikation',
];

export function ProductBookingDialog({ 
  product, 
  location, 
  isOpen, 
  onClose,
  categoryId,
}: ProductBookingDialogProps) {
  const articleId = product?.rentwareCode?.[location?.id || ""];
  const containerId = `rentware-dialog-${product?.id || "unknown"}`;
  const [widgetLoading, setWidgetLoading] = useState(true);
  const showSetupService = categoryId ? SETUP_SERVICE_CATEGORIES.includes(categoryId) : false;
  const defaultForm: InquiryForm = {
    name: "", email: "", phone: "", startDate: "", endDate: "", message: "",
    deliveryRequested: false, deliveryStreet: "", deliveryPostalCode: "", deliveryCity: "",
    setupServiceRequested: false,
  };
  const [form, setForm] = useState<InquiryForm>(defaultForm);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Inject Rentware widget when dialog opens
  useEffect(() => {
    if (!isOpen || !articleId) return;
    
    setWidgetLoading(true);
    
    const mountWidget = () => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = `<rtr-article-booking article-id="${articleId}" view="calendar"></rtr-article-booking>`;
        setWidgetLoading(false);
      }
    };
    
    if (customElements.get('rtr-article-booking')) {
      const timer = setTimeout(mountWidget, 50);
      return () => clearTimeout(timer);
    } else {
      let attempts = 0;
      const maxAttempts = 50;
      const interval = setInterval(() => {
        attempts++;
        if (customElements.get('rtr-article') || attempts >= maxAttempts) {
          clearInterval(interval);
          mountWidget();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isOpen, articleId, containerId]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = '';
      setWidgetLoading(true);
      setSent(false);
      setForm(defaultForm);
    }
  }, [isOpen, containerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !location) return;
    setSending(true);

    try {
      const { error } = await supabase.functions.invoke("send-inquiry-email", {
        body: {
          productName: product.name,
          locationName: location.name,
          locationEmail: location.email,
          locationPhone: location.phone,
          locationAddress: location.address,
          ...form,
        },
      });

      if (error) throw error;
      setSent(true);
      toast.success("Anfrage erfolgreich gesendet!");
    } catch (err) {
      console.error("Inquiry error:", err);
      toast.error("Fehler beim Senden. Bitte kontaktiere uns direkt.");
    } finally {
      setSending(false);
    }
  };

  if (!product || !location) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {articleId ? (
          // Show Rentware widget when available
          <div className="relative">
            {widgetLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <div 
              id={containerId}
              className="min-h-[500px] p-4"
            />
          </div>
        ) : (
          // "Auf Anfrage" inquiry form
          <>
            <DialogHeader className="p-6 pb-4 border-b border-border">
              <div className="flex items-start gap-4">
                {product.image && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <DialogTitle className="text-xl font-bold pr-6">
                    {product.name}
                  </DialogTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1.5 bg-accent/20 text-accent-foreground text-xs font-medium px-2.5 py-1 rounded-full border border-accent/30">
                      <Calendar className="h-3 w-3" />
                      Auf Anfrage – {location.name}
                    </span>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-5">
              {sent ? (
                <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Anfrage gesendet!</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Wir prüfen die Verfügbarkeit von <strong>{product.name}</strong> in {location.name} und melden uns schnellstmöglich bei dir.
                </p>
                  <Button variant="outline" onClick={onClose} className="mt-2">Schließen</Button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Dieses Produkt ist in <strong>{location.name}</strong> auf Anfrage verfügbar – wir können alle Artikel zwischen unseren Standorten transportieren. Sende uns deine Anfrage und wir melden uns innerhalb eines Werktages.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="inq-name">Name *</Label>
                        <Input
                          id="inq-name"
                          required
                          placeholder="Vor- und Nachname"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="inq-phone">Telefon</Label>
                        <Input
                          id="inq-phone"
                          type="tel"
                          placeholder="+49 ..."
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="inq-email">E-Mail *</Label>
                      <Input
                        id="inq-email"
                        type="email"
                        required
                        placeholder="deine@email.de"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="inq-start">Gewünschtes Startdatum</Label>
                        <Input
                          id="inq-start"
                          type="date"
                          value={form.startDate}
                          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="inq-end">Rückgabedatum</Label>
                        <Input
                          id="inq-end"
                          type="date"
                          value={form.endDate}
                          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="inq-message">Nachricht / weitere Angaben</Label>
                      <Textarea
                        id="inq-message"
                        rows={3}
                        placeholder="z. B. Menge, besondere Anforderungen..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                      />
                    </div>

                    {/* Delivery section */}
                    <div className="space-y-3 border border-border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="inq-delivery"
                          checked={form.deliveryRequested}
                          onCheckedChange={(checked) =>
                            setForm({ ...form, deliveryRequested: checked === true })
                          }
                        />
                        <Label htmlFor="inq-delivery" className="flex items-center gap-2 cursor-pointer font-medium">
                          <Truck className="h-4 w-4 text-primary" />
                          Lieferung gewünscht
                        </Label>
                      </div>

                      {form.deliveryRequested && (
                        <div className="space-y-3 pt-1">
                          <div className="space-y-1.5">
                            <Label htmlFor="inq-del-street">Straße + Hausnummer *</Label>
                            <Input
                              id="inq-del-street"
                              required
                              placeholder="Musterstraße 123"
                              value={form.deliveryStreet}
                              onChange={(e) => setForm({ ...form, deliveryStreet: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-[120px_1fr] gap-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="inq-del-plz">PLZ *</Label>
                              <Input
                                id="inq-del-plz"
                                required
                                placeholder="12345"
                                value={form.deliveryPostalCode}
                                onChange={(e) => setForm({ ...form, deliveryPostalCode: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="inq-del-city">Ort *</Label>
                              <Input
                                id="inq-del-city"
                                required
                                placeholder="Musterstadt"
                                value={form.deliveryCity}
                                onChange={(e) => setForm({ ...form, deliveryCity: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Setup & supervision service - only for event categories */}
                    {showSetupService && (
                      <div className="flex items-center gap-3 border border-border rounded-lg p-4 bg-muted/30">
                        <Checkbox
                          id="inq-setup"
                          checked={form.setupServiceRequested}
                          onCheckedChange={(checked) =>
                            setForm({ ...form, setupServiceRequested: checked === true })
                          }
                        />
                        <Label htmlFor="inq-setup" className="flex items-center gap-2 cursor-pointer font-medium">
                          <Wrench className="h-4 w-4 text-primary" />
                          Betreuung / Auf- & Abbau gewünscht
                        </Label>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={sending}
                    >
                      {sending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Wird gesendet...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Anfrage senden
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Direct contact fallback */}
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center mb-3">Oder direkt kontaktieren:</p>
                    <div className="flex justify-center gap-3">
                      <a href={`tel:${location.phone.replace(/\s/g, '')}`}>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          {location.phone}
                        </Button>
                      </a>
                      <a href={`mailto:${location.email}`}>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          E-Mail
                        </Button>
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
