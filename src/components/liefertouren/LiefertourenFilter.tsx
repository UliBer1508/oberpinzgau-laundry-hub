import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWaeschekraefte } from "@/hooks/useLiefertouren";

interface LiefertourenFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  waeschekraftFilter: string;
  onWaeschekraftChange: (value: string) => void;
}

export function LiefertourenFilter({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  waeschekraftFilter,
  onWaeschekraftChange,
}: LiefertourenFilterProps) {
  const { data: waeschekraefte = [] } = useWaeschekraefte();

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Suche nach Tournummer oder Name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Status</SelectItem>
          <SelectItem value="geplant">Geplant</SelectItem>
          <SelectItem value="aktiv">Aktiv</SelectItem>
          <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
        </SelectContent>
      </Select>

      <Select value={waeschekraftFilter} onValueChange={onWaeschekraftChange}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Wäschekraft" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Wäschekräfte</SelectItem>
          {waeschekraefte.map((wk) => (
            <SelectItem key={wk.id} value={wk.id}>
              {wk.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
