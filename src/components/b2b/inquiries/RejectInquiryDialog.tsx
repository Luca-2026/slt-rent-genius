import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InquiryProductCombobox, type CatalogProduct, pickCatalogImage } from "./InquiryProductCombobox";

interface Props {
  inquiryType: "rental" | "sales";
  inquiryId: string;
  customerEmail?: string | null;
  location?: string | null;
  disabled?: boolean;
  onDone: () => void;
}

type ReasonMode = "unavailable" | "custom";

/**
 * Absage einer offenen Anfrage: Standardtext („nicht verfügbar") oder eigene
 * Begründung, optional mit Alternativvorschlag aus dem CMS-Katalog.
 */
export function RejectInquiryDialog({ inquiryType, inquiryId, customerEmail, location, disabled, onDone }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ReasonMode>("unavailable");
  const [customReason, setCustomReason] = useState("");
  const [note, setNote] = useState("");
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);

  // Alternativvorschlag
  const [withAlt, setWithAlt] = useState(false);
  const [altName, setAltName] = useState("");
  const [altProduct, setAltProduct] = useState<CatalogProduct | null>(null);
  const [altNote, setAltNote] = useState("");

  const customInvalid = mode === "custom" && customReason.trim().length < 10;
  const altInvalid = withAlt && altName.trim().length === 0;

  const reset = () => {
    setMode("unavailable");
    setCustomReason("");
    setNote("");
    setWithAlt(false);
    setAltName("");
    setAltProduct(null);
    setAltNote("");
  };

  const submit = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("send-inquiry-rejection", {
      body: {
        inquiry_type: inquiryType,
        inquiry_id: inquiryId,
        reason_mode: mode,
        custom_reason: mode === "custom" ? customReason.trim() : null,
        note: note.trim() || null,
        notify_customer: notify && !!customerEmail,
        alternative: withAlt && altName.trim()
          ? {
              name: altName.trim(),
              slug: altProduct?.slug ?? null,
              category: altProduct?.category ?? null,
              image: pickCatalogImage(altProduct?.images) ?? null,
              price: altProduct?.price_per_day ?? null,
              location: location ?? null,
              note: altNote.trim() || null,
            }
          : null,
      },
    });
    setBusy(false);
    if (error || (data as any)?.error) {
      toast({
        title: "Absage fehlgeschlagen",
        description: (data as any)?.error ?? error?.message ?? "Unbekannter Fehler",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Anfrage abgelehnt",
      description: (data as any)?.email_sent ? "Der Kunde wurde per E-Mail informiert." : "Ohne E-Mail-Versand.",
    });
    setOpen(false);
    reset();
    onDone();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled} className="text-destructive border-destructive/40">
          <XCircle className="h-3.5 w-3.5 mr-1" /> Ablehnen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Anfrage ablehnen</DialogTitle>
          <DialogDescription>
            Ablehnen ohne Grund verschickt den Standardtext („leider im angefragten Zeitraum nicht
            verfügbar"). Alternativ kannst du eine eigene Begründung und einen verfügbaren
            Alternativartikel vorschlagen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs">Begründung</Label>
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as ReasonMode)} className="mt-2 space-y-2">
              <div className="flex items-start gap-2 rounded-lg border border-border p-3">
                <RadioGroupItem value="unavailable" id="reason-standard" className="mt-0.5" />
                <Label htmlFor="reason-standard" className="text-sm font-normal leading-snug cursor-pointer">
                  <span className="font-medium">Ablehnen ohne Grund (Standard)</span>
                  <span className="block text-muted-foreground">
                    Artikel im angefragten Zeitraum leider ausgebucht – wir freuen uns über die nächste Anfrage.
                  </span>
                </Label>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-border p-3">
                <RadioGroupItem value="custom" id="reason-custom" className="mt-0.5" />
                <Label htmlFor="reason-custom" className="text-sm font-normal leading-snug cursor-pointer">
                  <span className="font-medium">Eigene Begründung</span>
                  <span className="block text-muted-foreground">Freitext, der anstelle des Standardtexts erscheint.</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {mode === "custom" && (
            <div>
              <Label className="text-xs">Begründung für den Kunden *</Label>
              <Textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
                maxLength={800}
                placeholder="z. B. Der Artikel befindet sich aktuell in der Wartung."
              />
              {customInvalid && (
                <p className="text-xs text-destructive mt-1">Bitte mindestens 10 Zeichen angeben.</p>
              )}
            </div>
          )}

          <div className="rounded-lg border border-border p-3 space-y-3">
            <div className="flex items-start gap-2">
              <Checkbox id="with-alt" checked={withAlt} onCheckedChange={(v) => setWithAlt(v === true)} />
              <Label htmlFor="with-alt" className="text-sm font-normal leading-snug cursor-pointer">
                Alternativartikel vorschlagen (aus dem CMS-Katalog)
              </Label>
            </div>
            {withAlt && (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Alternativer Artikel *</Label>
                  <InquiryProductCombobox
                    value={altName}
                    location={location}
                    onSelect={(product, freeText) => {
                      setAltProduct(product);
                      setAltName(freeText);
                    }}
                  />
                  {altProduct?.price_per_day && (
                    <p className="text-xs text-muted-foreground mt-1">Preis laut CMS: {altProduct.price_per_day}</p>
                  )}
                  {altInvalid && <p className="text-xs text-destructive mt-1">Bitte einen Artikel wählen.</p>}
                </div>
                <div>
                  <Label className="text-xs">Kurze Notiz zum Vorschlag (optional)</Label>
                  <Input
                    value={altNote}
                    onChange={(e) => setAltNote(e.target.value)}
                    maxLength={300}
                    placeholder="z. B. vergleichbare Leistung, im Zeitraum verfügbar"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="notify-customer"
              checked={notify}
              onCheckedChange={(v) => setNotify(v === true)}
              disabled={!customerEmail}
            />
            <Label htmlFor="notify-customer" className="text-sm font-normal leading-snug">
              Kunden per E-Mail informieren
              {customerEmail ? ` (${customerEmail})` : " – keine E-Mail-Adresse hinterlegt"}
            </Label>
          </div>

          <div>
            <Label className="text-xs">Persönlicher Zusatz (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={800}
              placeholder="z. B. Alternativtermin oder weiterer Hinweis"
            />
          </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy} className="w-full sm:w-auto">
            Abbrechen
          </Button>
          <Button
            onClick={submit}
            disabled={busy || customInvalid || altInvalid}
            className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {busy ? "Wird gesendet…" : "Ablehnen & Absage senden"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
