import visa from "@/assets/payments/visa.webp.asset.json";
import paypal from "@/assets/payments/paypal.webp.asset.json";
import mastercard from "@/assets/payments/mastercard.webp.asset.json";

export function PaymentMethods({ footer = false, centered = false }: { footer?: boolean; centered?: boolean }) {
  return <div className={centered ? "space-y-3 text-center" : "space-y-2"} aria-label="Online-Zahlungsarten">
    <div className={centered ? "flex flex-col items-center gap-3" : "flex flex-wrap items-center gap-3"}>
      <span className={footer ? "text-xs text-primary-foreground" : "text-xs text-muted-foreground"}>Online bezahlen</span>
      <div className={centered ? "grid w-full max-w-72 grid-cols-3 gap-2" : "flex flex-wrap items-center gap-3"}>
        {[{ image: visa.url, name: "Visa" }, { image: mastercard.url, name: "Mastercard" }, { image: paypal.url, name: "PayPal" }].map(method => <span key={method.name} className={centered ? "inline-flex h-10 min-w-0 items-center justify-center rounded border border-border bg-background px-2 py-1" : "inline-flex h-8 w-20 items-center justify-center rounded border border-border bg-background px-2 py-1"}><img src={method.image} alt={method.name} className="h-full w-full object-contain" /></span>)}
      </div>
    </div>
    <p className={footer ? "text-xs text-primary-foreground" : "text-xs text-muted-foreground"}>Kreditkarte und weitere Zahlungsarten wie PayPal oder Amazon Pay – je nach Verfügbarkeit im Zahlungsfenster.</p>
  </div>;
}