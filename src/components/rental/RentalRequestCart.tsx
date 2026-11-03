import { useEffect, useState, useSyncExternalStore } from "react";
import { Link, useLocation } from "react-router-dom";
import { de } from "date-fns/locale";
import { format } from "date-fns";
import { ShoppingCart, Trash2, Pencil, ArrowLeft, Clock, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CartAccessories } from "./CartAccessories";
import { DeliveryAddressFields } from "./DeliveryAddressFields";
import { useManagedProducts } from "@/hooks/useManagedProducts";
import { RentalPeriodStep } from "./RentalPeriodStep";
import { getLocationById, type Product, type LocationData } from "@/data/rentalData";
import { useCustomerType, setCustomerType } from "@/hooks/useCustomerType";
import { displayPrice } from "@/lib/priceDisplay";
import { resolveProductPrices, weekendTariff, type LocationPriceRow, unitLabel } from "@/lib/pricing/rentalPricing";
import { usePublicCoupon } from "@/hooks/usePublicCoupon";
import { supabase } from "@/integrations/supabase/client";
import { useSigningOverlaysSuppressed } from "@/lib/signingOverlays";
import { CART_STORAGE_KEY, cartQuoteItems, cartQuoteTotal, addCartItem, withCartPeriod, cartCategoryPath, pickupConfirmationRequired, parseCart, cartExpired, cartRemainingSeconds, type RentalCart, type RentalCartItem } from "@/lib/rentalCart";
import { parseSetSize, quantityLabel } from "@/lib/setSize";
import { isTrailerRoute } from "@/lib/rentalBookingMode";
import { pickupWindowForDate, getLocationInfoById } from "@/data/locationData";
import { validPublicRentalPeriod, validCalendarDate } from "../../../supabase/functions/_shared/public-rental-period";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FREE_CANCELLATION_OPTION } from "../../../supabase/functions/_shared/cancellation-option";
import { cartDeliveryQuote, type CartDeliveryQuote } from "../../../supabase/functions/_shared/delivery-tariffs";
import { eligibleSignCart, SIGN_PRODUCT_SLUG, validSignRentalRange } from "../../../supabase/functions/_shared/sign-direct-booking";
import { SignBookingCheckout } from "./SignBookingCheckout";

let state: { cart: RentalCart | null; open: boolean; edit: RentalCartItem | null; expired: boolean } = { cart: null, open: false, edit: null, expired: false };
const listeners = new Set<() => void>();
const weekendPrices = new Map<string, number>();
function update(next: Partial<typeof state>) { state = { ...state, ...next }; listeners.forEach(fn => fn()); }
function save(cart: RentalCart | null) { update({ cart }); try { if (cart) localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); else localStorage.removeItem(CART_STORAGE_KEY); } catch { /* session state still works */ } }
export function openRentalRequest(product: Product, location: LocationData) {
  if (typeof product.priceWeekendNum === "number" && product.priceWeekendNum > 0) weekendPrices.set(product.id, product.priceWeekendNum);
  const item = withCartPeriod(state.cart, { id: crypto.randomUUID(), product_slug: product.id, product_name: product.name, image: product.image, location: location.id, quantity: 1, start_date: "", start_time: "", end_date: "", end_time: "", selected_addons: [], use_saturday: false, use_sunday: false });
  if (validPublicRentalPeriod(item) && (state.cart?.items.length ?? 0) < 30) {
    save(addCartItem(state.cart, item));
    update({ open: true, expired: false, edit: null });
  } else {
    update({ open: true, expired: false, edit: item });
  }
}
type Quote = { deposit: number | null; id: string; product_name: string; category: string; unit: string; duration: number; unit_price: number | null; rental_net: number | null; addons: { key: string; label: string; amount: number | null; deductible: number | null }[]; options: { key: string; label: string; amount: number | null; is_default: boolean; surcharge_percent?: number; deductible?: number }[] };
const emptyContact = { name: "", email: "", phone: "", street: "", postalCode: "", city: "", couponCode: "", message: "", deliveryRequested: false, pickupConfirmed: false, deliveryStreet: "", deliveryPostalCode: "", deliveryCity: "" };

export function RentalCartButton() {
  const snapshot = useSyncExternalStore(fn => { listeners.add(fn); return () => { listeners.delete(fn); }; }, () => state);
  const { pathname } = useLocation();
  const signing = useSigningOverlaysSuppressed(pathname);
  if (signing || pathname.startsWith("/b2b") || isTrailerRoute(pathname)) return null;
  return <Button variant="outline" size="icon" aria-label={`Mietanfrage-Warenkorb (${snapshot.cart?.items.length ?? 0} Artikel)`} title="Mietanfrage-Warenkorb" className="relative h-11 w-11 shrink-0" onClick={() => update({ open: true, edit: null })}><ShoppingCart className="h-5 w-5" /><span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs">{snapshot.cart?.items.length ?? 0}</span></Button>;
}

export function RentalRequestCart() {
  const snapshot = useSyncExternalStore(fn => { listeners.add(fn); return () => { listeners.delete(fn); }; }, () => state);
  const route = useLocation();
  const signing = useSigningOverlaysSuppressed(route.pathname);
  const { type } = useCustomerType();
  const [now, setNow] = useState(Date.now());
  const [step, setStep] = useState<"period" | "accessories" | "options" | "cart" | "contact">("cart");
  const { data: managed = [] } = useManagedProducts();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quoteError, setQuoteError] = useState("");
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState(emptyContact);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [done, setDone] = useState("");
  const [signReceipt, setSignReceipt] = useState(() => { try { return !!localStorage.getItem("slt-sign-booking-receipt"); } catch { return false; } });
  const items = snapshot.cart?.items ?? [];
  const signCart = eligibleSignCart(items);
  const edit = snapshot.edit;
  const validPeriod = !!edit && validPublicRentalPeriod(edit) && (edit.product_slug !== SIGN_PRODUCT_SLUG || validSignRentalRange(edit.start_date, edit.end_date));
  const quoteItems = cartQuoteItems(items, edit);
  const editQuote = quotes.find(line => line.id === edit?.id);
  const [tariffRows, setTariffRows] = useState<LocationPriceRow[]>([]);
  useEffect(() => {
    let active = true;
    setTariffRows([]);
    const product = managed.find(p => p.slug === edit?.product_slug);
    if (product) supabase.from("public_product_prices" as never).select("*").eq("managed_product_id", product.id as never).then(({ data }) => { if (active) setTariffRows((data as unknown as LocationPriceRow[]) ?? []); });
    return () => { active = false; };
  }, [edit?.product_slug, managed]);
  const tariffProduct = managed.find(p => p.slug === edit?.product_slug);
  const tariffs = tariffProduct ? resolveProductPrices({ ...tariffProduct, prices_same_all_locations: tariffRows.length === 0 }, edit?.location, tariffRows) : null;
  const weekendNet = tariffs?.price_weekend_num ?? (edit ? weekendPrices.get(edit.product_slug) : null) ?? null;
  const quoteKey = JSON.stringify(quoteItems);
  const coupon = usePublicCoupon(contact.couponCode, contact.email, items.map(item => item.product_slug), JSON.stringify(items));
  useEffect(() => {
    try { const raw = localStorage.getItem(CART_STORAGE_KEY); update({ cart: parseCart(raw), expired: !!raw && !parseCart(raw) }); } catch { /* session fallback */ }
    const tick = () => { const time = Date.now(); setNow(time); if (cartExpired(state.cart, time)) { save(null); update({ expired: true, edit: null }); setContact(emptyContact); setStep("cart"); } };
    const timer = window.setInterval(tick, 1000);
    const sync = (event: StorageEvent) => { if (event.key === CART_STORAGE_KEY) { const cart = parseCart(event.newValue); update({ cart, expired: !!event.newValue && !cart }); tick(); } };
    window.addEventListener("storage", sync); window.addEventListener("focus", tick);
    return () => { clearInterval(timer); window.removeEventListener("storage", sync); window.removeEventListener("focus", tick); };
  }, []);
  useEffect(() => { if (edit) { setStep("period"); setDone(""); } else if (snapshot.open) { setStep("cart"); if (snapshot.cart) setDone(""); } }, [edit?.id, snapshot.open]);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("public-rental-dialog", { detail: snapshot.open }));
    return () => { window.dispatchEvent(new CustomEvent("public-rental-dialog", { detail: false })); };
  }, [snapshot.open]);
  useEffect(() => {
    if (!snapshot.open || !quoteItems.length ) { setQuotes([]); setLoading(false); setQuoteError(""); return; }
    let cancelled = false;
    setLoading(true); setQuoteError("");
    const timer = setTimeout(async () => {
      const { data, error } = await supabase.functions.invoke("public-rental-quote", { body: { items: quoteItems } });
      if (cancelled) return;
      setLoading(false); setQuotes(error ? [] : data?.lines ?? []); setQuoteError(error ? "Preisprüfung nicht möglich. Bitte erneut versuchen." : data?.error ?? "");
    }, 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [quoteKey, snapshot.open]);
  const patch = (next: Partial<RentalCartItem>) => { if (edit) update({ edit: { ...edit, ...next } }); };
  const remaining = cartRemainingSeconds(snapshot.cart, now);
  const cancellationNote = "Einmalig 5 % des Mietpreises, ohne Versicherung und Kaution";
  const addonPrice = (key: string, amount: number | null) => key === FREE_CANCELLATION_OPTION.key && amount === null ? "5 % des Mietpreises · Betrag im Angebot" : price(amount);
  const price = (amount: number | null) => amount === null ? "" : displayPrice(amount, type);
  const depositNote = "Kaution wird individuell ermittelt und im Angebot ausgewiesen.";
  const rentTotal = quotes.reduce((sum, line) => sum + (line.rental_net ?? 0), 0);
  const depositTotal = quotes.reduce((sum, line) => sum + (line.deposit ?? 0), 0);
  const depositUnknown = quotes.length !== items.length || quotes.some(line => line.deposit == null);
  const depositPrice = (amount: number) => displayPrice(amount, "business");
  const addonTotal = quotes.reduce((sum, line) => sum + line.addons.reduce((a, addon) => a + (addon.amount ?? 0), 0), 0);
  const discount = coupon.valid && contact.couponCode ? quotes.reduce((sum, line) => sum + (coupon.eligibleSlugs.includes(items.find(item => item.id === line.id)?.product_slug ?? "") ? Math.round((line.rental_net ?? 0) * (coupon.discountPercent ?? 0)) / 100 : 0), 0) : 0;
  const [deliveryKm, setDeliveryKm] = useState<{ key: string; km: number | null; loading: boolean }>({ key: "", km: null, loading: false });
  const deliveryAddressKey = contact.deliveryRequested && contact.deliveryStreet.trim().length > 3 && /^\d{5}$/.test(contact.deliveryPostalCode.trim()) && contact.deliveryCity.trim().length > 1 ? `${contact.deliveryStreet.trim()}, ${contact.deliveryPostalCode.trim()} ${contact.deliveryCity.trim()}` : "";
  const deliveryLocation = items[0]?.location ?? "";
  useEffect(() => {
    if (!deliveryAddressKey || !deliveryLocation) { setDeliveryKm({ key: "", km: null, loading: false }); return; }
    let cancelled = false;
    setDeliveryKm({ key: deliveryAddressKey, km: null, loading: true });
    const timer = setTimeout(async () => {
      const { data, error } = await supabase.functions.invoke("geo-address", { body: { action: "distance", locationId: deliveryLocation, address: `${deliveryAddressKey}, Germany` } });
      if (!cancelled) setDeliveryKm({ key: deliveryAddressKey, km: error || !Number.isFinite(data?.roundedKm) ? null : Number(data.roundedKm), loading: false });
    }, 700);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [deliveryAddressKey, deliveryLocation]);
  const delivery: CartDeliveryQuote | null = contact.deliveryRequested && deliveryKm.key === deliveryAddressKey && !deliveryKm.loading && deliveryAddressKey
    ? deliveryKm.km === null ? { status: "on_request", reason: "distance", product_name: null, km: 0 } : cartDeliveryQuote(quotes.map(line => ({ category: line.category, product_name: line.product_name, quantity: items.find(item => item.id === line.id)?.quantity ?? 1 })), deliveryKm.km)
    : null;
  const deliveryNet = delivery?.status === "priced" ? delivery.net : 0;
  const partial = quotes.length !== quoteItems.length || quotes.some(line => line.rental_net === null || line.addons.some(addon => addon.amount === null));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending || !state.cart || cartExpired(state.cart) || !coupon.valid || !items.length) return;
    if (pickupConfirmationRequired(contact.deliveryRequested, contact.pickupConfirmed)) { setSendError("Bitte bestätige, dass du die Artikel selbst abholst."); return; }
    setSending(true); setSendError("");
    const first = items[0], location = getLocationById(first.location);
    if (!location) { setSending(false); return; }
    const { data, error } = await supabase.functions.invoke("send-inquiry-email", { body: { ...contact, productName: first.product_name, locationName: location.name, locationEmail: location.email, locationPhone: location.phone, locationAddress: location.address, startDate: first.start_date, startTime: first.start_time, endDate: first.end_date, endTime: first.end_time, customerKind: type === "private" ? "private" : "business", items, cartRequestId: state.cart.requestId, cartExpiresAt: state.cart.expiresAt } });
    setSending(false);
    if (error || data?.error) { setSendError(data?.error ?? "Anfrage nicht gespeichert. Bitte erneut versuchen."); return; }
    setDone(data?.order_code ? `Deine Anfrage #${data.order_code} ist eingegangen.` : "Deine Mietanfrage ist eingegangen."); save(null); setContact(emptyContact);
  };
  if (signing || route.pathname.startsWith("/b2b")) return null;
  return <>
    <Dialog open={snapshot.open} onOpenChange={open => update({ open, edit: open ? state.edit : null })}>
      <DialogContent className="left-2 right-2 w-auto translate-x-0 sm:left-[50%] sm:right-auto sm:w-full sm:translate-x-[-50%] max-w-3xl max-h-[92dvh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <DialogHeader><DialogTitle>{edit ? "Artikel in den Warenkorb legen" : done ? "Deine Mietanfrage" : signReceipt ? "Deine Schilderbuchung" : step === "contact" ? (signCart ? "Halteverbotsschilder buchen" : "Mietanfrage abschließen") : "Dein Anfrage-Warenkorb"}</DialogTitle><DialogDescription>{edit ? "Wähle Zeitraum und Optionen. Anschließend legst du den Artikel in den Warenkorb; damit ist noch keine Mietanfrage gesendet." : done ? "Verfügbarkeit wird nach deiner Anfrage bestätigt." : (signCart || signReceipt) ? "Reservierung und Zahlung für deine Halteverbotsschilder-Sets." : step === "contact" ? "Ergänze deine Kontaktdaten und klicke auf „Mietanfrage senden“. Verfügbarkeit und verbindlichen Preis bestätigen wir anschließend." : "Deine Artikel sind vorgemerkt. Klicke auf „Weiter zur Anfrage“, ergänze deine Kontaktdaten und sende die Mietanfrage ab."}</DialogDescription></DialogHeader>
        {snapshot.cart && !signReceipt && <p className="flex items-center gap-2 text-sm font-semibold text-primary"><Clock className="h-4 w-4" />Warenkorb läuft ab in {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")} · danach werden ungesendete Artikel entfernt.</p>}
        {done ? <p role="status">{done} Unser Team prüft deine Anfrage und meldet sich bei dir.</p> : snapshot.expired && !edit ? <p role="status">Dein Warenkorb ist abgelaufen. Bitte wähle deine Artikel erneut.</p> : null}
        {!done && <RadioGroup className="flex flex-wrap gap-4" value={type} onValueChange={value => { if (value === "private" || value === "business") setCustomerType(value); }} aria-label="Kundenart">{([['private', 'Privatkunde'], ['business', 'Geschäftskunde']] as const).map(([value, label]) => <label key={value} className="flex items-center gap-2 text-sm"><RadioGroupItem value={value} />{label}</label>)}</RadioGroup>}
        {edit && (step === "period" || step === "accessories" || step === "options") && <div className="flex items-center gap-3 rounded-md border border-border p-3">{edit.image && <img src={edit.image} alt="" className="h-14 w-14 shrink-0 object-contain" />}<div className="min-w-0"><p className="truncate font-semibold">{edit.product_name}</p><p className="text-sm text-muted-foreground">Standort {getLocationById(edit.location)?.name}</p></div></div>}
        {edit && (step === "period" || step === "accessories" || step === "options") && <ol className="grid grid-cols-3 gap-2 text-xs font-semibold" aria-label="Fortschritt">{([['period', '1 · Zeitraum'], ['accessories', '2 · Zusatzartikel'], ['options', '3 · Versicherungen']] as const).map(([key, label]) => <li key={key} aria-current={step === key ? "step" : undefined} className={`border-b-2 pb-1 ${step === key ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{label}</li>)}</ol>}
        {edit && step === "period" && tariffs?.price_base_1_3_cd != null && <p className="text-sm font-semibold">Grundtarif 1–3 Kalendertage: {displayPrice(tariffs.price_base_1_3_cd, type)} pro {parseSetSize(edit.product_name) ? "Set" : "Artikel"}</p>}
        {edit && step === "period" && <RentalPeriodStep edit={edit} patch={patch} weekendPrice={weekendNet != null ? displayPrice(weekendNet, type) : null} weekendActive={!loading && editQuote?.unit === "pauschal"} />}
        {edit && step === "accessories" && <CartAccessories item={edit} existing={[...items, edit]} onAdd={item => save(addCartItem(state.cart, item))} />}
        {edit && step === "options" && <div className="space-y-2">{editQuote?.options.map(option => { const locked = option.is_default || (option.key.startsWith("sb_reduktion") && !option.surcharge_percent); const checked = option.is_default || edit.selected_addons.includes(option.key); return <label key={option.key} className={`flex items-start gap-3 rounded-md border p-3 ${checked ? "border-primary bg-primary/5" : "border-border"} ${locked && !option.is_default ? "opacity-70" : ""}`}><Checkbox className="mt-0.5" disabled={locked} checked={checked} onCheckedChange={value => patch({ selected_addons: value ? [...edit.selected_addons.filter(key => !editQuote?.options.find(o => o.key === key)?.surcharge_percent || !option.surcharge_percent), option.key] : edit.selected_addons.filter(key => key !== option.key) })} /><span className="min-w-0 flex-1 break-words text-sm"><span className="block font-semibold">{option.label}</span>{option.key === FREE_CANCELLATION_OPTION.key && <span className="block text-muted-foreground">{cancellationNote}</span>}{option.is_default && <span className="mt-1 inline-block rounded bg-muted px-1.5 py-0.5 text-xs">Pflicht</span>}{option.deductible ? <span className="block text-muted-foreground">Selbstbeteiligung {displayPrice(option.deductible, "business")}</span> : null}{option.key.startsWith("sb_reduktion") && !option.surcharge_percent && <span className="block text-muted-foreground">Konditionen werden im Angebot bestätigt</span>}</span>{!(option.key.startsWith("sb_reduktion") && !option.surcharge_percent) && (option.amount !== null || option.key === FREE_CANCELLATION_OPTION.key) && <span className="max-w-[40%] text-right break-words text-sm font-semibold">{addonPrice(option.key, option.amount)}</span>}</label>; })}</div>}
        {edit && (step === "period" || step === "accessories" || step === "options") && <div className="sticky -bottom-4 sm:-bottom-6 -mx-4 sm:-mx-6 border-t border-border bg-background px-4 sm:px-6 py-3 space-y-2">
          {validPeriod && editQuote?.rental_net != null && <div className="flex items-baseline justify-between gap-3"><span className="text-sm text-muted-foreground">{edit.product_slug === SIGN_PRODUCT_SLUG ? "1–10 Tage Festpreis" : editQuote.unit === "pauschal" ? "Wochenendtarif" : `${editQuote.duration} ${unitLabel(editQuote.duration, editQuote.unit)} Miete`}</span><span className="text-lg font-bold">{loading ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Preis wird berechnet" /> : price(editQuote.rental_net)}</span></div>}
          {validPeriod && edit?.product_slug !== SIGN_PRODUCT_SLUG && editQuote?.rental_net == null && weekendTariff({ date: edit.start_date, time: edit.start_time }, { date: edit.end_date, time: edit.end_time }, { price_weekend_num: 1 }) && <p className="text-sm font-semibold text-primary">Wochenendtarif · Preis im Angebot</p>}
          {quoteItems.length > 1 && <p className="text-xs text-muted-foreground">{quoteItems.length} Artikel inkl. Zusatzartikeln</p>}
          {cartQuoteTotal(quotes) > 0 && <div role="status" aria-live="polite" className="flex items-baseline justify-between gap-3 border-t border-border pt-2"><span className="text-sm font-semibold">{partial ? "Zwischensumme" : "Gesamt inkl. Optionen"}</span><span className="text-lg font-bold">{loading ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Preis wird berechnet" /> : price(cartQuoteTotal(quotes))}</span></div>}
          {step === "period" ? <><Button variant="outline" className="w-full" onClick={() => update({ edit: null })}><ArrowLeft className="h-4 w-4" />Zurück zum Warenkorb</Button>{!validPeriod && <p className="text-xs text-muted-foreground">Abhol- und Rückgabetag im Kalender wählen, dann jeweils die Uhrzeit.</p>}<Button className="w-full" disabled={!validPeriod || loading || !!quoteError} onClick={() => setStep("accessories")}>Weiter zu Zusatzartikeln</Button></>
            : step === "accessories" ? <div className="flex gap-2"><Button variant="outline" onClick={() => setStep("period")}><ArrowLeft className="h-4 w-4" />Zurück</Button><Button className="flex-1" disabled={loading || !!quoteError} onClick={() => setStep("options")}>Weiter zu Versicherungen</Button></div> : <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setStep("accessories")}><ArrowLeft className="h-4 w-4" />Zurück</Button><Button className="flex-1" disabled={loading || !!quoteError || items.length >= 30 && !items.some(item => item.id === edit.id)} onClick={() => { save(addCartItem(state.cart, edit)); update({ edit: null, expired: false }); setStep("cart"); }}><ShoppingCart className="h-4 w-4 shrink-0" />{items.some(item => item.id === edit.id) ? "Änderungen übernehmen" : "In den Warenkorb"}</Button></div>}
        </div>}
        {!edit && !done && !signReceipt && step === "cart" && <div className="space-y-4">{items.map(item => { const quote = quotes.find(line => line.id === item.id); return <div key={item.id} className="flex items-start gap-3 border-b border-border pb-4">{item.image && <img src={item.image} alt={item.product_name} className="h-16 w-16 object-contain shrink-0" />}<div className="min-w-0 flex-1"><strong>{item.product_name}</strong><p className="text-sm">{quantityLabel(item.quantity, parseSetSize(item.product_name))} · {getLocationById(item.location)?.name}</p><div className="my-2 flex flex-wrap items-center gap-2"><Label htmlFor={`cart-quantity-${item.id}`} className="text-xs">{parseSetSize(item.product_name) ? "Anzahl Sets" : "Anzahl"}</Label><Input id={`cart-quantity-${item.id}`} type="number" min={1} max={9999} step={1} className="h-9 w-20" value={item.quantity} onChange={event => { const quantity = Number(event.target.value); if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 9999 && state.cart) save(addCartItem(state.cart, { ...item, quantity })); }} /></div><p className="text-sm">{item.start_date} {item.start_time} – {item.end_date} {item.end_time}</p>{item.product_slug !== SIGN_PRODUCT_SLUG && (quote?.unit === "pauschal" || weekendTariff({ date: item.start_date, time: item.start_time }, { date: item.end_date, time: item.end_time }, { price_weekend_num: 1 })) && <p className="text-sm font-semibold text-primary">{quote?.unit === "pauschal" ? "Wochenendtarif" : "Wochenendtarif · Preis im Angebot"}</p>}{quote?.rental_net != null && <p className="font-semibold">{price(quote.rental_net)}</p>}{quote?.addons.filter(addon => addon.amount != null || addon.key === FREE_CANCELLATION_OPTION.key).map(addon => <p key={addon.key} className="text-sm">{addon.label}: {addonPrice(addon.key, addon.amount)}{addon.key === FREE_CANCELLATION_OPTION.key && <span className="block text-xs text-muted-foreground">{cancellationNote}</span>}</p>)}{quote?.deposit != null && quote.deposit > 0 && <p className="mt-2 text-sm font-semibold">Kaution: {depositPrice(quote.deposit)}</p>}</div><div className="flex flex-col gap-2"><Button size="icon" variant="ghost" aria-label={`${item.product_name} bearbeiten`} onClick={() => update({ edit: item })}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" aria-label={`${item.product_name} entfernen`} onClick={() => { const cart = state.cart; if (cart) save(cart.items.length === 1 ? null : { ...cart, items: cart.items.filter(row => row.id !== item.id) }); }}><Trash2 className="h-4 w-4" /></Button></div></div>; })}{!items.length && !snapshot.expired && <p>Dein Anfrage-Warenkorb ist leer.</p>}<div className="border-t border-border pt-3 space-y-1" role="status" aria-live="polite">{cartQuoteTotal(quotes) > 0 && <p className="flex justify-between gap-3 font-bold"><span>{partial ? "Zwischensumme" : "Gesamt inkl. Optionen"}</span><span>{loading ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Preis wird berechnet" /> : price(cartQuoteTotal(quotes))}</span></p>}{depositTotal > 0 && <><p className="flex justify-between gap-3 font-semibold"><span>Kaution{depositUnknown ? " (teilweise)" : " gesamt"}</span><span>{depositPrice(depositTotal)}</span></p><p className="text-xs text-muted-foreground">Kaution separat zur Miete, ohne Umsatzsteuer.</p></>}{depositUnknown && items.length > 0 && <p className="text-xs text-muted-foreground">{depositNote}</p>}</div><Button asChild variant="outline" className="w-full" onClick={() => update({ open: false })}><Link to={cartCategoryPath(items)}>Weitere Artikel auswählen</Link></Button>{items.length > 0 && <Button className="w-full" onClick={() => setStep("contact")} disabled={loading || !!quoteError}>{signCart ? "Weiter zur Buchung" : "Weiter zur Anfrage"}</Button>}</div>}
        {!edit && (signReceipt || step === "contact" && signCart) && <SignBookingCheckout items={items} requestId={snapshot.cart?.requestId ?? ""} expiresAt={snapshot.cart?.expiresAt ?? 0} customerKind={type} onReserved={() => { setSignReceipt(true); save(null); }} onBack={() => update({ open: false })} onNew={() => { setSignReceipt(false); setStep("cart"); }} />}
        {!edit && !signReceipt && step === "contact" && !signCart && items.length > 0 && <form onSubmit={submit} className="space-y-4"><Button type="button" variant="outline" onClick={() => setStep("cart")}><ArrowLeft className="h-4 w-4" />Zurück zum Warenkorb</Button><div className="space-y-2">{items.map(item => <p key={item.id} className="text-sm"><strong>{item.product_name}</strong><br />{item.start_date} {item.start_time} – {item.end_date} {item.end_time}{item.product_slug !== SIGN_PRODUCT_SLUG && weekendTariff({ date: item.start_date, time: item.start_time }, { date: item.end_date, time: item.end_time }, { price_weekend_num: 1 }) && <span className="block font-semibold text-primary">{quotes.find(line => line.id === item.id)?.unit === "pauschal" ? "Wochenendtarif" : "Wochenendtarif · Preis im Angebot"}</span>}</p>)}</div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{([['name','Vor- und Nachname'],['email','E-Mail'],['phone','Telefon'],['street','Straße und Hausnummer'],['postalCode','Postleitzahl'],['city','Ort']] as const).map(([key,label]) => <div key={key}><Label htmlFor={`cart-contact-${key}`}>{label}</Label><Input id={`cart-contact-${key}`} type={key === 'email' ? 'email' : 'text'} required value={contact[key]} onChange={e => setContact({ ...contact, [key]: e.target.value })} /></div>)}</div><Label htmlFor="cart-coupon">Gutscheincode (optional)</Label><Input id="cart-coupon" value={contact.couponCode} maxLength={20} onChange={e => setContact({ ...contact, couponCode: e.target.value.toUpperCase() })} />{coupon.message && <p role="status" className="text-sm">{coupon.message}</p>}<label className="flex items-center gap-2 text-sm"><Checkbox checked={contact.deliveryRequested} onCheckedChange={value => setContact({ ...contact, deliveryRequested: value === true, pickupConfirmed: false })} />Lieferung & Abholung gewünscht</label>{contact.deliveryRequested && <div className="space-y-3"><DeliveryAddressFields value={contact} onChange={next => setContact(current => ({ ...current, ...next }))} /><div role="status" className="rounded-md border border-border bg-muted/40 p-3 text-sm">{!deliveryAddressKey ? "Bitte vollständige Lieferadresse eingeben – die Lieferkosten werden dann automatisch berechnet." : deliveryKm.loading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Lieferkosten werden berechnet …</span> : delivery?.status === "priced" ? <><span className="flex justify-between gap-3 font-semibold"><span>Lieferung + Abholung</span><span>{price(delivery.net)}</span></span><span className="block text-muted-foreground">{delivery.km} km · berechnet nach „{delivery.product_name}“ (größtes Gerät){delivery.two_machines ? " · Aufschlag für 2 Maschinen" : ""}</span></> : delivery?.status === "on_request" ? (delivery.reason === "tieflader" ? `Lieferung per Tieflader für „${delivery.product_name}“ – Kosten nennen wir dir im Angebot.` : "Für diese Adresse (über 50 km oder nicht gefunden) nennen wir dir die Lieferkosten im Angebot.") : null}</div></div>}<Label htmlFor="cart-message">Kommentar / weitere Wünsche</Label><Input id="cart-message" value={contact.message} onChange={e => setContact({ ...contact, message: e.target.value })} /><div className="space-y-1">{rentTotal > 0 && <p>Miete: {price(rentTotal)}</p>}{addonTotal > 0 && <p>Optionen: {price(addonTotal)}</p>}{deliveryNet > 0 && <p>Lieferung: {price(deliveryNet)}</p>}{discount > 0 && <p>Gutschein: −{price(discount)}</p>}</div>{rentTotal + addonTotal + deliveryNet - discount > 0 && <strong className="block">{partial || (contact.deliveryRequested && delivery?.status !== "priced") ? "Zwischensumme" : "Voraussichtliche Summe"}: {price(rentTotal + addonTotal + deliveryNet - discount)}</strong>}{depositTotal > 0 && <><p className="font-semibold">Kaution{depositUnknown ? " (teilweise)" : " gesamt"}: {depositPrice(depositTotal)}</p><p className="text-xs text-muted-foreground">Kaution zusätzlich zur Mietsumme, ohne Umsatzsteuer.</p></>}{depositUnknown && <p className="text-xs text-muted-foreground">{depositNote}</p>}<p className="text-xs text-muted-foreground">{type === "private" ? "Inklusive 19 % USt." : "Netto zzgl. 19 % USt."} Verbindlicher Preis und gegebenenfalls Kaution im Angebot.</p>{!contact.deliveryRequested && <div className="space-y-2 border-t border-border pt-4"><p className="font-semibold">Sie wollen wirklich selbst abholen?</p><label className="flex items-start gap-3 text-sm"><Checkbox className="mt-0.5" checked={contact.pickupConfirmed} onCheckedChange={value => { setContact({ ...contact, pickupConfirmed: value === true }); setSendError(""); }} /><span>Ja, ich hole die Artikel selbst am jeweiligen Standort ab und bringe sie zurück.</span></label></div>}{sendError && <p role="alert" className="text-destructive">{sendError}</p>}<div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setStep("cart")}>Zurück</Button><Button type="submit" className="flex-1" disabled={sending || !coupon.valid || loading || !!quoteError || pickupConfirmationRequired(contact.deliveryRequested, contact.pickupConfirmed)}>{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mietanfrage senden"}</Button></div></form>}
        {quoteError && <p role="alert" className="text-destructive">{quoteError}</p>}
      </DialogContent>
    </Dialog>
  </>;
}