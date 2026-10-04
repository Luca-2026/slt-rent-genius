import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { isSigningRoute, registerSigningSurface } from "@/lib/signingOverlays";

afterEach(() => { cleanup(); localStorage.clear(); });

describe("signing overlays", () => {
  it("only gates offer acceptance routes, including trailing slashes", () => {
    expect(isSigningRoute("/angebot/test-token")).toBe(true);
    expect(isSigningRoute("/angebot/test-token/")).toBe(true);
    for (const path of ["/", "/angebote", "/angebot", "/zahlung/test", "/mieten"]) {
      expect(isSigningRoute(path)).toBe(false);
    }
  });

  it("keeps suppression until the last signature pad closes; release is idempotent", () => {
    const releaseCustomer = registerSigningSurface();
    const releaseStaff = registerSigningSurface();
    expect(document.documentElement.hasAttribute("data-slt-signing")).toBe(true);
    releaseCustomer();
    releaseCustomer();
    expect(document.documentElement.hasAttribute("data-slt-signing")).toBe(true);
    releaseStaff();
    expect(document.documentElement.hasAttribute("data-slt-signing")).toBe(false);
  });

  it("hides cookie banner before an offer signature loads, without saving consent", () => {
    render(<MemoryRouter initialEntries={["/angebot/test-token"]}><CookieConsentBanner /></MemoryRouter>);
    expect(screen.queryByText("Cookie-Einstellungen")).not.toBeInTheDocument();
    expect(localStorage.getItem("slt_cookie_consent")).toBeNull();
  });

  it("restores undecided cookies after delivery/return signing closes", () => {
    render(<MemoryRouter initialEntries={["/b2b/rueckgabeprotokolle"]}><CookieConsentBanner /></MemoryRouter>);
    expect(screen.getByText("Cookie-Einstellungen")).toBeVisible();
    let release: () => void = () => {};
    act(() => { release = registerSigningSurface(); });
    expect(screen.queryByText("Cookie-Einstellungen")).not.toBeInTheDocument();
    act(() => { window.dispatchEvent(new Event("open-cookie-settings")); });
    expect(screen.queryByText("Cookie-Einstellungen")).not.toBeInTheDocument();
    act(() => { release(); });
    expect(screen.getByText("Cookie-Einstellungen")).toBeVisible();
    expect(localStorage.getItem("slt_cookie_consent")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Alle ablehnen" }));
    act(() => { release = registerSigningSurface(); });
    act(() => { release(); });
    expect(screen.queryByText("Cookie-Einstellungen")).not.toBeInTheDocument();
  });
});