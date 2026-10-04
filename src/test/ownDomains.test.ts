import { describe, expect, it } from "vitest";
import { customDomainDestination } from "../lib/portalHosts";
import { authRedirectUrl } from "../lib/portalDomain";
import { recoveryLink, ownDomainAuthLink } from "../../supabase/functions/_shared/auth-links";
import { portalFirstPaintHead } from "../../scripts/portalFirstPaint";
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";

describe("own public domains", () => {
  it("routes customer signup and repeated confirmation to the portal login", () => {
    const signup = readFileSync("src/hooks/useAuth.tsx", "utf8");
    const confirmation = readFileSync("supabase/functions/resend-confirmation/index.ts", "utf8");
    expect(signup).toContain('authRedirectUrl("/b2b/login/")');
    expect(confirmation).toContain('redirectTo: `${PORTAL_AUTH_ORIGIN}/b2b/login/`');
    expect(confirmation).toContain("ownDomainAuthLink(data.properties.action_link)");
  });
  it("uses one direct recovery token for authorized customer invitations without website fallbacks", () => {
    const invitation = readFileSync("supabase/functions/invite-authorized-person/index.ts", "utf8");
    expect(invitation.match(/auth\.admin\.generateLink\(/g)).toHaveLength(1);
    expect(invitation).toContain("redirectTo: PASSWORD_RESET_URL");
    expect(invitation).toContain("recoveryLink(linkData?.properties ?? {})");
    expect(invitation).not.toContain("action_link");
    expect(invitation).not.toContain("www.slt-rental.de");
  });
  it.each([
    ["/", "https://www.slt-rental.de/"],
    ["/mieten/?ort=bonn", "https://www.slt-rental.de/mieten/?ort=bonn"],
    ["/b2b/passwort-zuruecksetzen/#access_token=fixture&type=recovery", "https://app.slt-rental.de/b2b/passwort-zuruecksetzen/#access_token=fixture&type=recovery"],
    ["/#access_token=fixture&type=recovery", "https://app.slt-rental.de/b2b/passwort-zuruecksetzen/#access_token=fixture&type=recovery"],
    ["/b2b/login/?next=tasks", "https://app.slt-rental.de/b2b/login/?next=tasks"],
  ])("redirects %s without losing parameters", (path, expected) => {
    expect(customDomainDestination(new URL(`https://slt-rent-genius.lovable.app${path}`))).toBe(expected);
  });
  it.each(["localhost", "www.slt-rental.de", "app.slt-rental.de", "id-preview--example.lovable.app", "slt-rent-genius.lovable.app.example.com"])("does not redirect %s", (host) => {
    expect(customDomainDestination(new URL(`https://${host}/`))).toBeNull();
  });
  it("creates direct portal recovery links with a single-use token", () => {
    const url = new URL(recoveryLink({ hashed_token: "test-only-hash" }));
    expect(url.origin).toBe("https://app.slt-rental.de");
    expect(url.pathname).toBe("/b2b/passwort-zuruecksetzen/");
    expect(url.searchParams.get("token_hash")).toBe("test-only-hash");
    expect(url.searchParams.get("type")).toBe("recovery");
    expect(() => recoveryLink({})).toThrow();
    expect(authRedirectUrl("/b2b/passwort-zuruecksetzen/")).toBe("https://app.slt-rental.de/b2b/passwort-zuruecksetzen/");
  });
  it("keeps provider verification intact and replaces legacy redirects", () => {
    const original = "https://auth.example.test/auth/v1/verify?token=fixture&type=recovery&redirect_to=" + encodeURIComponent("https://slt-rent-genius.lovable.app/b2b/passwort-zuruecksetzen/");
    const url = new URL(ownDomainAuthLink(original));
    expect(url.origin).toBe("https://auth.example.test");
    expect(url.searchParams.get("token")).toBe("fixture");
    expect(url.searchParams.get("redirect_to")).toBe("https://app.slt-rental.de/b2b/passwort-zuruecksetzen/");
  });
  it("redirects before app execution and hides legacy content while navigating", () => {
    const page = new JSDOM(`<html><head>${portalFirstPaintHead()}</head><body>Fallback</body></html>`, { url: "https://slt-rent-genius.lovable.app/b2b/login/", runScripts: "outside-only" });
    let destination = "";
    const script = page.window.document.querySelector("script")?.textContent;
    if (!script) throw new Error("Missing first-paint script");
    new Function("window", "document", script)({ location: { hostname: "slt-rent-genius.lovable.app", href: page.window.location.href, replace: (url: string) => { destination = url; } } }, page.window.document);
    expect(destination).toBe("https://app.slt-rental.de/b2b/login/");
    expect(page.window.getComputedStyle(page.window.document.body).display).toBe("none");
    page.window.close();
  });
});