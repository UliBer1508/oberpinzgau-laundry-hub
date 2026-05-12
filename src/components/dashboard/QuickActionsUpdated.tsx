import { useState } from "react";
import { ShoppingCart, ClipboardList, Truck, Receipt, Printer, FileSpreadsheet, FileText, ChevronDown, Settings } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { QuickActionCard } from "./QuickActionCard";
import { ArbeitsauftragErstellenDialog } from "@/components/management/ArbeitsauftragErstellenDialog";
import { ExportDialog } from "./ExportDialog";
import { useExportPresets } from "@/hooks/useExportPresets";
import { executeExport, type ExportType } from "@/lib/runExport";

export function QuickActionsUpdated() {
  const navigate = useNavigate();
  const [arbeitsauftragOpen, setArbeitsauftragOpen] = useState(false);
  const [exportType, setExportType] = useState<ExportType | null>(null);
  const [actionsOpen, setActionsOpen] = useState(true);
  const { presets } = useExportPresets();

  const dateLabel = (m: string) =>
    m === "heute" ? "Heute" : m === "morgen" ? "Morgen" : m === "woche" ? "Diese Woche" : m === "alle" ? "Alle" : "Eigener Zeitraum";

  async function runWithPreset(type: ExportType) {
    const p = presets[type];
    if (!p) {
      setExportType(type);
      return;
    }
    try {
      const count = await executeExport(type, {
        statuses: p.statuses,
        date_mode: p.date_mode,
        von: p.von,
        bis: p.bis,
        action: p.action,
      });
      if (!count) toast.info("Keine Einträge gefunden");
      else if (p.action === "excel") toast.success(`${count} Einträge exportiert`);
    } catch (e) {
      toast.error("Export fehlgeschlagen", { description: (e as Error).message });
    }
  }

  const exportCard = (type: ExportType, label: string, icon: typeof Printer) => {
    const p = presets[type];
    return (
      <QuickActionCard
        label={label}
        description={p ? `${dateLabel(p.date_mode)} · ${p.action === "print" ? "Drucken" : "Excel"}` : "Liste & Excel-Export"}
        icon={icon}
        variant="neutral"
        onClick={() => runWithPreset(type)}
        badge={p ? "Auto" : undefined}
        badgeTitle={p ? `Voreinstellung: ${dateLabel(p.date_mode)} · ${p.statuses.length} Status · ${p.action === "print" ? "Drucken" : "Excel"}` : undefined}
        secondaryAction={p ? { icon: Settings, label: "Einstellungen ändern", onClick: () => setExportType(type) } : undefined}
      />
    );
  };

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
          {exportCard("bestellungen", "Bestellungen drucken", Printer)}
          {exportCard("arbeitsauftraege", "Arbeitsaufträge drucken", FileText)}
          {exportCard("rechnungen", "Rechnungen drucken", FileSpreadsheet)}
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
