import { useSyncExternalStore } from "react";

// Reference counting keeps overlays hidden for both customer/staff pads.
let activePads = 0;
const listeners = new Set<() => void>();

function publish() {
  document.documentElement.toggleAttribute("data-slt-signing", activePads > 0);
  listeners.forEach((listener) => listener());
}

export function registerSigningSurface(): () => void {
  activePads += 1;
  publish();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    activePads -= 1;
    publish();
  };
}

export function isSigningRoute(pathname: string): boolean {
  return /^\/angebot\/[^/]+\/?$/.test(pathname);
}

export function useSigningOverlaysSuppressed(pathname: string): boolean {
  const signing = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    () => activePads > 0,
    () => false,
  );
  return signing || isSigningRoute(pathname);
}