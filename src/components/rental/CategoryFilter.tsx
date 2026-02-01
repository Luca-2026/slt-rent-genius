import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface FilterSection {
  id: string;
  label: string;
  options: { id: string; label: string; sublabel?: string }[];
  defaultExpanded?: boolean;
}

export interface CategoryFilterState {
  search: string;
  filters: Record<string, string[]>;
}

interface CategoryFilterProps {
  searchPlaceholder: string;
  sections: FilterSection[];
  onFilterChange: (filters: CategoryFilterState) => void;
  variant?: "badges" | "accordion";
}

export function CategoryFilter({ 
  searchPlaceholder, 
  sections, 
  onFilterChange,
  variant = "badges"
}: CategoryFilterProps) {
  const [filters, setFilters] = useState<CategoryFilterState>({
    search: "",
    filters: {},
  });
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    sections.reduce((acc, section) => ({ ...acc, [section.id]: section.defaultExpanded ?? true }), {})
  );

  const updateFilters = (newFilters: Partial<CategoryFilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const toggleFilter = (sectionId: string, value: string) => {
    const current = filters.filters[sectionId] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilters({ filters: { ...filters.filters, [sectionId]: updated } });
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const clearAllFilters = () => {
    const cleared = { search: "", filters: {} };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const activeFilterCount = Object.values(filters.filters).reduce(
    (acc, arr) => acc + arr.length, 0
  );

  const hasActiveFilters = filters.search || activeFilterCount > 0;

  if (variant === "accordion") {
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
              placeholder={searchPlaceholder}
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10 bg-background border-border focus:border-primary"
            />
          </div>

          {/* Filter Sections */}
          {sections.map((section) => (
            <div key={section.id} className="border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium text-sm text-headline">{section.label}</span>
                <div className="flex items-center gap-2">
                  {(filters.filters[section.id]?.length || 0) > 0 && (
                    <span className="bg-accent text-accent-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                      {filters.filters[section.id].length}
                    </span>
                  )}
                  {expandedSections[section.id] ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>
              {expandedSections[section.id] && (
                <div className="p-3 space-y-2 bg-background">
                  {section.options.map((option) => (
                    <label
                      key={option.id}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                        filters.filters[section.id]?.includes(option.id)
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted/50 border border-transparent"
                      )}
                    >
                      <Checkbox
                        checked={filters.filters[section.id]?.includes(option.id)}
                        onCheckedChange={() => toggleFilter(section.id, option.id)}
                        className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <div>
                        <span className="text-sm text-body block">{option.label}</span>
                        {option.sublabel && (
                          <span className="text-xs text-muted-foreground">{option.sublabel}</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Badge variant (default)
  return (
    <div className="bg-background border border-border rounded-xl p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Filter Sections */}
      {sections.map((section) => (
        <div key={section.id}>
          <p className="text-sm font-medium text-foreground mb-2">{section.label}</p>
          <div className="flex flex-wrap gap-2">
            {section.options.map((option) => (
              <Badge
                key={option.id}
                variant={filters.filters[section.id]?.includes(option.id) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/90 transition-colors"
                onClick={() => toggleFilter(section.id, option.id)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>
      ))}

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
