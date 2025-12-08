import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { RechnungStatus } from "@/hooks/useRechnungen";

interface RechnungenFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: RechnungStatus | "alle" | "ueberfaellig";
  onStatusFilterChange: (value: RechnungStatus | "alle" | "ueberfaellig") => void;
}

export function RechnungenFilter({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: RechnungenFilterProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Suche nach Rechnungsnummer, Kunde..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as RechnungStatus | "alle" | "ueberfaellig")}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="alle">Alle Status</SelectItem>
          <SelectItem value="ueberfaellig">Überfällig</SelectItem>
          <SelectItem value="offen">Offen</SelectItem>
          <SelectItem value="bezahlt">Bezahlt</SelectItem>
          <SelectItem value="mahnung">Mahnung</SelectItem>
          <SelectItem value="storniert">Storniert</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}