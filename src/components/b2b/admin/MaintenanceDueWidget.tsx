/**
 * Dashboard-Widget: fällige & überfällige Wartungen aller Einzelartikel.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Wrench } from "lucide-react";
import { useMaintenanceDue } from "@/hooks/useProductInstances";

const LOC_LABEL: Record<string, string> = { krefeld: "Krefeld", bonn: "Bonn", muelheim: "Mülheim" };

export function MaintenanceDueWidget() {
  const { data = [], isLoading } = useMaintenanceDue();

  const overdue = data.filter((d) => d.due_status === "overdue");
  const soon = data.filter((d) => d.due_status === "due_soon");

  if (isLoading) return null;
  if (!data.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Wrench className="h-5 w-5" />
          Fällige Wartungen
          {overdue.length > 0 && <Badge variant="destructive">{overdue.length} überfällig</Badge>}
          {soon.length > 0 && <Badge className="bg-amber-500 hover:bg-amber-600">{soon.length} bald fällig</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {[...overdue, ...soon].map((row) => (
            <div key={row.interval_id} className="flex items-start justify-between gap-3 border rounded p-2 text-sm">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{row.product_name}</div>
                <div className="text-xs text-muted-foreground">
                  {row.internal_inventory_number ?? row.serial_number ?? "ohne Nr."} · {LOC_LABEL[row.location] ?? row.location}
                </div>
                <div className="text-xs mt-0.5">
                  <span className="font-medium">{row.title}</span>
                  {row.next_due_at && <> — fällig am {row.next_due_at}</>}
                  {row.next_due_hours != null && <> — bei {row.next_due_hours} h (aktuell {row.current_operating_hours ?? 0} h)</>}
                </div>
              </div>
              {row.due_status === "overdue" ? (
                <Badge variant="destructive" className="shrink-0"><AlertTriangle className="h-3 w-3 mr-1" />Überfällig</Badge>
              ) : (
                <Badge className="bg-amber-500 hover:bg-amber-600 shrink-0"><Clock className="h-3 w-3 mr-1" />Bald</Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
