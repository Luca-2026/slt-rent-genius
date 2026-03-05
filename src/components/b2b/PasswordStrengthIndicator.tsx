import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
}

function getStrength(password: string) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

const levels = [
  { label: "Sehr schwach", color: "bg-destructive" },
  { label: "Schwach", color: "bg-orange-500" },
  { label: "Mittel", color: "bg-yellow-500" },
  { label: "Stark", color: "bg-emerald-500" },
  { label: "Sehr stark", color: "bg-emerald-600" },
];

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => getStrength(password), [password]);

  if (!password) return null;

  const level = levels[strength];
  const percent = ((strength + 1) / 5) * 100;

  return (
    <div className="space-y-1">
      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", level.color)}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Passwortstärke: <span className="font-medium">{level.label}</span>
      </p>
    </div>
  );
}
