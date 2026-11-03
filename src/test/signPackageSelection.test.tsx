import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SignPackageSelection } from "@/components/rental/SignPackageSelection";

vi.mock("@tanstack/react-query", () => ({ useQuery: () => ({ data: null }) }));
vi.mock("@/hooks/useCustomerType", () => ({ useCustomerType: () => ({ type: "private" }) }));
afterEach(cleanup);

describe("Paketwahl bei unvollständigem Wiederaufnahmezustand", () => {
  it.each([undefined, null])("stürzt ohne Adresse und Preisantwort nicht ab (%s)", missing => {
    const props = { value: "sorglos", onChange: vi.fn(), location: "krefeld", address: missing, quote: missing } as unknown as Parameters<typeof SignPackageSelection>[0];
    expect(() => render(<SignPackageSelection {...props} />)).not.toThrow();
  });
});