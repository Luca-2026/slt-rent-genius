import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * Zeigt ein PDF seitenweise als Bild an (pdf.js) – unabhängig vom eingebauten
 * PDF-Betrachter des Browsers, der in eingebetteten Fenstern oft leer bleibt.
 */
export function PdfPagesPreview({ url, className }: { url: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    const host = ref.current;
    if (!host) return;
    host.innerHTML = "";
    setState("loading");
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        const doc = await pdfjs.getDocument(url).promise;
        for (let n = 1; n <= doc.numPages; n++) {
          if (cancelled) return;
          const page = await doc.getPage(n);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = "mx-auto mb-4 block h-auto w-full max-w-3xl rounded border border-border bg-card shadow-sm";
          canvas.setAttribute("aria-label", `Seite ${n} von ${doc.numPages}`);
          await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
          if (cancelled) return;
          host.appendChild(canvas);
        }
        if (!cancelled) setState("ok");
      } catch (e) {
        console.error("PDF-Vorschau fehlgeschlagen", e);
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className={className}>
      {state === "loading" && (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Vorschau wird geladen …
        </div>
      )}
      {state === "error" && (
        <p className="py-10 text-center text-sm text-destructive">
          Die Vorschau konnte nicht angezeigt werden. Bitte „In neuem Tab öffnen" nutzen.
        </p>
      )}
      <div ref={ref} />
    </div>
  );
}
