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
import { RentalPeriodStep } from "./RentalPeriodStep";
import { getLocationById, type Product, type LocationData } from "@/data/rentalData";
import { useCustomerType, setCustomerType } from "@/hooks/useCustomerType";
import { displayPrice } from "@/lib/priceDisplay";
import { unitLabel } from "@/lib/pricing/rentalPricing";
import { usePublicCoupon } from "@/hooks/usePublicCoupon";
import { supabase } from "@/integrations/supabase/client";
import { useSigningOverlaysSuppressed } from "@/lib/signingOverlays";
import { CART_STORAGE_KEY, addCartItem, parseCart, cartExpired, cartRemainingSeconds, type RentalCart, type RentalCartItem } from "@/lib/rentalCart";
import { isTrailerRoute } from "@/lib/rentalBookingMode";
import { pickupWindowForDate, getLocationInfoById } from "@/data/locationData";
import { validPublicRentalPeriod, validCalendarDate } from "../../../supabase/functions/_shared/public-rental-period";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

let state: { cart: RentalCart | null; open: boolean; edit: RentalCartItem | null; expired: boolean } = { cart: null, open: false, edit: null, expired: false };
const listeners = new Set<() => void>();
function update(next: Partial<typeof state>) { state = { ...state, ...next }; listeners.forEach(fn => fn()); }
function save(cart: RentalCart | null) { update({ cart }); try { if (cart) localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); else localStorage.removeItem(CART_STORAGE_KEY); } catch { /* session state still works */ } }
export function openRentalRequest(product: Product, location: LocationData) {
  update({ open: true, expired: false, edit: { id: crypto.randomUUID(), product_slug: product.id, product_name: product.name, image: product.image, location: location.id, quantity: 1, start_date: "", start_time: "", end_date: "", end_time: "", selected_addons: [], use_saturday: false, use_sunday: false } });
}
type Quote = { id: string; product_name: string; unit: string; duration: number; unit_price: number | null; rental_net: number | null; addons: { key: string; label: string; amount: number | null; deductible: number | null }[]; options: { key: string; label: string; amount: number | null; is_default: boolean; surcharge_percent?: number; deductible?: number }[] };
const emptyContact = { name: "", email: "", phone: "", street: "", postalCode: "", city: "", couponCode: "", message: "", deliveryRequested: false, deliveryStreet: "", deliveryPostalCode: "", deliveryCity: "" };

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
  const [step, setStep] = useState<"period" | "options" | "cart" | "contact">("cart");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quoteError, setQuoteError] = useState("");
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState(emptyContact);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [done, setDone] = useState("");
  const items = snapshot.cart?.items ?? [];
  const edit = snapshot.edit;
  const validPeriod = !!edit && validPublicRentalPeriod(edit);
  const quoteItems = edit && validPeriod ? [edit] : items;
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
  useEffect(() => { if (edit) { setStep("period"); setDone(""); } else if (snapshot.open) setStep("cart"); }, [edit?.id, snapshot.open]);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("public-rental-dialog", { detail: snapshot.open }));
    return () => { window.dispatchEvent(new CustomEvent("public-rental-dialog", { detail: false })); };
  }, [snapshot.open]);
  useEffect(() => {
    if (!snapshot.open || !quoteItems.length || (edit && !validPeriod)) { setQuotes([]); setLoading(false); setQuoteError(""); return; }
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
  const price = (amount: number | null) => amount === null ? "Preis auf Anfrage" : displayPrice(amount, type);
  const rentTotal = quotes.reduce((sum, line) => sum + (line.rental_net ?? 0), 0);
  const addonTotal = quotes.reduce((sum, line) => sum + line.addons.reduce((a, addon) => a + (addon.amount ?? 0), 0), 0);
  const discount = coupon.valid && contact.couponCode ? quotes.reduce((sum, line) => sum + (coupon.eligibleSlugs.includes(items.find(item => item.id === line.id)?.product_slug ?? "") ? Math.round((line.rental_net ?? 0) * 10) / 100 : 0), 0) : 0;
  const partial = quotes.some(line => line.rental_net === null || line.addons.some(addon => addon.amount === null));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending || !state.cart || cartExpired(state.cart) || !coupon.valid || !items.length) return;
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
      <DialogContent className="max-w-3xl max-h-[92dvh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <DialogHeader><DialogTitle>{edit ? "Mietanfrage" : "Deine Mietanfrage"}</DialogTitle><DialogDescription>Verfügbarkeit wird nach deiner Anfrage bestätigt.</DialogDescription></DialogHeader>
        {snapshot.cart && <p className="flex items-center gap-2 text-sm font-semibold text-primary"><Clock className="h-4 w-4" />Warenkorb läuft ab in {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")} · danach werden ungesendete Artikel entfernt.</p>}
        {done ? <p role="status">{done} Unser Team prüft deine Anfrage und meldet sich bei dir.</p> : snapshot.expired && !edit ? <p role="status">Dein Warenkorb ist abgelaufen. Bitte wähle deine Artikel erneut.</p> : null}
        {!done && <RadioGroup className="flex flex-wrap gap-4" value={type} onValueChange={value => { if (value === "private" || value === "business") setCustomerType(value); }} aria-label="Kundenart">{([['private', 'Privatkunde'], ['business', 'Geschäftskunde']] as const).map(([value, label]) => <label key={value} className="flex items-center gap-2 text-sm"><RadioGroupItem value={value} />{label}</label>)}</RadioGroup>}
        {edit && (step === "period" || step === "options") && <div className="flex items-center gap-3 rounded-md border border-border p-3">{edit.image && <img src={edit.image} alt="" className="h-14 w-14 shrink-0 object-contain" />}<div className="min-w-0"><p className="truncate font-semibold">{edit.product_name}</p><p className="text-sm text-muted-foreground">Standort {getLocationById(edit.location)?.name}</p></div></div>}
        {edit && (step === "period" || step === "options") && <ol className="grid grid-cols-2 gap-2 text-xs font-semibold" aria-label="Fortschritt">{([['period', '1 · Zeitraum'], ['options', '2 · Optionen']] as const).map(([key, label]) => <li key={key} aria-current={step === key ? "step" : undefined} className={`border-b-2 pb-1 ${step === key ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{label}</li>)}</ol>}
        {edit && step === "period" && <RentalPeriodStep edit={edit} patch={patch} />}
        {edit && step === "options" && <div className="space-y-2">{quotes[0]?.options.map(option => { const locked = option.is_default || (option.key.startsWith("sb_reduktion") && !option.surcharge_percent); const checked = option.is_default || edit.selected_addons.includes(option.key); return <label key={option.key} className={`flex items-start gap-3 rounded-md border p-3 ${checked ? "border-primary bg-primary/5" : "border-border"} ${locked && !option.is_default ? "opacity-70" : ""}`}><Checkbox className="mt-0.5" disabled={locked} checked={checked} onCheckedChange={value => patch({ selected_addons: value ? [...edit.selected_addons.filter(key => !quotes[0]?.options.find(o => o.key === key)?.surcharge_percent || !option.surcharge_percent), option.key] : edit.selected_addons.filter(key => key !== option.key) })} /><span className="flex-1 text-sm"><span className="font-semibold">{option.label}</span>{option.is_default && <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs">Pflicht</span>}{option.deductible ? <span className="block text-muted-foreground">Selbstbeteiligung {displayPrice(option.deductible, "business")}</span> : null}{option.key.startsWith("sb_reduktion") && !option.surcharge_percent && <span className="block text-muted-foreground">Konditionen werden im Angebot bestätigt</span>}</span>{!(option.key.startsWith("sb_reduktion") && !option.surcharge_percent) && <span className="shrink-0 text-sm font-semibold">{price(option.amount)}</span>}</label>; })}</div>}
        {edit && (step === "period" || step === "options") && <div className="sticky -bottom-4 sm:-bottom-6 -mx-4 sm:-mx-6 border-t border-border bg-background px-4 sm:px-6 py-3 space-y-2">
          <div className="flex items-baseline justify-between gap-3"><span className="text-sm text-muted-foreground">{validPeriod && quotes[0] ? `${quotes[0].duration} ${unitLabel(quotes[0].duration, quotes[0].unit)} Miete` : "Mietpreis"}</span><span className="text-lg font-bold">{loading ? "…" : validPeriod && quotes[0] ? price(quotes[0].rental_net) : "–"}</span></div>
          {step === "period" ? <>{!validPeriod && <p className="text-xs text-muted-foreground">Abhol- und Rückgabetag im Kalender wählen, dann jeweils die Uhrzeit.</p>}<Button className="w-full" disabled={!validPeriod || loading || !!quoteError} onClick={() => setStep("options")}>Weiter zu Optionen</Button></>
            : <div className="flex gap-2"><Button variant="outline" onClick={() => setStep("period")}><ArrowLeft className="h-4 w-4" />Zurück</Button><Button className="flex-1" disabled={loading || !!quoteError || items.length >= 30 && !items.some(item => item.id === edit.id)} onClick={() => { save(addCartItem(state.cart, edit)); update({ edit: null, expired: false }); setStep("cart"); }}>In den Anfrage-Warenkorb</Button></div>}
        </div>}
        {!edit && !done && step === "cart" && <div className="space-y-4">{items.map(item => { const quote = quotes.find(line => line.id === item.id); return <div key={item.id} className="flex items-start gap-3 border-b border-border pb-4">{item.image && <img src={item.image} alt={item.product_name} className="h-16 w-16 object-contain shrink-0" />}<div className="min-w-0 flex-1"><strong>{item.product_name}</strong><p className="text-sm">{item.quantity} Stück · {getLocationById(item.location)?.name}</p><p className="text-sm">{item.start_date} {item.start_time} – {item.end_date} {item.end_time}</p><p className="font-semibold">{price(quote?.rental_net ?? null)}</p>{quote?.addons.map(addon => <p key={addon.key} className="text-sm">{addon.label}: {price(addon.amount)}</p>)}</div><div className="flex flex-col gap-2"><Button size="icon" variant="ghost" aria-label={`${item.product_name} bearbeiten`} onClick={() => update({ edit: item })}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" aria-label={`${item.product_name} entfernen`} onClick={() => { const cart = state.cart; if (cart) save(cart.items.length === 1 ? null : { ...cart, items: cart.items.filter(row => row.id !== item.id) }); }}><Trash2 className="h-4 w-4" /></Button></div></div>; })}{!items.length && !snapshot.expired && <p>Dein Anfrage-Warenkorb ist leer.</p>}<Button asChild variant="outline" className="w-full" onClick={() => update({ open: false })}><Link to="/mieten/">Weitere Artikel auswählen</Link></Button>{items.length > 0 && <Button className="w-full" onClick={() => setStep("contact")} disabled={loading || !!quoteError}>Mietanfrage vervollständigen</Button>}</div>}
        {!edit && step === "contact" && items.length > 0 && <form onSubmit={submit} className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{([['name','Vor- und Nachname'],['email','E-Mail'],['phone','Telefon'],['street','Straße und Hausnummer'],['postalCode','Postleitzahl'],['city','Ort']] as const).map(([key,label]) => <div key={key}><Label htmlFor={`cart-contact-${key}`}>{label}</Label><Input id={`cart-contact-${key}`} type={key === 'email' ? 'email' : 'text'} required value={contact[key]} onChange={e => setContact({ ...contact, [key]: e.target.value })} /></div>)}</div><Label htmlFor="cart-coupon">Gutscheincode (optional)</Label><Input id="cart-coupon" value={contact.couponCode} maxLength={20} onChange={e => setContact({ ...contact, couponCode: e.target.value.toUpperCase() })} />{coupon.message && <p role="status" className="text-sm">{coupon.message}</p>}<label className="flex items-center gap-2 text-sm"><Checkbox checked={contact.deliveryRequested} onCheckedChange={value => setContact({ ...contact, deliveryRequested: value === true })} />Lieferung gewünscht</label>{contact.deliveryRequested && <div className="space-y-3">{([['deliveryStreet','Lieferstraße und Hausnummer'],['deliveryPostalCode','Lieferpostleitzahl'],['deliveryCity','Lieferort']] as const).map(([key,label]) => <div key={key}><Label htmlFor={`cart-${key}`}>{label}</Label><Input id={`cart-${key}`} required value={contact[key]} onChange={e => setContact({ ...contact, [key]: e.target.value })} /></div>)}<p className="text-sm text-muted-foreground">Lieferkosten werden im Angebot bestätigt und sind in der Zwischensumme noch nicht enthalten.</p></div>}<Label htmlFor="cart-message">Kommentar / weitere Wünsche</Label><Input id="cart-message" value={contact.message} onChange={e => setContact({ ...contact, message: e.target.value })} /><p>Miete {price(rentTotal)} · Optionen {price(addonTotal)}{discount > 0 ? ` · Gutschein −${price(discount)}` : ""}</p><strong className="block">{partial || contact.deliveryRequested ? "Bekannte Zwischensumme" : "Voraussichtliche Summe"}: {price(rentTotal + addonTotal - discount)}</strong><p className="text-xs text-muted-foreground">{type === "private" ? "Inklusive 19 % USt." : "Netto zzgl. 19 % USt."} Verbindlicher Preis und gegebenenfalls Kaution im Angebot.</p>{sendError && <p role="alert" className="text-destructive">{sendError}</p>}<div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setStep("cart")}>Zurück</Button><Button type="submit" className="flex-1" disabled={sending || !coupon.valid || loading || !!quoteError}>{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mietanfrage senden"}</Button></div></form>}
        {loading && <p role="status" className="text-sm">CMS-Preise werden geprüft …</p>}{quoteError && <p role="alert" className="text-destructive">{quoteError}</p>}
      </DialogContent>
    </Dialog>
  </>;
}