import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RejectInquiryDialog } from "../RejectInquiryDialog";

const invoke = vi.hoisted(() => vi.fn(async () => ({ data: { success: true, email_sent: true }, error: null })));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke } } }));
vi.mock("../InquiryProductCombobox", () => ({
  pickCatalogImage: () => undefined,
  InquiryProductCombobox: ({ onSelect }: { onSelect: (p: unknown, name: string) => void }) => (
    <button type="button" onClick={() => onSelect({ slug: "minibagger-2t", category: "bagger", images: [], price_per_day: "ab 99 €" }, "2t Minibagger")}>
      Alternative wählen
    </button>
  ),
}));

const items = [
  { name: "MS01 Kabellöffel 15cm Symlock", quantity: 1 },
  { name: "1t Minibagger", quantity: 1 },
];

afterEach(cleanup);

describe("RejectInquiryDialog", () => {
  it("sendet je Artikel Verfügbarkeit und Alternative", async () => {
    render(<RejectInquiryDialog inquiryType="rental" inquiryId="00000000-0000-0000-0000-000000000001" customerEmail="k@example.com" location="Krefeld" items={items} onDone={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Ablehnen/ }));
    expect(screen.getByText("MS01 Kabellöffel 15cm Symlock")).toBeTruthy();
    expect(screen.getByText("1t Minibagger")).toBeTruthy();

    const groups = screen.getAllByRole("group");
    fireEvent.click(groups[0].querySelectorAll("button")[1]); // Löffel verfügbar
    fireEvent.click(screen.getAllByLabelText(/Alternativartikel vorschlagen/)[0]); // nur noch beim Bagger
    fireEvent.click(screen.getByText("Alternative wählen"));
    fireEvent.click(screen.getByRole("button", { name: /Ablehnen & Absage senden/ }));

    await waitFor(() => expect(invoke).toHaveBeenCalled());
    const body = (invoke.mock.calls[0] as unknown as [string, { body: { items: { index: number; available: boolean; alternative: { name: string } | null }[] } }])[1].body;
    expect(body.items).toHaveLength(2);
    expect(body.items[0]).toMatchObject({ index: 0, available: true, alternative: null });
    expect(body.items[1]).toMatchObject({ index: 1, available: false });
    expect(body.items[1].alternative?.name).toBe("2t Minibagger");
  });

  it("sperrt die Absage, wenn alle Artikel verfügbar sind", () => {
    render(<RejectInquiryDialog inquiryType="rental" inquiryId="00000000-0000-0000-0000-000000000001" customerEmail="k@example.com" location="Krefeld" items={items} onDone={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Ablehnen/ }));
    for (const g of screen.getAllByRole("group")) fireEvent.click(g.querySelectorAll("button")[1]);
    expect((screen.getByRole("button", { name: /Ablehnen & Absage senden/ }) as HTMLButtonElement).disabled).toBe(true);
  });
});
