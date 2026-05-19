import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronUp, Download } from "lucide-react";
import {
  AGB_B2B_META,
  AGB_B2B_SECTIONS,
  type LegalSection,
} from "@/data/legal/agb-b2b";
import { AGB_B2C_META, AGB_B2C_SECTIONS } from "@/data/legal/agb-b2c";
import { WIDERRUF_META, WIDERRUF_SECTIONS } from "@/data/legal/widerruf";

type TabKey = "b2b" | "b2c" | "widerruf";

const TABS: { key: TabKey; label: string; short: string }[] = [
  { key: "b2b", label: "AGB für Unternehmer (B2B)", short: "B2B" },
  { key: "b2c", label: "AGB für Verbraucher (B2C)", short: "B2C" },
  { key: "widerruf", label: "Widerrufsbelehrung", short: "Widerruf" },
];

const PDF_DOWNLOADS: Record<TabKey, { href: string; label: string }> = {
  b2b: { href: "/legal/AGB-B2B.pdf", label: "AGB B2B als PDF herunterladen" },
  b2c: { href: "/legal/AGB-B2C.pdf", label: "AGB B2C als PDF herunterladen" },
  widerruf: { href: "/legal/Widerrufsbelehrung.pdf", label: "Widerrufsbelehrung als PDF herunterladen" },
};

const DATA: Record<
  TabKey,
  { meta: { title: string; subtitle: string; stand: string }; sections: LegalSection[] }
> = {
  b2b: { meta: AGB_B2B_META, sections: AGB_B2B_SECTIONS },
  b2c: { meta: AGB_B2C_META, sections: AGB_B2C_SECTIONS },
  widerruf: { meta: WIDERRUF_META, sections: WIDERRUF_SECTIONS },
};

function getInitialTab(hash: string): TabKey {
  if (hash.startsWith("#b2c")) return "b2c";
  if (hash.startsWith("#widerruf")) return "widerruf";
  return "b2b";
}

function getHashAnchor(hash: string): string | null {
  const m = hash.match(/^#(?:b2b|b2c|widerruf)\/(.+)$/);
  return m ? m[1] : null;
}

function SectionRenderer({ section, tabKey }: { section: LegalSection; tabKey: TabKey }) {
  return (
    <section id={`${tabKey}-${section.id}`} className="scroll-mt-32 mb-12">
      <h2 className="text-2xl font-bold text-primary mb-6 border-b border-border pb-2">
        {section.number} {section.title}
      </h2>
      {section.subsections.map((sub) => (
        <div
          key={sub.id}
          id={`${tabKey}-${sub.id}`}
          className="scroll-mt-32 mb-6"
        >
          {sub.number && (
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {sub.number} {sub.title}
            </h3>
          )}
          {!sub.number && sub.title !== section.title && (
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {sub.title}
            </h3>
          )}
          <div className="space-y-3 text-body text-muted-foreground leading-relaxed">
            {sub.body.map((b, i) => {
              if (b.type === "p")
                return <p key={i}>{b.text}</p>;
              if (b.type === "h3")
                return (
                  <h4 key={i} className="font-semibold text-foreground mt-2">
                    {b.text}
                  </h4>
                );
              return (
                <ul key={i} className="list-none pl-4 space-y-1">
                  {b.items.map((item, j) => (
                    <li key={j} className="pl-2 border-l-2 border-border">
                      {item}
                    </li>
                  ))}
                </ul>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

export default function AGB() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>(() => getInitialTab(location.hash));
  const [showTop, setShowTop] = useState(false);

  const data = DATA[tab];

  // Sync hash → tab and scroll to anchor
  useEffect(() => {
    const newTab = getInitialTab(location.hash);
    if (newTab !== tab) setTab(newTab);
    const anchor = getHashAnchor(location.hash);
    if (anchor) {
      requestAnimationFrame(() => {
        const el = document.getElementById(`${newTab}-${anchor}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } else if (location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleTabChange = (val: string) => {
    const newTab = val as TabKey;
    setTab(newTab);
    navigate(`/agb#${newTab}`, { replace: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAnchor = (subId: string) => {
    navigate(`/agb#${tab}/${subId}`, { replace: false });
  };

  const seoTitle = useMemo(() => {
    if (tab === "b2b") return "AGB B2B – Unternehmer | SLT Rental";
    if (tab === "b2c") return "AGB B2C – Verbraucher | SLT Rental";
    return "Widerrufsbelehrung Verbraucher | SLT Rental";
  }, [tab]);

  return (
    <Layout>
      <SEO
        title={seoTitle}
        description="Allgemeine Geschäfts- und Vermietbedingungen sowie Widerrufsbelehrung der SLT Technology Group GmbH & Co. KG / SLT-Rental."
        canonical="/agb"
        noIndex
      />

      <div className="bg-muted/30 py-12 md:py-16">
        <div className="section-container">
          <AnimatedSection animation="fade-in-up">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
              Allgemeine Geschäfts- und Vermietbedingungen
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Bitte wähle die für Dich passende Variante: AGB für
              Unternehmer (B2B), AGB für Verbraucher (B2C) oder die
              Widerrufsbelehrung für Verbraucher inkl. Muster-Formular.
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="section-container py-8 md:py-12">
        <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto gap-1 p-1 mb-8">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.key}
                value={t.key}
                className="py-3 text-sm md:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map((t) => {
            const d = DATA[t.key];
            return (
              <TabsContent key={t.key} value={t.key} className="mt-0">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                      {d.meta.title}
                    </h2>
                    <p className="text-muted-foreground">{d.meta.subtitle}</p>
                    <p className="text-sm text-muted-foreground italic mt-1">
                      {d.meta.stand}
                    </p>
                  </div>
                  <Button asChild variant="outline" className="shrink-0">
                    <a
                      href={PDF_DOWNLOADS[t.key].href}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      aria-label={PDF_DOWNLOADS[t.key].label}
                    >
                      <Download className="h-4 w-4" />
                      PDF herunterladen
                    </a>
                  </Button>
                </div>

                <div className="grid lg:grid-cols-[260px_1fr] gap-8">
                  {/* TOC */}
                  <aside className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
                    <nav
                      aria-label="Inhaltsverzeichnis"
                      className="border border-border rounded-lg p-4 bg-card"
                    >
                      <h3 className="text-sm font-bold text-primary uppercase tracking-wide mb-3">
                        Inhaltsverzeichnis
                      </h3>
                      <ol className="space-y-2 text-sm">
                        {d.sections.map((s) => (
                          <li key={s.id}>
                            <button
                              type="button"
                              onClick={() => handleAnchor(s.id)}
                              className="text-left text-foreground hover:text-primary transition-colors font-medium"
                            >
                              {s.number} {s.title}
                            </button>
                            {s.subsections.length > 1 && (
                              <ul className="mt-1 ml-3 space-y-1 border-l border-border pl-3">
                                {s.subsections.map((sub) => (
                                  <li key={sub.id}>
                                    <button
                                      type="button"
                                      onClick={() => handleAnchor(sub.id)}
                                      className="text-left text-muted-foreground hover:text-primary transition-colors text-xs leading-snug"
                                    >
                                      {sub.number ? `${sub.number} ` : ""}
                                      {sub.title}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ol>
                    </nav>
                  </aside>

                  {/* Content */}
                  <article className="min-w-0">
                    {d.sections.map((s) => (
                      <SectionRenderer key={s.id} section={s} tabKey={t.key} />
                    ))}

                    <div className="mt-12 pt-6 border-t border-border text-sm text-muted-foreground">
                      <p>{d.meta.stand}</p>
                      <p>SLT Technology Group GmbH &amp; Co. KG · Hauptsitz: Krefeld</p>
                    </div>
                  </article>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {showTop && (
        <Button
          size="icon"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 rounded-full shadow-lg"
          aria-label="Nach oben"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
    </Layout>
  );
}
