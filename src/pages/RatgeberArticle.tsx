import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { SEO, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
import { blogArticles, getArticleBySlug } from "@/data/blogArticles";
import { Calendar, ArrowLeft, ArrowRight, List, MapPin } from "lucide-react";
import { LocationSelectDialog } from "@/components/solutions/LocationSelectDialog";
import { Button } from "@/components/ui/button";

/**
 * Internal-Link-Mapping: Ratgeber-Slug → passende Mietkategorie.
 * Quelle: src/data/rentalData.ts (productCategories[].id).
 * Stand: 2026-06-28 – jede Verlinkung manuell geprüft.
 */
const SLUG_TO_CATEGORY: Record<string, { categoryId: string; label: string }> = {
  "minibagger-mieten-ohne-fuehrerschein": { categoryId: "erdbewegung", label: "Minibagger & Erdbewegung mieten" },
  "anhaenger-24-stunden-mieten-sms-code": { categoryId: "anhaenger", label: "Anhänger 24/7 mieten" },
  "baustelle-innenstadt-baumaschine-beengte-verhaeltnisse": { categoryId: "erdbewegung", label: "Kompakt-Baumaschinen mieten" },
  "geschirr-mieten-hochzeit-mengen-checkliste": { categoryId: "geschirr-glaeser-besteck", label: "Geschirr, Gläser & Besteck mieten" },
  "halteverbotszone-einrichten-ratgeber": { categoryId: "absperrtechnik", label: "Halteverbotsschilder & Absperrtechnik mieten" },
  "anhaenger-fuehrerschein-b-b96-be": { categoryId: "anhaenger", label: "Passenden Anhänger mieten" },
  "anhaenger-richtig-beladen-ladung-sichern": { categoryId: "anhaenger", label: "Passenden Anhänger mieten" },
  "arbeitsbuehne-mieten-typ-arbeitshoehe": { categoryId: "arbeitsbuehnen", label: "Arbeitsbühne mieten" },
};


/** Slugify für stabile Anker-IDs (muss mit prerender-script übereinstimmen). */
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

/** Extrahiert alle ## Headings aus Markdown für das Inhaltsverzeichnis. */
function extractToc(md: string): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = [];
  const seen = new Set<string>();
  for (const line of md.split("\n")) {
    if (line.startsWith("## ") && !line.startsWith("### ")) {
      const text = line.slice(3).trim();
      let id = slugifyHeading(text);
      let i = 2;
      while (seen.has(id)) id = `${slugifyHeading(text)}-${i++}`;
      seen.add(id);
      out.push({ id, text });
    }
  }
  return out;
}



/** Very lightweight Markdown→JSX renderer for our controlled content */
function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let tableRows: string[][] = [];
  let tableHeaders: string[] = [];
  let inTable = false;
  let listItems: React.ReactNode[] = [];
  let inList = false;
  let orderedListItems: React.ReactNode[] = [];
  let inOrderedList = false;

  const flushList = () => {
    if (inList && listItems.length) {
      elements.push(<ul key={`ul-${i}`} className="list-disc pl-6 space-y-1 text-muted-foreground">{listItems}</ul>);
      listItems = [];
      inList = false;
    }
  };

  const flushOrderedList = () => {
    if (inOrderedList && orderedListItems.length) {
      elements.push(<ol key={`ol-${i}`} className="list-decimal pl-6 space-y-1 text-muted-foreground">{orderedListItems}</ol>);
      orderedListItems = [];
      inOrderedList = false;
    }
  };

  const flushTable = () => {
    if (!inTable) return;
    elements.push(
      <div key={`tbl-${i}`} className="overflow-x-auto my-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted">
              {tableHeaders.map((h, j) => (
                <th key={j} className="px-3 py-2 text-left font-semibold border border-border">{inlineMarkdown(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? "" : "bg-muted/50"}>
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-2 border border-border">{inlineMarkdown(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableHeaders = [];
    tableRows = [];
    inTable = false;
  };

  for (; i < lines.length; i++) {
    const line = lines[i];

    // Table row
    if (line.startsWith("|")) {
      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      if (!inTable) {
        tableHeaders = cells;
        inTable = true;
        // skip separator
        if (i + 1 < lines.length && lines[i + 1].startsWith("|") && lines[i + 1].includes("---")) i++;
        continue;
      }
      if (cells.every((c) => /^[-:]+$/.test(c))) continue;
      tableRows.push(cells);
      continue;
    } else {
      flushTable();
    }

    // Headings
    if (line.startsWith("### ")) { flushList(); flushOrderedList(); elements.push(<h3 key={i} className="text-xl font-semibold text-foreground mt-8 mb-3">{inlineMarkdown(line.slice(4))}</h3>); continue; }
    if (line.startsWith("## ")) {
      flushList(); flushOrderedList();
      const text = line.slice(3).trim();
      const id = slugifyHeading(text);
      elements.push(<h2 key={i} id={id} className="text-2xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">{inlineMarkdown(text)}</h2>);
      continue;
    }

    // Unordered list
    if (/^[-*☑] /.test(line.trimStart())) {
      flushOrderedList();
      inList = true;
      const text = line.replace(/^[\s]*[-*☑]\s/, "");
      listItems.push(<li key={i}>{inlineMarkdown(text)}</li>);
      continue;
    } else {
      flushList();
    }

    // Ordered list
    if (/^\d+\.\s/.test(line.trimStart())) {
      flushList();
      inOrderedList = true;
      const text = line.replace(/^\s*\d+\.\s/, "");
      orderedListItems.push(<li key={i}>{inlineMarkdown(text)}</li>);
      continue;
    } else {
      flushOrderedList();
    }

    // Empty line
    if (!line.trim()) continue;

    // Paragraph
    elements.push(<p key={i} className="text-muted-foreground leading-relaxed mb-4">{inlineMarkdown(line)}</p>);
  }

  flushList();
  flushOrderedList();
  flushTable();
  return elements;
}

function inlineMarkdown(text: string): React.ReactNode {
  // Split on bold, links, inline code
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)|`(.+?)`/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1]) parts.push(<strong key={key++} className="font-semibold text-foreground">{match[1]}</strong>);
    else if (match[2] && match[3]) {
      const href = match[3];
      if (href.startsWith("http")) {
        parts.push(<a key={key++} href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">{match[2]}</a>);
      } else {
        parts.push(<Link key={key++} to={href} className="text-primary underline hover:text-primary/80">{match[2]}</Link>);
      }
    } else if (match[4]) parts.push(<code key={key++} className="bg-muted px-1 rounded text-sm">{match[4]}</code>);
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

const RatgeberArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);

  if (!article) return <Navigate to="/ratgeber" replace />;

  const categoryCta = SLUG_TO_CATEGORY[article.slug];


  const breadcrumbJsonLd = SLT_BREADCRUMB_JSONLD([
    { name: "Startseite", url: "/" },
    { name: "Ratgeber", url: "/ratgeber" },
    { name: article.title, url: `/ratgeber/${article.slug}` },
  ]);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    image: `https://www.slt-rental.de${article.ogImage}`,
    datePublished: article.date,
    dateModified: article.updatedAt,
    author: { "@type": "Organization", name: "SLT Rental", url: "https://www.slt-rental.de" },
    publisher: { "@type": "Organization", name: "SLT Rental", logo: { "@type": "ImageObject", url: "https://www.slt-rental.de/og-image.jpg" } },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://www.slt-rental.de/ratgeber/${article.slug}` },
  };

  const faqJsonLd = article.faqs && article.faqs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: article.faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : null;

  const relatedArticles = article.relatedSlugs
    .map((s) => blogArticles.find((a) => a.slug === s))
    .filter(Boolean) as typeof blogArticles;

  const jsonLdBlocks = [breadcrumbJsonLd, articleJsonLd, ...(faqJsonLd ? [faqJsonLd] : [])];

  return (
    <Layout>
      <SEO
        title={article.metaTitle}
        description={article.metaDescription}
        canonical={`/ratgeber/${article.slug}`}
        ogType="article"
        ogImage={`https://www.slt-rental.de${article.ogImage}`}
        keywords={article.keyword}
        jsonLd={jsonLdBlocks}
      />

      <article className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-1">
            <Link to="/" className="hover:text-primary">Startseite</Link>
            <span>/</span>
            <Link to="/ratgeber" className="hover:text-primary">Ratgeber</Link>
            <span>/</span>
            <span className="text-foreground truncate">{article.title}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-8">
            <Calendar className="h-4 w-4" />
            <time dateTime={article.date}>
              {new Date(article.date).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}
            </time>
            <span>·</span>
            <span>{article.category}</span>
          </div>

          {/* Quick facts box */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-10">
            <h2 className="text-base font-semibold text-foreground mb-3">Auf einen Blick</h2>
            <ul className="space-y-2">
              {article.quickFacts.map((fact, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Article body */}
          {/* Inhaltsverzeichnis (für Nutzer & Google SERP-Sitelinks) */}
          {(() => {
            const toc = extractToc(article.content);
            if (toc.length < 3) return null;
            return (
              <nav aria-label="Inhaltsverzeichnis" className="bg-muted/40 border border-border rounded-xl p-5 mb-10">
                <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <List className="h-4 w-4 text-primary" aria-hidden="true" />
                  Inhalt
                </h2>
                <ol className="space-y-1.5 text-sm">
                  {toc.map((t, i) => (
                    <li key={t.id} className="text-muted-foreground">
                      <span className="text-primary mr-2 tabular-nums">{i + 1}.</span>
                      <a href={`#${t.id}`} className="hover:text-primary hover:underline">{t.text}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            );
          })()}

          <div className="prose-custom">
            {renderMarkdown(article.content)}
          </div>

          {/* Interne Verlinkung: Ratgeber → passende Mietkategorie */}
          {categoryCta && (
            <div className="mt-10 bg-primary/5 border border-primary/20 rounded-xl p-5 sm:p-6">
              <div className="flex items-start gap-4 flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                    {categoryCta.label}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Direkt online buchbar an unseren Standorten Krefeld, Bonn und Mülheim an der Ruhr.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-cta-orange-hover shrink-0"
                  onClick={() => setLocationDialogOpen(true)}
                >
                  Standort wählen
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Author block */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Von <strong className="text-foreground">{article.author}</strong>, aktualisiert am{" "}
              {new Date(article.updatedAt).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>


          {/* Related articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-foreground mb-6">Weitere Ratgeber-Artikel</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedArticles.map((ra) => (
                  <Link
                    key={ra.slug}
                    to={`/ratgeber/${ra.slug}`}
                    className="group flex items-center gap-3 p-4 rounded-lg border border-border hover:shadow-md transition-shadow"
                  >
                    <ArrowRight className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors text-sm line-clamp-2">
                        {ra.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{ra.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="mt-10">
            <Link to="/ratgeber" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Alle Ratgeber-Artikel
            </Link>
          </div>
        </div>
      </article>

      {/* Hidden crawlable content for prerendering */}
      <div className="sr-only" aria-hidden="true">
        <h1>{article.title}</h1>
        {article.quickFacts.map((f, i) => <p key={i}>{f}</p>)}
      </div>

      {categoryCta && (
        <LocationSelectDialog
          open={locationDialogOpen}
          onOpenChange={setLocationDialogOpen}
          targetCategoryId={categoryCta.categoryId}
          title={categoryCta.label}
          description="Wähle Deinen Standort – wir zeigen Dir die verfügbaren Artikel."
        />
      )}
    </Layout>
  );
};

export default RatgeberArticle;

