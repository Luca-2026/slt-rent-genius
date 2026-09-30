import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NumberInput } from "@/components/ui/number-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, ArrowLeft, Loader2, Trash2, UserCheck, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { resolveCatalogPrice } from "@/lib/catalogPricing";
import { InquiryProductCombobox, type CatalogProduct } from "./InquiryProductCombobox";
import { useCrmCustomers, crmCustomerLabel, type CrmCustomer } from "@/hooks/useCrmCustomers";

/* ---------- Typen der Server-Antwort (parse-inquiry-text) ---------- */
type Confidence = "high" | "medium" | "low" | "none";
interface MatchedProduct {
  slug: string; name: string; model_name: string | null; category: string | null;
  bookable_locations: string[]; bookable_here: boolean | null;
  price_per_day: string | null; price_weekend: string | null; price_per_month: string | null;
  image: string | null;
}
interface ItemMatch {
  index: number; original_text: string; quantity: number; confidence: Confidence;
  reason: string | null; product: MatchedProduct | null; alternatives: MatchedProduct[];
}
interface Extraction {
  customer: {
    first_name: string | null; last_name: string | null; company: string | null; email: string | null;
    phone: string | null; street: string | null; postal_code: string | null; city: string | null;
    customer_type: "private" | "business" | null;
  };
  location: "krefeld" | "bonn" | "muelheim" | null;
  rental: { start_date: string | null; end_date: string | null; duration_days: number | null; date_text: string | null };
  delivery: { requested: boolean | null; street: string | null; postal_code: string | null; city: string | null };
  notes: string | null;
  open_questions: string[];
}

/* ---------- Prüfdaten (editierbar) ---------- */
export interface ReviewLine {
  key: string;
  original_text: string;
  confidence: Confidence;
  reason: string | null;
  options: MatchedProduct[];
  product_name: string;
  product_slug: string | null;
  quantity: number;
  unit_price: number | null; // null = kein Preis
  unit: string;
  price_source: "cms" | "manual" | null;
}
export interface ReviewState {
  source_text: string;
  location: string;
  customer_kind: "private" | "business" | "";
  company_name: string; customer_name: string; customer_email: string; customer_phone: string;
  customer_street: string; customer_postal_code: string; customer_city: string;
  start_date: string; end_date: string; date_text: string | null;
  delivery: boolean | null;
  delivery_street: string; delivery_postal_code: string; delivery_city: string;
  notes: string;
  open_questions: string[];
  lines: ReviewLine[];
  crm_customer_id: string | null;
}

const DRAFT_KEY = "slt-ai-inquiry-import-v1";
const LOC_LABEL: Record<string, string> = { krefeld: "Krefeld", bonn: "Bonn", muelheim: "Mülheim an der Ruhr" };
const CONF_LABEL: Record<Confidence, string> = { high: "Sicher", medium: "Variante prüfen", low: "Unsicher", none: "Nicht zugeordnet" };
const money = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);
const productLabel = (p: MatchedProduct) => `${p.name}${p.model_name ? ` (${p.model_name})` : ""}`;
const normPhone = (p: string | null | undefined) => (p ?? "").replace(/\D/g, "").replace(/^49/, "").replace(/^0/, "");

async function priceFor(p: { slug: string; price_per_day: string | null; price_weekend?: string | null; price_per_month?: string | null } | null) {
  if (!p) return undefined;
  return resolveCatalogPrice({ slug: p.slug, price_per_day: p.price_per_day, price_weekend: p.price_weekend ?? null, price_per_month: p.price_per_month ?? null });
}

/** Findet einen bestehenden Kunden über E-Mail oder Telefon. */
export function findCrmMatch(customers: CrmCustomer[], email: string, phone: string): CrmCustomer | null {
  const e = email.trim().toLowerCase();
  if (e) {
    const hit = customers.find((c) => (c.email ?? "").trim().toLowerCase() === e);
    if (hit) return hit;
  }
  const p = normPhone(phone);
  if (p.length >= 6) return customers.find((c) => normPhone(c.phone) === p) ?? null;
  return null;
}

async function toReview(text: string, x: Extraction, matches: ItemMatch[]): Promise<ReviewState> {
  const lines = await Promise.all(
    matches.map(async (m) => {
      const options = m.product ? [m.product, ...m.alternatives] : m.alternatives;
      const resolved = await priceFor(m.product);
      return {
        key: `l${m.index}-${Math.random().toString(36).slice(2, 7)}`,
        original_text: m.original_text,
        confidence: m.confidence,
        reason: m.reason,
        options,
        product_name: m.product ? m.product.name : "",
        product_slug: m.product?.slug ?? null,
        quantity: m.quantity,
        unit_price: resolved?.price ?? null,
        unit: resolved?.unit ?? "kalendertage",
        price_source: resolved ? "cms" : null,
      } satisfies ReviewLine;
    }),
  );
  const c = x.customer;
  return {
    source_text: text,
    location: x.location ?? "",
    customer_kind: c.customer_type ?? "",
    company_name: c.company ?? "",
    customer_name: [c.first_name, c.last_name].filter(Boolean).join(" "),
    customer_email: c.email ?? "",
    customer_phone: c.phone ?? "",
    customer_street: c.street ?? "",
    customer_postal_code: c.postal_code ?? "",
    customer_city: c.city ?? "",
    start_date: x.rental.start_date ?? "",
    end_date: x.rental.end_date ?? "",
    date_text: x.rental.date_text,
    delivery: x.delivery.requested,
    delivery_street: x.delivery.street ?? "",
    delivery_postal_code: x.delivery.postal_code ?? "",
    delivery_city: x.delivery.city ?? "",
    notes: x.notes ?? "",
    open_questions: x.open_questions ?? [],
    lines,
    crm_customer_id: null,
  };
}

/** Welche Pflichtangaben fehlen noch für ein Angebot? */
export function reviewProblems(r: ReviewState): string[] {
  const p: string[] = [];
  if (!r.location) p.push("Standort wählen");
  if (!r.customer_name.trim() && !r.company_name.trim()) p.push("Name oder Firma");
  if (!/^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/.test(r.customer_email.trim())) p.push("gültige E-Mail");
  if (!r.start_date) p.push("Mietbeginn");
  if (r.end_date && r.start_date && r.end_date < r.start_date) p.push("Mietende liegt vor Mietbeginn");
  if (r.lines.length === 0) p.push("mindestens ein Artikel");
  // Telefon und Preise sind keine Pflicht: Preise werden im Angebot ergänzt.
  r.lines.forEach((l, i) => {
    if (!l.product_name.trim()) p.push(`Artikel in Zeile ${i + 1}`);
  });
  return p;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Schritt 4: legt Anfrage an und öffnet das vorbefüllte Angebot. */
  onConfirm?: (review: ReviewState) => Promise<void>;
}

export function AiInquiryImportDialog({ open, onOpenChange, onConfirm }: Props) {
  const { rows: customers } = useCrmCustomers();
  const [text, setText] = useState("");
  const [review, setReview] = useState<ReviewState | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Entwurf wiederherstellen / sichern (Schutz vor Reload / Tabwechsel)
  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (typeof d.text === "string") setText(d.text);
        if (d.review) setReview(d.review);
      }
    } catch { /* ignore */ }
  }, [open]);
  useEffect(() => {
    if (!open) return;
    try {
      if (!text && !review) localStorage.removeItem(DRAFT_KEY);
      else localStorage.setItem(DRAFT_KEY, JSON.stringify({ text, review }));
    } catch { /* ignore */ }
  }, [open, text, review]);

  const discard = () => {
    setText(""); setReview(null); setError(null);
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  };

  const crmHit = useMemo(
    () => (review ? findCrmMatch(customers, review.customer_email, review.customer_phone) : null),
    [customers, review?.customer_email, review?.customer_phone], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const analyze = async () => {
    if (loading) return;
    const t = text.trim();
    if (t.length < 10) { setError("Bitte die Kunden-E-Mail oder das Transkript einfügen."); return; }
    setLoading(true); setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("parse-inquiry-text", { body: { text: t } });
      if (fnErr) {
        let msg = fnErr.message;
        try { const body = await (fnErr as { context?: Response }).context?.json(); if (body?.error) msg = body.error; } catch { /* ignore */ }
        throw new Error(msg);
      }
      if (!data?.result) throw new Error("Keine Auswertung erhalten.");
      setReview(await toReview(t, data.result as Extraction, (data.matches ?? []) as ItemMatch[]));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Auswertung fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  const patch = (p: Partial<ReviewState>) => setReview((r) => (r ? { ...r, ...p } : r));
  const patchLine = (key: string, p: Partial<ReviewLine>) =>
    setReview((r) => (r ? { ...r, lines: r.lines.map((l) => (l.key === key ? { ...l, ...p } : l)) } : r));

  const chooseProduct = async (key: string, p: { slug: string; name: string; price_per_day: string | null; price_weekend?: string | null; price_per_month?: string | null } | null, freeText = "") => {
    const resolved = await priceFor(p);
    patchLine(key, {
      product_name: p ? p.name : freeText,
      product_slug: p?.slug ?? null,
      unit_price: resolved?.price ?? null,
      unit: resolved?.unit ?? "kalendertage",
      price_source: resolved ? "cms" : null,
    });
  };

  const applyCrm = (c: CrmCustomer) =>
    patch({
      crm_customer_id: c.id,
      customer_kind: c.customer_kind === "b2b" || c.customer_kind === "business" ? "business" : "private",
      company_name: review?.company_name || c.company_name || "",
      customer_name: review?.customer_name || [c.first_name, c.last_name].filter(Boolean).join(" "),
      customer_email: review?.customer_email || c.email || "",
      customer_phone: review?.customer_phone || c.phone || "",
      customer_street: review?.customer_street || c.street || "",
      customer_postal_code: review?.customer_postal_code || c.postal_code || "",
      customer_city: review?.customer_city || c.city || "",
      location: review?.location || c.location || "",
    });

  const problems = review ? reviewProblems(review) : [];
  const duration = review?.start_date && review?.end_date && review.end_date >= review.start_date
    ? Math.round((Date.parse(review.end_date) - Date.parse(review.start_date)) / 86400000) + 1 : null;

  const confirm = async () => {
    if (!review || !onConfirm || problems.length || busy) return;
    setBusy(true);
    try {
      await onConfirm(review);
      discard();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Anlegen fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  const miss = (v: string) => (!v.trim() ? "border-warning bg-warning/10" : "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-full max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-auto sm:max-h-[92vh] sm:w-[calc(100%-2rem)] sm:max-w-3xl sm:rounded-lg">
        <DialogHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
          <DialogTitle>Anfrage aus Text erstellen (KI)</DialogTitle>
          <DialogDescription>
            E-Mail oder Telefon-Transkript einfügen. Die KI füllt aus, du prüfst. Es wird nichts automatisch versendet.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          {!review ? (
            <>
              <Label htmlFor="ai-text">Anfragetext</Label>
              <Textarea
                id="ai-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={14}
                maxLength={20000}
                placeholder="Kunden-E-Mail oder Transkript hier einfügen …"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">{text.length.toLocaleString("de-DE")} / 20.000 Zeichen</p>
              {error && (
                <p className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                </p>
              )}
              {loading && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Text wird ausgewertet und Artikel werden zugeordnet (ca. 10–20 Sekunden) …
                </p>
              )}
            </>
          ) : (
            <>
              {review.open_questions.length > 0 && (
                <div className="rounded-md border border-warning/50 bg-warning/10 p-3 text-sm">
                  <p className="mb-1 font-medium">Offene Fragen an den Kunden</p>
                  <ul className="list-disc space-y-0.5 pl-5">
                    {review.open_questions.map((q, i) => <li key={i}>{q}</li>)}
                  </ul>
                </div>
              )}

              {crmHit && review.crm_customer_id !== crmHit.id && (
                <div className="flex flex-col gap-2 rounded-md border border-primary/40 bg-primary/5 p-3 text-sm sm:flex-row sm:items-center">
                  <UserCheck className="h-4 w-4 shrink-0 text-primary" />
                  <span className="flex-1">Bestandskunde gefunden: <strong>{crmCustomerLabel(crmHit)}</strong>{crmHit.email ? ` · ${crmHit.email}` : ""}</span>
                  <Button size="sm" variant="outline" onClick={() => applyCrm(crmHit)}>Übernehmen</Button>
                </div>
              )}
              {review.crm_customer_id && (
                <p className="text-sm text-primary">Mit Bestandskunde verknüpft – keine Dublette.</p>
              )}

              <section className="space-y-3">
                <h3 className="font-semibold">Kunde &amp; Standort</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Standort</Label>
                    <Select value={review.location || undefined} onValueChange={(v) => patch({ location: v })}>
                      <SelectTrigger className={miss(review.location)}><SelectValue placeholder="Bitte wählen" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(LOC_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Kundentyp</Label>
                    <Select value={review.customer_kind || undefined} onValueChange={(v) => patch({ customer_kind: v as "private" | "business" })}>
                      <SelectTrigger className={miss(review.customer_kind)}><SelectValue placeholder="Bitte wählen" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Privatkunde</SelectItem>
                        <SelectItem value="business">Firmenkunde</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Field label="Name" value={review.customer_name} onChange={(v) => patch({ customer_name: v })} warn />
                  <Field label="Firma" value={review.company_name} onChange={(v) => patch({ company_name: v })} />
                  <Field label="E-Mail (für Angebot)" value={review.customer_email} onChange={(v) => patch({ customer_email: v })} warn type="email" />
                  <Field label="Telefon" value={review.customer_phone} onChange={(v) => patch({ customer_phone: v })} warn />
                  <div className="sm:col-span-2"><Field label="Straße & Hausnummer" value={review.customer_street} onChange={(v) => patch({ customer_street: v })} /></div>
                  <Field label="PLZ" value={review.customer_postal_code} onChange={(v) => patch({ customer_postal_code: v })} />
                  <Field label="Ort" value={review.customer_city} onChange={(v) => patch({ customer_city: v })} />
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="font-semibold">Zeitraum &amp; Lieferung</h3>
                {review.date_text && <p className="text-xs text-muted-foreground">Im Text: „{review.date_text}“</p>}
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Mietbeginn" value={review.start_date} onChange={(v) => patch({ start_date: v })} warn type="date" />
                  <Field label="Mietende" value={review.end_date} onChange={(v) => patch({ end_date: v })} warn type="date" />
                  <div>
                    <Label>Übergabe</Label>
                    <Select
                      value={review.delivery === null ? undefined : review.delivery ? "delivery" : "pickup"}
                      onValueChange={(v) => patch({ delivery: v === "delivery" })}
                    >
                      <SelectTrigger className={review.delivery === null ? "border-warning bg-warning/10" : ""}><SelectValue placeholder="Unklar" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pickup">Selbstabholung</SelectItem>
                        <SelectItem value="delivery">Lieferung</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {duration && <p className="text-sm text-muted-foreground">{duration} Kalendertag{duration === 1 ? "" : "e"}</p>}
                {review.delivery && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-3"><Field label="Lieferadresse Straße" value={review.delivery_street} onChange={(v) => patch({ delivery_street: v })} warn /></div>
                    <Field label="PLZ" value={review.delivery_postal_code} onChange={(v) => patch({ delivery_postal_code: v })} warn />
                    <div className="sm:col-span-2"><Field label="Ort" value={review.delivery_city} onChange={(v) => patch({ delivery_city: v })} warn /></div>
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <h3 className="font-semibold">Artikel</h3>
                {review.lines.length === 0 && <p className="text-sm text-muted-foreground">Keine Artikel im Text erkannt – bitte hinzufügen.</p>}
                {review.lines.map((l, i) => {
                  const selected = l.options.find((o) => o.slug === l.product_slug) ?? null;
                  const notHere = selected && review.location && !selected.bookable_locations.includes(review.location);
                  return (
                    <div key={l.key} className="space-y-2 rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-muted-foreground">Zeile {i + 1} · Im Text: „{l.original_text}“</p>
                        <div className="flex shrink-0 items-center gap-1">
                          <Badge variant={l.confidence === "high" ? "default" : l.confidence === "none" ? "destructive" : "secondary"}>
                            {CONF_LABEL[l.confidence]}
                          </Badge>
                          <Button size="icon" variant="ghost" aria-label="Zeile entfernen"
                            onClick={() => patch({ lines: review.lines.filter((x) => x.key !== l.key) })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {l.reason && <p className="text-xs text-muted-foreground">{l.reason}</p>}
                      {l.options.length > 1 && (
                        <div className="flex flex-wrap gap-1.5">
                          {l.options.map((o) => (
                            <button key={o.slug} type="button" onClick={() => chooseProduct(l.key, o)}
                              className={cn("rounded-full border px-2.5 py-1 text-xs transition-colors",
                                o.slug === l.product_slug ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted")}>
                              {productLabel(o)}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="grid gap-2 sm:grid-cols-[1fr_90px_130px]">
                        <div>
                          <Label className="text-xs">Artikel aus dem CMS</Label>
                          <div className={cn(!l.product_name && "rounded-md ring-1 ring-destructive")}>
                            <InquiryProductCombobox
                              value={l.product_name}
                              location={review.location || null}
                              onSelect={(p: CatalogProduct | null, free: string) => chooseProduct(l.key, p, free)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Menge</Label>
                          <NumberInput value={l.quantity} onChange={(e) => patchLine(l.key, { quantity: Math.max(1, Math.round(Number(e.target.value) || 1)) })} />
                        </div>
                        <div>
                          <Label className="text-xs">Preis netto / {l.unit === "kalendertage" ? "Tag" : l.unit === "wochen" ? "Woche/WE" : l.unit === "monate" ? "Monat" : "Stück"}</Label>
                          <NumberInput
                            value={l.unit_price ?? ""}
                            className={cn((l.unit_price === null || l.unit_price <= 0) && "border-destructive bg-destructive/10")}
                            onChange={(e) => {
                              const v = e.target.value.replace(",", ".");
                              patchLine(l.key, { unit_price: v.trim() === "" ? null : Number(v) || 0, price_source: "manual" });
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                        {l.price_source === "cms" && <span className="text-muted-foreground">Preis aus dem CMS</span>}
                        {l.unit_price === null && <span className="text-destructive">Kein Preis im CMS – bitte eintragen</span>}
                        {notHere && <span className="text-warning-foreground">Am Standort {LOC_LABEL[review.location]} nicht online buchbar</span>}
                        {l.unit_price !== null && l.unit_price > 0 && (
                          <span className="text-muted-foreground">
                            {l.quantity} × {money(l.unit_price)}{duration && l.unit === "kalendertage" ? ` × ${duration} Tage` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <Button variant="outline" size="sm" onClick={() => patch({
                  lines: [...review.lines, { key: `n${Date.now()}`, original_text: "manuell ergänzt", confidence: "high", reason: null, options: [], product_name: "", product_slug: null, quantity: 1, unit_price: null, unit: "kalendertage", price_source: null }],
                })}>
                  Artikel hinzufügen
                </Button>
              </section>

              <section className="space-y-2">
                <Label htmlFor="ai-notes">Notiz zur Anfrage</Label>
                <Textarea id="ai-notes" value={review.notes} onChange={(e) => patch({ notes: e.target.value })} rows={3} maxLength={2000} />
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground">Originaltext anzeigen</summary>
                  <pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">{review.source_text}</pre>
                </details>
              </section>
            </>
          )}
        </div>

        <DialogFooter className="shrink-0 flex-col gap-2 border-t bg-background px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:px-6">
          {review ? (
            <>
              {problems.length > 0 && (
                <p className="text-xs text-destructive sm:mr-auto sm:max-w-[55%]">Noch offen: {problems.join(", ")}</p>
              )}
              <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setReview(null)} disabled={busy}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Text bearbeiten
              </Button>
              <Button variant="outline" className="w-full sm:w-auto" onClick={discard} disabled={busy}>Verwerfen</Button>
              <Button className="w-full sm:w-auto" onClick={confirm} disabled={!onConfirm || problems.length > 0 || busy}>
                {busy ? "Wird angelegt …" : "Anfrage anlegen & Angebot öffnen"}
              </Button>
            </>
          ) : (
            <>
              {text && <Button variant="outline" className="w-full sm:w-auto" onClick={discard} disabled={loading}>Leeren</Button>}
              <Button className="w-full sm:w-auto" onClick={analyze} disabled={loading || text.trim().length < 10}>
                {loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Wand2 className="mr-1 h-4 w-4" />}
                {loading ? "Wird ausgewertet …" : "Auswerten"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange, warn, type = "text" }: { label: string; value: string; onChange: (v: string) => void; warn?: boolean; type?: string }) {
  return (
    <div>
      <Label className="flex items-center gap-1">
        {label}
        {warn && !value.trim() && <span className="text-xs font-normal text-warning-foreground">· bitte ergänzen</span>}
      </Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className={cn(warn && !value.trim() && "border-warning bg-warning/10")} />
    </div>
  );
}
