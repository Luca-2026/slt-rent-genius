import { useState } from "react";
import { Button } from "@/components/ui/button";
import { invokeWithAuth } from "@/lib/invokeWithAuth";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink } from "lucide-react";

export function InvoicePdfButton({ invoiceId }: { invoiceId: string }) {
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  return <Button variant="link" size="sm" disabled={busy} onClick={async () => {
    if (busy) return;
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    setBusy(true);
    try {
      const { data, error } = await invokeWithAuth<{ pdf_base64: string }>("send-inquiry-invoice", { invoice_pdf_id: invoiceId });
      if (error || !data?.pdf_base64) { tab?.close(); toast({ title: "Rechnung konnte nicht geöffnet werden", variant: "destructive" }); return; }
      const url = URL.createObjectURL(new Blob([Uint8Array.from(atob(data.pdf_base64), c => c.charCodeAt(0))], { type: "application/pdf" }));
      if (tab) tab.location.href = url;
      else window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch { tab?.close(); toast({ title: "Rechnung konnte nicht geöffnet werden", variant: "destructive" }); }
    finally { setBusy(false); }
  }}>PDF öffnen <ExternalLink className="h-3.5 w-3.5" /></Button>;
}