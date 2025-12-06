import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { GripVertical, Check, X, Plus, MapPin, Clock, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  useLiefertourStopps,
  useAvailableBestellungen,
  useAddStoppToTour,
  useRemoveStoppFromTour,
  useToggleStoppErledigt,
  useUpdateStoppReihenfolge,
} from "@/hooks/useLiefertouren";
import type { Liefertour, LiefertourStopp } from "@/hooks/useLiefertouren";

interface LiefertourStoppsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tour: Liefertour | null;
}

export function LiefertourStoppsDialog({
  open,
  onOpenChange,
  tour,
}: LiefertourStoppsDialogProps) {
  const [selectedBestellung, setSelectedBestellung] = useState<string>("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const { data: stopps = [], isLoading } = useLiefertourStopps(tour?.id || null);
  const { data: availableBestellungen = [] } = useAvailableBestellungen(tour?.datum || null, tour?.id || null);

  const addStopp = useAddStoppToTour();
  const removeStopp = useRemoveStoppFromTour();
  const toggleErledigt = useToggleStoppErledigt();
  const updateReihenfolge = useUpdateStoppReihenfolge();

  const handleAddStopp = () => {
    if (!selectedBestellung || !tour) return;
    addStopp.mutate({ tour_id: tour.id, bestellung_id: selectedBestellung });
    setSelectedBestellung("");
  };

  const handleToggleErledigt = (stopp: LiefertourStopp) => {
    if (!tour) return;
    toggleErledigt.mutate({
      id: stopp.id,
      tour_id: tour.id,
      erledigt: !stopp.erledigt,
    });
  };

  const handleRemoveStopp = (stopp: LiefertourStopp) => {
    if (!tour) return;
    removeStopp.mutate({ id: stopp.id, tour_id: tour.id });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newStopps = [...stopps];
    const draggedItem = newStopps[draggedIndex];
    newStopps.splice(draggedIndex, 1);
    newStopps.splice(index, 0, draggedItem);

    // Update reihenfolge for all items
    const updatedStopps = newStopps.map((s, i) => ({
      id: s.id,
      reihenfolge: i + 1,
    }));

    if (tour) {
      updateReihenfolge.mutate({ stopps: updatedStopps, tour_id: tour.id });
    }

    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const erledigtCount = stopps.filter((s) => s.erledigt).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Stopps verwalten
          </DialogTitle>
          {tour && (
            <div className="text-sm text-muted-foreground">
              {tour.tournummer} - "{tour.name}" ({format(new Date(tour.datum), "dd.MM.yyyy", { locale: de })})
              {tour.waeschekraftName && ` • ${tour.waeschekraftName}`}
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* Progress */}
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4" />
            <span>
              {erledigtCount} von {stopps.length} Stopps erledigt
            </span>
          </div>

          {/* Stopps List */}
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Laden...</div>
          ) : stopps.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Noch keine Stopps hinzugefügt
            </div>
          ) : (
            <div className="space-y-2">
              {stopps.map((stopp, index) => (
                <div
                  key={stopp.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border bg-card p-3 transition-all",
                    draggedIndex === index && "opacity-50",
                    stopp.erledigt && "bg-muted/50"
                  )}
                >
                  {/* Drag Handle */}
                  <div className="cursor-grab text-muted-foreground hover:text-foreground">
                    <GripVertical className="h-5 w-5" />
                  </div>

                  {/* Order Number */}
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {stopp.reihenfolge}
                  </div>

                  {/* Checkbox */}
                  <Checkbox
                    checked={stopp.erledigt}
                    onCheckedChange={() => handleToggleErledigt(stopp)}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{stopp.bestellnummer}</span>
                      <span className={cn("font-medium", stopp.erledigt && "line-through text-muted-foreground")}>
                        {stopp.kundeName}
                      </span>
                    </div>
                    {(stopp.objektName || stopp.adresse) && (
                      <div className="text-sm text-muted-foreground truncate">
                        {stopp.objektName}
                        {stopp.objektName && stopp.adresse && " • "}
                        {stopp.adresse}
                      </div>
                    )}
                  </div>

                  {/* Time */}
                  {stopp.erledigt && stopp.ankunftszeit && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {format(new Date(stopp.ankunftszeit), "HH:mm")}
                    </div>
                  )}

                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveStopp(stopp)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Stopp */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center gap-3">
            <Select value={selectedBestellung} onValueChange={setSelectedBestellung}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Bestellung hinzufügen..." />
              </SelectTrigger>
              <SelectContent>
                {availableBestellungen.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Keine verfügbaren Bestellungen für dieses Datum
                  </div>
                ) : (
                  availableBestellungen.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.bestellnummer} - {b.kundeName}
                      {b.objektName && ` (${b.objektName})`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button onClick={handleAddStopp} disabled={!selectedBestellung}>
              <Plus className="mr-2 h-4 w-4" />
              Hinzufügen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
