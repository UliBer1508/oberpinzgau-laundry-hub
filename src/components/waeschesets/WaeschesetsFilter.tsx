import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface WaeschesetsFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedKunde: string;
  onKundeChange: (value: string) => void;
  kunden: { id: string; name: string }[];
  showOnlyAktiv: boolean;
  onShowOnlyAktivChange: (value: boolean) => void;
}

export function WaeschesetsFilter({
  searchTerm,
  onSearchChange,
  selectedKunde,
  onKundeChange,
  kunden,
  showOnlyAktiv,
  onShowOnlyAktivChange,
}: WaeschesetsFilterProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Suche nach Name, Kunde oder Objekt..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={selectedKunde} onValueChange={onKundeChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Alle Kunden" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Kunden</SelectItem>
          {kunden.map((kunde) => (
            <SelectItem key={kunde.id} value={kunde.id}>
              {kunde.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Switch
          id="nur-aktiv"
          checked={showOnlyAktiv}
          onCheckedChange={onShowOnlyAktivChange}
        />
        <Label htmlFor="nur-aktiv" className="whitespace-nowrap text-sm">
          Nur Aktive
        </Label>
      </div>
    </div>
  );
}
