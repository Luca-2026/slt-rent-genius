import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { validCouponPercent } from "../../../supabase/functions/_shared/feedback-coupon-math";

type Customer = { id: string; company_name: string | null; first_name: string | null; last_name: string | null; email: string | null };
const customerLabel = (c: Customer) => c.company_name || [c.first_name, c.last_name].filter(Boolean).join(" ") || c.email || "—";

export function ManualCouponDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [percent, setPercent] = useState("10");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  useEffect(() => {
    if (!open) return;
    setQuery(""); setCustomer(null); setPercent("10"); setReason(""); setError("");
    let active = true;
    supabase.from("crm_customers").select("id,company_name,first_name,last_name,email").order("company_name").then(({ data, error }) => {
      if (!active) return;
      setCustomers(data ?? []);
      if (error) setError("Kunden konnten nicht geladen werden.");
    });
    return () => { active = false; };
  }, [open]);
  const amount = Number(percent.replace(",", "."));
  const save = async () => {
    if (busy || !customer || !validCouponPercent(amount) || reason.trim().length < 5) return;
    setBusy(true); setError("");
    const { error } = await supabase.rpc("issue_manual_rental_coupon", { p_customer: customer.id, p_percent: amount, p_reason: reason.trim() });
    setBusy(false);
    if (error) { setError(error.message); return; }
    toast({ title: "Gutschein erstellt" }); onCreated(); onClose();
  };
  const matches = customers.filter(c => c.email && `${customerLabel(c)} ${c.email}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 20);
  return <Dialog open={open} onOpenChange={value => { if (!value && !busy) onClose(); }}>
    <DialogContent className="max-w-md max-h-[85dvh] overflow-y-auto">
      <DialogHeader><DialogTitle>Gutschein erstellen</DialogTitle></DialogHeader>
      <div className="min-w-0 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="manual-coupon-customer">Kunde</Label>
          <Input id="manual-coupon-customer" value={query} placeholder="Name, Firma oder E-Mail" onChange={e => { setQuery(e.target.value); setCustomer(null); }} />
          {customer ? <p className="text-sm break-words">{customerLabel(customer)} · {customer.email}</p> : <div className="max-h-44 overflow-y-auto divide-y divide-border">
            {matches.map(c => <Button key={c.id} variant="ghost" className="w-full h-auto min-h-11 justify-start text-left whitespace-normal py-2" onClick={() => { setCustomer(c); setQuery(customerLabel(c)); }}><span className="min-w-0"><span className="block">{customerLabel(c)}</span><span className="block text-xs text-muted-foreground break-all">{c.email}</span></span></Button>)}
          </div>}
        </div>
        <div className="space-y-2"><Label htmlFor="manual-coupon-percent">Rabatt (%) · maximal 20</Label><Input id="manual-coupon-percent" type="number" min="0.01" max="20" step="0.01" value={percent} onChange={e => setPercent(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="manual-coupon-reason">Interner Vergabegrund</Label><Textarea id="manual-coupon-reason" value={reason} maxLength={500} onChange={e => setReason(e.target.value)} /></div>
        {error && <p role="alert" className="text-sm text-destructive break-words">{error}</p>}
      </div>
      <DialogFooter><Button variant="outline" disabled={busy} onClick={onClose}>Abbrechen</Button><Button onClick={save} disabled={busy || !customer || !validCouponPercent(amount) || reason.trim().length < 5}>{busy ? "Wird erstellt …" : "Gutschein erstellen"}</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}