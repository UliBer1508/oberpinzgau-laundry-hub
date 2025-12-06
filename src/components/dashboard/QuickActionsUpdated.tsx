import { ShoppingCart, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const actions = [
  {
    label: "Neue Bestellung",
    icon: ShoppingCart,
    variant: "default" as const,
    href: "/bestellungen",
  },
  {
    label: "Tour planen",
    icon: Truck,
    variant: "outline" as const,
    href: "/liefertouren",
  },
];

export function QuickActionsUpdated() {
  const navigate = useNavigate();

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
            onClick={() => navigate(action.href)}
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
