import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteServerDraft, saveServerDraft } from "../offerDraftStorage";

const fixture = vi.hoisted(() => ({ upsert: vi.fn(), remove: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: { getUser: async () => ({ data: { user: { id: "staff" } } }) },
  from: (table: string) => table === "staff_profiles"
    ? { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { first_name: "Test", last_name: "Staff" } }) }) }) }
    : { upsert: fixture.upsert, delete: () => ({ eq: fixture.remove }) },
} }));

beforeEach(() => {
  fixture.upsert.mockReset().mockResolvedValue({ error: null });
  fixture.remove.mockReset().mockResolvedValue({ error: null });
});

describe("shared document draft writes", () => {
  it("retains amendment agreement evidence in the server write", async () => {
    await saveServerDraft("amendment", "rental", "order", { agreementNote: "Verlängerung", agreedAt: "2026-11-20T17:00" });
    expect(fixture.upsert.mock.calls[0][0].data).toEqual({ agreementNote: "Verlängerung", agreedAt: "2026-11-20T17:00" });
  });
  it("reports rejected saves instead of claiming persistence", async () => {
    fixture.upsert.mockResolvedValueOnce({ error: { message: "Write failed" } });
    await expect(saveServerDraft("error", "sales", "order", {})).rejects.toThrow("Write failed");
    await expect(saveServerDraft("error", "sales", "order", { notes: "retry" })).resolves.toBeUndefined();
  });
  it("serializes later edits and deletes after pending writes", async () => {
    let release: ((result: { error: null }) => void) | undefined;
    fixture.upsert.mockImplementationOnce(() => new Promise(resolve => { release = resolve; }));
    const first = saveServerDraft("ordered", "rental", "order", { notes: "first" });
    await vi.waitFor(() => expect(fixture.upsert).toHaveBeenCalledTimes(1));
    const second = saveServerDraft("ordered", "rental", "order", { notes: "second" });
    const deleted = deleteServerDraft("ordered");
    expect(fixture.upsert).toHaveBeenCalledTimes(1);
    expect(fixture.remove).not.toHaveBeenCalled();
    if (!release) throw new Error("Expected the first write to be pending");
    release({ error: null });
    await Promise.all([first, second, deleted]);
    expect(fixture.upsert.mock.calls[1][0].data.notes).toBe("second");
    expect(fixture.remove).toHaveBeenCalledTimes(1);
    expect(fixture.remove.mock.invocationCallOrder[0]).toBeGreaterThan(fixture.upsert.mock.invocationCallOrder[1]);
  });
});