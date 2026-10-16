import { useMemo } from "react";
import qrcode from "qrcode-generator";
import { buildEpcPayload, type EpcInput } from "../../supabase/functions/_shared/epc-qr";

/** Überweisungs-QR (GiroCode) – mit der Banking-App scannen, Daten sind vorausgefüllt. */
export function PaymentQrCode(props: EpcInput) {
  const svg = useMemo(() => {
    const payload = buildEpcPayload(props);
    if (!payload) return null;
    const qr = qrcode(0, "M");
    qr.addData(payload, "Byte");
    qr.make();
    return qr.createSvgTag({ cellSize: 4, margin: 8, scalable: true });
  }, [props.name, props.iban, props.bic, props.amountCents, props.reference]);
  if (!svg) return null;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 rounded-md border border-border bg-background p-3">
      <div className="w-40 h-40 shrink-0 bg-card [&>svg]:w-full [&>svg]:h-full" aria-label="Überweisungs-QR-Code" role="img" dangerouslySetInnerHTML={{ __html: svg }} />
      <p className="text-xs text-muted-foreground">
        <strong className="text-foreground">Mit der Banking-App scannen:</strong> Empfänger, IBAN, Betrag und Verwendungszweck sind schon ausgefüllt. Funktioniert mit allen gängigen Banking-Apps (GiroCode).
      </p>
    </div>
  );
}
