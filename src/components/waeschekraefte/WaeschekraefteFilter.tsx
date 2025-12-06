import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WaeschekraefteFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  portalFilter: string;
  onPortalChange: (value: string) => void;
}

export function WaeschekraefteFilter({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  portalFilter,
  onPortalChange,
}: WaeschekraefteFilterProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Suche nach Name, Personalnummer..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full md:w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Status</SelectItem>
          <SelectItem value="aktiv">Aktiv</SelectItem>
          <SelectItem value="inaktiv">Inaktiv</SelectItem>
        </SelectContent>
      </Select>

      <Select value={portalFilter} onValueChange={onPortalChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Portalzugang" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle</SelectItem>
          <SelectItem value="mit">Mit Portalzugang</SelectItem>
          <SelectItem value="ohne">Ohne Portalzugang</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
