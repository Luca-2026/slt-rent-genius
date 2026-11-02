import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { processOfferFollowups } from "../../supabase/functions/_shared/offer-followup-delivery";
vi.mock("../../supabase/functions/_shared/order-code.ts", () => ({ codedSubject: async (_: unknown, subject: string) => subject }));
vi.mock("../../supabase/functions/_shared/salutation.ts", () => ({ resolveAddressForm: async () => "du", byForm: (_: string, du: string) => du, salutationLine: () => "Guten Tag" }));
const state = { status: "active", inquiryStatus: "offer_sent", email: "luca@sandhoff.org", sent: false, fail: false, last: null as string | null };
const dispatch = vi.fn();
function service() {
  return {
    rpc: async () => ({ data: "2099-11-12T10:00:00Z" }),
    from: (table: string) => {
      let write = false;
      const result = () => {
        if (table === "offer_followup_settings") return { data: null };
        if (table === "offer_acceptance_links") return { data: [{ id: "link", status: state.status, inquiry_table: "rental_inquiries", inquiry_id: "inq", offer_number: "TEST", customer_email: state.email, dispatched_at: "2026-11-01T10:00:00Z", token: "token", decline_reason: "price" }] };
        if (table === "rental_inquiries") return { data: { id: "inq", status: state.inquiryStatus, offer_number: "TEST", location: "krefeld", customer_name: "TEST" } };
        if (table === "offer_followup_deliveries") return { data: state.last ? [{ status: "sent", kind: "followup", sent_at: state.last }] : [] };
        return { data: null };
      };
      const q: Record<string, any> = { then: (resolve: any) => Promise.resolve(result()).then(resolve) };
      for (const method of ["select", "eq", "in", "order", "limit"]) q[method] = () => q;
      q.upsert = async () => ({ error: null });
      q.update = () => { write = true; return q; };
      q.maybeSingle = async () => {
        if (table === "offer_acceptance_links") return { data: { status: state.status } };
        if (table === "offer_followup_deliveries") return { data: { id: "delivery", status: state.sent ? "sent" : "pending" } };
        return result();
      };
      const oldThen = q.then;
      q.then = (resolve: any) => write ? Promise.resolve({ error: null }).then(resolve) : oldThen(resolve);
      return q;
    },
  };
}
beforeEach(() => {
  state.status = "active"; state.inquiryStatus = "offer_sent"; state.email = "luca@sandhoff.org"; state.sent = false; state.last = null;
  vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-04T10:00:00Z"));
  vi.stubGlobal("Deno", { env: { get: (key: string) => key === "RESEND_API_KEY" ? "test-only" : undefined } });
  dispatch.mockReset().mockResolvedValue({ ok: true, json: async () => ({ id: "provider-test" }) });
  vi.stubGlobal("fetch", dispatch);
});
describe("Angebotsnachfragen und Ablehnungsversand", () => {
  it("sendet eine fällige Nachfrage ausschließlich an die Testadresse", async () => {
    expect(await processOfferFollowups(service(), "link")).toEqual({ sent: 1 });
    expect(JSON.parse(dispatch.mock.calls[0][1].body).to).toEqual(["luca@sandhoff.org"]);
  });
  it("verschickt ohne Freigabe nichts an produktive Kunden", async () => {
    state.email = "customer@example.com";
    expect(await processOfferFollowups(service())).toEqual({ sent: 0 });
    expect(dispatch).not.toHaveBeenCalled();
  });
  it("erinnert angenommene Aufträge nicht", async () => {
    state.inquiryStatus = "accepted";
    expect(await processOfferFollowups(service())).toEqual({ sent: 0 });
  });
  it("versendet dieselbe protokollierte Nachricht nicht doppelt", async () => {
    state.sent = true;
    expect(await processOfferFollowups(service())).toEqual({ sent: 0 });
    expect(dispatch).not.toHaveBeenCalled();
  });
  it("meldet Versandfehler nicht als erfolgreichen Versand", async () => {
    dispatch.mockResolvedValue({ ok: false });
    expect(await processOfferFollowups(service())).toEqual({ sent: 0 });
  });
  it("schickt Ablehnungsgrund an das Testpostfach statt Standortpostfach", async () => {
    state.status = "declined";
    expect(await processOfferFollowups(service(), "link")).toEqual({ sent: 1 });
    const mail = JSON.parse(dispatch.mock.calls[0][1].body);
    expect(mail.to).toEqual(["luca@sandhoff.org"]);
    expect(mail.subject).toContain("Preis zu hoch");
  });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });