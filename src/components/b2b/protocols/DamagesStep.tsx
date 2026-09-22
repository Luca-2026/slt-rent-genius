/**
 * Schritt „Schäden erfassen" – strukturierte Schäden mit Kategorie, Artikelbezug,
 * Beschreibung, Fotos und optionalem Betrag.
 */
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Camera, Plus, Trash2, Upload, X } from "lucide-react";
import {
  DAMAGE_CATEGORIES, emptyDamage, formatEuro, sumDamages, type ProtocolDamage,
} from "./protocolShared";

interface Props {
  damages: ProtocolDamage[];
  onChange: (damages: ProtocolDamage[]) => void;
  itemNames: string[];
  /** Überschrift-Zusatz, z. B. „bei Übergabe" oder „bei Rückgabe" */
  context: string;
  showAmounts?: boolean;
}

export function DamagesStep({ damages, onChange, itemNames, context, showAmounts = false }: Props) {
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const update = (id: string, patch: Partial<ProtocolDamage>) =>
    onChange(damages.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const remove = (id: string) => onChange(damages.filter((d) => d.id !== id));

  const addPhotos = (id: string, files: FileList | null) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    const damage = damages.find((d) => d.id === id);
    if (!damage) return;
    update(id, {
      photos: [...damage.photos, ...list.map((file) => ({ file, preview: URL.createObjectURL(file) }))],
    });
  };

  const removePhoto = (id: string, index: number) => {
    const damage = damages.find((d) => d.id === id);
    if (!damage) return;
    URL.revokeObjectURL(damage.photos[index].preview);
    update(id, { photos: damage.photos.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Schäden {context}. Jeder Schaden kann klassifiziert, beschrieben und mit Fotos belegt werden.
      </p>

      {damages.map((damage, idx) => (
        <Card key={damage.id}>
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Schaden {idx + 1}</p>
              <Button variant="ghost" size="sm" onClick={() => remove(damage.id)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Betroffener Artikel</Label>
                {itemNames.length > 0 ? (
                  <Select value={damage.itemName} onValueChange={(v) => update(damage.id, { itemName: v })}>
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue placeholder="Artikel wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemNames.map((name) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={damage.itemName}
                    onChange={(e) => update(damage.id, { itemName: e.target.value })}
                    className="text-sm"
                  />
                )}
              </div>
              <div>
                <Label className="text-xs">Kategorie</Label>
                <Select value={damage.category} onValueChange={(v) => update(damage.id, { category: v })}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAMAGE_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Beschreibung</Label>
              <Textarea
                value={damage.description}
                onChange={(e) => update(damage.id, { description: e.target.value })}
                placeholder="Wo und wie stark ist der Schaden?"
                rows={2}
                className="text-sm"
              />
            </div>

            {showAmounts && (
              <div>
                <Label className="text-xs">Betrag (brutto, optional)</Label>
                <Input
                  inputMode="decimal"
                  value={damage.amount}
                  onChange={(e) => update(damage.id, { amount: e.target.value })}
                  placeholder="z. B. 120,00"
                  className="text-sm"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Bezifferte Schäden werden bei der Rechnung als Position vorgeschlagen.
                </p>
              </div>
            )}

            <div className="rounded-md border bg-muted/40 p-3 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Label className="text-xs font-semibold">Reparatur nötig</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Legt automatisch eine Aufgabe in der Reparaturliste des Standorts an.
                  </p>
                </div>
                <Switch
                  checked={damage.needsRepair}
                  onCheckedChange={(v) => update(damage.id, { needsRepair: v })}
                />
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Label className="text-xs font-semibold">Bestand reduzieren</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Für unbrauchbare Artikel (z. B. Glasbruch) – die Menge am Standort sinkt.
                  </p>
                </div>
                <Switch
                  checked={damage.reducesStock}
                  onCheckedChange={(v) => update(damage.id, { reducesStock: v })}
                />
              </div>
              {damage.reducesStock && (
                <div className="max-w-[140px]">
                  <Label className="text-xs">Betroffene Stückzahl</Label>
                  <Input
                    inputMode="numeric"
                    value={damage.quantity}
                    onChange={(e) => update(damage.id, { quantity: e.target.value })}
                    className="text-sm"
                  />
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs flex items-center gap-1">
                <Camera className="h-3 w-3" />
                Fotos
              </Label>
              <input
                ref={(el) => { fileRefs.current[damage.id] = el; }}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => { addPhotos(damage.id, e.target.files); e.target.value = ""; }}
              />
              <div className="flex flex-wrap gap-2 mt-1">
                {damage.photos.map((photo, i) => (
                  <div key={i} className="relative">
                    <img src={photo.preview} alt={`Schaden ${idx + 1} Foto ${i + 1}`} className="h-20 w-20 object-cover rounded-md border" />
                    <button
                      type="button"
                      onClick={() => removePhoto(damage.id, i)}
                      className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileRefs.current[damage.id]?.click()}
                  className="h-20 w-20 border-2 border-dashed border-muted-foreground/30 rounded-md flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary"
                >
                  <Upload className="h-4 w-4" />
                  <span className="text-[10px]">Foto</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" onClick={() => onChange([...damages, emptyDamage(itemNames[0] || "")])} className="w-full">
        <Plus className="h-4 w-4 mr-1.5" />
        Neuen Schaden hinzufügen
      </Button>

      {showAmounts && damages.length > 0 && (
        <p className="text-sm font-medium text-right">
          Summe Schäden: {formatEuro(sumDamages(damages))}
        </p>
      )}
    </div>
  );
}
