import { useState } from "react";
import { Plus, Edit, Trash2, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { RoutenvorlageFormDialog } from "./RoutenvorlageFormDialog";
import { RoutenvorlageKundenDialog } from "./RoutenvorlageKundenDialog";
import {
  useRoutenvorlagen,
  useCreateRoutenvorlage,
  useUpdateRoutenvorlage,
  useDeleteRoutenvorlage,
  type Routenvorlage,
} from "@/hooks/useRoutenvorlagen";

export function RoutenvorlagenTab() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isKundenOpen, setIsKundenOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedVorlage, setSelectedVorlage] = useState<Routenvorlage | null>(
    null
  );

  const { data: vorlagen = [], isLoading } = useRoutenvorlagen();
  const createVorlage = useCreateRoutenvorlage();
  const updateVorlage = useUpdateRoutenvorlage();
  const deleteVorlage = useDeleteRoutenvorlage();

  const handleNew = () => {
    setSelectedVorlage(null);
    setIsFormOpen(true);
  };

  const handleEdit = (vorlage: Routenvorlage) => {
    setSelectedVorlage(vorlage);
    setIsFormOpen(true);
  };

  const handleManageKunden = (vorlage: Routenvorlage) => {
    setSelectedVorlage(vorlage);
    setIsKundenOpen(true);
  };

  const handleFormSubmit = (data: { name: string; beschreibung?: string }) => {
    if (selectedVorlage) {
      updateVorlage.mutate(
        { id: selectedVorlage.id, ...data },
        {
          onSuccess: () => toast.success("Vorlage aktualisiert"),
          onError: () => toast.error("Fehler beim Speichern"),
        }
      );
    } else {
      createVorlage.mutate(data, {
        onSuccess: () => toast.success("Vorlage erstellt"),
        onError: () => toast.error("Fehler beim Erstellen"),
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;

    deleteVorlage.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Vorlage gelöscht");
        setDeleteId(null);
      },
      onError: () => toast.error("Fehler beim Löschen"),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Routenvorlagen</h3>
          <p className="text-sm text-muted-foreground">
            Vordefinierte Routen mit Kunden in fester Reihenfolge
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Neue Vorlage
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Laden...</div>
      ) : vorlagen.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">Keine Routenvorlagen</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Erstelle Routenvorlagen um Touren schneller zu planen.
          </p>
          <Button onClick={handleNew} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Erste Vorlage erstellen
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Beschreibung</TableHead>
                <TableHead className="text-center">Kunden</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vorlagen.map((vorlage) => (
                <TableRow key={vorlage.id}>
                  <TableCell className="font-medium">{vorlage.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {vorlage.beschreibung || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">
                      {vorlage.kundenCount} Kunden
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={vorlage.aktiv ? "default" : "outline"}>
                      {vorlage.aktiv ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleManageKunden(vorlage)}
                        title="Kunden verwalten"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(vorlage)}
                        title="Bearbeiten"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(vorlage.id)}
                        className="text-destructive hover:text-destructive"
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <RoutenvorlageFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        vorlage={selectedVorlage}
        onSubmit={handleFormSubmit}
      />

      <RoutenvorlageKundenDialog
        open={isKundenOpen}
        onOpenChange={setIsKundenOpen}
        vorlage={selectedVorlage}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vorlage löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Vorlage und
              alle zugeordneten Kunden werden gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
