/**
 * Quoted CSV cell that cannot be interpreted as a spreadsheet formula.
 * Values starting with = + - @ (or tab/CR) get a leading apostrophe.
 */
export function csvCell(value: unknown): string {
  let s = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
