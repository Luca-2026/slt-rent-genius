import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Filter, Phone, Mail, ArrowRight, Loader2,
  Package, Shield, Wrench, Truck, Clock, Eye,
} from "lucide-react";
import iconBagger from "@/assets/icons/category-bagger.png";
import iconHebebuehne from "@/assets/icons/category-hebebuehne.png";
import iconVerdichtung from "@/assets/icons/category-verdichtung.png";
import iconAnhaenger from "@/assets/icons/category-anhaenger.png";
import iconAggregat from "@/assets/icons/category-aggregat.png";
import iconWerkzeug from "@/assets/icons/werkzeug.png";

// Category definitions for the used machine market
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

// Demo machines (shown when DB is empty)
const demoMachines = [
  {
    id: "demo-1",
    category: "minibagger",
    manufacturer: "Zoomlion",
    model: "ZE35E-10",
    year: 2022,
    hours: 1250,
    price_net: 29500,
    price_on_request: false,
    description: "Gepflegter Zoomlion Minibagger mit nur 1.250 Betriebsstunden. Vollständige Servicehistorie vorhanden. Inklusive 3 Löffel (300mm, 600mm, 900mm).",
    images: [],
    status: "available",
    reference_number: "SLT-U-001",
    location: "krefeld",
    is_featured: true,
    specifications: { "Einsatzgewicht": "3,5 t", "Motorleistung": "18,5 kW", "Grabtiefe": "3.200 mm" },
  },
  {
    id: "demo-2",
    category: "radlader",
    manufacturer: "Zoomlion",
    model: "ZL08F",
    year: 2021,
    hours: 2100,
    price_net: 18900,
    price_on_request: false,
    description: "Kompaktradlader in sehr gutem Zustand. Neue Bereifung, frisch gewartet.",
    images: [],
    status: "available",
    reference_number: "SLT-U-002",
    location: "krefeld",
    is_featured: false,
    specifications: { "Einsatzgewicht": "3,2 t", "Nutzlast": "800 kg", "Schaufelinhalt": "0,4 m³" },
  },
  {
    id: "demo-3",
    category: "arbeitsbuehnen",
    manufacturer: "Zoomlion",
    model: "ZS1012HD-LI",
    year: 2023,
    hours: 380,
    price_net: null,
    price_on_request: true,
    description: "Elektrische Scherenbühne, kaum benutzt. Ideal für Innen- und Außenbereich. 12m Arbeitshöhe.",
    images: [],
    status: "available",
    reference_number: "SLT-U-003",
    location: "bonn",
    is_featured: true,
    specifications: { "Arbeitshöhe": "12 m", "Tragfähigkeit": "320 kg", "Antrieb": "Elektrisch" },
  },
  {
    id: "demo-4",
    category: "verdichtung",
    manufacturer: "BAUMAX",
    model: "RVP 30/50",
    year: 2022,
    hours: 890,
    price_net: 3200,
    price_on_request: false,
    description: "Reversierbare Vibrationsplatte in gutem Zustand. Regelmäßig gewartet.",
    images: [],
    status: "available",
    reference_number: "SLT-U-004",
    location: "krefeld",
    is_featured: false,
    specifications: { "Verdichtungskraft": "30 kN", "Plattenbreite": "500 mm", "Gewicht": "185 kg" },
  },
  {
    id: "demo-5",
    category: "anhaenger",
    manufacturer: "Temared",
    model: "Autotransporter 2700",
    year: 2021,
    hours: null,
    price_net: 4500,
    price_on_request: false,
    description: "2700 kg Autotransportanhänger mit Seilwinde und Auffahrschienen. TÜV bis 03/2026.",
    images: [],
    status: "available",
    reference_number: "SLT-U-005",
    location: "muelheim",
    is_featured: false,
    specifications: { "Nutzlast": "1.950 kg", "Ladefläche": "400 x 200 cm", "Auffahrschienen": "Ja" },
  },
  {
    id: "demo-6",
    category: "minibagger",
    manufacturer: "Zoomlion",
    model: "ZE60E-10",
    year: 2023,
    hours: 620,
    price_net: 52000,
    price_on_request: false,
    description: "6-Tonnen Bagger, Elektroantrieb, mit Powertilt und 4 Löffeln. Wie neu.",
    images: [],
    status: "reserved",
    reference_number: "SLT-U-006",
    location: "krefeld",
    is_featured: true,
    specifications: { "Einsatzgewicht": "6 t", "Antrieb": "Elektrisch", "Grabtiefe": "4.100 mm" },
  },
];

function formatPrice(price: number | null, onRequest: boolean) {
  if (onRequest || !price) return "Preis auf Anfrage";
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(price) + " netto";
}

export default function SLTUsed() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMachine, setSelectedMachine] = useState<any | null>(null);
  const [showInquiry, setShowInquiry] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "", company: "", email: "", phone: "", message: "", privacy: false,
  });

  // Fetch from DB
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

  const handleInquiry = async (machine?: any) => {
    if (machine) setSelectedMachine(machine);
    setShowInquiry(true);
    setTimeout(() => {
      document.getElementById("used-inquiry-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.privacy) {
      toast({ title: "Hinweis", description: "Bitte stimmen Sie der Datenschutzerklärung zu.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    try {
      const machineInfo = selectedMachine
        ? `\n\nAngefragte Maschine:\n- ${selectedMachine.manufacturer} ${selectedMachine.model}\n- Ref: ${selectedMachine.reference_number}\n- Baujahr: ${selectedMachine.year}\n- Preis: ${formatPrice(selectedMachine.price_net, selectedMachine.price_on_request)}`
        : "";

      const { error } = await supabase.functions.invoke("send-purchase-inquiry", {
        body: {
          name: form.name,
          company: form.company,
          email: form.email,
          phone: form.phone,
          message: `[SLT Used - Gebrauchtmaschinen-Anfrage]${machineInfo}\n\nNachricht:\n${form.message}`,
          source: "SLT Used",
        },
      });

      if (error) throw error;

      toast({ title: "Anfrage gesendet!", description: "Wir melden uns schnellstmöglich bei Ihnen." });
      setForm({ name: "", company: "", email: "", phone: "", message: "", privacy: false });
      setShowInquiry(false);
      setSelectedMachine(null);
    } catch {
      toast({ title: "Fehler", description: "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <SEO
        title="SLT Used – Gebrauchte Baumaschinen kaufen | SLT Rental"
        description="Gepflegte Gebrauchtmaschinen von Zoomlion, BAUMAX und Temared. Minibagger, Radlader, Arbeitsbühnen und mehr. Geprüft, gewartet, sofort verfügbar."
        canonical="/verkauf/gebrauchtmaschinen"
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-foreground to-foreground/90 text-primary-foreground py-12 md:py-20">
        <div className="section-container">
          <div className="max-w-3xl">
            <Badge className="bg-accent text-accent-foreground mb-4">SLT Used</Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Geprüfte Gebrauchtmaschinen
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-6">
              Hochwertige Baumaschinen und Equipment aus unserem eigenen Mietpark – professionell gewartet, sofort einsatzbereit.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Shield className="h-4 w-4 text-accent" />
                Geprüft & gewartet
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Wrench className="h-4 w-4 text-accent" />
                Servicehistorie
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Truck className="h-4 w-4 text-accent" />
                Lieferung möglich
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Clock className="h-4 w-4 text-accent" />
                Sofort verfügbar
              </div>
            </div>
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

          {/* Category Pills */}
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
          {filteredMachines.map((machine: any) => (
            <Card key={machine.id} className="group overflow-hidden hover:shadow-lg transition-all border-2 hover:border-primary/30">
              {/* Image area */}
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
                {/* Status badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {machine.is_featured && (
                    <Badge className="bg-accent text-accent-foreground text-xs">Top-Angebot</Badge>
                  )}
                  {machine.status === "reserved" && (
                    <Badge variant="secondary" className="text-xs">Reserviert</Badge>
                  )}
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
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {machine.manufacturer}
                  </p>
                  <h3 className="text-lg font-bold text-headline group-hover:text-primary transition-colors">
                    {machine.model}
                  </h3>
                </div>

                {/* Specs row */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                  {machine.year && <span>Bj. {machine.year}</span>}
                  {machine.hours != null && <span>{machine.hours.toLocaleString("de-DE")} Bh</span>}
                  {machine.location && (
                    <span className="capitalize">
                      {machine.location === "muelheim" ? "Mülheim" : machine.location.charAt(0).toUpperCase() + machine.location.slice(1)}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mb-3">
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(machine.price_net, machine.price_on_request)}
                  </span>
                </div>

                {/* Spec details */}
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

                <Button
                  onClick={() => handleInquiry(machine)}
                  className="w-full"
                  variant={machine.status === "reserved" ? "outline" : "default"}
                  disabled={machine.status === "reserved"}
                >
                  {machine.status === "reserved" ? "Reserviert" : "Anfrage senden"}
                  {machine.status !== "reserved" && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </CardContent>
            </Card>
          ))}
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
      {!showInquiry && (
        <section className="section-container py-12 text-center">
          <h2 className="text-2xl font-bold text-headline mb-4">Sie suchen eine bestimmte Maschine?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Teilen Sie uns Ihren Bedarf mit – wir finden die passende Gebrauchtmaschine für Sie.
          </p>
          <Button size="lg" onClick={() => handleInquiry()}>
            Allgemeine Anfrage senden
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </section>
      )}

      {/* Inquiry Form */}
      {showInquiry && (
        <section id="used-inquiry-form" className="section-container py-12">
          <AnimatedSection>
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-headline mb-2">
                  {selectedMachine ? `Anfrage: ${selectedMachine.manufacturer} ${selectedMachine.model}` : "Gebrauchtmaschinen-Anfrage"}
                </h2>
                {selectedMachine && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Ref.-Nr.: {selectedMachine.reference_number} · Bj. {selectedMachine.year} · {formatPrice(selectedMachine.price_net, selectedMachine.price_on_request)}
                  </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="used-name">Name *</Label>
                      <Input id="used-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="used-company">Firma</Label>
                      <Input id="used-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="used-email">E-Mail *</Label>
                      <Input id="used-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="used-phone">Telefon</Label>
                      <Input id="used-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="used-message">Ihre Nachricht *</Label>
                    <Textarea
                      id="used-message"
                      required
                      rows={4}
                      placeholder={selectedMachine ? "Ihre Fragen zur Maschine..." : "Beschreiben Sie, welche Maschine Sie suchen..."}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="used-privacy"
                      checked={form.privacy}
                      onCheckedChange={(checked) => setForm({ ...form, privacy: checked === true })}
                    />
                    <Label htmlFor="used-privacy" className="text-xs text-muted-foreground leading-relaxed">
                      Ich stimme der Verarbeitung meiner Daten gemäß der{" "}
                      <a href="/datenschutz" className="underline hover:text-primary" target="_blank">Datenschutzerklärung</a> zu. *
                    </Label>
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Anfrage absenden
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setShowInquiry(false); setSelectedMachine(null); }}>
                      Abbrechen
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </AnimatedSection>
        </section>
      )}

      {/* Contact */}
      <section className="bg-primary text-primary-foreground py-10">
        <div className="section-container text-center">
          <h2 className="text-xl font-bold mb-2">Fragen zu unseren Gebrauchtmaschinen?</h2>
          <p className="text-primary-foreground/80 mb-4">Unser Team berät Sie gerne persönlich.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:0215141799 04" className="flex items-center gap-2 hover:text-accent transition-colors">
              <Phone className="h-4 w-4" /> 02151 417 99 04
            </a>
            <a href="mailto:kaufanfrage@slt-rental.de" className="flex items-center gap-2 hover:text-accent transition-colors">
              <Mail className="h-4 w-4" /> kaufanfrage@slt-rental.de
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
