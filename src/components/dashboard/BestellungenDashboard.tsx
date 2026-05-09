import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Package, Clock, Truck, ChevronRight, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useDashboardBestellungen, type DashboardBestellung } from "@/hooks/useDashboard";

const STATUS_CONFIG = {
  neu: { label: "Neu", icon: Package, color: "text-info" },
  in_bearbeitung: { label: "In Bearbeitung", icon: Clock, color: "text-warning" },
  ausgeliefert: { label: "Versandbereit", icon: Truck, color: "text-success" },
} as const;

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

export function BestellungenDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("neu");

  const { data: neuBestellungen = [], isLoading: neuLoading } = useDashboardBestellungen("neu");
  const { data: inBearbeitungBestellungen = [], isLoading: inBearbeitungLoading } = useDashboardBestellungen("in_bearbeitung");
  const { data: versandbereitBestellungen = [], isLoading: versandbereitLoading } = useDashboardBestellungen("ausgeliefert");

  const tabs = [
    { value: "neu", label: "Neu", count: neuBestellungen.length, data: neuBestellungen, loading: neuLoading },
    { value: "in_bearbeitung", label: "In Bearbeitung", count: inBearbeitungBestellungen.length, data: inBearbeitungBestellungen, loading: inBearbeitungLoading },
    { value: "ausgeliefert", label: "Versandbereit", count: versandbereitBestellungen.length, data: versandbereitBestellungen, loading: versandbereitLoading },
  ];

  const activeTabData = tabs.find((t) => t.value === activeTab);

  return (
    <Card className="flex-1 min-w-0 max-w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3 px-4 sm:px-6">
        <CardTitle className="text-base font-semibold">Bestellungen</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate("/bestellungen")}>
          Alle anzeigen
        </Button>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4 h-auto">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-[11px] sm:text-sm px-1 sm:px-3 py-1.5 flex-wrap gap-1">
                <span className="truncate">{tab.label}</span>
                {tab.count > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {tab.count}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="space-y-3 mt-0">
              {tab.loading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Laden...</div>
              ) : tab.data.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Keine Bestellungen
                </div>
              ) : (
                tab.data.map((bestellung) => (
                  <BestellungCard key={bestellung.id} bestellung={bestellung} />
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
