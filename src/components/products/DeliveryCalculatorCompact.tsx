import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

// Map product categories to delivery price categories
const categoryMapping: Record<string, CategoryKey> = {
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
};

interface DeliveryCalculatorCompactProps {
  productCategoryId?: string;
  className?: string;
}

export function DeliveryCalculatorCompact({ 
  productCategoryId,
  className = "" 
}: DeliveryCalculatorCompactProps) {
  // Determine initial category based on product
  const initialCategory = productCategoryId 
    ? categoryMapping[productCategoryId] || "2t-bagger"
    : "2t-bagger";
    
  const [distance, setDistance] = useState(20);
  const [includeReturn, setIncludeReturn] = useState(true);

  const selectedCategory = deliveryPrices[initialCategory];

  const calculatedPrice = useMemo(() => {
    const distances = selectedCategory.distances;
    
    let priceEntry = distances[distances.length - 1];
    for (const entry of distances) {
      if (distance <= entry.km) {
        priceEntry = entry;
        break;
      }
    }

    const basePrice = priceEntry.brutto;
    const totalPrice = includeReturn ? basePrice * 2 : basePrice;

    return {
      oneWay: basePrice,
      total: totalPrice,
      distanceUsed: priceEntry.km,
    };
  }, [distance, includeReturn, selectedCategory]);

  return (
    <Card className={`bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Truck className="h-5 w-5 text-primary" />
          Lieferkosten berechnen
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Für {selectedCategory.name}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <Label htmlFor="return-trip" className="text-sm cursor-pointer">
            Hin- und Rückfahrt
          </Label>
          <Switch
            id="return-trip"
            checked={includeReturn}
            onCheckedChange={setIncludeReturn}
          />
        </div>

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
