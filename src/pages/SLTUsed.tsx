import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Phone, Mail, ArrowRight,
  Package, Shield, Wrench, Truck, Clock,
} from "lucide-react";
import iconBagger from "@/assets/icons/category-bagger.png";
import iconHebebuehne from "@/assets/icons/category-hebebuehne.png";
import iconVerdichtung from "@/assets/icons/category-verdichtung.png";
import iconAnhaenger from "@/assets/icons/category-anhaenger.png";
import iconAggregat from "@/assets/icons/category-aggregat.png";
import iconWerkzeug from "@/assets/icons/werkzeug.png";
import { UsedMachineInquiryModal, type MachineData } from "@/components/used/UsedMachineInquiryModal";

const usedCategories = [
  { id: "all", label: "Alle Kategorien", icon: null },
  { id: "minibagger", label: "Minibagger", icon: iconBagger },
  { id: "radlader", label: "Radlader", icon: iconBagger },
  { id: "teleskoplader", label: "Teleskoplader", icon: iconBagger },
  { id: "arbeitsbuehnen", label: "Arbeitsbühnen", icon: iconHebebuehne },
  { id: "verdichtung", label: "Verdichtung", icon: iconVerdichtung },
  { id: "anhaenger", label: "Anhänger", icon: iconAnhaenger },
  { id: "aggregate", label: "Aggregate", icon: iconAggregat },
  { id: "werkzeuge", label: "Werkzeuge", icon: iconWerkzeug },
  { id: "sonstiges", label: "Sonstiges", icon: null },
];

const demoMachines: any[] = [];

const locationLabels: Record<string, string> = {
  krefeld: "Krefeld", bonn: "Bonn", muelheim: "Mülheim",
};

function formatPrice(price: number | null, onRequest: boolean) {
  if (onRequest || !price) return "Preis auf Anfrage";
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(price) + " netto";
}

function machineToData(m: any): MachineData {
  return {
    id: m.id,
    manufacturer: m.manufacturer,
    model: m.model,
    year: m.year,
    price: formatPrice(m.price_net, m.price_on_request),
    location: m.location || "",
    referenceNumber: m.reference_number || "",
    status: m.status,
  };
}

export default function SLTUsed() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMachine, setModalMachine] = useState<MachineData | null>(null);

  const { data: dbMachines } = useQuery({
    queryKey: ["used-machines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("used_machines")
        .select("*")
        .in("status", ["available", "reserved"])
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const machines: any[] = (dbMachines && dbMachines.length > 0) ? dbMachines : demoMachines;

  const filteredMachines = useMemo(() => {
    let result = machines;
    if (selectedCategory !== "all") {
      result = result.filter((m: any) => m.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m: any) =>
        m.manufacturer.toLowerCase().includes(q) ||
        m.model.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.reference_number?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [machines, selectedCategory, searchQuery]);

  const openInquiry = (machine?: any) => {
    setModalMachine(machine ? machineToData(machine) : null);
    setModalOpen(true);
  };

  return (
    <Layout>
      <SEO
        title="SLT Used – Gebrauchte Baumaschinen kaufen | SLT Rental"
        description="Gepflegte Gebrauchtmaschinen von Zoomlion, BAUMAX und Temared. Minibagger, Radlader, Arbeitsbühnen und mehr. Geprüft, gewartet, sofort verfügbar."
        canonical="/verkauf/gebrauchtmaschinen"
      />

      {/* Hero */}
      <section className="bg-primary py-14 lg:py-20">
        <div className="section-container">
          <Badge className="bg-accent text-accent-foreground mb-4">SLT Used</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
            Geprüfte Gebrauchtmaschinen
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-6 max-w-3xl">
            Hochwertige Baumaschinen und Equipment aus unserem eigenen Mietpark – professionell gewartet, sofort einsatzbereit.
          </p>
          <div className="flex flex-wrap gap-6">
            {[
              { icon: Shield, text: "Geprüft & gewartet" },
              { icon: Wrench, text: "Servicehistorie" },
              { icon: Truck, text: "Lieferung möglich" },
              { icon: Clock, text: "Sofort verfügbar" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <item.icon className="h-4 w-4 text-accent" />
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="section-container py-8 md:py-10">
        <AnimatedSection>
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-headline">
              {filteredMachines.length} {filteredMachines.length === 1 ? "Maschine" : "Maschinen"} verfügbar
            </h2>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Hersteller, Modell oder Ref.-Nr. suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {usedCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {cat.icon && <img src={cat.icon} alt="" className="h-5 w-5 object-contain" />}
                {cat.label}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Machine Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <TooltipProvider>
            {filteredMachines.map((machine: any) => {
              const isReserved = machine.status === "reserved";
              const isSold = machine.status === "sold";
              const isDisabled = isReserved || isSold;
              const tooltipText = isReserved
                ? "Diese Maschine ist bereits reserviert"
                : isSold
                ? "Diese Maschine wurde bereits verkauft"
                : "";

              return (
                <Card key={machine.id} className="group overflow-hidden hover:shadow-lg transition-all border-2 hover:border-primary/30">
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    {machine.images && machine.images.length > 0 ? (
                      <img
                        src={machine.images[0]}
                        alt={`${machine.manufacturer} ${machine.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <Package className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {machine.is_featured && (
                        <Badge className="bg-accent text-accent-foreground text-xs">Top-Angebot</Badge>
                      )}
                      {isReserved && <Badge variant="secondary" className="text-xs">Reserviert</Badge>}
                      {isSold && <Badge variant="destructive" className="text-xs">Verkauft</Badge>}
                    </div>
                    {machine.reference_number && (
                      <div className="absolute bottom-3 right-3">
                        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs">
                          {machine.reference_number}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{machine.manufacturer}</p>
                      <h3 className="text-lg font-bold text-headline group-hover:text-primary transition-colors">{machine.model}</h3>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                      {machine.year && <span>Bj. {machine.year}</span>}
                      {machine.hours != null && <span>{machine.hours.toLocaleString("de-DE")} Bh</span>}
                      {machine.location && (
                        <span>{locationLabels[machine.location] || machine.location}</span>
                      )}
                    </div>
                    <div className="mb-3">
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(machine.price_net, machine.price_on_request)}
                      </span>
                    </div>
                    {machine.specifications && (
                      <div className="text-xs text-muted-foreground space-y-0.5 mb-4 border-t border-border pt-3">
                        {Object.entries(machine.specifications as Record<string, string>).slice(0, 3).map(([key, val]) => (
                          <div key={key} className="flex justify-between">
                            <span>{key}:</span>
                            <span className="font-medium text-foreground">{val}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {isDisabled ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block">
                            <Button className="w-full" variant="outline" disabled>
                              {isReserved ? "Reserviert" : "Verkauft"}
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent><p>{tooltipText}</p></TooltipContent>
                      </Tooltip>
                    ) : (
                      <Button className="w-full" onClick={() => openInquiry(machine)}>
                        Anfrage senden <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TooltipProvider>
        </div>

        {filteredMachines.length === 0 && (
          <div className="text-center py-16">
            <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-headline mb-2">Keine Maschinen gefunden</h3>
            <p className="text-muted-foreground">Versuchen Sie eine andere Kategorie oder Suchbegriff.</p>
          </div>
        )}
      </section>

      {/* USPs */}
      <section className="bg-muted/30 py-12 md:py-16">
        <div className="section-container">
          <AnimatedSection>
            <h2 className="text-2xl md:text-3xl font-bold text-headline text-center mb-8">
              Warum Gebrauchtmaschinen von SLT?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Shield, title: "Geprüfte Qualität", desc: "Jede Maschine wird vor dem Verkauf gründlich geprüft und aufbereitet." },
                { icon: Wrench, title: "Komplette Servicehistorie", desc: "Lückenlose Wartungsdokumentation aus unserem eigenen Mietpark." },
                { icon: Truck, title: "Lieferung deutschlandweit", desc: "Wir liefern Ihre Maschine direkt an den Einsatzort." },
                { icon: Clock, title: "Sofort verfügbar", desc: "Alle gelisteten Maschinen sind sofort abholbereit oder lieferbar." },
              ].map((usp, idx) => (
                <Card key={idx} className="text-center p-6">
                  <usp.icon className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-headline mb-2">{usp.title}</h3>
                  <p className="text-sm text-muted-foreground">{usp.desc}</p>
                </Card>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* General Inquiry CTA */}
      <section className="section-container py-12 text-center">
        <h2 className="text-2xl font-bold text-headline mb-4">Sie suchen eine bestimmte Maschine?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Teilen Sie uns Ihren Bedarf mit – wir finden die passende Gebrauchtmaschine für Sie.
        </p>
        <Button size="lg" onClick={() => openInquiry()}>
          Allgemeine Anfrage senden
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </section>

      {/* Contact */}
      <section className="bg-primary text-primary-foreground py-10">
        <div className="section-container text-center">
          <h2 className="text-xl font-bold mb-2 text-primary-foreground">Fragen zu unseren Gebrauchtmaschinen?</h2>
          <p className="text-primary-foreground mb-4">Unser Team berät Sie gerne persönlich.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:021514179904" className="flex items-center gap-2 hover:text-accent transition-colors">
              <Phone className="h-4 w-4" /> 02151 417 99 04
            </a>
            <a href="mailto:kaufanfrage@slt-rental.de" className="flex items-center gap-2 hover:text-accent transition-colors">
              <Mail className="h-4 w-4" /> kaufanfrage@slt-rental.de
            </a>
          </div>
        </div>
      </section>

      {/* Inquiry Modal */}
      <UsedMachineInquiryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        machine={modalMachine}
      />
    </Layout>
  );
}
