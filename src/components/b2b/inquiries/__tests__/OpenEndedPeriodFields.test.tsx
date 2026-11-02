import { useState } from "react";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OpenEndedPeriodFields } from "../OpenEndedPeriodFields";
import type { OpenEndedUnit } from "@/lib/installments";

// Native selection exercises the controlled value contract without Radix pointer APIs in jsdom.
vi.mock("@/components/ui/select", () => ({
  Select: ({ value, onValueChange, children }: { value: string; onValueChange: (value: string) => void; children: React.ReactNode }) =>
    <select aria-label="Test unit" value={value} onChange={(e) => onValueChange(e.target.value)}>{children}</select>,
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => <option value={value}>{children}</option>,
}));

afterEach(cleanup);

function Fixture({ onChange }: { onChange: (unit: OpenEndedUnit, duration: number) => void }) {
  const [unit, setUnit] = useState<OpenEndedUnit>("monate");
  const [duration, setDuration] = useState(3);
  return <OpenEndedPeriodFields unit={unit} duration={duration} onChange={(u, d) => {
    setUnit(u); setDuration(d); onChange(u, d);
  }} />;
}

describe("Unbefristete Mietdauer auswählen", () => {
  for (const unit of ["arbeitstage", "kalendertage", "miettage"] as const) {
    it(`übernimmt ${unit} mit frei wählbarer Tagesdauer`, () => {
      const change = vi.fn();
      render(<Fixture onChange={change} />);
      fireEvent.change(screen.getByRole("combobox"), { target: { value: unit } });
      expect(change).toHaveBeenLastCalledWith(unit, 3);
      fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "90" } });
      expect(change).toHaveBeenLastCalledWith(unit, 90);
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "monate" } });
      expect(change).toHaveBeenLastCalledWith("monate", 60);
    });
  }
});