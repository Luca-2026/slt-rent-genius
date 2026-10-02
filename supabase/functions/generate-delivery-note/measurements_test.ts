import { parseProtocolMeasurements, measurementRows } from "../_shared/protocolMeasurements.ts";

Deno.test("optional readings appear only when selected", () => {
  const [vehicle, machine] = parseProtocolMeasurements([
    { item_name: "Fahrzeug", mileage: "12345", operating_hours: "", fuel_level: "" },
    { item_name: "Bagger", mileage: "", operating_hours: "12,5", fuel_level: "halb" },
  ]);
  if (measurementRows(vehicle).length !== 1 || measurementRows(vehicle)[0].value !== "12345 km") throw new Error("Mileage row missing");
  if (measurementRows(machine).length !== 2) throw new Error("Machine rows incorrect");
  if (parseProtocolMeasurements(undefined).length !== 0) throw new Error("Old protocols must remain supported");
});

Deno.test("rejects empty or invalid selected readings", () => {
  for (const value of [{ item_name: "Bagger", mileage: "" }, { item_name: "Bagger", mileage: "-2" }, { item_name: "Bagger", fuel_level: "invalid" }]) {
    let failed = false;
    try { parseProtocolMeasurements([value]); } catch { failed = true; }
    if (!failed) throw new Error("Invalid reading accepted");
  }
});