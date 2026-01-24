import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

export interface TrailerFilterState {
  search: string;
  types: string[];
  braking: string[];
  axles: string[];
}

interface TrailerFilterProps {
  onFilterChange: (filters: TrailerFilterState) => void;
}

const typeFilters = [
  { id: "geschlossen", label: "Geschlossen (Kasten/Plane)" },
  { id: "baumaschine", label: "Baumaschinen" },
  { id: "autotransport", label: "Autotransport" },
  { id: "motorrad", label: "Motorrad" },
  { id: "laubgitter", label: "Laubgitter" },
  { id: "urlaub", label: "Urlaub" },
];

const brakingFilters = [
  { id: "gebremst", label: "Gebremst" },
  { id: "ungebremst", label: "Ungebremst" },
];

const axleFilters = [
  { id: "einachser", label: "Einachser" },
  { id: "zweiachser", label: "Zweiachser" },
];

export function TrailerFilter({ onFilterChange }: TrailerFilterProps) {
  const [filters, setFilters] = useState<TrailerFilterState>({
    search: "",
    types: [],
    braking: [],
    axles: [],
  });

  const updateFilters = (newFilters: Partial<TrailerFilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const toggleFilter = (category: "types" | "braking" | "axles", value: string) => {
    const current = filters[category];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilters({ [category]: updated });
  };

  const clearAllFilters = () => {
    const cleared = { search: "", types: [], braking: [], axles: [] };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters =
    filters.search || filters.types.length > 0 || filters.braking.length > 0 || filters.axles.length > 0;

  return (
    <div className="bg-background border border-border rounded-xl p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Anhänger suchen..."
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Type Filters */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Anhängertyp</p>
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

      {/* Braking Filters */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Bremse</p>
        <div className="flex flex-wrap gap-2">
          {brakingFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant={filters.braking.includes(filter.id) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => toggleFilter("braking", filter.id)}
            >
              {filter.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Axle Filters */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Achsen</p>
        <div className="flex flex-wrap gap-2">
          {axleFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant={filters.axles.includes(filter.id) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => toggleFilter("axles", filter.id)}
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
