/**
 * Opens an invoice HTML file in a new browser window for rendering and PDF printing.
 * Fetches the HTML from the signed URL and writes it into a new window,
 * ensuring proper rendering instead of showing raw HTML code.
 * 
 * IMPORTANT: window.open() must be called synchronously in the click handler
 * to avoid popup blockers, especially on mobile browsers.
 */
export async function openInvoiceInNewWindow(fileUrl: string, documentNumber?: string, documentType?: string): Promise<void> {
  // Open the window immediately (synchronously) to avoid popup blockers on mobile
  const newWindow = window.open("", "_blank");

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Fehler beim Laden des Dokuments: ${response.status}`);
    }

    // Explicitly decode as UTF-8 to prevent umlaut encoding issues
    const buffer = await response.arrayBuffer();
    const html = new TextDecoder("utf-8").decode(buffer);

    if (newWindow) {
      newWindow.document.open();
      newWindow.document.write(html);
      newWindow.document.close();

      // Set window title based on document type
      if (documentNumber) {
        let label = documentType || "Dokument";
        if (!documentType && documentNumber) {
          if (documentNumber.startsWith("ANG")) label = "Angebot";
          else if (documentNumber.startsWith("RE")) label = "Rechnung";
          else if (documentNumber.startsWith("UP")) label = "Übergabeprotokoll";
          else if (documentNumber.startsWith("RP")) label = "Rückgabeprotokoll";
          else label = "Rechnung";
        }
        newWindow.document.title = `${label} ${documentNumber}`;
      }
      const favicon = newWindow.document.createElement("link");
      favicon.rel = "icon";
      favicon.type = "image/png";
      favicon.href = "https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png";
      newWindow.document.head.appendChild(favicon);
    } else {
      // Fallback: if popup is still blocked, use blob URL with location.href
      const blob = new Blob([html], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);
      window.location.href = blobUrl;
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    }
  } catch (error) {
    console.error("Invoice viewer error:", error);
    // If window was opened but fetch failed, navigate it to the URL directly
    if (newWindow) {
      newWindow.location.href = fileUrl;
    } else {
      window.open(fileUrl, "_blank");
    }
  }
}
