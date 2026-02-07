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
import { CalendarDays, MapPin, Send, Package } from "lucide-react";

interface B2BReservationDialogProps {
  product: Product | null;
  categorySlug: string;
  discountPercent: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedLocation?: string;
}

export function B2BReservationDialog({
  product,
  categorySlug,
  discountPercent,
  open,
  onOpenChange,
  preselectedLocation,
}: B2BReservationDialogProps) {
  const { user, b2bProfile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationId, setLocationId] = useState(preselectedLocation || "krefeld");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !b2bProfile) return;

    if (!startDate) {
      toast({ title: "Bitte Startdatum angeben", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("b2b_reservations").insert({
        b2b_profile_id: b2bProfile.id,
        user_id: user.id,
        product_id: product.id,
        product_name: product.name,
        category_slug: categorySlug,
        location: locationId,
        start_date: startDate,
        end_date: endDate || null,
        quantity: parseInt(quantity) || 1,
        notes: notes || null,
        status: "pending",
      } as any);

      if (error) throw error;

      toast({
        title: "Anfrage gesendet!",
        description: `Ihre Anfrage für "${product.name}" wurde übermittelt. Wir melden uns in Kürze.`,
      });
      onOpenChange(false);
      // Reset form
      setStartDate("");
      setEndDate("");
      setQuantity("1");
      setNotes("");
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Produktanfrage
          </DialogTitle>
          <DialogDescription>
            Stellen Sie eine Anfrage für das gewünschte Produkt. Wir erstellen Ihnen ein individuelles Angebot.
          </DialogDescription>
        </DialogHeader>

        {/* Product info */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-16 h-16 object-cover rounded-md"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-headline truncate">{product.name}</h4>
            {product.description && (
              <p className="text-xs text-muted-foreground truncate">{product.description}</p>
            )}
            {discountPercent > 0 && (
              <span className="text-xs font-medium text-accent">
                {discountPercent}% B2B-Rabatt
              </span>
            )}
          </div>
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

          {/* Dates */}
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
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-headline mb-1.5">
              Menge
            </label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
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
                Anfrage absenden
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
