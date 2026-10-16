import type { Product } from "@/data/rentalData";
import { useCustomerType } from "@/hooks/useCustomerType";
import { displayPrice, type CustomerType } from "@/lib/priceDisplay";
import { CustomerTypeToggle } from "@/components/rental/CustomerTypePrompt";
import { resolveProductPrices, type LocationPriceRow, type ManagedPrices } from "@/lib/pricing/rentalPricing";

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
  /** Zusatztarife ausblenden, wenn darunter die Staffelpreise (inkl. Wochenendtarif) stehen. */
  hideExtras?: boolean;
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
  hideExtras = false,
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
  if (!hideExtras && product.priceWeekend && mainValue !== priceText(product.priceWeekend, type)) {
    extras.push({ label: "Wochenende", value: priceText(product.priceWeekend, type) });
  }
  if (!hideExtras && product.pricePerMonth && mainValue !== priceText(product.pricePerMonth, type)) {
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
        {mainUnit && (
          <span className={`${unitSize} font-normal text-muted-foreground ml-1.5 whitespace-nowrap`}>{mainUnit}</span>
        )}
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

/** Staffelpreise des Produkts aus den CMS-Feldern (netto), inkl. Standortpreisen. */
export function productManagedPrices(product: Product, location?: string | null, locationRows: LocationPriceRow[] = []): ManagedPrices {
  return resolveProductPrices(
    {
      id: product.managedId ?? null,
      pricing_scheme: product.pricingScheme ?? null,
      price_per_day: product.pricePerDay ?? null,
      price_from_1_rd: product.priceFrom1Rd ?? null,
      price_from_3_rd: product.priceFrom3Rd ?? null,
      price_from_10_rd: product.priceFrom10Rd ?? null,
      price_from_20_rd: product.priceFrom20Rd ?? null,
      price_weekend_num: product.priceWeekendNum ?? null,
      price_base_1_3_cd: product.priceBase13Cd ?? null,
      surcharge_per_cd_from_4: product.surchargePerCdFrom4 ?? null,
      surcharge_per_cd_from_8: product.surchargePerCdFrom8 ?? null,
    },
    location,
    locationRows,
  );
}

export interface RentalPriceTiersProps {
  product: Product;
  location?: string | null;
  locationRows?: LocationPriceRow[];
  className?: string;
}

/**
 * W1: Block „Mietpreise“ mit den gepflegten Staffeln (nur gefüllte Stufen).
 * Nur für Artikel ohne Rentware-Code gedacht – die Einblendung steuert die Seite.
 */
export function RentalPriceTiers({ product, location, locationRows = [], className }: RentalPriceTiersProps) {
  const { type } = useCustomerType();
  const prices = productManagedPrices(product, location, locationRows);
  const rows: Array<{ label: string; value: string }> = [];

  if (product.pricingScheme === "bau") {
    if (prices.price_from_1_rd !== null) rows.push({ label: "ab 1 Miettag", value: `${displayPrice(prices.price_from_1_rd, type)} / Miettag` });
    if (prices.price_from_3_rd !== null) rows.push({ label: "ab 3 Miettagen", value: `${displayPrice(prices.price_from_3_rd, type)} / Miettag` });
    if (prices.price_from_10_rd !== null) rows.push({ label: "ab 10 Miettagen", value: `${displayPrice(prices.price_from_10_rd, type)} / Miettag` });
    if (prices.price_from_20_rd !== null) rows.push({ label: "ab 20 Miettagen", value: `${displayPrice(prices.price_from_20_rd, type)} / Miettag` });
  } else {
    if (prices.price_base_1_3_cd !== null) rows.push({ label: "1–3 Kalendertage", value: displayPrice(prices.price_base_1_3_cd, type) });
    if (prices.surcharge_per_cd_from_4 !== null) rows.push({ label: "ab 4 Kalendertagen", value: `+ ${displayPrice(prices.surcharge_per_cd_from_4, type)} / Tag` });
    if (prices.surcharge_per_cd_from_8 !== null) rows.push({ label: "ab 8 Kalendertagen", value: `+ ${displayPrice(prices.surcharge_per_cd_from_8, type)} / Tag` });
  }
  if (prices.price_weekend_num !== null) {
    rows.push({ label: "Wochenendtarif (Fr 16:00 – Mo 09:30)", value: displayPrice(prices.price_weekend_num, type) });
  }

  if (rows.length === 0) return null;

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-headline mb-1.5">Preisstaffel</h3>
      <ul className="space-y-0.5">
        {rows.map((r) => (
          <li key={r.label} className="flex flex-wrap items-baseline justify-between gap-x-2 text-xs sm:text-sm">
            <span className="text-muted-foreground">{r.label}</span>
            <span className="font-semibold text-headline">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
