import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GripVertical } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { type ManagementBestellung, useUpdateWaeschekraft, useUpdateManagementStatus, useUpdatePrioritaet } from "@/hooks/useManagementBestellungen";
import { useWaeschekraefteForSelect } from "@/hooks/useBestellungen";
import { toast } from "sonner";

interface ManagementTableRowProps {
  bestellung: ManagementBestellung;
  isSelected: boolean;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className?: string }> = {
  neu: { label: "Neu", variant: "secondary", className: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
  in_bearbeitung: { label: "In Bearbeitung", variant: "default", className: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
  ausgeliefert: { label: "Ausgeliefert", variant: "default", className: "bg-purple-100 text-purple-700 hover:bg-purple-200" },
  abgeholt: { label: "Abgeholt", variant: "default", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
  abgeschlossen: { label: "Abgeschlossen", variant: "secondary", className: "bg-gray-100 text-gray-700" },
  storniert: { label: "Storniert", variant: "destructive" },
};

const priorityConfig: Record<number, { icon: string; color: string }> = {
  0: { icon: "⚪", color: "text-muted-foreground" },
  1: { icon: "🟡", color: "text-amber-500" },
  2: { icon: "🔴", color: "text-red-500" },
};

export function ManagementTableRow({ bestellung, isSelected }: ManagementTableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bestellung.id });

  const { data: waeschekraefte } = useWaeschekraefteForSelect();
  const updateWaeschekraft = useUpdateWaeschekraft();
  const updateStatus = useUpdateManagementStatus();
  const updatePrioritaet = useUpdatePrioritaet();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const status = bestellung.status || "neu";
  const statusInfo = statusConfig[status] || statusConfig.neu;
  const priority = bestellung.prioritaet || 0;
  const priorityInfo = priorityConfig[priority] || priorityConfig[0];
  const positionen = bestellung.positionen || [];

  const handleWaeschekraftChange = (value: string) => {
    updateWaeschekraft.mutate(
      { id: bestellung.id, waeschekraft_id: value === "none" ? null : value },
      {
        onSuccess: () => toast.success("Wäschekraft zugewiesen"),
        onError: () => toast.error("Fehler bei der Zuweisung"),
      }
    );
  };

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate(
      { id: bestellung.id, status: newStatus as "neu" | "in_bearbeitung" | "ausgeliefert" | "abgeholt" | "abgeschlossen" | "storniert" },
      {
        onSuccess: () => toast.success("Status aktualisiert"),
        onError: () => toast.error("Fehler beim Aktualisieren"),
      }
    );
  };

  const handlePriorityChange = (newPriority: number) => {
    updatePrioritaet.mutate(
      { id: bestellung.id, prioritaet: newPriority },
      {
        onSuccess: () => toast.success("Priorität aktualisiert"),
        onError: () => toast.error("Fehler beim Aktualisieren"),
      }
    );
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        "group transition-colors",
        isDragging && "opacity-50 bg-muted",
        isSelected && "bg-primary/5 border-l-2 border-l-primary"
      )}
    >
      <TableCell className="w-[40px]">
        <button
          className="cursor-grab touch-none p-1 text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>

      <TableCell className="w-[50px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-lg hover:scale-110 transition-transform">
              {priorityInfo.icon}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => handlePriorityChange(2)}>
              🔴 Dringend
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePriorityChange(1)}>
              🟡 Hoch
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePriorityChange(0)}>
              ⚪ Normal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>

      <TableCell className="font-mono font-medium">
        {bestellung.bestellnummer}
      </TableCell>

      <TableCell>
        <div className="space-y-0.5">
          <div className="font-medium">{bestellung.kundeName}</div>
          {bestellung.objektName && (
            <div className="text-sm text-muted-foreground">
              {bestellung.objektName}
            </div>
          )}
        </div>
      </TableCell>

      <TableCell>
        {bestellung.lieferdatum ? (
          <div className="text-sm">
            <div className="font-medium">
              {format(new Date(bestellung.lieferdatum), "dd.MM.", { locale: de })}
            </div>
            {bestellung.lieferzeit && (
              <div className="text-muted-foreground">{bestellung.lieferzeit}</div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>

      <TableCell>
        {bestellung.abholdatum ? (
          <div className="text-sm">
            <div className="font-medium">
              {format(new Date(bestellung.abholdatum), "dd.MM.", { locale: de })}
            </div>
            {bestellung.abholzeit && (
              <div className="text-muted-foreground">{bestellung.abholzeit}</div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>

      <TableCell>
        <Select
          value={bestellung.waeschekraft_id || "none"}
          onValueChange={handleWaeschekraftChange}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Zuweisen..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">— Nicht zugewiesen —</SelectItem>
            {waeschekraefte?.map((wk) => (
              <SelectItem key={wk.id} value={wk.id}>
                {wk.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      <TableCell>
        <div className="space-y-0.5 text-sm max-h-24 overflow-y-auto">
          {positionen.length === 0 ? (
            <span className="text-muted-foreground italic">Keine Artikel</span>
          ) : (
            positionen.map((pos) => (
              <div key={pos.id} className="flex items-center gap-1.5">
                <span className="font-mono text-muted-foreground text-xs">{pos.menge}×</span>
                <span className="truncate">{pos.artikelName}</span>
                {pos.farbe && (
                  <span className="text-xs text-muted-foreground shrink-0">({pos.farbe})</span>
                )}
              </div>
            ))
          )}
        </div>
      </TableCell>

      <TableCell>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="h-8 text-sm border-0 p-0">
            <Badge 
              variant={statusInfo.variant} 
              className={cn("cursor-pointer", statusInfo.className)}
            >
              {statusInfo.label}
            </Badge>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
    </TableRow>
  );
}