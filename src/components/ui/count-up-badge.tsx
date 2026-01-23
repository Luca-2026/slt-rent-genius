import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

interface CountUpBadgeProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUpBadge({
  value,
  label,
  prefix = "",
  suffix = "",
  className,
}: CountUpBadgeProps) {
  const { formattedCount, ref } = useCountUp({
    end: value,
    duration: 2500,
    prefix,
    suffix,
  });

  return (
    <div ref={ref} className={cn("text-center", className)}>
      <span className="block text-3xl lg:text-4xl font-bold text-primary tabular-nums">
        {formattedCount}
      </span>
      <span className="text-sm text-muted-foreground mt-1 block">{label}</span>
    </div>
  );
}
