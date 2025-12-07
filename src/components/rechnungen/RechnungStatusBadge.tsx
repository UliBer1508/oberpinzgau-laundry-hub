import { Badge } from "@/components/ui/badge";
import { RechnungStatus } from "@/hooks/useRechnungen";

interface RechnungStatusBadgeProps {
  status: RechnungStatus;
}

const statusConfig: Record<RechnungStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  offen: { label: "Offen", variant: "secondary" },
  bezahlt: { label: "Bezahlt", variant: "default" },
  storniert: { label: "Storniert", variant: "destructive" },
  mahnung: { label: "Mahnung", variant: "destructive" },
};

export function RechnungStatusBadge({ status }: RechnungStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.offen;
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}
