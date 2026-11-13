import { describe, expect, it } from "vitest";
import { appendOfferPosition, OFFER_TIME_OPTIONS } from "@/components/b2b/inquiries/offerEditorRules";
import { groupedIndices, orderItemsByGroups, type OfferGroup } from "@/components/b2b/inquiries/offerMath";

describe("Angebots-Uhrzeiten", () => {
  it("bietet genau alle 15-Minuten-Zeiten von 00:00 bis 23:45", () => {
    expect(OFFER_TIME_OPTIONS).toHaveLength(96);
    expect(OFFER_TIME_OPTIONS.slice(32, 36)).toEqual(["08:00", "08:15", "08:30", "08:45"]);
    expect(OFFER_TIME_OPTIONS[95]).toBe("23:45");
    expect(OFFER_TIME_OPTIONS).not.toContain("08:05");
    expect(OFFER_TIME_OPTIONS.every(t => Number(t.slice(3)) % 15 === 0)).toBe(true);
  });
});
describe("Neue Auftragsartikel immer zuletzt", () => {
  const groups: OfferGroup[] = [{ id: "bau", name: "Bau", source: "category", sort_order: 0 }, { id: "event", name: "Event", source: "category", sort_order: 1 }];
  it("bleibt trotz vorheriger Kategorie des neuen Artikels in der letzten Gruppe", () => {
    const items = [{ group_id: "bau", name: "Bagger" }, { group_id: "event", name: "Tisch" }];
    const added = appendOfferPosition(items, { group_id: "bau", name: "Neuer Bagger" }, groups);
    expect(added.map(i => i.name)).toEqual(["Bagger", "Tisch", "Neuer Bagger"]);
    expect(groupedIndices(groups, added).flatMap(g => g.indices)).toEqual([0, 1, 2]);
    expect(orderItemsByGroups(groups, added).map(i => i.name)).toEqual(["Bagger", "Tisch", "Neuer Bagger"]);
    expect(items).toHaveLength(2);
  });
  it("hängt auch bei leerer letzter Gruppe sichtbar zuletzt an", () => {
    const added = appendOfferPosition([{ name: "Bagger", group_id: "bau" }], { name: "Neu", group_id: undefined }, groups);
    expect(orderItemsByGroups(groups, added).map(i => i.name)).toEqual(["Bagger", "Neu"]);
  });
  it("hängt ohne Gruppen und bei mehreren neuen Artikeln immer am Ende an", () => {
    const one = appendOfferPosition([{ name: "Alt", group_id: undefined }], { name: "Neu 1", group_id: undefined }, []);
    const two = appendOfferPosition(one, { name: "Neu 2", group_id: undefined }, []);
    expect(orderItemsByGroups([], two).map(i => i.name)).toEqual(["Alt", "Neu 1", "Neu 2"]);
  });
});