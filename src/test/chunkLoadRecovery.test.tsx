import { lazy, Suspense } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChunkLoadErrorBoundary } from "@/components/ChunkLoadErrorBoundary";
import { isRecoverableChunkLoadError, recoverFromChunkLoadError } from "@/lib/chunkLoadRecovery";

const firefoxError = new TypeError('can\'t access property "default", e._result is undefined');

beforeEach(() => {
  window.sessionStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  window.sessionStorage.clear();
});

describe("stale chunk recovery", () => {
  it.each([
    firefoxError,
    { message: firefoxError.message },
    { reason: firefoxError },
    { payload: firefoxError },
    'Failed to fetch dynamically imported module',
    'undefined is not an object (evaluating "e._result.default")',
    "Cannot read properties of undefined (reading '_result.default')",
  ])("recognizes browser lazy-load failures: %s", (error) => {
    expect(isRecoverableChunkLoadError(error)).toBe(true);
  });

  it.each([
    'can\'t access property "default", customer is undefined',
    'can\'t access property "name", e._result is undefined',
    new TypeError("Cannot read properties of undefined (reading 'name')"),
  ])("does not reload unrelated application failures: %s", (error) => {
    expect(isRecoverableChunkLoadError(error)).toBe(false);
    expect(recoverFromChunkLoadError(error)).toBe(false);
  });

  it("schedules one automatic reload and blocks another within 15 seconds", () => {
    const schedule = vi.spyOn(window, "setTimeout");
    expect(recoverFromChunkLoadError(firefoxError)).toBe(true);
    expect(schedule).toHaveBeenCalledTimes(1);
    expect(recoverFromChunkLoadError(firefoxError)).toBe(false);
    expect(schedule).toHaveBeenCalledTimes(1);
    vi.setSystemTime(Date.now() + 15_000);
    expect(recoverFromChunkLoadError(firefoxError)).toBe(true);
    expect(schedule).toHaveBeenCalledTimes(2);
  });

  it("contains a rejected lazy route instead of propagating Firefox's failure", async () => {
    vi.useRealTimers();
    window.sessionStorage.setItem("slt:stale-chunk-reload", JSON.stringify({
      href: window.location.href, timestamp: Date.now(),
    }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const caught = vi.spyOn(ChunkLoadErrorBoundary.prototype, "componentDidCatch");
    const FailedRoute = lazy(() => Promise.reject(firefoxError));
    render(
      <ChunkLoadErrorBoundary><Suspense fallback={null}><FailedRoute /></Suspense></ChunkLoadErrorBoundary>,
    );
    await vi.waitFor(() => expect(caught).toHaveBeenCalledWith(firefoxError, expect.any(Object)));
    expect(recoverFromChunkLoadError(firefoxError)).toBe(false);
  });
});