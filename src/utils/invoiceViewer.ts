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
 * For Supabase storage URLs: generates a fresh signed URL to avoid expiry issues.
 * For other URLs: opens directly.
 */
export async function openInvoiceInNewWindow(fileUrl: string, _documentNumber?: string, _documentType?: string): Promise<void> {
  if (!fileUrl) return;

  // If it's a Supabase storage URL, download the file directly (works with RLS)
  const storagePath = extractStoragePath(fileUrl);
  if (storagePath) {
    try {
      const { data, error } = await supabase.storage
        .from(storagePath.bucket)
        .download(storagePath.path);

      if (!error && data) {
        const blobUrl = URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // Clean up after a delay to allow the browser to open the blob
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        return;
      }
    } catch {
      // Fall through to try signed URL or original URL
    }

    // Fallback: try creating a signed URL (works for admins/service role)
    const { data: signedData, error: signError } = await supabase.storage
      .from(storagePath.bucket)
      .createSignedUrl(storagePath.path, 60 * 60);

    if (!signError && signedData?.signedUrl) {
      const a = document.createElement("a");
      a.href = signedData.signedUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
  }

  // Last resort: open the original URL directly
  const a = document.createElement("a");
  a.href = fileUrl;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
