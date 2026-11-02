import { financingEligible, teaserMonthlyRate } from "@/lib/financing";

const eur = (v: number) => v.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

export function FinancingTeaser({ priceGross, priceNet, onRequest = false }: { priceGross: number | null; priceNet: number | null; onRequest?: boolean }) {
  if (!priceGross || !priceNet || !financingEligible(priceNet, onRequest)) return null;
  const rate = teaserMonthlyRate(priceGross, priceNet);
  if (!rate) return null;
  return (
    <p className="text-sm mt-2">
      <span className="font-semibold text-accent">oder ab {eur(rate)} / Monat</span>{" "}
      <span className="text-muted-foreground">bei 60 Monaten, Anzahlung in Höhe der USt., ohne Schlussrate (vorbehaltlich der Bonitätsprüfung)</span>
    </p>
  );
}
