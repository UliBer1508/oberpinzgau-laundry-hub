import { Plus, FileText, Truck, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  {
    label: "Neue Bestellung",
    icon: Plus,
    variant: "default" as const,
  },
  {
    label: "Neue Buchung",
    icon: Calendar,
    variant: "outline" as const,
  },
  {
    label: "Tour planen",
    icon: Truck,
    variant: "outline" as const,
  },
  {
    label: "Bericht erstellen",
    icon: FileText,
    variant: "outline" as const,
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Schnellaktionen</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            className="h-11 justify-start gap-3"
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
