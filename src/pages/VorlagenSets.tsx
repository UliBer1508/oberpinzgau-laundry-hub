import { useState } from "react";
import { Layers, Plus } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BackButton } from "@/components/layout/BackButton";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useVorlagenSets, useCreateVorlage, useUpdateVorlage, useDeleteVorlage, useAddVorlageArtikel,
  type VorlageSet,
} from "@/hooks/useVorlagenSets";
import { VorlageFormDialog, type PendingVorlageArtikel } from "@/components/vorlagen/VorlageFormDialog";
import { VorlagenSetsGrid } from "@/components/vorlagen/VorlagenSetsGrid";

export default function VorlagenSets() {
  const { toast } = useToast();
  const { data: vorlagen = [], isLoading } = useVorlagenSets();
  const createMut = useCreateVorlage();
  const updateMut = useUpdateVorlage();
  const deleteMut = useDeleteVorlage();
  const addArtikelMut = useAddVorlageArtikel();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<VorlageSet | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleNew = () => { setSelected(null); setDialogOpen(true); };
  const handleEdit = (v: VorlageSet) => { setSelected(v); setDialogOpen(true); };

  const handleSubmit = async (
    values: { name: string; kategorie?: string; beschreibung?: string; bild_url?: string; aktiv: boolean },
    pendingArtikel?: PendingVorlageArtikel[],
  ) => {
    try {
      const payload = {
        name: values.name,
        kategorie: values.kategorie || null,
        beschreibung: values.beschreibung || null,
        bild_url: values.bild_url || null,
        aktiv: values.aktiv,
      };
      if (selected) {
        await updateMut.mutateAsync({ id: selected.id, ...payload });
        toast({ title: "Wäscheset aktualisiert" });
      } else {
        const created = await createMut.mutateAsync(payload);
        if (pendingArtikel && pendingArtikel.length > 0) {
          for (const p of pendingArtikel) {
            await addArtikelMut.mutateAsync({
              vorlage_id: created.id,
              artikel_id: p.artikel_id,
              menge: p.menge,
              berechnungsart: p.berechnungsart,
            });
          }
        }
        toast({ title: "Wäscheset erstellt" });
      }
      setDialogOpen(false);
    } catch {
      toast({ title: "Fehler beim Speichern", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMut.mutateAsync(deleteId);
      toast({ title: "Vorlage gelöscht" });
    } catch {
      toast({ title: "Fehler beim Löschen", variant: "destructive" });
    }
    setDeleteId(null);
  };

  const toggleAktiv = async (v: VorlageSet) => {
    try {
      await updateMut.mutateAsync({ id: v.id, aktiv: !v.aktiv });
    } catch {
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-x-hidden min-w-0">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-sidebar-border bg-sidebar text-sidebar-foreground px-4 md:hidden">
            <SidebarTrigger className="h-9 w-9 rounded-lg hover:bg-sidebar-accent shrink-0" />
            <BackButton />
            <h1 className="text-base font-semibold">Unsere-Wäschesets</h1>
          </header>

          <div className="container py-4 md:py-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Unsere-Wäschesets</h1>
                  <p className="text-sm text-muted-foreground">
                    Zentrale Standard-Sets von Teuni – Kunden können diese in eigene Objekte übernehmen
                  </p>
                </div>
              </div>
              <Button onClick={handleNew}>
                <Plus className="mr-2 h-4 w-4" />
                Neue Vorlage
              </Button>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">Lade Vorlagen…</div>
            ) : vorlagen.length === 0 ? (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <Layers className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">Noch keine Wäschesets erstellt.</p>
                <Button className="mt-4" onClick={handleNew}>
                  <Plus className="mr-2 h-4 w-4" />Erste Vorlage anlegen
                </Button>
              </div>
            ) : (
              <VorlagenSetsGrid
                sets={vorlagen}
                onEdit={handleEdit}
                onToggleAktiv={toggleAktiv}
                onDelete={setDeleteId}
              />
            )}

            <VorlageFormDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              vorlage={selected}
              onSubmit={handleSubmit}
              isLoading={createMut.isPending || updateMut.isPending}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Vorlage löschen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bereits übernommene Sets bei Kunden bleiben erhalten – nur die Vorlage selbst wird entfernt.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Löschen</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
