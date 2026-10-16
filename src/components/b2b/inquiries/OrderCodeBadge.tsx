import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/** Auftrags-ID (#ABC123) – zieht sich durch alle Belege eines Auftrags. Klick kopiert. */
export function OrderCodeBadge({ code, className }: { code?: string | null; className?: string }) {
  if (!code) return null;
  return (
    <Badge
      variant="outline"
      title="Auftrags-ID – Klick zum Kopieren"
      className={`font-mono cursor-pointer border-primary text-primary ${className ?? ""}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard?.writeText(`#${code}`).then(() => toast.success(`Auftrags-ID #${code} kopiert`)).catch(() => {});
      }}
    >
      #{code}
    </Badge>
  );
}
