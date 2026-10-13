/** Gewählte Kundengruppe (Privat/Geschäft) für die Preisanzeige; gilt websiteweit und bleibt gespeichert. */
import { useSyncExternalStore } from "react";
import type { CustomerType } from "@/lib/priceDisplay";

const KEY = "slt-customer-type";
const EVENT = "slt-customer-type-change";

function read(): CustomerType | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "private" || v === "business" ? v : null;
  } catch {
    return null;
  }
}

export function setCustomerType(type: CustomerType) {
  try { window.localStorage.setItem(KEY, type); } catch { /* privater Modus */ }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener("storage", cb); };
}

/** `chosen` = Kunde hat aktiv gewählt; bis dahin werden Preise brutto (Privatkunde) angezeigt. */
export function useCustomerType(): { type: CustomerType; chosen: boolean } {
  const v = useSyncExternalStore(subscribe, read, () => null);
  return { type: v ?? "private", chosen: v !== null };
}
