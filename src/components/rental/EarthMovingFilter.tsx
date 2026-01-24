import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

export interface EarthMovingFilterState {
  search: string;
  types: string[];
  driveTypes: string[];
  weightRange: string[];
}

interface EarthMovingFilterProps {
  onFilterChange: (filters: EarthMovingFilterState) => void;
}

const typeFilters = [
  { id: "minibagger", label: "Minibagger" },
  { id: "radlader", label: "Radlader" },
  { id: "dumper", label: "Dumper" },
];

const driveTypeFilters = [
  { id: "diesel", label: "Diesel" },
  { id: "benzin", label: "Benzin" },
  { id: "elektro", label: "Elektro" },
];

const weightRangeFilters = [
  { id: "bis-1500", label: "Bis 1,5t" },
  { id: "1500-2500", label: "1,5t - 2,5t" },
  { id: "ab-2500", label: "Ab 2,5t" },
];

export function EarthMovingFilter({ onFilterChange }: EarthMovingFilterProps) {
  const [filters, setFilters] = useState<EarthMovingFilterState>({
    search: "",
    types: [],
    driveTypes: [],
    weightRange: [],
  });

  const updateFilters = (newFilters: Partial<EarthMovingFilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const toggleFilter = (category: "types" | "driveTypes" | "weightRange", value: string) => {
    const current = filters[category];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilters({ [category]: updated });
  };

  const clearAllFilters = () => {
    const cleared = { search: "", types: [], driveTypes: [], weightRange: [] };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters =
    filters.search || filters.types.length > 0 || filters.driveTypes.length > 0 || filters.weightRange.length > 0;

  return (
    <div className="bg-background border border-border rounded-xl p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Maschine suchen..."
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Type Filters */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Maschinentyp</p>
        <div className="flex flex-wrap gap-2">
          {typeFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant={filters.types.includes(filter.id) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => toggleFilter("types", filter.id)}
            >
              {filter.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Weight Range Filters */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Einsatzgewicht</p>
        <div className="flex flex-wrap gap-2">
          {weightRangeFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant={filters.weightRange.includes(filter.id) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => toggleFilter("weightRange", filter.id)}
            >
              {filter.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Drive Type Filters */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Antriebsart</p>
        <div className="flex flex-wrap gap-2">
          {driveTypeFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant={filters.driveTypes.includes(filter.id) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => toggleFilter("driveTypes", filter.id)}
            >
              {filter.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3 w-3" />
          Filter zurücksetzen
        </button>
      )}
    </div>
  );
}
