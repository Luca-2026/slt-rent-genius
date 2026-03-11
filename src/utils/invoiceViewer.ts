import { supabase } from "@/integrations/supabase/client";

/**
 * Extracts the storage bucket and file path from a Supabase storage signed URL.
 * Supports both /object/sign/ and /object/public/ URL patterns.
 */
function extractStoragePath(fileUrl: string): { bucket: string; path: string } | null {
  try {
    const url = new URL(fileUrl);
    // Signed URL pattern: /storage/v1/object/sign/{bucket}/{path}
    const signMatch = url.pathname.match(/\/storage\/v1\/object\/sign\/([^/]+)\/(.+)/);
    if (signMatch) {
      return { bucket: signMatch[1], path: decodeURIComponent(signMatch[2]) };
    }
    // Public URL pattern: /storage/v1/object/public/{bucket}/{path}
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
 * Opens/downloads a document (PDF or HTML).
 * For storage URLs: fetches the file and opens it reliably even with popup blockers.
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

  // Most offers already contain a signed storage URL -> open immediately while user gesture is active
  if (/\/storage\/v1\/object\/sign\//.test(fileUrl)) {
    openInPopupOrFallback(fileUrl);
    return;
  }

  const storagePath = extractStoragePath(fileUrl);
  if (storagePath) {
    const { data: signedData, error: signError } = await supabase.storage
      .from(storagePath.bucket)
      .createSignedUrl(storagePath.path, 60 * 60);

    if (!signError && signedData?.signedUrl) {
      openInPopupOrFallback(signedData.signedUrl);
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from(storagePath.bucket)
        .download(storagePath.path);

      if (!error && data) {
        // Determine correct MIME type based on file extension
        const isHtml = storagePath.path.toLowerCase().endsWith('.html');
        const mimeType = isHtml ? "text/html; charset=utf-8" : "application/pdf";
        const blob = new Blob([data], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        openInPopupOrFallback(blobUrl);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
        return;
      }
    } catch {
      // continue with original url fallback
    }
  }

  // Last resort: open the original URL directly
  openInPopupOrFallback(fileUrl);
}
