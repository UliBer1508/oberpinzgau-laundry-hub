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
import type { Waescheartikel } from "@/hooks/useWaescheartikel";

interface WaescheartikelFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedKategorie: string;
  onKategorieChange: (value: string) => void;
  selectedFarbe: string;
  onFarbeChange: (value: string) => void;
  showOnlyActive: boolean;
  onShowOnlyActiveChange: (value: boolean) => void;
  artikel: Waescheartikel[];
}

export function WaescheartikelFilter({
  searchTerm,
  onSearchChange,
  selectedKategorie,
  onKategorieChange,
  selectedFarbe,
  onFarbeChange,
  showOnlyActive,
  onShowOnlyActiveChange,
  artikel,
}: WaescheartikelFilterProps) {
  // Extract unique categories and colors from existing data
  const kategorien = [...new Set(artikel.map((a) => a.kategorie).filter(Boolean))] as string[];
  const farben = [...new Set(artikel.map((a) => a.farbe).filter(Boolean))] as string[];

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Suchen nach Name, Art.-Nr., Bezeichnung..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={selectedKategorie} onValueChange={onKategorieChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle Kategorien" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            {kategorien.map((kategorie) => (
              <SelectItem key={kategorie} value={kategorie}>
                {kategorie}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedFarbe} onValueChange={onFarbeChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Alle Farben" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Farben</SelectItem>
            {farben.map((farbe) => (
              <SelectItem key={farbe} value={farbe}>
                {farbe}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="show-active"
          checked={showOnlyActive}
          onCheckedChange={onShowOnlyActiveChange}
        />
        <Label htmlFor="show-active" className="text-sm">
          Nur Aktive
        </Label>
      </div>
    </div>
  );
}
