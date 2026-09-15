import type { Product } from "@/data/rentalData";

/**
 * Einheitliche Preisdarstellung für Mietartikel.
 * Zeigt alle im CMS gepflegten Preise an (Tag, Wochenende, Monat) – ohne dass
 * ein Preis den anderen verdeckt. Der Hauptpreis ist der Tagespreis, wenn
 * vorhanden, sonst der Monatspreis, sonst der SEO-Ab-Preis.
 */
export interface ProductPriceBlockProps {
  product: Product;
  /** Fallback aus productSEOData (dailyPriceFrom) */
  dailyPriceFrom?: number;
  /** Label für den Tagespreis (i18n), Default "/Tag" */
  perDayLabel?: string;
  size?: "sm" | "md";
  className?: string;
}

/** Ergänzt fehlende Währungsangabe, wenn im CMS nur eine Zahl gepflegt wurde. */
export function formatPriceValue(value: string): string {
  const v = value.trim();
  return /^[\d.,]+$/.test(v) ? `${v} €` : v;
}

function netPriceLabel(value: string): string | null {
  const match = value.match(/\d[\d.]*([,.]\d+)?/);
  if (!match) return null;
  const gross = Number(match[0].replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(gross) || gross <= 0) return null;
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(gross / 1.19);
}

function formatFrom(value: number) {
  return `ab ${Number.isInteger(value) ? value : value.toFixed(2).replace(".", ",")} €`;
}

export function hasAnyPrice(product: Product, dailyPriceFrom?: number) {
  return Boolean(
    product.pricePerDay || product.pricePerMonth || product.priceWeekend || typeof dailyPriceFrom === "number"
  );
}

export function ProductPriceBlock({
  product,
  dailyPriceFrom,
  perDayLabel = "/Tag",
  size = "md",
  className,
}: ProductPriceBlockProps) {
  const hasDay = Boolean(product.pricePerDay);
  const hasMonth = Boolean(product.pricePerMonth);
  const hasWeekend = Boolean(product.priceWeekend);
  const hasSeoFrom = typeof dailyPriceFrom === "number";

  // Hauptpreis bestimmen
  let mainValue: string;
  let mainUnit: string;
  if (product.pricePerDay) {
    mainValue = formatPriceValue(product.pricePerDay);
    mainUnit = product.priceUnitLabel ?? perDayLabel;
  } else if (typeof dailyPriceFrom === "number") {
    mainValue = formatFrom(dailyPriceFrom);
    mainUnit = product.priceUnitLabel ?? perDayLabel;
  } else if (product.pricePerMonth) {
    mainValue = formatPriceValue(product.pricePerMonth);
    mainUnit = product.priceUnitLabel ?? "/ Monat";
  } else if (product.priceWeekend) {
    mainValue = formatPriceValue(product.priceWeekend);
    mainUnit = "/ Wochenende";
  } else {
    mainValue = "Preis auf Anfrage";
    mainUnit = "";
  }

  const netLabel = netPriceLabel(mainValue);

  // Zusatztarife (nur, was nicht schon Hauptpreis ist)
  const extras: Array<{ label: string; value: string }> = [];
  if (product.priceWeekend && mainValue !== formatPriceValue(product.priceWeekend)) {
    extras.push({ label: "Wochenende", value: formatPriceValue(product.priceWeekend) });
  }
  if (product.pricePerMonth && mainValue !== formatPriceValue(product.pricePerMonth)) {
    extras.push({
      label: product.minRentalMonths
        ? `Monat (ab ${product.minRentalMonths} Mon.)`
        : "Monat",
      value: formatPriceValue(product.pricePerMonth),
    });
  }

  const mainSize = size === "sm" ? "text-lg" : "text-2xl md:text-xl lg:text-3xl";
  const unitSize = size === "sm" ? "text-xs" : "text-sm md:text-xs lg:text-base";

  return (
    <div className={className}>
      <div className={`${mainSize} font-bold text-primary leading-tight`}>
        <span className="break-words">{mainValue}</span>
        {netLabel && <span className="text-primary">*</span>}
        <span className={`${unitSize} font-normal text-muted-foreground`}> {mainUnit}</span>
      </div>
      {netLabel && (
        <p className="mt-1 text-xs text-muted-foreground">
          Brutto inkl. 19 % USt. ({netLabel} netto)
        </p>
      )}

      {extras.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {extras.map((e) => (
            <li
              key={e.label}
              className="flex flex-wrap items-baseline justify-between gap-x-2 text-xs sm:text-sm"
            >
              <span className="text-muted-foreground">{e.label}</span>
              <span className="font-semibold text-headline">{e.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
