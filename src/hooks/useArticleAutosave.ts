import { useEffect, useRef, useState } from "react";

/** Serialize writes; a slow response must never acknowledge newer, unsaved input. */
export function useArticleAutosave<T>({ value, baseline, enabled, save }: {
  value: T;
  baseline: string;
  enabled: boolean;
  save: (snapshot: T) => Promise<boolean>;
}) {
  const latest = useRef({ value, baseline, enabled, save });
  latest.current = { value, baseline, enabled, save };
  const running = useRef<Promise<boolean> | null>(null);
  const [state, setState] = useState<"saved" | "pending" | "saving" | "error">("saved");

  const flush = async (): Promise<boolean> => {
    if (running.current) return running.current;
    const work = async () => {
      while (latest.current.enabled && JSON.stringify(latest.current.value) !== latest.current.baseline) {
        const current = latest.current;
        const snapshot = current.value;
        setState("saving");
        try {
          if (!await current.save(snapshot)) { setState("error"); return false; }
        } catch { setState("error"); return false; }
        // The owner also updates its baseline, but React may not have rendered yet.
        latest.current.baseline = JSON.stringify(snapshot);
      }
      setState("saved");
      return true;
    };
    const promise = work();
    running.current = promise;
    try { return await promise; } finally { running.current = null; }
  };
  const flushRef = useRef(flush);
  flushRef.current = flush;
  const serialized = JSON.stringify(value);
  useEffect(() => {
    if (!enabled || !baseline || serialized === baseline) return;
    setState("pending");
    const timer = setTimeout(() => void flushRef.current(), 700);
    return () => clearTimeout(timer);
  }, [serialized, baseline, enabled]);
  useEffect(() => {
    const onBlur = (event: FocusEvent) => {
      if ((event.target as HTMLElement | null)?.closest("[data-article-autosave]")) void flushRef.current();
    };
    const onOnline = () => void flushRef.current();
    document.addEventListener("focusout", onBlur);
    window.addEventListener("online", onOnline);
    return () => { document.removeEventListener("focusout", onBlur); window.removeEventListener("online", onOnline); };
  }, []);
  return { flush, state };
}