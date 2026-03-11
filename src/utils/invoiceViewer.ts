/**
 * Opens/downloads a document (PDF or HTML).
 * Uses direct link navigation which works reliably in iframes.
 */
export async function openInvoiceInNewWindow(fileUrl: string, documentNumber?: string, _documentType?: string): Promise<void> {
  if (!fileUrl) return;
  
  // Simply open the URL directly - this works in all contexts including iframes
  const a = document.createElement("a");
  a.href = fileUrl;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
