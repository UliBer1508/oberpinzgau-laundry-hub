import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useWaeschekraefteForSelect } from "@/hooks/useBestellungen";

interface ManagementFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  waeschekraftFilter: string;
  onWaeschekraftChange: (id: string) => void;
  priorityFilter: string;
  onPriorityChange: (priority: string) => void;
}

export function ManagementFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  waeschekraftFilter,
  onWaeschekraftChange,
  priorityFilter,
  onPriorityChange,
}: ManagementFilterBarProps) {
  const { data: waeschekraefte } = useWaeschekraefteForSelect();

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Suche nach Bestellnummer, Kunde, Objekt..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Status</SelectItem>
          <SelectItem value="neu">Neu</SelectItem>
          <SelectItem value="in_bearbeitung">In Bearbeitung</SelectItem>
          <SelectItem value="ausgeliefert">Ausgeliefert</SelectItem>
          <SelectItem value="abgeholt">Abgeholt</SelectItem>
          <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
          <SelectItem value="storniert">Storniert</SelectItem>
        </SelectContent>
      </Select>

      <Select value={waeschekraftFilter} onValueChange={onWaeschekraftChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Wäschekraft" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Wäschekräfte</SelectItem>
          {waeschekraefte?.map((wk) => (
            <SelectItem key={wk.id} value={wk.id}>
              {wk.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={priorityFilter} onValueChange={onPriorityChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Priorität" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle</SelectItem>
          <SelectItem value="2">🔴 Dringend</SelectItem>
          <SelectItem value="1">🟡 Hoch</SelectItem>
          <SelectItem value="0">⚪ Normal</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}