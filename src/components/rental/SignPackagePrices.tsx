import { useSignBookingConfig } from "./SignPackageSelection";
import { signPublicBaseGrossCents } from "@/lib/signPublicPrice";
export function SignPackagePrices({ kind }: { kind: "standard" | "sorglos" }) {
  const { data: config } = useSignBookingConfig();
  const money = (value: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value / 100);
  if (kind === "standard") return <>Standard-Set: {money(signPublicBaseGrossCents(config))} brutto je Set für 1–10 Tage</>;
  return <>Rundum-Sorglos-Paket</>;
}