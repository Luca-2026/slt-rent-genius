import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { SEO, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Package, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

function formatPriceGross(price: number | null, onRequest: boolean) {
  if (onRequest || !price) return "Preis auf Anfrage";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function Neumaschinen() {
  const { data: machines, isLoading } = useQuery({
    queryKey: ["new-machines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("new_machines")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <Layout>
      <SEO
        title="Neumaschinen kaufen – BAUMAX, Zoomlion & Temared | SLT Rental"
        description="Neue Baumaschinen kaufen bei SLT Rental: BAUMAX Raddumper, Rüttelplatten, Zoomlion Bagger und Temared Anhänger. Autorisierter Fachhändler in NRW."
        canonical="/verkauf/neumaschinen"
        ogType="website"
        jsonLd={[
          SLT_BREADCRUMB_JSONLD([
            { name: "Home", url: "/" },
            { name: "Verkauf", url: "/verkauf" },
            { name: "Neumaschinen", url: "/verkauf/neumaschinen" },
          ]),
        ]}
      />

      <div className="bg-muted/30 border-b border-border">
        <div className="section-container py-3 text-sm text-muted-foreground">
          <Link to="/verkauf" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
            <ArrowLeft className="h-3 w-3" />
            Zurück zum Verkauf
          </Link>
        </div>
      </div>

      <section className="bg-primary py-12 lg:py-16">
        <div className="section-container">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-3">
            Neumaschinen kaufen
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl">
            Neue Baumaschinen direkt vom autorisierten Fachhändler – mit Garantie, Service und persönlicher Beratung in NRW.
          </p>
        </div>
      </section>

      <section className="section-container py-10 md:py-14">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-12">Lade Neumaschinen…</p>
        ) : !machines || machines.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Aktuell sind keine Neumaschinen-Artikel hinterlegt.</p>
            <Link to="/verkauf" className="inline-block mt-4">
              <Button>Zur Verkauf-Übersicht</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machines.map((m) => {
              const img = Array.isArray(m.images) && m.images.length > 0 ? m.images[0] : null;
              return (
                <Link key={m.id} to={`/verkauf/neumaschinen/${m.slug}`} className="group">
                  <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
                      {img ? (
                        <img
                          src={img}
                          alt={m.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <Package className="h-16 w-16 text-muted-foreground/30" />
                      )}
                    </div>
                    <CardContent className="p-5">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline">{m.brand}</Badge>
                        {m.is_featured && (
                          <Badge className="bg-accent text-accent-foreground">Top-Angebot</Badge>
                        )}
                      </div>
                      <h2 className="font-bold text-headline text-lg leading-snug mb-2 group-hover:text-primary transition-colors">
                        {m.name}
                      </h2>
                      {m.short_description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {m.short_description}
                        </p>
                      )}
                      <div className="flex items-baseline justify-between gap-2 pt-2 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">Preis</p>
                          <p className="text-lg font-bold text-primary">
                            {formatPriceGross(m.price_gross ? Number(m.price_gross) : null, m.price_on_request)}
                          </p>
                          {!m.price_on_request && m.price_gross && (
                            <p className="text-xs text-muted-foreground">brutto inkl. MwSt.</p>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 text-sm text-primary group-hover:translate-x-0.5 transition-transform">
                          Details <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      {m.article_number && (
                        <p className="text-xs text-muted-foreground mt-3 inline-flex items-center gap-1">
                          <Tag className="h-3 w-3" /> Art.-Nr. {m.article_number}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
}
