import "@testing-library/jest-dom";
import { beforeEach, vi } from "vitest";

// Fail closed: tests must supply their own local transport when they expect HTTP.
// Never let an accidentally incomplete mock reach payments, mail or production DB.
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("External fetch forbidden in unit tests; provide an isolated mock"))));
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
