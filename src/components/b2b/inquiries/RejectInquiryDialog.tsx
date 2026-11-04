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
  /** Alle angefragten Artikel in Reihenfolge der Anfrage (Index = Position). */
  items?: { name: string; quantity: number }[];
  disabled?: boolean;
  onDone: () => void;
}

type ReasonMode = "unavailable" | "custom";

interface ItemDecision {
  available: boolean;
  withAlt: boolean;
  altName: string;
  altProduct: CatalogProduct | null;
  altNote: string;
}

const emptyDecision = (): ItemDecision => ({ available: false, withAlt: false, altName: "", altProduct: null, altNote: "" });

/**
 * Absage einer offenen Anfrage: Standardtext („nicht verfügbar") oder eigene
 * Begründung, optional mit Alternativvorschlag aus dem CMS-Katalog.
 */
export function RejectInquiryDialog({ inquiryType, inquiryId, customerEmail, location, items, disabled, onDone }: Props) {
  const rows = items && items.length ? items : [{ name: "Angefragter Artikel", quantity: 1 }];
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ReasonMode>("unavailable");
  const [customReason, setCustomReason] = useState("");
  const [note, setNote] = useState("");
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);

  // Entscheidung und Alternativvorschlag je angefragtem Artikel
  const [decisions, setDecisions] = useState<ItemDecision[]>(() => rows.map(emptyDecision));
  const decisionAt = (i: number) => decisions[i] ?? emptyDecision();
  const updateDecision = (i: number, patch: Partial<ItemDecision>) =>
    setDecisions((prev) => rows.map((_, idx) => (idx === i ? { ...(prev[idx] ?? emptyDecision()), ...patch } : prev[idx] ?? emptyDecision())));

  const customInvalid = mode === "custom" && customReason.trim().length < 10;
  const altInvalid = rows.some((_, i) => {
    const d = decisionAt(i);
    return !d.available && d.withAlt && d.altName.trim().length === 0;
  });
  const noneUnavailable = rows.every((_, i) => decisionAt(i).available);
  const someAvailable = rows.some((_, i) => decisionAt(i).available);

  const reset = () => {
    setMode("unavailable");
    setCustomReason("");
    setNote("");
    setDecisions(rows.map(emptyDecision));
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
        items: rows.map((_, index) => {
          const d = decisionAt(index);
          return {
            index,
            available: d.available,
            alternative: !d.available && d.withAlt && d.altName.trim()
              ? {
                  name: d.altName.trim(),
                  slug: d.altProduct?.slug ?? null,
                  category: d.altProduct?.category ?? null,
                  image: pickCatalogImage(d.altProduct?.images) ?? null,
                  price: d.altProduct?.price_per_day ?? null,
                  location: location ?? null,
                  note: d.altNote.trim() || null,
                }
              : null,
          };
        }),
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
            Markiere jeden angefragten Artikel als verfügbar oder nicht verfügbar und schlage bei Bedarf
            je Artikel eine Alternative vor. Ohne eigene Begründung geht der Standardtext raus.
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

          <div className="space-y-2">
            <Label className="text-xs">Angefragte Artikel ({rows.length})</Label>
            <p className="text-xs text-muted-foreground">
              Lege für jeden Artikel fest, ob er verfügbar ist. Der Kunde sieht in der E-Mail jeden Artikel
              mit seinem Status und deinem Vorschlag.
            </p>
            {rows.map((row, i) => {
              const d = decisionAt(i);
              return (
                <div key={i} className="rounded-lg border border-border p-3 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {row.quantity > 1 ? `${row.quantity} × ` : ""}{row.name}
                    </span>
                    <div className="inline-flex rounded-md border border-border overflow-hidden" role="group" aria-label={`Verfügbarkeit ${row.name}`}>
                      <Button
                        type="button"
                        size="sm"
                        variant={d.available ? "ghost" : "destructive"}
                        className="rounded-none h-8"
                        aria-pressed={!d.available}
                        onClick={() => updateDecision(i, { available: false })}
                      >
                        Nicht verfügbar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={d.available ? "default" : "ghost"}
                        className="rounded-none h-8"
                        aria-pressed={d.available}
                        onClick={() => updateDecision(i, { available: true })}
                      >
                        Verfügbar
                      </Button>
                    </div>
                  </div>
                  {!d.available && (
                    <>
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id={`with-alt-${i}`}
                          checked={d.withAlt}
                          onCheckedChange={(v) => updateDecision(i, { withAlt: v === true })}
                        />
                        <Label htmlFor={`with-alt-${i}`} className="text-sm font-normal leading-snug cursor-pointer">
                          Alternativartikel vorschlagen (aus dem CMS-Katalog)
                        </Label>
                      </div>
                      {d.withAlt && (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">Alternativer Artikel *</Label>
                            <InquiryProductCombobox
                              value={d.altName}
                              location={location}
                              onSelect={(product, freeText) => updateDecision(i, { altProduct: product, altName: freeText })}
                            />
                            {d.altProduct?.price_per_day && (
                              <p className="text-xs text-muted-foreground mt-1">Preis laut CMS: {d.altProduct.price_per_day}</p>
                            )}
                            {d.altName.trim().length === 0 && (
                              <p className="text-xs text-destructive mt-1">Bitte einen Artikel wählen.</p>
                            )}
                          </div>
                          <div>
                            <Label className="text-xs">Kurze Notiz zum Vorschlag (optional)</Label>
                            <Input
                              value={d.altNote}
                              onChange={(e) => updateDecision(i, { altNote: e.target.value })}
                              maxLength={300}
                              placeholder="z. B. vergleichbare Leistung, im Zeitraum verfügbar"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
            {noneUnavailable && (
              <p className="text-xs text-destructive">
                Alle Artikel sind als verfügbar markiert – das ist keine Absage. Bitte stattdessen ein Angebot erstellen.
              </p>
            )}
            {someAvailable && !noneUnavailable && (
              <p className="text-xs text-muted-foreground">
                Tipp: Will der Kunde die verfügbaren Artikel trotzdem, ist ein Angebot nur mit diesen Artikeln oft der schnellere Weg.
              </p>
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
            disabled={busy || customInvalid || altInvalid || noneUnavailable}
            className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {busy ? "Wird gesendet…" : "Ablehnen & Absage senden"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
