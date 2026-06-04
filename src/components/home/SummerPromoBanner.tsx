import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, PartyPopper, Copy, Check } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PROMO_CODE = "EVENT10";
const PROMO_VALID_UNTIL = "31.07.2026";
const PROMO_HEADLINE = "Wir feiern den Sommer";
const PROMO_SUBLINE =
  "Sichere dir jetzt 10% Rabatt auf alle Mietartikel aus dem Bereich Event!";
const PROMO_DETAILS =
  "Gültig an allen Standorten (Krefeld, Bonn, Mülheim an der Ruhr) auf alle Event-Kategorien: Möbel & Zelte, Beleuchtung, Beschallung, Bühne, Traversen & Rigging, Geschirr, Hüpfburgen und mehr.";
const POPUP_STORAGE_KEY = "slt_summer_promo_popup_seen_v1";
const EVENT_LINK = "/mietartikel#event";

function CodeChip({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Gutscheincode kopiert");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kopieren nicht möglich");
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2 font-mono text-lg font-bold tracking-wider text-primary shadow-md ring-2 ring-white/60 hover:bg-white transition"
      aria-label={`Gutscheincode ${code} kopieren`}
    >
      <span>{code}</span>
      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 opacity-70" />}
    </button>
  );
}

export function SummerPromoBanner() {
  return (
    <section className="relative z-10 py-6 lg:py-8 bg-background">
      <div className="section-container">
        <div className="relative overflow-hidden rounded-2xl border-2 border-accent/40 bg-gradient-to-br from-accent via-accent to-[#ff7400] text-white shadow-xl">
          {/* Decorative sparkles */}
          <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

          <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:gap-8 md:p-8 lg:p-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">
                <PartyPopper className="h-3.5 w-3.5" />
                Sommer-Aktion · gültig bis {PROMO_VALID_UNTIL}
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-2">
                {PROMO_HEADLINE} – sichere dir jetzt{" "}
                <span className="whitespace-nowrap">10% Rabatt</span> auf alle
                Mietartikel aus dem Bereich Event!
              </h2>
              <p className="text-white/90 md:text-lg max-w-2xl">
                {PROMO_DETAILS}
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-white/90">Code:</span>
                <CodeChip code={PROMO_CODE} />
              </div>
              <Button
                asChild
                size="lg"
                className="bg-white text-accent hover:bg-white/90 font-bold shadow-md"
              >
                <Link to={EVENT_LINK}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Zu den Event-Mietartikeln
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SummerPromoDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(POPUP_STORAGE_KEY)) return;
    } catch {}
    const t = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(POPUP_STORAGE_KEY, "1");
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : close())}>
      <DialogContent
        className="w-[calc(100vw-2rem)] max-w-lg p-0 overflow-hidden border-0 bg-transparent shadow-2xl [&>button]:text-white [&>button]:bg-white/20 [&>button]:hover:bg-white/30 [&>button]:rounded-full [&>button]:p-1.5 [&>button]:opacity-100 [&>button]:ring-0 [&>button]:top-3 [&>button]:right-3"
      >
        <div className="relative bg-gradient-to-br from-accent via-accent to-[#ff7400] text-white p-5 sm:p-6 md:p-8 rounded-lg">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3 max-w-[calc(100%-3rem)]">
            <PartyPopper className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Sommer-Aktion · bis {PROMO_VALID_UNTIL}</span>
          </div>

          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight mb-3 pr-2">
            {PROMO_HEADLINE} – 10% Rabatt auf alle Event-Mietartikel!
          </h3>
          <p className="text-sm sm:text-base text-white/90 mb-5">
            {PROMO_DETAILS}
          </p>

          <div className="flex flex-col gap-3 bg-white/10 rounded-xl p-4 mb-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-white/80">
              Dein Gutscheincode
            </div>
            <CodeChip code={PROMO_CODE} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              size="lg"
              className="bg-white text-accent hover:bg-white/90 font-bold w-full sm:flex-1"
              onClick={close}
            >
              <Link to={EVENT_LINK}>
                <Sparkles className="mr-2 h-4 w-4" />
                Jetzt Event-Artikel mieten
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={close}
              className="w-full sm:flex-1 bg-transparent border-2 border-white/70 text-white hover:bg-white/15 hover:text-white hover:border-white"
            >
              Später
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
