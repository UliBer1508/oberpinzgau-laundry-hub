import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, MapPin, Plus } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  useRoutenvorlageKunden,
  useAddKundeToVorlage,
  useRemoveKundeFromVorlage,
  useUpdateKundenReihenfolge,
  type Routenvorlage,
  type RoutenvorlageKunde,
} from "@/hooks/useRoutenvorlagen";
import { useKunden } from "@/hooks/useKunden";

interface RoutenvorlageKundenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vorlage: Routenvorlage | null;
}

function SortableKundeItem({
  item,
  onRemove,
}: {
  item: RoutenvorlageKunde;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border bg-card p-3 ${
        isDragging ? "opacity-50 shadow-lg" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <Badge variant="outline" className="min-w-[2rem] justify-center">
        {item.reihenfolge}
      </Badge>

      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">
          {item.kunde?.firma || item.kunde?.name}
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="truncate">
            {item.kunde?.plz} {item.kunde?.ort}
            {item.kunde?.strasse && `, ${item.kunde.strasse}`}
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function RoutenvorlageKundenDialog({
  open,
  onOpenChange,
  vorlage,
}: RoutenvorlageKundenDialogProps) {
  const [selectedKundeId, setSelectedKundeId] = useState<string>("");

  const { data: vorlagenKunden = [], isLoading } = useRoutenvorlageKunden(
    vorlage?.id || null
  );
  const { data: alleKunden = [] } = useKunden();
  const addKunde = useAddKundeToVorlage();
  const removeKunde = useRemoveKundeFromVorlage();
  const updateReihenfolge = useUpdateKundenReihenfolge();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Kunden die noch nicht in der Vorlage sind
  const verfuegbareKunden = alleKunden.filter(
    (kunde) =>
      kunde.aktiv && !vorlagenKunden.some((vk) => vk.kunde_id === kunde.id)
  );

  const handleAddKunde = () => {
    if (!selectedKundeId || !vorlage) return;

    addKunde.mutate(
      { vorlage_id: vorlage.id, kunde_id: selectedKundeId },
      {
        onSuccess: () => {
          toast.success("Kunde hinzugefügt");
          setSelectedKundeId("");
        },
        onError: () => toast.error("Fehler beim Hinzufügen"),
      }
    );
  };

  const handleRemoveKunde = (id: string) => {
    if (!vorlage) return;

    removeKunde.mutate(
      { id, vorlage_id: vorlage.id },
      {
        onSuccess: () => toast.success("Kunde entfernt"),
        onError: () => toast.error("Fehler beim Entfernen"),
      }
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !vorlage) return;

    const oldIndex = vorlagenKunden.findIndex((k) => k.id === active.id);
    const newIndex = vorlagenKunden.findIndex((k) => k.id === over.id);

    const newOrder = arrayMove(vorlagenKunden, oldIndex, newIndex);
    const updates = newOrder.map((item, index) => ({
      id: item.id,
      reihenfolge: index + 1,
    }));

    updateReihenfolge.mutate(
      { vorlage_id: vorlage.id, items: updates },
      {
        onError: () => toast.error("Fehler beim Speichern der Reihenfolge"),
      }
    );
  };

  if (!vorlage) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Kunden für "{vorlage.name}"</DialogTitle>
        </DialogHeader>

        {/* Kunde hinzufügen */}
        <div className="flex gap-2">
          <Select value={selectedKundeId} onValueChange={setSelectedKundeId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Kunde auswählen..." />
            </SelectTrigger>
            <SelectContent>
              {verfuegbareKunden.map((kunde) => (
                <SelectItem key={kunde.id} value={kunde.id}>
                  <div className="flex flex-col">
                    <span>{kunde.firma || kunde.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {kunde.plz} {kunde.ort}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddKunde}
            disabled={!selectedKundeId || addKunde.isPending}
          >
            <Plus className="h-4 w-4 mr-1" />
            Hinzufügen
          </Button>
        </div>

        {/* Kundenliste mit Drag & Drop */}
        <div className="flex-1 overflow-auto space-y-2 pr-1">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Laden...
            </div>
          ) : vorlagenKunden.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Noch keine Kunden in dieser Route.
              <br />
              Füge Kunden hinzu und bringe sie in die gewünschte Reihenfolge.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={vorlagenKunden.map((k) => k.id)}
                strategy={verticalListSortingStrategy}
              >
                {vorlagenKunden.map((item) => (
                  <SortableKundeItem
                    key={item.id}
                    item={item}
                    onRemove={() => handleRemoveKunde(item.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t">
          Kunden per Drag & Drop in die gewünschte Reihenfolge bringen.
        </div>
      </DialogContent>
    </Dialog>
  );
}
