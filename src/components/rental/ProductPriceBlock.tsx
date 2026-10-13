import type { Product } from "@/data/rentalData";
import { useCustomerType } from "@/hooks/useCustomerType";
import { displayPrice, type CustomerType } from "@/lib/priceDisplay";
import { CustomerTypeToggle } from "@/components/rental/CustomerTypePrompt";

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


export function hasAnyPrice(product: Product, dailyPriceFrom?: number) {
  return Boolean(
    product.pricePerDay || product.pricePerMonth || product.priceWeekend || typeof dailyPriceFrom === "number"
  );
}

/** CMS-Nettopreis in der Darstellung der gewählten Kundengruppe. */
export function priceText(value: string | number, type: CustomerType): string {
  return typeof value === "number" ? `ab ${displayPrice(value, type)}` : displayPrice(formatPriceValue(value), type);
}

export function ProductPriceBlock({
  product,
  dailyPriceFrom,
  perDayLabel = "/Tag",
  size = "md",
  className,
}: ProductPriceBlockProps) {
  const { type } = useCustomerType();
  const hasDay = Boolean(product.pricePerDay);
  const hasMonth = Boolean(product.pricePerMonth);
  const hasWeekend = Boolean(product.priceWeekend);
  const hasSeoFrom = typeof dailyPriceFrom === "number";

  // Hauptpreis bestimmen
  let mainValue: string;
  let mainUnit: string;
  if (product.pricePerDay) {
    mainValue = priceText(product.pricePerDay, type);
    mainUnit = product.priceUnitLabel ?? perDayLabel;
  } else if (typeof dailyPriceFrom === "number") {
    mainValue = priceText(dailyPriceFrom, type);
    mainUnit = product.priceUnitLabel ?? perDayLabel;
  } else if (product.pricePerMonth) {
    mainValue = priceText(product.pricePerMonth, type);
    mainUnit = product.priceUnitLabel ?? "/ Monat";
  } else if (product.priceWeekend) {
    mainValue = priceText(product.priceWeekend, type);
    mainUnit = "/ Wochenende";
  } else {
    mainValue = "Preis auf Anfrage";
    mainUnit = "";
  }

  const hasPrice = mainValue !== "Preis auf Anfrage";

  // Zusatztarife (nur, was nicht schon Hauptpreis ist)
  const extras: Array<{ label: string; value: string }> = [];
  if (product.priceWeekend && mainValue !== priceText(product.priceWeekend, type)) {
    extras.push({ label: "Wochenende", value: priceText(product.priceWeekend, type) });
  }
  if (product.pricePerMonth && mainValue !== priceText(product.pricePerMonth, type)) {
    extras.push({
      label: product.minRentalMonths
        ? `Monat (ab ${product.minRentalMonths} Mon.)`
        : "Monat",
      value: priceText(product.pricePerMonth, type),
    });
  }

  const mainSize = size === "sm" ? "text-lg" : "text-2xl md:text-xl lg:text-3xl";
  const unitSize = size === "sm" ? "text-xs" : "text-sm md:text-xs lg:text-base";

  return (
    <div className={className}>
      <div className={`${mainSize} font-bold text-primary leading-tight`}>
        <span className="break-words">{mainValue}</span>
        {hasPrice && <span className="text-primary">*</span>}
        <span className={`${unitSize} font-normal text-muted-foreground`}> {mainUnit}</span>
      </div>
      {hasPrice && <CustomerTypeToggle className="mt-2" />}

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
