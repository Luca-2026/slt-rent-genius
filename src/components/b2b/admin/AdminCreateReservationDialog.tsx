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
import { CalendarIcon, Package } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

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
  const [location, setLocation] = useState("krefeld");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [quantity, setQuantity] = useState(1);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setSelectedProfileId("");
    setProductName("");
    setProductId("");
    setLocation("krefeld");
    setStartDate(undefined);
    setEndDate(undefined);
    setQuantity(1);
    setOriginalPrice(0);
    setNotes("");
  };

  const handleCreate = async () => {
    const profile = profiles.find((p) => p.id === selectedProfileId);
    if (!profile || !productName || !startDate) {
      toast({ title: "Fehler", description: "Bitte fülle alle Pflichtfelder aus.", variant: "destructive" });
      return;
    }

    setSaving(true);

    // We need user_id - fetch it from the profile
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

    const { error } = await supabase.from("b2b_reservations").insert({
      b2b_profile_id: selectedProfileId,
      user_id: profileData.user_id,
      product_name: productName,
      product_id: productId || productName.toLowerCase().replace(/\s+/g, "-"),
      location,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate?.toISOString().split("T")[0] || null,
      quantity,
      original_price: originalPrice > 0 ? originalPrice : null,
      status: "pending",
      notes: notes || null,
    });

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
            <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="z.B. Minibagger 1,5t" />
          </div>

          <div>
            <Label>Produkt-ID</Label>
            <Input value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="Optional – wird automatisch generiert" />
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
              <Label>Menge</Label>
              <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            </div>
            <div>
              <Label>Preis (€ netto)</Label>
              <Input type="number" min={0} step={0.01} value={originalPrice} onChange={(e) => setOriginalPrice(Number(e.target.value))} />
            </div>
          </div>

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
