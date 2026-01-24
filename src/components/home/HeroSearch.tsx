import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Category mapping with search keywords
const categoryKeywords = [
  {
    id: "bagger-radlader",
    title: "Bagger & Radlader",
    keywords: ["bagger", "minibagger", "radlader", "kettenbagger", "mobilbagger", "erdbau", "aushub", "graben"],
  },
  {
    id: "verdichtung",
    title: "Verdichtung",
    keywords: ["rüttelplatte", "stampfer", "walze", "verdichtung", "boden"],
  },
  {
    id: "anhaenger",
    title: "Anhänger",
    keywords: ["anhänger", "pkw-anhänger", "kipper", "transporter", "maschinentransporter", "transport"],
  },
  {
    id: "hebebuehnen",
    title: "Hebebühnen & Arbeitsbühnen",
    keywords: ["hebebühne", "arbeitsbühne", "scherenbühne", "teleskopbühne", "gelenkbühne", "höhenarbeiten", "lift"],
  },
  {
    id: "buehnen-podeste",
    title: "Bühnen & Podeste",
    keywords: ["bühne", "podest", "laufsteg", "eventbühne", "stage"],
  },
  {
    id: "moebel-zelte",
    title: "Möbel & Zelte",
    keywords: ["zelt", "partyzelt", "pavillon", "bierzeltgarnitur", "stehtisch", "möbel", "tisch", "stuhl", "bank"],
  },
  {
    id: "geschirr",
    title: "Geschirr",
    keywords: ["geschirr", "teller", "glas", "gläser", "tasse", "schale", "besteck", "porzellan"],
  },
  {
    id: "besteck",
    title: "Besteck",
    keywords: ["besteck", "messer", "gabel", "löffel", "silber"],
  },
  {
    id: "huepfburgen",
    title: "Hüpfburgen",
    keywords: ["hüpfburg", "aufblasbar", "kinder", "spielen", "springburg"],
  },
  {
    id: "spezialeffekte",
    title: "Spezialeffekte",
    keywords: ["nebel", "nebelmaschine", "seifenblasen", "funken", "effekte", "fotobooth", "konfetti"],
  },
  {
    id: "led-spots",
    title: "LED Spots & Effektlicht",
    keywords: ["led", "spot", "moving head", "par", "scheinwerfer", "licht", "beleuchtung", "disco"],
  },
  {
    id: "beleuchtung",
    title: "Beleuchtung & Flutlicht",
    keywords: ["flutlicht", "strahler", "baustellenbeleuchtung", "lichtmast", "arbeitsscheinwerfer"],
  },
  {
    id: "stromerzeuger",
    title: "Stromerzeuger",
    keywords: ["stromerzeuger", "aggregat", "generator", "notstrom", "strom"],
  },
  {
    id: "heizung-klima",
    title: "Heizung & Klima",
    keywords: ["heizung", "heizlüfter", "heizpilz", "klima", "klimagerät", "kühlung", "wärme"],
  },
  {
    id: "kabel-leitungen",
    title: "Kabel & Leitungen",
    keywords: ["kabel", "verlängerung", "kabelbrücke", "stromverteiler", "leitung"],
  },
  {
    id: "absperrung-sicherheit",
    title: "Absperrung & Sicherheit",
    keywords: ["absperrung", "absperrgitter", "bauzaun", "warnbake", "sicherheit", "zaun"],
  },
];

const locations = [
  { id: "krefeld", name: "Krefeld", address: "Anrather Str. 291" },
  { id: "bonn", name: "Bonn", address: "Drachenburgstr. 8" },
  { id: "muelheim", name: "Mülheim", address: "Ruhrorter Str. 100" },
];

type SearchStep = "search" | "location" | "results";

export function HeroSearch() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [step, setStep] = useState<SearchStep>("search");
  const [matchedCategories, setMatchedCategories] = useState<typeof categoryKeywords>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find matching categories based on search term
  const findMatchingCategories = (term: string) => {
    if (!term.trim()) return [];
    const lowerTerm = term.toLowerCase();
    return categoryKeywords.filter((cat) =>
      cat.keywords.some((keyword) => keyword.includes(lowerTerm)) ||
      cat.title.toLowerCase().includes(lowerTerm)
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    const matches = findMatchingCategories(value);
    setMatchedCategories(matches);
    setShowSuggestions(value.length > 0);
  };

  const handleSearchSubmit = () => {
    if (searchTerm.trim()) {
      const matches = findMatchingCategories(searchTerm);
      if (matches.length > 0) {
        setMatchedCategories(matches);
        setStep("location");
      } else {
        // No matches, go to products page with search
        navigate(`/produkte?search=${encodeURIComponent(searchTerm)}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setMatchedCategories([categoryKeywords.find((c) => c.id === categoryId)!]);
    setStep("location");
    setShowSuggestions(false);
  };

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId);
    // Navigate to category page with location context
    if (matchedCategories.length > 0) {
      navigate(`/produkte/${matchedCategories[0].id}?standort=${locationId}`);
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setStep("search");
    setMatchedCategories([]);
    setSelectedLocation(null);
    setShowSuggestions(false);
  };

  return (
    <div ref={searchRef} className="bg-background rounded-xl p-4 shadow-xl max-w-2xl relative">
      {/* Step: Search */}
      {step === "search" && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={() => searchTerm && setShowSuggestions(true)}
                placeholder="Was möchtest du mieten? z.B. Bagger, Anhänger..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <Button 
              onClick={handleSearchSubmit}
              className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-3"
            >
              Suchen
            </Button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && matchedCategories.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="p-2">
                <p className="text-xs text-muted-foreground px-3 py-1">Kategorien</p>
                {matchedCategories.slice(0, 5).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-muted transition-colors text-left"
                  >
                    <span className="font-medium text-foreground">{cat.title}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular searches */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs text-muted-foreground">Beliebte Suchen:</span>
            {["Minibagger", "Pkw-Anhänger", "Scherenbühne", "Partyzelt"].map((term) => (
              <button
                key={term}
                onClick={() => {
                  setSearchTerm(term);
                  const matches = findMatchingCategories(term);
                  setMatchedCategories(matches);
                  if (matches.length > 0) {
                    setStep("location");
                  }
                }}
                className="text-xs text-primary hover:text-accent transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step: Location Selection */}
      {step === "location" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Suche nach</p>
              <p className="font-semibold text-foreground flex items-center gap-2">
                <Search className="h-4 w-4 text-accent" />
                {matchedCategories[0]?.title || searchTerm}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent" />
              Wähle deinen Standort
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleLocationSelect(location.id)}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all duration-200 text-left hover:border-accent hover:bg-accent/5",
                    selectedLocation === location.id
                      ? "border-accent bg-accent/10"
                      : "border-border"
                  )}
                >
                  <span className="font-semibold text-foreground block">{location.name}</span>
                  <span className="text-xs text-muted-foreground">{location.address}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
