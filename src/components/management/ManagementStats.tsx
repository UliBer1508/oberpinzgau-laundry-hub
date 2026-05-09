import { ListChecks, Sparkles, Wrench, PackageCheck } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import type { ManagementBestellung } from "@/hooks/useManagementBestellungen";

interface ManagementStatsProps {
  bestellungen: ManagementBestellung[];
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

export function ManagementStats({ bestellungen, statusFilter, onStatusChange }: ManagementStatsProps) {
  const stats = {
    total: bestellungen.length,
    neu: bestellungen.filter((b) => b.status === "neu").length,
    inBearbeitung: bestellungen.filter((b) => b.status === "in_bearbeitung").length,
    ausgeliefert: bestellungen.filter((b) => b.status === "ausgeliefert").length,
  };

  const handle = (s: string) => () => onStatusChange(statusFilter === s ? "all" : s);

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Gesamt"
        value={stats.total}
        icon={ListChecks}
        variant="primary"
        active={statusFilter === "all"}
        onClick={() => onStatusChange("all")}
      />
      <StatCard
        title="Neu"
        value={stats.neu}
        icon={Sparkles}
        variant="info"
        active={statusFilter === "neu"}
        onClick={handle("neu")}
      />
      <StatCard
        title="In Bearbeitung"
        value={stats.inBearbeitung}
        icon={Wrench}
        variant="warning"
        active={statusFilter === "in_bearbeitung"}
        onClick={handle("in_bearbeitung")}
      />
      <StatCard
        title="Ausgeliefert"
        value={stats.ausgeliefert}
        icon={PackageCheck}
        variant="success"
        active={statusFilter === "ausgeliefert"}
        onClick={handle("ausgeliefert")}
      />
    </div>
  );
}
