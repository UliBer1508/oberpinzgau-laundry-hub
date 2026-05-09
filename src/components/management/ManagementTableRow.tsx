import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { GripVertical, CalendarIcon, Clock, Eye } from "lucide-react";
import { format, isBefore, addHours, isWithinInterval } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { type ManagementBestellung, useUpdateWaeschekraft, useUpdateManagementStatus, useUpdatePrioritaet, useUpdateBearbeitungDeadline, useUpdateLieferdatum, useUpdateAbholdatum } from "@/hooks/useManagementBestellungen";
import { useWaeschekraefteForSelect } from "@/hooks/useBestellungen";
import { toast } from "sonner";

interface ManagementTableRowProps {
  bestellung: ManagementBestellung;
  isSelected: boolean;
  onViewDetails?: (id: string) => void;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className?: string }> = {
  neu: { label: "Neu", variant: "secondary", className: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
  in_bearbeitung: { label: "In Bearbeitung", variant: "default", className: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
  ausgeliefert: { label: "Ausgeliefert", variant: "default", className: "bg-purple-100 text-purple-700 hover:bg-purple-200" },
  abgeholt: { label: "Abgeholt", variant: "default", className: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200" },
  abgeschlossen: { label: "Abgeschlossen", variant: "secondary", className: "bg-green-100 text-green-700 hover:bg-green-200" },
  storniert: { label: "Storniert", variant: "destructive" },
};

const statusRowColors: Record<string, string> = {
  neu: "bg-blue-50",
  in_bearbeitung: "bg-amber-50",
  ausgeliefert: "bg-purple-50",
  abgeholt: "bg-cyan-50",
  abgeschlossen: "bg-green-50",
  storniert: "bg-red-50",
};

const priorityConfig: Record<number, { icon: string; color: string }> = {
  0: { icon: "⚪", color: "text-muted-foreground" },
  1: { icon: "🟡", color: "text-amber-500" },
  2: { icon: "🔴", color: "text-red-500" },
};

export function ManagementTableRow({ bestellung, isSelected, onViewDetails }: ManagementTableRowProps) {
  // Deadline state
  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(
    bestellung.bearbeitung_deadline ? new Date(bestellung.bearbeitung_deadline) : undefined
  );
  const [deadlineTime, setDeadlineTime] = useState(
    bestellung.bearbeitung_deadline 
      ? format(new Date(bestellung.bearbeitung_deadline), "HH:mm")
      : ""
  );
  const [isDeadlineOpen, setIsDeadlineOpen] = useState(false);

  // Lieferdatum state
  const [lieferDate, setLieferDate] = useState<Date | undefined>(
    bestellung.lieferdatum ? new Date(bestellung.lieferdatum) : undefined
  );
  const [lieferTime, setLieferTime] = useState(bestellung.lieferzeit || "");
  const [isLieferOpen, setIsLieferOpen] = useState(false);

  // Abholdatum state
  const [abholDate, setAbholDate] = useState<Date | undefined>(
    bestellung.abholdatum ? new Date(bestellung.abholdatum) : undefined
  );
  const [abholTime, setAbholTime] = useState(bestellung.abholzeit || "");
  const [isAbholOpen, setIsAbholOpen] = useState(false);

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
  const updateDeadline = useUpdateBearbeitungDeadline();
  const updateLieferdatum = useUpdateLieferdatum();
  const updateAbholdatum = useUpdateAbholdatum();

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
        onSuccess: (data) => {
          toast.success("Status aktualisiert");
          if (data?.invoiceCreated) {
            toast.success("Rechnung wurde automatisch erstellt", {
              description: `Für Bestellung ${bestellung.bestellnummer}`,
              duration: 5000,
            });
          }
        },
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

  const handleDeadlineSave = () => {
    if (!deadlineDate) {
      updateDeadline.mutate(
        { id: bestellung.id, bearbeitung_deadline: null },
        {
          onSuccess: () => {
            toast.success("Deadline entfernt");
            setIsDeadlineOpen(false);
          },
          onError: () => toast.error("Fehler beim Aktualisieren"),
        }
      );
      return;
    }

    const [hours, minutes] = (deadlineTime || "12:00").split(":").map(Number);
    const deadline = new Date(deadlineDate);
    deadline.setHours(hours, minutes, 0, 0);

    updateDeadline.mutate(
      { id: bestellung.id, bearbeitung_deadline: deadline.toISOString() },
      {
        onSuccess: () => {
          toast.success("Deadline aktualisiert");
          setIsDeadlineOpen(false);
        },
        onError: () => toast.error("Fehler beim Aktualisieren"),
      }
    );
  };

  const handleLieferdatumSave = () => {
    const lieferdatum = lieferDate ? format(lieferDate, "yyyy-MM-dd") : null;
    updateLieferdatum.mutate(
      { id: bestellung.id, lieferdatum, lieferzeit: lieferTime || null },
      {
        onSuccess: () => {
          toast.success("Lieferdatum aktualisiert");
          setIsLieferOpen(false);
        },
        onError: () => toast.error("Fehler beim Aktualisieren"),
      }
    );
  };

  const handleAbholdatumSave = () => {
    const abholdatum = abholDate ? format(abholDate, "yyyy-MM-dd") : null;
    updateAbholdatum.mutate(
      { id: bestellung.id, abholdatum, abholzeit: abholTime || null },
      {
        onSuccess: () => {
          toast.success("Abholdatum aktualisiert");
          setIsAbholOpen(false);
        },
        onError: () => toast.error("Fehler beim Aktualisieren"),
      }
    );
  };

  // Deadline styling
  const getDeadlineStyle = () => {
    if (!bestellung.bearbeitung_deadline) return "";
    const deadline = new Date(bestellung.bearbeitung_deadline);
    const now = new Date();
    
    if (isBefore(deadline, now)) {
      return "text-red-600 font-medium"; // Überfällig
    }
    if (isWithinInterval(now, { start: now, end: addHours(now, 2) }) && isBefore(deadline, addHours(now, 2))) {
      return "text-amber-600 font-medium"; // In 2 Stunden fällig
    }
    return "";
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        "group transition-colors",
        statusRowColors[status] || "",
        isDragging && "opacity-50 bg-muted",
        isSelected && "bg-primary/5 border-l-2 border-l-primary"
      )}
    >
      {/* Drag Handle */}
      <TableCell className="w-[40px]">
        <button
          className="cursor-grab touch-none p-1 text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>

      {/* Priorität */}
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

      {/* Bestellnummer (klickbar zum Anzeigen/Bearbeiten) */}
      <TableCell className="font-mono font-medium">
        <button
          type="button"
          onClick={() => onViewDetails?.(bestellung.id)}
          className="text-left hover:text-primary hover:underline transition-colors"
        >
          {bestellung.bestellnummer}
        </button>
      </TableCell>

      {/* Kunde */}
      <TableCell>
        <div className="font-medium">{bestellung.kundeName}</div>
      </TableCell>

      {/* Objekt */}
      <TableCell>
        {bestellung.objektName ? (
          <div className="text-sm text-muted-foreground">{bestellung.objektName}</div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>

      {/* Status */}
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

      {/* Lieferdatum */}
      <TableCell>
        <Popover open={isLieferOpen} onOpenChange={setIsLieferOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "h-auto p-1 text-sm justify-start font-normal",
                !bestellung.lieferdatum && "text-muted-foreground"
              )}
            >
              {bestellung.lieferdatum ? (
                <div className="text-left">
                  <div className="font-medium">
                    {format(new Date(bestellung.lieferdatum), "dd.MM.", { locale: de })}
                  </div>
                  {bestellung.lieferzeit && (
                    <div className="text-xs text-muted-foreground">{bestellung.lieferzeit}</div>
                  )}
                </div>
              ) : (
                <span className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" /> Setzen
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="space-y-3">
              <Calendar
                mode="single"
                selected={lieferDate}
                onSelect={setLieferDate}
                locale={de}
                className="pointer-events-auto"
              />
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={lieferTime}
                  onChange={(e) => setLieferTime(e.target.value)}
                  className="w-auto"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleLieferdatumSave}>
                  Speichern
                </Button>
                {bestellung.lieferdatum && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setLieferDate(undefined);
                      setLieferTime("");
                      updateLieferdatum.mutate(
                        { id: bestellung.id, lieferdatum: null, lieferzeit: null },
                        {
                          onSuccess: () => {
                            toast.success("Lieferdatum entfernt");
                            setIsLieferOpen(false);
                          },
                        }
                      );
                    }}
                  >
                    Entfernen
                  </Button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </TableCell>

      {/* Abholdatum */}
      <TableCell>
        <Popover open={isAbholOpen} onOpenChange={setIsAbholOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "h-auto p-1 text-sm justify-start font-normal",
                !bestellung.abholdatum && "text-muted-foreground"
              )}
            >
              {bestellung.abholdatum ? (
                <div className="text-left">
                  <div className="font-medium">
                    {format(new Date(bestellung.abholdatum), "dd.MM.", { locale: de })}
                  </div>
                  {bestellung.abholzeit && (
                    <div className="text-xs text-muted-foreground">{bestellung.abholzeit}</div>
                  )}
                </div>
              ) : (
                <span className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" /> Setzen
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="space-y-3">
              <Calendar
                mode="single"
                selected={abholDate}
                onSelect={setAbholDate}
                locale={de}
                className="pointer-events-auto"
              />
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={abholTime}
                  onChange={(e) => setAbholTime(e.target.value)}
                  className="w-auto"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAbholdatumSave}>
                  Speichern
                </Button>
                {bestellung.abholdatum && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAbholDate(undefined);
                      setAbholTime("");
                      updateAbholdatum.mutate(
                        { id: bestellung.id, abholdatum: null, abholzeit: null },
                        {
                          onSuccess: () => {
                            toast.success("Abholdatum entfernt");
                            setIsAbholOpen(false);
                          },
                        }
                      );
                    }}
                  >
                    Entfernen
                  </Button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </TableCell>

      {/* Bearbeitung Deadline */}
      <TableCell>
        <Popover open={isDeadlineOpen} onOpenChange={setIsDeadlineOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "h-auto p-1 text-sm justify-start font-normal",
                !bestellung.bearbeitung_deadline && "text-muted-foreground",
                getDeadlineStyle()
              )}
            >
              {bestellung.bearbeitung_deadline ? (
                <div className="text-left">
                  <div className="font-medium">
                    {format(new Date(bestellung.bearbeitung_deadline), "dd.MM.", { locale: de })}
                  </div>
                  <div className="text-xs">
                    {format(new Date(bestellung.bearbeitung_deadline), "HH:mm")}
                  </div>
                </div>
              ) : (
                <span className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" /> Setzen
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="space-y-3">
              <Calendar
                mode="single"
                selected={deadlineDate}
                onSelect={setDeadlineDate}
                locale={de}
                className="pointer-events-auto"
              />
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="w-auto"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleDeadlineSave}>
                  Speichern
                </Button>
                {bestellung.bearbeitung_deadline && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDeadlineDate(undefined);
                      setDeadlineTime("");
                      handleDeadlineSave();
                    }}
                  >
                    Entfernen
                  </Button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </TableCell>

      {/* Wäschekraft */}
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

      {/* Artikel */}
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

      {/* Aktion: Anzeigen/Bearbeiten */}
      <TableCell className="w-[60px] text-right">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onViewDetails?.(bestellung.id)}
          title="Anzeigen / Bearbeiten"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}