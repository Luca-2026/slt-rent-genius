import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface EarthMovingFilterState {
  search: string;
  types: string[];
  driveTypes: string[];
  weightRange: string[];
}

interface EarthMovingFilterProps {
  onFilterChange: (filters: EarthMovingFilterState) => void;
}

export function EarthMovingFilter({ onFilterChange }: EarthMovingFilterProps) {
  const { t } = useTranslation();

  const typeFilters = [
    { id: "minibagger", label: t("earthFilter.minibagger") },
    { id: "radlader", label: t("earthFilter.radlader") },
    { id: "dumper", label: t("earthFilter.dumper") },
  ];

  const driveTypeFilters = [
    { id: "diesel", label: t("earthFilter.diesel") },
    { id: "benzin", label: t("earthFilter.benzin") },
    { id: "elektro", label: t("earthFilter.elektro") },
  ];

  const weightRangeFilters = [
    { id: "bis-1500", label: t("earthFilter.bis1500") },
    { id: "1500-2500", label: t("earthFilter.1500bis2500") },
    { id: "ab-2500", label: t("earthFilter.ab2500") },
  ];

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
          placeholder={t("earthFilter.searchPlaceholder")}
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Type Filters */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">{t("earthFilter.machineType")}</p>
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
        <p className="text-sm font-medium text-foreground mb-2">{t("earthFilter.operatingWeight")}</p>
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
        <p className="text-sm font-medium text-foreground mb-2">{t("earthFilter.driveType")}</p>
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
          {t("earthFilter.reset")}
        </button>
      )}
    </div>
  );
}
