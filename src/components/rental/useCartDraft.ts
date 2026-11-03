import { useEffect, useState, type SetStateAction } from "react";

const cache = new Map<string, { expiresAt: number; value: unknown }>();
export function readCartDraft<T extends object>(key: string, requestId: string, expiresAt: number, initial: T): T {
  const storageKey = `slt.cart-draft.${key}.${requestId}`;
  try {
    const raw = localStorage.getItem(storageKey);
    const stored = raw ? JSON.parse(raw) : cache.get(storageKey);
    if (stored?.expiresAt === expiresAt && expiresAt > Date.now() && stored.value && typeof stored.value === "object") {
      // Only restore expected fields with matching types; never restore consent.
      return Object.fromEntries(Object.entries(initial).map(([field, fallback]) => [field, typeof stored.value[field] === typeof fallback ? stored.value[field] : fallback])) as T;
    }
    localStorage.removeItem(storageKey);
  } catch { /* Private/restricted browsers still retain the current page's state. */
    const stored = cache.get(storageKey);
    if (stored?.expiresAt === expiresAt && expiresAt > Date.now()) return stored.value as T;
  }
  cache.delete(storageKey);
  return initial;
}
export function writeCartDraft<T>(key: string, requestId: string, expiresAt: number, value: T) {
  if (!requestId || expiresAt <= Date.now()) return;
  const storageKey = `slt.cart-draft.${key}.${requestId}`, entry = { expiresAt, value };
  cache.set(storageKey, entry);
  try { localStorage.setItem(storageKey, JSON.stringify(entry)); } catch { /* In-page fallback above. */ }
}
export function useCartDraft<T extends object>(key: string, requestId: string, expiresAt: number, initial: T) {
  const scope = `${key}.${requestId}.${expiresAt}`;
  const [draft, setDraft] = useState(() => ({ scope, value: readCartDraft(key, requestId, expiresAt, initial) }));
  const value = draft.scope === scope ? draft.value : readCartDraft(key, requestId, expiresAt, initial);
  useEffect(() => { if (draft.scope !== scope) setDraft({ scope, value }); }, [scope, draft.scope]);
  const setValue = (next: SetStateAction<T>) => {
    const updated = typeof next === "function" ? (next as (current: T) => T)(value) : next;
    writeCartDraft(key, requestId, expiresAt, updated);
    setDraft({ scope, value: updated });
  };
  return [value, setValue] as const;
}