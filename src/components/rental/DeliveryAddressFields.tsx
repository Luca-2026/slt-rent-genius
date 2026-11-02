import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Address = { deliveryStreet: string; deliveryPostalCode: string; deliveryCity: string };
type Suggestion = { placeId: string; text: string };
export function DeliveryAddressFields({ value, onChange }: { value: Address; onChange: (next: Partial<Address>) => void }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [search, setSearch] = useState("");
  const session = useRef(crypto.randomUUID());
  useEffect(() => {
    if (search.length < 3) { setSuggestions([]); return; }
    let active = true;
    const timer = setTimeout(async () => {
      const { data } = await supabase.functions.invoke("geo-address", { body: { action: "autocomplete", input: `${search} ${value.deliveryPostalCode} ${value.deliveryCity}`.trim(), sessionToken: session.current } });
      if (active) setSuggestions(data?.suggestions ?? []);
    }, 350);
    return () => { active = false; clearTimeout(timer); };
  }, [search, value.deliveryPostalCode, value.deliveryCity]);
  useEffect(() => {
    if (!/^\d{5}$/.test(value.deliveryPostalCode)) return;
    let active = true;
    const timer = setTimeout(async () => {
      const { data } = await supabase.functions.invoke("geo-address", { body: { action: "postal", postalCode: value.deliveryPostalCode } });
      if (active && data?.city) onChange({ deliveryCity: data.city });
    }, 350);
    return () => { active = false; clearTimeout(timer); };
  }, [value.deliveryPostalCode]);
  const choose = async (suggestion: Suggestion) => {
    setSuggestions([]); setSearch("");
    const { data } = await supabase.functions.invoke("geo-address", { body: { action: "details", placeId: suggestion.placeId, sessionToken: session.current } });
    if (data?.street) onChange({ deliveryStreet: data.street, deliveryPostalCode: data.postalCode || value.deliveryPostalCode, deliveryCity: data.city || value.deliveryCity });
    session.current = crypto.randomUUID();
  };
  return <div className="space-y-3"><div><Label htmlFor="cart-deliveryStreet">Lieferstraße und Hausnummer</Label><Input id="cart-deliveryStreet" required autoComplete="street-address" value={value.deliveryStreet} onChange={event => { onChange({ deliveryStreet: event.target.value }); setSearch(event.target.value); }} />{suggestions.length > 0 && <ul className="mt-1 rounded-md border border-border bg-popover">{suggestions.map(suggestion => <li key={suggestion.placeId}><Button type="button" variant="ghost" className="h-auto w-full justify-start whitespace-normal text-left" onClick={() => choose(suggestion)}>{suggestion.text}</Button></li>)}</ul>}</div><div className="grid grid-cols-2 gap-3"><div><Label htmlFor="cart-deliveryPostalCode">Lieferpostleitzahl</Label><Input id="cart-deliveryPostalCode" required inputMode="numeric" autoComplete="postal-code" maxLength={5} value={value.deliveryPostalCode} onChange={event => onChange({ deliveryPostalCode: event.target.value })} /></div><div><Label htmlFor="cart-deliveryCity">Lieferort</Label><Input id="cart-deliveryCity" required autoComplete="address-level2" value={value.deliveryCity} onChange={event => onChange({ deliveryCity: event.target.value })} /></div></div></div>;
}