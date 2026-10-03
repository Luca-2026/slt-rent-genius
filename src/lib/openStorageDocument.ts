import { supabase } from "@/integrations/supabase/client";

/**
 * Öffnet ein Dokument aus einem privaten Speicherordner über einen kurzlebigen, signierten Link.
 * Ältere Einträge speichern eine (nicht abrufbare) öffentliche URL – daraus wird der Pfad gelesen.
 */
export async function openStorageDocument(urlOrPath: string, bucket = "b2b-documents") {
  const win = window.open("", "_blank");
  const marker = `/${bucket}/`;
  const idx = urlOrPath.indexOf(marker);
  const path = decodeURIComponent((idx >= 0 ? urlOrPath.slice(idx + marker.length) : urlOrPath).split("?")[0]);
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 600);
  if (error || !data?.signedUrl) {
    win?.close();
    throw new Error(error?.message || "Dokument nicht gefunden");
  }
  if (win) win.location.href = data.signedUrl;
  else window.location.href = data.signedUrl;
}
