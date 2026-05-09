import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ChevronRight, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDashboardBestellungen, type DashboardBestellung, type DashboardFilter } from "@/hooks/useDashboard";

const FILTER_LABELS: Record<DashboardFilter, string> = {
  neu: "Neue Bestellungen",
  in_bearbeitung: "In Bearbeitung",
  ausgeliefert: "Versandbereit",
  heute: "Heute auszuliefern",
};

function BestellungCard({ bestellung }: { bestellung: DashboardBestellung }) {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 rounded-lg border bg-background p-3 sm:p-4 transition-colors hover:bg-muted/50 cursor-pointer w-full max-w-full min-w-0"
      onClick={() => navigate("/bestellungen")}
    >
      <div className="space-y-2 flex-1 min-w-0 w-full">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-sm font-medium break-all">{bestellung.bestellnummer}</span>
          {bestellung.prioritaet && bestellung.prioritaet > 0 && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Priorität
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground break-words">
          {bestellung.kundeName}
          {bestellung.objektName && ` • ${bestellung.objektName}`}
        </p>
        {bestellung.positionen.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {bestellung.positionen.slice(0, 3).map((pos) => (
              <Badge key={pos.id} variant="secondary" className="text-xs font-normal max-w-full break-words">
                {pos.menge}× {pos.artikelName}
                {pos.artikelFarbe && ` (${pos.artikelFarbe})`}
              </Badge>
            ))}
            {bestellung.positionen.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{bestellung.positionen.length - 3} weitere
              </Badge>
            )}
          </div>
        )}
      </div>
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 sm:ml-3 shrink-0">
        {bestellung.lieferdatum && (
          <span className="text-xs text-muted-foreground">
            {format(new Date(bestellung.lieferdatum), "dd.MM.", { locale: de })}
          </span>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

interface BestellungenDashboardProps {
  filter: DashboardFilter;
}

export function BestellungenDashboard({ filter }: BestellungenDashboardProps) {
  const navigate = useNavigate();
  const { data: bestellungen = [], isLoading } = useDashboardBestellungen(filter);

  return (
    <Card className="flex-1 min-w-0 max-w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3 px-4 sm:px-6 gap-2">
        <div className="min-w-0">
          <CardTitle className="text-base font-semibold truncate">
            Bestellungen
          </CardTitle>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {FILTER_LABELS[filter]}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/bestellungen")} className="shrink-0">
          Alle anzeigen
        </Button>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 space-y-3">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Laden...</div>
        ) : bestellungen.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Keine Bestellungen
          </div>
        ) : (
          bestellungen.map((bestellung) => (
            <BestellungCard key={bestellung.id} bestellung={bestellung} />
          ))
        )}
      </CardContent>
    </Card>
  );
}
