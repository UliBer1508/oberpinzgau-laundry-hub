import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LiefertourStatusBadgeProps {
  status: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  geplant: {
    label: "Geplant",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  },
  aktiv: {
    label: "Aktiv",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
  },
  abgeschlossen: {
    label: "Abgeschlossen",
    className: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400",
  },
};

export function LiefertourStatusBadge({ status }: LiefertourStatusBadgeProps) {
  const config = STATUS_CONFIG[status || "geplant"] || STATUS_CONFIG.geplant;

  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
