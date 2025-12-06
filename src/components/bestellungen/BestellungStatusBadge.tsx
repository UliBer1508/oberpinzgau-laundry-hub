import { Badge } from "@/components/ui/badge";
import type { BestellungStatus } from "@/hooks/useBestellungen";

interface BestellungStatusBadgeProps {
  status: BestellungStatus;
}

const STATUS_CONFIG: Record<BestellungStatus, { label: string; className: string }> = {
  neu: {
    label: "Neu",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  },
  in_bearbeitung: {
    label: "In Bearbeitung",
    className: "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
  },
  ausgeliefert: {
    label: "Ausgeliefert",
    className: "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
  },
  abgeholt: {
    label: "Abgeholt",
    className: "bg-cyan-100 text-cyan-800 hover:bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400",
  },
  abgeschlossen: {
    label: "Abgeschlossen",
    className: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400",
  },
  storniert: {
    label: "Storniert",
    className: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400",
  },
};

export function BestellungStatusBadge({ status }: BestellungStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.neu;

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}
