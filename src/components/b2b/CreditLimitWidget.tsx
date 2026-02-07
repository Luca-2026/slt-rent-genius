import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, TrendingUp, AlertTriangle } from "lucide-react";

interface CreditLimitWidgetProps {
  creditLimit: number;
  usedCredit: number;
}

export function CreditLimitWidget({ creditLimit, usedCredit }: CreditLimitWidgetProps) {
  const remaining = creditLimit - usedCredit;
  const usagePercent = creditLimit > 0 ? Math.round((usedCredit / creditLimit) * 100) : 0;

  const getStatusColor = () => {
    if (usagePercent >= 90) return "text-destructive";
    if (usagePercent >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  const getProgressColor = () => {
    if (usagePercent >= 90) return "[&>div]:bg-destructive";
    if (usagePercent >= 70) return "[&>div]:bg-yellow-500";
    return "[&>div]:bg-green-500";
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);

  if (creditLimit <= 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Kreditlimit
          </CardTitle>
          {usagePercent >= 80 && (
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Verbraucht</span>
            <span className={`font-semibold ${getStatusColor()}`}>{usagePercent}%</span>
          </div>
          <Progress value={usagePercent} className={`h-3 ${getProgressColor()}`} />
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Limit</p>
            <p className="font-semibold text-sm">{formatCurrency(creditLimit)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Genutzt</p>
            <p className="font-semibold text-sm">{formatCurrency(usedCredit)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Verfügbar</p>
            <p className={`font-semibold text-sm ${getStatusColor()}`}>{formatCurrency(remaining)}</p>
          </div>
        </div>

        {usagePercent >= 90 && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Dein Kreditlimit ist fast ausgeschöpft. Kontaktiere uns für eine Erhöhung.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
