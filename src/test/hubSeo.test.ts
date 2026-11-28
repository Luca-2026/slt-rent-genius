import { describe, expect, it } from "vitest";
import de from "@/i18n/locales/de.json";
import { HOME_SEO, locationHubH1, locationHubTitle } from "@/data/hubSeo";
import { ALL_ROUTES } from "@/data/seo-routes-rental";

describe("Startseite und Standort-Hubs: Prerender = React", () => {
  it("statische H1 der Startseite entspricht dem sichtbaren Hero-Text", () => {
    expect(HOME_SEO.h1).toBe(`${de.hero.title} ${de.hero.titleHighlight}`);
  });
  it("Prerender-Route der Startseite nutzt Titel, Description und H1 der React-Seite", () => {
    const home = ALL_ROUTES.find((r) => r.path === "/");
    expect(home?.title).toBe(HOME_SEO.title);
    expect(home?.description).toBe(HOME_SEO.description);
    expect(home?.h1).toBe(HOME_SEO.h1);
  });
  it("Standort-Hubs nutzen dieselbe Titel-/H1-Funktion", () => {
    for (const [id, name] of [["krefeld", "Krefeld"], ["bonn", "Bonn"], ["muelheim", "Mülheim an der Ruhr"]]) {
      const r = ALL_ROUTES.find((x) => x.path === `/mieten/${id}`);
      expect(r?.title).toBe(locationHubTitle(id));
      expect(r?.h1).toBe(locationHubH1(id));
      expect(r?.h1).toContain(name);
    }
  });
});
