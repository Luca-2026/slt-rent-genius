/**
 * Downloads a document (PDF or HTML) directly as a file.
 * For PDFs: fetches and triggers a browser download.
 * For HTML: fetches, converts to blob, and triggers download.
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

    const isPdf = fileUrl.toLowerCase().includes('.pdf') || fileUrl.toLowerCase().includes('content-type=application/pdf');

    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Fehler beim Laden des Dokuments: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    const blob = await response.blob();

    const extension = (isPdf || contentType.includes("application/pdf")) ? ".pdf" : ".html";
    const filename = documentNumber
      ? `${label}_${documentNumber}${extension}`
      : `${label}${extension}`;

    // Trigger download
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch (error) {
    console.error("Document download error:", error);
    // Fallback: open in new tab
    window.open(fileUrl, "_blank");
  }
}
