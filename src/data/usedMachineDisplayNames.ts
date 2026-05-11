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
