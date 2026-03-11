import { supabase } from "@/integrations/supabase/client";

/**
 * Extracts the storage bucket and file path from a Supabase storage signed URL.
 * Supports both /object/sign/ and /object/public/ URL patterns.
 */
function extractStoragePath(fileUrl: string): { bucket: string; path: string } | null {
  try {
    const url = new URL(fileUrl);
    const signMatch = url.pathname.match(/\/storage\/v1\/object\/sign\/([^/]+)\/(.+)/);
    if (signMatch) {
      return { bucket: signMatch[1], path: decodeURIComponent(signMatch[2]) };
    }
    const pubMatch = url.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
    if (pubMatch) {
      return { bucket: pubMatch[1], path: decodeURIComponent(pubMatch[2]) };
    }
  } catch {
    // Not a valid URL
  }
  return null;
}

/**
 * Checks whether a URL points to an HTML file based on the path.
 */
function isHtmlFile(fileUrl: string): boolean {
  try {
    const url = new URL(fileUrl);
    return url.pathname.toLowerCase().endsWith('.html');
  } catch {
    return fileUrl.toLowerCase().includes('.html');
  }
}

/**
 * Opens an HTML string in a new window and triggers the browser print dialog
 * so the user can save it as PDF.
 */
function openHtmlAsPdfPrint(htmlContent: string, popup: Window | null): void {
  const target = popup && !popup.closed ? popup : window.open("about:blank", "_blank");
  if (!target) return;

  target.document.open();
  target.document.write(htmlContent);
  target.document.close();

  // Wait for images/styles to load, then trigger print (Save as PDF)
  const triggerPrint = () => {
    try {
      target.focus();
      target.print();
    } catch {
      // If print fails (e.g. cross-origin), user can still manually print
    }
  };

  // Use onload or a small delay for reliability
  if (target.document.readyState === 'complete') {
    setTimeout(triggerPrint, 500);
  } else {
    target.onload = () => setTimeout(triggerPrint, 300);
    // Fallback timeout
    setTimeout(triggerPrint, 2000);
  }
}

/**
 * Downloads a storage file and returns its content as text (for HTML) or blob.
 */
async function downloadStorageFile(bucket: string, path: string): Promise<{ blob: Blob; isHtml: boolean } | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);
    if (!error && data) {
      const html = path.toLowerCase().endsWith('.html');
      return { blob: data, isHtml: html };
    }
  } catch {
    // continue
  }
  return null;
}

/**
 * Opens/downloads a document.
 * - PDF files: opened directly in a new tab.
 * - HTML files: rendered in a new window and the print/save-as-PDF dialog is triggered automatically.
 */
export async function openInvoiceInNewWindow(fileUrl: string, _documentNumber?: string, _documentType?: string): Promise<void> {
  if (!fileUrl) return;

  // Open a blank tab synchronously during the user click to avoid popup blockers
  const popup = window.open("about:blank", "_blank");

  const openInFallbackTab = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const openInPopupOrFallback = (url: string) => {
    if (popup && !popup.closed) {
      popup.location.href = url;
    } else {
      openInFallbackTab(url);
    }
  };

  const htmlFile = isHtmlFile(fileUrl);

  // For HTML files: always download and render with print dialog
  const storagePath = extractStoragePath(fileUrl);
  if (storagePath) {
    // For HTML: download and render with print dialog
    if (htmlFile) {
      const result = await downloadStorageFile(storagePath.bucket, storagePath.path);
      if (result) {
        const text = await result.blob.text();
        openHtmlAsPdfPrint(text, popup);
        return;
      }
    }

    // For PDFs: try signed URL first, then download as blob
    if (!htmlFile && /\/storage\/v1\/object\/sign\//.test(fileUrl)) {
      openInPopupOrFallback(fileUrl);
      return;
    }

    const { data: signedData, error: signError } = await supabase.storage
      .from(storagePath.bucket)
      .createSignedUrl(storagePath.path, 60 * 60);

    if (!signError && signedData?.signedUrl) {
      openInPopupOrFallback(signedData.signedUrl);
      return;
    }

    const result = await downloadStorageFile(storagePath.bucket, storagePath.path);
    if (result) {
      const blob = new Blob([result.blob], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      openInPopupOrFallback(blobUrl);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
      return;
    }
  }

  // Non-storage URLs
  if (htmlFile) {
    // Fetch and render with print dialog
    try {
      const resp = await fetch(fileUrl);
      if (resp.ok) {
        const text = await resp.text();
        openHtmlAsPdfPrint(text, popup);
        return;
      }
    } catch {
      // fallback
    }
  }

  // Last resort: open the original URL directly (for PDFs or unknown)
  openInPopupOrFallback(fileUrl);
}
