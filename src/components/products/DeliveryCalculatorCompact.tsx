import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, MapPin, Calculator, ArrowRight } from "lucide-react";

const deliveryPrices = {
  "1t-bagger": {
    name: "1t Bagger, Dumper & 8m Scherenbühne",
    multiplier: 1.5,
    distances: [
      { km: 15, brutto: 70 },
      { km: 20, brutto: 90 },
      { km: 25, brutto: 99 },
      { km: 30, brutto: 115 },
      { km: 35, brutto: 130 },
      { km: 50, brutto: 155 },
    ],
  },
  "2t-bagger": {
    name: "2t Bagger, Radlader & Anhängerarbeitsbühne",
    multiplier: 1.5,
    distances: [
      { km: 15, brutto: 80 },
      { km: 20, brutto: 99 },
      { km: 25, brutto: 115 },
      { km: 30, brutto: 130 },
      { km: 35, brutto: 155 },
      { km: 50, brutto: 180 },
    ],
  },
  "3t-bagger": {
    name: "3t Bagger & 12m Scherenbühne",
    multiplier: 1.7,
    distances: [
      { km: 15, brutto: 90 },
      { km: 20, brutto: 109 },
      { km: 25, brutto: 125 },
      { km: 30, brutto: 139 },
      { km: 35, brutto: 150 },
      { km: 50, brutto: 165 },
    ],
  },
  "geruest": {
    name: "Gerüst bis 4,4m Arbeitshöhe",
    multiplier: 1,
    distances: [
      { km: 10, brutto: 45 },
      { km: 15, brutto: 55 },
      { km: 20, brutto: 65 },
      { km: 25, brutto: 75 },
      { km: 30, brutto: 90 },
      { km: 35, brutto: 115 },
      { km: 50, brutto: 150 },
    ],
  },
  "event": {
    name: "Heizung, Trocknung, Möbel, Zelte, Event-Equipment",
    multiplier: 1,
    distances: [
      { km: 10, brutto: 25 },
      { km: 15, brutto: 30 },
      { km: 20, brutto: 40 },
      { km: 25, brutto: 70 },
      { km: 30, brutto: 85 },
      { km: 35, brutto: 110 },
      { km: 50, brutto: 140 },
    ],
  },
};

type CategoryKey = keyof typeof deliveryPrices;

// All category options for the dropdown
const allCategoryOptions: { value: CategoryKey; label: string }[] = [
  { value: "1t-bagger", label: "1t Bagger, Dumper & 8m Scherenbühne" },
  { value: "2t-bagger", label: "2t Bagger, Radlader & Anhängerarbeitsbühne" },
  { value: "3t-bagger", label: "3t Bagger & 12m Scherenbühne" },
  { value: "geruest", label: "Gerüst bis 4,4m Arbeitshöhe" },
  { value: "event", label: "Heizung, Möbel, Zelte, Event-Equipment" },
];

// Machine type options for erdbewegung category
const machineTypeOptions: { value: CategoryKey; label: string }[] = [
  { value: "1t-bagger", label: "1t Bagger, Dumper" },
  { value: "2t-bagger", label: "2t Bagger, Radlader" },
  { value: "3t-bagger", label: "3t Bagger" },
];

// Map product categories to delivery price categories
const categoryMapping: Record<string, CategoryKey> = {
  "erdbewegung": "1t-bagger",
  "bagger-radlader": "2t-bagger",
  "verdichtung": "1t-bagger",
  "hebebuehnen": "3t-bagger",
  "moebel-zelte": "event",
  "geschirr": "event",
  "besteck": "event",
  "huepfburgen": "event",
  "spezialeffekte": "event",
  "led-spots": "event",
  "beleuchtung": "event",
  "heizung-klima": "event",
  "buehnen-podeste": "event",
  "gerueste": "geruest",
};

interface DeliveryCalculatorCompactProps {
  productCategoryId?: string;
  showAllCategories?: boolean;
  className?: string;
  categoryDisplayName?: string;
}

export function DeliveryCalculatorCompact({ 
  productCategoryId,
  showAllCategories = false,
  className = "",
  categoryDisplayName
}: DeliveryCalculatorCompactProps) {
  // Determine if this is erdbewegung category (show machine type selector)
  const isErdbewegung = productCategoryId === "erdbewegung";
  
  // Show all categories when showAllCategories is true (for "alle" page)
  const showCategoryDropdown = showAllCategories || isErdbewegung;
  
  // Determine initial category based on product
  const initialCategory = productCategoryId 
    ? categoryMapping[productCategoryId] || "2t-bagger"
    : "2t-bagger";
    
  const [selectedMachineType, setSelectedMachineType] = useState<CategoryKey>(initialCategory);
  const [distance, setDistance] = useState(20);
  const [includeReturn, setIncludeReturn] = useState(true);
  const [twoMachines, setTwoMachines] = useState(false);

  const selectedCategory = deliveryPrices[selectedMachineType];
  
  // Check if multiplier option should be shown
  const showMultiplierOption = isErdbewegung || 
    (showAllCategories && (selectedMachineType === "1t-bagger" || selectedMachineType === "2t-bagger" || selectedMachineType === "3t-bagger"));

  const calculatedPrice = useMemo(() => {
    const distances = selectedCategory.distances;
    
    let priceEntry = distances[distances.length - 1];
    for (const entry of distances) {
      if (distance <= entry.km) {
        priceEntry = entry;
        break;
      }
    }

    let basePrice = priceEntry.brutto;
    
    // Aufschlag für 2 Baumaschinen
    if (twoMachines && selectedCategory.multiplier > 1) {
      basePrice = basePrice * selectedCategory.multiplier;
    }

    const totalPrice = includeReturn ? basePrice * 2 : basePrice;

    return {
      oneWay: basePrice,
      total: totalPrice,
      distanceUsed: priceEntry.km,
    };
  }, [distance, includeReturn, twoMachines, selectedCategory]);

  // Determine which options to show in dropdown
  const categoryOptions = showAllCategories ? allCategoryOptions : machineTypeOptions;

  return (
    <Card className={`bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Truck className="h-5 w-5 text-primary" />
          {categoryDisplayName ? `Lieferkosten für ${categoryDisplayName}` : "Lieferkosten berechnen"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Selector */}
        {showCategoryDropdown && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Gerätekategorie</Label>
            <Select
              value={selectedMachineType}
              onValueChange={(value) => setSelectedMachineType(value as CategoryKey)}
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Kategorie wählen" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Non-dropdown: show category name */}
        {!showCategoryDropdown && (
          <p className="text-sm text-muted-foreground">
            Für {selectedCategory.name}
          </p>
        )}

        {/* Distance Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Entfernung
            </Label>
            <span className="font-semibold text-primary">{distance} km</span>
          </div>
          <Slider
            value={[distance]}
            onValueChange={(value) => setDistance(value[0])}
            min={5}
            max={50}
            step={5}
            className="w-full"
          />
        </div>

        {/* Return Trip Toggle */}
        <div className="flex items-center justify-between py-2 border-t border-border">
          <Label htmlFor="return-trip-compact" className="text-sm cursor-pointer">
            Hin- und Rückfahrt
          </Label>
          <Switch
            id="return-trip-compact"
            checked={includeReturn}
            onCheckedChange={setIncludeReturn}
          />
        </div>

        {/* Two Machines Toggle - for erdbewegung or all categories with multiplier */}
        {showMultiplierOption && selectedCategory.multiplier > 1 && (
          <div className="flex items-center justify-between py-2 border-t border-border">
            <div>
              <Label htmlFor="two-machines-compact" className="text-sm cursor-pointer">
                2 Baumaschinen
              </Label>
              <p className="text-xs text-muted-foreground">
                Aufschlag: ×{selectedCategory.multiplier}
              </p>
            </div>
            <Switch
              id="two-machines-compact"
              checked={twoMachines}
              onCheckedChange={setTwoMachines}
            />
          </div>
        )}

        {/* Price Display */}
        <div className="bg-background rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {includeReturn ? "Hin- & Rückfahrt" : "Einfache Fahrt"}
              </p>
              <p className="text-2xl font-bold text-headline">
                {calculatedPrice.total.toFixed(0)} €
                <span className="text-sm font-normal text-muted-foreground ml-1">brutto</span>
              </p>
            </div>
            <Calculator className="h-8 w-8 text-accent" />
          </div>
          {includeReturn && (
            <p className="text-xs text-muted-foreground mt-1">
              (je Fahrt {calculatedPrice.oneWay.toFixed(0)} €)
            </p>
          )}
          {twoMachines && (
            <p className="text-xs text-accent mt-1">
              inkl. Aufschlag für 2 Maschinen
            </p>
          )}
        </div>

        {/* Link to full calculator */}
        <Link to="/lieferung">
          <Button variant="outline" className="w-full text-sm">
            Detaillierter Rechner
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
