import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import type { BestellungStatus } from "@/hooks/useBestellungen";

interface BestellungenFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: BestellungStatus | "alle";
  onStatusChange: (value: BestellungStatus | "alle") => void;
  selectedKunde: string | "alle";
  onKundeChange: (value: string) => void;
  kunden: { id: string; name: string; kundennummer: string }[];
}

const STATUS_OPTIONS: { value: BestellungStatus | "alle"; label: string }[] = [
  { value: "alle", label: "Alle Status" },
  { value: "neu", label: "Neu" },
  { value: "in_bearbeitung", label: "In Bearbeitung" },
  { value: "ausgeliefert", label: "Ausgeliefert" },
  { value: "abgeholt", label: "Abgeholt" },
  { value: "abgeschlossen", label: "Abgeschlossen" },
  { value: "storniert", label: "Storniert" },
];

export function BestellungenFilter({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedKunde,
  onKundeChange,
  kunden,
}: BestellungenFilterProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Suche nach Bestellnummer, Kunde, Objekt..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={selectedStatus} onValueChange={(v) => onStatusChange(v as BestellungStatus | "alle")}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedKunde} onValueChange={onKundeChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Kunde" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="alle">Alle Kunden</SelectItem>
          {kunden.map((kunde) => (
            <SelectItem key={kunde.id} value={kunde.id}>
              {kunde.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
