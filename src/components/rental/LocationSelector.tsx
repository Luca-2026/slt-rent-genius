import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ArrowRight, Clock, Mail, User, Building2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { locationData } from "@/data/locationData";
import { useTranslation } from "react-i18next";

export function LocationSelector() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">{t("rental.chooseLocation")}</h2>
        <p className="text-muted-foreground">{t("rental.chooseLocationSubtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {locationData.map((location) => (
          <Card key={location.id} className="h-full group hover:shadow-lg transition-all hover:border-primary/50 overflow-hidden flex flex-col">
            {/* Location Image */}
            <Link to={`/mieten/${location.id}`} className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden block cursor-pointer">
              {location.image ? (
                <img 
                  src={location.image} 
                  alt={location.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-primary/30" />
                </div>
              )}
              {/* Badge */}
              <div className="absolute top-3 left-3">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                  {location.subtitle}
                </span>
              </div>
            </Link>

            <CardContent className="p-5 flex flex-col flex-1">
              {/* Location Name */}
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {location.name}
              </h3>

              {/* Address */}
              <div className="flex items-start gap-2 text-sm text-muted-foreground mb-1 min-h-[44px]">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                <div>
                  <span className="block">{location.address}</span>
                  <span className="block">{location.city}</span>
                </div>
              </div>

              {/* Phone */}
              <a 
                href={`tel:${location.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 text-sm text-muted-foreground mb-1 hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span>{location.phone}</span>
              </a>

              {/* Email */}
              <a 
                href={`mailto:${location.email}`}
                className="flex items-center gap-2 text-sm text-muted-foreground mb-3 hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span>{location.email}</span>
              </a>

              {/* Hours */}
              <div className="mb-3 p-3 bg-surface-light rounded-lg min-h-[108px]">
                <div className="flex items-center gap-2 text-sm font-medium text-headline mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  {t("locations.openingHours")}
                </div>
                <div className="space-y-1">
                  {location.hours.map((h, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-muted-foreground">
                      <span>{h.day}</span>
                      <span className="font-medium">{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manager */}
              <a 
                href={`mailto:${location.manager.email}`}
                className="flex items-center gap-3 mb-4 p-3 bg-surface-light rounded-lg hover:bg-accent/10 transition-colors cursor-pointer min-h-[72px]"
                onClick={(e) => e.stopPropagation()}
              >
                <Avatar className="h-10 w-10">
                  {location.manager.image ? (
                    <AvatarImage src={location.manager.image} alt={location.manager.name} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-headline text-sm truncate">{location.manager.name}</p>
                  <p className="text-xs text-muted-foreground">{t(location.manager.role)}</p>
                </div>
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              </a>

              {/* CTA */}
              <Link to={`/mieten/${location.id}`} className="mt-auto">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  {t("rental.selectThisLocation")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
