import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { SEO, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, ArrowRight, Package, Tag, Search, X, SlidersHorizontal,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

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

  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortKey>("featured");

  const brands = useMemo(() => {
    const set = new Set<string>();
    (machines || []).forEach((m: any) => m.brand && set.add(m.brand));
    return Array.from(set).sort();
  }, [machines]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (machines || []).forEach((m: any) => m.category && set.add(m.category));
    return Array.from(set).sort();
  }, [machines]);

  const filtered = useMemo(() => {
    let list = [...(machines || [])];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((m: any) =>
        [m.name, m.model, m.brand, m.short_description, m.article_number, m.category]
          .filter(Boolean)
          .some((v: string) => v.toLowerCase().includes(q))
      );
    }
    if (brand !== "all") list = list.filter((m: any) => m.brand === brand);
    if (category !== "all") list = list.filter((m: any) => m.category === category);

    switch (sort) {
      case "price-asc":
        list.sort((a: any, b: any) => (Number(a.price_gross) || Infinity) - (Number(b.price_gross) || Infinity));
        break;
      case "price-desc":
        list.sort((a: any, b: any) => (Number(b.price_gross) || -Infinity) - (Number(a.price_gross) || -Infinity));
        break;
      case "name":
        list.sort((a: any, b: any) => (a.name || "").localeCompare(b.name || "", "de"));
        break;
      case "featured":
      default:
        list.sort((a: any, b: any) => {
          if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
          return (a.sort_order ?? 0) - (b.sort_order ?? 0);
        });
    }
    return list;
  }, [machines, search, brand, category, sort]);

  const hasActiveFilters = search || brand !== "all" || category !== "all" || sort !== "featured";
  const resetFilters = () => {
    setSearch("");
    setBrand("all");
    setCategory("all");
    setSort("featured");
  };

  return (
    <Layout>
      <SEO
        title="Neumaschinen kaufen – BAUMAX, Zoomlion & Temared | SLT Rental"
        description="Neue Baumaschinen kaufen bei SLT Rental: BAUMAX Raddumper, Rüttelplatten, Zoomlion Bagger und Temared Anhänger. Autorisierter Fachhändler in NRW mit Garantie, Service und Lieferung."
        canonical="/verkauf/neumaschinen"
        ogType="website"
        jsonLd={[
          SLT_BREADCRUMB_JSONLD([
            { name: "Home", url: "/" },
            { name: "Verkauf", url: "/verkauf" },
            { name: "Neumaschinen", url: "/verkauf/neumaschinen" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Neumaschinen bei SLT Rental",
            itemListElement: (machines || []).map((m: any, i: number) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://www.slt-rental.de/verkauf/neumaschinen/${m.slug}`,
              name: m.name,
            })),
          },
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

      {/* Filter Bar */}
      <section className="bg-background border-b border-border sticky top-0 z-20 shadow-sm">
        <div className="section-container py-4">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Suche nach Modell, Marke oder Artikelnummer …"
                className="pl-9"
                aria-label="Neumaschinen durchsuchen"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 lg:flex lg:gap-2">
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger className="lg:w-[160px]" aria-label="Marke filtern">
                  <SelectValue placeholder="Marke" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Marken</SelectItem>
                  {brands.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="lg:w-[200px]" aria-label="Kategorie filtern">
                  <SelectValue placeholder="Kategorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="lg:w-[180px]" aria-label="Sortierung">
                  <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
                  <SelectValue placeholder="Sortieren" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Empfohlen</SelectItem>
                  <SelectItem value="price-asc">Preis aufsteigend</SelectItem>
                  <SelectItem value="price-desc">Preis absteigend</SelectItem>
                  <SelectItem value="name">Name (A–Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1 self-start lg:self-auto">
                <X className="h-3.5 w-3.5" /> Zurücksetzen
              </Button>
            )}
          </div>
          {!isLoading && (
            <p className="text-xs text-muted-foreground mt-3">
              {filtered.length} {filtered.length === 1 ? "Artikel" : "Artikel"}
              {hasActiveFilters && machines && ` von ${machines.length}`}
            </p>
          )}
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
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Search className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">Keine Neumaschinen passen zu deinen Filtern.</p>
            <Button onClick={resetFilters} variant="outline">Filter zurücksetzen</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((m: any) => {
              const img = Array.isArray(m.images) && m.images.length > 0 ? m.images[0] : null;
              return (
                <Link key={m.id} to={`/verkauf/neumaschinen/${m.slug}`} className="group flex">
                  <Card className="h-full w-full flex flex-col hover:shadow-lg hover:border-primary/40 transition-all overflow-hidden">
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
                    <CardContent className="p-5 flex flex-col flex-1">
                      <div className="flex flex-wrap gap-2 mb-2 min-h-[28px]">
                        <Badge variant="outline">{m.brand}</Badge>
                        {m.category && (
                          <Badge variant="secondary" className="font-normal">{m.category}</Badge>
                        )}
                        {m.is_featured && (
                          <Badge className="bg-accent text-accent-foreground">Top-Angebot</Badge>
                        )}
                      </div>
                      <h2 className="font-bold text-headline text-lg leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-3 min-h-[4.5rem]">
                        {m.name}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[2.5rem]">
                        {m.short_description || ""}
                      </p>
                      <div className="mt-auto flex items-baseline justify-between gap-2 pt-3 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">Preis</p>
                          <p className="text-lg font-bold text-primary">
                            {formatPriceGross(m.price_gross ? Number(m.price_gross) : null, m.price_on_request)}
                          </p>
                          {!m.price_on_request && m.price_gross && (
                            <p className="text-xs text-muted-foreground">brutto inkl. MwSt.</p>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                          Details <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3 inline-flex items-center gap-1 min-h-[1rem]">
                        {m.article_number ? (
                          <>
                            <Tag className="h-3 w-3" /> Art.-Nr. {m.article_number}
                          </>
                        ) : (
                          <>&nbsp;</>
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Beratungs-CTA */}
        <div className="mt-12 bg-muted/40 rounded-xl border border-border p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-foreground mb-1">
              Dein Wunschmodell nicht dabei?
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Stell uns eine unverbindliche Kaufanfrage – wir beraten persönlich zu Zoomlion, BAUMAX und Temared und liefern NRW-weit.
            </p>
          </div>
          <Link to="/verkauf#kaufanfrage">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 whitespace-nowrap">
              Kaufanfrage stellen <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
