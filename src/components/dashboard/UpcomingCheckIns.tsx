import { format } from "date-fns";
import { de } from "date-fns/locale";
import { LogIn, Users, Building2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { UpcomingCheckIn } from "@/hooks/useDashboard";

interface UpcomingCheckInsProps {
  checkIns: UpcomingCheckIn[];
  isLoading: boolean;
}

export function UpcomingCheckIns({ checkIns, isLoading }: UpcomingCheckInsProps) {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const formatDate = (dateStr: string) => {
    if (dateStr === today) return "Heute";
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    if (dateStr === tomorrow) return "Morgen";
    return format(new Date(dateStr), "EEE, dd.MM.", { locale: de });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <LogIn className="h-4 w-4 text-success" />
          Anstehende Check-ins
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate("/buchungen")}>
          Alle
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">Laden...</div>
        ) : checkIns.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Keine anstehenden Check-ins
          </div>
        ) : (
          checkIns.map((checkIn) => (
            <div
              key={checkIn.id}
              className="flex items-start justify-between rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <p className="font-medium text-foreground truncate">
                  {checkIn.gastname || "Kein Gastname"}
                </p>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{checkIn.objektName}</span>
                </div>
                {checkIn.anzahl_personen && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    <span>{checkIn.anzahl_personen} Personen</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 ml-2">
                <Badge
                  variant="outline"
                  className={
                    checkIn.check_in === today
                      ? "border-success/20 bg-success/10 text-success"
                      : "border-muted bg-muted text-muted-foreground"
                  }
                >
                  {formatDate(checkIn.check_in)}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {checkIn.buchungsnummer}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
