import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/data/rentalData";
import { locations } from "@/data/rentalData";
import { CalendarDays, MapPin, Send, Package, Clock, X, Trash2 } from "lucide-react";

interface SelectedProduct {
  product: Product;
  categorySlug: string;
  quantity: number;
}

interface B2BMultiReservationDialogProps {
  selectedProducts: SelectedProduct[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedLocation?: string;
  onSuccess: () => void;
  onRemoveProduct: (productId: string) => void;
}

export function B2BMultiReservationDialog({
  selectedProducts,
  open,
  onOpenChange,
  preselectedLocation,
  onSuccess,
  onRemoveProduct,
}: B2BMultiReservationDialogProps) {
  const { user, b2bProfile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationId, setLocationId] = useState(preselectedLocation || "krefeld");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  if (selectedProducts.length === 0) return null;

  const getQuantity = (productId: string) => quantities[productId] || 1;

  const setQuantity = (productId: string, qty: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(1, qty) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !b2bProfile) return;

    if (!startDate) {
      toast({ title: "Bitte Startdatum angeben", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Build notes with time info
      const timeInfo = [
        startTime ? `Abholung: ${startTime} Uhr` : "",
        endTime ? `Rückgabe: ${endTime} Uhr` : "",
      ]
        .filter(Boolean)
        .join(" · ");

      // Create a batch ID so admin can see these belong together
      const batchId = `BATCH-${Date.now()}`;
      const batchNote = `Sammelanfrage ${batchId} (${selectedProducts.length} Artikel)`;
      const fullNotes = [batchNote, timeInfo, notes].filter(Boolean).join("\n") || null;

      // Insert all reservations in one batch
      const reservations = selectedProducts.map((sp) => ({
        b2b_profile_id: b2bProfile.id,
        user_id: user.id,
        product_id: sp.product.id,
        product_name: sp.product.name,
        category_slug: sp.categorySlug,
        location: locationId,
        start_date: startDate,
        end_date: endDate || null,
        quantity: getQuantity(sp.product.id),
        notes: fullNotes,
        status: "pending",
      }));

      const { error } = await supabase.from("b2b_reservations").insert(reservations as any);

      if (error) throw error;

      toast({
        title: "Sammelanfrage gesendet!",
        description: `${selectedProducts.length} Artikel wurden als Anfrage übermittelt. Wir melden uns in Kürze.`,
      });

      onOpenChange(false);
      onSuccess();

      // Reset form
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
      setNotes("");
      setQuantities({});
    } catch (error: any) {
      toast({
        title: "Fehler beim Senden",
        description: error.message || "Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Sammelanfrage ({selectedProducts.length} Artikel)
          </DialogTitle>
          <DialogDescription>
            Stellen Sie eine gemeinsame Anfrage für alle ausgewählten Produkte.
          </DialogDescription>
        </DialogHeader>

        {/* Selected products list */}
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {selectedProducts.map((sp) => (
            <div
              key={sp.product.id}
              className="flex items-center gap-3 p-2.5 bg-muted/50 rounded-lg"
            >
              <img
                src={sp.product.image || "/placeholder.svg"}
                alt={sp.product.name}
                className="w-12 h-12 object-cover rounded-md flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-headline truncate">
                  {sp.product.name}
                </h4>
                {sp.product.pricePerDay && (
                  <p className="text-xs text-muted-foreground">{sp.product.pricePerDay}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={getQuantity(sp.product.id)}
                  onChange={(e) => setQuantity(sp.product.id, parseInt(e.target.value) || 1)}
                  className="w-16 h-8 text-center text-sm"
                />
                <button
                  type="button"
                  onClick={() => onRemoveProduct(sp.product.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-headline mb-1.5">
              <MapPin className="h-3.5 w-3.5 inline mr-1" />
              Standort
            </label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name} – {loc.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates & Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-headline mb-1.5">
                <CalendarDays className="h-3.5 w-3.5 inline mr-1" />
                Von *
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-headline mb-1.5">
                <Clock className="h-3.5 w-3.5 inline mr-1" />
                Uhrzeit (von)
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-headline mb-1.5">
                <CalendarDays className="h-3.5 w-3.5 inline mr-1" />
                Bis
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-headline mb-1.5">
                <Clock className="h-3.5 w-3.5 inline mr-1" />
                Uhrzeit (bis)
              </label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-headline mb-1.5">
              Anmerkungen
            </label>
            <Textarea
              placeholder="z.B. gewünschte Lieferung, spezielle Anforderungen..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Wird gesendet..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {selectedProducts.length} Artikel anfragen
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
