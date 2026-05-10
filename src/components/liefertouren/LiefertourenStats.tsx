import { Truck, Calendar, Play, CheckCircle } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import type { Liefertour } from "@/hooks/useLiefertouren";

interface LiefertourenStatsProps {
  touren: Liefertour[];
  statusFilter?: string;
  onStatusChange?: (status: string) => void;
  todayActive?: boolean;
  onToggleToday?: () => void;
}

export function LiefertourenStats({ touren, statusFilter, onStatusChange, todayActive, onToggleToday }: LiefertourenStatsProps) {
  const today = new Date().toISOString().split("T")[0];

  const stats = {
    total: touren.length,
    today: touren.filter((t) => t.datum === today).length,
    aktiv: touren.filter((t) => t.status === "aktiv").length,
    abgeschlossen: touren.filter((t) => t.status === "abgeschlossen").length,
  };

  const handle = (s: string) => () => onStatusChange?.(statusFilter === s ? "all" : s);

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Gesamt Touren"
        value={stats.total}
        icon={Truck}
        variant="primary"
        active={statusFilter === "all"}
        onClick={onStatusChange ? () => onStatusChange("all") : undefined}
      />
      <StatCard
        title="Heute geplant"
        value={stats.today}
        icon={Calendar}
        variant="info"
      />
      <StatCard
        title="Aktive Touren"
        value={stats.aktiv}
        icon={Play}
        variant="warning"
        active={statusFilter === "aktiv"}
        onClick={onStatusChange ? handle("aktiv") : undefined}
      />
      <StatCard
        title="Abgeschlossen"
        value={stats.abgeschlossen}
        icon={CheckCircle}
        variant="success"
        active={statusFilter === "abgeschlossen"}
        onClick={onStatusChange ? handle("abgeschlossen") : undefined}
      />
    </div>
  );
}
