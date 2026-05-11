const STALE_CHUNK_RELOAD_KEY = "slt:stale-chunk-reload";
const RELOAD_COOLDOWN_MS = 15_000;

const STALE_CHUNK_PATTERNS = [
  /Importing a module script failed/i,
  /Failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /ChunkLoadError/i,
  /Loading chunk [\w-]+ failed/i,
  /Unable to preload CSS/i,
  // React.lazy resolver fails when the dynamic import resolves but the
  // module's `default` is missing — happens when the cached HTML preloads a
  // stale chunk hash after a re-deploy. Auto-reload to pick up fresh chunks.
  /_result\.default/i,
  /undefined is not an object \(evaluating ['"]?\w+\._result\.default/i,
];

const getMessage = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message;
  if (typeof value === "object") {
    const maybeMessage = (value as { message?: unknown }).message;
    if (typeof maybeMessage === "string") return maybeMessage;
    const maybeReason = (value as { reason?: unknown }).reason;
    if (maybeReason) return getMessage(maybeReason);
    const maybePayload = (value as { payload?: unknown }).payload;
    if (maybePayload) return getMessage(maybePayload);
  }
  return "";
};

export const isRecoverableChunkLoadError = (value: unknown) => {
  const message = getMessage(value);
  return STALE_CHUNK_PATTERNS.some((pattern) => pattern.test(message));
};

const markReloadAttempt = () => {
  if (typeof window === "undefined") return false;

  const href = window.location.href;
  const now = Date.now();

  try {
    const previous = window.sessionStorage.getItem(STALE_CHUNK_RELOAD_KEY);
    if (previous) {
      const parsed = JSON.parse(previous) as { href?: string; timestamp?: number };
      if (parsed.href === href && parsed.timestamp && now - parsed.timestamp < RELOAD_COOLDOWN_MS) {
        return false;
      }
    }

    window.sessionStorage.setItem(STALE_CHUNK_RELOAD_KEY, JSON.stringify({ href, timestamp: now }));
    return true;
  } catch {
    return true;
  }
};

export const recoverFromChunkLoadError = (error: unknown) => {
  if (typeof window === "undefined" || !isRecoverableChunkLoadError(error) || !markReloadAttempt()) {
    return false;
  }

  window.setTimeout(() => {
    window.location.reload();
  }, 0);

  return true;
};

export const installChunkLoadRecovery = () => {
  if (typeof window === "undefined") return;

  window.addEventListener("vite:preloadError", (event: Event) => {
    const payload = (event as Event & { payload?: unknown }).payload ?? event;
    if (recoverFromChunkLoadError(payload)) {
      event.preventDefault();
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    if (recoverFromChunkLoadError(event.reason)) {
      event.preventDefault();
    }
  });

  window.addEventListener("error", (event) => {
    if (recoverFromChunkLoadError(event.error ?? event.message)) {
      event.preventDefault();
    }
  });
};

installChunkLoadRecovery();