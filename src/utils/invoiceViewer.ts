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
  const popup = window.open("", "_blank", "noopener,noreferrer");

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

  // If it's a storage URL, download directly (works with RLS)
  const storagePath = extractStoragePath(fileUrl);
  if (storagePath) {
    try {
      const { data, error } = await supabase.storage
        .from(storagePath.bucket)
        .download(storagePath.path);

      if (!error && data) {
        const blobUrl = URL.createObjectURL(data);
        openInPopupOrFallback(blobUrl);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
        return;
      }
    } catch {
      // continue with signed/original url fallback
    }

    const { data: signedData, error: signError } = await supabase.storage
      .from(storagePath.bucket)
      .createSignedUrl(storagePath.path, 60 * 60);

    if (!signError && signedData?.signedUrl) {
      openInPopupOrFallback(signedData.signedUrl);
      return;
    }
  }

  // Last resort: open the original URL directly
  openInPopupOrFallback(fileUrl);
}
