import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrailerFilterState {
  search: string;
  types: string[];
  braking: string[];
  weight: string[];
}

interface TrailerFilterProps {
  onFilterChange: (filters: TrailerFilterState) => void;
}

const typeFilters = [
  { id: "geschlossen", label: "Geschlossen", sublabel: "Koffer & Plane" },
  { id: "baumaschine", label: "Baumaschinen", sublabel: "Rampen & Mulden" },
  { id: "autotransport", label: "Autotransport", sublabel: "PKW & Motorrad" },
  { id: "laubgitter", label: "Laubgitter", sublabel: "Garten & Grünschnitt" },
  { id: "urlaub", label: "Urlaub", sublabel: "Camping & Freizeit" },
];

const brakingFilters = [
  { id: "gebremst", label: "Gebremst" },
  { id: "ungebremst", label: "Ungebremst" },
];

const weightFilters = [
  { id: "bis-750", label: "Bis 750 kg", min: 0, max: 750 },
  { id: "750-1500", label: "750 - 1.500 kg", min: 751, max: 1500 },
  { id: "1500-2500", label: "1.500 - 2.500 kg", min: 1501, max: 2500 },
  { id: "ab-2500", label: "Ab 2.500 kg", min: 2501, max: 99999 },
];

export function TrailerFilter({ onFilterChange }: TrailerFilterProps) {
  const [filters, setFilters] = useState<TrailerFilterState>({
    search: "",
    types: [],
    braking: [],
    weight: [],
  });
  
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    braking: false,
    weight: true,
  });

  const updateFilters = (newFilters: Partial<TrailerFilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const toggleFilter = (category: "types" | "braking" | "weight", value: string) => {
    const current = filters[category];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilters({ [category]: updated });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const clearAllFilters = () => {
    const cleared = { search: "", types: [], braking: [], weight: [] };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const activeFilterCount = 
    filters.types.length + filters.braking.length + filters.weight.length;

  const hasActiveFilters = filters.search || activeFilterCount > 0;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <span className="font-semibold text-headline text-sm">Filter</span>
          {activeFilterCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Zurücksetzen
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Anhänger suchen..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10 bg-background border-border focus:border-primary"
          />
        </div>

        {/* Weight Filter Section */}
        <div className="border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection("weight")}
            className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <span className="font-medium text-sm text-headline">Zul. Gesamtgewicht</span>
            <div className="flex items-center gap-2">
              {filters.weight.length > 0 && (
                <span className="bg-accent text-accent-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                  {filters.weight.length}
                </span>
              )}
              {expandedSections.weight ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </button>
          {expandedSections.weight && (
            <div className="p-3 space-y-2 bg-background">
              {weightFilters.map((filter) => (
                <label
                  key={filter.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                    filters.weight.includes(filter.id)
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted/50 border border-transparent"
                  )}
                >
                  <Checkbox
                    checked={filters.weight.includes(filter.id)}
                    onCheckedChange={() => toggleFilter("weight", filter.id)}
                    className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span className="text-sm text-body">{filter.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Type Filter Section */}
        <div className="border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection("type")}
            className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <span className="font-medium text-sm text-headline">Anhängertyp</span>
            <div className="flex items-center gap-2">
              {filters.types.length > 0 && (
                <span className="bg-accent text-accent-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                  {filters.types.length}
                </span>
              )}
              {expandedSections.type ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </button>
          {expandedSections.type && (
            <div className="p-3 space-y-2 bg-background">
              {typeFilters.map((filter) => (
                <label
                  key={filter.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                    filters.types.includes(filter.id)
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted/50 border border-transparent"
                  )}
                >
                  <Checkbox
                    checked={filters.types.includes(filter.id)}
                    onCheckedChange={() => toggleFilter("types", filter.id)}
                    className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div>
                    <span className="text-sm text-body block">{filter.label}</span>
                    <span className="text-xs text-muted-foreground">{filter.sublabel}</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Braking Filter Section */}
        <div className="border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection("braking")}
            className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <span className="font-medium text-sm text-headline">Bremse</span>
            <div className="flex items-center gap-2">
              {filters.braking.length > 0 && (
                <span className="bg-accent text-accent-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                  {filters.braking.length}
                </span>
              )}
              {expandedSections.braking ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </button>
          {expandedSections.braking && (
            <div className="p-3 space-y-2 bg-background">
              {brakingFilters.map((filter) => (
                <label
                  key={filter.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                    filters.braking.includes(filter.id)
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted/50 border border-transparent"
                  )}
                >
                  <Checkbox
                    checked={filters.braking.includes(filter.id)}
                    onCheckedChange={() => toggleFilter("braking", filter.id)}
                    className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span className="text-sm text-body">{filter.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export weight filter ranges for use in filtering logic
export const weightFilterRanges = weightFilters;
