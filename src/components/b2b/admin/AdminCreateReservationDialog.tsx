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
import { CalendarIcon, Package } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ProductAutocomplete } from "./ProductAutocomplete";
import { DEPOSIT_OPTIONS, ADDITIONAL_SERVICES, getServicesForCategory } from "@/data/additionalServices";

interface B2BProfile {
  id: string;
  company_name: string;
  user_id?: string;
}

interface Props {
  profiles: B2BProfile[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function AdminCreateReservationDialog({ profiles, open, onOpenChange, onCreated }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [productName, setProductName] = useState("");
  const [productId, setProductId] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [location, setLocation] = useState("krefeld");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [deposit, setDeposit] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());

  const resetForm = () => {
    setSelectedProfileId("");
    setProductName("");
    setProductId("");
    setCategorySlug("");
    setLocation("krefeld");
    setStartDate(undefined);
    setEndDate(undefined);
    setStartTime("");
    setEndTime("");
    setQuantity(1);
    setOriginalPrice(0);
    setDeposit("");
    setNotes("");
    setSelectedServices(new Set());
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      // MBV options are mutually exclusive
      if (serviceId.startsWith("mbv-")) {
        // Remove all other MBV options
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

  const handleCreate = async () => {
    const profile = profiles.find((p) => p.id === selectedProfileId);
    if (!profile || !productName || !startDate) {
      toast({ title: "Fehler", description: "Bitte fülle alle Pflichtfelder aus.", variant: "destructive" });
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
      ? ADDITIONAL_SERVICES.filter((s) => selectedServices.has(s.id)).map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
        }))
      : null;

    // Build time notes
    const timeInfo = [
      startTime ? `Abholung: ${startTime} Uhr` : "",
      endTime ? `Rückgabe: ${endTime} Uhr` : "",
    ].filter(Boolean).join(" · ");

    const fullNotes = [timeInfo, notes].filter(Boolean).join("\n") || null;

    const { error } = await supabase.from("b2b_reservations").insert({
      b2b_profile_id: selectedProfileId,
      user_id: profileData.user_id,
      product_name: productName,
      product_id: productId || productName.toLowerCase().replace(/\s+/g, "-"),
      category_slug: categorySlug || null,
      location,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate?.toISOString().split("T")[0] || null,
      start_time: startTime || null,
      end_time: endTime || null,
      quantity,
      original_price: originalPrice > 0 ? originalPrice : null,
      deposit: deposit ? Number(deposit) : null,
      additional_services: servicesArray,
      status: "pending",
      notes: fullNotes,
    } as any);

    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Mietanfrage erstellt", description: `${productName} für ${profile.company_name}` });
      resetForm();
      onCreated();
      onOpenChange(false);
    }
    setSaving(false);
  };

  const approvedProfiles = profiles.filter((p: any) => p.status === "approved");
  const relevantServices = getServicesForCategory(categorySlug);

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Mietprodukt anlegen
          </DialogTitle>
          <DialogDescription>
            Erstelle eine Mietanfrage für einen bestehenden Kunden (z.B. Vor-Ort-Miete).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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

          <div>
            <Label>Produktname *</Label>
            <ProductAutocomplete
              value={productName}
              onChange={(name, id, cat) => {
                setProductName(name);
                setProductId(id);
                setCategorySlug(cat);
              }}
              location={location}
            />
          </div>

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
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus /></PopoverContent>
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
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus /></PopoverContent>
              </Popover>
            </div>
          </div>

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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Menge</Label>
              <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            </div>
            <div>
              <Label>Preis (€ netto)</Label>
              <Input type="number" min={0} step={0.01} value={originalPrice} onChange={(e) => setOriginalPrice(Number(e.target.value))} />
            </div>
            <div>
              <Label>Kaution (€)</Label>
              <Select value={deposit} onValueChange={setDeposit}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Keine</SelectItem>
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
                {relevantServices.map((service) => (
                  <label key={service.id} className="flex items-start gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedServices.has(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">{service.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Anmerkungen</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Interne Notizen..." rows={2} />
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={handleCreate} disabled={saving} className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
            {saving ? "Wird erstellt..." : "Mietanfrage erstellen"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
