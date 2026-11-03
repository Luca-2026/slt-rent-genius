import visa from "@/assets/payments/visa.webp.asset.json";
import paypal from "@/assets/payments/paypal.webp.asset.json";

export function PaymentMethods({ footer = false }: { footer?: boolean }) {
  return <div className="space-y-2" aria-label="Online-Zahlungsarten">
    <div className="flex flex-wrap items-center gap-3">
      <span className={footer ? "text-xs text-primary-foreground" : "text-xs text-muted-foreground"}>Online bezahlen</span>
      {[{ image: visa.url, name: "Visa" }, { image: paypal.url, name: "PayPal" }].map(method => <span key={method.name} className="inline-flex h-8 w-20 items-center justify-center rounded border border-border bg-background px-2 py-1"><img src={method.image} alt={method.name} className="h-full w-full object-contain" /></span>)}
    </div>
    <p className={footer ? "text-xs text-primary-foreground" : "text-xs text-muted-foreground"}>Kreditkarte und weitere Zahlungsarten wie PayPal oder Amazon Pay – je nach Verfügbarkeit im Zahlungsfenster.</p>
  </div>;
}