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

interface KundenFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  bestellartFilter: string;
  onBestellartChange: (value: string) => void;
  nurAktive: boolean;
  onNurAktiveChange: (value: boolean) => void;
}

export function KundenFilter({
  searchTerm,
  onSearchChange,
  bestellartFilter,
  onBestellartChange,
  nurAktive,
  onNurAktiveChange,
}: KundenFilterProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Suche nach Name, Firma oder Kundennummer..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Select value={bestellartFilter} onValueChange={onBestellartChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Bestellart" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Bestellarten</SelectItem>
            <SelectItem value="lieferung">Nur Lieferung</SelectItem>
            <SelectItem value="abholung">Nur Abholung</SelectItem>
            <SelectItem value="beides">Lieferung & Abholung</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch
            id="nur-aktive"
            checked={nurAktive}
            onCheckedChange={onNurAktiveChange}
          />
          <Label htmlFor="nur-aktive" className="text-sm text-muted-foreground cursor-pointer">
            Nur aktive
          </Label>
        </div>
      </div>
    </div>
  );
}
