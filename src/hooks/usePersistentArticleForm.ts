import { useEffect, useRef, useState } from "react";
import { readCmsDraft, writeCmsDraft, clearCmsDraft } from "@/lib/cmsDraftStorage";
import { useArticleAutosave } from "./useArticleAutosave";

export function usePersistentArticleForm<T extends object>(key: string, initial: T, save: (value: T) => Promise<boolean>, enabled = true) {
  const [form, setForm] = useState<T>(() => readCmsDraft<T>(key)?.form ?? initial);
  const baseline = useRef(JSON.stringify(initial));
  const current = useRef(form);
  current.current = form;
  useEffect(() => {
    if (JSON.stringify(form) !== baseline.current) writeCmsDraft(key, form);
  }, [form, key]);
  const autosave = useArticleAutosave({ value: form, baseline: baseline.current, enabled,
    save: async (snapshot) => {
      if (!await save(snapshot)) return false;
      baseline.current = JSON.stringify(snapshot);
      if (JSON.stringify(current.current) === baseline.current) clearCmsDraft(key);
      return true;
    } });
  const reset = (next: T) => { baseline.current = JSON.stringify(next); current.current = next; setForm(next); clearCmsDraft(key); };
  return { form, setForm, reset, ...autosave };
}