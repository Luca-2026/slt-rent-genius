import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, Package, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ProductAutocomplete } from "./ProductAutocomplete";
import { DEPOSIT_OPTIONS, ADDITIONAL_SERVICES, getServicesForCategory, calculateServicesSurcharge } from "@/data/additionalServices";

interface B2BProfile {
  id: string;
  company_name: string;
  user_id?: string;
}

interface ProductItem {
  id: string;
  productName: string;
  productId: string;
  categorySlug: string;
  quantity: number;
  price: number;
}

interface Props {
  profiles: B2BProfile[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

let itemCounter = 0;
function createEmptyItem(): ProductItem {
  return {
    id: `item-${++itemCounter}`,
    productName: "",
    productId: "",
    categorySlug: "",
    quantity: 1,
    price: 0,
  };
}

export function AdminCreateReservationDialog({ profiles, open, onOpenChange, onCreated }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [items, setItems] = useState<ProductItem[]>([createEmptyItem()]);
  const [location, setLocation] = useState("krefeld");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [deliveryCost, setDeliveryCost] = useState<number>(0);
  const [deposit, setDeposit] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());

  const resetForm = () => {
    setSelectedProfileId("");
    setItems([createEmptyItem()]);
    setLocation("krefeld");
    setStartDate(undefined);
    setEndDate(undefined);
    setStartTime("");
    setEndTime("");
    setDeliveryCost(0);
    setDeposit("");
    setNotes("");
    setSelectedServices(new Set());
  };

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.length > 1 ? prev.filter((i) => i.id !== id) : prev);
  };

  const updateItem = (id: string, updates: Partial<ProductItem>) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, ...updates } : item));
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

  // Calculate totals
  const baseItemTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Determine category from first item for services
  const primaryCategorySlug = items[0]?.categorySlug || "";
  const relevantServices = getServicesForCategory(primaryCategorySlug);
  const { total: servicesSurcharge, breakdown: servicesBreakdown } = calculateServicesSurcharge(selectedServices, baseItemTotal);

  const handleCreate = async () => {
    const profile = profiles.find((p) => p.id === selectedProfileId);
    const validItems = items.filter((i) => i.productName.trim());

    if (!profile || validItems.length === 0 || !startDate) {
      toast({ title: "Fehler", description: "Bitte fülle alle Pflichtfelder aus (Kunde, min. 1 Produkt, Startdatum).", variant: "destructive" });
      return;
    }

    setSaving(true);

    const { data: profileData } = await supabase
      .from("b2b_profiles")
      .select("user_id")
      .eq("id", selectedProfileId)
      .single();

    if (!profileData) {
      toast({ title: "Fehler", description: "Kundenprofil nicht gefunden.", variant: "destructive" });
      setSaving(false);
      return;
    }

    // Build additional services array
    const servicesArray = selectedServices.size > 0
      ? ADDITIONAL_SERVICES.filter((s) => selectedServices.has(s.id)).map((s) => {
          const surcharge = s.pricePercent !== null
            ? Math.round(baseItemTotal * (s.pricePercent / 100) * 100) / 100
            : 0;
          return {
            id: s.id,
            name: s.name,
            description: s.description,
            pricePercent: s.pricePercent,
            calculatedAmount: surcharge,
          };
        })
      : null;

    // Build time notes
    const timeInfo = [
      startTime ? `Abholung: ${startTime} Uhr` : "",
      endTime ? `Rückgabe: ${endTime} Uhr` : "",
    ].filter(Boolean).join(" · ");

    const fullNotes = [timeInfo, notes].filter(Boolean).join("\n") || null;

    // Create one reservation per product item
    const reservationsToInsert = validItems.map((item) => ({
      b2b_profile_id: selectedProfileId,
      user_id: profileData.user_id,
      product_name: item.productName,
      product_id: item.productId || item.productName.toLowerCase().replace(/\s+/g, "-"),
      category_slug: item.categorySlug || null,
      location,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate?.toISOString().split("T")[0] || null,
      start_time: startTime || null,
      end_time: endTime || null,
      quantity: item.quantity,
      original_price: item.price > 0 ? item.price : null,
      deposit: deposit && deposit !== "none" ? Number(deposit) : null,
      additional_services: servicesArray,
      status: "pending" as const,
      notes: fullNotes,
    }));

    const { error } = await supabase.from("b2b_reservations").insert(reservationsToInsert as any);

    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      const productNames = validItems.map((i) => i.productName).join(", ");
      toast({
        title: `${validItems.length} Mietvorgang${validItems.length > 1 ? "e" : ""} erstellt`,
        description: `${productNames} für ${profile.company_name}`,
      });
      resetForm();
      onCreated();
      onOpenChange(false);
    }
    setSaving(false);
  };

  const approvedProfiles = profiles.filter((p: any) => p.status === "approved");

  const formatCurrency = (n: number) =>
    n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Mietvorgang anlegen
          </DialogTitle>
          <DialogDescription>
            Erstelle einen oder mehrere Mietvorgänge für einen bestehenden Kunden.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer */}
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
          </div>

          {/* Product Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Produkte *</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addItem} className="h-7 text-xs gap-1">
                <Plus className="h-3.5 w-3.5" />
                Produkt hinzufügen
              </Button>
            </div>

            {items.map((item, index) => (
              <Card key={item.id} className="border-dashed">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Artikel {index + 1}</span>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <ProductAutocomplete
                    value={item.productName}
                    onChange={(name, id, cat) => updateItem(item.id, { productName: name, productId: id, categorySlug: cat })}
                    location={location}
                    placeholder="Produktname eingeben..."
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Menge</Label>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Preis (€ netto)</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.price}
                        onChange={(e) => updateItem(item.id, { price: Number(e.target.value) })}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {baseItemTotal > 0 && (
              <div className="text-right text-sm font-medium text-muted-foreground">
                Artikel gesamt: {formatCurrency(baseItemTotal)}
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <Label>Standort *</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="krefeld">Krefeld</SelectItem>
                <SelectItem value="bonn">Bonn</SelectItem>
                <SelectItem value="muelheim">Mülheim</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Startdatum *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd.MM.yy", { locale: de }) : "Start"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="p-3 pointer-events-auto" /></PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Enddatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd.MM.yy", { locale: de }) : "Ende"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="p-3 pointer-events-auto" /></PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Uhrzeit (von)</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <Label>Uhrzeit (bis)</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          {/* Delivery & Deposit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Lieferkosten (€ netto)</Label>
              <Input type="number" min={0} step={0.01} value={deliveryCost} onChange={(e) => setDeliveryCost(Number(e.target.value))} />
            </div>
            <div>
              <Label>Kaution (€)</Label>
              <Select value={deposit} onValueChange={setDeposit}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
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
              <Label className="mb-2 block">Zusatzoptionen</Label>
              <div className="space-y-2 rounded-md border p-3 bg-muted/30">
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
                          <p className="text-sm font-medium">{service.name}</p>
                          {service.pricePercent !== null && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {service.pricePercent}% {selectedServices.has(service.id) && baseItemTotal > 0 && surchargeEntry
                                ? `(${formatCurrency(surchargeEntry.amount)})`
                                : ""}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{service.description}</p>
                      </div>
                    </label>
                  );
                })}
                {servicesSurcharge > 0 && (
                  <div className="pt-2 border-t mt-2 flex justify-between text-sm font-medium">
                    <span>Zusatzkosten gesamt:</span>
                    <span>{formatCurrency(servicesSurcharge)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label>Anmerkungen</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Interne Notizen..." rows={2} />
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={handleCreate} disabled={saving} className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
            {saving ? "Wird erstellt..." : items.filter((i) => i.productName.trim()).length > 1
              ? `${items.filter((i) => i.productName.trim()).length} Mietvorgänge erstellen`
              : "Mietvorgang erstellen"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
