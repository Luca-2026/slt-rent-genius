import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { buildOfferTotals, formatEuro, type OfferLine } from "./offerMath";
import {
  InquiryProductCombobox,
  findCatalogProductByName,
  parsePrice,
  pickCatalogImage,
} from "./InquiryProductCombobox";

export interface OfferDeliveryAddress {
  requested: boolean;
  street: string;
  postal_code: string;
  city: string;
}

interface Props {
  inquiryType: "rental" | "sales";
  inquiryId: string;
  location: string | null;
  defaultItems: OfferLine[];
  /** Vom Kunden im Anfrageformular angegebene Lieferadresse (im Portal änderbar). */
  defaultDelivery?: OfferDeliveryAddress;
  staffName: string;
  disabled?: boolean;
  onSent?: () => void;
}

export function InquiryOfferForm({
  inquiryType,
  inquiryId,
  location,
  defaultItems,
  defaultDelivery,
  staffName,
  disabled,
  onSent,
}: Props) {
  const { toast } = useToast();
  const [items, setItems] = useState<OfferLine[]>(
    defaultItems.length ? defaultItems : [{ product_name: "", description: "", quantity: 1, unit_price: 0, discount_percent: 0 }],
  );
  const emptyDelivery: OfferDeliveryAddress = { requested: false, street: "", postal_code: "", city: "" };
  const [delivery, setDelivery] = useState<OfferDeliveryAddress>(defaultDelivery ?? emptyDelivery);
  const [deliveryCostDelivery, setDeliveryCostDelivery] = useState(0);
  const [deliveryCostReturn, setDeliveryCostReturn] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [validDays, setValidDays] = useState(14);
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);

  // Bei Wechsel der Anfrage die Lieferadresse aus dem Anfrageformular übernehmen.
  useEffect(() => {
    setDelivery(defaultDelivery ?? emptyDelivery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquiryId, defaultDelivery?.requested, defaultDelivery?.street, defaultDelivery?.postal_code, defaultDelivery?.city]);

  const totals = useMemo(
    () => buildOfferTotals(items, deliveryCostDelivery + deliveryCostReturn),
    [items, deliveryCostDelivery, deliveryCostReturn],
  );


  const patchItem = (index: number, patch: Partial<OfferLine>) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  // Vorbelegte Positionen automatisch mit Bild (und ggf. Preis) aus dem CMS anreichern.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const enriched = await Promise.all(
        items.map(async (item) => {
          if (item.image_url || !item.product_name.trim()) return item;
          const match = await findCatalogProductByName(item.product_name);
          if (!match) return item;
          const image = pickCatalogImage(match.images);
          const price = item.unit_price > 0 ? item.unit_price : parsePrice(match.price_per_day) ?? 0;
          return image || price !== item.unit_price ? { ...item, image_url: image, unit_price: price } : item;
        }),
      );
      if (!cancelled && enriched.some((item, i) => item !== items[i])) setItems(enriched);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquiryId]);

  const send = async () => {
    const invalid = items.some((i) => !i.product_name.trim() || i.quantity <= 0 || i.unit_price < 0);
    if (invalid) {
      toast({ title: "Bitte alle Positionen ausfüllen", description: "Bezeichnung, Menge und Preis werden benötigt.", variant: "destructive" });
      return;
    }
    if (delivery.requested && !delivery.street.trim() && !delivery.city.trim()) {
      toast({
        title: "Lieferadresse fehlt",
        description: "Bitte Straße und Ort der Lieferadresse ergänzen oder „Lieferung“ deaktivieren.",
        variant: "destructive",
      });
      return;
    }
    setSending(true);
    const { data, error } = await supabase.functions.invoke("send-inquiry-offer", {
      body: {
        inquiry_type: inquiryType,
        inquiry_id: inquiryId,
        location,
        items,
        delivery_cost_delivery: deliveryCostDelivery,
        delivery_cost_return: deliveryCostReturn,
        delivery_requested: delivery.requested,
        delivery_address: delivery.requested
          ? {
              street: delivery.street.trim(),
              postal_code: delivery.postal_code.trim(),
              city: delivery.city.trim(),
            }
          : null,
        deposit,
        valid_days: validDays,
        notes,
        staff_name: staffName,
      },
    });

    setSending(false);

    if (error || (data as any)?.error) {
      toast({
        title: "Angebot konnte nicht gesendet werden",
        description: (data as any)?.error ?? error?.message ?? "Unbekannter Fehler",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Angebot gesendet",
      description: `${(data as any)?.offer_number} · ${formatEuro(totals.grossAmount)} brutto`,
    });
    onSent?.();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="rounded-lg border border-border p-3 space-y-2">
            <div className="flex gap-2 items-start">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt=""
                  loading="lazy"
                  className="h-10 w-10 rounded object-cover border border-border shrink-0"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <InquiryProductCombobox
                  value={item.product_name}
                  location={location}
                  disabled={disabled}
                  onSelect={(product, freeText) =>
                    patchItem(index, {
                      product_name: freeText,
                      image_url: product ? pickCatalogImage(product.images) : undefined,
                      unit_price:
                        product && item.unit_price === 0
                          ? parsePrice(product.price_per_day) ?? 0
                          : item.unit_price,
                    })
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                disabled={disabled || items.length === 1}
                aria-label="Position entfernen"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              value={item.description ?? ""}
              onChange={(e) => patchItem(index, { description: e.target.value })}
              placeholder="Beschreibung / Zeitraum (optional)"
              disabled={disabled}
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <Label className="text-xs">Menge</Label>
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => patchItem(index, { quantity: Number(e.target.value) || 0 })}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label className="text-xs">Einzelpreis netto</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) => patchItem(index, { unit_price: Number(e.target.value) || 0 })}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label className="text-xs">Rabatt %</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={item.discount_percent}
                  onChange={(e) => patchItem(index, { discount_percent: Number(e.target.value) || 0 })}
                  disabled={disabled}
                />
              </div>
              <div className="flex items-end text-sm font-semibold">
                {formatEuro(item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100))}
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setItems((prev) => [...prev, { product_name: "", description: "", quantity: 1, unit_price: 0, discount_percent: 0 }])
          }
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-1" /> Position hinzufügen
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <Label className="text-xs">Lieferkosten</Label>
          <Input type="number" min={0} step="0.01" value={deliveryCostDelivery}
            onChange={(e) => setDeliveryCostDelivery(Number(e.target.value) || 0)} disabled={disabled} />
        </div>
        <div>
          <Label className="text-xs">Abholkosten</Label>
          <Input type="number" min={0} step="0.01" value={deliveryCostReturn}
            onChange={(e) => setDeliveryCostReturn(Number(e.target.value) || 0)} disabled={disabled} />
        </div>
        <div>
          <Label className="text-xs">Kaution</Label>
          <Input type="number" min={0} step="0.01" value={deposit}
            onChange={(e) => setDeposit(Number(e.target.value) || 0)} disabled={disabled} />
        </div>
        <div>
          <Label className="text-xs">Gültig (Tage)</Label>
          <Input type="number" min={1} max={180} value={validDays}
            onChange={(e) => setValidDays(Number(e.target.value) || 14)} disabled={disabled} />
        </div>
      </div>

      <div>
        <Label className="text-xs">Hinweis für den Kunden (optional)</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} disabled={disabled} />
      </div>

      <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
        <div className="flex justify-between"><span>Netto</span><span>{formatEuro(totals.netAmount)}</span></div>
        <div className="flex justify-between"><span>MwSt. {totals.vatRate}%</span><span>{formatEuro(totals.vatAmount)}</span></div>
        <div className="flex justify-between font-bold text-base"><span>Brutto</span><span>{formatEuro(totals.grossAmount)}</span></div>
      </div>

      <Button onClick={send} disabled={disabled || sending} className="w-full">
        <Send className="h-4 w-4 mr-2" />
        {sending ? "Angebot wird gesendet …" : "Angebot per E-Mail senden"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Der Kunde wird in der E-Mail gebeten, die Annahme per Antwort an das Standort-Postfach zu bestätigen.
        Danach den Job manuell in Rentware anlegen.
      </p>
    </div>
  );
}
