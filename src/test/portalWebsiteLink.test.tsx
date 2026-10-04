import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { StaffNav, STAFF_NAV_FOOTER, itemHref } from "@/components/b2b/StaffNav";
import { PUBLIC_ORIGIN } from "@/lib/portalDomain";

afterEach(cleanup);

describe("portal website navigation", () => {
  it("uses the public homepage rather than the portal root", () => {
    const item = STAFF_NAV_FOOTER.find((entry) => entry.label === "Zur Website");
    expect(item).toBeDefined();
    if (!item) throw new Error("Website navigation missing");
    expect(itemHref(item)).toBe(`${PUBLIC_ORIGIN}/`);
    expect(new URL(itemHref(item)).hostname).toBe("www.slt-rental.de");
  });

  it("renders the website link independently of the current portal path", () => {
    render(<MemoryRouter initialEntries={["/b2b/start"]}>
      <StaffNav isAdmin={false} canViewInventory={false} badges={{ rental: 0, sales: 0, todos: 0 }} />
    </MemoryRouter>);
    expect(screen.getByRole("link", { name: "Zur Website" })).toHaveAttribute("href", "https://www.slt-rental.de/");
    expect(screen.getByRole("link", { name: "Startseite" })).toHaveAttribute("href", "/b2b/start");
  });
});