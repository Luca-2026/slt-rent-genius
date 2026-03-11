/**
 * Opens/downloads a document (PDF or HTML).
 * Uses a hidden link with download attribute; falls back to window.open.
 */
export async function openInvoiceInNewWindow(fileUrl: string, documentNumber?: string, documentType?: string): Promise<void> {
  try {
    // Determine a filename
    let label = documentType || "Dokument";
    if (!documentType && documentNumber) {
      if (documentNumber.startsWith("ANG")) label = "Angebot";
      else if (documentNumber.startsWith("SLT-B2B-RNT")) label = "Rechnung";
      else if (documentNumber.startsWith("LS-")) label = "Uebergabeprotokoll";
      else if (documentNumber.startsWith("RP-")) label = "Rueckgabeprotokoll";
      else label = "Dokument";
    }

    const filename = documentNumber
      ? `${label}_${documentNumber}.pdf`
      : `${label}.pdf`;

    // Try fetch + blob download first (works same-origin)
    try {
      const response = await fetch(fileUrl);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
        return;
      }
    } catch {
      // CORS or network error – fall through
    }

    // Fallback: open in new tab
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  } catch (error) {
    console.error("Document download error:", error);
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  }
}
