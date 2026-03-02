import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ShoppingCart, Send, CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PurchaseInquiryBannerProps {
  productName: string;
  locationName: string;
  categoryId?: string;
}

export function PurchaseInquiryBanner({ productName, locationName, categoryId }: PurchaseInquiryBannerProps) {
  const [popupOpen, setPopupOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (sessionStorage.getItem("purchasePopupShown")) return;
    const timer = setTimeout(() => {
      setPopupOpen(true);
      sessionStorage.setItem("purchasePopupShown", "1");
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("project_requests").insert({
        project_name: `Kaufanfrage: ${productName}`,
        equipment_needed: productName,
        project_description: `Kaufanfrage von ${form.name} (${form.email}, ${form.phone}).\n\nStandort: ${locationName}\n\nNachricht: ${form.message || "Keine zusätzliche Nachricht."}`,
        site_street: "-",
        site_postal_code: "-",
        site_city: locationName,
        start_date: new Date().toISOString().split("T")[0],
        user_id: "00000000-0000-0000-0000-000000000000",
      });

      if (error) throw error;
      setIsSuccess(true);
    } catch (err) {
      console.error("Purchase inquiry error:", err);
      toast({
        title: "Fehler",
        description: "Die Anfrage konnte nicht gesendet werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Clickable banner on the page */}
      <div
        className="bg-accent/10 border border-accent/30 rounded-xl p-4 cursor-pointer hover:bg-accent/15 transition-colors group"
        onClick={() => setFormOpen(true)}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="h-4 w-4 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm">
              Lieber kaufen statt mieten?
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Alle Artikel können Sie bei uns auch zu besten Konditionen erwerben! Klicken Sie hier für eine unverbindliche Kaufanfrage.
            </p>
          </div>
        </div>
      </div>

      {/* Auto-popup after 2.5s — info only, no form */}
      <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-accent" />
              Lieber kaufen statt mieten?
            </DialogTitle>
            <DialogDescription>
              Alle Artikel können Sie bei uns auch zu besten Konditionen erwerben!
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              Stellen Sie jetzt eine unverbindliche Kaufanfrage für <span className="font-medium text-foreground">{productName}</span>.
            </p>
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover"
              onClick={() => {
                setPopupOpen(false);
                setFormOpen(true);
              }}
            >
              <Send className="h-4 w-4 mr-2" />
              Jetzt Kaufanfrage stellen
            </Button>
            {(categoryId === "erdbewegung" || categoryId === "arbeitsbuehnen") && (
              <a
                href="https://www.zoomlion-nrw.de"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-primary hover:underline pt-1"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Zoomlion Neumaschinen auf www.zoomlion-nrw.de
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Form dialog — opens on button click */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-accent" />
              Kaufanfrage
            </DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">{productName}</span>
              <br />
              Alle Artikel können Sie bei uns auch zu besten Konditionen erwerben!
            </DialogDescription>
          </DialogHeader>

          {isSuccess ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Anfrage gesendet!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Vielen Dank für dein Interesse. Wir melden uns zeitnah mit einem Angebot bei dir.
              </p>
              <Button variant="outline" onClick={() => { setFormOpen(false); setIsSuccess(false); }}>
                Schließen
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purchase-name">Name / Firma *</Label>
                <Input
                  id="purchase-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Max Mustermann"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase-email">E-Mail *</Label>
                <Input
                  id="purchase-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="max@example.de"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase-phone">Telefon *</Label>
                <Input
                  id="purchase-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="0151 12345678"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase-message">Nachricht (optional)</Label>
                <Textarea
                  id="purchase-message"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="z. B. gewünschte Stückzahl, Fragen zum Zustand..."
                  rows={3}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Wird gesendet...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" /> Kaufanfrage senden</>
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
