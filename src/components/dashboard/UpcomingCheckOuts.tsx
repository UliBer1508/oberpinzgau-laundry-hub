import { format } from "date-fns";
import { de } from "date-fns/locale";
import { LogOut, Users, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { UpcomingCheckOut } from "@/hooks/useDashboard";

interface UpcomingCheckOutsProps {
  checkOuts: UpcomingCheckOut[];
  isLoading: boolean;
}

export function UpcomingCheckOuts({ checkOuts, isLoading }: UpcomingCheckOutsProps) {
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
          <LogOut className="h-4 w-4 text-warning" />
          Anstehende Check-outs
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate("/buchungen")}>
          Alle
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">Laden...</div>
        ) : checkOuts.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Keine anstehenden Check-outs
          </div>
        ) : (
          checkOuts.map((checkOut) => (
            <div
              key={checkOut.id}
              className="flex items-start justify-between rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <p className="font-medium text-foreground truncate">
                  {checkOut.gastname || "Kein Gastname"}
                </p>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{checkOut.objektName}</span>
                </div>
                {checkOut.anzahl_personen && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    <span>{checkOut.anzahl_personen} Personen</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 ml-2">
                <Badge
                  variant="outline"
                  className={
                    checkOut.check_out === today
                      ? "border-warning/20 bg-warning/10 text-warning"
                      : "border-muted bg-muted text-muted-foreground"
                  }
                >
                  {formatDate(checkOut.check_out)}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {checkOut.buchungsnummer}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
