import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadCustomerDocuments, openCustomerDocument } from "./customerDocuments";

const mocks = vi.hoisted(() => ({ from: vi.fn(), storage: vi.fn(), viewer: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: mocks.from } }));
vi.mock("@/lib/openStorageDocument", () => ({ openStorageDocument: mocks.storage }));
vi.mock("@/utils/invoiceViewer", () => ({ openInvoiceInNewWindow: mocks.viewer }));
const rows: Record<string, unknown[]> = {};
const filters: [string, string, unknown][] = [];
beforeEach(() => {
  vi.clearAllMocks(); filters.length = 0;
  for (const key of Object.keys(rows)) delete rows[key];
  mocks.from.mockImplementation((table: string) => {
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn((field, value) => { filters.push([table, field, value]); return query; }),
      in: vi.fn((field, value) => { filters.push([table, field, value]); return query; }),
      single: vi.fn(() => Promise.resolve({ data: rows[table]?.[0] ?? {}, error: null })),
      then: (resolve: (data: unknown) => unknown) => Promise.resolve({ data: rows[table] ?? [], error: null }).then(resolve),
    };
    return query;
  });
});
describe("customer document evidence", () => {
  it("collects rental and sales PDFs, original offers, AB history, invoices and protocols", async () => {
    rows.rental_inquiries = [{ id: "r1", offer_number: "A1", offer_file_url: "offer.pdf", original_accepted_offer: { offer_file_url: "original.pdf" } }];
    rows.sales_inquiries = [{ id: "s1", order_confirmation_file_url: "sales-ab.pdf" }];
    rows.inquiry_invoices = [{ id: "i1", status: "paid", file_path: "invoice.pdf" }, { id: "draft", status: "draft", file_url: "draft.pdf" }];
    rows.rental_order_confirmation_deliveries = [{ id: "h1", file_url: "ab-v1.pdf", version: 1 }];
    rows.b2b_delivery_notes = [{ id: "d1", file_url: "delivery.pdf" }];
    rows.b2b_return_protocols = [{ id: "ret1", file_url: "return.pdf" }];
    const result = await loadCustomerDocuments("customer-1");
    expect(result.map(d => d.url).sort()).toEqual(["ab-v1.pdf", "delivery.pdf", "invoice.pdf", "offer.pdf", "original.pdf", "return.pdf", "sales-ab.pdf"]);
    expect(filters).toContainEqual(["sales_inquiries", "crm_customer_id", "customer-1"]);
    expect(filters).toContainEqual(["inquiry_invoices", "sales_inquiry_id", ["s1"]]);
    expect(mocks.from.mock.calls.map(([table]) => table)).not.toContain("b2b_profiles");
  });
  it("includes only the explicitly linked portal's documents and deduplicates shared protocol records", async () => {
    rows.rental_inquiries = [{ id: "r1" }];
    rows.b2b_profiles = [{ document_url: "business.pdf", sepa_mandate_url: "sepa.pdf" }];
    rows.b2b_offers = [{ id: "o1", file_url: "portal-offer.pdf" }];
    rows.b2b_invoices = [{ id: "i1", file_url: "credit.pdf", invoice_kind: "credit_note", status: "open" }];
    rows.b2b_delivery_notes = [{ id: "d1", file_url: "delivery.pdf?token=old" }];
    const result = await loadCustomerDocuments("customer-1", "profile-1");
    expect(result).toHaveLength(5);
    expect(filters).toContainEqual(["b2b_profiles", "id", "profile-1"]);
    expect(filters).toContainEqual(["b2b_offers", "b2b_profile_id", "profile-1"]);
  });
  it("renews expired signed PDF links using the actual bucket", async () => {
    const url = "https://storage.example/storage/v1/object/sign/b2b-invoices/ab.pdf?token=expired";
    await openCustomerDocument({ id: "1", label: "AB", date: null, url });
    expect(mocks.storage).toHaveBeenCalledWith(url, "b2b-invoices");
    expect(mocks.viewer).not.toHaveBeenCalled();
  });
  it("keeps legacy HTML on the sanitized print-to-PDF path", async () => {
    await openCustomerDocument({ id: "1", label: "Protokoll", date: null, url: "legacy.html" });
    expect(mocks.viewer).toHaveBeenCalledWith("legacy.html", "Protokoll");
    expect(mocks.storage).not.toHaveBeenCalled();
  });
});