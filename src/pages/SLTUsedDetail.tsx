import { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, ArrowRight, Phone, Mail, MapPin, Shield, Wrench, Clock, Truck,
  CheckCircle2, Package, Download, PlayCircle,
} from "lucide-react";
import { UsedMachineInquiryModal, type MachineData } from "@/components/used/UsedMachineInquiryModal";
import { LazyVideo } from "@/components/used/LazyVideo";

const locationLabels: Record<string, string> = {
  krefeld: "Krefeld", bonn: "Bonn", muelheim: "Mülheim an der Ruhr",
};

function formatPrice(price: number | null, onRequest: boolean) {
  if (onRequest || !price) return "Preis auf Anfrage";
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(price);
}

export default function SLTUsedDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const { data: machine, isLoading } = useQuery({
    queryKey: ["used-machine", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("used_machines")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="section-container py-20 text-center text-muted-foreground">Lade Maschine…</div>
      </Layout>
    );
  }

  if (!machine) {
    return <Navigate to="/verkauf/gebrauchtmaschinen" replace />;
  }

  const priceNet = machine.price_net ? Number(machine.price_net) : null;
  const priceGross = priceNet ? priceNet * 1.19 : null;
  const isReserved = machine.status === "reserved";
  const isSold = machine.status === "sold";

  const content: any = (machine as any).content || {};
  const showroomLocsForData: string[] = Array.isArray(content.showroomLocations) && content.showroomLocations.length > 0
    ? content.showroomLocations
    : (machine.location ? [machine.location] : []);

  const machineData: MachineData = {
    id: machine.id,
    manufacturer: machine.manufacturer,
    model: machine.model,
    year: machine.year,
    price: formatPrice(priceNet, machine.price_on_request),
    location: machine.location || "",
    pickupLocations: showroomLocsForData,
    referenceNumber: machine.reference_number || "",
    status: machine.status,
  };

  const images: string[] = (machine.images && machine.images.length > 0) ? machine.images : [];
  const specs: Record<string, string> = (machine.specifications as any) || {};
  const highlights: string[] = Array.isArray(content.highlights) ? content.highlights : [];
  const whyItems: { title: string; desc: string }[] = Array.isArray(content.whyItems) ? content.whyItems : [];
  const showroomLocs: string[] = showroomLocsForData;
  const showroomNames = showroomLocs.map((l: string) => locationLabels[l] || l).join(" oder ");

  const title = `${machine.manufacturer} ${machine.model} gebraucht kaufen | SLT Used`;
  const description = `${machine.manufacturer} ${machine.model}${machine.year ? `, Bj. ${machine.year}` : ""}${machine.hours != null ? `, ${machine.hours} Bh` : ""} – geprüfte Gebrauchtmaschine aus dem SLT-Mietpark${machine.location ? `, Standort ${locationLabels[machine.location] || machine.location}` : ""}. ${priceNet ? `Sonderpreis ${formatPrice(priceNet, false)} netto.` : "Preis auf Anfrage."}`;
  const seoKeywords: string[] = Array.isArray(content.seoKeywords) ? content.seoKeywords : [];

  return (
    <Layout>
      <SEO
        title={title}
        description={description}
        keywords={seoKeywords.length > 0 ? seoKeywords.join(", ") : undefined}
        canonical={`/verkauf/gebrauchtmaschinen/${slug}`}
        ogImage={images[0]}
      />

      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="section-container py-3 text-sm text-muted-foreground">
          <Link to="/verkauf/gebrauchtmaschinen" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
            <ArrowLeft className="h-3 w-3" />
            Zurück zu allen Gebrauchtmaschinen
          </Link>
        </div>
      </div>

      <section className="section-container py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div>
            <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden mb-3 flex items-center justify-center">
              {images.length > 0 ? (
                <img
                  src={images[activeImage]}
                  alt={`${machine.manufacturer} ${machine.model}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <Package className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square rounded overflow-hidden border-2 transition-all ${
                      idx === activeImage ? "border-primary" : "border-transparent hover:border-primary/40"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {machine.is_featured && (
                <Badge className="bg-accent text-accent-foreground">Top-Angebot</Badge>
              )}
              {isReserved && <Badge variant="secondary">Reserviert</Badge>}
              {isSold && <Badge variant="destructive">Verkauft</Badge>}
              <Badge variant="outline">SLT Used</Badge>
            </div>

            <p className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-1">
              {machine.manufacturer}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-headline mb-3">
              {machine.model}
            </h1>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground mb-6">
              {machine.year && <span>Baujahr {machine.year}</span>}
              {machine.hours != null && <span>{machine.hours.toLocaleString("de-DE")} Betriebsstunden</span>}
              {machine.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {locationLabels[machine.location] || machine.location}
                </span>
              )}
              {machine.reference_number && <span>Ref.-Nr. {machine.reference_number}</span>}
            </div>

            <Card className="mb-6 border-primary/20">
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sonderpreis</p>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-3xl font-bold text-primary">
                    {priceNet ? formatPrice(priceNet, false) : "Preis auf Anfrage"}
                  </span>
                  {priceNet && <span className="text-sm text-muted-foreground">netto zzgl. 19 % USt.</span>}
                </div>
                {priceGross && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatPrice(priceGross, false)} brutto inkl. USt.
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-3">
                  Bei innergemeinschaftlicher Lieferung an Unternehmer mit gültiger USt-IdNr.: 0 % USt.
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Button
                size="lg"
                className="flex-1"
                onClick={() => setModalOpen(true)}
                disabled={isSold}
              >
                {isSold ? "Verkauft" : "Anfrage senden"}
                {!isSold && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="tel:021514179904" className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4" /> 02151 417 99 04
                </a>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { icon: Shield, text: "Geprüft & gewartet" },
                { icon: Wrench, text: "Servicehistorie lückenlos" },
                { icon: Clock, text: "Sofort verfügbar" },
                { icon: Truck, text: "Lieferung möglich" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-muted-foreground">
                  <item.icon className="h-4 w-4 text-primary flex-shrink-0" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      {machine.description && (
        <section className="section-container py-8 md:py-12 border-t border-border">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-headline mb-4">Beschreibung</h2>
            <div className="prose prose-neutral max-w-none text-foreground/90 leading-relaxed whitespace-pre-line">
              {machine.description}
            </div>
          </div>
        </section>
      )}

      {/* Highlights */}
      {highlights.length > 0 && (
        <section className="section-container py-8 md:py-12 border-t border-border">
          <h2 className="text-2xl font-bold text-headline mb-6">Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {highlights.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/90">{item}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Why section */}
      {whyItems.length > 0 && (
        <section className="bg-muted/30 py-10 md:py-14">
          <div className="section-container">
            {content.whyTitle && (
              <h2 className="text-2xl font-bold text-headline mb-3">{content.whyTitle}</h2>
            )}
            {content.whyIntro && (
              <p className="text-muted-foreground mb-6 max-w-3xl">{content.whyIntro}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {whyItems.map((it, idx) => (
                <Card key={idx} className="p-4">
                  <p className="font-semibold text-headline text-sm mb-1">{it.title}</p>
                  <p className="text-sm text-muted-foreground">{it.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Dealer / Service info */}
      {content.dealerInfo && (
        <section className="section-container py-8 md:py-12 border-t border-border">
          <Card className="p-6 border-primary/30 bg-primary/5">
            <div className="flex items-start gap-3">
              <Wrench className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-headline mb-2">Autorisierter Vertriebs- & Servicepartner</h3>
                <p className="text-foreground/90 leading-relaxed mb-3">{content.dealerInfo.text}</p>
                {content.dealerInfo.linkUrl && (
                  <a
                    href={content.dealerInfo.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-medium underline underline-offset-2"
                  >
                    {content.dealerInfo.linkText || content.dealerInfo.linkUrl}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Specifications */}
      {Object.keys(specs).length > 0 && (
        <section className="section-container py-8 md:py-12 border-t border-border">
          <h2 className="text-2xl font-bold text-headline mb-6">Technische Daten</h2>
          <div className="max-w-3xl">
            <dl className="divide-y divide-border border border-border rounded-lg overflow-hidden">
              {Object.entries(specs).map(([key, val]) => (
                <div key={key} className="grid grid-cols-2 gap-4 px-4 py-3 even:bg-muted/30">
                  <dt className="text-sm text-muted-foreground">{key}</dt>
                  <dd className="text-sm font-medium text-foreground">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* Einsatzbereiche */}
      {content.usageAreas && (
        <section className="section-container py-8 md:py-12 border-t border-border">
          <h2 className="text-2xl font-bold text-headline mb-4">Einsatzbereiche</h2>
          <p className="text-foreground/90 leading-relaxed max-w-4xl whitespace-pre-line">
            {content.usageAreas}
          </p>
        </section>
      )}

      {/* Alternativen / Vergleichbare Modelle */}
      {content.alternativesNote && (
        <section className="section-container py-8 md:py-12 border-t border-border">
          <h2 className="text-2xl font-bold text-headline mb-4">
            {content.alternativesTitle || "Vergleichbare Modelle anderer Hersteller"}
          </h2>
          <p className="text-foreground/90 leading-relaxed max-w-4xl">
            {content.alternativesNote}
          </p>
        </section>
      )}

      {/* 360° Video */}
      {content.videoUrl && (
        <section className="section-container py-8 md:py-12 border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <PlayCircle className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-headline">
              {content.videoCaption || "360°-Ansicht"}
            </h2>
          </div>
          <div className="max-w-xs rounded-lg overflow-hidden bg-black">
            <LazyVideo
              src={content.videoUrl}
              className="w-full h-auto"
            />
          </div>
        </section>
      )}

      {/* Downloads */}
      {Array.isArray(content.downloads) && content.downloads.length > 0 && (
        <section className="section-container py-8 md:py-12 border-t border-border">
          <h2 className="text-2xl font-bold text-headline mb-4">Downloads</h2>
          <div className="flex flex-wrap gap-3 max-w-4xl">
            {content.downloads.map((dl: { label: string; url: string }, idx: number) => (
              <Button key={idx} variant="outline" size="lg" asChild>
                <a href={dl.url} target="_blank" rel="noopener noreferrer" download>
                  <Download className="mr-2 h-4 w-4" />
                  {dl.label}
                </a>
              </Button>
            ))}
          </div>
        </section>
      )}

      {/* Standort & CTA */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="section-container text-center">
          <h2 className="text-2xl font-bold mb-3 text-primary-foreground">
            Besichtigung {showroomLocs.length > 1 ? "an unseren Standorten" : "am Standort"}{" "}
            {showroomNames || locationLabels[machine.location || ""] || "Krefeld"}
          </h2>
          <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
            {content.warrantyNote || "Maschine geprüft, professionell gewartet und übergabefertig. Besichtigung jederzeit nach Terminvereinbarung möglich."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" onClick={() => setModalOpen(true)} disabled={isSold}>
              Anfrage senden <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <a href="tel:021514179904" className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4" /> 02151 417 99 04
              </a>
            </Button>
          </div>
        </div>
      </section>

      <UsedMachineInquiryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        machine={machineData}
      />
    </Layout>
  );
}
