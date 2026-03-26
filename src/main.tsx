import { createRoot } from "react-dom/client";
import "./index.css";

type MemoryStore = Record<string, string>;

const createMemoryStorage = (): Storage => {
  const store: MemoryStore = {};

  return {
    get length() {
      return Object.keys(store).length;
    },
    clear() {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    key(index: number) {
      return Object.keys(store)[index] ?? null;
    },
    removeItem(key: string) {
      delete store[key];
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
  };
};

const ensureStorageAccess = () => {
  const probe = (storage: Storage, key: string) => {
    storage.setItem(key, "1");
    storage.removeItem(key);
  };

  try {
    probe(window.localStorage, "__slt_ls_probe__");
  } catch {
    try {
      Object.defineProperty(window, "localStorage", {
        value: createMemoryStorage(),
        configurable: true,
      });
    } catch {
      // keep default behavior if browser forbids overriding the property
    }
  }

  try {
    probe(window.sessionStorage, "__slt_ss_probe__");
  } catch {
    try {
      Object.defineProperty(window, "sessionStorage", {
        value: createMemoryStorage(),
        configurable: true,
      });
    } catch {
      // keep default behavior if browser forbids overriding the property
    }
  }
};

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root container not found");
}

const root = createRoot(rootElement);

root.render(
  <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
    Seite wird geladen…
  </div>
);

const bootstrap = async () => {
  ensureStorageAccess();

  await import("./i18n");
  const { default: App } = await import("./App.tsx");

  root.render(<App />);
};

void bootstrap().catch((error) => {
  console.error("App bootstrap failed:", error);

  root.render(
    <div className="min-h-screen flex items-center justify-center bg-background px-6 text-center text-foreground">
      <p>Die Seite konnte nicht geladen werden. Bitte aktualisiere die Vorschau.</p>
    </div>
  );
});
