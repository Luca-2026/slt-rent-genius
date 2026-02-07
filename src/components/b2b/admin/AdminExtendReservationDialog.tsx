import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

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
}

interface Props {
  reservation: Reservation | null;
  companyName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function AdminExtendReservationDialog({ reservation, companyName, open, onOpenChange, onSaved }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [newEndDate, setNewEndDate] = useState<Date | undefined>();

  const handleSave = async () => {
    if (!reservation || !newEndDate) return;
    setSaving(true);

    const { error } = await supabase
      .from("b2b_reservations")
      .update({ end_date: newEndDate.toISOString().split("T")[0] })
      .eq("id", reservation.id);

    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Mietvertrag verlängert", description: `Neues Enddatum: ${format(newEndDate, "dd.MM.yyyy", { locale: de })}` });
      onSaved();
      onOpenChange(false);
    }
    setSaving(false);
  };

  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mietvertrag verlängern</DialogTitle>
          <DialogDescription>Enddatum für diese Miete anpassen.</DialogDescription>
        </DialogHeader>
        {reservation && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-1">
                <p className="font-semibold">{reservation.product_name || reservation.product_id}</p>
                {companyName && <p className="text-sm text-muted-foreground">Kunde: {companyName}</p>}
                <p className="text-sm text-muted-foreground">
                  Standort: {reservation.location} · Menge: {reservation.quantity}
                </p>
                <p className="text-sm text-muted-foreground">
                  Aktueller Zeitraum: {formatDate(reservation.start_date)}
                  {reservation.end_date ? ` – ${formatDate(reservation.end_date)}` : " (offen)"}
                </p>
              </CardContent>
            </Card>

            <div>
              <label className="block text-sm font-medium mb-1.5">Neues Enddatum</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !newEndDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newEndDate ? format(newEndDate, "PPP", { locale: de }) : "Datum wählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newEndDate}
                    onSelect={setNewEndDate}
                    initialFocus
                    disabled={(date) => date < new Date(reservation.start_date)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
              <Button
                onClick={handleSave}
                disabled={saving || !newEndDate}
                className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
              >
                {saving ? "Wird gespeichert..." : "Verlängern"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
