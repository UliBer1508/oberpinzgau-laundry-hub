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
import { Search } from "lucide-react";

interface ObjekteFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typFilter: string;
  onTypChange: (value: string) => void;
  kundeFilter: string;
  onKundeChange: (value: string) => void;
  nurAktive: boolean;
  onNurAktiveChange: (value: boolean) => void;
  kunden: Array<{ id: string; name: string; firma: string | null }>;
}

const objektTypen = [
  { value: "alle", label: "Alle Typen" },
  { value: "hotel", label: "Hotel" },
  { value: "apartmenthaus", label: "Apartmenthaus" },
  { value: "ferienhaus", label: "Ferienhaus" },
  { value: "ferienwohnung", label: "Ferienwohnung" },
];

export function ObjekteFilter({
  searchTerm,
  onSearchChange,
  typFilter,
  onTypChange,
  kundeFilter,
  onKundeChange,
  nurAktive,
  onNurAktiveChange,
  kunden,
}: ObjekteFilterProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Suche nach Name, Objektnummer..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typFilter} onValueChange={onTypChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Objekttyp" />
          </SelectTrigger>
          <SelectContent>
            {objektTypen.map((typ) => (
              <SelectItem key={typ.value} value={typ.value}>
                {typ.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={kundeFilter} onValueChange={onKundeChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Alle Kunden" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Kunden</SelectItem>
            {kunden.map((kunde) => (
              <SelectItem key={kunde.id} value={kunde.id}>
                {kunde.name}
                {kunde.firma && ` (${kunde.firma})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="nur-aktive"
          checked={nurAktive}
          onCheckedChange={onNurAktiveChange}
        />
        <Label htmlFor="nur-aktive" className="text-sm text-muted-foreground">
          Nur aktive
        </Label>
      </div>
    </div>
  );
}
