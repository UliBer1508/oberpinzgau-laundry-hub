import { ManagementMobileList } from "./ManagementMobileList";
import { type ManagementBestellung } from "@/hooks/useManagementBestellungen";

interface ManagementTableProps {
  bestellungen: ManagementBestellung[];
  onViewDetails?: (id: string) => void;
}

export function ManagementTable({ bestellungen, onViewDetails }: ManagementTableProps) {
  return <ManagementMobileList bestellungen={bestellungen} onViewDetails={onViewDetails} />;
}
