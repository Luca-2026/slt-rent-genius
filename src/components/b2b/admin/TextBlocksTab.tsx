import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/** Bekannte Textbausteine (Paket 4). Weitere Bausteine hier ergänzen. */
const BLOCKS: { key: string; title: string; hint: string }[] = [
  {
    key: "offer_terms",
    title: "Angebotsbedingungen",
    hint: "Steht im Angebots-PDF nach dem Summenblock. Absätze durch eine Leerzeile trennen – ab dem zweiten Absatz wird nur gedruckt, wenn ein Bau-Artikel im Angebot ist.",
  },
];

interface Row { key: string; text_business: string; text_private: string; updated_at?: string }

export function TextBlocksTab() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("text_blocks").select("key,text_business,text_private,updated_at").then(({ data }) => {
      const map: Record<string, Row> = {};
      for (const b of BLOCKS) map[b.key] = { key: b.key, text_business: "", text_private: "" };
      for (const r of data ?? []) map[r.key] = { key: r.key, text_business: r.text_business ?? "", text_private: r.text_private ?? "", updated_at: r.updated_at };
      setRows(map);
      setLoading(false);
    });
  }, []);

  const save = async (key: string) => {
    const r = rows[key];
    setSaving(key);
    const { error } = await supabase.from("text_blocks").upsert({ key, text_business: r.text_business, text_private: r.text_private });
    setSaving(null);
    toast(error
      ? { title: "Speichern fehlgeschlagen", description: error.message, variant: "destructive" }
      : { title: "Textbaustein gespeichert", description: "Gilt für alle neuen Angebote." });
  };

  if (loading) return <p className="text-sm text-muted-foreground">Lade Textbausteine…</p>;

  return (
    <div className="space-y-4">
      {BLOCKS.map((b) => {
        const r = rows[b.key];
        const set = (patch: Partial<Row>) => setRows((prev) => ({ ...prev, [b.key]: { ...prev[b.key], ...patch } }));
        return (
          <Card key={b.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-5 w-5" /> {b.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{b.hint}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Fassung Unternehmen</Label>
                  <Textarea rows={9} value={r.text_business} onChange={(e) => set({ text_business: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Fassung Privatkunden</Label>
                  <Textarea rows={9} value={r.text_private} onChange={(e) => set({ text_private: e.target.value })} />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={() => save(b.key)} disabled={saving === b.key}>
                  {saving === b.key ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Speichern
                </Button>
                {r.updated_at && <span className="text-xs text-muted-foreground">Zuletzt geändert: {new Date(r.updated_at).toLocaleString("de-DE")}</span>}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
