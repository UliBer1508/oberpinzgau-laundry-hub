import { ShoppingCart, ClipboardList, Truck, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { QuickActionCard } from "./QuickActionCard";

export function QuickActionsUpdated() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Schnellaktionen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            label="Neue Bestellung"
            description="Bestellung erfassen"
            icon={ShoppingCart}
            variant="primary"
            onClick={() => navigate("/bestellungen?neu=1")}
          />
          <QuickActionCard
            label="Arbeitsauftrag"
            description="Aufträge verwalten"
            icon={ClipboardList}
            variant="warning"
            onClick={() => navigate("/bestellungen/management")}
          />
          <QuickActionCard
            label="Tour planen"
            description="Lieferung planen"
            icon={Truck}
            variant="info"
            onClick={() => navigate("/liefertouren?neu=1")}
          />
          <QuickActionCard
            label="Rechnungen"
            description="Übersicht öffnen"
            icon={Receipt}
            variant="success"
            onClick={() => navigate("/rechnungen")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
