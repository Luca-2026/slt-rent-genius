import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ArrowRight } from "lucide-react";
import { locations } from "@/data/rentalData";

interface LocationSelectorProps {
  title?: string;
  subtitle?: string;
}

export function LocationSelector({ 
  title = "Wähle deinen Standort",
  subtitle = "Verfügbare Produkte und Preise können je nach Standort variieren."
}: LocationSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {locations.map((location) => (
          <Link key={location.id} to={`/mieten/${location.id}`}>
            <Card className="h-full group hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer">
              <CardContent className="p-6">
                {/* Location Badge */}
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <span className="text-2xl font-bold text-primary">
                    {location.shortName}
                  </span>
                </div>

                {/* Location Name */}
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {location.name}
                </h3>

                {/* Address */}
                <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{location.address}</span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{location.phone}</span>
                </div>

                {/* CTA */}
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  Standort wählen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
