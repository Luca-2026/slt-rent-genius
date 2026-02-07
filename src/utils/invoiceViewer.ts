/**
 * Opens an invoice HTML file in a new browser window for rendering and PDF printing.
 * Fetches the HTML from the signed URL and writes it into a new window,
 * ensuring proper rendering instead of showing raw HTML code.
 */
export async function openInvoiceInNewWindow(fileUrl: string, invoiceNumber?: string): Promise<void> {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Fehler beim Laden der Rechnung: ${response.status}`);
    }

    // Explicitly decode as UTF-8 to prevent umlaut encoding issues
    // (response.text() may default to ISO-8859-1 if Content-Type lacks charset)
    const buffer = await response.arrayBuffer();
    const html = new TextDecoder("utf-8").decode(buffer);

    // Open a new window and write the HTML into it
    const newWindow = window.open("", "_blank");
    if (!newWindow) {
      // Fallback: if popup is blocked, use blob URL
      const blob = new Blob([html], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      // Clean up blob URL after a delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      return;
    }

    newWindow.document.open();
    newWindow.document.write(html);
    newWindow.document.close();

    // Set window title and favicon
    if (invoiceNumber) {
      newWindow.document.title = `Rechnung ${invoiceNumber}`;
    }
    // Set SLT favicon
    const favicon = newWindow.document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/png";
    favicon.href = "https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png";
    newWindow.document.head.appendChild(favicon);
  } catch (error) {
    console.error("Invoice viewer error:", error);
    // Ultimate fallback: open the URL directly
    window.open(fileUrl, "_blank");
  }
}
