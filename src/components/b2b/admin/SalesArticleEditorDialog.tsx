/**
 * Editor für Verkaufsartikel (Neu- und Gebrauchtartikel) im Verkaufs-CMS.
 * Pflegt Stammdaten, Preise, Bilder, technische Daten sowie SEO-Inhalte
 * (mit optionaler KI-Unterstützung über das Lovable AI Gateway).
 */
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2, Trash2, Plus, Upload, ImageOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { NewMachineRow, SalesArticleKind, UsedMachineRow } from "@/hooks/useSalesCatalog";
import { invalidateSalesCatalog } from "@/hooks/useSalesCatalog";

interface Props {
  open: boolean;
  kind: SalesArticleKind;
  row: NewMachineRow | UsedMachineRow | null;
  readOnly?: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const USED_STATUS = [
  { value: "available", label: "Verfügbar" },
  { value: "reserved", label: "Reserviert" },
  { value: "sold", label: "Verkauft" },
  { value: "hidden", label: "Ausgeblendet" },
];

const LOCATIONS = [
  { id: "krefeld", label: "Krefeld" },
  { id: "bonn", label: "Bonn" },
  { id: "muelheim", label: "Mülheim an der Ruhr" },
];

const slugify = (v: string) =>
  v
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

type Faq = { q: string; a: string };

interface FormState {
  slug: string;
  brand: string;
  model: string;
  name: string;
  category: string;
  article_number: string;
  short_description: string;
  description: string;
  price: string;
  compare_at_price: string;
  price_on_request: boolean;
  vat_rate: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: string;
  status: string;
  year: string;
  hours: string;
  location: string;
  showroom_locations: string[];
  images: string;
  specifications: { key: string; value: string }[];
  highlights: string[];
  faqs: Faq[];
  seo_title: string;
  seo_description: string;
}

const emptyForm: FormState = {
  slug: "", brand: "", model: "", name: "", category: "", article_number: "",
  short_description: "", description: "", price: "", compare_at_price: "",
  price_on_request: false, vat_rate: "19", is_active: true, is_featured: false,
  sort_order: "0", status: "available", year: "", hours: "", location: "krefeld",
  showroom_locations: [], images: "", specifications: [], highlights: [], faqs: [],
  seo_title: "", seo_description: "",
};

function toSpecList(raw: unknown): { key: string; value: string }[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  return Object.entries(raw as Record<string, unknown>).map(([key, value]) => ({ key, value: String(value ?? "") }));
}

function fromSpecList(list: { key: string; value: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const { key, value } of list) if (key.trim()) out[key.trim()] = value;
  return out;
}

function toFaqList(raw: unknown): Faq[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((f) => {
      const o = (f ?? {}) as Record<string, unknown>;
      const q = String(o.q ?? o.question ?? "").trim();
      const a = String(o.a ?? o.answer ?? "").trim();
      return q && a ? { q, a } : null;
    })
    .filter((f): f is Faq => f !== null);
}

export function SalesArticleEditorDialog({ open, kind, row, readOnly, onOpenChange, onSaved }: Props) {
  const [form, setForm] = useState<FormState>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [aiField, setAiField] = useState<string | null>(null);

  const isNew = kind === "new";

  useEffect(() => {
    if (!open) return;
    if (!row) {
      setForm({ ...emptyForm });
      return;
    }
    if (isNew) {
      const r = row as NewMachineRow;
      const content = (r.content ?? {}) as Record<string, unknown>;
      setForm({
        ...emptyForm,
        slug: r.slug ?? "",
        brand: r.brand ?? "",
        model: r.model ?? "",
        name: r.name ?? "",
        category: r.category ?? "",
        article_number: r.article_number ?? "",
        short_description: r.short_description ?? "",
        description: r.description ?? "",
        price: r.price_gross != null ? String(r.price_gross) : "",
        compare_at_price: r.compare_at_price != null ? String(r.compare_at_price) : "",
        price_on_request: Boolean(r.price_on_request),
        vat_rate: String(r.vat_rate ?? 19),
        is_active: Boolean(r.is_active),
        is_featured: Boolean(r.is_featured),
        sort_order: String(r.sort_order ?? 0),
        showroom_locations: r.showroom_locations ?? [],
        images: (r.images ?? []).join("\n"),
        specifications: toSpecList(r.specifications),
        highlights: Array.isArray(content.highlights) ? (content.highlights as string[]) : [],
        faqs: toFaqList(content.faq),
        seo_title: String(content.seoTitle ?? ""),
        seo_description: String(content.seoDescription ?? ""),
      });
    } else {
      const r = row as UsedMachineRow;
      const content = (r.content ?? {}) as Record<string, unknown>;
      setForm({
        ...emptyForm,
        slug: r.slug ?? "",
        brand: r.manufacturer ?? "",
        model: r.model ?? "",
        category: r.category ?? "",
        article_number: r.reference_number ?? "",
        description: r.description ?? "",
        price: r.price_net != null ? String(r.price_net) : "",
        price_on_request: Boolean(r.price_on_request),
        is_featured: Boolean(r.is_featured),
        status: r.status ?? "available",
        year: r.year != null ? String(r.year) : "",
        hours: r.hours != null ? String(r.hours) : "",
        location: r.location ?? "krefeld",
        images: (r.images ?? []).join("\n"),
        specifications: toSpecList(r.specifications),
        highlights: Array.isArray(content.highlights) ? (content.highlights as string[]) : [],
        faqs: toFaqList(content.faq),
        seo_title: String(content.seoTitle ?? ""),
        seo_description: String(content.seoDescription ?? ""),
      });
    }
  }, [open, row, isNew]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const displayName = useMemo(
    () => [form.brand, form.model].filter(Boolean).join(" ").trim(),
    [form.brand, form.model],
  );

  const generate = async (field: "short_description" | "description" | "seo_title" | "seo_description" | "faqs" | "highlights") => {
    if (!displayName) {
      toast.error("Bitte zuerst Hersteller und Modell eintragen.");
      return;
    }
    setAiField(field);
    try {
      const { data, error } = await supabase.functions.invoke("admin-generate-sales-content", {
        body: {
          field,
          kind,
          product: {
            name: displayName,
            brand: form.brand,
            model: form.model,
            category: form.category,
            description: form.description || form.short_description,
            specifications: fromSpecList(form.specifications),
            price: form.price_on_request ? "auf Anfrage" : form.price,
            year: form.year ? Number(form.year) : undefined,
            hours: form.hours ? Number(form.hours) : undefined,
            locations: isNew ? form.showroom_locations : [form.location],
          },
        },
      });
      if (error || (data as { error?: string })?.error) {
        throw new Error((data as { error?: string })?.error ?? error?.message ?? "KI-Aufruf fehlgeschlagen");
      }
      const value = (data as { value: unknown }).value;
      if (field === "faqs") set("faqs", toFaqList(value));
      else if (field === "highlights") set("highlights", Array.isArray(value) ? value.map(String) : []);
      else set(field, String(value ?? ""));
      toast.success("KI-Vorschlag übernommen – bitte prüfen.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "KI-Generierung fehlgeschlagen.");
    } finally {
      setAiField(null);
    }
  };

  const save = async () => {
    if (!form.brand.trim() || !form.model.trim()) {
      toast.error("Hersteller und Modell sind Pflichtfelder.");
      return;
    }
    if (!form.category.trim()) {
      toast.error("Bitte eine Kategorie angeben.");
      return;
    }
    const slug = form.slug.trim() || slugify(displayName);
    const images = form.images.split("\n").map((i) => i.trim()).filter(Boolean);
    const content = {
      ...((row?.content as Record<string, unknown>) ?? {}),
      highlights: form.highlights.filter(Boolean),
      faq: form.faqs.filter((f) => f.q && f.a),
      seoTitle: form.seo_title.trim() || undefined,
      seoDescription: form.seo_description.trim() || undefined,
    };

    setSaving(true);
    try {
      if (isNew) {
        const payload = {
          slug,
          brand: form.brand.trim(),
          model: form.model.trim(),
          name: form.name.trim() || displayName,
          category: form.category.trim(),
          article_number: form.article_number.trim() || null,
          short_description: form.short_description.trim() || null,
          description: form.description.trim() || null,
          price_gross: form.price_on_request || !form.price ? null : Number(form.price),
          compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
          price_on_request: form.price_on_request,
          vat_rate: Number(form.vat_rate) || 19,
          is_active: form.is_active,
          is_featured: form.is_featured,
          sort_order: Number(form.sort_order) || 0,
          showroom_locations: form.showroom_locations,
          images,
          specifications: fromSpecList(form.specifications),
          content,
        };
        const q = supabase.from("new_machines");
        const { error } = row
          ? await (q.update(payload as never).eq("id", row.id))
          : await (q.insert(payload as never));
        if (error) throw error;
      } else {
        const payload = {
          slug,
          manufacturer: form.brand.trim(),
          model: form.model.trim(),
          category: form.category.trim(),
          reference_number: form.article_number.trim() || null,
          description: form.description.trim() || null,
          price_net: form.price_on_request || !form.price ? null : Number(form.price),
          price_on_request: form.price_on_request,
          is_featured: form.is_featured,
          status: form.status,
          year: form.year ? Number(form.year) : null,
          hours: form.hours ? Number(form.hours) : null,
          location: form.location,
          images,
          specifications: fromSpecList(form.specifications),
          content,
        };
        const q = supabase.from("used_machines");
        const { error } = row
          ? await (q.update(payload as never).eq("id", row.id))
          : await (q.insert(payload as never));
        if (error) throw error;
      }
      invalidateSalesCatalog();
      toast.success(row ? "Artikel gespeichert" : "Artikel angelegt");
      onOpenChange(false);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  };

  const AiButton = ({ field }: { field: Parameters<typeof generate>[0] }) => (
    <Button type="button" variant="outline" size="sm" disabled={readOnly || aiField !== null} onClick={() => generate(field)}>
      {aiField === field ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
      <span className="ml-1">KI</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-full max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-auto sm:max-h-[90vh] sm:w-[calc(100%-2rem)] sm:max-w-3xl sm:rounded-lg">
        <DialogHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
          <DialogTitle>
            {row ? "Verkaufsartikel bearbeiten" : "Verkaufsartikel anlegen"} ·{" "}
            {isNew ? "Neuartikel" : "Gebrauchtartikel"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          <Tabs defaultValue="basis">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basis">Basis</TabsTrigger>
              <TabsTrigger value="technik">Technik &amp; Bilder</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="basis" className="space-y-3 pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="sa-brand">Hersteller / Marke</Label>
                  <Input id="sa-brand" value={form.brand} disabled={readOnly} onChange={(e) => set("brand", e.target.value)} maxLength={120} />
                </div>
                <div>
                  <Label htmlFor="sa-model">Modell</Label>
                  <Input id="sa-model" value={form.model} disabled={readOnly} onChange={(e) => set("model", e.target.value)} maxLength={160} />
                </div>
                <div>
                  <Label htmlFor="sa-category">Kategorie</Label>
                  <Input id="sa-category" value={form.category} disabled={readOnly} onChange={(e) => set("category", e.target.value)} maxLength={80} />
                </div>
                <div>
                  <Label htmlFor="sa-article">Artikel-/Referenznummer</Label>
                  <Input id="sa-article" value={form.article_number} disabled={readOnly} onChange={(e) => set("article_number", e.target.value)} maxLength={80} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="sa-slug">Slug (URL)</Label>
                  <Input
                    id="sa-slug"
                    value={form.slug}
                    disabled={readOnly}
                    placeholder={slugify(displayName)}
                    onChange={(e) => set("slug", e.target.value)}
                    maxLength={90}
                  />
                </div>
                {isNew && (
                  <div className="sm:col-span-2">
                    <Label htmlFor="sa-name">Anzeigename (optional)</Label>
                    <Input id="sa-name" value={form.name} disabled={readOnly} onChange={(e) => set("name", e.target.value)} maxLength={200} />
                  </div>
                )}
                <div>
                  <Label htmlFor="sa-price">
                    {isNew ? "Preis brutto (€)" : "Preis netto (€)"}
                  </Label>
                  <Input
                    id="sa-price"
                    type="number"
                    step="0.01"
                    min={0}
                    value={form.price}
                    disabled={readOnly || form.price_on_request}
                    onChange={(e) => set("price", e.target.value)}
                  />
                </div>
                {isNew ? (
                  <div>
                    <Label htmlFor="sa-compare">Streichpreis brutto (€)</Label>
                    <Input id="sa-compare" type="number" step="0.01" min={0} value={form.compare_at_price} disabled={readOnly} onChange={(e) => set("compare_at_price", e.target.value)} />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="sa-status">Status</Label>
                    <Select value={form.status} onValueChange={(v) => set("status", v)} disabled={readOnly}>
                      <SelectTrigger id="sa-status"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {USED_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {!isNew && (
                  <>
                    <div>
                      <Label htmlFor="sa-year">Baujahr</Label>
                      <Input id="sa-year" type="number" value={form.year} disabled={readOnly} onChange={(e) => set("year", e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="sa-hours">Betriebsstunden</Label>
                      <Input id="sa-hours" type="number" value={form.hours} disabled={readOnly} onChange={(e) => set("hours", e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="sa-location">Standort</Label>
                      <Select value={form.location} onValueChange={(v) => set("location", v)} disabled={readOnly}>
                        <SelectTrigger id="sa-location"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {LOCATIONS.map((l) => <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={form.price_on_request} disabled={readOnly} onCheckedChange={(v) => set("price_on_request", Boolean(v))} />
                Preis auf Anfrage
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={form.is_featured} disabled={readOnly} onCheckedChange={(v) => set("is_featured", Boolean(v))} />
                Als Top-Angebot hervorheben
              </label>
              {isNew && (
                <>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={form.is_active} disabled={readOnly} onCheckedChange={(v) => set("is_active", Boolean(v))} />
                    Auf der Website veröffentlicht
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="sa-sort">Sortierung</Label>
                      <Input id="sa-sort" type="number" value={form.sort_order} disabled={readOnly} onChange={(e) => set("sort_order", e.target.value)} />
                    </div>
                    <div>
                      <Label>Ausstellungsstandorte</Label>
                      <div className="flex flex-wrap gap-3 pt-2">
                        {LOCATIONS.map((l) => (
                          <label key={l.id} className="flex items-center gap-1.5 text-sm">
                            <Checkbox
                              checked={form.showroom_locations.includes(l.id)}
                              disabled={readOnly}
                              onCheckedChange={(v) =>
                                set(
                                  "showroom_locations",
                                  v
                                    ? [...form.showroom_locations, l.id]
                                    : form.showroom_locations.filter((x) => x !== l.id),
                                )
                              }
                            />
                            {l.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sa-short">Kurzbeschreibung</Label>
                      <AiButton field="short_description" />
                    </div>
                    <Textarea id="sa-short" rows={2} value={form.short_description} disabled={readOnly} onChange={(e) => set("short_description", e.target.value)} maxLength={400} />
                  </div>
                </>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sa-desc">Beschreibung</Label>
                  <AiButton field="description" />
                </div>
                <Textarea id="sa-desc" rows={7} value={form.description} disabled={readOnly} onChange={(e) => set("description", e.target.value)} maxLength={6000} />
              </div>
            </TabsContent>

            <TabsContent value="technik" className="space-y-4 pt-4">
              <div>
                <Label htmlFor="sa-images">Bild-URLs (eine pro Zeile)</Label>
                <Textarea id="sa-images" rows={4} value={form.images} disabled={readOnly} onChange={(e) => set("images", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Technische Daten</Label>
                {form.specifications.map((spec, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={spec.key}
                      placeholder="Bezeichnung"
                      disabled={readOnly}
                      onChange={(e) =>
                        set("specifications", form.specifications.map((s, j) => (j === i ? { ...s, key: e.target.value } : s)))
                      }
                    />
                    <Input
                      value={spec.value}
                      placeholder="Wert"
                      disabled={readOnly}
                      onChange={(e) =>
                        set("specifications", form.specifications.map((s, j) => (j === i ? { ...s, value: e.target.value } : s)))
                      }
                    />
                    <Button type="button" variant="ghost" size="icon" aria-label="Zeile entfernen" disabled={readOnly}
                      onClick={() => set("specifications", form.specifications.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" disabled={readOnly}
                  onClick={() => set("specifications", [...form.specifications, { key: "", value: "" }])}>
                  <Plus className="h-4 w-4 mr-1" /> Zeile hinzufügen
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Highlights</Label>
                  <AiButton field="highlights" />
                </div>
                {form.highlights.map((h, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={h} disabled={readOnly}
                      onChange={(e) => set("highlights", form.highlights.map((x, j) => (j === i ? e.target.value : x)))} />
                    <Button type="button" variant="ghost" size="icon" aria-label="Highlight entfernen" disabled={readOnly}
                      onClick={() => set("highlights", form.highlights.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" disabled={readOnly}
                  onClick={() => set("highlights", [...form.highlights, ""])}>
                  <Plus className="h-4 w-4 mr-1" /> Highlight hinzufügen
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4 pt-4">
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sa-seotitle">SEO-Title</Label>
                  <AiButton field="seo_title" />
                </div>
                <Input id="sa-seotitle" value={form.seo_title} disabled={readOnly} onChange={(e) => set("seo_title", e.target.value)} maxLength={120} />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sa-seodesc">Meta-Description</Label>
                  <AiButton field="seo_description" />
                </div>
                <Textarea id="sa-seodesc" rows={3} value={form.seo_description} disabled={readOnly} onChange={(e) => set("seo_description", e.target.value)} maxLength={300} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>FAQ</Label>
                  <AiButton field="faqs" />
                </div>
                {form.faqs.map((faq, i) => (
                  <div key={i} className="space-y-2 rounded-md border border-border p-2">
                    <div className="flex gap-2">
                      <Input value={faq.q} placeholder="Frage" disabled={readOnly}
                        onChange={(e) => set("faqs", form.faqs.map((f, j) => (j === i ? { ...f, q: e.target.value } : f)))} />
                      <Button type="button" variant="ghost" size="icon" aria-label="FAQ entfernen" disabled={readOnly}
                        onClick={() => set("faqs", form.faqs.filter((_, j) => j !== i))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea value={faq.a} rows={3} placeholder="Antwort" disabled={readOnly}
                      onChange={(e) => set("faqs", form.faqs.map((f, j) => (j === i ? { ...f, a: e.target.value } : f)))} />
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" disabled={readOnly}
                  onClick={() => set("faqs", [...form.faqs, { q: "", a: "" }])}>
                  <Plus className="h-4 w-4 mr-1" /> FAQ hinzufügen
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="shrink-0 gap-3 border-t bg-background px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:gap-2 sm:px-6">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)} disabled={saving}>
            {readOnly ? "Schließen" : "Abbrechen"}
          </Button>
          {!readOnly && (
            <Button className="w-full sm:w-auto" onClick={save} disabled={saving}>
              {saving ? "Wird gespeichert …" : "Speichern"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
