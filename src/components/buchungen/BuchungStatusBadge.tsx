import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BuchungStatusBadgeProps {
  status: "anstehend" | "eingecheckt" | "ausgecheckt" | "storniert";
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  anstehend: {
    label: "Anstehend",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  },
  eingecheckt: {
    label: "Eingecheckt",
    className: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400",
  },
  ausgecheckt: {
    label: "Ausgecheckt",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400",
  },
  storniert: {
    label: "Storniert",
    className: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400",
  },
};

export function BuchungStatusBadge({ status }: BuchungStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.anstehend;

  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
