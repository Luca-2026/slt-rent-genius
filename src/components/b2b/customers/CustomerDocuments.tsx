import { useEffect, useState } from "react";
import { FileText, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { loadCustomerDocuments, openCustomerDocument, type CustomerDocument } from "./customerDocuments";

export function CustomerDocuments({ customerId, profileId }: { customerId: string; profileId?: string | null }) {
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [opening, setOpening] = useState<string | null>(null);
  const { toast } = useToast();
  useEffect(() => {
    let active = true;
    setLoading(true); setError(false); setDocuments([]);
    loadCustomerDocuments(customerId, profileId).then(data => {
      if (active) setDocuments(data);
    }).catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [customerId, profileId, retry]);
  const open = async (document: CustomerDocument) => {
    setOpening(document.id);
    try { await openCustomerDocument(document); }
    catch { toast({ title: "Dokument konnte nicht geöffnet werden", description: "Bitte erneut versuchen.", variant: "destructive" }); }
    finally { setOpening(null); }
  };
  return <section aria-label="Kundendokumente">
    <h3 className="mb-2 text-sm font-semibold text-foreground">Dokumente</h3>
    {loading ? <p role="status" className="text-sm text-muted-foreground">Dokumente werden geladen …</p> : error ? <div className="flex flex-wrap items-center gap-2">
      <p role="alert" className="text-sm text-destructive">Dokumente konnten nicht geladen werden.</p>
      <Button variant="outline" size="sm" onClick={() => setRetry(v => v + 1)}><RefreshCw className="mr-2 h-4 w-4" />Erneut laden</Button>
    </div> : documents.length === 0 ? <p className="text-sm text-muted-foreground">Noch keine Dokumente vorhanden.</p> : <ul className="divide-y divide-border rounded-md border border-border">
      {documents.map(document => <li key={document.id}>
        <Button variant="ghost" disabled={opening !== null} onClick={() => void open(document)} className="h-auto w-full justify-start gap-3 rounded-none px-3 py-2.5 text-left whitespace-normal">
          {opening === document.id ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <FileText className="h-4 w-4 shrink-0 text-primary" />}
          <span className="min-w-0 flex-1 break-words"><span className="block">{document.label}</span>{document.date && <span className="block text-xs text-muted-foreground">{new Date(document.date).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" })}</span>}</span>
          <span className="shrink-0 text-xs text-muted-foreground">{/\.html(?:\?|$)/i.test(document.url) ? "Druck / PDF" : "Öffnen"}</span>
        </Button>
      </li>)}
    </ul>}
  </section>;
}