import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ShieldCheck, Save, Search } from "lucide-react";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { useCrmCustomers, crmCustomerLabel } from "@/hooks/useCrmCustomers";
import { useCreditAssessments } from "@/hooks/useCreditAssessments";
import { supabase } from "@/integrations/supabase/client";
import { canManageCreditChecks, creditAssessmentSchema, creditEuro, findCreditCustomerMatches } from "@/lib/creditAssessment";
import { toast } from "sonner";

export default function CreditChecks() {
  const access = useStaffAccess();
  const allowed = canManageCreditChecks(access.isAdmin, access.isBranchManager, Boolean(access.staffProfile));
  const { rows: customers } = useCrmCustomers();
  const [params, setParams] = useSearchParams();
  const customerId = params.get("kunde") || "";
  const customer = customers.find((c) => c.id === customerId);
  const { rows, error, loading, reload } = useCreditAssessments(allowed);
  const [company, setCompany] = useState("");
  const [rating, setRating] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState("");
  const [registration, setRegistration] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const eligible = customers.filter((c) => c.customer_kind === "business" || c.customer_kind === "b2b");
  const matches = customerId ? [] : findCreditCustomerMatches(customers, company, postal, city);
  const displayed = rows.filter((r) => (!customerId || r.crm_customer_id === customerId) && [r.company_name, r.rating, r.report_reference].some((v) => (v || "").toLowerCase().includes(search.toLowerCase())));
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving || !allowed) return;
    if (customerId && !eligible.some((c) => c.id === customerId)) { toast.error("Bitte einen Geschäftskunden auswählen."); return; }
    const parsed = creditAssessmentSchema.safeParse({ company_name: customer ? crmCustomerLabel(customer) : company, rating: rating.trim() || null, recommended_limit: amount.trim() ? Number(amount.replace(",", ".")) : null, notes });
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message || "Bitte Eingaben prüfen."); return; }
    if (!date || date > new Date().toISOString().slice(0, 10)) { toast.error("Bitte einen gültigen Prüfzeitpunkt wählen."); return; }
    setSaving(true);
    const { error: err } = await supabase.from("customer_credit_assessments").insert({ company_name: parsed.data.company_name || "", rating: parsed.data.rating, recommended_limit: parsed.data.recommended_limit, notes: parsed.data.notes, crm_customer_id: customerId || null, checked_at: `${date}T00:00:00Z`, source: "manual_creditsafe", registration_number: registration.trim() || null, report_reference: reference.trim() || null, postal_code: customer?.postal_code || postal.trim() || null, city: customer?.city || city.trim() || null });
    setSaving(false);
    if (err) { toast.error(err.message); return; }
    toast.success("Bonitätsprüfung dokumentiert. Kein Kreditlimit vergeben.");
    setRating(""); setAmount(""); setNotes(""); setReference("");
    await reload();
  };
  return <B2BPortalLayout title="Bonitätsprüfung">
    {access.loading ? <p>Wird geladen …</p> : !allowed ? <p role="alert" className="text-destructive">Nur Niederlassungsleitung und Admins dürfen Bonitätsprüfungen durchführen.</p> : <div className="space-y-7">
      <div role="status" className="border-l-4 border-accent bg-muted p-3 text-sm">CreditSafe-Anbindung ausstehend. Ergebnisse aus dem CreditSafe-Online-Tool können manuell dokumentiert werden. Eine Empfehlung vergibt kein Kreditlimit.</div>
      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4"><ShieldCheck className="h-5 w-5" /> Prüfung dokumentieren</h2>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5"><Label>Kundenkartei zuordnen</Label><Select value={customerId || "standalone"} onValueChange={(id) => { const next = new URLSearchParams(params); if (id === "standalone") next.delete("kunde"); else next.set("kunde", id); setParams(next); }}><SelectTrigger aria-label="Kundenkartei zuordnen"><SelectValue placeholder="Ohne Zuordnung" /></SelectTrigger><SelectContent><SelectItem value="standalone">Ohne Zuordnung</SelectItem>{eligible.map((c) => <SelectItem key={c.id} value={c.id}>{crmCustomerLabel(c)}{c.city ? ` · ${c.city}` : ""}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="credit-company" label="Firma / Einzelunternehmen" value={customer ? crmCustomerLabel(customer) : company} onChange={setCompany} readOnly={Boolean(customer)} required maxLength={255} />
            {!customerId && matches.length > 0 && <div className="sm:col-span-2 border-l-2 border-primary pl-3 space-y-2" aria-label="Passende Kunden"><p className="text-sm font-semibold">Passende Kunden in der Kundenkartei</p>{matches.map((c) => <Button type="button" key={c.id} variant="outline" className="w-full h-auto min-h-10 justify-start whitespace-normal text-left" onClick={() => { const next = new URLSearchParams(params); next.set("kunde", c.id); setParams(next); }}><span className="min-w-0 break-words">{crmCustomerLabel(c)} · {[c.postal_code, c.city].filter(Boolean).join(" ")} · Zuordnen</span></Button>)}</div>}
            <Field id="credit-registration" label="Handelsregister- / Registrierungsnummer" value={registration} onChange={setRegistration} maxLength={100} />
            <Field id="credit-postal" label="Postleitzahl" value={customer?.postal_code || postal} onChange={setPostal} readOnly={Boolean(customer)} maxLength={20} />
            <Field id="credit-city" label="Ort" value={customer?.city || city} onChange={setCity} readOnly={Boolean(customer)} maxLength={255} />
            <Field id="credit-rating" label="CreditSafe-Rating" value={rating} onChange={setRating} maxLength={100} />
            <Field id="credit-amount" label="Empfohlenes Kreditlimit (EUR)" value={amount} onChange={setAmount} type="number" min="0" step="0.01" />
            <Field id="credit-date" label="Prüfdatum" value={date} onChange={setDate} type="date" required />
            <Field id="credit-reference" label="CreditSafe-Berichtsreferenz" value={reference} onChange={setReference} maxLength={255} />
          </div>
          <div className="flex flex-wrap items-center gap-2"><Button type="button" variant="outline" disabled><ShieldCheck className="h-4 w-4 mr-2" /> Jetzt über CreditSafe prüfen</Button><span className="text-sm text-muted-foreground">Noch nicht verbunden – API-Zugangsdaten ausstehend</span></div>
          <div className="space-y-1.5"><Label htmlFor="credit-notes">Notiz</Label><Textarea id="credit-notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={4000} /></div>
          <Button type="submit" disabled={saving} className="w-full sm:w-auto"><Save className="h-4 w-4 mr-2" />{saving ? "Wird gespeichert …" : "Prüfung speichern"}</Button>
        </form>
      </section>
      <section className="border-t border-border pt-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">Prüfverlauf</h2><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Prüfverlauf durchsuchen" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Firma, Rating, Referenz" /></div></div>
        {error ? <p role="alert" className="text-destructive">Prüfverlauf konnte nicht geladen werden.</p> : loading ? <p>Wird geladen …</p> : !displayed.length ? <p className="text-muted-foreground">Noch keine Prüfungen dokumentiert.</p> : <ul className="divide-y divide-border">{displayed.map((r) => <li key={r.id} className="py-4 space-y-1 text-sm"><div className="flex flex-wrap justify-between gap-2"><strong className="break-words">{r.company_name}</strong><span>{new Date(r.checked_at).toLocaleDateString("de-DE")}</span></div><p>Rating: {r.rating || "Nicht angegeben"} · Empfehlung: {r.recommended_limit != null ? creditEuro(Number(r.recommended_limit)) : "Nicht angegeben"}</p><p className="text-muted-foreground">{r.source === "manual_creditsafe" ? "Manuell aus CreditSafe dokumentiert" : "CreditSafe-Abruf"}{r.report_reference ? ` · ${r.report_reference}` : ""}</p>{r.notes && <p className="whitespace-pre-wrap break-words">{r.notes}</p>}{r.crm_customer_id ? <Button asChild variant="link" size="sm" className="px-0"><Link to={`/b2b/kundendaten?kunde=${r.crm_customer_id}`}>Kundenkartei öffnen</Link></Button> : <p className="text-muted-foreground">Ohne Zuordnung</p>}</li>)}</ul>}
      </section>
    </div>}
  </B2BPortalLayout>;
}

function Field({ label, onChange, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & { label: string; onChange: (v: string) => void }) {
  return <div className="space-y-1.5 min-w-0"><Label htmlFor={props.id}>{label}</Label><Input {...props} onChange={(e) => onChange(e.target.value)} /></div>;
}