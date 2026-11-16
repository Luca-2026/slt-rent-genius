// Display-name overrides for used machines (extends raw model names with e.g. working height).
// Keys must match the exact `model` field stored in the `used_machines` table.

export const usedMachineDisplayNames: Record<string, string> = {
  "ZS0607AC-Li Scherenarbeitsbühne": "ZS0607AC-Li Scherenarbeitsbühne (8m Arbeitshöhe)",
  "ZMP09J Mastbühne": "ZMP09J Mastbühne (11,2m Arbeitshöhe)",
  "HR12LE Lithium-Akku-Gelenkteleskoparbeitsbühne":
    "HR12LE Lithium-Akku-Gelenkteleskoparbeitsbühne (12m Arbeitshöhe)",
};

export function getUsedMachineDisplayModel(model: string | null | undefined): string {
  if (!model) return "";
  return usedMachineDisplayNames[model] || model;
}

type UsedArticleName = { model?: string | null; manufacturer?: string | null };

/** A maintained manufacturer/article name remains visible when there is no model. */
export function getUsedMachineHeading(machine: UsedArticleName): string {
  return getUsedMachineDisplayModel(machine.model?.trim()) || machine.manufacturer?.trim() || "";
}

export function getUsedMachineName(machine: UsedArticleName): string {
  return [machine.manufacturer?.trim(), getUsedMachineDisplayModel(machine.model?.trim())].filter(Boolean).join(" ");
}

/** Keep legacy model-only matches alongside the names used by sales catalogue lines. */
export function usedMachineCategoryRows(machines: (UsedArticleName & { category: string | null })[]) {
  return machines.flatMap((machine) => Array.from(new Set([
    machine.model?.trim(),
    [machine.manufacturer?.trim(), machine.model?.trim()].filter(Boolean).join(" "),
    getUsedMachineName(machine),
  ].filter((name): name is string => Boolean(name)))).map((name) => ({ name, category: machine.category })));
}
