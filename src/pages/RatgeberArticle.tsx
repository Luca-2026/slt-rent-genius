import { useParams, Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { SEO, SLT_BREADCRUMB_JSONLD } from "@/components/SEO";
import { blogArticles, getArticleBySlug } from "@/data/blogArticles";
import { Calendar, ArrowLeft, ArrowRight } from "lucide-react";

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
    if (line.startsWith("## ")) { flushList(); flushOrderedList(); elements.push(<h2 key={i} className="text-2xl font-bold text-foreground mt-10 mb-4">{inlineMarkdown(line.slice(3))}</h2>); continue; }

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

  if (!article) return <Navigate to="/ratgeber" replace />;

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
    image: `https://www.slt-rental.de${article.image}`,
    datePublished: article.date,
    dateModified: article.updatedAt,
    author: { "@type": "Organization", name: "SLT Rental", url: "https://www.slt-rental.de" },
    publisher: { "@type": "Organization", name: "SLT Rental", logo: { "@type": "ImageObject", url: "https://www.slt-rental.de/og-image.jpg" } },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://www.slt-rental.de/ratgeber/${article.slug}` },
  };

  const relatedArticles = article.relatedSlugs
    .map((s) => blogArticles.find((a) => a.slug === s))
    .filter(Boolean) as typeof blogArticles;

  return (
    <Layout>
      <SEO
        title={article.metaTitle}
        description={article.metaDescription}
        canonical={`/ratgeber/${article.slug}`}
        ogType="article"
        ogImage={`https://www.slt-rental.de${article.image}`}
        keywords={article.keyword}
        jsonLd={[breadcrumbJsonLd, articleJsonLd]}
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
          <div className="prose-custom">
            {renderMarkdown(article.content)}
          </div>

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
    </Layout>
  );
};

export default RatgeberArticle;
