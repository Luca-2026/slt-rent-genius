import { describe, it, expect } from "vitest";
import { isDraftEditEvent } from "@/lib/draftEditIntent";

function dom(html: string) {
  const root = document.createElement("div");
  root.innerHTML = html;
  return root;
}

describe("isDraftEditEvent", () => {
  it("Klick auf Hintergrund/Scrollen zählt nicht", () => {
    const r = dom(`<div id="bg"><p id="t">Text</p></div>`);
    expect(isDraftEditEvent(r.querySelector("#t"), "pointer")).toBe(false);
  });
  it("PDF-Vorschau (neutral) zählt nicht", () => {
    const r = dom(`<div data-draft-neutral><button id="p"><span id="i">Vorschau</span></button></div>`);
    expect(isDraftEditEvent(r.querySelector("#i"), "pointer")).toBe(false);
  });
  it("Haken setzen zählt", () => {
    const r = dom(`<button role="checkbox" id="c"></button>`);
    expect(isDraftEditEvent(r.querySelector("#c"), "pointer")).toBe(true);
  });
  it("Tippen in ein Feld zählt", () => {
    const r = dom(`<input id="f" />`);
    expect(isDraftEditEvent(r.querySelector("#f"), "input")).toBe(true);
  });
  it("Tab-Taste zählt nicht", () => {
    const r = dom(`<button role="checkbox" id="c"></button>`);
    expect(isDraftEditEvent(r.querySelector("#c"), "key", "Tab")).toBe(false);
  });
});
