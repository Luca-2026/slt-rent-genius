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
    <div className="space-y-4 md:space-y-6">
      <div className="text-center">
        <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-foreground mb-1.5 md:mb-2">{t("rental.chooseLocation")}</h2>
        <p className="text-xs md:text-sm lg:text-base text-muted-foreground">{t("rental.chooseLocationSubtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
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
                  <Building2 className="h-12 w-12 md:h-16 md:w-16 text-primary/30" />
                </div>
              )}
              {/* Badge */}
              <div className="absolute top-2 left-2 md:top-3 md:left-3">
                <span className="bg-primary text-primary-foreground text-[10px] md:text-xs font-bold px-2 py-0.5 md:py-1 rounded">
                  {location.subtitle}
                </span>
              </div>
            </Link>

            <CardContent className="p-3.5 md:p-5 flex flex-col flex-1">
              {/* Location Name */}
              <h3 className="text-base md:text-xl font-bold text-foreground mb-2 md:mb-3 group-hover:text-primary transition-colors">
                {location.name}
              </h3>

              {/* Address */}
              <div className="flex items-start gap-2 text-xs md:text-sm text-muted-foreground mb-1 min-h-[36px] md:min-h-[44px]">
                <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 mt-0.5 text-primary" />
                <div>
                  <span className="block">{location.address}</span>
                  <span className="block">{location.city}</span>
                </div>
              </div>

              {/* Phone */}
              <a 
                href={`tel:${location.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-1 hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 text-primary" />
                <span>{location.phone}</span>
              </a>

              {/* Email */}
              <a 
                href={`mailto:${location.email}`}
                className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-2.5 md:mb-3 hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 text-primary" />
                <span className="truncate">{location.email}</span>
              </a>

              {/* Hours */}
              <div className="mb-2.5 md:mb-3 p-2.5 md:p-3 bg-surface-light rounded-lg">
                <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-headline mb-1.5 md:mb-2">
                  <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                  {t("locations.openingHours")}
                </div>
                <div className="space-y-0.5 md:space-y-1">
                  {location.hours.map((h, idx) => (
                    <div key={idx} className="flex justify-between text-[10px] md:text-xs text-muted-foreground">
                      <span>{h.day}</span>
                      <span className="font-medium">{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manager */}
              <a 
                href={`mailto:${location.manager.email}`}
                className="flex items-center gap-2.5 md:gap-3 mb-3 md:mb-4 p-2.5 md:p-3 bg-surface-light rounded-lg hover:bg-accent/10 transition-colors cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <Avatar className="h-8 w-8 md:h-10 md:w-10">
                  {location.manager.image ? (
                    <AvatarImage src={location.manager.image} alt={location.manager.name} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-headline text-xs md:text-sm truncate">{location.manager.name}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground">{t(location.manager.role)}</p>
                </div>
                <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground shrink-0" />
              </a>

              {/* CTA */}
              <Link to={`/mieten/${location.id}`} className="mt-auto">
                <Button className="w-full bg-primary hover:bg-primary/90 text-xs md:text-sm" size="sm">
                  {t("rental.selectThisLocation")}
                  <ArrowRight className="ml-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
