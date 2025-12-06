import { Truck, User, MapPin, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTodayLiefertouren, type TodayLiefertour } from "@/hooks/useDashboard";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  geplant: { label: "Geplant", className: "bg-muted text-muted-foreground" },
  aktiv: { label: "Aktiv", className: "bg-info/10 text-info border-info/20" },
  in_durchfuehrung: { label: "Unterwegs", className: "bg-warning/10 text-warning border-warning/20" },
  abgeschlossen: { label: "Fertig", className: "bg-success/10 text-success border-success/20" },
};

function TourCard({ tour }: { tour: TodayLiefertour }) {
  const navigate = useNavigate();
  const statusConfig = STATUS_CONFIG[tour.status || "geplant"] || STATUS_CONFIG.geplant;

  return (
    <div
      className="flex items-center justify-between rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50 cursor-pointer"
      onClick={() => navigate("/liefertouren")}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <Truck className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{tour.name}</span>
            <Badge variant="outline" className={statusConfig.className}>
              {statusConfig.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            {tour.waeschekraftName && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {tour.waeschekraftName}
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {tour.stoppCount} Stopps
            </span>
          </div>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </div>
  );
}

export function TodayLiefertouren() {
  const navigate = useNavigate();
  const { data: touren = [], isLoading } = useTodayLiefertouren();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Truck className="h-4 w-4 text-primary" />
          Heutige Touren
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate("/liefertouren")}>
          Alle
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">Laden...</div>
        ) : touren.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Keine Touren für heute geplant
          </div>
        ) : (
          touren.map((tour) => <TourCard key={tour.id} tour={tour} />)
        )}
      </CardContent>
    </Card>
  );
}
