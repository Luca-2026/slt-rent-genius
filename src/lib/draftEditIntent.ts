/**
 * Entscheidet, ob ein Ereignis im Angebots-/Rechnungsformular eine echte Eingabe ist.
 * Nur dann darf ein Server-Entwurf entstehen – Öffnen, Scrollen, Ansicht umschalten
 * oder PDF-Vorschau erzeugen keinen Entwurf. Bereiche mit data-draft-neutral zählen nie.
 */
const EDIT_SELECTOR = [
  "input", "textarea", "select", "button",
  "[role=checkbox]", "[role=switch]", "[role=radio]", "[role=combobox]",
  "[role=option]", "[role=slider]", "[role=spinbutton]", "[contenteditable=true]",
].join(",");

const ACTIVATION_KEYS = new Set(["Enter", " ", "ArrowUp", "ArrowDown"]);

export function isDraftEditEvent(target: EventTarget | null, kind: "pointer" | "key" | "input", key?: string): boolean {
  const el = target as Element | null;
  if (!el || typeof (el as Element).closest !== "function") return false;
  if (el.closest("[data-draft-neutral]")) return false;
  if (kind === "input") return true;
  const control = el.closest(EDIT_SELECTOR);
  if (!control) return false;
  if (kind === "key") {
    const isText = control.matches("input, textarea, [contenteditable=true]");
    if (isText) return false; // Tippen wird über das input-Ereignis erfasst
    return key !== undefined && ACTIVATION_KEYS.has(key);
  }
  return true;
}
