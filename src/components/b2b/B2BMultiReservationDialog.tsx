import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/data/rentalData";
import { locations } from "@/data/rentalData";
import { CalendarDays, MapPin, Send, Package, Clock, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectedProduct {
  product: Product;
  categorySlug: string;
  quantity: number;
}

interface ItemDateOverride {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
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

  // Per-item date overrides
  const [itemOverrides, setItemOverrides] = useState<Record<string, ItemDateOverride>>({});
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  if (selectedProducts.length === 0) return null;

  const getQuantity = (productId: string) => quantities[productId] || 1;

  const setQuantity = (productId: string, qty: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(1, qty) }));
  };

  const toggleItemExpanded = (productId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        // Clear override when collapsing
        setItemOverrides((o) => {
          const copy = { ...o };
          delete copy[productId];
          return copy;
        });
      } else {
        next.add(productId);
        // Pre-fill with main dates
        setItemOverrides((o) => ({
          ...o,
          [productId]: {
            startDate: startDate,
            startTime: startTime,
            endDate: endDate,
            endTime: endTime,
          },
        }));
      }
      return next;
    });
  };

  const updateItemOverride = (productId: string, field: keyof ItemDateOverride, value: string) => {
    setItemOverrides((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const getEffectiveDates = (productId: string) => {
    const override = itemOverrides[productId];
    if (override && expandedItems.has(productId)) {
      return {
        startDate: override.startDate || startDate,
        startTime: override.startTime || startTime,
        endDate: override.endDate || endDate,
        endTime: override.endTime || endTime,
        hasOverride: !!(override.startDate || override.endDate),
      };
    }
    return { startDate, startTime, endDate, endTime, hasOverride: false };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !b2bProfile) return;

    if (!startDate) {
      toast({ title: "Bitte Hauptzeitraum-Startdatum angeben", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const batchId = `BATCH-${Date.now()}`;
      const batchNote = `Sammelanfrage ${batchId} (${selectedProducts.length} Artikel)`;

      const reservations = selectedProducts.map((sp) => {
        const dates = getEffectiveDates(sp.product.id);

        // Build per-item time notes
        const timeInfo = [
          dates.startTime ? `Abholung: ${dates.startTime} Uhr` : "",
          dates.endTime ? `Rückgabe: ${dates.endTime} Uhr` : "",
        ]
          .filter(Boolean)
          .join(" · ");

        // Build main time info only if no per-item override
        const mainTimeInfo = !dates.hasOverride
          ? [
              startTime ? `Abholung: ${startTime} Uhr` : "",
              endTime ? `Rückgabe: ${endTime} Uhr` : "",
            ]
              .filter(Boolean)
              .join(" · ")
          : "";

        const effectiveTimeInfo = dates.hasOverride ? timeInfo : mainTimeInfo;
        const fullNotes = [batchNote, effectiveTimeInfo, notes].filter(Boolean).join("\n") || null;

        return {
          b2b_profile_id: b2bProfile.id,
          user_id: user.id,
          product_id: sp.product.id,
          product_name: sp.product.name,
          category_slug: sp.categorySlug,
          location: locationId,
          start_date: dates.startDate,
          end_date: dates.endDate || null,
          quantity: getQuantity(sp.product.id),
          notes: fullNotes,
          status: "pending",
        };
      });

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
      setItemOverrides({});
      setExpandedItems(new Set());
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
            Stellen Sie eine gemeinsame Anfrage für alle ausgewählten Produkte. Optional können Sie pro Artikel einen abweichenden Mietzeitraum festlegen.
          </DialogDescription>
        </DialogHeader>

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

          {/* Main date range */}
          <div>
            <label className="block text-sm font-medium text-headline mb-2">
              <CalendarDays className="h-3.5 w-3.5 inline mr-1" />
              Hauptzeitraum
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Von *</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Uhrzeit (von)</label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Bis</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Uhrzeit (bis)</label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Selected products list with optional per-item dates */}
          <div>
            <label className="block text-sm font-medium text-headline mb-2">
              Ausgewählte Artikel
            </label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {selectedProducts.map((sp) => {
                const isExpanded = expandedItems.has(sp.product.id);
                const override = itemOverrides[sp.product.id];
                const hasCustomDates = isExpanded && override && (override.startDate || override.endDate);

                return (
                  <div
                    key={sp.product.id}
                    className={cn(
                      "rounded-lg border transition-colors",
                      isExpanded ? "border-accent/40 bg-accent/5" : "border-border bg-muted/50"
                    )}
                  >
                    {/* Product row */}
                    <div className="flex items-center gap-3 p-2.5">
                      <img
                        src={sp.product.image || "/placeholder.svg"}
                        alt={sp.product.name}
                        className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-headline truncate">
                          {sp.product.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          {sp.product.pricePerDay && (
                            <p className="text-xs text-muted-foreground">{sp.product.pricePerDay}</p>
                          )}
                          {hasCustomDates && (
                            <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded font-medium">
                              Eigener Zeitraum
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          min={1}
                          value={getQuantity(sp.product.id)}
                          onChange={(e) => setQuantity(sp.product.id, parseInt(e.target.value) || 1)}
                          className="w-16 h-8 text-center text-sm"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-headline"
                          onClick={() => toggleItemExpanded(sp.product.id)}
                          title="Eigenen Mietzeitraum festlegen"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <CalendarDays className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <button
                          type="button"
                          onClick={() => onRemoveProduct(sp.product.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Per-item date override */}
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-2">
                          Abweichender Zeitraum für diesen Artikel (leer = Hauptzeitraum)
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] text-muted-foreground mb-0.5">Von</label>
                            <Input
                              type="date"
                              value={override?.startDate || ""}
                              onChange={(e) => updateItemOverride(sp.product.id, "startDate", e.target.value)}
                              min={new Date().toISOString().split("T")[0]}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-muted-foreground mb-0.5">Uhrzeit</label>
                            <Input
                              type="time"
                              value={override?.startTime || ""}
                              onChange={(e) => updateItemOverride(sp.product.id, "startTime", e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-muted-foreground mb-0.5">Bis</label>
                            <Input
                              type="date"
                              value={override?.endDate || ""}
                              onChange={(e) => updateItemOverride(sp.product.id, "endDate", e.target.value)}
                              min={override?.startDate || startDate || new Date().toISOString().split("T")[0]}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-muted-foreground mb-0.5">Uhrzeit</label>
                            <Input
                              type="time"
                              value={override?.endTime || ""}
                              onChange={(e) => updateItemOverride(sp.product.id, "endTime", e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
