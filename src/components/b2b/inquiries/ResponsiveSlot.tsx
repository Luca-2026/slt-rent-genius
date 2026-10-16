import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const QUERY = "(min-width: 1024px)";

function useIsDesktop() {
  const [desktop, setDesktop] = useState(() =>
    typeof window === "undefined" ? true : window.matchMedia(QUERY).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const on = () => setDesktop(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return desktop;
}

/** Rendert Inhalte nur ab 1024 px (verhindert doppelte Formulare). */
export function DesktopOnly({ children }: { children: ReactNode }) {
  return useIsDesktop() ? <>{children}</> : null;
}

/** Unter 1024 px: Inhalte als ausklappbarer Block weit oben. */
export function MobileCollapsible({ title, children }: { title: string; children: ReactNode }) {
  const desktop = useIsDesktop();
  const [open, setOpen] = useState(true);
  if (desktop) return null;
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg border border-border">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 p-3 text-left text-sm font-semibold">
        {title}
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-5 px-3 pb-3">{children}</CollapsibleContent>
    </Collapsible>
  );
}
