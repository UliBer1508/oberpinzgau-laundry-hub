import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Building2 } from "lucide-react";

interface Pickup {
  id: string;
  customer: string;
  object: string;
  time: string;
  checkout: string;
}

const mockPickups: Pickup[] = [
  {
    id: "A-001",
    customer: "Hotel Bergblick",
    object: "Zimmer 204",
    time: "10:00",
    checkout: "Heute",
  },
  {
    id: "A-002",
    customer: "Ferienwohnungen Sonnblick",
    object: "Wohnung 1",
    time: "11:00",
    checkout: "Heute",
  },
  {
    id: "A-003",
    customer: "Appartements Glockner",
    object: "Apartment A3",
    time: "14:00",
    checkout: "Heute",
  },
  {
    id: "A-004",
    customer: "Pension Alpenrose",
    object: "Doppelzimmer 5",
    time: "09:00",
    checkout: "Morgen",
  },
];

export function UpcomingPickups() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Anstehende Abholungen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockPickups.map((pickup) => (
          <div
            key={pickup.id}
            className="flex items-start justify-between rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50"
          >
            <div className="space-y-1">
              <p className="font-medium text-foreground">{pickup.customer}</p>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span>{pickup.object}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{pickup.time}</span>
              </div>
              <Badge
                variant="outline"
                className={
                  pickup.checkout === "Heute"
                    ? "border-warning/20 bg-warning/10 text-warning"
                    : "border-muted bg-muted text-muted-foreground"
                }
              >
                {pickup.checkout}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
