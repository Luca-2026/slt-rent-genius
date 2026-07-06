import { Link } from "react-router-dom";
import { ShoppingCart, Package, ArrowRight } from "lucide-react";

interface SalesEntry {
  label: string;
  price: string;
  href: string;
  badge?: string;
}

interface SalesPagesBannerProps {
  title?: string;
  intro?: string;
  entries: SalesEntry[];
}

/**
 * Prominent cross-sell banner shown on rental product pages when the
 * exact article is also listed for direct purchase (new + used).
 */
export function SalesPagesBanner({
  title = "Diese Matten können Sie auch kaufen",
  intro = "Nachhaltig, robust, wiederverwendbar – für Dauereinsatz oder Eigenlager lohnt sich der Kauf.",
  entries,
}: SalesPagesBannerProps) {
  return (
    <div className="bg-gradient-to-br from-accent/10 to-primary/5 border-2 border-accent/30 rounded-xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
          <ShoppingCart className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-base leading-tight">{title}</p>
          <p className="text-sm text-muted-foreground mt-1 leading-snug">{intro}</p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {entries.map((e) => (
          <Link
            key={e.href}
            to={e.href}
            className="flex items-center justify-between gap-2 bg-background border border-border rounded-lg px-3 py-2.5 hover:border-accent hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Package className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-foreground truncate">{e.label}</span>
                  {e.badge && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                      {e.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{e.price}</span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
