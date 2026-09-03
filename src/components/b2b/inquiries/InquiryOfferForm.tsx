import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import { Plus, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildOfferTotals, formatEuro, isValidOfferTotal, lineTotal, type OfferLine } from "./offerMath";
import { ADDON_PRESETS, parseAddonOptions, suggestAddonAmount, type AddonOption } from "@/lib/offerAddons";
import {
  InquiryProductCombobox,
  findCatalogProductByName,
  pickCatalogImage,
} from "./InquiryProductCombobox";
import { SalesProductCombobox } from "./SalesProductCombobox";
import { SALES_ADDON_PRESETS, isSalesAddonNegative } from "@/lib/salesAddons";
import { loadSalesCatalog } from "@/hooks/useSalesCatalog";
import { OFFER_UNITS, unitLabel, type OfferUnit } from "@/lib/offerUnits";
import { resolveCatalogPrice } from "@/lib/catalogPricing";

/** Angebotsposition inkl. der im CMS erlaubten Zusatzoptionen (nur lokal). */
type FormLine = OfferLine & {
  available_addons?: AddonOption[];
  /** Woher der Einzelpreis stammt: aus dem CMS vorbelegt oder manuell überschrieben. */
  price_source?: "cms" | "manual";
};

/**
 * Auswahlliste der Zusatzoptionen einer Position: die im CMS gepflegten Optionen
 * plus die Standard-Presets (Versicherungen etc.), damit auch bei Artikeln ohne
 * CMS-Pflege immer Zusatzoptionen angeboten werden.
 */
function addonOptionsFor(item: FormLine, isSales = false): AddonOption[] {
  const fromCms = item.available_addons ?? [];
  const source = isSales
    ? SALES_ADDON_PRESETS
    : ADDON_PRESETS.filter((p) => p.key !== "custom");
  const presets: AddonOption[] = source.map((p) => ({
    key: p.key,
    label: p.label,
    price_type: p.price_type,
    price: p.price,
    deductible: (p as { deductible?: number | null }).deductible ?? null,
  }));
  const merged = [...fromCms];
  for (const p of presets) if (!merged.some((o) => o.key === p.key)) merged.push(p);
  return merged;
}

/**
 * Preis-Vorbelegung beim Artikelwechsel: CMS-Preis übernehmen, sofern hinterlegt
 * und der Preis nicht manuell überschrieben wurde. Ohne CMS-Preis bleibt das Feld
 * leer (bzw. der manuell gesetzte Preis erhalten).
 */
function resolvePricePatch(
  item: FormLine,
  resolved: { price: number; unit?: OfferUnit } | undefined,
): Partial<FormLine> {
  if (item.price_source === "manual" && item.unit_price > 0) return {};
  if (resolved) {
    return {
      unit_price: resolved.price,
      price_source: "cms",
      unit: item.unit ?? resolved.unit ?? "kalendertage",
      duration: item.duration && item.duration > 0 ? item.duration : 1,
    };
  }
  return { unit_price: 0, price_source: undefined };
}


function emptyLine(): FormLine {
  return {
    product_name: "",
    description: "",
    quantity: 1,
    duration: 1,
    unit: "kalendertage",
    unit_price: 0,
    discount_percent: 0,
  };
}

const PAYMENT_OPTIONS: Record<"business" | "private", { value: string; label: string }[]> = {
  business: [
    { value: "net_14", label: "Rechnung – 14 Tage netto" },
    { value: "net_7", label: "Rechnung – 7 Tage netto" },
    { value: "net_30", label: "Rechnung – 30 Tage netto" },
    { value: "vorkasse", label: "Vorkasse per Banküberweisung" },
    { value: "custom", label: "Individuelle Zahlungsbedingungen …" },
  ],
  private: [
    { value: "anzahlung_30", label: "30 % Anzahlung binnen 48 Std. (Zahlungslink)" },
    { value: "rentpair_vorkasse", label: "Vorkasse komplett über Zahlungslink" },
    { value: "vorkasse", label: "Vorkasse per Banküberweisung" },
  ],
};

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
  /** Privat- oder Geschäftskunde – steuert die Zahlungsbedingungen. */
  customerKind?: "business" | "private";
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
  customerKind = "private",
  staffName,
  disabled,
  onSent,
}: Props) {
  const { toast } = useToast();
  const [items, setItems] = useState<FormLine[]>(
    defaultItems.length ? defaultItems : [emptyLine()],
  );
  const emptyDelivery: OfferDeliveryAddress = { requested: false, street: "", postal_code: "", city: "" };
  const [delivery, setDelivery] = useState<OfferDeliveryAddress>(defaultDelivery ?? emptyDelivery);
  const [deliveryCostDelivery, setDeliveryCostDelivery] = useState(0);
  const [deliveryCostReturn, setDeliveryCostReturn] = useState(0);
  /** Pauschalen für Auf- und Abbau (Montage/Demontage vor Ort). */
  const [setupCost, setSetupCost] = useState(0);
  const [dismantleCost, setDismantleCost] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [validDays, setValidDays] = useState(14);
  const [paymentTerms, setPaymentTerms] = useState(
    customerKind === "business" ? "net_14" : "anzahlung_30",
  );
  /** Freitext für „Individuelle Zahlungsbedingungen“ (nur Geschäftskunden). */
  const [paymentTermsCustom, setPaymentTermsCustom] = useState("");
  const sendLock = useRef(false);

  useEffect(() => {
    setPaymentTerms(customerKind === "business" ? "net_14" : "anzahlung_30");
  }, [customerKind]);
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);

  // Bei Wechsel der Anfrage die Lieferadresse aus dem Anfrageformular übernehmen.
  useEffect(() => {
    setDelivery(defaultDelivery ?? emptyDelivery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquiryId, defaultDelivery?.requested, defaultDelivery?.street, defaultDelivery?.postal_code, defaultDelivery?.city]);

  const totals = useMemo(
    () => buildOfferTotals(items, deliveryCostDelivery + deliveryCostReturn + setupCost + dismantleCost),
    [items, deliveryCostDelivery, deliveryCostReturn, setupCost, dismantleCost],
  );


  const patchItem = (index: number, patch: Partial<FormLine>) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  // Vorbelegte Positionen automatisch mit Bild (und ggf. Preis) aus dem CMS anreichern.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const salesCatalog = inquiryType === "sales" ? await loadSalesCatalog() : [];
      const enriched = await Promise.all(
        items.map(async (item) => {
          if (item.available_addons || !item.product_name.trim()) return item;
          if (inquiryType === "sales") {
            const hit = salesCatalog.find(
              (c) => c.name.toLowerCase() === item.product_name.trim().toLowerCase(),
            );
            if (!hit) return { ...item, available_addons: [] };
            const salesPrice = hit.net_price ?? undefined;
            const useSalesCms = item.unit_price <= 0 && salesPrice !== undefined;
            return {
              ...item,
              image_url: item.image_url ?? hit.image ?? undefined,
              unit_price: useSalesCms ? salesPrice! : item.unit_price,
              price_source: useSalesCms ? ("cms" as const) : item.price_source,
              unit: item.unit ?? "stueck",
              duration: item.duration && item.duration > 0 ? item.duration : 1,
              available_addons: [],
            };
          }
          const match = await findCatalogProductByName(item.product_name);
          if (!match) return item;
          const image = pickCatalogImage(match.images);
          const resolved = await resolveCatalogPrice(match);
          const useCms = item.unit_price <= 0 && resolved !== undefined;
          return {
            ...item,
            image_url: item.image_url ?? image,
            unit_price: useCms ? resolved!.price : item.unit_price,
            price_source: useCms ? ("cms" as const) : item.price_source,
            unit: item.unit ?? resolved?.unit ?? "kalendertage",
            duration: item.duration && item.duration > 0 ? item.duration : 1,
            available_addons: parseAddonOptions(match.addon_options),
          };
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
    if (paymentTerms === "custom" && paymentTermsCustom.trim().length < 5) {
      toast({
        title: "Zahlungsbedingungen fehlen",
        description: "Bitte die individuellen Zahlungsbedingungen ausformulieren.",
        variant: "destructive",
      });
      return;
    }
    if (!isValidOfferTotal(totals.netAmount)) {
      toast({
        title: "Angebotssumme ungültig",
        description: "Die Summe muss größer als 0 € sein – bitte Abzüge (z. B. Inzahlungnahme) prüfen.",
        variant: "destructive",
      });
      return;
    }
    // Zusätzlicher Klick-Lock: State-Updates greifen erst im nächsten Render,
    // ein sehr schneller Doppelklick würde sonst zwei Requests auslösen.
    if (sendLock.current) return;
    sendLock.current = true;
    setSending(true);
    const { data, error } = await supabase.functions.invoke("send-inquiry-offer", {
      body: {
        inquiry_type: inquiryType,
        inquiry_id: inquiryId,
        location,
        items: items.map(({ available_addons: _unused, price_source: _src, ...rest }) => {
          const duration = rest.duration && rest.duration > 0 ? rest.duration : 1;
          const unit = (rest.unit ?? "kalendertage") as OfferUnit;
          const articles = rest.quantity || 1;
          // Die PDF-Zeile zeigt Menge × Einheit; mehrere Artikel werden in der
          // Beschreibung ausgewiesen, damit die Summe nachvollziehbar bleibt.
          const description =
            articles > 1
              ? [rest.description, `${articles} Artikel × ${duration} ${unitLabel(duration, unit)}`]
                  .filter(Boolean)
                  .join(" · ")
              : rest.description;
          return {
            ...rest,
            description,
            quantity: articles * duration,
            unit: unitLabel(articles * duration, unit),
            addons: (rest.addons ?? []).filter((a) => Number(a.amount) !== 0),
          };
        }),
        payment_terms: paymentTerms,
        payment_terms_custom: paymentTerms === "custom" ? paymentTermsCustom.trim() : null,
        delivery_cost_delivery: deliveryCostDelivery,
        delivery_cost_return: deliveryCostReturn,
        setup_cost: setupCost,
        dismantle_cost: dismantleCost,
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
    sendLock.current = false;

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
                {inquiryType === "sales" ? (
                <SalesProductCombobox
                  value={item.product_name}
                  disabled={disabled}
                  onSelect={(product, freeText) => {
                    const netPrice = product?.net_price ?? undefined;
                    patchItem(index, {
                      product_name: freeText,
                      image_url: product?.image ?? undefined,
                      ...resolvePricePatch(
                        item,
                        netPrice !== undefined ? { price: netPrice, unit: "stueck" } : undefined,
                      ),
                      available_addons: [],
                      addons: [],
                    });
                  }}
                />
                ) : (
                <InquiryProductCombobox
                  value={item.product_name}
                  location={location}
                  disabled={disabled}
                  onSelect={async (product, freeText) => {
                    const resolved = product ? await resolveCatalogPrice(product) : undefined;
                    patchItem(index, {
                      product_name: freeText,
                      image_url: product ? pickCatalogImage(product.images) : undefined,
                      ...resolvePricePatch(item, resolved),
                      available_addons: product ? parseAddonOptions(product.addon_options) : [],
                      addons: [],
                    });
                  }}
                />
                )}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">Menge (Artikel)</Label>
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => patchItem(index, { quantity: Number(e.target.value) || 0 })}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label className="text-xs">Menge (Dauer)</Label>
                <Input
                  type="number"
                  min={1}
                  value={item.duration ?? 1}
                  onChange={(e) => patchItem(index, { duration: Number(e.target.value) || 0 })}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label className="text-xs">Einheit</Label>
                <Select
                  value={item.unit ?? "kalendertage"}
                  disabled={disabled}
                  onValueChange={(v) => patchItem(index, { unit: v as OfferUnit })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OFFER_UNITS.map((u) => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {item.quantity || 0} × {item.duration ?? 1}{" "}
                  {unitLabel(item.duration ?? 1, (item.unit ?? "kalendertage") as OfferUnit)}
                </p>
              </div>
              <div>
                <Label className="text-xs">Einzelpreis netto</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) =>
                    patchItem(index, { unit_price: Number(e.target.value) || 0, price_source: "manual" })
                  }
                  disabled={disabled}
                />
                {item.price_source === "cms" ? (
                  <p className="mt-1 text-[11px] text-muted-foreground">Preis aus CMS – anpassbar</p>
                ) : null}

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
                {formatEuro(lineTotal(item))}
              </div>
            </div>

            {/* Zusatzoptionen dieser Position (CMS-Optionen + Standardauswahl + Freifeld) */}
            {(() => {
              const options = addonOptionsFor(item, inquiryType === "sales");
              return (
              <div className="rounded-md bg-muted/50 p-2 space-y-2">
                <div className="flex gap-2">
                <Select
                  value=""
                  disabled={disabled}
                  onValueChange={(key) => {
                    const option = options.find((o) => o.key === key);
                    if (!option) return;
                    if ((item.addons ?? []).some((a) => a.key === option.key)) return;
                    patchItem(index, {
                      addons: [
                        ...(item.addons ?? []),
                        {
                          key: option.key,
                          label: option.label,
                          amount: isSalesAddonNegative(option.key)
                            ? -Math.abs(suggestAddonAmount(option, item))
                            : suggestAddonAmount(option, item),
                          note: option.deductible ? `Selbstbehalt ${option.deductible} €` : option.note,
                        },
                      ],
                    });
                  }}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Zusatzoption hinzufügen …" />
                  </SelectTrigger>
                  <SelectContent>
                    {options
                      .filter((o) => !(item.addons ?? []).some((a) => a.key === o.key))
                      .map((o) => (
                        <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0"
                  disabled={disabled}
                  onClick={() =>
                    patchItem(index, {
                      addons: [
                        ...(item.addons ?? []),
                        { key: `custom-${Date.now()}`, label: "", amount: 0 },
                      ],
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" /> Freie Option
                </Button>
                </div>

                {(item.addons ?? []).map((addon, ai) => (
                  <div key={addon.key} className="flex items-end gap-2">
                    <div className="min-w-0 flex-1 space-y-1">
                      {addon.key.startsWith("custom") ? (
                        <Input
                          value={addon.label}
                          placeholder="Bezeichnung der Zusatzoption"
                          disabled={disabled}
                          onChange={(e) =>
                            patchItem(index, {
                              addons: (item.addons ?? []).map((a, j) =>
                                j === ai ? { ...a, label: e.target.value } : a,
                              ),
                            })
                          }
                        />
                      ) : (
                        <Label className="text-xs break-words">
                          {addon.label}
                          {addon.note ? <span className="block text-muted-foreground font-normal">{addon.note}</span> : null}
                        </Label>
                      )}
                      <Input

                        type="number"
                        step="0.01"
                        value={addon.amount}
                        onChange={(e) =>
                          patchItem(index, {
                            addons: (item.addons ?? []).map((a, j) =>
                              j === ai ? { ...a, amount: Number(e.target.value) || 0 } : a,
                            ),
                          })
                        }
                        disabled={disabled}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Zusatzoption entfernen"
                      disabled={disabled}
                      onClick={() =>
                        patchItem(index, { addons: (item.addons ?? []).filter((_, j) => j !== ai) })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              );
            })()}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setItems((prev) => [...prev, emptyLine()])
          }
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-1" /> Position hinzufügen
        </Button>
      </div>

      <div className="rounded-lg border border-border p-3 space-y-3">
        <label className="flex items-start gap-2 text-sm font-medium cursor-pointer">
          <Checkbox
            checked={delivery.requested}
            onCheckedChange={(v) => setDelivery({ ...delivery, requested: v === true })}
            disabled={disabled}
            className="mt-0.5"
          />
          <span>
            Lieferadresse im Angebot ausweisen
            {defaultDelivery?.requested ? (
              <span className="block text-xs font-normal text-muted-foreground">
                Vom Kunden im Anfrageformular angegeben – hier änderbar.
              </span>
            ) : null}
          </span>
        </label>
        {delivery.requested && (
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-xs">Straße und Hausnummer</Label>
              <Input
                value={delivery.street}
                onChange={(e) => setDelivery({ ...delivery, street: e.target.value })}
                placeholder="Baustelle Nord 4"
                disabled={disabled}
              />
            </div>
            <div>
              <Label className="text-xs">PLZ</Label>
              <Input
                value={delivery.postal_code}
                onChange={(e) => setDelivery({ ...delivery, postal_code: e.target.value })}
                inputMode="numeric"
                disabled={disabled}
              />
            </div>
            <div>
              <Label className="text-xs">Ort</Label>
              <Input
                value={delivery.city}
                onChange={(e) => setDelivery({ ...delivery, city: e.target.value })}
                disabled={disabled}
              />
            </div>
          </div>
        )}
      </div>



      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
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
          <Label className="text-xs">Aufbau</Label>
          <Input type="number" min={0} step="0.01" value={setupCost}
            onChange={(e) => setSetupCost(Number(e.target.value) || 0)} disabled={disabled} />
        </div>
        <div>
          <Label className="text-xs">Abbau</Label>
          <Input type="number" min={0} step="0.01" value={dismantleCost}
            onChange={(e) => setDismantleCost(Number(e.target.value) || 0)} disabled={disabled} />
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

      <div className="rounded-lg border border-border p-3 space-y-2">
        <Label className="text-xs">
          Zahlungsbedingungen ({customerKind === "business" ? "Geschäftskunde" : "Privatkunde"})
        </Label>
        <Select value={paymentTerms} onValueChange={setPaymentTerms} disabled={disabled}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {PAYMENT_OPTIONS[customerKind].map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {paymentTerms === "custom" && (
          <Textarea
            value={paymentTermsCustom}
            onChange={(e) => setPaymentTermsCustom(e.target.value)}
            rows={3}
            maxLength={600}
            disabled={disabled}
            placeholder="z. B. 50 % Anzahlung bei Auftragserteilung, Rest 30 Tage netto nach Rechnungsstellung."
          />
        )}
        <p className="text-xs text-muted-foreground">
          {paymentTerms === "custom"
            ? "Dieser Text erscheint wortgleich im Angebots-PDF und in der E-Mail an den Kunden."
            : paymentTerms === "anzahlung_30"
            ? "Der Kunde erhält nach Annahme eine Buchungsbestätigung mit Zahlungslink; mindestens 30 % Anzahlung innerhalb von 48 Stunden, sonst wird die Reservierung freigegeben."
            : paymentTerms === "rentpair_vorkasse"
              ? "Vollständige Vorkasse über den Zahlungslink in der Buchungsbestätigung (48 Stunden)."
              : paymentTerms === "vorkasse"
                ? "Vorkasse per Banküberweisung – Bankdaten stehen im Angebots-PDF, Frist ist die Angebotsgültigkeit."
                : "Rechnungszahlung nach Mietende innerhalb der gewählten Frist; es gilt die Angebotsgültigkeit."}
        </p>
      </div>

      <div>
        <Label className="text-xs">Hinweis für den Kunden (optional)</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} disabled={disabled} />
      </div>

      <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
        <div className="flex justify-between"><span>Mietartikel</span><span>{formatEuro(totals.itemsNet)}</span></div>
        {totals.addonsNet > 0 && (
          <div className="flex justify-between"><span>Zusatzoptionen</span><span>{formatEuro(totals.addonsNet)}</span></div>
        )}
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
