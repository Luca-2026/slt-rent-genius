import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import fixture from "./aiImportFixture.json";

const invoke = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: (...a: unknown[]) => invoke(...a) },
    from: () => ({ select: () => ({ order: () => Promise.resolve({ data: [] }) }) }),
  },
}));
vi.mock("@/hooks/useCrmCustomers", () => ({
  useCrmCustomers: () => ({
    rows: [{ id: "crm-1", customer_kind: "b2c", company_name: null, first_name: "Sabine", last_name: "Müller", email: "SABINE.M@gmx.de", phone: null, street: "Weg 1", postal_code: "53111", city: "Bonn", location: "bonn" }],
    save: vi.fn(),
  }),
  crmCustomerLabel: (c: { first_name: string; last_name: string }) => `${c.first_name} ${c.last_name}`,
}));

import { AiInquiryImportDialog, reviewProblems, findCrmMatch, type ReviewState } from "../AiInquiryImportDialog";

const TEXT = "Lena: Guten Tag ... Anrufer: Sabine Müller, Kofferanhänger nächsten Samstag, sabine.m@gmx.de";

describe("KI-Anfrage-Import – Prüfansicht", () => {
  beforeEach(() => { invoke.mockReset(); localStorage.clear(); });

  it("füllt Felder aus der Auswertung, übernimmt CMS-Preis, erkennt Bestandskunde", async () => {
    invoke.mockResolvedValue({ data: fixture.lena, error: null });
    render(<AiInquiryImportDialog open onOpenChange={() => {}} onConfirm={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Anfragetext"), { target: { value: TEXT } });
    fireEvent.click(screen.getByRole("button", { name: /Auswerten/ }));

    await screen.findByText(/Bestandskunde gefunden/);
    expect(invoke).toHaveBeenCalledWith("parse-inquiry-text", { body: { text: TEXT } });
    expect(screen.getByDisplayValue("Sabine Müller")).toBeInTheDocument();
    expect(screen.getByDisplayValue("sabine.m@gmx.de")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2026-10-03")).toHaveValue("2026-10-03");
    expect(screen.getByText(/Offene Fragen/)).toBeInTheDocument();
    // Kofferanhänger 750 kg: Preis 25 € kommt aus den Systemdaten
    await waitFor(() => expect(screen.getByDisplayValue("25")).toBeInTheDocument());
    expect(screen.getByText("Preis aus dem CMS")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Übernehmen" }));
    expect(await screen.findByText(/Mit Bestandskunde verknüpft/)).toBeInTheDocument();
  });

  it("Varianten-Auswahl wechselt Artikel und Preis", async () => {
    invoke.mockResolvedValue({ data: fixture.lena, error: null });
    render(<AiInquiryImportDialog open onOpenChange={() => {}} onConfirm={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Anfragetext"), { target: { value: TEXT } });
    fireEvent.click(screen.getByRole("button", { name: /Auswerten/ }));
    const alt = await screen.findByRole("button", { name: "1500 kg Kofferanhänger" });
    fireEvent.click(alt);
    await waitFor(() => expect(alt.className).toContain("bg-primary"));
  });

  it("zeigt Serverfehler verständlich an und behält den Text", async () => {
    invoke.mockResolvedValue({ data: null, error: { message: "x", context: new Response(JSON.stringify({ error: "KI-Guthaben aufgebraucht." }), { status: 402 }) } });
    render(<AiInquiryImportDialog open onOpenChange={() => {}} />);
    fireEvent.change(screen.getByLabelText("Anfragetext"), { target: { value: TEXT } });
    fireEvent.click(screen.getByRole("button", { name: /Auswerten/ }));
    expect(await screen.findByText("KI-Guthaben aufgebraucht.")).toBeInTheDocument();
    expect(screen.getByLabelText("Anfragetext")).toHaveValue(TEXT);
  });

  it("Entwurf übersteht Schließen/Neuladen", async () => {
    invoke.mockResolvedValue({ data: fixture.lena, error: null });
    const { unmount } = render(<AiInquiryImportDialog open onOpenChange={() => {}} />);
    fireEvent.change(screen.getByLabelText("Anfragetext"), { target: { value: TEXT } });
    fireEvent.click(screen.getByRole("button", { name: /Auswerten/ }));
    await screen.findByDisplayValue("Sabine Müller");
    unmount();
    render(<AiInquiryImportDialog open onOpenChange={() => {}} />);
    expect(await screen.findByDisplayValue("Sabine Müller")).toBeInTheDocument();
  });
});

describe("Pflichtprüfung & Kundenabgleich", () => {
  const base: ReviewState = {
    source_text: "x", location: "bonn", customer_kind: "private", company_name: "", customer_name: "A",
    customer_email: "a@b.de", customer_phone: "", customer_street: "", customer_postal_code: "", customer_city: "",
    start_date: "2026-10-03", end_date: "2026-10-04", date_text: null, delivery: false,
    delivery_street: "", delivery_postal_code: "", delivery_city: "", notes: "", open_questions: [],
    crm_customer_id: null,
    lines: [{ key: "1", original_text: "x", confidence: "high", reason: null, options: [], product_name: "Stehtisch", product_slug: "stehtisch", quantity: 2, unit_price: 5, unit: "kalendertage", price_source: "cms" }],
  };
  it("vollständige Daten = keine Probleme", () => expect(reviewProblems(base)).toEqual([]));
  it("fehlender Preis, Standort, E-Mail und falscher Zeitraum werden gemeldet", () => {
    const p = reviewProblems({ ...base, location: "", customer_email: "kaputt", end_date: "2026-10-01", lines: [{ ...base.lines[0], unit_price: null }] });
    expect(p).toEqual(["Standort wählen", "gültige E-Mail", "Mietende liegt vor Mietbeginn", "Preis in Zeile 1"]);
  });
  it("Kundenabgleich per Telefon ignoriert Formatierung und +49", () => {
    const c = [{ id: "x", phone: "+49 228 987654", email: null }] as never;
    expect(findCrmMatch(c, "", "0228/987654")?.id).toBe("x");
    expect(findCrmMatch(c, "", "12")).toBeNull();
  });
});
