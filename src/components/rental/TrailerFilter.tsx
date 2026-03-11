import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Search, X, Filter, ChevronDown, ChevronUp, Weight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export interface TrailerFilterState {
  search: string;
  types: string[];
  braking: string[];
  weight: string[];
  nutzlastRange: [number, number];
}

const NUTZLAST_MIN = 0;
const NUTZLAST_MAX = 3000;
const NUTZLAST_STEP = 50;

interface TrailerFilterProps {
  onFilterChange: (filters: TrailerFilterState) => void;
}

export function TrailerFilter({ onFilterChange }: TrailerFilterProps) {
  const { t } = useTranslation();

  const typeFilters = [
    { id: "geschlossen", label: t("trailerFilter.typeEnclosed"), sublabel: t("trailerFilter.typeEnclosedSub") },
    { id: "baumaschine", label: t("trailerFilter.typeConstruction"), sublabel: t("trailerFilter.typeConstructionSub") },
    { id: "autotransport", label: t("trailerFilter.typeCar"), sublabel: t("trailerFilter.typeCarSub") },
    { id: "laubgitter", label: t("trailerFilter.typeLeaf"), sublabel: t("trailerFilter.typeLeafSub") },
    { id: "urlaub", label: t("trailerFilter.typeVacation"), sublabel: t("trailerFilter.typeVacationSub") },
  ];

  const brakingFilters = [
    { id: "gebremst", label: t("trailerFilter.braked") },
    { id: "ungebremst", label: t("trailerFilter.unbraked") },
  ];

  const weightFilters = [
    { id: "bis-750", label: t("trailerFilter.upTo750"), min: 0, max: 750 },
    { id: "750-1500", label: t("trailerFilter.750to1500"), min: 751, max: 1500 },
    { id: "1500-2500", label: t("trailerFilter.1500to2500"), min: 1501, max: 2500 },
    { id: "ab-2500", label: t("trailerFilter.from2500"), min: 2501, max: 99999 },
  ];

  const [filters, setFilters] = useState<TrailerFilterState>({
    search: "",
    types: [],
    braking: [],
    weight: [],
    nutzlastRange: [NUTZLAST_MIN, NUTZLAST_MAX],
  });

  const [expandedSections, setExpandedSections] = useState({
    type: true,
    braking: false,
    weight: true,
    nutzlast: false,
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
    const cleared: TrailerFilterState = { search: "", types: [], braking: [], weight: [], nutzlastRange: [NUTZLAST_MIN, NUTZLAST_MAX] };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const isNutzlastActive = filters.nutzlastRange[0] !== NUTZLAST_MIN || filters.nutzlastRange[1] !== NUTZLAST_MAX;

  const activeFilterCount =
    filters.types.length + filters.braking.length + filters.weight.length + (isNutzlastActive ? 1 : 0);

  const hasActiveFilters = filters.search || activeFilterCount > 0;

  const formatKg = (v: number) => v >= NUTZLAST_MAX ? `${v}+ kg` : `${v} kg`;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <span className="font-semibold text-headline text-sm">{t("catFilters.filter")}</span>
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
            {t("catFilters.reset")}
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("trailerFilter.searchPlaceholder")}
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10 bg-background border-border focus:border-primary"
          />
        </div>

        {/* Nutzlast Slider */}
        <div className="border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection("nutzlast")}
            className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm text-headline">Nutzlast</span>
            </div>
            <div className="flex items-center gap-2">
              {isNutzlastActive && (
                <span className="bg-accent text-accent-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                  1
                </span>
              )}
              {expandedSections.nutzlast ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </button>
          {expandedSections.nutzlast && (
            <div className="p-4 bg-background space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatKg(filters.nutzlastRange[0])}</span>
                <span>{formatKg(filters.nutzlastRange[1])}</span>
              </div>
              <Slider
                value={filters.nutzlastRange}
                min={NUTZLAST_MIN}
                max={NUTZLAST_MAX}
                step={NUTZLAST_STEP}
                onValueChange={(value) => updateFilters({ nutzlastRange: value as [number, number] })}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground text-center">
                {isNutzlastActive
                  ? `${formatKg(filters.nutzlastRange[0])} – ${formatKg(filters.nutzlastRange[1])}`
                  : "Alle Nutzlasten"}
              </p>
            </div>
          )}
        </div>

        {/* Weight Filter Section */}
        <div className="border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection("weight")}
            className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <span className="font-medium text-sm text-headline">{t("trailerFilter.totalWeight")}</span>
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
            <span className="font-medium text-sm text-headline">{t("trailerFilter.trailerType")}</span>
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
            <span className="font-medium text-sm text-headline">{t("trailerFilter.brake")}</span>
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
export const weightFilterRanges = [
  { id: "bis-750", min: 0, max: 750 },
  { id: "750-1500", min: 751, max: 1500 },
  { id: "1500-2500", min: 1501, max: 2500 },
  { id: "ab-2500", min: 2501, max: 99999 },
];

/** Parse Nutzlast (kg) from product specifications string like "ca. 1.090 kg" */
export function parseNutzlast(product: { specifications?: Record<string, string> }): number | null {
  const val = product.specifications?.["Nutzlast"];
  if (!val) return null;
  const cleaned = val.replace(/[^0-9]/g, "");
  return cleaned ? Number(cleaned) : null;
}
