import { useState } from "react";
import { ShoppingCart, ClipboardList, Truck, Receipt, Printer, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { QuickActionCard } from "./QuickActionCard";
import { ArbeitsauftragErstellenDialog } from "@/components/management/ArbeitsauftragErstellenDialog";
import { ExportDialog, type ExportType } from "./ExportDialog";

export function QuickActionsUpdated() {
  const navigate = useNavigate();
  const [arbeitsauftragOpen, setArbeitsauftragOpen] = useState(false);
  const [exportType, setExportType] = useState<ExportType | null>(null);
  const [actionsOpen, setActionsOpen] = useState(true);

  return (
    <Collapsible open={actionsOpen} onOpenChange={setActionsOpen} className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">Schnellaktionen</h2>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 h-8">
            <span className="text-xs">{actionsOpen ? "Einklappen" : "Ausklappen"}</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${actionsOpen ? "rotate-180" : ""}`}
            />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
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
      </CollapsibleContent>

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
    </Collapsible>
  );
}
