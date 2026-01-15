import { Layout } from "@/components/layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Clock, Navigation, Truck, CheckCircle2 } from "lucide-react";

const locations = [
  {
    id: "krefeld",
    name: "Krefeld",
    subtitle: "Hauptsitz",
    address: "Oberschlesienstr. 16",
    city: "47807 Krefeld",
    phone: "02151 / 932 89 53",
    email: "krefeld@slt-rental.de",
    hours: [
      { day: "Montag - Freitag", time: "7:00 - 17:00 Uhr" },
      { day: "Samstag", time: "nach Vereinbarung" },
      { day: "Sonntag", time: "geschlossen" },
    ],
    features: ["Große Auswahl", "Hauptlager", "Werkstatt vor Ort"],
    mapUrl: "https://maps.google.com",
  },
  {
    id: "bonn",
    name: "Bonn",
    subtitle: "Filiale",
    address: "Siemensstr. 27",
    city: "53121 Bonn",
    phone: "0228 / 850 777 53",
    email: "bonn@slt-rental.de",
    hours: [
      { day: "Montag - Freitag", time: "7:00 - 17:00 Uhr" },
      { day: "Samstag", time: "nach Vereinbarung" },
      { day: "Sonntag", time: "geschlossen" },
    ],
    features: ["Code-Übergabe möglich", "24/7 Abholung", "Kleingeräte-Fokus"],
    mapUrl: "https://maps.google.com",
    note: "Außerhalb der Öffnungszeiten ist eine Abholung per Code-Übergabe möglich. Bitte vorab anfragen.",
  },
  {
    id: "muelheim",
    name: "Mülheim an der Ruhr",
    subtitle: "Filiale",
    address: "Weseler Str. 161",
    city: "45478 Mülheim",
    phone: "0208 / 740 788 52",
    email: "muelheim@slt-rental.de",
    hours: [
      { day: "Montag - Freitag", time: "7:00 - 17:00 Uhr" },
      { day: "Samstag", time: "nach Vereinbarung" },
      { day: "Sonntag", time: "geschlossen" },
    ],
    features: ["Ruhrgebiet-Nähe", "Anhänger-Spezialist", "Schnelle Abwicklung"],
    mapUrl: "https://maps.google.com",
  },
];

export default function Locations() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-12 lg:py-16">
        <div className="section-container">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Unsere Standorte
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl">
            3 Standorte in NRW – immer in deiner Nähe. Persönliche Beratung, 
            große Auswahl und schnelle Abholung garantiert.
          </p>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="bg-muted h-64 lg:h-96 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Karten-Integration (Google Maps / Mapbox)</p>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-12 lg:py-20">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {locations.map((location) => (
              <Card key={location.id} className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-headline">{location.name}</h2>
                      <span className="text-sm text-accent font-medium">{location.subtitle}</span>
                    </div>
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-headline">{location.address}</p>
                        <p className="text-muted-foreground">{location.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${location.phone.replace(/\s/g, "")}`} className="text-primary hover:text-accent">
                        {location.phone}
                      </a>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-headline mb-2">
                      <Clock className="h-4 w-4" />
                      Öffnungszeiten
                    </div>
                    <div className="space-y-1">
                      {location.hours.map((h) => (
                        <div key={h.day} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{h.day}</span>
                          <span className="text-headline">{h.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Note */}
                  {location.note && (
                    <div className="bg-accent/10 rounded-lg p-3 mb-6">
                      <p className="text-sm text-body">{location.note}</p>
                    </div>
                  )}

                  {/* Features */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {location.features.map((feature) => (
                        <span
                          key={feature}
                          className="inline-flex items-center gap-1 bg-surface-light px-2 py-1 rounded text-xs text-body"
                        >
                          <CheckCircle2 className="h-3 w-3 text-accent" />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <a href={location.mapUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Navigation className="h-4 w-4 mr-2" />
                        Route
                      </Button>
                    </a>
                    <Link to={`/standorte/${location.id}`} className="flex-1">
                      <Button className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover" size="sm">
                        Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Info */}
      <section className="py-12 lg:py-16 bg-surface-light">
        <div className="section-container">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="flex-1">
              <Truck className="h-12 w-12 text-accent mb-4" />
              <h2 className="text-2xl lg:text-3xl font-bold text-headline mb-4">
                Lieferung direkt zur Baustelle
              </h2>
              <p className="text-muted-foreground mb-6">
                Du hast keine Möglichkeit, das Equipment abzuholen? Kein Problem! 
                Wir liefern dir Baumaschinen, Anhänger und mehr direkt an deinen Einsatzort in ganz NRW.
              </p>
              <Link to="/lieferung">
                <Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                  Mehr zur Lieferung
                </Button>
              </Link>
            </div>
            <div className="lg:w-96 bg-background rounded-xl p-6 border border-border">
              <h3 className="font-semibold text-headline mb-4">Lieferkosten</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Bis 25 km</span>
                  <span className="font-medium text-headline">ab 49€</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">25 - 50 km</span>
                  <span className="font-medium text-headline">ab 79€</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">50 - 100 km</span>
                  <span className="font-medium text-headline">ab 129€</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Über 100 km</span>
                  <span className="font-medium text-headline">auf Anfrage</span>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4">
                * Preise zzgl. MwSt., abhängig vom Equipment
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
