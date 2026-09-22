/**
 * Geführter Ablauf für Übergabe- und Rücknahmeprotokoll.
 * Am Handy wird ein Schritt pro Bildschirm gezeigt, ab Tablet Schrittliste links
 * und Inhalt rechts. Die Komponente hält keine Fachlogik, nur die Navigation.
 */
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Check, ChevronLeft, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WizardStep {
  id: string;
  title: string;
  summary?: string;
  optional?: boolean;
  done: boolean;
  content: ReactNode;
}

interface Props {
  steps: WizardStep[];
  footer: ReactNode;
  /** Hinweis, was für den Abschluss noch fehlt. */
  missingHint?: string | null;
}

export function ProtocolWizard({ steps, footer, missingHint }: Props) {
  const isMobile = useIsMobile();
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeIndex = steps.findIndex((s) => s.id === activeId);
  const active = activeIndex >= 0 ? steps[activeIndex] : null;
  const doneCount = steps.filter((s) => s.done).length;

  const StepList = (
    <ul className="divide-y rounded-lg border bg-card">
      {steps.map((step) => (
        <li key={step.id}>
          <button
            type="button"
            onClick={() => setActiveId(step.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3.5 text-left min-h-[56px] transition-colors hover:bg-muted/60",
              activeId === step.id && !isMobile && "bg-muted",
            )}
          >
            <span
              className={cn(
                "shrink-0 h-6 w-6 rounded-full flex items-center justify-center border",
                step.done
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-muted-foreground/30 text-muted-foreground",
              )}
            >
              {step.done ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-2 w-2 fill-current" />}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium">
                {step.title}
                {step.optional && <span className="text-muted-foreground font-normal"> (optional)</span>}
              </span>
              {step.summary && (
                <span className="block text-xs text-muted-foreground truncate">{step.summary}</span>
              )}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        </li>
      ))}
    </ul>
  );

  // Handy: Detailansicht eines Schritts
  if (isMobile && active) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setActiveId(null)} className="-ml-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Übersicht
          </Button>
          <p className="text-sm font-semibold truncate">{active.title}</p>
        </div>
        <div className="space-y-4">{active.content}</div>
        <Button
          variant="outline"
          onClick={() => {
            const next = steps[activeIndex + 1];
            setActiveId(next ? next.id : null);
          }}
        >
          {activeIndex + 1 < steps.length ? "Weiter" : "Fertig"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {doneCount} von {steps.length} Schritten erledigt
      </p>

      {isMobile ? (
        StepList
      ) : (
        <div className="grid grid-cols-[minmax(220px,300px)_1fr] gap-4 items-start">
          <div>{StepList}</div>
          <ScrollArea className="max-h-[60vh] pr-3">
            <div className="space-y-4">
              {active ? active.content : steps[0]?.content}
            </div>
          </ScrollArea>
        </div>
      )}

      {missingHint && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          Noch offen: {missingHint}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 bg-background border-t sm:border-0">
        {footer}
      </div>
    </div>
  );
}
