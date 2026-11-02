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
import { Calendar } from "@/components/ui/calendar";
import { getLocationById, type Product, type LocationData } from "@/data/rentalData";
import { useCustomerType } from "@/hooks/useCustomerType";
import { displayPrice } from "@/lib/priceDisplay";
import { unitLabel } from "@/lib/pricing/rentalPricing";
import { usePublicCoupon } from "@/hooks/usePublicCoupon";
import { supabase } from "@/integrations/supabase/client";
import { useSigningOverlaysSuppressed } from "@/lib/signingOverlays";
import { CART_STORAGE_KEY, addCartItem, parseCart, cartExpired, type RentalCart, type RentalCartItem } from "@/lib/rentalCart";
import { isTrailerRoute } from "@/lib/rentalBookingMode";
import { pickupWindowForDate, pickupTimeOptions, getLocationInfoById } from "@/data/locationData";

let state: { cart: RentalCart | null; open: boolean; edit: RentalCartItem | null; expired: boolean } = { cart: null, open: false, edit: null, expired: false };
const listeners = new Set<() => void>();
function update(next: Partial<typeof state>) { state = { ...state, ...next }; listeners.forEach(fn => fn()); }
function save(cart: RentalCart | null) { update({ cart }); try { if (cart) localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); else localStorage.removeItem(CART_STORAGE_KEY); } catch { /* session state still works */ } }
export function openRentalRequest(product: Product, location: LocationData) {
  update({ open: true, expired: false, edit: { id: crypto.randomUUID(), product_slug: product.id, product_name: product.name, image: product.image, location: location.id, quantity: 1, start_date: "", start_time: "", end_date: "", end_time: "", selected_addons: [], use_saturday: false, use_sunday: false } });
}
type Quote = { id: string; product_name: string; unit: string; duration: number; unit_price: number | null; rental_net: number | null; addons: { key: string; label: string; amount: number | null; deductible: number | null }[]; options: { key: string; label: string; amount: number | null; is_default: boolean; surcharge_percent?: number; deductible?: number }[] };
const emptyContact = { name: "", email: "", phone: "", street: "", postalCode: "", city: "", couponCode: "", message: "" };

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
  const validPeriod = !!edit && !!edit.start_date && !!edit.end_date && !!edit.start_time && !!edit.end_time && `${edit.end_date}T${edit.end_time}` > `${edit.start_date}T${edit.start_time}`;
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
  useEffect(() => { if (edit) { setStep("period"); setDone(""); } }, [edit?.id]);
  useEffect(() => {
    if (!snapshot.open || !quoteItems.length || (edit && !validPeriod)) { setQuotes([]); return; }
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
  const remaining = Math.max(0, Math.ceil(((snapshot.cart?.expiresAt ?? now) - Date.now()) / 1000));
  const price = (amount: number | null) => amount === null ? "Preis auf Anfrage" : displayPrice(amount, type);
  const rentTotal = quotes.reduce((sum, line) => sum + (line.rental_net ?? 0), 0);
  const addonTotal = quotes.reduce((sum, line) => sum + line.addons.reduce((a, addon) => a + (addon.amount ?? 0), 0), 0);
  const discount = coupon.valid && contact.couponCode ? quotes.reduce((sum, line) => sum + (coupon.eligibleSlugs.includes(items.find(item => item.id === line.id)?.product_slug ?? "") ? Math.round((line.rental_net ?? 0) * 10) / 100 : 0), 0) : 0;
  const partial = quotes.some(line => line.rental_net === null || line.addons.some(addon => addon.amount === null));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!state.cart || cartExpired(state.cart) || !coupon.valid || !items.length) return;
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
    {!isTrailerRoute(route.pathname) && <Button variant="outline" size="icon" aria-label={`Mietanfrage-Warenkorb (${items.length} Artikel)`} title="Mietanfrage-Warenkorb" className="fixed right-3 top-12 z-50 h-11 w-11 bg-background" onClick={() => { update({ open: true, edit: null }); setStep("cart"); }}>
      <ShoppingCart className="h-5 w-5" /><span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs">{items.length}</span>
    </Button>}
    <Dialog open={snapshot.open} onOpenChange={open => update({ open, edit: open ? state.edit : null })}>
      <DialogContent className="max-w-3xl max-h-[92dvh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <DialogHeader><DialogTitle>{edit ? edit.product_name : "Deine Mietanfrage"}</DialogTitle><DialogDescription>Verfügbarkeit wird nach deiner Anfrage bestätigt.</DialogDescription></DialogHeader>
        {snapshot.cart && <p className="flex items-center gap-2 text-sm font-semibold text-primary"><Clock className="h-4 w-4" />Warenkorb läuft ab in {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")} · danach werden ungesendete Artikel entfernt.</p>}
        {done ? <p role="status">{done} Unser Team prüft deine Anfrage und meldet sich bei dir.</p> : snapshot.expired && !edit ? <p role="status">Dein Warenkorb ist abgelaufen. Bitte wähle deine Artikel erneut.</p> : null}
        {edit && step === "period" && <div className="space-y-4">
          <Calendar mode="range" locale={de} selected={edit.start_date ? { from: new Date(`${edit.start_date}T12:00:00`), to: edit.end_date ? new Date(`${edit.end_date}T12:00:00`) : undefined } : undefined} onSelect={range => patch({ start_date: range?.from ? format(range.from, "yyyy-MM-dd") : "", end_date: range?.to ? format(range.to, "yyyy-MM-dd") : "" })} className="mx-auto w-fit" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{([['start','Abholung'],['end','Rückgabe']] as const).map(([prefix,label]) => {
            const date = prefix === "start" ? edit.start_date : edit.end_date;
            const time = prefix === "start" ? edit.start_time : edit.end_time;
            const window = pickupWindowForDate(getLocationInfoById(edit.location), date);
            return <div key={prefix} className="space-y-2"><Label htmlFor={`cart-${prefix}-date`}>{label}</Label><Input id={`cart-${prefix}-date`} type="date" value={date} onChange={e => patch(prefix === "start" ? { start_date: e.target.value } : { end_date: e.target.value })} /><Input aria-label={`${label} Uhrzeit`} type="time" value={time} min={window?.open} max={window?.close} onChange={e => patch(prefix === "start" ? { start_time: e.target.value } : { end_time: e.target.value })} />{date && <p className="text-xs text-muted-foreground">{format(new Date(`${date}T12:00:00`), "EEEE, dd.MM.yyyy", { locale: de })}</p>}</div>;
          })}</div>
          <Label htmlFor="cart-quantity">Anzahl</Label><Input id="cart-quantity" type="number" min={1} max={9999} value={edit.quantity} onChange={e => patch({ quantity: Math.max(1, Math.min(9999, Number(e.target.value) || 1)) })} />
          <div className="flex flex-wrap gap-4">{([['use_saturday','Samstag als Nutzungstag'],['use_sunday','Sonntag als Nutzungstag']] as const).map(([key,label]) => <label key={key} className="flex items-center gap-2 text-sm"><Checkbox checked={edit[key]} onCheckedChange={value => patch({ [key]: value === true })} />{label}</label>)}</div>
          {validPeriod && quotes[0] && <p className="font-semibold">{quotes[0].duration} {unitLabel(quotes[0].duration, quotes[0].unit)} · {price(quotes[0].rental_net)}</p>}
          {!validPeriod && <p className="text-sm text-muted-foreground">Bitte Abholung und spätere Rückgabe mit Uhrzeit auswählen.</p>}
          <Button className="w-full" disabled={!validPeriod || loading || !!quoteError} onClick={() => setStep("options")}>Preis und Optionen</Button>
        </div>}
        {edit && step === "options" && <div className="space-y-4"><p className="font-semibold">Miete: {price(quotes[0]?.rental_net ?? null)}</p>{quotes[0]?.options.map(option => <label key={option.key} className="flex items-start gap-3 border-b border-border py-3"><Checkbox disabled={option.is_default || (option.key.startsWith("sb_reduktion") && !option.surcharge_percent)} checked={option.is_default || edit.selected_addons.includes(option.key)} onCheckedChange={value => patch({ selected_addons: value ? [...edit.selected_addons.filter(key => !quotes[0]?.options.find(o => o.key === key)?.surcharge_percent || !option.surcharge_percent), option.key] : edit.selected_addons.filter(key => key !== option.key) })} /><span className="text-sm">{option.label}{option.is_default ? " (Pflicht)" : ""} · {option.key.startsWith("sb_reduktion") && !option.surcharge_percent ? "Konditionen werden im Angebot bestätigt" : price(option.amount)}{option.deductible ? <span className="block text-muted-foreground">Selbstbeteiligung {displayPrice(option.deductible, "business")}</span> : null}</span></label>)}<div className="flex gap-2"><Button variant="outline" onClick={() => setStep("period")}><ArrowLeft className="h-4 w-4" />Zurück</Button><Button className="flex-1" disabled={loading || !!quoteError || items.length >= 30 && !items.some(item => item.id === edit.id)} onClick={() => { save(addCartItem(state.cart, edit)); update({ edit: null, expired: false }); setStep("cart"); }}>In den Anfrage-Warenkorb</Button></div></div>}
        {!edit && !done && step === "cart" && <div className="space-y-4">{items.map(item => { const quote = quotes.find(line => line.id === item.id); return <div key={item.id} className="flex items-start gap-3 border-b border-border pb-4">{item.image && <img src={item.image} alt={item.product_name} className="h-16 w-16 object-contain shrink-0" />}<div className="min-w-0 flex-1"><strong>{item.product_name}</strong><p className="text-sm">{item.quantity} Stück · {getLocationById(item.location)?.name}</p><p className="text-sm">{item.start_date} {item.start_time} – {item.end_date} {item.end_time}</p><p className="font-semibold">{price(quote?.rental_net ?? null)}</p>{quote?.addons.map(addon => <p key={addon.key} className="text-sm">{addon.label}: {price(addon.amount)}</p>)}</div><div className="flex flex-col gap-2"><Button size="icon" variant="ghost" aria-label={`${item.product_name} bearbeiten`} onClick={() => update({ edit: item })}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" aria-label={`${item.product_name} entfernen`} onClick={() => { const cart = state.cart; if (cart) save(cart.items.length === 1 ? null : { ...cart, items: cart.items.filter(row => row.id !== item.id) }); }}><Trash2 className="h-4 w-4" /></Button></div></div>; })}{!items.length && !snapshot.expired && <p>Dein Anfrage-Warenkorb ist leer.</p>}<Button asChild variant="outline" className="w-full" onClick={() => update({ open: false })}><Link to="/mieten/">Weitere Artikel auswählen</Link></Button>{items.length > 0 && <Button className="w-full" onClick={() => setStep("contact")} disabled={loading || !!quoteError}>Mietanfrage vervollständigen</Button>}</div>}
        {!edit && step === "contact" && items.length > 0 && <form onSubmit={submit} className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{([['name','Vor- und Nachname'],['email','E-Mail'],['phone','Telefon'],['street','Straße und Hausnummer'],['postalCode','Postleitzahl'],['city','Ort']] as const).map(([key,label]) => <div key={key}><Label htmlFor={`cart-contact-${key}`}>{label}</Label><Input id={`cart-contact-${key}`} type={key === 'email' ? 'email' : 'text'} required value={contact[key]} onChange={e => setContact({ ...contact, [key]: e.target.value })} /></div>)}</div><Label htmlFor="cart-coupon">Gutscheincode (optional)</Label><Input id="cart-coupon" value={contact.couponCode} maxLength={20} onChange={e => setContact({ ...contact, couponCode: e.target.value.toUpperCase() })} />{coupon.message && <p role="status" className="text-sm">{coupon.message}</p>}<Label htmlFor="cart-message">Kommentar / Lieferung gewünscht</Label><Input id="cart-message" value={contact.message} onChange={e => setContact({ ...contact, message: e.target.value })} /><p>Miete {price(rentTotal)} · Optionen {price(addonTotal)}{discount > 0 ? ` · Gutschein −${price(discount)}` : ""}</p><strong className="block">{partial ? "Bekannte Zwischensumme" : "Voraussichtliche Summe"}: {price(rentTotal + addonTotal - discount)}</strong><p className="text-xs text-muted-foreground">{type === "private" ? "Inklusive 19 % USt." : "Netto zzgl. 19 % USt."} Verbindlicher Preis und gegebenenfalls Kaution im Angebot.</p>{sendError && <p role="alert" className="text-destructive">{sendError}</p>}<div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setStep("cart")}>Zurück</Button><Button type="submit" className="flex-1" disabled={sending || !coupon.valid || loading || !!quoteError}>{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mietanfrage senden"}</Button></div></form>}
        {loading && <p role="status" className="text-sm">CMS-Preise werden geprüft …</p>}{quoteError && <p role="alert" className="text-destructive">{quoteError}</p>}
      </DialogContent>
    </Dialog>
  </>;
}