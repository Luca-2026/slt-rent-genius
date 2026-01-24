import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { locations } from "@/data/rentalData";

export function HeroSearch() {
  const navigate = useNavigate();
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationSelect = (locationId: string) => {
    navigate(`/mieten/${locationId}`);
    setShowLocationDropdown(false);
  };

  return (
    <div ref={dropdownRef} className="bg-background rounded-xl p-4 shadow-xl max-w-2xl relative">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Location Selector */}
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <button
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-left text-foreground hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
          >
            Standort wählen...
          </button>
        </div>
        
        <Button 
          onClick={() => navigate("/mieten")}
          className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-3"
        >
          <Search className="h-4 w-4 mr-2" />
          Produkte finden
        </Button>
      </div>

      {/* Location Dropdown */}
      {showLocationDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2">
            <p className="text-xs text-muted-foreground px-3 py-1 mb-1">Wähle deinen Standort</p>
            {locations.map((location) => (
              <button
                key={location.id}
                onClick={() => handleLocationSelect(location.id)}
                className="w-full flex items-center justify-between px-3 py-3 rounded-md hover:bg-muted transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <span className="font-bold text-primary text-sm">
                      {location.shortName}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground block">{location.name}</span>
                    <span className="text-xs text-muted-foreground">{location.address}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick location links */}
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="text-xs text-muted-foreground">Direkt zum Standort:</span>
        {locations.map((location) => (
          <button
            key={location.id}
            onClick={() => handleLocationSelect(location.id)}
            className="text-xs text-primary hover:text-accent transition-colors font-medium"
          >
            {location.name}
          </button>
        ))}
      </div>
    </div>
  );
}
