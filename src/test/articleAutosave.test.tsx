import { act, renderHook, waitFor, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useArticleAutosave } from "@/hooks/useArticleAutosave";
import { usePersistentArticleForm } from "@/hooks/usePersistentArticleForm";
import { cmsDraftKey, readCmsDraft } from "@/lib/cmsDraftStorage";

afterEach(() => { cleanup(); localStorage.clear(); });
describe("article input persistence", () => {
  it("automatically saves entered article data without a save-button click", async () => {
    const save = vi.fn().mockResolvedValue(true);
    const { rerender } = renderHook(({ value }) => useArticleAutosave({ value, baseline: '"old"', enabled: true, save }), { initialProps: { value: "old" } });
    rerender({ value: "entered" });
    await waitFor(() => expect(save).toHaveBeenCalledWith("entered"), { timeout: 1500 });
  });
  it("serializes slow saves and saves the newest input afterwards", async () => {
    let finish: ((value: boolean) => void) | undefined;
    const save = vi.fn().mockImplementationOnce(() => new Promise<boolean>(resolve => { finish = resolve; })).mockResolvedValue(true);
    const { result, rerender } = renderHook(({ value }) => useArticleAutosave({ value, baseline: '"old"', enabled: true, save }), { initialProps: { value: "first" } });
    let pending: Promise<boolean>;
    act(() => { pending = result.current.flush(); });
    rerender({ value: "second" });
    await act(async () => { finish?.(true); await pending; });
    expect(save.mock.calls.map(call => call[0])).toEqual(["first", "second"]);
  });
  it("does not claim success after a failed write and retries explicitly", async () => {
    const save = vi.fn().mockResolvedValueOnce(false).mockResolvedValue(true);
    const { result } = renderHook(() => useArticleAutosave({ value: "new", baseline: '"old"', enabled: true, save }));
    await act(async () => { expect(await result.current.flush()).toBe(false); });
    expect(result.current.state).toBe("error");
    await act(async () => { expect(await result.current.flush()).toBe(true); });
    expect(save).toHaveBeenCalledTimes(2);
  });
  it("preserves all individual inventory input immediately and restores it after remount", async () => {
    const key = cmsDraftKey("instance", "test-instance");
    const initial = { serial_number: "", purchase_price: "", supplier: "", notes: "" };
    const entered = { serial_number: "SN-42", purchase_price: "0", supplier: "supplier", notes: "notes" };
    const first = renderHook(() => usePersistentArticleForm(key, initial, async () => false));
    act(() => first.result.current.setForm(entered));
    expect(readCmsDraft(key)?.form).toEqual(entered);
    first.unmount();
    const second = renderHook(() => usePersistentArticleForm(key, initial, async () => false));
    expect(second.result.current.form).toEqual(entered);
    await act(async () => { await second.result.current.flush(); });
    expect(readCmsDraft(key)?.form).toEqual(entered);
  });
});