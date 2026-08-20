/**
 * Editor-Dialog für CMS-Mietartikel. 6 Tabs: Basis, Bilder, Technik, Preise & Buchung,
 * SEO & Content, Intern (Bestand). KI-Buttons rufen `admin-generate-product-content`.
 */
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Sparkles, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { productCategories } from "@/data/rentalData";
import { resolveSubcategory, useAdminManagedProducts, type AdminManagedProductRow } from "@/hooks/useManagedProducts";

const LOCATIONS = [
  { id: "krefeld", label: "Krefeld" },
  { id: "bonn", label: "Bonn" },
  { id: "muelheim", label: "Mülheim an der Ruhr" },
] as const;

type LocId = typeof LOCATIONS[number]["id"];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: AdminManagedProductRow | null;
  onSaved: () => void;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Faq { question: string; answer: string }

interface FormState {
  slug: string;
  name: string;
  model_name: string;
  description: string;
  detailed_description: string;
  category: string;
  subcategory: string;
  available_locations: LocId[];
  images: string[];
  specifications: Array<{ key: string; value: string }>;
  features: string[];
  price_per_day: string;
  price_weekend: string;
  price_per_month: string;
  min_rental_months: string;
  weight_kg: string;
  drive_type: string;
  rentware_code: Record<LocId, string>;
  on_request: boolean;
  pdf_url: string;
  external_manual_url: string;
  video_url: string;
  sort_order: string;
  seo_meta_description: string;
  seo_faqs: Faq[];
  seo_local_content: Record<LocId, string>;
  seo_draft_meta_description: string;
  seo_draft_faqs: Faq[];
  seo_draft_generated_at: string | null;
  quantities: Record<LocId, string>;
  quantity_notes: Record<LocId, string>;
  is_published: boolean;
}

const emptyForm = (): FormState => ({
  slug: "",
  name: "",
  model_name: "",
  description: "",
  detailed_description: "",
  category: "",
  subcategory: "",
  available_locations: [],
  images: [],
  specifications: [],
  features: [],
  price_per_day: "",
  price_weekend: "",
  price_per_month: "",
  min_rental_months: "",
  weight_kg: "",
  drive_type: "",
  rentware_code: { krefeld: "", bonn: "", muelheim: "" },
  on_request: false,
  pdf_url: "",
  external_manual_url: "",
  video_url: "",
  sort_order: "",
  seo_meta_description: "",
  seo_faqs: [],
  seo_local_content: { krefeld: "", bonn: "", muelheim: "" },
  seo_draft_meta_description: "",
  seo_draft_faqs: [],
  seo_draft_generated_at: null,
  quantities: { krefeld: "", bonn: "", muelheim: "" },
  quantity_notes: { krefeld: "", bonn: "", muelheim: "" },
  is_published: false,
});

function fromRow(row: AdminManagedProductRow): FormState {
  const specs = row.specifications ?? {};
  return {
    slug: row.slug,
    name: row.name,
    model_name: row.model_name ?? "",
    description: row.description ?? "",
    detailed_description: row.detailed_description ?? "",
    category: row.category,
    subcategory: resolveSubcategory(row),
    available_locations: (row.available_locations ?? []) as LocId[],
    images: row.images ?? [],
    specifications: Object.entries(specs).map(([key, value]) => ({ key, value: String(value) })),
    features: row.features ?? [],
    price_per_day: row.price_per_day ?? "",
    price_weekend: row.price_weekend ?? "",
    price_per_month: row.price_per_month ?? "",
    min_rental_months: row.min_rental_months ? String(row.min_rental_months) : "",
    weight_kg: row.weight_kg ? String(row.weight_kg) : "",
    drive_type: row.drive_type ?? "",
    rentware_code: {
      krefeld: row.rentware_code?.krefeld ?? "",
      bonn: row.rentware_code?.bonn ?? "",
      muelheim: row.rentware_code?.muelheim ?? "",
    },
    on_request: row.on_request ?? false,
    pdf_url: row.pdf_url ?? "",
    external_manual_url: row.external_manual_url ?? "",
    video_url: row.video_url ?? "",
    sort_order: row.sort_order != null ? String(row.sort_order) : "",
    seo_meta_description: row.seo_meta_description ?? "",
    seo_faqs: row.seo_faqs ?? [],
    seo_local_content: {
      krefeld: row.seo_local_content?.krefeld ?? "",
      bonn: row.seo_local_content?.bonn ?? "",
      muelheim: row.seo_local_content?.muelheim ?? "",
    },
    seo_draft_meta_description: row.seo_draft_meta_description ?? "",
    seo_draft_faqs: row.seo_draft_faqs ?? [],
    seo_draft_generated_at: row.seo_draft_generated_at ?? null,
    quantities: {
      krefeld: row.quantities?.krefeld != null ? String(row.quantities.krefeld) : "",
      bonn: row.quantities?.bonn != null ? String(row.quantities.bonn) : "",
      muelheim: row.quantities?.muelheim != null ? String(row.quantities.muelheim) : "",
    },
    quantity_notes: {
      krefeld: row.quantity_notes?.krefeld ?? "",
      bonn: row.quantity_notes?.bonn ?? "",
      muelheim: row.quantity_notes?.muelheim ?? "",
    },
    is_published: row.is_published,
  };
}

export function InventoryEditorDialog({ open, onOpenChange, initial, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [tab, setTab] = useState("basis");
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const loadedIdRef = useRef<string | null>(null);

  // Nur beim Öffnen oder beim Wechsel auf einen ANDEREN Artikel neu befüllen.
  // Kein Reset bei Realtime-Refetch (identity-change von `initial`), sonst
  // gehen ungespeicherte Eingaben verloren, wenn der Tab kurz den Fokus verliert.
  useEffect(() => {
    if (!open) {
      loadedIdRef.current = null;
      dirtyBaselineRef.current = "";
      setDirty(false);
      return;
    }
    const nextId = initial?.id ?? "__new__";
    if (loadedIdRef.current !== nextId) {
      const nextForm = initial ? fromRow(initial) : emptyForm();
      setForm(nextForm);
      setTab("basis");
      setDirty(false);
      loadedIdRef.current = nextId;
      dirtyBaselineRef.current = JSON.stringify(nextForm);
    }
  }, [open, initial]);

  // Dirty-Tracking: vergleicht laufend gegen die beim Laden gesetzte Baseline
  const dirtyBaselineRef = useRef<string>("");
  useEffect(() => {
    if (!open || !dirtyBaselineRef.current) return;
    const snap = JSON.stringify(form);
    setDirty(snap !== dirtyBaselineRef.current);
  }, [form, open]);

  const requestClose = () => {
    if (dirty) {
      const ok = window.confirm(
        "Es gibt ungespeicherte Änderungen. Wirklich schließen und Änderungen verwerfen?",
      );
      if (!ok) return;
    }
    setDirty(false);
    onOpenChange(false);
  };



  // Auto-slug: solange nicht manuell überschrieben und noch keine ID existiert
  useEffect(() => {
    if (!initial && form.name && !form.slug) {
      setForm((f) => ({ ...f, slug: slugify(f.name) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name]);

  const hasAnyRentware = Object.values(form.rentware_code).some((c) => c.trim());

  // Konsistenz-Check: wenn Rentware-Code irgendwo gesetzt, onRequest zwingend false + Text-Hinweis
  useEffect(() => {
    if (hasAnyRentware && form.on_request) {
      setForm((f) => ({ ...f, on_request: false }));
    }
  }, [hasAnyRentware, form.on_request]);

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, [Object.keys(p)[0]!]: Object.values(p)[0] as never, ...p }));

  async function runAI(field: "meta_description" | "detailed_description" | "faqs" | "local_content", location?: LocId) {
    setAiLoading(field + (location ?? ""));
    try {
      const { data, error } = await supabase.functions.invoke("admin-generate-product-content", {
        body: {
          field,
          location,
          product: {
            name: form.name,
            model_name: form.model_name || undefined,
            category: form.category,
            description: form.description || undefined,
            specifications: Object.fromEntries(form.specifications.filter((s) => s.key).map((s) => [s.key, s.value])),
            features: form.features,
            price_per_day: form.price_per_day || undefined,
            weight_kg: form.weight_kg ? Number(form.weight_kg) : undefined,
            drive_type: form.drive_type || undefined,
            rentware_code: form.rentware_code,
          },
        },
      });
      if (error) throw error;
      const val = (data as any)?.value;
      if (field === "meta_description") setForm((f) => ({ ...f, seo_meta_description: String(val) }));
      if (field === "detailed_description") setForm((f) => ({ ...f, detailed_description: String(val) }));
      if (field === "faqs" && Array.isArray(val)) setForm((f) => ({ ...f, seo_faqs: val as Faq[] }));
      if (field === "local_content" && location) {
        setForm((f) => ({ ...f, seo_local_content: { ...f.seo_local_content, [location]: String(val) } }));
      }
      toast.success("KI-Vorschlag übernommen");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Fehler bei KI-Aufruf";
      toast.error(msg);
    } finally {
      setAiLoading(null);
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const rawExt = file.name.includes(".") ? file.name.split(".").pop()! : "";
        const ext = (rawExt || (file.type.split("/")[1] ?? "bin")).toLowerCase().replace(/[^a-z0-9]/g, "");
        const folder = form.slug || slugify(form.name) || "neu";
        // Hochladen in den öffentlichen Bucket `brand-assets` unter product-images/,
        // damit die URLs ohne Signierung im Frontend geladen werden können.
        const path = `product-images/${folder}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("brand-assets").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });
        if (error) throw error;
        const { data: pub } = supabase.storage.from("brand-assets").getPublicUrl(path);
        uploaded.push(pub.publicUrl);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }));
      toast.success(`${uploaded.length} Bild(er) hochgeladen`);
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e && "message" in e
          ? String((e as { message: unknown }).message)
          : "Upload fehlgeschlagen";
      toast.error(msg);
      console.error("[InventoryEditorDialog] upload error", e);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!form.name.trim() || !form.slug.trim() || !form.category) {
      toast.error("Bitte Name, Slug und Kategorie ausfüllen");
      setTab("basis");
      return;
    }
    if (!form.available_locations.length) {
      toast.error("Bitte mindestens einen Standort auswählen");
      setTab("basis");
      return;
    }
    setSaving(true);
    try {
      // Konsistenz-Check: bei gesetztem Rentware-Code "auf Anfrage"-Sätze aus Content strippen
      let detailedDesc = form.detailed_description;
      let metaDesc = form.seo_meta_description;
      if (hasAnyRentware) {
        const stripPatterns = [
          /Dieses Gerät disponieren wir ausschließlich auf Anfrage\.?/gi,
          /auf Anfrage\.?/gi,
        ];
        for (const p of stripPatterns) {
          detailedDesc = detailedDesc.replace(p, "").replace(/\s+/g, " ").trim();
          metaDesc = metaDesc.replace(p, "").replace(/\s+/g, " ").trim();
        }
      }

      const specsObj: Record<string, string> = {};
      for (const { key, value } of form.specifications) {
        if (key.trim()) specsObj[key.trim()] = value;
      }
      if (hasAnyRentware) delete specsObj["Verfügbarkeit"];

      const rentwareCode: Record<string, string> = {};
      for (const [k, v] of Object.entries(form.rentware_code)) if (v.trim()) rentwareCode[k] = v.trim();

      const quantities: Record<string, number> = {};
      for (const [k, v] of Object.entries(form.quantities)) if (v.trim()) quantities[k] = Number(v);
      const quantityNotes: Record<string, string> = {};
      for (const [k, v] of Object.entries(form.quantity_notes)) if (v.trim()) quantityNotes[k] = v.trim();

      const localContent: Record<string, string> = {};
      for (const [k, v] of Object.entries(form.seo_local_content)) if (v.trim()) localContent[k] = v.trim();

      const { data: { user } } = await supabase.auth.getUser();

      const payload = {
        slug: form.slug.trim(),
        name: form.name.trim(),
        model_name: form.model_name.trim() || null,
        description: form.description.trim() || null,
        detailed_description: detailedDesc || null,
        category: form.category,
        subcategory: form.subcategory.trim() || null,
        available_locations: form.available_locations,
        images: form.images,
        specifications: specsObj,
        features: form.features.filter((f) => f.trim()),
        tags: [],
        rental_notes: [],
        price_per_day: form.price_per_day.trim() || null,
        price_weekend: form.price_weekend.trim() || null,
        price_per_month: form.price_per_month.trim() || null,
        min_rental_months: form.min_rental_months ? Number(form.min_rental_months) : null,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
        drive_type: form.drive_type.trim() || null,
        rentware_code: rentwareCode,
        on_request: !hasAnyRentware && form.on_request,
        pdf_url: form.pdf_url.trim() || null,
        external_manual_url: form.external_manual_url.trim() || null,
        video_url: form.video_url.trim() || null,
        video_urls: [],
        sort_order: form.sort_order ? Number(form.sort_order) : null,
        seo_meta_description: metaDesc || null,
        seo_faqs: form.seo_faqs,
        seo_local_content: localContent,
        seo_draft_meta_description: form.seo_draft_meta_description || null,
        seo_draft_faqs: form.seo_draft_faqs,
        seo_draft_generated_at: form.seo_draft_generated_at,
        quantities,
        quantity_notes: quantityNotes,
        is_published: form.is_published,
        updated_by: user?.id ?? null,
      };

      if (initial) {
        const { error } = await (supabase.from("b2b_managed_products" as never) as any)
          .update(payload)
          .eq("id", initial.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from("b2b_managed_products" as never) as any)
          .insert({ ...payload, created_by: user?.id ?? null });
        if (error) throw error;
      }

      toast.success(initial ? "Artikel aktualisiert" : "Artikel angelegt");
      setDirty(false);
      onSaved();
      onOpenChange(false);

    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) requestClose(); else onOpenChange(true); }}>
      <DialogContent
        className="max-w-4xl w-[calc(100vw-1.5rem)] sm:w-full max-h-[92vh] overflow-hidden flex flex-col p-4 sm:p-6"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => { if (dirty) e.preventDefault(); }}
      >

        <DialogHeader>
          <DialogTitle className="pr-8 text-base sm:text-lg">
            {initial ? `Artikel bearbeiten: ${initial.name}` : "Neuen Mietartikel anlegen"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 gap-1 h-auto w-full p-1">
            <TabsTrigger value="basis" className="text-xs sm:text-sm py-2">Basis</TabsTrigger>
            <TabsTrigger value="bilder" className="text-xs sm:text-sm py-2">Bilder</TabsTrigger>
            <TabsTrigger value="technik" className="text-xs sm:text-sm py-2">Technik</TabsTrigger>
            <TabsTrigger value="preise" className="text-xs sm:text-sm py-2">Preise</TabsTrigger>
            <TabsTrigger value="seo" className="text-xs sm:text-sm py-2">SEO</TabsTrigger>
            <TabsTrigger value="intern" className="text-xs sm:text-sm py-2">Intern</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto pr-2 mt-4">
            <TabsContent value="basis" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label>Modell / Hersteller</Label>
                  <Input value={form.model_name} onChange={(e) => setForm({ ...form, model_name: e.target.value })} />
                </div>
                <div>
                  <Label>Slug (URL) *</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} />
                </div>
                <div>
                  <Label>Kategorie *</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue placeholder="Kategorie wählen" /></SelectTrigger>
                    <SelectContent>
                      {productCategories.filter((c) => c.id !== "alle").map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Kurzbeschreibung</Label>
                <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <Label>Verfügbare Standorte *</Label>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                  {LOCATIONS.map((loc) => (
                    <label key={loc.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={form.available_locations.includes(loc.id)}
                        onCheckedChange={(v) => {
                          setForm((f) => ({
                            ...f,
                            available_locations: v
                              ? [...f.available_locations, loc.id]
                              : f.available_locations.filter((l) => l !== loc.id),
                          }));
                        }}
                      />
                      {loc.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Sortierung (Zahl, kleiner = früher)</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
                </div>
                <div className="flex items-end gap-2">
                  <Checkbox id="pub" checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: !!v })} />
                  <Label htmlFor="pub">Veröffentlicht (im Frontend sichtbar)</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bilder" className="space-y-4">
              <div className="flex items-center gap-3">
                <Button asChild variant="outline" disabled={uploading}>
                  <label>
                    {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    Bilder hochladen
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
                  </label>
                </Button>
                <span className="text-sm text-muted-foreground">{form.images.length} Bild(er)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {form.images.map((url, i) => (
                  <div key={url} className="relative border rounded overflow-hidden group">
                    <img src={url} className="w-full h-32 object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition">
                      <Button size="sm" variant="destructive" onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      {i > 0 && (
                        <Button size="sm" variant="secondary" onClick={() => setForm((f) => {
                          const imgs = [...f.images];
                          [imgs[i - 1], imgs[i]] = [imgs[i], imgs[i - 1]];
                          return { ...f, images: imgs };
                        })}>← vor</Button>
                      )}
                    </div>
                    {i === 0 && <Badge className="absolute top-1 left-1">Titelbild</Badge>}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="technik" className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Technische Daten</Label>
                  <Button size="sm" variant="outline" onClick={() => setForm((f) => ({ ...f, specifications: [...f.specifications, { key: "", value: "" }] }))}>
                    <Plus className="h-4 w-4 mr-1" /> Zeile
                  </Button>
                </div>
                <div className="space-y-2">
                  {form.specifications.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <Input placeholder="Bezeichnung" value={s.key} onChange={(e) => setForm((f) => {
                        const arr = [...f.specifications]; arr[i] = { ...arr[i], key: e.target.value }; return { ...f, specifications: arr };
                      })} />
                      <Input placeholder="Wert" value={s.value} onChange={(e) => setForm((f) => {
                        const arr = [...f.specifications]; arr[i] = { ...arr[i], value: e.target.value }; return { ...f, specifications: arr };
                      })} />
                      <Button size="icon" variant="ghost" onClick={() => setForm((f) => ({ ...f, specifications: f.specifications.filter((_, j) => j !== i) }))}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Features (Aufzählungspunkte)</Label>
                  <Button size="sm" variant="outline" onClick={() => setForm((f) => ({ ...f, features: [...f.features, ""] }))}>
                    <Plus className="h-4 w-4 mr-1" /> Feature
                  </Button>
                </div>
                <div className="space-y-2">
                  {form.features.map((feat, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={feat} onChange={(e) => setForm((f) => { const arr = [...f.features]; arr[i] = e.target.value; return { ...f, features: arr }; })} />
                      <Button size="icon" variant="ghost" onClick={() => setForm((f) => ({ ...f, features: f.features.filter((_, j) => j !== i) }))}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><Label>Gewicht (kg)</Label><Input type="number" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} /></div>
                <div><Label>Antriebsart</Label><Input placeholder="diesel/elektro/…" value={form.drive_type} onChange={(e) => setForm({ ...form, drive_type: e.target.value })} /></div>
                <div><Label>PDF-Handbuch URL</Label><Input value={form.pdf_url} onChange={(e) => setForm({ ...form, pdf_url: e.target.value })} /></div>
              </div>
            </TabsContent>

            <TabsContent value="preise" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><Label>Preis / Tag</Label><Input placeholder="z.B. 89 €" value={form.price_per_day} onChange={(e) => setForm({ ...form, price_per_day: e.target.value })} /></div>
                <div><Label>Preis / Wochenende</Label><Input value={form.price_weekend} onChange={(e) => setForm({ ...form, price_weekend: e.target.value })} /></div>
                <div><Label>Preis / Monat</Label><Input value={form.price_per_month} onChange={(e) => setForm({ ...form, price_per_month: e.target.value })} /></div>
              </div>
              <div>
                <Label>Rentware-Codes je Standort</Label>
                <p className="text-xs text-muted-foreground mb-2">Sobald ein Code eingetragen ist, wird der Artikel dort direkt buchbar. „Auf Anfrage"-Texte werden beim Speichern automatisch entfernt.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {LOCATIONS.map((loc) => (
                    <div key={loc.id}>
                      <Label className="text-xs">{loc.label}</Label>
                      <Input value={form.rentware_code[loc.id]} onChange={(e) => setForm((f) => ({ ...f, rentware_code: { ...f.rentware_code, [loc.id]: e.target.value } }))} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="req" checked={form.on_request} disabled={hasAnyRentware} onCheckedChange={(v) => setForm({ ...form, on_request: !!v })} />
                <Label htmlFor="req">Nur auf Anfrage buchbar {hasAnyRentware && <span className="text-xs text-muted-foreground">(deaktiviert, weil Rentware-Code gesetzt)</span>}</Label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Mindestmietdauer (Monate)</Label><Input type="number" value={form.min_rental_months} onChange={(e) => setForm({ ...form, min_rental_months: e.target.value })} /></div>
                <div><Label>Video-URL</Label><Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} /></div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-6">
              {(form.seo_draft_meta_description.trim() || form.seo_draft_faqs.length > 0) && (
                <div className="rounded-lg border border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" /> KI-Entwurf vorhanden
                      </div>
                      {form.seo_draft_generated_at && (
                        <div className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                          Generiert am {new Date(form.seo_draft_generated_at).toLocaleString("de-DE")}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          if (!window.confirm("Entwurf übernehmen? Die vorhandenen Live-Felder (Meta-Description und FAQs) werden überschrieben.")) return;
                          setForm((f) => ({
                            ...f,
                            seo_meta_description: f.seo_draft_meta_description || f.seo_meta_description,
                            seo_faqs: f.seo_draft_faqs.length > 0 ? f.seo_draft_faqs : f.seo_faqs,
                            seo_draft_meta_description: "",
                            seo_draft_faqs: [],
                            seo_draft_generated_at: null,
                          }));
                          toast.success("Entwurf übernommen – bitte speichern, um live zu schalten");
                        }}
                      >
                        Entwurf übernehmen
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (!window.confirm("Entwurf verwerfen? Die generierten Vorschläge gehen verloren.")) return;
                          setForm((f) => ({
                            ...f,
                            seo_draft_meta_description: "",
                            seo_draft_faqs: [],
                            seo_draft_generated_at: null,
                          }));
                          toast.success("Entwurf verworfen – bitte speichern");
                        }}
                      >
                        Verwerfen
                      </Button>
                    </div>
                  </div>
                  {form.seo_draft_meta_description.trim() && (
                    <div className="mt-3">
                      <div className="text-xs font-medium text-amber-900 dark:text-amber-200 mb-1">Meta-Description (Entwurf)</div>
                      <div className="text-sm bg-background/60 rounded border border-amber-200 p-2 whitespace-pre-wrap">{form.seo_draft_meta_description}</div>
                    </div>
                  )}
                  {form.seo_draft_faqs.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-medium text-amber-900 dark:text-amber-200 mb-1">FAQs (Entwurf, {form.seo_draft_faqs.length})</div>
                      <div className="space-y-1">
                        {form.seo_draft_faqs.map((f, i) => (
                          <details key={i} className="text-sm bg-background/60 rounded border border-amber-200 p-2">
                            <summary className="cursor-pointer font-medium">{f.question}</summary>
                            <div className="mt-1 text-muted-foreground whitespace-pre-wrap">{f.answer}</div>
                          </details>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Meta-Description</Label>
                  <Button size="sm" variant="outline" disabled={aiLoading === "meta_description"} onClick={() => runAI("meta_description")}>
                    {aiLoading === "meta_description" ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />} KI generieren
                  </Button>
                </div>
                <Textarea rows={2} value={form.seo_meta_description} onChange={(e) => setForm({ ...form, seo_meta_description: e.target.value })} />
                <div className="text-xs text-muted-foreground mt-1">{form.seo_meta_description.length}/155 Zeichen</div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Ausführliche Beschreibung</Label>
                  <Button size="sm" variant="outline" disabled={aiLoading === "detailed_description"} onClick={() => runAI("detailed_description")}>
                    {aiLoading === "detailed_description" ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />} KI generieren
                  </Button>
                </div>
                <Textarea rows={8} value={form.detailed_description} onChange={(e) => setForm({ ...form, detailed_description: e.target.value })} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>FAQs</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={aiLoading === "faqs"} onClick={() => runAI("faqs")}>
                      {aiLoading === "faqs" ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />} KI generieren
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setForm((f) => ({ ...f, seo_faqs: [...f.seo_faqs, { question: "", answer: "" }] }))}>
                      <Plus className="h-3 w-3 mr-1" /> FAQ
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  {form.seo_faqs.map((faq, i) => (
                    <div key={i} className="border rounded p-3 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <Input placeholder="Frage" value={faq.question} onChange={(e) => setForm((f) => { const arr = [...f.seo_faqs]; arr[i] = { ...arr[i], question: e.target.value }; return { ...f, seo_faqs: arr }; })} />
                        <Button size="icon" variant="ghost" onClick={() => setForm((f) => ({ ...f, seo_faqs: f.seo_faqs.filter((_, j) => j !== i) }))}><X className="h-4 w-4" /></Button>
                      </div>
                      <Textarea rows={2} placeholder="Antwort" value={faq.answer} onChange={(e) => setForm((f) => { const arr = [...f.seo_faqs]; arr[i] = { ...arr[i], answer: e.target.value }; return { ...f, seo_faqs: arr }; })} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Lokaler SEO-Content je Standort</Label>
                <div className="space-y-3 mt-2">
                  {LOCATIONS.filter((l) => form.available_locations.includes(l.id)).map((loc) => (
                    <div key={loc.id} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{loc.label}</span>
                        <Button size="sm" variant="outline" disabled={aiLoading === "local_content" + loc.id} onClick={() => runAI("local_content", loc.id)}>
                          {aiLoading === "local_content" + loc.id ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />} KI generieren
                        </Button>
                      </div>
                      <Textarea rows={3} value={form.seo_local_content[loc.id]} onChange={(e) => setForm((f) => ({ ...f, seo_local_content: { ...f.seo_local_content, [loc.id]: e.target.value } }))} />
                    </div>
                  ))}
                  {!form.available_locations.length && <p className="text-sm text-muted-foreground">Bitte zuerst Standorte im Basis-Tab wählen.</p>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="intern" className="space-y-4">
              <div className="rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                🔒 Diese Felder sind <strong>nur intern</strong> sichtbar und werden niemals ans Frontend ausgeliefert. Sie dienen ausschließlich der internen Bestandsführung.
              </div>
              <div className="space-y-3">
                {LOCATIONS.map((loc) => (
                  <div key={loc.id} className="border rounded p-3">
                    <div className="font-medium mb-2">{loc.label}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs">Menge</Label>
                        <Input type="number" value={form.quantities[loc.id]} onChange={(e) => setForm((f) => ({ ...f, quantities: { ...f.quantities, [loc.id]: e.target.value } }))} />
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs">Interne Notiz</Label>
                        <Input value={form.quantity_notes[loc.id]} onChange={(e) => setForm((f) => ({ ...f, quantity_notes: { ...f.quantity_notes, [loc.id]: e.target.value } }))} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Leere Felder werden nicht in der DB gespeichert und lassen bestehende Artikel unberührt.</p>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={requestClose}>Abbrechen</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {initial ? "Speichern" : "Anlegen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
