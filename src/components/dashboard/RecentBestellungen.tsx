import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ShoppingCart, Building2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { RecentBestellung } from "@/hooks/useDashboard";

interface RecentBestellungenProps {
  bestellungen: RecentBestellung[];
  isLoading: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  neu: {
    label: "Neu",
    className: "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  in_bearbeitung: {
    label: "In Bearbeitung",
    className: "border-orange-200 bg-orange-100 text-orange-800 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  },
};

export function RecentBestellungen({ bestellungen, isLoading }: RecentBestellungenProps) {
  const navigate = useNavigate();

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return format(new Date(dateStr), "dd.MM.yyyy", { locale: de });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ShoppingCart className="h-4 w-4 text-info" />
          Offene Bestellungen
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate("/bestellungen")}>
          Alle
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">Laden...</div>
        ) : bestellungen.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Keine offenen Bestellungen
          </div>
        ) : (
          bestellungen.map((bestellung) => {
            const statusConfig = STATUS_CONFIG[bestellung.status || "neu"] || STATUS_CONFIG.neu;
            return (
              <div
                key={bestellung.id}
                className="flex items-start justify-between rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">{bestellung.bestellnummer}</span>
                    <Badge variant="outline" className={statusConfig.className}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <p className="font-medium text-foreground truncate">{bestellung.kundeName}</p>
                  {bestellung.objektName && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{bestellung.objektName}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 ml-2">
                  {bestellung.lieferdatum && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(bestellung.lieferdatum)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
