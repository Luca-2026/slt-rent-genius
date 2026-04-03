type StorageKind = "localStorage" | "sessionStorage";

const createMemoryStorage = (): Storage => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(String(key));
    },
    setItem(key: string, value: string) {
      store.set(String(key), String(value));
    },
  } as Storage;
};

const canUseStorage = (kind: StorageKind) => {
  if (typeof window === "undefined") return false;

  try {
    const storage = window[kind];
    const testKey = `__storage_probe__${kind}`;
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const installStorageFallback = (kind: StorageKind) => {
  if (typeof window === "undefined" || canUseStorage(kind)) return;

  const fallback = createMemoryStorage();

  try {
    Object.defineProperty(window, kind, {
      configurable: true,
      enumerable: true,
      get: () => fallback,
    });
  } catch (error) {
    console.warn(`[storage] ${kind} fallback could not be installed`, error);
  }
};

export const installBrowserStorageFallbacks = () => {
  installStorageFallback("localStorage");
  installStorageFallback("sessionStorage");
};
