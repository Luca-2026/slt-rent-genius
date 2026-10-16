/**
 * Paket 3b: Artikelname und Beschreibung nur für dieses Angebot ändern.
 * Speichert in item.name_override / item.description_override (leer = Stammdaten).
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  masterName: string;
  masterDescription?: string;
  nameOverride?: string | null;
  descriptionOverride?: string | null;
  onSave: (values: { name_override: string | null; description_override: string | null }) => void;
}

export function ItemOverrideDialog({ open, onOpenChange, masterName, masterDescription, nameOverride, descriptionOverride, onSave }: Props) {
  const [name, setName] = useState(nameOverride ?? masterName);
  const [description, setDescription] = useState(descriptionOverride ?? masterDescription ?? "");

  useEffect(() => {
    if (!open) return;
    setName(nameOverride ?? masterName);
    setDescription(descriptionOverride ?? masterDescription ?? "");
  }, [open, nameOverride, descriptionOverride, masterName, masterDescription]);

  const save = () => {
    const n = name.trim();
    const d = description.trim();
    onSave({
      // Gleich wie Stammdaten bzw. leer → kein Override (NULL = Stammdaten).
      name_override: n && n !== masterName.trim() ? n : null,
      description_override: d && d !== (masterDescription ?? "").trim() ? d : null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Für diesen Auftrag bearbeiten</DialogTitle>
          <DialogDescription>Gilt nur für dieses Angebot. Der Stammartikel bleibt unverändert.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={200} />
            <p className="text-[11px] text-muted-foreground">Stammdaten: {masterName || "–"}</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Beschreibung</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={500} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => { onSave({ name_override: null, description_override: null }); onOpenChange(false); }}
          >
            Stammdaten verwenden
          </Button>
          <Button type="button" onClick={save}>Übernehmen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
