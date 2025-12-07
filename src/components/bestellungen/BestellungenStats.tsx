import { Package, Clock, CheckCircle, Euro } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatPreis } from "@/lib/formatPreis";

interface BestellungenStatsProps {
  stats: {
    gesamt: number;
    inBearbeitung: number;
    abgeschlossen: number;
    gesamtumsatz: number;
  };
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconBgClass: string;
  iconTextClass: string;
}

function StatItem({ icon, label, value, iconBgClass, iconTextClass }: StatItemProps) {
  return (
    <Card className="border bg-card shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg", iconBgClass)}>
            <div className={iconTextClass}>{icon}</div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BestellungenStats({ stats }: BestellungenStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatItem
        icon={<Package className="h-5 w-5" />}
        label="Bestellungen gesamt"
        value={stats.gesamt}
        iconBgClass="bg-primary/10"
        iconTextClass="text-primary"
      />
      <StatItem
        icon={<Clock className="h-5 w-5" />}
        label="In Bearbeitung"
        value={stats.inBearbeitung}
        iconBgClass="bg-info/10"
        iconTextClass="text-info"
      />
      <StatItem
        icon={<CheckCircle className="h-5 w-5" />}
        label="Abgeschlossen"
        value={stats.abgeschlossen}
        iconBgClass="bg-success/10"
        iconTextClass="text-success"
      />
      <StatItem
        icon={<Euro className="h-5 w-5" />}
        label="Gesamtumsatz"
        value={formatPreis(stats.gesamtumsatz)}
        iconBgClass="bg-warning/10"
        iconTextClass="text-warning"
      />
    </div>
  );
}
