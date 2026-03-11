import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileSignature, Download } from "lucide-react";
import type { DeviceConditionData } from "@/utils/deliveryNoteBlankPdf";

interface DeliveryNoteItem {
  product_name: string;
  quantity: number;
  description?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliveryNoteNumber: string;
  items: DeliveryNoteItem[];
  mode: "download" | "send";
  onConfirm: (condition: DeviceConditionData) => void;
  loading?: boolean;
}

export function DeviceConditionDialog({
  open,
  onOpenChange,
  deliveryNoteNumber,
  items,
  mode,
  onConfirm,
  loading,
}: Props) {
  const [meterReading, setMeterReading] = useState("");
  const [fuelLevel, setFuelLevel] = useState("");
  const [cleanliness, setCleanliness] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const handleConfirm = () => {
    onConfirm({
      meter_reading: meterReading,
      fuel_level: fuelLevel,
      cleanliness,
      additional_notes: additionalNotes,
    });
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setMeterReading("");
      setFuelLevel("");
      setCleanliness("");
      setAdditionalNotes("");
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "send" ? (
              <FileSignature className="h-5 w-5" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            {mode === "send"
              ? "Zur Unterschrift versenden"
              : "Blanko PDF herunterladen"}
          </DialogTitle>
          <DialogDescription>
            Protokoll <strong>{deliveryNoteNumber}</strong> — Bitte Gerätezustand
            eintragen, bevor das PDF erstellt wird.
          </DialogDescription>
        </DialogHeader>

        {/* Items list */}
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              Mietgegenstände im Protokoll
            </Label>
            <div className="mt-1.5 border rounded-lg divide-y">
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground p-3">
                  Keine Artikel hinterlegt.
                </p>
              ) : (
                items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
                    <span className="font-medium text-muted-foreground w-8">
                      {item.quantity}x
                    </span>
                    <span className="flex-1">
                      {item.product_name}
                      {item.description && (
                        <span className="text-muted-foreground">
                          {" "}
                          – {item.description}
                        </span>
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Condition fields */}
          <div className="grid gap-3">
            <div>
              <Label htmlFor="meter_reading">Betriebsstunden</Label>
              <Input
                id="meter_reading"
                placeholder="z.B. 1.250 h"
                value={meterReading}
                onChange={(e) => setMeterReading(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="fuel_level">Tankfüllstand</Label>
              <Select value={fuelLevel} onValueChange={setFuelLevel}>
                <SelectTrigger id="fuel_level">
                  <SelectValue placeholder="Tankfüllstand auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Voll">Voll</SelectItem>
                  <SelectItem value="3/4">3/4</SelectItem>
                  <SelectItem value="1/2">1/2</SelectItem>
                  <SelectItem value="1/4">1/4</SelectItem>
                  <SelectItem value="Leer">Leer</SelectItem>
                  <SelectItem value="N/A">Nicht zutreffend</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cleanliness">Sauberkeit (1–5)</Label>
              <Select value={cleanliness} onValueChange={setCleanliness}>
                <SelectTrigger id="cleanliness">
                  <SelectValue placeholder="Bewertung auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 – Sehr sauber">1 – Sehr sauber</SelectItem>
                  <SelectItem value="2 – Sauber">2 – Sauber</SelectItem>
                  <SelectItem value="3 – Akzeptabel">3 – Akzeptabel</SelectItem>
                  <SelectItem value="4 – Verschmutzt">4 – Verschmutzt</SelectItem>
                  <SelectItem value="5 – Stark verschmutzt">5 – Stark verschmutzt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="additional_notes">Sonstige Anmerkungen</Label>
              <Textarea
                id="additional_notes"
                placeholder="Optionale Anmerkungen zum Gerätezustand..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading
              ? "Wird erstellt..."
              : mode === "send"
              ? "PDF erstellen & versenden"
              : "PDF herunterladen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
