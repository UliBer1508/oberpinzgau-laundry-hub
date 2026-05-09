import { Package, Clock, CheckCircle, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatusFilter = "alle" | "neu" | "in_bearbeitung" | "ausgeliefert" | "abgeholt" | "abgeschlossen" | "storniert";

interface BestellungenStatsProps {
  stats: {
    gesamt: number;
    inBearbeitung: number;
    ausgeliefert: number;
    abgeschlossen: number;
  };
  selectedStatus?: StatusFilter;
  onSelectStatus?: (status: StatusFilter) => void;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconBgClass: string;
  iconTextClass: string;
  active?: boolean;
  onClick?: () => void;
}

function StatItem({ icon, label, value, iconBgClass, iconTextClass, active, onClick }: StatItemProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "border bg-card shadow-sm transition-all",
        onClick && "cursor-pointer hover:shadow-md hover:border-primary/40",
        active && "border-primary ring-2 ring-primary/30"
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className={cn("flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg shrink-0", iconBgClass)}>
            <div className={iconTextClass}>{icon}</div>
          </div>
          <div className="space-y-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{label}</p>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BestellungenStats({ stats, selectedStatus, onSelectStatus }: BestellungenStatsProps) {
  const handle = (s: StatusFilter) => () => onSelectStatus?.(selectedStatus === s ? "alle" : s);
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      <StatItem
        icon={<Package className="h-5 w-5" />}
        label="Bestellungen gesamt"
        value={stats.gesamt}
        iconBgClass="bg-primary/10"
        iconTextClass="text-primary"
        active={selectedStatus === "alle"}
        onClick={onSelectStatus ? () => onSelectStatus("alle") : undefined}
      />
      <StatItem
        icon={<Clock className="h-5 w-5" />}
        label="In Bearbeitung"
        value={stats.inBearbeitung}
        iconBgClass="bg-info/10"
        iconTextClass="text-info"
        active={selectedStatus === "in_bearbeitung" || selectedStatus === "neu"}
        onClick={onSelectStatus ? handle("in_bearbeitung") : undefined}
      />
      <StatItem
        icon={<Truck className="h-5 w-5" />}
        label="Ausgeliefert"
        value={stats.ausgeliefert}
        iconBgClass="bg-warning/10"
        iconTextClass="text-warning"
        active={selectedStatus === "ausgeliefert"}
        onClick={onSelectStatus ? handle("ausgeliefert") : undefined}
      />
      <StatItem
        icon={<CheckCircle className="h-5 w-5" />}
        label="Abgeschlossen"
        value={stats.abgeschlossen}
        iconBgClass="bg-success/10"
        iconTextClass="text-success"
        active={selectedStatus === "abgeschlossen"}
        onClick={onSelectStatus ? handle("abgeschlossen") : undefined}
      />
    </div>
  );
}
