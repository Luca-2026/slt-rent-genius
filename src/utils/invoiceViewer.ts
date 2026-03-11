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

  let targetUrl = fileUrl;

  // If it's a Supabase storage URL, generate a fresh signed URL
  const storagePath = extractStoragePath(fileUrl);
  if (storagePath) {
    const { data, error } = await supabase.storage
      .from(storagePath.bucket)
      .createSignedUrl(storagePath.path, 60 * 60); // 1 hour

    if (!error && data?.signedUrl) {
      targetUrl = data.signedUrl;
    }
    // If signing fails, fall through to try the original URL
  }

  // Open via anchor tag — works reliably in iframes and cross-origin contexts
  const a = document.createElement("a");
  a.href = targetUrl;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
