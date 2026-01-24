import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Filter, X } from "lucide-react";

export interface WeightRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

const weightRanges: WeightRange[] = [
  { id: "all", label: "Alle Größen", min: 0, max: Infinity },
  { id: "mini", label: "Mini (bis 1t)", min: 0, max: 1000 },
  { id: "small", label: "Klein (1-2t)", min: 1000, max: 2000 },
  { id: "medium", label: "Mittel (2-3t)", min: 2000, max: 3000 },
  { id: "large", label: "Groß (3-5t)", min: 3000, max: 5000 },
  { id: "xlarge", label: "Sehr groß (5t+)", min: 5000, max: Infinity },
];

interface WeightFilterProps {
  selectedRange: string;
  onRangeChange: (rangeId: string) => void;
}

export function WeightFilter({ selectedRange, onRangeChange }: WeightFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentRange = weightRanges.find(r => r.id === selectedRange) || weightRanges[0];

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-background border-border hover:bg-muted"
      >
        <Filter className="h-4 w-4" />
        <span>{currentRange.label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 mt-2 z-50 bg-card border border-border rounded-lg shadow-lg min-w-[200px] py-2">
            {weightRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => {
                  onRangeChange(range.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left flex items-center justify-between hover:bg-muted transition-colors ${
                  selectedRange === range.id ? 'bg-primary/10 text-primary' : 'text-foreground'
                }`}
              >
                <span>{range.label}</span>
                {selectedRange === range.id && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Active Filter Badge */}
      {selectedRange !== "all" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRangeChange("all")}
          className="ml-2 h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Filter zurücksetzen
        </Button>
      )}
    </div>
  );
}

export { weightRanges };
