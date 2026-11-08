import { describe, expect, it } from "vitest";
import { localizeProductText } from "@/data/productPageContent";

const bonn = { name: "Bonn", email: "bonn@slt-rental.de" };
const muelheim = { name: "Mülheim an der Ruhr", email: "muelheim@slt-rental.de" };
const krefeld = { name: "Krefeld", email: "krefeld@slt-rental.de" };

describe("localizeProductText – Standortadressen", () => {
  it("ersetzt die Krefelder Adresse auf Bonn-Seiten durch die Bonner Adresse", () => {
    const out = localizeProductText(
      "Abholung am SLT-Hauptsitz, Anrather Straße 291, 47807 Krefeld – Mo–Fr 08:00–18:00 Uhr und Sa 10:00–14:30 Uhr.",
      bonn,
    );
    expect(out).toContain("Drachenburgstraße 8, 53179 Bonn");
    expect(out).not.toContain("Anrather Straße 291");
    expect(out).not.toContain("47807");
    expect(out).toContain("Mo–Do 07:00–16:30 Uhr und Fr 07:00–18:00 Uhr, Sa geschlossen");
    expect(out).not.toContain("08:00–18:00");
    expect(out).toContain("SLT-Standort Bonn");
    expect(out).not.toContain("SLT-Hauptsitz");
  });

  it("ersetzt die Krefelder Adresse auf Mülheim-Seiten durch die Mülheimer Adresse", () => {
    const out = localizeProductText(
      "Abholung am SLT-Hauptsitz, Anrather Straße 291, 47807 Krefeld.",
      muelheim,
    );
    expect(out).toContain("Ruhrorter Str. 122, 45478 Mülheim an der Ruhr");
    expect(out).toContain("SLT-Standort Mülheim an der Ruhr");
  });

  it("lässt Krefeld-Texte auf Krefeld-Seiten unverändert", () => {
    const input = "Abholung am SLT-Hauptsitz, Anrather Straße 291, 47807 Krefeld – Mo–Fr 08:00–18:00 Uhr und Sa 10:00–14:30 Uhr.";
    expect(localizeProductText(input, krefeld)).toBe(input);
  });

  it("bewahrt wahre Querverweise auf den Hauptsitz Krefeld", () => {
    const out = localizeProductText(
      "Der Grill wird aus unserem Hauptsitz Krefeld disponiert.",
      bonn,
    );
    expect(out).toContain("Hauptsitz Krefeld");
    expect(out).not.toContain("Hauptsitz Bonn");
  });

  it("ersetzt auch die Bonner Adresse, wenn ein Text auf Mülheim läuft", () => {
    const out = localizeProductText(
      "Übergabe an der Filiale Bonn, Drachenburgstraße 8, 53179 Bonn.",
      muelheim,
    );
    expect(out).toContain("Ruhrorter Str. 122, 45478 Mülheim an der Ruhr");
    expect(out).not.toContain("53179");
  });

  it("ersetzt nackte Straßenangaben ohne PLZ", () => {
    const out = localizeProductText("Abholung Anrather Straße 291.", bonn);
    expect(out).toBe("Abholung Drachenburgstraße 8.");
  });
});
