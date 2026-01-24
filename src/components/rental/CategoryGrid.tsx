import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Grid3X3 } from "lucide-react";
import { getCategoriesForLocation, type ProductCategory, type LocationData } from "@/data/rentalData";

interface CategoryGridProps {
  location: LocationData;
}

export function CategoryGrid({ location }: CategoryGridProps) {
  const categories = getCategoriesForLocation(location.id);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {categories.map((category) => (
        <Link 
          key={category.id} 
          to={`/mieten/${location.id}/${category.id}`}
        >
          <Card className="h-full group hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer">
            {/* Icon Area */}
            <div className="aspect-square bg-muted/50 flex items-center justify-center p-4 group-hover:bg-primary/5 transition-colors">
              {category.id === "alle" ? (
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Grid3X3 className="h-8 w-8 text-primary" />
                </div>
              ) : category.icon ? (
                <img
                  src={category.icon}
                  alt={category.title}
                  className="w-3/4 h-3/4 object-contain group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-16 h-16 bg-muted rounded-full" />
              )}
            </div>

            {/* Content */}
            <CardContent className="p-3 text-center">
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {category.title}
              </h3>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
