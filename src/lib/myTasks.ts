/**
 * „Meine Aufgaben": persönlich zugewiesene Aufgaben plus offene Standort-Aufgaben
 * (ohne Zuweisung, z. B. Schilderarbeiten) des eigenen Standorts.
 * Mülheim an der Ruhr ist mit Krefeld zusammengelegt und teilt dessen Aufgaben.
 */
export interface MyTaskCandidate { assigned_to: string | null; status: string; location: string | null }

export function taskLocationKey(raw: string | null | undefined): "krefeld" | "bonn" | null {
  const v = (raw ?? "").trim().toLowerCase();
  if (v.includes("bonn")) return "bonn";
  if (v.includes("krefeld") || v.includes("lheim") || v.includes("mulheim")) return "krefeld";
  return null;
}

export function isMyTask(task: MyTaskCandidate, userId: string | null | undefined, staffLocation: string | null | undefined): boolean {
  if (task.status === "done") return false;
  if (userId && task.assigned_to === userId) return true;
  if (task.assigned_to || task.status === "draft") return false;
  const mine = taskLocationKey(staffLocation);
  return !!mine && taskLocationKey(task.location) === mine;
}
