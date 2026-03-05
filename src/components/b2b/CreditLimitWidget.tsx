import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, TrendingUp, AlertTriangle, Banknote, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreditLimitWidgetProps {
  creditLimit: number;
  usedCredit: number;
  profileId: string;
  creditLimitRequestedAt: string | null;
  onRequestSent?: () => void;
}

export function CreditLimitWidget({ creditLimit, usedCredit, profileId, creditLimitRequestedAt, onRequestSent }: CreditLimitWidgetProps) {
  const { toast } = useToast();
  const [requesting, setRequesting] = useState(false);

  const remaining = creditLimit - usedCredit;
  const usagePercent = creditLimit > 0 ? Math.round((usedCredit / creditLimit) * 100) : 0;
  const hasCredit = creditLimit > 0;
  const hasRequested = !!creditLimitRequestedAt;

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

  const handleRequestCreditLimit = async () => {
    setRequesting(true);
    try {
      const { error } = await supabase
        .from("b2b_profiles")
        .update({ credit_limit_requested_at: new Date().toISOString() } as any)
        .eq("id", profileId);
      if (error) throw error;
      toast({
        title: "Kreditlimit beantragt",
        description: "Dein Antrag wurde an unser Team weitergeleitet. Wir melden uns bei dir.",
      });
      onRequestSent?.();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Antrag konnte nicht gesendet werden.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  // Vorkasse mode (no credit limit)
  if (!hasCredit) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            Zahlungsart
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <Banknote className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Vorkasse</p>
              <p className="text-sm text-muted-foreground">
                Dein Konto arbeitet aktuell auf Vorkassebasis. Du kannst ein Kreditlimit beantragen.
              </p>
            </div>
          </div>

          {hasRequested ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-yellow-50 p-3 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />
              <span>Kreditlimit beantragt – wird geprüft.</span>
            </div>
          ) : (
            <Button
              onClick={handleRequestCreditLimit}
              disabled={requesting}
              className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover"
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {requesting ? "Wird gesendet..." : "Kreditlimit beantragen"}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Credit limit mode
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
