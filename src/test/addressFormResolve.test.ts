import { describe, it, expect } from "vitest";
import { resolveAddressForm, salutationLine } from "../../supabase/functions/_shared/salutation";

const fakeSvc = (rows: Record<string, { address_form: string } | null>) => ({
  from: () => {
    let key = "";
    const q: any = {
      select: () => q,
      eq: (col: string, v: string) => { key = `${col}:${v}`; return q; },
      limit: () => q,
      maybeSingle: async () => ({ data: rows[key] ?? null }),
    };
    return q;
  },
});

describe("Paket 10: Anredeform", () => {
  it("Kundenakte hat Vorrang vor der Anfrage", async () => {
    const svc = fakeSvc({ "id:c1": { address_form: "sie" } });
    expect(await resolveAddressForm(svc, { crm_customer_id: "c1", address_form: "du" })).toBe("sie");
  });
  it("Portalkunde über Portalprofil", async () => {
    const svc = fakeSvc({ "b2b_profile_id:p1": { address_form: "sie" } });
    expect(await resolveAddressForm(svc, { b2b_profile_id: "p1" })).toBe("sie");
  });
  it("ohne Kundenakte gilt der Wert der Anfrage, sonst Du", async () => {
    const svc = fakeSvc({});
    expect(await resolveAddressForm(svc, { address_form: "sie" })).toBe("sie");
    expect(await resolveAddressForm(svc, {})).toBe("du");
  });
  it("Anrede je Form", () => {
    expect(salutationLine({ address_form: "du", name: "Luca Sandhoff" })).toBe("Hallo Luca,");
    expect(salutationLine({ address_form: "sie", salutation: "herr", name: "Luca Sandhoff" })).toBe("Sehr geehrter Herr Sandhoff,");
  });
});
