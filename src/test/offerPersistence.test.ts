import { describe, expect, it, vi } from "vitest";
import { persistOfferBeforeDispatch } from "../../supabase/functions/send-inquiry-offer/persistence";

describe("offer persistence before dispatch", () => {
  it("does not dispatch or replace links when inventory rejects storage", async () => {
    const dispatch = vi.fn();
    const replaceLinks = vi.fn();
    const run = async () => {
      await persistOfferBeforeDispatch(async () => ({ data: null, error: { message: "Nicht genügend Halteverbotsschilder-Sets verfügbar" } }));
      replaceLinks();
      dispatch();
    };
    await expect(run()).rejects.toThrow("nicht gespeichert und nicht versendet");
    expect(replaceLinks).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });
  it("rejects a concurrent change rather than sending a stale version", async () => {
    await expect(persistOfferBeforeDispatch(async () => ({ data: null, error: null }))).rejects.toThrow("inzwischen geändert");
  });
  it("finishes saving before dispatch", async () => {
    const order: string[] = [];
    await persistOfferBeforeDispatch(async () => {
      order.push("saved");
      return { data: { id: "order" }, error: null };
    });
    order.push("dispatch");
    expect(order).toEqual(["saved", "dispatch"]);
  });
});