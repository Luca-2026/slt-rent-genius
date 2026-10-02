/**
 * Verkleinert ein Foto im Browser auf max. `maxSide` Pixel (JPEG) und liefert
 * es als Base64 ohne Präfix. So bleiben 15 Handyfotos klein genug für den Versand.
 */
export async function compressImageToBase64(file: File, maxSide = 1600, quality = 0.8): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error(`Foto „${file.name}“ konnte nicht gelesen werden.`));
      el.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Foto konnte nicht verarbeitet werden.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    return dataUrl.split(",")[1] ?? "";
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Limit individual protocol photos so 15 images fit into a single PDF request. */
export async function prepareProtocolPhoto(original: File): Promise<File> {
  let encoded = "";
  for (const side of [1100, 900, 700]) {
    encoded = await compressImageToBase64(original, side, 0.65);
    if (encoded.length <= 480_000) break; // <= 360 KB binary, <= 7.2 MB for 15 photos
  }
  if (encoded.length > 480_000) throw new Error("Foto ist zu groß. Bitte ein kleineres JPEG-Bild auswählen.");
  const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  return new File([bytes], `${original.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg", lastModified: original.lastModified });
}

export async function protocolPhotoBase64(file: File): Promise<string> {
  return (await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  }));
}
