import { useState, useEffect } from "react";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ManagementTableRow } from "./ManagementTableRow";
import { type ManagementBestellung, useUpdateReihenfolge } from "@/hooks/useManagementBestellungen";
import { toast } from "sonner";

interface ManagementTableProps {
  bestellungen: ManagementBestellung[];
  onViewDetails?: (id: string) => void;
}

export function ManagementTable({ bestellungen, onViewDetails }: ManagementTableProps) {
  const [items, setItems] = useState(bestellungen);
  const updateReihenfolge = useUpdateReihenfolge();

  // Sync items with bestellungen when they change
  useEffect(() => {
    setItems(bestellungen);
  }, [bestellungen]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Update reihenfolge in database
      const updates = newItems.map((item, index) => ({
        id: item.id,
        reihenfolge: index + 1,
      }));

      updateReihenfolge.mutate(updates, {
        onSuccess: () => {
          toast.success("Reihenfolge aktualisiert");
        },
        onError: () => {
          toast.error("Fehler beim Aktualisieren der Reihenfolge");
          setItems(bestellungen);
        },
      });
    }
  };

  if (bestellungen.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 rounded-lg border bg-card">
        <p className="text-muted-foreground">Keine Bestellungen für die ausgewählten Filter gefunden</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="w-[50px]">Prio</TableHead>
              <TableHead className="w-[100px]">Bestellnr.</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Objekt</TableHead>
              <TableHead className="w-[130px]">Status</TableHead>
              <TableHead className="w-[100px]">Lieferung</TableHead>
              <TableHead className="w-[100px]">Abholung</TableHead>
              <TableHead className="w-[130px]">Bis</TableHead>
              <TableHead className="w-[160px]">Wäschekraft</TableHead>
              <TableHead className="min-w-[180px]">Artikel</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((bestellung) => (
                <ManagementTableRow
                  key={bestellung.id}
                  bestellung={bestellung}
                  isSelected={false}
                />
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </DndContext>
    </div>
  );
}