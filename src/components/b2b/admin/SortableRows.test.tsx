import { describe, it, expect } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SortableRows, moveItem } from "./SortableRows";
import { orderSpecs } from "@/lib/specOrder";

function Harness() {
  const [items, setItems] = useState(["A", "B", "C"]);
  return (
    <>
      <SortableRows items={items} onReorder={setItems} renderRow={(it) => <span>{it}</span>} />
      <output data-testid="order">{items.join(",")}</output>
    </>
  );
}

const dt = () => ({ setData: () => {}, getData: () => "", effectAllowed: "", dropEffect: "" });

describe("SortableRows", () => {
  it("verschiebt per Drag & Drop über den Griff", () => {
    render(<Harness />);
    const rows = screen.getAllByTestId("sortable-row");
    fireEvent.mouseDown(screen.getByLabelText("Zeile 3 verschieben"));
    expect(rows[2].getAttribute("draggable")).toBe("true");
    fireEvent.dragStart(rows[2], { dataTransfer: dt() });
    fireEvent.dragOver(rows[0], { dataTransfer: dt() });
    fireEvent.drop(rows[0], { dataTransfer: dt() });
    expect(screen.getByTestId("order").textContent).toBe("C,A,B");
  });

  it("Zeilen sind ohne Griff nicht ziehbar (Texteingaben bleiben bedienbar)", () => {
    render(<Harness />);
    expect(screen.getAllByTestId("sortable-row")[0].getAttribute("draggable")).toBe("false");
  });

  it("Pfeiltasten am Griff verschieben ebenfalls", () => {
    render(<Harness />);
    fireEvent.keyDown(screen.getByLabelText("Zeile 1 verschieben"), { key: "ArrowDown" });
    expect(screen.getByTestId("order").textContent).toBe("B,A,C");
  });

  it("moveItem / orderSpecs", () => {
    expect(moveItem([1, 2, 3], 0, 2)).toEqual([2, 3, 1]);
    // jsonb sortiert kurze Schlüssel zuerst – spec_order stellt die CMS-Reihenfolge wieder her
    const fromDb = { Norm: "x", Material: "y", Arbeitshöhe: "z" };
    expect(Object.keys(orderSpecs(fromDb, ["Arbeitshöhe", "Norm"]))).toEqual(["Arbeitshöhe", "Norm", "Material"]);
  });
});
