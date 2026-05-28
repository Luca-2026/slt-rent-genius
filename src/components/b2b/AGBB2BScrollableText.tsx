import { ScrollArea } from "@/components/ui/scroll-area";
import { AGB_B2B_META, AGB_B2B_SECTIONS } from "@/data/legal/agb-b2b";

export function AGBB2BScrollableText() {
  return (
    <ScrollArea className="h-64 border border-border rounded-lg p-4 bg-muted/30 text-sm text-muted-foreground leading-relaxed">
      <div className="space-y-5 pr-4">
        <div>
          <p className="font-semibold text-foreground">{AGB_B2B_META.title}</p>
          <p className="text-xs italic">{AGB_B2B_META.subtitle}</p>
          <p className="text-xs italic">{AGB_B2B_META.stand}</p>
        </div>

        {AGB_B2B_SECTIONS.map((section) => (
          <div key={section.id}>
            <p className="font-semibold text-foreground mb-2">
              {section.number} {section.title}
            </p>
            <div className="space-y-3">
              {section.subsections.map((sub) => (
                <div key={sub.id}>
                  {sub.title && sub.title !== section.title && (
                    <p className="font-medium text-foreground/90">
                      {sub.number ? `${sub.number} ` : ""}
                      {sub.title}
                    </p>
                  )}
                  <div className="space-y-2">
                    {sub.body.map((b, i) => {
                      if (b.type === "p") return <p key={i}>{b.text}</p>;
                      if (b.type === "h3")
                        return (
                          <p key={i} className="font-medium text-foreground/90 mt-1">
                            {b.text}
                          </p>
                        );
                      return (
                        <ul key={i} className="list-none pl-3 space-y-1">
                          {b.items.map((item, j) => (
                            <li key={j} className="pl-2 border-l-2 border-border">
                              {item}
                            </li>
                          ))}
                        </ul>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <p className="text-xs text-muted-foreground pt-2 border-t border-border">
          {AGB_B2B_META.stand} · SLT Technology Group GmbH &amp; Co. KG
        </p>
      </div>
    </ScrollArea>
  );
}
