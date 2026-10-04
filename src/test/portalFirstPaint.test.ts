import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { portalFirstPaintHead } from "../../scripts/portalFirstPaint";

function initialPage(host: string, path = "/") {
  return new JSDOM(`<!doctype html><html><head>${portalFirstPaintHead()}</head><body><div id="root"><div data-prerender-hero>Website fallback</div><form>Portal login</form></div></body></html>`, {
    url: `https://${host}${path}`,
    runScripts: "dangerously",
  });
}

describe("portal first paint", () => {
  it.each(["/", "/b2b/login/", "/b2b/anfrage-rechnungen/"])("hides only the fallback on the portal at %s", (path) => {
    const page = initialPage("app.slt-rental.de", path);
    const { document } = page.window;
    const fallback = document.querySelector("[data-prerender-hero]");
    const form = document.querySelector("form");
    expect(document.documentElement.hasAttribute("data-portal-first-paint")).toBe(true);
    if (!fallback || !form) throw new Error("Test elements missing");
    expect(page.window.getComputedStyle(fallback).display).toBe("none");
    expect(page.window.getComputedStyle(form).display).not.toBe("none");
    page.window.close();
  });

  it.each(["www.slt-rental.de", "slt-rental.de", "localhost", "app.slt-rental.de.example.com"])("leaves public content unchanged on %s", (host) => {
    const page = initialPage(host);
    const fallback = page.window.document.querySelector("[data-prerender-hero]");
    if (!fallback) throw new Error("Test fallback missing");
    expect(page.window.document.documentElement.hasAttribute("data-portal-first-paint")).toBe(false);
    expect(page.window.getComputedStyle(fallback).display).not.toBe("none");
    page.window.close();
  });
});