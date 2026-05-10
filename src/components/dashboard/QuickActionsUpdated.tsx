import { useState } from "react";
import { ShoppingCart, ClipboardList, Truck, Receipt, Printer, FileSpreadsheet, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { QuickActionCard } from "./QuickActionCard";
import { ArbeitsauftragErstellenDialog } from "@/components/management/ArbeitsauftragErstellenDialog";
import { ExportDialog, type ExportType } from "./ExportDialog";

export function QuickActionsUpdated() {
  const navigate = useNavigate();
  const [arbeitsauftragOpen, setArbeitsauftragOpen] = useState(false);
  const [exportType, setExportType] = useState<ExportType | null>(null);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Schnellaktionen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          <QuickActionCard
            label="Neue Bestellung"
            description="Bestellung erfassen"
            icon={ShoppingCart}
            variant="primary"
            onClick={() => navigate("/bestellungen?neu=1")}
          />
          <QuickActionCard
            label="Neuen Arbeitsauftrag"
            description="Bestellung zuweisen"
            icon={ClipboardList}
            variant="warning"
            onClick={() => setArbeitsauftragOpen(true)}
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
          <QuickActionCard
            label="Bestellungen drucken"
            description="Liste & Excel-Export"
            icon={Printer}
            variant="neutral"
            onClick={() => setExportType("bestellungen")}
          />
          <QuickActionCard
            label="Arbeitsaufträge drucken"
            description="Liste & Excel-Export"
            icon={FileText}
            variant="neutral"
            onClick={() => setExportType("arbeitsauftraege")}
          />
          <QuickActionCard
            label="Rechnungen drucken"
            description="Liste & Excel-Export"
            icon={FileSpreadsheet}
            variant="neutral"
            onClick={() => setExportType("rechnungen")}
          />
        </div>
      </CardContent>

      <ArbeitsauftragErstellenDialog
        open={arbeitsauftragOpen}
        onOpenChange={setArbeitsauftragOpen}
      />

      {exportType && (
        <ExportDialog
          open={exportType !== null}
          onOpenChange={(o) => !o && setExportType(null)}
          type={exportType}
        />
      )}
    </Card>
  );
}
